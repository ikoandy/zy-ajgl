@echo off
chcp 65001 >nul

setlocal enabledelayedexpansion

rem 配置信息
set "SERVER_HOST=139.155.42.254"
set "SERVER_USER=root"
set "SERVER_PASSWORD=Zy520117."
set "SERVER_PORT=22"

rem 本地路径
set "LOCAL_BACKEND_PATH=..\backend"
set "LOCAL_ADMIN_PATH=..\admin-pc\dist"
set "LOCAL_LAWYER_PATH=..\lawyer-pc\dist"
set "LOCAL_MOBILE_PATH=..\mobile-h5\dist"

rem 服务器路径
set "SERVER_DEPLOY_PATH=/opt/law-firm-management"

rem 打印信息
:log
    echo [%date% %time%] %1
    goto :eof

rem 开始部署
call :log "开始部署律师事务所管理系统..."

rem 检查前端项目是否已构建
call :log "检查前端项目构建情况..."

if not exist "%LOCAL_ADMIN_PATH%" (
    call :log "构建admin-pc项目..."
    cd /d "..\admin-pc"
    npm run build
    cd /d "%~dp0"
)

if not exist "%LOCAL_LAWYER_PATH%" (
    call :log "构建lawyer-pc项目..."
    cd /d "..\lawyer-pc"
    npm run build
    cd /d "%~dp0"
)

if not exist "%LOCAL_MOBILE_PATH%" (
    call :log "构建mobile-h5项目..."
    cd /d "..\mobile-h5"
    npm run build
    cd /d "%~dp0"
)

rem 验证构建
call :log "验证前端项目构建..."

if not exist "%LOCAL_ADMIN_PATH%" (
    call :log "错误: admin-pc构建失败"
    exit /b 1
)

if not exist "%LOCAL_LAWYER_PATH%" (
    call :log "错误: lawyer-pc构建失败"
    exit /b 1
)

if not exist "%LOCAL_MOBILE_PATH%" (
    call :log "错误: mobile-h5构建失败"
    exit /b 1
)

call :log "前端项目构建成功！"

rem 安装Node.js模块用于SSH连接
call :log "安装Node.js SSH模块..."
npm install ssh2 scp2

rem 创建Node.js部署脚本
call :log "创建Node.js部署脚本..."

> deploy-script.js echo const Client = require('ssh2').Client;
>> deploy-script.js echo const scpClient = require('scp2');
>> deploy-script.js echo 
>> deploy-script.js echo const config = {
>> deploy-script.js echo   host: '%SERVER_HOST%',
>> deploy-script.js echo   port: %SERVER_PORT%,
>> deploy-script.js echo   username: '%SERVER_USER%',
>> deploy-script.js echo   password: '%SERVER_PASSWORD%'
>> deploy-script.js echo };
>> deploy-script.js echo 
>> deploy-script.js echo const serverPath = '%SERVER_DEPLOY_PATH%';
>> deploy-script.js echo 
>> deploy-script.js echo function log(message) {
>> deploy-script.js echo   console.log(`[${new Date().toLocaleString()}] ${message}`);
>> deploy-script.js echo }
>> deploy-script.js echo 
>> deploy-script.js echo // 执行SSH命令
>> deploy-script.js echo function execCommand(conn, command) {
>> deploy-script.js echo   return new Promise((resolve, reject) => {
>> deploy-script.js echo     conn.exec(command, (err, stream) => {
>> deploy-script.js echo       if (err) return reject(err);
>> deploy-script.js echo       
>> deploy-script.js echo       let output = '';
>> deploy-script.js echo       stream.on('close', (code, signal) => {
>> deploy-script.js echo         if (code !== 0) {
>> deploy-script.js echo           reject(new Error(`Command failed with code ${code}: ${output}`));
>> deploy-script.js echo         } else {
>> deploy-script.js echo           resolve(output);
>> deploy-script.js echo         }
>> deploy-script.js echo       });
>> deploy-script.js echo       
>> deploy-script.js echo       stream.on('data', (data) => {
>> deploy-script.js echo         output += data.toString();
>> deploy-script.js echo         process.stdout.write(data);
>> deploy-script.js echo       });
>> deploy-script.js echo       
>> deploy-script.js echo       stream.stderr.on('data', (data) => {
>> deploy-script.js echo         output += data.toString();
>> deploy-script.js echo         process.stderr.write(data);
>> deploy-script.js echo       });
>> deploy-script.js echo     });
>> deploy-script.js echo   });
>> deploy-script.js echo }
>> deploy-script.js echo 
>> deploy-script.js echo // 上传文件
>> deploy-script.js echo function uploadFiles(localPath, remotePath) {
>> deploy-script.js echo   return new Promise((resolve, reject) => {
>> deploy-script.js echo     scpClient.scp(localPath, {
>> deploy-script.js echo       ...config,
>> deploy-script.js echo       path: remotePath
>> deploy-script.js echo     }, (err) => {
>> deploy-script.js echo       if (err) {
>> deploy-script.js echo         reject(err);
>> deploy-script.js echo       } else {
>> deploy-script.js echo         resolve();
>> deploy-script.js echo       }
>> deploy-script.js echo     });
>> deploy-script.js echo   });
>> deploy-script.js echo }
>> deploy-script.js echo 
>> deploy-script.js echo // 主部署函数
>> deploy-script.js echo async function deploy() {
>> deploy-script.js echo   log('开始部署...');
>> deploy-script.js echo   
>> deploy-script.js echo   const conn = new Client();
>> deploy-script.js echo   
>> deploy-script.js echo   return new Promise((resolve, reject) => {
>> deploy-script.js echo     conn.on('ready', async () => {
>> deploy-script.js echo       try {
>> deploy-script.js echo         // 创建部署目录
>> deploy-script.js echo         log('创建部署目录...');
>> deploy-script.js echo         await execCommand(conn, `mkdir -p ${serverPath}/backend ${serverPath}/admin ${serverPath}/lawyer ${serverPath}/mobile`);
>> deploy-script.js echo         
>> deploy-script.js echo         // 上传后端文件
>> deploy-script.js echo         log('上传后端文件...');
>> deploy-script.js echo         await uploadFiles('../backend/*', `${serverPath}/backend/`);
>> deploy-script.js echo         
>> deploy-script.js echo         // 上传前端文件
>> deploy-script.js echo         log('上传admin-pc文件...');
>> deploy-script.js echo         await uploadFiles('../admin-pc/dist/*', `${serverPath}/admin/`);
>> deploy-script.js echo         
>> deploy-script.js echo         log('上传lawyer-pc文件...');
>> deploy-script.js echo         await uploadFiles('../lawyer-pc/dist/*', `${serverPath}/lawyer/`);
>> deploy-script.js echo         
>> deploy-script.js echo         log('上传mobile-h5文件...');
>> deploy-script.js echo         await uploadFiles('../mobile-h5/dist/*', `${serverPath}/mobile/`);
>> deploy-script.js echo         
>> deploy-script.js echo         // 配置后端
>> deploy-script.js echo         log('配置后端服务...');
>> deploy-script.js echo         await execCommand(conn, `cd ${serverPath}/backend && npm install --production`);
>> deploy-script.js echo         await execCommand(conn, `pm2 start ${serverPath}/backend/dist/app.js --name law-firm-backend || pm2 restart law-firm-backend`);
>> deploy-script.js echo         await execCommand(conn, `pm2 save`);
>> deploy-script.js echo         
>> deploy-script.js echo         // 配置Nginx
>> deploy-script.js echo         log('配置Nginx...');
>> deploy-script.js echo         await execCommand(conn, `cat > /etc/nginx/conf.d/law-firm.conf << 'EOF'`);
>> deploy-script.js echo         await execCommand(conn, `server {`);
>> deploy-script.js echo         await execCommand(conn, `    listen 80;`);
>> deploy-script.js echo         await execCommand(conn, `    server_name 139.155.42.254;`);
>> deploy-script.js echo         await execCommand(conn, `    `);
>> deploy-script.js echo         await execCommand(conn, `    # 管理后台`);
>> deploy-script.js echo         await execCommand(conn, `    location /admin {`);
>> deploy-script.js echo         await execCommand(conn, `        root /opt/law-firm-management;`);
>> deploy-script.js echo         await execCommand(conn, `        index index.html;`);
>> deploy-script.js echo         await execCommand(conn, `        try_files $uri $uri/ /admin/index.html;`);
>> deploy-script.js echo         await execCommand(conn, `    }`);
>> deploy-script.js echo         await execCommand(conn, `    `);
>> deploy-script.js echo         await execCommand(conn, `    # 律师端`);
>> deploy-script.js echo         await execCommand(conn, `    location /lawyer {`);
>> deploy-script.js echo         await execCommand(conn, `        root /opt/law-firm-management;`);
>> deploy-script.js echo         await execCommand(conn, `        index index.html;`);
>> deploy-script.js echo         await execCommand(conn, `        try_files $uri $uri/ /lawyer/index.html;`);
>> deploy-script.js echo         await execCommand(conn, `    }`);
>> deploy-script.js echo         await execCommand(conn, `    `);
>> deploy-script.js echo         await execCommand(conn, `    # 移动端`);
>> deploy-script.js echo         await execCommand(conn, `    location /mobile {`);
>> deploy-script.js echo         await execCommand(conn, `        root /opt/law-firm-management;`);
>> deploy-script.js echo         await execCommand(conn, `        index index.html;`);
>> deploy-script.js echo         await execCommand(conn, `        try_files $uri $uri/ /mobile/index.html;`);
>> deploy-script.js echo         await execCommand(conn, `    }`);
>> deploy-script.js echo         await execCommand(conn, `    `);
>> deploy-script.js echo         await execCommand(conn, `    # API接口`);
>> deploy-script.js echo         await execCommand(conn, `    location /api {`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_pass http://localhost:3000;`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_set_header Host $host;`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_set_header X-Real-IP $remote_addr;`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_set_header X-Forwarded-Proto $scheme;`);
>> deploy-script.js echo         await execCommand(conn, `    }`);
>> deploy-script.js echo         await execCommand(conn, `    `);
>> deploy-script.js echo         await execCommand(conn, `    # 健康检查`);
>> deploy-script.js echo         await execCommand(conn, `    location /health {`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_pass http://localhost:3000/health;`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_set_header Host $host;`);
>> deploy-script.js echo         await execCommand(conn, `        proxy_set_header X-Real-IP $remote_addr;`);
>> deploy-script.js echo         await execCommand(conn, `    }`);
>> deploy-script.js echo         await execCommand(conn, `}`);
>> deploy-script.js echo         await execCommand(conn, `EOF`);
>> deploy-script.js echo         
>> deploy-script.js echo         // 重启Nginx
>> deploy-script.js echo         log('重启Nginx服务...');
>> deploy-script.js echo         await execCommand(conn, `systemctl restart nginx || service nginx restart`);
>> deploy-script.js echo         await execCommand(conn, `systemctl enable nginx || chkconfig nginx on`);
>> deploy-script.js echo         
>> deploy-script.js echo         log('部署完成！');
>> deploy-script.js echo         log('访问地址：');
>> deploy-script.js echo         log('- 管理后台: http://139.155.42.254/admin');
>> deploy-script.js echo         log('- 律师端: http://139.155.42.254/lawyer');
>> deploy-script.js echo         log('- 移动端: http://139.155.42.254/mobile');
>> deploy-script.js echo         log('- API: http://139.155.42.254/api');
>> deploy-script.js echo         log('- 健康检查: http://139.155.42.254/health');
>> deploy-script.js echo         
>> deploy-script.js echo         conn.end();
>> deploy-script.js echo         resolve();
>> deploy-script.js echo       } catch (err) {
>> deploy-script.js echo         log(`部署失败: ${err.message}`);
>> deploy-script.js echo         conn.end();
>> deploy-script.js echo         reject(err);
>> deploy-script.js echo       }
>> deploy-script.js echo     });
>> deploy-script.js echo     
>> deploy-script.js echo     conn.connect(config);
>> deploy-script.js echo   });
>> deploy-script.js echo }
>> deploy-script.js echo 
>> deploy-script.js echo // 执行部署
>> deploy-script.js echo deploy().catch(err => {
>> deploy-script.js echo   console.error(err);
>> deploy-script.js echo   process.exit(1);
>> deploy-script.js echo });

rem 执行Node.js部署脚本
call :log "执行Node.js部署脚本..."
node deploy-script.js

rem 清理临时文件
del deploy-script.js

call :log "部署脚本执行完毕！"
endlocal
