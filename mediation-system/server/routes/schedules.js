const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { mediator_id, schedule_type, status, start_date, end_date, page = 1, pageSize = 50 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (mediator_id) { where.push('s.mediator_id = @mediator_id'); params.mediator_id = parseInt(mediator_id); }
  if (schedule_type) { where.push('s.schedule_type = @schedule_type'); params.schedule_type = schedule_type; }
  if (status) { where.push('s.status = @status'); params.status = status; }
  if (start_date) { where.push('s.start_time >= @start_date'); params.start_date = start_date; }
  if (end_date) { where.push('s.end_time <= @end_date'); params.end_date = end_date; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const schedules = db.prepare(`
    SELECT s.*, u.real_name as mediator_name, u.avatar_color,
           c.case_number, c.title as case_title
    FROM schedules s
    LEFT JOIN users u ON s.mediator_id = u.id
    LEFT JOIN cases c ON s.case_id = c.id
    ${whereClause}
    ORDER BY s.start_time ASC
  `).all(params);

  res.json(formatResponse(schedules));
});

router.get('/calendar', (req, res) => {
  const { month, mediator_id } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (month) {
    where.push("strftime('%Y-%m', s.start_time) = @month");
    params.month = month;
  }
  if (mediator_id) { where.push('s.mediator_id = @mediator_id'); params.mediator_id = parseInt(mediator_id); }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const schedules = db.prepare(`
    SELECT s.id, s.title, s.schedule_type, s.status, s.start_time, s.end_time, s.location,
           u.real_name as mediator_name, u.avatar_color, c.case_number
    FROM schedules s
    LEFT JOIN users u ON s.mediator_id = u.id
    LEFT JOIN cases c ON s.case_id = c.id
    ${whereClause}
    ORDER BY s.start_time
  `).all(params);

  const calendar = {};
  for (const s of schedules) {
    const day = s.start_time.split('T')[0];
    if (!calendar[day]) calendar[day] = [];
    calendar[day].push(s);
  }

  res.json(formatResponse(calendar));
});

router.get('/conflicts', (req, res) => {
  const { mediator_id, start_time, end_time, exclude_id } = req.query;
  if (!mediator_id || !start_time || !end_time) {
    return res.status(400).json(formatError('调解员ID、开始时间和结束时间不能为空'));
  }

  const db = getDb();
  let query = `SELECT * FROM schedules WHERE mediator_id = ? AND status != 'cancelled' AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`;
  let queryParams = [mediator_id, end_time, start_time, end_time, start_time];

  if (exclude_id) {
    query += ' AND id != ?';
    queryParams.push(exclude_id);
  }

  const conflicts = db.prepare(query).all(...queryParams);
  res.json(formatResponse({ has_conflict: conflicts.length > 0, conflicts }));
});

router.post('/', (req, res) => {
  const { title, case_id, mediator_id, schedule_type, start_time, end_time, location, description, reminder } = req.body;
  if (!title || !mediator_id || !start_time || !end_time) {
    return res.status(400).json(formatError('标题、调解员、开始和结束时间不能为空'));
  }

  const db = getDb();

  const conflicts = db.prepare(
    `SELECT * FROM schedules WHERE mediator_id = ? AND status != 'cancelled' AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))`
  ).all(mediator_id, end_time, start_time, end_time, start_time);

  if (conflicts.length > 0) {
    return res.status(409).json(formatError('该调解员在指定时间段已有安排，存在时间冲突'));
  }

  const result = db.prepare(`
    INSERT INTO schedules (title, case_id, mediator_id, schedule_type, start_time, end_time, location, description, reminder, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, case_id || null, mediator_id, schedule_type || 'mediation', start_time, end_time, location || null, description || null, reminder || 15, req.user.id);

  if (case_id) {
    const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);
    if (caseData) {
      db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)').run(
        mediator_id, 'video', '新日程安排',
        `案件 #${caseData.case_number} 调解已安排: ${start_time}`, `/video`
      );
    }
  }

  logAudit(db, req.user.id, 'CREATE', 'schedule', result.lastInsertRowid, `创建日程: ${title}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '日程创建成功'));
});

router.put('/:id', (req, res) => {
  const { title, schedule_type, status, start_time, end_time, location, description, reminder } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('日程不存在'));

  db.prepare(`
    UPDATE schedules SET title = COALESCE(?, title), schedule_type = COALESCE(?, schedule_type),
    status = COALESCE(?, status), start_time = COALESCE(?, start_time), end_time = COALESCE(?, end_time),
    location = COALESCE(?, location), description = COALESCE(?, description),
    reminder = COALESCE(?, reminder), updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(title, schedule_type, status, start_time, end_time, location, description, reminder, req.params.id);

  logAudit(db, req.user.id, 'UPDATE', 'schedule', req.params.id, `更新日程: ${existing.title}`, req);
  res.json(formatResponse(null, '日程更新成功'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('日程不存在'));

  db.prepare('UPDATE schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('cancelled', req.params.id);
  logAudit(db, req.user.id, 'CANCEL', 'schedule', req.params.id, `取消日程: ${existing.title}`, req);
  res.json(formatResponse(null, '日程已取消'));
});

module.exports = router;
