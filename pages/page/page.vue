<template>
	<view class="box">

		<view class="content">
			<u-parse :html="$tool.imgContent(content)" :tag-style="info_style" v-if="content">
				
			</u-parse>
			<u-empty text="暂无数据" icon-size="90" v-else></u-empty>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	const content = ref('')
	const info_style = ref({
		p: 'line-height: 48rpx;',
		img: 'max-width: 100%;max-height: 100%;display: block;',
	})
	//获取详情数据
	const getConfig = (name) => {
		uni.showLoading({
			title:'加载中'
		})
		$http.get('Index/webconfig', {name:name}).then(res => {
			content.value = res.data
			uni.hideLoading()
		})
	}
	
	onLoad((query) =>{
		if(!query.name){
			uni.showModal({
				title: '温馨提示',
				content: '找不到数据'
			})
		}
		if(query.title){
			uni.setNavigationBarTitle({
				title: query.title
			})
		}
		getConfig(query.name)
	})
	
	
</script>

<style scoped lang="scss">
	page{
		//background-color: #ffffff;
	}
	.box{
		padding: 30rpx 30rpx;
		.content{
			padding: 10rpx 0;
			color: #d4d4d4;
		}
	}
</style>
