# 重置和重新部署脚本 - 律师事务所管理系统

# 配置信息
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# 数据库配置
$DB_HOST = "10.6.0.17"
$DB_PORT = 3306
$DB_USER = "root"
$DB_PASSWORD = "ZY520117."
$DB_NAME = "law_firm_management"

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

# 开始重置和重新部署
Log "开始重置和重新部署律师事务所管理系统..."
Log "==============================================="

# 检查本地目录
Log "检查本地目录..."
Check-Directory $LOCAL_BACKEND
Check-Directory $LOCAL_ADMIN
Check-Directory $LOCAL_LAWYER
Check-Directory $LOCAL_MOBILE

# 安装Posh-SSH模块
Log "安装Posh-SSH模块..."
Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck

# 创建SSH会话
Log "创建SSH会话..."
$securePassword = ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, $securePassword)

try {
    $session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey
    Log "SSH会话创建成功！"

    # 1. 停止当前服务
    Log "停止当前服务..."
    $stopServices = @(
        "pm2 stop all",
        "systemctl stop nginx"
    )
    foreach ($cmd in $stopServices) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 2. 清理服务器上的旧部署文件
    Log "清理服务器上的旧部署文件..."
    $cleanup = @(
        "rm -rf $SERVER_PATH/*",
        "rm -f /etc/nginx/conf.d/law-firm.conf"
    )
    foreach ($cmd in $cleanup) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 3. 重新创建部署目录
    Log "重新创建部署目录..."
    $createDirs = @(
        "mkdir -p $SERVER_PATH/backend",
        "mkdir -p $SERVER_PATH/admin",
        "mkdir -p $SERVER_PATH/lawyer",
        "mkdir -p $SERVER_PATH/mobile"
    )
    foreach ($cmd in $createDirs) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 4. 连接数据库并清除旧数据
    Log "连接数据库并清除旧数据..."
    $dbCleanupCmd = @"
    # 安装MySQL客户端
    yum install -y mysql
    
    # 清除数据库数据
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p'$DB_PASSWORD' << MYSQL_CMD
    DROP DATABASE IF EXISTS $DB_NAME;
    CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE $DB_NAME;
    
    -- 这里可以添加初始化表结构的SQL语句
    -- 例如：
    -- CREATE TABLE IF NOT EXISTS users (
    --   id INT AUTO_INCREMENT PRIMARY KEY,
    --   username VARCHAR(50) NOT NULL,
    --   password VARCHAR(255) NOT NULL
    -- );
    
    MYSQL_CMD
    
    echo "数据库重置完成！"
"@
    Invoke-SSHCommand -SessionId $session.SessionId -Command $dbCleanupCmd

    # 5. 上传后端文件
    Log "上传后端文件..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_BACKEND\*" -Destination "$SERVER_PATH/backend/" -Recurse

    # 6. 上传前端文件
    Log "上传前端文件..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_ADMIN\*" -Destination "$SERVER_PATH/admin/" -Recurse
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_LAWYER\*" -Destination "$SERVER_PATH/lawyer/" -Recurse
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_MOBILE\*" -Destination "$SERVER_PATH/mobile/" -Recurse

    # 7. 安装后端依赖
    Log "安装后端依赖..."
    $installDepsCmd = "cd $SERVER_PATH/backend && npm install --production"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $installDepsCmd

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

    $nginxConfigBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($nginxConfig))
    $nginxSetupCmd = "echo $nginxConfigBase64 | base64 -d > /etc/nginx/conf.d/law-firm.conf"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $nginxSetupCmd

    # 9. 启动服务
    Log "启动服务..."
    $startServices = @(
        "systemctl start nginx",
        "systemctl enable nginx",
        "cd $SERVER_PATH/backend && pm2 start dist/app.js --name law-firm-backend",
        "pm2 save"
    )
    foreach ($cmd in $startServices) {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd
    }

    # 10. 验证系统运行状态
    Log "验证系统运行状态..."
    
    # 检查PM2状态
    $pm2Status = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
    Log "PM2状态:"
    $pm2Status.Output | ForEach-Object { Write-Host $_ }
    
    # 检查Nginx状态
    $nginxStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl status nginx | grep Active"
    Log "Nginx状态: $($nginxStatus.Output)"
    
    # 检查健康状态（等待3秒让服务启动）
    Log "等待服务启动..."
    Start-Sleep -Seconds 3
    
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://$SERVER_HOST/health" -Method Get -TimeoutSec 10
        Log "健康检查结果: $($healthCheck.status)"
    } catch {
        Log "健康检查失败: $($_.Exception.Message)"
    }

    Log "==============================================="
    Log "重置和重新部署完成！"
    Log "访问地址："
    Log "- 管理后台: http://$SERVER_HOST/admin"
    Log "- 律师端: http://$SERVER_HOST/lawyer"
    Log "- 移动端: http://$SERVER_HOST/mobile"
    Log "- API: http://$SERVER_HOST/api"
    Log "- 健康检查: http://$SERVER_HOST/health"
    Log "==============================================="

} catch {
    Log "重置和重新部署失败: $($_.Exception.Message)"
    exit 1
} finally {
    # 关闭SSH会话
    if ($session) {
        Remove-SSHSession -SessionId $session.SessionId
    }
}
