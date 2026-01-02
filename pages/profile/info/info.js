// pages/profile/info/info.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    userInfo: null,
    loading: true
  },

  onLoad() {
    // 检查登录状态
    this.checkLogin();
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '个人中心'
    });
    this.loadUserInfo();
  },

  checkLogin() {
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      // 模拟数据加载，避免调用真实API
      const mockUserInfo = {
        id: '1',
        name: '张明',
        role: 'lawyer',
        email: 'zhangming@example.com',
        phone: '13800138000',
        avatar: '',
        department: '民事法律部',
        position: '高级律师',
        joinDate: '2020-01-15',
        casesCount: 128,
        clientsCount: 85,
        rating: 4.8
      };
      
      // 更新全局数据
      const app = getApp();
      app.globalData.userInfo = mockUserInfo;
      
      // 更新本地存储
      wx.setStorageSync('userInfo', mockUserInfo);
      
      this.setData({
        userInfo: mockUserInfo,
        loading: false
      });
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleEdit() {
    console.log('点击编辑按钮，准备跳转到编辑页面');
    wx.navigateTo({
      url: '/pages/profile/edit/edit',
      success: () => {
        console.log('跳转成功');
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  handleSettings() {
    wx.navigateTo({
      url: '/pages/profile/settings/settings'
    });
  },

  handleAbout() {
    wx.navigateTo({
      url: '/pages/profile/about/about'
    });
  },

  handleHelp() {
    wx.showToast({
      title: '帮助中心开发中',
      icon: 'none'
    });
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Auth.logout();
        }
      }
    });
  }
});