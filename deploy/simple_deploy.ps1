# 简单部署脚本 - 律师事务所管理系统

# 配置信息
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# 本地路径
$LOCAL_BACKEND = "..\backend"
$LOCAL_ADMIN = "..\admin-pc\dist"
$LOCAL_LAWYER = "..\lawyer-pc\dist"
$LOCAL_MOBILE = "..\mobile-h5\dist"

# 服务器路径
$SERVER_PATH = "/opt/law-firm-management"

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
Check-Directory $LOCAL_BACKEND
Check-Directory $LOCAL_ADMIN
Check-Directory $LOCAL_LAWYER
Check-Directory $LOCAL_MOBILE

# 安装必要的模块
Log "安装Posh-SSH模块..."
Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck

# 创建SSH会话
Log "创建SSH会话..."
$securePassword = ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, $securePassword)

try {
    $session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey
    Log "SSH会话创建成功！"

    # 1. 创建部署目录
    Log "创建部署目录..."
    $createDirs = @(
        "mkdir -p $SERVER_PATH/backend",
        "mkdir -p $SERVER_PATH/admin",
        "mkdir -p $SERVER_PATH/lawyer",
        "mkdir -p $SERVER_PATH/mobile"
    )
    foreach ($cmd in $createDirs) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 2. 上传后端文件
    Log "上传后端文件..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_BACKEND\*" -Destination "$SERVER_PATH/backend/" -Recurse

    # 3. 上传前端文件
    Log "上传前端文件..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_ADMIN\*" -Destination "$SERVER_PATH/admin/" -Recurse
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_LAWYER\*" -Destination "$SERVER_PATH/lawyer/" -Recurse
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_MOBILE\*" -Destination "$SERVER_PATH/mobile/" -Recurse

    # 4. 安装Node.js和PM2
    Log "安装Node.js..."
    $installNode = @(
        "curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -",
        "yum install -y nodejs",
        "npm install -g pm2"
    )
    foreach ($cmd in $installNode) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 5. 安装Nginx
    Log "安装Nginx..."
    $installNginx = @(
        "yum install -y nginx"
    )
    foreach ($cmd in $installNginx) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 6. 安装后端依赖
    Log "安装后端依赖..."
    $installDependencies = @(
        "cd $SERVER_PATH/backend",
        "npm install --production"
    )
    $depsCmd = $installDependencies -join "; "
    Invoke-SSHCommand -SessionId $session.SessionId -Command $depsCmd

    # 7. 启动后端服务
    Log "启动后端服务..."
    $startBackend = @(
        "cd $SERVER_PATH/backend",
        "pm2 start dist/app.js --name law-firm-backend",
        "pm2 save"
    )
    $startCmd = $startBackend -join "; "
    Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd

    # 8. 配置Nginx
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

    # 将Nginx配置写入服务器
    $nginxConfigBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($nginxConfig))
    $nginxSetup = "echo $nginxConfigBase64 | base64 -d > /etc/nginx/conf.d/law-firm.conf; systemctl restart nginx; systemctl enable nginx"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $nginxSetup

    # 9. 验证部署
    Log "验证部署..."
    $checkBackend = "pm2 status"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $checkBackend

    $checkNginx = "systemctl status nginx | grep Active"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $checkNginx

    Log "部署完成！"
    Log "访问地址："
    Log "- 管理后台: http://139.155.42.254/admin"
    Log "- 律师端: http://139.155.42.254/lawyer"
    Log "- 移动端: http://139.155.42.254/mobile"
    Log "- API: http://139.155.42.254/api"
    Log "- 健康检查: http://139.155.42.254/health"

} catch {
    Log "部署失败: $($_.Exception.Message)"
    exit 1
} finally {
    # 关闭SSH会话
    if ($session) {
        Remove-SSHSession -SessionId $session.SessionId
    }
}
