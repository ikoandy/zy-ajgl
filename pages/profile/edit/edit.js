// pages/profile/edit/edit.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    userInfo: null,
    loading: false
  },

  onLoad(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '编辑个人信息'
    });
    
    // 加载用户信息
    this.loadUserInfo();
  },

  checkLogin() {
    // 在模拟环境中暂时跳过登录检查
    // if (!Auth.isLogin()) {
    //   wx.redirectTo({
    //     url: '/pages/auth/login/login'
    //   });
    //   return;
    // }
  },

  loadUserInfo() {
    try {
      // 从全局数据或本地存储获取用户信息
      const app = getApp();
      let userInfo = app.globalData.userInfo;
      
      if (!userInfo) {
        // 从本地存储获取
        userInfo = wx.getStorageSync('userInfo');
      }
      
      if (userInfo) {
        this.setData({
          userInfo: { ...userInfo }
        });
      } else {
        // 使用模拟数据
        this.setData({
          userInfo: {
            id: '1',
            name: '张明',
            role: 'lawyer',
            email: 'zhangming@example.com',
            phone: '13800138000',
            avatar: '',
            department: '民事法律部',
            position: '高级律师',
            joinDate: '2020-01-15',
            casesCount: 128,
            clientsCount: 85,
            rating: 4.8
          }
        });
      }
    } catch (err) {
      console.error('加载用户信息失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 处理输入变化
  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`userInfo.${field}`]: value
    });
  },

  // 处理头像上传
  handleAvatarUpload() {
    const that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 模拟上传头像
        that.setData({
          loading: true
        });
        
        // 模拟上传延迟
        setTimeout(() => {
          // 在实际项目中，这里应该调用上传头像的API
          // 这里使用临时路径作为头像URL
          that.setData({
            [`userInfo.avatar`]: tempFilePath,
            loading: false
          });
          
          wx.showToast({
            title: '头像上传成功',
            icon: 'success'
          });
        }, 1000);
      },
      fail(err) {
        console.error('选择头像失败', err);
      }
    });
  },

  // 保存编辑信息
  handleSave() {
    const { userInfo } = this.data;
    
    // 表单验证
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      loading: true
    });
    
    // 模拟保存数据
    setTimeout(() => {
      try {
        // 更新全局数据
        const app = getApp();
        app.globalData.userInfo = userInfo;
        
        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        // 显示成功提示
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } catch (err) {
        console.error('保存失败', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  // 表单验证
  validateForm() {
    const { userInfo } = this.data;
    
    if (!userInfo.name || userInfo.name.trim() === '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return false;
    }
    
    if (!userInfo.department || userInfo.department.trim() === '') {
      wx.showToast({
        title: '请输入部门',
        icon: 'none'
      });
      return false;
    }
    
    if (!userInfo.position || userInfo.position.trim() === '') {
      wx.showToast({
        title: '请输入职位',
        icon: 'none'
      });
      return false;
    }
    
    // 邮箱格式验证
    if (userInfo.email && !this.isValidEmail(userInfo.email)) {
      wx.showToast({
        title: '请输入有效的邮箱地址',
        icon: 'none'
      });
      return false;
    }
    
    // 手机号格式验证
    if (userInfo.phone && !this.isValidPhone(userInfo.phone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 验证邮箱格式
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 验证手机号格式
  isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 返回上一页
  handleBack() {
    wx.navigateBack();
  }
});