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
  const todayMissed = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status IN ('missed', 'abandoned') AND date(started_at) = date('now')").get().count;
  const todayOutbound = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE call_type = 'outbound' AND date(started_at) = date('now')").get().count;

  const totalAll = db.prepare('SELECT COUNT(*) as count FROM call_records').get().count;
  const answeredAll = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status IN ('connected', 'completed')").get().count;

  const avgWait = db.prepare("SELECT ROUND(AVG(wait_duration),0) as avg FROM call_records WHERE wait_duration IS NOT NULL AND wait_duration > 0").get().avg || 0;
  const avgTalk = db.prepare("SELECT ROUND(AVG(talk_duration),0) as avg FROM call_records WHERE talk_duration IS NOT NULL AND talk_duration > 0").get().avg || 0;

  const byCategory = db.prepare('SELECT category, COUNT(*) as cnt FROM call_records WHERE category IS NOT NULL GROUP BY category').all();
  const byStatus = db.prepare('SELECT status, COUNT(*) as cnt FROM call_records GROUP BY status').all();

  const hourlyStats = [];
  for (let h = 8; h <= 17; h++) {
    const total = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE strftime('%H', started_at) = ?").get(String(h).padStart(2, '0')).count;
    const answered = db.prepare("SELECT COUNT(*) as count FROM call_records WHERE status IN ('connected', 'completed') AND strftime('%H', started_at) = ?").get(String(h).padStart(2, '0')).count;
    hourlyStats.push({ hour: `${h}:00`, total, answered });
  }

  const recentRecords = db.prepare(`
    SELECT cr.*, u.real_name as callee_name, c.case_number, c.title as case_title
    FROM call_records cr
    LEFT JOIN users u ON cr.callee_id = u.id
    LEFT JOIN cases c ON cr.case_id = c.id
    WHERE cr.status IN ('waiting', 'connected')
    ORDER BY cr.started_at DESC LIMIT 10
  `).all();

  res.json(formatResponse({
    summary: {
      waiting, connected,
      today_total: todayTotal, today_answered: todayAnswered,
      today_missed: todayMissed, today_outbound: todayOutbound,
      total_all: totalAll, answered_all: answeredAll,
      answer_rate: totalAll > 0 ? Math.round(answeredAll / totalAll * 100) : 0,
      avg_wait: avgWait, avg_talk: avgTalk
    },
    by_category: byCategory,
    by_status: byStatus,
    hourly_stats: hourlyStats,
    recent: recentRecords
  }));
});

router.get('/records', (req, res) => {
  const { status, category, call_type, case_id, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (status) { where.push('cr.status = @status'); params.status = status; }
  if (category) { where.push('cr.category = @category'); params.category = category; }
  if (call_type) { where.push('cr.call_type = @call_type'); params.call_type = call_type; }
  if (case_id) { where.push('cr.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (search) {
    where.push('(cr.caller_number LIKE @search OR cr.caller_name LIKE @search OR cr.note LIKE @search)');
    params.search = '%' + search + '%';
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM call_records cr ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT cr.*, u.real_name as callee_name, c.case_number, c.title as case_title
    FROM call_records cr
    LEFT JOIN users u ON cr.callee_id = u.id
    LEFT JOIN cases c ON cr.case_id = c.id
    ${whereClause}
    ORDER BY cr.started_at DESC
    LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/records/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare(`
    SELECT cr.*, u.real_name as callee_name, c.case_number, c.title as case_title
    FROM call_records cr
    LEFT JOIN users u ON cr.callee_id = u.id
    LEFT JOIN cases c ON cr.case_id = c.id
    WHERE cr.id = ?
  `).get(req.params.id);

  if (!record) return res.status(404).json(formatError('呼叫记录不存在'));
  res.json(formatResponse(record));
});

router.post('/records', (req, res) => {
  const { caller_number, caller_name, call_type, category, case_id, note } = req.body;
  if (!caller_number || !call_type) {
    return res.status(400).json(formatError('来电号码和呼叫类型不能为空'));
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO call_records (caller_number, caller_name, callee_id, call_type, category, case_id, status, started_at)
    VALUES (?, ?, ?, ?, ?, ?, 'waiting', ?)
  `).run(caller_number, caller_name || null, req.user.id, call_type, category || null, case_id || null, new Date().toISOString());

  logAudit(db, req.user.id, 'CREATE', 'call_record', result.lastInsertRowid, `新增来电: ${caller_number}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '来电记录创建成功'));
});

router.post('/outbound', (req, res) => {
  const { callee_number, callee_name, category, case_id, note } = req.body;
  if (!callee_number) {
    return res.status(400).json(formatError('呼叫号码不能为空'));
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO call_records (caller_number, caller_name, callee_id, call_type, category, case_id, status, started_at, answered_at)
    VALUES (?, ?, ?, 'outbound', ?, ?, 'connected', ?, ?)
  `).run(callee_number, callee_name || null, req.user.id, category || null, case_id || null, new Date().toISOString(), new Date().toISOString());

  logAudit(db, req.user.id, 'OUTBOUND', 'call_record', result.lastInsertRowid, `外呼: ${callee_number}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '外呼已发起'));
});

router.put('/records/:id/answer', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM call_records WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json(formatError('呼叫记录不存在'));

  db.prepare(`
    UPDATE call_records SET status = 'connected', callee_id = ?, answered_at = ? WHERE id = ?
  `).run(req.user.id, new Date().toISOString(), req.params.id);

  logAudit(db, req.user.id, 'ANSWER', 'call_record', req.params.id, `接听来电: ${record.caller_number}`, req);
  res.json(formatResponse(null, '已接听'));
});

router.put('/records/:id/end', (req, res) => {
  const { note, satisfaction } = req.body;
  const db = getDb();
  const record = db.prepare('SELECT * FROM call_records WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json(formatError('呼叫记录不存在'));

  const now = new Date().toISOString();
  let talkDuration = record.talk_duration;
  let waitDuration = record.wait_duration;
  if (record.answered_at) {
    talkDuration = Math.floor((new Date(now) - new Date(record.answered_at)) / 1000);
  }
  if (record.started_at && !record.wait_duration) {
    waitDuration = Math.floor((new Date(record.answered_at || now) - new Date(record.started_at)) / 1000);
  }

  const updates = ['status = ?', 'ended_at = ?', 'talk_duration = ?', 'wait_duration = ?'];
  const values = ['completed', now, talkDuration, waitDuration];
  if (note) { updates.push('note = ?'); values.push(note); }
  if (satisfaction) { updates.push('satisfaction = ?'); values.push(parseInt(satisfaction)); }
  values.push(req.params.id);

  db.prepare('UPDATE call_records SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);

  logAudit(db, req.user.id, 'END_CALL', 'call_record', req.params.id, `结束通话: ${record.caller_number}`, req);
  res.json(formatResponse(null, '通话已结束'));
});

router.put('/records/:id/transfer', (req, res) => {
  const { transfer_to, note } = req.body;
  if (!transfer_to) return res.status(400).json(formatError('转接目标不能为空'));

  const db = getDb();
  const record = db.prepare('SELECT * FROM call_records WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json(formatError('呼叫记录不存在'));

  const now = new Date().toISOString();
  let talkDuration = record.talk_duration;
  if (record.answered_at) {
    talkDuration = Math.floor((new Date(now) - new Date(record.answered_at)) / 1000);
  }

  db.prepare(`
    UPDATE call_records SET status = 'transferred', transfer_to = ?, talk_duration = ?, ended_at = ?, note = COALESCE(?, note) WHERE id = ?
  `).run(transfer_to, talkDuration, now, note, req.params.id);

  logAudit(db, req.user.id, 'TRANSFER', 'call_record', req.params.id, `转接通话至: ${transfer_to}`, req);
  res.json(formatResponse(null, '通话已转接'));
});

router.put('/records/:id/note', (req, res) => {
  const { note } = req.body;
  if (!note) return res.status(400).json(formatError('备注内容不能为空'));

  const db = getDb();
  db.prepare('UPDATE call_records SET note = ? WHERE id = ?').run(note, req.params.id);
  res.json(formatResponse(null, '备注已更新'));
});

router.put('/records/:id/satisfaction', (req, res) => {
  const { satisfaction } = req.body;
  if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
    return res.status(400).json(formatError('满意度评分1-5'));
  }
  const db = getDb();
  db.prepare('UPDATE call_records SET satisfaction = ? WHERE id = ?').run(parseInt(satisfaction), req.params.id);
  res.json(formatResponse(null, '满意度已记录'));
});

router.delete('/records/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM call_records WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json(formatError('呼叫记录不存在'));

  db.prepare('DELETE FROM call_records WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'call_record', req.params.id, `删除通话记录: ${record.caller_number}`, req);
  res.json(formatResponse(null, '记录已删除'));
});

module.exports = router;
