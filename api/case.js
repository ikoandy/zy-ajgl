// api/case.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async list(data) {
    return request.get(config.case.list, data);
  },
  
  async detail(id) {
    return request.get(config.case.detail, { id });
  },
  
  async create(data) {
    return request.post(config.case.create, data);
  },
  
  async update(id, data) {
    return request.put(config.case.update, { id, ...data });
  },
  
  async updateStatus(id, data) {
    return request.put(config.case.updateStatus, { id, ...data });
  },
  
  async delete(id) {
    return request.delete(config.case.delete, { id });
  }
};
