// pages/clients/create/create.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    clientId: null,
    formData: {
      name: '',
      phone: '',
      email: '',
      status: 'new',
      type: 'individual',
      remark: ''
    },
    loading: false,
    statusOptions: [
      { value: 'new', label: '新客户' },
      { value: 'active', label: '活跃' },
      { value: 'inactive', label: '不活跃' }
    ],
    typeOptions: [
      { value: 'individual', label: '个人' },
      { value: 'company', label: '企业' }
    ]
  },

  onLoad(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '添加客户'
    });
    
    // 检查是否有客户ID（编辑模式）
    if (options.id) {
      this.setData({
        clientId: options.id
      });
      this.loadClientDetail(options.id);
    }
  },

  // 加载客户详情（编辑模式）
  async loadClientDetail(clientId) {
    try {
      this.setData({ loading: true });
      
      // 模拟数据加载，实际项目中应调用真实API
      const mockClientDetail = {
        id: clientId,
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        status: 'active',
        type: 'individual',
        remark: '这是一个测试客户',
        caseCount: 5,
        lastContact: '2025-12-29'
      };
      
      this.setData({
        formData: mockClientDetail,
        loading: false
      });
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '编辑客户'
      });
    } catch (err) {
      console.error('加载客户详情失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 处理输入变化
  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 处理状态变化
  handleStatusChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      'formData.status': status
    });
  },

  // 处理类型变化
  handleTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.type': type
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    
    if (!formData.name || formData.name.trim() === '') {
      wx.showToast({
        title: '请输入客户姓名',
        icon: 'none'
      });
      return false;
    }
    
    // 手机号格式验证
    if (formData.phone && !this.isValidPhone(formData.phone)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none'
      });
      return false;
    }
    
    // 邮箱格式验证
    if (formData.email && !this.isValidEmail(formData.email)) {
      wx.showToast({
        title: '请输入有效的邮箱地址',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 验证手机号格式
  isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  // 验证邮箱格式
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 提交表单
  async handleSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const { clientId, formData } = this.data;
      
      // 模拟保存数据，实际项目中应调用真实API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 显示成功提示
      wx.showToast({
        title: clientId ? '编辑成功' : '添加成功',
        icon: 'success'
      });
      
      // 返回客户列表页面
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
      this.setData({ loading: false });
    }
  },

  // 返回上一页
  handleBack() {
    wx.navigateBack();
  },

  // 返回客户列表
  goToClientList() {
    wx.redirectTo({
      url: '/pages/clients/list/list'
    });
  }
});