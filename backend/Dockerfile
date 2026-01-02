# 后端服务Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制构建产物
COPY dist/ ./dist/

# 复制环境变量文件
COPY .env ./

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]