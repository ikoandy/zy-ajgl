# PC管理后台逻辑思路文档

## 概述

PC管理后台是律师事务所智能管理系统的核心管理端，为管理员提供全面的数据管理、业务监控和决策支持功能。本文档详细阐述PC后台的整体架构、功能模块、业务流程和技术实现。

## 用户角色

### 1. 超级管理员
- 系统配置管理
- 用户权限管理
- 数据备份恢复
- 系统监控

### 2. 管理员
- 案件管理
- 客户管理
- 财务管理
- 团队管理
- 报表分析

### 3. 律师
- 案件处理
- 客户沟通
- 文档管理
- 日程安排

## 整体架构

### 技术栈
```
前端框架：Vue 3 + TypeScript
UI组件库：Element Plus
构建工具：Vite
状态管理：Pinia
路由管理：Vue Router
HTTP客户端：Axios
图表库：ECharts
富文本编辑器：TinyMCE
```

### 目录结构
```
admin-pc/
├── src/
│   ├── api/                # API接口
│   │   ├── index.ts        # API配置
│   │   ├── user.ts         # 用户接口
│   │   ├── case.ts         # 案件接口
│   │   ├── client.ts       # 客户接口
│   │   ├── finance.ts      # 财务接口
│   │   ├── document.ts     # 文档接口
│   │   ├── schedule.ts     # 日程接口
│   │   └── statistics.ts   # 统计接口
│   ├── assets/             # 静态资源
│   │   ├── images/         # 图片
│   │   ├── icons/          # 图标
│   │   └── styles/         # 样式
│   ├── components/         # 公共组件
│   │   ├── layout/         # 布局组件
│   │   ├── table/          # 表格组件
│   │   ├── form/           # 表单组件
│   │   ├── chart/          # 图表组件
│   │   ├── upload/         # 上传组件
│   │   └── common/         # 通用组件
│   ├── composables/        # 组合式函数
│   │   ├── useAuth.ts      # 认证相关
│   │   ├── useTable.ts     # 表格相关
│   │   ├── useForm.ts      # 表单相关
│   │   └── useChart.ts     # 图表相关
│   ├── directives/         # 自定义指令
│   │   ├── permission.ts   # 权限指令
│   │   └── loading.ts      # 加载指令
│   ├── layouts/            # 布局页面
│   │   ├── BasicLayout.vue # 基础布局
│   │   └── BlankLayout.vue # 空白布局
│   ├── router/             # 路由配置
│   │   ├── index.ts        # 路由入口
│   │   └── modules/       # 路由模块
│   ├── stores/             # 状态管理
│   │   ├── user.ts         # 用户状态
│   │   ├── app.ts          # 应用状态
│   │   ├── case.ts         # 案件状态
│   │   └── permission.ts   # 权限状态
│   ├── types/              # 类型定义
│   │   ├── user.ts         # 用户类型
│   │   ├── case.ts         # 案件类型
│   │   ├── client.ts       # 客户类型
│   │   └── common.ts       # 通用类型
│   ├── utils/              # 工具函数
│   │   ├── request.ts      # 请求封装
│   │   ├── auth.ts         # 认证工具
│   │   ├── format.ts       # 格式化工具
│   │   ├── validate.ts     # 验证工具
│   │   └── download.ts     # 下载工具
│   ├── views/              # 页面视图
│   │   ├── dashboard/      # 仪表盘
│   │   ├── case/           # 案件管理
│   │   ├── client/         # 客户管理
│   │   ├── finance/        # 财务管理
│   │   ├── team/           # 团队管理
│   │   ├── document/       # 文档管理
│   │   ├── schedule/       # 日程管理
│   │   ├── system/         # 系统管理
│   │   └── login/          # 登录页面
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── public/                 # 公共资源
├── index.html              # HTML模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── .env                    # 环境变量
```

## 核心功能模块

### 1. 认证与权限模块

#### 1.1 登录流程
##### 1.1.1 账号密码登录
- 账号密码验证
- 验证码登录
- 忘记密码
- 记住密码

##### 1.1.2 第三方登录
- 微信登录
- 企业微信登录
- 钉钉登录

##### 1.1.3 登录状态管理
- Token存储
- 自动登录
- 登录超时
- 多设备登录

#### 1.2 权限管理
##### 1.2.1 角色管理
- 角色创建
- 角色编辑
- 角色删除
- 角色复制

##### 1.2.2 权限分配
- 页面权限
- 按钮权限
- 数据权限
- 菜单权限

##### 1.2.3 权限验证
- 路由拦截
- 按钮级权限
- 数据级权限
- 动态路由

#### 1.3 用户管理
##### 1.3.1 用户列表
- 用户筛选
- 用户搜索
- 用户排序
- 分页加载

##### 1.3.2 用户详情
- 基本信息
- 角色权限
- 登录日志
- 操作日志

##### 1.3.3 用户操作
- 用户创建
- 用户编辑
- 用户删除
- 用户禁用

### 2. 仪表盘模块

#### 2.1 数据概览
##### 2.1.1 统计卡片
- 案件统计
- 客户统计
- 财务统计
- 团队统计

##### 2.1.2 数据趋势
- 案件趋势
- 收入趋势
- 客户增长
- 工作量趋势

##### 2.1.3 数据分布
- 案件类型分布
- 客户地域分布
- 律师工作量分布
- 费用类型分布

#### 2.2 实时监控
##### 2.2.1 系统监控
- 服务器状态
- 数据库状态
- 接口响应时间
- 在线用户数

##### 2.2.2 业务监控
- 案件办理进度
- 客户咨询响应
- 文档上传下载
- 消息发送接收

#### 2.3 预警提醒
##### 2.3.1 案件预警
- 即将到期案件
- 超时未处理案件
- 高优先级案件
- 重大案件提醒

##### 2.3.2 财务预警
- 逾期未收款
- 预算超支
- 费用异常
- 税务提醒

### 3. 案件管理模块

#### 3.1 案件列表
##### 3.1.1 案件筛选
- 按状态筛选
- 按类型筛选
- 按优先级筛选
- 按时间筛选

##### 3.1.2 案件搜索
- 关键词搜索
- 高级搜索
- 搜索历史
- 搜索建议

##### 3.1.3 案件排序
- 按创建时间排序
- 按更新时间排序
- 按优先级排序
- 按截止时间排序

##### 3.1.4 批量操作
- 批量删除
- 批量分配
- 批量修改状态
- 批量导出

#### 3.2 案件详情
##### 3.2.1 案件信息
- 基本信息
- 案件详情
- 客户信息
- 律师信息

##### 3.2.2 案件进度
- 进度记录
- 时间线展示
- 进度统计
- 进度提醒

##### 3.2.3 案件文档
- 文档列表
- 文档上传
- 文档预览
- 文档下载

##### 3.2.4 案件沟通
- 沟通记录
- 消息发送
- 附件上传
- 沟通统计

#### 3.3 案件创建
##### 3.3.1 基本信息
- 案件标题
- 案件类型
- 案件描述
- 客户选择

##### 3.3.2 案件配置
- 优先级设置
- 截止日期
- 负责律师
- 案件标签

##### 3.3.3 案件提交
- 表单验证
- 提交审核
- 草稿保存
- 预览模式

#### 3.4 案件流程
##### 3.4.1 案件分配
- 自动分配
- 手动分配
- 分配记录
- 分配统计

##### 3.4.2 案件办理
- 进度更新
- 文档上传
- 客户沟通
- 费用管理

##### 3.4.3 案件结案
- 结案申请
- 审核流程
- 案件归档
- 统计分析

### 4. 客户管理模块

#### 4.1 客户列表
##### 4.1.1 客户筛选
- 按类型筛选
- 按状态筛选
- 按时间筛选
- 按地域筛选

##### 4.1.2 客户搜索
- 关键词搜索
- 高级搜索
- 搜索历史
- 搜索建议

##### 4.1.3 客户排序
- 按创建时间排序
- 按更新时间排序
- 按活跃度排序
- 按贡献值排序

#### 4.2 客户详情
##### 4.2.1 基本信息
- 客户信息
- 联系方式
- 公司信息
- 行业信息

##### 4.2.2 案件历史
- 案件列表
- 案件统计
- 案件详情
- 案件趋势

##### 4.2.3 沟通记录
- 沟通历史
- 沟通统计
- 沟通频率
- 沟通效果

##### 4.2.4 跟进记录
- 跟进计划
- 跟进记录
- 跟进提醒
- 跟进统计

#### 4.3 客户分析
##### 4.3.1 客户画像
- 基本属性
- 行为特征
- 偏好分析
- 价值评估

##### 4.3.2 客户分类
- 按价值分类
- 按活跃度分类
- 按忠诚度分类
- 按需求分类

##### 4.3.3 客户预测
- 流失预测
- 需求预测
- 价值预测
- 增长预测

### 5. 财务管理模块

#### 5.1 费用管理
##### 5.1.1 费用录入
- 费用类型
- 费用金额
- 费用描述
- 费用凭证

##### 5.1.2 费用审批
- 审批流程
- 审批记录
- 审批统计
- 审批提醒

##### 5.1.3 费用统计
- 费用类型统计
- 费用部门统计
- 费用时间统计
- 费用对比

#### 5.2 收入管理
##### 5.2.1 收入录入
- 收入类型
- 收入金额
- 收入来源
- 收入凭证

##### 5.2.2 收入统计
- 收入类型统计
- 收入部门统计
- 收入时间统计
- 收入对比

#### 5.3 发票管理
##### 5.3.1 发票开具
- 发票信息
- 发票模板
- 发票打印
- 发票导出

##### 5.3.2 发票统计
- 发票类型统计
- 发票金额统计
- 发票时间统计
- 发票对比

#### 5.4 报表分析
##### 5.4.1 财务报表
- 资产负债表
- 利润表
- 现金流量表
- 收支明细表

##### 5.4.2 财务分析
- 收支对比
- 趋势分析
- 结构分析
- 比率分析

### 6. 团队管理模块

#### 6.1 律师管理
##### 6.1.1 律师列表
- 律师筛选
- 律师搜索
- 律师排序
- 分页加载

##### 6.1.2 律师详情
- 基本信息
- 资质信息
- 案件统计
- 工作量统计

##### 6.1.3 律师操作
- 律师创建
- 律师编辑
- 律师删除
- 律师禁用

#### 6.2 团队协作
##### 6.2.1 团队任务
- 任务分配
- 任务跟踪
- 任务统计
- 任务提醒

##### 6.2.2 团队沟通
- 团队聊天
- 文件共享
- 会议安排
- 日程同步

#### 6.3 绩效考核
##### 6.3.1 绩效指标
- 案件数量
- 案件质量
- 客户满意度
- 收入贡献

##### 6.3.2 绩效评估
- 评估流程
- 评估标准
- 评估结果
- 绩效改进

### 7. 文档管理模块

#### 7.1 文档库
##### 7.1.1 文档分类
- 按类型分类
- 按部门分类
- 按项目分类
- 按权限分类

##### 7.1.2 文档搜索
- 关键词搜索
- 高级搜索
- 全文搜索
- 搜索建议

##### 7.1.3 文档操作
- 文档上传
- 文档下载
- 文档预览
- 文档分享

#### 7.2 版本管理
##### 7.2.1 版本记录
- 版本历史
- 版本对比
- 版本恢复
- 版本删除

##### 7.2.2 版本控制
- 版本锁定
- 版本合并
- 版本审批
- 版本发布

#### 7.3 权限管理
##### 7.3.1 文档权限
- 查看权限
- 编辑权限
- 下载权限
- 分享权限

##### 7.3.2 文件夹权限
- 访问权限
- 创建权限
- 修改权限
- 删除权限

### 8. 日程管理模块

#### 8.1 日历视图
##### 8.1.1 视图切换
- 日视图
- 周视图
- 月视图
- 年视图

##### 8.1.2 日程展示
- 个人日程
- 团队日程
- 客户日程
- 案件日程

##### 8.1.3 日程操作
- 新建日程
- 编辑日程
- 删除日程
- 分享日程

#### 8.2 任务管理
##### 8.2.1 任务列表
- 任务筛选
- 任务搜索
- 任务排序
- 分页加载

##### 8.2.2 任务操作
- 任务创建
- 任务分配
- 任务标记完成
- 任务延期

#### 8.3 提醒设置
##### 8.3.1 提醒方式
- 系统提醒
- 邮件提醒
- 短信提醒
- 微信提醒

##### 8.3.2 提醒管理
- 提醒设置
- 提醒历史
- 提醒统计
- 提醒模板

### 9. 系统管理模块

#### 9.1 系统配置
##### 9.1.1 基本配置
- 系统名称
- 系统logo
- 系统描述
- 版本信息

##### 9.1.2 功能配置
- 功能开关
- 权限配置
- 流程配置
- 模板配置

#### 9.2 数据管理
##### 9.2.1 数据备份
- 自动备份
- 手动备份
- 备份恢复
- 备份清理

##### 9.2.2 数据清理
- 日志清理
- 缓存清理
- 垃圾数据清理
- 历史数据清理

#### 9.3 日志管理
##### 9.3.1 操作日志
- 日志查询
- 日志统计
- 日志导出
- 日志清理

##### 9.3.2 系统日志
- 错误日志
- 访问日志
- 性能日志
- 安全日志

### 10. 帮助与反馈模块

#### 10.1 帮助中心
##### 10.1.1 使用指南
- 新手教程
- 功能介绍
- 操作流程
- 常见问题

##### 10.1.2 视频教程
- 系统介绍
- 功能演示
- 操作指南
- 案例分析

#### 10.2 意见反馈
##### 10.2.1 反馈提交
- 反馈类型
- 反馈内容
- 截图上传
- 联系方式

##### 10.2.2 反馈管理
- 反馈查看
- 反馈处理
- 反馈统计
- 反馈回复

## 业务流程

### 1. 案件办理流程
#### 1.1 案件创建
##### 1.1.1 信息填写
- 基本信息
- 客户信息
- 案件详情
- 费用信息

##### 1.1.2 审核提交
- 表单验证
- 提交审核
- 审核流程
- 审核结果

#### 1.2 案件分配
##### 1.2.1 分配规则
- 自动分配
- 手动分配
- 分配优先级
- 分配限制

##### 1.2.2 分配执行
- 分配通知
- 分配确认
- 分配记录
- 分配统计

#### 1.3 案件办理
##### 1.3.1 进度记录
- 进度更新
- 文档上传
- 客户沟通
- 费用记录

##### 1.3.2 质量控制
- 案件审核
- 文档审查
- 沟通记录
- 风险评估

#### 1.4 案件结案
##### 1.4.1 结案申请
- 结案材料
- 结案报告
- 费用结算
- 客户评价

##### 1.4.2 结案审核
- 审核流程
- 审核标准
- 审核结果
- 审核记录

##### 1.4.3 结案归档
- 案件归档
- 文档归档
- 统计分析
- 经验总结

### 2. 客户服务流程
#### 2.1 客户咨询
##### 2.1.1 咨询接收
- 在线咨询
- 电话咨询
- 微信咨询
- 邮件咨询

##### 2.1.2 咨询分配
- 自动分配
- 手动分配
- 分配规则
- 分配通知

##### 2.1.3 咨询处理
- 咨询回复
- 文档提供
- 解决方案
- 跟进记录

#### 2.2 客户跟进
##### 2.2.1 跟进计划
- 跟进目标
- 跟进内容
- 跟进时间
- 跟进方式

##### 2.2.2 跟进执行
- 跟进记录
- 文档上传
- 客户反馈
- 跟进效果

##### 2.2.3 跟进评估
- 跟进质量
- 客户满意度
- 问题解决率
- 转化率

### 3. 财务管理流程
#### 3.1 费用收取
##### 3.1.1 费用计算
- 案件费用
- 咨询费用
- 其他费用
- 税费计算

##### 3.1.2 费用收取
- 在线支付
- 线下支付
- 发票开具
- 收款记录

#### 3.2 费用结算
##### 3.2.1 费用核算
- 收入核算
- 支出核算
- 利润核算
- 税费核算

##### 3.2.2 结算分配
- 律师提成
- 团队分红
- 税费缴纳
- 利润分配

#### 3.3 财务报表
##### 3.3.1 报表生成
- 日报表
- 周报表
- 月报表
- 年报表

##### 3.3.2 报表分析
- 趋势分析
- 结构分析
- 比率分析
- 对比分析

## 技术实现

### 1. 前端技术栈
#### 1.1 框架选择
- Vue 3 + TypeScript
- React + TypeScript
- Angular + TypeScript
- Svelte + TypeScript

#### 1.2 状态管理
- Pinia
- Vuex
- Redux
- MobX

#### 1.3 路由管理
- Vue Router
- React Router
- Angular Router
- Svelte Router

#### 1.4 UI组件库
- Element Plus
- Ant Design
- Material UI
- Chakra UI

### 2. 后端技术栈
#### 2.1 服务器框架
- Node.js + Express
- Python + Django
- Java + Spring Boot
- Go + Gin

#### 2.2 数据库
- MySQL
- PostgreSQL
- MongoDB
- Redis

#### 2.3 缓存
- Redis
- Memcached
- 本地缓存
- CDN缓存

#### 2.4 消息队列
- RabbitMQ
- Kafka
- Redis Queue
- ActiveMQ

### 3. 部署架构
#### 3.1 前端部署
- 静态资源部署
- CDN加速
- 容器化部署
- 服务器集群

#### 3.2 后端部署
- 云服务器
- 容器化部署
- 服务器集群
- 负载均衡

#### 3.3 数据库部署
- 云数据库
- 本地数据库
- 数据库集群
- 读写分离

## 性能优化

### 1. 前端优化
#### 1.1 页面优化
- 代码分割
- 懒加载
- 图片优化
- 资源压缩

#### 1.2 网络优化
- HTTP/2
- CDN加速
- 缓存策略
- 请求合并

#### 1.3 渲染优化
- 虚拟滚动
- 按需加载
- 防抖节流
- 内存管理

### 2. 后端优化
#### 2.1 代码优化
- 算法优化
- 数据库优化
- 缓存优化
- 异步处理

#### 2.2 服务器优化
- 负载均衡
- 分布式架构
- 微服务架构
- 容器化部署

#### 2.3 数据库优化
- 索引优化
- 查询优化
- 分库分表
- 读写分离

## 安全机制

### 1. 数据安全
#### 1.1 数据加密
- 传输加密
- 存储加密
- 敏感信息加密
- 备份加密

#### 1.2 数据备份
- 自动备份
- 手动备份
- 异地备份
- 备份恢复

### 2. 访问安全
#### 2.1 身份认证
- 账号密码认证
- 短信验证码认证
- 双因素认证
- 单点登录

#### 2.2 权限控制
- 角色权限
- 页面权限
- 按钮权限
- 数据权限

### 3. 应用安全
#### 3.1 输入验证
- 参数验证
- 防SQL注入
- 防XSS攻击
- 防CSRF攻击

#### 3.2 日志监控
- 操作日志
- 异常日志
- 性能日志
- 安全日志

## 测试方案

### 1. 功能测试
#### 1.1 单元测试
- 接口测试
- 组件测试
- 工具函数测试
- 状态管理测试

#### 1.2 集成测试
- 模块集成测试
- 系统集成测试
- 接口集成测试
- 数据库集成测试

#### 1.3 系统测试
- 功能测试
- 性能测试
- 安全测试
- 兼容性测试

### 2. 自动化测试
#### 2.1 UI自动化
- 页面自动化
- 表单自动化
- 流程自动化
- 异常自动化

#### 2.2 接口自动化
- 接口测试
- 接口性能
- 接口安全
- 接口兼容性

### 3. 性能测试
#### 3.1 响应时间测试
- 页面加载时间
- 接口响应时间
- 操作响应时间
- 数据处理时间

#### 3.2 并发测试
- 单接口并发
- 多接口并发
- 系统并发
- 压力测试

## 上线部署

### 1. 上线准备
#### 1.1 代码审查
- 代码规范
- 安全漏洞
- 性能问题
- 兼容性问题

#### 1.2 测试验收
- 功能验收
- 性能验收
- 安全验收
- 用户验收

### 2. 部署流程
#### 2.1 环境部署
- 开发环境
- 测试环境
- 预发布环境
- 生产环境

#### 2.2 版本发布
- 灰度发布
- 全量发布
- 版本回滚
- 版本管理

### 3. 上线监控
#### 3.1 性能监控
- 页面性能
- 接口性能
- 系统性能
- 数据库性能

#### 3.2 错误监控
- 前端错误
- 后端错误
- 数据库错误
- 系统错误

## 运营维护

### 1. 日常维护
#### 1.1 系统监控
- 服务器监控
- 数据库监控
- 应用监控
- 网络监控

#### 1.2 数据备份
- 自动备份
- 手动备份
- 备份恢复
- 备份清理

#### 1.3 问题处理
- 故障排查
- 问题修复
- 性能优化
- 安全加固

### 2. 版本迭代
#### 2.1 需求收集
- 用户反馈
- 市场调研
- 竞品分析
- 内部需求

#### 2.2 版本规划
- 功能规划
- 时间规划
- 资源规划
- 风险评估

#### 2.3 版本发布
- 开发测试
- 灰度发布
- 全量发布
- 版本回滚

### 3. 客户服务
#### 3.1 客服支持
- 在线客服
- 电话客服
- 微信客服
- 邮件客服

#### 3.2 客户培训
- 操作培训
- 功能培训
- 技巧培训
- 案例分析

## 扩展规划

### 1. 功能扩展
#### 1.1 新功能开发
- AI智能助手
- 数据分析
- 自动化办公
- 区块链存证

#### 1.2 功能优化
- 性能优化
- 体验优化
- 安全优化
- 兼容性优化

### 2. 平台扩展
#### 2.1 多端扩展
- 移动端
- 小程序
- 平板端
- 智能设备

#### 2.2 跨平台扩展
- 微信生态
- 支付宝生态
- 钉钉生态
- 企业微信生态

### 3. 业务扩展
#### 3.1 业务场景扩展
- 法律咨询
- 法律培训
- 法律电商
- 法律研究

#### 3.2 业务地域扩展
- 本地业务
- 区域业务
- 全国业务
- 国际业务
```
用户输入账号密码
    ↓
前端验证表单
    ↓
调用登录API
    ↓
后端验证并返回token
    ↓
存储token到localStorage
    ↓
获取用户信息和权限
    ↓
生成动态路由
    ↓
跳转到首页
```

#### 1.2 登录实现
```typescript
// views/login/index.vue
<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref();
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  await loginFormRef.value.validate();
  
  loading.value = true;
  try {
    await userStore.login(loginForm);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
    ElMessage.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>
```

#### 1.3 权限管理
```typescript
// stores/permission.ts
import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';

interface PermissionState {
  routes: RouteRecordRaw[];
  addRoutes: RouteRecordRaw[];
  permissions: string[];
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    permissions: []
  }),

  getters: {
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission);
    }
  },

  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.addRoutes = routes;
      this.routes = routes;
    },

    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },

    generateRoutes(permissions: string[]) {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions);
      this.setRoutes(accessedRoutes);
      this.setPermissions(permissions);
      return accessedRoutes;
    }
  }
});

function filterAsyncRoutes(routes: RouteRecordRaw[], permissions: string[]) {
  const res: RouteRecordRaw[] = [];
  
  routes.forEach(route => {
    const tmp = { ...route };
    if (hasPermission(permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions);
      }
      res.push(tmp);
    }
  });
  
  return res;
}

function hasPermission(permissions: string[], route: RouteRecordRaw) {
  if (route.meta?.permission) {
    return permissions.includes(route.meta.permission as string);
  }
  return true;
}
```

### 2. 仪表盘模块

#### 2.1 数据概览
```typescript
// views/dashboard/index.vue
<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <stat-card title="总案件数" :value="statistics.totalCases" icon="document" />
      </el-col>
      <el-col :span="6">
        <stat-card title="进行中" :value="statistics.activeCases" icon="clock" />
      </el-col>
      <el-col :span="6">
        <stat-card title="本月收入" :value="statistics.monthlyRevenue" icon="money" />
      </el-col>
      <el-col :span="6">
        <stat-card title="客户总数" :value="statistics.totalClients" icon="user" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <chart-card title="案件趋势">
          <trend-chart :data="statistics.caseTrend" />
        </chart-card>
      </el-col>
      <el-col :span="8">
        <chart-card title="案件类型分布">
          <pie-chart :data="statistics.caseTypeDistribution" />
        </chart-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <chart-card title="律师业绩排行">
          <bar-chart :data="statistics.lawyerPerformance" />
        </chart-card>
      </el-col>
      <el-col :span="12">
        <recent-cases :cases="recentCases" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStatistics, getRecentCases } from '@/api/statistics';

const statistics = ref({
  totalCases: 0,
  activeCases: 0,
  monthlyRevenue: 0,
  totalClients: 0,
  caseTrend: [],
  caseTypeDistribution: [],
  lawyerPerformance: []
});

const recentCases = ref([]);

onMounted(async () => {
  await loadStatistics();
  await loadRecentCases();
});

const loadStatistics = async () => {
  try {
    const res = await getStatistics();
    statistics.value = res.data;
  } catch (error) {
    console.error('加载统计数据失败', error);
  }
};

const loadRecentCases = async () => {
  try {
    const res = await getRecentCases();
    recentCases.value = res.data;
  } catch (error) {
    console.error('加载最近案件失败', error);
  }
};
</script>
```

#### 2.2 图表组件
```typescript
// components/chart/TrendChart.vue
<template>
  <div ref="chartRef" class="trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

interface Props {
  data: any[];
}

const props = defineProps<Props>();
const chartRef = ref();
let chart: echarts.ECharts | null = null;

onMounted(() => {
  initChart();
});

watch(() => props.data, () => {
  updateChart();
}, { deep: true });

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    updateChart();
    
    window.addEventListener('resize', () => {
      chart?.resize();
    });
  }
};

const updateChart = () => {
  if (!chart) return;

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增案件', '完成案件']
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增案件',
        type: 'line',
        data: props.data.map(item => item.newCases),
        smooth: true
      },
      {
        name: '完成案件',
        type: 'line',
        data: props.data.map(item => item.completedCases),
        smooth: true
      }
    ]
  };

  chart.setOption(option);
};
</script>
```

### 3. 案件管理模块

#### 3.1 案件列表
```typescript
// views/case/index.vue
<template>
  <div class="case-container">
    <el-card>
      <el-form :model="queryParams" inline>
        <el-form-item label="案件标题">
          <el-input v-model="queryParams.title" placeholder="请输入案件标题" />
        </el-form-item>
        <el-form-item label="案件状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="案件类型">
          <el-select v-model="queryParams.type" placeholder="请选择类型">
            <el-option label="全部" value="" />
            <el-option label="民事案件" value="civil" />
            <el-option label="刑事案件" value="criminal" />
            <el-option label="行政案件" value="administrative" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="caseList" v-loading="loading">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="title" label="案件标题" min-width="200" />
        <el-table-column prop="type" label="案件类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="clientName" label="客户" width="120" />
        <el-table-column prop="lawyerName" label="负责律师" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadCaseList"
        @current-change="loadCaseList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCaseList, deleteCase } from '@/api/case';

const router = useRouter();

const loading = ref(false);
const caseList = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  title: '',
  status: '',
  type: ''
});

onMounted(() => {
  loadCaseList();
});

const loadCaseList = async () => {
  loading.value = true;
  try {
    const res = await getCaseList(queryParams);
    caseList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    ElMessage.error('加载案件列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.page = 1;
  loadCaseList();
};

const handleReset = () => {
  queryParams.title = '';
  queryParams.status = '';
  queryParams.type = '';
  handleQuery();
};

const handleView = (row: any) => {
  router.push(`/case/detail/${row.id}`);
};

const handleEdit = (row: any) => {
  router.push(`/case/edit/${row.id}`);
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该案件吗？', '提示', {
      type: 'warning'
    });
    
    await deleteCase(row.id);
    ElMessage.success('删除成功');
    loadCaseList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const getTypeTagType = (type: string) => {
  const map: Record<string, any> = {
    civil: 'primary',
    criminal: 'danger',
    administrative: 'warning'
  };
  return map[type] || 'info';
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    civil: '民事案件',
    criminal: '刑事案件',
    administrative: '行政案件'
  };
  return map[type] || type;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  };
  return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '进行中',
    completed: '已完成'
  };
  return map[status] || status;
};
</script>
```

#### 3.2 案件详情
```typescript
// views/case/detail.vue
<template>
  <div class="case-detail">
    <el-page-header @back="goBack" title="返回" />
    
    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>{{ caseInfo.title }}</span>
          <el-tag :type="getStatusTagType(caseInfo.status)">
            {{ getStatusLabel(caseInfo.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="案件编号">{{ caseInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="案件类型">{{ getTypeLabel(caseInfo.type) }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ caseInfo.clientName }}</el-descriptions-item>
        <el-descriptions-item label="负责律师">{{ caseInfo.lawyerName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ caseInfo.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ caseInfo.deadline }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityTagType(caseInfo.priority)">
            {{ getPriorityLabel(caseInfo.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="费用">{{ caseInfo.fee }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>案件描述</el-divider>
      <div class="case-description">{{ caseInfo.description }}</div>

      <el-divider>案件进度</el-divider>
      <el-timeline>
        <el-timeline-item
          v-for="item in caseInfo.progress"
          :key="item.id"
          :timestamp="item.createdAt"
          :type="getTimelineType(item.status)"
        >
          {{ item.content }}
        </el-timeline-item>
      </el-timeline>

      <el-divider>相关文档</el-divider>
      <el-table :data="caseInfo.documents">
        <el-table-column prop="name" label="文档名称" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="uploadedBy" label="上传人" width="120" />
        <el-table-column prop="uploadedAt" label="上传时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button link type="primary" @click="handlePreview(row)">预览</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider>操作</el-divider>
      <div class="case-actions">
        <el-button type="primary" @click="handleUpdateStatus">更新状态</el-button>
        <el-button @click="handleAddProgress">添加进度</el-button>
        <el-button @click="handleUploadDocument">上传文档</el-button>
        <el-button @click="handleEdit">编辑案件</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getCaseDetail, updateCaseStatus } from '@/api/case';

const route = useRoute();
const router = useRouter();

const caseInfo = ref({});

onMounted(() => {
  loadCaseDetail();
});

const loadCaseDetail = async () => {
  const caseId = route.params.id;
  try {
    const res = await getCaseDetail(caseId);
    caseInfo.value = res.data;
  } catch (error) {
    ElMessage.error('加载案件详情失败');
  }
};

const goBack = () => {
  router.back();
};

const handleUpdateStatus = async () => {
  try {
    await updateCaseStatus(caseInfo.value.id, { status: 'processing' });
    ElMessage.success('状态更新成功');
    loadCaseDetail();
  } catch (error) {
    ElMessage.error('状态更新失败');
  }
};

const handleAddProgress = () => {
  router.push(`/case/progress/${caseInfo.value.id}`);
};

const handleUploadDocument = () => {
  router.push(`/document/upload?caseId=${caseInfo.value.id}`);
};

const handleEdit = () => {
  router.push(`/case/edit/${caseInfo.value.id}`);
};

const handleDownload = (row: any) => {
  window.open(row.url);
};

const handlePreview = (row: any) => {
  window.open(row.url, '_blank');
};

const getStatusTagType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  };
  return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '进行中',
    completed: '已完成'
  };
  return map[status] || status;
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    civil: '民事案件',
    criminal: '刑事案件',
    administrative: '行政案件'
  };
  return map[type] || type;
};

const getPriorityTagType = (priority: string) => {
  const map: Record<string, any> = {
    low: 'info',
    normal: 'warning',
    high: 'danger'
  };
  return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    low: '低',
    normal: '中',
    high: '高'
  };
  return map[priority] || priority;
};

const getTimelineType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  };
  return map[status] || 'primary';
};
</script>
```

#### 3.3 创建/编辑案件
```typescript
// views/case/form.vue
<template>
  <div class="case-form">
    <el-card>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="案件标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入案件标题" />
        </el-form-item>

        <el-form-item label="案件类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择案件类型">
            <el-option label="民事案件" value="civil" />
            <el-option label="刑事案件" value="criminal" />
            <el-option label="行政案件" value="administrative" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户" prop="clientId">
          <el-select v-model="formData.clientId" placeholder="请选择客户" filterable>
            <el-option
              v-for="client in clientList"
              :key="client.id"
              :label="client.name"
              :value="client.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="负责律师" prop="lawyerId">
          <el-select v-model="formData.lawyerId" placeholder="请选择律师" filterable>
            <el-option
              v-for="lawyer in lawyerList"
              :key="lawyer.id"
              :label="lawyer.name"
              :value="lawyer.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="formData.priority">
            <el-radio label="low">低</el-radio>
            <el-radio label="normal">中</el-radio>
            <el-radio label="high">高</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="formData.deadline"
            type="date"
            placeholder="请选择截止时间"
          />
        </el-form-item>

        <el-form-item label="费用" prop="fee">
          <el-input-number v-model="formData.fee" :min="0" :precision="2" />
        </el-form-item>

        <el-form-item label="案件描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入案件描述"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { createCase, updateCase, getCaseDetail } from '@/api/case';
import { getClientList } from '@/api/client';
import { getLawyerList } from '@/api/user';

const route = useRoute();
const router = useRouter();

const formRef = ref();
const loading = ref(false);
const isEdit = ref(false);
const clientList = ref([]);
const lawyerList = ref([]);

const formData = reactive({
  id: '',
  title: '',
  type: '',
  clientId: '',
  lawyerId: '',
  priority: 'normal',
  deadline: '',
  fee: 0,
  description: ''
});

const formRules = {
  title: [{ required: true, message: '请输入案件标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择案件类型', trigger: 'change' }],
  clientId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  lawyerId: [{ required: true, message: '请选择律师', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
};

onMounted(async () => {
  await loadClientList();
  await loadLawyerList();
  
  const caseId = route.params.id;
  if (caseId) {
    isEdit.value = true;
    await loadCaseDetail(caseId);
  }
});

const loadClientList = async () => {
  try {
    const res = await getClientList({ pageSize: 100 });
    clientList.value = res.data.list;
  } catch (error) {
    console.error('加载客户列表失败', error);
  }
};

const loadLawyerList = async () => {
  try {
    const res = await getLawyerList({ pageSize: 100 });
    lawyerList.value = res.data.list;
  } catch (error) {
    console.error('加载律师列表失败', error);
  }
};

const loadCaseDetail = async (caseId: string) => {
  try {
    const res = await getCaseDetail(caseId);
    Object.assign(formData, res.data);
  } catch (error) {
    ElMessage.error('加载案件详情失败');
  }
};

const handleSubmit = async () => {
  await formRef.value.validate();
  
  loading.value = true;
  try {
    if (isEdit.value) {
      await updateCase(formData.id, formData);
      ElMessage.success('更新成功');
    } else {
      await createCase(formData);
      ElMessage.success('创建成功');
    }
    router.push('/case');
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>
```

### 4. 客户管理模块

#### 4.1 客户列表
```typescript
// views/client/index.vue
<template>
  <div class="client-container">
    <el-card>
      <div class="toolbar">
        <el-form :model="queryParams" inline>
          <el-form-item label="客户名称">
            <el-input v-model="queryParams.name" placeholder="请输入客户名称" />
          </el-form-item>
          <el-form-item label="客户类型">
            <el-select v-model="queryParams.type" placeholder="请选择类型">
              <el-option label="全部" value="" />
              <el-option label="个人" value="individual" />
              <el-option label="企业" value="enterprise" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleAdd">新增客户</el-button>
      </div>

      <el-table :data="clientList" v-loading="loading">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="客户名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'enterprise' ? 'primary' : 'success'">
              {{ row.type === 'enterprise' ? '企业' : '个人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="caseCount" label="案件数" width="80" />
        <el-table-column prop="totalFee" label="总费用" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleFollow(row)">跟进</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadClientList"
        @current-change="loadClientList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getClientList, deleteClient } from '@/api/client';

const router = useRouter();

const loading = ref(false);
const clientList = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  type: ''
});

onMounted(() => {
  loadClientList();
});

const loadClientList = async () => {
  loading.value = true;
  try {
    const res = await getClientList(queryParams);
    clientList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    ElMessage.error('加载客户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.page = 1;
  loadClientList();
};

const handleReset = () => {
  queryParams.name = '';
  queryParams.type = '';
  handleQuery();
};

const handleAdd = () => {
  router.push('/client/add');
};

const handleView = (row: any) => {
  router.push(`/client/detail/${row.id}`);
};

const handleEdit = (row: any) => {
  router.push(`/client/edit/${row.id}`);
};

const handleFollow = (row: any) => {
  router.push(`/client/follow/${row.id}`);
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      type: 'warning'
    });
    
    await deleteClient(row.id);
    ElMessage.success('删除成功');
    loadClientList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};
</script>
```

### 5. 财务管理模块

#### 5.1 财务概览
```typescript
// views/finance/index.vue
<template>
  <div class="finance-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <stat-card title="总收入" :value="statistics.totalIncome" icon="money" />
      </el-col>
      <el-col :span="6">
        <stat-card title="总支出" :value="statistics.totalExpense" icon="wallet" />
      </el-col>
      <el-col :span="6">
        <stat-card title="本月收入" :value="statistics.monthlyIncome" icon="calendar" />
      </el-col>
      <el-col :span="6">
        <stat-card title="净利润" :value="statistics.netProfit" icon="trend" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <chart-card title="收支趋势">
          <finance-trend-chart :data="statistics.trend" />
        </chart-card>
      </el-col>
      <el-col :span="8">
        <chart-card title="收支构成">
          <pie-chart :data="statistics.composition" />
        </chart-card>
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>财务记录</span>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <el-table :data="financeList" v-loading="loading">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="caseId" label="关联案件" width="120" />
        <el-table-column prop="description" label="说明" min-width="200" />
        <el-table-column prop="createdAt" label="时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadFinanceList"
        @current-change="loadFinanceList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getFinanceStatistics, getFinanceList } from '@/api/finance';

const router = useRouter();

const loading = ref(false);
const financeList = ref([]);
const total = ref(0);
const statistics = ref({
  totalIncome: 0,
  totalExpense: 0,
  monthlyIncome: 0,
  netProfit: 0,
  trend: [],
  composition: []
});

const queryParams = reactive({
  page: 1,
  pageSize: 10
});

onMounted(async () => {
  await loadStatistics();
  await loadFinanceList();
});

const loadStatistics = async () => {
  try {
    const res = await getFinanceStatistics();
    statistics.value = res.data;
  } catch (error) {
    console.error('加载统计数据失败', error);
  }
};

const loadFinanceList = async () => {
  loading.value = true;
  try {
    const res = await getFinanceList(queryParams);
    financeList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    ElMessage.error('加载财务记录失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  router.push('/finance/add');
};

const handleView = (row: any) => {
  router.push(`/finance/detail/${row.id}`);
};

const handleEdit = (row: any) => {
  router.push(`/finance/edit/${row.id}`);
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
      type: 'warning'
    });
    
    await deleteFinance(row.id);
    ElMessage.success('删除成功');
    loadFinanceList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};
</script>
```

### 6. 团队管理模块

#### 6.1 团队成员管理
```typescript
// views/team/index.vue
<template>
  <div class="team-container">
    <el-card>
      <div class="toolbar">
        <el-form :model="queryParams" inline>
          <el-form-item label="姓名">
            <el-input v-model="queryParams.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="queryParams.role" placeholder="请选择角色">
              <el-option label="全部" value="" />
              <el-option label="律师" value="lawyer" />
              <el-option label="助理" value="assistant" />
              <el-option label="行政" value="admin" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleAdd">新增成员</el-button>
      </div>

      <el-table :data="memberList" v-loading="loading">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="caseCount" label="案件数" width="80" />
        <el-table-column prop="performance" label="业绩" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleAssign(row)">分配</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadMemberList"
        @current-change="loadMemberList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMemberList, deleteMember } from '@/api/team';

const router = useRouter();

const loading = ref(false);
const memberList = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  role: ''
});

onMounted(() => {
  loadMemberList();
});

const loadMemberList = async () => {
  loading.value = true;
  try {
    const res = await getMemberList(queryParams);
    memberList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    ElMessage.error('加载成员列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.page = 1;
  loadMemberList();
};

const handleReset = () => {
  queryParams.name = '';
  queryParams.role = '';
  handleQuery();
};

const handleAdd = () => {
  router.push('/team/add');
};

const handleView = (row: any) => {
  router.push(`/team/detail/${row.id}`);
};

const handleEdit = (row: any) => {
  router.push(`/team/edit/${row.id}`);
};

const handleAssign = (row: any) => {
  router.push(`/team/assign/${row.id}`);
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该成员吗？', '提示', {
      type: 'warning'
    });
    
    await deleteMember(row.id);
    ElMessage.success('删除成功');
    loadMemberList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const getRoleTagType = (role: string) => {
  const map: Record<string, any> = {
    lawyer: 'primary',
    assistant: 'success',
    admin: 'warning'
  };
  return map[role] || 'info';
};

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    lawyer: '律师',
    assistant: '助理',
    admin: '行政'
  };
  return map[role] || role;
};
</script>
```

### 7. 系统管理模块

#### 7.1 用户管理
```typescript
// views/system/user/index.vue
<template>
  <div class="user-container">
    <el-card>
      <div class="toolbar">
        <el-form :model="queryParams" inline>
          <el-form-item label="用户名">
            <el-input v-model="queryParams.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="queryParams.role" placeholder="请选择角色">
              <el-option label="全部" value="" />
              <el-option label="超级管理员" value="super_admin" />
              <el-option label="管理员" value="admin" />
              <el-option label="律师" value="lawyer" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
      </div>

      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadUserList"
        @current-change="loadUserList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getUserList, deleteUser, resetPassword } from '@/api/system';

const router = useRouter();

const loading = ref(false);
const userList = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  username: '',
  role: ''
});

onMounted(() => {
  loadUserList();
});

const loadUserList = async () => {
  loading.value = true;
  try {
    const res = await getUserList(queryParams);
    userList.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.page = 1;
  loadUserList();
};

const handleReset = () => {
  queryParams.username = '';
  queryParams.role = '';
  handleQuery();
};

const handleAdd = () => {
  router.push('/system/user/add');
};

const handleView = (row: any) => {
  router.push(`/system/user/detail/${row.id}`);
};

const handleEdit = (row: any) => {
  router.push(`/system/user/edit/${row.id}`);
};

const handleResetPassword = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要重置该用户的密码吗？', '提示', {
      type: 'warning'
    });
    
    await resetPassword(row.id);
    ElMessage.success('密码重置成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败');
    }
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    });
    
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    loadUserList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const getRoleTagType = (role: string) => {
  const map: Record<string, any> = {
    super_admin: 'danger',
    admin: 'warning',
    lawyer: 'primary'
  };
  return map[role] || 'info';
};

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    lawyer: '律师'
  };
  return map[role] || role;
};
</script>
```

## 状态管理

### Pinia Store
```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { login, logout, getUserInfo } from '@/api/user';

interface UserState {
  token: string;
  userInfo: any;
  permissions: string[];
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    permissions: []
  }),

  getters: {
    isLogin: (state) => !!state.token,
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission);
    }
  },

  actions: {
    async login(loginForm: any) {
      const res = await login(loginForm);
      this.token = res.data.token;
      this.userInfo = res.data.userInfo;
      this.permissions = res.data.permissions;
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
    },

    async getUserInfo() {
      const res = await getUserInfo();
      this.userInfo = res.data;
      this.permissions = res.data.permissions;
    },

    async logout() {
      await logout();
      this.token = '';
      this.userInfo = null;
      this.permissions = [];
      
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  }
});
```

## 路由配置

### 路由守卫
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { usePermissionStore } from '@/stores/permission';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: () => import('@/layouts/BasicLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '仪表盘', icon: 'dashboard' }
        }
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  if (to.path === '/login') {
    next();
    return;
  }

  if (!userStore.isLogin) {
    next('/login');
    return;
  }

  if (!userStore.userInfo) {
    await userStore.getUserInfo();
  }

  if (permissionStore.routes.length === 0) {
    const routes = await permissionStore.generateRoutes(userStore.permissions);
    routes.forEach(route => {
      router.addRoute('Layout', route);
    });
    next({ ...to, replace: true });
  } else {
    next();
  }
});

export default router;
```

## 请求封装

### Axios配置
```typescript
// utils/request.ts
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
});

request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    
    if (code === 200) {
      return data;
    } else if (code === 401) {
      const userStore = useUserStore();
      userStore.logout();
      window.location.href = '/login';
      return Promise.reject(new Error('未授权'));
    } else {
      ElMessage.error(message || '请求失败');
      return Promise.reject(new Error(message));
    }
  },
  (error) => {
    ElMessage.error(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default request;
```

## 性能优化

### 1. 路由懒加载
```typescript
const routes = [
  {
    path: '/case',
    component: () => import('@/layouts/BasicLayout.vue'),
    children: [
      {
        path: 'list',
        component: () => import('@/views/case/index.vue')
      }
    ]
  }
];
```

### 2. 组件懒加载
```typescript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
);
```

### 3. 虚拟滚动
```typescript
import { ElTableV2 } from 'element-plus';

<el-table-v2
  :columns="columns"
  :data="data"
  :width="700"
  :height="400"
  fixed
/>
```

## 部署配置

### 环境变量
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.example.com/api
```

### 构建配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    }
  }
});
```

---

**文档版本**：v1.0  
**创建时间**：2025年12月29日  
**维护团队**：LawTech Team
