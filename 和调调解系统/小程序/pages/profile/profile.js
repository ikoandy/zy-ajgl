const app = getApp();
const api = require('../../utils/api');

const ROLE_DISPLAY = {
  super_admin: '超级管理员', org_admin: '机构管理员',
  senior_mediator: '高级调解员', mediator: '调解员', staff: '工作人员'
};

Page({
  data: {
    userInfo: {}, nameInitial: '', roleDisplay: '', stats: {}
  },

  onShow() {
    const u = app.globalData.userInfo || {};
    this.setData({
      userInfo: u,
      nameInitial: (u.real_name || 'U').charAt(0),
      roleDisplay: ROLE_DISPLAY[u.role_display_name] || u.role_display_name || ''
    });
  },

  goSettings() { wx.showToast({ title: 'PC端管理', icon: 'none' }); },
  showAbout() {
    wx.showModal({
      title: '和调 · 调解机构管理平台',
      content: '版本：v1.0.0\n平台：微信小程序\n后端：Node.js + SQLite\n\n和调，让调解更高效。',
      showCancel: false, confirmText: '知道了'
    });
  },

  changePassword() {
    wx.showModal({
      title: '修改密码',
      content: '请前往PC端修改密码，或联系管理员重置。',
      confirmText: '知道了', showCancel: false
    });
  },

  doLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将无法使用系统功能',
      success: (res) => { if (res.confirm) app.logout(); }
    });
  }
});
