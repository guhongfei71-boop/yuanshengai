import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export function usePageAnimation() {
  const router = useRouter();
  
  // 隐藏页面动画
  function hide(callback) {
    const classList = document.querySelector('uni-page')?.classList;
    if (classList) {
      classList.add('animation-before', 'animation-leave');
      classList.remove('animation-show');
      setTimeout(() => {
        classList.remove('animation-before', 'animation-leave');
        callback && callback();
      }, 300);
    }
  }
  
  // 显示页面动画
  function show() {
    const classList = document.querySelector('uni-page')?.classList;
    if (classList) {
      classList.add('animation-before');
      setTimeout(() => {
        classList.add('animation-enter', 'animation-after', 'animation-show');
        setTimeout(() => {
          classList.remove('animation-before', 'animation-after', 'animation-enter');
        }, 300);
      }, 20);
    }
  }
  
  // 路由导航守卫
  let beforeHook, afterHook;
  
  function initRouterHooks() {
    beforeHook = router.beforeEach((to, from, next) => {
      hide(next);
    });
    
    afterHook = router.afterEach(() => {
      setTimeout(show, 50);
    });
  }
  
  function removeRouterHooks() {
    beforeHook && beforeHook();
    afterHook && afterHook();
  }
  
  // 初始化动画
  onMounted(() => {
    show();
    initRouterHooks();
  });
  
  // 清理
  onUnmounted(() => {
    removeRouterHooks();
  });
  
  return {
    show,
    hide
  };
}
