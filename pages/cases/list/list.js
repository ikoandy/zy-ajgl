// pages/cases/list/list.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    cases: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    status: 'all',
    keyword: '',
    filterVisible: false,
    filters: {
      status: 'all',
      priority: 'all',
      sortBy: 'updateTime'
    },
    statusOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'completed', label: '已完成' },
      { value: 'closed', label: '已结案' }
    ],
    priorityOptions: [
      { value: 'all', label: '全部' },
      { value: 'high', label: '高' },
      { value: 'normal', label: '中' },
      { value: 'low', label: '低' }
    ]
  },

  onLoad(options) {
    // 检查登录状态
    this.checkLogin();
    
    const { status } = options;
    if (status) {
      this.setData({ 
        status, 
        'filters.status': status 
      });
    }
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '案件列表'
    });
    this.loadCases();
  },

  checkLogin() {
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
  },



  onReachBottom() {
    this.loadCases();
  },

  onPullDownRefresh() {
    this.setData({
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
    wx.stopPullDownRefresh();
  },

  async loadCases() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      // 调用真实API获取案件列表
      const res = await api.case.list({
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: this.data.filters.status === 'all' ? '' : this.data.filters.status,
        priority: this.data.filters.priority === 'all' ? '' : this.data.filters.priority,
        keyword: this.data.keyword,
        sortBy: this.data.filters.sortBy
      });
      
      const newCases = res.data.list || [];
      
      this.setData({
        cases: [...this.data.cases, ...newCases],
        hasMore: newCases.length >= this.data.pageSize,
        page: this.data.page + 1,
        // 添加空状态检查
        isEmpty: this.data.cases.length === 0 && newCases.length === 0
      });
    } catch (err) {
      console.error('加载案件失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      });
      // 加载失败时也检查空状态
      this.setData({
        isEmpty: this.data.cases.length === 0
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
  },

  handleSearchConfirm() {
    this.loadCases();
  },

  handleFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      status,
      'filters.status': status,
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
  },

  toggleFilter() {
    this.setData({
      filterVisible: !this.data.filterVisible
    });
  },

  handleFilterConfirm() {
    this.setData({
      filterVisible: false,
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
  },

  handleFilterReset() {
    this.setData({
      filters: {
        status: 'all',
        priority: 'all',
        sortBy: 'updateTime'
      }
    });
  },

  handleFilterChange(e) {
    const { field, value } = e.currentTarget.dataset;
    this.setData({
      [`filters.${field}`]: value
    });
  },

  handleClearSearch() {
    this.setData({
      keyword: '',
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
  },

  goToDetail(e) {
    const caseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cases/detail/detail?id=${caseId}`
    });
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/cases/create/create'
    });
  }
});
