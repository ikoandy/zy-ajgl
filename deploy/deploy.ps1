# 部署脚本 - 律师事务所管理系统
# PowerShell版本

# 配置信息
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# 本地路径
$LOCAL_BACKEND_PATH = "..\backend"
$LOCAL_ADMIN_PATH = "..\admin-pc\dist"
$LOCAL_LAWYER_PATH = "..\lawyer-pc\dist"
$LOCAL_MOBILE_PATH = "..\mobile-h5\dist"

# 服务器路径
$SERVER_DEPLOY_PATH = "/opt/law-firm-management"

# 打印信息
function Log($message) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message" -ForegroundColor Green
}

# 检查目录
function Check-Directory($path) {
    if (-not (Test-Path -Path $path -PathType Container)) {
        Log "错误: 目录 $path 不存在"
        exit 1
    }
}

# 开始部署
Log "开始部署律师事务所管理系统..."

# 检查本地目录
Log "检查本地目录..."
Check-Directory $LOCAL_BACKEND_PATH
Check-Directory $LOCAL_ADMIN_PATH
Check-Directory $LOCAL_LAWYER_PATH
Check-Directory $LOCAL_MOBILE_PATH

# 安装Posh-SSH模块
Log "安装Posh-SSH模块..."
Install-Module -Name Posh-SSH -Force -Scope CurrentUser

# 创建SSH会话
Log "创建SSH会话..."
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, (ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force))
$session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey

# 连接服务器并执行命令
Log "连接服务器并准备部署环境..."

$commands = @"
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
"@

Invoke-SSHCommand -SessionId $session.SessionId -Command $commands

# 上传后端文件
Log "上传后端文件..."
Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_BACKEND_PATH\*" -Destination "$SERVER_DEPLOY_PATH/backend/" -Recurse

# 上传前端文件
Log "上传前端文件..."
Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_ADMIN_PATH\*" -Destination "$SERVER_DEPLOY_PATH/admin/" -Recurse
Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_LAWYER_PATH\*" -Destination "$SERVER_DEPLOY_PATH/lawyer/" -Recurse
Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_MOBILE_PATH\*" -Destination "$SERVER_DEPLOY_PATH/mobile/" -Recurse

# 配置后端服务
Log "配置后端服务..."
$backendCommands = @"
cd /opt/law-firm-management/backend
npm install --production

# 配置PM2
pm2 start dist/app.js --name law-firm-backend
pm2 save

echo "后端服务配置完成！"
"@

Invoke-SSHCommand -SessionId $session.SessionId -Command $backendCommands

# 配置Nginx
Log "配置Nginx..."
$nginxConfig = @"
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
"@

# 将Nginx配置写入文件
$nginxCommand = "cat > /etc/nginx/conf.d/law-firm.conf << 'NGINX_EOF'
$nginxConfig
NGINX_EOF

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

echo 'Nginx配置完成！'"

Invoke-SSHCommand -SessionId $session.SessionId -Command $nginxCommand

# 关闭SSH会话
Remove-SSHSession -SessionId $session.SessionId

Log "部署完成！"
Log "访问地址："
Log "- 管理后台: http://139.155.42.254/admin"
Log "- 律师端: http://139.155.42.254/lawyer"
Log "- 移动端: http://139.155.42.254/mobile"
Log "- API: http://139.155.42.254/api"
Log "- 健康检查: http://139.155.42.254/health"