const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

const STATUS_FLOW = {
  pending: ['accepted', 'terminated'],
  accepted: ['mediating', 'terminated'],
  mediating: ['agreed', 'terminated'],
  agreed: ['closed'],
  terminated: ['closed'],
  closed: []
};

const STATUS_LABELS = {
  pending: '待受理', accepted: '已受理', mediating: '调解中',
  agreed: '已达成协议', terminated: '已终止', closed: '已结案'
};

router.get('/:id/timeline', (req, res) => {
  const db = getDb();
  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!caseData) return res.status(404).json(formatError('案件不存在'));

  const timeline = db.prepare(`
    SELECT ct.*, u.real_name as operator_name FROM case_timelines ct
    LEFT JOIN users u ON ct.operator_id = u.id
    WHERE ct.case_id = ? ORDER BY ct.created_at ASC
  `).all(req.params.id);

  res.json(formatResponse({
    case: caseData,
    status_flow: STATUS_FLOW,
    status_labels: STATUS_LABELS,
    current_status: caseData.status,
    allowed_transitions: STATUS_FLOW[caseData.status] || [],
    timeline
  }));
});

router.post('/:id/transition', (req, res) => {
  const { to_status, comment } = req.body;
  const db = getDb();

  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!caseData) return res.status(404).json(formatError('案件不存在'));

  const allowed = STATUS_FLOW[caseData.status] || [];
  if (!allowed.includes(to_status)) {
    return res.status(400).json(formatError(
      `不允许从"${STATUS_LABELS[caseData.status]}"变更为"${STATUS_LABELS[to_status]}"，允许的变更：${allowed.map(s => STATUS_LABELS[s]).join('、')}`
    ));
  }

  const fromStatus = caseData.status;

  const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [to_status];
  if (to_status === 'accepted' && !caseData.accepted_at) {
    updates.push('accepted_at = ?');
    values.push(new Date().toISOString());
  }
  if (['closed', 'agreed', 'terminated'].includes(to_status) && !caseData.closed_at) {
    updates.push('closed_at = ?');
    values.push(new Date().toISOString());
  }
  if (to_status === 'accepted' && !caseData.mediator_id) {
    updates.push('mediator_id = ?');
    values.push(req.user.id);
    updates.push('assigned_at = ?');
    values.push(new Date().toISOString());
  }
  values.push(req.params.id);

  db.prepare(`UPDATE cases SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  db.prepare(`
    INSERT INTO case_timelines (case_id, action, from_status, to_status, operator_id, operator_name, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, `状态变更: ${STATUS_LABELS[fromStatus]} → ${STATUS_LABELS[to_status]}`, fromStatus, to_status, req.user.id, req.user.real_name, comment || null);

  if (caseData.mediator_id && to_status !== fromStatus) {
    db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)').run(
      caseData.mediator_id, 'case',
      `案件状态变更: ${STATUS_LABELS[to_status]}`,
      `案件 #${caseData.case_number} 状态已从"${STATUS_LABELS[fromStatus]}"变更为"${STATUS_LABELS[to_status]}"`,
      `/cases/${req.params.id}`
    );
  }

  logAudit(db, req.user.id, 'STATUS_TRANSITION', 'case', req.params.id,
    `案件 #${caseData.case_number}: ${STATUS_LABELS[fromStatus]} → ${STATUS_LABELS[to_status]}`, req);

  res.json(formatResponse({
    from_status: fromStatus,
    to_status,
    allowed_transitions: STATUS_FLOW[to_status] || []
  }, '案件状态变更成功'));
});

router.post('/:id/assign', (req, res) => {
  const { mediator_id, comment } = req.body;
  if (!mediator_id) return res.status(400).json(formatError('调解员ID不能为空'));

  const db = getDb();
  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!caseData) return res.status(404).json(formatError('案件不存在'));

  const mediator = db.prepare('SELECT * FROM users WHERE id = ? AND role_id IN (3, 4) AND status = \'active\'').get(mediator_id);
  if (!mediator) return res.status(400).json(formatError('指定的调解员不存在或不可用'));

  db.prepare('UPDATE cases SET mediator_id = ?, assigned_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(mediator_id, new Date().toISOString(), req.params.id);

  db.prepare(`
    INSERT INTO case_timelines (case_id, action, from_status, to_status, operator_id, operator_name, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, `指派调解员: ${mediator.real_name}`, null, null, req.user.id, req.user.real_name, comment || null);

  db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)').run(
    mediator_id, 'case', '新案件分配',
    `案件 #${caseData.case_number} 已分配给您，请及时处理`, `/cases/${req.params.id}`
  );

  logAudit(db, req.user.id, 'ASSIGN_MEDIATOR', 'case', req.params.id,
    `案件 #${caseData.case_number} 指派调解员: ${mediator.real_name}`, req);

  res.json(formatResponse(null, '调解员指派成功'));
});

module.exports = router;
