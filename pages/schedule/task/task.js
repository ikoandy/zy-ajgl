// pages/schedule/task/task.js
const api = require('../../../api/index');

Page({
  data: {
    taskId: '',
    formData: {
      title: '',
      description: '',
      date: '',
      time: '',
      status: 'pending',
      priority: 'medium',
      caseId: ''
    },
    cases: [],
    loading: false,
    isEditing: false,
    statusOptions: [
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'completed', label: '已完成' }
    ],
    priorityOptions: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' }
    ],
    selectedCase: '',
    caseIndex: 0
  },

  onLoad(options) {
    const { id, date } = options;
    if (id) {
      this.setData({ taskId: id, isEditing: true });
      this.loadTaskDetail(id);
    } else if (date) {
      this.setData({ 'formData.date': date });
    }
    this.loadCases();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  async loadCases() {
    try {
      const res = await api.case.list({ pageSize: 50 });
      const cases = res.data.list || [];
      this.setData({ cases });
      
      // 如果已有caseId，设置selectedCase
      if (this.data.formData.caseId) {
        const selectedCase = cases.find(c => c.id === this.data.formData.caseId);
        if (selectedCase) {
          this.setData({ 
            selectedCase: selectedCase.title,
            caseIndex: cases.findIndex(c => c.id === this.data.formData.caseId)
          });
        }
      }
    } catch (err) {
      console.error('加载案件列表失败', err);
      // 模拟案件数据
      const mockCases = [
        { id: '1', title: '合同纠纷案' },
        { id: '2', title: '劳动争议案' }
      ];
      this.setData({ cases: mockCases });
    }
  },

  async loadTaskDetail(taskId) {
    try {
      const res = await api.schedule.detail(taskId);
      this.setData({ formData: res.data });
      
      // 设置选中的案件
      if (res.data.caseId && this.data.cases.length > 0) {
        const selectedCase = this.data.cases.find(c => c.id === res.data.caseId);
        if (selectedCase) {
          this.setData({ 
            selectedCase: selectedCase.title,
            caseIndex: this.data.cases.findIndex(c => c.id === res.data.caseId)
          });
        }
      }
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    let value = e.detail.value;
    
    // 处理radio-group的value
    if (e.detail.value && typeof e.detail.value === 'string') {
      value = e.detail.value;
    }
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 处理案件选择
  handleCaseChange(e) {
    const index = e.detail.value;
    const selected = this.data.cases[index];
    this.setData({
      caseIndex: index,
      selectedCase: selected.title,
      'formData.caseId': selected.id
    });
  },

  handleDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    });
  },

  handleTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
    });
  },

  validateForm() {
    const { formData } = this.data;
    if (!formData.title) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' });
      return false;
    }
    if (!formData.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return false;
    }
    return true;
  },

  async handleSubmit() {
    if (!this.validateForm()) return;

    this.setData({ loading: true });

    try {
      if (this.data.isEditing) {
        await api.schedule.update(this.data.taskId, this.data.formData);
        wx.showToast({ title: '更新成功', icon: 'success' });
      } else {
        await api.schedule.create(this.data.formData);
        wx.showToast({ title: '创建成功', icon: 'success' });
      }
      wx.navigateBack();
    } catch (err) {
      wx.showToast({
        title: err.message || '操作失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.schedule.delete(this.data.taskId);
            wx.showToast({ title: '删除成功', icon: 'success' });
            wx.navigateBack();
          } catch (err) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  async handleComplete() {
    try {
      await api.schedule.update(this.data.taskId, { status: 'completed' });
      wx.showToast({ title: '标记完成', icon: 'success' });
      wx.navigateBack();
    } catch (err) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  }
});