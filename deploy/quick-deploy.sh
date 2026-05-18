#!/bin/bash

# ===========================================
# 调解机构管理平台 - 独立部署脚本
# ===========================================

set -e

# 配置
APP_DIR="/home/ubuntu/mediation-system"
APP_PORT=3002
SERVICE_NAME="mediation"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "=============================================="
echo "   调解机构管理平台 - 部署脚本"
echo "=============================================="
echo ""

# 1. 安装依赖
log_info "检查系统环境..."
if ! command -v node &> /dev/null; then
    log_info "安装 Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
    sudo apt-get install -y nodejs
fi

if ! command -v npm &> /dev/null; then
    log_error "npm 未安装"
    exit 1
fi

log_info "Node.js 版本: $(node --version)"
log_info "npm 版本: $(npm --version)"

# 2. 创建目录
log_info "创建应用目录..."
sudo mkdir -p $APP_DIR
cd $APP_DIR

# 3. 复制文件（如果还没有）
if [ ! -f "$APP_DIR/package.json" ]; then
    log_warn "请将项目文件复制到 $APP_DIR"
    log_info "命令: scp -r /本地路径/mediation-system/* ubuntu@服务器IP:$APP_DIR/"
    exit 1
fi

# 4. 安装依赖
log_info "安装项目依赖..."
cd $APP_DIR
npm install --production

# 5. 初始化数据库
log_info "初始化数据库..."
if [ -f "$APP_DIR/init-admin.js" ]; then
    node $APP_DIR/init-admin.js
fi

# 6. 停止旧服务
log_info "停止旧服务..."
sudo systemctl stop $SERVICE_NAME 2>/dev/null || true
sudo pkill -f "node.*server/index.js" 2>/dev/null || true
sleep 1

# 7. 创建 systemd 服务
log_info "创建系统服务..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Mediation Platform Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/server/index.js
Restart=always
RestartSec=10
Environment=PORT=$APP_PORT
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 8. 重新加载并启动服务
log_info "启动服务..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# 9. 等待服务启动
sleep 3

# 10. 检查服务状态
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    log_info "服务启动成功！"
    
    # 测试API
    log_info "测试API..."
    RESPONSE=$(curl -s http://localhost:$APP_PORT/api/auth/login \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}')
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        log_info "API测试通过！"
    else
        log_warn "API测试失败，请检查日志"
        sudo journalctl -u $SERVICE_NAME -n 10 --no-pager
    fi
else
    log_error "服务启动失败！"
    sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
    exit 1
fi

echo ""
echo "=============================================="
echo -e "${GREEN}   部署完成！${NC}"
echo "=============================================="
echo ""
echo -e "服务状态: ${GREEN}运行中${NC}"
echo -e "服务端口: ${YELLOW}$APP_PORT${NC}"
echo -e "应用目录: ${YELLOW}$APP_DIR${NC}"
echo ""
echo "管理命令:"
echo "  查看日志: sudo journalctl -u $SERVICE_NAME -f"
echo "  重启服务: sudo systemctl restart $SERVICE_NAME"
echo "  停止服务: sudo systemctl stop $SERVICE_NAME"
echo ""

# 10. 配置 Nginx
log_info "配置 Nginx..."
sudo tee /etc/nginx/sites-available/mediation > /dev/null <<'EOF'
# 调解机构管理平台
server {
    listen 80;
    server_name _;

    root /home/ubuntu/mediation-system;
    index index.html;

    client_max_body_size 100M;

    # 静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        client_max_body_size 100M;
        proxy_read_timeout 300s;
    }

    # 文件上传
    location /uploads/ {
        alias /home/ubuntu/mediation-system/data/uploads/;
        autoindex off;
    }
}
EOF

# 如果有SSL证书，启用HTTPS
if [ -f "/etc/nginx/ssl/zhfcy.cn.crt" ] && [ -f "/etc/nginx/ssl/zhfcy.cn.key" ]; then
    log_info "检测到SSL证书，配置HTTPS..."
    sudo tee /etc/nginx/sites-available/mediation-ssl > /dev/null <<'EOF'
server {
    listen 80;
    server_name www.zhfcy.cn zhfcy.cn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name www.zhfcy.cn zhfcy.cn;

    ssl_certificate /etc/nginx/ssl/zhfcy.cn.crt;
    ssl_certificate_key /etc/nginx/ssl/zhfcy.cn.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /home/ubuntu/mediation-system;
    index index.html;

    client_max_body_size 100M;

    # 主页面
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        client_max_body_size 100M;
        proxy_read_timeout 300s;
    }

    # 文件
    location /uploads/ {
        alias /home/ubuntu/mediation-system/data/uploads/;
        autoindex off;
    }
}
EOF
    sudo ln -sf /etc/nginx/sites-available/mediation-ssl /etc/nginx/sites-enabled/mediation-ssl
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# 启用站点
sudo ln -sf /etc/nginx/sites-available/mediation /etc/nginx/sites-enabled/mediation

# 测试并重启 Nginx
if sudo nginx -t; then
    sudo systemctl restart nginx
    log_info "Nginx 配置成功并已重启"
else
    log_error "Nginx 配置测试失败"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ 全部完成！${NC}"
echo ""
echo "访问地址:"
if [ -f "/etc/nginx/ssl/zhfcy.cn.crt" ]; then
    echo -e "  ${YELLOW}https://www.zhfcy.cn${NC}"
    echo -e "  ${YELLOW}https://zhfcy.cn${NC}"
else
    echo -e "  ${YELLOW}http://服务器IP${NC}"
fi
echo ""
echo "登录信息:"
echo -e "  用户名: ${YELLOW}admin${NC}"
echo -e "  密码: ${YELLOW}admin123${NC}"
echo ""