"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = exports.query = exports.testConnection = exports.pool = exports.createPool = exports.dbConfig = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'law_firm_management',
    charset: 'utf8mb4',
    timezone: '+08:00',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    pool: {
        max: 10,
        min: 2,
        acquireTimeout: 30000,
        idleTimeout: 60000
    }
};
const createPool = () => {
    return promise_1.default.createPool(exports.dbConfig);
};
exports.createPool = createPool;
exports.pool = (0, exports.createPool)();
const testConnection = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ 数据库连接成功');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ 数据库连接失败:', error);
        return false;
    }
};
exports.testConnection = testConnection;
const query = async (sql, params) => {
    try {
        const [rows] = await exports.pool.execute(sql, params);
        return rows;
    }
    catch (error) {
        console.error('SQL执行错误:', error);
        throw error;
    }
};
exports.query = query;
const transaction = async (callback) => {
    const connection = await exports.pool.getConnection();
    try {
        await connection.beginTransaction();
        await callback(connection);
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.transaction = transaction;
//# sourceMappingURL=database.js.map