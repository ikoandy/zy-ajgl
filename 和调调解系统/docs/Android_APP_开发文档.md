# 和调调解系统 · Android 移动端 APP 开发文档

> **版本**: v1.0  
> **日期**: 2026-06-03  
> **基于**: 和调调解系统 PC端 v1.0 + 微信小程序 v1.0  

---

## 一、项目概述

### 1.1 产品定位

**和调 Android APP** 是「和调调解机构管理平台」的官方移动端应用，面向调解员、当事人和管理者三类用户群体，提供**移动办公 + 现场处理**能力，与PC端和小程序形成**三端协同**生态。

### 1.2 三端定位对比

| 维度 | PC端（桌面） | 小程序（微信） | Android APP |
|------|-------------|---------------|-------------|
| **核心场景** | 深度管理、报表分析 | 快速查看、轻量操作 | 全功能移动办公 |
| **目标用户** | 管理员、资深调解员 | 所有用户（免安装） | 调解员、外勤人员 |
| **安装方式** | 浏览器访问 | 微信内打开 | 应用商店/APK |
| **推送通知** | ❌ | 有限 | ✅ 原生推送 |
| **离线能力** | ❌ | ❌ | ✅ 本地缓存 |
| **设备能力** | 无 | 受限 | 相机/录音/GPS/通话 |
| **文件操作** | 完整 | 受限 | 上传/预览/分享 |

### 1.3 目标用户画像

| 角色 | 核心需求 | 高频使用场景 |
|------|---------|------------|
| **调解员** | 外出办案时快速录入、现场视频调解、日程提醒 | 现场调解、外出取证、电话沟通 |
| **当事人** | 查看案件进度、接收通知、提交材料 | 随时了解进展、配合调解安排 |
| **管理者** | 数据概览、审批流转、人员调度 | 移动审批、远程指挥 |

---

## 二、技术方案

### 2.1 技术栈选型

```
┌─────────────────────────────────────┐
│           应用层 (Application)        │
│  Kotlin + Jetpack Compose (声明式UI) │
├─────────────────────────────────────┤
│           架构层 (Architecture)       │
│  MVVM + Repository Pattern            │
├─────────────────────────────────────┤
│           网络层 (Network)             │
│  Retrofit2 + OkHttp3 + Moshi          │
├─────────────────────────────────────┤
│           数据层 (Data)               │
│  Room (本地缓存) + DataStore          │
├─────────────────────────────────────┤
│           后端服务 (Server)            │
│  https://www.zhfcy.cn/tiaojie/api    │
└─────────────────────────────────────┘
```

**核心技术选型决策：**

| 技术点 | 选型 | 理由 |
|--------|------|------|
| 语言 | **Kotlin** | Google官方推荐，空安全，协程原生支持 |
| UI框架 | **Jetpack Compose** | 声明式UI，与小程序设计语言一致，开发效率高 |
| 架构 | **MVVM + Repository** | 清晰分层，便于测试和维护 |
| 网络 | **Retrofit2 + OkHttp3** | 成熟稳定，拦截器方便做Token管理 |
| JSON解析 | **Moshi** | Kotlin友好，性能优于Gson |
| 图片加载 | **Coil** | Compose原生集成，轻量高效 |
| 异步 | **Kotlin Coroutines + Flow** | 替代RxJava，更简洁 |
| 本地数据库 | **Room** | SQLite抽象层，支持离线缓存 |
| 依赖注入 | **Hilt** | Google官方DI框架 |
| 导航 | **Navigation Compose** | 类型安全的路由管理 |
| 推送 | **Firebase Cloud Messaging** | 跨平台推送，免费额度充足 |

### 2.2 项目结构

```
app/src/main/java/com/hejiao/
├── HejiaoApp.kt                    # Application类
│
├── di/                             # 依赖注入模块
│   ├── AppModule.kt
│   ├── NetworkModule.kt
│   └── DatabaseModule.kt
│
├── data/                           # 数据层
│   ├── api/                        # API接口定义
│   │   ├── ApiService.kt           # Retrofit接口
│   │   ├── model/                  # 数据模型
│   │   │   ├── AuthResponse.kt
│   │   │   ├── Case.kt
│   │   │   ├── Schedule.kt
│   │   │   ├── VideoSession.kt
│   │   │   ├── Feedback.kt
│   │   │   ├── User.kt
│   │   │   ├── Notification.kt
│   │   │   └── DashboardStats.kt
│   │   └── dto/                    # 请求/响应DTO
│   │       ├── LoginRequest.kt
│   │       ├── CreateCaseRequest.kt
│   │       └── ...
│   ├── local/                      # 本地存储
│   │   ├── db/
│   │   │   ├── AppDatabase.kt      # Room数据库
│   │   │   ├── dao/
│   │   │   │   ├── CaseDao.kt
│   │   │   │   ├── ScheduleDao.kt
│   │   │   │   └── UserDao.kt
│   │   │   └── entity/            # Room实体
│   │   │       ├── CachedCase.kt
│   │   │       └── CachedSchedule.kt
│   │   └── prefs/                 # SharedPreferences封装
│   │       └── TokenManager.kt     # Token持久化
│   └── repository/                 # 仓库层
│       ├── AuthRepository.kt
│       ├── CaseRepository.kt
│       ├── ScheduleRepository.kt
│       ├── VideoRepository.kt
│       ├── FeedbackRepository.kt
│       └── UserRepository.kt
│
├── ui/                             # UI层
│   ├── theme/                      # 主题系统
│   │   ├── Color.kt                # 配色（继承PC端金色主题）
│   │   ├── Type.kt                 # 字体排版
│   │   └── Theme.kt                # Material3主题
│   ├── navigation/                 # 导航
│   │   └── HejiaoNavGraph.kt
│   ├── components/                 # 通用组件
│   │   ├── StatusTag.kt            # 状态标签组件
│   │   ├── StatCard.kt             # 统计卡片
│   │   ├── CaseItem.kt             # 案件列表项
│   │   ├── EmptyState.kt           # 空状态组件
│   │   ├── SearchBar.kt            # 搜索栏
│   │   ├── PullRefresh.kt          # 下拉刷新
│   │   └── LoadingState.kt         # 加载状态
│   ├── screen/                     # 页面（Screen）
│   │   ├── auth/
│   │   │   ├── LoginScreen.kt      # 登录页
│   │   │   └── SplashScreen.kt     # 启动页
│   │   ├── home/
│   │   │   └── HomeScreen.kt      # 首页
│   │   ├── case/
│   │   │   ├── CaseListScreen.kt  # 案件列表
│   │   │   ├── CaseDetailScreen.kt # 案件详情
│   │   │   └── CreateCaseScreen.kt # 创建案件
│   │   ├── schedule/
│   │   │   ├── ScheduleScreen.kt   # 日程列表
│   │   │   └── CalendarScreen.kt   # 日历视图
│   │   ├── video/
│   │   │   ├── VideoListScreen.kt # 视频列表
│   │   │   └── VideoRoomScreen.kt  # 视频房间
│   │   ├── feedback/
│   │   │   └── FeedbackScreen.kt   # 评价页
│   │   ├── notification/
│   │   │   └── NotificationScreen.kt # 通知中心
│   │   └── profile/
│   │       ├── ProfileScreen.kt    # 个人中心
│   │       └── SettingsScreen.kt   # 设置页
│   └── viewModel/                  # ViewModel
│       ├── AuthViewModel.kt
│       ├── HomeViewModel.kt
│       ├── CaseListViewModel.kt
│       ├── CaseDetailViewModel.kt
│       ├── ScheduleViewModel.kt
│       ├── VideoViewModel.kt
│       ├── FeedbackViewModel.kt
│       └── ProfileViewModel.kt
│
├── util/                           # 工具类
│   ├── DateUtil.kt
│   ├── FormatUtil.kt
│   ├── Validator.kt
│   └── Extensions.kt
│
└── service/                        # 后台服务
    ├── PushService.kt              # FCM推送处理
    ├── DownloadService.kt          # 文件下载
    └── SyncService.kt              # 数据同步
```

### 2.3 设计规范

#### 配色体系（继承PC端）

```kotlin
// Color.kt - 主色调定义
object HejiaoColors {
    // 主色：金色（品牌色）
    val Gold = Color(0xFFC9A84C)
    val GoldLight = Color(0xFFE4C76A)
    val GoldDim = Color(0x1FC9A84C)

    // 辅助色
    val Teal = Color(0xFF2DD4BF)
    val TealDim = Color(0x1A2DD4BF)
    val Rose = Color(0xFFF472B6)
    val RoseDim = Color(0x1AF472B6)
    val Violet = Color(0xFFA78BFA)
    val VioletDim = Color(0x1AA78BFA)

    // 中性色
    val Dark = Color(0xFF070B14)
    val DarkSecondary = Color(0xFF0D1321)
    val TextPrimary = Color(0xFF1A1A2E)
    val TextSecondary = Color(0xFF6B7280)
    val TextMuted = Color(0xFF9CA3AF)
    val Background = Color(0xFFF5F6F8)
    val CardBackground = Color(0xFFFFFFFF)
    val Border = Color(0xFFEEF0F3)
}
```

#### 案件状态配色映射

| 状态 | 颜色值 | 标签文字 | 说明 |
|------|--------|---------|------|
| pending | `#C9A84C` 金色 | 待受理 | 新建待分配 |
| accepted | `#60A5FA` 蓝色 | 已受理 | 已分配调解员 |
| mediating | `#2DD4BF` 青色 | 调解中 | 正在调解 |
| agreed | `#34D399` 绿色 | 已达成协议 | 双方协议 |
| terminated | `#F472B6` 粉色 | 已终止 | 调解失败 |
| closed | `#A78BFA` 紫色 | 已结案 | 流程结束 |

#### Material Design 3 适配

- 使用 `dynamicColorScheme()` 构建深色/浅色双主题
- 大圆角卡片（16dp）+ 微阴影
- 底部导航栏使用 Material Navigation Bar
- FAB按钮用于新建操作
- Swipe-to-refresh 下拉刷新
- Skeleton Loading 骨架屏加载态

---

## 三、功能规划

### 3.1 功能模块总览

```
┌─────────────────────────────────────────────────┐
│                  和调 Android APP                  │
├──────┬──────┬──────┬──────┬──────┬──────┬───────┤
│ 登录  │ 首页  │ 案件  │ 日程  │ 视频  │ 我的   │
│ 认证  │ 概览  │ 管理  │ 管理  │ 调解  │ 中心   │
├──────┴──────┴──────┴──────┴──────┴──────┴───────┤
│              底部导航栏 (Bottom Nav)              │
└─────────────────────────────────────────────────┘
```

### 3.2 各模块详细规划

#### 模块一：登录认证

**页面**: `LoginScreen.kt`

| 功能项 | 描述 | 优先级 |
|--------|------|--------|
| 账号密码登录 | 用户名+密码登录，调用 `/auth/login` | P0 |
| Token本地存储 | 使用 EncryptedSharedPreferences 加密存储 | P0 |
| 自动登录检测 | 启动时检查本地Token有效性 | P0 |
| 记住登录状态 | 可选开关，控制Token有效期 | P1 |
| 修改密码 | 调用 `/auth/password` | P1 |
| 生物识别登录 | 指纹/面部识别快捷登录（Android 6.0+） | P2 |

**启动流程**:
```
SplashScreen (品牌动画 1.5s)
    ↓
检查本地Token
    ├─ 有效 → HomeScreen (自动登录)
    └─ 无效/不存在 → LoginScreen
```

---

#### 模块二：首页·数据概览

**页面**: `HomeScreen.kt`

**顶部区域 — 用户问候区**
- 时间段问候语（上午好/下午好/晚上好）
- 用户头像 + 姓名 + 角色徽章
- 未读消息红点提示

**统计卡片区 — 4宫格数据卡片**

| 卡片 | 数据来源API | 展示内容 |
|------|------------|---------|
| 全部案件 | `GET /cases/stats` → total | 数字 + 较昨日变化% |
| 待处理 | pending | 数字 + 趋势箭头 |
| 调解中 | mediating | 数字 + 进行中标识 |
| 已结案 | closed | 数字 + 完成率 |

**快捷操作区 — 4个入口按钮**

| 入口 | 图标 | 跳转目标 | 操作 |
|------|------|---------|------|
| 案件管理 | ⚖ gavel | CaseListScreen | 查看全部案件 |
| 日程安排 | 📅 calendar | ScheduleScreen | 今日/本周日程 |
| 视频调解 | 📹 videocam | VideoListScreen | 发起/加入视频 |
| 扫码关联 | 📷 qr_code | ScanScreen | 扫描案件二维码 |

**最近案件列表**
- 显示最近5条案件（按更新时间倒序）
- 每项显示：编号 + 标题 + 状态标签 + 类型 + 日期
- 点击进入详情

**今日日程时间线**
- 按时间排序的今日日程列表
- 显示：时间范围 + 标题 + 地点 + 状态
- 进行中的日程高亮显示

**下拉刷新 + 上拉加载更多**

---

#### 模块三：案件管理

##### 3.3.1 案件列表 (`CaseListScreen.kt`)

**搜索栏**
- 关键词搜索（编号/标题/当事人姓名）
- 250ms防抖
- 实时搜索建议

**状态筛选 Tab**
- Tab项: 全部 / 待受理 / 已受理 / 调解中 / 已协议 / 已结案 / 已终止
- 横向滚动Tab
- 选中态金色高亮

**案件卡片列表**
- 每张卡片展示：
  - 案件编号（金色）
  - 状态标签（对应颜色）
  - 案件标题（最多2行截断）
  - 案件类型
  - 创建日期
  - 优先级指示器（紧急=红色圆点）
- 下拉刷新 + 分页加载（每页15条）
- 空状态插画 + 引导文案
- 点击进入详情

**长按操作菜单** (P1)
- 收藏案件
- 分享案件摘要
- 快速修改状态

##### 3.3.2 案件详情 (`CaseDetailScreen.kt`)

**头部区域**（深色渐变背景）
- 案件编号 + 状态大标签
- 案件标题
- 类型 + 创建时间

**操作按钮行**
- [状态流转] → 弹出ActionSheet选择目标状态
- [当事人] → 滚动到当事人区块
- [时间线] → 滚动到时间线区块
- [更多] → 分享/导出/打印

**基本信息网格** (2列)
- 案件类型 / 优先级
- 调解员 / 当前阶段

**案件描述区** (如有)
- 多行文本展示

**动态表单详情区** (type_details)
- 根据 case.type_id 渲染对应的专属字段
- 金融借贷: 合同号/本金/利率/期限
- 劳动争议: 公司/岗位/工资金额
- ... (复用PC端 CASE_TYPE_FIELDS 配置)

**当事人列表**
- 头像首字母圆圈 + 姓名 + 角色标签
- 申请人=金色 / 被申请人=青色 / 证人=紫色
- 电话号码（可点击拨打）

**案件时间线**
- 左侧竖线 + 圆点连接
- 每条记录：操作描述 + 时间戳
- 不同操作类型用不同颜色圆点区分

**底部浮动操作栏 (FAB)**
- 编辑案件信息
- 添加调解记录
- 上传相关文档

##### 3.3.3 创建案件 (`CreateCaseScreen.kt`) [P1]

**表单字段**
- 案件标题 *（必填，200字限制）
- 案件类型 *（下拉选择，从 `/cases/types` 获取）
- 优先级（普通/较高/紧急）
- 描述（多行文本）

**动态表单区**
- 选择案件类型后，渲染对应的专属字段
- 字段验证规则与PC端一致：
  - 手机号格式校验
  - 身份证号格式校验
  - 金额非负数
  - 利率范围 0-100%
  - 日期逻辑校验

**提交**
- 调用 `POST /cases`
- 成功后跳转到详情页

---

#### 模块四：日程管理

##### 4.1 日程列表 (`ScheduleScreen.kt`)

**周导航栏**
- [‹ 上一周] [6月2日 - 6月8日] [下一周 ›] [今天]
- 点击"今天"快速回到当前周

**日历视图切换** (P1)
- 列表视图 / 月历视图 切换
- 月视图中日期格显示有无日程标记

**日程卡片**
- 左侧彩色竖线标识状态
- 时间范围 + 标题 + 地点
- 关联案件编号（如有）
- 右侧状态标签

**悬浮添加按钮 (FAB)**
- 点击弹出底部弹窗创建新日程

##### 4.2 创建日程弹窗

**字段**
- 标题 *
- 开始时间 *（日期+时间选择器）
- 结束时间 *（自动校验 > 开始时间）
- 日程类型（调解/会议/随访/其他）
- 地点
- 关联案件（智能搜索选择，复用CaseSearch逻辑）
- 备注

**提交**: `POST /schedules`

##### 4.3 冲突检测** (P2)
- 创建/编辑时调用 `GET /schedules/conflicts`
- 弹出冲突警告（时间段重叠的其他日程）

---

#### 模块五：视频调解

##### 5.1 视频列表 (`VideoListScreen.kt`)

**统计头**
- 全部 / 进行中 / 已完成 三个数字

**视频会话卡片**
- 状态圆点（待开始=金/进行中=青/已结束=灰）
- 标题 + 状态标签
- 关联案件
- 计划时间
- 时长（已完成时显示）

**操作按钮**
- 待开始状态 → [进入调解] 按钮（蓝色主按钮）
- 其他状态 → 显示状态文字（禁用态）

##### 5.2 视频房间 (`VideoRoomScreen.kt`) [P1]

**房间界面**
- 全屏视频画面（WebRTC集成）
- 远端画面 + 本地预览画中画
- 底部工具栏：
  - 静音/取消静音
  - 开关摄像头
  - 切换前后摄像头
  - 挂断
  - 聊天消息面板
- 顶部信息：房间名称 + 时长计时

**聊天面板**
- 文本消息收发
- 调用 `GET/POST /video/sessions/:id/messages`

**参与者列表**
- 显示在线参与者头像和名称
- 调用 `GET /video/sessions/:id/participants`

**技术方案**: 
- 集成 WebRTC（如 Agora SDK 或 自建 Janus 服务）
- 或通过WebView嵌入现有H5视频页面

---

#### 模块六：通知中心 (`NotificationScreen.kt`) [P1]

**通知列表**
- 分类Tab: 全部 / 系统 / 案件 / 视频 / 日程
- 每条通知：图标 + 标题 + 内容摘要 + 时间
- 已读/未读状态区分
- 点击跳转对应详情页

**操作**
- 单条标记已读: `PUT /push/:id/read`
- 全部已读: `PUT /push/read-all`
- 下拉刷新 + 分页

**FCM推送对接**
- 后端新增推送接口（或复用现有 `/push/party/batch`）
- APP收到推送后:
  - 显示通知栏通知
  - 点击通知打开对应详情页
  - 更新未读角标数

---

#### 模块七：调解评价 (`FeedbackScreen.kt`)

**步骤1: 选择案件**
- 搜索/列表选择要评价的案件

**步骤2: 选择当事人**
- 显示该案件的当事人列表（横向Chip选择）

**步骤3: 评分**
- 总体满意度: 5星评分 + 文字说明
  - 1分=非常不满意 → 5分=非常满意
- 分项评分:
  - 服务态度 (1-5星)
  - 处理效率 (1-5星)
  - 公平公正 (1-5星)

**步骤4: 评语**
- 多行文本输入（500字限制）
- 字数实时计数

**步骤5: 匿名选项**
- Switch开关控制是否匿名

**提交**: `POST /feedbacks`

---

#### 模块八：个人中心 (`ProfileScreen.kt`)

**用户信息卡片**（深色渐变背景）
- 头像（支持从相册选取/拍照上传）
- 姓名 + 角色名称
- 手机号（脱敏显示）

**功能菜单列表**

| 菜单项 | 图标 | 功能 | 优先级 |
|--------|------|------|--------|
| 我的作品 | 📂 folder | 经手案件统计 | P0 |
| 我的日程 | 📅 calendar | 个人日程概览 | P0 |
| 视频记录 | 📹 videocam | 参与过的视频调解 | P0 |
| 消息通知 | 🔔 bell | 通知设置（开关推送） | P1 |
| 修改密码 | 🔑 key | 修改登录密码 | P1 |
| 关于我们 | ℹ info | 版本信息、联系方式 | P2 |
| 清除缓存 | 🗑 trash | 清除本地缓存数据 | P2 |

**退出登录按钮**
- 红色边框样式
- 二次确认Dialog
- 清除本地Token
- 跳转登录页

---

### 3.3 功能优先级矩阵

| 功能模块 | P0 (MVP) | P1 (V1.1) | P2 (V1.2) |
|---------|-----------|-----------|-----------|
| 登录认证 | ✅ Token登录 | ✅ 生物识别 | ✅ 记住登录 |
| 首页概览 | ✅ 统计+快捷+列表 | - | - |
| 案件管理 | ✅ 列表+详情+搜索 | ✅ 创建案件 | ✅ 长按操作 |
| 日程管理 | ✅ 列表+创建 | ✅ 日历视图 | ✅ 冲突检测 |
| 视频调解 | ✅ 列表 | ✅ 进入房间 | ✅ WebRTC原生 |
| 调解评价 | ✅ 完整评价流程 | - | - |
| 通知中心 | - | ✅ 列表+已读 | ✅ FCM推送 |
| 个人中心 | ✅ 基本信息 | ✅ 密码修改 | ✅ 头像上传 |
| 离线缓存 | - | ✅ 案件缓存 | ✅ 离线编辑 |
| 扫码功能 | - | - | ✅ 案件扫码 |
| 文件上传 | - | ✅ 相机/相册选图 | - |
| 数据同步 | - | - | ✅ 后台同步 |

**MVP版本核心目标**: 让调解员能在手机上完成**查看案件→处理日程→参与视频→提交评价**的核心工作流。

---

## 四、API 对接清单

### 4.1 认证模块

| 方法 | 路径 | 用途 | 调用时机 |
|------|------|------|---------|
| POST | `/auth/login` | 登录获取Token | 登录页提交 |
| GET | `/auth/me` | 获取当前用户信息 | 启动时验证Token |
| POST | `/auth/logout` | 登出 | 退出登录 |
| PUT | `/auth/password` | 修改密码 | 设置页 |

### 4.2 案件模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/cases` | 案件列表（分页+搜索+筛选） | 案件列表 |
| GET | `/cases/stats` | 统计数据 | 首页 |
| GET | `/cases/types` | 案件类型列表 | 创建案件 |
| GET | `/cases/search` | 智能搜索 | 搜索框 |
| GET | `/cases/:id` | 案件详情 | 详情页 |
| POST | `/cases` | 创建案件 | 创建页 |
| PUT | `/cases/:id` | 更新案件 | 编辑页 |
| GET | `/cases/:id/parties` | 当事人列表 | 详情页 |
| POST | `/cases/:id/parties` | 添加当事人 | 详情页 |
| PUT | `/cases/:id/finance` | 更新金融详情 | 详情页 |
| POST | `/cases/:id/stages` | 添加阶段 | 详情页 |
| DELETE | `/cases/:id` | 删除案件 | 管理员 |

### 4.3 工作流模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/workflow/:id/timeline` | 案件时间线 | 详情页 |
| POST | `/workflow/:id/transition` | 状态流转 | 详情页 |
| POST | `/workflow/:id/assign` | 分配调解员 | 详情页 |

### 4.4 日程模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/schedules` | 日程列表 | 日程列表 |
| GET | `/schedules/calendar` | 日历数据 | 日历视图 |
| GET | `/schedules/conflicts` | 冲突检测 | 创建日程 |
| GET | `/schedules/today` | 今日日程 | 首页 |
| GET | `/schedules/upcoming` | 即将到来 | 首页 |
| GET | `/schedules/:id` | 日程详情 | 日程详情 |
| POST | `/schedules` | 创建日程 | 创建弹窗 |
| PUT | `/schedules/:id` | 编辑日程 | 编辑页 |
| DELETE | `/schedules/:id` | 删除日程 | 长按菜单 |

### 4.5 视频调解模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/video/sessions` | 会话列表 | 视频列表 |
| GET | `/video/sessions/:id` | 会话详情 | 房间页 |
| POST | `/video/sessions` | 创建会话 | 创建页 |
| PUT | `/video/sessions/:id` | 更新会话 | 房间页 |
| PUT | `/video/sessions/:id/status` | 修改状态 | 房间页 |
| POST | `/video/sessions/:id/participants` | 添加参与者 | 房间页 |
| GET | `/video/sessions/:id/messages` | 聊天消息 | 房间页 |
| POST | `/video/sessions/:id/messages` | 发送消息 | 房间页 |
| DELETE | `/video/sessions/:id` | 删除会话 | 管理员 |

### 4.6 通知模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/push/` | 通知列表 | 通知中心 |
| GET | `/push/unread-count` | 未读数量 | 首页Badge |
| PUT | `/push/:id/read` | 标记已读 | 通知列表 |
| PUT | `/push/read-all` | 全部已读 | 通知列表 |

### 4.7 评价模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| POST | `/feedbacks` | 提交评价 | 评价页 |

### 4.8 用户模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/users` | 用户列表 | 管理员 |
| GET | `/users/:id` | 用户详情 | 个人中心 |
| PUT | `/users/:id` | 更新个人信息 | 设置页 |
| GET | `/users/roles/list` | 角色列表 | 创建用户 |

### 4.9 其他模块

| 方法 | 路径 | 用途 | 页面 |
|------|------|------|------|
| GET | `/callcenter/stats` | 呼叫统计 | 首页扩展 |
| GET | `/callcenter/records` | 通话记录 | 通话记录页 |
| POST | `/callcenter/outbound` | 发起外呼 | 外呼页 |
| GET | `/documents/templates` | 文书模板 | 文书生成 |
| POST | `/documents/generate` | 生成文书 | 文书生成 |
| GET | `/reports/overview` | 数据概览 | 报表页 |
| GET | `/settings/branding` | 品牌配置 | 全局 |
| GET | `/archives` | 档案列表 | 档案页 |

**总计: 50+ 个API端点**

---

## 五、数据模型

### 5.1 核心实体关系

```
User (用户)
  ├── id, username, password_hash, real_name
  ├── phone, email, role_id, avatar_color, status
  └── role → Role

Role (角色)
  ├── id, name, display_name, description
  └── permissions

Case (案件) ← 核心实体
  ├── id, case_number, title, type_id
  ├── description, status, priority
  ├── mediator_id, created_by
  ├── assigned_at, accepted_at, closed_at
  ├── type_details (JSON) ← 动态字段
  ├── parties → CaseParty[]
  ├── stages → CaseStage[]
  └── timeline → WorkflowLog[]

CaseType (案件类型)
  ├── id, name, icon, color, sort_order
  └── fields_config (动态表单配置)

CaseParty (当事人)
  ├── id, case_id, name, phone
  ├── email, id_type, id_number
  ├── role (plaintiff/defendant/witness)
  └── address

Schedule (日程)
  ├── id, title, case_id, mediator_id
  ├── schedule_type, status
  ├── start_time, end_time
  ├── location, description, reminder
  └── created_by

VideoSession (视频会话)
  ├── id, case_id, room_id, title, status
  ├── scheduled_at, started_at, ended_at
  ├── duration, recording_path
  ├── created_by
  └── participants → VideoParticipant[]

Feedback (评价反馈)
  ├── id, case_id, party_id
  ├── rating, attitude_score, efficiency_score, fairness_score
  ├── comment, is_anonymous
  └── created_at

Notification (通知)
  ├── id, user_id, type, title, content
  ├── link, is_read
  └── created_at
```

### 5.2 Room 本地缓存实体

```kotlin
@Entity(tableName = "cached_cases")
data class CachedCase(
    @PrimaryKey val id: Int,
    val caseNumber: String,
    val title: String,
    val typeId: Int?,
    val typeName: String?,
    val status: String,
    val priority: String?,
    val mediatorName: String?,
    val createdAt: String,
    val updatedAt: String,
    val typeDetails: String?,  // JSON string
    val syncedAt: Long         // 最后同步时间戳
)

@Entity(tableName = "cached_schedules")
data class CachedSchedule(
    @PrimaryKey val id: Int,
    val title: String,
    val caseId: Int?,
    val caseNumber: String?,
    val scheduleType: String,
    val status: String,
    val startTime: String,
    val endTime: String,
    val location: String?,
    val syncedAt: Long
)
```

---

## 六、交互流程

### 6.1 典型业务流程: 调解员外出办案

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   首页查看   │ →  │   查看案件   │ →  │   现场调解   │ →  │   录入结果   │
│  今日日程    │    │   详情信息   │    │   视频通话   │    │   提交评价   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↓                   ↓                   ↓                   ↓
  看到下午2点         点击案件卡片        在现场发起视频       调解完成后
  有一个调解         查看当事人信息        与远程当事人沟通      填写五星评价
  日程安排                                 录入调解记录          提交反馈
```

### 6.2 离线-在线同步策略

```
┌──────────────────────────────────────────────────┐
│                   同步引擎                         │
├──────────┬──────────┬──────────┬─────────────────┤
│ 读取阶段  │ 编辑阶段  │ 等待网络  │ 同步阶段         │
├──────────┼──────────┼──────────┼─────────────────┤
│ 从Room   │ 修改本地 │ 检测网络 │ 批量上传变更     │
│ 读取缓存 │ 实体     │ 状态变化  │ 更新本地状态     │
│          │ 标记dirty│          │ 通知UI刷新       │
└──────────┴──────────┴──────────┴─────────────────┘
```

**同步优先级**:
1. **即时同步**: 登录/登出、状态流转、评价提交（必须联网）
2. **后台同步**: 案件列表刷新、日程更新（有网时自动）
3. **延迟同步**: 离线编辑的案件备注、日程备注（联网后批量同步）

---

## 七、安全方案

### 7.1 通信安全
- 全局HTTPS（API_BASE使用 https://）
- Certificate Pinning 防中间人攻击
- Token存储使用 Android Keystore System 加密

### 7.2 数据安全
- 敏感信息（密码、Token）不写入日志
- 截图安全: 敏感页面禁止截图（FLAG_SECURE）
- 生物识别解锁: APP切回前台时要求验证

### 7.3 权限最小化
- 仅申请必要权限:
  - CAMERA: 拍照上传证据/扫描二维码
  - RECORD_AUDIO: 视频调解语音
  - INTERNET: 网络请求
  - READ/WRITE_EXTERNAL_STORAGE: 文件下载/上传
  - POST_NOTIFICATIONS: 推送通知
  - VIBRATE: 触觉反馈

---

## 八、开发里程碑

### Phase 1: MVP (4周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W1 | 项目搭建 + 登录认证 + 首页框架 | 可运行的壳APP |
| W2 | 案件列表 + 案件详情 + 搜索筛选 | 完整案件浏览体验 |
| W3 | 日程管理 + 视频调解列表 + 评价功能 | 核心业务闭环 |
| W4 | 个人中心 + 通知中心 + 联调测试 | MVP版本APK |

### Phase 2: 增强 (3周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W5 | 创建案件 + 状态流转 + 离线缓存 | 完整CRUD能力 |
| W6 | 视频房间(WebRTC/WebView) + FCM推送 | 通讯能力 |
| W7 | 文件上传/下载 + 扫码功能 + 性能优化 | V1.1版本 |

### Phase 3: 完善 (2周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W8 | 暗色模式 + 国际化 + 无障碍优化 | 体验完善 |
| W9 | 应用商店上架素材 + 安全审计 + 发布准备 | 正式发布版 |

---

## 九、附录

### A. 与小程序的差异

| 能力 | 小程序 | Android APP | 差异原因 |
|------|--------|-------------|---------|
| 推送通知 | 有限（订阅消息） | 完整FCM推送 | 原生能力 |
| 文件操作 | 仅预览 | 上传/下载/分享 | 系统权限 |
| 视频通话 | WebView嵌套 | 原生WebRTC | 性能+体验 |
| 离线使用 | 不支持 | Room本地缓存 | 本地存储 |
| 设备硬件 | 无法调用 | GPS/相机/蓝牙/NFC | 系统API |
| 后台运行 | 5分钟限制 | Service常驻 | 系统机制 |
| 安装包大小 | 即用即走 | ~15-25MB APK | 原生代码 |

### B. 与PC端的差异

| 能力 | PC端 | Android APP | 差异原因 |
|------|------|-------------|---------|
| 系统管理 | 完整（角色/权限/日志） | 只读/简化版 | 移动端不适合复杂配置 |
| 数据报表 | 图表丰富（Chart.js） | 简化数字卡片 | 屏寸限制 |
| 批量操作 | 表格多选批量 | 单条操作为主 | 触屏交互 |
| 文书生成 | 完整模板+预览 | 查看+下载 | 打印依赖PC |
| 工作流设计 | 可视化拖拽 | 只读查看 | 复杂操作需桌面 |

### C. 关键第三方SDK

| SDK | 用途 | 版本建议 |
|-----|------|---------|
| Retrofit2 | 网络请求 | 2.9.x |
| OkHttp3 | HTTP客户端 | 4.12.x |
| Room | 本地数据库 | 2.6.x |
| Hilt | 依赖注入 | 2.48.x |
| Coil | 图片加载 | 2.x |
| Compose Navigation | 导航 | 2.7.x |
| Firebase BOM | 推送/分析 | 32.x |
| Agora RTC / Janus | 视频通话 | 最新版 |
| CameraX | 相机拍照 | 1.3.x |
| ML Kit | 二维码扫描 | 最新版（可选）|

---

> **文档结束** — 本文档作为「和调 Android APP」开发的完整规格说明书，覆盖功能规划、技术架构、API对接、数据模型、交互流程和安全方案。开发团队应以此文档为基准进行迭代开发。
