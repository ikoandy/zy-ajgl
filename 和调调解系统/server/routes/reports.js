const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/overview', (req, res) => {
  const db = getDb();

  const totalCases = db.prepare('SELECT COUNT(*) as count FROM cases').get().count;
  const pendingCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'pending'").get().count;
  const mediatingCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'mediating'").get().count;
  const closedCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status IN ('closed', 'agreed')").get().count;
  const terminatedCases = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status = 'terminated'").get().count;

  const byType = db.prepare(`
    SELECT ct.name, ct.color, COUNT(c.id) as count,
           SUM(CASE WHEN c.status IN ('closed', 'agreed') THEN 1 ELSE 0 END) as closed_count
    FROM case_types ct LEFT JOIN cases c ON ct.id = c.type_id
    GROUP BY ct.id ORDER BY count DESC
  `).all();

  const byPriority = db.prepare(`
    SELECT priority, COUNT(*) as count FROM cases GROUP BY priority
  `).all();

  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month,
           COUNT(*) as total,
           SUM(CASE WHEN status IN ('closed', 'agreed') THEN 1 ELSE 0 END) as closed,
           SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminated
    FROM cases GROUP BY month ORDER BY month DESC LIMIT 12
  `).all().reverse();

  const mediatorPerformance = db.prepare(`
    SELECT u.id, u.real_name, u.avatar_color,
           COUNT(c.id) as total_cases,
           SUM(CASE WHEN c.status IN ('closed', 'agreed') THEN 1 ELSE 0 END) as success_cases,
           SUM(CASE WHEN c.status = 'terminated' THEN 1 ELSE 0 END) as terminated_cases,
           AVG(CASE WHEN c.closed_at IS NOT NULL AND c.accepted_at IS NOT NULL
               THEN CAST(julianday(c.closed_at) - julianday(c.accepted_at) AS REAL) END) as avg_duration
    FROM users u LEFT JOIN cases c ON u.id = c.mediator_id
    WHERE u.role_id IN (3, 4)
    GROUP BY u.id ORDER BY total_cases DESC
  `).all();

  const feedbackSummary = db.prepare(`
    SELECT COUNT(*) as total_count, AVG(rating) as avg_rating,
           AVG(attitude_score) as avg_attitude,
           AVG(efficiency_score) as avg_efficiency,
           AVG(fairness_score) as avg_fairness
    FROM feedbacks
  `).get();

  res.json(formatResponse({
    summary: { total: totalCases, pending: pendingCases, mediating: mediatingCases, closed: closedCases, terminated: terminatedCases },
    by_type: byType,
    by_priority: byPriority,
    by_month: byMonth,
    mediator_performance: mediatorPerformance,
    feedback_summary: feedbackSummary
  }));
});

router.get('/cases-export', (req, res) => {
  const { status, type_id, start_date, end_date } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (status) { where.push('c.status = ?'); params.status = status; }
  if (type_id) { where.push('c.type_id = ?'); params.type_id = parseInt(type_id); }
  if (start_date) { where.push('c.created_at >= ?'); params.start_date = start_date; }
  if (end_date) { where.push('c.created_at <= ?'); params.end_date = end_date; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const cases = db.prepare(`
    SELECT c.case_number, c.title, ct.name as type_name, c.status, c.priority,
           u.real_name as mediator_name, c.created_at, c.closed_at,
           GROUP_CONCAT(CASE WHEN cp.party_type = 'plaintiff' THEN cp.name END) as plaintiffs,
           GROUP_CONCAT(CASE WHEN cp.party_type = 'defendant' THEN cp.name END) as defendants
    FROM cases c
    LEFT JOIN case_types ct ON c.type_id = ct.id
    LEFT JOIN users u ON c.mediator_id = u.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    ${whereClause}
    GROUP BY c.id ORDER BY c.created_at DESC
  `).all(params);

  const statusLabels = { pending: '待受理', accepted: '已受理', mediating: '调解中', agreed: '已达成协议', terminated: '已终止', closed: '已结案' };
  const priorityLabels = { low: '低', normal: '普通', high: '高', urgent: '紧急' };

  const csvHeader = '案件编号,案件标题,案件类型,当事人(原告),当事人(被告),调解员,状态,优先级,创建日期,结案日期\n';
  const csvRows = cases.map(c =>
    `"${c.case_number}","${c.title}","${c.type_name}","${c.plaintiffs || ''}","${c.defendants || ''}","${c.mediator_name || ''}","${statusLabels[c.status] || c.status}","${priorityLabels[c.priority] || c.priority}","${c.created_at}","${c.closed_at || ''}"`
  ).join('\n');

  const BOM = '\uFEFF';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=cases_export_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(BOM + csvHeader + csvRows);
});

router.get('/mediator-report', (req, res) => {
  const { mediator_id, period } = req.query;
  const db = getDb();

  let mediatorFilter = '';
  let params = {};
  if (mediator_id) {
    mediatorFilter = 'AND c.mediator_id = ?';
    params.mediator_id = parseInt(mediator_id);
  }

  const mediators = db.prepare(`
    SELECT u.id, u.real_name, u.avatar_color,
           COUNT(c.id) as total_cases,
           SUM(CASE WHEN c.status IN ('closed', 'agreed') THEN 1 ELSE 0 END) as success_cases,
           SUM(CASE WHEN c.status = 'terminated' THEN 1 ELSE 0 END) as terminated_cases,
           SUM(CASE WHEN c.status IN ('pending', 'accepted', 'mediating') THEN 1 ELSE 0 END) as ongoing_cases,
           AVG(CASE WHEN c.closed_at IS NOT NULL AND c.accepted_at IS NOT NULL
               THEN CAST(julianday(c.closed_at) - julianday(c.accepted_at) AS REAL) END) as avg_duration,
           (SELECT AVG(f.rating) FROM feedbacks f JOIN cases fc ON f.case_id = fc.id WHERE fc.mediator_id = u.id) as avg_rating
    FROM users u LEFT JOIN cases c ON u.id = c.mediator_id
    WHERE u.role_id IN (3, 4) ${mediatorFilter}
    GROUP BY u.id ORDER BY success_cases DESC
  `).all(params);

  res.json(formatResponse(mediators));
});

module.exports = router;
