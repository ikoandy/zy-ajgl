<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h2 class="page-title">仪表盘</h2>
      <div class="page-subtitle">欢迎回来，管理员</div>
    </div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="24">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @mouseenter="animateCard($event)" @mouseleave="resetCard($event)">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value" :ref="el => { if (el) statRefs.totalUsers = el as Element }">
                {{ totalUsers }}
              </div>
              <div class="stat-label">总用户数</div>
              <div class="stat-trend positive">
                <el-icon><ArrowUp /></el-icon>
                <span>12.5%</span>
              </div>
            </div>
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @mouseenter="animateCard($event)" @mouseleave="resetCard($event)">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value" :ref="el => { if (el) statRefs.totalLawyers = el as Element }">
                {{ totalLawyers }}
              </div>
              <div class="stat-label">律师总数</div>
              <div class="stat-trend positive">
                <el-icon><ArrowUp /></el-icon>
                <span>8.3%</span>
              </div>
            </div>
            <div class="stat-icon lawyer-icon">
              <el-icon><Suitcase /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @mouseenter="animateCard($event)" @mouseleave="resetCard($event)">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value" :ref="el => { if (el) statRefs.totalCases = el as Element }">
                {{ totalCases }}
              </div>
              <div class="stat-label">案件总数</div>
              <div class="stat-trend negative">
                <el-icon><ArrowDown /></el-icon>
                <span>2.1%</span>
              </div>
            </div>
            <div class="stat-icon case-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @mouseenter="animateCard($event)" @mouseleave="resetCard($event)">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value" :ref="el => { if (el) statRefs.totalDocuments = el as Element }">
                {{ totalDocuments }}
              </div>
              <div class="stat-label">文档总数</div>
              <div class="stat-trend positive">
                <el-icon><ArrowUp /></el-icon>
                <span>15.7%</span>
              </div>
            </div>
            <div class="stat-icon document-icon">
              <el-icon><Document /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">案件类型分布</span>
              <span class="header-subtitle">本月统计</span>
            </div>
          </template>
          <div ref="caseTypeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">案件状态分布</span>
              <span class="header-subtitle">实时更新</span>
            </div>
          </template>
          <div ref="caseStatusChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-row style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="dynamic-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">最近动态</span>
              <el-button type="text" size="small" class="more-btn">查看更多</el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in recentActivities"
              :key="index"
              :timestamp="item.time"
              :type="item.type"
              :color="getActivityColor(item.type)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="activity-title">{{ item.content }}</div>
                <div class="activity-meta">
                  <span class="activity-type">{{ getActivityTypeText(item.type) }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  User, Suitcase, FolderOpened, Document, 
  ArrowUp, ArrowDown 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 统计数据
const totalUsers = ref(1256)
const totalLawyers = ref(156)
const totalCases = ref(892)
const totalDocuments = ref(2587)

// 统计值引用，用于动画
const statRefs = ref({
  totalUsers: null as Element | null,
  totalLawyers: null as Element | null,
  totalCases: null as Element | null,
  totalDocuments: null as Element | null
})

// 图表容器
const caseTypeChart = ref<HTMLElement | null>(null)
const caseStatusChart = ref<HTMLElement | null>(null)

// 图表实例
let caseTypeChartInstance: echarts.ECharts | null = null
let caseStatusChartInstance: echarts.ECharts | null = null

// 最近动态数据
const recentActivities = ref([
  { time: '2025-12-31 18:30', type: 'success', content: '用户张三注册成功' },
  { time: '2025-12-31 17:45', type: 'primary', content: '律师李四创建了新案件' },
  { time: '2025-12-31 16:20', type: 'warning', content: '案件#20251231001状态更新为进行中' },
  { time: '2025-12-31 15:10', type: 'info', content: '系统备份完成' },
  { time: '2025-12-31 14:00', type: 'danger', content: '用户王五密码修改失败' }
])

// 获取活动颜色
const getActivityColor = (type: string) => {
  const colorMap: Record<string, string> = {
    success: '#67C23A',
    primary: '#409EFF',
    warning: '#E6A23C',
    info: '#909399',
    danger: '#F56C6C'
  }
  return colorMap[type] || '#909399'
}

// 获取活动类型文本
const getActivityTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    primary: '主要',
    warning: '警告',
    info: '信息',
    danger: '危险'
  }
  return textMap[type] || '信息'
}

// 卡片动画效果
const animateCard = (event: MouseEvent) => {
  const card = event.currentTarget as HTMLElement
  card.style.transform = 'translateY(-4px)'
  card.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.15)'
}

// 重置卡片动画
const resetCard = (event: MouseEvent) => {
  const card = event.currentTarget as HTMLElement
  card.style.transform = 'translateY(0)'
  card.style.boxShadow = '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
}

// 数字增长动画
const animateNumber = (element: Element | null, target: number, duration: number = 1000) => {
  if (!element) return
  
  const start = 0
  const increment = target / (duration / 16)
  let current = start
  
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current).toLocaleString()
  }, 16)
}

// 初始化图表
const initCharts = () => {
  // 案件类型分布图表
  if (caseTypeChart.value) {
    caseTypeChartInstance = echarts.init(caseTypeChart.value)
    const caseTypeOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        textStyle: {
          color: '#303133'
        },
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#606266'
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 15
      },
      series: [
        {
          name: '案件类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              color: '#303133'
            },
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { 
              value: 350, 
              name: '民事案件',
              itemStyle: { color: '#409EFF' }
            },
            { 
              value: 280, 
              name: '刑事案件',
              itemStyle: { color: '#67C23A' }
            },
            { 
              value: 150, 
              name: '行政案件',
              itemStyle: { color: '#E6A23C' }
            },
            { 
              value: 112, 
              name: '其他案件',
              itemStyle: { color: '#909399' }
            }
          ]
        }
      ]
    }
    caseTypeChartInstance.setOption(caseTypeOption)
  }

  // 案件状态分布图表
  if (caseStatusChart.value) {
    caseStatusChartInstance = echarts.init(caseStatusChart.value)
    const caseStatusOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        textStyle: {
          color: '#303133'
        },
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: '#606266'
        },
        axisLine: {
          lineStyle: {
            color: '#e4e7ed'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f5f7fa'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: ['待处理', '进行中', '已完成', '已归档'],
        axisLabel: {
          color: '#606266'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series: [
        {
          name: '案件数量',
          type: 'bar',
          barWidth: '60%',
          data: [120, 200, 360, 202],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#5a6fd8' },
                { offset: 1, color: '#6a4298' }
              ])
            }
          }
        }
      ]
    }
    caseStatusChartInstance.setOption(caseStatusOption)
  }
}

// 监听窗口大小变化，调整图表
const handleResize = () => {
  caseTypeChartInstance?.resize()
  caseStatusChartInstance?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
  
  // 延迟执行数字动画
  setTimeout(() => {
    animateNumber(statRefs.value.totalUsers, totalUsers.value)
    animateNumber(statRefs.value.totalLawyers, totalLawyers.value)
    animateNumber(statRefs.value.totalCases, totalCases.value)
    animateNumber(statRefs.value.totalDocuments, totalDocuments.value)
  }, 300)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  caseTypeChartInstance?.dispose()
  caseStatusChartInstance?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
}

/* 统计卡片样式 */
.stat-card {
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.positive {
  color: #67C23A;
}

.stat-trend.negative {
  color: #F56C6C;
}

.stat-trend el-icon {
  margin-right: 4px;
  font-size: 10px;
}

.stat-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lawyer-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.case-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.document-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* 图表样式 */
.chart-card {
  height: 340px;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;
  border: none;
}

.chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.chart-container {
  width: 100%;
  height: 290px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin-bottom: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-subtitle {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.more-btn {
  color: #667eea;
  font-size: 12px;
  padding: 0;
}

.more-btn:hover {
  color: #5a6fd8;
}

/* 动态列表样式 */
.dynamic-card {
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;
  border: none;
}

.dynamic-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 时间线样式 */
:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid;
  top: 2px;
}

.timeline-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.timeline-content:hover {
  background: #ecf5ff;
  border-left-color: #409eff;
  transform: translateX(4px);
}

.activity-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 500;
}

.activity-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.activity-type {
  color: #909399;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 全局动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-container > .el-row {
  animation: fadeInUp 0.6s ease-out;
}

.dashboard-container > .el-row:nth-child(2) {
  animation-delay: 0.1s;
}

.dashboard-container > .el-row:nth-child(3) {
  animation-delay: 0.2s;
}

.dashboard-container > .el-row:nth-child(4) {
  animation-delay: 0.3s;
}
</style>
