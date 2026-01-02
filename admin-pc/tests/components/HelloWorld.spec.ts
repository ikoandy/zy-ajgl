import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../../src/components/HelloWorld.vue'

describe('HelloWorld Component', () => {
  it('should render the component with correct props', () => {
    const wrapper = mount(HelloWorld, {
      props: {
        msg: 'Hello Test'
      }
    })
    
    expect(wrapper.text()).toContain('Hello Test')
  })

  it('should increment count when button is clicked', async () => {
    const wrapper = mount(HelloWorld, {
      props: {
        msg: 'Hello Test'
      }
    })
    
    // 初始count应该是0
    expect(wrapper.text()).toContain('count is 0')
    
    // 找到按钮并点击
    const button = wrapper.find('button')
    await button.trigger('click')
    
    // count应该变成1
    expect(wrapper.text()).toContain('count is 1')
    
    // 再次点击
    await button.trigger('click')
    expect(wrapper.text()).toContain('count is 2')
  })

  it('should contain Vite and Vue links', () => {
    const wrapper = mount(HelloWorld, {
      props: {
        msg: 'Hello Test'
      }
    })
    
    expect(wrapper.find('a[href*="vuejs.org"]').exists()).toBe(true)
    expect(wrapper.find('.read-the-docs').exists()).toBe(true)
  })
})
