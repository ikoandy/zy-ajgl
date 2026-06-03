const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { paginate, formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/templates', (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let sql = 'SELECT * FROM document_templates';
  if (status) {
    sql += " WHERE status = '" + status + "'";
  } else {
    sql += " WHERE status = 'active'";
  }
  sql += ' ORDER BY usage_count DESC';
  const templates = db.prepare(sql).all();
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

router.post('/templates', (req, res) => {
  const { name, code, description, content_template, icon, color } = req.body;
  if (!name || !code || !content_template) {
    return res.status(400).json(formatError('模板名称、代码和内容不能为空'));
  }
  const db = getDb();
  try {
    const result = db.prepare(
      'INSERT INTO document_templates (name, code, description, content_template, icon, color, usage_count, status) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
    ).run(name, code, description || '', content_template, icon || 'description', color || '#c9a84c', 'active');
    logAudit(db, req.user.id, 'CREATE', 'document_template', result.lastInsertRowid, '创建文书模板: ' + name, req);
    res.status(201).json(formatResponse({ id: result.lastInsertRowid }, '模板创建成功'));
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json(formatError('模板名称或代码已存在'));
    }
    throw err;
  }
});

router.put('/templates/:id', (req, res) => {
  const { name, description, content_template, icon, color, status } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM document_templates WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('模板不存在'));
  }
  db.prepare(
    `UPDATE document_templates SET name = COALESCE(?, name), description = COALESCE(?, description),
     content_template = COALESCE(?, content_template), icon = COALESCE(?, icon),
     color = COALESCE(?, color), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(name, description, content_template, icon, color, status, req.params.id);
  logAudit(db, req.user.id, 'UPDATE', 'document_template', req.params.id, '更新文书模板: ' + (name || existing.name), req);
  res.json(formatResponse(null, '模板更新成功'));
});

router.delete('/templates/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM document_templates WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('模板不存在'));
  }
  db.prepare("UPDATE document_templates SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'document_template', req.params.id, '停用文书模板: ' + existing.name, req);
  res.json(formatResponse(null, '模板已停用'));
});

router.post('/generate', (req, res) => {
  const { template_id, case_id, variables, title } = req.body;
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

  const finance = db.prepare('SELECT * FROM case_finance WHERE case_id = ?').get(case_id);

  const orgSetting = db.prepare("SELECT value FROM settings WHERE key = 'org_name'").get();

  const defaultVars = {
    year: new Date().getFullYear(),
    caseNumber: caseData.case_number,
    caseTitle: caseData.title,
    partyA: plaintiff ? plaintiff.name : '（甲方）',
    partyB: defendant ? defendant.name : '（乙方）',
    partyAPhone: plaintiff ? (plaintiff.phone || plaintiff.contact || '') : '',
    partyBPhone: defendant ? (defendant.phone || defendant.contact || '') : '',
    partyAAddress: plaintiff ? (plaintiff.address || '') : '',
    partyBAddress: defendant ? (defendant.address || '') : '',
    mediator: caseData.mediator_name || '（调解员）',
    date: new Date().toLocaleDateString('zh-CN'),
    orgName: orgSetting ? orgSetting.value : '某某市人民调解委员会',
    caseType: caseData.type_name || '',
    loanAmount: finance ? (finance.loan_amount || '') : '',
    loanBalance: finance ? (finance.outstanding_balance || '') : '',
    interestRate: finance ? (finance.interest_rate || '') : '',
    loanStartDate: finance ? (finance.loan_start_date || '') : '',
    loanEndDate: finance ? (finance.loan_end_date || '') : '',
    partyName: plaintiff ? plaintiff.name : '（当事人）',
    oppositeParty: defendant ? defendant.name : '（对方当事人）',
    applicant: plaintiff ? plaintiff.name : '（申请人）',
    ...variables
  };

  let content = template.content_template;
  for (const [key, value] of Object.entries(defaultVars)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  content = content.replace(/\{\{[^}]+\}\}/g, '__________');

  const docTitle = title || (template.name + ' - ' + caseData.case_number);

  const result = db.prepare(`
    INSERT INTO document_records (template_id, case_id, title, content, status, generated_by)
    VALUES (?, ?, ?, ?, 'draft', ?)
  `).run(template_id, case_id, docTitle, content, req.user.id);

  db.prepare('UPDATE document_templates SET usage_count = usage_count + 1 WHERE id = ?').run(template_id);

  logAudit(db, req.user.id, 'GENERATE', 'document', result.lastInsertRowid, '生成文书: ' + docTitle, req);
  res.status(201).json(formatResponse({ id: result.lastInsertRowid, content, title: docTitle }, '文书生成成功'));
});

router.get('/records', (req, res) => {
  const { case_id, status, search, page = 1, pageSize = 20 } = req.query;
  const db = getDb();

  let where = [];
  let params = {};
  if (case_id) { where.push('dr.case_id = @case_id'); params.case_id = parseInt(case_id); }
  if (status) { where.push('dr.status = @status'); params.status = status; }
  if (search) {
    where.push('(dr.title LIKE @search OR dr.content LIKE @search)');
    params.search = '%' + search + '%';
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countQuery = db.prepare('SELECT COUNT(*) as count FROM document_records dr ' + whereClause);
  const dataQuery = db.prepare(`
    SELECT dr.*, dt.name as template_name, dt.icon as template_icon, dt.color as template_color,
           c.case_number, c.title as case_title, u.real_name as generated_by_name
    FROM document_records dr
    LEFT JOIN document_templates dt ON dr.template_id = dt.id
    LEFT JOIN cases c ON dr.case_id = c.id
    LEFT JOIN users u ON dr.generated_by = u.id
    ${whereClause}
    ORDER BY dr.generated_at DESC LIMIT @limit OFFSET @offset
  `);

  const result = paginate(dataQuery, countQuery, params, parseInt(page), parseInt(pageSize));
  res.json(formatResponse({ data: result.data, pagination: result.pagination }));
});

router.get('/records/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare(`
    SELECT dr.*, dt.name as template_name, dt.icon as template_icon, dt.color as template_color,
           c.case_number, c.title as case_title,
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

router.put('/records/:id', (req, res) => {
  const { title, content } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM document_records WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('文书记录不存在'));
  }
  db.prepare(
    'UPDATE document_records SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?'
  ).run(title, content, req.params.id);
  logAudit(db, req.user.id, 'UPDATE', 'document', req.params.id, '编辑文书: ' + (title || existing.title), req);
  res.json(formatResponse(null, '文书更新成功'));
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

  const statusLabels = { draft: '草稿', reviewing: '审核中', approved: '已审核', issued: '已签发' };
  logAudit(db, req.user.id, 'UPDATE_STATUS', 'document', req.params.id, '文书状态变更为: ' + (statusLabels[status] || status), req);
  res.json(formatResponse(null, '文书状态更新成功'));
});

router.delete('/records/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM document_records WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json(formatError('文书记录不存在'));
  }
  db.prepare('DELETE FROM document_records WHERE id = ?').run(req.params.id);
  logAudit(db, req.user.id, 'DELETE', 'document', req.params.id, '删除文书: ' + existing.title, req);
  res.json(formatResponse(null, '文书删除成功'));
});

router.get('/records/:id/export', (req, res) => {
  const db = getDb();
  const record = db.prepare(`
    SELECT dr.*, dt.name as template_name, c.case_number
    FROM document_records dr
    LEFT JOIN document_templates dt ON dr.template_id = dt.id
    LEFT JOIN cases c ON dr.case_id = c.id
    WHERE dr.id = ?
  `).get(req.params.id);

  if (!record) {
    return res.status(404).json(formatError('文书记录不存在'));
  }

  var htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${record.title}</title>
<style>
  body { font-family: SimSun, 'Noto Serif SC', serif; font-size: 14px; line-height: 2; color: #000; max-width: 700px; margin: 40px auto; padding: 20px; }
  h1 { text-align: center; font-size: 22px; font-weight: 700; margin-bottom: 20px; letter-spacing: 4px; }
  .doc-number { text-align: center; font-size: 13px; color: #555; margin-bottom: 24px; }
  .doc-body { white-space: pre-wrap; word-wrap: break-word; }
  .sign-area { margin-top: 40px; }
  .sign-line { display: flex; justify-content: space-between; margin: 16px 0; }
  .sign-item { min-width: 200px; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<div class="doc-body">${record.content.replace(/\n/g, '<br>')}</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="' + encodeURIComponent(record.title) + '.html"');
  res.send(htmlContent);
});

module.exports = router;
