// utils/auth.js
class Auth {
  static getToken() {
    return wx.getStorageSync('token');
  }

  static getUserInfo() {
    return wx.getStorageSync('userInfo');
  }

  static isLogin() {
    return !!this.getToken();
  }

  static logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.reLaunch({
      url: '/pages/auth/login/login'
    });
  }

  // 检查用户角色
  static getUserRole() {
    const userInfo = this.getUserInfo();
    return userInfo ? userInfo.role : null;
  }

  // 检查是否为律师
  static isLawyer() {
    return this.getUserRole() === 'lawyer';
  }

  // 检查是否为管理员
  static isAdmin() {
    return this.getUserRole() === 'admin';
  }

  // 检查权限
  static checkPermission(requiredRole) {
    const userInfo = this.getUserInfo();
    if (!userInfo) return false;
    
    // 管理员拥有所有权限
    if (userInfo.role === 'admin') return true;
    
    // 检查是否为所需角色
    return userInfo.role === requiredRole;
  }
}

module.exports = Auth;
