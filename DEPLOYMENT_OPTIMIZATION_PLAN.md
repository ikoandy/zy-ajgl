# 律师事务所管理系统部署优化计划

## 1. 升级服务器操作系统或调整Node.js版本

### 当前状态
- 操作系统：CentOS 7 (Core)
- GLIBC版本：2.17
- 问题：无法安装Node.js 18+，因为需要GLIBC 2.28+

### 解决方案

**方案A：升级操作系统（推荐）**
- 升级到CentOS 8或AlmaLinux 8/9
- 优点：支持最新的Node.js版本，更安全稳定
- 缺点：需要重新配置系统环境

**方案B：使用兼容的Node.js版本**
- 使用Node.js 16，它与GLIBC 2.17兼容
- 修改`backend/Dockerfile`，将`FROM node:18-alpine`改为`FROM node:16-alpine`
- 优点：无需升级系统，快速解决问题
- 缺点：Node.js 16已停止维护

## 2. 配置国内Docker镜像源

### 操作步骤
1. 登录服务器
2. 创建或修改`/etc/docker/daemon.json`文件：
   ```json
   {
     "registry-mirrors": [
       "https://registry.docker-cn.com",
       "https://hub-mirror.c.163.com",
       "https://mirror.aliyuncs.com",
       "https://docker.mirrors.ustc.edu.cn"
     ]
   }
   ```
3. 重启Docker服务：
   ```bash
   systemctl daemon-reload
   systemctl restart docker
   ```
4. 验证配置：
   ```bash
   docker info | grep -A 5 "Registry Mirrors"
   ```

## 3. 准备Docker镜像并上传到服务器

### 操作步骤

**本地构建镜像**
1. 确保本地Docker服务正常运行
2. 修改`backend/Dockerfile`，使用兼容的Node.js版本
3. 构建镜像：
   ```bash
   docker-compose build
   ```

**导出镜像**
1. 查看构建好的镜像：
   ```bash
   docker images
   ```
2. 导出镜像为tar文件：
   ```bash
   docker save law_firm_backend law_firm_frontend mysql:8.0 -o law-firm-images.tar
   ```

**上传镜像到服务器**
1. 使用scp上传镜像文件：
   ```bash
   scp law-firm-images.tar root@139.155.42.254:/root/
   ```

**在服务器上加载镜像**
1. 登录服务器
2. 加载镜像：
   ```bash
   docker load -i /root/law-firm-images.tar
   ```
3. 验证镜像：
   ```bash
   docker images
   ```

## 4. 修改docker-compose.yml配置

### 操作步骤
1. 确保`docker-compose.yml`中的`DB_HOST`使用服务名`db`而不是硬编码IP
2. 配置服务使用本地构建的镜像：
   ```yaml
   backend:
     build: 
       context: ./backend
     # 或者使用已加载的镜像
     # image: law_firm_backend
   ```
3. 启动服务：
   ```bash
   docker-compose up -d
   ```

## 5. 完善CI/CD流程

### 优化`.github/workflows/deploy-frontend.yml`

**主要修改**
1. 将Node.js版本从16改为18
2. 添加构建Docker镜像的步骤
3. 配置推送镜像到私有仓库
4. 添加部署到服务器的步骤

### 优化`.github/workflows/deploy-full-system.yml`

**主要修改**
1. 添加构建前后端Docker镜像的步骤
2. 配置国内镜像源
3. 添加镜像推送和部署步骤
4. 增加健康检查

## 6. 部署验证

### 验证步骤
1. 检查容器状态：
   ```bash
   docker-compose ps
   ```
2. 查看日志：
   ```bash
   docker-compose logs -f
   ```
3. 访问服务：
   - 管理员端：http://139.155.42.254/
   - 律师端：http://139.155.42.254/lawyer
   - 移动端：http://139.155.42.254/mobile
4. 测试API连接：
   ```bash
   curl http://139.155.42.254/api/health
   ```

## 7. 实施计划时间线

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 1 | 升级服务器操作系统或调整Node.js版本 | 2-4小时 |
| 2 | 配置国内Docker镜像源 | 30分钟 |
| 3 | 本地构建并上传Docker镜像 | 1-2小时 |
| 4 | 修改docker-compose.yml配置 | 30分钟 |
| 5 | 完善CI/CD流程 | 1-2小时 |
| 6 | 部署验证 | 1小时 |

## 8. 风险评估

### 风险1：操作系统升级失败
- 缓解措施：备份重要数据，使用测试环境验证

### 风险2：Docker镜像构建失败
- 缓解措施：使用多个国内镜像源，手动下载基础镜像

### 风险3：CI/CD流程出错
- 缓解措施：添加测试步骤，逐步完善流程

## 9. 后续优化建议

1. 配置监控系统，实时监控服务状态
2. 添加自动备份机制
3. 优化数据库性能
4. 配置HTTPS证书
5. 实现灰度发布

## 10. 联系方式

如有任何问题，请联系开发团队。
