import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 配置Vue Test Utils
config.global.plugins = [ElementPlus]
config.global.stubs = {
  transition: false,
  'transition-group': false
}
