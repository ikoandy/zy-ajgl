// pages/messages/list/list.js
const api = require('../../../api/index');
const config = require('../../../config/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    messages: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    // 检查登录状态
    this.checkLogin();
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '消息中心'
    });
    this.loadMessages();
    this.setupRealtimeMessage();
  },

  checkLogin() {
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadMessages(true);
  },

  async loadMessages(refresh = false) {
    if (this.data.loading || (!this.data.hasMore && !refresh)) return;

    this.setData({ loading: true });

    try {
      // 模拟数据加载，避免调用真实API
      const mockMessages = [
        {
          id: '1',
          clientId: '1',
          clientName: '张三',
          content: '关于合同纠纷案的最新进展，我们已经准备好所有庭审材料',
          type: 'case_update',
          isRead: false,
          createTime: '2025-12-30 10:30:00'
        },
        {
          id: '2',
          clientId: '2',
          clientName: '李四',
          content: '客户李四发送了一条新消息，询问案件进度',
          type: 'client_message',
          isRead: false,
          createTime: '2025-12-30 09:15:00'
        },
        {
          id: '3',
          clientId: '3',
          clientName: '王五',
          content: '知识产权侵权案已完成，等待客户确认',
          type: 'case_completed',
          isRead: true,
          createTime: '2025-12-29 16:45:00'
        },
        {
          id: '4',
          clientId: '4',
          clientName: '赵六',
          content: '婚姻家庭纠纷案已结案，相关文件已归档',
          type: 'case_closed',
          isRead: true,
          createTime: '2025-12-29 14:20:00'
        },
        {
          id: '5',
          clientId: '5',
          clientName: '孙七',
          content: '新客户孙七已注册，需要跟进',
          type: 'new_client',
          isRead: false,
          createTime: '2025-12-28 11:05:00'
        }
      ];

      const page = refresh ? 1 : this.data.page;
      const start = (page - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const newMessages = mockMessages.slice(start, end);
      
      this.setData({
        messages: refresh ? newMessages : [...this.data.messages, ...newMessages],
        hasMore: end < mockMessages.length,
        page: page + 1
      });
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  setupRealtimeMessage() {
    // 只有当wsBaseUrl配置不为空时，才建立WebSocket连接
    if (!config.wsBaseUrl || config.wsBaseUrl === '') {
      return;
    }
    
    // 建立WebSocket连接
    this.connectWebSocket();
    
    // 监听WebSocket消息
    wx.onSocketMessage((res) => {
      try {
        const message = JSON.parse(res.data);
        this.handleNewMessage(message);
      } catch (err) {
        console.error('解析消息失败', err);
      }
    });
    
    // 监听WebSocket关闭
    wx.onSocketClose(() => {
      console.log('WebSocket连接已关闭');
      // 5秒后重连
      setTimeout(() => {
        this.connectWebSocket();
      }, 5000);
    });
    
    // 监听WebSocket错误
    wx.onSocketError((err) => {
      console.error('WebSocket连接错误', err);
    });
  },
  
  connectWebSocket() {
    const token = wx.getStorageSync('token');
    // 只有当token和wsBaseUrl都存在时，才尝试建立WebSocket连接
    if (!token || !config.wsBaseUrl || config.wsBaseUrl === '') {
      return;
    }
    
    wx.connectSocket({
      url: `${config.wsBaseUrl}/ws?token=${token}`,
      success: () => {
        console.log('WebSocket连接请求已发送');
      },
      fail: (err) => {
        console.error('WebSocket连接请求失败', err);
      }
    });
  },

  handleNewMessage(message) {
    // 将新消息添加到列表顶部
    const messages = [message, ...this.data.messages];
    this.setData({ messages });
  },

  onPullDownRefresh() {
    this.loadMessages(true);
  },

  onReachBottom() {
    this.loadMessages();
  },

  goToDetail(e) {
    const { id, clientId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/messages/detail/detail?id=${id}&clientId=${clientId}`
    });
  }
});