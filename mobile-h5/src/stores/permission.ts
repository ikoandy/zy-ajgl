import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

interface PermissionState {
  routes: RouteRecordRaw[];
  addRoutes: RouteRecordRaw[];
  permissions: string[];
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    permissions: []
  }),

  getters: {
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission);
    }
  },

  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.addRoutes = routes;
      this.routes = routes;
    },

    setPermissions(permissions: string[]) {
      this.permissions = permissions;
    },

    generateRoutes(permissions: string[]) {
      // 这里应该根据权限过滤异步路由
      // 暂时返回空数组，后续实现
      const accessedRoutes: RouteRecordRaw[] = [];
      this.setRoutes(accessedRoutes);
      this.setPermissions(permissions);
      return accessedRoutes;
    }
  }
});
