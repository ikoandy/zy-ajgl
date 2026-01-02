// utils/storage.js
class Storage {
  static set(key, value, expire = 3600) {
    const data = {
      value,
      expire: Date.now() + expire * 1000
    };
    wx.setStorageSync(key, JSON.stringify(data));
  }

  static get(key) {
    const data = wx.getStorageSync(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    if (Date.now() > parsed.expire) {
      wx.removeStorageSync(key);
      return null;
    }

    return parsed.value;
  }

  static remove(key) {
    wx.removeStorageSync(key);
  }

  static clear() {
    wx.clearStorageSync();
  }
}

module.exports = Storage;
