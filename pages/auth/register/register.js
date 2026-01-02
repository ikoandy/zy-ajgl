// pages/auth/register/register.js
const api = require('../../../api/index');

Page({
  data: {
    formData: {
      phone: '',
      password: '',
      confirmPassword: '',
      code: '',
      name: ''
    },
    loading: false,
    countDown: 0
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  async handleSendCode() {
    const { phone } = this.data.formData;
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    try {
      await api.user.sendCode({ phone });
      wx.showToast({ title: '验证码发送成功', icon: 'success' });
      this.startCountDown();
    } catch (err) {
      wx.showToast({ title: err.message || '发送失败', icon: 'none' });
    }
  },

  startCountDown() {
    let count = 60;
    this.setData({ countDown: count });
    const timer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timer);
        this.setData({ countDown: 0 });
      } else {
        this.setData({ countDown: count });
      }
    }, 1000);
  },

  validateForm() {
    const { formData } = this.data;
    if (!formData.phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return false;
    }
    if (!formData.code) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return false;
    }
    if (!formData.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return false;
    }
    if (!formData.name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return false;
    }
    return true;
  },

  async handleRegister() {
    if (!this.validateForm()) return;

    this.setData({ loading: true });

    try {
      await api.user.register(this.data.formData);
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/auth/login/login'
        });
      }, 1500);
    } catch (err) {
      wx.showToast({ title: err.message || '注册失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/auth/login/login'
    });
  }
});