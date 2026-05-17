const { getDb } = require('../db');

const PUSH_PROVIDER_CONFIGS = {
  tencent_sms: {
    name: 'tencent_sms',
    display_name: '腾讯云短信',
    description: '腾讯云SMS短信服务，支持国内/国际短信、营销短信、验证码短信',
    api_endpoint_default: 'https://sms.tencentcloudapi.com',
    channel: 'sms',
    fields: [
      { key: 'app_id', label: 'SdkAppId', type: 'text', required: true },
      { key: 'secret_key', label: 'SecretKey', type: 'password', required: true },
      { key: 'sign_name', label: '短信签名', type: 'text', required: true },
      { key: 'template_code', label: '模板ID', type: 'text', required: false },
      { key: 'region', label: '地域 (如 ap-guangzhou)', type: 'text', required: false }
    ],
    packages: [
      { id: 'starter', name: '体验版', daily_limit: 200, price: '¥0.045/条' },
      { id: 'standard', name: '标准版', daily_limit: 5000, price: '¥0.040/条' },
      { id: 'enterprise', name: '企业版', daily_limit: 50000, price: '¥0.035/条' }
    ],
    features: ['国内短信', '国际短信', '营销短信', '验证码短信', '通知短信', '短信签名', '模板管理', '发送回执']
  },
  aliyun_sms: {
    name: 'aliyun_sms',
    display_name: '阿里云短信',
    description: '阿里云短信服务，支持验证码、短信通知、推广短信',
    api_endpoint_default: 'https://dysmsapi.aliyuncs.com',
    channel: 'sms',
    fields: [
      { key: 'app_id', label: 'AccessKey ID', type: 'text', required: true },
      { key: 'secret_key', label: 'AccessKey Secret', type: 'password', required: true },
      { key: 'sign_name', label: '短信签名', type: 'text', required: true },
      { key: 'template_code', label: '模板Code', type: 'text', required: false },
      { key: 'region', label: '地域 (如 cn-hangzhou)', type: 'text', required: false }
    ],
    packages: [
      { id: 'starter', name: '入门版', daily_limit: 500, price: '¥0.045/条' },
      { id: 'standard', name: '标准版', daily_limit: 10000, price: '¥0.040/条' },
      { id: 'enterprise', name: '企业版', daily_limit: 100000, price: '¥0.033/条' }
    ],
    features: ['验证码短信', '通知短信', '推广短信', '国际短信', '短信签名', '模板管理', '发送回执', '防骚扰过滤']
  },
  huawei_sms: {
    name: 'huawei_sms',
    display_name: '华为云短信',
    description: '华为云消息通知服务，支持短信发送和状态报告',
    api_endpoint_default: 'https://msgapi.cn-north-4.myhuaweicloud.com',
    channel: 'sms',
    fields: [
      { key: 'app_id', label: 'APP Key', type: 'text', required: true },
      { key: 'secret_key', label: 'APP Secret', type: 'password', required: true },
      { key: 'sign_name', label: '短信签名', type: 'text', required: true },
      { key: 'template_code', label: '模板ID', type: 'text', required: false },
      { key: 'region', label: '地域 (如 cn-north-4)', type: 'text', required: false }
    ],
    packages: [
      { id: 'basic', name: '基础版', daily_limit: 1000, price: '¥0.045/条' },
      { id: 'advanced', name: '进阶版', daily_limit: 20000, price: '¥0.038/条' }
    ],
    features: ['国内短信', '国际短信', '验证码短信', '通知短信', '短信签名', '状态报告', '模板管理']
  },
  tencent_email: {
    name: 'tencent_email',
    display_name: '腾讯云邮件',
    description: '腾讯云SES邮件推送服务，支持模板邮件和自定义邮件',
    api_endpoint_default: 'https://ses.tencentcloudapi.com',
    channel: 'email',
    fields: [
      { key: 'app_id', label: 'SecretId', type: 'text', required: true },
      { key: 'secret_key', label: 'SecretKey', type: 'password', required: true },
      { key: 'sign_name', label: '发信地址', type: 'text', required: true }
    ],
    packages: [
      { id: 'free', name: '免费版', daily_limit: 200, price: '免费' },
      { id: 'standard', name: '标准版', daily_limit: 5000, price: '¥0.002/封' },
      { id: 'enterprise', name: '企业版', daily_limit: 50000, price: '¥0.0015/封' }
    ],
    features: ['模板邮件', '自定义邮件', '收件人分组', '发送统计', '退信处理', '邮件追踪']
  },
  aliyun_email: {
    name: 'aliyun_email',
    display_name: '阿里云邮件',
    description: '阿里云DirectMail邮件推送，支持触发邮件和批量邮件',
    api_endpoint_default: 'https://dm.aliyuncs.com',
    channel: 'email',
    fields: [
      { key: 'app_id', label: 'AccessKey ID', type: 'text', required: true },
      { key: 'secret_key', label: 'AccessKey Secret', type: 'password', required: true },
      { key: 'sign_name', label: '发信地址', type: 'text', required: true }
    ],
    packages: [
      { id: 'free', name: '免费版', daily_limit: 200, price: '免费' },
      { id: 'standard', name: '标准版', daily_limit: 10000, price: '¥0.0018/封' },
      { id: 'enterprise', name: '企业版', daily_limit: 100000, price: '¥0.0012/封' }
    ],
    features: ['触发邮件', '批量邮件', '邮件模板', '收件人列表', '发送统计', '退信处理', '邮件追踪', '标签管理']
  },
  custom_sms: {
    name: 'custom_sms',
    display_name: '自定义短信网关',
    description: '对接自定义短信网关或第三方短信平台',
    api_endpoint_default: '',
    channel: 'sms',
    fields: [
      { key: 'api_endpoint', label: 'API地址', type: 'text', required: true },
      { key: 'app_id', label: '认证ID', type: 'text', required: true },
      { key: 'secret_key', label: '认证密钥', type: 'password', required: true },
      { key: 'sign_name', label: '签名', type: 'text', required: false },
      { key: 'template_code', label: '模板ID', type: 'text', required: false }
    ],
    packages: [],
    features: []
  },
  custom_email: {
    name: 'custom_email',
    display_name: '自定义邮件服务',
    description: '对接自定义SMTP或邮件API服务',
    api_endpoint_default: '',
    channel: 'email',
    fields: [
      { key: 'api_endpoint', label: 'SMTP/API地址', type: 'text', required: true },
      { key: 'app_id', label: '用户名/Key', type: 'text', required: true },
      { key: 'secret_key', label: '密码/Secret', type: 'password', required: true },
      { key: 'sign_name', label: '发信地址', type: 'text', required: true }
    ],
    packages: [],
    features: []
  }
};

function getPushProviderConfigs() {
  return PUSH_PROVIDER_CONFIGS;
}

function getPushProviderConfig(type) {
  return PUSH_PROVIDER_CONFIGS[type] || null;
}

async function sendPush(providerId, phoneNumber, email, title, content, options = {}) {
  const db = getDb();
  const provider = db.prepare("SELECT * FROM push_providers WHERE id = ? AND status = 'active'").get(providerId);
  if (!provider) throw new Error('推送服务商不存在或未启用');

  const startTime = Date.now();
  const logData = {
    provider_id: providerId,
    push_record_id: options.pushRecordId || null,
    action: 'send_push',
    request_data: JSON.stringify({ phone: phoneNumber, email, title, content: content.substring(0, 200) }),
    status: 'success',
    duration_ms: 0
  };

  try {
    let result;
    switch (provider.provider_type) {
      case 'tencent_sms':
        result = await tencentSmsSend(provider, phoneNumber, content, options);
        break;
      case 'aliyun_sms':
        result = await aliyunSmsSend(provider, phoneNumber, content, options);
        break;
      case 'huawei_sms':
        result = await huaweiSmsSend(provider, phoneNumber, content, options);
        break;
      case 'tencent_email':
        result = await tencentEmailSend(provider, email, title, content, options);
        break;
      case 'aliyun_email':
        result = await aliyunEmailSend(provider, email, title, content, options);
        break;
      case 'custom_sms':
        result = await customSmsSend(provider, phoneNumber, content, options);
        break;
      case 'custom_email':
        result = await customEmailSend(provider, email, title, content, options);
        break;
      default:
        throw new Error('不支持的服务商类型');
    }

    logData.response_data = JSON.stringify(result);
    logData.duration_ms = Date.now() - startTime;
    insertPushProviderLog(logData);

    db.prepare('UPDATE push_providers SET monthly_sent = monthly_sent + 1 WHERE id = ?').run(providerId);
    return result;
  } catch (err) {
    logData.status = 'failed';
    logData.error_message = err.message;
    logData.duration_ms = Date.now() - startTime;
    insertPushProviderLog(logData);
    throw err;
  }
}

async function tencentSmsSend(provider, phone, content, options) {
  return {
    success: true,
    provider: 'tencent_sms',
    message_id: 'tencent_sms_' + Date.now(),
    message: '腾讯云短信发送成功',
    phone: phone,
    sign_name: provider.sign_name,
    template_code: provider.template_code || options.template_code,
    note: '模拟调用腾讯云SMS SendSms接口 - 实际部署需配置SDK密钥'
  };
}

async function aliyunSmsSend(provider, phone, content, options) {
  return {
    success: true,
    provider: 'aliyun_sms',
    message_id: 'aliyun_sms_' + Date.now(),
    message: '阿里云短信发送成功',
    phone: phone,
    sign_name: provider.sign_name,
    template_code: provider.template_code || options.template_code,
    note: '模拟调用阿里云SMS SendSms接口 - 实际部署需配置AccessKey'
  };
}

async function huaweiSmsSend(provider, phone, content, options) {
  return {
    success: true,
    provider: 'huawei_sms',
    message_id: 'huawei_sms_' + Date.now(),
    message: '华为云短信发送成功',
    phone: phone,
    sign_name: provider.sign_name,
    note: '模拟调用华为云MSG发送接口 - 实际部署需配置APP Key/Secret'
  };
}

async function tencentEmailSend(provider, email, title, content, options) {
  return {
    success: true,
    provider: 'tencent_email',
    message_id: 'tencent_email_' + Date.now(),
    message: '腾讯云邮件发送成功',
    email: email,
    from: provider.sign_name,
    subject: title,
    note: '模拟调用腾讯云SES SendEmail接口 - 实际部署需配置SecretId/Key'
  };
}

async function aliyunEmailSend(provider, email, title, content, options) {
  return {
    success: true,
    provider: 'aliyun_email',
    message_id: 'aliyun_email_' + Date.now(),
    message: '阿里云邮件发送成功',
    email: email,
    from: provider.sign_name,
    subject: title,
    note: '模拟调用阿里云DirectMail SingleSendMail接口 - 实际部署需配置AccessKey'
  };
}

async function customSmsSend(provider, phone, content, options) {
  return {
    success: true,
    provider: 'custom_sms',
    message_id: 'custom_sms_' + Date.now(),
    message: '自定义短信网关发送成功',
    phone: phone,
    endpoint: provider.api_endpoint,
    note: '模拟调用自定义短信API - 实际部署需配置API地址和认证信息'
  };
}

async function customEmailSend(provider, email, title, content, options) {
  return {
    success: true,
    provider: 'custom_email',
    message_id: 'custom_email_' + Date.now(),
    message: '自定义邮件服务发送成功',
    email: email,
    endpoint: provider.api_endpoint,
    subject: title,
    note: '模拟调用自定义邮件API - 实际部署需配置SMTP/API地址和认证信息'
  };
}

async function syncPushProviderStatus(providerId) {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM push_providers WHERE id = ?').get(providerId);
  if (!provider) throw new Error('服务商不存在');

  const startTime = Date.now();
  const logData = {
    provider_id: providerId,
    action: 'sync_status',
    request_data: JSON.stringify({ provider_type: provider.provider_type }),
    status: 'success',
    duration_ms: 0
  };

  try {
    let result;
    switch (provider.provider_type) {
      case 'tencent_sms':
        result = { balance: 500.00, today_sent: 45, monthly_sent: 890, success_rate: 99.2 };
        break;
      case 'aliyun_sms':
        result = { balance: 380.00, today_sent: 32, monthly_sent: 650, success_rate: 98.8 };
        break;
      case 'huawei_sms':
        result = { balance: 600.00, today_sent: 28, monthly_sent: 520, success_rate: 99.5 };
        break;
      case 'tencent_email':
        result = { balance: 200.00, today_sent: 15, monthly_sent: 280, success_rate: 99.8 };
        break;
      case 'aliyun_email':
        result = { balance: 150.00, today_sent: 12, monthly_sent: 220, success_rate: 99.6 };
        break;
      default:
        result = { balance: 0, today_sent: 0, monthly_sent: 0, success_rate: 0 };
    }

    db.prepare('UPDATE push_providers SET balance = ?, monthly_sent = ?, last_sync_at = ? WHERE id = ?')
      .run(result.balance, result.monthly_sent, new Date().toISOString(), providerId);

    logData.response_data = JSON.stringify(result);
    logData.duration_ms = Date.now() - startTime;
    insertPushProviderLog(logData);
    return result;
  } catch (err) {
    logData.status = 'failed';
    logData.error_message = err.message;
    logData.duration_ms = Date.now() - startTime;
    insertPushProviderLog(logData);
    throw err;
  }
}

function insertPushProviderLog(logData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO push_provider_logs (provider_id, push_record_id, action, request_data, response_data, status, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    logData.provider_id, logData.push_record_id || null,
    logData.action, logData.request_data || null,
    logData.response_data || null, logData.status,
    logData.error_message || null, logData.duration_ms || 0
  );
}

module.exports = {
  getPushProviderConfigs,
  getPushProviderConfig,
  sendPush,
  syncPushProviderStatus
};
