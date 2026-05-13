<template>
	<view class="image-list">
		<view class="title">选择我的形象</view>
		<scroll-view scroll-y class="list-container" @scrolltolower="handleReachBottom">
			<view v-if="total > 0">
				<view class="image-grid">
					<view class="image-item" v-for="(item, index) in imageList" :key="index">
						<!-- 形象内容 -->
						<view class="image-item-content" @click="selectImage(item)">
							<image :src="item.img ? $tool.imgReplace(item.img) : '/static/img/300-200.png'" mode="aspectFill" class="image-cover"></image>
							
							<!-- 视频预览按钮 -->
							<view class="preview-btn" @click.stop="previewVideo(item)" v-if="item.material_url">
								<view class="preview-icon">
									<uni-icons type="videocam-filled" size="24" color="#fff"></uni-icons>
								</view>
								<view class="preview-text">预览</view>
							</view>
							
							<view class="image-info">
								<view class="image-name">{{item.name}}</view>
							</view>
							<view class="check-icon" v-if="selectedId == item.id">
								<uni-icons type="checkmarkempty" size="40" color="#10b981"></uni-icons>
							</view>
						</view>
					</view>
				</view>
				<view class="m_top_30" v-if="total > 0">
					<u-loadmore :status="status" :load-text="loadText"/>
				</view>
			</view>
			<view v-else class="empty-box">
				<uni-icons type="info" size="60" color="#8b8b8b"></uni-icons>
				<view class="empty-text">暂无形象数据</view>
			</view>
		</scroll-view>
		
		<!-- 视频预览弹窗 -->
		<u-popup v-model="videoPreviewShow" mode="center" width="90%" border-radius="20">
			<view class="video-preview-popup">
				<view class="video-preview-header">
					<view class="video-title">{{currentVideo.name}}</view>
					<view class="close-btn" @click="closeVideoPreview">
						<uni-icons type="closeempty" size="28" color="#fff"></uni-icons>
					</view>
				</view>
				<view class="video-container">
					<video 
						:src="currentVideo.material_url ? $tool.imgReplace(currentVideo.material_url) : ''" 
						:controls="true"
						:show-center-play-btn="true"
						:enable-progress-gesture="true"
						object-fit="contain"
						class="preview-video"
					></video>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script setup>
	import { ref, defineEmits } from 'vue';
	import { $http, $tool } from '@/utils'
	
	const emit = defineEmits(['close'])
	const imageList = ref([])
	const selectedId = ref('')
	const videoPreviewShow = ref(false)
	const currentVideo = ref({})
	
	// 分页相关
	const query = ref({
		page: 1,
		pageSize: 10,
		where: [],
		prop: 'id desc',
		classify: 2,
	})
	const status = ref('loadmore')
	const loadText = ref({
		loadmore: '上拉加载更多',
		loading: '加载数据中',
		nomore: '我是有底线的'
	})
	const firstLoad = ref(false)
	const total = ref(0)
	
	const open = () => {
		loadImageList()
	}
	
	const loadImageList = () => {
		uni.showLoading({
			title: '加载中',
		})
		query.value.page = 1
		firstLoad.value = false
		status.value = "loadmore"
		imageList.value = []
		// 构建查询条件
		let where = [
			{
				op: 'exact',
				key: 'status',
				content: 2, // 只加载成功的形象
			}
		]
		if(where.length > 0){
			where = JSON.stringify(where)
		}
		query.value.where = where
		
		getList()
	}
	
	const getList = () => {
		$http.get('Human/list', query.value).then(res => {
			if(res.code == 200){
				let list = res.data.rows || []
				total.value = res.data.total || 0
				
				for(let i = 0; i < list.length; i++) {
					imageList.value.push(list[i])
				}
				
				if(list.length < query.value.pageSize){
					firstLoad.value = true
					status.value = "nomore"
				}else{
					firstLoad.value = false
				}
			}else{
				firstLoad.value = true
				status.value = "nomore"
				if(query.value.page > 1){
					query.value.page -= 1
				}
			}
			uni.hideLoading()
		}).catch(err => {
			uni.hideLoading()
			firstLoad.value = true
			status.value = "nomore"
		})
	}
	
	const handleReachBottom = () => {
		if(!firstLoad.value){
			firstLoad.value = true
			status.value = "loading"
			query.value.page += 1
			getList()
		}
	}
	
	const selectImage = (item) => {
		if(item.status != 2) {
			uni.showToast({
				title: '该形象暂不可用',
				icon: 'none'
			})
			return
		}
		selectedId.value = item.id
		setTimeout(() => {
			emit('close', item)
		}, 200)
	}
	
	const previewVideo = (item) => {
		if(!item.material_url) {
			uni.showToast({
				title: '该形象暂无视频',
				icon: 'none'
			})
			return
		}
		currentVideo.value = item
		videoPreviewShow.value = true
	}
	
	const closeVideoPreview = () => {
		videoPreviewShow.value = false
		currentVideo.value = {}
	}
	
	defineExpose({
		open
	})
</script>

<style scoped lang="scss">
	.image-list{
		width: 100%;
		max-height: 600rpx;
		.title{
			font-size: 34rpx;
			font-weight: bold;
			color: #fff;
			text-align: center;
			margin-bottom: 30rpx;
		}
		.list-container{
			max-height: 550rpx;
			
			.image-grid{
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 40rpx;
			}
			
			.image-item{
				position: relative;
				border-radius: 15rpx;
				overflow: hidden;
				
				// 状态遮罩层
				.image_status_overlay{
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					z-index: 10;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(0, 0, 0, 0.85);
					backdrop-filter: blur(10rpx);
					border-radius: 15rpx;
				}
				.status_content{
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 12rpx;
				}
				.status_icon{
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					
					&.creating{
						background: rgba(59, 130, 246, 0.15);
					}
					&.failed{
						background: rgba(239, 68, 68, 0.15);
					}
				}
				.status_text{
					font-size: 26rpx;
					font-weight: bold;
					
					&.creating{
						color: #3b82f6;
					}
					&.failed{
						color: #ef4444;
					}
				}
				
				.image-item-content{
					position: relative;
					width: 100%;
					height: 320rpx;
					background-color: #333338;
					border-radius: 15rpx;
					overflow: hidden;
					
					&.disabled{
						opacity: 0.3;
					}
					
					.image-cover{
						width: 100%;
						height: 100%;
						display: block;
					}
					
					.preview-btn{
						position: absolute;
						top: 12rpx;
						right: 12rpx;
						display: flex;
						align-items: center;
						gap: 6rpx;
						padding: 8rpx 16rpx;
						background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
						border-radius: 20rpx;
						box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.4);
						z-index: 5;
						
						.preview-icon{
							display: flex;
							align-items: center;
							justify-content: center;
						}
						
						.preview-text{
							font-size: 22rpx;
							color: #fff;
							font-weight: bold;
						}
						
						&:active{
							transform: scale(0.95);
							opacity: 0.8;
						}
					}
					
					.image-info{
						position: absolute;
						bottom: 0;
						left: 0;
						right: 0;
						padding: 15rpx 12rpx;
						background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
						
						.image-name{
							font-size: 28rpx;
							color: #fff;
							font-weight: bold;
							text-align: center;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
					}
					
					.check-icon{
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						width: 80rpx;
						height: 80rpx;
						border-radius: 50%;
						background: rgba(16, 185, 129, 0.2);
						backdrop-filter: blur(10rpx);
						border: 3rpx solid #10b981;
						display: flex;
						align-items: center;
						justify-content: center;
						animation: scaleIn 0.3s ease;
					}
					
					@keyframes scaleIn {
						0% {
							transform: translate(-50%, -50%) scale(0);
						}
						50% {
							transform: translate(-50%, -50%) scale(1.2);
						}
						100% {
							transform: translate(-50%, -50%) scale(1);
						}
					}
				}
			}
		}
		.empty-box{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 80rpx 0;
			.empty-text{
				margin-top: 20rpx;
				font-size: 28rpx;
				color: #8b8b8b;
			}
		}
	}
	
	.video-preview-popup{
		background: #1a1a1f;
		border-radius: 20rpx;
		overflow: hidden;
		
		.video-preview-header{
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx;
			background: linear-gradient(135deg, #2a2a30 0%, #1a1a1f 100%);
			border-bottom: 2rpx solid rgba(255, 255, 255, 0.1);
			
			.video-title{
				font-size: 32rpx;
				font-weight: bold;
				color: #fff;
				flex: 1;
			}
			
			.close-btn{
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.1);
				display: flex;
				align-items: center;
				justify-content: center;
				
				&:active{
					background: rgba(255, 255, 255, 0.2);
				}
			}
		}
		
		.video-container{
			width: 100%;
			padding: 30rpx;
			
			.preview-video{
				width: 100%;
				height: 400rpx;
				border-radius: 12rpx;
				background: #000;
			}
		}
	}
</style>
