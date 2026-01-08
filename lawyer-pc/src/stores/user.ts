import { defineStore } from 'pinia'

export interface UserInfo {
  username: string
  realName: string
  avatar: string
  status: string
  position: string
  lawFirm: string
  professionalField: string
  practiceYears: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      username: '律师用户',
      realName: '王律师',
      avatar: '',
      status: '在线',
      position: '高级合伙人',
      lawFirm: '北京市XX律师事务所',
      professionalField: '合同纠纷、知识产权、企业法律顾问',
      practiceYears: '15'
    } as UserInfo
  }),
  
  actions: {
    // 初始化用户信息
    initUserInfo() {
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        try {
          this.userInfo = { ...this.userInfo, ...JSON.parse(storedUserInfo) }
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
    },
    
    // 更新用户信息
    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
    
    // 更新头像
    updateAvatar(avatarUrl: string) {
      this.userInfo.avatar = avatarUrl
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },
    
    // 清除用户信息
    clearUserInfo() {
      this.userInfo = {
        username: '律师用户',
        realName: '王律师',
        avatar: '',
        status: '在线',
        position: '高级合伙人',
        lawFirm: '北京市XX律师事务所',
        professionalField: '合同纠纷、知识产权、企业法律顾问',
        practiceYears: '15'
      }
      localStorage.removeItem('userInfo')
    }
  }
})