// 和调 · 调解机构管理平台 - 微信小程序
App({
  globalData: {
    userInfo: null,
    token: null,
    API_BASE: 'https://www.zhfcy.cn/tiaojie/api',
    // 开发环境可切换为: 'http://www.zhfcy.cn/tiaojie/api'
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.checkAuth();
    }
  },

  checkAuth() {
    const that = this;
    wx.request({
      url: this.globalData.API_BASE + '/auth/me',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + this.globalData.token },
      success(res) {
        if (res.data && res.data.success) {
          that.globalData.userInfo = res.data.data;
        } else {
          that.logout();
        }
      },
      fail() {
        that.logout();
      }
    });
  },

  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.reLaunch({ url: '/pages/login/login' });
  }
});
