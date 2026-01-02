// pages/documents/list/list.js
const api = require('../../../api/index');

Page({
  data: {
    documents: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    keyword: '',
    caseId: '',
    cases: []
  },

  onLoad(options) {
    const { caseId } = options;
    if (caseId) {
      this.setData({ caseId });
    }
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '文档列表'
    });
    this.loadCases();
    this.loadDocuments();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadDocuments(true);
  },

  async loadCases() {
    try {
      const res = await api.case.list({ pageSize: 50 });
      this.setData({ cases: res.data.list });
    } catch (err) {
      console.error('加载案件列表失败', err);
    }
  },

  async loadDocuments(refresh = false) {
    if (this.data.loading || (!this.data.hasMore && !refresh)) return;

    this.setData({ loading: true });

    try {
      const page = refresh ? 1 : this.data.page;
      const res = await api.document.list({
        page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword,
        caseId: this.data.caseId
      });

      const newDocuments = res.data.list;
      this.setData({
        documents: refresh ? newDocuments : [...this.data.documents, ...newDocuments],
        hasMore: newDocuments.length >= this.data.pageSize,
        page: page + 1
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  onPullDownRefresh() {
    this.loadDocuments(true);
  },

  onReachBottom() {
    this.loadDocuments();
  },

  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    this.loadDocuments(true);
  },

  handleCaseChange(e) {
    const caseId = e.detail.value;
    this.setData({ caseId });
    this.loadDocuments(true);
  },

  handleDocumentPreview(e) {
    const docId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/documents/preview/preview?id=${docId}`
    });
  },

  handleUpload() {
    wx.navigateTo({
      url: `/pages/documents/upload/upload${this.data.caseId ? `?caseId=${this.data.caseId}` : ''}`
    });
  }
});