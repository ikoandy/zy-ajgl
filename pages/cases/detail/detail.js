// pages/cases/detail/detail.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    caseInfo: null,
    loading: true,
    activeTab: 'info',
    documents: [],
    messages: [],
    progressRecords: [],
    documents: [],
    tabs: [
      { key: 'info', label: '案件信息' },
      { key: 'documents', label: '相关文档' },
      { key: 'legalDocuments', label: '文书管理' },
      { key: 'messages', label: '沟通记录' },
      { key: 'progress', label: '进度记录' }
    ]
  },

  onLoad(options) {
    // 检查登录状态
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
    
    const { id } = options;
    if (id) {
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '案件详情'
      });
      this.setData({ caseId: id });
      this.loadCaseDetail(id);
    }
  },

  async loadCaseDetail(caseId) {
    this.setData({ loading: true });
    
    try {
      // 调用真实API获取案件详情
      const res = await api.case.detail(caseId);
      
      this.setData({
        caseInfo: res.data,
        loading: false
      });
      
      // 加载相关数据
      this.loadRelatedData(caseId);
    } catch (err) {
      console.error('加载案件详情失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  async loadRelatedData(caseId) {
    try {
      // 调用真实API获取案件相关数据
      // 后续可根据实际API实现补充
      
      // 初始化空数据
      this.setData({
        documents: [],
        legalDocuments: [],
        messages: [],
        progressRecords: []
      });
    } catch (err) {
      console.error('加载相关数据失败', err);
    }
  },

  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  handleUpdateStatus(e) {
    const status = e.currentTarget.dataset.status;
    wx.showModal({
      title: '确认操作',
      content: `确定要将案件状态更改为${this.getStatusText(status)}吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.updateCaseStatus(status);
        }
      }
    });
  },

  getStatusText(status) {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'closed': return '已结案';
      default: return status;
    }
  },

  async updateCaseStatus(status) {
    try {
      await api.case.updateStatus(this.data.caseId, { status });
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });
      this.loadCaseDetail(this.data.caseId);
    } catch (err) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  handleAddDocument() {
    wx.navigateTo({
      url: `/pages/documents/upload/upload?caseId=${this.data.caseId}`
    });
  },

  handleContactClient() {
    const { client } = this.data.caseInfo;
    wx.navigateTo({
      url: `/pages/messages/detail/detail?clientId=${client.id}&caseId=${this.data.caseId}`
    });
  },

  handleViewDocument(e) {
    const docId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/documents/preview/preview?id=${docId}`
    });
  },

  handleAddLegalDocument() {
    wx.navigateTo({
      url: `/pages/documents/upload/upload?caseId=${this.data.caseId}&type=legal`
    });
  },

  handleEditCase() {
    wx.navigateTo({
      url: `/pages/cases/create/create?id=${this.data.caseId}`
    });
  },

  onPullDownRefresh() {
    this.loadCaseDetail(this.data.caseId);
    wx.stopPullDownRefresh();
  }
});
