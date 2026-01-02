// api/schedule.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  async list(data) {
    return request.get(config.schedule.list, data);
  },
  
  async create(data) {
    return request.post(config.schedule.create, data);
  },
  
  async update(id, data) {
    return request.put(config.schedule.update, { id, ...data });
  },
  
  async delete(id) {
    return request.delete(config.schedule.delete, { id });
  }
};
