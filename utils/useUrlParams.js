// composables/useUrlParams.js
import { ref } from 'vue';
import { useCache } from '@/utils'

export const useUrlParams = () => {
  const saasid = ref('');
  const spread = ref('');
  
  // 从缓存获取参数
  const getParamsFromCache = () => {
    try {
      return {
        saasid: useCache().get('SAASID') || '',
        spread: useCache().get('SPREAD') || ''
      };
    } catch (e) {
      console.error('读取参数缓存失败:', e);
      return { saasid: '', spread: '' };
    }
  };

  // 确保URL包含saasid和spread参数
  const ensureUrlHasParams = () => {
    // #ifdef H5
    try {
      const cacheParams = getParamsFromCache();
      const currentSaasid = saasid.value || cacheParams.saasid;
      const currentSpread = spread.value || cacheParams.spread;
      
      if (!currentSaasid) {
        //console.warn('未找到SAASID，无法添加到URL');
        return false;
      }

      const currentUrl = window.location.href;
      
      // 检查当前URL的hash部分是否已经包含所有必要参数
      const hashMatch = currentUrl.match(/#[^?]*\?([^#]*)/);
      let hasAllParams = false;
      
      if (hashMatch) {
        const hashParams = new URLSearchParams(hashMatch[1]);
        hasAllParams = hashParams.has('saasid') && 
                      (!currentSpread || hashParams.has('spread'));
      }
      
      if (hasAllParams) {
        //console.log('URL的hash部分已包含所有必要参数');
        return true;
      }

      // 构建新的URL - 参数放在hash内部
      const baseUrl = window.location.origin + window.location.pathname;
      const search = window.location.search;
      let hash = window.location.hash;

      // 如果hash为空，使用当前页面路由
      if (!hash) {
        const pages = getCurrentPages();
        if (pages && pages.length > 0) {
          const currentPage = pages[pages.length - 1];
          hash = `#${currentPage.route}`;
        } else {
          // 如果没有页面信息，使用默认路由
          hash = '#/pages/index/index';
        }
      }

      // 处理hash部分的参数
      const [hashPath, hashQuery] = hash.split('?');
      const params = new URLSearchParams(hashQuery || '');
      
      // 设置saasid参数（必须）
      params.set('saasid', currentSaasid);
      
      // 设置spread参数（可选）
      if (currentSpread) {
        params.set('spread', currentSpread);
      } else {
        // 如果spread为空，确保移除可能存在的空spread参数
        params.delete('spread');
      }
      
      const newHash = params.toString() ? `${hashPath}?${params.toString()}` : hashPath;
      const newUrl = `${baseUrl}${search}${newHash}`;

      // 使用replaceState更新URL（不添加历史记录）
      window.history.replaceState(null, '', newUrl);
      //console.log('URL参数已修复（hash内部）:', newUrl);
      return true;
    } catch (error) {
      console.error('添加URL参数失败:', error);
      return false;
    }
    // #endif
    
    // #ifndef H5
    return false;
    // #endif
  };

  // 修复：如果参数在search部分，移动到hash部分
  const fixUrlParamsPosition = () => {
    // #ifdef H5
    try {
      const currentUrl = window.location.href;
      const urlObj = new URL(currentUrl);
      
      // 检查search部分是否有参数
      const searchSaasid = urlObj.searchParams.get('saasid');
      const searchSpread = urlObj.searchParams.get('spread');
      
      const hasSearchParams = searchSaasid || searchSpread;
      const hasHashParams = currentUrl.match(/#[^?]*\?.*saasid=/);
      
      if (hasSearchParams && !hasHashParams) {
        //console.log('发现search部分的参数，需要移动到hash部分');
        
        // 从search中移除参数
        urlObj.searchParams.delete('saasid');
        urlObj.searchParams.delete('spread');
        
        // 获取当前hash
        let hash = urlObj.hash;
        if (!hash) {
          const pages = getCurrentPages();
          if (pages && pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            hash = `#${currentPage.route}`;
          }
        }
        
        // 将参数添加到hash部分
        if (hash) {
          const [hashPath, hashQuery] = hash.split('?');
          const params = new URLSearchParams(hashQuery || '');
          
          if (searchSaasid) {
            params.set('saasid', searchSaasid);
          }
          if (searchSpread) {
            params.set('spread', searchSpread);
          }
          
          const newHash = params.toString() ? `${hashPath}?${params.toString()}` : hashPath;
          urlObj.hash = newHash;
          
          // 更新URL
          window.history.replaceState(null, '', urlObj.toString());
          //console.log('参数已从search移动到hash:', urlObj.toString());
          
          // 更新缓存
          try {
            if (searchSaasid) {
			  useCache().set('SAASID', searchSaasid);
              saasid.value = searchSaasid;
            }
            if (searchSpread) {
		      useCache().set('SPREAD', searchSpread);
              spread.value = searchSpread;
            }
          } catch (e) {
            console.error('保存参数失败:', e);
          }
        }
      }
    } catch (error) {
      console.error('修复URL参数位置失败:', error);
    }
    // #endif
  };

  // 从URL中提取参数到缓存
  const extractParamsFromUrl = () => {
    // #ifdef H5
    try {
      const currentUrl = window.location.href;
      const hashMatch = currentUrl.match(/#[^?]*\?([^#]*)/);
      
      if (hashMatch) {
        const hashParams = new URLSearchParams(hashMatch[1]);
        const urlSaasid = hashParams.get('saasid');
        const urlSpread = hashParams.get('spread');
        
        if (urlSaasid) {
          saasid.value = urlSaasid;
          try {
			  useCache().set('SAASID', urlSaasid);
          } catch (e) {
            console.error('保存SAASID失败:', e);
          }
        }
        
        if (urlSpread) {
          spread.value = urlSpread;
          try {
			  useCache().set('SPREAD', urlSpread);
          } catch (e) {
            console.error('保存SPREAD失败:', e);
          }
        }
        
        return { saasid: urlSaasid, spread: urlSpread };
      }
    } catch (error) {
      console.error('从URL提取参数失败:', error);
    }
    // #endif
    return { saasid: saasid.value, spread: spread.value };
  };

  // 初始化
  const init = () => {
    const cacheParams = getParamsFromCache();
    saasid.value = cacheParams.saasid;
    spread.value = cacheParams.spread;
    
    // 从URL提取参数（覆盖缓存）
    extractParamsFromUrl();
    
    // 先修复参数位置（如果参数在search部分）
    fixUrlParamsPosition();
    
    // 再确保参数存在
    ensureUrlHasParams();
  };

  // 设置参数
  const setParams = (newSaasid, newSpread = '') => {
    saasid.value = newSaasid;
    spread.value = newSpread;
    
    try {
		useCache().set('SAASID', newSaasid);
      if (newSpread) {
		useCache().set('SPREAD', newSpread);
      } else {
		useCache().remove('SPREAD')
      }
    } catch (e) {
      console.error('保存参数失败:', e);
    }
    ensureUrlHasParams();
  };

  // 单独设置saasid
  const setSaasid = (newSaasid) => {
    setParams(newSaasid, spread.value);
  };

  // 单独设置spread
  const setSpread = (newSpread) => {
    setParams(saasid.value, newSpread);
  };

  return {
    saasid,
    spread,
    ensureUrlHasParams,
    init,
    setParams,
    setSaasid,
    setSpread,
    extractParamsFromUrl,
    fixUrlParamsPosition
  };
};