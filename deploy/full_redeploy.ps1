# Full System Redeployment Script
# Deploy all components to cloud server

# Configuration
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# Database Configuration (already reset)
$DB_HOST = "10.6.0.17"
$DB_PORT = 3306
$DB_USER = "root"
$DB_PASSWORD = "ZY520117."
$DB_NAME = "law_firm_management"

# Local Paths
$LOCAL_PROJECT_ROOT = ".."
$LOCAL_BACKEND = "$LOCAL_PROJECT_ROOT\backend"
$LOCAL_ADMIN = "$LOCAL_PROJECT_ROOT\admin-pc\dist"
$LOCAL_LAWYER = "$LOCAL_PROJECT_ROOT\lawyer-pc\dist"
$LOCAL_MOBILE = "$LOCAL_PROJECT_ROOT\mobile-h5\dist"

# Server Paths
$SERVER_DEPLOY_PATH = "/opt/law-firm-management"

# Log function
function Log($message) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message" -ForegroundColor Green
}

# Error function
function ErrorLog($message) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $message" -ForegroundColor Red
}

# Check if directory exists locally
function Check-LocalDirectory($path, $description) {
    if (-not (Test-Path -Path $path -PathType Container)) {
        ErrorLog "$description directory not found: $path"
        ErrorLog "Please build the project first: npm run build:$($description.ToLower())"
        return $false
    }
    Log "$description directory found: $path"
    return $true
}

# Start full redeployment
Log "Starting full system redeployment to cloud server..."
Log "==============================================="

# 1. Check local directories
Log "\n=== Checking Local Directories ==="
$allDirsExist = $true
$allDirsExist = $allDirsExist -and (Check-LocalDirectory $LOCAL_BACKEND "Backend")
$allDirsExist = $allDirsExist -and (Check-LocalDirectory $LOCAL_ADMIN "Admin PC")
$allDirsExist = $allDirsExist -and (Check-LocalDirectory $LOCAL_LAWYER "Lawyer PC")
$allDirsExist = $allDirsExist -and (Check-LocalDirectory $LOCAL_MOBILE "Mobile H5")

if (-not $allDirsExist) {
    ErrorLog "Local directories check failed. Please build all projects first."
    exit 1
}

# 2. Install Posh-SSH if not installed
Log "\n=== Checking Deployment Tools ==="
try {
    if (-not (Get-Module -Name Posh-SSH -ListAvailable)) {
        Log "Installing Posh-SSH module..."
        Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck
    }
    Import-Module -Name Posh-SSH -ErrorAction Stop
    Log "Posh-SSH module ready"
} catch {
    ErrorLog "Failed to install/load Posh-SSH: $($_.Exception.Message)"
    exit 1
}

# 3. Create SSH session
Log "\n=== Connecting to Cloud Server ==="
$securePassword = ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, $securePassword)

$session = $null
try {
    $session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey
    if (-not $session) {
        ErrorLog "Failed to create SSH session"
        exit 1
    }
    Log "SSH session created successfully"
} catch {
    ErrorLog "SSH connection failed: $($_.Exception.Message)"
    exit 1
}

# 4. Clean up server
Log "\n=== Cleaning Up Server ==="
$cleanupCommands = @(
    "pm2 stop all",
    "systemctl stop nginx",
    "rm -rf $SERVER_DEPLOY_PATH/*",
    "rm -f /etc/nginx/conf.d/law-firm.conf",
    "mkdir -p $SERVER_DEPLOY_PATH/{backend,admin,lawyer,mobile}"
)

foreach ($cmd in $cleanupCommands) {
    Log "Executing: $cmd"
    try {
        Invoke-SSHCommand -SessionId $session.SessionId -Command $cmd | Out-Null
    } catch {
        ErrorLog "Command failed: $cmd"
        ErrorLog "Error: $($_.Exception.Message)"
    }
}

# 5. Upload backend files
Log "\n=== Uploading Backend Files ==="
try {
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_BACKEND\*" -Destination "$SERVER_DEPLOY_PATH/backend/" -Recurse
    Log "Backend files uploaded successfully"
} catch {
    ErrorLog "Failed to upload backend files: $($_.Exception.Message)"
    exit 1
}

# 6. Upload frontend files
Log "\n=== Uploading Frontend Files ==="

# Admin PC
try {
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_ADMIN\*" -Destination "$SERVER_DEPLOY_PATH/admin/" -Recurse
    Log "Admin PC files uploaded successfully"
} catch {
    ErrorLog "Failed to upload Admin PC files: $($_.Exception.Message)"
    exit 1
}

# Lawyer PC
try {
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_LAWYER\*" -Destination "$SERVER_DEPLOY_PATH/lawyer/" -Recurse
    Log "Lawyer PC files uploaded successfully"
} catch {
    ErrorLog "Failed to upload Lawyer PC files: $($_.Exception.Message)"
    exit 1
}

# Mobile H5
try {
    Set-SCPItem -SessionId $session.SessionId -Path "$LOCAL_MOBILE\*" -Destination "$SERVER_DEPLOY_PATH/mobile/" -Recurse
    Log "Mobile H5 files uploaded successfully"
} catch {
    ErrorLog "Failed to upload Mobile H5 files: $($_.Exception.Message)"
    exit 1
}

# 7. Install backend dependencies
Log "\n=== Installing Backend Dependencies ==="
try {
    $installCmd = "cd $SERVER_DEPLOY_PATH/backend && npm install --production"
    Log "Executing: $installCmd"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $installCmd
    if ($result.ExitStatus -eq 0) {
        Log "Backend dependencies installed successfully"
    } else {
        ErrorLog "Failed to install backend dependencies"
        $result.Output | ForEach-Object { Write-Host $_ }
        exit 1
    }
} catch {
    ErrorLog "Error installing backend dependencies: $($_.Exception.Message)"
    exit 1
}

# 8. Configure Nginx
Log "\n=== Configuring Nginx ==="
$nginxConfig = @"
server {
    listen 80;
    server_name 139.155.42.254;
    
    # Admin PC
    location /admin {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
    
    # Lawyer PC
    location /lawyer {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /lawyer/index.html;
    }
    
    # Mobile H5
    location /mobile {
        root /opt/law-firm-management;
        index index.html;
        try_files $uri $uri/ /mobile/index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health Check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
"@

try {
    # Write Nginx config to server
    $nginxCmd = "cat > /etc/nginx/conf.d/law-firm.conf << 'EOF'\n$nginxConfig\nEOF"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $nginxCmd
    
    if ($result.ExitStatus -eq 0) {
        Log "Nginx configuration written successfully"
    } else {
        ErrorLog "Failed to write Nginx configuration"
        exit 1
    }
    
    # Test Nginx config
    $testCmd = "nginx -t"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $testCmd
    if ($result.ExitStatus -eq 0) {
        Log "Nginx configuration test passed"
    } else {
        ErrorLog "Nginx configuration test failed"
        $result.Output | ForEach-Object { Write-Host $_ }
        exit 1
    }
    
    # Restart Nginx
    $restartCmd = "systemctl restart nginx && systemctl enable nginx"
    Invoke-SSHCommand -SessionId $session.SessionId -Command $restartCmd | Out-Null
    Log "Nginx restarted successfully"
    
} catch {
    ErrorLog "Nginx configuration failed: $($_.Exception.Message)"
    exit 1
}

# 9. Start backend service with PM2
Log "\n=== Starting Backend Service ==="
try {
    # Start backend
    $startCmd = "cd $SERVER_DEPLOY_PATH/backend && pm2 start dist/app.js --name law-firm-backend"
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $startCmd
    
    if ($result.ExitStatus -eq 0) {
        Log "Backend service started successfully"
    } else {
        ErrorLog "Failed to start backend service"
        $result.Output | ForEach-Object { Write-Host $_ }
        exit 1
    }
    
    # Save PM2 processes
    Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 save" | Out-Null
    Log "PM2 processes saved"
    
} catch {
    ErrorLog "Failed to start backend: $($_.Exception.Message)"
    exit 1
}

# 10. Verify deployment
Log "\n=== Verifying Deployment ==="

# Check PM2 status
Log "\n1. Checking PM2 Status:"
$pm2Status = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
$pm2Status.Output | ForEach-Object { Write-Host $_ }

# Check Nginx status
Log "\n2. Checking Nginx Status:"
$nginxStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl status nginx | grep Active"
$nginxStatus.Output | ForEach-Object { Write-Host $_ }

# Check deployment directories
Log "\n3. Checking Deployment Directories:"
$dirStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -la $SERVER_DEPLOY_PATH/"
$dirStatus.Output | ForEach-Object { Write-Host $_ }

# Health check
Log "\n4. Health Check:"
Start-Sleep -Seconds 3  # Wait for services to fully start
try {
    $healthCheck = Invoke-RestMethod -Uri "http://$SERVER_HOST/health" -Method Get -TimeoutSec 5
    Log "✅ Health Check: $($healthCheck.status)"
} catch {
    ErrorLog "❌ Health Check Failed: $($_.Exception.Message)"
    # Continue with other checks
}

# Check frontend access (basic connectivity)
Log "\n5. Checking Frontend Accessibility:"
@(
    "http://$SERVER_HOST/admin",
    "http://$SERVER_HOST/lawyer",
    "http://$SERVER_HOST/mobile"
) | ForEach-Object {
    $url = $_
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5
        Log "✅ $url: HTTP $($response.StatusCode)"
    } catch {
        Log "❌ $url: $($_.Exception.Message)"
    }
}

# 11. Final summary
Log "\n" + "="*60
Log "🎉 FULL SYSTEM REDEPLOYMENT COMPLETED! 🎉"
Log "="*60
Log "Access URLs:"
Log "🔹 Admin PC:     http://$SERVER_HOST/admin"
Log "🔹 Lawyer PC:    http://$SERVER_HOST/lawyer"
Log "🔹 Mobile H5:    http://$SERVER_HOST/mobile"
Log "🔹 API Backend:  http://$SERVER_HOST/api"
Log "🔹 Health Check: http://$SERVER_HOST/health"
Log ""
Log "Database Information:"
Log "🔹 Host:     $DB_HOST:$DB_PORT"
Log "🔹 Database: $DB_NAME"
Log "🔹 User:     $DB_USER"
Log ""
Log "Initial Admin User:"
Log "🔹 Username: admin"
Log "🔹 Password: admin123"
Log "="*60
Log "Deployment completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Log "="*60

# 12. Close SSH session
Remove-SSHSession -SessionId $session.SessionId

Log "\n✅ All deployment steps completed!"
