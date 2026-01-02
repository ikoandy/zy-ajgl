// pages/cases/create/create.js
const Auth = require('../../../utils/auth');

Page({
  data: {
    formData: {
      title: '',
      type: '',
      description: '',
      clientName: '',
      priority: 'normal',
      status: 'pending',
      progress: 0,
      expectedEndTime: '',
      responsiblePerson: ''
    },
    // 案件类型选项
    caseTypes: [
      { label: '合同纠纷', value: 'contract' },
      { label: '知识产权', value: 'intellectual' },
      { label: '劳动争议', value: 'labor' },
      { label: '婚姻家庭', value: 'family' },
      { label: '刑事案件', value: 'criminal' },
      { label: '其他', value: 'other' }
    ],
    caseTypesIndex: 0,
    // 优先级选项
    priorityOptions: [
      { label: '高', value: 'high' },
      { label: '中', value: 'normal' },
      { label: '低', value: 'low' }
    ],
    // 状态选项
    statusOptions: [
      { label: '待处理', value: 'pending' },
      { label: '处理中', value: 'processing' },
      { label: '已完成', value: 'completed' },
      { label: '已结案', value: 'closed' }
    ],
    statusIndex: 0,
    statusText: '',
    // 预计完成时间快速选项
    quickDateOptions: [
      { label: '1周', days: 7 },
      { label: '2周', days: 14 },
      { label: '1个月', days: 30 },
      { label: '3个月', days: 90 },
      { label: '6个月', days: 180 }
    ],
    currentDate: '',
    loading: false
  },

  onLoad(options) {
    // 检查登录状态
    this.checkLogin();
    
    // 设置当前日期
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    
    // 初始化状态文本
    const statusText = this.data.statusOptions[0].label;
    
    this.setData({ 
      currentDate, 
      statusText 
    });
    
    const { id } = options;
    if (id) {
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '编辑案件'
      });
      this.setData({ caseId: id });
      this.loadCaseDetail(id);
    } else {
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '创建案件'
      });
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

  async loadCaseDetail(caseId) {
    this.setData({ loading: true });
    
    try {
      // 模拟数据加载，避免调用真实API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟案件详情数据
      const mockCaseInfo = {
        id: caseId,
        title: '合同纠纷案 - 张三与李四',
        caseNumber: '2025-00123',
        description: '原告张三与被告李四因合同履行问题产生纠纷，原告要求被告支付违约金及赔偿损失。案件涉及金额较大，需要仔细梳理证据链。',
        clientName: '张三',
        status: 'processing',
        priority: 'high',
        progress: 65,
        createTime: '2025-12-01 10:00:00',
        updateTime: '2025-12-30 09:30:00',
        expectedEndTime: '2026-01-15',
        responsiblePerson: '张明律师',
        type: 'contract'
      };
      
      // 获取案件类型索引
      const caseTypesIndex = this.data.caseTypes.findIndex(type => type.value === mockCaseInfo.type);
      // 获取状态索引
      const statusIndex = this.data.statusOptions.findIndex(status => status.value === mockCaseInfo.status);
      // 获取状态文本
      const statusOption = this.data.statusOptions.find(status => status.value === mockCaseInfo.status);
      
      // 设置表单数据
      this.setData({
        formData: mockCaseInfo,
        caseTypesIndex: caseTypesIndex > -1 ? caseTypesIndex : 0,
        statusIndex: statusIndex > -1 ? statusIndex : 0,
        statusText: statusOption ? statusOption.label : '',
        loading: false
      });
    } catch (err) {
      wx.showToast({ title: '加载案件详情失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 处理案件类型变化
  handleTypeChange(e) {
    const index = e.detail.value;
    const selectedType = this.data.caseTypes[index];
    this.setData({
      caseTypesIndex: index,
      'formData.type': selectedType.value
    });
  },

  // 处理优先级变化
  handlePriorityChange(e) {
    const priority = e.currentTarget.dataset.priority;
    console.log('选择的优先级:', priority);
    this.setData({
      'formData.priority': priority
    });
  },

  // 处理状态变化
  handleStatusChange(e) {
    const index = e.detail.value;
    const selectedStatus = this.data.statusOptions[index];
    this.setData({
      statusIndex: index,
      statusText: selectedStatus.label,
      'formData.status': selectedStatus.value
    });
  },

  // 处理日期变化
  handleDateChange(e) {
    this.setData({
      'formData.expectedEndTime': e.detail.value
    });
  },
  
  // 处理快速日期选择
  handleQuickDateSelect(e) {
    console.log('快速日期选择事件:', e);
    const days = parseInt(e.currentTarget.dataset.days);
    console.log('选择的天数:', days);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const formattedDate = date.toISOString().split('T')[0];
    this.setData({
      'formData.expectedEndTime': formattedDate
    });
  },

  // 处理进度变化
  handleProgressChange(e) {
    this.setData({
      'formData.progress': e.detail.value
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    if (!formData.title) {
      wx.showToast({ title: '请输入案件标题', icon: 'none' });
      return false;
    }
    if (!formData.type) {
      wx.showToast({ title: '请选择案件类型', icon: 'none' });
      return false;
    }
    if (!formData.responsiblePerson) {
      wx.showToast({ title: '请输入负责人', icon: 'none' });
      return false;
    }
    return true;
  },

  // 提交表单
  async handleSubmit() {
    if (!this.validateForm()) return;

    this.setData({ loading: true });

    try {
      const { formData, caseId } = this.data;
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 显示成功提示
      wx.showToast({
        title: caseId ? '编辑成功' : '创建成功',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: caseId ? '编辑失败' : '创建失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});