// pages/documents/upload/upload.js
const api = require('../../../api/index');
const config = require('../../../config/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    files: [],
    uploading: false,
    caseId: ''
  },

  onLoad(options) {
    // 检查登录状态
    this.checkLogin();
    
    const { caseId } = options;
    if (caseId) {
      this.setData({ caseId });
    }
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '上传文档'
    });
  },

  checkLogin() {
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
  },

  handleChooseFile() {
    wx.chooseMessageFile({
      count: 9,
      type: 'file',
      success: (res) => {
        const files = res.tempFiles.map(file => ({
          path: file.path,
          name: file.name,
          size: file.size
        }));
        this.setData({
          files: [...this.data.files, ...files]
        });
      }
    });
  },

  handleRemoveFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = this.data.files.filter((_, i) => i !== index);
    this.setData({ files });
  },

  async handleUpload() {
    if (this.data.files.length === 0) {
      wx.showToast({
        title: '请选择文件',
        icon: 'none'
      });
      return;
    }

    this.setData({ uploading: true });

    try {
      for (const file of this.data.files) {
        await this.uploadFile(file);
      }
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    } finally {
      this.setData({ uploading: false });
    }
  },

  async uploadFile(file) {
    const token = wx.getStorageSync('token');
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${config.apiBaseUrl}/documents/upload`,
        filePath: file.path,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        formData: {
          caseId: this.data.caseId,
          fileName: file.name
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(new Error(data.message));
          }
        },
        fail: reject
      });
    });
  }
});