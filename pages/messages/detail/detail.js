// pages/messages/detail/detail.js
const Auth = require('../../../utils/auth');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    message: null,
    historyMessages: [],
    replyContent: '',
    messageId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '消息详情'
    });
    
    // 获取消息ID
    const { id } = options;
    this.setData({ messageId: id });
    
    // 加载消息详情
    this.loadMessageDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
    if (this.data.messageId) {
      this.loadMessageDetail();
    }
  },

  /**
   * 加载消息详情
   */
  async loadMessageDetail() {
    this.setData({ loading: true });
    
    try {
      // 模拟数据加载，避免调用真实API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟消息详情数据
      const mockMessage = {
        id: this.data.messageId,
        clientId: '1',
        clientName: '张三',
        content: '关于合同纠纷案的最新进展，我们已经准备好所有庭审材料，预计下周一开庭。请您确认一下时间是否合适，并准备好相关证据材料。',
        type: 'case_update',
        isRead: false,
        createTime: '2025-12-30 10:30:00',
        attachments: [
          {
            id: '1',
            name: '合同纠纷案庭审材料.pdf',
            size: '2.3MB',
            url: '#'
          },
          {
            id: '2',
            name: '证据清单.docx',
            size: '1.1MB',
            url: '#'
          }
        ]
      };
      
      // 模拟历史消息数据
      const mockHistoryMessages = [
        {
          id: 'h1',
          sender: '张三',
          senderType: 'client',
          content: '您好，关于我公司的合同纠纷案，请问有什么新进展吗？',
          createTime: '2025-12-29 16:45:00'
        },
        {
          id: 'h2',
          sender: '我',
          senderType: 'self',
          content: '您好，我们正在准备庭审材料，预计下周一开庭。',
          createTime: '2025-12-29 17:30:00'
        }
      ];
      
      this.setData({
        message: mockMessage,
        historyMessages: mockHistoryMessages,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 处理回复内容输入
   */
  handleReplyInput(e) {
    this.setData({
      replyContent: e.detail.value
    });
  },

  /**
   * 发送回复
   */
  handleSendReply(e) {
    e.preventDefault();
    
    const { replyContent } = this.data;
    if (!replyContent.trim()) {
      wx.showToast({
        title: '请输入回复内容',
        icon: 'none'
      });
      return;
    }
    
    // 模拟发送回复
    wx.showToast({
      title: '发送成功',
      icon: 'success'
    });
    
    // 清空回复内容
    this.setData({
      replyContent: ''
    });
  },

  /**
   * 取消回复
   */
  handleCancelReply() {
    this.setData({
      replyContent: ''
    });
  },

  /**
   * 处理下载附件
   */
  handleDownloadAttachment(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: `附件${id}下载功能开发中`,
      icon: 'none'
    });
  },

  /**
   * 返回消息列表
   */
  handleBackToList() {
    wx.navigateBack();
  },

  /**
   * 回复消息
   */
  handleReply() {
    // 滚动到回复区域
    wx.pageScrollTo({
      selector: '.reply-section',
      duration: 300
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadMessageDetail();
    wx.stopPullDownRefresh();
  }
})