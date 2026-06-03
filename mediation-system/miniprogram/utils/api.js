const app = getApp();

function request(options) {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token;
    const header = Object.assign({
      'Content-Type': 'application/json',
      'Authorization': token ? 'Bearer ' + token : ''
    }, options.header || {});

    wx.request({
      url: app.globalData.API_BASE + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success(res) {
        if (res.statusCode === 401) {
          app.logout();
          reject({ code: 401, message: '登录已过期' });
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || { message: '请求失败' });
        }
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none', duration: 1500 });
        reject(err);
      }
    });
  });
}

module.exports = {
  get(url, data) { return request({ url, method: 'GET', data }); },
  post(url, data) { return request({ url, method: 'POST', data }); },
  put(url, data) { return request({ url, method: 'PUT', data }); },
  delete(url) { return request({ url, method: 'DELETE' }); }
};
