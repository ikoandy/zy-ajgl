# 律师事务所智能管理系统 UI设计指南

## 设计理念

### 核心原则
- **简约大气**：采用极简主义设计，减少视觉干扰，突出核心内容
- **专业稳重**：体现律师事务所的专业性和权威性，建立用户信任
- **用户体验**：注重操作便捷性和信息清晰度，提升使用效率
- **一致性**：多端保持统一的视觉风格和交互体验

### 设计目标
- 提供清晰的信息层级
- 简化用户操作流程
- 确保多端体验一致
- 提升品牌专业形象

## 配色方案

### 主色调
```css
/* 深蓝色 - 专业权威 */
--primary-color: #1a365d;
--primary-light: #2c5282;
--primary-dark: #1a365d;
--primary-50: #ebf8ff;
--primary-100: #bee3f8;
--primary-200: #90cdf4;
--primary-300: #63b3ed;
--primary-400: #4299e1;
--primary-500: #3182ce;
--primary-600: #2b6cb0;
--primary-700: #2c5282;
--primary-800: #2a4365;
--primary-900: #1a365d;
```

### 次要色调
```css
/* 深灰色 - 稳重可靠 */
--secondary-color: #2d3748;
--secondary-light: #4a5568;
--secondary-dark: #1a202c;
--secondary-50: #f7fafc;
--secondary-100: #edf2f7;
--secondary-200: #e2e8f0;
--secondary-300: #cbd5e0;
--secondary-400: #a0aec0;
--secondary-500: #718096;
--secondary-600: #4a5568;
--secondary-700: #2d3748;
--secondary-800: #1a202c;
--secondary-900: #171923;
```

### 强调色
```css
/* 亮蓝色 - 突出重点 */
--accent-color: #3182ce;
--accent-hover: #2b6cb0;
--accent-active: #2c5282;
```

### 功能色
```css
/* 成功状态 */
--success-color: #38a169;
--success-light: #48bb78;
--success-dark: #2f855a;

/* 警告提示 */
--warning-color: #d69e2e;
--warning-light: #ecc94b;
--warning-dark: #b7791f;

/* 错误状态 */
--error-color: #e53e3e;
--error-light: #f56565;
--error-dark: #c53030;

/* 信息提示 */
--info-color: #3182ce;
--info-light: #4299e1;
--info-dark: #2b6cb0;
```

### 中性色
```css
/* 文字颜色 */
--text-primary: #2d3748;
--text-secondary: #718096;
--text-tertiary: #a0aec0;
--text-disabled: #cbd5e0;

/* 边框颜色 */
--border-color: #e2e8f0;
--border-light: #edf2f7;
--border-dark: #cbd5e0;

/* 背景颜色 */
--background-color: #f7fafc;
--background-white: #ffffff;
--background-light: #f7fafc;
--background-dark: #edf2f7;
```

### 阴影
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## 字体规范

### 字体家族
```css
/* 主字体 */
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 数字字体 */
--font-family-mono: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
```

### 字号规范
```css
/* 标题 */
--font-size-h1: 32px;
--font-size-h2: 28px;
--font-size-h3: 24px;
--font-size-h4: 20px;
--font-size-h5: 18px;
--font-size-h6: 16px;

/* 正文 */
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-sm: 14px;
--font-size-xs: 12px;

/* 特殊 */
--font-size-caption: 12px;
--font-size-overline: 10px;
```

### 字重规范
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 行高规范
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;
```

### 字间距
```css
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
--letter-spacing-widest: 0.1em;
```

## 间距规范

### 基础间距
```css
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
```

### 组件内间距
```css
--padding-xs: 4px 8px;
--padding-sm: 8px 12px;
--padding-md: 12px 16px;
--padding-lg: 16px 24px;
--padding-xl: 24px 32px;
```

## 圆角规范

```css
--radius-none: 0;
--radius-sm: 2px;
--radius-base: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;
```

## 组件设计规范

### 快捷入口组件

#### 设计说明
快捷入口组件用于应用首页，提供核心功能模块的快速访问入口。采用CSS直接绘制图标，不再依赖外部图片文件，提高性能和可靠性。

#### 样式规范
```css
/* 快捷入口容器 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 32px 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

/* 单个入口项 */
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  height: 160rpx;
  justify-content: center;
  background-color: #f7fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.action-item:active {
  background-color: #edf2f7;
  transform: scale(0.98);
}

/* CSS绘制图标 */
.action-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 12px;
  background-color: #1a365d;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40rpx;
  font-weight: bold;
}

/* 入口文字 */
.action-text {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}
```

#### 使用示例
```html
<view class="quick-actions">
  <view class="action-item" bindtap="goToCaseList">
    <view class="action-icon">案</view>
    <text class="action-text">案件管理</text>
  </view>
  <view class="action-item" bindtap="goToClientList">
    <view class="action-icon">客</view>
    <text class="action-text">客户管理</text>
  </view>
  <view class="action-item" bindtap="goToMessageList">
    <view class="action-icon">消</view>
    <text class="action-text">消息中心</text>
  </view>
  <view class="action-item" bindtap="goToSchedule">
    <view class="action-icon">日</view>
    <text class="action-text">日程安排</text>
  </view>
</view>
```

### 登录表单组件

#### 登录表单设计
```css
/* 登录容器 */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background-white);
  padding: 0 40rpx;
}

/* 登录内容区 */
.login-content {
  width: 100%;
  max-width: 500rpx;
}

/* 系统标题 */
.system-title {
  font-size: 36rpx;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin-bottom: 16rpx;
  text-align: center;
}

/* 系统副标题 */
.system-subtitle {
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-bottom: 40rpx;
  text-align: center;
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  margin-bottom: 40rpx;
  border-bottom: 1rpx solid var(--border-color);
}

.tab-item {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  font-size: 32rpx;
  color: var(--text-secondary);
  position: relative;
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: var(--primary-color);
  border-radius: 2rpx;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* 输入框组 */
.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 28rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
  display: block;
  text-align: left;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 88rpx;
  font-size: 36rpx;
  font-weight: var(--font-weight-medium);
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-full);
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
}

/* 协议提示 */
.agreement {
  text-align: center;
  font-size: 28rpx;
  color: var(--text-tertiary);
  line-height: 1.5;
}

/* 协议链接 */
.link {
  color: var(--primary-color);
  text-decoration: underline;
}
```

### 按钮组件

#### 主要按钮
```css
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: var(--padding-sm);
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  background-color: var(--primary-dark);
  transform: translateY(0);
}
```

#### 次要按钮
```css
.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
  padding: var(--padding-sm);
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}
```

#### 幽灵按钮
```css
.btn-ghost {
  background-color: transparent;
  color: var(--primary-color);
  padding: var(--padding-sm);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background-color: var(--primary-50);
}
```

#### 危险按钮
```css
.btn-danger {
  background-color: var(--error-color);
  color: white;
  padding: var(--padding-sm);
  border-radius: var(--radius-base);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background-color: var(--error-dark);
}
```

### 输入框组件

#### 基础输入框
```css
.input {
  width: 100%;
  padding: var(--padding-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:disabled {
  background-color: var(--background-light);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

#### 输入框状态
```css
.input-error {
  border-color: var(--error-color);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.input-success {
  border-color: var(--success-color);
}

.input-success:focus {
  box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.1);
}
```

### 卡片组件

```css
.card {
  background-color: var(--background-white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  font-size: var(--font-size-h5);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.card-footer {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--border-light);
}
```

### 表格组件

```css
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--background-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table thead {
  background-color: var(--background-dark);
}

.table th {
  padding: var(--padding-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  border-bottom: 2px solid var(--border-color);
}

.table td {
  padding: var(--padding-md);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  border-bottom: 1px solid var(--border-light);
}

.table tbody tr:hover {
  background-color: var(--primary-50);
}

.table tbody tr:last-child td {
  border-bottom: none;
}
```

### 标签组件

```css
.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.tag-primary {
  background-color: var(--primary-100);
  color: var(--primary-color);
}

.tag-success {
  background-color: #f0fff4;
  color: var(--success-color);
}

.tag-warning {
  background-color: #fffaf0;
  color: var(--warning-color);
}

.tag-error {
  background-color: #fff5f5;
  color: var(--error-color);
}

.tag-info {
  background-color: var(--primary-50);
  color: var(--info-color);
}
```

### 徽章组件

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: white;
  background-color: var(--error-color);
  border-radius: var(--radius-full);
}

.badge-primary {
  background-color: var(--primary-color);
}

.badge-success {
  background-color: var(--success-color);
}

.badge-warning {
  background-color: var(--warning-color);
}
```

### 提示框组件

```css
.alert {
  padding: var(--padding-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: flex-start;
}

.alert-info {
  background-color: var(--primary-50);
  border-left: 4px solid var(--primary-color);
  color: var(--primary-color);
}

.alert-success {
  background-color: #f0fff4;
  border-left: 4px solid var(--success-color);
  color: var(--success-color);
}

.alert-warning {
  background-color: #fffaf0;
  border-left: 4px solid var(--warning-color);
  color: var(--warning-color);
}

.alert-error {
  background-color: #fff5f5;
  border-left: 4px solid var(--error-color);
  color: var(--error-color);
}
```

## 布局规范

### 容器宽度
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### 栅格系统
```css
.grid {
  display: grid;
  gap: var(--spacing-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
```

### Flex布局
```css
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.gap-2 { gap: var(--spacing-2); }
.gap-4 { gap: var(--spacing-4); }
.gap-6 { gap: var(--spacing-6); }
.gap-8 { gap: var(--spacing-8); }
```

## 交互设计规范

### 过渡动画
```css
.transition-all {
  transition-property: all;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-transform {
  transition-property: transform;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 悬停效果
```css
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-opacity:hover {
  opacity: 0.8;
}
```

### 焦点状态
```css
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-100);
}
```

### 禁用状态
```css
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## 响应式设计规范

### 断点定义
```css
/* 移动设备 */
--breakpoint-sm: 640px;

/* 平板设备 */
--breakpoint-md: 768px;

/* 桌面设备 */
--breakpoint-lg: 1024px;

/* 大屏设备 */
--breakpoint-xl: 1280px;

/* 超大屏设备 */
--breakpoint-2xl: 1536px;
```

### 媒体查询示例
```css
/* 移动优先 */
@media (min-width: 640px) {
  .container {
    max-width: var(--container-sm);
  }
}

@media (min-width: 768px) {
  .container {
    max-width: var(--container-md);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: var(--container-lg);
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: var(--container-xl);
  }
}
```

## 动画效果规范

### 淡入动画
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

### 滑入动画
```css
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-up {
  animation: slideInUp 0.3s ease-out;
}
```

### 缩放动画
```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn 0.2s ease-out;
}
```

### 旋转动画
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}
```

## 图标规范

### 图标尺寸
```css
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

### 图标颜色
```css
.icon-primary {
  color: var(--primary-color);
}

.icon-secondary {
  color: var(--secondary-color);
}

.icon-success {
  color: var(--success-color);
}

.icon-warning {
  color: var(--warning-color);
}

.icon-error {
  color: var(--error-color);
}
```

## 多端适配规范

### PC端特性
- 使用较大的间距和字体
- 支持鼠标悬停效果
- 采用多列布局
- 侧边栏导航

### 移动端特性
- 使用较小的间距和字体
- 触摸友好的交互区域（最小44px）
- 单列布局为主
- 底部导航栏
- 手势操作支持

### 小程序特性
- 遵循微信小程序设计规范
- 使用原生组件
- 优化加载性能
- 适配微信环境

## 可访问性规范

### 颜色对比度
- 正文文字对比度至少为 4.5:1
- 大号文字对比度至少为 3:1
- 图标和图形元素对比度至少为 3:1

### 键盘导航
- 所有交互元素可通过键盘访问
- 清晰的焦点指示器
- 合理的Tab顺序

### 屏幕阅读器
- 提供有意义的alt文本
- 使用语义化HTML
- ARIA属性支持

## 使用示例

### 基础页面结构
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>律师事务所智能管理系统</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="logo">律师事务所管理系统</h1>
      <nav class="nav">
        <a href="#" class="nav-link active">首页</a>
        <a href="#" class="nav-link">案件管理</a>
        <a href="#" class="nav-link">客户管理</a>
        <a href="#" class="nav-link">财务管理</a>
      </nav>
    </header>
    
    <main class="main">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">案件列表</h2>
        </div>
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>案件编号</th>
                <th>案件名称</th>
                <th>客户</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CASE001</td>
                <td>合同纠纷案</td>
                <td>张三</td>
                <td><span class="tag tag-primary">进行中</span></td>
                <td>
                  <button class="btn-ghost">查看</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

### 组件使用示例
```html
<!-- 按钮组 -->
<div class="button-group">
  <button class="btn-primary">主要操作</button>
  <button class="btn-secondary">次要操作</button>
  <button class="btn-ghost">取消</button>
</div>

<!-- 表单 -->
<form class="form">
  <div class="form-group">
    <label class="form-label">案件名称</label>
    <input type="text" class="input" placeholder="请输入案件名称">
  </div>
  <div class="form-group">
    <label class="form-label">案件类型</label>
    <select class="input">
      <option>合同纠纷</option>
      <option>劳动争议</option>
      <option>知识产权</option>
    </select>
  </div>
  <button type="submit" class="btn-primary">提交</button>
</form>

<!-- 提示信息 -->
<div class="alert alert-info">
  <span class="alert-icon">ℹ️</span>
  <span class="alert-message">这是一条信息提示</span>
</div>
```

## 版本历史

### v1.1.0 (2025-12-30)
- 更新快捷入口组件设计规范
- 新增CSS绘制图标方案
- 移除外部图片依赖，提高性能和可靠性
- 优化组件样式，确保在微信小程序中正确显示

### v1.0.0 (2025-12-29)
- 初始版本发布
- 定义基础设计规范
- 建立配色系统
- 创建组件库规范

---

**文档维护**：UI设计团队  
**最后更新**：2025年12月30日  
**版本**：v1.1.0
