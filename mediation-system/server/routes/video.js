const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
router.use(authMiddleware);

router.get('/sessions', (req, res) => {
  const { case_id, status, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('vs.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (status) { where.push('vs.status = @status'); params.status = status; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const sessions = db.prepare(`
    SELECT vs.*, c.case_number, c.title as case_title, u.real_name as created_by_name
    FROM video_sessions vs
    LEFT JOIN cases c ON vs.case_id = c.id
    LEFT JOIN users u ON vs.created_by = u.id
    ${whereClause}
    ORDER BY vs.scheduled_at DESC
  `).all(params);

  const sessionsWithDetails = sessions.map(s => {
    const participants = db.prepare(`
      SELECT vp.*, u.real_name as user_name FROM video_participants vp
      LEFT JOIN users u ON vp.user_id = u.id WHERE vp.session_id = ?
    `).all(s.id);
    return { ...s, participants };
  });

  res.json(formatResponse(sessionsWithDetails));
});

router.post('/sessions', (req, res) => {
  const { case_id, title, scheduled_at } = req.body;
  if (!case_id || !title) {
    return res.status(400).json(formatError('案件ID和标题不能为空'));
  }

  const db = getDb();
  const roomId = `room-${uuidv4().substring(0, 8)}`;

  const result = db.prepare(`
    INSERT INTO video_sessions (case_id, room_id, title, status, scheduled_at, created_by)
    VALUES (?, ?, ?, 'scheduled', ?, ?)
  `).run(case_id, roomId, title, scheduled_at || null, req.user.id);

  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);
  if (caseData) {
    const parties = db.prepare('SELECT * FROM case_parties WHERE case_id = ?').all(case_id);
    if (caseData.mediator_id) {
      db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)').run(
        caseData.mediator_id, 'video', '视频调解已创建', `案件 ${caseData.case_number} 视频调解已安排`, `/video`
      );
    }
  }

  logAudit(db, req.user.id, 'CREATE', 'video_session', result.lastInsertRowid, `创建视频调解: ${title}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid, room_id: roomId }, '视频调解创建成功'));
});

router.put('/sessions/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json(formatError('无效的状态'));
  }

  const db = getDb();
  const session = db.prepare('SELECT * FROM video_sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    return res.status(404).json(formatError('会话不存在'));
  }

  const updates = ['status = ?'];
  const values = [status];
  if (status === 'in_progress' && !session.started_at) { updates.push('started_at = ?'); values.push(new Date().toISOString()); }
  if (status === 'completed') { updates.push('ended_at = ?'); values.push(new Date().toISOString()); }
  values.push(req.params.id);

  db.prepare(`UPDATE video_sessions SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  logAudit(db, req.user.id, 'UPDATE_STATUS', 'video_session', req.params.id, `视频调解状态: ${status}`, req);
  res.json(formatResponse(null, '状态更新成功'));
});

router.get('/sessions/:id/messages', (req, res) => {
  const db = getDb();
  const messages = db.prepare(`
    SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC
  `).all(req.params.id);
  res.json(formatResponse(messages));
});

router.post('/sessions/:id/messages', (req, res) => {
  const { content, message_type } = req.body;
  if (!content) {
    return res.status(400).json(formatError('消息内容不能为空'));
  }

  const db = getDb();
  const session = db.prepare('SELECT * FROM video_sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    return res.status(404).json(formatError('会话不存在'));
  }

  const result = db.prepare(`
    INSERT INTO chat_messages (session_id, sender_type, sender_id, sender_name, content, message_type)
    VALUES (?, 'mediator', ?, ?, ?, ?)
  `).run(req.params.id, req.user.id, req.user.real_name, content, message_type || 'text');

  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '消息发送成功'));
});

module.exports = router;
