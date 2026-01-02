# zy-ajgl

## 项目概述
为大型律师事务所提供全方位的智能化管理解决方案，实现案件管理、客户关系、财务管理、团队协作等多维度业务数字化。

## 技术架构
- **后端**：Node.js + Express + MySQL + Redis
- **前端**：微信小程序 + PC管理后台(Vue3) + H5移动端
- **部署**：腾讯云CVM + COS + CDB + CLB + CDN

## 项目结构
```
law-firm-management/
├── backend/           # 后端服务
├── miniprogram/       # 微信小程序
├── admin-pc/          # PC管理后台
├── mobile-h5/         # H5移动端
├── docs/              # 文档
└── deploy/            # 部署配置
```

## 快速开始
1. 安装依赖：`npm install`
2. 配置数据库：修改 `backend/config/database.js`
3. 启动后端：`npm run dev`
4. 启动前端：分别进入各前端目录执行启动命令

## 功能模块
- 案件管理
- 客户管理
- 财务管理
- 团队协作
- 知识库
- 统计分析
