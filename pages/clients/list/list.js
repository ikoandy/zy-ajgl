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
      // 模拟数据加载，避免调用真实API
      const mockClients = [
        {
          id: '1',
          name: '张三',
          status: 'active',
          phone: '13800138001',
          email: 'zhangsan@example.com',
          caseCount: 5,
          lastContact: '2025-12-29',
          avatar: ''
        },
        {
          id: '2',
          name: '李四',
          status: 'new',
          phone: '13800138002',
          email: 'lisi@example.com',
          caseCount: 1,
          lastContact: '2025-12-30',
          avatar: ''
        },
        {
          id: '3',
          name: '王五',
          status: 'inactive',
          phone: '13800138003',
          email: 'wangwu@example.com',
          caseCount: 3,
          lastContact: '2025-11-15',
          avatar: ''
        },
        {
          id: '4',
          name: '赵六',
          status: 'active',
          phone: '13800138004',
          email: 'zhaoliu@example.com',
          caseCount: 2,
          lastContact: '2025-12-28',
          avatar: ''
        },
        {
          id: '5',
          name: '孙七',
          status: 'new',
          phone: '13800138005',
          email: 'sunqi@example.com',
          caseCount: 0,
          lastContact: '2025-12-30',
          avatar: ''
        }
      ];

      // 应用筛选条件
      let filteredClients = [...mockClients];
      
      if (this.data.filters.status !== 'all') {
        filteredClients = filteredClients.filter(c => c.status === this.data.filters.status);
      }
      
      if (this.data.keyword) {
        const keyword = this.data.keyword.toLowerCase();
        filteredClients = filteredClients.filter(c => 
          c.name.toLowerCase().includes(keyword) || 
          c.phone.includes(keyword) ||
          c.email.toLowerCase().includes(keyword)
        );
      }
      
      // 应用排序
      filteredClients.sort((a, b) => {
        if (this.data.filters.sortBy === 'updateTime') {
          return new Date(b.lastContact) - new Date(a.lastContact);
        } else if (this.data.filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
      
      // 模拟分页
      const start = (this.data.page - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const newClients = filteredClients.slice(start, end);
      
      this.setData({
        clients: [...this.data.clients, ...newClients],
        hasMore: end < filteredClients.length,
        page: this.data.page + 1
      });
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
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
