import request from '@/utils/request';

// 登录
export function loginApi(data: { username: string; password: string }) {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  });
}

// 获取用户信息
export function getUserInfoApi() {
  return request({
    url: '/api/user/info',
    method: 'get'
  });
}

// 登出
export function logoutApi() {
  return request({
    url: '/api/user/logout',
    method: 'post'
  });
}
