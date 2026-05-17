const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/stats', (req, res) => {
  const db = getDb();

  const overall = db.prepare(`
    SELECT COUNT(*) as total_count,
           ROUND(AVG(rating),1) as avg_rating,
           ROUND(AVG(attitude_score),1) as avg_attitude,
           ROUND(AVG(efficiency_score),1) as avg_efficiency,
           ROUND(AVG(fairness_score),1) as avg_fairness,
           SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as recommend_count
    FROM feedbacks
  `).get();

  const totalCount = overall.total_count || 0;
  const recommendRate = totalCount > 0 ? Math.round((overall.recommend_count / totalCount) * 100) : 0;

  const distribution = db.prepare(`
    SELECT rating, COUNT(*) as count FROM feedbacks GROUP BY rating ORDER BY rating
  `).all();

  const distMap = {};
  distribution.forEach(d => { distMap[d.rating] = d.count; });

  const mediatorStats = db.prepare(`
    SELECT u.id, u.real_name,
           COUNT(f.id) as feedback_count,
           ROUND(AVG(f.rating),1) as avg_rating,
           ROUND(AVG(f.attitude_score),1) as avg_attitude,
           ROUND(AVG(f.efficiency_score),1) as avg_efficiency,
           ROUND(AVG(f.fairness_score),1) as avg_fairness
    FROM users u
    LEFT JOIN cases c ON u.id = c.mediator_id
    LEFT JOIN feedbacks f ON c.id = f.case_id
    WHERE u.role_id IN (3, 4)
    GROUP BY u.id
    ORDER BY avg_rating DESC NULLS LAST
  `).all();

  const recentTrend = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month,
           COUNT(*) as count,
           ROUND(AVG(rating),1) as avg_rating
    FROM feedbacks
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month DESC LIMIT 6
  `).all();

  const categoryScores = [
    { name: '服务态度', score: overall.avg_attitude || 0, key: 'attitude' },
    { name: '调解效率', score: overall.avg_efficiency || 0, key: 'efficiency' },
    { name: '公正性', score: overall.avg_fairness || 0, key: 'fairness' },
    { name: '综合评分', score: overall.avg_rating || 0, key: 'overall' }
  ];

  res.json(formatResponse({
    overall: {
      total_count: totalCount,
      avg_rating: overall.avg_rating || 0,
      avg_attitude: overall.avg_attitude || 0,
      avg_efficiency: overall.avg_efficiency || 0,
      avg_fairness: overall.avg_fairness || 0,
      recommend_rate: recommendRate
    },
    distribution: distMap,
    mediator_stats: mediatorStats,
    recent_trend: recentTrend,
    category_scores: categoryScores
  }));
});

router.get('/', (req, res) => {
  const { case_id, party_id, min_rating, max_rating, is_anonymous, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('f.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (party_id) { where.push('f.party_id = @party_id'); params.party_id = parseInt(party_id); }
  if (min_rating) { where.push('f.rating >= @min_rating'); params.min_rating = parseInt(min_rating); }
  if (max_rating) { where.push('f.rating <= @max_rating'); params.max_rating = parseInt(max_rating); }
  if (is_anonymous !== undefined) { where.push('f.is_anonymous = @is_anonymous'); params.is_anonymous = parseInt(is_anonymous); }
  if (search) {
    where.push('(c.case_number LIKE @search OR c.title LIKE @search OR cp.name LIKE @search OR f.comment LIKE @search)');
    params.search = '%' + search + '%';
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM feedbacks f LEFT JOIN cases c ON f.case_id = c.id LEFT JOIN case_parties cp ON f.party_id = cp.id ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT f.*, cp.name as party_name, cp.phone as party_phone, cp.party_type,
           c.case_number, c.title as case_title, u.real_name as mediator_name
    FROM feedbacks f
    LEFT JOIN case_parties cp ON f.party_id = cp.id
    LEFT JOIN cases c ON f.case_id = c.id
    LEFT JOIN users u ON c.mediator_id = u.id
    ${whereClause}
    ORDER BY f.created_at DESC
    LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const feedback = db.prepare(`
    SELECT f.*, cp.name as party_name, cp.phone as party_phone, cp.party_type,
           c.case_number, c.title as case_title, c.status as case_status, u.real_name as mediator_name
    FROM feedbacks f
    LEFT JOIN case_parties cp ON f.party_id = cp.id
    LEFT JOIN cases c ON f.case_id = c.id
    LEFT JOIN users u ON c.mediator_id = u.id
    WHERE f.id = ?
  `).get(req.params.id);

  if (!feedback) return res.status(404).json(formatError('评价不存在'));
  res.json(formatResponse(feedback));
});

router.post('/', (req, res) => {
  const { case_id, party_id, rating, attitude_score, efficiency_score, fairness_score, comment, is_anonymous } = req.body;
  if (!case_id || !party_id || !rating) {
    return res.status(400).json(formatError('案件ID、当事人ID和评分不能为空'));
  }

  const db = getDb();
  const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(case_id);
  if (!caseData) return res.status(404).json(formatError('案件不存在'));

  const party = db.prepare('SELECT * FROM case_parties WHERE id = ? AND case_id = ?').get(party_id, case_id);
  if (!party) return res.status(404).json(formatError('当事人不存在'));

  const existing = db.prepare('SELECT id FROM feedbacks WHERE case_id = ? AND party_id = ?').get(case_id, party_id);
  if (existing) return res.status(409).json(formatError('该当事人已提交过评价'));

  const result = db.prepare(`
    INSERT INTO feedbacks (case_id, party_id, rating, attitude_score, efficiency_score, fairness_score, comment, is_anonymous)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(case_id, party_id, rating, attitude_score || null, efficiency_score || null, fairness_score || null, comment || null, is_anonymous ? 1 : 0);

  logAudit(db, req.user.id, 'CREATE', 'feedback', result.lastInsertRowid, `提交评价: 案件#${case_id} 评分${rating}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '评价提交成功'));
});

router.put('/:id', (req, res) => {
  const { rating, attitude_score, efficiency_score, fairness_score, comment, is_anonymous } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('评价不存在'));

  const updates = [];
  const values = [];
  if (rating !== undefined) { updates.push('rating = ?'); values.push(rating); }
  if (attitude_score !== undefined) { updates.push('attitude_score = ?'); values.push(attitude_score); }
  if (efficiency_score !== undefined) { updates.push('efficiency_score = ?'); values.push(efficiency_score); }
  if (fairness_score !== undefined) { updates.push('fairness_score = ?'); values.push(fairness_score); }
  if (comment !== undefined) { updates.push('comment = ?'); values.push(comment); }
  if (is_anonymous !== undefined) { updates.push('is_anonymous = ?'); values.push(is_anonymous ? 1 : 0); }

  if (updates.length === 0) return res.status(400).json(formatError('没有需要更新的字段'));
  values.push(req.params.id);

  db.prepare('UPDATE feedbacks SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);
  logAudit(db, req.user.id, 'UPDATE', 'feedback', req.params.id, `更新评价: 案件#${existing.case_id}`, req);
  res.json(formatResponse(null, '评价已更新'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const feedback = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(req.params.id);
  if (!feedback) return res.status(404).json(formatError('评价不存在'));

  db.prepare('DELETE FROM feedbacks WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'feedback', req.params.id, `删除评价: 案件#${feedback.case_id}`, req);
  res.json(formatResponse(null, '评价已删除'));
});

module.exports = router;
