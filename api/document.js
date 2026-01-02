// api/document.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async list(data) {
    return request.get(config.document.list, data);
  },
  
  async upload(data) {
    return request.post(config.document.upload, data);
  },
  
  async detail(id) {
    return request.get(config.document.detail, { id });
  },
  
  async download(id) {
    return request.get(config.document.download, { id });
  }
};
