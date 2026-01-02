<template>
  <div class="case-stats">
    <h2 class="page-title">案件统计</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">总案件数</div>
            <div class="stat-value">{{ totalCases }}</div>
          </div>
          <div class="stat-icon total">
            <el-icon-data-analysis></el-icon-data-analysis>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">本月新增</div>
            <div class="stat-value">{{ monthCases }}</div>
          </div>
          <div class="stat-icon add">
            <el-icon-plus></el-icon-plus>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">待处理</div>
            <div class="stat-value">{{ pendingCases }}</div>
          </div>
          <div class="stat-icon pending">
            <el-icon-clock></el-icon-clock>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">已完成</div>
            <div class="stat-value">{{ completedCases }}</div>
          </div>
          <div class="stat-icon completed">
            <el-icon-check-circle></el-icon-check-circle>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 案件数量趋势图 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>案件数量趋势</span>
            <el-select v-model="trendType" size="small" @change="handleTrendTypeChange">
              <el-option label="近7天" value="7d"></el-option>
              <el-option label="近30天" value="30d"></el-option>
              <el-option label="近3个月" value="3m"></el-option>
              <el-option label="近1年" value="1y"></el-option>
            </el-select>
          </div>
        </template>
        <div ref="trendChartRef" class="chart"></div>
      </el-card>

      <!-- 案件类型分布 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>案件类型分布</span>
            <el-select v-model="typeChartType" size="small" @change="handleTypeChartTypeChange">
              <el-option label="饼图" value="pie"></el-option>
              <el-option label="环形图" value="doughnut"></el-option>
            </el-select>
          </div>
        </template>
        <div ref="typeChartRef" class="chart"></div>
      </el-card>
    </div>

    <div class="charts-container">
      <!-- 案件状态分布 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>案件状态分布</span>
          </div>
        </template>
        <div ref="statusChartRef" class="chart"></div>
      </el-card>

      <!-- 案件地域分布 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>案件地域分布</span>
          </div>
        </template>
        <div ref="regionChartRef" class="chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

// 统计数据
const totalCases = ref(1258)
const monthCases = ref(156)
const pendingCases = ref(234)
const completedCases = ref(897)

// 图表引用
const trendChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
const regionChartRef = ref<HTMLElement>()

// 图表实例
let trendChart: ECharts | null = null
let typeChart: ECharts | null = null
let statusChart: ECharts | null = null
let regionChart: ECharts | null = null

// 图表配置
const trendType = ref('30d')
const typeChartType = ref('pie')

// 模拟数据
interface TrendData {
  dates: string[];
  values: number[];
}

const caseTrendData: Record<string, TrendData> = {
  '7d': {
    dates: ['1月25日', '1月26日', '1月27日', '1月28日', '1月29日', '1月30日', '1月31日'],
    values: [12, 19, 3, 5, 2, 3, 10]
  },
  '30d': {
    dates: ['1月1日', '1月5日', '1月10日', '1月15日', '1月20日', '1月25日', '1月30日'],
    values: [28, 48, 40, 19, 86, 27, 90]
  },
  '3m': {
    dates: ['11月', '12月', '1月'],
    values: [234, 321, 456]
  },
  '1y': {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    values: [120, 200, 150, 80, 70, 110, 130, 190, 230, 210, 180, 250]
  }
}

const caseTypeData = {
  types: ['民事案件', '刑事案件', '行政案件', '知识产权案件', '婚姻家庭案件', '经济案件'],
  values: [350, 280, 150, 120, 100, 58]
}

const caseStatusData = {
  statuses: ['待处理', '处理中', '已完成', '已归档', '已驳回'],
  values: [234, 356, 458, 120, 90]
}

const caseRegionData = {
  regions: ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '重庆市'],
  values: [234, 189, 156, 134, 120, 98, 87, 76]
}

// 初始化案件数量趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}件'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: (caseTrendData[trendType.value] || { dates: [] }).dates
    },
    yAxis: {
      type: 'value',
      name: '案件数量（件）',
      axisLabel: {
        formatter: '{value}件'
      }
    },
    series: [
      {
        name: '案件数量',
        type: 'line',
        stack: 'Total',
        data: (caseTrendData[trendType.value] || { values: [] }).values,
        smooth: true,
        lineStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化案件类型分布图
const initTypeChart = () => {
  if (!typeChartRef.value) return
  
  typeChart = echarts.init(typeChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}件 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      formatter: '{name}'
    },
    series: [
      {
        name: '案件类型',
        type: typeChartType.value,
        radius: typeChartType.value === 'pie' ? '50%' : ['40%', '70%'],
        center: ['40%', '50%'],
        data: caseTypeData.types.map((type, index) => ({
          name: type,
          value: caseTypeData.values[index]
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }
    ]
  }
  
  typeChart.setOption(option)
}

// 初始化案件状态分布图
const initStatusChart = () => {
  if (!statusChartRef.value) return
  
  statusChart = echarts.init(statusChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}件'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: caseStatusData.statuses
    },
    yAxis: {
      type: 'value',
      name: '案件数量（件）',
      axisLabel: {
        formatter: '{value}件'
      }
    },
    series: [
      {
        name: '案件数量',
        type: 'bar',
        data: caseStatusData.values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        }
      }
    ]
  }
  
  statusChart.setOption(option)
}

// 初始化案件地域分布图
const initRegionChart = () => {
  if (!regionChartRef.value) return
  
  regionChart = echarts.init(regionChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}件'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '案件数量（件）',
      axisLabel: {
        formatter: '{value}件'
      }
    },
    yAxis: {
      type: 'category',
      data: caseRegionData.regions
    },
    series: [
      {
        name: '案件数量',
        type: 'bar',
        data: caseRegionData.values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#f093fb' },
            { offset: 1, color: '#f5576c' }
          ])
        }
      }
    ]
  }
  
  regionChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  typeChart?.resize()
  statusChart?.resize()
  regionChart?.resize()
}

// 处理趋势类型变化
const handleTrendTypeChange = () => {
  if (trendChart) {
    trendChart.setOption({
      xAxis: {
        data: (caseTrendData[trendType.value] || { dates: [] }).dates
      },
      series: [
        {
          data: (caseTrendData[trendType.value] || { values: [] }).values
        }
      ]
    })
  }
}

// 处理类型图表类型变化
const handleTypeChartTypeChange = () => {
  initTypeChart()
}

// 初始化所有图表
const initCharts = () => {
  initTrendChart()
  initTypeChart()
  initStatusChart()
  initRegionChart()
}

// 生命周期钩子
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  trendChart?.dispose()
  typeChart?.dispose()
  statusChart?.dispose()
  regionChart?.dispose()
})
</script>

<style scoped>
.case-stats {
  padding: 0;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.add {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.chart {
  width: 100%;
  height: 300px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart {
    height: 250px;
  }
}
</style>
