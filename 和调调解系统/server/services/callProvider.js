const { getDb } = require('../db');

const PROVIDER_CONFIGS = {
  tencent: {
    name: 'tencent',
    display_name: '腾讯云呼叫中心',
    description: '腾讯云融合通信呼叫中心，支持SIP外呼、IVR导航、录音等',
    api_endpoint_default: 'https://ccc.tencentcloudapi.com',
    fields: [
      { key: 'app_id', label: '应用ID (SdkAppId)', type: 'text', required: true },
      { key: 'secret_key', label: '密钥 (SecretKey)', type: 'password', required: true },
      { key: 'instance_id', label: '实例ID (InstanceId)', type: 'text', required: true },
      { key: 'sip_number', label: 'SIP号码', type: 'text', required: false }
    ],
    packages: [
      { id: 'basic', name: '基础版', max_concurrent: 5, price: '¥298/月' },
      { id: 'standard', name: '标准版', max_concurrent: 15, price: '¥698/月' },
      { id: 'professional', name: '专业版', max_concurrent: 50, price: '¥1,498/月' },
      { id: 'enterprise', name: '企业版', max_concurrent: 200, price: '¥3,998/月' }
    ],
    features: ['外呼', '呼入', 'IVR导航', '通话录音', '实时监控', '满意度评价', '智能路由', '技能组']
  },
  aliyun: {
    name: 'aliyun',
    display_name: '阿里云呼叫中心',
    description: '阿里云智能呼叫中心，支持智能外呼、语音机器人、全量录音',
    api_endpoint_default: 'https://ccc.aliyuncs.com',
    fields: [
      { key: 'app_id', label: 'AccessKey ID', type: 'text', required: true },
      { key: 'secret_key', label: 'AccessKey Secret', type: 'password', required: true },
      { key: 'instance_id', label: '实例ID', type: 'text', required: true },
      { key: 'sip_number', label: 'SIP号码', type: 'text', required: false }
    ],
    packages: [
      { id: 'starter', name: '启航版', max_concurrent: 5, price: '¥268/月' },
      { id: 'growth', name: '成长版', max_concurrent: 20, price: '¥768/月' },
      { id: 'premium', name: '旗舰版', max_concurrent: 60, price: '¥1,688/月' },
      { id: 'ultimate', name: '至尊版', max_concurrent: 200, price: '¥4,288/月' }
    ],
    features: ['外呼', '呼入', 'IVR导航', '通话录音', '智能外呼', '语音机器人', '全渠道接入', '报表分析']
  },
  huawei: {
    name: 'huawei',
    display_name: '华为云呼叫中心',
    description: '华为云智能客服平台，支持全渠道接入、智能质检',
    api_endpoint_default: 'https://ccc.myhuaweicloud.com',
    fields: [
      { key: 'app_id', label: 'APP Key', type: 'text', required: true },
      { key: 'secret_key', label: 'APP Secret', type: 'password', required: true },
      { key: 'instance_id', label: '租户ID', type: 'text', required: true },
      { key: 'sip_number', label: '接入码', type: 'text', required: false }
    ],
    packages: [
      { id: 'basic', name: '基础版', max_concurrent: 10, price: '¥328/月' },
      { id: 'advanced', name: '进阶版', max_concurrent: 30, price: '¥888/月' },
      { id: 'enterprise', name: '企业版', max_concurrent: 100, price: '¥2,188/月' }
    ],
    features: ['外呼', '呼入', 'IVR导航', '通话录音', '智能质检', '全渠道接入', '预测式外呼', '视频客服']
  },
  custom: {
    name: 'custom',
    display_name: '自定义服务商',
    description: '对接自定义SIP/PBX系统或其他云呼叫服务商',
    api_endpoint_default: '',
    fields: [
      { key: 'api_endpoint', label: 'API地址', type: 'text', required: true },
      { key: 'app_id', label: '认证ID', type: 'text', required: true },
      { key: 'secret_key', label: '认证密钥', type: 'password', required: true },
      { key: 'sip_number', label: 'SIP号码', type: 'text', required: false }
    ],
    packages: [],
    features: []
  }
};

function getProviderConfigs() {
  return PROVIDER_CONFIGS;
}

function getProviderConfig(type) {
  return PROVIDER_CONFIGS[type] || null;
}

async function makeCall(providerId, calleeNumber, options = {}) {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ? AND status = \'active\'').get(providerId);
  if (!provider) {
    throw new Error('服务商不存在或未启用');
  }

  const startTime = Date.now();
  const logData = {
    provider_id: providerId,
    action: 'make_call',
    request_data: JSON.stringify({ callee: calleeNumber, caller: options.callerNumber || provider.sip_number }),
    status: 'success',
    duration_ms: 0
  };

  try {
    let result;
    switch (provider.provider_type) {
      case 'tencent':
        result = await tencentMakeCall(provider, calleeNumber, options);
        break;
      case 'aliyun':
        result = await aliyunMakeCall(provider, calleeNumber, options);
        break;
      case 'huawei':
        result = await huaweiMakeCall(provider, calleeNumber, options);
        break;
      case 'custom':
        result = await customMakeCall(provider, calleeNumber, options);
        break;
      default:
        throw new Error('不支持的服务商类型');
    }

    logData.response_data = JSON.stringify(result);
    logData.duration_ms = Date.now() - startTime;
    insertProviderLog(logData);

    return result;
  } catch (err) {
    logData.status = 'failed';
    logData.error_message = err.message;
    logData.duration_ms = Date.now() - startTime;
    insertProviderLog(logData);
    throw err;
  }
}

async function tencentMakeCall(provider, calleeNumber, options) {
  return {
    success: true,
    provider: 'tencent',
    session_id: 'tencent_' + Date.now(),
    message: '腾讯云外呼请求已发送',
    callee: calleeNumber,
    caller: options.callerNumber || provider.sip_number,
    instance_id: provider.instance_id,
    note: '模拟调用腾讯云CCC CreateCall接口 - 实际部署需配置SDK密钥'
  };
}

async function aliyunMakeCall(provider, calleeNumber, options) {
  return {
    success: true,
    provider: 'aliyun',
    session_id: 'aliyun_' + Date.now(),
    message: '阿里云外呼请求已发送',
    callee: calleeNumber,
    caller: options.callerNumber || provider.sip_number,
    instance_id: provider.instance_id,
    note: '模拟调用阿里云CCC StartCall接口 - 实际部署需配置AccessKey'
  };
}

async function huaweiMakeCall(provider, calleeNumber, options) {
  return {
    success: true,
    provider: 'huawei',
    session_id: 'huawei_' + Date.now(),
    message: '华为云外呼请求已发送',
    callee: calleeNumber,
    caller: options.callerNumber || provider.sip_number,
    instance_id: provider.instance_id,
    note: '模拟调用华为云CCC CallOut接口 - 实际部署需配置APP Key/Secret'
  };
}

async function customMakeCall(provider, calleeNumber, options) {
  return {
    success: true,
    provider: 'custom',
    session_id: 'custom_' + Date.now(),
    message: '自定义服务商外呼请求已发送',
    callee: calleeNumber,
    caller: options.callerNumber || provider.sip_number,
    endpoint: provider.api_endpoint,
    note: '模拟调用自定义API接口 - 实际部署需配置API地址和认证信息'
  };
}

async function syncProviderStatus(providerId) {
  const db = getDb();
  const provider = db.prepare('SELECT * FROM call_providers WHERE id = ?').get(providerId);
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
      case 'tencent':
        result = { balance: 1250.50, active_agents: 3, active_calls: 1, queue_count: 2 };
        break;
      case 'aliyun':
        result = { balance: 980.00, active_agents: 2, active_calls: 1, queue_count: 1 };
        break;
      case 'huawei':
        result = { balance: 2100.00, active_agents: 4, active_calls: 2, queue_count: 0 };
        break;
      default:
        result = { balance: 0, active_agents: 0, active_calls: 0, queue_count: 0 };
    }

    db.prepare('UPDATE call_providers SET balance = ?, last_sync_at = ? WHERE id = ?')
      .run(result.balance, new Date().toISOString(), providerId);

    logData.response_data = JSON.stringify(result);
    logData.duration_ms = Date.now() - startTime;
    insertProviderLog(logData);

    return result;
  } catch (err) {
    logData.status = 'failed';
    logData.error_message = err.message;
    logData.duration_ms = Date.now() - startTime;
    insertProviderLog(logData);
    throw err;
  }
}

function insertProviderLog(logData) {
  const db = getDb();
  db.prepare(`
    INSERT INTO call_provider_logs (provider_id, action, request_data, response_data, status, error_message, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    logData.provider_id,
    logData.action,
    logData.request_data || null,
    logData.response_data || null,
    logData.status,
    logData.error_message || null,
    logData.duration_ms || 0
  );
}

module.exports = {
  getProviderConfigs,
  getProviderConfig,
  makeCall,
  syncProviderStatus
};
