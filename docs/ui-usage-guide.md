# UI组件使用文档

## 概述

本文档提供了律师事务所智能管理系统UI组件的详细使用说明。UI组件系统采用模块化设计，支持PC管理后台、微信小程序和H5移动端三端统一风格。

### 文件结构

```
ui/
├── common/          # 通用样式和组件
│   ├── variables.css      # CSS变量和主题配置
│   ├── button.css         # 按钮组件
│   ├── input.css          # 输入框组件
│   ├── card.css           # 卡片组件
│   ├── table.css          # 表格组件
│   ├── tag.css            # 标签组件
│   ├── alert.css          # 提示组件
│   ├── layout.css         # 布局组件
│   ├── utilities.css      # 工具类
│   ├── modal.css          # 模态框组件
│   ├── components.css     # 其他通用组件
│   ├── navigation.css     # 导航组件
│   ├── form.css           # 表单组件
│   ├── misc.css           # 杂项组件
│   ├── responsive.css     # 响应式样式
│   └── animations.css     # 动画效果
├── pc/              # PC管理后台样式
│   ├── layout.css         # PC布局
│   ├── components.css     # PC组件
│   ├── table.css          # PC表格
│   └── index.css          # PC入口文件
├── miniprogram/     # 微信小程序样式
│   ├── layout.css         # 小程序布局
│   ├── button.css         # 小程序按钮
│   ├── form.css           # 小程序表单
│   ├── navigation.css     # 小程序导航
│   ├── components.css     # 小程序组件
│   ├── modal.css          # 小程序模态框
│   └── index.css          # 小程序入口文件
└── mobile/          # H5移动端样式
    ├── layout.css         # 移动端布局
    ├── button.css         # 移动端按钮
    ├── form.css           # 移动端表单
    ├── navigation.css     # 移动端导航
    ├── components.css     # 移动端组件
    ├── modal.css          # 移动端模态框
    └── index.css          # 移动端入口文件
```

## 安装和引入

### PC管理后台

在Vue3项目中引入PC样式：

```html
<!-- 在main.js或入口文件中引入 -->
import './ui/pc/index.css';
```

或在HTML中直接引入：

```html
<link rel="stylesheet" href="./ui/pc/index.css">
```

### 微信小程序

在app.wxss中引入样式：

```css
@import "./ui/miniprogram/index.css";
```

### H5移动端

在入口HTML中引入样式：

```html
<link rel="stylesheet" href="./ui/mobile/index.css">
```

或在Vue项目中：

```html
import './ui/mobile/index.css';
```

## 主题配置

### CSS变量

系统使用CSS变量进行主题配置，可以在variables.css中自定义：

```css
:root {
  --color-primary: #1890ff;
  --color-primary-light: #40a9ff;
  --color-primary-dark: #096dd9;
  --color-secondary: #8c8c8c;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-danger: #ff4d4f;
  --color-info: #1890ff;
  --color-text-primary: #262626;
  --color-text-secondary: #595959;
  --color-text-disabled: #bfbfbf;
  --color-border: #d9d9d9;
  --color-border-light: #f0f0f0;
  --color-background: #ffffff;
  --color-background-light: #fafafa;
  --color-background-dark: #f5f5f5;
  --color-surface: #ffffff;
  --color-surface-light: #fafafa;
  --color-overlay: rgba(0, 0, 0, 0.45);
  --color-shadow: rgba(0, 0, 0, 0.1);
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-base: 14px;
  --font-size-sm: 12px;
  --font-size-lg: 16px;
  --border-radius: 4px;
  --border-radius-sm: 2px;
  --border-radius-lg: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --transition-fast: 0.15s;
  --transition-normal: 0.3s;
  --transition-slow: 0.5s;
}
```

### 自定义主题

可以通过覆盖CSS变量来自定义主题：

```css
:root {
  --color-primary: #722ed1;
  --color-primary-light: #9254de;
  --color-primary-dark: #531dab;
}
```

## 通用组件

### 按钮

#### 基础按钮

```html
<button class="button">默认按钮</button>
<button class="button button-primary">主要按钮</button>
<button class="button button-secondary">次要按钮</button>
<button class="button button-success">成功按钮</button>
<button class="button button-warning">警告按钮</button>
<button class="button button-danger">危险按钮</button>
```

#### 按钮尺寸

```html
<button class="button button-sm">小按钮</button>
<button class="button">默认按钮</button>
<button class="button button-lg">大按钮</button>
```

#### 按钮状态

```html
<button class="button" disabled>禁用按钮</button>
<button class="button button-loading">加载中</button>
<button class="button button-outline">轮廓按钮</button>
<button class="button button-ghost">幽灵按钮</button>
```

#### 按钮组

```html
<div class="button-group">
  <button class="button button-primary">按钮1</button>
  <button class="button button-primary">按钮2</button>
  <button class="button button-primary">按钮3</button>
</div>
```

### 输入框

#### 基础输入框

```html
<input type="text" class="input" placeholder="请输入内容">
<input type="password" class="input" placeholder="请输入密码">
<input type="number" class="input" placeholder="请输入数字">
```

#### 输入框尺寸

```html
<input type="text" class="input input-sm" placeholder="小输入框">
<input type="text" class="input" placeholder="默认输入框">
<input type="text" class="input input-lg" placeholder="大输入框">
```

#### 输入框状态

```html
<input type="text" class="input" disabled placeholder="禁用状态">
<input type="text" class="input input-error" placeholder="错误状态">
<input type="text" class="input input-success" placeholder="成功状态">
```

#### 文本域

```html
<textarea class="textarea" rows="4" placeholder="请输入多行文本"></textarea>
```

#### 输入框组合

```html
<div class="input-group">
  <span class="input-group-addon">https://</span>
  <input type="text" class="input" placeholder="example.com">
</div>

<div class="input-group">
  <input type="text" class="input" placeholder="搜索内容">
  <span class="input-group-addon button button-primary">搜索</span>
</div>
```

### 卡片

#### 基础卡片

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
  </div>
  <div class="card-body">
    <p>卡片内容区域</p>
  </div>
</div>
```

#### 带操作卡片

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">卡片标题</h3>
    <div class="card-actions">
      <button class="button button-sm">编辑</button>
      <button class="button button-sm button-danger">删除</button>
    </div>
  </div>
  <div class="card-body">
    <p>卡片内容区域</p>
  </div>
</div>
```

#### 卡片尺寸

```html
<div class="card card-sm">小卡片</div>
<div class="card">默认卡片</div>
<div class="card card-lg">大卡片</div>
```

### 表格

#### 基础表格

```html
<table class="table">
  <thead>
    <tr>
      <th>姓名</th>
      <th>年龄</th>
      <th>职业</th>
      <th>操作</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>25</td>
      <td>律师</td>
      <td>
        <button class="button button-sm">编辑</button>
      </td>
    </tr>
  </tbody>
</table>
```

#### 带边框表格

```html
<table class="table table-bordered">
  <!-- 表格内容 -->
</table>
```

#### 斑马纹表格

```html
<table class="table table-striped">
  <!-- 表格内容 -->
</table>
```

#### 悬停效果表格

```html
<table class="table table-hover">
  <!-- 表格内容 -->
</table>
```

#### 紧凑表格

```html
<table class="table table-sm">
  <!-- 表格内容 -->
</table>
```

### 标签

#### 基础标签

```html
<span class="tag">默认标签</span>
<span class="tag tag-primary">主要标签</span>
<span class="tag tag-success">成功标签</span>
<span class="tag tag-warning">警告标签</span>
<span class="tag tag-danger">危险标签</span>
<span class="tag tag-info">信息标签</span>
```

#### 标签尺寸

```html
<span class="tag tag-sm">小标签</span>
<span class="tag">默认标签</span>
<span class="tag tag-lg">大标签</span>
```

#### 可关闭标签

```html
<span class="tag tag-closable">
  可关闭标签
  <span class="tag-close">&times;</span>
</span>
```

### 提示

#### 基础提示

```html
<div class="alert">
  <span class="alert-icon">ℹ</span>
  <span class="alert-content">这是一条提示信息</span>
</div>
```

#### 提示类型

```html
<div class="alert alert-success">成功提示</div>
<div class="alert alert-warning">警告提示</div>
<div class="alert alert-danger">错误提示</div>
<div class="alert alert-info">信息提示</div>
```

#### 可关闭提示

```html
<div class="alert alert-closable">
  <span class="alert-content">可关闭的提示</span>
  <span class="alert-close">&times;</span>
</div>
```

## 布局组件

### 容器

```html
<div class="container">
  <p>内容区域</p>
</div>

<div class="container-fluid">
  <p>全宽容器</p>
</div>
```

### 网格系统

```html
<div class="grid">
  <div class="grid-col-6">列1</div>
  <div class="grid-col-6">列2</div>
</div>

<div class="grid">
  <div class="grid-col-4">列1</div>
  <div class="grid-col-4">列2</div>
  <div class="grid-col-4">列3</div>
</div>

<div class="grid">
  <div class="grid-col-3">列1</div>
  <div class="grid-col-3">列2</div>
  <div class="grid-col-3">列3</div>
  <div class="grid-col-3">列4</div>
</div>
```

### Flex布局

```html
<div class="flex">
  <div>项目1</div>
  <div>项目2</div>
  <div>项目3</div>
</div>

<div class="flex flex-center">
  <div>居中对齐</div>
</div>

<div class="flex flex-between">
  <div>两端对齐</div>
  <div>项目2</div>
</div>

<div class="flex flex-column">
  <div>垂直排列</div>
  <div>项目2</div>
</div>
```

### 间距

```html
<div class="mt-sm">上边距小</div>
<div class="mt-md">上边距中</div>
<div class="mt-lg">上边距大</div>

<div class="mb-sm">下边距小</div>
<div class="mb-md">下边距中</div>
<div class="mb-lg">下边距大</div>

<div class="p-sm">内边距小</div>
<div class="p-md">内边距中</div>
<div class="p-lg">内边距大</div>
```

## 模态框

### 基础模态框

```html
<div class="modal modal-active">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">模态框标题</h3>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <p>模态框内容</p>
    </div>
    <div class="modal-footer">
      <button class="button button-secondary">取消</button>
      <button class="button button-primary">确定</button>
    </div>
  </div>
</div>
```

### 模态框尺寸

```html
<div class="modal modal-sm modal-active">小模态框</div>
<div class="modal modal-lg modal-active">大模态框</div>
<div class="modal modal-full modal-active">全屏模态框</div>
```

### 对话框

```html
<div class="dialog dialog-active">
  <div class="dialog-overlay"></div>
  <div class="dialog-content">
    <div class="dialog-header">
      <h3 class="dialog-title">确认操作</h3>
    </div>
    <div class="dialog-body">
      <p>确定要执行此操作吗？</p>
    </div>
    <div class="dialog-footer">
      <button class="button button-secondary">取消</button>
      <button class="button button-primary">确定</button>
    </div>
  </div>
</div>
```

### Toast提示

```html
<div class="toast toast-active">
  <div class="toast-content">
    <span class="toast-icon">✓</span>
    <span class="toast-message">操作成功</span>
  </div>
</div>
```

### 加载提示

```html
<div class="loading loading-active">
  <div class="loading-spinner"></div>
  <div class="loading-text">加载中...</div>
</div>
```

## 导航组件

### 导航栏

```html
<nav class="navbar">
  <div class="navbar-brand">
    <a href="#" class="navbar-logo">Logo</a>
  </div>
  <div class="navbar-menu">
    <a href="#" class="navbar-item navbar-item-active">首页</a>
    <a href="#" class="navbar-item">关于</a>
    <a href="#" class="navbar-item">联系</a>
  </div>
</nav>
```

### 侧边栏

```html
<aside class="sidebar">
  <div class="sidebar-header">
    <h3 class="sidebar-title">侧边栏</h3>
  </div>
  <div class="sidebar-menu">
    <a href="#" class="sidebar-item sidebar-item-active">菜单项1</a>
    <a href="#" class="sidebar-item">菜单项2</a>
    <a href="#" class="sidebar-item">菜单项3</a>
  </div>
</aside>
```

### 标签页

```html
<div class="tabs">
  <div class="tabs-nav">
    <button class="tabs-item tabs-item-active">标签1</button>
    <button class="tabs-item">标签2</button>
    <button class="tabs-item">标签3</button>
  </div>
  <div class="tabs-content">
    <div class="tabs-pane tabs-pane-active">内容1</div>
    <div class="tabs-pane">内容2</div>
    <div class="tabs-pane">内容3</div>
  </div>
</div>
```

### 面包屑

```html
<nav class="breadcrumb">
  <a href="#" class="breadcrumb-item">首页</a>
  <span class="breadcrumb-separator">/</span>
  <a href="#" class="breadcrumb-item">分类</a>
  <span class="breadcrumb-separator">/</span>
  <span class="breadcrumb-item breadcrumb-item-active">当前页</span>
</nav>
```

### 分页

```html
<div class="pagination">
  <button class="pagination-item pagination-item-disabled">上一页</button>
  <button class="pagination-item pagination-item-active">1</button>
  <button class="pagination-item">2</button>
  <button class="pagination-item">3</button>
  <button class="pagination-item">下一页</button>
</div>
```

## 表单组件

### 复选框

```html
<label class="checkbox">
  <input type="checkbox" class="checkbox-input">
  <span class="checkbox-label">选项1</span>
</label>

<label class="checkbox checkbox-checked">
  <input type="checkbox" class="checkbox-input" checked>
  <span class="checkbox-label">已选选项</span>
</label>
```

### 单选框

```html
<label class="radio">
  <input type="radio" name="group" class="radio-input">
  <span class="radio-label">选项1</span>
</label>

<label class="radio radio-checked">
  <input type="radio" name="group" class="radio-input" checked>
  <span class="radio-label">已选选项</span>
</label>
```

### 开关

```html
<label class="switch">
  <input type="checkbox" class="switch-input">
  <span class="switch-slider"></span>
</label>

<label class="switch switch-checked">
  <input type="checkbox" class="switch-input" checked>
  <span class="switch-slider"></span>
</label>
```

### 选择器

```html
<select class="select">
  <option>请选择</option>
  <option>选项1</option>
  <option>选项2</option>
</select>
```

### 文件上传

```html
<div class="upload">
  <input type="file" class="upload-input">
  <div class="upload-area">
    <span class="upload-icon">+</span>
    <span class="upload-text">点击上传</span>
  </div>
</div>
```

### 表单验证

```html
<div class="form-group">
  <label class="form-label">用户名</label>
  <input type="text" class="input input-error">
  <span class="form-error">用户名不能为空</span>
</div>

<div class="form-group">
  <label class="form-label">密码</label>
  <input type="password" class="input input-success">
  <span class="form-success">密码格式正确</span>
</div>
```

## 其他组件

### 头像

```html
<div class="avatar avatar-sm">小头像</div>
<div class="avatar">默认头像</div>
<div class="avatar avatar-lg">大头像</div>

<div class="avatar avatar-circle">圆形头像</div>
<div class="avatar avatar-square">方形头像</div>
```

### 徽章

```html
<span class="badge">徽章</span>
<span class="badge badge-primary">主要徽章</span>
<span class="badge badge-success">成功徽章</span>
<span class="badge badge-danger">危险徽章</span>
```

### 进度条

```html
<div class="progress">
  <div class="progress-bar" style="width: 50%"></div>
</div>

<div class="progress">
  <div class="progress-bar progress-bar-success" style="width: 75%"></div>
</div>

<div class="progress">
  <div class="progress-bar progress-bar-warning" style="width: 30%"></div>
</div>
```

### 分割线

```html
<div class="divider"></div>
<div class="divider divider-text">分割文字</div>
```

### 下拉菜单

```html
<div class="dropdown">
  <button class="button">下拉菜单</button>
  <div class="dropdown-menu">
    <a href="#" class="dropdown-item">选项1</a>
    <a href="#" class="dropdown-item">选项2</a>
    <a href="#" class="dropdown-item">选项3</a>
  </div>
</div>
```

## PC管理后台组件

### 侧边栏布局

```html
<div class="pc-layout">
  <aside class="pc-sidebar">
    <div class="pc-sidebar-header">
      <div class="pc-sidebar-logo">律所管理系统</div>
    </div>
    <nav class="pc-sidebar-menu">
      <a href="#" class="pc-sidebar-item pc-sidebar-item-active">
        <span class="pc-sidebar-icon">🏠</span>
        <span class="pc-sidebar-text">首页</span>
      </a>
      <a href="#" class="pc-sidebar-item">
        <span class="pc-sidebar-icon">👥</span>
        <span class="pc-sidebar-text">客户管理</span>
      </a>
      <a href="#" class="pc-sidebar-item">
        <span class="pc-sidebar-icon">⚖️</span>
        <span class="pc-sidebar-text">案件管理</span>
      </a>
    </nav>
  </aside>
  <div class="pc-main">
    <header class="pc-header">
      <div class="pc-header-left">
        <button class="pc-header-toggle">☰</button>
      </div>
      <div class="pc-header-right">
        <button class="pc-header-icon">🔔</button>
        <div class="pc-header-user">
          <div class="pc-header-avatar">管理员</div>
        </div>
      </div>
    </header>
    <main class="pc-content">
      <div class="pc-content-header">
        <h1 class="pc-content-title">页面标题</h1>
      </div>
      <div class="pc-content-body">
        <!-- 页面内容 -->
      </div>
    </main>
  </div>
</div>
```

### 仪表盘

```html
<div class="pc-dashboard">
  <div class="pc-dashboard-stats">
    <div class="pc-stat-card">
      <div class="pc-stat-title">总客户数</div>
      <div class="pc-stat-value">1,234</div>
      <div class="pc-stat-trend pc-stat-trend-up">+12%</div>
    </div>
    <div class="pc-stat-card">
      <div class="pc-stat-title">进行中案件</div>
      <div class="pc-stat-value">56</div>
      <div class="pc-stat-trend pc-stat-trend-down">-3%</div>
    </div>
  </div>
  <div class="pc-dashboard-grid">
    <div class="pc-dashboard-card">
      <div class="pc-dashboard-card-header">
        <h3 class="pc-dashboard-card-title">案件统计</h3>
      </div>
      <div class="pc-dashboard-card-body">
        <!-- 图表内容 -->
      </div>
    </div>
  </div>
</div>
```

### 表格工具栏

```html
<div class="pc-table-toolbar">
  <div class="pc-table-toolbar-left">
    <button class="button button-primary">新增</button>
    <button class="button button-secondary">批量删除</button>
  </div>
  <div class="pc-table-toolbar-right">
    <input type="text" class="input" placeholder="搜索...">
    <button class="button button-secondary">筛选</button>
  </div>
</div>
```

## 微信小程序组件

### 页面布局

```html
<view class="mp-page">
  <view class="mp-page-header">
    <view class="mp-page-title">页面标题</view>
  </view>
  <view class="mp-page-body">
    <!-- 页面内容 -->
  </view>
</view>
```

### 卡片列表

```html
<view class="mp-card-list">
  <view class="mp-card">
    <view class="mp-card-header">
      <text class="mp-card-title">卡片标题</text>
    </view>
    <view class="mp-card-body">
      <text class="mp-card-text">卡片内容</text>
    </view>
  </view>
</view>
```

### 底部导航

```html
<view class="mp-tabbar">
  <view class="mp-tabbar-item mp-tabbar-item-active">
    <text class="mp-tabbar-icon">🏠</text>
    <text class="mp-tabbar-text">首页</text>
  </view>
  <view class="mp-tabbar-item">
    <text class="mp-tabbar-icon">📋</text>
    <text class="mp-tabbar-text">案件</text>
  </view>
  <view class="mp-tabbar-item">
    <text class="mp-tabbar-icon">👤</text>
    <text class="mp-tabbar-text">我的</text>
  </view>
</view>
```

### 操作菜单

```html
<view class="mp-action-sheet mp-action-sheet-active">
  <view class="mp-action-sheet-overlay"></view>
  <view class="mp-action-sheet-content">
    <view class="mp-action-sheet-item">操作1</view>
    <view class="mp-action-sheet-item">操作2</view>
    <view class="mp-action-sheet-item mp-action-sheet-cancel">取消</view>
  </view>
</view>
```

## H5移动端组件

### 页面布局

```html
<div class="mobile-page">
  <div class="mobile-page-header">
    <h1 class="mobile-page-title">页面标题</h1>
  </div>
  <div class="mobile-page-body">
    <!-- 页面内容 -->
  </div>
</div>
```

### 卡片

```html
<div class="mobile-card">
  <div class="mobile-card-header">
    <h3 class="mobile-card-title">卡片标题</h3>
  </div>
  <div class="mobile-card-body">
    <p class="mobile-card-text">卡片内容</p>
  </div>
</div>
```

### 列表

```html
<div class="mobile-list">
  <div class="mobile-list-item">
    <div class="mobile-list-item-content">
      <div class="mobile-list-item-title">列表项标题</div>
      <div class="mobile-list-item-desc">列表项描述</div>
    </div>
    <div class="mobile-list-item-arrow">›</div>
  </div>
</div>
```

### 底部导航

```html
<div class="mobile-tabbar">
  <a href="#" class="mobile-tabbar-item mobile-tabbar-item-active">
    <span class="mobile-tabbar-icon">🏠</span>
    <span class="mobile-tabbar-text">首页</span>
  </a>
  <a href="#" class="mobile-tabbar-item">
    <span class="mobile-tabbar-icon">📋</span>
    <span class="mobile-tabbar-text">案件</span>
  </a>
  <a href="#" class="mobile-tabbar-item">
    <span class="mobile-tabbar-icon">👤</span>
    <span class="mobile-tabbar-text">我的</span>
  </a>
</div>
```

## 响应式设计

### 媒体查询

系统内置了响应式断点：

- 超小屏幕：< 640px
- 小屏幕：641px - 768px
- 中等屏幕：769px - 1024px
- 大屏幕：> 1024px

### 响应式类

```html
<div class="hidden-sm">在小屏幕隐藏</div>
<div class="hidden-md">在中等屏幕隐藏</div>
<div class="hidden-lg">在大屏幕隐藏</div>

<div class="visible-sm">仅在小屏幕显示</div>
<div class="visible-md">仅在中等屏幕显示</div>
<div class="visible-lg">仅在大屏幕显示</div>
```

### 响应式网格

```html
<div class="grid">
  <div class="grid-col-12 grid-col-sm-6 grid-col-md-4 grid-col-lg-3">
    响应式列
  </div>
</div>
```

## 动画效果

### 淡入淡出

```html
<div class="animate-fadeIn">淡入效果</div>
<div class="animate-fadeOut">淡出效果</div>
```

### 滑动效果

```html
<div class="animate-slideInUp">从下滑入</div>
<div class="animate-slideInDown">从上滑入</div>
<div class="animate-slideInLeft">从左滑入</div>
<div class="animate-slideInRight">从右滑入</div>
```

### 缩放效果

```html
<div class="animate-zoomIn">放大进入</div>
<div class="animate-zoomOut">缩小退出</div>
```

### 弹跳效果

```html
<div class="animate-bounce">弹跳效果</div>
<div class="animate-shake">抖动效果</div>
```

### 脉冲效果

```html
<div class="animate-pulse">脉冲效果</div>
<div class="animate-spin">旋转效果</div>
```

### 过渡效果

```html
<div class="transition-fast">快速过渡</div>
<div class="transition-normal">正常过渡</div>
<div class="transition-slow">慢速过渡</div>
```

### 交互效果

```html
<button class="button hover-lift">悬停提升</button>
<button class="button active-press">点击按压</button>
<div class="focus-ring">聚焦高亮</div>
```

### 动画工具类

```html
<div class="animate-delay-1">延迟1秒</div>
<div class="animate-duration-2">持续2秒</div>
<div class="animate-infinite">无限循环</div>
```

## 最佳实践

### 1. 组件组合

合理组合使用组件，避免过度嵌套：

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">案件列表</h3>
    <div class="card-actions">
      <button class="button button-sm button-primary">新增</button>
    </div>
  </div>
  <div class="card-body">
    <table class="table table-hover">
      <!-- 表格内容 -->
    </table>
  </div>
</div>
```

### 2. 语义化标签

使用语义化HTML标签：

```html
<nav class="navbar">
  <div class="navbar-brand">
    <a href="#" class="navbar-logo">Logo</a>
  </div>
  <ul class="navbar-menu">
    <li><a href="#" class="navbar-item">首页</a></li>
    <li><a href="#" class="navbar-item">关于</a></li>
  </ul>
</nav>
```

### 3. 响应式设计

优先考虑移动端，使用响应式类：

```html
<div class="container">
  <div class="grid">
    <div class="grid-col-12 grid-col-md-6 grid-col-lg-4">
      <!-- 响应式内容 -->
    </div>
  </div>
</div>
```

### 4. 性能优化

- 避免过度使用动画效果
- 合理使用CSS变量，减少重复代码
- 使用工具类简化样式编写

### 5. 可访问性

- 为按钮和链接添加清晰的文本
- 为表单元素添加label
- 使用适当的颜色对比度

### 6. 主题定制

通过CSS变量轻松定制主题：

```css
:root {
  --color-primary: #722ed1;
  --font-family: 'Microsoft YaHei', sans-serif;
  --border-radius: 6px;
}
```

## 注意事项

1. **浏览器兼容性**：组件支持现代浏览器（Chrome、Firefox、Safari、Edge）
2. **微信小程序**：部分CSS属性在小程序中可能不支持，需要使用小程序专用的样式
3. **响应式**：确保在不同设备上测试显示效果
4. **性能**：避免在页面中同时使用过多动画效果
5. **维护**：遵循组件命名规范，保持代码一致性

## 常见问题

### Q: 如何自定义主题颜色？

A: 修改variables.css中的CSS变量即可：

```css
:root {
  --color-primary: #your-color;
  --color-primary-light: #your-light-color;
  --color-primary-dark: #your-dark-color;
}
```

### Q: 如何禁用动画效果？

A: 可以通过CSS变量禁用动画：

```css
:root {
  --transition-fast: 0s;
  --transition-normal: 0s;
  --transition-slow: 0s;
}
```

### Q: 微信小程序中如何使用这些组件？

A: 在app.wxss中引入样式，然后使用小程序的view、text等标签替换HTML标签：

```css
@import "./ui/miniprogram/index.css";
```

### Q: 如何实现暗色模式？

A: 系统已内置暗色模式支持，使用媒体查询自动切换：

```css
@media (prefers-color-scheme: dark) {
  /* 暗色模式样式 */
}
```

## 更新日志

### v1.0.0 (2024-12-29)
- 初始版本发布
- 完成通用组件库
- 完成PC管理后台组件
- 完成微信小程序组件
- 完成H5移动端组件
- 完成响应式设计
- 完成动画效果

## 技术支持

如有问题或建议，请联系开发团队。
