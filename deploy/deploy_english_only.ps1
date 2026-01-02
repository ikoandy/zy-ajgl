# Simple Deployment Script - English Only

# Configuration
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# Local Paths
$LOCAL_BACKEND = "..\backend"
$LOCAL_ADMIN = "..\admin-pc\dist"
$LOCAL_LAWYER = "..\lawyer-pc\dist"
$LOCAL_MOBILE = "..\mobile-h5\dist"

# Server Paths
$SERVER_DEPLOY_PATH = "/opt/law-firm-management"

# Log function
function Write-Log {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $args" -ForegroundColor Green
}

# Start deployment
Write-Log "Starting system deployment to cloud server..."

# Step 1: Install Posh-SSH
Write-Log "Installing Posh-SSH module..."
Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck
Import-Module Posh-SSH

# Step 2: Create SSH session
Write-Log "Creating SSH session..."
$securePassword = ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, $securePassword)
$session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey

if ($session) {
    Write-Log "SSH session created successfully"
    
    # Step 3: Clean server
    Write-Log "Cleaning server..."
    $cleanCmds = @(
        "pm2 stop all",
        "systemctl stop nginx",
        "rm -rf $SERVER_DEPLOY_PATH/*",
        "rm -f /etc/nginx/conf.d/law-firm.conf",
        "mkdir -p $SERVER_DEPLOY_PATH/backend",
        "mkdir -p $SERVER_DEPLOY_PATH/admin",
        "mkdir -p $SERVER_DEPLOY_PATH/lawyer",
        "mkdir -p $SERVER_DEPLOY_PATH/mobile"
    )
    
    foreach ($cmd in $cleanCmds) {
        Write-Log "Executing: $cmd"
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd | Out-Null
    }
    
    # Step 4: Upload files
    Write-Log "Uploading backend files..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_BACKEND/*" -Destination "$SERVER_DEPLOY_PATH/backend/" -Recurse
    
    Write-Log "Uploading admin files..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_ADMIN/*" -Destination "$SERVER_DEPLOY_PATH/admin/" -Recurse
    
    Write-Log "Uploading lawyer files..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_LAWYER/*" -Destination "$SERVER_DEPLOY_PATH/lawyer/" -Recurse
    
    Write-Log "Uploading mobile files..."
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_MOBILE/*" -Destination "$SERVER_DEPLOY_PATH/mobile/" -Recurse
    
    # Step 5: Install dependencies
    Write-Log "Installing backend dependencies..."
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cd $SERVER_DEPLOY_PATH/backend && npm install --production" | Out-Null
    
    # Step 6: Configure Nginx
    Write-Log "Configuring Nginx..."
    $nginxConfig = @"
server {
    listen 80;
    server_name 139.155.42.254;
    
    location /admin {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
    
    location /lawyer {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /lawyer/index.html;
    }
    
    location /mobile {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /mobile/index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
"@
    
    $nginxCmd = "echo '$nginxConfig' > /etc/nginx/conf.d/law-firm.conf"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $nginxCmd | Out-Null
    
    # Test and restart Nginx
    Invoke-SSHCommand -SessionId $session.SessionId -Command "nginx -t" | Out-Null
    Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl restart nginx && systemctl enable nginx" | Out-Null
    
    # Step 7: Start backend
    Write-Log "Starting backend service..."
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cd $SERVER_DEPLOY_PATH/backend && pm2 start dist/app.js --name law-firm-backend" | Out-Null
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 save" | Out-Null
    
    # Step 8: Verify
    Write-Log "Verifying deployment..."
    
    # Check PM2 status
    Write-Log "PM2 Status:"    
    $pm2Result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
    $pm2Result.Output | ForEach-Object { Write-Host $_ }
    
    # Check Nginx status  
    Write-Log "Nginx Status:"    
    $nginxResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl status nginx | grep Active"
    $nginxResult.Output | ForEach-Object { Write-Host $_ }
    
    # Step 9: Final message
    Write-Log "Deployment completed!"
    Write-Log "Access URLs:"
    Write-Log "- Admin: http://$SERVER_HOST/admin"
    Write-Log "- Lawyer: http://$SERVER_HOST/lawyer"
    Write-Log "- Mobile: http://$SERVER_HOST/mobile"
    Write-Log "- API: http://$SERVER_HOST/api"
    Write-Log "- Health: http://$SERVER_HOST/health"
    
    # Close SSH session
    Remove-SSHSession -SessionId $session.SessionId
} else {
    Write-Log "Failed to create SSH session"
    exit 1
}
