// 腾讯云部署配置
module.exports = {
  // 服务器配置
  server: {
    host: '139.155.42.254',
    port: 22,
    username: 'root',
    privateKey: require('fs').readFileSync('./deploy/private.key'),
    passphrase: ''
  },
  
  // 数据库配置
  database: {
    host: 'lhdbmysqljoj60xvy.mysql.database.azure.com',
    port: 3306,
    user: 'admin',
    password: 'your_password_here',
    database: 'law_firm_management'
  },
  
  // 应用配置
  app: {
    name: 'law-firm-management',
    port: 3000,
    env: 'production'
  },
  
  // 部署路径
  deployPath: '/opt/law-firm-management',
  
  // 备份配置
  backup: {
    enabled: true,
    path: '/opt/backups',
    keepDays: 30
  }
};