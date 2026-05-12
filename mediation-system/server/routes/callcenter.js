const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', (req, res) => {
  const db = getDb();

  const waiting = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status = 'waiting'").get().count;
  const connected = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status = 'connected'").get().count;
  const todayTotal = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE date(started_at) = date('now')").get().count;
  const todayAnswered = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status IN ('connected', 'completed') AND date(started_at) = date('now')").get().count;

  const hourlyStats = [];
  for (let h = 8; h <= 17; h++) {
    const total = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE strftime('%H', started_at) = ?").get(String(h).padStart(2, '0')).count;
    const answered = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status IN ('connected', 'completed') AND strftime('%H', started_at) = ?").get(String(h).padStart(2, '0')).count;
    hourlyStats.push({ hour: `${h}:00`, total, answered });
  }

  res.json(formatResponse({
    summary: { waiting, connected, today_total: todayTotal, today_answered: todayAnswered },
    hourly_stats: hourlyStats
  }));
});

router.get('/records', (req, res) => {
  const { status, category, call_type, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (status) { where.push('cr.status = @status'); params.status = status; }
  if (category) { where.push('cr.category = @category'); params.category = category; }
  if (call_type) { where.push('cr.call_type = @call_type'); params.call_type = call_type; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM call_records cr ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT cr.*, u.real_name as callee_name
    FROM call_records cr LEFT JOIN users u ON cr.callee_id = u.id
    ${whereClause}
    ORDER BY cr.created_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.post('/', (req, res) => {
  const { caller_number, call_type, category, note } = req.body;
  if (!caller_number || !call_type) {
    return res.status(400).json(formatError('来电号码和呼叫类型不能为空'));
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO call_records (caller_number, callee_id, call_type, category, status, started_at)
    VALUES (?, ?, ?, ?, 'waiting', ?)
  `).run(caller_number, req.user.id, call_type, category || null, new Date().toISOString());

  logAudit(db, req.user.id, 'CREATE', 'call_record', result.lastInsertRowid, `新增来电: ${caller_number}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '来电记录创建成功'));
});

router.put('/:id/answer', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM call_records WHERE id = ?').get(req.params.id);
  if (!record) {
    return res.status(404).json(formatError('呼叫记录不存在'));
  }

  db.prepare(`
    UPDATE call_records SET status = 'connected', callee_id = ?, answered_at = ? WHERE id = ?
  `).run(req.user.id, new Date().toISOString(), req.params.id);

  logAudit(db, req.user.id, 'ANSWER', 'call_record', req.params.id, `接听来电: ${record.caller_number}`, req);
  res.json(formatResponse(null, '已接听'));
});

router.put('/:id/end', (req, res) => {
  const { note } = req.body;
  const db = getDb();
  const record = db.prepare('SELECT * FROM call_records WHERE id = ?').get(req.params.id);
  if (!record) {
    return res.status(404).json(formatError('呼叫记录不存在'));
  }

  const now = new Date().toISOString();
  let talkDuration = null;
  let waitDuration = null;
  if (record.answered_at) {
    talkDuration = Math.floor((new Date(now) - new Date(record.answered_at)) / 1000);
  }
  if (record.started_at) {
    waitDuration = Math.floor((new Date(record.answered_at || now) - new Date(record.started_at)) / 1000);
  }

  db.prepare(`
    UPDATE call_records SET status = 'completed', ended_at = ?, talk_duration = ?, wait_duration = ?, note = COALESCE(?, note) WHERE id = ?
  `).run(now, talkDuration, waitDuration, note, req.params.id);

  logAudit(db, req.user.id, 'END_CALL', 'call_record', req.params.id, `结束通话: ${record.caller_number}`, req);
  res.json(formatResponse(null, '通话已结束'));
});

module.exports = router;
