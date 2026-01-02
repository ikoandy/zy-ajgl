#!/bin/bash

# 律师事务所管理系统部署脚本
# 适用于云服务器139.155.42.254

set -e

echo "====================================="
echo "律师事务所管理系统部署脚本"
echo "====================================="

# 1. 更新系统并安装依赖
echo "1. 更新系统并安装依赖..."
yum update -y
yum install -y yum-utils device-mapper-persistent-data lvm2 git

# 2. 安装Docker
echo "2. 安装Docker..."
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
systemctl enable docker

# 3. 安装Docker Compose
echo "3. 安装Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 4. 克隆或下载项目代码（用户需要根据实际情况选择）
echo "4. 准备项目代码..."
# 选项A: 如果可以直接从Git克隆（推荐）
# git clone https://your-repo-url/law-firm-management.git /app/law-firm-management

# 选项B: 如果需要手动上传（用户需要先将代码上传到服务器）
mkdir -p /app/law-firm-management
# 请将项目代码上传到 /app/law-firm-management 目录

echo "请确保项目代码已上传到 /app/law-firm-management 目录"
echo "按Enter键继续..."
read

# 5. 进入项目目录
cd /app/law-firm-management

# 6. 构建和运行Docker容器
echo "5. 构建和运行Docker容器..."
docker-compose up -d

# 7. 等待容器启动
echo "6. 等待容器启动..."
sleep 30

# 8. 查看容器状态
echo "7. 查看容器状态..."
docker-compose ps

# 9. 查看后端日志
echo "8. 查看后端服务日志..."
docker-compose logs -f backend

# 10. 验证系统运行状态
echo "9. 验证系统运行状态..."
curl -s http://localhost:3000/health

if [ $? -eq 0 ]; then
    echo "系统部署成功！"
    echo "前端访问地址: http://139.155.42.254"
    echo "后端API地址: http://139.155.42.254:3000"
else
    echo "系统部署失败，请检查日志！"
    exit 1
fi

echo "====================================="
echo "部署完成！"
echo "====================================="
