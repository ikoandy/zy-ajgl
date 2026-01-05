// pages/schedule/calendar/calendar.js
const api = require('../../../api/index');

Page({
  data: {
    currentDate: new Date().getTime(),
    selectedDate: '',
    events: [],
    loading: false,
    // 日期选择器数据
    years: [],
    months: [],
    days: [],
    datePickerValue: [],
    // 全部待办事项
    allEvents: []
  },

  onLoad() {
    // 初始化日期选择器
    this.initDatePicker();
    
    const today = this.formatDate(new Date());
    this.setData({ selectedDate: today });
    this.loadAllEvents();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 初始化日期选择器
  initDatePicker() {
    // 生成最近10年的年份
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    
    // 生成月份
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(i);
    }
    
    // 生成天数
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    
    // 设置当前日期为默认选择
    const today = new Date();
    const datePickerValue = [
      years.indexOf(today.getFullYear()),
      today.getMonth(),
      today.getDate() - 1
    ];
    
    this.setData({ years, months, days, datePickerValue });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 处理日期选择器变化
  handleDateChange(e) {
    const [yearIndex, monthIndex, dayIndex] = e.detail.value;
    const { years, months, days } = this.data;
    
    const year = years[yearIndex];
    const month = String(months[monthIndex]).padStart(2, '0');
    const day = String(days[dayIndex]).padStart(2, '0');
    
    const selectedDate = `${year}-${month}-${day}`;
    this.setData({ 
      selectedDate,
      datePickerValue: e.detail.value
    });
    
    // 筛选该日期的事件
    this.filterEventsByDate(selectedDate);
  },

  // 加载所有待办事项
  async loadAllEvents() {
    this.setData({ loading: true });

    try {
      // 真实API调用
      const res = await api.schedule.list({ type: 'all' });
      let allEvents = res.data || [];
      
      // 如果API调用失败，使用模拟数据
      if (allEvents.length === 0) {
        allEvents = this.generateMockEvents();
      }
      
      this.setData({ allEvents });
      
      // 筛选当前日期的事件
      this.filterEventsByDate(this.data.selectedDate);
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('加载事件失败', err);
      // 使用模拟数据
      const allEvents = this.generateMockEvents();
      this.setData({ allEvents });
      this.filterEventsByDate(this.data.selectedDate);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 生成模拟事件数据
  generateMockEvents() {
    const today = this.formatDate(new Date());
    const tomorrow = this.formatDate(new Date(Date.now() + 86400000));
    const yesterday = this.formatDate(new Date(Date.now() - 86400000));
    
    return [
      {
        id: '1',
        title: '准备庭审材料',
        startTime: `${today} 09:00`,
        endTime: `${today} 11:30`,
        location: '办公室',
        description: '准备合同纠纷案的庭审材料',
        type: 'work',
        status: 'pending'
      },
      {
        id: '2',
        title: '会见客户',
        startTime: `${today} 14:00`,
        endTime: `${today} 15:30`,
        location: '会议室',
        description: '与客户张三讨论案件进展',
        type: 'meeting',
        status: 'processing'
      },
      {
        id: '3',
        title: '团队会议',
        startTime: `${tomorrow} 16:00`,
        endTime: `${tomorrow} 17:00`,
        location: '会议室A',
        description: '每周团队例会',
        type: 'meeting',
        status: 'pending'
      },
      {
        id: '4',
        title: '整理案件档案',
        startTime: `${yesterday} 10:00`,
        endTime: `${yesterday} 12:00`,
        location: '档案室',
        description: '整理近期案件的归档材料',
        type: 'work',
        status: 'completed'
      },
      {
        id: '5',
        title: '法律研讨会',
        startTime: `${tomorrow} 09:00`,
        endTime: `${tomorrow} 12:00`,
        location: '多功能厅',
        description: '参加知识产权法律研讨会',
        type: 'meeting',
        status: 'pending'
      }
    ];
  },

  // 根据日期筛选事件
  filterEventsByDate(date) {
    const { allEvents } = this.data;
    const filteredEvents = allEvents.filter(event => {
      return event.startTime.startsWith(date);
    });
    this.setData({ events: filteredEvents });
  },

  // 跳转到新建任务页面
  handleAddEvent() {
    wx.navigateTo({
      url: `/pages/schedule/task/task?date=${this.data.selectedDate}`
    });
  },

  // 跳转到任务详情页面
  handleEventDetail(e) {
    const eventId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/task/task?id=${eventId}`
    });
  }
});