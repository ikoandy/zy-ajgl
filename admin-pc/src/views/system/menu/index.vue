<template>
  <div class="menu-management">
    <h2 class="page-title">菜单管理</h2>
    
    <el-card shadow="hover" class="content-card">
      <!-- 操作区 -->
      <div class="operation-area">
        <el-button type="primary" @click="handleAddRoot">
          <el-icon><Plus /></el-icon> 新增根菜单
        </el-button>
        <el-button type="success" @click="handleAddChild" :disabled="!selectedMenu">
          <el-icon><Plus /></el-icon> 新增子菜单
        </el-button>
        <el-button type="primary" @click="handleEdit" :disabled="!selectedMenu">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <el-button type="danger" @click="handleDelete" :disabled="!selectedMenu">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
      </div>

      <!-- 菜单树 -->
      <div class="menu-tree-area">
        <el-tree
          ref="menuTreeRef"
          :data="menuList"
          :props="defaultProps"
          node-key="id"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          class="menu-tree"
        >
          <template #default="{ data }">
            <div class="menu-node-content">
              <el-icon v-if="data.icon && iconComponents[data.icon]">
                <component :is="iconComponents[data.icon]" />
              </el-icon>
              <span>{{ data.title }}</span>
              <div class="menu-node-actions">
                <el-button type="text" size="small" @click.stop="handleAddChild(data)">
                  <el-icon><Plus /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click.stop="handleEdit(data)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click.stop="handleDelete(data)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuRules"
        label-width="100px"
      >
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="menuForm.title" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入菜单路径"></el-input>
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请输入图标名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="menuForm.orderNum" :min="0" :max="9999"></el-input-number>
        </el-form-item>
        <el-form-item label="是否可见" prop="visible">
          <el-switch v-model="menuForm.visible"></el-switch>
        </el-form-item>
        <el-form-item label="是否缓存" prop="keepAlive">
          <el-switch v-model="menuForm.keepAlive"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Edit, Delete, DataLine, Setting, User, Suitcase, Menu, 
  FolderOpened, User as UserIcon, DataAnalysis, Money, DocumentCopy, 
  Timer as TimeIcon, Edit as EditIcon
} from '@element-plus/icons-vue'

// 注册所有可能用到的图标组件
const iconComponents: Record<string, any> = {
  DataLine,
  Setting,
  User,
  Suitcase,
  Menu,
  FolderOpened,
  UserSolid: UserIcon,
  DataAnalysis,
  Money,
  DocumentCopy,
  Time: TimeIcon,
  EditOutline: EditIcon
}

// 菜单树配置
const defaultProps = {
  children: 'children',
  label: 'title'
}

// 定义菜单类型
interface MenuItem {
  id: number
  title: string
  path: string
  component: string
  icon: string
  orderNum: number
  visible: boolean
  keepAlive: boolean
  children?: MenuItem[]
}

// 菜单列表
const menuList = ref<MenuItem[]>([
  {
    id: 1,
    title: '仪表盘',
    path: '/dashboard',
    component: 'dashboard/index.vue',
    icon: 'DataLine',
    orderNum: 1,
    visible: true,
    keepAlive: false
  },
  {
    id: 2,
    title: '系统管理',
    path: '/system',
    component: '',
    icon: 'Setting',
    orderNum: 2,
    visible: true,
    keepAlive: false,
    children: [
      {
        id: 21,
        title: '用户管理',
        path: '/system/user',
        component: 'system/user/index.vue',
        icon: 'User',
        orderNum: 1,
        visible: true,
        keepAlive: false
      },
      {
        id: 22,
        title: '角色管理',
        path: '/system/role',
        component: 'system/role/index.vue',
        icon: 'Suitcase',
        orderNum: 2,
        visible: true,
        keepAlive: false
      },
      {
        id: 23,
        title: '菜单管理',
        path: '/system/menu',
        component: 'system/menu/index.vue',
        icon: 'Menu',
        orderNum: 3,
        visible: true,
        keepAlive: false
      }
    ]
  },
  {
    id: 3,
    title: '案件管理',
    path: '/case',
    component: 'case/index.vue',
    icon: 'FolderOpened',
    orderNum: 3,
    visible: true,
    keepAlive: false
  },
  {
    id: 4,
    title: '客户管理',
    path: '/client',
    component: 'client/index.vue',
    icon: 'UserSolid',
    orderNum: 4,
    visible: true,
    keepAlive: false
  },
  {
    id: 5,
    title: '律师管理',
    path: '/lawyer',
    component: 'lawyer/index.vue',
    icon: 'Suitcase',
    orderNum: 5,
    visible: true,
    keepAlive: false
  },
  {
    id: 6,
    title: '统计分析',
    path: '/stats',
    component: '',
    icon: 'DataAnalysis',
    orderNum: 6,
    visible: true,
    keepAlive: false,
    children: [
      {
        id: 61,
        title: '案件统计',
        path: '/stats/case',
        component: 'stats/case/index.vue',
        icon: 'DataLine',
        orderNum: 1,
        visible: true,
        keepAlive: false
      },
      {
        id: 62,
        title: '财务统计',
        path: '/stats/finance',
        component: 'stats/finance/index.vue',
        icon: 'Money',
        orderNum: 2,
        visible: true,
        keepAlive: false
      }
    ]
  },
  {
    id: 7,
    title: '日志管理',
    path: '/log',
    component: '',
    icon: 'DocumentCopy',
    orderNum: 7,
    visible: true,
    keepAlive: false,
    children: [
      {
        id: 71,
        title: '登录日志',
        path: '/log/login',
        component: 'log/login/index.vue',
        icon: 'Time',
        orderNum: 1,
        visible: true,
        keepAlive: false
      },
      {
        id: 72,
        title: '操作日志',
        path: '/log/operation',
        component: 'log/operation/index.vue',
        icon: 'EditOutline',
        orderNum: 2,
        visible: true,
        keepAlive: false
      }
    ]
  }
])

// 选中的菜单
const selectedMenu = ref<any>(null)

// 对话框配置
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const dialogData = reactive({ id: '', parentId: '' })

// 表单配置
const menuFormRef = ref()
const menuForm = reactive({
  title: '',
  path: '',
  component: '',
  icon: '',
  orderNum: 0,
  visible: true,
  keepAlive: false
})

// 表单验证规则
const menuRules = {
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 1, max: 20, message: '菜单名称长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
}

// 节点点击事件
const handleNodeClick = (data: MenuItem) => {
  selectedMenu.value = data
}

// 新增根菜单
const handleAddRoot = (): void => {
  dialogTitle.value = '新增根菜单'
  dialogData.id = ''
  dialogData.parentId = ''
  // 重置表单
  menuForm.title = ''
  menuForm.path = ''
  menuForm.component = ''
  menuForm.icon = ''
  menuForm.orderNum = 0
  menuForm.visible = true
  menuForm.keepAlive = false
  dialogVisible.value = true
}

// 新增子菜单
const handleAddChild = (data?: MenuItem): void => {
  dialogTitle.value = '新增子菜单'
  dialogData.id = ''
  dialogData.parentId = data?.id?.toString() || ''
  // 重置表单
  menuForm.title = ''
  menuForm.path = ''
  menuForm.component = ''
  menuForm.icon = ''
  menuForm.orderNum = 0
  menuForm.visible = true
  menuForm.keepAlive = false
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (data: MenuItem): void => {
  dialogTitle.value = '编辑菜单'
  dialogData.id = data.id.toString()
  dialogData.parentId = ''
  // 填充表单数据
  menuForm.title = data.title
  menuForm.path = data.path
  menuForm.component = data.component
  menuForm.icon = data.icon
  menuForm.orderNum = data.orderNum
  menuForm.visible = data.visible
  menuForm.keepAlive = data.keepAlive
  dialogVisible.value = true
}

// 删除菜单
const handleDelete = (data: MenuItem) => {
  // 检查是否有子菜单
  const hasChildren = data.children && data.children.length > 0
  const confirmMessage = hasChildren 
    ? '该菜单包含子菜单，确定要删除吗？' 
    : '确定要删除该菜单吗？'
  
  ElMessageBox.confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 删除菜单
    const deleteMenu = (menuList: MenuItem[], id: number): MenuItem[] => {
      return menuList.filter(menu => {
        if (menu.id === id) {
          return false
        }
        if (menu.children) {
          menu.children = deleteMenu(menu.children, id)
        }
        return true
      })
    }
    
    menuList.value = deleteMenu(menuList.value, data.id)
    selectedMenu.value = null // 清空选中状态
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 生成唯一ID
const generateUniqueId = (): number => {
  const getMaxId = (menu: MenuItem): number => {
    const childMaxIds = menu.children ? menu.children.map((child: MenuItem) => getMaxId(child)) : [0]
    return Math.max(menu.id, ...childMaxIds)
  }
  
  const maxId = Math.max(...menuList.value.map(menu => getMaxId(menu)), 0)
  return maxId + 1
}

// 对话框确认
const handleDialogConfirm = async () => {
  if (!menuFormRef.value) return
  try {
    const valid = await menuFormRef.value.validate()
    if (valid) {
      if (dialogData.id) {
        // 编辑菜单
        const updateMenu = (menuList: MenuItem[], id: number, updatedData: Partial<MenuItem>): MenuItem[] => {
          return menuList.map(menu => {
            if (menu.id === id) {
              return { ...menu, ...updatedData }
            }
            if (menu.children) {
              return { ...menu, children: updateMenu(menu.children, id, updatedData) }
            }
            return menu
          })
        }
        menuList.value = updateMenu(menuList.value, parseInt(dialogData.id), {
          title: menuForm.title,
          path: menuForm.path,
          component: menuForm.component,
          icon: menuForm.icon,
          orderNum: menuForm.orderNum,
          visible: menuForm.visible,
          keepAlive: menuForm.keepAlive
        })
        ElMessage.success('编辑成功')
      } else {
        // 新增菜单
        const newMenu: MenuItem = {
          id: generateUniqueId(),
          title: menuForm.title,
          path: menuForm.path,
          component: menuForm.component,
          icon: menuForm.icon,
          orderNum: menuForm.orderNum,
          visible: menuForm.visible,
          keepAlive: menuForm.keepAlive
        }
        
        if (dialogData.parentId) {
          // 新增子菜单
          const addChildMenu = (menuList: MenuItem[], parentId: number, childMenu: MenuItem): MenuItem[] => {
            return menuList.map(menu => {
              if (menu.id === parentId) {
                return {
                  ...menu,
                  children: [...(menu.children || []), childMenu]
                }
              }
              if (menu.children) {
                return {
                  ...menu,
                  children: addChildMenu(menu.children, parentId, childMenu)
                }
              }
              return menu
            })
          }
          menuList.value = addChildMenu(menuList.value, parseInt(dialogData.parentId), newMenu)
        } else {
          // 新增根菜单
          menuList.value.push(newMenu)
        }
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.menu-management {
  padding: 0;
}

.operation-area {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.menu-tree-area {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  height: 600px;
  overflow-y: auto;
  background: #fafafa;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.menu-tree {
  background: transparent;
}

.menu-tree :deep(.el-tree-node) {
  margin: 8px 0;
}

.menu-tree :deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-tree :deep(.el-tree-node__content:hover) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateX(4px);
}

.menu-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.menu-tree :deep(.el-tree-node__expand-icon) {
  color: #94a3b8;
}

.menu-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.menu-node-content :deep(.el-icon) {
  margin-right: 12px;
  font-size: 16px;
  color: #667eea;
}

.menu-node-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-node-content:hover .menu-node-actions {
  opacity: 1;
}

.menu-node-actions :deep(.el-button) {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.menu-node-actions :deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 自定义滚动条 */
.menu-tree-area::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.menu-tree-area::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.menu-tree-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.menu-tree-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
