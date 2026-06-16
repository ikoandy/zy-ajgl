/**
 * 诉状生成器 - 后端API补丁部署脚本
 *
 * 功能：将缺失的API路由（auth、templates、settings、calculator）集成到服务器现有后端中
 *
 * 使用方法：
 *   1. 将整个 server-patch 目录上传到服务器后端项目根目录
 *   2. 执行: node server-patch/deploy-patch.js
 *   3. 重启后端服务
 */

const fs = require('fs');
const path = require('path');

// 配置 - 根据服务器实际路径修改
const SERVER_BACKEND_PATH = process.argv[2] || '/home/ubuntu/suzhuang-server';

console.log('========================================');
console.log('诉状生成器 - 后端API补丁部署');
console.log('========================================');
console.log(`目标路径: ${SERVER_BACKEND_PATH}`);
console.log('');

// 检查目标路径是否存在
if (!fs.existsSync(SERVER_BACKEND_PATH)) {
  console.error(`❌ 错误: 目标路径不存在 - ${SERVER_BACKEND_PATH}`);
  console.log('');
  console.log('请指定正确的后端项目路径:');
  console.log('  node deploy-patch.js /path/to/your/backend');
  process.exit(1);
}

// 检查主入口文件
const indexPath = path.join(SERVER_BACKEND_PATH, 'index.js');
if (!fs.existsSync(indexPath)) {
  console.error(`❌ 错误: 未找到主入口文件 - ${indexPath}`);
  process.exit(1);
}

let indexContent = fs.readFileSync(indexPath, 'utf-8');

// 检查是否已经打过补丁
if (indexContent.includes('templates') && indexContent.includes('calculator') && indexContent.includes('settings')) {
  console.log('⚠️  检测到补丁可能已安装，跳过...');
} else {
  console.log('📝 步骤1: 复制路由文件...');

  // 确保routes目录存在
  const routesDir = path.join(SERVER_BACKEND_PATH, 'routes');
  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
    console.log(`  创建目录: ${routesDir}`);
  }

  // 复制路由文件
  const patchRoutesDir = path.join(__dirname, 'routes');
  const routeFiles = fs.readdirSync(patchRoutesDir).filter(f => f.endsWith('.js'));

  routeFiles.forEach(file => {
    const src = path.join(patchRoutesDir, file);
    const dest = path.join(routesDir, file);
    fs.copyFileSync(src, dest);
    console.log(`  ✅ 复制: routes/${file}`);
  });

  console.log('');
  console.log('📝 步骤2: 修改主入口文件 index.js...');

  // 添加路由导入
  const importLines = [
    "const authRoutes = require('./routes/auth');",
    "const templateRoutes = require('./routes/templates');",
    "const settingsRoutes = require('./routes/settings');",
    "const calculatorRoutes = require('./routes/calculator');"
  ];

  // 检查并添加导入
  importLines.forEach(line => {
    const varName = line.match(/const (\w+)/)[1];
    if (!indexContent.includes(varName)) {
      // 在第一个 require 语句之前插入
      if (indexContent.includes("require('express')")) {
        indexContent = indexContent.replace(
          "require('express')",
          "require('express')\n" + line
        );
      } else if (indexContent.includes('require("express")')) {
        indexContent = indexContent.replace(
          'require("express")',
          'require("express")\n' + line
        );
      } else {
        // 在文件开头添加
        indexContent = line + '\n' + indexContent;
      }
      console.log(`  ✅ 添加导入: ${varName}`);
    }
  });

  // 添加路由注册
  const routeRegistrations = [
    "app.use('/api/auth', authRoutes);",
    "app.use('/api/templates', templateRoutes);",
    "app.use('/api/settings', settingsRoutes);",
    "app.use('/api/calculator', calculatorRoutes);"
  ];

  routeRegistrations.forEach(line => {
    const routePath = line.match(/'([^']+)'/)[1];
    if (!indexContent.includes(routePath)) {
      // 在 404 处理之前插入
      if (indexContent.includes('app.use('*')') || indexContent.includes("app.use('*')")) {
        indexContent = indexContent.replace(
          /app\.use\(['"]\*['"]/,
          line + '\napp.use(\'*\''
        );
      } else if (indexContent.includes('app.listen')) {
        indexContent = indexContent.replace(
          'app.listen',
          line + '\napp.listen'
        );
      } else {
        // 在文件末尾添加
        indexContent += '\n' + line;
      }
      console.log(`  ✅ 添加路由: ${routePath}`);
    }
  });

  // 写回 index.js
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`  ✅ 更新: index.js`);
}

console.log('');
console.log('📝 步骤3: 检查依赖...');

// 检查 jsonwebtoken 依赖
const packageJsonPath = path.join(SERVER_BACKEND_PATH, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (!deps.jsonwebtoken) {
    console.log('  ⚠️  缺少 jsonwebtoken 依赖，需要安装:');
    console.log(`  cd ${SERVER_BACKEND_PATH} && npm install jsonwebtoken`);
  } else {
    console.log('  ✅ jsonwebtoken 已安装');
  }
} else {
  console.log('  ⚠️  未找到 package.json');
}

console.log('');
console.log('========================================');
console.log('✅ 补丁部署完成！');
console.log('');
console.log('后续步骤:');
console.log(`  1. cd ${SERVER_BACKEND_PATH}`);
console.log('  2. npm install jsonwebtoken  (如果尚未安装)');
console.log('  3. 重启后端服务:');
console.log('     sudo systemctl restart suzhuang-server');
console.log('     或: pm2 restart suzhuang-server');
console.log('');
console.log('验证API:');
console.log('  curl http://localhost:3000/api/templates');
console.log('  curl http://localhost:3000/api/settings');
console.log('  curl -X POST http://localhost:3000/api/calculator/fee -H "Content-Type: application/json" -d \'{"amount":100000,"caseType":"property"}\'');
console.log('  curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin"}\'');
console.log('========================================');
