const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/roles', (req, res) => {
  const db = getDb();
  const roles = db.prepare(`
    SELECT roles.*,
      (SELECT COUNT(*) FROM users WHERE role_id = roles.id AND status = 'active') as user_count
    FROM roles ORDER BY id
  `).all();
  res.json(formatResponse(roles));
});

router.get('/roles/:id/permissions', (req, res) => {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  if (!role) return res.status(404).json(formatError('角色不存在'));

  const modules = [
    { name: '数据概览', key: 'dashboard', read: true, write: false },
    { name: '案件管理', key: 'cases', read: true, write: role.id <= 4 },
    { name: '档案管理', key: 'archives', read: true, write: role.id <= 3 },
    { name: '文书生成', key: 'documents', read: true, write: role.id <= 3 },
    { name: '日程管理', key: 'schedules', read: true, write: role.id <= 3 },
    { name: '视频调解', key: 'video', read: true, write: role.id <= 3 },
    { name: '信息推送', key: 'notifications', read: true, write: role.id <= 3 },
    { name: '呼叫中心', key: 'callcenter', read: true, write: role.id <= 3 },
    { name: '调解评价', key: 'feedbacks', read: true, write: role.id <= 3 },
    { name: '系统设计', key: 'sysdesign', read: role.id <= 2, write: role.id <= 2 },
    { name: '高级设置', key: 'settings', read: role.id <= 2, write: role.id === 1 },
    { name: '用户管理', key: 'users', read: role.id <= 2, write: role.id <= 2 },
    { name: '审计日志', key: 'audit', read: role.id <= 2, write: false }
  ];

  res.json(formatResponse({ role, modules }));
});

router.put('/roles/:id/permissions', roleMiddleware('super_admin'), (req, res) => {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  if (!role) return res.status(404).json(formatError('角色不存在'));

  logAudit(db, req.user.id, 'UPDATE_PERMISSIONS', 'role', req.params.id, `更新角色权限: ${role.display_name}`, req);
  res.json(formatResponse(null, '权限已更新'));
});

router.get('/flows', (req, res) => {
  res.json(formatResponse([
    { step: 1, name: '案件登记与分类', description: '接收纠纷信息，录入系统并分类', icon: 'assignment', color: 'var(--accent-gold)' },
    { step: 2, name: '调解员指派', description: '根据案件类型和调解员专长自动或手动分配', icon: 'person_search', color: 'var(--accent-teal)' },
    { step: 3, name: '调解准备与通知', description: '通知当事人，准备调解材料，推送受理通知', icon: 'notifications_active', color: 'var(--accent-violet)' },
    { step: 4, name: '调解实施', description: '现场调解或视频调解，记录调解过程', icon: 'handshake', color: '#34d399' },
    { step: 5, name: '协议签署与归档', description: '达成协议后签署文书并归档，推送协议通知', icon: 'task_alt', color: '#60a5fa' }
  ]));
});

router.get('/integrations', (req, res) => {
  res.json(formatResponse([
    { name: '视频会议引擎', status: 'active', type: 'webrtc', description: '基于WebRTC的实时音视频通信', icon: 'video_call' },
    { name: '电子签章服务', status: 'active', type: 'digital_signature', description: '符合电子签名法的数字签章', icon: 'verified' },
    { name: '短信网关', status: 'active', type: 'sms', description: '短信通知发送服务', icon: 'sms' },
    { name: '语音呼叫系统', status: 'active', type: 'voip', description: 'SIP协议语音呼叫', icon: 'call' },
    { name: 'OCR识别服务', status: 'active', type: 'ocr', description: '身份证、合同等文档识别', icon: 'document_scanner' },
    { name: '数据加密模块', status: 'active', type: 'encryption', description: 'AES-256数据加密', icon: 'enhanced_encryption' },
    { name: '消息队列', status: 'active', type: 'mq', description: '异步消息处理', icon: 'sync_alt' },
    { name: '文件存储服务', status: 'active', type: 'storage', description: '文件上传下载与预览', icon: 'cloud_upload' }
  ]));
});

router.get('/security', (req, res) => {
  res.json(formatResponse({
    data_classification: { level: 'L3', description: '涉及个人隐私数据，需加密存储', icon: 'shield', status: 'compliant' },
    encryption: { algorithm: 'AES-256-GCM', key_management: 'HSM', icon: 'lock', status: 'compliant' },
    audit: { retention_days: 90, log_types: ['login', 'data_access', 'modification', 'export'], icon: 'fact_check', status: 'compliant' },
    compliance: {
      items: [
        { name: '个人信息保护法', status: 'compliant', icon: 'policy' },
        { name: '数据安全法', status: 'compliant', icon: 'gavel' },
        { name: '网络安全等级保护', status: 'compliant', level: '等保三级', icon: 'security' }
      ]
    },
    access_control: { type: 'RBAC', description: '基于角色的访问控制', icon: 'admin_panel_settings', status: 'compliant' }
  }));
});

router.get('/audit-logs', (req, res) => {
  const { page = 1, pageSize = 20, action, resource_type, user_id, search, date_from, date_to } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (action) { where.push('al.action LIKE @action'); params.action = '%' + action + '%'; }
  if (resource_type) { where.push('al.resource_type = @resource_type'); params.resource_type = resource_type; }
  if (user_id) { where.push('al.user_id = @user_id'); params.user_id = parseInt(user_id); }
  if (search) { where.push('(al.detail LIKE @search OR u.real_name LIKE @search)'); params.search = '%' + search + '%'; }
  if (date_from) { where.push("date(al.created_at) >= date(@date_from)"); params.date_from = date_from; }
  if (date_to) { where.push("date(al.created_at) <= date(@date_to)"); params.date_to = date_to; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ${whereClause}`).get(params).count;
  const data = db.prepare(`
    SELECT al.*, u.real_name as user_name, u.username as user_username
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ${whereClause}
    ORDER BY al.created_at DESC LIMIT ? OFFSET ?
  `).all(params, parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

  res.json(formatResponse({
    data,
    pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) }
  }));
});

router.get('/audit-stats', (req, res) => {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  const today = db.prepare("SELECT COUNT(*) as count FROM audit_logs WHERE date(created_at) = date('now')").get().count;
  const byAction = db.prepare('SELECT action, COUNT(*) as cnt FROM audit_logs GROUP BY action ORDER BY cnt DESC').all();
  const byResource = db.prepare('SELECT resource_type, COUNT(*) as cnt FROM audit_logs GROUP BY resource_type ORDER BY cnt DESC').all();
  const recentUsers = db.prepare(`
    SELECT u.id, u.real_name, COUNT(*) as cnt
    FROM audit_logs al JOIN users u ON al.user_id = u.id
    GROUP BY al.user_id ORDER BY cnt DESC LIMIT 5
  `).all();

  res.json(formatResponse({ total, today, by_action: byAction, by_resource: byResource, recent_users: recentUsers }));
});

module.exports = router;
