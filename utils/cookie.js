/**
 * uniapp Cookie 操作工具
 * 支持 H5、小程序和 App 平台
 */

export const $cookie = {
	/**
	 * 设置 Cookie
	 * @param {string} name Cookie 名称
	 * @param {string} value Cookie 值
	 * @param {object} options 可选配置
	 * @param {number} options.expires 过期天数
	 * @param {string} options.path 有效路径
	 * @param {boolean} options.secure 是否仅通过 HTTPS 传输
	 */
	set: (name, value, options = {}) => {
	  if (process.env.UNI_PLATFORM === 'h5') {
	    // H5 平台使用原生 document.cookie
	    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
	    if (options.expires !== undefined) {
	      const date = new Date();
	      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
	      cookieString += `; expires=${date.toUTCString()}`;
	    }
	    
	    if (options.path) cookieString += `; path=${options.path}`;
	    if (options.secure) cookieString += `; secure`;
	    
	    document.cookie = cookieString;
	  } else {
	    // 小程序和 App 平台使用本地存储模拟 Cookie
	    const cookies = this.getAll();
	    cookies[name] = value;
	    
	    // 处理过期时间
	    if (options.expires !== undefined) {
	      const expireTime = new Date().getTime() + (options.expires * 24 * 60 * 60 * 1000);
	      cookies[`${name}_expire`] = expireTime;
	    }
	    
	    uni.setStorageSync('__UNI_COOKIES__', cookies);
	  }
	},
	
	/**
	 * 获取指定名称的 Cookie
	 * @param {string} name Cookie 名称
	 * @returns {string|null} Cookie 值，不存在或过期时返回 null
	 */
	get: (name) => {
	  if (process.env.UNI_PLATFORM === 'h5') {
	    // H5 平台原生获取
	    const nameEQ = `${encodeURIComponent(name)}=`;
	    const cookies = document.cookie.split(';');
	    
	    for (let i = 0; i < cookies.length; i++) {
	      let cookie = cookies[i];
	      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
	      if (cookie.indexOf(nameEQ) === 0) {
	        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
	      }
	    }
	    return null;
	  } else {
	    // 小程序和 App 平台从本地存储获取
	    const cookies = uni.getStorageSync('__UNI_COOKIES__') || {};
	    const value = cookies[name];
	    const expireTime = cookies[`${name}_expire`];
	    
	    // 检查是否过期
	    if (expireTime && new Date().getTime() > expireTime) {
	      this.remove(name);
	      return null;
	    }
	    
	    return value || null;
	  }
	},
	
	/**
	 * 获取所有 Cookie
	 * @returns {object} 包含所有 Cookie 的对象
	 */
	getAll: () => {
	  if (process.env.UNI_PLATFORM === 'h5') {
	    // H5 平台原生获取
	    const cookies = document.cookie.split(';');
	    const cookieObj = {};
	    
	    for (let i = 0; i < cookies.length; i++) {
	      let cookie = cookies[i];
	      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
	      
	      if (cookie) {
	        const [name, value] = cookie.split('=');
	        if (name) {
	          cookieObj[decodeURIComponent(name)] = value ? decodeURIComponent(value) : '';
	        }
	      }
	    }
	    
	    return cookieObj;
	  } else {
	    // 小程序和 App 平台从本地存储获取（过滤过期项）
	    const cookies = uni.getStorageSync('__UNI_COOKIES__') || {};
	    const result = {};
	    
	    for (const key in cookies) {
	      if (key.endsWith('_expire')) continue; // 跳过过期时间标记
	      
	      const expireKey = `${key}_expire`;
	      const expireTime = cookies[expireKey];
	      
	      // 仅添加未过期的 Cookie
	      if (!expireTime || new Date().getTime() <= expireTime) {
	        result[key] = cookies[key];
	      }
	    }
	    
	    return result;
	  }
	},
	
	/**
	 * 清除指定名称的 Cookie
	 * @param {string} name Cookie 名称
	 */
	remove: (name) => {
	  if (process.env.UNI_PLATFORM === 'h5') {
	    // H5 平台通过设置过期时间删除
	    this.set(name, '', { expires: -1 });
	  } else {
	    // 小程序和 App 平台从本地存储删除
	    const cookies = uni.getStorageSync('__UNI_COOKIES__') || {};
	    delete cookies[name];
	    delete cookies[`${name}_expire`];
	    uni.setStorageSync('__UNI_COOKIES__', cookies);
	  }
	},
	
	/**
	 * 清除所有 Cookie
	 */
	removeAll: () => {
	  if (process.env.UNI_PLATFORM === 'h5') {
	    // H5 平台获取所有 Cookie 并逐个删除
	    const cookies = this.getAll();
	    for (const name in cookies) {
	      this.remove(name);
	    }
	  } else {
	    // 小程序和 App 平台直接删除存储的 Cookie
	    uni.removeStorageSync('__UNI_COOKIES__');
	  }
	}
}