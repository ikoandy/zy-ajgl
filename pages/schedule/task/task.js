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
      priority: 'normal',
      caseId: ''
    },
    cases: [],
    loading: false,
    isEditing: false
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

  async loadCases() {
    try {
      const res = await api.case.list({ pageSize: 50 });
      this.setData({ cases: res.data.list });
    } catch (err) {
      console.error('加载案件列表失败', err);
    }
  },

  async loadTaskDetail(taskId) {
    try {
      const res = await api.schedule.detail(taskId);
      this.setData({ formData: res.data });
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
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
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