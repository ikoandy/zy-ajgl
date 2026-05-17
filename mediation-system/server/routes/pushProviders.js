const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');
const { getPushProviderConfigs, getPushProviderConfig, sendPush, syncPushProviderStatus } = require('../services/pushProvider');

const router = express.Router();
router.use(authMiddleware);

router.get('/configs', (req, res) => {
  res.json(formatResponse(getPushProviderConfigs()));
});

router.get('/configs/:type', (req, res) => {
  const config = getPushProviderConfig(req.params.type);
  if (!config) return res.status(404).json(formatError('服务商类型不存在'));
  res.json(formatResponse(config));
});

router.get('/', (req, res) => {
  const db = getDb();
  const providers = db.prepare(`
    SELECT pp.*,
      (SELECT COUNT(*) FROM push_provider_logs WHERE provider_id = pp.id) as log_count,
      (SELECT COUNT(*) FROM push_provider_logs WHERE provider_id = pp.id AND status = 'failed' AND date(created_at) = date('now')) as today_errors
    FROM push_providers pp
    ORDER BY pp.created_at DESC
  `).all();
  res.json(formatResponse(providers));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));
  res.json(formatResponse(provider));
});

router.post('/', (req, res) => {
  const { name, provider_type, display_name, description, api_endpoint, app_id, secret_key, sign_name, template_code, region, package_info, daily_limit } = req.body;
  if (!name || !provider_type || !display_name) {
    return res.status(400).json(formatError('服务商标识、类型和名称不能为空'));
  }

  const typeConfig = getPushProviderConfig(provider_type);
  if (!typeConfig) return res.status(400).json(formatError('不支持的服务商类型'));

  const db = getDb();
  const existing = db.prepare('SELECT id FROM push_providers WHERE name = ?').get(name);
  if (existing) return res.status(400).json(formatError('服务商标识已存在'));

  const result = db.prepare(`
    INSERT INTO push_providers (name, provider_type, display_name, description, api_endpoint, app_id, secret_key, sign_name, template_code, region, package_info, daily_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, provider_type, display_name, description || null,
    api_endpoint || typeConfig.api_endpoint_default,
    app_id || null, secret_key || null, sign_name || null,
    template_code || null, region || null,
    package_info ? JSON.stringify(package_info) : null,
    daily_limit || (typeConfig.packages && typeConfig.packages.length > 0 ? typeConfig.packages[0].daily_limit : 1000)
  );

  logAudit(db, req.user.id, 'CREATE', 'push_provider', result.lastInsertRowid, `添加推送服务商: ${display_name}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '服务商添加成功'));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('服务商不存在'));

  const allowed = ['display_name', 'description', 'api_endpoint', 'app_id', 'secret_key', 'sign_name', 'template_code', 'region', 'daily_limit', 'status'];
  const updates = [];
  const values = [];
  allowed.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(f + ' = ?');
      values.push(req.body[f]);
    }
  });
  if (updates.length === 0) return res.status(400).json(formatError('没有需要更新的字段'));

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);
  db.prepare('UPDATE push_providers SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);

  logAudit(db, req.user.id, 'UPDATE', 'push_provider', req.params.id, `更新推送服务商: ${existing.display_name}`, req);
  res.json(formatResponse(null, '服务商配置已更新'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));

  db.prepare('DELETE FROM push_providers WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'push_provider', req.params.id, `删除推送服务商: ${provider.display_name}`, req);
  res.json(formatResponse(null, '服务商已删除'));
});

router.post('/:id/test', async (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(req.params.id);
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
    const typeConfig = getPushProviderConfig(provider.provider_type);
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
        missing
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
    insertData(logData);

    db.prepare("UPDATE push_providers SET status = 'testing' WHERE id = ?").run(provider.id);
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
  const provider = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));
  if (!provider.app_id || !provider.secret_key) {
    return res.status(400).json(formatError('请先配置认证信息'));
  }
  db.prepare("UPDATE push_providers SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  logAudit(db, req.user.id, 'ACTIVATE', 'push_provider', req.params.id, `启用推送服务商: ${provider.display_name}`, req);
  res.json(formatResponse(null, '服务商已启用'));
});

router.post('/:id/deactivate', (req, res) => {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(req.params.id);
  if (!provider) return res.status(404).json(formatError('服务商不存在'));
  db.prepare("UPDATE push_providers SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  logAudit(db, req.user.id, 'DEACTIVATE', 'push_provider', req.params.id, `停用推送服务商: ${provider.display_name}`, req);
  res.json(formatResponse(null, '服务商已停用'));
});

router.post('/:id/sync', async (req, res) => {
  try {
    const result = await syncPushProviderStatus(parseInt(req.params.id));
    res.json(formatResponse(result, '同步成功'));
  } catch (err) {
    res.status(500).json(formatError('同步失败: ' + err.message));
  }
});

router.post('/:id/send', async (req, res) => {
  const { phone, email, title, content, push_record_id } = req.body;
  if (!content) return res.status(400).json(formatError('推送内容不能为空'));

  try {
    const result = await sendPush(parseInt(req.params.id), phone, email, title, content, { pushRecordId: push_record_id });
    res.json(formatResponse(result, '推送请求已发送'));
  } catch (err) {
    res.status(500).json(formatError('推送失败: ' + err.message));
  }
});

router.get('/:id/logs', (req, res) => {
  const { action, status, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = ['ppl.provider_id = ?'];
  let params = [req.params.id];
  if (action) { where.push('ppl.action = ?'); params.push(action); }
  if (status) { where.push('ppl.status = ?'); params.push(status); }

  const whereClause = 'WHERE ' + where.join(' AND ');
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const total = db.prepare(`SELECT COUNT(*) as count FROM push_provider_logs ppl ${whereClause}`).get(...params).count;
  const data = db.prepare(`
    SELECT ppl.* FROM push_provider_logs ppl ${whereClause}
    ORDER BY ppl.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, parseInt(pageSize), offset);

  res.json(formatResponse({
    data,
    pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) }
  }));
});

function insertLog(logData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO push_provider_logs (provider_id, action, request_data, response_data, status, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    logData.provider_id, logData.action, logData.request_data || null,
    logData.response_data || null, logData.status, logData.error_message || null,
    logData.duration_ms || 0
  );
}

function insertData(logData) { insertLog(logData); }

module.exports = router;
