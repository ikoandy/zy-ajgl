const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/roles', (req, res) => {
  const db = getDb();
  const roles = db.prepare('SELECT * FROM roles ORDER BY id').all();
  res.json(formatResponse(roles));
});

router.get('/roles/:id/permissions', (req, res) => {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  if (!role) {
    return res.status(404).json(formatError('角色不存在'));
  }
  res.json(formatResponse({
    role,
    modules: [
      { name: '数据概览', read: true, write: false },
      { name: '案件管理', read: true, write: true },
      { name: '档案管理', read: true, write: true },
      { name: '文书生成', read: true, write: true },
      { name: '视频调解', read: true, write: true },
      { name: '信息推送', read: true, write: false },
      { name: '呼叫中心', read: true, write: true },
      { name: '系统设计', read: role.id <= 2, write: role.id <= 2 },
      { name: '高级设置', read: role.id <= 2, write: role.id === 1 }
    ]
  }));
});

router.get('/flows', (req, res) => {
  res.json(formatResponse([
    { step: 1, name: '案件登记与分类', description: '接收纠纷信息，录入系统并分类' },
    { step: 2, name: '调解员指派', description: '根据案件类型和调解员专长自动或手动分配' },
    { step: 3, name: '调解准备与通知', description: '通知当事人，准备调解材料' },
    { step: 4, name: '调解实施', description: '现场调解或视频调解' },
    { step: 5, name: '协议签署与归档', description: '达成协议后签署文书并归档' }
  ]));
});

router.get('/integrations', (req, res) => {
  res.json(formatResponse([
    { name: '视频会议引擎', status: 'active', type: 'webrtc', description: '基于WebRTC的实时音视频通信' },
    { name: '电子签章服务', status: 'active', type: 'digital_signature', description: '符合电子签名法的数字签章' },
    { name: '短信网关', status: 'active', type: 'sms', description: '短信通知发送服务' },
    { name: '语音呼叫系统', status: 'active', type: 'voip', description: 'SIP协议语音呼叫' },
    { name: 'OCR识别服务', status: 'active', type: 'ocr', description: '身份证、合同等文档识别' },
    { name: '数据加密模块', status: 'active', type: 'encryption', description: 'AES-256数据加密' },
    { name: '消息队列', status: 'active', type: 'mq', description: '异步消息处理' }
  ]));
});

router.get('/security', (req, res) => {
  res.json(formatResponse({
    data_classification: { level: 'L3', description: '涉及个人隐私数据，需加密存储' },
    encryption: { algorithm: 'AES-256-GCM', key_management: 'HSM' },
    audit: { retention_days: 90, log_types: ['login', 'data_access', 'modification', 'export'] },
    compliance: {
      items: [
        { name: '个人信息保护法', status: 'compliant' },
        { name: '数据安全法', status: 'compliant' },
        { name: '网络安全等级保护', status: 'compliant', level: '等保三级' }
      ]
    }
  }));
});

router.get('/audit-logs', (req, res) => {
  const { page = 1, pageSize = 20, action, resource_type } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (action) { where.push('action = @action'); params.action = action; }
  if (resource_type) { where.push('resource_type = @resource_type'); params.resource_type = resource_type; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const logs = db.prepare(`
    SELECT al.*, u.real_name as user_name FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ${whereClause}
    ORDER BY al.created_at DESC LIMIT ? OFFSET ?
  `).all(params, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

  const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`).get(params).count;

  res.json(formatResponse({
    data: logs,
    pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) }
  }));
});

module.exports = router;
