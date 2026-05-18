#!/bin/bash
# 502错误修复脚本 - 在服务器上运行

echo "=========================================="
echo "  502 Bad Gateway 修复脚本"
echo "=========================================="
echo ""

# 检查是否为root
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

echo "[1/8] 检查并安装Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

echo ""
echo "[2/8] 创建项目目录..."
mkdir -p /home/ubuntu/mediation-system
cd /home/ubuntu/mediation-system

echo ""
echo "[3/8] 检查项目文件..."
if [ ! -f "package.json" ]; then
    echo "错误: 项目文件不存在！"
    echo "请先上传项目到 /home/ubuntu/mediation-system"
    echo "命令: scp -r /本地路径/mediation-system/* ubuntu@服务器IP:/home/ubuntu/mediation-system/"
    exit 1
fi
echo "✓ 项目文件存在"

echo ""
echo "[4/8] 安装依赖..."
npm install

echo ""
echo "[5/8] 初始化数据库..."
if [ -f "init-admin.js" ]; then
    node init-admin.js
else
    echo "警告: init-admin.js不存在"
fi

echo ""
echo "[6/8] 停止旧服务..."
systemctl stop mediation 2>/dev/null || true
pkill -f "node.*server/index.js" 2>/dev/null || true
sleep 2

echo ""
echo "[7/8] 创建并启动systemd服务..."
cat > /etc/systemd/system/mediation.service << 'EOF'
[Unit]
Description=Mediation Platform Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/mediation-system
ExecStart=/usr/bin/node /home/ubuntu/mediation-system/server/index.js
Restart=always
RestartSec=10
Environment=PORT=3002
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mediation
systemctl start mediation

echo ""
echo "[8/8] 等待服务启动并验证..."
sleep 3

echo ""
echo "检查服务状态:"
systemctl status mediation --no-pager | head -15

echo ""
echo "检查端口监听:"
netstat -tlnp | grep 3002 || ss -tlnp | grep 3002

echo ""
echo "测试本地API:"
curl -s http://127.0.0.1:3002/api/auth/login -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' | head -c 200

echo ""
echo ""
echo "=========================================="
echo "  配置Nginx..."
echo "=========================================="

# 备份原有配置
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak.$(date +%s) 2>/dev/null || true

# 创建新的Nginx配置
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name www.zhfcy.cn zhfcy.cn _;
    
    root /home/ubuntu/mediation-system;
    index index.html;

    # 静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理 - 关键配置
    location /api/ {
        proxy_pass http://127.0.0.1:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        
        client_max_body_size 100M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
    }

    # 文件上传
    location /uploads/ {
        alias /home/ubuntu/mediation-system/data/uploads/;
        autoindex off;
    }

    # 日志
    access_log /var/log/nginx/mediation-access.log;
    error_log /var/log/nginx/mediation-error.log;
}
EOF

# 删除其他可能冲突的配置
rm -f /etc/nginx/sites-enabled/mediation
rm -f /etc/nginx/sites-enabled/mediation-domain
rm -f /etc/nginx/sites-enabled/mediation-subpath
rm -f /etc/nginx/sites-enabled/tiaojie.conf

# 创建软链接
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# 测试并重启Nginx
echo ""
echo "测试Nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "重启Nginx..."
    systemctl restart nginx
    echo "✓ Nginx已重启"
else
    echo "✗ Nginx配置错误"
    exit 1
fi

echo ""
echo "=========================================="
echo "  验证修复结果"
echo "=========================================="

sleep 2

echo ""
echo "测试API代理:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/auth/login -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo -e "\033[0;32m=========================================="
    echo "  ✓ 修复成功！"
    echo "==========================================\033[0m"
    echo ""
    echo "访问地址: https://www.zhfcy.cn"
    echo "登录信息:"
    echo "  用户名: admin"
    echo "  密码: admin123"
    echo ""
    echo "API测试成功!"
else
    echo ""
    echo -e "\033[0;31m✗ 仍有问题 (HTTP $HTTP_CODE)\033[0m"
    echo ""
    echo "查看日志:"
    tail -30 /var/log/nginx/mediation-error.log
    journalctl -u mediation -n 20 --no-pager
fi

echo ""