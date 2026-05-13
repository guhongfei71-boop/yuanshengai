// utils/error-dialog.js
// #ifdef H5
import { createVNode, render, ref } from 'vue';
import ErrorDialog from '@/components/ErrorDialog.vue';

// 创建容器
const container = document.createElement('div');
container.id = 'error-dialog-container';
document.body.appendChild(container);

// 错误提示状态
let currentVNode = null;
let isShowing = false;

// 显示错误提示
export const showError = (message, options = {}) => {
  // 如果已有弹窗显示，先关闭
  if (isShowing) {
    hideError();
  }
  
  // 合并默认配置
  const defaultOptions = {
    title: '错误提示',
    duration: 0, // 0 表示不自动关闭
    onClose: () => {}
  };
  
  const config = { ...defaultOptions, ...options };
  
  // 创建组件实例
  currentVNode = createVNode(ErrorDialog, {
    message,
    title: config.title,
    visible: true,
    onClose: () => {
      config.onClose();
      hideError();
    }
  });
  
  // 渲染到DOM
  render(currentVNode, container);
  isShowing = true;
  
  // 如果设置了自动关闭
  if (config.duration > 0) {
    setTimeout(() => {
      hideError();
    }, config.duration);
  }
};

// 隐藏错误提示
export const hideError = () => {
  if (currentVNode) {
    render(null, container);
    currentVNode = null;
    isShowing = false;
  }
};
// #endif


// #ifndef H5
// utils/error-dialog.js
let currentInstance = null;
let isShowing = false;
let timer = null;

// 显示错误提示
export const showError = (message, options = {}) => {
  // 如果已有弹窗显示，先关闭
  if (isShowing) {
    hideError();
  }
  
  // 合并默认配置
  const defaultOptions = {
    title: '错误提示',
    duration: 0, // 0 表示不自动关闭
    onClose: () => {}
  };
  
  const config = { ...defaultOptions, ...options };
  
  // 获取当前页面实例
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  // 创建组件实例
  currentInstance = page.$vm.$refs.errorDialog;
  
  if (!currentInstance) {
    // 如果没有找到ref，创建一个新的
    currentInstance = page.selectComponent('#error-dialog');
  }
  
  if (currentInstance) {
    currentInstance.message = message;
    currentInstance.title = config.title;
    currentInstance.visible = true;
    currentInstance.onClose = () => {
      config.onClose();
      hideError();
    };
  } else {
    // 如果还是找不到，使用uni.showModal作为fallback
    uni.showModal({
      title: config.title,
      content: message,
      showCancel: false,
      success: () => {
        config.onClose();
      }
    });
    return;
  }
  
  isShowing = true;
  
  // 如果设置了自动关闭
  if (config.duration > 0) {
    timer = setTimeout(() => {
      hideError();
    }, config.duration);
  }
};

// 隐藏错误提示
export const hideError = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  
  if (currentInstance) {
    currentInstance.visible = false;
    currentInstance = null;
  }
  
  isShowing = false;
};

// #endif