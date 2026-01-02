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
      // API调用失败时，使用模拟数据作为备选方案
      const mockCases = [
        {
          id: '1',
          title: '合同纠纷案',
          clientName: '张三',
          status: 'processing',
          updateTime: '2025-12-30'
        },
        {
          id: '2',
          title: '劳动争议案',
          clientName: '李四',
          status: 'pending',
          updateTime: '2025-12-29'
        }
      ];
      
      const mockTasks = [
        {
          id: '1',
          title: '准备庭审材料',
          startTime: '2025-12-31 09:00'
        },
        {
          id: '2',
          title: '会见客户',
          startTime: '2025-12-31 14:00'
        }
      ];
      
      this.setData({
        recentCases: mockCases,
        upcomingTasks: mockTasks,
        messageCount: 2
      });
      
      wx.showToast({
        title: '加载失败，使用模拟数据',
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

  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/info/info'
    });
  }
});
