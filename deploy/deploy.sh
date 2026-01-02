#!/bin/bash

# 部署脚本 - 律师事务所管理系统

# 配置信息
SERVER_HOST="139.155.42.254"
SERVER_USER="root"
SERVER_PASSWORD="Zy520117."
SERVER_PORT=22

# 本地路径
LOCAL_BACKEND_PATH="../backend"
LOCAL_ADMIN_PATH="../admin-pc/dist"
LOCAL_LAWYER_PATH="../lawyer-pc/dist"
LOCAL_MOBILE_PATH="../mobile-h5/dist"

# 服务器路径
SERVER_DEPLOY_PATH="/opt/law-firm-management"

# 打印信息
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# 检查目录
check_dir() {
    if [ ! -d "$1" ]; then
        log "错误: 目录 $1 不存在"
        exit 1
    fi
}

# 开始部署
log "开始部署律师事务所管理系统..."

# 检查本地目录
log "检查本地目录..."
check_dir "$LOCAL_BACKEND_PATH"
check_dir "$LOCAL_ADMIN_PATH"
check_dir "$LOCAL_LAWYER_PATH"
check_dir "$LOCAL_MOBILE_PATH"

# 连接服务器并执行命令
log "连接服务器并准备部署环境..."

sshpass -p "$SERVER_PASSWORD" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
    # 服务器端命令
    echo "连接服务器成功，开始配置环境..."
    
    # 创建部署目录
    mkdir -p /opt/law-firm-management/{backend,admin,lawyer,mobile}
    
    # 安装必要依赖
    echo "安装Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
    
    echo "安装PM2..."
    npm install -g pm2
    
    echo "安装Nginx..."
    yum install -y nginx
    
    echo "环境配置完成！"
EOF

log "上传后端文件..."
sshpass -p "$SERVER_PASSWORD" scp -r -P $SERVER_PORT "$LOCAL_BACKEND_PATH"/* $SERVER_USER@$SERVER_HOST:"$SERVER_DEPLOY_PATH/backend/"

log "上传前端文件..."
sshpass -p "$SERVER_PASSWORD" scp -r -P $SERVER_PORT "$LOCAL_ADMIN_PATH"/* $SERVER_USER@$SERVER_HOST:"$SERVER_DEPLOY_PATH/admin/"
sshpass -p "$SERVER_PASSWORD" scp -r -P $SERVER_PORT "$LOCAL_LAWYER_PATH"/* $SERVER_USER@$SERVER_HOST:"$SERVER_DEPLOY_PATH/lawyer/"
sshpass -p "$SERVER_PASSWORD" scp -r -P $SERVER_PORT "$LOCAL_MOBILE_PATH"/* $SERVER_USER@$SERVER_HOST:"$SERVER_DEPLOY_PATH/mobile/"

log "配置后端服务..."
sshpass -p "$SERVER_PASSWORD" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
    # 服务器端命令
    echo "配置后端服务..."
    cd /opt/law-firm-management/backend
    npm install --production
    
    # 配置PM2
    pm2 start dist/app.js --name law-firm-backend
    pm2 save
    
    echo "后端服务配置完成！"
EOF

log "配置Nginx..."
sshpass -p "$SERVER_PASSWORD" ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
    # 服务器端命令
    echo "配置Nginx..."
    
    # 创建Nginx配置
    cat > /etc/nginx/conf.d/law-firm.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name 139.155.42.254;
    
    # 管理后台
    location /admin {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
    
    # 律师端
    location /lawyer {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /lawyer/index.html;
    }
    
    # 移动端
    location /mobile {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /mobile/index.html;
    }
    
    # API接口
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX_EOF
    
    # 重启Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    echo "Nginx配置完成！"
EOF

log "部署完成！"
log "访问地址："
log "- 管理后台: http://139.155.42.254/admin"
log "- 律师端: http://139.155.42.254/lawyer"
log "- 移动端: http://139.155.42.254/mobile"
log "- API: http://139.155.42.254/api"
log "- 健康检查: http://139.155.42.254/health"
