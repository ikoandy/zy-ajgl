// config/api.js
module.exports = {
  // 用户相关
  user: {
    login: '/user/login',
    loginWithAccount: '/user/login-with-account',
    profile: '/user/profile',
    update: '/user/update',
    sendCode: '/user/send-code',
    register: '/user/register'
  },
  // 案件相关
  case: {
    list: '/cases',
    detail: '/cases/detail',
    create: '/cases/create',
    update: '/cases/update',
    updateStatus: '/cases/status',
    delete: '/cases/delete'
  },
  // 客户相关
  client: {
    list: '/clients',
    detail: '/clients/detail',
    followRecords: '/clients/follow-records',
    createFollowRecord: '/clients/follow-records/create'
  },
  // 文档相关
  document: {
    list: '/documents',
    upload: '/documents/upload',
    detail: '/documents/detail',
    download: '/documents/download'
  },
  // 消息相关
  message: {
    list: '/messages',
    detail: '/messages/detail',
    send: '/messages/send',
    history: '/messages/history'
  },
  // 日程相关
  schedule: {
    list: '/schedule',
    detail: '/schedule/detail',
    create: '/schedule/create',
    update: '/schedule/update',
    delete: '/schedule/delete',
    updateStatus: '/schedule/status',
    byCase: '/schedule/by-case',
    byClient: '/schedule/by-client'
  },
  // 费用相关
  fee: {
    list: '/fees',
    detail: '/fees/detail',
    byCase: '/fees/by-case'
  },
  // 预约相关
  appointment: {
    list: '/appointments',
    create: '/appointments/create',
    update: '/appointments/update',
    cancel: '/appointments/cancel'
  },
  // 统计相关
  statistics: {
    case: '/statistics/case',
    fee: '/statistics/fee',
    appointment: '/statistics/appointment'
  },
  // 错误上报
  error: {
    report: '/error/report'
  }
};
