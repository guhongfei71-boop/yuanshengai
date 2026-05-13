<template>
	<view class="infobox" :style="'height:'+pageHeight+'px;'">
		<view class="top acea-row">
			<view class="acea-row" @click="$page.back()">
				<uni-icons type="closeempty" size="20"></uni-icons>
			</view>
		</view>
		<DcLogin @close="getUserInfo"></DcLogin>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const pageHeight = ref('')
	
	
	const getUserInfo = () => {
		$http.get('User/userinfo').then(res => {
			let data = {
				token:USERINFO.value?.token,
				userInfo:res.data
			}
			useUserStore().setUserInfo(data);
		})
	}
	
	onLoad(() =>{
		//事件监听的原理是，在APP.vue里面监听事件后，程序必须异步加载完数据，才会执行事件
		uni.$once('initConfig', (res) => {
			//修改标题
			uni.setNavigationBarTitle({
				title: WEBCONFIG?.value.sys.name
			})
		})
		pageHeight.value = uni.getWindowInfo().screenHeight
		
	})
	
</script>

<style scoped lang="scss">
	.infobox{
		width: 100%;
		font-size: $uni-font-size-base;
		color: $uni-text-color;
		background:linear-gradient(120deg,#cee0ff,#fff8ff);
		.top{
			// #ifdef H5
			padding: 40rpx 40rpx;
			// #endif

			// #ifndef H5
			padding: 100rpx 40rpx 40rpx 40rpx;
			// #endif
		}
	}
</style>
