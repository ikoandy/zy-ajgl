const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { type, is_read, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = ['n.user_id = @user_id'];
  let params = { user_id: req.user.id };
  if (type) { where.push('n.type = @type'); params.type = type; }
  if (is_read !== undefined) { where.push('n.is_read = @is_read'); params.is_read = parseInt(is_read); }

  const whereClause = 'WHERE ' + where.join(' AND ');

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM notifications n ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT n.* FROM notifications n ${whereClause}
    ORDER BY n.created_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/unread-count', (req, res) => {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).count;
  res.json(formatResponse({ count }));
});

router.put('/:id/read', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json(formatResponse(null, '已标记为已读'));
});

router.put('/read-all', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json(formatResponse(null, '已全部标记为已读'));
});

router.post('/', (req, res) => {
  const { user_id, type, title, content, link } = req.body;
  if (!user_id || !type || !title || !content) {
    return res.status(400).json(formatError('用户ID、类型、标题和内容不能为空'));
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)'
  ).run(user_id, type, title, content, link || null);

  logAudit(db, req.user.id, 'SEND', 'notification', result.lastInsertRowid, '发送通知: ' + title, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '通知发送成功'));
});

router.post('/broadcast', (req, res) => {
  const { type, title, content, link, role_id } = req.body;
  if (!type || !title || !content) {
    return res.status(400).json(formatError('类型、标题和内容不能为空'));
  }

  const db = getDb();
  let users;
  if (role_id) {
    users = db.prepare("SELECT id FROM users WHERE role_id = ? AND status = 'active'").all(role_id);
  } else {
    users = db.prepare("SELECT id FROM users WHERE status = 'active'").all();
  }

  const insert = db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)');
  const insertMany = db.transaction((rows) => {
    for (const u of rows) insert.run(u.id, type, title, content, link || null);
  });
  insertMany(users);

  logAudit(db, req.user.id, 'BROADCAST', 'notification', null, '群发通知: ' + title + ' (' + users.length + '人)', req);
  res.status(201).json(formatResponse({ sent_count: users.length }, '群发通知成功'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json(formatResponse(null, '通知删除成功'));
});

// ==================== 当事人推送 ====================

router.get('/party', (req, res) => {
  const { case_id, party_id, push_type, channel, status, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('ppr.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (party_id) { where.push('ppr.party_id = @party_id'); params.party_id = parseInt(party_id); }
  if (push_type) { where.push('ppr.push_type = @push_type'); params.push_type = push_type; }
  if (channel) { where.push('ppr.channel = @channel'); params.channel = channel; }
  if (status) { where.push('ppr.status = @status'); params.status = status; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare('SELECT COUNT(*) as count FROM party_push_records ppr ' + whereClause);
  const dataQuery = db.prepare(`
    SELECT ppr.*,
           cp.name as party_name, cp.phone as party_phone, cp.email as party_email, cp.party_type,
           c.case_number, c.title as case_title,
           dr.title as document_title,
           u.real_name as sent_by_name
    FROM party_push_records ppr
    LEFT JOIN case_parties cp ON ppr.party_id = cp.id
    LEFT JOIN cases c ON ppr.case_id = c.id
    LEFT JOIN document_records dr ON ppr.document_id = dr.id
    LEFT JOIN users u ON ppr.sent_by = u.id
    ${whereClause}
    ORDER BY ppr.created_at DESC
    LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse({ data: result.data, pagination: result.pagination }));
});

router.get('/party/stats', (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as cnt FROM party_push_records').get().cnt;
  const sent = db.prepare("SELECT COUNT(*) as cnt FROM party_push_records WHERE status IN ('sent','delivered','read')").get().cnt;
  const pending = db.prepare("SELECT COUNT(*) as cnt FROM party_push_records WHERE status = 'pending'").get().cnt;
  const failed = db.prepare("SELECT COUNT(*) as cnt FROM party_push_records WHERE status = 'failed'").get().cnt;
  const byChannel = db.prepare('SELECT channel, COUNT(*) as cnt FROM party_push_records GROUP BY channel').all();
  const byType = db.prepare('SELECT push_type, COUNT(*) as cnt FROM party_push_records GROUP BY push_type').all();
  res.json(formatResponse({ total, sent, pending, failed, byChannel, byType }));
});

router.post('/party', (req, res) => {
  const { case_id, party_id, push_type, title, content, channel, document_id } = req.body;
  if (!case_id || !party_id || !push_type || !title || !content) {
    return res.status(400).json(formatError('案件ID、当事人ID、推送类型、标题和内容不能为空'));
  }

  const db = getDb();
  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);
  if (!caseData) return res.status(404).json(formatError('案件不存在'));

  const party = db.prepare('SELECT * FROM case_parties WHERE id = ? AND case_id = ?').get(party_id, case_id);
  if (!party) return res.status(404).json(formatError('当事人不存在'));

  const result = db.prepare(`
    INSERT INTO party_push_records (case_id, party_id, push_type, title, content, channel, status, document_id, sent_by, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, 'sent', ?, ?, CURRENT_TIMESTAMP)
  `).run(case_id, party_id, push_type, title, content, channel || 'sms', document_id || null, req.user.id);

  logAudit(db, req.user.id, 'PUSH_PARTY', 'party_push', result.lastInsertRowid, '推送' + push_type + '给当事人: ' + party.name, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '推送发送成功'));
});

router.post('/party/batch', (req, res) => {
  const { case_id, push_type, title, content, channel, document_id, party_ids } = req.body;
  if (!case_id || !push_type || !title || !content) {
    return res.status(400).json(formatError('案件ID、推送类型、标题和内容不能为空'));
  }

  const db = getDb();
  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);
  if (!caseData) return res.status(404).json(formatError('案件不存在'));

  let parties;
  if (party_ids && Array.isArray(party_ids) && party_ids.length > 0) {
    parties = db.prepare('SELECT * FROM case_parties WHERE id IN (' + party_ids.map(() => '?').join(',') + ') AND case_id = ?').all(...party_ids, case_id);
  } else {
    parties = db.prepare('SELECT * FROM case_parties WHERE case_id = ?').all(case_id);
  }

  const insert = db.prepare(`
    INSERT INTO party_push_records (case_id, party_id, push_type, title, content, channel, status, document_id, sent_by, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, 'sent', ?, ?, CURRENT_TIMESTAMP)
  `);
  const insertMany = db.transaction((rows) => {
    for (const p of rows) {
      insert.run(case_id, p.id, push_type, title, content, channel || 'sms', document_id || null, req.user.id);
    }
  });
  insertMany(parties);

  logAudit(db, req.user.id, 'PUSH_PARTY_BATCH', 'party_push', null, '批量推送' + push_type + '给' + parties.length + '位当事人', req);
  res.status(201).json(formatResponse({ sent_count: parties.length }, '批量推送成功'));
});

router.put('/party/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['pending', 'sent', 'delivered', 'read', 'failed'].includes(status)) {
    return res.status(400).json(formatError('无效的状态'));
  }
  const db = getDb();
  const existing = db.prepare('SELECT * FROM party_push_records WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('推送记录不存在'));

  const updates = ['status = ?'];
  const values = [status];
  if (status === 'read') { updates.push('read_at = CURRENT_TIMESTAMP'); }
  values.push(req.params.id);

  db.prepare('UPDATE party_push_records SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);
  res.json(formatResponse(null, '状态更新成功'));
});

router.delete('/party/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM party_push_records WHERE id = ?').run(req.params.id);
  res.json(formatResponse(null, '推送记录已删除'));
});

module.exports = router;
