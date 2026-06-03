const api = require('../../utils/api');
const app = getApp();

const STATUS_MAP = {
  pending: '待受理', accepted: '已受理', mediating: '调解中',
  agreed: '已达成协议', terminated: '已终止', closed: '已结案'
};

Page({
  data: {
    greeting: '',
    userInfo: {},
    avatarColor: '#c9a84c',
    nameInitial: '',
    stats: [],
    recentCases: [],
    todaySchedules: [],
    statusMap: STATUS_MAP
  },

  onShow() { this.loadAll(); },

  loadAll() {
    this.setGreeting();
    this.setData({ userInfo: app.globalData.userInfo || {} });
    if (app.globalData.userInfo) {
      const name = app.globalData.userInfo.real_name || '';
      this.setData({
        avatarColor: app.globalData.userInfo.avatar_color || '#c9a84c',
        nameInitial: name.charAt(0) || 'U'
      });
    }
    this.loadStats();
    this.loadRecentCases();
    this.loadTodaySchedules();
  },

  setGreeting() {
    const h = new Date().getHours();
    let g = '晚上好';
    if (h < 12) g = '上午好';
    else if (h < 18) g = '下午好';
    this.setData({ greeting: g });
  },

  async loadStats() {
    try {
      const res = await api.get('/cases/stats');
      if (res.success && res.data) {
        const d = res.data;
        this.setData({
          stats: [
            { label: '全部案件', value: d.total || 0, icon: '⚖', color: 'var(--gold)', bg: 'var(--gold-dim)', type: 'all', trend: d.totalChange },
            { label: '待处理', value: d.pending || 0, icon: '📋', color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', type: 'pending', trend: null },
            { label: '调解中', value: d.mediating || 0, icon: '💬', color: 'var(--teal)', bg: 'var(--teal-dim)', type: 'mediating', trend: null },
            { label: '已结案', value: d.closed || 0, icon: '✓', color: 'var(--violet)', bg: 'var(--violet-dim)', type: 'closed', trend: null }
          ]
        });
      }
    } catch (e) { /* 静默 */ }
  },

  async loadRecentCases() {
    try {
      const res = await api.get('/cases', { pageSize: 5, sortBy: 'updated_at', sortOrder: 'desc' });
      if (res.success) {
        const list = res.data.data || res.data || [];
        this.setData({
          recentCases: list.map(c => ({
            ...c,
            created_at: c.created_at ? c.created_at.split('T')[0] : ''
          }))
        });
      }
    } catch (e) { /* 静默 */ }
  },

  async loadTodaySchedules() {
    try {
      const res = await api.get('/schedules/today');
      if (res.success && Array.isArray(res.data)) {
        this.setData({
          todaySchedules: res.data.map(s => ({
            ...s,
            timeRange: s.start_time ? s.start_time.slice(11, 16) + '-' + (s.end_time ? s.end_time.slice(11, 16) : '') : ''
          }))
        });
      }
    } catch (e) { /* 静默 */ }
  },

  onStatTap(e) { wx.switchTab({ url: '/pages/cases/cases' }); },
  goCases() { wx.switchTab({ url: '/pages/cases/cases' }); },
  goSchedule() { wx.switchTab({ url: '/pages/schedule/schedule' }); },
  goVideo() { wx.navigateTo({ url: '/pages/video/video' }); },
  goFeedback() { wx.navigateTo({ url: '/pages/feedback/feedback' }); },
  goProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
  goCaseDetail(e) { wx.navigateTo({ url: '/pages/case-detail/case-detail?id=' + e.currentTarget.dataset.id }); }
});
