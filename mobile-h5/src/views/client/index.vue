<template>
  <div class="client-container">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchValue"
      placeholder="搜索客户"
      shape="round"
      @search="handleSearch"
    />
    
    <!-- 筛选条件 -->
    <div class="client-filters">
      <van-tabs v-model:active="activeFilter" @change="handleFilterChange">
        <van-tab title="全部" name="all" />
        <van-tab title="活跃" name="active" />
        <van-tab title="休眠" name="inactive" />
        <van-tab title="流失" name="lost" />
      </van-tabs>
    </div>
    
    <!-- 客户列表 -->
    <div class="client-list">
      <van-cell-group>
        <van-cell
          v-for="item in clientList"
          :key="item.id"
          :title="item.name"
          :label="item.phone"
          is-link
          @click="handleClientClick(item)"
        >
          <template #icon>
            <van-image
              round
              fit="cover"
              :src="item.avatar || defaultAvatar"
              :width="40"
              :height="40"
            />
          </template>
          <template #right-icon>
            <van-tag :type="getStatusTagType(item.status)">
              {{ getStatusLabel(item.status) }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>
      
      <!-- 加载更多 -->
      <div class="client-load-more">
        <van-loading type="spinner" v-if="loading" />
        <div v-else-if="hasMore" class="load-more-text" @click="handleLoadMore">
          加载更多
        </div>
        <div v-else class="no-more-text">
          没有更多数据了
        </div>
      </div>
    </div>
    
    <!-- 浮动操作按钮 -->
    <van-floating-action-button @click="handleCreateClient" icon="plus" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg';

// 搜索值
const searchValue = ref('');
// 当前激活的筛选标签
const activeFilter = ref('all');
// 加载状态
const loading = ref(false);
// 是否有更多数据
const hasMore = ref(true);
// 分页参数
const page = ref(1);
const pageSize = ref(10);

// 客户列表数据
const clientList = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    avatar: '',
    status: 'active',
    type: 'personal'
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138001',
    avatar: '',
    status: 'active',
    type: 'enterprise'
  },
  {
    id: 3,
    name: '王五',
    phone: '13800138002',
    avatar: '',
    status: 'inactive',
    type: 'personal'
  },
  {
    id: 4,
    name: '赵六',
    phone: '13800138003',
    avatar: '',
    status: 'lost',
    type: 'enterprise'
  },
  {
    id: 5,
    name: '钱七',
    phone: '13800138004',
    avatar: '',
    status: 'active',
    type: 'personal'
  }
]);

// 获取客户状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '休眠',
    lost: '流失'
  };
  return statusMap[status] || status;
};

// 获取客户状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    active: 'success',
    inactive: 'warning',
    lost: 'danger'
  };
  return typeMap[status] || undefined;
};

// 处理搜索
const handleSearch = (value: string) => {
  console.log('搜索:', value);
  // 实际项目中这里应该调用搜索API
};

// 处理筛选标签变化
const handleFilterChange = (name: string) => {
  console.log('筛选:', name);
  // 实际项目中这里应该根据筛选条件重新获取数据
};

// 处理客户点击
const handleClientClick = (clientItem: any) => {
  router.push(`/client/detail/${clientItem.id}`);
};

// 处理加载更多
const handleLoadMore = () => {
  if (loading.value) return;
  
  loading.value = true;
  // 模拟加载更多数据
  setTimeout(() => {
    loading.value = false;
    hasMore.value = false;
  }, 1000);
};

// 处理创建客户
const handleCreateClient = () => {
  router.push('/client/create');
};

// 生命周期钩子
onMounted(() => {
  // 初始化数据
});
</script>

<style scoped>
.client-container {
  padding-bottom: 80px; /* 为浮动按钮留出空间 */
}

.client-filters {
  margin-bottom: 10px;
}

.client-list {
  background-color: #fff;
}

.client-load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fff;
}

.load-more-text {
  color: #1989fa;
  font-size: 14px;
}

.no-more-text {
  color: #999;
  font-size: 14px;
}
</style>
