<template>
	<view class="voice-list">
		<view class="title">选择我的音色</view>
		<scroll-view scroll-y class="list-container" @scrolltolower="handleReachBottom">
			<view v-if="total > 0">
				<view class="voice-item" v-for="(item, index) in voiceList" :key="index">
					<!-- 状态遮罩层 -->
					<view class="voice_status_overlay" v-if="item.status != 2">
						<view class="status_content" v-if="item.status == 0 || item.status == 1">
							<view class="status_icon creating">
								<u-loading mode="circle" color="#3b82f6" size="40"></u-loading>
							</view>
							<view class="status_text creating">音色生成中...</view>
						</view>
						<view class="status_content" v-if="item.status == 3">
							<view class="status_icon failed">
								<uni-icons type="closeempty" size="50" color="#ef4444"></uni-icons>
							</view>
							<view class="status_text failed">生成失败</view>
						</view>
					</view>
					
					<!-- 音色内容 -->
					<view class="voice-item-content" :class="{ disabled: item.status != 2 }" @click="selectVoice(item)">
						<view class="voice-icon">
							<uni-icons type="mic-filled" size="40" color="#3b82f6"></uni-icons>
						</view>
						<view class="voice-info">
							<view class="voice-name">{{item.name}}</view>
							<view class="voice-desc">{{item.desc || '暂无描述'}}</view>
						</view>
						<view class="action-icons" v-if="item.status == 2">
							<view class="play-icon" @click.stop="playVoice(item, index)">
								<view v-if="currentPlayIndex !== index || !isPlaying" class="icon_play"></view>
								<view v-else class="icon_pause">
									<view class="icon_pause_bar"></view>
									<view class="icon_pause_bar"></view>
								</view>
							</view>
							<view class="check-icon" v-if="selectedId == item.id">
								<uni-icons type="checkmarkempty" size="28" color="#10b981"></uni-icons>
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
				<view class="empty-text">暂无音色数据</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import { ref, defineEmits, onUnmounted } from 'vue';
	import { $http, $tool } from '@/utils'
	
	const emit = defineEmits(['close'])
	const voiceList = ref([])
	const selectedId = ref('')
	
	// 分页相关
	const query = ref({
		page: 1,
		pageSize: 10,
		where: [],
		prop: 'id desc',
		classify:3,
	})
	const status = ref('loadmore')
	const loadText = ref({
		loadmore: '上拉加载更多',
		loading: '加载数据中',
		nomore: '我是有底线的'
	})
	const firstLoad = ref(false)
	const total = ref(0)
	
	// 音频播放相关
	let audioContext = null
	const isPlaying = ref(false)
	const currentPlayIndex = ref(-1)
	
	const open = () => {
		loadVoiceList()
	}
	
	const loadVoiceList = () => {
		uni.showLoading({
			title: '加载中',
		})
		query.value.page = 1
		firstLoad.value = false
		status.value = "loadmore"
		voiceList.value = []
		// 构建查询条件
		let where = [
			{
				op: 'exact',
				key: 'status',
				content: 2, // 只加载成功的音色
			}
		]
		if(where.length > 0){
			where = JSON.stringify(where)
		}
		query.value.where = where
		
		getLsit()
	}
	
	const getLsit = () => {
		$http.get('Human/list', query.value).then(res => {
			if(res.code == 200){
				let list = res.data.rows || []
				total.value = res.data.total || 0
				
				for(let i = 0; i < list.length; i++) {
					voiceList.value.push(list[i])
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
			getLsit()
		}
	}
	
	// 播放音频
	const playVoice = (item, index) => {
		const src = item.material_url || ''
		if (!src) {
			uni.showToast({ title: '暂无音频', icon: 'none' })
			return
		}
		
		if (!audioContext) {
			audioContext = uni.createInnerAudioContext()
			audioContext.onPlay(() => { 
				isPlaying.value = true 
			})
			audioContext.onPause(() => { 
				isPlaying.value = false 
			})
			audioContext.onStop(() => { 
				isPlaying.value = false 
			})
			audioContext.onEnded(() => {
				isPlaying.value = false
				currentPlayIndex.value = -1
			})
			audioContext.onError(() => {
				isPlaying.value = false
				currentPlayIndex.value = -1
				uni.showToast({ title: '播放失败', icon: 'none' })
			})
		}
		
		if (currentPlayIndex.value === index && isPlaying.value) {
			audioContext.pause()
		} else {
			if (currentPlayIndex.value !== index) {
				audioContext.src = $tool.imgReplace ? $tool.imgReplace(src) : src
				currentPlayIndex.value = index
			}
			audioContext.play()
		}
	}
	
	const selectVoice = (item) => {
		if(item.status != 2) {
			uni.showToast({
				title: '该音色暂不可用',
				icon: 'none'
			})
			return
		}
		selectedId.value = item.id
		setTimeout(() => {
			// 停止播放
			if(audioContext && isPlaying.value) {
				audioContext.stop()
			}
			emit('close', item)
		}, 200)
	}
	
	// 组件卸载时清理音频资源
	onUnmounted(() => {
		if (audioContext) {
			audioContext.stop()
			audioContext.destroy()
			audioContext = null
		}
	})
	
	// 停止音频播放（供外部调用）
	const stopAudio = () => {
		if (audioContext) {
			try {
				audioContext.stop()
			} catch(e) {
				console.log('停止音频失败:', e)
			}
			isPlaying.value = false
			currentPlayIndex.value = -1
		}
	}
	
	defineExpose({
		open,
		stopAudio
	})
</script>

<style scoped lang="scss">
	.voice-list{
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
			
			.voice-item{
				position: relative;
				margin-bottom: 30rpx;
				border-radius: 15rpx;
				overflow: hidden;
				
				// 状态遮罩层
				.voice_status_overlay{
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
					font-size: 28rpx;
					font-weight: bold;
					
					&.creating{
						color: #3b82f6;
					}
					&.failed{
						color: #ef4444;
					}
				}
				
				.voice-item-content{
					display: flex;
					align-items: center;
					padding: 25rpx 30rpx;
					background-color: #333338;
					border-radius: 15rpx;
					
					&.disabled{
						opacity: 0.3;
					}
					
					.voice-icon{
						width: 80rpx;
						height: 80rpx;
						border-radius: 50%;
						background-color: rgba(59, 130, 246, 0.1);
						display: flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;
					}
					.voice-info{
						flex: 1;
						margin-left: 20rpx;
						min-width: 0;
						
						.voice-name{
							font-size: 30rpx;
							color: #fff;
							font-weight: bold;
							margin-bottom: 8rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
						.voice-desc{
							font-size: 24rpx;
							color: #8b8b8b;
						}
					}
					.action-icons{
						display: flex;
						align-items: center;
						gap: 16rpx;
						margin-left: 20rpx;
						flex-shrink: 0;
						
						.play-icon{
							width: 56rpx;
							height: 56rpx;
							border-radius: 50%;
							background-color: rgba(59, 130, 246, 0.2);
							border: 2rpx solid rgba(59, 130, 246, 0.4);
							display: flex;
							align-items: center;
							justify-content: center;
							transition: all 0.3s ease;
							flex-shrink: 0;
							
							&:active{
								transform: scale(0.9);
								background-color: rgba(59, 130, 246, 0.3);
							}
						}
						
						/* 播放：三角形 */
						.icon_play{
							width: 0;
							height: 0;
							border-left: 20rpx solid #3b82f6;
							border-top: 12rpx solid transparent;
							border-bottom: 12rpx solid transparent;
							margin-left: 4rpx;
						}
						
						/* 暂停：两条竖线 */
						.icon_pause{
							display: flex;
							gap: 8rpx;
							align-items: center;
							justify-content: center;
						}
						.icon_pause_bar{
							width: 6rpx;
							height: 24rpx;
							background: #3b82f6;
							border-radius: 2rpx;
						}
						
						.check-icon{
							flex-shrink: 0;
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
</style>
