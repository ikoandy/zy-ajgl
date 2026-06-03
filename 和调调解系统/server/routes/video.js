const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
router.use(authMiddleware);

router.get('/sessions', (req, res) => {
  const { case_id, status, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('vs.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (status) { where.push('vs.status = @status'); params.status = status; }
  if (search) { where.push('(vs.title LIKE @search OR c.case_number LIKE @search OR c.title LIKE @search)'); params.search = '%' + search + '%'; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare('SELECT COUNT(*) as count FROM video_sessions vs LEFT JOIN cases c ON vs.case_id = c.id ' + whereClause);
  const dataQuery = db.prepare(`
    SELECT vs.*, c.case_number, c.title as case_title, u.real_name as created_by_name
    FROM video_sessions vs
    LEFT JOIN cases c ON vs.case_id = c.id
    LEFT JOIN users u ON vs.created_by = u.id
    ${whereClause}
    ORDER BY vs.scheduled_at DESC
    LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));

  const sessionsWithDetails = result.data.map(s => {
    const participants = db.prepare(`
      SELECT vp.*, u.real_name as user_name FROM video_participants vp
      LEFT JOIN users u ON vp.user_id = u.id WHERE vp.session_id = ?
    `).all(s.id);
    const msgCount = db.prepare('SELECT COUNT(*) as cnt FROM chat_messages WHERE session_id = ?').get(s.id);
    return { ...s, participants, message_count: msgCount ? msgCount.cnt : 0 };
  });

  res.json(formatResponse({ data: sessionsWithDetails, pagination: result.pagination }));
});

router.get('/sessions/:id', (req, res) => {
  const db = getDb();
  const session = db.prepare(`
    SELECT vs.*, c.case_number, c.title as case_title, u.real_name as created_by_name
    FROM video_sessions vs
    LEFT JOIN cases c ON vs.case_id = c.id
    LEFT JOIN users u ON vs.created_by = u.id
    WHERE vs.id = ?
  `).get(req.params.id);

  if (!session) {
    return res.status(404).json(formatError('会话不存在'));
  }

  const participants = db.prepare(`
    SELECT vp.*, u.real_name as user_name FROM video_participants vp
    LEFT JOIN users u ON vp.user_id = u.id WHERE vp.session_id = ?
  `).all(req.params.id);

  const messages = db.prepare(`
    SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC
  `).all(req.params.id);

  let duration = null;
  if (session.started_at) {
    const end = session.ended_at ? new Date(session.ended_at) : new Date();
    duration = Math.round((end - new Date(session.started_at)) / 60000);
  }

  res.json(formatResponse({ ...session, participants, messages, duration_minutes: duration }));
});

router.post('/sessions', (req, res) => {
  const { case_id, title, scheduled_at, mediator_id } = req.body;
  if (!case_id || !title) {
    return res.status(400).json(formatError('案件ID和标题不能为空'));
  }

  const db = getDb();
  const roomId = 'room-' + uuidv4().substring(0, 8);

  const result = db.prepare(`
    INSERT INTO video_sessions (case_id, room_id, title, status, scheduled_at, created_by)
    VALUES (?, ?, ?, 'scheduled', ?, ?)
  `).run(case_id, roomId, title, scheduled_at || new Date().toISOString(), req.user.id);

  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);
  if (caseData) {
    const parties = db.prepare('SELECT * FROM case_parties WHERE case_id = ?').all(case_id);
    parties.forEach(function(p) {
      db.prepare('INSERT INTO video_participants (session_id, party_id, display_name) VALUES (?, ?, ?)').run(result.lastInsertRowid, p.id, p.name);
    });

    const notifyId = mediator_id || caseData.mediator_id;
    if (notifyId) {
      db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)').run(
        notifyId, 'video', '视频调解已创建', '案件 ' + caseData.case_number + ' 视频调解已安排', '/video'
      );
    }
  }

  if (mediator_id) {
    db.prepare('INSERT INTO video_participants (session_id, user_id, display_name) VALUES (?, ?, ?)').run(
      result.lastInsertRowid, mediator_id, db.prepare('SELECT real_name FROM users WHERE id = ?').get(mediator_id).real_name
    );
  }

  logAudit(db, req.user.id, 'CREATE', 'video_session', result.lastInsertRowid, '创建视频调解: ' + title, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid, room_id: roomId }, '视频调解创建成功'));
});

router.put('/sessions/:id', (req, res) => {
  const { title, scheduled_at } = req.body;
  const db = getDb();
  const session = db.prepare('SELECT * FROM video_sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    return res.status(404).json(formatError('会话不存在'));
  }
  db.prepare('UPDATE video_sessions SET title = COALESCE(?, title), scheduled_at = COALESCE(?, scheduled_at) WHERE id = ?')
    .run(title, scheduled_at, req.params.id);
  logAudit(db, req.user.id, 'UPDATE', 'video_session', req.params.id, '更新视频调解: ' + session.title, req);
  res.json(formatResponse(null, '会话更新成功'));
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
  if (status === 'completed') {
    updates.push('ended_at = ?');
    values.push(new Date().toISOString());
    if (session.started_at) {
      const dur = Math.round((new Date() - new Date(session.started_at)) / 60000);
      updates.push('duration = ?');
      values.push(dur);
    }
  }
  values.push(req.params.id);

  db.prepare('UPDATE video_sessions SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);

  if (status === 'in_progress') {
    db.prepare('INSERT INTO chat_messages (session_id, sender_type, sender_name, content, message_type) VALUES (?, ?, ?, ?, ?)').run(
      req.params.id, 'system', '系统', '视频调解已开始', 'system'
    );
  } else if (status === 'completed') {
    db.prepare('INSERT INTO chat_messages (session_id, sender_type, sender_name, content, message_type) VALUES (?, ?, ?, ?, ?)').run(
      req.params.id, 'system', '系统', '视频调解已结束', 'system'
    );
  }

  logAudit(db, req.user.id, 'UPDATE_STATUS', 'video_session', req.params.id, '视频调解状态: ' + status, req);
  res.json(formatResponse(null, '状态更新成功'));
});

router.delete('/sessions/:id', (req, res) => {
  const db = getDb();
  const session = db.prepare('SELECT * FROM video_sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    return res.status(404).json(formatError('会话不存在'));
  }
  db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(req.params.id);
  db.prepare('DELETE FROM video_participants WHERE session_id = ?').run(req.params.id);
  db.prepare('DELETE FROM video_sessions WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'video_session', req.params.id, '删除视频调解: ' + session.title, req);
  res.json(formatResponse(null, '会话已删除'));
});

router.post('/sessions/:id/participants', (req, res) => {
  const { user_id, party_id, display_name } = req.body;
  if (!display_name) {
    return res.status(400).json(formatError('参与者名称不能为空'));
  }
  const db = getDb();
  const session = db.prepare('SELECT * FROM video_sessions WHERE id = ?').get(req.params.id);
  if (!session) {
    return res.status(404).json(formatError('会话不存在'));
  }
  const result = db.prepare('INSERT INTO video_participants (session_id, user_id, party_id, display_name) VALUES (?, ?, ?, ?)').run(
    req.params.id, user_id || null, party_id || null, display_name
  );
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '参与者已添加'));
});

router.delete('/sessions/:id/participants/:pid', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM video_participants WHERE id = ? AND session_id = ?').run(req.params.pid, req.params.id);
  res.json(formatResponse(null, '参与者已移除'));
});

router.get('/sessions/:id/messages', (req, res) => {
  const db = getDb();
  const messages = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json(formatResponse(messages));
});

router.post('/sessions/:id/messages', (req, res) => {
  const { content, message_type, sender_type, sender_name } = req.body;
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
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, sender_type || 'mediator', req.user.id, sender_name || req.user.real_name, content, message_type || 'text');

  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '消息发送成功'));
});

module.exports = router;
