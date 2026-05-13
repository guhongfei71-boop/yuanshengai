<template>
	<view class="infobox">
		<view class="box m_top_40">
			<view class="card">
				<view class="acea-row row-middle">
					<view class="title_icon">
						<uni-icons type="person-filled" size="20" color="#fff"></uni-icons>
					</view>
					<view class="desc">填写分身名称</view>
				</view>
				<view class="neikuang m_top_30">
					<input 
						type="text" 
						v-model="form.name" 
						placeholder="请输入数字人分身名称" 
						:maxlength="20"
						class="input-box"
					/>
					<view class="char-count">{{form.name.length}}/20</view>
				</view>
			</view>

			<view class="card m_top_30">
				<view class="acea-row row-middle">
					<view class="title_icon">
						<uni-icons type="videocam-filled" size="20" color="#fff"></uni-icons>
					</view>
					<view class="desc">上传单人视频</view>
				</view>
				<view class="neikuang1 m_top_30">
					<view class="video-upload-box">
					<view v-if="!form.video_url" class="upload-placeholder" @click="uploadVideo">
						<view class="acea-row row-center">
							<uni-icons type="videocam" size="50" color="#bdbdbd"></uni-icons>
						</view>
						<view class="upload-text">点击上传视频</view>
						<view class="upload-tips">请上传单人视频</view>
					</view>
					<view v-else class="video-preview">
						<video 
							:src="form.video_url" 
							class="preview-video" 
							:controls="true"
							:show-center-play-btn="true"
							:enable-progress-gesture="true"
							object-fit="contain"
							:autoplay="false"
							:initial-time="0"
						></video>
						<view class="delete-btn" @click.stop="deleteVideo">
							<uni-icons type="trash" size="20" color="#fff"></uni-icons>
						</view>
					</view>
					</view>
				</view>
			</view>

			<view class="card m_top_30">
				<view class="card-header">
					<uni-icons type="info-filled" size="20" color="#3b82f6"></uni-icons>
					<view class="header-text">视频要求</view>
				</view>
				<view class="requirements">
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>支持格式:MP4、MOV</text>
					</view>
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>保持半身或全身远景</text>
					</view>
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>嘴巴有闭合画面</text>
					</view>
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>保持面对镜头</text>
					</view>
					
					<!-- 错误示例 -->
					<view class="error-examples m_top_30">
						<view class="error-title">
							<uni-icons type="closeempty" size="18" color="#ef4444"></uni-icons>
							<text>错误示例：</text>
						</view>
						<view class="example-row">
							<view class="example-item-inline">
								<uni-icons type="closeempty" size="16" color="#ef4444"></uni-icons>
								<text>挡住嘴巴</text>
							</view>
							<view class="example-item-inline">
								<uni-icons type="closeempty" size="16" color="#ef4444"></uni-icons>
								<text>人脸出框</text>
							</view>
							<view class="example-item-inline">
								<uni-icons type="closeempty" size="16" color="#ef4444"></uni-icons>
								<text>侧脸拍摄</text>
							</view>
							<view class="example-item-inline">
								<uni-icons type="closeempty" size="16" color="#ef4444"></uni-icons>
								<text>多人出境</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="m_top_40">
				<view class="bigbnt" @click="submitCreate">立即制作形象<text style="margin-left: 10rpx;font-size: 28rpx;" v-if="points > 0">(扣除{{points}}积分)</text></view>
			</view>
		</view>
		
		<!-- 购买积分弹窗 -->
		<u-popup v-model="buy_show" mode="center" border-radius="20" :closeable="false" z-index="1001" :mask-close-able="false">
			<PointsTips ref="PointsTipsRef" @close="buy_show = false"></PointsTips>
		</u-popup>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	import PointsTips from '../../components/PointsTips/PointsTips.vue';
	
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const storage = useCache()
	
	const form = ref({
		name: '',
		video_url: ''
	})
	const points = ref(0)
	const buy_show = ref(false)
	
	// 上传视频
	const uploadVideo = () => {
		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60,
			camera: 'back',
			success: (res) => {
				console.log('视频信息:', res)
				console.log('视频路径:', res.tempFilePath)
				uni.showLoading({
					title: '上传中',
					mask: true
				})
				$http.upload('Upload/upload', { name:"file", filePath:res.tempFilePath}).then(uploadRes => {
					if(uploadRes.code == 200){
						// 确保视频路径是完整的 URL
						let videoUrl = uploadRes.src
						if(videoUrl && !videoUrl.startsWith('http')) {
							videoUrl = $tool.imgReplace(videoUrl)
						}
						form.value.video_url = videoUrl
						console.log('上传后的视频路径:', form.value.video_url)
						uni.hideLoading()
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						})
					}else{
						uni.hideLoading()
						uni.showToast({
							title: uploadRes.msg,
							icon: 'none'
						})
					}
				}).catch(err => {
					uni.hideLoading()
					console.error('上传错误:', err)
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					})
				})
			},
			fail: (err) => {
				console.error('选择视频失败:', err)
			}
		})
	}
	
	// 删除视频
	const deleteVideo = () => {
		form.value.video_url = ''
	}
	
	// 提交创建
	const submitCreate = () => {
		if(!form.value.name){
			uni.showToast({
				title: '请填写分身名称',
				icon: 'none'
			})
			return false
		}
		
		if(!form.value.video_url){
			uni.showToast({
				title: '请上传视频',
				icon: 'none'
			})
			return false
		}
		
		uni.showLoading({
			title: '提交中',
			mask: false
		})
		
		$http.post('Human/createImage', form.value).then(res => {
			if(res.code == 200){
				uni.hideLoading()
				uni.showModal({
					title: '温馨提示',
					content: res.msg || '形象创建成功，正在生成中...',
					success: function (modalRes) {
						if (modalRes.confirm) {
							uni.navigateBack()
						}
					}
				});
			}else{
				if(res.msg == '积分不足'){
					buy_show.value = true
				}else{
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		}).catch(err => {
			uni.hideLoading()
		})
	}
	
	onLoad((e) => {
		const config = WEBCONFIG?.value || '';
		if(config){
			points.value = WEBCONFIG?.value.api.human_role_points || 0
		}
	})
	
	onShow(() => {
		// 页面显示时的逻辑
	})
</script>

<style scoped lang="scss">
	.infobox{
		font-size: $uni-font-size-base;
		color: $uni-text-color;
		padding-bottom: 40rpx;
	}
	.box{
		padding: 0rpx 40rpx 40rpx 40rpx;
	}
	
	.card{
		font-size: 28rpx;
		border-radius: 20rpx;
		background-color: #232327;
		border: 2rpx solid #333338;
		padding: 30rpx 30rpx;
		
		.title_bnt{
			font-size: 30rpx;
			font-weight: bold;
			border-radius: 10rpx;
			color: #fff;
			padding: 15rpx 30rpx;
			background: linear-gradient(130deg,
			  #3b82f6 10%,
			  #1d4ed8 30%,
			  #1d4ed8 70%,
			  #3b82f6 100%
			);
		}
		
		.title_icon{
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(130deg,
			  #3b82f6 10%,
			  #1d4ed8 30%,
			  #1d4ed8 70%,
			  #3b82f6 100%
			);
		}
		
		.desc{
			font-size: 30rpx;
			color: #dfdfdf;
			margin-left: 20rpx;
		}
		
		.neikuang{
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			background-color: #333338;
			padding: 20rpx 30rpx;
			position: relative;
			
			.input-box{
				font-size: 28rpx;
				color: #fff;
				width: 100%;
				padding: 10rpx 0;
			}
			
			.char-count{
				position: absolute;
				right: 30rpx;
				top: 50%;
				transform: translateY(-50%);
				font-size: 24rpx;
				color: #8b8b8b;
			}
		}
		
		.neikuang1{
			padding: 0 25rpx;
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			background-color: #333338;
		}
		
		.card-header{
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			.header-text{
				margin-left: 10rpx;
				font-size: 30rpx;
				font-weight: bold;
				color: #fff;
			}
			
			&.error-header{
				.header-text{
					color: #ef4444;
				}
			}
		}
		
		.requirements{
			.req-item{
				display: flex;
				align-items: center;
				padding: 15rpx 0;
				font-size: 28rpx;
				color: #dfdfdf;
				
				text{
					margin-left: 15rpx;
				}
			}
			
			.error-examples{
				margin-top: 30rpx;
				padding-top: 30rpx;
				border-top: 2rpx solid rgba(239, 68, 68, 0.2);
				
				.error-title{
					display: flex;
					align-items: center;
					font-size: 28rpx;
					color: #ef4444;
					margin-bottom: 20rpx;
					
					text{
						margin-left: 10rpx;
						font-weight: bold;
					}
				}
				
				.example-row{
					display: flex;
					flex-wrap: wrap;
					gap: 15rpx;
					
					.example-item-inline{
						display: flex;
						align-items: center;
						padding: 10rpx 20rpx;
						background-color: rgba(239, 68, 68, 0.1);
						border-radius: 8rpx;
						border: 1rpx solid rgba(239, 68, 68, 0.3);
						
						text{
							margin-left: 8rpx;
							font-size: 26rpx;
							color: #ef4444;
						}
					}
				}
			}
		}
	}
	
	// 视频上传样式
	.video-upload-box{
		width: 100%;
		min-height: 400rpx;
		padding: 30rpx 0;
		border-radius: 20rpx;
		overflow: hidden;
		
		.upload-placeholder{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			min-height: 400rpx;
			
			.upload-text{
				margin-top: 20rpx;
				font-size: 32rpx;
				color: #bdbdbd;
			}
			
			.upload-tips{
				margin-top: 10rpx;
				font-size: 24rpx;
				color: #8b8b8b;
			}
		}
		
		.video-preview{
			position: relative;
			width: 100%;
			height: 400rpx;
			background-color: #000;
			border-radius: 20rpx;
			overflow: hidden;
			
			.preview-video{
				width: 100%;
				height: 100%;
				display: block;
			}
			
			.delete-btn{
				position: absolute;
				top: 20rpx;
				right: 20rpx;
				width: 60rpx;
				height: 60rpx;
				background-color: rgba(0, 0, 0, 0.6);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
	
	.bigbnt{
		border-radius: 30rpx;
		color: #fff;
		padding: 30rpx 25rpx;
		background: linear-gradient(130deg,
		  #3b82f6 10%,
		  #1d4ed8 30%,
		  #1d4ed8 70%,
		  #3b82f6 100%
		);
		text-align: center;
		font-size: 32rpx;
	}
	
	.card_tips{
		margin-top: 20rpx;
		text-align: center;
		font-size: 24rpx;
		font-weight: bold;
		color: #8b8b8b;
	}
</style>
