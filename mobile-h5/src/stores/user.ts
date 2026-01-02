import { defineStore } from 'pinia';
import { loginApi, getUserInfoApi, logoutApi } from '@/api/user';
import { setToken, getToken, removeToken } from '@/utils/auth';

interface UserState {
  token: string | null;
  userInfo: any;
  permissions: string[];
  roles: string[];
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken(),
    userInfo: null,
    permissions: [],
    roles: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission);
    }
  },

  actions: {
    // 登录
    async login(loginForm: { username: string; password: string; remember: boolean }) {
      try {
        const response = await loginApi(loginForm);
        const { token } = response.data;
        this.token = token;
        setToken(token, loginForm.remember);
        return response;
      } catch (error) {
        throw error;
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await getUserInfoApi();
        const { userInfo, permissions, roles } = response.data;
        this.userInfo = userInfo;
        this.permissions = permissions;
        this.roles = roles;
        return response;
      } catch (error) {
        throw error;
      }
    },

    // 登出
    async logout() {
      try {
        await logoutApi();
      } finally {
        this.resetState();
      }
    },

    // 重置状态
    resetState() {
      this.token = null;
      this.userInfo = null;
      this.permissions = [];
      this.roles = [];
      removeToken();
    }
  }
});
