# Check Deployment Status Script

# Configuration
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# Install Posh-SSH module
Write-Host "Installing Posh-SSH module..."
Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck

# Create SSH session
Write-Host "Creating SSH session..."
$securePassword = ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, $securePassword)

$session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey

if ($session) {
    Write-Host "\n=== Checking Nginx Status ==="
    $nginxStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl status nginx | grep Active"
    Write-Host $nginxStatus.Output

    Write-Host "\n=== Checking PM2 Status ==="
    $pm2Status = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
    $pm2Status.Output | ForEach-Object { Write-Host $_ }

    Write-Host "\n=== Checking Deployment Directory ==="
    $dirStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -la /opt/law-firm-management/"
    $dirStatus.Output | ForEach-Object { Write-Host $_ }

    Write-Host "\n=== Checking Nginx Configuration ==="
    $nginxConf = Invoke-SSHCommand -SessionId $session.SessionId -Command "cat /etc/nginx/conf.d/law-firm.conf 2>/dev/null || echo 'Nginx config file not found'"
    $nginxConf.Output | ForEach-Object { Write-Host $_ }

    Write-Host "\n=== Checking Health Check ==="
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://$SERVER_HOST/health" -Method Get -TimeoutSec 5
        Write-Host "Health Check Result: $($healthCheck.status)"
    } catch {
        Write-Host "Health Check Failed: $($_.Exception.Message)"
    }

    # Close SSH session
    Remove-SSHSession -SessionId $session.SessionId
} else {
    Write-Host "SSH Session Creation Failed!"
}
