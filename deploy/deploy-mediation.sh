#!/bin/bash

echo "==============================================="
echo "  调解机构管理平台 - 快速部署脚本"
echo "==============================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/home/ubuntu/mediation-system"
SERVICE_NAME="mediation"
PORT=3002

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}提示: 建议使用 sudo 运行此脚本${NC}"
fi

echo -e "${GREEN}[1/6] 检查Node.js环境...${NC}"
if ! command -v node &> /dev/null; then
    echo "安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
node --version

echo ""
echo -e "${GREEN}[2/6] 创建项目目录...${NC}"
sudo mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo ""
echo -e "${GREEN}[3/6] 上传项目文件...${NC}"
echo "请将项目文件复制到 $PROJECT_DIR"
echo "可以使用以下命令上传:"
echo "scp -r /local/path/to/mediation-system/* ubuntu@server:$PROJECT_DIR/"
echo ""

echo -e "${YELLOW}等待文件上传...${NC}"
echo "上传完成后按回车继续，或输入 'skip' 跳过:"
read -r response
if [ "$response" != "skip" ]; then
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo -e "${RED}错误: 项目文件未找到！${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}[4/6] 安装项目依赖...${NC}"
cd $PROJECT_DIR
npm install

echo ""
echo -e "${GREEN}[5/6] 初始化数据库...${NC}"
if [ -f "$PROJECT_DIR/init-admin.js" ]; then
    node $PROJECT_DIR/init-admin.js
else
    echo -e "${YELLOW}警告: init-admin.js 不存在，跳过数据库初始化${NC}"
fi

echo ""
echo -e "${GREEN}[6/6] 配置并启动服务...${NC}"

# 创建systemd服务文件
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Mediation System Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node $PROJECT_DIR/server/index.js
Restart=on-failure
RestartSec=10
Environment=PORT=$PORT
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
sudo systemctl daemon-reload

# 停止旧服务（如果存在）
sudo systemctl stop ${SERVICE_NAME} 2>/dev/null || true

# 启动新服务
sudo systemctl start ${SERVICE_NAME}
sudo systemctl enable ${SERVICE_NAME}

# 等待服务启动
sleep 2

# 检查服务状态
if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
    echo ""
    echo -e "${GREEN}✓ 服务启动成功！${NC}"
    echo ""
    echo "==============================================="
    echo -e "${GREEN}  部署完成！${NC}"
    echo "==============================================="
    echo ""
    echo -e "服务状态: ${GREEN}运行中${NC}"
    echo -e "端口: ${YELLOW}$PORT${NC}"
    echo -e "项目目录: ${YELLOW}$PROJECT_DIR${NC}"
    echo ""
    
    # 测试API
    echo -e "${GREEN}测试API连接...${NC}"
    if curl -s http://localhost:$PORT/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | grep -q "success"; then
        echo -e "${GREEN}✓ API测试通过！${NC}"
    else
        echo -e "${YELLOW}! API测试失败，请检查服务日志${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}查看日志:${NC}"
    echo "sudo journalctl -u ${SERVICE_NAME} -f"
    echo ""
else
    echo ""
    echo -e "${RED}✗ 服务启动失败！${NC}"
    echo ""
    echo "查看错误日志:"
    sudo journalctl -u ${SERVICE_NAME} -n 20 --no-pager
    exit 1
fi

echo ""
echo -e "${YELLOW}下一步：配置Nginx反向代理${NC}"
echo "请确保 /etc/nginx/sites-available/default 或 /etc/nginx/nginx.conf 包含以下配置:"
echo ""
cat <<'EOF'
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
EOF
echo ""

# 重启Nginx
echo -e "${GREEN}重启Nginx...${NC}"
sudo nginx -t && sudo systemctl restart nginx

echo ""
echo -e "${GREEN}✓ 全部完成！${NC}"
echo ""
echo "访问地址: https://www.zhfcy.cn/tiaojie"
echo "管理员账号: admin"
echo "管理员密码: admin123"
echo ""