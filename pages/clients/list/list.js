// pages/clients/list/list.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    clients: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    keyword: '',
    filterVisible: false,
    filters: {
      status: 'all',
      sortBy: 'updateTime'
    },
    statusOptions: [
      { value: 'all', label: '全部' },
      { value: 'active', label: '活跃' },
      { value: 'inactive', label: '不活跃' },
      { value: 'new', label: '新客户' }
    ]
  },

  onLoad() {
    // 检查登录状态
    this.checkLogin();
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '客户列表'
    });
    this.loadClients();
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
    this.loadClients();
  },

  onPullDownRefresh() {
    this.setData({
      clients: [],
      page: 1,
      hasMore: true
    });
    this.loadClients();
    wx.stopPullDownRefresh();
  },

  async loadClients() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      // 调用真实API获取客户列表
      const res = await api.client.list({
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: this.data.filters.status === 'all' ? '' : this.data.filters.status,
        keyword: this.data.keyword,
        sortBy: this.data.filters.sortBy
      });
      
      const newClients = res.data.list || [];
      
      this.setData({
        clients: [...this.data.clients, ...newClients],
        hasMore: newClients.length >= this.data.pageSize,
        page: this.data.page + 1
      });
    } catch (err) {
      console.error('加载客户列表失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      clients: [],
      page: 1,
      hasMore: true
    });
    this.loadClients();
  },

  handleClearSearch() {
    this.setData({
      keyword: '',
      clients: [],
      page: 1,
      hasMore: true
    });
    this.loadClients();
  },

  handleFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      'filters.status': status,
      clients: [],
      page: 1,
      hasMore: true
    });
    this.loadClients();
  },

  toggleFilter() {
    this.setData({
      filterVisible: !this.data.filterVisible
    });
  },

  handleFilterConfirm() {
    this.setData({
      filterVisible: false,
      clients: [],
      page: 1,
      hasMore: true
    });
    this.loadClients();
  },

  handleFilterReset() {
    this.setData({
      filters: {
        status: 'all',
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

  goToDetail(e) {
    const clientId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/clients/detail/detail?id=${clientId}`
    });
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/clients/create/create'
    });
  }
});
