<template>
  <div class="finance-stats">
    <h2 class="page-title">财务统计</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">总收入</div>
            <div class="stat-value income">¥{{ totalIncome.toLocaleString() }}</div>
          </div>
          <div class="stat-icon income">
            <el-icon-money></el-icon-money>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">总支出</div>
            <div class="stat-value expense">¥{{ totalExpense.toLocaleString() }}</div>
          </div>
          <div class="stat-icon expense">
            <el-icon-coin></el-icon-coin>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">本月收入</div>
            <div class="stat-value income">¥{{ monthIncome.toLocaleString() }}</div>
          </div>
          <div class="stat-icon month-income">
            <el-icon-plus></el-icon-plus>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">本月支出</div>
            <div class="stat-value expense">¥{{ monthExpense.toLocaleString() }}</div>
          </div>
          <div class="stat-icon month-expense">
            <el-icon-minus></el-icon-minus>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">净利润</div>
            <div class="stat-value profit">¥{{ profit.toLocaleString() }}</div>
          </div>
          <div class="stat-icon profit">
            <el-icon-trophy></el-icon-trophy>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">利润率</div>
            <div class="stat-value profit-rate">{{ profitRate }}%</div>
          </div>
          <div class="stat-icon profit-rate">
            <el-icon-data-analysis></el-icon-data-analysis>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 收支趋势图 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>收支趋势</span>
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

      <!-- 收入来源分布 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>收入来源分布</span>
            <el-select v-model="incomeChartType" size="small" @change="handleIncomeChartTypeChange">
              <el-option label="饼图" value="pie"></el-option>
              <el-option label="环形图" value="doughnut"></el-option>
            </el-select>
          </div>
        </template>
        <div ref="incomeChartRef" class="chart"></div>
      </el-card>
    </div>

    <div class="charts-container">
      <!-- 支出分类分布 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>支出分类分布</span>
          </div>
        </template>
        <div ref="expenseChartRef" class="chart"></div>
      </el-card>

      <!-- 月度收支对比 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>月度收支对比</span>
          </div>
        </template>
        <div ref="monthlyChartRef" class="chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

// 统计数据
const totalIncome = ref(1258000)
const totalExpense = ref(458000)
const monthIncome = ref(156000)
const monthExpense = ref(68000)

// 计算属性
const profit = computed(() => totalIncome.value - totalExpense.value)
const profitRate = computed(() => {
  if (totalIncome.value === 0) return 0
  return ((totalIncome.value - totalExpense.value) / totalIncome.value * 100).toFixed(2)
})

// 图表引用
const trendChartRef = ref<HTMLElement>()
const incomeChartRef = ref<HTMLElement>()
const expenseChartRef = ref<HTMLElement>()
const monthlyChartRef = ref<HTMLElement>()

// 图表实例
let trendChart: ECharts | null = null
let incomeChart: ECharts | null = null
let expenseChart: ECharts | null = null
let monthlyChart: ECharts | null = null

// 图表配置
const trendType = ref('30d')
const incomeChartType = ref('pie')

// 模拟数据
interface FinanceTrendData {
  dates: string[];
  income: number[];
  expense: number[];
}

const financeTrendData: Record<string, FinanceTrendData> = {
  '7d': {
    dates: ['1月25日', '1月26日', '1月27日', '1月28日', '1月29日', '1月30日', '1月31日'],
    income: [12000, 19000, 30000, 50000, 20000, 30000, 100000],
    expense: [5000, 8000, 15000, 20000, 10000, 12000, 35000]
  },
  '30d': {
    dates: ['1月1日', '1月5日', '1月10日', '1月15日', '1月20日', '1月25日', '1月30日'],
    income: [28000, 48000, 40000, 190000, 86000, 27000, 90000],
    expense: [10000, 15000, 12000, 80000, 35000, 10000, 30000]
  },
  '3m': {
    dates: ['11月', '12月', '1月'],
    income: [234000, 321000, 456000],
    expense: [89000, 112000, 168000]
  },
  '1y': {
    dates: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    income: [120000, 200000, 150000, 180000, 270000, 310000, 230000, 390000, 430000, 310000, 380000, 450000],
    expense: [50000, 80000, 60000, 70000, 100000, 120000, 90000, 150000, 180000, 120000, 150000, 168000]
  }
}

const incomeSourceData = {
  sources: ['案件收入', '咨询收入', '顾问费', '其他收入'],
  values: [850000, 200000, 150000, 58000]
}

const expenseCategoryData = {
  categories: ['人员工资', '办公费用', '营销费用', '其他支出'],
  values: [250000, 80000, 70000, 58000]
}

const monthlyCompareData = {
  months: ['1月', '2月', '3月', '4月', '5月', '6月'],
  income: [156000, 200000, 180000, 220000, 250000, 280000],
  expense: [68000, 80000, 75000, 90000, 100000, 110000]
}

// 初始化收支趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = params[0].name + '<br/>'
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['收入', '支出'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: '15%'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: (financeTrendData[trendType.value] || { dates: [] }).dates
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        stack: 'Total',
        data: (financeTrendData[trendType.value] || { income: [] }).income,
        smooth: true,
        lineStyle: {
          color: '#52c41a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(82, 196, 26, 0.5)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
          ])
        }
      },
      {
        name: '支出',
        type: 'line',
        stack: 'Total',
        data: (financeTrendData[trendType.value] || { expense: [] }).expense,
        smooth: true,
        lineStyle: {
          color: '#ff4d4f'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 77, 79, 0.5)' },
            { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
          ])
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化收入来源分布图
const initIncomeChart = () => {
  if (!incomeChartRef.value) return
  
  incomeChart = echarts.init(incomeChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      formatter: '{name}'
    },
    series: [
      {
        name: '收入来源',
        type: incomeChartType.value,
        radius: incomeChartType.value === 'pie' ? '50%' : ['40%', '70%'],
        center: ['40%', '50%'],
        data: incomeSourceData.sources.map((source, index) => ({
          name: source,
          value: incomeSourceData.values[index]
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
  
  incomeChart.setOption(option)
}

// 初始化支出分类分布图
const initExpenseChart = () => {
  if (!expenseChartRef.value) return
  
  expenseChart = echarts.init(expenseChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: expenseCategoryData.categories
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '支出金额',
        type: 'bar',
        data: expenseCategoryData.values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff4d4f' },
            { offset: 1, color: '#cf1322' }
          ])
        }
      }
    ]
  }
  
  expenseChart.setOption(option)
}

// 初始化月度收支对比图
const initMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  
  monthlyChart = echarts.init(monthlyChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        let result = params[0].name + '<br/>'
        params.forEach((item: any) => {
          result += `${item.marker}${item.seriesName}: ¥${item.value.toLocaleString()}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['收入', '支出'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: monthlyCompareData.months
    },
    yAxis: {
      type: 'value',
      name: '金额（元）',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: monthlyCompareData.income,
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '支出',
        type: 'bar',
        data: monthlyCompareData.expense,
        itemStyle: {
          color: '#ff4d4f'
        }
      }
    ]
  }
  
  monthlyChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  incomeChart?.resize()
  expenseChart?.resize()
  monthlyChart?.resize()
}

// 处理趋势类型变化
const handleTrendTypeChange = () => {
  if (trendChart) {
    trendChart.setOption({
      xAxis: {
        data: (financeTrendData[trendType.value] || { dates: [] }).dates
      },
      series: [
        {
          data: (financeTrendData[trendType.value] || { income: [] }).income
        },
        {
          data: (financeTrendData[trendType.value] || { expense: [] }).expense
        }
      ]
    })
  }
}

// 处理收入图表类型变化
const handleIncomeChartTypeChange = () => {
  initIncomeChart()
}

// 初始化所有图表
const initCharts = () => {
  initTrendChart()
  initIncomeChart()
  initExpenseChart()
  initMonthlyChart()
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
  incomeChart?.dispose()
  expenseChart?.dispose()
  monthlyChart?.dispose()
})
</script>

<style scoped>
.finance-stats {
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
  font-size: 24px;
  font-weight: bold;
}

.stat-value.income {
  color: #52c41a;
}

.stat-value.expense {
  color: #ff4d4f;
}

.stat-value.profit {
  color: #faad14;
}

.stat-value.profit-rate {
  color: #1890ff;
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

.stat-icon.income {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.stat-icon.expense {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
}

.stat-icon.month-income {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.stat-icon.month-expense {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.stat-icon.profit {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.stat-icon.profit-rate {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
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
