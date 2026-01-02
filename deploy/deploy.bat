@echo off
setlocal

echo 部署律师事务所管理系统...
echo =======================================

REM 配置信息
set "SERVER_HOST=139.155.42.254"
set "SERVER_USER=root"
set "SERVER_PASSWORD=Zy520117."
set "SERVER_PORT=22"

REM 本地路径
set "LOCAL_BACKEND=..\backend"
set "LOCAL_ADMIN=..\admin-pc\dist"
set "LOCAL_LAWYER=..\lawyer-pc\dist"
set "LOCAL_MOBILE=..\mobile-h5\dist"

REM 服务器路径
set "SERVER_PATH=/opt/law-firm-management"

echo 检查本地目录...
if not exist "%LOCAL_BACKEND%" (echo 错误: 后端目录不存在 && exit /b 1)
if not exist "%LOCAL_ADMIN%" (echo 错误: 管理后台目录不存在 && exit /b 1)
if not exist "%LOCAL_LAWYER%" (echo 错误: 律师端目录不存在 && exit /b 1)
if not exist "%LOCAL_MOBILE%" (echo 错误: 移动端目录不存在 && exit /b 1)

echo 下载WinSCP...
if not exist "winscp.exe" (echo 正在下载WinSCP... && powershell -Command "Invoke-WebRequest -Uri 'https://winscp.net/download/WinSCP-5.21.8.zip' -OutFile 'WinSCP.zip'" && powershell -Command "Expand-Archive -Path 'WinSCP.zip' -DestinationPath '.'" && move "WinSCP-5.21.8\winscp.exe" . && del WinSCP.zip && rmdir /s /q "WinSCP-5.21.8")

echo 创建WinSCP脚本...
echo option batch abort > deploy_winscp.txt
echo option confirm off >> deploy_winscp.txt
echo open sftp://%SERVER_USER%:%SERVER_PASSWORD%@%SERVER_HOST%:%SERVER_PORT% -hostkey="*" >> deploy_winscp.txt
echo mkdir -p %SERVER_PATH%/backend >> deploy_winscp.txt
echo mkdir -p %SERVER_PATH%/admin >> deploy_winscp.txt
echo mkdir -p %SERVER_PATH%/lawyer >> deploy_winscp.txt
echo mkdir -p %SERVER_PATH%/mobile >> deploy_winscp.txt
echo put "%LOCAL_BACKEND%\*" %SERVER_PATH%/backend/ -rawtransfersettings PreserveTimeDirs=1 >> deploy_winscp.txt
echo put "%LOCAL_ADMIN%\*" %SERVER_PATH%/admin/ -rawtransfersettings PreserveTimeDirs=1 >> deploy_winscp.txt
echo put "%LOCAL_LAWYER%\*" %SERVER_PATH%/lawyer/ -rawtransfersettings PreserveTimeDirs=1 >> deploy_winscp.txt
echo put "%LOCAL_MOBILE%\*" %SERVER_PATH%/mobile/ -rawtransfersettings PreserveTimeDirs=1 >> deploy_winscp.txt
echo exit >> deploy_winscp.txt

echo 上传文件到服务器...
winscp.exe /script=deploy_winscp.txt /log=deploy_winscp.log
if errorlevel 1 (echo 上传失败，请检查日志文件 && exit /b 1)

echo 创建服务器部署脚本...
echo #!/bin/bash > server_deploy.sh
echo # 创建目录 >> server_deploy.sh
echo mkdir -p /opt/law-firm-management/{backend,admin,lawyer,mobile} >> server_deploy.sh
echo # 安装依赖 >> server_deploy.sh
echo yum update -y >> server_deploy.sh
echo yum install -y curl >> server_deploy.sh
echo # 安装Node.js >> server_deploy.sh
echo curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - >> server_deploy.sh
echo yum install -y nodejs >> server_deploy.sh
echo # 安装PM2 >> server_deploy.sh
echo npm install -g pm2 >> server_deploy.sh
echo # 安装Nginx >> server_deploy.sh
echo yum install -y nginx >> server_deploy.sh
echo # 配置后端 >> server_deploy.sh
echo cd /opt/law-firm-management/backend >> server_deploy.sh
echo npm install --production >> server_deploy.sh
echo # 启动后端服务 >> server_deploy.sh
echo pm2 start dist/app.js --name law-firm-backend >> server_deploy.sh
echo pm2 save >> server_deploy.sh
echo # 配置Nginx >> server_deploy.sh
echo cat > /etc/nginx/conf.d/law-firm.conf << 'NGINX_EOF' >> server_deploy.sh
echo server { >> server_deploy.sh
echo     listen 80; >> server_deploy.sh
echo     server_name 139.155.42.254; >> server_deploy.sh
echo     # 管理后台 >> server_deploy.sh
echo     location /admin { >> server_deploy.sh
echo         root /opt/law-firm-management; >> server_deploy.sh
echo         index index.html; >> server_deploy.sh
echo         try_files $uri $uri/ /admin/index.html; >> server_deploy.sh
echo     } >> server_deploy.sh
echo     # 律师端 >> server_deploy.sh
echo     location /lawyer { >> server_deploy.sh
echo         root /opt/law-firm-management; >> server_deploy.sh
echo         index index.html; >> server_deploy.sh
echo         try_files $uri $uri/ /lawyer/index.html; >> server_deploy.sh
echo     } >> server_deploy.sh
echo     # 移动端 >> server_deploy.sh
echo     location /mobile { >> server_deploy.sh
echo         root /opt/law-firm-management; >> server_deploy.sh
echo         index index.html; >> server_deploy.sh
echo         try_files $uri $uri/ /mobile/index.html; >> server_deploy.sh
echo     } >> server_deploy.sh
echo     # API接口 >> server_deploy.sh
echo     location /api { >> server_deploy.sh
echo         proxy_pass http://localhost:3000; >> server_deploy.sh
echo         proxy_set_header Host $host; >> server_deploy.sh
echo         proxy_set_header X-Real-IP $remote_addr; >> server_deploy.sh
echo         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> server_deploy.sh
echo         proxy_set_header X-Forwarded-Proto $scheme; >> server_deploy.sh
echo     } >> server_deploy.sh
echo     # 健康检查 >> server_deploy.sh
echo     location /health { >> server_deploy.sh
echo         proxy_pass http://localhost:3000/health; >> server_deploy.sh
echo         proxy_set_header Host $host; >> server_deploy.sh
echo         proxy_set_header X-Real-IP $remote_addr; >> server_deploy.sh
echo     } >> server_deploy.sh
echo } >> server_deploy.sh
echo NGINX_EOF >> server_deploy.sh
echo # 重启Nginx >> server_deploy.sh
echo systemctl restart nginx >> server_deploy.sh
echo systemctl enable nginx >> server_deploy.sh
echo echo "部署完成！" >> server_deploy.sh

echo 上传服务器部署脚本...
echo open sftp://%SERVER_USER%:%SERVER_PASSWORD%@%SERVER_HOST%:%SERVER_PORT% -hostkey="*" > upload_server_script.txt
echo put server_deploy.sh /root/ >> upload_server_script.txt
echo exit >> upload_server_script.txt
winscp.exe /script=upload_server_script.txt /log=upload_server_script.log

echo 连接服务器执行部署...
echo 请手动连接服务器执行以下命令：
echo ssh %SERVER_USER%@%SERVER_HOST% -p %SERVER_PORT%
echo 输入密码：%SERVER_PASSWORD%
echo chmod +x /root/server_deploy.sh
echo sh /root/server_deploy.sh

echo 清理临时文件...
del deploy_winscp.txt
del upload_server_script.txt
del server_deploy.sh

echo 部署完成！
echo 请手动连接服务器执行部署脚本。
echo 访问地址：
echo - 管理后台: http://139.155.42.254/admin
echo - 律师端: http://139.155.42.254/lawyer
echo - 移动端: http://139.155.42.254/mobile
echo - API: http://139.155.42.254/api
echo - 健康检查: http://139.155.42.254/health

echo =======================================
echo 部署脚本结束.
pause
