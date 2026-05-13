import { useCache } from '@/utils'
import { useUserStore } from '@/stores/index.js'

const getCurrentSaasid = () => {
  return useCache().get('SAASID') || 0;
};

const getCurrentSpread = () => {
  return useCache().get('SPREAD') || 0;
};

// 修改：同时拼接 saasid 和 spread 到 URL
const appendParamsToUrl = (url) => {
	// #ifdef MP-WEIXIN
	return url;
	// #endif
  const SAASID = getCurrentSaasid();
  const SPREAD = getCurrentSpread();
  
  if (!url || typeof url !== 'string') return url;
  
  let newUrl = url;
  const separator = newUrl.includes('?') ? '&' : '?';
  
  // 处理 saasid 参数
  if (SAASID) {
    if (newUrl.includes('saasid=')) {
      newUrl = newUrl.replace(/saasid=[^&]*/, `saasid=${SAASID}`);
    } else {
      newUrl = `${newUrl}${separator}saasid=${SAASID}`;
    }
  }
  
  // 处理 spread 参数
  if (SPREAD) {
    const newSeparator = newUrl.includes('?') ? '&' : '?';
    if (newUrl.includes('spread=')) {
      newUrl = newUrl.replace(/spread=[^&]*/, `spread=${SPREAD}`);
    } else {
      newUrl = `${newUrl}${newSeparator}spread=${SPREAD}`;
    }
  }
  
  return newUrl;
};

const buildOptions = (params) => {
  if (typeof params === 'string') {
    return { url: params };
  }
  return { ...params };
};

// 修改 userLogin：拼接参数到登录页 URL
const userLogin = () => {
  const loginUrl = appendParamsToUrl('/pages/login/login');
  uni.navigateTo({
    url: loginUrl
  })
}

// 核心修改：在所有跳转方法中调用 appendParamsToUrl
export const $page = {
  open: (params, is_login = false) => {
    const { isLogin } = useUserStore();
    if (is_login && !isLogin()) {
      userLogin()
      return
    }
    const options = buildOptions(params);
    // 拼接参数（navigateTo 支持 URL 带参）
    options.url = appendParamsToUrl(options.url);
    uni.navigateTo(options);
  },
  redirect: (params, is_login = false) => {
    const { isLogin } = useUserStore();
    if (is_login && !isLogin()) {
      userLogin()
      return
    }
    const options = buildOptions(params);
    // 拼接参数（redirectTo 支持 URL 带参）
    options.url = appendParamsToUrl(options.url);
    uni.redirectTo(options);
  },
  reLaunch: (params, is_login = false) => {
    const { isLogin } = useUserStore();
    if (is_login && !isLogin()) {
      userLogin()
      return
    }
    const options = buildOptions(params);
    // 拼接参数（reLaunch 支持 URL 带参）
    options.url = appendParamsToUrl(options.url);
    uni.reLaunch(options);
  },
  switch: (params, is_login = false) => {
    const { isLogin } = useUserStore();
    if (is_login && !isLogin()) {
      userLogin()
      return
    }
    const options = buildOptions(params);
    // switchTab 不支持 URL 带参，无需拼接
    uni.reLaunch(options);
  },
  back: (delta = 1) => {
    const pages = getCurrentPages();
    if (pages.length === 1) {
      uni.reLaunch({ url: '/pages/index/index' });
    } else {
      uni.navigateBack({
        delta: delta
      });
    }
  },
};