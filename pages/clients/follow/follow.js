// pages/clients/follow/follow.js
const api = require('../../../api/index');

Page({
  data: {
    clientId: '',
    formData: {
      type: 'call',
      content: '',
      result: '',
      nextFollowDate: ''
    },
    loading: false
  },

  onLoad(options) {
    const { clientId } = options;
    if (clientId) {
      this.setData({ clientId });
    }
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  handleTypeChange(e) {
    this.setData({
      'formData.type': e.detail.value
    });
  },

  handleDateChange(e) {
    this.setData({
      'formData.nextFollowDate': e.detail.value
    });
  },

  validateForm() {
    const { formData } = this.data;
    if (!formData.content) {
      wx.showToast({ title: '请输入跟进内容', icon: 'none' });
      return false;
    }
    if (!formData.result) {
      wx.showToast({ title: '请输入跟进结果', icon: 'none' });
      return false;
    }
    return true;
  },

  async handleSubmit() {
    if (!this.validateForm()) return;

    this.setData({ loading: true });

    try {
      await api.client.createFollowRecord({
        clientId: this.data.clientId,
        ...this.data.formData
      });
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: err.message || '添加失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});