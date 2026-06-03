const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    showPassword: false,
    loading: false,
    errorMsg: ''
  },

  onUsernameInput(e) { this.setData({ username: e.detail.value, errorMsg: '' }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value, errorMsg: '' }); },

  togglePassword() { this.setData({ showPassword: !this.data.showPassword }); },

  async doLogin() {
    const { username, password } = this.data;
    if (!username.trim()) { return wx.showToast({ title: '请输入账号', icon: 'none' }); }
    if (!password) { return wx.showToast({ title: '请输入密码', icon: 'none' }); }

    this.setData({ loading: true, errorMsg: '' });

    try {
      const res = await api.post('/auth/login', { username: username.trim(), password });
      if (res.success && res.data && res.data.token) {
        app.globalData.token = res.data.token;
        app.globalData.userInfo = res.data.user;
        wx.setStorageSync('token', res.data.token);
        wx.switchTab({ url: '/pages/index/index' });
      } else {
        this.setData({ errorMsg: res.message || '登录失败' });
      }
    } catch (err) {
      this.setData({ errorMsg: err.message || '网络异常，请重试' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
