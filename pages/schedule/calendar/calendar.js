// pages/schedule/calendar/calendar.js
const api = require('../../../api/index');

Page({
  data: {
    currentDate: new Date().getTime(),
    selectedDate: '',
    events: [],
    loading: false
  },

  onLoad() {
    const today = this.formatDate(new Date());
    this.setData({ selectedDate: today });
    this.loadEvents(today);
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  handleDateSelect(e) {
    const date = e.detail;
    this.setData({ selectedDate: date });
    this.loadEvents(date);
  },

  async loadEvents(date) {
    this.setData({ loading: true });

    try {
      // 模拟数据加载，避免调用真实API
      const mockEvents = [
        {
          id: '1',
          title: '准备庭审材料',
          startTime: `${date} 09:00`,
          endTime: `${date} 11:30`,
          location: '办公室',
          description: '准备合同纠纷案的庭审材料',
          type: 'work',
          status: 'pending'
        },
        {
          id: '2',
          title: '会见客户',
          startTime: `${date} 14:00`,
          endTime: `${date} 15:30`,
          location: '会议室',
          description: '与客户张三讨论案件进展',
          type: 'meeting',
          status: 'pending'
        },
        {
          id: '3',
          title: '团队会议',
          startTime: `${date} 16:00`,
          endTime: `${date} 17:00`,
          location: '会议室A',
          description: '每周团队例会',
          type: 'meeting',
          status: 'pending'
        }
      ];
      
      this.setData({
        events: mockEvents,
        loading: false
      });
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleAddEvent() {
    wx.navigateTo({
      url: `/pages/schedule/task/task?date=${this.data.selectedDate}`
    });
  },

  handleEventDetail(e) {
    const eventId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/task/task?id=${eventId}`
    });
  }
});