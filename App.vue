<script setup>
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
import { useCache, $tool, $cookie, $http } from '@/utils'
import siteurl from "@/utils/siteurl.js";
import { ref } from 'vue';
const { USERINFO } = useRefs(useUserStore())


// 缓存引用
const userStore = useUserStore();
const webConfigStore = useWebConfigStore();
const cache = useCache();

	
	// 新增：动态引入 vconsole（仅开发环境）
	const initVConsole = () => {
	  // 仅在开发环境启用（process.env.NODE_ENV 由 UniApp 自动注入）
	
	    // 检查是否已引入 vconsole，避免重复创建
	    if (window.VConsole) return;
	
	    // 创建 script 标签
	    const script = document.createElement('script');
	    script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js';
	    script.type = 'text/javascript';
	    
	    // 脚本加载完成后初始化 vconsole
	    script.onload = () => {
	      if (window.VConsole) {
	        new window.VConsole(); // 初始化，页面会出现 vConsole 按钮
	        console.log('vconsole 已加载完成，可点击右下角按钮查看日志');
	      }
	    };
	    
	    // 加载失败处理
	    script.onerror = () => {
	      console.error('vconsole 加载失败，请检查网络');
	    };
	    
	    // 将脚本添加到页面头部
	    document.head.appendChild(script);
	
	}

	onLaunch((options) => { 
	  // #ifdef H5
	  //initVConsole();
	  
	  // SAASID
	  const saasid = options.query?.saasid || siteurl.saasid();
	  if (saasid) {
	  		cache.set('SAASID', saasid)
	  }
	  // #endif

	  // 初始化用户信息
	  userStore.initUserInfo()
	  // 获取网站配置
	  $http.get('Index/webconfig').then(res =>{
		webConfigStore.setWebConfig(res.data)
		uni.$emit('initConfig')
	  }).catch(err =>{
		uni.showModal({
		  title: '温馨提示',
		  content: '配置项获取出错',
		  showCancel: false,
		})
	  })
	  
	  // #ifdef H5
	  
	  const spread = options.query?.spread;
	  // 推广ID 如果没有登录，地址栏有推广ID就存入，没有就清除以前的
	  if(userStore.isLogin()){
		  cache.set('SPREAD', USERINFO.value.userInfo.id);
	  }else{
		  cache.set('SPREAD', spread);
	  }
	  
	  // #endif
	
	
	
	// #ifdef MP-WEIXIN
	const scene = options.query?.scene;
	// 解析 scene 中的参数（如果存在），并合并到 allParams 中
	if (scene) {
		const decodedScene = decodeURIComponent(scene); // 解码后得到 "spread=789&shopid=101"
		const params = {};
		decodedScene.split('&').forEach(item => {
			const [key, value] = item.split('=');
			params[key] = value;
		});
		//用户上下级关联ID
		if(params.spread){
			cache.set('SPREAD', params.spread);
		}
	}else{
		//如果不是扫码进来的，那么我们直接获取参数
		const spread = options.query?.spread;
		if(spread){
			cache.set('SPREAD', spread);
		}
	}
	// #endif

	  // #ifdef H5
	  // 处理token参数
	  const token = options.query?.token;
	  if (token) {
		// 清除地址里的TOKEN
		$tool.replaceUrlParam('token', '')
		cache.set('SPREAD', spread);
		userStore.setUserInfo({ token: token ,userInfo:{id:spread}}).then(() => {
		}).catch(() => {});
	  }
	  // #endif
	  
	}) 

	onShow(() =>{
	  console.log('App Show')
	}) 

	onHide(() =>{
	  console.log('App Hide')
	}) 
</script>

<style lang="scss">
page{
  width: 100%;
  background-color:#18181b;
  /* #ifdef APP */
  margin-top:  var(--status-bar-height) ;
  /* #endif */
}
/*每个页面公共css */
@import "static/css/base.scss";
@import "./uni_modules/vk-uview-ui/index.scss";
</style>