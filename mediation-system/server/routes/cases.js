const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', (req, res) => {
  const db = getDb();

  const totalCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get().count;
  const closedCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status IN ('closed', 'agreed') AND strftime('%Y-%m', closed_at) = strftime('%Y-%m', 'now')").get().count;
  const allClosed = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status IN ('closed', 'agreed')").get().count;
  const allTotal = db.prepare("SELECT COUNT(*) as count FROM cases").get().count;
  const successRate = allTotal > 0 ? ((allClosed / allTotal) * 100).toFixed(1) : 0;
  const mediating = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'mediating'").get().count;
  const avgDuration = db.prepare("SELECT AVG(CAST(julianday(closed_at) - julianday(accepted_at) AS REAL)) as avg FROM cases WHERE status IN ('closed', 'agreed') AND closed_at IS NOT NULL AND accepted_at IS NOT NULL").get().avg || 0;

  const monthlyStats = db.prepare(`
    SELECT stat_date, total_cases, new_cases, closed_cases, success_rate, avg_duration
    FROM dashboard_stats ORDER BY stat_date DESC LIMIT 12
  `).all().reverse();

  const typeDistribution = db.prepare(`
    SELECT ct.name, ct.color, COUNT(c.id) as count
    FROM case_types ct LEFT JOIN cases c ON ct.id = c.type_id
    GROUP BY ct.id ORDER BY count DESC
  `).all();

  const recentActivities = db.prepare(`
    SELECT 'case' as type, c.case_number, c.title, c.status, c.updated_at,
           u.real_name as mediator_name
    FROM cases c LEFT JOIN users u ON c.mediator_id = u.id
    ORDER BY c.updated_at DESC LIMIT 5
  `).all();

  const topMediators = db.prepare(`
    SELECT u.id, u.real_name, u.avatar_color,
           COUNT(c.id) as total_cases,
           SUM(CASE WHEN c.status IN ('closed', 'agreed') THEN 1 ELSE 0 END) as closed_cases,
           CASE WHEN COUNT(c.id) > 0 THEN ROUND(SUM(CASE WHEN c.status IN ('closed', 'agreed') THEN 1 ELSE 0 END) * 100.0 / COUNT(c.id), 1) ELSE 0 END as success_rate
    FROM users u LEFT JOIN cases c ON u.id = c.mediator_id
    WHERE u.role_id IN (3, 4)
    GROUP BY u.id ORDER BY success_rate DESC LIMIT 5
  `).all();

  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0").get(req.user.id).count;

  res.json(formatResponse({
    summary: {
      total_cases: totalCases,
      success_rate: parseFloat(successRate),
      mediating,
      avg_duration: parseFloat(avgDuration.toFixed(1))
    },
    monthly_stats: monthlyStats,
    type_distribution: typeDistribution,
    recent_activities: recentActivities,
    top_mediators: topMediators,
    unread_notifications: pendingCount
  }));
});

router.get('/', (req, res) => {
  const { status, priority, type_id, mediator_id, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};

  if (status) { where.push('c.status = @status'); params.status = status; }
  if (priority) { where.push('c.priority = @priority'); params.priority = priority; }
  if (type_id) { where.push('c.type_id = @type_id'); params.type_id = parseInt(type_id); }
  if (mediator_id) { where.push('c.mediator_id = @mediator_id'); params.mediator_id = parseInt(mediator_id); }
  if (search) { where.push('(c.case_number LIKE @search OR c.title LIKE @search)'); params.search = `%${search}%`; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM cases c ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT c.*, ct.name as type_name, ct.icon as type_icon, ct.color as type_color,
           u.real_name as mediator_name
    FROM cases c
    LEFT JOIN case_types ct ON c.type_id = ct.id
    LEFT JOIN users u ON c.mediator_id = u.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));

  const casesWithParties = result.data.map(c => {
    const parties = db.prepare(`
      SELECT id, party_type, name, id_number, phone FROM case_parties WHERE case_id = ?
    `).all(c.id);
    return { ...c, parties };
  });

  res.json(formatResponse({
    data: casesWithParties,
    pagination: result.pagination
  }));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const caseData = db.prepare(`
    SELECT c.*, ct.name as type_name, ct.icon as type_icon, ct.color as type_color,
           u.real_name as mediator_name,
           creator.real_name as created_by_name
    FROM cases c
    LEFT JOIN case_types ct ON c.type_id = ct.id
    LEFT JOIN users u ON c.mediator_id = u.id
    LEFT JOIN users creator ON c.created_by = creator.id
    WHERE c.id = ?
  `).get(req.params.id);

  if (!caseData) {
    return res.status(404).json(formatError('案件不存在'));
  }

  const parties = db.prepare('SELECT * FROM case_parties WHERE case_id = ?').all(req.params.id);
  const records = db.prepare(`
    SELECT mr.*, u.real_name as mediator_name FROM mediation_records mr
    LEFT JOIN users u ON mr.mediator_id = u.id WHERE mr.case_id = ? ORDER BY mr.created_at DESC
  `).all(req.params.id);
  const documents = db.prepare(`
    SELECT dr.*, dt.name as template_name FROM document_records dr
    LEFT JOIN document_templates dt ON dr.template_id = dt.id WHERE dr.case_id = ? ORDER BY dr.generated_at DESC
  `).all(req.params.id);

  res.json(formatResponse({ ...caseData, parties, records, documents }));
});

router.post('/', roleMiddleware('super_admin', 'org_admin', 'senior_mediator'), (req, res) => {
  const { title, type_id, description, priority, mediator_id, parties } = req.body;

  if (!title || !type_id) {
    return res.status(400).json(formatError('案件标题和类型不能为空'));
  }

  const db = getDb();

  const lastCase = db.prepare("SELECT case_number FROM cases ORDER BY id DESC LIMIT 1").get();
  let nextNum = 1;
  if (lastCase) {
    const parts = lastCase.case_number.split('-');
    nextNum = parseInt(parts[1]) + 1;
  }
  const caseNumber = `${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;

  const result = db.prepare(`
    INSERT INTO cases (case_number, title, type_id, description, status, priority, mediator_id, created_by, assigned_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
  `).run(caseNumber, title, type_id, description || '', priority || 'normal', mediator_id || null, req.user.id, mediator_id ? new Date().toISOString() : null);

  if (parties && Array.isArray(parties)) {
    const insertParty = db.prepare(
      'INSERT INTO case_parties (case_id, party_type, name, id_number, phone, email, address, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const p of parties) {
      insertParty.run(result.lastInsertRowid, p.party_type, p.name, p.id_number || null, p.phone || null, p.email || null, p.address || null, p.description || null);
    }
  }

  if (mediator_id) {
    db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)').run(
      mediator_id, 'case', '新案件分配', `案件 #${caseNumber} 已分配给您，请及时处理`, `/cases/${result.lastInsertRowid}`
    );
  }

  logAudit(db, req.user.id, 'CREATE', 'case', result.lastInsertRowid, `创建案件 #${caseNumber}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid, case_number: caseNumber }, '案件创建成功'));
});

router.put('/:id', (req, res) => {
  const { title, type_id, description, status, priority, mediator_id } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('案件不存在'));
  }

  const updates = [];
  const values = [];
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (type_id !== undefined) { updates.push('type_id = ?'); values.push(type_id); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
  if (mediator_id !== undefined) {
    updates.push('mediator_id = ?');
    values.push(mediator_id);
    if (!existing.assigned_at) { updates.push('assigned_at = ?'); values.push(new Date().toISOString()); }
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
    if (status === 'accepted' && !existing.accepted_at) { updates.push('accepted_at = ?'); values.push(new Date().toISOString()); }
    if (['closed', 'agreed', 'terminated'].includes(status)) { updates.push('closed_at = ?'); values.push(new Date().toISOString()); }
  }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.prepare(`UPDATE cases SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  logAudit(db, req.user.id, 'UPDATE', 'case', req.params.id, `更新案件 #${existing.case_number}`, req);
  res.json(formatResponse(null, '案件更新成功'));
});

router.delete('/:id', roleMiddleware('super_admin', 'org_admin'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('案件不存在'));
  }

  db.prepare('DELETE FROM cases WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'case', req.params.id, `删除案件 #${existing.case_number}`, req);
  res.json(formatResponse(null, '案件删除成功'));
});

router.post('/:id/parties', (req, res) => {
  const { party_type, name, id_number, phone, email, address, description } = req.body;
  if (!party_type || !name) {
    return res.status(400).json(formatError('当事人类型和姓名不能为空'));
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM cases WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('案件不存在'));
  }

  const result = db.prepare(
    'INSERT INTO case_parties (case_id, party_type, name, id_number, phone, email, address, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.params.id, party_type, name, id_number, phone, email, address, description);

  logAudit(db, req.user.id, 'ADD_PARTY', 'case', req.params.id, `添加当事人: ${name}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '当事人添加成功'));
});

router.post('/:id/records', (req, res) => {
  const { record_type, content, file_path, duration } = req.body;
  if (!record_type) {
    return res.status(400).json(formatError('记录类型不能为空'));
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO mediation_records (case_id, mediator_id, record_type, content, file_path, duration) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.id, req.user.id, record_type, content, file_path, duration);

  logAudit(db, req.user.id, 'ADD_RECORD', 'case', req.params.id, `添加调解记录`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '调解记录添加成功'));
});

module.exports = router;
