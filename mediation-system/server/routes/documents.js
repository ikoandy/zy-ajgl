const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/templates', (req, res) => {
  const db = getDb();
  const templates = db.prepare('SELECT * FROM document_templates WHERE status = \'active\' ORDER BY usage_count DESC').all();
  res.json(formatResponse(templates));
});

router.get('/templates/:id', (req, res) => {
  const db = getDb();
  const template = db.prepare('SELECT * FROM document_templates WHERE id = ?').get(req.params.id);
  if (!template) {
    return res.status(404).json(formatError('模板不存在'));
  }
  res.json(formatResponse(template));
});

router.post('/generate', (req, res) => {
  const { template_id, case_id, variables } = req.body;
  if (!template_id || !case_id) {
    return res.status(400).json(formatError('模板ID和案件ID不能为空'));
  }

  const db = getDb();
  const template = db.prepare('SELECT * FROM document_templates WHERE id = ?').get(template_id);
  if (!template) {
    return res.status(404).json(formatError('模板不存在'));
  }

  const caseData = db.prepare(`
    SELECT c.*, ct.name as type_name, u.real_name as mediator_name
    FROM cases c
    LEFT JOIN case_types ct ON c.type_id = ct.id
    LEFT JOIN users u ON c.mediator_id = u.id
    WHERE c.id = ?
  `).get(case_id);
  if (!caseData) {
    return res.status(404).json(formatError('案件不存在'));
  }

  const parties = db.prepare('SELECT * FROM case_parties WHERE case_id = ?').all(case_id);
  const plaintiff = parties.find(p => p.party_type === 'plaintiff');
  const defendant = parties.find(p => p.party_type === 'defendant');

  const defaultVars = {
    year: new Date().getFullYear(),
    caseNumber: caseData.case_number,
    caseTitle: caseData.title,
    partyA: plaintiff ? plaintiff.name : '（甲方）',
    partyB: defendant ? defendant.name : '（乙方）',
    mediator: caseData.mediator_name || '（调解员）',
    date: new Date().toLocaleDateString('zh-CN'),
    orgName: '某某市人民调解委员会',
    ...variables
  };

  let content = template.content_template;
  for (const [key, value] of Object.entries(defaultVars)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }

  const result = db.prepare(`
    INSERT INTO document_records (template_id, case_id, title, content, status, generated_by)
    VALUES (?, ?, ?, ?, 'draft', ?)
  `).run(template_id, case_id, `${template.name} - ${caseData.case_number}`, content, req.user.id);

  db.prepare('UPDATE document_templates SET usage_count = usage_count + 1 WHERE id = ?').run(template_id);

  logAudit(db, req.user.id, 'GENERATE', 'document', result.lastInsertRowid, `生成文书: ${template.name}`, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid, content }, '文书生成成功'));
});

router.get('/records', (req, res) => {
  const { case_id, status, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('dr.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (status) { where.push('dr.status = @status'); params.status = status; }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare(`SELECT COUNT(*) as count FROM document_records dr ${whereClause}`);
  const dataQuery = db.prepare(`
    SELECT dr.*, dt.name as template_name, dt.icon as template_icon, dt.color as template_color,
           c.case_number, u.real_name as generated_by_name
    FROM document_records dr
    LEFT JOIN document_templates dt ON dr.template_id = dt.id
    LEFT JOIN cases c ON dr.case_id = c.id
    LEFT JOIN users u ON dr.generated_by = u.id
    ${whereClause}
    ORDER BY dr.generated_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse(result));
});

router.get('/records/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare(`
    SELECT dr.*, dt.name as template_name, c.case_number, c.title as case_title,
           u.real_name as generated_by_name, r.real_name as reviewed_by_name
    FROM document_records dr
    LEFT JOIN document_templates dt ON dr.template_id = dt.id
    LEFT JOIN cases c ON dr.case_id = c.id
    LEFT JOIN users u ON dr.generated_by = u.id
    LEFT JOIN users r ON dr.reviewed_by = r.id
    WHERE dr.id = ?
  `).get(req.params.id);

  if (!record) {
    return res.status(404).json(formatError('文书记录不存在'));
  }
  res.json(formatResponse(record));
});

router.put('/records/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['draft', 'reviewing', 'approved', 'issued'].includes(status)) {
    return res.status(400).json(formatError('无效的状态'));
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM document_records WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('文书记录不存在'));
  }

  if (status === 'reviewing' || status === 'approved') {
    db.prepare('UPDATE document_records SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.user.id, req.params.id);
  } else {
    db.prepare('UPDATE document_records SET status = ? WHERE id = ?').run(status, req.params.id);
  }

  logAudit(db, req.user.id, 'UPDATE_STATUS', 'document', req.params.id, `文书状态变更为: ${status}`, req);
  res.json(formatResponse(null, '文书状态更新成功'));
});

module.exports = router;
