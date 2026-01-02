// pages/cases/detail/detail.js
const Auth = require('../../../utils/auth');

Page({
  data: {
    caseInfo: null,
    loading: true,
    activeTab: 'info',
    documents: [],
    messages: [],
    progressRecords: [],
    documents: [],
    tabs: [
      { key: 'info', label: '案件信息' },
      { key: 'documents', label: '相关文档' },
      { key: 'legalDocuments', label: '文书管理' },
      { key: 'messages', label: '沟通记录' },
      { key: 'progress', label: '进度记录' }
    ]
  },

  onLoad(options) {
    // 检查登录状态
    if (!Auth.isLogin()) {
      wx.redirectTo({
        url: '/pages/auth/login/login'
      });
      return;
    }
    
    const { id } = options;
    if (id) {
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: '案件详情'
      });
      this.setData({ caseId: id });
      this.loadCaseDetail(id);
    }
  },

  async loadCaseDetail(caseId) {
    this.setData({ loading: true });
    
    try {
      // 模拟数据加载，避免调用真实API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟案件详情数据
      const mockCaseInfo = {
        id: caseId,
        title: '合同纠纷案 - 张三与李四',
        caseNumber: '2025-00123',
        description: '原告张三与被告李四因合同履行问题产生纠纷，原告要求被告支付违约金及赔偿损失。案件涉及金额较大，需要仔细梳理证据链。',
        clientName: '张三',
        clientPhone: '13800138000',
        clientEmail: 'zhangsan@example.com',
        status: 'processing',
        priority: 'high',
        progress: 65,
        createTime: '2025-12-01 10:00:00',
        updateTime: '2025-12-30 09:30:00',
        expectedEndTime: '2026-01-15',
        responsiblePerson: '张明律师',
        type: '合同纠纷'
      };
      
      this.setData({
        caseInfo: mockCaseInfo,
        loading: false
      });
      
      // 加载相关数据
      this.loadRelatedData(caseId);
    } catch (err) {
      console.error('加载案件详情失败', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  async loadRelatedData(caseId) {
    try {
      // 模拟数据加载，避免调用真实API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟相关文档数据
      const mockDocuments = [
        {
          id: '1',
          fileName: '合同原件.pdf',
          fileSize: '2.3MB',
          uploadTime: '2025-12-25 14:30:00',
          caseId: caseId
        },
        {
          id: '2',
          fileName: '证据清单.docx',
          fileSize: '1.1MB',
          uploadTime: '2025-12-26 09:15:00',
          caseId: caseId
        },
        {
          id: '3',
          fileName: '庭审记录.pdf',
          fileSize: '3.5MB',
          uploadTime: '2025-12-28 16:45:00',
          caseId: caseId
        }
      ];
      
      // 模拟沟通记录数据
      const mockMessages = [
        {
          id: '1',
          senderName: '张三',
          content: '请问我的案件进展如何了？',
          createTime: '2025-12-29 10:00:00'
        },
        {
          id: '2',
          senderName: '张明律师',
          content: '您好，案件正在审理中，我们已经准备好所有庭审材料，预计下周一开庭。',
          createTime: '2025-12-29 10:30:00'
        },
        {
          id: '3',
          senderName: '张三',
          content: '好的，谢谢律师。',
          createTime: '2025-12-29 11:00:00'
        }
      ];
      
      // 模拟进度记录数据
      const mockProgressRecords = [
        {
          id: '1',
          title: '案件立案',
          description: '案件已正式立案，分配案号：2025-00123',
          progressBefore: 0,
          progressAfter: 20,
          createTime: '2025-12-01 10:00:00'
        },
        {
          id: '2',
          title: '证据收集完成',
          description: '已收集完所有相关证据，包括合同原件、往来邮件等',
          progressBefore: 20,
          progressAfter: 50,
          createTime: '2025-12-15 14:30:00'
        },
        {
          id: '3',
          title: '庭审材料准备完成',
          description: '已准备好所有庭审材料，包括起诉状、答辩状等',
          progressBefore: 50,
          progressAfter: 65,
          createTime: '2025-12-30 09:30:00'
        }
      ];

      // 模拟文书管理数据
      const mockLegalDocuments = [
        {
          id: '4',
          fileName: '起诉状.docx',
          fileSize: '1.8MB',
          uploadTime: '2025-12-20 16:00:00',
          caseId: caseId,
          type: '起诉状'
        },
        {
          id: '5',
          fileName: '答辩状.docx',
          fileSize: '2.2MB',
          uploadTime: '2025-12-22 10:30:00',
          caseId: caseId,
          type: '答辩状'
        },
        {
          id: '6',
          fileName: '代理意见.docx',
          fileSize: '2.5MB',
          uploadTime: '2025-12-27 14:45:00',
          caseId: caseId,
          type: '代理意见'
        }
      ];

      this.setData({
        documents: mockDocuments,
        legalDocuments: mockLegalDocuments,
        messages: mockMessages,
        progressRecords: mockProgressRecords
      });
    } catch (err) {
      console.error('加载相关数据失败', err);
    }
  },

  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  handleUpdateStatus(e) {
    const status = e.currentTarget.dataset.status;
    wx.showModal({
      title: '确认操作',
      content: `确定要将案件状态更改为${this.getStatusText(status)}吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.updateCaseStatus(status);
        }
      }
    });
  },

  getStatusText(status) {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'closed': return '已结案';
      default: return status;
    }
  },

  async updateCaseStatus(status) {
    try {
      await api.case.updateStatus(this.data.caseId, { status });
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });
      this.loadCaseDetail(this.data.caseId);
    } catch (err) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  handleAddDocument() {
    wx.navigateTo({
      url: `/pages/documents/upload/upload?caseId=${this.data.caseId}`
    });
  },

  handleContactClient() {
    const { client } = this.data.caseInfo;
    wx.navigateTo({
      url: `/pages/messages/detail/detail?clientId=${client.id}&caseId=${this.data.caseId}`
    });
  },

  handleViewDocument(e) {
    const docId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/documents/preview/preview?id=${docId}`
    });
  },

  handleAddLegalDocument() {
    wx.navigateTo({
      url: `/pages/documents/upload/upload?caseId=${this.data.caseId}&type=legal`
    });
  },

  handleEditCase() {
    wx.navigateTo({
      url: `/pages/cases/create/create?id=${this.data.caseId}`
    });
  },

  onPullDownRefresh() {
    this.loadCaseDetail(this.data.caseId);
    wx.stopPullDownRefresh();
  }
});
