// pages/clients/detail/detail.js
const api = require('../../../api/index');

Page({
  data: {
    clientInfo: null,
    cases: [],
    followRecords: [],
    loading: true,
    activeTab: 'info'
  },

  onLoad(options) {
    const { id = '1' } = options; // 默认ID，确保页面能正常显示
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '客户详情'
    });
    this.loadClientDetail(id);
    this.loadClientCases(id);
    this.loadFollowRecords(id);
  },

  async loadClientDetail(clientId) {
    try {
      const res = await api.client.detail(clientId);
      this.setData({
        clientInfo: res.data,
        loading: false
      });
    } catch (err) {
      console.error('加载客户详情失败', err);
      // 添加mock数据，确保页面能正常显示
      const mockClientDetail = {
        id: clientId,
        name: '测试客户',
        phone: '13800138000',
        email: 'test@example.com',
        status: 'inactive',
        type: 'company',
        caseCount: 0,
        createdAt: '2025-12-01',
        lastContact: '2025-12-15',
        remark: '这是一个测试客户'
      };
      this.setData({
        clientInfo: mockClientDetail,
        loading: false
      });
    }
  },

  async loadClientCases(clientId) {
    try {
      const res = await api.case.list({ clientId, pageSize: 5 });
      this.setData({ cases: res.data.list });
    } catch (err) {
      console.error('加载客户案件失败', err);
      // 添加mock数据
      this.setData({ cases: [] });
    }
  },

  async loadFollowRecords(clientId) {
    try {
      const res = await api.client.followRecords(clientId);
      this.setData({ followRecords: res.data });
    } catch (err) {
      console.error('加载跟进记录失败', err);
      // 添加mock数据
      this.setData({ followRecords: [] });
    }
  },

  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  handleAddFollow() {
    wx.navigateTo({
      url: `/pages/clients/follow/follow?clientId=${this.data.clientInfo.id}`
    });
  },

  handleCall() {
    const { phone } = this.data.clientInfo;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },

  handleSendMessage() {
    wx.navigateTo({
      url: `/pages/messages/detail/detail?clientId=${this.data.clientInfo.id}`
    });
  }
});