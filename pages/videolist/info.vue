<template>
	<view class="infobox">
		<view class="box">
			<view class="acea-row row-center">
				<image :src="info.img ? $tool.imgReplace(info.img) : '/static/img/300-200.png'" mode="aspectFill" class="img" @click="viewImg($tool.imgReplace(info.img))"></image>
			</view>
			<view class="card m_top_50">
				<view class="title acea-row row-middle"><uni-icons type="compose" size="20" color="#e3e3e3" style="margin-right: 10rpx;"></uni-icons>描述内容</view>
				<view class="desc m_top_20">{{info.desc}}</view>
			</view>
			<view class="card m_top_30">
				<view class="title acea-row row-middle"><uni-icons type="image" size="20" color="#e3e3e3" style="margin-right: 10rpx;"></uni-icons>参考图片</view>
				<view class="desc m_top_20" v-if="imageList.length > 0">
					<!-- 循环显示所有图片 -->
					<view class="acea-row">
						<view 
						v-for="(imgUrl, index) in imageList" 
						:key="index"
						>
						<image 
							:src="$tool.imgReplace(imgUrl) || '/static/img/300-200.png'" 
							mode="aspectFill" 
							class="thumimg" 
							@click="$tool.previewImage($tool.imgReplace(imgUrl), index)"
						></image>
						</view>
					</view>
				</view>
				<view class="desc m_top_20" v-else>
					暂无图片
				</view>
			</view>
			<view class="card m_top_30">
				<view class="title acea-row row-middle"><uni-icons type="videocam" size="20" color="#e3e3e3" style="margin-right: 10rpx;"></uni-icons>视频参数</view>
				<view class="desc m_top_20">
					<view class="acea-row row-between-wrapper">
						<view class="l_title">任务ID</view>
						<view>{{info.task_id}}</view>
					</view>
					<view class="acea-row row-between-wrapper m_top_20">
						<view class="l_title">视频模型</view>
						<view>{{info.model}}</view>
					</view>
					<view class="acea-row row-between-wrapper m_top_20">
						<view class="l_title">消耗积分</view>
						<view>{{info.points}}</view>
					</view>
					<view class="acea-row row-between-wrapper m_top_20">
						<view class="l_title">视频质量</view>
						<view>{{info.size}}</view>
					</view>
					<view class="acea-row row-between-wrapper m_top_20">
						<view class="l_title">视频比例</view>
						<view>{{info.proportion}}</view>
					</view>
					<view class="acea-row row-between-wrapper m_top_20">
						<view class="l_title">视频时长</view>
						<view>{{info.duration}}</view>
					</view>
					<view class="acea-row row-between-wrapper m_top_20">
						<view class="l_title">创建时间</view>
						<view>{{info.add_time}}</view>
					</view>
					
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref,getCurrentInstance,computed  } from 'vue';
	import { onLoad,onShow,onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	const {  setUserInfo,clearUserInfo } = useUserStore()
	
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const storage = useCache()
	// 计算属性：将逗号分隔的字符串转为数组
	const imageList = computed(() => {
		if (!info.value.reference) return []
		
		// 如果是字符串，按逗号分割并过滤空值
		if (typeof info.value.reference === 'string') {
			return info.value.reference
			.split(',')
			.map(url => url.trim())
			.filter(url => url && url !== '')
		}
		
		// 如果已经是数组，直接返回
		if (Array.isArray(info.value.reference)) {
			return info.value.reference
		}
		
		// 其他情况返回空数组
		return []
	})
	
	// 小程序分享-----------------------------------start
	const shareData = ref(
	{
	  title: 'sora视频大师',
	  path: '/pages/index/index?spread=',
	  query: '/pages/index/index?spread=',
	  imageUrl:'/static/img/cpimg.png',
	})
	// #ifdef MP-WEIXIN
	onShareAppMessage(() => {
		const userInfo = USERINFO.value?.userInfo || {};
	    let id = userInfo.id || 0;
		return { 
			title: shareData.value.title,
			path: shareData.value.path + id,
			imageUrl: shareData.value.imageUrl
		}
	})
	
	onShareTimeline(() => {
		const userInfo = USERINFO.value?.userInfo || {};
		let id = userInfo.id || 0;
		return { 
			title: shareData.value.title,
			query: shareData.value.query + id,
			imageUrl: shareData.value.imageUrl
		}
	})
	// #endif
	
	// 小程序分享-----------------------------------end
	
	const id = ref(0);
	const info = ref([]);
	const getinfo = () =>{
		uni.showLoading({
			title: '加载中',
			mask: false
		})
		$http.post('Video/info', {id:id.value}).then(res => {
			info.value = res.data
			uni.hideLoading()
		}).catch(err => {
			uni.hideLoading()
		})
	}
	
	const viewImg = (img) => {
	      uni.previewImage({
	        current: img, // 当前要预览的图片地址
	        urls: [img],  // 所有要预览的图片列表（数组格式）
	        loop: false,               // 是否支持循环预览（默认false）
	        success: (res) => {
	          console.log("预览启动成功", res);
	        }
	      });
	}
	
	onLoad((e) =>{
		if(e.id){
			id.value = e.id
		}
		const config = WEBCONFIG?.value || '';
		if(config){
			shareData.value.title = config.sys.name
			shareData.value.path = '/pages/index/index?spread='
			shareData.value.query ='/pages/index/index?spread='
			shareData.value.imageUrl = $tool.imgReplace(config.sys.logo) ? $tool.imgReplace(config.sys.logo) : '/static/img/cpimg.png'
		}
		getinfo()

	})

	
</script>

<style scoped  lang="scss">
	.infobox{
		font-size: $uni-font-size-base;
		color: $uni-text-color;
	}
	
	.box{
		padding: 30rpx;
	}
	.img{
		width: 350rpx;
		height: 350rpx;
		border-radius: 30rpx;
	}
	.thumimg{
		margin: 10rpx 13rpx;
		width: 180rpx;
		height: 180rpx;
		border-radius: 20rpx;
	}
	.card{
		border-radius: 20rpx;
		background-color: #232327;
		border: 2rpx solid #333338;
		padding: 20rpx 30rpx;
		.title{
			font-size: 32rpx;
			color: #e3e3e3;
		}
		.desc{
			color: #b0b0b0;
		}
		.l_title{
			color: #919191;
		}
	}
	
</style>
