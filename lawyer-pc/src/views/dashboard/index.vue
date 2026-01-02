<template>
  <div class="dashboard-container">
    <h1 class="page-title">仪表盘</h1>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card case-card">
        <div class="stat-header">
          <div class="stat-value">{{ caseCount }}</div>
          <div class="stat-icon case-icon">
            <span class="icon-text">案</span>
          </div>
        </div>
        <div class="stat-footer">
          <div class="stat-label">当前案件数</div>
          <div class="stat-trend">
            <span class="trend-icon up">↑</span>
            <span class="trend-value">5.2%</span>
          </div>
        </div>
      </div>
      <div class="stat-card todo-card">
        <div class="stat-header">
          <div class="stat-value">{{ todoCount }}</div>
          <div class="stat-icon todo-icon">
            <span class="icon-text">待</span>
          </div>
        </div>
        <div class="stat-footer">
          <div class="stat-label">待办事项</div>
          <div class="stat-trend">
            <span class="trend-icon down">↓</span>
            <span class="trend-value">2.8%</span>
          </div>
        </div>
      </div>
      <div class="stat-card client-card">
        <div class="stat-header">
          <div class="stat-value">{{ clientCount }}</div>
          <div class="stat-icon client-icon">
            <span class="icon-text">客</span>
          </div>
        </div>
        <div class="stat-footer">
          <div class="stat-label">客户数量</div>
          <div class="stat-trend">
            <span class="trend-icon up">↑</span>
            <span class="trend-value">8.5%</span>
          </div>
        </div>
      </div>
      <div class="stat-card message-card">
        <div class="stat-header">
          <div class="stat-value">{{ messageCount }}</div>
          <div class="stat-icon message-icon">
            <span class="icon-text">消</span>
          </div>
        </div>
        <div class="stat-footer">
          <div class="stat-label">未读消息</div>
          <div class="stat-trend">
            <span class="trend-icon up">↑</span>
            <span class="trend-value">3.1%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据趋势图 -->
    <el-row :gutter="24">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>案件增长趋势</span>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
          </template>
          <div class="chart-container">
            <div ref="caseTrendChartRef" class="chart-content"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>收入趋势</span>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
          </template>
          <div class="chart-container">
            <div ref="incomeTrendChartRef" class="chart-content"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据分布图 -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>案件类型分布</span>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
          </template>
          <div class="chart-container">
            <div ref="caseTypeChartRef" class="chart-content"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>客户地域分布</span>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
          </template>
          <div class="chart-container">
            <div ref="clientRegionChartRef" class="chart-content"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="12">
        <!-- 最近日程 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最近日程</span>
              <el-button type="text" size="small">查看全部</el-button>
            </div>
          </template>
          <div class="schedule-list">
            <el-timeline>
              <el-timeline-item
                v-for="item in recentSchedules"
                :key="item.id"
                :timestamp="item.time"
              >
                <div class="schedule-item">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.content }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="chart-card" style="margin-top: 24px;">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button type="text" size="small">查看全部</el-button>
            </div>
          </template>
          <div class="todo-list">
            <el-checkbox-group v-model="checkedTodos">
              <div
                v-for="todo in recentTodos"
                :key="todo.id"
                class="todo-item"
              >
                <el-checkbox :label="todo.id" class="todo-checkbox"></el-checkbox>
                <div class="todo-content">
                  <h4>{{ todo.title }}</h4>
                  <p class="todo-desc">{{ todo.description }}</p>
                  <p class="todo-time">{{ todo.time }}</p>
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <!-- 最近案件 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最近案件</span>
              <el-button type="text" size="small">查看全部</el-button>
            </div>
          </template>
          <div class="recent-cases">
            <el-table :data="recentCases" stripe style="width: 100%">
              <el-table-column prop="caseNumber" label="案件编号" width="120"></el-table-column>
              <el-table-column prop="title" label="案件名称"></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="client" label="客户" width="120"></el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button type="text" size="small" @click="viewCaseDetail(scope.row.id)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 最近消息 -->
        <el-card class="chart-card" style="margin-top: 24px;">
          <template #header>
            <div class="card-header">
              <span>最近消息</span>
              <el-button type="text" size="small">查看全部</el-button>
            </div>
          </template>
          <div class="message-list">
            <div v-for="message in recentMessages" :key="message.id" class="message-item">
              <div class="message-avatar">{{ message.sender }}</div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-sender">{{ message.sender }}</span>
                  <span class="message-time">{{ message.time }}</span>
                </div>
                <div class="message-body">{{ message.content }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控 -->
    <el-card class="chart-card" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span>系统监控</span>
          <el-button type="text" size="small">查看详情</el-button>
        </div>
      </template>
      <div class="monitor-container">
        <div class="monitor-item">
          <div class="monitor-info">
            <span class="monitor-label">在线用户</span>
            <span class="monitor-value">{{ onlineUsers }}</span>
          </div>
          <div class="monitor-progress">
            <el-progress type="line" :percentage="65" :stroke-width="8" :color="'#3182ce'" />
          </div>
        </div>
        <div class="monitor-item">
          <div class="monitor-info">
            <span class="monitor-label">服务器负载</span>
            <span class="monitor-value">{{ serverLoad }}%</span>
          </div>
          <div class="monitor-progress">
            <el-progress type="line" :percentage="serverLoad" :stroke-width="8" :color="'#e53e3e'" />
          </div>
        </div>
        <div class="monitor-item">
          <div class="monitor-info">
            <span class="monitor-label">数据库连接</span>
            <span class="monitor-value">{{ dbConnections }}</span>
          </div>
          <div class="monitor-progress">
            <el-progress type="line" :percentage="45" :stroke-width="8" :color="'#38a169'" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

// 统计数据
const caseCount = ref(24)
const todoCount = ref(12)
const clientCount = ref(86)
const messageCount = ref(5)

// 选中的待办事项
const checkedTodos = ref<number[]>([])

// 最近日程
const recentSchedules = ref([
  {
    id: 1,
    title: '案件讨论会',
    content: '与团队讨论XX案件的诉讼策略',
    time: '今天 14:30'
  },
  {
    id: 2,
    title: '客户会见',
    content: '会见客户张先生，讨论案件进展',
    time: '明天 10:00'
  },
  {
    id: 3,
    title: '提交法律文书',
    content: '向法院提交XX案件的答辩状',
    time: '明天 15:00'
  }
])

// 最近待办
const recentTodos = ref([
  {
    id: 1,
    title: '整理案件材料',
    description: '整理XX案件的证据材料',
    time: '2025-12-31'
  },
  {
    id: 2,
    title: '起草法律文书',
    description: '起草XX合同纠纷的起诉状',
    time: '2025-12-31'
  },
  {
    id: 3,
    title: '客户回访',
    description: '回访客户李女士，了解服务满意度',
    time: '2025-12-31'
  }
])

// 最近案件
const recentCases = ref([
  {
    id: 1,
    caseNumber: 'LAW-2025-001',
    title: 'XX合同纠纷',
    status: '进行中',
    client: '张先生'
  },
  {
    id: 2,
    caseNumber: 'LAW-2025-002',
    title: 'XX侵权赔偿',
    status: '已立案',
    client: '李女士'
  },
  {
    id: 3,
    caseNumber: 'LAW-2025-003',
    title: 'XX劳动仲裁',
    status: '已结案',
    client: '王先生'
  }
])

// 最近消息
const recentMessages = ref([
  {
    id: 1,
    sender: '系统通知',
    content: '您有一个新的案件分配',
    time: '今天 14:30'
  },
  {
    id: 2,
    sender: '张先生',
    content: '关于案件的最新进展，我想了解一下',
    time: '今天 13:15'
  },
  {
    id: 3,
    sender: '王律师',
    content: '明天的案件讨论会需要准备一下材料',
    time: '昨天 16:45'
  }
])

// 系统监控数据
const onlineUsers = ref(24)
const serverLoad = ref(45)
const dbConnections = ref(86)

// 图表ref
const caseTrendChartRef = ref<HTMLElement | null>(null)
const incomeTrendChartRef = ref<HTMLElement | null>(null)
const caseTypeChartRef = ref<HTMLElement | null>(null)
const clientRegionChartRef = ref<HTMLElement | null>(null)

// 图表实例
let caseTrendChart: echarts.ECharts | null = null
let incomeTrendChart: echarts.ECharts | null = null
let caseTypeChart: echarts.ECharts | null = null
let clientRegionChart: echarts.ECharts | null = null

// 图表数据
const caseTrendData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  yAxis: [12, 19, 15, 22, 18, 25, 21, 28, 23, 30, 26, 32]
}

const incomeTrendData = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  yAxis: [12000, 19000, 15000, 22000, 18000, 25000, 21000, 28000, 23000, 30000, 26000, 32000]
}

const caseTypeData = {
  categories: ['合同纠纷', '知识产权', '婚姻家庭', '劳动仲裁', '房产纠纷', '刑事辩护'],
  values: [35, 18, 22, 15, 28, 20]
}

const clientRegionData = {
  categories: ['北京', '上海', '广州', '深圳', '杭州', '其他'],
  values: [30, 25, 18, 15, 12, 20]
}

// 初始化图表
const initCharts = () => {
  // 案件增长趋势图
  if (caseTrendChartRef.value) {
    caseTrendChart = echarts.init(caseTrendChartRef.value)
    caseTrendChart.setOption({
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: caseTrendData.xAxis,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          data: caseTrendData.yAxis,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#3182ce'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(49, 130, 206, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(49, 130, 206, 0.05)'
              }
            ])
          }
        }
      ]
    })
  }

  // 收入趋势图
  if (incomeTrendChartRef.value) {
    incomeTrendChart = echarts.init(incomeTrendChartRef.value)
    incomeTrendChart.setOption({
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: incomeTrendData.xAxis,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 12,
          formatter: '{value} 元'
        }
      },
      series: [
        {
          data: incomeTrendData.yAxis,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#4299e1'
              },
              {
                offset: 1,
                color: '#63b3ed'
              }
            ])
          }
        }
      ]
    })
  }

  // 案件类型分布图
  if (caseTypeChartRef.value) {
    caseTypeChart = echarts.init(caseTypeChartRef.value)
    caseTypeChart.setOption({
      title: {
        show: false
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 20,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 12
        }
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
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: caseTypeData.categories.map((category, index) => ({
            name: category,
            value: caseTypeData.values[index]
          })),
          color: [
            '#3182ce',
            '#4299e1',
            '#63b3ed',
            '#90cdf4',
            '#bee3f8',
            '#ebf8ff'
          ]
        }
      ]
    })
  }

  // 客户地域分布图
  if (clientRegionChartRef.value) {
    clientRegionChart = echarts.init(clientRegionChartRef.value)
    clientRegionChart.setOption({
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
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
          fontSize: 12
        }
      },
      yAxis: {
        type: 'category',
        data: clientRegionData.categories,
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          data: clientRegionData.values,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              {
                offset: 0,
                color: '#3182ce'
              },
              {
                offset: 1,
                color: '#63b3ed'
              }
            ])
          }
        }
      ]
    })
  }
}

// 调整图表大小
const handleResize = () => {
  caseTrendChart?.resize()
  incomeTrendChart?.resize()
  caseTypeChart?.resize()
  clientRegionChart?.resize()
}

// 生命周期钩子
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  caseTrendChart?.dispose()
  incomeTrendChart?.dispose()
  caseTypeChart?.dispose()
  clientRegionChart?.dispose()
})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '进行中':
      return 'warning'
    case '已立案':
      return 'success'
    case '已结案':
      return 'info'
    default:
      return 'info'
  }
}

// 查看案件详情
const viewCaseDetail = (id: number) => {
  router.push(`/case/${id}`)
}
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  overflow-x: auto;
  overflow-y: auto;
}

/* 页面标题 */
.page-title {
  margin: 0 0 24px 0;
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 600;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* 统计卡片容器 */
.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

/* 卡片悬停效果 */
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 卡片渐变装饰 */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

/* 案件卡片渐变 */
.case-card::before {
  background: linear-gradient(90deg, var(--accent-color), #63b3ed);
}

/* 待办卡片渐变 */
.todo-card::before {
  background: linear-gradient(90deg, var(--success-color), #68d391);
}

/* 客户卡片渐变 */
.client-card::before {
  background: linear-gradient(90deg, var(--warning-color), #f6ad55);
}

/* 消息卡片渐变 */
.message-card::before {
  background: linear-gradient(90deg, var(--error-color), #fc8181);
}

/* 卡片头部（数字+图标） */
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 统计数字 */
.stat-value {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 统计图标 */
.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
}

/* 图标文字 */
.icon-text {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 图标颜色 */
.case-icon {
  background: linear-gradient(135deg, var(--accent-color), #4299e1);
}

.todo-icon {
  background: linear-gradient(135deg, var(--success-color), #48bb78);
}

.client-icon {
  background: linear-gradient(135deg, var(--warning-color), #ed8936);
}

.message-icon {
  background: linear-gradient(135deg, var(--error-color), #f56565);
}

/* 卡片底部（标签+趋势） */
.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 统计标签 */
.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.stat-card:hover .stat-label {
  color: var(--text-primary);
}

/* 趋势信息 */
.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

/* 趋势图标 */
.trend-icon {
  font-size: 16px;
  font-weight: bold;
}

.trend-icon.up {
  color: var(--success-color);
}

.trend-icon.down {
  color: var(--error-color);
}

/* 趋势值 */
.trend-value {
  transition: color 0.3s ease;
}

.stat-card:hover .trend-value {
  color: var(--text-primary);
}

/* 卡片通用样式 */
.chart-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.02);
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

/* 图表容器 */
.chart-container {
  height: 280px;
  background-color: var(--background-color);
  border-radius: 4px;
  margin: 24px;
}

.chart-content {
  width: 100%;
  height: 100%;
}

/* 图表占位符 */
.chart-placeholder {
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chart-placeholder i {
  font-size: 56px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.chart-placeholder p {
  margin: 0;
  font-size: 14px;
}

/* 日程列表 */
.schedule-list {
  padding: 24px;
}

.schedule-item h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.schedule-item p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 时间线样式优化 */
.el-timeline {
  padding: 0;
}

.el-timeline-item {
  padding-bottom: 24px;
}

.el-timeline-item__timestamp {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

/* 待办列表 */
.todo-list {
  padding: 24px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 16px;
  background-color: var(--background-color);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.todo-item:hover {
  background-color: rgba(49, 130, 206, 0.05);
  border-left: 4px solid var(--accent-color);
}

.todo-checkbox {
  margin-right: 12px;
  margin-top: 2px;
  flex-shrink: 0;
}

.todo-content {
  flex: 1;
}

.todo-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.todo-desc {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.todo-time {
  margin: 0;
  font-size: 12px;
  color: var(--accent-color);
  font-weight: 500;
}

/* 最近案件 */
.recent-cases {
  padding: 24px;
}

/* 最近消息 */
.message-list {
  padding: 24px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.message-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.message-item:hover {
  background-color: rgba(49, 130, 206, 0.05);
  padding: 12px 24px 12px 24px;
  margin: 0 -24px 16px -24px;
  border-radius: 8px;
  border-bottom: none;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color), #63b3ed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-sender {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.message-body {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  word-break: break-word;
}

/* 系统监控 */
.monitor-container {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.monitor-item {
  background-color: var(--background-color);
  padding: 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.monitor-item:hover {
  background-color: rgba(49, 130, 206, 0.05);
  transform: translateY(-2px);
}

.monitor-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.monitor-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.monitor-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.monitor-progress {
  width: 100%;
}

/* 滚动条样式优化 */
.schedule-list::-webkit-scrollbar,
.todo-list::-webkit-scrollbar,
.recent-cases::-webkit-scrollbar,
.message-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.schedule-list::-webkit-scrollbar-track,
.todo-list::-webkit-scrollbar-track,
.recent-cases::-webkit-scrollbar-track,
.message-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.schedule-list::-webkit-scrollbar-thumb,
.todo-list::-webkit-scrollbar-thumb,
.recent-cases::-webkit-scrollbar-thumb,
.message-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.schedule-list::-webkit-scrollbar-thumb:hover,
.todo-list::-webkit-scrollbar-thumb:hover,
.recent-cases::-webkit-scrollbar-thumb:hover,
.message-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-content {
    padding: 20px;
  }

  .stat-value {
    font-size: 32px;
  }

  .chart-container {
    height: 240px;
    margin: 20px;
  }
}
</style>
