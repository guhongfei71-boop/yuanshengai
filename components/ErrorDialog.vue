<template>
  <view class="error-dialog" v-show="visible">
    <view class="mask" @click="handleClose"></view>
    <view class="content" :class="{'slide-in': visible}" @click.stop>
		<view class="acea-row">
			<view class="close">
				<image src="/static/img/close.png" class="closeimg"></image>
			</view>
			<view style="width: 80%;">
				<view class="title">{{ title }}</view>
				<view class="message">{{ message }}</view>
			</view>
		</view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '错误提示'
  },
  message: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

// 监听 visible 变化，添加动画类
const contentRef = ref(null);

watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 确保 DOM 已更新
    setTimeout(() => {
      if (contentRef.value) {
        // 触发重排以确保动画生效
        contentRef.value.offsetWidth;
      }
    }, 0);
  }
});
</script>

<style scoped>
.error-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
}

.content {
  width: 70%;
  max-width: 300px;
  background-color: #fff;
  border-radius: 10px 0 0 10px;
  padding: 15px;
  box-shadow: -5px 0 15px rgba(0,0,0,0.2);
  transform: translateX(100%);
  opacity: 0;
  /* 添加初始状态的过渡，确保隐藏时也有动画 */
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

/* 滑入动画 - 使用 CSS 动画 */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 滑入类 - 应用动画 */
.slide-in {
  animation: slideInFromRight 0.3s ease-out forwards;
}

/* H5 平台特定样式 */
/* #ifdef H5 */
.error-dialog {
  display: block;
}

.content {
  position: absolute;
  top: 30%;
  right: 0;
  transform: translateY(-50%) translateX(100%);
}

.slide-in {
  transform: translateY(-50%) translateX(0);
}
/* #endif */

.title {
  font-size: 16px;
  font-weight: bold;
}
.close{
	width: 35px;
}
.closeimg{
	width: 20px;
	height: 20px;
}
.message {
  margin-top: 10px;
  font-size: 14px;
}
</style>
