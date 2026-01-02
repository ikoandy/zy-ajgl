// api/message.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async list(data) {
    return request.get(config.message.list, data);
  },
  
  async detail(id) {
    return request.get(config.message.detail, { id });
  },
  
  async send(data) {
    return request.post(config.message.send, data);
  },
  
  async history(clientId) {
    return request.get(config.message.history, { clientId });
  }
};
