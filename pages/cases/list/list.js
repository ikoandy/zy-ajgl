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
      // 模拟数据加载，避免调用真实API
      const mockCases = [
        {
          id: '1',
          title: '合同纠纷案',
          clientName: '张三',
          status: 'processing',
          priority: 'high',
          updateTime: '2025-12-30',
          progress: 60
        },
        {
          id: '2',
          title: '劳动争议案',
          clientName: '李四',
          status: 'pending',
          priority: 'normal',
          updateTime: '2025-12-29',
          progress: 0
        },
        {
          id: '3',
          title: '知识产权侵权案',
          clientName: '王五',
          status: 'completed',
          priority: 'low',
          updateTime: '2025-12-28',
          progress: 100
        },
        {
          id: '4',
          title: '婚姻家庭纠纷案',
          clientName: '赵六',
          status: 'closed',
          priority: 'high',
          updateTime: '2025-12-27',
          progress: 100
        },
        {
          id: '5',
          title: '交通事故赔偿案',
          clientName: '孙七',
          status: 'processing',
          priority: 'normal',
          updateTime: '2025-12-26',
          progress: 40
        }
      ];

      // 应用筛选条件
      let filteredCases = [...mockCases];
      
      if (this.data.filters.status !== 'all') {
        filteredCases = filteredCases.filter(c => c.status === this.data.filters.status);
      }
      
      if (this.data.filters.priority !== 'all') {
        filteredCases = filteredCases.filter(c => c.priority === this.data.filters.priority);
      }
      
      if (this.data.keyword) {
        const keyword = this.data.keyword.toLowerCase();
        filteredCases = filteredCases.filter(c => 
          c.title.toLowerCase().includes(keyword) || 
          c.clientName.toLowerCase().includes(keyword)
        );
      }
      
      // 应用排序
      filteredCases.sort((a, b) => {
        if (this.data.filters.sortBy === 'updateTime') {
          return new Date(b.updateTime) - new Date(a.updateTime);
        } else if (this.data.filters.sortBy === 'priority') {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return 0;
      });
      
      // 模拟分页
      const start = (this.data.page - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const newCases = filteredCases.slice(start, end);
      
      this.setData({
        cases: [...this.data.cases, ...newCases],
        hasMore: end < filteredCases.length,
        page: this.data.page + 1,
        // 添加空状态检查
        isEmpty: this.data.cases.length === 0 && newCases.length === 0
      });
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
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
