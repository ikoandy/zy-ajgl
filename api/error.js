// api/error.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async report(data) {
    return request.post(config.error.report, data);
  }
};