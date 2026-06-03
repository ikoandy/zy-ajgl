const api = require('../../utils/api');

const STATUS_MAP = { scheduled: '待开始', in_progress: '进行中', completed: '已结束', cancelled: '已取消' };

Page({
  data: {
    sessions: [], stats: {}, statusMap: STATUS_MAP, refreshing: false,
    showCreate: false, submitting: false,
    form: { title: '', caseSearch: '', date: '', time: '' }
  },

  onShow() { this.loadData(); },

  async loadData() {
    this.setData({ refreshing: true });
    try {
      const res = await api.get('/video/sessions', { pageSize: 20 });
      if (res.success) {
        const list = res.data.data || res.data || [];
        let total = 0, active = 0, completed = 0;
        list.forEach(s => {
          total++;
          if (s.status === 'in_progress') active++;
          if (s.status === 'completed') completed++;
          s.scheduled_at_text = s.scheduled_at ? s.scheduled_at.replace('T', ' ').slice(0,16) : '';
        });
        this.setData({ sessions: list, stats: { total, active, completed } });
      }
    } catch(e) {}
    this.setData({ refreshing: false });
  },

  onRefresh() { this.loadData(); },
  showCreate() { this.setData({ showCreate: true }); },
  hideCreate() { this.setData({ showCreate: false }); },

  onFormInput(e) {
    this.setData({ ['form.'+e.currentTarget.dataset.key]: e.detail.value });
  },
  onDateChange(e) { this.setData({ 'form.date': e.detail.value }); },
  onTimeChange(e) { this.setData({ 'form.time': e.detail.value }); },

  async submitVideo() {
    if (!this.data.form.title.trim()) return wx.showToast({ title: '请输入标题', icon: 'none' });
    this.setData({ submitting: true });
    try {
      const f = this.data.form;
      const now = new Date();
      const dt = f.date || now.toISOString().split('T')[0];
      const tm = f.time || ('0'+now.getHours()).slice(-2) + ':' + ('0'+now.getMinutes()).slice(-2);
      await api.post('/video/sessions', {
        title: f.title.trim(),
        case_id: null,
        scheduled_at: dt + 'T' + tm + ':00',
        status: 'scheduled'
      });
      wx.showToast({ title: '创建成功', icon: 'success' });
      this.setData({ showCreate: false, form: { title:'', caseSearch:'', date:'', time:'' } });
      this.loadData();
    } catch(e) { wx.showToast({ title: '创建失败', icon: 'none' }); }
    finally { this.setData({ submitting: false }); }
  },

  joinSession(e) {
    wx.showModal({
      title: '进入视频调解',
      content: '确认进入视频调解房间？',
      success: (r) => {
        if (r.confirm) wx.showToast({ title: '正在连接...', icon: 'loading', duration: 2000 });
      }
    });
  }
});
