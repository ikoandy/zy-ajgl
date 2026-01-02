// api/client.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async list(data) {
    return request.get(config.client.list, data);
  },
  
  async detail(id) {
    return request.get(config.client.detail, { id });
  },
  
  async followRecords(id) {
    return request.get(config.client.followRecords, { clientId: id });
  },
  
  async createFollowRecord(data) {
    return request.post(config.client.createFollowRecord, data);
  }
};
