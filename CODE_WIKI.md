# 律师事务所智能管理系统 - Code Wiki 文档

> **项目名称**: zy-ajgl (中汇法创智能管理系统)  
> **版本**: 1.0.0  
> **作者**: LawTech Team  
> **许可证**: MIT  
> **最后更新**: 2026-05-20

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [项目结构](#3-项目结构)
4. [主要模块职责](#4-主要模块职责)
5. [核心类与函数说明](#5-核心类与函数说明)
6. [API 接口文档](#6-api-接口文档)
7. [数据库设计](#7-数据库设计)
8. [前端路由架构](#8-前端路由架构)
9. [依赖关系图](#9-依赖关系图)
10. [部署方案](#10-部署方案)
11. [运行指南](#11-运行指南)
12. [开发规范](#12-开发规范)

---

## 1. 项目概述

### 1.1 项目简介

**律师事务所智能管理系统（Law Firm Management System）** 是一个为大型律师事务所设计的全方位智能化管理解决方案。该系统实现了案件管理、客户关系、财务管理、团队协作、文档管理等多维度业务数字化。

### 1.2 核心功能模块

| 模块 | 功能描述 | 目标用户 |
|------|----------|----------|
| 📂 案件管理 | 案件创建、编辑、状态跟踪、进度管理、文档关联 | 管理员/律师 |
| 👥 客户管理 | 客户信息维护、跟进记录、联系历史 | 管理员/律师 |
| 💰 财务管理 | 收支记录、费用统计、财务报表 | 管理员 |
| 📅 日程管理 | 日程安排、任务提醒、时间规划 | 律师 |
| ✅ 待办事项 | 任务分配、进度跟踪、完成确认 | 律师 |
| 💬 消息中心 | 内部沟通、通知推送、消息记录 | 全部用户 |
| 📊 数据统计 | 案件分析、财务报表、业务趋势 | 管理员 |
| 🔐 系统管理 | 用户管理、角色权限、菜单配置 | 管理员 |

### 1.3 多端支持

系统采用**多端一体化架构**，支持以下客户端：

- ✅ **PC管理后台 (admin-pc)** - 管理员使用的全功能Web应用
- ✅ **PC律师端 (lawyer-pc)** - 律师专用的业务操作平台
- ✅ **移动端H5 (mobile-h5)** - 移动浏览器访问的轻量级应用
- ✅ **微信小程序 (miniprogram)** - 微信生态内的移动应用
- ✅ **后端API服务 (backend)** - RESTful API服务

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client Layer)                    │
├─────────────┬─────────────┬──────────────┬──────────────────────┤
│  Admin PC   │ Lawyer PC   │ Mobile H5    │ WeChat MiniProgram   │
│  Vue3+TS    │ Vue3+TS     │ Vue3+TS      │ Native WXML/WXSS     │
│ Element Plus│ Element Plus│ Vant 4       │ WeChat Components    │
└──────┬──────┴──────┬──────┴──────┬───────┴──────────┬───────────┘
       │             │             │                  │
       └─────────────┴──────┬──────┴──────────────────┘
                           │ HTTP/HTTPS
              ┌────────────▼────────────┐
              │     Nginx 反向代理       │
              │   (静态资源 + API代理)    │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   后端服务 (Backend)     │
              │  Express + TypeScript   │
              │     Port: 3000          │
              └────────────┬────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
┌──────▼──────┐    ┌───────▼───────┐   ┌──────▼──────┐
│   MySQL     │   │    Redis      │   │ File Storage │
│   8.0       │   │  (缓存/会话)   │   │ (文档上传)   │
└─────────────┘   └───────────────┘   └─────────────┘
```

### 2.2 技术栈详情

#### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.x | 运行时环境 |
| Express | 4.18.2 | Web框架 |
| TypeScript | 5.1.6 | 类型安全 |
| MySQL | 8.0 | 关系型数据库 |
| mysql2 | 3.6.0 | MySQL驱动 |
| JWT | 9.0.2 | 身份认证 |
| bcryptjs | 2.4.3 | 密码加密 |
| Winston | 3.10.0 | 日志管理 |
| Multer | 1.4.5 | 文件上传 |
| Joi | 17.9.2 | 数据验证 |
| Helmet | 7.0.0 | 安全中间件 |
| CORS | 2.8.5 | 跨域处理 |
| Nodemailer | 6.9.3 | 邮件发送 |

#### 前端技术栈 (Vue3生态)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | 3.5.24 | 前端框架 |
| TypeScript | ~5.9.3 | 类型安全 |
| Vite | 7.2.4 | 构建工具 |
| Vue Router | 4.6.4 | 路由管理 |
| Pinia | 3.0.4 | 状态管理 |
| Axios | 1.13.2 | HTTP请求 |
| ECharts | 6.0.0 | 图表可视化 |
| Element Plus | 2.13.0 | UI组件库 (PC端) |
| Vant | 4.9.22 | 移动端UI组件库 |

#### 基础设施

| 服务 | 用途 |
|------|------|
| Nginx | 反向代理、静态资源服务、负载均衡 |
| PM2 | Node.js进程管理 |
| Docker | 容器化部署 |
| Docker Compose | 多容器编排 |
| GitHub Actions | CI/CD自动化部署 |

---

## 3. 项目结构

### 3.1 顶层目录结构

```
law-firm-management/
├── 📁 backend/                 # 后端API服务
│   ├── src/
│   │   ├── config/             # 配置文件
│   │   ├── middleware/         # 中间件
│   │   ├── routes/             # API路由
│   │   ├── utils/              # 工具函数
│   │   └── app.ts              # 应用入口
│   ├── Dockerfile              # Docker构建文件
│   └── package.json            # 依赖配置
│
├── 📁 admin-pc/                # PC管理后台
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── components/         # 公共组件
│   │   ├── layouts/            # 布局组件
│   │   ├── router/             # 路由配置
│   │   ├── utils/              # 工具函数
│   │   └── styles/             # 样式文件
│   └── package.json
│
├── 📁 lawyer-pc/               # PC律师端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── components/         # 组件 (含个人中心模块)
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态管理
│   │   └── utils/              # 工具函数
│   └── package.json
│
├── 📁 mobile-h5/               # H5移动端
│   ├── src/
│   │   ├── api/                # API接口封装
│   │   ├── views/              # 页面组件
│   │   ├── layouts/            # 布局组件
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态管理
│   │   ├── styles/             # 样式变量
│   │   └── utils/              # 工具函数
│   └── package.json
│
├── 📁 pages/                   # 微信小程序页面
│   ├── auth/                   # 认证页面
│   ├── cases/                  # 案件相关页面
│   ├── clients/                # 客户相关页面
│   ├── documents/              # 文档相关页面
│   ├── messages/               # 消息相关页面
│   ├── schedule/               # 日程安排页面
│   └── profile/                # 个人中心页面
│
├── 📁 api/                     # 小程序API层
├── 📁 config/                  # 全局配置
├── 📁 deploy/                  # 部署脚本
├── 📁 docker/                  # Docker配置
│   ├── Dockerfile.frontend     # 前端Dockerfile
│   ├── nginx.conf              # Nginx配置
│   └── init.sql                # 数据库初始化脚本
├── 📁 docs/                    # 项目文档
├── 📁 ui/                      # UI样式库
│   ├── common/                 # 通用样式
│   ├── pc/                     # PC端样式
│   ├── mobile/                 # 移动端样式
│   └── miniprogram/            # 小程序样式
├── 📁 utils/                   # 小程序工具函数
├── 📁 store/                   # 小程序全局状态
├── 📁 styles/                  # 小程序全局样式
├── 📁 images/                  # 图标资源
├── 📁 .github/workflows/       # CI/CD工作流
│
├── 📄 docker-compose.yml       # Docker编排配置
├── 📄 app.js                   # 小程序入口
├── 📄 app.json                 # 小程序配置
├── 📄 app.wxss                 # 小程序全局样式
├── 📄 package.json             # 根项目配置
└── 📄 README.md                # 项目说明文档
```

### 3.2 后端详细结构 (backend/src/)

```
backend/src/
├── config/
│   └── database.ts             # 数据库连接配置与工具函数
├── middleware/
│   ├── errorHandler.ts         # 全局错误处理中间件
│   └── logger.ts               # 请求日志中间件
├── routes/
│   ├── auth.ts                 # 认证路由 (登录/注册)
│   ├── users.ts                # 用户管理路由
│   ├── clients.ts              # 客户管理路由
│   ├── cases.ts                # 案件管理路由
│   ├── financial.ts            # 财务管理路由
│   ├── documents.ts            # 文档管理路由
│   ├── schedules.ts            # 日程管理路由
│   ├── todos.ts                # 待办事项路由
│   ├── messages.ts             # 消息中心路由
│   ├── dashboard.ts            # 仪表盘数据路由
│   └── lawyers.ts              # 律师管理路由
├── utils/
│   └── fileTypeMapper.ts       # 文件类型映射工具
└── app.ts                      # 应用主入口
```

---

## 4. 主要模块职责

### 4.1 后端模块 (Backend)

#### 4.1.1 应用入口 ([app.ts](backend/src/app.ts))

**职责**: 
- 初始化Express应用实例
- 配置安全中间件（Helmet、CORS、Rate Limiting）
- 配置文件上传（Multer）
- 注册所有API路由
- 启动HTTP服务器
- 处理优雅关闭

**关键功能**:
```typescript
// 安全配置
app.use(helmet());                          // 安全头设置
app.use(compression());                     // Gzip压缩
app.use(rateLimit({...}));                  // API限流 (100次/15分钟)

// 文件上传配置
const upload = multer({ 
  storage: diskStorage,                      // 磁盘存储
  limits: { fileSize: 50 * 1024 * 1024 }    // 50MB限制
});

// 路由注册
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
// ... 其他路由
```

#### 4.1.2 数据库模块 ([database.ts](backend/src/config/database.ts))

**职责**:
- 管理MySQL连接池
- 提供数据库查询封装
- 支持事务处理
- 连接测试与健康检查

**导出接口**:
```typescript
export const dbConfig: DatabaseConfig;      // 数据库配置
export const pool: Pool;                     // 连接池实例
export function createPool(): Pool;          // 创建连接池
export function testConnection(): Promise<boolean>; // 测试连接
export async function query(sql, params?): Promise<any>; // 执行查询
export async function transaction(callback): Promise<void>; // 事务处理
```

#### 4.1.3 中间件模块 (middleware/)

**错误处理中间件 ([errorHandler.ts](backend/src/middleware/errorHandler.ts))**

职责:
- 统一错误响应格式
- 错误分类处理（验证错误、Token错误等）
- 开发环境错误详情输出
- 错误日志记录

**日志中间件 ([logger.ts](backend/src/middleware/logger.ts))**

职责:
- 记录所有HTTP请求
- 记录响应时间和状态码
- 便于调试和监控

#### 4.1.4 业务路由模块 (routes/)

每个路由模块遵循RESTful规范，提供完整的CRUD操作：

| 路由模块 | 文件路径 | 功能描述 |
|----------|----------|----------|
| 认证模块 | `routes/auth.ts` | 用户登录、注册、Token刷新 |
| 用户模块 | `routes/users.ts` | 用户CRUD、角色管理 |
| 客户模块 | `routes/clients.ts` | 客户信息管理、搜索筛选 |
| 案件模块 | `routes/cases.ts` | 案件全生命周期管理、文档关联 |
| 财务模块 | `routes/financial.ts` | 收支记录、费用管理 |
| 文档模块 | `routes/documents.ts` | 文档上传、下载、预览 |
| 日程模块 | `routes/schedules.ts` | 日程创建、查询、提醒 |
| 待办模块 | `routes/todos.ts` | 任务管理、状态跟踪 |
| 消息模块 | `routes/messages.ts` | 消息收发、通知管理 |
| 仪表盘 | `routes/dashboard.ts` | 统计数据、图表数据、监控信息 |
| 律师模块 | `routes/lawyers.ts` | 律师信息管理 |

---

### 4.2 前端模块

#### 4.2.1 Admin PC 管理后台 (admin-pc/)

**目标用户**: 系统管理员

**主要功能**:
- 📊 仪表盘：全局数据概览、统计图表
- 👥 系统管理：用户管理、角色管理、菜单管理
- 📂 案件管理：案件列表、详情查看、状态跟踪
- 👤 客户管理：客户信息维护
- ⚖️ 律师管理：律师信息维护
- 📈 统计分析：案件统计、财务统计
- 📝 日志管理：登录日志、操作日志

**技术特点**:
- 使用Element Plus UI组件库
- 集成ECharts进行数据可视化
- 完整的权限控制（路由守卫）
- 响应式布局适配

#### 4.2.2 Lawyer PC 律师端 (lawyer-pc/)

**目标用户**: 执业律师

**主要功能**:
- 📊 工作台：个人数据概览、待办提醒
- 📂 案件管理：案件的完整CRUD操作
  - 新建案件
  - 查看详情
  - 编辑案件
- 👤 客户管理：客户列表与详情
- 📄 文档管理：案件文档管理
- 📅 日程管理：日程安排与查看
- ✅ 待办事项：任务管理与跟踪
- 💬 消息中心：内部沟通
- 💰 财务记录：收支查看
- 👤 个人中心：
  - 个人信息展示与编辑
  - 密码修改
  - 头像上传
  - 设置管理

**特色功能**:
- 完整的个人中心模块 (`components/profile/`)
  - ProfileHeader.vue - 个人信息头部
  - ProfileDetail.vue - 详细信息展示
  - ProfileSettings.vue - 设置页面
  - EditInfoDialog.vue - 信息编辑对话框
  - ChangePasswordDialog.vue - 密码修改对话框
  - UpdateAvatarDialog.vue - 头像上传对话框
- Pinia状态管理 (`stores/user.ts`)

#### 4.2.3 Mobile H5 移动端 (mobile-h5/)

**目标用户**: 移动设备用户（律师/客户）

**主要功能**:
- 🏠 首页：移动端数据概览
- 📂 案件列表：案件浏览与详情查看
- 💬 消息中心：消息通知
- 👤 个人中心：个人信息管理

**技术特点**:
- 使用Vant 4移动端UI组件库
- 移动端优化的交互体验
- 触摸友好的界面设计
- 基础路径: `/mobile/`

#### 4.2.4 微信小程序 (miniprogram/)

**目标用户**: 微信生态用户

**页面结构**:
```
pages/
├── auth/login        # 登录页
├── auth/register     # 注册页
├── index/index       # 首页
├── cases/            # 案件模块
│   ├── list          # 案件列表
│   ├── detail        # 案件详情
│   └── create        # 创建案件
├── clients/          # 客户模块
│   ├── list          # 客户列表
│   ├── detail        # 客户详情
│   ├── create        # 创建客户
│   └── follow        # 跟进记录
├── documents/        # 文档模块
│   ├── list          # 文档列表
│   ├── upload        # 上传文档
│   └── preview       # 预览文档
├── schedule/         # 日程模块
│   ├── calendar      # 日历视图
│   └── task          # 任务视图
├── messages/         # 消息模块
│   ├── list          # 消息列表
│   └── detail        # 消息详情
└── profile/          # 个人中心
    ├── info          # 个人信息
    ├── edit          # 编辑资料
    ├── settings      # 设置
    └── about         # 关于
```

**TabBar配置**:
- 首页 (pages/index/index)
- 案件 (pages/cases/list/list)
- 客户 (pages/clients/list/list)
- 消息 (pages/messages/list/list)
- 我的 (pages/profile/info/info)

---

## 5. 核心类与函数说明

### 5.1 后端核心类与函数

#### 5.1.1 Application 类 (app.ts)

**文件位置**: [`backend/src/app.ts`](backend/src/app.ts)

**类/模块说明**:
这是整个后端应用的入口点和主配置文件。

**主要函数**:

##### `startServer()`
```typescript
async function startServer(): Promise<void>
```
**功能**: 异步启动服务器
- 测试数据库连接（失败不阻塞启动）
- 监听指定端口（默认3000）
- 输出启动信息（环境、端口、时间）

**调用示例**:
```typescript
startServer(); // 在文件末尾自动调用
```

##### 中间件配置
```typescript
// 安全中间件
app.use(helmet());
app.use(compression());

// 限流器
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分钟窗口
  max: 100,                   // 最大请求数
  message: '请求过于频繁，请稍后再试'
});

// CORS配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// 文件上传
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 50 * 1024 * 1024 }  // 50MB
});
```

#### 5.1.2 DatabaseManager 类 (database.ts)

**文件位置**: [`backend/src/config/database.ts`](backend/src/config/database.ts)

**导出常量与函数**:

##### `dbConfig`
```typescript
export const dbConfig: {
  host: string;        // 数据库主机
  port: number;        // 端口 (3306)
  user: string;        // 用户名
  password: string;    // 密码
  database: string;    // 数据库名
  charset: string;     // 字符集 (utf8mb4)
  timezone: string;    // 时区 (+08:00)
  connectionLimit: number; // 连接池大小 (10)
}
```

##### `createPool()`
```typescript
export function createPool(): Pool
```
**功能**: 创建MySQL连接池
**返回**: mysql2.Pool实例

##### `query(sql, params?)`
```typescript
export async function query(sql: string, params?: any[]): Promise<any>
```
**功能**: 执行SQL查询
**参数**:
- `sql`: SQL语句字符串
- `params`: 参数数组（防止SQL注入）
**返回**: 查询结果行数组

**示例**:
```typescript
const users = await query('SELECT * FROM users WHERE status = ?', ['active']);
```

##### `transaction(callback)`
```typescript
export async function transaction(callback: (connection: any) => Promise<void>): Promise<void>
```
**功能**: 执行数据库事务
**参数**:
- `callback`: 事务回调函数，接收连接对象
**特性**: 自动提交或回滚

**示例**:
```typescript
await transaction(async (conn) => {
  await conn.execute('INSERT INTO cases (...) VALUES (...)', [...]);
  await conn.execute('UPDATE clients SET ... WHERE id = ?', [...]);
});
```

#### 5.1.3 ErrorHandler 模块 (errorHandler.ts)

**文件位置**: [`backend/src/middleware/errorHandler.ts`](backend/src/middleware/errorHandler.ts)

**接口定义**:

##### `AppError` 接口
```typescript
export interface AppError extends Error {
  statusCode?: number;       // HTTP状态码
  isOperational?: boolean;  // 是否为可预期错误
}
```

##### `errorHandler()` 中间件
```typescript
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void
```
**功能**: 全局错误处理中间件
**错误类型映射**:
- `ValidationError` → 400 Bad Request
- `JsonWebTokenError` → 401 Unauthorized
- `TokenExpiredError` → 401 Unauthorized
- `CastError` → 400 Bad Request

**响应格式**:
```json
{
  "success": false,
  "message": "错误描述",
  "statusCode": 500,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/xxx"
}
```

##### `createError(message, statusCode?)`
```typescript
export const createError = (message: string, statusCode: number = 500): AppError
```
**功能**: 创建自定义错误对象

##### `asyncHandler(fn)`
```typescript
export const asyncHandler = (fn: Function) => (req, res, next) => Promise<void>
```
**功能**: 异步路由错误捕获包装器

#### 5.1.4 Cases Router (cases.ts)

**文件位置**: [`backend/src/routes/cases.ts`](backend/src/routes/cases.ts)

**数据结构**:

##### Case 对象
```typescript
interface Case {
  id: number;
  caseNumber: string;       // 案件编号
  title: string;            // 案件标题
  client: string;           // 客户名称
  type: string;             // 案件类型
  lawyer: string;           // 负责律师
  status: string;           // 状态 (已立案/进行中/已结案)
  description: string;      // 案件描述
  filingDate: string;       // 立案日期
  expectedEndDate: string;  // 预计结案日期
  judge: string;            // 审判长
  court: string;            // 法院
  amount: number;           // 涉案金额
  createTime: string;       // 创建时间
  updateTime: string;       // 更新时间
  timeline: TimelineItem[]; // 进度时间线
  documents: Document[];    // 关联文档
}
```

##### TimelineItem 对象
```typescript
interface TimelineItem {
  id: number;
  title: string;            // 进度标题
  content: string;          // 进度内容
  time: string;             // 时间戳
}
```

**API端点**:

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/api/cases` | 获取案件列表 | page, pageSize, status, type |
| GET | `/api/cases/:id` | 获取案件详情 | id |
| POST | `/api/cases` | 创建案件 | Case对象字段 |
| PUT | `/api/cases/:id` | 更新案件 | Case对象字段 |
| DELETE | `/api/cases/:id` | 删除案件 | id |
| PUT | `/api/cases/:id/status` | 更新状态 | status, progress |
| POST | `/api/cases/:id/timeline` | 添加进度 | title, content, time |
| POST | `/api/cases/:id/documents` | 上传文档 | file, name |
| GET | `/api/cases/:id/documents/:docId/download` | 下载链接 | - |
| GET | `/api/cases/:id/documents/:docId/file` | 文件流 | - |
| DELETE | `/api/cases/:id/documents/:docId` | 删除文档 | - |

#### 5.1.5 Clients Router (clients.ts)

**文件位置**: [`backend/src/routes/clients.ts`](backend/src/routes/clients.ts)

**数据结构**:

##### Client 对象
```typescript
interface Client {
  id: number;
  name: string;             // 客户名称
  phone: string;            // 联系电话
  email: string;            // 电子邮箱
  company: string;          // 公司名称
  address: string;          // 联系地址
  contactPerson: string;    // 联系人
  status: string;           // 状态 (active/inactive)
  description: string;      // 备注
  createTime: string;       // 创建时间
  updateTime: string;       // 更新时间
}
```

**API端点**:

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/api/clients` | 获取客户列表 | page, pageSize, name, phone, status |
| GET | `/api/clients/:id` | 获取客户详情 | id |
| POST | `/api/clients` | 创建客户 | name, phone, email... |
| PUT | `/api/clients/:id` | 更新客户 | 同上 |
| DELETE | `/api/clients/:id` | 删除客户 | id |

#### 5.1.6 Dashboard Router (dashboard.ts)

**文件位置**: [`backend/src/routes/dashboard.ts`](backend/src/routes/dashboard.ts)

**功能**: 提供仪表盘所需的聚合统计数据

**API端点**:

| 方法 | 路径 | 功能 | 返回数据 |
|------|------|------|----------|
| GET | `/api/dashboard/stats` | 总体统计 | caseCount, todoCount, clientCount, messageCount |
| GET | `/api/dashboard/schedules` | 最近日程 | 最近5条日程 |
| GET | `/api/dashboard/todos` | 最近待办 | 最近5条待办 |
| GET | `/api/dashboard/recent-cases` | 最近案件 | 最近5条案件 |
| GET | `/api/dashboard/messages` | 最近消息 | 最近5条消息 |
| GET | `/api/dashboard/monitor` | 系统监控 | onlineUsers, serverLoad, dbConnections |
| GET | `/api/dashboard/charts` | 图表数据 | caseTrend, incomeTrend, caseType, clientRegion |

---

### 5.2 前端核心组件

#### 5.2.1 路由守卫机制

所有前端应用都实现了基于Token的路由守卫：

**Admin PC** ([admin-pc/src/router/index.ts](admin-pc/src/router/index.ts)):
```typescript
router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token');
  const whiteListPaths = ['/login', '/404'];
  
  if (whiteListPaths.includes(to.path)) {
    next();
    return;
  }
  
  if (to.path === '/') {
    next('/login');
    return;
  }
  
  if (token) {
    next();
  } else {
    next('/login');
  }
});
```

**Lawyer PC** ([lawyer-pc/src/router/index.ts](lawyer-pc/src/router/index.ts)):
- 基础路径: `/lawyer/`
- 无显式路由守卫（依赖后端验证）

**Mobile H5** ([mobile-h5/src/router/index.ts](mobile-h5/src/router/index.ts)):
- 基础路径: `/mobile/`
- 白名单: `/auth/login`

#### 5.2.2 HTTP请求封装

各前端应用的请求工具类位于 `utils/request.ts`，通常封装了：
- Axios实例配置
- 请求/响应拦截器
- Token自动附加
- 统一错误处理
- API基础路径配置

#### 5.2.3 Lawyer PC 个人中心组件

**文件位置**: [`lawyer-pc/src/components/profile/`](lawyer-pc/src/components/profile/)

**组件列表**:

| 组件名 | 文件 | 功能 |
|--------|------|------|
| ProfileHeader | ProfileHeader.vue | 个人信息头部展示（头像、姓名、职位） |
| ProfileDetail | ProfileDetail.vue | 详细信息展示（联系方式、简介） |
| ProfileSettings | ProfileSettings.vue | 设置页面（通知偏好、主题切换） |
| EditInfoDialog | EditInfoDialog.vue | 编辑个人信息对话框 |
| ChangePasswordDialog | ChangePasswordDialog.vue | 修改密码对话框 |
| UpdateAvatarDialog | UpdateAvatarDialog.vue | 上传头像对话框 |

---

## 6. API 接口文档

### 6.1 API基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 6.2 认证接口 (/api/auth)

| 方法 | 端点 | 描述 | 请求体 |
|------|------|------|--------|
| POST | `/auth/login` | 用户登录 | `{username, password}` |
| POST | `/auth/register` | 用户注册 | `{username, password, email, role}` |

**登录成功响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt-token-string"
  }
}
```

### 6.3 用户接口 (/api/users)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/users` | 获取用户列表 |
| GET | `/users/:id` | 获取用户详情 |
| POST | `/users` | 创建用户 |
| PUT | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |

### 6.4 案件接口 (/api/cases)

详见 [5.1.4 Cases Router](#514-cases-router-casests)

### 6.5 客户接口 (/api/clients)

详见 [5.1.5 Clients Router](#515-clients-router-clientsts)

### 6.6 财务接口 (/api/financial)

| 方法 | 端点 | 描述 | 请求体示例 |
|------|------|------|------------|
| GET | `/financial` | 获取财务记录列表 | ?type=income&status=pending |
| GET | `/financial/:id` | 获取财务记录详情 | - |
| POST | `/financial` | 创建财务记录 | `{type, amount, description, caseId}` |
| PUT | `/financial/:id` | 更新财务记录 | `{type, amount, status}` |
| DELETE | `/financial/:id` | 删除财务记录 | - |

### 6.7 文档接口 (/api/documents)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/documents` | 获取文档列表 |
| POST | `/documents` | 上传文档 (multipart/form-data) |
| GET | `/documents/:id/file` | 下载文档文件 |
| DELETE | `/documents/:id` | 删除文档 |

### 6.8 日程接口 (/api/schedules)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/schedules` | 获取日程列表 |
| POST | `/schedules` | 创建日程 |
| PUT | `/schedules/:id` | 更新日程 |
| DELETE | `/schedules/:id` | 删除日程 |

### 6.9 待办接口 (/api/todos)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/todos` | 获取待办列表 |
| POST | `/todos` | 创建待办 |
| PUT | `/todos/:id` | 更新待办 |
| DELETE | `/todos/:id` | 删除待办 |

### 6.10 消息接口 (/api/messages)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/messages` | 获取消息列表 |
| POST | `/messages` | 发送消息 |
| PUT | `/messages/:id` | 标记已读 |
| DELETE | `/messages/:id` | 删除消息 |

### 6.11 仪表盘接口 (/api/dashboard)

详见 [5.1.6 Dashboard Router](#516-dashboard-router-dashboardts)

### 6.12 律师接口 (/api/lawyers)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/lawyers` | 获取律师列表 |
| GET | `/lawyers/:id` | 获取律师详情 |
| PUT | `/lawyers/:id` | 更新律师信息 |

### 6.13 健康检查

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/health` | 服务健康检查 |

**响应示例**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600.123,
  "environment": "development"
}
```

---

## 7. 数据库设计

### 7.1 数据库概览

- **数据库名称**: `law_firm_management`
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **引擎**: InnoDB

### 7.2 ER关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │    cases    │       │   clients   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │   ┌──►│ id (PK)     │
│ username    │   │   │ case_number │   │   │ user_id(FK) │
│ password    │   │   │ title       │   │   │ name        │
│ role        │   │   │ description │   │   │ contact     │
│ email       │   │   │ client_id(FK)│───┘   │ phone       │
│ phone       │   │   │ lawyer_id(FK)│──┐   │ email       │
│ status      │   │   │ status      │   │   │ address     │
│ created_at  │   │   │ priority    │   │   └─────────────┘
│ updated_at  │   │   │ start_date  │   │
└─────────────┘   │   │ end_date    │   │
                  │   └─────────────┘   │
                  │                    │
                  │   ┌─────────────┐   │
                  │   │  documents  │   │
                  │   ├─────────────┤   │
                  └──►│ id (PK)     │   │
                      │ case_id(FK) │───┘
                      │ title       │
                      │ file_path   │
                      │ file_type   │
                      │ uploaded_by │
                      │ uploaded_at │
                      └─────────────┘

┌─────────────┐
│  financial  │
├─────────────┤
│ id (PK)     │
│ case_id(FK) │
│ type        │
│ amount      │
│ description │
│ date        │
│ created_by  │
│ created_at  │
└─────────────┘
```

### 7.3 表结构详解

#### 7.3.1 users 表 (用户表)

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码 (bcrypt加密) |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | 角色 (admin/lawyer/client) |
| email | VARCHAR(100) | - | 邮箱 |
| phone | VARCHAR(20) | - | 手机号 |
| status | TINYINT | DEFAULT 1 | 状态 (1:启用 0:禁用) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**初始数据**:
- 管理员: `admin / admin123`
- 测试律师: `lawyer1 / admin123`
- 测试客户: `client1 / admin123`

#### 7.3.2 cases 表 (案件表)

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 案件ID |
| case_number | VARCHAR(50) | NOT NULL, UNIQUE | 案件编号 |
| title | VARCHAR(255) | NOT NULL | 案件标题 |
| description | TEXT | - | 案件描述 |
| client_id | INT | NOT NULL, FK → users.id | 客户ID |
| lawyer_id | INT | FK → users.id | 负责律师ID |
| status | VARCHAR(20) | DEFAULT 'pending' | 状态 |
| priority | VARCHAR(10) | DEFAULT 'medium' | 优先级 |
| start_date | DATE | - | 开始日期 |
| end_date | DATE | - | 结束日期 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 7.3.3 clients 表 (客户表)

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 客户ID |
| user_id | INT | NOT NULL, FK → users.id | 关联用户ID |
| name | VARCHAR(100) | NOT NULL | 客户姓名 |
| contact | VARCHAR(50) | - | 联系人 |
| phone | VARCHAR(20) | - | 电话 |
| email | VARCHAR(100) | - | 邮箱 |
| address | TEXT | - | 地址 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 7.3.4 documents 表 (文档表)

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 文档ID |
| case_id | INT | NOT NULL, FK → cases.id | 关联案件ID |
| title | VARCHAR(255) | NOT NULL | 文档标题 |
| file_path | VARCHAR(255) | NOT NULL | 文件存储路径 |
| file_type | VARCHAR(50) | - | 文件类型 |
| uploaded_by | INT | NOT NULL, FK → users.id | 上传者ID |
| uploaded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 上传时间 |

#### 7.3.5 financial 表 (财务表)

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 记录ID |
| case_id | INT | NOT NULL, FK → cases.id | 关联案件ID |
| type | VARCHAR(20) | NOT NULL | 类型 (income/expense) |
| amount | DECIMAL(10,2) | NOT NULL | 金额 |
| description | TEXT | - | 描述 |
| date | DATE | NOT NULL | 日期 |
| created_by | INT | NOT NULL, FK → users.id | 创建者ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

## 8. 前端路由架构

### 8.1 Admin PC 路由结构

**基础路径**: `/` (无前缀)

```
/login                         → 登录页
/admin                         → 重定向到 /dashboard
/dashboard                     → 仪表盘
/system                        → 系统管理 (父路由)
  /system/user                 → 用户管理
  /system/role                 → 角色管理
  /system/menu                 → 菜单管理
/case                          → 案件管理
/client                        → 客户管理
/lawyer                        → 律师管理
/stats                         → 统计分析 (父路由)
  /stats/case                  → 案件统计
  /stats/finance               → 财务统计
/log                           → 日志管理 (父路由)
  /log/login                   → 登录日志
  /log/operation               → 操作日志
/404                           → 404页面
```

**布局**: BasicLayout.vue (侧边栏 + 顶部导航 + 内容区)

**权限控制**: Token验证 + 白名单路由

### 8.2 Lawyer PC 路由结构

**基础路径**: `/lawyer/`

```
/login                         → 登录页
/dashboard                     → 工作台
/case                          → 案件列表
/case/create                   → 新建案件
/case/:id                      → 案件详情
/case/:id/edit                 → 编辑案件
/client                        → 客户列表
/client/:id                    → 客户详情
/docs                          → 文档管理
/schedule                      → 日程管理
/todo                          → 待办事项
/message                       → 消息中心
/finance                       → 财务记录
/profile                       → 个人中心
/404                           → 404页面
```

**布局**: BasicLayout.vue (侧边栏 + 顶部导航 + 内容区)

**特殊功能**: 完整的个人中心组件套件

### 8.3 Mobile H5 路由结构

**基础路径**: `/mobile/`

```
/auth/login                    → 登录页
/dashboard                     → 首页
/case                          → 案件列表
/case/detail/:id               → 案件详情
/messages                      → 消息中心
/profile                       → 个人中心
/:pathMatch(.*)*               → 404页面
```

**布局**: 
- BlankLayout.vue (登录页 - 无导航)
- BasicLayout.vue (其他页面 - 底部TabBar)

**UI框架**: Vant 4

### 8.4 微信小程序页面结构

**配置文件**: [`app.json`](app.json)

**TabBar页面**:
1. 首页: `pages/index/index`
2. 案件: `pages/cases/list/list`
3. 客户: `pages/clients/list/list`
4. 消息: `pages/messages/list/list`
5. 我的: `pages/profile/info/info`

**导航栏配置**:
- 背景色: `#1a365d` (深蓝色)
- 标题文字: "中汇法创智能管理系统"
- 文字颜色: 白色

---

## 9. 依赖关系图

### 9.1 后端依赖关系

```
backend (Node.js + Express)
├── 核心框架
│   ├── express@4.18.2          # Web框架
│   └── typescript@5.1.6        # 类型系统
│
├── 数据库
│   └── mysql2@3.6.0            # MySQL驱动
│
├── 安全与认证
│   ├── jsonwebtoken@9.0.2      # JWT Token
│   ├── bcryptjs@2.4.3          # 密码加密
│   ├── helmet@7.0.0            # 安全头
│   └── express-rate-limit@6.8.1 # API限流
│
├── 数据验证
│   └── joi@17.9.2              # Schema验证
│
├── 文件处理
│   ├── multer@1.4.5-lts.1      # 文件上传
│   └── mime-types@3.0.2        # MIME类型检测
│
├── 工具库
│   ├── dotenv@16.3.1           # 环境变量
│   ├── cors@2.8.5              # 跨域
│   ├── compression@1.7.4       # Gzip压缩
│   ├── axios@1.13.2            # HTTP客户端
│   ├── form-data@4.0.5         # 表单数据
│   ├── nodemailer@6.9.3        # 邮件发送
│   └── winston@3.10.0          # 日志
│
└── 开发工具
    ├── nodemon@3.0.1           # 热重载
    ├── ts-node@10.9.1          # TS执行
    └── eslint@8.46.0           # 代码检查
```

### 9.2 前端依赖关系 (以admin-pc为例)

```
admin-pc (Vue 3 + Vite)
├── 核心框架
│   ├── vue@3.5.24              # 渐进式框架
│   ├── vue-router@4.6.4        # 路由管理
│   └── pinia@3.0.4             # 状态管理
│
├── UI组件库
│   └── element-plus@2.13.0     # 桌面端UI
│
├── 图表可视化
│   └── echarts@6.0.0           # 图表库
│
├── HTTP通信
│   └── axios@1.13.2            # HTTP客户端
│
└── 开发工具
    ├── vite@7.2.4              # 构建工具
    ├── typescript@~5.9.3       # 类型系统
    ├── vue-tsc@3.1.4           # Vue类型检查
    ├── vitest@4.0.16           # 单元测试
    └── eslint@9.39.2           # 代码检查
```

### 9.3 项目间依赖关系

```
根项目 (law-firm-management-system)
│
├── backend (独立服务)
│   └── 提供 RESTful API (:3000)
│
├── admin-pc (独立构建)
│   └── 消费 API → backend
│
├── lawyer-pc (独立构建)
│   └── 消费 API → backend
│
├── mobile-h5 (独立构建)
│   └── 消费 API → backend
│
└── miniprogram (独立构建)
    └── 消费 API → backend
```

**协调工具**:
- `concurrently@^7.6.0` - 并行运行多个开发服务器
- 根 `package.json` 的 scripts 统一管理所有子项目

---

## 10. 部署方案

### 10.1 部署架构概览

系统支持多种部署方式：

1. **Docker Compose 一键部署** (推荐用于生产环境)
2. **手动SSH部署** (适用于传统服务器)
3. **GitHub Actions CI/CD** (自动化持续部署)

### 10.2 Docker Compose 部署 (推荐)

**配置文件**: [`docker-compose.yml`](docker-compose.yml)

#### 服务架构

```yaml
version: '3.8'

services:
  db:           # MySQL 8.0 数据库
    image: mysql:8.0
    ports: ["3306:3306"]
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      MYSQL_ROOT_PASSWORD: ZY520117.
      MYSQL_DATABASE: law_firm_management

  backend:      # Node.js 后端服务
    build: ./backend
    ports: ["3000:3000"]
    depends_on: [db]
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: law_firm_management
      DB_USER: root
      DB_PASSWORD: ZY520117.

  frontend:     # Nginx 前端服务
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports: ["80:80"]
    depends_on: [backend]

volumes:
  mysql_data:

networks:
  law_firm_network:
    driver: bridge
```

#### 快速启动命令

```bash
# 克隆项目
git clone <repository-url>
cd law-firm-management

# 一键启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据（慎用）
docker-compose down -v
```

#### 访问地址

| 服务 | URL | 说明 |
|------|-----|------|
| 管理后台 | http://localhost/admin | Admin PC |
| 律师端 | http://localhost/lawyer | Lawyer PC |
| 移动端 | http://localhost/mobile | Mobile H5 |
| API服务 | http://localhost/api | Backend API |
| 健康检查 | http://localhost/health | Health Check |

### 10.3 Nginx 配置

**配置文件**: [`docker/nginx.conf`](docker/nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;

    # 管理后台
    location /admin {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # 律师端
    location /lawyer {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /lawyer/index.html;
    }

    # 移动端
    location /mobile {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /mobile/index.html;
    }

    # API反向代理
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        proxy_pass http://backend:3000/health;
    }

    # 根路径重定向到管理后台
    location = / {
        return 301 /admin;
    }
}
```

**特性**:
- SPA路由支持 (try_files)
- API反向代理
- 静态资源缓存
- Gzip压缩（通过compression中间件）

### 10.4 手动部署脚本

**文件位置**: [`deploy/deploy.sh`](deploy/deploy.sh)

**部署流程**:

1. **环境准备**
   ```bash
   # 安装Node.js 18
   curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
   yum install -y nodejs
   
   # 安装PM2进程管理
   npm install -g pm2
   
   # 安装Nginx
   yum install -y nginx
   ```

2. **文件上传**
   ```bash
   # 上传后端代码
   scp -r backend/* root@server:/opt/law-firm-management/backend/
   
   # 上传前端构建产物
   scp -r admin-pc/dist/* root@server:/opt/law-firm-management/admin/
   scp -r lawyer-pc/dist/* root@server:/opt/law-firm-management/lawyer/
   scp -r mobile-h5/dist/* root@server:/opt/law-firm-management/mobile/
   ```

3. **后端服务配置**
   ```bash
   cd /opt/law-firm-management/backend
   npm install --production
   pm2 start dist/app.js --name law-firm-backend
   pm2 save
   ```

4. **Nginx配置**
   - 配置反向代理
   - 配置静态资源路径
   - 启动Nginx服务

### 10.5 GitHub Actions CI/CD

**工作流文件**: [`.github/workflows/deploy-full-system.yml`](.github/workflows/deploy-full-system.yml)

**触发条件**:
- 推送到 `main` 分支
- 手动触发 (workflow_dispatch)

**部署流程**:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    1. Checkout代码
    2. 安装Node.js 18
    3. 安装前端依赖 (admin-pc, lawyer-pc, mobile-h5)
    4. 构建前端项目
    5. 安装后端依赖
    6. 构建后端项目 (TypeScript编译)
    7. SSH部署到服务器
    8. 启动Docker Compose服务
    9. 等待服务健康检查
    10. 查看服务状态和日志
```

**所需Secrets**:
- `SSH_PRIVATE_KEY` - SSH私钥
- `REMOTE_HOST` - 服务器IP地址
- `REMOTE_USER` - SSH用户名

---

## 11. 运行指南

### 11.1 环境要求

#### 开发环境

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | >= 18.x | 运行时环境 |
| npm | >= 9.x | 包管理器 |
| MySQL | >= 8.0 | 数据库 |
| Git | 最新版 | 版本控制 |

#### 可选工具

| 工具 | 用途 |
|------|------|
| Docker & Docker Compose | 容器化部署 |
| PM2 | 生产环境进程管理 |
| VS Code + Volar | 推荐IDE |

### 11.2 本地开发快速开始

#### 步骤1: 克隆仓库

```bash
git clone <repository-url>
cd law-firm-management
```

#### 步骤2: 安装根依赖

```bash
npm install
```

这将安装 `concurrently` 用于并行运行多个开发服务器。

#### 步骤3: 配置数据库

**方式A: 使用Docker (推荐)**

```bash
# 启动MySQL容器
docker run -d \
  --name law-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=ZY520117. \
  -e MYSQL_DATABASE=law_firm_management \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password

# 初始化数据库
docker exec -i law-mysql mysql -uroot -pZY520117. < docker/init.sql
```

**方式B: 本地MySQL**

确保本地MySQL服务正在运行，然后执行初始化脚本：

```bash
mysql -u root -p < docker/init.sql
```

#### 步骤4: 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ZY520117.
DB_NAME=law_firm_management

# JWT密钥 (生产环境必须更改)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

#### 步骤5: 启动开发服务器

**一键启动所有服务** (推荐):

```bash
npm run dev
```

此命令会并行启动：
- 后端服务 (backend:3000)
- Admin PC (admin-pc:5173)
- Lawyer PC (lawyer-pc:5174)
- Mobile H5 (mobile-h5:5175)

**单独启动各个服务**:

```bash
# 仅启动后端
npm run dev:backend

# 仅启动Admin管理后台
npm run dev:admin

# 仅启动律师端
npm run dev:lawyer

# 仅启动移动端
npm run dev:mobile
```

#### 步骤6: 访问应用

| 应用 | 地址 | 说明 |
|------|------|------|
| 后端API | http://localhost:3000 | API文档见第6章 |
| Admin PC | http://localhost:5173 | 管理后台 |
| Lawyer PC | http://localhost:5174 | 律师工作台 |
| Mobile H5 | http://localhost:5175 | 移动端 |
| 健康检查 | http://localhost:3000/health | 服务状态 |

### 11.3 生产环境部署

#### 方式一: Docker Compose (推荐)

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 实时查看日志
docker-compose logs -f

# 重启某个服务
docker-compose restart backend

# 停止所有服务
docker-compose down
```

#### 方式二: 手动部署

参见 [10.4 手动部署脚本](#104-手动部署脚本)

#### 方式三: CI/CD自动部署

参见 [10.5 GitHub Actions CI/CD](#105-github-actions-cicd)

### 11.4 默认账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 全部权限 |
| 律师 | lawyer1 | admin123 | 案件/客户/文档操作 |
| 客户 | client1 | admin123 | 只读权限 |

⚠️ **安全提示**: 生产环境部署时务必修改默认密码！

### 11.5 常见问题排查

#### 问题1: 数据库连接失败

**症状**: 
```
❌ 数据库连接失败: ECONNREFUSED 127.0.0.1:3306
```

**解决方案**:
1. 确认MySQL服务已启动
2. 检查 `.env` 文件中的数据库配置
3. 确认防火墙允许3306端口

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 测试连接
mysql -h localhost -u root -p -e "SELECT 1"
```

#### 问题2: 端口被占用

**症状**:
```
Error: listen EADDRINUSE :::3000
```

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀掉进程
kill -9 <PID>

# 或修改端口 (在.env中修改PORT)
```

#### 问题3: 前端无法连接后端API

**症状**: 浏览器控制台显示CORS错误或网络错误

**解决方案**:
1. 确认后端服务已启动 (访问 http://localhost:3000/health)
2. 检查前端代理配置 (vite.config.ts)
3. 确认CORS配置允许当前域名

#### 问题4: 文件上传失败

**症状**: 413 Request Entity Too Large

**解决方案**:
- 后端已配置50MB限制 (multer)
- 检查Nginx配置: `client_max_body_size 50m;`
- 检查前端请求体大小限制

---

## 12. 开发规范

### 12.1 代码风格

#### TypeScript规范

- 使用严格模式 (`strict: true`)
- 优先使用 `interface` 而非 `type` (对象类型时)
- 避免使用 `any`，优先使用具体类型
- 函数必须有返回类型声明
- 使用 `async/await` 而非 `.then().catch()`

**示例**:
```typescript
// ✅ 推荐
async function getUser(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = ?', [id]);
  return result.length > 0 ? result[0] : null;
}

// ❌ 不推荐
function getUser(id) {
  return query('SELECT * FROM users WHERE id = ?', [id]).then(result => {
    return result[0];
  });
}
```

#### Vue组件规范

- 使用Composition API (`<script setup lang="ts">`)
- Props必须定义类型
- Emits必须显式声明
- 组件命名使用PascalCase

**示例**:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

const emit = defineEmits<{
  update: [value: string];
  delete: [id: number];
}>();

const doubleCount = computed(() => props.count * 2);
</script>
```

#### API响应格式规范

统一使用以下响应格式：

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

**错误响应**:
```json
{
  "code": 400/401/404/500,
  "message": "错误描述",
  "data": null
}
```

**分页响应**:
```json
{
  "code": 200,
  "message": "获取列表成功",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 12.2 目录结构规范

```
src/
├── assets/          # 静态资源 (图片、字体)
├── components/      # 可复用组件
│   └── XXX/         # 组件按功能分组
├── composables/     # 组合式函数 (Vue 3)
├── layouts/         # 布局组件
├── pages/ 或 views/ # 页面组件
├── router/          # 路由配置
├── stores/          # Pinia状态管理
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── api/             # API接口封装
└── styles/          # 全局样式
```

### 12.3 Git提交规范

使用 Conventional Commits 规范:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更

**示例**:
```
feat(cases): add case timeline feature

Implement timeline tracking for cases including:
- Add timeline items via POST /api/cases/:id/timeline
- Display timeline in case detail view
- Support markdown content in timeline entries

Closes #123
```

### 12.4 分支策略

```
main (生产环境)
  ↑
develop (开发环境)
  ↑
feature/xxx (功能分支)
hotfix/xxx (紧急修复)
```

**工作流**:
1. 从 `develop` 创建 `feature/xxx` 分支
2. 开发完成后提交PR到 `develop`
3. 代码审查通过后合并
4. 发布时从 `develop` 合并到 `main`
5. 紧急修复从 `main` 创建 `hotfix/xxx` 分支

### 12.5 测试规范

#### 后端测试

使用 Jest 框架:

```bash
# 运行测试
cd backend && npm test

# 运行测试并生成覆盖率
npm run test:coverage
```

**测试文件命名**: `*.test.ts` 或 `*.spec.ts`

**示例**:
```typescript
describe('Cases Router', () => {
  describe('GET /api/cases', () => {
    it('should return cases list with pagination', async () => {
      const response = await request(app)
        .get('/api/cases')
        .query({ page: 1, pageSize: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
    });
  });
});
```

#### 前端测试

使用 Vitest + Vue Test Utils:

```bash
# 运行测试
cd admin-pc && npm run test

# 运行测试并生成覆盖率
npm run coverage
```

### 12.6 性能优化建议

#### 后端优化

1. **数据库优化**
   - 为常用查询字段添加索引
   - 使用连接池 (已实现，size=10)
   - 慢查询日志分析

2. **缓存策略**
   - 引入Redis缓存热点数据
   - 实现查询结果缓存
   - 会话存储使用Redis

3. **API优化**
   - 实现分页 (已实现)
   - 字段选择 (只返回必要字段)
   - 响应压缩 (已启用Gzip)

#### 前端优化

1. **构建优化**
   - 路由懒加载 (已实现)
   - Tree Shaking
   - 代码分割

2. **运行时优化**
   - 组件懒加载
   - 虚拟滚动 (大列表)
   - 图片懒加载
   - 防抖/节流

3. **加载优化**
   - CDN静态资源
   - HTTP/2推送
   - 预加载关键资源

---

## 附录

### A. 项目链接

| 资源 | 链接/路径 |
|------|-----------|
| GitHub仓库 | (待补充) |
| 在线Demo | (待补充) |
| API文档 | http://localhost:3000/api |
| 数据库管理 | localhost:3306 |
| 后端日志 | `logs/` 目录或 `docker-compose logs backend` |

### B. 相关文档

- [README.md](README.md) - 项目概述
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 部署指南
- [docs/database-design.md](docs/database-design.md) - 数据库设计文档
- [docs/ui-design-guide.md](docs/ui-design-guide.md) - UI设计规范
- [docs/law-firm-management-system-development-plan.md](docs/law-firm-management-system-development-plan.md) - 开发计划

### C. 常用命令速查

```bash
# 开发
npm run dev                              # 启动全部服务
npm run dev:backend                      # 仅启动后端
npm run build                            # 构建所有项目

# 单独构建
cd admin-pc && npm run build             # 构建管理后台
cd lawyer-pc && npm run build            # 构建律师端
cd mobile-h5 && npm run build            # 构建移动端
cd backend && npm run build              # 编译后端TS

# Docker
docker-compose up -d --build             # 构建并启动
docker-compose ps                        # 查看状态
docker-compose logs -f backend           # 查看后端日志
docker-compose restart backend           # 重启后端
docker-compose down                      # 停止所有服务

# 测试
cd backend && npm test                   # 后端测试
cd admin-pc && npm run test              # 前端测试

# 代码质量
cd backend && npm run lint               # ESLint检查
cd admin-pc && npm run lint:fix          # 自动修复
cd admin-pc && npm run format            # Prettier格式化
```

### D. 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0.0 | 2026-05-20 | LawTech Team | 初始版本，完成核心功能开发 |

### E. 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 📞 联系方式

- **团队**: LawTech Team
- **项目仓库**: (待补充)
- **问题反馈**: 请提交 Issue
- **技术支持**: (待补充)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-05-20  
**文档状态**: ✅ 已完成审核
