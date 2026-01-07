# 律师事务所管理系统云服务器部署位置说明

## 一、项目上传位置

### 推荐的部署目录
```
/root/projectAPP/
```

这是项目的**主目录**，所有代码、配置文件和构建产物都将存放在这里。

## 二、目录结构

### 上传到服务器的完整结构：
```
/root/projectAPP/
├── admin-pc/           # 管理员端前端代码
│   ├── dist/           # 构建产物（需要上传）
│   ├── src/            # 源代码（可选）
│   ├── package.json
│   └── vite.config.ts
│
├── lawyer-pc/          # 律师端前端代码
│   ├── dist/           # 构建产物（需要上传）
│   ├── src/            # 源代码（可选）
│   ├── package.json
│   └── vite.config.ts
│
├── mobile-h5/          # 移动端前端代码
│   ├── dist/           # 构建产物（需要上传）
│   ├── src/            # 源代码（可选）
│   ├── package.json
│   └── vite.config.ts
│
├── backend/            # 后端服务
│   ├── dist/           # 构建产物（需要上传）
│   ├── src/            # 源代码（可选）
│   ├── package.json
│   ├── Dockerfile
│   └── .env            # 环境变量文件（重要！）
│
├── docker/             # Docker配置文件
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   └── init.sql
│
├── docker-compose.yml  # Docker Compose配置（需要上传）
└── nginx.conf          # Nginx配置文件（可选，如果使用Docker部署）
```

## 三、必须上传的文件

### 1. 构建产物（必须上传）
- `admin-pc/dist/` - 管理员端前端构建产物
- `lawyer-pc/dist/` - 律师端前端构建产物
- `mobile-h5/dist/` - 移动端前端构建产物
- `backend/dist/` - 后端服务构建产物

### 2. 配置文件（必须上传）
- `docker-compose.yml` - Docker Compose配置
- `docker/` 目录下的所有文件
- `backend/.env` - 后端环境变量

### 3. 可选上传的文件
- 源代码目录（src/）- 如果需要在服务器上重新构建

## 四、可选的上传方式

### 方式1：只上传构建产物（推荐）

**优点**：
- 上传文件少，速度快
- 不需要服务器安装Node.js

**上传命令**：
```bash
# 上传前端构建产物
scp -r admin-pc/dist/ root@139.155.42.254:/root/projectAPP/admin-pc/
scp -r lawyer-pc/dist/ root@139.155.42.254:/root/projectAPP/lawyer-pc/
scp -r mobile-h5/dist/ root@139.155.42.254:/root/projectAPP/mobile-h5/

# 上传后端构建产物
scp -r backend/dist/ root@139.155.42.254:/root/projectAPP/backend/

# 上传配置文件
scp docker-compose.yml root@139.155.42.254:/root/projectAPP/
scp -r docker/ root@139.155.42.254:/root/projectAPP/
scp backend/.env root@139.155.42.254:/root/projectAPP/backend/
```

### 方式2：上传完整项目

**优点**：
- 可以在服务器上直接修改和重新构建
- 便于开发和调试

**上传命令**：
```bash
# 方法1：使用scp上传整个目录（不推荐，可能很慢）
scp -r /path/to/projectAPP/* root@139.155.42.254:/root/projectAPP/

# 方法2：使用git clone（推荐）
ssh root@139.155.42.254
cd /root
rm -rf projectAPP
git clone https://github.com/ikoandy/zy-ajgl.git projectAPP
```

### 方式3：使用rsync同步（推荐用于更新）

```bash
# 只同步修改的文件
rsync -avz --delete /path/to/local/projectAPP/ root@139.155.42.254:/root/projectAPP/
```

## 五、服务器上需要执行的操作

### 1. 确保目录存在
```bash
ssh root@139.155.42.254
mkdir -p /root/projectAPP
```

### 2. 启动服务

**使用Docker Compose启动（推荐）**：
```bash
cd /root/projectAPP
docker-compose up -d
```

**使用Nginx直接部署**：
```bash
# 停止可能占用端口的服务
systemctl stop nginx 2>/dev/null || true

# 启动后端服务
cd /root/projectAPP/backend
nohup npm start > /var/log/backend.log 2>&1 &

# 启动Nginx
systemctl start nginx
```

### 3. 验证部署
```bash
# 检查容器状态
docker-compose ps

# 检查端口占用
netstat -tlnp | grep -E '80|3000|3306'

# 检查服务日志
docker-compose logs -f
```

## 六、访问地址

部署完成后，可以通过以下地址访问系统：

| 系统 | 访问地址 |
|------|----------|
| 管理员端 | http://139.155.42.254/ |
| 律师端 | http://139.155.42.254/lawyer |
| 移动端 | http://139.155.42.254/mobile |
| 后端API | http://139.155.42.254/api/ |

## 七、常见问题

### Q1：上传速度很慢怎么办？
**解决方案**：
1. 只上传构建产物，不上传源代码
2. 使用rsync只同步修改的文件
3. 在服务器上使用git clone

### Q2：上传后文件权限问题？
**解决方案**：
```bash
ssh root@139.155.42.254
cd /root/projectAPP
chmod -R 755 *
```

### Q3：如何更新已部署的系统？
**解决方案**：
```bash
# 方法1：使用git更新
ssh root@139.155.42.254
cd /root/projectAPP
git pull origin main
npm run build  # 如果需要重新构建
docker-compose restart  # 如果使用Docker
```

### Q4：忘记上传某个文件怎么办？
**解决方案**：
```bash
# 单独上传缺失的文件
scp missing-file root@139.155.42.254:/root/projectAPP/
```

## 八、推荐的部署流程

1. **本地构建**
   ```bash
   npm run build
   ```

2. **上传文件**
   ```bash
   # 使用scp上传构建产物和配置文件
   scp -r admin-pc/dist/ lawyer-pc/dist/ mobile-h5/dist/ backend/dist/ docker-compose.yml docker/ backend/.env root@139.155.42.254:/root/projectAPP/
   ```

3. **服务器部署**
   ```bash
   ssh root@139.155.42.254
   cd /root/projectAPP
   docker-compose up -d
   ```

4. **验证访问**
   打开浏览器访问 http://139.155.42.254/
