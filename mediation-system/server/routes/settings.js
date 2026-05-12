const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { formatResponse, formatError, logAudit } = require('../utils/helpers');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const { category } = req.query;
  const db = getDb();

  let settings;
  if (category) {
    settings = db.prepare('SELECT * FROM settings WHERE category = ? ORDER BY id').all(category);
  } else {
    settings = db.prepare('SELECT * FROM settings ORDER BY category, id').all();
  }

  const grouped = {};
  for (const s of settings) {
    if (!grouped[s.category]) grouped[s.category] = {};
    let value = s.value;
    if (s.value_type === 'boolean') value = value === 'true';
    else if (s.value_type === 'number') value = parseFloat(value);
    else if (s.value_type === 'json') { try { value = JSON.parse(value); } catch (e) {} }
    grouped[s.category][s.key] = { value, type: s.value_type, description: s.description };
  }

  res.json(formatResponse(grouped));
});

router.put('/', roleMiddleware('super_admin', 'org_admin'), (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json(formatError('设置数据格式错误'));
  }

  const db = getDb();
  const updateStmt = db.prepare(
    'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE category = ? AND key = ?'
  );

  const updateMany = db.transaction((items) => {
    for (const [category, keys] of Object.entries(items)) {
      for (const [key, value] of Object.entries(keys)) {
        let strValue = value;
        if (typeof value === 'boolean') strValue = String(value);
        else if (typeof value === 'number') strValue = String(value);
        else if (typeof value === 'object') strValue = JSON.stringify(value);
        updateStmt.run(strValue, category, key);
      }
    }
  });

  updateMany(settings);
  logAudit(db, req.user.id, 'UPDATE_SETTINGS', 'settings', null, '更新系统设置', req);
  res.json(formatResponse(null, '设置保存成功'));
});

router.put('/reset', roleMiddleware('super_admin'), (req, res) => {
  const db = getDb();

  db.prepare("UPDATE settings SET value = 'true' WHERE key IN ('auto_assign', 'timeout_reminder', 'sms_enabled', 'wechat_enabled', 'backup_enabled')").run();
  db.prepare("UPDATE settings SET value = 'false' WHERE key IN ('email_enabled', 'two_factor_auth')").run();
  db.prepare("UPDATE settings SET value = '某某市人民调解委员会' WHERE key = 'org_name'").run();
  db.prepare("UPDATE settings SET value = 'dark' WHERE key = 'theme'").run();

  logAudit(db, req.user.id, 'RESET_SETTINGS', 'settings', null, '重置系统设置', req);
  res.json(formatResponse(null, '设置已恢复默认'));
});

router.get('/about', (req, res) => {
  res.json(formatResponse({
    name: '和调 · 调解机构管理平台',
    version: '3.2.0',
    build_date: '2024-12-09',
    license: 'Enterprise',
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
    database: 'SQLite 3'
  }));
});

module.exports = router;
