const api = require('../../utils/api');

const STATUS_MAP = { pending: '待开始', ongoing: '进行中', completed: '已完成', cancelled: '已取消' };
const WEEKDAYS = ['周日','周一','周二','周三','周四','周五','周六'];

Page({
  data: {
    dateRange: '',
    groupedSchedules: [],
    statusMap: STATUS_MAP,
    refreshing: false,
    loading: false,
    showAddModal: false,
    submitting: false,
    form: { title: '', startTime: '09:00', endTime: '10:00', location: '' }
  },

  onShow() {
    this.setWeekRange(new Date());
    this.loadSchedules();
  },

  setWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d) => `${d.getMonth()+1}月${d.getDate()}日`;
    this.setData({ dateRange: fmt(monday) + ' - ' + fmt(sunday), weekStart: monday.toISOString().split('T')[0] });
  },

  prevWeek() {
    const ms = new Date(this.data.weekStart);
    ms.setDate(ms.getDate() - 7);
    this.setWeekRange(ms); this.loadSchedules();
  },
  nextWeek() {
    const ms = new Date(this.data.weekStart);
    ms.setDate(ms.getDate() + 7);
    this.setWeekRange(ms); this.loadSchedules();
  },
  goToday() { this.setWeekRange(new Date()); this.loadSchedules(); },

  async loadSchedules() {
    this.setData({ loading: true });
    try {
      const res = await api.get('/schedules/calendar', { start_date: this.data.weekStart });
      if (res.success) {
        const list = res.data || [];
        const grouped = {};
        list.forEach(s => {
          const dateKey = s.start_time ? s.start_time.split('T')[0] : '';
          if (!dateKey) return;
          if (!grouped[dateKey]) grouped[dateKey] = [];
          const st = s.start_time ? s.start_time.slice(11,16) : '';
          const et = s.end_time ? s.end_time.slice(11,16) : '';
          grouped[dateKey].push({
            ...s, timeRange: st && et ? st+'-'+et : '', status: s.status || 'pending'
          });
        });

        const result = Object.keys(grouped).sort().map(k => ({
          dateLabel: k.replace(/-/g,'/') + ' ' + WEEKDAYS[new Date(k).getDay()],
          items: grouped[k]
        }));
        this.setData({ groupedSchedules: result });
      }
    } catch(e) {}
    this.setData({ loading: false, refreshing: false });
  },

  onRefresh() { this.loadSchedules(); },

  showAdd() { this.setData({ showAddModal: true }); },
  hideAdd() { this.setData({ showAddModal: false }); },

  onFormInput(e) {
    const field = e.currentTarget.dataset.key;
    this.setData({ ['form.'+field]: e.detail.value });
  },
  onStartTimeChange(e) { this.setData({ 'form.startTime': e.detail.value }); },
  onEndTimeChange(e) { this.setData({ 'form.endTime': e.detail.value }); },

  async submitSchedule() {
    if (!this.data.form.title.trim()) return wx.showToast({ title: '请输入标题', icon: 'none' });
    this.setData({ submitting: true });
    try {
      const f = this.data.form;
      const today = new Date().toISOString().split('T')[0];
      const res = await api.post('/schedules', {
        title: f.title.trim(),
        start_time: today + 'T' + f.startTime + ':00',
        end_time: today + 'T' + f.endTime + ':00',
        location: f.location.trim() || null,
        schedule_type: 'mediation',
        status: 'pending'
      });
      wx.hideLoading();
      if (res.success) {
        wx.showToast({ title: '创建成功', icon: 'success' });
        this.setData({ showAddModal: false, form: { title:'', startTime:'09:00', endTime:'10:00', location:'' } });
        this.loadSchedules();
      } else { wx.showToast({ title: res.message || '创建失败', icon: 'none' }); }
    } catch(e) { wx.showToast({ title: '创建失败', icon: 'none' }); }
    finally { this.setData({ submitting: false }); }
  }
});
