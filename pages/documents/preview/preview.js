// pages/documents/preview/preview.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    document: null,
    loading: true
  },

  onLoad(options) {
    // 检查登录状态
    this.checkLogin();
    
    const { id } = options;
    if (id) {
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '文档预览'
      });
      this.loadDocument(id);
    }
  },

  checkLogin() {
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
  },

  async loadDocument(docId) {
    try {
      const res = await api.document.detail(docId);
      this.setData({
        document: res.data,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleDownload() {
    const { url, name } = this.data.document;
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success: () => {
              console.log('打开文档成功');
            }
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
});