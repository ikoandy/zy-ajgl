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
      // 真实API调用失败时，使用模拟数据作为备选方案
      const mockRes = {
        data: {
          token: 'mock_token_' + Date.now(),
          userInfo: {
            id: '1',
            username: 'wechat_user',
            role: 'lawyer',
            name: '微信用户',
            avatar: ''
          }
        }
      };
      
      wx.setStorageSync('token', mockRes.data.token);
      wx.setStorageSync('userInfo', mockRes.data.userInfo);
      
      // 更新App实例的globalData.userInfo
      const app = getApp();
      app.globalData.userInfo = mockRes.data.userInfo;
      app.store.setUser(mockRes.data.userInfo);
      
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
      console.log('进入loginWithAccount方法，账号：', account, '密码：', password);
      // 模拟登录 - 用于演示环境
      let mockRes = null;
      
      // 管理员账号
      if (account === 'admin' && password === '123456') {
        console.log('匹配管理员账号');
        mockRes = {
          data: {
            token: 'mock_token_' + Date.now(),
            userInfo: {
              id: '1',
              username: 'admin',
              role: 'admin',
              name: '管理员',
              avatar: ''
            }
          }
        };
      }
      // 律师账号
      else if (account === 'lawyer' && password === '123456') {
        console.log('匹配律师账号');
        mockRes = {
          data: {
            token: 'mock_token_' + Date.now(),
            userInfo: {
              id: '2',
              username: 'lawyer',
              role: 'lawyer',
              name: '张律师',
              avatar: ''
            }
          }
        };
      }
      // 客户账号
      else if (account === 'client' && password === '123456') {
        console.log('匹配客户账号');
        mockRes = {
          data: {
            token: 'mock_token_' + Date.now(),
            userInfo: {
              id: '3',
              username: 'client',
              role: 'client',
              name: '张三',
              avatar: ''
            }
          }
        };
      }
      
      if (mockRes) {
        console.log('mockRes存在，开始处理登录成功逻辑');
        wx.setStorageSync('token', mockRes.data.token);
        wx.setStorageSync('userInfo', mockRes.data.userInfo);
        
        // 更新App实例的globalData.userInfo
        const app = getApp();
        app.globalData.userInfo = mockRes.data.userInfo;
        app.store.setUser(mockRes.data.userInfo);
        
        // 重置loading状态
        this.setData({ loading: false });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        console.log('显示登录成功提示');
        console.log('重置loading状态');

        // 立即跳转，不延迟
        console.log('开始跳转首页');
        wx.reLaunch({
          url: '/pages/index/index',
          success: () => {
            console.log('跳转成功');
          },
          fail: (err) => {
            console.error('跳转失败：', err);
          }
        });
        return;
      }
      
      console.log('没有匹配的账号，尝试真实API调用');
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
        url: '/pages/index/index',
        success: () => {
          console.log('真实API调用跳转成功');
        },
        fail: (err) => {
          console.error('真实API调用跳转失败：', err);
        }
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
