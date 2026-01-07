# 律师事务所管理系统云服务器环境依赖

## 一、基础工具

| 工具 | 用途 | 安装命令（CentOS 7） |
|------|------|----------------------|
| Git | 代码版本管理 | `sudo yum install git -y` |
| Node.js | 后端运行环境 | `curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash - && sudo yum install -y nodejs` |
| npm | 依赖管理工具 | 随Node.js自动安装 |
| yum-utils | 系统工具 | `sudo yum install yum-utils -y` |
| epel-release | EPEL源 | `sudo yum install epel-release -y` |

## 二、后端环境

| 依赖 | 用途 | 安装方式 |
|------|------|----------|
| express | Web框架 | 项目内通过npm安装 |
| mysql2 | MySQL驱动 | 项目内通过npm安装 |
| bcryptjs | 密码加密 | 项目内通过npm安装 |
| jsonwebtoken | JWT认证 | 项目内通过npm安装 |
| cors | 跨域处理 | 项目内通过npm安装 |
| dotenv | 环境变量 | 项目内通过npm安装 |

## 三、前端构建环境

| 工具 | 用途 | 安装方式 |
|------|------|----------|
| Vite | 前端构建工具 | 项目内通过npm安装 |
| Vue 3 | 前端框架 | 项目内通过npm安装 |
| TypeScript | 类型系统 | 项目内通过npm安装 |
| Element Plus | UI组件库 | 项目内通过npm安装 |

## 四、数据库

| 数据库 | 安装命令（CentOS 7） |
|--------|----------------------|
| MySQL 8.0 | `sudo yum localinstall https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm && sudo yum install mysql-community-server -y && sudo systemctl start mysqld && sudo systemctl enable mysqld` |
| 或使用Docker部署 | `docker run -d --name law_firm_db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=ZY520117. -e MYSQL_DATABASE=law_firm_management mysql:8.0 --default-authentication-plugin=mysql_native_password` |

## 五、反向代理

| 服务 | 用途 | 安装命令（CentOS 7） |
|------|------|----------------------|
| Nginx | 处理HTTP请求，代理前端和后端服务 | `sudo yum install nginx -y && sudo systemctl start nginx && sudo systemctl enable nginx` |

## 六、容器化工具

| 工具 | 用途 | 安装命令（CentOS 7） |
|------|------|----------------------|
| Docker | 容器运行环境 | `sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && sudo yum install docker-ce docker-ce-cli containerd.io -y && sudo systemctl start docker && sudo systemctl enable docker` |
| Docker Compose | 多容器管理工具 | `sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose && sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose` |

## 七、环境配置

### 1. Node.js版本选择
由于CentOS 7的GLIBC版本为2.17，无法支持Node.js 18+，因此建议使用：
- Node.js 16.x（稳定支持，与GLIBC 2.17兼容）

### 2. Docker镜像源配置
创建或修改`/etc/docker/daemon.json`文件：
```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://hub-mirror.c.163.com",
    "https://mirror.aliyuncs.com"
  ]
}
```

重启Docker服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 3. 项目依赖安装

**后端依赖安装：**
```bash
cd /root/projectAPP/backend
npm install
```

**前端依赖安装与构建：**
```bash
# 管理员端
cd /root/projectAPP/admin-pc
npm install
npm run build

# 律师端
cd /root/projectAPP/lawyer-pc
npm install
npm run build

# 移动端
cd /root/projectAPP/mobile-h5
npm install
npm run build
```

## 八、服务启动

### 1. 直接启动（不使用Docker）

**后端服务：**
```bash
cd /root/projectAPP/backend
npm run start
```

**Nginx配置：**
- 配置文件：`/etc/nginx/conf.d/law-firm.conf`
- 参考配置内容已在之前的部署中完成

### 2. 使用Docker Compose启动

```bash
cd /root/projectAPP
docker-compose up -d
```

## 九、验证安装

```bash
# 验证Git版本
git --version

# 验证Node.js和npm版本
node --version
npm --version

# 验证Nginx状态
systemctl status nginx

# 验证Docker和Docker Compose版本
docker --version
docker-compose --version

# 验证MySQL状态（如果直接安装）
systemctl status mysqld
```

## 十、注意事项

1. **安全配置**：
   - 配置防火墙，只开放必要端口（80, 443, 3000, 3306）
   - 设置强密码，定期更新
   - 配置SSL证书，使用HTTPS

2. **性能优化**：
   - 根据服务器配置调整Node.js进程数
   - 配置Nginx缓存
   - 优化MySQL配置

3. **监控与备份**：
   - 配置系统监控（如Prometheus + Grafana）
   - 定期备份数据库和重要文件
   - 配置日志轮转

4. **自动化部署**：
   - 配置CI/CD流程（如GitHub Actions）
   - 使用Ansible或其他配置管理工具管理服务器

## 十一、其他操作系统参考

### Ubuntu/Debian
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install git nodejs npm nginx mysql-server docker.io -y

# 安装Docker Compose
sudo apt install docker-compose -y
```

### macOS
```bash
# 使用Homebrew安装
brew install git nodejs nginx mysql docker docker-compose
```

### Windows Server
- 使用Chocolatey或直接从官网下载安装包
- 启用Windows Subsystem for Linux (WSL) 以便运行Linux命令

---

**提示**：根据服务器配置和实际需求，您可以选择安装全部或部分依赖。建议优先使用Docker Compose部署，这样可以简化环境配置和管理。