const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

const ARCHIVE_UPLOAD_DIR = path.join(__dirname, '..', 'data', 'uploads', 'archives');
if (!fs.existsSync(ARCHIVE_UPLOAD_DIR)) {
  fs.mkdirSync(ARCHIVE_UPLOAD_DIR, { recursive: true });
}

const archiveStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = path.join(ARCHIVE_UPLOAD_DIR, String(req.params.id || 'general'));
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

var archiveUpload = multer({
  storage: archiveStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    var allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.mp3', '.mp4', '.wav', '.avi', '.zip', '.rar', '.7z', '.txt', '.csv', '.md', '.html', '.xml', '.json'];
    var ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('不支持的文件类型: ' + ext));
  }
});

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

router.post('/categories', (req, res) => {
  const { name, icon, color, description, sort_order } = req.body;
  if (!name) {
    return res.status(400).json(formatError('分类名称不能为空'));
  }
  const db = getDb();
  try {
    const result = db.prepare(
      'INSERT INTO archive_categories (name, icon, color, description, sort_order) VALUES (?, ?, ?, ?, ?)'
    ).run(name, icon || 'folder', color || '#c9a84c', description || '', sort_order || 0);
    logAudit(db, req.user.id, 'CREATE', 'archive_category', result.lastInsertRowid, `创建档案分类: ${name}`, req);
    res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '分类创建成功'));
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json(formatError('分类名称已存在'));
    }
    throw err;
  }
});

router.put('/categories/:id', (req, res) => {
  const { name, icon, color, description, sort_order } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM archive_categories WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('分类不存在'));
  }
  db.prepare(
    'UPDATE archive_categories SET name = COALESCE(?, name), icon = COALESCE(?, icon), color = COALESCE(?, color), description = COALESCE(?, description), sort_order = COALESCE(?, sort_order) WHERE id = ?'
  ).run(name, icon, color, description, sort_order, req.params.id);
  logAudit(db, req.user.id, 'UPDATE', 'archive_category', req.params.id, `更新档案分类: ${existing.name}`, req);
  res.json(formatResponse(null, '分类更新成功'));
});

router.delete('/categories/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM archive_categories WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('分类不存在'));
  }
  const archiveCount = db.prepare('SELECT COUNT(*) as count FROM archives WHERE category_id = ?').get(req.params.id).count;
  if (archiveCount > 0) {
    return res.status(400).json(formatError(`该分类下有 ${archiveCount} 个档案，无法删除`));
  }
  db.prepare('DELETE FROM archive_categories WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'archive_category', req.params.id, `删除档案分类: ${existing.name}`, req);
  res.json(formatResponse(null, '分类删除成功'));
});

router.get('/stats', (req, res) => {
  const db = getDb();
  const totalArchives = db.prepare('SELECT COUNT(*) as count FROM archives').get().count;
  const activeCount = db.prepare("SELECT COUNT(*) as count FROM archives WHERE status = 'active'").get().count;
  const archivedCount = db.prepare("SELECT COUNT(*) as count FROM archives WHERE status = 'archived'").get().count;
  const destroyedCount = db.prepare("SELECT COUNT(*) as count FROM archives WHERE status = 'destroyed'").get().count;
  const transferredCount = db.prepare("SELECT COUNT(*) as count FROM archives WHERE status = 'transferred'").get().count;
  const pendingReview = db.prepare("SELECT COUNT(*) as count FROM archives WHERE review_status = 'pending'").get().count;
  const totalFiles = db.prepare('SELECT COUNT(*) as count FROM archive_files').get().count;
  const totalSize = db.prepare('SELECT COALESCE(SUM(file_size), 0) as total FROM archive_files').get().total;
  const categoryStats = db.prepare(`
    SELECT ac.name, ac.color, COUNT(a.id) as count
    FROM archive_categories ac LEFT JOIN archives a ON ac.id = a.category_id
    GROUP BY ac.id ORDER BY count DESC
  `).all();
  const confidentialityStats = db.prepare(`
    SELECT confidentiality_level, COUNT(*) as count FROM archives GROUP BY confidentiality_level
  `).all();
  const retentionStats = db.prepare(`
    SELECT retention_period, COUNT(*) as count FROM archives GROUP BY retention_period
  `).all();

  res.json(formatResponse({
    total: totalArchives,
    active: activeCount,
    archived: archivedCount,
    destroyed: destroyedCount,
    transferred: transferredCount,
    pendingReview,
    totalFiles,
    totalSize,
    categoryStats,
    confidentialityStats,
    retentionStats
  }));
});

router.get('/', (req, res) => {
  const { category_id, case_id, status, confidentiality_level, retention_period, review_status, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (category_id) { where.push('a.category_id = @category_id'); params.category_id = parseInt(category_id); }
  if (case_id) { where.push('a.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (status) { where.push('a.status = @status'); params.status = status; }
  if (confidentiality_level) { where.push('a.confidentiality_level = @confidentiality_level'); params.confidentiality_level = confidentiality_level; }
  if (retention_period) { where.push('a.retention_period = @retention_period'); params.retention_period = retention_period; }
  if (review_status) { where.push('a.review_status = @review_status'); params.review_status = review_status; }
  if (search) { where.push('(a.title LIKE @search OR a.archive_number LIKE @search OR a.description LIKE @search OR a.tags LIKE @search)'); params.search = `%${search}%`; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM archives a ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT a.*, ac.name as category_name, ac.icon as category_icon, ac.color as category_color,
           c.case_number, c.title as case_title,
           u.real_name as created_by_name,
           ru.real_name as reviewed_by_name
    FROM archives a
    LEFT JOIN archive_categories ac ON a.category_id = ac.id
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users u ON a.created_by = u.id
    LEFT JOIN users ru ON a.reviewed_by = ru.id
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
           c.case_number, c.title as case_title, c.status as case_status, c.priority as case_priority,
           u.real_name as created_by_name,
           ru.real_name as reviewed_by_name
    FROM archives a
    LEFT JOIN archive_categories ac ON a.category_id = ac.id
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users u ON a.created_by = u.id
    LEFT JOIN users ru ON a.reviewed_by = ru.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!archive) {
    return res.status(404).json(formatError('档案不存在'));
  }

  const files = db.prepare('SELECT af.*, u.real_name as uploaded_by_name FROM archive_files af LEFT JOIN users u ON af.uploaded_by = u.id WHERE af.archive_id = ? ORDER BY af.created_at DESC').all(req.params.id);

  let caseParties = [];
  if (archive.case_id) {
    caseParties = db.prepare('SELECT * FROM case_parties WHERE case_id = ?').all(archive.case_id);
  }

  let caseFinance = null;
  if (archive.case_id) {
    caseFinance = db.prepare('SELECT * FROM case_finance WHERE case_id = ?').get(archive.case_id);
  }

  res.json(formatResponse({ ...archive, files, caseParties, caseFinance }));
});

function generateArchiveNumber(db) {
  const now = new Date();
  const year = now.getFullYear();
  const count = db.prepare('SELECT COUNT(*) as count FROM archives WHERE archive_number LIKE ?').get(`DA${year}%`).count;
  const seq = String(count + 1).padStart(4, '0');
  return `DA${year}${seq}`;
}

router.post('/', (req, res) => {
  const { category_id, case_id, title, description, status, confidentiality_level, retention_period, archive_date, tags, storage_location, total_pages, responsible_person } = req.body;
  if (!category_id || !title) {
    return res.status(400).json(formatError('分类和标题不能为空'));
  }

  const db = getDb();
  const archive_number = generateArchiveNumber(db);

  const result = db.prepare(
    `INSERT INTO archives (archive_number, category_id, case_id, title, description, status, confidentiality_level, retention_period, archive_date, tags, storage_location, total_pages, responsible_person, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(archive_number, category_id, case_id || null, title, description || '',
    status || 'active', confidentiality_level || 'internal', retention_period || 'long-term',
    archive_date || null, tags || null, storage_location || null, total_pages || 0,
    responsible_person || null, req.user.id);

  logAudit(db, req.user.id, 'CREATE', 'archive', result.lastInsertRowid, `创建档案: ${title}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid, archive_number }, '档案创建成功'));
});

router.put('/:id', (req, res) => {
  const { category_id, title, description, status, confidentiality_level, retention_period, archive_date, tags, storage_location, total_pages, responsible_person, review_status } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('档案不存在'));
  }

  db.prepare(
    `UPDATE archives SET category_id = COALESCE(?, category_id), title = COALESCE(?, title),
     description = COALESCE(?, description), status = COALESCE(?, status),
     confidentiality_level = COALESCE(?, confidentiality_level), retention_period = COALESCE(?, retention_period),
     archive_date = COALESCE(?, archive_date), tags = COALESCE(?, tags),
     storage_location = COALESCE(?, storage_location), total_pages = COALESCE(?, total_pages),
     responsible_person = COALESCE(?, responsible_person), review_status = COALESCE(?, review_status),
     updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(category_id, title, description, status, confidentiality_level, retention_period,
    archive_date, tags, storage_location, total_pages, responsible_person, review_status, req.params.id);

  logAudit(db, req.user.id, 'UPDATE', 'archive', req.params.id, `更新档案: ${existing.title}`, req);
  res.json(formatResponse(null, '档案更新成功'));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('档案不存在'));
  }

  db.prepare('DELETE FROM archive_files WHERE archive_id = ?').run(req.params.id);
  db.prepare('DELETE FROM archives WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'archive', req.params.id, `删除档案: ${existing.title}`, req);
  res.json(formatResponse(null, '档案删除成功'));
});

router.post('/batch/delete', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(formatError('请选择要删除的档案'));
  }
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM archive_files WHERE archive_id IN (${placeholders})`).run(...ids);
  const result = db.prepare(`DELETE FROM archives WHERE id IN (${placeholders})`).run(...ids);
  logAudit(db, req.user.id, 'BATCH_DELETE', 'archive', null, `批量删除 ${result.changes} 个档案`, req);
  res.json(formatResponse({ deleted: result.changes }, `成功删除 ${result.changes} 个档案`));
});

router.post('/batch/archive', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(formatError('请选择要归档的档案'));
  }
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`UPDATE archives SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders}) AND status = 'active'`).run(...ids);
  logAudit(db, req.user.id, 'BATCH_ARCHIVE', 'archive', null, `批量归档 ${result.changes} 个档案`, req);
  res.json(formatResponse({ archived: result.changes }, `成功归档 ${result.changes} 个档案`));
});

router.post('/batch/transfer', (req, res) => {
  const { ids, category_id } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json(formatError('请选择要转移的档案'));
  }
  if (!category_id) {
    return res.status(400).json(formatError('请指定目标分类'));
  }
  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`UPDATE archives SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(category_id, ...ids);
  logAudit(db, req.user.id, 'BATCH_TRANSFER', 'archive', null, `批量转移 ${result.changes} 个档案到分类 ${category_id}`, req);
  res.json(formatResponse({ transferred: result.changes }, `成功转移 ${result.changes} 个档案`));
});

router.post('/:id/review', (req, res) => {
  const { review_status, comment } = req.body;
  if (!review_status || !['approved', 'rejected'].includes(review_status)) {
    return res.status(400).json(formatError('审核状态无效'));
  }
  const db = getDb();
  const existing = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('档案不存在'));
  }
  db.prepare(
    'UPDATE archives SET review_status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(review_status, req.user.id, req.params.id);
  logAudit(db, req.user.id, 'REVIEW', 'archive', req.params.id, `审核档案: ${existing.title} → ${review_status}${comment ? ' (' + comment + ')' : ''}`, req);
  res.json(formatResponse(null, review_status === 'approved' ? '档案审核通过' : '档案审核驳回'));
});

router.post('/:id/files', archiveUpload.array('files', 20), (req, res) => {
  var db = getDb();
  var archive = db.prepare('SELECT * FROM archives WHERE id = ?').get(req.params.id);
  if (!archive) {
    return res.status(404).json(formatError('档案不存在'));
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json(formatError('未上传文件'));
  }

  var inserted = [];
  var insertStmt = db.prepare(
    'INSERT INTO archive_files (archive_id, file_name, file_path, file_size, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (var i = 0; i < req.files.length; i++) {
    var f = req.files[i];
    var ext = path.extname(f.originalname).toLowerCase().replace('.', '');
    var result = insertStmt.run(
      req.params.id,
      f.originalname,
      f.path,
      f.size,
      ext,
      req.user.id
    );
    inserted.push({ id: result.lastInsertRowid, file_name: f.originalname, file_size: f.size, file_type: ext });
  }

  db.prepare('UPDATE archives SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'UPLOAD_FILE', 'archive', req.params.id, `上传${inserted.length}个文件到档案: ${archive.title}`, req);
  res.status(201).json(formatResponse({ files: inserted, count: inserted.length }, `${inserted.length}个文件上传成功`));
});

router.delete('/:archiveId/files/:fileId', (req, res) => {
  const db = getDb();
  const file = db.prepare('SELECT * FROM archive_files WHERE id = ? AND archive_id = ?').get(req.params.fileId, req.params.archiveId);
  if (!file) {
    return res.status(404).json(formatError('文件不存在'));
  }

  if (file.file_path && fs.existsSync(file.file_path)) {
    try { fs.unlinkSync(file.file_path); } catch (e) {}
  }

  db.prepare('DELETE FROM archive_files WHERE id = ?').run(req.params.fileId);
  logAudit(db, req.user.id, 'DELETE_FILE', 'archive', req.params.archiveId, `删除文件: ${file.file_name}`, req);
  res.json(formatResponse(null, '文件删除成功'));
});

router.get('/:archiveId/files/:fileId/download', (req, res) => {
  var db = getDb();
  var file = db.prepare('SELECT * FROM archive_files WHERE id = ? AND archive_id = ?').get(req.params.fileId, req.params.archiveId);
  if (!file) {
    return res.status(404).json(formatError('文件不存在'));
  }

  if (!file.file_path || !fs.existsSync(file.file_path)) {
    return res.status(404).json(formatError('文件在服务器上不存在'));
  }

  res.download(file.file_path, file.file_name);
});

router.get('/export/all', (req, res) => {
  const db = getDb();
  const { category_id, status, confidentiality_level, retention_period } = req.query;
  let where = [];
  let params = [];
  if (category_id) { where.push('a.category_id = ?'); params.push(parseInt(category_id)); }
  if (status) { where.push('a.status = ?'); params.push(status); }
  if (confidentiality_level) { where.push('a.confidentiality_level = ?'); params.push(confidentiality_level); }
  if (retention_period) { where.push('a.retention_period = ?'); params.push(retention_period); }
  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const archives = db.prepare(`
    SELECT a.archive_number, a.title, a.description, a.status, a.confidentiality_level,
           a.retention_period, a.archive_date, a.tags, a.storage_location, a.total_pages,
           a.responsible_person, a.review_status, a.created_at,
           ac.name as category_name, c.case_number, u.real_name as created_by_name
    FROM archives a
    LEFT JOIN archive_categories ac ON a.category_id = ac.id
    LEFT JOIN cases c ON a.case_id = c.id
    LEFT JOIN users u ON a.created_by = u.id
    ${whereClause}
    ORDER BY a.created_at DESC
  `).all(...params);

  res.json(formatResponse(archives));
});

module.exports = router;
