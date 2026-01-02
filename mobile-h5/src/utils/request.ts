import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from '@/utils/auth';
import { useUserStore } from '@/stores/user';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    // 如果是二进制数据，直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }
    
    // 统一处理业务错误
    if (res.code !== 200) {
      // 可以在这里添加错误提示
      console.error('请求错误:', res.message);
      
      // 401: 未授权，需要重新登录
      if (res.code === 401) {
        const userStore = useUserStore();
        userStore.resetState();
        window.location.href = '/auth/login';
      }
      
      return Promise.reject(new Error(res.message || 'Error'));
    }
    
    return res;
  },
  (error) => {
    console.error('网络错误:', error.message);
    return Promise.reject(error);
  }
);

export default service;
