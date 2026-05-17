const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json(formatError('用户名和密码不能为空'));
  }

  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.display_name as role_display_name
    FROM users u JOIN roles r ON u.role_id = r.id
    WHERE u.username = ? AND u.status = 'active'
  `).get(username);

  if (!user) {
    return res.status(401).json(formatError('用户名或密码错误'));
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json(formatError('用户名或密码错误'));
  }

  db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  const token = generateToken(user);

  logAudit(db, user.id, 'LOGIN', 'user', user.id, '用户登录', req);

  res.json(formatResponse({
    token,
    user: {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role_id: user.role_id,
      role_name: user.role_name,
      role_display_name: user.role_display_name,
      avatar_color: user.avatar_color,
      phone: user.phone,
      email: user.email
    }
  }, '登录成功'));
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.display_name as role_display_name
    FROM users u JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `).get(req.user.id);

  if (!user) return res.status(404).json(formatError('用户不存在'));

  const caseStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status IN ('closed', 'agreed') THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN status = 'mediating' THEN 1 ELSE 0 END) as ongoing,
      SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminated
    FROM cases WHERE mediator_id = ?
  `).get(req.user.id);

  const recentCases = db.prepare(`
    SELECT case_number, title, status, updated_at FROM cases
    WHERE mediator_id = ? ORDER BY updated_at DESC LIMIT 5
  `).all(req.user.id);

  const scheduleCount = db.prepare(`
    SELECT COUNT(*) as count FROM schedules
    WHERE mediator_id = ? AND start_time >= datetime('now')
  `).get(req.user.id).count;

  const feedbackAvg = db.prepare(`
    SELECT ROUND(AVG(f.rating), 1) as avg_rating, COUNT(*) as total_reviews
    FROM feedbacks f JOIN cases c ON f.case_id = c.id
    WHERE c.mediator_id = ?
  `).get(req.user.id);

  const auditCount = db.prepare(`
    SELECT COUNT(*) as count FROM audit_logs WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
  `).get(req.user.id).count;

  res.json(formatResponse({
    id: user.id,
    username: user.username,
    real_name: user.real_name,
    phone: user.phone,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role_name,
    role_display_name: user.role_display_name,
    avatar_color: user.avatar_color,
    status: user.status,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    case_stats: caseStats,
    recent_cases: recentCases,
    schedule_count: scheduleCount,
    feedback: feedbackAvg,
    audit_count_30d: auditCount
  }));
});

router.post('/logout', authMiddleware, (req, res) => {
  const db = getDb();
  logAudit(db, req.user.id, 'LOGOUT', 'user', req.user.id, '用户登出', req);
  res.json(formatResponse(null, '已登出'));
});

router.put('/password', authMiddleware, (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) {
    return res.status(400).json(formatError('请提供旧密码和新密码'));
  }
  if (new_password.length < 6) {
    return res.status(400).json(formatError('新密码长度不能少于6位'));
  }

  const db = getDb();
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(old_password, user.password_hash)) {
    return res.status(401).json(formatError('旧密码错误'));
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

  logAudit(db, req.user.id, 'CHANGE_PASSWORD', 'user', req.user.id, '修改密码', req);
  res.json(formatResponse(null, '密码修改成功'));
});

module.exports = router;
