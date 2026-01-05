// pages/auth/login/login.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    loading: false,
    loginType: 'wechat', // wechat 或 account
    account: '',
    password: ''
  },

  onLoad() {
    // 让用户能看到登录页面
  },

  // 切换登录方式
  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      loginType: type,
      account: '',
      password: ''
    });
  },

  // 微信登录
  handleWechatLogin() {
    this.setData({ loading: true });

    wx.login({
      success: (res) => {
        if (res.code) {
          this.loginWithCode(res.code);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },

  async loginWithCode(code) {
    try {
      // 真实API调用
      const res = await api.user.login({ code });
      
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.userInfo);
      
      // 更新App实例的globalData.userInfo
      const app = getApp();
      app.globalData.userInfo = res.data.userInfo;
      app.store.setUser(res.data.userInfo);

      // 重置loading状态
      this.setData({ loading: false });

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 立即跳转，不延迟，使用reLaunch确保能跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    } catch (err) {
      console.error('登录失败', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },

  // 账号输入
  handleAccountInput(e) {
    this.setData({ account: e.detail.value });
  },

  // 密码输入
  handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 账号密码登录
  handleAccountLogin() {
    const { account, password } = this.data;
    
    if (!account) {
      wx.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    
    console.log('开始登录，账号：', account, '密码：', password);
    this.setData({ loading: true });
    
    this.loginWithAccount(account, password);
  },

  async loginWithAccount(account, password) {
    try {
      // 真实API调用
      const res = await api.user.loginWithAccount({ account, password });
      
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.userInfo);
      
      // 更新App实例的globalData.userInfo
      const app = getApp();
      app.globalData.userInfo = res.data.userInfo;
      app.store.setUser(res.data.userInfo);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 重置loading状态
      this.setData({ loading: false });

      // 立即跳转，不延迟
      wx.reLaunch({
        url: '/pages/index/index'
      });
    } catch (err) {
      console.error('登录失败：', err);
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 忘记密码（暂时注释，页面未创建）
  handleForgotPassword() {
    // wx.navigateTo({
    //   url: '/pages/auth/forgot-password/forgot-password'
    // });
    wx.showToast({
      title: '该功能暂未开放',
      icon: 'none'
    });
  },

  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/auth/register/register'
    });
  }
});
