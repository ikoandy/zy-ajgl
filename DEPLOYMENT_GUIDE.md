# 律师事务所管理系统部署指南

## 1. 项目概述

律师事务所管理系统是一个基于Node.js + Vue 3 + TypeScript开发的全栈应用，包含三个前端项目和一个后端API服务。

### 1.1 项目结构

```
law-firm-management/
├── admin-pc/          # 管理端（Vue 3 + TypeScript）
├── lawyer-pc/         # 律师端（Vue 3 + TypeScript）
├── mobile-h5/         # 移动端（Vue 3 + TypeScript）
├── backend/           # 后端API（Node.js + Express + TypeScript）
├── docker/            # Docker相关配置
├── deploy.sh          # 部署脚本
├── verify.sh          # 验证脚本
└── docker-compose.yml # Docker Compose配置
```

### 1.2 技术栈

| 组件 | 技术栈 | 版本 |
|------|--------|------|
| 后端 | Node.js + Express + TypeScript | Node.js 18 |
| 前端 | Vue 3 + TypeScript + Element Plus | Vue 3.5 |
| 数据库 | MySQL | 8.0 |
| 容器化 | Docker + Docker Compose | 最新 |
| 服务器 | Nginx | 最新 |

## 2. 部署前准备

### 2.1 云服务器配置

| 配置项 | 要求 |
|--------|------|
| 云服务器地址 | 139.155.42.254 |
| 操作系统 | CentOS 7+ |
| CPU | 2核+ |
| 内存 | 4GB+ |
| 磁盘 | 50GB+ |
| 网络 | 公网IP |

### 2.2 云数据库配置

| 配置项 | 要求 |
|--------|------|
| 数据库地址 | 10.6.0.17 |
| 端口 | 3306 |
| 数据库名 | law_firm_management |
| 用户名 | root |
| 密码 | ZY520117. |
| 字符集 | utf8mb4 |
| 排序规则 | utf8mb4_unicode_ci |

### 2.3 本地构建结果

所有前端和后端项目已经在本地成功构建，构建结果位于各项目的`dist`目录中。

## 3. 部署步骤

### 3.1 登录云服务器

使用SSH登录云服务器：

```bash
ssh root@139.155.42.254
```

### 3.2 安装必要软件

```bash
# 更新系统
yum update -y

# 安装Docker
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce docker-ce-cli containerd.io
systemctl start docker
systemctl enable docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 安装Git
yum install -y git
```

### 3.3 创建项目目录

```bash
mkdir -p /app/law-firm-management
```

### 3.4 上传项目文件

使用SCP或其他文件传输工具将本地项目文件上传到云服务器的`/app/law-firm-management`目录。

### 3.5 执行部署脚本

```bash
# 进入项目目录
cd /app/law-firm-management

# 赋予执行权限
chmod +x deploy.sh

# 执行部署脚本
./deploy.sh
```

### 3.6 手动部署步骤（备选）

如果部署脚本执行失败，可以手动执行以下步骤：

#### 3.6.1 构建Docker镜像

```bash
# 构建后端镜像
docker build -t law_firm_backend ./backend

# 构建前端镜像
docker build -t law_firm_frontend -f docker/Dockerfile.frontend .
```

#### 3.6.2 启动Docker容器

```bash
# 启动所有容器
docker-compose up -d
```

## 4. 系统验证

### 4.1 执行验证脚本

```bash
# 赋予执行权限
chmod +x verify.sh

# 执行验证脚本
./verify.sh
```

### 4.2 手动验证

1. **检查容器状态**：
   ```bash
   docker-compose ps
   ```

2. **检查后端健康状态**：
   ```bash
   curl http://localhost:3000/health
   ```

3. **检查前端访问**：
   ```bash
   curl -I http://localhost
   ```

## 5. 访问地址

| 服务 | 访问地址 | 备注 |
|------|----------|------|
| 管理端 | http://139.155.42.254/admin | 管理员使用 |
| 律师端 | http://139.155.42.254/lawyer | 律师使用 |
| 移动端 | http://139.155.42.254/mobile | 移动端访问 |
| 后端API | http://139.155.42.254:3000 | API服务 |
| 健康检查 | http://139.155.42.254:3000/health | 系统健康状态 |

## 6. 初始账户

| 用户名 | 密码 | 角色 | 备注 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 系统管理员 |
| lawyer1 | admin123 | 律师 | 测试律师账户 |
| client1 | admin123 | 客户 | 测试客户账户 |

## 7. 系统管理

### 7.1 查看容器日志

```bash
# 查看所有容器日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend
```

### 7.2 停止和重启服务

```bash
# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart
```

### 7.3 升级服务

```bash
# 拉取最新代码
git pull

# 重新构建和启动服务
docker-compose up -d --build
```

## 8. 故障排除

### 8.1 数据库连接失败

1. 检查数据库配置是否正确
2. 检查云数据库是否允许来自云服务器的访问
3. 检查数据库服务是否正常运行

### 8.2 前端访问失败

1. 检查Nginx配置是否正确
2. 检查前端构建产物是否存在
3. 检查端口80是否被占用

### 8.3 后端服务失败

1. 检查后端日志
2. 检查数据库连接
3. 检查端口3000是否被占用

## 9. 安全建议

1. **配置HTTPS**：为系统配置SSL证书，使用HTTPS访问
2. **修改初始密码**：首次登录后立即修改初始密码
3. **配置防火墙**：只开放必要的端口（22、80、443、3000）
4. **定期备份**：定期备份数据库和重要数据
5. **更新系统**：定期更新系统和软件版本

## 10. 联系方式

| 角色 | 联系方式 |
|------|----------|
| 技术支持 | tech@lawfirm.com |
| 系统管理员 | admin@lawfirm.com |

---

**部署完成时间**：2025-12-31
**部署版本**：v1.0.0
**部署人员**：系统自动部署
