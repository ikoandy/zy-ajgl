const api = require('../../utils/api');

const STATUS_MAP = {
  pending: '待受理', accepted: '已受理', mediating: '调解中',
  agreed: '已达成协议', terminated: '已终止', closed: '已结案'
};

const PRIORITY_MAP = { urgent: '紧急', high: '较高', normal: '普通', low: '较低' };
const ROLE_MAP = { plaintiff: '申请人', defendant: '被申请人', witness: '证人' };

Page({
  data: {
    caseData: {},
    parties: [],
    timeline: [],
    statusMap: STATUS_MAP,
    priorityMap: PRIORITY_MAP,
    roleMap: ROLE_MAP,
    currentStage: '',
    canTransition: false
  },

  onLoad(options) {
    if (options.id) this.loadDetail(options.id);
  },

  async loadDetail(id) {
    try {
      const [caseRes, partyRes, timeRes] = await Promise.all([
        api.get('/cases/' + id),
        api.get('/cases/' + id + '/parties'),
        api.get('/workflow/' + id + '/timeline').catch(() => ({ data: [] }))
      ]);

      if (caseRes.success && caseRes.data) {
        const c = caseRes.data;
        this.setData({
          caseData: { ...c, created_at: c.created_at ? c.created_at.split('T')[0] : '' },
          canTransition: ['pending','accepted','mediating'].includes(c.status)
        });
      }

      if (partyRes.success && Array.isArray(partyRes.data)) {
        this.setData({ parties: partyRes.data });
      }

      if (timeRes.success && Array.isArray(timeRes.data)) {
        const colors = ['#c9a84c','#2dd4bf','#a78bfa','#f472b6','#60a5fa','#34d399'];
        this.setData({
          timeline: (timeRes.data || []).map((t, i) => ({
            ...t, color: colors[i % colors.length],
            created_at: t.created_at ? t.created_at.replace('T', ' ') : ''
          }))
        });
      }
    } catch (e) { wx.showToast({ title: '加载失败', icon: 'none' }); }
  },

  changeStatus() {
    wx.showActionSheet({
      itemList: ['受理案件', '开始调解', '达成协议', '终止案件', '结案'],
      success: (res) => {
        const actions = ['accepted', 'mediating', 'agreed', 'terminated', 'closed'];
        this.doTransition(actions[res.tapIndex]);
      }
    });
  },

  async doTransition(toStatus) {
    try {
      wx.showLoading({ title: '处理中...' });
      const res = await api.post('/workflow/' + this.data.caseData.id + '/transition', { status: toStatus });
      wx.hideLoading();
      if (res.success) {
        wx.showToast({ title: '操作成功', icon: 'success' });
        this.loadDetail(this.data.caseData.id);
      } else { wx.showToast({ title: res.message || '操作失败', icon: 'none' }); }
    } catch (e) { wx.hideLoading(); wx.showToast({ title: '操作失败', icon: 'none' }); }
  },

  viewParties() { /* 已在页面展示 */ },
  viewTimeline() { /* 已在页面展示 */ }
});
