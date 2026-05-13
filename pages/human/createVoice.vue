<template>
	<view class="infobox">
		<view class="box m_top_40">
			<view class="card">
				<view class="acea-row row-middle">
					<view class="title_icon">
						<uni-icons type="mic-filled" size="20" color="#fff"></uni-icons>
					</view>
					<view class="desc">填写声音名称</view>
				</view>
				<view class="neikuang m_top_30">
					<input 
						type="text" 
						v-model="form.name" 
						placeholder="请输入声音名称" 
						:maxlength="20"
						class="input-box"
					/>
					<view class="char-count">{{form.name.length}}/20</view>
				</view>
			</view>

			<view class="card m_top_30">
				<view class="acea-row row-middle">
					<view class="title_icon">
						<uni-icons type="sound-filled" size="20" color="#fff"></uni-icons>
					</view>
					<view class="desc">录音上传</view>
				</view>
				
				<!-- 录音或选择文件按钮 -->
				<view class="upload-options m_top_30" v-if="!form.audio_url">
					<view class="option-btn record-btn" @click="startRecording">
						<uni-icons type="mic-filled" size="40" color="#fff"></uni-icons>
						<view class="btn-text">开始录音</view>
					</view>
					<view class="option-btn file-btn" @click="chooseFile">
						<uni-icons type="folder-add" size="40" color="#fff"></uni-icons>
						<view class="btn-text">从文件中选择</view>
					</view>
				</view>
				
				<!-- 录音中界面 -->
				<view class="recording-box" v-if="isRecording">
					<view class="recording-animation">
						<view class="wave-circle circle1"></view>
						<view class="wave-circle circle2"></view>
						<view class="wave-circle circle3"></view>
						<view class="recording-icon">
							<uni-icons type="mic-filled" size="50" color="#ef4444"></uni-icons>
						</view>
					</view>
					<view class="recording-time">录音中... {{recordingTime}}s</view>
					<view class="recording-tips">请保持清晰发音</view>
					<view class="stop-btn" @click="stopRecording">
						<uni-icons type="close" size="24" color="#fff"></uni-icons>
						<text>停止录音</text>
					</view>
				</view>
				
				<!-- 录音完成后的预览 -->
				<view class="audio-preview" v-if="form.audio_url && !isRecording">
					<view class="audio-info">
						<view class="audio-icon">
							<uni-icons type="sound-filled" size="40" color="#3b82f6"></uni-icons>
						</view>
						<view class="audio-details">
							<view class="audio-name">录音文件</view>
							<view class="audio-duration" v-if="audioDuration">时长: {{audioDuration}}s</view>
						</view>
					</view>
					<view class="audio-controls">
						<view class="play-btn" @click="playAudio" v-if="!isPlaying">
							<uni-icons type="play-filled" size="24" color="#3b82f6"></uni-icons>
							<text>试听</text>
						</view>
						<view class="play-btn playing" @click="pauseAudio" v-else>
							<uni-icons type="pause-filled" size="24" color="#3b82f6"></uni-icons>
							<text>暂停</text>
						</view>
						<view class="delete-btn-audio" @click="deleteAudio">
							<uni-icons type="trash" size="24" color="#ef4444"></uni-icons>
							<text>删除</text>
						</view>
					</view>
				</view>
			</view>

			<view class="card m_top_30">
				<view class="card-header">
					<uni-icons type="info-filled" size="20" color="#3b82f6"></uni-icons>
					<view class="header-text">录音要求</view>
				</view>
				<view class="requirements">
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>支持格式：MP3、WAV、M4A</text>
					</view>
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>录音时长建议10-60秒</text>
					</view>
					<view class="req-item">
						<uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
						<text>保持环境安静，发音清晰</text>
					</view>
				</view>
			</view>

			<view class="m_top_40">
				<view class="bigbnt" @click="submitCreate">开始制作声音<text style="margin-left: 10rpx;font-size: 28rpx;" v-if="points > 0">(扣除{{points}}积分)</text></view>
			</view>
		</view>
		
		<!-- 购买积分弹窗 -->
		<u-popup v-model="buy_show" mode="center" border-radius="20" :closeable="false" z-index="1001" :mask-close-able="false">
			<PointsTips ref="PointsTipsRef" @close="buy_show = false"></PointsTips>
		</u-popup>
	</view>
</template>

<script setup>
	import { ref, onUnmounted } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	import PointsTips from '../../components/PointsTips/PointsTips.vue';
	
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const storage = useCache()
	
	const form = ref({
		name: '',
		audio_url: ''
	})
	const points = ref(0)
	const buy_show = ref(false)
	const isRecording = ref(false)
	const recordingTime = ref(0)
	const isPlaying = ref(false)
	const audioDuration = ref(0)
	
	let recorderManager = null
	let innerAudioContext = null
	let recordingTimer = null
	
	// 初始化录音管理器
	const initRecorder = () => {
		// #ifdef MP-WEIXIN
		recorderManager = uni.getRecorderManager()
		
		recorderManager.onStart(() => {
			console.log('录音开始')
			isRecording.value = true
			recordingTime.value = 0
			startTimer()
		})
		
		recorderManager.onStop((res) => {
			console.log('录音停止', res)
			isRecording.value = false
			stopTimer()
			uploadRecording(res.tempFilePath)
		})
		
		recorderManager.onError((err) => {
			console.error('录音错误', err)
			isRecording.value = false
			stopTimer()
			uni.showToast({
				title: '录音失败',
				icon: 'none'
			})
		})
		// #endif
	}
	
	// 开始录音
	const startRecording = () => {
		// #ifdef MP-WEIXIN
		if(!recorderManager){
			initRecorder()
		}
		uni.authorize({
			scope: 'scope.record',
			success() {
				recorderManager.start({
					duration: 60000, // 最长60秒
					format: 'mp3'
				})
			},
			fail() {
				uni.showModal({
					title: '提示',
					content: '需要录音权限才能使用此功能',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting()
						}
					}
				})
			}
		})
		// #endif
		// #ifdef H5
		uni.showToast({
			title: 'H5暂不支持录音',
			icon: 'none'
		})
		// #endif
	}
	
	// 停止录音
	const stopRecording = () => {
		// #ifdef MP-WEIXIN
		if(recorderManager){
			recorderManager.stop()
		}
		// #endif
	}
	
	// 计时器
	const startTimer = () => {
		recordingTimer = setInterval(() => {
			recordingTime.value++
			if(recordingTime.value >= 60){
				stopRecording()
			}
		}, 1000)
	}
	
	const stopTimer = () => {
		if(recordingTimer){
			clearInterval(recordingTimer)
			recordingTimer = null
		}
	}
	
	// 上传录音
	const uploadRecording = (tempFilePath) => {
		uni.showLoading({
			title: '上传中',
			mask: true
		})
		$http.upload('Upload/upload', { name:"file", filePath: tempFilePath}).then(uploadRes => {
			if(uploadRes.code == 200){
				form.value.audio_url = $tool.imgReplace(uploadRes.src)
				audioDuration.value = recordingTime.value
				uni.showToast({
					title: '上传成功',
					icon: 'none'
				})
			}else{
				uni.showToast({
					title: uploadRes.msg,
					icon: 'none'
				})
			}
		}).catch(err => {
			uni.hideLoading()
			uni.showToast({
				title: '上传失败',
				icon: 'none'
			})
		})
	}
	
	// 从文件中选择
	const chooseFile = () => {
		// #ifdef MP-WEIXIN
		uni.chooseMessageFile({
			count: 1,
			type: 'all',
			extension: ['.mp3', '.wav', '.m4a'],
			success: (res) => {
				console.log('选择文件:', res.tempFiles[0].path)
				uni.showLoading({
					title: '上传中',
					mask: true
				})
				$http.upload('Upload/upload', { name:"file", filePath:res.tempFiles[0].path}).then(uploadRes => {
					if(uploadRes.code == 200){
						form.value.audio_url = $tool.imgReplace(uploadRes.src)
						uni.showToast({
							title: '上传成功',
							icon: 'none'
						})
					}else{
						uni.showToast({
							title: uploadRes.msg,
							icon: 'none'
						})
					}
				}).catch(err => {
					uni.hideLoading()
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					})
				})
			}
		})
		// #endif
		// #ifdef H5
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'audio/*'
		input.onchange = (e) => {
			const file = e.target.files[0]
			if(file){
				uni.showToast({
					title: 'H5端文件上传功能开发中',
					icon: 'none'
				})
			}
		}
		input.click()
		// #endif
	}
	
	// 播放音频
	const playAudio = () => {
		if(!innerAudioContext){
			innerAudioContext = uni.createInnerAudioContext()
			innerAudioContext.onPlay(() => {
				isPlaying.value = true
			})
			innerAudioContext.onEnded(() => {
				isPlaying.value = false
			})
			innerAudioContext.onError((err) => {
				console.error('音频播放错误', err)
				isPlaying.value = false
				uni.showToast({
					title: '播放失败',
					icon: 'none'
				})
			})
		}
		innerAudioContext.src = form.value.audio_url
		innerAudioContext.play()
	}
	
	// 暂停音频
	const pauseAudio = () => {
		if(innerAudioContext){
			innerAudioContext.pause()
			isPlaying.value = false
		}
	}
	
	// 删除音频
	const deleteAudio = () => {
		uni.showModal({
			title: '提示',
			content: '确定要删除录音吗？',
			success: (res) => {
				if(res.confirm){
					form.value.audio_url = ''
					audioDuration.value = 0
					if(innerAudioContext){
						innerAudioContext.stop()
						isPlaying.value = false
					}
				}
			}
		})
	}
	
	// 提交创建
	const submitCreate = () => {
		if(!form.value.name){
			uni.showToast({
				title: '请填写声音名称',
				icon: 'none'
			})
			return false
		}
		
		if(!form.value.audio_url){
			uni.showToast({
				title: '请上传录音或选择音频文件',
				icon: 'none'
			})
			return false
		}
		
		uni.showLoading({
			title: '提交中',
			mask: false
		})
		
		$http.post('Human/createTimbre', form.value).then(res => {
			if(res.code == 200){
				uni.hideLoading()
				uni.showModal({
					title: '温馨提示',
					content: res.msg || '声音创建成功，正在生成中...',
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
		points.value = WEBCONFIG?.value.api.human_timbre_points || 0
	}
	// 不在 onLoad 时初始化录音管理器，而是在用户点击录音时才初始化
	// initRecorder()
})

onShow(() => {
	// 页面显示时的逻辑
})

onUnmounted(() => {
	// 清理资源
	stopTimer()
	// 只有在录音管理器存在时才清理
	if(recorderManager){
		try {
			recorderManager.stop()
		} catch(e) {
			console.log('停止录音失败', e)
		}
	}
	if(innerAudioContext){
		try {
			innerAudioContext.stop()
			innerAudioContext.destroy()
		} catch(e) {
			console.log('清理音频失败', e)
		}
	}
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
		}
	}
	
	// 上传选项
	.upload-options{
		display: flex;
		gap: 20rpx;
		padding: 30rpx 0;
		
		.option-btn{
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 40rpx 20rpx;
			border-radius: 20rpx;
			
			.btn-text{
				margin-top: 15rpx;
				font-size: 28rpx;
				color: #fff;
				font-weight: bold;
			}
			
			&.record-btn{
				background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
			}
			
			&.file-btn{
				background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
			}
		}
	}
	
	// 录音中界面
	.recording-box{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;
		
		.recording-animation{
			position: relative;
			width: 200rpx;
			height: 200rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.wave-circle{
				position: absolute;
				width: 100%;
				height: 100%;
				border-radius: 50%;
				border: 4rpx solid #ef4444;
				animation: wave 1.5s ease-out infinite;
				
				&.circle1{
					animation-delay: 0s;
				}
				&.circle2{
					animation-delay: 0.5s;
				}
				&.circle3{
					animation-delay: 1s;
				}
			}
			
			.recording-icon{
				z-index: 10;
			}
		}
		
		.recording-time{
			margin-top: 30rpx;
			font-size: 36rpx;
			font-weight: bold;
			color: #ef4444;
		}
		
		.recording-tips{
			margin-top: 10rpx;
			font-size: 24rpx;
			color: #8b8b8b;
		}
		
		.stop-btn{
			margin-top: 40rpx;
			display: flex;
			align-items: center;
			padding: 15rpx 40rpx;
			background-color: #ef4444;
			border-radius: 50rpx;
			
			text{
				margin-left: 10rpx;
				font-size: 28rpx;
				color: #fff;
				font-weight: bold;
			}
		}
	}
	
	@keyframes wave {
		0% {
			transform: scale(0.5);
			opacity: 1;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}
	
	// 音频预览
	.audio-preview{
		padding: 30rpx;
		
		.audio-info{
			display: flex;
			align-items: center;
			padding: 30rpx;
			background-color: rgba(59, 130, 246, 0.1);
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			
			.audio-icon{
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				background-color: rgba(59, 130, 246, 0.2);
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			.audio-details{
				flex: 1;
				margin-left: 20rpx;
				
				.audio-name{
					font-size: 30rpx;
					color: #fff;
					font-weight: bold;
					margin-bottom: 10rpx;
				}
				
				.audio-duration{
					font-size: 24rpx;
					color: #8b8b8b;
				}
			}
		}
		
		.audio-controls{
			display: flex;
			gap: 20rpx;
			
			.play-btn, .delete-btn-audio{
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 20rpx;
				border-radius: 15rpx;
				
				text{
					margin-left: 10rpx;
					font-size: 28rpx;
					font-weight: bold;
				}
			}
			
			.play-btn{
				background-color: rgba(59, 130, 246, 0.2);
				border: 2rpx solid #3b82f6;
				
				text{
					color: #3b82f6;
				}
				
				&.playing{
					background-color: #3b82f6;
					
					text{
						color: #fff;
					}
				}
			}
			
			.delete-btn-audio{
				background-color: rgba(239, 68, 68, 0.1);
				border: 2rpx solid #ef4444;
				
				text{
					color: #ef4444;
				}
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
