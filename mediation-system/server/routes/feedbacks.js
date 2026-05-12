const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { case_id, min_rating, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('f.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (min_rating) { where.push('f.rating >= @min_rating'); params.min_rating = parseInt(min_rating); }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM feedbacks f ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT f.*, cp.name as party_name, cp.party_type,
           c.case_number, c.title as case_title, u.real_name as mediator_name
    FROM feedbacks f
    LEFT JOIN case_parties cp ON f.party_id = cp.id
    LEFT JOIN cases c ON f.case_id = c.id
    LEFT JOIN users u ON c.mediator_id = u.id
    ${whereClause}
    ORDER BY f.created_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/stats', (req, res) => {
  const db = getDb();

  const overall = db.prepare(`
    SELECT COUNT(*) as total_count,
           AVG(rating) as avg_rating,
           AVG(attitude_score) as avg_attitude,
           AVG(efficiency_score) as avg_efficiency,
           AVG(fairness_score) as avg_fairness
    FROM feedbacks
  `).get();

  const distribution = db.prepare(`
    SELECT rating, COUNT(*) as count FROM feedbacks GROUP BY rating ORDER BY rating
  `).all();

  const mediatorStats = db.prepare(`
    SELECT u.id, u.real_name, u.avatar_color,
           COUNT(f.id) as feedback_count,
           AVG(f.rating) as avg_rating,
           AVG(f.attitude_score) as avg_attitude,
           AVG(f.efficiency_score) as avg_efficiency,
           AVG(f.fairness_score) as avg_fairness
    FROM users u
    LEFT JOIN cases c ON u.id = c.mediator_id
    LEFT JOIN feedbacks f ON c.id = f.case_id
    WHERE u.role_id IN (3, 4) AND f.id IS NOT NULL
    GROUP BY u.id ORDER BY avg_rating DESC
  `).all();

  res.json(formatResponse({ overall, distribution, mediator_stats: mediatorStats }));
});

router.post('/', (req, res) => {
  const { case_id, party_id, rating, attitude_score, efficiency_score, fairness_score, comment, is_anonymous } = req.body;
  if (!case_id || !party_id || !rating) {
    return res.status(400).json(formatError('案件ID、当事人ID和评分不能为空'));
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM feedbacks WHERE case_id = ? AND party_id = ?').get(case_id, party_id);
  if (existing) {
    return res.status(409).json(formatError('该当事人已提交过评价'));
  }

  const result = db.prepare(`
    INSERT INTO feedbacks (case_id, party_id, rating, attitude_score, efficiency_score, fairness_score, comment, is_anonymous)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(case_id, party_id, rating, attitude_score || null, efficiency_score || null, fairness_score || null, comment || null, is_anonymous ? 1 : 0);

  logAudit(db, req.user.id, 'CREATE', 'feedback', result.lastInsertRowid, `提交评价: 案件#${case_id} 评分${rating}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '评价提交成功'));
});

module.exports = router;
