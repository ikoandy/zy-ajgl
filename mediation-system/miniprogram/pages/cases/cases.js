const api = require('../../utils/api');

const STATUS_MAP = {
  pending: '待受理', accepted: '已受理', mediating: '调解中',
  agreed: '已达成协议', terminated: '已终止', closed: '已结案'
};

const STATUS_FILTERS = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待受理' },
  { key: 'accepted', label: '已受理' },
  { key: 'mediating', label: '调解中' },
  { key: 'agreed', label: '已协议' },
  { key: 'closed', label: '已结案' }
];

Page({
  data: {
    keyword: '',
    activeStatus: '',
    statusFilters: STATUS_FILTERS,
    statusMap: STATUS_MAP,
    cases: [],
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1
  },

  onShow() { this.loadCases(true); },

  onSearchInput(e) { this.setData({ keyword: e.detail.value }); },

  clearSearch() { this.setData({ keyword: '' }); this.loadCases(true); },

  doSearch() { this.loadCases(true); },

  filterByStatus(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activeStatus: key });
    this.loadCases(true);
  },

  async loadCases(reset = false) {
    if (this.data.loading) return;
    const page = reset ? 1 : this.data.page;

    this.setData({ loading: true, refreshing: reset });

    const params = { page, pageSize: 15 };
    if (this.data.keyword.trim()) params.search = this.data.keyword.trim();
    if (this.data.activeStatus) params.status = this.data.activeStatus;

    try {
      const res = await api.get('/cases', params);
      if (res.success) {
        const list = res.data.data || res.data || [];
        const formatted = list.map(c => ({
          ...c,
          created_at: c.created_at ? c.created_at.split('T')[0] : ''
        }));
        this.setData({
          cases: reset ? formatted : [...this.data.cases, ...formatted],
          hasMore: list.length >= 15,
          page: page + 1
        });
      }
    } catch (e) { /* 静默 */ }
    finally {
      this.setData({ loading: false, refreshing: false });
    }
  },

  onPullDownRefresh() { this.loadCases(true); },

  loadMore() { if (this.data.hasMore && !this.data.loading) this.loadCases(); },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/case-detail/case-detail?id=' + e.currentTarget.dataset.id });
  }
});
