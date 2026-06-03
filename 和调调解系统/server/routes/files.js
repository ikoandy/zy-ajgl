const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

const UPLOAD_DIR = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = path.join(UPLOAD_DIR, req.params.type || 'general');
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.mp3', '.mp4', '.wav', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`不支持的文件类型: ${ext}`));
  }
});

router.get('/search', (req, res) => {
  const { keyword, modules, page = 1, pageSize = 20 } = req.query;
  if (!keyword) return res.status(400).json(formatError('搜索关键词不能为空'));

  const db = getDb();
  const like = `%${keyword}%`;
  const activeModules = modules ? modules.split(',') : ['cases', 'archives', 'documents', 'users'];
  const results = [];

  if (activeModules.includes('cases')) {
    const cases = db.prepare(`
      SELECT c.id, c.case_number, c.title, c.status, c.created_at, 'case' as module,
             ct.name as type_name, u.real_name as mediator_name
      FROM cases c LEFT JOIN case_types ct ON c.type_id = ct.id LEFT JOIN users u ON c.mediator_id = u.id
      WHERE c.case_number LIKE ? OR c.title LIKE ? OR c.description LIKE ?
      LIMIT 10
    `).all(like, like, like);
    results.push(...cases);
  }

  if (activeModules.includes('archives')) {
    const archives = db.prepare(`
      SELECT a.id, a.title, a.status, a.created_at, 'archive' as module,
             ac.name as category_name
      FROM archives a LEFT JOIN archive_categories ac ON a.category_id = ac.id
      WHERE a.title LIKE ? OR a.description LIKE ?
      LIMIT 10
    `).all(like, like);
    results.push(...archives);
  }

  if (activeModules.includes('documents')) {
    const docs = db.prepare(`
      SELECT dr.id, dr.title, dr.status, dr.generated_at as created_at, 'document' as module,
             dt.name as template_name, c.case_number
      FROM document_records dr
      LEFT JOIN document_templates dt ON dr.template_id = dt.id
      LEFT JOIN cases c ON dr.case_id = c.id
      WHERE dr.title LIKE ? OR dr.content LIKE ?
      LIMIT 10
    `).all(like, like);
    results.push(...docs);
  }

  if (activeModules.includes('users')) {
    const users = db.prepare(`
      SELECT u.id, u.real_name as title, u.status, u.created_at, 'user' as module,
             r.display_name as role_display_name
      FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.real_name LIKE ? OR u.username LIKE ? OR u.phone LIKE ?
      LIMIT 10
    `).all(like, like, like);
    results.push(...users);
  }

  const total = results.length;
  const start = (page - 1) * pageSize;
  const paged = results.slice(start, start + parseInt(pageSize));

  res.json(formatResponse({
    data: paged,
    pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) },
    keyword
  }));
});

router.post('/:type', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json(formatError('未上传文件'));
  }

  const files = req.files.map(f => ({
    original_name: f.originalname,
    stored_name: f.filename,
    path: f.path,
    size: f.size,
    mimetype: f.mimetype
  }));

  logAudit(getDb(), req.user.id, 'UPLOAD', 'file', null, `上传${files.length}个文件`, req);
  res.status(201).json(formatResponse(files, '文件上传成功'));
});

router.get('/download/:type/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.type, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json(formatError('文件不存在'));
  }
  res.download(filePath);
});

module.exports = router;
