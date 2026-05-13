<template>
  <view 
    class="tab-bar"
    :style="{
      height: `${style.height}`,
      backgroundColor: style.backgroundColor,
    }"
  >
    <!-- 左侧导航项 -->
    <view v-for="(item, index) in leftItems" :key="index">
      <view 
        class="tab-item"
        :class="{ 
          active: currentPath === item.pagePath,
          disabled: isNavigating
        }"
        @click="handleItemClick(item)"
      >
        <image 
          class="tab-icon"
          :src="currentPath === item.pagePath ? item.selectedIconPath : item.iconPath"
          :style="{ width: `${style.iconSize}`, height: `${style.iconSize}` }"
          mode="widthFix"
        ></image>
        
        <text 
          class="tab-text"
          :style="{
            color: currentPath === item.pagePath ? style.activeColor : style.inactiveColor,
            fontWeight: currentPath === item.pagePath ? 'bolder' : 'normal',
            fontSize: style.fontSize
          }"
        >
          {{ item.text }}
        </text>
        
        <!-- 消息提示 -->
        <view v-if="item.badge" class="badge">{{ item.badge }}</view>
      </view>
    </view>
    
    <!-- 中间按钮 -->
    <view 
      v-if="midButton.show" 
      class="mid-button"
      :class="{ disabled: isNavigating }"
      @click="handleMidButtonClick"
    >
      <view class="mid-button-content">
        <image 
          :src="midButton.selectedIconPath || midButton.iconPath"
          :style="{ 
            width: midButton.width, 
            height: midButton.height,
            border: '4rpx solid #323238',
            borderRadius: '100%' 
          }"
        ></image>
        <text
          class="mid-tab-text"
          :style="{
            color: currentPath === midButton.pagePath ? style.activeColor : style.inactiveColor,
            fontWeight: currentPath === midButton.pagePath ? 'bolder' : 'normal',
            fontSize: style.fontSize
          }"
        >
          {{ midButton.text }}
        </text>
      </view>
    </view>
    
    <!-- 右侧导航项 -->
    <view v-for="(item, index) in rightItems" :key="index">
      <view 
        class="tab-item"
        :class="{ 
          active: currentPath === item.pagePath,
          disabled: isNavigating
        }"
        @click="handleItemClick(item)"
      >
        <image 
          class="tab-icon"
          :src="currentPath === item.pagePath ? item.selectedIconPath : item.iconPath"
          :style="{ width: `${style.iconSize}`, height: `${style.iconSize}` }"
          mode="widthFix"
        ></image>
        
        <text 
          class="tab-text"
          :style="{
            color: currentPath === item.pagePath ? style.activeColor : style.inactiveColor,
            fontWeight: currentPath === item.pagePath ? 'bolder' : 'normal',
            fontSize: style.fontSize
          }"
        >
          {{ item.text }}
        </text>
        
        <!-- 消息提示 -->
        <view v-if="item.badge" class="badge">{{ item.badge }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, defineEmits } from 'vue'

// 导入配置
import tabBarConfig from '@/config/tabBarConfig.js'
const { style, midButton, items } = tabBarConfig

// 1. 定义可派发的事件 - 移除，因为不再需要组件内部emit
// const emit = defineEmits(['tabChange', 'tabReclick']);

// 响应式数据
const currentPath = ref('')
const safeAreaInsets = ref({ bottom: 0 })
const isNavigating = ref(false)

// 获取当前页面路径
const getCurrentPath = () => {
  let path = ''
  // 微信小程序环境
  if (typeof getCurrentPages === 'function') {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      path = '/' + (currentPage.route || currentPage.$page?.route || '')
    }
  }
  // H5环境
  else if (typeof window !== 'undefined' && window.location) {
    path = window.location.pathname
    // 处理 hash 路由
    if (window.location.hash && path === '/') {
      const hashPath = window.location.hash.replace('#', '')
      if (hashPath) path = hashPath.startsWith('/') ? hashPath : '/' + hashPath
    }
    // 处理 index.html
    if (path.endsWith('/index.html')) path = path.replace('/index.html', '')
    if (path === '') path = '/'
  }
  return path
}

// 初始化当前路径
currentPath.value = getCurrentPath()

// 安全区域适配
try {
  const systemInfo = uni.getSystemInfoSync()
  safeAreaInsets.value = systemInfo.safeAreaInsets || { bottom: 0 }
} catch (error) {
  console.warn('获取系统信息失败:', error)
}

// 分割左右导航项
const splitIndex = computed(() => Math.floor(items.length / 2))
const leftItems = computed(() => items.slice(0, splitIndex.value))
const rightItems = computed(() => items.slice(splitIndex.value))

// 更新当前路径
const updateCurrentPath = () => {
  const newPath = getCurrentPath()
  if (newPath && newPath !== currentPath.value) currentPath.value = newPath
  isNavigating.value = false
}

// 防抖函数保持不变
const throttle = (func, delay) => {
  let timeoutId = null
  let lastExecTime = 0
  return function (...args) {
    return new Promise((resolve, reject) => {
      const currentTime = Date.now()
      const remainingTime = delay - (currentTime - lastExecTime)

      if (timeoutId) clearTimeout(timeoutId)

      if (remainingTime <= 0) {
        lastExecTime = currentTime
        try {
          const result = func.apply(this, args)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      } else {
        timeoutId = setTimeout(() => {
          lastExecTime = Date.now()
          try {
            const result = func.apply(this, args)
            resolve(result)
          } catch (err) {
            reject(err)
          }
        }, remainingTime)
      }
    })
  }
}

// 页面跳转函数
const navigateTo = async (path, isTab = false) => {
  if (isNavigating.value) return
  if (currentPath.value === path) return

  isNavigating.value = true
  
  try {
    currentPath.value = path
    if (typeof uni !== 'undefined') {
      if (isTab) {
        await new Promise((resolve, reject) => {
          uni.switchTab({ url: path, success: resolve, fail: reject })
        })
      } else {
        $page.open(path)
      }
    } else if (typeof window !== 'undefined') {
      if (isTab) uni.switchTab({ url: path })
      else $page.open(path)
    }
    return path
  } catch (err) {
    console.error('导航失败:', err)
    currentPath.value = getCurrentPath()
    throw err
  } finally {
    setTimeout(() => isNavigating.value = false, 400)
  }
}

// 防抖导航函数
const throttledNavigate = throttle(navigateTo, 100)

// 监听页面显示
const onPageShow = () => {
  setTimeout(updateCurrentPath, 100)
}

// 设置 H5 路由监听
const setupH5RouterListener = () => {
  if (typeof window === 'undefined') return
  window.addEventListener('popstate', () => setTimeout(updateCurrentPath, 50))
  window.addEventListener('hashchange', () => setTimeout(updateCurrentPath, 50))
  if (typeof uni !== 'undefined') {
    uni.$on('onRouteSuccess', () => setTimeout(updateCurrentPath, 50))
  }
}

// 2. 全局事件触发函数
const triggerTabChange = (tabInfo) => {
  // 触发全局事件，让当前页面监听
  if (typeof uni !== 'undefined') {
    uni.$emit('onGlobalTabChange', tabInfo)
  }
}

const triggerTabReclick = (tabInfo) => {
  if (typeof uni !== 'undefined') {
    uni.$emit('onGlobalTabReclick', tabInfo)
  }
}

// 组件生命周期
onMounted(() => {
  updateCurrentPath()
  if (typeof uni !== 'undefined') {
    uni.$on('onTabBarPageShow', onPageShow)
    uni.$on('onPageShow', onPageShow)
    
    // 劫持路由方法
    const originalSwitchTab = uni.switchTab
    uni.switchTab = function(options) {
      const url = options.url
      currentPath.value = url
      isNavigating.value = true
      setTimeout(() => isNavigating.value = false, 400)
      return originalSwitchTab.call(this, options)
    }
    
    // H5环境处理
    if (typeof window !== 'undefined') {
      setupH5RouterListener()
      let lastH5Path = getCurrentPath()
      const pathCheckInterval = setInterval(() => {
        const currentH5Path = getCurrentPath()
        if (currentH5Path !== lastH5Path) {
          lastH5Path = currentH5Path
          updateCurrentPath()
        }
      }, 300)
      window._tabBarPathCheck = pathCheckInterval
    }
  }
})

onUnmounted(() => {
  if (typeof uni !== 'undefined') {
    uni.$off('onTabBarPageShow', onPageShow)
    uni.$off('onPageShow', onPageShow)
  }
  if (typeof window !== 'undefined' && window._tabBarPathCheck) {
    clearInterval(window._tabBarPathCheck)
  }
})

// 3. 修改点击处理函数 - 触发全局事件
const handleItemClick = (item) => {
  if (isNavigating.value) return
  
  const targetPath = item.pagePath
  const isReclick = currentPath.value === targetPath
  
  // 重复点击：触发全局 tabReclick
  if (isReclick) {
    triggerTabReclick({
      path: targetPath,
      text: item.text,
      isMid: false,
      type: 'sideTab'
    })
    return
  }
  
  // 切换新Tab：导航成功后触发全局 tabChange
  throttledNavigate(targetPath, item.isTab !== false)
    .then(() => {
      triggerTabChange({
        path: targetPath,
        text: item.text,
        isMid: false,
        fromPath: currentPath.value,
        type: 'sideTab'
      })
    })
    .catch(err => console.error('左右Tab点击错误:', err))
}

// 4. 修改中间按钮点击处理 - 触发全局事件
const handleMidButtonClick = () => {
  if (isNavigating.value) return
  if (!midButton.show) return
  
  const targetPath = midButton.pagePath
  const isReclick = currentPath.value === targetPath
  
  // 重复点击：触发全局 tabReclick
  if (isReclick) {
    triggerTabReclick({
      path: targetPath,
      text: midButton.text,
      isMid: true,
      type: 'midTab'
    })
    return
  }
  
  // 切换新Tab：导航成功后触发全局 tabChange
  throttledNavigate(targetPath, midButton.isTab !== false)
    .then(() => {
      triggerTabChange({
        path: targetPath,
        text: midButton.text,
        isMid: true,
        fromPath: currentPath.value,
        type: 'midTab'
      })
    })
    .catch(err => console.error('中间Tab点击错误:', err))
}
</script>


<style scoped>
.tab-bar {
  position: fixed;
    bottom: 40rpx;
    /* 移除 left: 0 和 right: 0，改用 margin 居中 */
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: 999;
    box-sizing: border-box;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.3);
    width: 90%;
    /* 关键：左右 margin 设为 auto 实现水平居中 */
    margin: 0 auto;
    /* 固定定位下需指定 left 为 0 才能让 margin-auto 生效 */
    left: 0;
    right: 0;
	border-radius: 100rpx;
	border: 1px solid #323238;
	opacity: 0.9;
	background: linear-gradient(180deg,
	  #353535 0%,    /* 左侧10%的浅色 */
	  #1a1a1a 100%   /* 右侧10%的浅色 */
	);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  position: relative;
  padding: 12rpx 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-item:active, .mid-button:active {
  opacity: 0.8;
  transform: scale(0.95);
}

.tab-item.disabled, .mid-button.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.tab-icon {
  margin-bottom: 6rpx;
  transition: transform 0.2s ease;
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}

.tab-text {
  line-height: 1;
  transition: color 0.2s ease;
}

.mid-tab-text {
  margin-top: 6rpx;
  transition: color 0.2s ease;
}

/* 中间按钮样式 */
.mid-button {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  flex: 0 0 auto;
  transition: all 0.2s ease;
  cursor: pointer;
}

/* 中间按钮内容容器 */
.mid-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(-25%);
}

.badge {
  position: absolute;
  top: 4rpx;
  right: -50%;
  background-color: #ff3b30;
  color: white;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
  z-index: 1001;
  font-weight: normal;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 激活状态样式 */
.active {
  font-weight: bold;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .tab-text, .mid-tab-text {
    font-size: 22rpx;
  }
  
  .tab-item {
    padding: 8rpx 0;
  }
  
  .tab-bar {
    border-radius: 100rpx;
  }
}

/* 防止点击穿透 */
.tab-bar {
  pointer-events: auto;
}

/* 加载状态动画 */
.tab-item.loading .tab-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>