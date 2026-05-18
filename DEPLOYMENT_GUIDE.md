# 调解机构管理平台 - 部署指南

## 服务器要求
- Ubuntu 20.04+ / CentOS 7+
- 开放端口: 3002 (后端API), 80/443 (Nginx)
- 域名已解析到服务器IP

## 快速部署步骤

### 方式一：使用一键部署脚本

```bash
# 1. 连接到服务器
ssh ubuntu@139.155.148.99

# 2. 下载部署脚本
cd /home/ubuntu
curl -O https://raw.githubusercontent.com/your-repo/main/deploy/quick-deploy.sh
chmod +x quick-deploy.sh

# 3. 上传项目文件
# 在本地执行:
scp -r /path/to/mediation-system/* ubuntu@139.155.148.99:/home/ubuntu/mediation-system/

# 4. 运行部署脚本
cd /home/ubuntu
./quick-deploy.sh
```

### 方式二：手动部署

#### 步骤1：安装Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # 应该显示 v18.x.x
```

#### 步骤2：上传项目
```bash
# 在本地执行:
scp -r /path/to/mediation-system ubuntu@139.155.148.99:/home/ubuntu/
```

#### 步骤3：安装依赖
```bash
cd /home/ubuntu/mediation-system
npm install
```

#### 步骤4：初始化数据库
```bash
cd /home/ubuntu/mediation-system
node init-admin.js
```

#### 步骤5：创建系统服务
```bash
sudo tee /etc/systemd/system/mediation.service > /dev/null <<EOF
[Unit]
Description=Mediation Platform Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mediation-system
ExecStart=/usr/bin/node /home/ubuntu/mediation-system/server/index.js
Restart=always
RestartSec=10
Environment=PORT=3002

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mediation
sudo systemctl start mediation
```

#### 步骤6：验证后端服务
```bash
# 检查服务状态
sudo systemctl status mediation

# 测试API
curl http://localhost:3002/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 步骤7：配置Nginx

**方案A：子路径部署 (推荐)**
```bash
sudo tee /etc/nginx/sites-available/mediation-subpath > /dev/null <<'EOF'
server {
    listen 80;
    server_name www.zhfcy.cn zhfcy.cn _;

    root /var/www/html;
    index index.html;

    # 调解平台 - /tiaojie 路径
    location /tiaojie/ {
        alias /home/ubuntu/mediation-system/;
        try_files $uri $uri/ /tiaojie/index.html;
    }

    # 调解平台 API
    location /tiaojie/api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
        proxy_read_timeout 300s;
    }

    # 其他路径...
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mediation-subpath /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

**方案B：子域名部署**
```bash
sudo tee /etc/nginx/sites-available/mediation-domain > /dev/null <<'EOF'
server {
    listen 80;
    server_name tiaojie.zhfcy.cn;

    root /home/ubuntu/mediation-system;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mediation-domain /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

#### 步骤8：配置SSL (可选但推荐)
```bash
# 使用 Let's Encrypt 免费证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d www.zhfcy.cn -d zhfcy.cn
# 或
sudo certbot --nginx -d tiaojie.zhfcy.cn
```

## 故障排除

### 502 Bad Gateway
1. 检查后端服务是否运行：
   ```bash
   sudo systemctl status mediation
   ```

2. 检查端口是否监听：
   ```bash
   sudo netstat -tlnp | grep 3002
   ```

3. 查看Nginx错误日志：
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. 查看后端服务日志：
   ```bash
   sudo journalctl -u mediation -f
   ```

### 无法登录
1. 检查数据库是否初始化：
   ```bash
   ls -la /home/ubuntu/mediation-system/data/
   ```

2. 重新初始化数据库：
   ```bash
   cd /home/ubuntu/mediation-system
   node init-admin.js
   ```

3. 重启服务：
   ```bash
   sudo systemctl restart mediation
   ```

## 访问地址

- 子路径访问: https://www.zhfcy.cn/tiaojie
- 子域名访问: https://tiaojie.zhfcy.cn
- 直接访问: http://139.155.148.99

## 默认登录信息
- 用户名: admin
- 密码: admin123