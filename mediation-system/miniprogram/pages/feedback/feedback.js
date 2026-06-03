const api = require('../../utils/api');

const RATING_TEXTS = { 1: '非常不满意', 2: '不满意', 3: '一般', 4: '满意', 5: '非常满意' };

Page({
  data: {
    selectedCase: null, selectedPartyId: null, selectedPartyName: '',
    parties: [], rating: 0, attitude: 0, efficiency: 0, fairness: 0,
    comment: '', isAnonymous: false, submitting: false, ratingTexts: RATING_TEXTS
  },

  selectCase() {
    wx.navigateTo({ url: '/pages/cases/cases?mode=select' });
  },

  async loadParties(caseId) {
    try {
      const res = await api.get('/cases/' + caseId + '/parties');
      if (res.success && Array.isArray(res.data)) {
        this.setData({ parties: res.data });
      }
    } catch(e) {}
  },

  selectParty(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    this.setData({ selectedPartyId: id, selectedPartyName: name });
  },

  setRating(e) { this.setData({ rating: parseInt(e.currentTarget.dataset.idx) }); },
  setSubRating(e) {
    const field = e.currentTarget.dataset.field;
    const val = parseInt(e.currentTarget.dataset.val);
    this.setData({ [field]: val });
  },
  onCommentInput(e) { this.setData({ comment: e.detail.value }); },
  onAnonChange(e) { this.setData({ isAnonymous: e.detail.value }); },

  async submitFeedback() {
    if (!this.data.selectedCase || !this.data.selectedPartyId) return wx.showToast({ title: '请选择案件和当事人', icon: 'none' });
    if (!this.data.rating) return wx.showToast({ title: '请评分', icon: 'none' });

    this.setData({ submitting: true });
    try {
      await api.post('/feedbacks', {
        case_id: this.data.selectedCase.id,
        party_id: this.data.selectedPartyId,
        rating: this.data.rating,
        attitude_score: this.data.attitude || null,
        efficiency_score: this.data.efficiency || null,
        fairness_score: this.data.fairness || null,
        comment: this.data.comment.trim() || null,
        is_anonymous: this.data.isAnonymous ? 1 : 0
      });
      wx.showToast({ title: '评价提交成功', icon: 'success' });
      // 重置表单
      this.setData({
        selectedCase: null, selectedPartyId: null, parties: [],
        rating: 0, attitude: 0, efficiency: 0, fairness: 0,
        comment: '', isAnonymous: false
      });
    } catch(e) { wx.showToast({ title: '提交失败', icon: 'none' }); }
    finally { this.setData({ submitting: false }); }
  }
});
