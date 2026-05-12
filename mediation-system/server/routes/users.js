const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/', roleMiddleware('super_admin', 'org_admin'), (req, res) => {
  const { role_id, status, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (role_id) { where.push('u.role_id = @role_id'); params.role_id = parseInt(role_id); }
  if (status) { where.push('u.status = @status'); params.status = status; }
  if (search) { where.push('(u.username LIKE @search OR u.real_name LIKE @search OR u.phone LIKE @search)'); params.search = `%${search}%`; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM users u ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT u.id, u.username, u.real_name, u.phone, u.email, u.role_id, u.avatar_color,
           u.status, u.last_login_at, u.created_at, u.updated_at,
           r.name as role_name, r.display_name as role_display_name
    FROM users u JOIN roles r ON u.role_id = r.id ${whereClause}
    ORDER BY u.id LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.id, u.username, u.real_name, u.phone, u.email, u.role_id, u.avatar_color,
           u.status, u.last_login_at, u.created_at,
           r.name as role_name, r.display_name as role_display_name
    FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?
  `).get(req.params.id);

  if (!user) return res.status(404).json(formatError('用户不存在'));
  res.json(formatResponse(user));
});

router.post('/', roleMiddleware('super_admin', 'org_admin'), (req, res) => {
  const { username, password, real_name, phone, email, role_id, avatar_color } = req.body;
  if (!username || !password || !real_name || !role_id) {
    return res.status(400).json(formatError('用户名、密码、姓名和角色不能为空'));
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json(formatError('用户名已存在'));
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, real_name, phone, email, role_id, avatar_color) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(username, passwordHash, real_name, phone || null, email || null, role_id, avatar_color || '#c9a84c');

  logAudit(db, req.user.id, 'CREATE', 'user', result.lastInsertRowid, `创建用户: ${username}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '用户创建成功'));
});

router.put('/:id', roleMiddleware('super_admin', 'org_admin'), (req, res) => {
  const { real_name, phone, email, role_id, avatar_color, status, password } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('用户不存在'));

  const updates = [];
  const values = [];
  if (real_name !== undefined) { updates.push('real_name = ?'); values.push(real_name); }
  if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
  if (email !== undefined) { updates.push('email = ?'); values.push(email); }
  if (role_id !== undefined) { updates.push('role_id = ?'); values.push(role_id); }
  if (avatar_color !== undefined) { updates.push('avatar_color = ?'); values.push(avatar_color); }
  if (status !== undefined) { updates.push('status = ?'); values.push(status); }
  if (password) {
    updates.push('password_hash = ?');
    values.push(bcrypt.hashSync(password, 10));
  }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  logAudit(db, req.user.id, 'UPDATE', 'user', req.params.id, `更新用户: ${existing.username}`, req);
  res.json(formatResponse(null, '用户更新成功'));
});

router.delete('/:id', roleMiddleware('super_admin'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json(formatError('用户不存在'));
  if (existing.id === req.user.id) return res.status(400).json(formatError('不能删除自己'));

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run('inactive', req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'user', req.params.id, `禁用用户: ${existing.username}`, req);
  res.json(formatResponse(null, '用户已禁用'));
});

router.get('/roles/list', (req, res) => {
  const db = getDb();
  const roles = db.prepare('SELECT * FROM roles ORDER BY id').all();
  res.json(formatResponse(roles));
});

module.exports = router;
