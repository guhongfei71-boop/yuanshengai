import siteurl from "./siteurl";
let timerThrottle;
let timerDebounce;
let flag;

const _getClipboardContent = () => {
	return new Promise((resolve, reject) => {
	    uni.getClipboardData({
	      success: (res) => {
	        if (res.data) {
	          uni.showToast({
	            title: '粘贴成功',
	            duration: 2000,
	            icon: 'none'
	          });
	          resolve(res.data);
	        } else {
	          reject('剪贴板内容为空');
	        }
	      },
	      fail: (err) => {
	        uni.showToast({
	          title: '粘贴失败',
	          duration: 2000,
	          icon: 'none'
	        });
	        reject(err);
	      }
	    });
	  });
}

export const $tool = {
	//图片预览
	previewImage: (url, index = 0) => {
		if (typeof url === 'string') {
			uni.previewImage({
				current: 0,
				urls: [url]
			})
		}
		if (typeof url === 'object' || typeof url === 'array') {
			uni.previewImage({
				current: index,
				urls: url
			})
		}
	},
	//提示
	toast: (str, icon = 'none') => {
		uni.showToast({
			title: str,
			icon: icon
		})
	},
	//复制
	copy: (str) => {
		// 执行复制操作
		uni.setClipboardData({
			data: str
	    });
	},
	
	//获取剪切板内容
	getPaste: () =>{
			return new Promise((resolve, reject) => {
			    // #ifdef MP-WEIXIN
			    uni.getSetting({
			      success(res) {
			        if (!res.authSetting['scope.writePhotosAlbum']) {
			          // 还没有权限，需要请求
			          uni.authorize({
			            scope: 'scope.writePhotosAlbum',
			            success: () => {
			              _getClipboardContent().then(resolve).catch(reject);
			            },
			            fail: (err) => {
			              if (err.errMsg.includes('auth deny')) {
			                uni.showModal({
			                  title: '提示',
			                  content: '需要剪贴板权限才能粘贴内容，是否去设置开启？',
			                  success: (res) => {
			                    if (res.confirm) {
			                      uni.openSetting();
			                    }
			                    reject('用户拒绝授权');
			                  }
			                });
			              } else {
			                reject(err);
			              }
			            }
			          });
			        } else {
			          // 已经有权限，直接读取
			          _getClipboardContent().then(resolve).catch(reject);
			        }
			      },
			      fail: (err) => {
			        reject(err);
			      }
			    });
			    // #endif
			    
			    // #ifndef MP-WEIXIN
			    _getClipboardContent().then(resolve).catch(reject);
			    // #endif
			});
		
	},
	
	//节流函数 
	throttle: (func, wait = 500, immediate = true) => {
		if (immediate) {
			if (!flag) {
				flag = true
				typeof func === 'function' && func()
				timerThrottle = setTimeout(() => {
					flag = false
				}, wait)
			}
		} else if (!flag) {
			flag = true
			timerThrottle = setTimeout(() => {
				flag = false
				typeof func === 'function' && func()
			}, wait)
		}
	},
	//防抖函数
	debounce: (func, wait = 500, immediate = false) => {
		if (timerDebounce !== null) clearTimeout(timerDebounce)
		if (immediate) {
			const callNow = !timerDebounce
			timerDebounce = setTimeout(() => {
				timerDebounce = null
			}, wait)
			if (callNow) typeof func === 'function' && func()
		} else {
			timerDebounce = setTimeout(() => {
				typeof func === 'function' && func()
			}, wait)
		}
	},
	
	//获取URL参数
	getQueryVariable: (variable) => {
	       var query = window.location.search.substring(1);
	       var vars = query.split("&");
	       for (var i=0;i<vars.length;i++) {
	               var pair = vars[i].split("=");
	               if(pair[0] == variable){
					   return pair[1];
				   }
	       }
	       return(false);
	},
	
	//获取hash值后面的参数 ,就是#号后面的 
	getUrlParam : (name) => {
		const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		// 先尝试从完整URL中获取
		const r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		// 再尝试从hash中获取
		const hashR = window.location.hash.split('?')[1]?.match(reg);
		if (hashR != null) return unescape(hashR[2]);
		return false;
	},
	
	
	//在不刷新页面的情况下，动态吧URL参数改变掉 例如 
	//http://www.baidu.com/#pages/index/index?id=5 使用 replaceUrlParam('id',10)会改变成下面
	//http://www.baidu.com/#pages/index/index?id=10
	replaceUrlParam: (key, value)=> {
	    const url = new URL(globalThis.location.href);
		const queryArr=url.hash.split('?');
		const hashParams = new URLSearchParams(queryArr[1]?queryArr[1]:''); 
	    hashParams.set(key, value);
	    url.hash = queryArr[0]+'?'+hashParams.toString();
	    globalThis.history.replaceState({}, '', url.href);
	},
	
	//判断是否在微信浏览器
	isInWeChatBrowser: () => {
	    const ua = navigator.userAgent.toLowerCase();
	    return ua.indexOf('micromessenger') > -1;
	},
	
	
	
	
	/**
	 * 在不刷新页面的情况下，向 URL 添加或修改参数
	 * @param {string} key - 要添加的参数名
	 * @param {string} value - 要添加的参数值
	 */
	addUrlParam: (key, value) => {
		const currentPages = getCurrentPages();
		  const currentPage = currentPages[currentPages.length - 1];
		  
		  // 检查是否需要更新参数
		  if (currentPage.options[key] === value) return;
		  
		  // 构建新的参数
		  const newOptions = { ...currentPage.options, [key]: value };
		  const queryString = Object.keys(newOptions)
		    .map(k => `${k}=${encodeURIComponent(newOptions[k])}`)
		    .join('&');
			
		  // 使用 redirectTo 替换当前页面，用户无感知
		  uni.switchTab({
		    url: `/${currentPage.route}?${queryString}`,
		    complete: () => {
		      // 页面替换后触发的回调
		      console.log('URL参数已更新');
		    }
		  });
	},
	
	/**
	 * 自动增加URL参数
	 */
	addParamToUrl: (paramName, paramValue) => {
		  // #ifdef H5
		  const currentHash = window.location.hash;
		  const baseUrl = window.location.origin + window.location.pathname;
		  
		  // 解析当前hash中的路径和参数
		  const hashParts = currentHash.split('?');
		  const path = hashParts[0]; // 例如: #/pages/videolist/videolist
		  const existingParams = new URLSearchParams(hashParts[1] || '');
		  
		  // 添加新参数
		  existingParams.set(paramName, paramValue);
		  
		  // 构建新的hash（保持当前路径）
		  const newHash = path + '?' + existingParams.toString();
		  
		  // 使用 history.replaceState 无刷新更新URL
		  window.history.replaceState(null, '', baseUrl + newHash);
		  
		  // 返回新的完整URL
		  return baseUrl + newHash;
		  // #endif
	},
	
	/**
	 * 替换图片地址
	 */
	imgReplace: (path) => {
		if (!path) return path;
		const imgurl = path.includes("://")
		const url = siteurl.imghost().replace(/\/$/, "")
		if(imgurl){
			return path
		}else{
			return url + path
		}
	},
	
	/**
	 * 替换富文本里的所有图片和视频地址
	 */
	imgContent: (content) => {
		  if (!content || typeof content !== 'string') return content;
		  
		  const currentOrigin = siteurl.imghost().replace(/\/$/, "")
		  
		  // 处理富文本中的媒体资源（图片和视频）
		  if (/<(img|video)[^>]*src=/i.test(content)) {
			return content.replace(/<(img|video)[^>]+src="([^">]+)"/gi, (match, tag, src) => {
			  return /^(https?:)?\/\//i.test(src) 
				? match 
				: match.replace(src, `${currentOrigin}${src.startsWith('/') ? '' : '/'}${src}`);
			});
		  }
		  
		  // 处理纯媒体文件路径（图片和视频）
		  const mediaExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|mov|avi|webm|ogg)(\?.*)?$/i;
		  if (mediaExtensions.test(content.trim())) {
			return /^(https?:)?\/\//i.test(content) 
			  ? content 
			  : `${currentOrigin}${content.startsWith('/') ? '' : '/'}${content}`;
		  }
		  
		  // 普通文本直接返回
		  return content;
	}
}