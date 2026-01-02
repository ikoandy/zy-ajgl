import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

// 扩展AxiosRequestConfig类型
interface RequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean
}

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求加载
let loadingInstance: any = null

// 请求拦截器
service.interceptors.request.use(
  (config: RequestConfig) => {
    // 显示加载状态
    if (config.loading !== false) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    
    // 添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    // 关闭加载
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    
    ElMessage.error('请求发送失败')
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 关闭加载
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    
    const res = response.data
    
    // 处理不同的响应状态码
    if (res.code !== 200) {
      // 登录过期，重定向到登录页
      if (res.code === 401) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(new Error(res.message || 'Error'))
      }
      
      // 其他错误状态
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    
    return res
  },
  (error) => {
    // 关闭加载
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    
    // 处理网络错误
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error(error.response?.data?.message || '服务器错误')
    }
    
    return Promise.reject(error)
  }
)

export default service
