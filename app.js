//app.js
const store = require('./store/app');
const api = require('./api/index');
const Auth = require('./utils/auth');

App({
  store,
  globalData: {
    userInfo: null
  },
  
  onLaunch: function () {
    // 初始化应用
    this.initApp();
    // 设置全局错误处理
    this.setupErrorHandler();
    // 设置消息推送
    this.setupMessagePush();
  },
  
  initApp() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.globalData.userInfo = userInfo;
      this.store.setUser(userInfo);
    }
    
    // 记录日志
    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
  },
  
  setupErrorHandler() {
    // 全局错误处理
    this.onError = (error) => {
      console.error('全局错误', error);
      
      wx.showModal({
        title: '系统错误',
        content: '系统发生错误，请稍后重试',
        showCancel: false
      });

      this.reportError(error);
    };
  },
  
  setupMessagePush() {
    // 微信小程序中没有wx.onMessage API，使用WebSocket或订阅消息
    // 这里实现订阅消息设置
    // 暂时注释，避免启动时自动调用订阅消息API
    // this.setupSubscribeMessage();
  },
  
  setupSubscribeMessage() {
    // 设置订阅消息，用于接收系统通知
    // 实际使用时替换为真实的模板ID
    /*wx.requestSubscribeMessage({
      tmplIds: ['template-id-1', 'template-id-2'],
      success: (res) => {
        console.log('订阅成功', res);
      },
      fail: (err) => {
        console.error('订阅失败', err);
      }
    });*/
  },
  
  handleCaseStatusChange(data) {
    wx.showModal({
      title: '案件状态变更',
      content: `案件"${data.caseTitle}"状态已变更为"${data.status}"`,
      showCancel: false
    });
  },
  
  handleNewMessage(data) {
    wx.showToast({
      title: '收到新消息',
      icon: 'none'
    });
  },
  
  handleTaskReminder(data) {
    wx.showModal({
      title: '任务提醒',
      content: data.content,
      showCancel: false
    });
  },
  
  reportError(error) {
    // 调用API进行错误上报
    api.error.report({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.error('上报错误失败', err);
      // 上报失败时，仅在控制台输出错误信息
      console.error('全局错误上报:', error);
    });
  }
})