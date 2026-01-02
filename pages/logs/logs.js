//logs.js
const app = getApp()

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: new Date(log).toLocaleDateString(),
          time: new Date(log).toLocaleTimeString()
        }
      })
    })
  }
})