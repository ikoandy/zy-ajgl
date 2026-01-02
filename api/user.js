// api/user.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async login(data) {
    return request.post(config.user.login, data);
  },
  
  async loginWithAccount(data) {
    return request.post(config.user.loginWithAccount, data);
  },
  
  async profile() {
    return request.get(config.user.profile);
  },
  
  async update(data) {
    return request.put(config.user.update, data);
  },
  
  async sendCode(data) {
    return request.post(config.user.sendCode, data);
  },
  
  async register(data) {
    return request.post(config.user.register, data);
  }
};
