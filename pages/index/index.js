// pages/index/index.js
const api = require('../../api/index');
const Auth = require('../../utils/auth');
const store = require('../../store/app');

Page({
  data: {
    userInfo: null,
    recentCases: [],
    upcomingTasks: [],
    messageCount: 0,
    loading: false,
    refreshing: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLogin();
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '首页'
    });
  },

  onShow() {
    // 页面显示时刷新数据
    if (Auth.isLogin()) {
      this.loadData();
    }
  },

  checkLogin() {
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
    this.setData({
      userInfo: Auth.getUserInfo()
    });
  },

  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 真实API调用
      const [casesRes, tasksRes, messagesRes] = await Promise.all([
        api.case.list({ limit: 5, status: 'all' }),
        api.schedule.list({ type: 'upcoming', limit: 5 }),
        api.message.list({ status: 'unread', count: true })
      ]);
      
      this.setData({
        recentCases: casesRes.data || [],
        upcomingTasks: tasksRes.data || [],
        messageCount: messagesRes.data.count || 0
      });
    } catch (err) {
      console.error('加载数据失败', err);
      // 初始化空数据
      this.setData({
        recentCases: [],
        upcomingTasks: [],
        messageCount: 0
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleRefresh() {
    this.setData({ refreshing: true });
    this.loadData().finally(() => {
      this.setData({ refreshing: false });
    });
  },

  goToCaseList() {
    wx.switchTab({
      url: '/pages/cases/list/list'
    });
  },

  goToClientList() {
    wx.switchTab({
      url: '/pages/clients/list/list'
    });
  },

  goToMessageList() {
    wx.switchTab({
      url: '/pages/messages/list/list'
    });
  },

  goToSchedule() {
    wx.navigateTo({
      url: '/pages/schedule/calendar/calendar'
    });
  },

  goToCaseDetail(e) {
    const caseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cases/detail/detail?id=${caseId}`
    });
  },

  goToTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/task/task?id=${taskId}`
    });
  },

  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/info/info'
    });
  }
});
