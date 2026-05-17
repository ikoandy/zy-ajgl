const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');
const { getProviderConfigs, getProviderConfig, makeCall, syncProviderStatus } = require('../services/callProvider');

const router = express.Router();
router.use(authMiddleware);

router.get('/configs', (req, res) => {
  res.json(formatResponse(getProviderConfigs()));
});

router.get('/configs/:type', (req, res) => {
  const config = getProviderConfig(req.params.type);
  if (!config) return res.status(404).json(formatError('服务商类型不存在'));
  res.json(formatResponse(config));
});

router.get('/', (req, res) => {
  const db = getDb();
  const providers = db.prepare(`
    SELECT cp.*,
      (SELECT COUNT(*) FROM call_provider_logs WHERE provider_id = cp.id) as log_count,
      (SELECT COUNT(*) FROM call_provider_logs WHERE provider_id = cp.id AND status = 'failed' AND date(created_at) = date('now')) as today_errors
    FROM call_providers cp
    ORDER BY cp.created_at DESC
  `).all();
  res.json(formatResponse(providers));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));
  res.json(formatResponse(provider));
});

router.post('/', (req, res) => {
  const { name, provider_type, display_name, description, api_endpoint, app_id, secret_key, instance_id, sip_number, config_json, call_package, max_concurrent, features } = req.body;
  if (!name || !provider_type || !display_name) {
    return res.status(400).json(formatError('服务商标识、类型和名称不能为空'));
  }

  const typeConfig = getProviderConfig(provider_type);
  if (!typeConfig) return res.status(400).json(formatError('不支持的服务商类型'));

  const db = getDb();
  const existing = db.prepare('SELECT id FROM call_providers WHERE name = ?').get(name);
  if (existing) return res.status(400).json(formatError('服务商标识已存在'));

  const result = db.prepare(`
    INSERT INTO call_providers (name, provider_type, display_name, description, api_endpoint, app_id, secret_key, instance_id, sip_number, config_json, call_package, max_concurrent, features)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, provider_type, display_name, description || null,
    api_endpoint || typeConfig.api_endpoint_default,
    app_id || null, secret_key || null, instance_id || null, sip_number || null,
    config_json || null, call_package || null,
    max_concurrent || typeConfig.packages && typeConfig.packages.length > 0 ? typeConfig.packages[0].max_concurrent : 10,
    features ? JSON.stringify(features) : (typeConfig.features ? JSON.stringify(typeConfig.features) : null)
  );

  logAudit(db, req.user.id, 'CREATE', 'call_provider', result.lastInsertRowid, `添加呼叫服务商: ${display_name}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '服务商添加成功'));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('服务商不存在'));

  const allowed = ['display_name', 'description', 'api_endpoint', 'app_id', 'secret_key', 'instance_id', 'sip_number', 'config_json', 'call_package', 'max_concurrent', 'features', 'status'];
  const updates = [];
  const values = [];
  allowed.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(f + ' = ?');
      values.push(f === 'features' && typeof req.body[f] !== 'string' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  });
  if (updates.length === 0) return res.status(400).json(formatError('没有需要更新的字段'));

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);
  db.prepare('UPDATE call_providers SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);

  logAudit(db, req.user.id, 'UPDATE', 'call_provider', req.params.id, `更新呼叫服务商: ${existing.display_name}`, req);
  res.json(formatResponse(null, '服务商配置已更新'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));

  db.prepare('DELETE FROM call_providers WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'call_provider', req.params.id, `删除呼叫服务商: ${provider.display_name}`, req);
  res.json(formatResponse(null, '服务商已删除'));
});

router.post('/:id/test', async (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));

  const startTime = Date.now();
  const logData = {
    provider_id: provider.id,
    action: 'test_connection',
    request_data: JSON.stringify({ provider_type: provider.provider_type, endpoint: provider.api_endpoint }),
    status: 'success',
    duration_ms: 0
  };

  try {
    const missing = [];
    const typeConfig = getProviderConfig(provider.provider_type);
    if (typeConfig) {
      typeConfig.fields.filter(f => f.required).forEach(f => {
        if (!provider[f.key]) missing.push(f.label);
      });
    }

    if (missing.length > 0) {
      logData.status = 'failed';
      logData.error_message = '缺少必填配置: ' + missing.join(', ');
      logData.duration_ms = Date.now() - startTime;
      insertLog(logData);
      return res.json(formatResponse({
        success: false,
        message: '配置不完整: ' + missing.join(', '),
        missing: missing
      }));
    }

    const testResult = {
      success: true,
      message: provider.display_name + ' 连接测试成功',
      provider_type: provider.provider_type,
      endpoint: provider.api_endpoint,
      response_time: (Date.now() - startTime) + 'ms',
      note: '模拟连接测试 - 实际部署需配置真实密钥后调用服务商健康检查接口'
    };

    logData.response_data = JSON.stringify(testResult);
    logData.duration_ms = Date.now() - startTime;
    insertLog(logData);

    db.prepare("UPDATE call_providers SET status = 'testing' WHERE id = ?").run(provider.id);
    res.json(formatResponse(testResult));
  } catch (err) {
    logData.status = 'failed';
    logData.error_message = err.message;
    logData.duration_ms = Date.now() - startTime;
    insertLog(logData);
    res.json(formatResponse({ success: false, message: err.message }));
  }
});

router.post('/:id/activate', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));

  if (!provider.app_id || !provider.secret_key) {
    return res.status(400).json(formatError('请先配置认证信息'));
  }

  db.prepare("UPDATE call_providers SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  logAudit(db, req.user.id, 'ACTIVATE', 'call_provider', req.params.id, `启用呼叫服务商: ${provider.display_name}`, req);
  res.json(formatResponse(null, '服务商已启用'));
});

router.post('/:id/deactivate', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));

  db.prepare("UPDATE call_providers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  logAudit(db, req.user.id, 'DEACTIVATE', 'call_provider', req.params.id, `停用呼叫服务商: ${provider.display_name}`, req);
  res.json(formatResponse(null, '服务商已停用'));
});

router.post('/:id/sync', async (req, res) => {
  try {
    const result = await syncProviderStatus(parseInt(req.params.id));
    res.json(formatResponse(result, '同步成功'));
  } catch (err) {
    res.status(500).json(formatError('同步失败: ' + err.message));
  }
});

router.post('/:id/call', async (req, res) => {
  const { callee_number, caller_number } = req.body;
  if (!callee_number) return res.status(400).json(formatError('被叫号码不能为空'));

  try {
    const result = await makeCall(parseInt(req.params.id), callee_number, { callerNumber: caller_number });
    res.json(formatResponse(result, '外呼请求已发送'));
  } catch (err) {
    res.status(500).json(formatError('外呼失败: ' + err.message));
  }
});

router.get('/:id/logs', (req, res) => {
  const { action, status, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = ['cpl.provider_id = ?'];
  let params = [req.params.id];
  if (action) { where.push('cpl.action = ?'); params.push(action); }
  if (status) { where.push('cpl.status = ?'); params.push(status); }

  const whereClause = 'WHERE ' + where.join(' AND ');

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM call_provider_logs cpl ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT cpl.* FROM call_provider_logs cpl ${whereClause}
    ORDER BY cpl.created_at DESC LIMIT ? OFFSET ?
  `);

  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  const total = countQuery.get(...params).count;
  const data = dataQuery.all(...params, parseInt(pageSize), offset);

  res.json(formatResponse({
    data,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages: Math.ceil(total / parseInt(pageSize))
    }
  }));
});

function insertLog(logData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO call_provider_logs (provider_id, action, request_data, response_data, status, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    logData.provider_id, logData.action, logData.request_data || null,
    logData.response_data || null, logData.status, logData.error_message || null,
    logData.duration_ms || 0
  );
}

module.exports = router;
