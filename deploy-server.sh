#!/bin/bash

echo "====================================="
echo "开始在云服务器部署系统..."
echo "====================================="

# 1. 安装必要软件
echo "1. 安装必要软件..."
yum install -y python3 python3-pip nginx git
yum install -y python3-devel gcc

# 2. 安装Flask和相关依赖
echo "2. 安装Flask和相关依赖..."
pip3 install flask flask-cors pymysql gunicorn

# 3. 创建项目目录
echo "3. 创建项目目录..."
mkdir -p /app/law-firm-management
mkdir -p /var/www/law-firm-management/{admin,lawyer,mobile}

# 4. 配置Nginx
echo "4. 配置Nginx..."
cat > /etc/nginx/conf.d/law-firm.conf << 'EOF'
server {
    listen 80;
    server_name 139.155.42.254;

    # 管理端静态文件
    location /admin/ {
        root /var/www/law-firm-management;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 律师端静态文件
    location /lawyer/ {
        root /var/www/law-firm-management;
        index index.html;
        try_files $uri $uri/ /lawyer/index.html;
    }

    # 移动端静态文件
    location /mobile/ {
        root /var/www/law-firm-management;
        index index.html;
        try_files $uri $uri/ /mobile/index.html;
    }

    # 后端API反向代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # 主页面重定向到管理端
    location / {
        return 302 /admin/;
    }
}
EOF

# 5. 启动Nginx
echo "5. 启动Nginx..."
systemctl start nginx
systemctl enable nginx
nginx -t
systemctl restart nginx

# 6. 启动Flask后端
echo "6. 启动Flask后端..."
cd /app/law-firm-management

# 停止之前的进程
pkill -f gunicorn || true

# 启动新的Gunicorn进程
gunicorn -w 4 -b 0.0.0.0:3000 backend_flask:app --daemon

# 7. 验证部署
echo "7. 验证部署结果..."
echo "检查Nginx状态:"
systemctl status nginx | head -20

echo "检查Flask服务状态:"
ps aux | grep gunicorn | grep -v grep

echo "====================================="
echo "部署完成！"
echo "访问地址："
echo "管理端：http://139.155.42.254/admin/"
echo "律师端：http://139.155.42.254/lawyer/"
echo "移动端：http://139.155.42.254/mobile/"
echo "健康检查：http://139.155.42.254/health"
echo "====================================="
