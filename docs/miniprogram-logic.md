# 微信小程序逻辑思路文档

## 概述

微信小程序作为律师事务所智能管理系统的重要前端端点，主要服务于律师移动办公和客户服务两大场景。本文档详细阐述小程序的整体架构、功能模块、业务流程和技术实现。

## 用户角色

### 1. 律师用户
- 案件管理：查看、更新案件进度
- 客户沟通：与客户实时沟通
- 文档处理：上传、下载案件文档
- 日程管理：查看工作安排
- 消息通知：接收系统推送

### 2. 客户用户
- 案件查询：查看案件进度
- 消息沟通：与律师沟通
- 文档查看：查看案件相关文档
- 费用查询：查看费用明细
- 预约服务：在线预约律师

## 整体架构

### 页面结构
```
pages/
├── index/              # 首页
│   ├── index.wxml
│   ├── index.wxss
│   ├── index.js
│   └── index.json
├── cases/              # 案件管理
│   ├── list/          # 案件列表
│   ├── detail/        # 案件详情
│   └── create/        # 创建案件
├── clients/            # 客户管理
│   ├── list/          # 客户列表
│   ├── detail/        # 客户详情
│   └── follow/        # 跟进记录
├── documents/          # 文档管理
│   ├── list/          # 文档列表
│   ├── upload/        # 上传文档
│   └── preview/       # 预览文档
├── schedule/           # 日程管理
│   ├── calendar/      # 日历视图
│   └── task/          # 任务列表
├── messages/           # 消息中心
│   ├── list/          # 消息列表
│   └── detail/        # 消息详情
├── profile/            # 个人中心
│   ├── info/          # 个人信息
│   ├── settings/      # 设置
│   └── about/         # 关于
└── auth/               # 认证相关
    ├── login/         # 登录
    └── register/      # 注册
```

### 目录结构
```
miniprogram/
├── pages/              # 页面文件
├── components/         # 自定义组件
│   ├── case-card/     # 案件卡片
│   ├── client-avatar/ # 客户头像
│   ├── status-badge/  # 状态标签
│   ├── file-upload/   # 文件上传
│   └── message-item/  # 消息项
├── utils/              # 工具函数
│   ├── request.js     # 网络请求
│   ├── storage.js     # 本地存储
│   ├── auth.js        # 认证工具
│   └── format.js      # 格式化工具
├── api/                # API接口
│   ├── user.js        # 用户接口
│   ├── case.js        # 案件接口
│   ├── client.js      # 客户接口
│   ├── document.js    # 文档接口
│   └── message.js     # 消息接口
├── store/              # 状态管理
│   ├── user.js        # 用户状态
│   ├── case.js        # 案件状态
│   └── app.js         # 应用状态
├── config/             # 配置文件
│   ├── index.js       # 基础配置
│   └── api.js         # API配置
├── styles/             # 样式文件
│   ├── common.wxss    # 通用样式
│   └── variables.wxss # 样式变量
├── app.js              # 应用入口
├── app.json            # 应用配置
└── app.wxss            # 全局样式
```

## 核心功能模块

### 1. 认证模块

#### 1.1 登录流程
##### 1.1.1 微信授权登录
- 静默授权获取用户基本信息
- 主动授权获取详细用户信息
- 授权失败处理与重试机制

##### 1.1.2 账号密码登录
- 账号密码验证
- 验证码登录支持
- 忘记密码功能

##### 1.1.3 登录状态管理
- Token本地存储
- 自动登录
- 登录状态检查

#### 1.2 权限验证
##### 1.2.1 角色权限控制
- 律师角色权限
- 客户角色权限
- 管理员角色权限

##### 1.2.2 页面权限控制
- 登录拦截
- 角色路由过滤
- 按钮级权限控制

#### 1.3 注册流程
##### 1.3.1 律师注册
- 基本信息填写
- 资质认证
- 审核流程

##### 1.3.2 客户注册
- 手机号注册
- 微信快速注册
- 信息完善

### 2. 案件管理模块

#### 2.1 案件列表
##### 2.1.1 案件筛选
- 按状态筛选
- 按类型筛选
- 按优先级筛选
- 按时间筛选

##### 2.1.2 案件搜索
- 关键词搜索
- 高级搜索
- 搜索历史

##### 2.1.3 案件排序
- 按创建时间排序
- 按更新时间排序
- 按优先级排序

##### 2.1.4 分页加载
- 下拉刷新
- 上拉加载更多
- 加载状态管理

#### 2.2 案件详情
##### 2.2.1 案件信息展示
- 基本信息
- 案件进度
- 相关文档
- 参与人员

##### 2.2.2 案件操作
- 状态更新
- 进度记录
- 文档上传
- 客户沟通

##### 2.2.3 案件跟踪
- 进度提醒
- 截止日期预警
- 任务分配

#### 2.3 创建案件
##### 2.3.1 案件基本信息
- 案件标题
- 案件类型
- 案件描述
- 客户选择

##### 2.3.2 案件配置
- 优先级设置
- 截止日期
- 参与人员
- 案件标签

##### 2.3.3 案件提交
- 表单验证
- 提交审核
- 草稿保存

#### 2.4 案件编辑
##### 2.4.1 信息修改
- 基本信息编辑
- 状态变更
- 文档管理

##### 2.4.2 版本管理
- 历史版本查看
- 版本对比
- 版本恢复

### 3. 客户管理模块

#### 3.1 客户列表
##### 3.1.1 客户筛选
- 按类型筛选
- 按状态筛选
- 按时间筛选

##### 3.1.2 客户搜索
- 关键词搜索
- 高级搜索
- 搜索历史

##### 3.1.3 客户排序
- 按创建时间排序
- 按更新时间排序
- 按活跃度排序

#### 3.2 客户详情
##### 3.2.1 客户信息展示
- 基本信息
- 案件历史
- 沟通记录
- 跟进记录

##### 3.2.2 客户操作
- 信息编辑
- 沟通记录
- 跟进记录
- 案件创建

##### 3.2.3 客户分析
- 案件统计
- 沟通频率
- 满意度评价

#### 3.3 客户跟进
##### 3.3.1 跟进记录
- 跟进类型
- 跟进内容
- 跟进时间
- 跟进结果

##### 3.3.2 跟进提醒
- 跟进计划
- 提醒设置
- 跟进状态

### 4. 文档管理模块

#### 4.1 文档上传
##### 4.1.1 文件选择
- 本地文件选择
- 拍照上传
- 微信文件选择

##### 4.1.2 文件管理
- 文件预览
- 文件删除
- 文件重命名

##### 4.1.3 上传设置
- 分块上传
- 断点续传
- 上传进度

#### 4.2 文档预览
##### 4.2.1 文档查看
- 在线预览
- 下载查看
- 分享查看

##### 4.2.2 文档操作
- 收藏
- 点赞
- 评论

#### 4.3 文档分类
##### 4.3.1 分类管理
- 分类创建
- 分类编辑
- 分类删除

##### 4.3.2 分类筛选
- 按分类筛选
- 按标签筛选
- 按时间筛选

### 5. 消息模块

#### 5.1 消息列表
##### 5.1.1 消息分类
- 系统消息
- 客户消息
- 团队消息

##### 5.1.2 消息筛选
- 按类型筛选
- 按状态筛选
- 按时间筛选

##### 5.1.3 消息操作
- 标记已读
- 标记未读
- 删除消息
- 置顶消息

#### 5.2 消息详情
##### 5.2.1 消息展示
- 文本消息
- 图片消息
- 文件消息
- 语音消息

##### 5.2.2 消息操作
- 回复消息
- 转发消息
- 收藏消息
- 举报消息

#### 5.3 实时通讯
##### 5.3.1 聊天功能
- 文本聊天
- 图片发送
- 文件发送
- 语音聊天

##### 5.3.2 聊天设置
- 聊天背景
- 字体大小
- 消息提醒
- 聊天记录

### 6. 日程管理模块

#### 6.1 日历视图
##### 6.1.1 视图切换
- 日视图
- 周视图
- 月视图

##### 6.1.2 日程展示
- 今日日程
- 明日日程
- 本周日程

##### 6.1.3 日程操作
- 新建日程
- 编辑日程
- 删除日程
- 分享日程

#### 6.2 任务列表
##### 6.2.1 任务筛选
- 按状态筛选
- 按优先级筛选
- 按时间筛选

##### 6.2.2 任务操作
- 任务标记完成
- 任务延期
- 任务分配
- 任务提醒

#### 6.3 日程提醒
##### 6.3.1 提醒设置
- 提前提醒
- 重复提醒
- 提醒方式

##### 6.3.2 提醒管理
- 提醒历史
- 提醒统计
- 提醒设置

### 7. 个人中心模块

#### 7.1 个人信息
##### 7.1.1 信息展示
- 基本信息
- 头像设置
- 联系方式

##### 7.1.2 信息编辑
- 信息修改
- 密码修改
- 实名认证

#### 7.2 设置
##### 7.2.1 通用设置
- 主题设置
- 字体设置
- 语言设置

##### 7.2.2 消息设置
- 消息提醒
- 声音设置
- 震动设置

##### 7.2.3 隐私设置
- 隐私权限
- 位置权限
- 相机权限

#### 7.3 关于
##### 7.3.1 应用信息
- 版本信息
- 开发者信息
- 联系方式

##### 7.3.2 帮助中心
- 使用指南
- 常见问题
- 意见反馈

### 8. 统计分析模块

#### 8.1 案件统计
##### 8.1.1 案件数量统计
- 按时间统计
- 按类型统计
- 按状态统计

##### 8.1.2 案件进度统计
- 平均办理时长
- 超时案件统计
- 结案率统计

#### 8.2 工作统计
##### 8.2.1 工作量统计
- 案件办理数量
- 客户沟通次数
- 文档处理数量

##### 8.2.2 工作效率统计
- 平均响应时间
- 任务完成率
- 满意度评价

#### 8.3 财务统计
##### 8.3.1 收入统计
- 案件收入
- 咨询收入
- 其他收入

##### 8.3.2 支出统计
- 案件支出
- 办公支出
- 其他支出

### 9. 系统设置模块

#### 9.1 基础设置
##### 9.1.1 系统信息
- 系统名称
- 系统logo
- 系统描述

##### 9.1.2 版本管理
- 版本更新
- 版本记录
- 版本回滚

#### 9.2 权限设置
##### 9.2.1 角色管理
- 角色创建
- 角色编辑
- 角色删除

##### 9.2.2 权限分配
- 页面权限
- 按钮权限
- 数据权限

#### 9.3 数据管理
##### 9.3.1 数据备份
- 自动备份
- 手动备份
- 备份恢复

##### 9.3.2 数据清理
- 日志清理
- 缓存清理
- 垃圾数据清理

### 10. 帮助与反馈模块

#### 10.1 帮助中心
##### 10.1.1 使用指南
- 新手教程
- 功能介绍
- 操作流程

##### 10.1.2 常见问题
- 登录问题
- 操作问题
- 技术问题

#### 10.2 意见反馈
##### 10.2.1 反馈提交
- 反馈类型
- 反馈内容
- 截图上传

##### 10.2.2 反馈管理
- 反馈查看
- 反馈回复
- 反馈统计

## 业务流程

### 1. 案件办理流程
#### 1.1 案件创建
##### 1.1.1 信息填写
- 基本信息
- 客户信息
- 案件详情

##### 1.1.2 审核提交
- 表单验证
- 提交审核
- 审核结果

#### 1.2 案件办理
##### 1.2.1 案件分配
- 自动分配
- 手动分配
- 分配记录

##### 1.2.2 案件跟进
- 进度记录
- 文档上传
- 客户沟通

#### 1.3 案件结案
##### 1.3.1 结案申请
- 结案材料
- 结案报告
- 审核流程

##### 1.3.2 结案归档
- 案件归档
- 文档归档
- 统计分析

### 2. 客户服务流程
#### 2.1 客户咨询
##### 2.1.1 咨询提交
- 在线咨询
- 电话咨询
- 微信咨询

##### 2.1.2 咨询处理
- 咨询分配
- 咨询回复
- 咨询记录

#### 2.2 客户跟进
##### 2.2.1 跟进计划
- 跟进安排
- 提醒设置
- 跟进记录

##### 2.2.2 跟进反馈
- 反馈收集
- 反馈分析
- 反馈处理

### 3. 财务管理流程
#### 3.1 费用收取
##### 3.1.1 费用计算
- 案件费用
- 咨询费用
- 其他费用

##### 3.1.2 费用收取
- 在线支付
- 线下支付
- 支付记录

#### 3.2 费用结算
##### 3.2.1 费用核算
- 收入核算
- 支出核算
- 利润核算

##### 3.2.2 费用结算
- 律师提成
- 税费计算
- 结算记录

## 技术实现

### 1. 前端技术栈
#### 1.1 框架选择
- 微信小程序原生框架
- uni-app跨平台框架
- Taro跨平台框架

#### 1.2 状态管理
- 原生状态管理
- Redux
- MobX

#### 1.3 网络请求
- wx.request
- axios
- flyio

### 2. 后端技术栈
#### 2.1 服务器框架
- Node.js + Express
- Python + Django
- Java + Spring Boot

#### 2.2 数据库
- MySQL
- MongoDB
- Redis

#### 2.3 缓存
- Redis
- Memcached
- 本地缓存

### 3. 部署架构
#### 3.1 前端部署
- 微信小程序平台
- 云开发
- 传统服务器

#### 3.2 后端部署
- 云服务器
- 容器化部署
- 服务器集群

#### 3.3 数据库部署
- 云数据库
- 本地数据库
- 数据库集群

## 性能优化

### 1. 前端优化
#### 1.1 页面优化
- 图片优化
- 代码压缩
- 懒加载

#### 1.2 网络优化
- 请求合并
- 缓存策略
- CDN加速

### 2. 后端优化
#### 2.1 代码优化
- 算法优化
- 数据库优化
- 缓存优化

#### 2.2 服务器优化
- 负载均衡
- 异步处理
- 分布式架构

## 安全机制

### 1. 数据安全
#### 1.1 数据加密
- 传输加密
- 存储加密
- 敏感信息加密

#### 1.2 数据备份
- 自动备份
- 手动备份
- 异地备份

### 2. 访问安全
#### 2.1 身份认证
- Token认证
- OAuth2认证
- 双因素认证

#### 2.2 权限控制
- 角色权限
- 页面权限
- 数据权限

### 3. 应用安全
#### 3.1 输入验证
- 参数验证
- 防SQL注入
- 防XSS攻击

#### 3.2 日志监控
- 操作日志
- 异常日志
- 性能监控

## 测试方案

### 1. 功能测试
#### 1.1 单元测试
- 接口测试
- 组件测试
- 工具函数测试

#### 1.2 集成测试
- 模块集成测试
- 系统集成测试
- 接口集成测试

#### 1.3 系统测试
- 功能测试
- 性能测试
- 安全测试

### 2. 兼容性测试
#### 2.1 设备兼容性
- 不同机型测试
- 不同系统版本测试
- 不同分辨率测试

#### 2.2 浏览器兼容性
- Chrome
- Firefox
- Safari

### 3. 性能测试
#### 3.1 响应时间测试
- 页面加载时间
- 接口响应时间
- 操作响应时间

#### 3.2 并发测试
- 单接口并发
- 多接口并发
- 系统并发

## 上线部署

### 1. 上线准备
#### 1.1 代码审查
- 代码规范检查
- 安全漏洞扫描
- 性能检查

#### 1.2 测试验收
- 功能验收
- 性能验收
- 安全验收

### 2. 部署流程
#### 2.1 环境部署
- 开发环境
- 测试环境
- 生产环境

#### 2.2 版本发布
- 灰度发布
- 全量发布
- 版本回滚

### 3. 上线监控
#### 3.1 性能监控
- 页面性能
- 接口性能
- 系统性能

#### 3.2 错误监控
- 前端错误
- 后端错误
- 数据库错误

## 运营维护

### 1. 日常维护
#### 1.1 系统监控
- 服务器监控
- 数据库监控
- 应用监控

#### 1.2 数据备份
- 自动备份
- 手动备份
- 备份恢复

### 2. 版本迭代
#### 2.1 需求收集
- 用户反馈
- 市场调研
- 竞品分析

#### 2.2 版本规划
- 功能规划
- 时间规划
- 资源规划

### 3. 客户服务
#### 3.1 客服支持
- 在线客服
- 电话客服
- 微信客服

#### 3.2 客户培训
- 操作培训
- 功能培训
- 技巧培训

## 扩展规划

### 1. 功能扩展
#### 1.1 新功能开发
- AI智能助手
- 数据分析
- 自动化办公

#### 1.2 功能优化
- 性能优化
- 体验优化
- 安全优化

### 2. 平台扩展
#### 2.1 多端扩展
- H5移动端
- PC端
- 其他小程序

#### 2.2 跨平台扩展
- 微信小程序
- 支付宝小程序
- 百度小程序

### 3. 业务扩展
#### 3.1 业务场景扩展
- 法律咨询
- 法律培训
- 法律电商

#### 3.2 业务地域扩展
- 本地业务
- 区域业务
- 全国业务
```
用户打开小程序
    ↓
检查登录状态
    ↓
未登录 → 获取微信授权
    ↓
获取微信code
    ↓
调用后端登录接口
    ↓
后端验证并返回token
    ↓
存储token到本地
    ↓
跳转到首页
```

#### 1.2 登录实现
```javascript
// pages/auth/login/login.js
const api = require('../../../api/index');
const Auth = require('../../../utils/auth');

Page({
  data: {
    loading: false,
    loginType: 'wechat', // wechat 或 account
    account: '',
    password: ''
  },

  onLoad() {
    // 让用户能看到登录页面
  },

  // 切换登录方式
  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      loginType: type,
      account: '',
      password: ''
    });
  },

  // 微信登录
  handleWechatLogin() {
    this.setData({ loading: true });

    wx.login({
      success: (res) => {
        if (res.code) {
          this.loginWithCode(res.code);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },

  async loginWithCode(code) {
    try {
      // 真实API调用
      const res = await api.user.login({ code });
      
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.userInfo);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 账号输入
  handleAccountInput(e) {
    this.setData({ account: e.detail.value });
  },

  // 密码输入
  handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 账号密码登录
  handleAccountLogin() {
    const { account, password } = this.data;
    
    if (!account) {
      wx.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    this.loginWithAccount(account, password);
  },

  async loginWithAccount(account, password) {
    try {
      // 真实API调用
      const res = await api.user.loginWithAccount({ account, password });
      
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('userInfo', res.data.userInfo);

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  }
});
```

#### 1.3 权限验证
```javascript
// utils/auth.js
class Auth {
  static getToken() {
    return wx.getStorageSync('token');
  }

  static getUserInfo() {
    return wx.getStorageSync('userInfo');
  }

  static isLogin() {
    return !!this.getToken();
  }

  static logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.reLaunch({
      url: '/pages/auth/login/login'
    });
  }

  static checkPermission(requiredRole) {
    const userInfo = this.getUserInfo();
    if (!userInfo) return false;
    return userInfo.role === requiredRole;
  }
}

module.exports = Auth;
```

### 2. 案件管理模块

#### 2.1 案件列表
```javascript
// pages/cases/list/list.js
Page({
  data: {
    cases: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    status: 'all',
    keyword: ''
  },

  onLoad(options) {
    const { status } = options;
    if (status) {
      this.setData({ status });
    }
    this.loadCases();
  },

  async loadCases() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const res = await api.case.list({
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: this.data.status,
        keyword: this.data.keyword
      });

      const newCases = res.data.list;
      this.setData({
        cases: [...this.data.cases, ...newCases],
        hasMore: newCases.length >= this.data.pageSize,
        page: this.data.page + 1
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onReachBottom() {
    this.loadCases();
  },

  onPullDownRefresh() {
    this.setData({
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
    wx.stopPullDownRefresh();
  },

  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
  },

  handleFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      status,
      cases: [],
      page: 1,
      hasMore: true
    });
    this.loadCases();
  },

  goToDetail(e) {
    const caseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/cases/detail/detail?id=${caseId}`
    });
  }
});
```

#### 2.2 案件详情
```javascript
// pages/cases/detail/detail.js
Page({
  data: {
    caseInfo: null,
    loading: true,
    activeTab: 'info'
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadCaseDetail(id);
    }
  },

  async loadCaseDetail(caseId) {
    try {
      const res = await api.case.detail(caseId);
      this.setData({
        caseInfo: res.data,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  handleUpdateStatus(e) {
    const status = e.currentTarget.dataset.status;
    wx.showModal({
      title: '确认操作',
      content: `确定要将案件状态更改为${status}吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.updateCaseStatus(status);
        }
      }
    });
  },

  async updateCaseStatus(status) {
    try {
      await api.case.updateStatus(this.data.caseInfo.id, { status });
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });
      this.loadCaseDetail(this.data.caseInfo.id);
    } catch (err) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  handleAddDocument() {
    wx.navigateTo({
      url: `/pages/documents/upload/upload?caseId=${this.data.caseInfo.id}`
    });
  },

  handleContactClient() {
    const { client } = this.data.caseInfo;
    wx.navigateTo({
      url: `/pages/messages/detail/detail?clientId=${client.id}`
    });
  }
});
```

#### 2.3 创建案件
```javascript
// pages/cases/create/create.js
Page({
  data: {
    formData: {
      title: '',
      type: '',
      description: '',
      clientId: '',
      priority: 'normal',
      deadline: ''
    },
    clients: [],
    showClientPicker: false,
    loading: false
  },

  onLoad() {
    this.loadClients();
  },

  async loadClients() {
    try {
      const res = await api.client.list({ pageSize: 100 });
      this.setData({ clients: res.data.list });
    } catch (err) {
      console.error('加载客户列表失败', err);
    }
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  handleSelectClient() {
    this.setData({ showClientPicker: true });
  },

  handleClientSelect(e) {
    const client = e.detail;
    this.setData({
      'formData.clientId': client.id,
      showClientPicker: false
    });
  },

  handleDateChange(e) {
    this.setData({
      'formData.deadline': e.detail.value
    });
  },

  validateForm() {
    const { formData } = this.data;
    if (!formData.title) {
      wx.showToast({ title: '请输入案件标题', icon: 'none' });
      return false;
    }
    if (!formData.type) {
      wx.showToast({ title: '请选择案件类型', icon: 'none' });
      return false;
    }
    if (!formData.clientId) {
      wx.showToast({ title: '请选择客户', icon: 'none' });
      return false;
    }
    return true;
  },

  async handleSubmit() {
    if (!this.validateForm()) return;

    this.setData({ loading: true });

    try {
      await api.case.create(this.data.formData);
      wx.showToast({
        title: '创建成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: err.message || '创建失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

### 3. 客户管理模块

#### 3.1 客户列表
```javascript
// pages/clients/list/list.js
Page({
  data: {
    clients: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    keyword: ''
  },

  onLoad() {
    this.loadClients();
  },

  async loadClients() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const res = await api.client.list({
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword
      });

      const newClients = res.data.list;
      this.setData({
        clients: [...this.data.clients, ...newClients],
        hasMore: newClients.length >= this.data.pageSize,
        page: this.data.page + 1
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onReachBottom() {
    this.loadClients();
  },

  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      clients: [],
      page: 1,
      hasMore: true
    });
    this.loadClients();
  },

  goToDetail(e) {
    const clientId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/clients/detail/detail?id=${clientId}`
    });
  }
});
```

#### 3.2 客户详情
```javascript
// pages/clients/detail/detail.js
Page({
  data: {
    clientInfo: null,
    cases: [],
    followRecords: [],
    loading: true,
    activeTab: 'info'
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadClientDetail(id);
      this.loadClientCases(id);
      this.loadFollowRecords(id);
    }
  },

  async loadClientDetail(clientId) {
    try {
      const res = await api.client.detail(clientId);
      this.setData({
        clientInfo: res.data,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  async loadClientCases(clientId) {
    try {
      const res = await api.case.list({ clientId, pageSize: 5 });
      this.setData({ cases: res.data.list });
    } catch (err) {
      console.error('加载客户案件失败', err);
    }
  },

  async loadFollowRecords(clientId) {
    try {
      const res = await api.client.followRecords(clientId);
      this.setData({ followRecords: res.data });
    } catch (err) {
      console.error('加载跟进记录失败', err);
    }
  },

  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  handleAddFollow() {
    wx.navigateTo({
      url: `/pages/clients/follow/follow?clientId=${this.data.clientInfo.id}`
    });
  },

  handleCall() {
    const { phone } = this.data.clientInfo;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },

  handleSendMessage() {
    wx.navigateTo({
      url: `/pages/messages/detail/detail?clientId=${this.data.clientInfo.id}`
    });
  }
});
```

### 4. 文档管理模块

#### 4.1 文档上传
```javascript
// pages/documents/upload/upload.js
Page({
  data: {
    files: [],
    uploading: false,
    caseId: ''
  },

  onLoad(options) {
    const { caseId } = options;
    if (caseId) {
      this.setData({ caseId });
    }
  },

  handleChooseFile() {
    wx.chooseMessageFile({
      count: 9,
      type: 'file',
      success: (res) => {
        const files = res.tempFiles.map(file => ({
          path: file.path,
          name: file.name,
          size: file.size
        }));
        this.setData({
          files: [...this.data.files, ...files]
        });
      }
    });
  },

  handleRemoveFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = this.data.files.filter((_, i) => i !== index);
    this.setData({ files });
  },

  async handleUpload() {
    if (this.data.files.length === 0) {
      wx.showToast({
        title: '请选择文件',
        icon: 'none'
      });
      return;
    }

    this.setData({ uploading: true });

    try {
      for (const file of this.data.files) {
        await this.uploadFile(file);
      }
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    } finally {
      this.setData({ uploading: false });
    }
  },

  async uploadFile(file) {
    const token = wx.getStorageSync('token');
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${config.apiBaseUrl}/documents/upload`,
        filePath: file.path,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        formData: {
          caseId: this.data.caseId,
          fileName: file.name
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(new Error(data.message));
          }
        },
        fail: reject
      });
    });
  }
});
```

#### 4.2 文档预览
```javascript
// pages/documents/preview/preview.js
Page({
  data: {
    document: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadDocument(id);
    }
  },

  async loadDocument(docId) {
    try {
      const res = await api.document.detail(docId);
      this.setData({
        document: res.data,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleDownload() {
    const { url, name } = this.data.document;
    wx.downloadFile({
      url: url,
      success: (res) => {
        wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          success: () => {
            console.log('打开文档成功');
          }
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
});
```

### 5. 消息模块

#### 5.1 消息列表
```javascript
// pages/messages/list/list.js
Page({
  data: {
    messages: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadMessages();
    this.setupRealtimeMessage();
  },

  async loadMessages() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const res = await api.message.list({
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      const newMessages = res.data.list;
      this.setData({
        messages: [...this.data.messages, ...newMessages],
        hasMore: newMessages.length >= this.data.pageSize,
        page: this.data.page + 1
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  setupRealtimeMessage() {
    wx.onSocketMessage((res) => {
      const message = JSON.parse(res.data);
      this.handleNewMessage(message);
    });
  },

  handleNewMessage(message) {
    const messages = [message, ...this.data.messages];
    this.setData({ messages });
  },

  onReachBottom() {
    this.loadMessages();
  },

  goToDetail(e) {
    const { id, clientId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/messages/detail/detail?id=${id}&clientId=${clientId}`
    });
  }
});
```

#### 5.2 消息详情
```javascript
// pages/messages/detail/detail.js
Page({
  data: {
    messages: [],
    inputText: '',
    loading: false,
    clientId: ''
  },

  onLoad(options) {
    const { id, clientId } = options;
    if (clientId) {
      this.setData({ clientId });
      this.loadMessages(clientId);
      this.connectWebSocket();
    }
  },

  async loadMessages(clientId) {
    try {
      const res = await api.message.history(clientId);
      this.setData({ messages: res.data });
    } catch (err) {
      console.error('加载消息失败', err);
    }
  },

  connectWebSocket() {
    const token = wx.getStorageSync('token');
    wx.connectSocket({
      url: `${config.wsBaseUrl}/ws?token=${token}`
    });

    wx.onSocketOpen(() => {
      console.log('WebSocket连接成功');
    });

    wx.onSocketMessage((res) => {
      const message = JSON.parse(res.data);
      this.handleReceiveMessage(message);
    });

    wx.onSocketError((err) => {
      console.error('WebSocket错误', err);
    });
  },

  handleReceiveMessage(message) {
    const messages = [...this.data.messages, message];
    this.setData({ messages });
    this.scrollToBottom();
  },

  handleInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  async handleSend() {
    const { inputText, clientId } = this.data;
    if (!inputText.trim()) return;

    try {
      await api.message.send({
        clientId,
        content: inputText
      });

      const message = {
        id: Date.now(),
        content: inputText,
        fromSelf: true,
        timestamp: new Date().toISOString()
      };

      this.setData({
        messages: [...this.data.messages, message],
        inputText: ''
      });

      this.scrollToBottom();
    } catch (err) {
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      });
    }
  },

  scrollToBottom() {
    wx.createSelectorQuery()
      .select('#message-list')
      .boundingClientRect()
      .exec((res) => {
        wx.pageScrollTo({
          scrollTop: res[0].height,
          duration: 300
        });
      });
  },

  onUnload() {
    wx.closeSocket();
  }
});
```

### 6. 日程管理模块

#### 6.1 日历视图
```javascript
// pages/schedule/calendar/calendar.js
Page({
  data: {
    currentDate: new Date().getTime(),
    selectedDate: '',
    events: [],
    loading: false
  },

  onLoad() {
    const today = this.formatDate(new Date());
    this.setData({ selectedDate: today });
    this.loadEvents(today);
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  handleDateSelect(e) {
    const date = e.detail;
    this.setData({ selectedDate: date });
    this.loadEvents(date);
  },

  async loadEvents(date) {
    this.setData({ loading: true });

    try {
      const res = await api.schedule.list({ date });
      this.setData({
        events: res.data,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleAddEvent() {
    wx.navigateTo({
      url: `/pages/schedule/task/task?date=${this.data.selectedDate}`
    });
  },

  handleEventDetail(e) {
    const eventId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/schedule/task/task?id=${eventId}`
    });
  }
});
```

### 7. 个人中心模块

#### 7.1 个人信息
```javascript
// pages/profile/info/info.js
Page({
  data: {
    userInfo: null,
    loading: true
  },

  onLoad() {
    this.loadUserInfo();
  },

  async loadUserInfo() {
    try {
      const res = await api.user.profile();
      this.setData({
        userInfo: res.data,
        loading: false
      });
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  handleEdit() {
    wx.navigateTo({
      url: '/pages/profile/edit/edit'
    });
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Auth.logout();
        }
      }
    });
  }
});
```

## 状态管理

### 状态管理实现
```javascript
// store/app.js
class Store {
  constructor() {
    this.state = {
      user: null,
      cases: [],
      clients: [],
      messages: [],
      notifications: []
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setUser(user) {
    this.setState({ user });
  }

  setCases(cases) {
    this.setState({ cases });
  }

  addCase(newCase) {
    this.setState({ cases: [...this.state.cases, newCase] });
  }

  updateCase(updatedCase) {
    const cases = this.state.cases.map(c => 
      c.id === updatedCase.id ? updatedCase : c
    );
    this.setState({ cases });
  }

  removeCase(caseId) {
    const cases = this.state.cases.filter(c => c.id !== caseId);
    this.setState({ cases });
  }
}

const store = new Store();

module.exports = store;
```

## 网络请求封装

### 请求工具
```javascript
// utils/request.js
const config = require('../config/index.js');

class Request {
  constructor() {
    this.baseURL = config.apiBaseUrl;
    this.timeout = 30000;
  }

  request(options) {
    const { url, method = 'GET', data = {}, header = {} } = options;
    const token = wx.getStorageSync('token');

    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + url,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...header
        },
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 200) {
              resolve(res.data);
            } else if (res.data.code === 401) {
              this.handleUnauthorized();
              reject(new Error('未授权'));
            } else {
              reject(new Error(res.data.message || '请求失败'));
            }
          } else {
            reject(new Error('网络错误'));
          }
        },
        fail: (err) => {
          reject(new Error('网络请求失败'));
        }
      });
    });
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data });
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data });
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data });
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data });
  }

  handleUnauthorized() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.reLaunch({
      url: '/pages/auth/login/login'
    });
  }
}

module.exports = new Request();
```

## 性能优化

### 1. 图片懒加载
```javascript
// 在wxml中使用
<image lazy-load src="{{imageUrl}}" mode="aspectFill"></image>
```

### 2. 列表分页加载
```javascript
onReachBottom() {
  if (this.data.hasMore && !this.data.loading) {
    this.loadMoreData();
  }
}
```

### 3. 数据缓存
```javascript
// utils/storage.js
class Storage {
  static set(key, value, expire = 3600) {
    const data = {
      value,
      expire: Date.now() + expire * 1000
    };
    wx.setStorageSync(key, JSON.stringify(data));
  }

  static get(key) {
    const data = wx.getStorageSync(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    if (Date.now() > parsed.expire) {
      wx.removeStorageSync(key);
      return null;
    }

    return parsed.value;
  }

  static remove(key) {
    wx.removeStorageSync(key);
  }

  static clear() {
    wx.clearStorageSync();
  }
}

module.exports = Storage;
```

### 4. 防抖节流
```javascript
// utils/debounce.js
function debounce(func, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function throttle(func, delay = 300) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}

module.exports = { debounce, throttle };
```

## 消息推送

### 订阅消息
```javascript
// 订阅案件状态变更
wx.requestSubscribeMessage({
  tmplIds: ['template-id-1', 'template-id-2'],
  success: (res) => {
    console.log('订阅成功', res);
  },
  fail: (err) => {
    console.error('订阅失败', err);
  }
});
```

### 接收推送消息
```javascript
// app.js
App({
  onLaunch() {
    this.setupMessagePush();
  },

  setupMessagePush() {
    wx.onMessage((message) => {
      const { type, data } = message;
      switch (type) {
        case 'case_status':
          this.handleCaseStatusChange(data);
          break;
        case 'new_message':
          this.handleNewMessage(data);
          break;
        case 'task_reminder':
          this.handleTaskReminder(data);
          break;
      }
    });
  },

  handleCaseStatusChange(data) {
    wx.showModal({
      title: '案件状态变更',
      content: `案件"${data.caseTitle}"状态已变更为"${data.status}"`,
      showCancel: false
    });
  },

  handleNewMessage(data) {
    wx.showToast({
      title: '收到新消息',
      icon: 'none'
    });
  },

  handleTaskReminder(data) {
    wx.showModal({
      title: '任务提醒',
      content: data.content,
      showCancel: false
    });
  }
});
```

## 错误处理

### 全局错误处理
```javascript
// app.js
App({
  onError(error) {
    console.error('全局错误', error);
    
    wx.showModal({
      title: '系统错误',
      content: '系统发生错误，请稍后重试',
      showCancel: false
    });

    this.reportError(error);
  },

  reportError(error) {
    api.error.report({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.error('上报错误失败', err);
    });
  }
});
```

## 安全考虑

### 1. 数据加密
```javascript
// utils/crypto.js
const CryptoJS = require('crypto-js');

class Crypto {
  static encrypt(data, key) {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  static decrypt(ciphertext, key) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

module.exports = Crypto;
```

### 2. 敏感信息脱敏
```javascript
// utils/mask.js
class Mask {
  static phone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  static idCard(idCard) {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }

  static email(email) {
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  }
}

module.exports = Mask;
```

## 测试策略

### 1. 单元测试
```javascript
// 测试工具函数
describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('2024-01-01');
  });
});
```

### 2. 集成测试
```javascript
// 测试API调用
describe('API', () => {
  it('should load cases successfully', async () => {
    const res = await api.case.list();
    expect(res.code).toBe(200);
    expect(Array.isArray(res.data.list)).toBe(true);
  });
});
```

## 部署和发布

### 1. 开发环境
```javascript
// config/dev.js
module.exports = {
  apiBaseUrl: 'https://dev-api.example.com',
  wsBaseUrl: 'wss://dev-api.example.com'
};
```

### 2. 生产环境
```javascript
// config/prod.js
module.exports = {
  apiBaseUrl: 'https://api.example.com',
  wsBaseUrl: 'wss://api.example.com'
};
```

### 3. 版本管理
```javascript
// app.json
{
  "version": "1.0.0",
  "versionName": "1.0.0"
}
```

---

**文档版本**：v1.0  
**创建时间**：2025年12月29日  
**维护团队**：LawTech Team
