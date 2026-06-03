const bcrypt = require('bcryptjs');
const { getDb, initDatabase } = require('./db');

function seed() {
  const db = initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already seeded, skipping...');
    return db;
  }

  console.log('Seeding database...');

  const insertRole = db.prepare(
    'INSERT INTO roles (name, display_name, description) VALUES (?, ?, ?)'
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

  const insertUser = db.prepare(
    'INSERT INTO users (username, password_hash, real_name, phone, email, role_id, avatar_color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const passwordHash = bcrypt.hashSync('admin123', 10);
  const users = [
    ['admin', passwordHash, '系统管理员', '13800000001', 'admin@mediation.gov.cn', 1, '#c9a84c', 'active'],
    ['liminghua', passwordHash, '李明华', '13800000010', 'limh@mediation.gov.cn', 3, '#c9a84c', 'active'],
    ['zhaoxuemei', passwordHash, '赵雪梅', '13800000011', 'zhaoxm@mediation.gov.cn', 3, '#2dd4bf', 'active'],
    ['chenjianguo', passwordHash, '陈建国', '13800000012', 'chenjg@mediation.gov.cn', 4, '#a78bfa', 'active'],
    ['zhouliping', passwordHash, '周丽萍', '13800000013', 'zhoulp@mediation.gov.cn', 4, '#f472b6', 'active'],
    ['wangdangan', passwordHash, '王档案', '13800000020', 'wangda@mediation.gov.cn', 5, '#fbbf24', 'active'],
    ['zuozuo01', passwordHash, '张坐席', '13800000030', 'zuozuo@mediation.gov.cn', 6, '#60a5fa', 'active']
  ];
  const userInsert = db.transaction((rows) => {
    for (const u of rows) insertUser.run(...u);
  });
  userInsert(users);

  const insertCaseType = db.prepare(
    'INSERT INTO case_types (name, icon, color, sort_order) VALUES (?, ?, ?, ?)'
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

  const insertArchiveCat = db.prepare(
    'INSERT INTO archive_categories (name, icon, color, description, sort_order) VALUES (?, ?, ?, ?, ?)'
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

  const insertCase = db.prepare(
    `INSERT INTO cases (case_number, title, type_id, description, status, priority, mediator_id, created_by, assigned_at, accepted_at, closed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const cases = [
    ['2024-1092', '张某某与李某房屋租赁押金退还纠纷', 1, '甲方张某某要求乙方李某退还房屋租赁押金15000元，乙方以房屋需清洁为由拒绝全额退还', 'mediating', 'urgent', 2, 1, '2024-12-08 09:00:00', null, null],
    ['2024-1091', '王某与某科技公司劳动争议', 2, '王某主张公司违法解除劳动合同，要求支付经济补偿金', 'mediating', 'high', 3, 1, '2024-12-07 10:00:00', '2024-12-07 14:00:00', null],
    ['2024-1090', '某贸易公司与某物流公司合同纠纷', 3, '贸易公司主张物流公司未按合同约定时间送达货物，造成经济损失', 'mediating', 'normal', 4, 1, '2024-12-06 11:00:00', '2024-12-06 15:00:00', null],
    ['2024-1089', '刘某与周某邻里噪音纠纷', 4, '刘某反映楼上住户周某长期产生噪音影响其正常生活', 'closed', 'normal', 2, 1, '2024-12-05 09:00:00', '2024-12-05 10:00:00', '2024-12-08 16:00:00'],
    ['2024-1088', '孙某与某电商平台消费维权', 5, '孙某购买商品与描述不符，要求退货退款并赔偿', 'pending', 'normal', 5, 1, null, null, null],
    ['2024-1087', '吴某与郑某婚姻财产分割', 6, '双方协议离婚，就共同财产分割存在争议', 'pending', 'normal', 3, 1, null, null, null],
    ['2024-1086', '黄某与某保险公司交通事故理赔', 7, '黄某交通事故后保险公司理赔金额存在争议', 'closed', 'normal', 4, 1, '2024-12-02 09:00:00', '2024-12-02 11:00:00', '2024-12-05 14:00:00'],
    ['2024-1085', '赵某与钱某民间借贷纠纷', 8, '赵某主张钱某未按期归还借款5万元', 'closed', 'high', 2, 1, '2024-12-01 09:00:00', '2024-12-01 10:00:00', '2024-12-04 16:00:00'],
    ['2024-1084', '陈某与某装修公司装修质量纠纷', 3, '陈某主张装修公司施工质量不合格，要求返工并赔偿', 'mediating', 'high', 3, 1, '2024-11-30 10:00:00', '2024-11-30 14:00:00', null],
    ['2024-1083', '林某与何某物业管理纠纷', 4, '林某对物业收费标准和服务质量提出异议', 'accepted', 'normal', 5, 1, '2024-11-29 09:00:00', null, null]
  ];
  const caseInsert = db.transaction((rows) => {
    for (const c of rows) insertCase.run(...c);
  });
  caseInsert(cases);

  const insertParty = db.prepare(
    `INSERT INTO case_parties (case_id, party_type, name, id_number, phone, description) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const parties = [
    [1, 'plaintiff', '张某某', '310***********1234', '139****5678', '甲方，房屋承租方'],
    [1, 'defendant', '李某', '310***********5678', '158****3456', '乙方，房屋出租方'],
    [2, 'plaintiff', '王某', '310***********9012', '137****7890', '劳动者，原某科技公司员工'],
    [2, 'defendant', '某科技有限公司', '91310000********', '021-5555****', '用人单位'],
    [3, 'plaintiff', '某贸易有限公司', '91310000********', '021-6666****', '委托方'],
    [3, 'defendant', '某物流有限公司', '91310000********', '021-7777****', '承运方'],
    [4, 'plaintiff', '刘某', '310***********3456', '136****2345', '楼下住户'],
    [4, 'defendant', '周某', '310***********7890', '135****6789', '楼上住户'],
    [5, 'plaintiff', '孙某', '310***********2345', '133****4567', '消费者'],
    [5, 'defendant', '某电子商务平台', '91310000********', '400-****-****', '电商平台']
  ];
  const partyInsert = db.transaction((rows) => {
    for (const p of rows) insertParty.run(...p);
  });
  partyInsert(parties);

  const insertDocTemplate = db.prepare(
    `INSERT INTO document_templates (name, code, description, content_template, icon, color, usage_count) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const docTemplates = [
    ['调解协议书', 'mediation_agreement', '调解成功后双方签署的协议', '调协字〔{{year}}〕第 {{caseNumber}} 号\n\n\n甲方：{{partyA}}\n身份证号：{{partyAIdNumber}}\n联系电话：{{partyAPhone}}\n住址：{{partyAAddress}}\n\n乙方：{{partyB}}\n身份证号：{{partyBIdNumber}}\n联系电话：{{partyBPhone}}\n住址：{{partyBAddress}}\n\n纠纷事由：{{caseTitle}}\n\n经{{orgName}}主持调解，双方当事人本着自愿、平等的原则，自愿达成如下协议：\n\n一、双方确认纠纷事实：{{caseTitle}}。\n\n二、双方达成以下和解方案：\n    1. __________\n    2. __________\n    3. __________\n\n三、履行方式和期限：__________\n\n四、本协议自双方签字（盖章）之日起生效。\n\n五、本协议一式三份，甲乙双方各执一份，调解委员会存档一份，具有同等法律效力。\n\n六、双方承诺不再因此纠纷向对方主张任何权利。\n\n\n甲方（签字/盖章）：__________  日期：__________\n\n乙方（签字/盖章）：__________  日期：__________\n\n调解员（签字）：{{mediator}}  日期：{{date}}\n\n{{orgName}}（盖章）', 'assignment', '#c9a84c', 128],
    ['调解笔录', 'mediation_record', '调解过程的详细记录', '调解笔录\n\n案件编号：{{caseNumber}}\n调解时间：{{date}}\n调解地点：__________\n调解员：{{mediator}}\n记录员：__________\n\n当事人信息：\n甲方：{{partyA}}（联系电话：{{partyAPhone}}）\n乙方：{{partyB}}（联系电话：{{partyBPhone}}）\n\n──────────────────────────\n调解过程记录：\n\n一、调解员宣布调解纪律和注意事项。\n\n二、甲方陈述：\n__________\n\n三、乙方陈述：\n__________\n\n四、调解员归纳争议焦点：\n__________\n\n五、调解员提出调解方案：\n__________\n\n六、双方协商过程：\n__________\n\n七、调解结果：\n□ 达成协议  □ 未达成协议  □ 延期调解\n\n──────────────────────────\n\n以上笔录已向当事人宣读，当事人确认无误。\n\n甲方（签字）：__________\n乙方（签字）：__________\n调解员（签字）：{{mediator}}\n记录员（签字）：__________', 'receipt_long', '#2dd4bf', 96],
    ['受理通知书', 'acceptance_notice', '案件受理后通知当事人的文书', '\n\n{{orgName}}\n受 理 通 知 书\n\n调受字〔{{year}}〕第 {{caseNumber}} 号\n\n{{partyName}}：\n\n你/你单位与{{oppositeParty}}关于「{{caseTitle}}」一案的调解申请，本委员会已于{{date}}收到。\n\n经审查，该申请符合《中华人民共和国人民调解法》规定的受理条件，本委员会决定予以受理。\n\n现将有关事项通知如下：\n一、本案由调解员 {{mediator}} 负责调解。\n二、请于接到本通知后7日内到本委员会参加调解。\n三、调解地点：__________\n四、联系电话：__________\n\n特此通知。\n\n\n{{orgName}}（盖章）\n{{date}}', 'task_alt', '#a78bfa', 84],
    ['终止调解书', 'termination_notice', '调解未达成协议时终止调解的文书', '\n\n{{orgName}}\n终 止 调 解 书\n\n调终字〔{{year}}〕第 {{caseNumber}} 号\n\n{{partyName}}：\n\n你/你单位与{{oppositeParty}}关于「{{caseTitle}}」一案，本委员会于__________日受理后，依法进行了调解。\n\n因以下原因，调解未能达成协议：\n□ 一方当事人明确表示不愿继续调解\n□ 双方对核心争议事项分歧过大\n□ 调解期限届满仍未达成协议\n□ 其他：__________\n\n根据《中华人民共和国人民调解法》第二十六条的规定，本委员会决定终止调解。\n\n当事人可依法通过以下途径解决纠纷：\n一、向有管辖权的人民法院提起诉讼；\n二、向仲裁机构申请仲裁；\n三、向有关行政部门投诉。\n\n特此通知。\n\n\n{{orgName}}（盖章）\n{{date}}', 'cancel', '#f472b6', 32],
    ['调解延期申请', 'postponement_request', '申请延长调解期限的文书', '调解延期申请书\n\n案件编号：{{caseNumber}}\n案件名称：{{caseTitle}}\n\n申请人：{{applicant}}\n联系电话：__________\n\n申请延期原因：\n__________\n\n申请延期至：__________\n\n原调解期限：__________ 至 __________\n\n此致\n{{orgName}}\n\n\n申请人（签字）：__________\n日期：{{date}}', 'schedule', '#fbbf24', 45],
    ['司法确认申请书', 'judicial_confirmation', '向法院申请司法确认调解协议的文书', '司法确认申请书\n\n申请人（甲方）：{{partyA}}\n身份证号：__________\n联系电话：{{partyAPhone}}\n住址：{{partyAAddress}}\n\n被申请人（乙方）：{{partyB}}\n身份证号：__________\n联系电话：{{partyBPhone}}\n住址：{{partyBAddress}}\n\n申请事项：\n请求对申请人于__________在{{orgName}}达成的调解协议（调协字〔{{year}}〕第 {{caseNumber}} 号）进行司法确认。\n\n事实与理由：\n申请人与被申请人因{{caseTitle}}纠纷，经{{orgName}}调解员{{mediator}}主持调解，双方自愿达成调解协议。为确保协议的法律效力，特依据《中华人民共和国人民调解法》第三十三条之规定，向贵院申请司法确认。\n\n此致\n__________人民法院\n\n\n申请人（签字）：__________\n日期：{{date}}', 'verified_user', '#60a5fa', 67],
    ['调解员回避申请', 'recusal_request', '申请调解员回避的文书', '调解员回避申请书\n\n案件编号：{{caseNumber}}\n案件名称：{{caseTitle}}\n\n申请人：{{applicant}}\n联系电话：__________\n\n被申请回避调解员：{{mediator}}\n\n回避原因：\n□ 是本案当事人或者当事人近亲属\n□ 与本案有利害关系\n□ 与本案当事人有其他关系，可能影响公正调解\n□ 其他：__________\n\n具体说明：\n__________\n\n此致\n{{orgName}}\n\n\n申请人（签字）：__________\n日期：{{date}}', 'group_add', '#34d399', 12],
    ['调解邀请函', 'mediation_invitation', '邀请当事人参加调解的函件', '调 解 邀 请 函\n\n{{partyName}}：\n\n本委员会已受理{{oppositeParty}}与你/你单位关于「{{caseTitle}}」一案的调解申请（案件编号：{{caseNumber}}）。\n\n现邀请你/你单位参加调解，具体安排如下：\n\n调解时间：__________\n调解地点：__________\n调解员：{{mediator}}\n\n注意事项：\n一、请携带本人有效身份证件及相关证据材料。\n二、如委托他人代为参加，需提交授权委托书。\n三、如你/你单位同意参加调解，请于__________前回复确认。\n四、如你/你单位不同意参加调解，调解程序将依法终止，不影响你依法通过其他途径解决纠纷的权利。\n\n联系电话：__________\n\n\n{{orgName}}（盖章）\n{{date}}', 'mail', '#fb923c', 53]
  ];
  const dtInsert = db.transaction((rows) => {
    for (const d of rows) insertDocTemplate.run(...d);
  });
  dtInsert(docTemplates);

  const insertNotification = db.prepare(
    `INSERT INTO notifications (user_id, type, title, content, link, is_read) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const notifications = [
    [2, 'urgent', '紧急案件提醒', '案件 #2024-1092 需在48小时内响应，请尽快安排调解', '/cases/1', 0],
    [2, 'case', '调解结果通知', '案件 #2024-1089 调解成功，协议书已自动生成', '/cases/4', 0],
    [2, 'video', '视频调解提醒', '案件 #2024-1091 视频调解将于14:00开始，请提前5分钟加入', '/video', 0],
    [3, 'document', '文书审核通知', '调解协议书 #2024-1085 已提交审核，请及时查阅', '/documents', 0],
    [1, 'system', '系统更新通知', '平台已升级至 v3.2.0，新增智能文书推荐功能', '/settings', 1],
    [2, 'training', '培训通知', '本周五14:00开展在线调解技能培训，请准时参加', null, 1]
  ];
  const nInsert = db.transaction((rows) => {
    for (const n of rows) insertNotification.run(...n);
  });
  nInsert(notifications);

  const insertPartyPush = db.prepare(
    `INSERT INTO party_push_records (case_id, party_id, push_type, title, content, channel, status, sent_by, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const partyPushes = [
    [1, 1, 'acceptance', '案件受理通知', '您与李某关于房屋租赁押金退还纠纷的调解申请已受理，案件编号2024-1092，调解员李明华。', 'sms', 'delivered', 2, '2024-12-08 09:00:00'],
    [1, 2, 'acceptance', '案件受理通知', '张某某已就房屋租赁押金退还纠纷向本委员会申请调解，案件编号2024-1092，请按时参加。', 'sms', 'delivered', 2, '2024-12-08 09:01:00'],
    [1, 1, 'schedule', '调解安排通知', '您与李某的调解已安排于2024年12月9日14:00在调解室A进行，请携带相关证据材料。', 'sms', 'delivered', 2, '2024-12-08 15:00:00'],
    [1, 2, 'schedule', '调解安排通知', '您与张某某的调解已安排于2024年12月9日14:00在调解室A进行，请携带相关证据材料。', 'sms', 'sent', 2, '2024-12-08 15:01:00'],
    [2, 3, 'mediation_notice', '调解通知书', '您与某科技公司的劳动争议调解已安排，请于2024年12月10日10:00到调解室B参加调解。', 'email', 'delivered', 3, '2024-12-09 10:00:00'],
    [3, 5, 'acceptance', '案件受理通知', '某贸易公司与贵公司的合同纠纷调解申请已受理，案件编号2024-1090。', 'sms', 'delivered', 4, '2024-12-07 14:00:00'],
    [4, 7, 'agreement', '调解协议送达', '您与赵某的借款合同纠纷已达成调解协议，协议书已生成，请及时查阅确认。', 'email', 'read', 5, '2024-12-06 16:00:00'],
    [5, 9, 'reminder', '调解提醒', '您与某银行的金融借款合同纠纷调解将于明日14:00进行，请准时参加。', 'sms', 'pending', 5, '2024-12-09 18:00:00']
  ];
  const ppInsert = db.transaction((rows) => {
    for (const p of rows) insertPartyPush.run(...p);
  });
  ppInsert(partyPushes);

  const insertCall = db.prepare(
    `INSERT INTO call_records (caller_number, caller_name, callee_id, call_type, category, status, case_id, wait_duration, talk_duration, satisfaction, transfer_to, note, started_at, answered_at, ended_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const calls = [
    ['138****5678', '张某', null, 'inbound', 'consultation', 'waiting', null, 192, null, null, null, null, '2024-12-09 14:23:15', null, null],
    ['159****3456', '李某', null, 'inbound', 'appointment', 'waiting', null, 319, null, null, null, null, '2024-12-09 14:21:08', null, null],
    ['186****7890', '王某', 7, 'inbound', 'query', 'connected', 2, 45, null, null, null, '查询案件 #2024-1090 进度', '2024-12-09 14:18:42', '2024-12-09 14:19:27', null],
    ['177****2345', '赵某', 7, 'inbound', 'complaint', 'connected', null, 30, null, null, null, '投诉调解员态度问题', '2024-12-09 14:15:30', '2024-12-09 14:16:00', null],
    ['135****8901', '孙某', 7, 'inbound', 'consultation', 'completed', null, 15, 320, 4, null, '咨询房屋租赁纠纷调解流程', '2024-12-09 14:10:00', '2024-12-09 14:10:15', '2024-12-09 14:15:35'],
    ['188****4567', '周某', 7, 'inbound', 'appointment', 'completed', 1, 8, 180, 5, null, '预约下周调解', '2024-12-09 14:05:00', '2024-12-09 14:05:08', '2024-12-09 14:08:08'],
    ['139****1234', '吴某', 7, 'inbound', 'query', 'completed', 3, 22, 95, 3, null, '查询调解协议书模板', '2024-12-09 13:55:00', '2024-12-09 13:55:22', '2024-12-09 13:56:57'],
    ['156****7890', '郑某', null, 'inbound', 'consultation', 'abandoned', null, 120, null, null, null, null, '2024-12-09 13:50:00', null, '2024-12-09 13:52:00'],
    ['131****2345', '钱某', 7, 'inbound', 'mediation', 'completed', 1, 12, 480, 5, null, '确认调解时间，已安排12月10日下午2点', '2024-12-09 11:30:00', '2024-12-09 11:30:12', '2024-12-09 11:38:12'],
    ['152****6789', '冯某', 7, 'inbound', 'complaint', 'transferred', null, 25, 60, null, '投诉处理部', '投诉调解结果不满意，转接投诉处理部', '2024-12-09 10:45:00', '2024-12-09 10:45:25', '2024-12-09 10:46:25'],
    ['176****4321', '陈某', 7, 'outbound', 'followup', 'completed', 2, 0, 210, 4, null, '回访调解进展，当事人表示满意', '2024-12-09 10:15:00', '2024-12-09 10:15:00', '2024-12-09 10:18:30'],
    ['133****8765', '杨某', 7, 'outbound', 'mediation', 'completed', 4, 0, 360, 5, null, '通知调解安排，确认双方出席', '2024-12-09 09:30:00', '2024-12-09 09:30:00', '2024-12-09 09:36:00'],
    ['185****5432', '黄某', null, 'inbound', 'query', 'missed', null, 60, null, null, null, null, '2024-12-09 09:10:00', null, null],
    ['157****9876', '朱某', 7, 'inbound', 'consultation', 'completed', null, 18, 150, 4, null, '咨询金融纠纷调解所需材料', '2024-12-08 16:20:00', '2024-12-08 16:20:18', '2024-12-08 16:22:48'],
    ['189****3210', '何某', 7, 'outbound', 'followup', 'completed', 5, 0, 180, 3, null, '回访调解协议履行情况', '2024-12-08 15:00:00', '2024-12-08 15:00:00', '2024-12-08 15:03:00'],
    ['136****6543', '林某', 7, 'inbound', 'appointment', 'completed', 3, 10, 120, 5, null, '预约12月12日调解', '2024-12-08 14:30:00', '2024-12-08 14:30:10', '2024-12-08 14:32:10']
  ];
  const callInsert = db.transaction((rows) => {
    for (const c of rows) insertCall.run(...c);
  });
  callInsert(calls);

  const insertProvider = db.prepare(
    `INSERT INTO call_providers (name, provider_type, display_name, description, api_endpoint, app_id, secret_key, instance_id, sip_number, status, balance, call_package, max_concurrent, features, last_sync_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const providers = [
    ['tencent_prod', 'tencent', '腾讯云呼叫中心', '生产环境腾讯云CCC融合通信', 'https://ccc.tencentcloudapi.com', '1400123456', 'sk-test-secret-key-xxxxx', 'ins-abc12345', '0755-88889999', 'active', 1250.50, 'standard', 15, JSON.stringify(['外呼', '呼入', 'IVR导航', '通话录音', '实时监控', '满意度评价', '智能路由', '技能组']), '2024-12-09 14:00:00'],
    ['aliyun_backup', 'aliyun', '阿里云呼叫中心', '备用环境阿里云智能呼叫', 'https://ccc.aliyuncs.com', 'LTAI5tXXXXXXXX', 'aliyun-secret-key-xxxxx', 'ccc-xyz78901', '0755-66667777', 'inactive', 980.00, 'growth', 20, JSON.stringify(['外呼', '呼入', 'IVR导航', '通话录音', '智能外呼', '语音机器人', '全渠道接入', '报表分析']), null]
  ];
  const providerInsert = db.transaction((rows) => {
    for (const p of rows) insertProvider.run(...p);
  });
  providerInsert(providers);

  const insertPushProvider = db.prepare(
    `INSERT INTO push_providers (name, provider_type, display_name, description, api_endpoint, app_id, secret_key, sign_name, template_code, region, status, balance, daily_limit, monthly_sent, last_sync_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const pushProviders = [
    ['tencent_sms_prod', 'tencent_sms', '腾讯云短信', '生产环境腾讯云短信服务', 'https://sms.tencentcloudapi.com', '1400123456', 'sk-tencent-sms-secret-xxxxx', '和调平台', 'SMS_123456', 'ap-guangzhou', 'active', 500.00, 5000, 890, '2024-12-09 14:00:00'],
    ['aliyun_sms_backup', 'aliyun_sms', '阿里云短信', '备用环境阿里云短信服务', 'https://dysmsapi.aliyuncs.com', 'LTAI5tSMSXXXX', 'aliyun-sms-secret-xxxxx', '和调平台', 'SMS_789012', 'cn-hangzhou', 'inactive', 380.00, 10000, 650, null],
    ['tencent_email_prod', 'tencent_email', '腾讯云邮件推送', '生产环境腾讯云SES邮件', 'https://ses.tencentcloudapi.com', 'AKIDxxxxxxxx', 'ses-secret-xxxxx', 'notify@hetiao.com', null, 'ap-guangzhou', 'active', 200.00, 5000, 280, '2024-12-09 13:00:00']
  ];
  const pushProviderInsert = db.transaction((rows) => {
    for (const p of rows) insertPushProvider.run(...p);
  });
  pushProviderInsert(pushProviders);

  const insertSetting = db.prepare(
    `INSERT INTO settings (category, key, value, value_type, description) VALUES (?, ?, ?, ?, ?)`
  );
  const settings = [
    ['general', 'org_name', '某某市人民调解委员会', 'string', '机构名称'],
    ['general', 'case_prefix', 'yearly', 'string', '案件编号前缀规则'],
    ['general', 'auto_assign', 'true', 'boolean', '自动分配调解员'],
    ['general', 'timeout_reminder', 'true', 'boolean', '调解超时提醒'],
    ['general', 'timeout_days', '30', 'number', '超时天数阈值'],
    ['notification', 'sms_enabled', 'true', 'boolean', '短信通知'],
    ['notification', 'email_enabled', 'false', 'boolean', '邮件通知'],
    ['notification', 'wechat_enabled', 'true', 'boolean', '微信推送'],
    ['notification', 'sms_template', '【和调平台】您有新的案件通知：{{content}}', 'string', '短信模板'],
    ['security', 'password_min_length', '8', 'number', '密码最小长度'],
    ['security', 'login_max_attempts', '5', 'number', '最大登录尝试次数'],
    ['security', 'session_timeout', '120', 'number', '会话超时时间(分钟)'],
    ['security', 'two_factor_auth', 'false', 'boolean', '双因素认证'],
    ['security', 'ip_whitelist', '', 'string', 'IP白名单(逗号分隔)'],
    ['interface', 'theme', 'dark', 'string', '界面主题'],
    ['interface', 'language', 'zh-CN', 'string', '界面语言'],
    ['interface', 'page_size', '20', 'number', '默认分页大小'],
    ['api', 'rate_limit', '100', 'number', 'API限流(次/分钟)'],
    ['api', 'log_retention_days', '90', 'number', '日志保留天数'],
    ['data', 'backup_enabled', 'true', 'boolean', '自动备份'],
    ['data', 'backup_interval', '24', 'number', '备份间隔(小时)'],
    ['data', 'backup_retention', '30', 'number', '备份保留天数']
  ];
  const sInsert = db.transaction((rows) => {
    for (const s of rows) insertSetting.run(...s);
  });
  sInsert(settings);

  const insertAudit = db.prepare(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, detail, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const auditLogs = [
    [1, 'LOGIN', 'auth', null, '管理员登录系统', '192.168.1.100', '2024-12-09 09:00:00'],
    [1, 'CREATE', 'case', 1, '创建案件: #2024-1088', '192.168.1.100', '2024-12-09 09:15:00'],
    [7, 'LOGIN', 'auth', null, '调解员登录系统', '192.168.1.101', '2024-12-09 09:20:00'],
    [1, 'CREATE', 'case', 2, '创建案件: #2024-1089', '192.168.1.100', '2024-12-09 09:30:00'],
    [7, 'UPDATE', 'case', 1, '更新案件状态: 受理中 → 调解中', '192.168.1.101', '2024-12-09 10:00:00'],
    [1, 'CREATE', 'document', 1, '生成文书: 调解受理通知书', '192.168.1.100', '2024-12-09 10:15:00'],
    [7, 'CREATE', 'schedule', 1, '创建调解日程', '192.168.1.101', '2024-12-09 10:30:00'],
    [1, 'UPDATE_SETTINGS', 'settings', null, '更新系统设置', '192.168.1.100', '2024-12-09 11:00:00'],
    [1, 'CREATE', 'user', 8, '创建用户: assistant01', '192.168.1.100', '2024-12-09 11:15:00'],
    [7, 'CREATE', 'video_session', 1, '创建视频调解会话', '192.168.1.101', '2024-12-09 14:00:00'],
    [1, 'CREATE', 'push_record', 1, '推送受理通知至当事人', '192.168.1.100', '2024-12-09 14:15:00'],
    [7, 'UPDATE', 'case', 1, '更新案件状态: 调解中 → 已达成协议', '192.168.1.101', '2024-12-09 15:30:00'],
    [1, 'CREATE', 'archive', 1, '归档案件材料', '192.168.1.100', '2024-12-09 16:00:00'],
    [1, 'LOGIN', 'auth', null, '管理员登录系统', '192.168.1.100', '2024-12-08 08:45:00'],
    [7, 'LOGIN', 'auth', null, '调解员登录系统', '192.168.1.101', '2024-12-08 09:00:00'],
    [1, 'CREATE', 'case', 3, '创建案件: #2024-1090', '192.168.1.100', '2024-12-08 09:30:00'],
    [1, 'DELETE', 'document', 5, '删除文书草稿', '192.168.1.100', '2024-12-08 10:00:00'],
    [7, 'CREATE', 'feedback', 1, '提交调解评价', '192.168.1.101', '2024-12-08 14:00:00'],
    [1, 'UPDATE', 'call_record', 1, '接听来电: 138****5678', '192.168.1.100', '2024-12-08 15:00:00'],
    [1, 'OUTBOUND', 'call_record', 10, '外呼: 176****4321', '192.168.1.100', '2024-12-08 16:00:00']
  ];
  const auditInsert = db.transaction((rows) => {
    for (const a of rows) insertAudit.run(...a);
  });
  auditInsert(auditLogs);

  const insertStats = db.prepare(
    `INSERT INTO dashboard_stats (stat_date, total_cases, new_cases, closed_cases, success_rate, avg_duration, total_calls, answered_calls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const stats = [];
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const newC = Math.floor(Math.random() * 15) + 5;
    const closedC = Math.floor(newC * (0.7 + Math.random() * 0.25));
    stats.push([
      dateStr,
      1200 + (30 - i) * 8 + Math.floor(Math.random() * 20),
      newC,
      closedC,
      85 + Math.random() * 8,
      5 + Math.random() * 3,
      Math.floor(Math.random() * 40) + 20,
      Math.floor(Math.random() * 35) + 18
    ]);
  }
  const statInsert = db.transaction((rows) => {
    for (const s of rows) insertStats.run(...s);
  });
  statInsert(stats);

  const insertArchive = db.prepare(
    `INSERT INTO archives (archive_number, category_id, case_id, title, description, status, confidentiality_level, retention_period, archive_date, tags, storage_location, total_pages, responsible_person, review_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const archives = [
    ['DA20240001', 1, 1, '张某某与李某房屋租赁纠纷档案', '包含租赁合同、房屋状况报告、双方陈述记录等核心材料', 'active', 'internal', 'long-term', '2024-12-08', '房屋租赁,押金纠纷', 'A区3号柜', 45, '王档案', 'approved', 6],
    ['DA20240002', 2, 2, '王某与某科技公司劳动争议档案', '劳动合同、工资流水、社保记录、工伤鉴定等关键证据', 'active', 'internal', 'long-term', '2024-12-07', '劳动争议,经济补偿', 'B区1号柜', 38, '王档案', 'approved', 6],
    ['DA20240003', 3, 3, '某贸易公司与某物流公司合同纠纷档案', '合同原件、补充协议、往来函件、履约记录等材料', 'active', 'confidential', 'permanent', '2024-12-06', '合同纠纷,物流', 'C区2号柜', 62, '王档案', 'approved', 6],
    ['DA20240004', 4, 4, '刘某与周某邻里噪音纠纷档案', '物业记录、现场照片、调解笔录、社区证明等', 'archived', 'public', 'short-term', '2024-12-05', '邻里纠纷,噪音', 'D区1号柜', 28, '王档案', 'approved', 6],
    ['DA20240005', 5, 5, '孙某与某电商平台消费维权档案', '购物凭证、商品检测报告、投诉记录、商家回复等', 'active', 'public', 'long-term', '2024-12-04', '消费维权,电商', 'A区2号柜', 33, '王档案', 'pending', 6],
    ['DA20240006', 6, 6, '吴某与郑某婚姻财产分割档案', '结婚证明、财产清单、子女抚养协议、调解记录等', 'active', 'confidential', 'permanent', '2024-12-03', '婚姻家庭,财产分割', 'B区3号柜', 51, '王档案', 'pending', 6],
    ['DA20240007', 1, 7, '黄某与某保险公司交通事故理赔档案', '事故认定书、医疗费用清单、保险合同、理赔记录等', 'archived', 'internal', 'long-term', '2024-12-02', '交通事故,保险理赔', 'C区1号柜', 40, '王档案', 'approved', 6],
    ['DA20240008', 3, 8, '赵某与钱某民间借贷纠纷档案', '借条原件、转账记录、催收函件、调解协议等', 'active', 'confidential', 'permanent', '2024-12-01', '民间借贷,债务纠纷', 'D区2号柜', 35, '王档案', 'approved', 6],
    ['DA20240009', 3, 9, '陈某与某装修公司装修质量纠纷档案', '装修合同、施工照片、质量检测报告、维修方案等', 'active', 'internal', 'long-term', '2024-11-30', '装修纠纷,质量', 'A区1号柜', 47, '王档案', 'pending', 6],
    ['DA20240010', 4, 10, '林某与何某物业管理纠纷档案', '物业合同、收费清单、服务记录、投诉回执等', 'active', 'public', 'short-term', '2024-11-29', '物业纠纷,收费', 'B区2号柜', 22, '王档案', 'rejected', 6]
  ];
  const arInsert = db.transaction((rows) => {
    for (const a of rows) insertArchive.run(...a);
  });
  arInsert(archives);

  const insertFile = db.prepare(
    `INSERT INTO archive_files (archive_id, file_name, file_path, file_size, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const files = [];
  const fileNames = ['租赁合同.pdf', '房屋状况报告.pdf', '甲方陈述记录.docx', '乙方陈述记录.docx', '押金收据.jpg', '调解笔录.pdf', '调解协议书.pdf', '身份证复印件.pdf', '现场照片.jpg', '物业证明.pdf'];
  for (let aId = 1; aId <= 6; aId++) {
    const count = 2 + Math.floor(Math.random() * 4);
    for (let f = 0; f < count; f++) {
      const fn = fileNames[Math.floor(Math.random() * fileNames.length)];
      files.push([aId, fn, `/uploads/archives/${aId}/${fn}`, Math.floor(Math.random() * 5000000) + 100000, fn.split('.').pop(), 6]);
    }
  }
  const fInsert = db.transaction((rows) => {
    for (const f of rows) insertFile.run(...f);
  });
  fInsert(files);

  const insertVideoSession = db.prepare(
    `INSERT INTO video_sessions (case_id, room_id, title, status, scheduled_at, started_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const videoSessions = [
    [1, 'room-1092-001', '张某某与李某房屋租赁押金退还纠纷调解', 'in_progress', '2024-12-09 14:00:00', '2024-12-09 14:00:05', 2],
    [2, 'room-1091-001', '王某与某科技公司劳动争议调解', 'scheduled', '2024-12-09 15:00:00', null, 3],
    [3, 'room-1090-001', '某贸易公司与某物流公司合同纠纷调解', 'scheduled', '2024-12-10 10:00:00', null, 4]
  ];
  const vsInsert = db.transaction((rows) => {
    for (const v of rows) insertVideoSession.run(...v);
  });
  vsInsert(videoSessions);

  const insertChatMsg = db.prepare(
    `INSERT INTO chat_messages (session_id, sender_type, sender_id, sender_name, content, message_type) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const chatMsgs = [
    [1, 'mediator', 2, '李明华', '双方好，今天我们针对房屋租赁押金退还问题进行调解，请双方各自陈述诉求。', 'text'],
    [1, 'party', null, '张某某', '我要求全额退还押金15000元，房屋退租时没有任何损坏。', 'text'],
    [1, 'party', null, '李某', '我认为需要扣除部分清洁费用，约2000元。', 'text'],
    [1, 'mediator', 2, '李明华', '建议双方各让一步，扣除500元清洁费，退还14500元，是否可以接受？', 'text']
  ];
  const cmInsert = db.transaction((rows) => {
    for (const m of rows) insertChatMsg.run(...m);
  });
  cmInsert(chatMsgs);

  const insertTimeline = db.prepare(
    `INSERT INTO case_timelines (case_id, action, from_status, to_status, operator_id, operator_name, comment) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const timelines = [
    [1, '状态变更: 待受理 → 调解中', 'pending', 'mediating', 2, '李明华', '案件已受理并开始调解'],
    [2, '状态变更: 待受理 → 已受理', 'pending', 'accepted', 3, '赵雪梅', '已受理案件'],
    [2, '状态变更: 已受理 → 调解中', 'accepted', 'mediating', 3, '赵雪梅', '开始调解'],
    [3, '状态变更: 待受理 → 调解中', 'pending', 'mediating', 4, '陈建国', null],
    [4, '状态变更: 待受理 → 已受理', 'pending', 'accepted', 2, '李明华', null],
    [4, '状态变更: 已受理 → 调解中', 'accepted', 'mediating', 2, '李明华', null],
    [4, '状态变更: 调解中 → 已达成协议', 'mediating', 'agreed', 2, '李明华', '双方达成和解'],
    [4, '状态变更: 已达成协议 → 已结案', 'agreed', 'closed', 2, '李明华', null],
    [6, '状态变更: 待受理 → 已终止', 'pending', 'terminated', 5, '周丽萍', '双方同意终止调解'],
    [7, '状态变更: 待受理 → 已终止', 'pending', 'terminated', 4, '陈建国', null]
  ];
  const tlInsert = db.transaction((rows) => {
    for (const t of rows) insertTimeline.run(...t);
  });
  tlInsert(timelines);

  const insertSchedule = db.prepare(
    `INSERT INTO schedules (title, case_id, mediator_id, schedule_type, status, start_time, end_time, location, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const now = new Date();
  const schedules = [
    ['张某某与李某房屋租赁押金退还纠纷调解', 1, 2, 'mediation', 'in_progress', new Date(now.getTime() + 0 * 60000).toISOString(), new Date(now.getTime() + 120 * 60000).toISOString(), '调解室A', '视频调解', 2],
    ['王某与某科技公司劳动争议调解', 2, 3, 'mediation', 'scheduled', new Date(now.getTime() + 120 * 60000).toISOString(), new Date(now.getTime() + 240 * 60000).toISOString(), '调解室B', null, 3],
    ['某贸易公司与某物流公司合同纠纷调解', 3, 4, 'mediation', 'scheduled', new Date(now.getTime() + 1440 * 60000).toISOString(), new Date(now.getTime() + 1560 * 60000).toISOString(), '调解室A', null, 4],
    ['调解技能培训', null, 2, 'training', 'scheduled', new Date(now.getTime() + 2880 * 60000).toISOString(), new Date(now.getTime() + 2940 * 60000).toISOString(), '会议室', '在线调解技能培训', 1],
    ['孙某消费维权咨询', 5, 5, 'consultation', 'scheduled', new Date(now.getTime() + 4320 * 60000).toISOString(), new Date(now.getTime() + 4380 * 60000).toISOString(), '接待室', null, 5],
    ['刘某与周某邻里纠纷调解', null, 2, 'mediation', 'completed', new Date(now.getTime() - 4320 * 60000).toISOString(), new Date(now.getTime() - 4200 * 60000).toISOString(), '调解室C', '已成功调解', 2]
  ];
  const scInsert = db.transaction((rows) => {
    for (const s of rows) insertSchedule.run(...s);
  });
  scInsert(schedules);

  const insertFeedback = db.prepare(
    `INSERT INTO feedbacks (case_id, party_id, rating, attitude_score, efficiency_score, fairness_score, comment, is_anonymous) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const feedbacks = [
    [1, 1, 5, 5, 5, 5, '调解员非常专业，耐心细致，公正客观，非常满意！', 0],
    [1, 2, 4, 5, 4, 4, '调解过程很规范，调解员态度很好，就是时间稍长了一些。', 0],
    [2, 3, 5, 5, 5, 5, '非常感谢调解员的帮助，问题得到了圆满解决。', 0],
    [2, 4, 3, 4, 3, 3, '调解结果可以接受，但效率有待提高，等了较长时间。', 1],
    [3, 5, 4, 4, 5, 4, '调解员专业能力强，对法律条文解释清楚，效率高。', 0],
    [3, 6, 5, 5, 4, 5, '公正公平，调解员站在双方角度考虑问题，非常满意。', 0],
    [4, 7, 4, 4, 4, 5, '调解过程公正，但沟通可以更主动一些。', 1],
    [4, 8, 5, 5, 5, 5, '调解员非常负责任，多次协调双方，最终达成一致。', 0],
    [5, 9, 3, 3, 3, 4, '调解态度一般，效率不太高，但还算公正。', 1],
    [5, 10, 4, 5, 4, 4, '整体满意，调解员态度很好，耐心解答各种问题。', 0],
    [8, 1, 5, 5, 5, 5, '非常满意的调解服务', 1],
    [8, 2, 3, 4, 3, 3, '调解过程有些长，但结果可以接受', 1]
  ];
  const fbInsert = db.transaction((rows) => {
    for (const f of rows) insertFeedback.run(...f);
  });
  fbInsert(feedbacks);

  const insertFinance = db.prepare(
    `INSERT INTO case_finance (case_id, loan_contract_number, loan_amount, loan_balance, loan_interest_rate, loan_penalty_rate, loan_start_date, loan_due_date, loan_term_months, loan_purpose, repayment_method, collateral_type, collateral_description, collateral_value, guarantor_name, guarantor_id_number, guarantor_phone, overdue_days, overdue_principal, overdue_interest, total_claim_amount, interest_calculated_to, litigation_stage, collection_status, institution_name, institution_contact, institution_contact_phone, risk_level, write_off_status, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const finances = [
    [1, 'HT-2023-001', 500000, 320000, 4.35, 8.7, '2023-01-15', '2025-01-15', 24, '经营周转', 'equal_installment', 'real_estate', '位于XX区XX路XX号住宅一套', 800000, '王某某', '310XXXXXXXX', '13900001111', 90, 180000, 6525, 326525, '2025-03-15', 'pre_litigation', 'in_progress', 'XX银行XX支行', '李经理', '021-12345678', 'concern', 'none', '借款人因经营困难逾期，已进行电话催收'],
    [2, 'HT-2023-045', 200000, 150000, 3.85, 7.7, '2023-06-01', '2024-12-01', 18, '消费贷款', 'equal_principal', 'vehicle', '沪A-XXXXX轿车一辆', 150000, '', '', '', 45, 80000, 1540, 81540, '2025-02-01', 'none', 'in_progress', 'XX消费金融', '张经理', '021-87654321', 'substandard', 'none', '借款人失联，已委托第三方催收'],
    [5, 'HT-2024-012', 1000000, 750000, 4.75, 9.5, '2024-01-10', '2027-01-10', 36, '企业经营', 'bullet', 'guarantee', '第三方担保', 0, '赵某某', '310YYYYYYYY', '13800005555', 30, 200000, 9375, 759375, '2025-04-10', 'none', 'not_started', 'XX商业银行', '王经理', '021-55556666', 'normal', 'none', '企业暂时性资金周转困难']
  ];
  const finInsert = db.transaction((rows) => {
    for (const f of rows) insertFinance.run(...f);
  });
  finInsert(finances);

  const insertStage = db.prepare(
    `INSERT INTO case_stages (case_id, stage_name, stage_type, status, start_date, end_date, responsible_person, description, result, amount_involved)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const stages = [
    [1, '电话催收', 'collection', 'completed', '2025-01-16', '2025-02-28', '催收员A', '对借款人进行电话催收，共联系15次', '借款人承诺还款但未履行', 326525],
    [1, '上门催收', 'collection', 'completed', '2025-03-01', '2025-03-15', '催收员A', '上门走访借款人住所和经营场所', '借款人经营困难，提出分期还款方案', 326525],
    [1, '诉前调解', 'negotiation', 'in_progress', '2025-03-16', null, '调解员李某某', '组织双方进行诉前调解', null, 326525],
    [1, '诉讼准备', 'litigation', 'pending', null, null, '法务部', '准备诉讼材料，评估诉讼风险', null, 326525],
    [2, '短信催收', 'collection', 'completed', '2024-12-15', '2025-01-10', '系统自动', '发送催收短信通知', '借款人已读未回复', 81540],
    [2, '电话催收', 'collection', 'completed', '2025-01-11', '2025-02-15', '催收员B', '多次电话联系借款人', '前3次接听后失联', 81540],
    [2, '委外催收', 'collection', 'in_progress', '2025-02-16', null, 'XX催收公司', '委托第三方催收机构处理', '正在查找借款人下落', 81540],
    [5, '贷后检查', 'collection', 'completed', '2024-06-01', '2024-12-31', '客户经理C', '定期贷后检查，了解企业经营状况', '发现企业资金链紧张', 759375],
    [5, '协商还款', 'negotiation', 'in_progress', '2025-01-15', null, '调解员张某某', '与企业协商调整还款计划', null, 759375]
  ];
  const stgInsert = db.transaction((rows) => {
    for (const s of rows) insertStage.run(...s);
  });
  stgInsert(stages);

  console.log('Database seeded successfully!');
  return db;
}

module.exports = { seed };
