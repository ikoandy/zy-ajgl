// pages/profile/settings/settings.js
const Auth = require('../../../utils/auth');

Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '设置'
    });
  },

  /**
   * 处理编辑资料
   */
  handleEditProfile() {
    wx.showToast({
      title: '编辑资料功能开发中',
      icon: 'none'
    });
  },

  /**
   * 处理修改密码
   */
  handleChangePassword() {
    wx.showToast({
      title: '修改密码功能开发中',
      icon: 'none'
    });
  },

  /**
   * 处理消息通知设置
   */
  handleNotification() {
    wx.showToast({
      title: '消息通知功能开发中',
      icon: 'none'
    });
  },

  /**
   * 处理语言设置
   */
  handleLanguage() {
    wx.showToast({
      title: '语言设置功能开发中',
      icon: 'none'
    });
  },

  /**
   * 处理主题设置
   */
  handleTheme() {
    wx.showToast({
      title: '主题设置功能开发中',
      icon: 'none'
    });
  },

  /**
   * 处理清除缓存
   */
  handleClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟清除缓存
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 处理关于我们
   */
  handleAbout() {
    wx.navigateTo({
      url: '/pages/profile/about/about'
    });
  },

  /**
   * 处理退出登录
   */
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
})