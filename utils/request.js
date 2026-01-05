// utils/request.js
const config = require('../config/index.js');

class Request {
  constructor() {
    this.baseURL = config.apiBaseUrl;
    this.timeout = 30000;
  }

  request(options) {
    const { url, method = 'GET', data = {}, header = {} } = options;
    const token = wx.getStorageSync('token');

    // 如果apiBaseUrl为空，直接返回错误
    if (!this.baseURL) {
      return Promise.reject(new Error('API地址未配置'));
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + url,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...header
        },
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 200) {
              resolve(res.data);
            } else if (res.data.code === 401) {
              this.handleUnauthorized();
              reject(new Error('未授权'));
            } else {
              reject(new Error(res.data.message || '请求失败'));
            }
          } else {
            reject(new Error('网络错误'));
          }
        },
        fail: (err) => {
          reject(new Error('网络请求失败'));
        }
      });
    });
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data });
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data });
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data });
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data });
  }

  handleUnauthorized() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.reLaunch({
      url: '/pages/auth/login/login'
    });
  }
}

module.exports = new Request();
