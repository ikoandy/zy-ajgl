const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { type, is_read, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = ['n.user_id = @user_id'];
  let params = { user_id: req.user.id };
  if (type) { where.push('n.type = @type'); params.type = type; }
  if (is_read !== undefined) { where.push('n.is_read = @is_read'); params.is_read = parseInt(is_read); }

  const whereClause = 'WHERE ' + where.join(' AND ');

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM notifications n ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT n.* FROM notifications n ${whereClause}
    ORDER BY n.created_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/unread-count', (req, res) => {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).count;
  res.json(formatResponse({ count }));
});

router.put('/:id/read', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json(formatResponse(null, '已标记为已读'));
});

router.put('/read-all', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json(formatResponse(null, '已全部标记为已读'));
});

router.post('/', (req, res) => {
  const { user_id, type, title, content, link } = req.body;
  if (!user_id || !type || !title || !content) {
    return res.status(400).json(formatError('用户ID、类型、标题和内容不能为空'));
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)'
  ).run(user_id, type, title, content, link || null);

  logAudit(db, req.user.id, 'SEND', 'notification', result.lastInsertRowid, `发送通知: ${title}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '通知发送成功'));
});

router.post('/broadcast', (req, res) => {
  const { type, title, content, link, role_id } = req.body;
  if (!type || !title || !content) {
    return res.status(400).json(formatError('类型、标题和内容不能为空'));
  }

  const db = getDb();
  let users;
  if (role_id) {
    users = db.prepare('SELECT id FROM users WHERE role_id = ? AND status = \'active\'').all(role_id);
  } else {
    users = db.prepare('SELECT id FROM users WHERE status = \'active\'').all();
  }

  const insert = db.prepare('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)');
  const insertMany = db.transaction((rows) => {
    for (const u of rows) insert.run(u.id, type, title, content, link || null);
  });
  insertMany(users);

  logAudit(db, req.user.id, 'BROADCAST', 'notification', null, `群发通知: ${title} (${users.length}人)`, req);
  res.status(201).json(formatResponse({ sent_count: users.length }, '群发通知成功'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json(formatResponse(null, '通知删除成功'));
});

module.exports = router;
