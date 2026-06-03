const bcrypt = require('bcryptjs');
const { getDb, initDatabase } = require('./server/db');

console.log('Initializing admin user...');
const db = initDatabase();

// Insert roles
const insertRole = db.prepare(
  'INSERT OR IGNORE INTO roles (name, display_name, description) VALUES (?, ?, ?)'
);
const roles = [
  ['super_admin', '超级管理员', '系统最高权限，可管理所有模块和配置'],
  ['org_admin', '机构负责人', '管理本机构所有业务和人员'],
  ['senior_mediator', '高级调解员', '处理复杂案件，指导初级调解员'],
  ['mediator', '调解员', '负责案件调解工作'],
  ['archivist', '档案管理员', '负责档案整理和归档'],
  ['call_agent', '呼叫中心坐席', '负责接听和处理来电'],
  ['analyst', '数据分析师', '负责数据统计和分析报告'],
  ['operator', '系统运维', '负责系统维护和技术支持']
];
const roleInsert = db.transaction((rows) => {
  for (const r of rows) insertRole.run(...r);
});
roleInsert(roles);
console.log('Roles initialized');

// Insert admin user
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, password_hash, real_name, phone, email, role_id, avatar_color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
const passwordHash = bcrypt.hashSync('admin123', 10);
const result = insertUser.run(
  'admin',
  passwordHash,
  '系统管理员',
  '13800000000',
  'admin@mediation.gov.cn',
  1,
  '#c9a84c',
  'active'
);

if (result.changes > 0) {
  console.log('Admin user created successfully!');
  console.log('Username: admin');
  console.log('Password: admin123');
} else {
  console.log('Admin user already exists');
}

// Insert initial settings
const insertSetting = db.prepare(
  'INSERT OR IGNORE INTO settings (category, key, value, value_type, description) VALUES (?, ?, ?, ?, ?)'
);
const settings = [
  ['general', 'org_name', '某某市人民调解委员会', 'string', '机构名称'],
  ['general', 'case_prefix', 'yearly', 'string', '案件编号前缀规则'],
  ['general', 'auto_assign', 'false', 'boolean', '自动分配调解员'],
  ['general', 'timeout_reminder', 'true', 'boolean', '调解超时提醒'],
  ['general', 'timeout_days', '30', 'number', '超时天数阈值'],
  ['notification', 'sms_enabled', 'false', 'boolean', '短信通知'],
  ['notification', 'email_enabled', 'false', 'boolean', '邮件通知'],
  ['notification', 'wechat_enabled', 'false', 'boolean', '微信推送'],
  ['security', 'password_min_length', '6', 'number', '密码最小长度'],
  ['security', 'login_max_attempts', '5', 'number', '最大登录尝试次数'],
  ['security', 'session_timeout', '120', 'number', '会话超时时间(分钟)'],
  ['security', 'two_factor_auth', 'false', 'boolean', '双因素认证'],
  ['interface', 'theme', 'light', 'string', '界面主题'],
  ['interface', 'language', 'zh-CN', 'string', '界面语言'],
  ['interface', 'page_size', '20', 'number', '默认分页大小'],
  ['api', 'rate_limit', '100', 'number', 'API限流(次/分钟)'],
  ['data', 'backup_enabled', 'true', 'boolean', '自动备份'],
  ['data', 'backup_interval', '24', 'number', '备份间隔(小时)'],
  ['data', 'backup_retention', '30', 'number', '备份保留天数']
];
const settingInsert = db.transaction((rows) => {
  for (const s of rows) insertSetting.run(...s);
});
settingInsert(settings);
console.log('Settings initialized');

// Insert case types
const insertCaseType = db.prepare(
  'INSERT OR IGNORE INTO case_types (name, icon, color, sort_order) VALUES (?, ?, ?, ?)'
);
const caseTypes = [
  ['房屋租赁纠纷', 'home', '#c9a84c', 1],
  ['劳动争议', 'work', '#2dd4bf', 2],
  ['合同纠纷', 'handshake', '#a78bfa', 3],
  ['邻里纠纷', 'diversity_3', '#f472b6', 4],
  ['消费维权', 'shopping_cart', '#fbbf24', 5],
  ['婚姻家庭', 'favorite', '#60a5fa', 6],
  ['交通事故', 'directions_car', '#34d399', 7],
  ['债务纠纷', 'account_balance', '#fb923c', 8]
];
const ctInsert = db.transaction((rows) => {
  for (const ct of rows) insertCaseType.run(...ct);
});
ctInsert(caseTypes);
console.log('Case types initialized');

// Insert archive categories
const insertArchiveCat = db.prepare(
  'INSERT OR IGNORE INTO archive_categories (name, icon, color, description, sort_order) VALUES (?, ?, ?, ?, ?)'
);
const archiveCats = [
  ['房屋租赁纠纷档案', 'home', '#c9a84c', '包含租赁合同、房屋状况报告、双方陈述记录等核心材料', 1],
  ['劳动争议档案', 'work', '#2dd4bf', '劳动合同、工资流水、社保记录、工伤鉴定等关键证据', 2],
  ['合同纠纷档案', 'handshake', '#a78bfa', '合同原件、补充协议、往来函件、履约记录等材料', 3],
  ['邻里纠纷档案', 'diversity_3', '#f472b6', '物业记录、现场照片、调解笔录、社区证明等', 4],
  ['消费维权档案', 'shopping_cart', '#fbbf24', '购物凭证、商品检测报告、投诉记录、商家回复等', 5],
  ['婚姻家庭档案', 'favorite', '#60a5fa', '结婚证明、财产清单、子女抚养协议、调解记录等', 6]
];
const acInsert = db.transaction((rows) => {
  for (const ac of rows) insertArchiveCat.run(...ac);
});
acInsert(archiveCats);
console.log('Archive categories initialized');

db.close();
console.log('\nInitialization complete!');