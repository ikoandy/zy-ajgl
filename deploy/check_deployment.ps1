# 检查部署状态脚本

# 配置信息
$SERVER_HOST = "139.155.42.254"
$SERVER_USER = "root"
$SERVER_PASSWORD = "Zy520117."
$SERVER_PORT = 22

# 安装Posh-SSH模块
Write-Host "安装Posh-SSH模块..."
Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck

# 创建SSH会话
Write-Host "创建SSH会话..."
$securePassword = ConvertTo-SecureString $SERVER_PASSWORD -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($SERVER_USER, $securePassword)

$session = New-SSHSession -ComputerName $SERVER_HOST -Port $SERVER_PORT -Credential $credential -AcceptKey

if ($session) {
    Write-Host "\n=== 检查Nginx状态 ==="
    $nginxStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl status nginx | grep Active"
    Write-Host $nginxStatus.Output

    Write-Host "\n=== 检查PM2状态 ==="
    $pm2Status = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 status"
    $pm2Status.Output | ForEach-Object { Write-Host $_ }

    Write-Host "\n=== 检查部署目录 ==="
    $dirStatus = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -la /opt/law-firm-management/"
    $dirStatus.Output | ForEach-Object { Write-Host $_ }

    Write-Host "\n=== 检查Nginx配置 ==="
    $nginxConf = Invoke-SSHCommand -SessionId $session.SessionId -Command "cat /etc/nginx/conf.d/law-firm.conf 2>/dev/null || echo 'Nginx配置文件不存在'"
    $nginxConf.Output | ForEach-Object { Write-Host $_ }

    Write-Host "\n=== 检查健康检查 ==="
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://$SERVER_HOST/health" -Method Get -TimeoutSec 5
        Write-Host "健康检查结果: $($healthCheck.status)"
    } catch {
        Write-Host "健康检查失败: $($_.Exception.Message)"
    }

    # 关闭SSH会话
    Remove-SSHSession -SessionId $session.SessionId
} else {
    Write-Host "SSH会话创建失败！"
}
