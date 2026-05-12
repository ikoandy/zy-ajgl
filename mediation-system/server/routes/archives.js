const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/categories', (req, res) => {
  const db = getDb();
  const categories = db.prepare(`
    SELECT ac.*, COUNT(a.id) as archive_count,
           (SELECT COUNT(*) FROM archive_files af WHERE af.archive_id IN (SELECT id FROM archives WHERE category_id = ac.id)) as file_count
    FROM archive_categories ac LEFT JOIN archives a ON ac.id = a.category_id
    GROUP BY ac.id ORDER BY ac.sort_order
  `).all();
  res.json(formatResponse(categories));
});

router.get('/', (req, res) => {
  const { category_id, case_id, status, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (category_id) { where.push('a.category_id = @category_id'); params.category_id = parseInt(category_id); }
  if (case_id) { where.push('a.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (status) { where.push('a.status = @status'); params.status = status; }
  if (search) { where.push('(a.title LIKE @search OR a.description LIKE @search)'); params.search = `%${search}%`; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM archives a ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT a.*, ac.name as category_name, ac.icon as category_icon, ac.color as category_color,
           c.case_number, u.real_name as created_by_name
    FROM archives a
    LEFT JOIN archive_categories ac ON a.category_id = ac.id
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users u ON a.created_by = u.id
    ${whereClause}
    ORDER BY a.updated_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));

  const archivesWithFiles = result.data.map(a => {
    const files = db.prepare('SELECT * FROM archive_files WHERE archive_id = ? ORDER BY created_at DESC').all(a.id);
    const fileCount = files.length;
    const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0);
    return { ...a, file_count: fileCount, total_size: totalSize, files };
  });

  res.json(formatResponse({ data: archivesWithFiles, pagination: result.pagination }));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const archive = db.prepare(`
    SELECT a.*, ac.name as category_name, ac.icon as category_icon, ac.color as category_color,
           c.case_number, u.real_name as created_by_name
    FROM archives a
    LEFT JOIN archive_categories ac ON a.category_id = ac.id
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users u ON a.created_by = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!archive) {
    return res.status(404).json(formatError('档案不存在'));
  }

  const files = db.prepare('SELECT * FROM archive_files WHERE archive_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(formatResponse({ ...archive, files }));
});

router.post('/', (req, res) => {
  const { category_id, case_id, title, description } = req.body;
  if (!category_id || !title) {
    return res.status(400).json(formatError('分类和标题不能为空'));
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO archives (category_id, case_id, title, description, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(category_id, case_id || null, title, description || '', req.user.id);

  logAudit(db, req.user.id, 'CREATE', 'archive', result.lastInsertRowid, `创建档案: ${title}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '档案创建成功'));
});

router.put('/:id', (req, res) => {
  const { category_id, title, description, status } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('档案不存在'));
  }

  db.prepare(
    'UPDATE archives SET category_id = COALESCE(?, category_id), title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(category_id, title, description, status, req.params.id);

  logAudit(db, req.user.id, 'UPDATE', 'archive', req.params.id, `更新档案: ${existing.title}`, req);
  res.json(formatResponse(null, '档案更新成功'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('档案不存在'));
  }

  db.prepare('DELETE FROM archives WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'archive', req.params.id, `删除档案: ${existing.title}`, req);
  res.json(formatResponse(null, '档案删除成功'));
});

router.post('/:id/files', (req, res) => {
  const { file_name, file_path, file_size, file_type } = req.body;
  if (!file_name || !file_path) {
    return res.status(400).json(formatError('文件名和路径不能为空'));
  }

  const db = getDb();
  const archive = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!archive) {
    return res.status(404).json(formatError('档案不存在'));
  }

  const result = db.prepare(
    'INSERT INTO archive_files (archive_id, file_name, file_path, file_size, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.id, file_name, file_path, file_size, file_type, req.user.id);

  db.prepare('UPDATE archives SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'UPLOAD_FILE', 'archive', req.params.id, `上传文件: ${file_name}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '文件上传成功'));
});

router.delete('/:archiveId/files/:fileId', (req, res) => {
  const db = getDb();
  const file = db.prepare('SELECT * FROM archive_files WHERE id = ? AND archive_id = ?').get(req.params.fileId, req.params.archiveId);
  if (!file) {
    return res.status(404).json(formatError('文件不存在'));
  }

  db.prepare('DELETE FROM archive_files WHERE id = ?').run(req.params.fileId);
  logAudit(db, req.user.id, 'DELETE_FILE', 'archive', req.params.archiveId, `删除文件: ${file.file_name}`, req);
  res.json(formatResponse(null, '文件删除成功'));
});

module.exports = router;
