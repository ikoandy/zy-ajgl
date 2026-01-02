#!/bin/bash

# 律师事务所管理系统验证脚本
# 用于检查系统部署后是否正常运行

set -e

echo "====================================="
echo "律师事务所管理系统验证脚本"
echo "====================================="

# 1. 检查容器状态
echo "1. 检查容器状态..."
docker-compose ps

# 2. 检查后端API服务
echo "2. 检查后端API服务..."
BACKEND_URL="http://localhost:3000"

# 检查健康检查端点
curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health

if [ $? -eq 0 ]; then
    echo " ✓ 后端健康检查通过"
else
    echo " ✗ 后端健康检查失败"
    exit 1
fi

# 3. 检查数据库连接
echo "3. 检查数据库连接..."
BACKEND_CONTAINER=$(docker-compose ps -q backend)
docker exec $BACKEND_CONTAINER node -e "
const mysql = require('mysql2/promise');
async function checkDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        await connection.query('SELECT 1');
        console.log('✓ 数据库连接成功');
        process.exit(0);
    } catch (error) {
        console.log('✗ 数据库连接失败:', error.message);
        process.exit(1);
    }
}
checkDb();
"

# 4. 检查前端服务
echo "4. 检查前端服务..."
FRONTEND_URL="http://localhost"

curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL

if [ $? -eq 0 ]; then
    echo " ✓ 前端服务正常"
else
    echo " ✗ 前端服务异常"
    exit 1
fi

# 5. 检查初始数据
echo "5. 检查初始数据..."
docker exec $BACKEND_CONTAINER node -e "
const mysql = require('mysql2/promise');
async function checkData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (rows.length > 0) {
            console.log('✓ 初始管理员用户存在');
            process.exit(0);
        } else {
            console.log('✗ 初始管理员用户不存在');
            process.exit(1);
        }
    } catch (error) {
        console.log('✗ 检查初始数据失败:', error.message);
        process.exit(1);
    }
}
checkData();
"

echo "====================================="
echo "系统验证通过！所有服务正常运行。"
echo "前端访问地址: http://139.155.42.254"
echo "后端API地址: http://139.155.42.254:3000"
echo "管理员账户: admin / admin123"
echo "====================================="
