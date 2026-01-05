// api/schedule.js
const request = require('../utils/request');
const config = require('../config/api');

module.exports = {
  /**
   * 获取日程/待办事项列表
   * @param {Object} data - 查询参数
   * @param {string} data.type - 类型：upcoming(即将到来), completed(已完成), all(全部)
   * @param {number} data.limit - 限制数量
   * @param {number} data.offset - 偏移量
   * @returns {Promise}
   */
  async list(data) {
    return request.get(config.schedule.list, data);
  },
  
  /**
   * 获取单个待办事项详情
   * @param {string} id - 待办事项ID
   * @returns {Promise}
   */
  async detail(id) {
    return request.get(config.schedule.detail, { id });
  },
  
  /**
   * 创建待办事项
   * @param {Object} data - 待办事项数据
   * @returns {Promise}
   */
  async create(data) {
    return request.post(config.schedule.create, data);
  },
  
  /**
   * 更新待办事项
   * @param {string} id - 待办事项ID
   * @param {Object} data - 更新数据
   * @returns {Promise}
   */
  async update(id, data) {
    return request.put(config.schedule.update, { id, ...data });
  },
  
  /**
   * 删除待办事项
   * @param {string} id - 待办事项ID
   * @returns {Promise}
   */
  async delete(id) {
    return request.delete(config.schedule.delete, { id });
  },
  
  /**
   * 更新待办事项状态
   * @param {string} id - 待办事项ID
   * @param {string} status - 新状态：pending(待处理), processing(处理中), completed(已完成)
   * @returns {Promise}
   */
  async updateStatus(id, status) {
    return request.put(config.schedule.updateStatus, { id, status });
  },
  
  /**
   * 获取与特定案件关联的待办事项
   * @param {string} caseId - 案件ID
   * @returns {Promise}
   */
  async getByCase(caseId) {
    return request.get(config.schedule.byCase, { caseId });
  },
  
  /**
   * 获取与特定客户关联的待办事项
   * @param {string} clientId - 客户ID
   * @returns {Promise}
   */
  async getByClient(clientId) {
    return request.get(config.schedule.byClient, { clientId });
  }
};
