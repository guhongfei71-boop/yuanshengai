<template>
	<view class="infobox">
		<view class="box m_top_40">
			<view class="card">
				<view class="acea-row row-between-wrapper">
					<veiw class="acea-row row-middle">
						<view class="title_bnt">第一步</view><view class="desc">选择我的形象</view>
					</veiw>
				</view>
				<view class="neikuang1 m_top_30" @click="openImageSelect">
					<view class="select-box">
						<view v-if="!selectedImage" class="select-placeholder">
							<view class="acea-row row-center">
								<uni-icons type="person" size="40" color="#bdbdbd"></uni-icons>
							</view>
							<view class="select-text">点击选择我的形象</view>
						</view>
						<view v-else class="image-preview-box">
							<image :src="selectedImage.img ? $tool.imgReplace(selectedImage.img) : '/static/img/300-200.png'" mode="aspectFill" class="preview-image"></image>
							<!-- 预览按钮 -->
							<view class="preview-btn-top" @click.stop="previewSelectedImage" v-if="selectedImage.material_url">
								<view class="preview-icon">
									<uni-icons type="videocam-filled" size="20" color="#fff"></uni-icons>
								</view>
								<view class="preview-text">预览</view>
							</view>
							<!-- 形象名称 -->
							<view class="image-name-overlay">
								<view class="acea-row row-middle">
									<uni-icons type="checkmarkempty" size="20" color="#10b981"></uni-icons>
									<view class="image-name-text">{{selectedImage.name}}</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!-- #ifdef MP -->
			<view v-if="WEBCONFIG?.mp_banner" class="acea-row row-center-wrapper m_top_30">
				<ad-custom :unit-id="WEBCONFIG?.mp_banner" bindload="adLoad" binderror="adError" bindclose="adClose"></ad-custom>
			</view>
			<!-- #endif -->
			<view class="card m_top_30">
				<view class="acea-row row-middle">
					<view class="title_bnt">第二步</view><view class="desc">选择我的音色</view>
				</view>
				<view class="neikuang1 m_top_30" @click="openVoiceSelect">
					<view class="select-box">
						<view v-if="!selectedVoice" class="select-placeholder">
							<view class="acea-row row-center">
								<uni-icons type="mic" size="40" color="#bdbdbd"></uni-icons>
							</view>
							<view class="select-text">点击选择我的音色</view>
						</view>
						<view v-else class="voice-selected-box">
							<view class="voice-icon-wrapper">
								<view class="voice-wave wave1"></view>
								<view class="voice-wave wave2"></view>
								<view class="voice-wave wave3"></view>
								<view class="voice-icon-center">
									<uni-icons type="mic-filled" size="32" color="#fff"></uni-icons>
								</view>
							</view>
							<view class="voice-info">
								<view class="voice-name">{{selectedVoice.name}}</view>
								<view class="voice-status">
									<uni-icons type="checkmarkempty" size="16" color="#10b981"></uni-icons>
									<text class="status-text">已选择</text>
								</view>
							</view>
							<view class="change-btn">
								<uni-icons type="refresh" size="20" color="#3b82f6"></uni-icons>
								<text class="change-text">更换</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="card m_top_30">
				<view class="acea-row row-middle">
					<view class="title_bnt">第三步</view><view class="desc">输入讲述文字</view>
				</view>
				<view class="neikuang m_top_30">
					<textarea placeholder="请输入数字人要讲述的文字内容..." 
					v-model="form.text" 
					:maxlength="WEBCONFIG?.api.miaoshu_max || 500" 
					style=" padding: 20rpx 30rpx;font-size: 28rpx; width: 90%; min-height: 200rpx;" 
					@input="onTextareaInput"
					ref="textareaRef"
					/>
					<veiw class="qingkong acea-row row-between-wrapper">
						<view class="acea-row">
							<view class="qingkong_bnt" @click="clearText">
								<uni-icons type="trash" size="16" color="#afafaf" style="margin-right: 5rpx;"></uni-icons>清空
							</view>
							<view class="qingkong_bnt mycopy_bnt" @click="openMyCopywriting">
								<uni-icons type="list" size="16" color="#afafaf" style="margin-right: 5rpx;"></uni-icons>我的文案
							</view>
						</view>
						<veiw style="color: #afafaf; font-size: 28rpx; margin-right: 20rpx;">
							{{textNum}}/{{WEBCONFIG?.api.miaoshu_max || 500}}
						</veiw>
					</veiw>
				</view>
				<!-- 语言选择和AI文案按钮 -->
				<view class="text-tools m_top_20">
					<view class="tool-btn" @click="openLanguageSelect">
						<view class="tool-icon">
							<uni-icons type="flag-filled" size="20" color="#fff"></uni-icons>
						</view>
						<view class="tool-info">
							<view class="tool-label">翻译语言</view>
							<view class="tool-value">{{selectedLanguage}}</view>
						</view>
						<view class="tool-arrow">
							<uni-icons type="right" size="16" color="#8b8b8b"></uni-icons>
						</view>
					</view>
					<view class="tool-btn" @click="openAICopywriting">
						<view class="tool-icon ai-icon">
							<uni-icons type="star-filled" size="20" color="#fff"></uni-icons>
						</view>
						<view class="tool-info">
							<view class="tool-label">AI文案</view>
							<view class="tool-value">智能生成</view>
						</view>
						<view class="tool-arrow">
							<uni-icons type="right" size="16" color="#8b8b8b"></uni-icons>
						</view>
					</view>
				</view>
			</view>
			<view class="m_top_40">
				<view class="action-buttons">
					<view 
						class="preview-btn-action" 
						:class="{ 'has-audio': previewCache.audioUrl, 'playing': isPreviewPlaying }"
						@click="togglePreview">
						<!-- 未生成状态 -->
						<template v-if="!previewCache.audioUrl">
							<uni-icons type="sound-filled" size="24" color="#fff"></uni-icons>
							<text>试听</text>
						</template>
						<!-- 播放中状态 -->
						<template v-else-if="isPreviewPlaying">
							<view class="pause-icon">
								<view class="pause-bar"></view>
								<view class="pause-bar"></view>
							</view>
							<text>暂停</text>
						</template>
						<!-- 已生成暂停状态 -->
						<template v-else>
							<view class="play-icon">
								<view class="play-triangle"></view>
							</view>
							<text>播放</text>
						</template>
					</view>
					<view class="bigbnt" @click="fangdou">
						开始制作
						<text style="margin-left: 10rpx;font-size: 28rpx;"></text>
					</view>
				</view>

				<view class="card_tips">
					(本页面数字人由AI技术生成)
				</view>

			</view>
		</view>
		
		<!-- 形象选择弹窗 -->
		<u-popup v-model="image_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="role_popup">
				<ImageList ref="ImageListRef" @close="closeImageSelect"></ImageList>
				<view class="role_bnt m_top_60" @click="createNewImage">新建形象</view>
			</view>
		</u-popup>

		<!-- 声音选择弹窗 -->
		<u-popup v-model="voice_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="role_popup">
				<VoiceList ref="VoiceListRef" @close="closeVoiceSelect"></VoiceList>
				<view class="role_bnt m_top_60" @click="createNewVoice">新建音色</view>
			</view>
		</u-popup>
		
		<!-- 购买积分弹窗 -->
		<u-popup v-model="buy_show" mode="center" border-radius="20" :closeable="false" z-index="1001" :mask-close-able="false">
			<PointsTips ref="PointsTipsRef"  @close="buy_show = false"></PointsTips>
		</u-popup>
		
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
						id="previewVideo"
					></video>
				</view>
			</view>
		</u-popup>
		
		<!-- 语言选择弹窗 -->
		<u-popup v-model="language_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="language_popup">
				<view class="popup-title">选择语言</view>
				<scroll-view scroll-y class="language-scroll">
					<view class="language-list">
						<view class="language-item" 
							v-for="(item, index) in languageList" 
							:key="index"
							:class="{ active: selectedLanguage == item.name }"
							@click="selectLanguage(item)">
							<view class="language-name">{{item.name}}</view>
							<view class="check-icon" v-if="selectedLanguage == item.name">
								<uni-icons type="checkmarkempty" size="24" color="#3b82f6"></uni-icons>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="popup-close-btn" @click="language_show = false">关闭</view>
			</view>
		</u-popup>
		
		<!-- AI文案弹窗 -->
		<u-popup v-model="ai_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="ai_popup">
				<view class="popup-title">AI文案</view>
				
				<!-- 主题选择 -->
				<view class="ai-section">
					<view class="section-label">主题</view>
					<view class="theme-tabs">
						<view 
							class="theme-tab" 
							:class="{ active: aiTheme == 'koubo' }"
							@click="aiTheme = 'koubo'">
							文案创作
						</view>
						<view 
							class="theme-tab" 
							:class="{ active: aiTheme == 'gaixi' }"
							@click="aiTheme = 'gaixi'">
							文案改写
						</view>
					</view>
				</view>
				
				<!-- 模型选择 -->
				<view class="ai-section">
					<view class="section-label">模型</view>
					<view class="model-tabs">
						<view 
							class="model-tab" 
							:class="{ active: aiModel == 'deepseek' }"
							@click="aiModel = 'deepseek'">
							
							<text>deepseek</text>
						</view>
						<view 
							class="model-tab" 
							:class="{ active: aiModel == 'doubao' }"
							@click="aiModel = 'doubao'">
							
							<text>豆包</text>
						</view>
					</view>
				</view>
				
				<!-- 主题描述 -->
				<view class="ai-section">
					<view class="section-label">主题描述</view>
					<view class="ai-input-box">
						<textarea 
							placeholder="输入对应的文案提示词，如财税，可进行扩写对应数量的文案内容" 
							v-model="aiPrompt" 
							maxlength="500"
							class="ai-textarea"
						></textarea>
					</view>
				</view>
				
				<!-- 字数长度 -->
				<view class="ai-section">
					<view class="section-label">字数长度</view>
					<view class="length-tabs">
						<view 
							class="length-tab" 
							:class="{ active: aiLength == 'short' }"
							@click="aiLength = 'short'">
							短篇
						</view>
						<view 
							class="length-tab" 
							:class="{ active: aiLength == 'medium' }"
							@click="aiLength = 'medium'">
							中篇
						</view>
						<view 
							class="length-tab" 
							:class="{ active: aiLength == 'long' }"
							@click="aiLength = 'long'">
							长篇
						</view>
					</view>
				</view>
				
				<!-- 生成按钮 -->
				<view class="ai-generate-btn" @click="generateAICopy">
					<text>生成文案</text>
				</view>
			</view>
		</u-popup>
		
		<!-- 我的文案弹窗 -->
		<u-popup v-model="mycopy_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="mycopy_popup">
				<view class="popup-title">我的文案</view>
				<scroll-view scroll-y class="copy-scroll" @scrolltolower="handleCopyReachBottom">
					<view v-if="copyList.length > 0">
						<view class="copy-item" v-for="(item, index) in copyList" :key="item.id || index" @click="selectCopy(item)">
							<view class="copy-header">
								<view class="copy-date">
									<uni-icons type="calendar" size="16" color="#8b8b8b"></uni-icons>
									<text>{{item.add_time}}</text>
								</view>
								<view class="copy-status success" v-if="item.status == 2">
									<uni-icons type="checkmarkempty" size="14" color="#10b981"></uni-icons>
									<text>已完成</text>
								</view>
							</view>
							<view class="copy-content">{{item.desc}}</view>
							<view class="copy-footer">
								<view class="copy-info">
									<view class="copy-length">{{item.desc ? item.desc.length : 0}} 字</view>
									<view class="copy-duration" v-if="item.duration">
										<uni-icons type="sound" size="14" color="#8b8b8b"></uni-icons>
										<text>{{item.duration}}s</text>
									</view>
								</view>
								<view class="copy-action">
									<uni-icons type="compose" size="18" color="#3b82f6"></uni-icons>
									<text>使用</text>
								</view>
							</view>
						</view>
					</view>
					<view v-else-if="copyList.length === 0 && copyStatus !== 'loading'" class="empty-box">
						<uni-icons type="info" size="60" color="#8b8b8b"></uni-icons>
						<view class="empty-text">暂无文案记录</view>
						<view class="empty-tips">试听合成的文案会自动保存在这里</view>
					</view>
					<view class="m_top_30" v-if="copyTotal > 0">
						<u-loadmore :status="copyStatus" :load-text="copyLoadText"/>
					</view>
				</scroll-view>
				<view class="popup-close-btn" @click="mycopy_show = false">关闭</view>
			</view>
		</u-popup>
		
	</view>
</template>

<script setup>
	import { ref,getCurrentInstance,nextTick,onMounted,onUnmounted,watch   } from 'vue';
	import { onLoad,onShow,onHide,onUnload,onShareAppMessage, onShareTimeline,onReady } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	import ImageList from '../../components/ImageList/ImageList.vue';
	import VoiceList from '../../components/VoiceList/VoiceList.vue';
	// #ifdef H5
	import { useUrlParams } from '@/utils/useUrlParams'
	import PointsTips from '../../components/PointsTips/PointsTips.vue';
	// 使用URL参数管理
	const { 
	  saasid, 
	  spread, 
	  ensureUrlHasParams, 
	  init: initUrlParams 
	} = useUrlParams()
	// #endif
	const { isLogin} = useUserStore()
	
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const storage = useCache()
	const textNum = ref(0)	//文字字数
	const form = ref({
		'imageId':'',	//形象ID
		'voiceId':'',	//声音ID
		'text':'',	//讲述文字
	})
	const selectedImage = ref(null)	//选中的形象
	const selectedVoice = ref(null)	//选中的声音
	const points = ref(0) //积分
	const buy_show = ref(false) //购买积分弹窗
	const videoPreviewShow = ref(false) //视频预览弹窗
	const currentVideo = ref({}) //当前预览的视频
	let videoContext = null //视频上下文
	
	//语言选择
	const language_show = ref(false)
	const selectedLanguage = ref('中文简体')
	const languageList = ref([
		{ name: '中文简体'},
		{ name: '英文' },
		{ name: '日文' },
		{ name: '韩文'},
		{ name: '法文'},
		{ name: '德文' },
		{ name: '西班牙文' },
		{ name: '葡萄牙文' },
		{ name: '意大利文' },
		{ name: '俄文' },
		{ name: '阿拉伯文' },
		{ name: '越南文' },
		{ name: '泰文' },
		{ name: '马来西亚文' },
		{ name: '芬兰文' },
		{ name: '冰岛文' },
	])
	
	//AI文案
	const ai_show = ref(false)
	const aiPrompt = ref('')
	const aiTheme = ref('koubo') // 主题：koubo-口播文案, gaixi-文案改写
	const aiModel = ref('deepseek') // 模型：deepseek, doubao
	const aiLength = ref('short') // 字数长度：short-短篇, medium-中篇, long-长篇
	
	//试听缓存
	const previewCache = ref({
		voiceId: '',      // 缓存的音色ID
		text: '',         // 缓存的文本
		audioUrl: '',     // 缓存的音频URL
		taskId: ''        // 任务ID
	})
	const isPreviewPlaying = ref(false) // 是否正在播放试听
	
	//我的文案
	const mycopy_show = ref(false)
	const copyList = ref([])
	const copyQuery = ref({
		page: 1,
		pageSize: 10,
		where: [],
		prop: 'id desc',
	})
	const copyStatus = ref('loadmore')
	const copyLoadText = ref({
		loadmore: '上拉加载更多',
		loading: '加载数据中',
		nomore: '我是有底线的'
	})
	const copyFirstLoad = ref(false)
	const copyTotal = ref(0)
	
	//形象选择弹窗
	const image_show = ref(false)
	const ImageListRef = ref(null)
	
	//声音选择弹窗
	const voice_show = ref(false)
	const VoiceListRef = ref(null)
	
	//小程序订阅消息
	const subscribe = (type) => {
		// #ifdef MP-WEIXIN
		if(type == 1){
			//跳到通知设置项
			uni.openSetting({
				withSubscriptions:true,
				success: (res) => {
					
				},
				fail: (res) => {
					
				},
			});
		}else{
			uni.requestSubscribeMessage({
				tmplIds: [WEBCONFIG?.value.message.sendmsg_complete], // 改成你的小程序订阅消息模板id
				success: (res) => {
					// 要检查的订阅id
					if(res[WEBCONFIG?.value.message.sendmsg_complete] === 'accept'){
						console.log('订阅成功')
						storage.set('subscribeMessage',true)
					}else{
						storage.set('subscribeMessage',false)
						uni.showModal({
							title: '提示',
							content: '请到"通知管理"设置接收通知，以保证接收到审核消息',
							success: function (res) {
								if (res.confirm) {
									subscribe(1)
								} else if (res.cancel) {
									console.log('用户点击取消');
								}
							}
						});
					}
					
				},
				complete:(error) => {
					console.log('错误',error)
				}
			});
		}
		// #endif
	}
	
	//打开形象选择弹窗
	const openImageSelect = async () => {
		image_show.value = true
		await nextTick()
		await nextTick()
		await nextTick()
		if (ImageListRef.value) {
			ImageListRef.value.open()
		}
	}
	
	//关闭形象选择
	const closeImageSelect = (image) => {
		if(image){
			selectedImage.value = image
			form.value.imageId = image.content
		}
		image_show.value = false
	}
	
	//新建形象
	const createNewImage = () => {
		image_show.value = false
		$page.open('/pages/human/createImage',true)
	}
	
	//打开声音选择弹窗
	const openVoiceSelect = async () => {
		voice_show.value = true
		await nextTick()
		await nextTick()
		await nextTick()
		if (VoiceListRef.value) {
			VoiceListRef.value.open()
		}
	}
	
	// 监听声音选择弹窗关闭，确保音频停止（针对小程序）
	watch(voice_show, (newVal) => {
		if (!newVal) {
			// 弹窗关闭时停止音频
			if(VoiceListRef.value && VoiceListRef.value.stopAudio) {
				VoiceListRef.value.stopAudio()
			}
		}
	})
	
	// 监听讲述文字的变化，自动清空试听缓存
	watch(() => form.value.text, (newText, oldText) => {
		// 如果有缓存的音频，且新文本与缓存的文本不一致，则清空缓存
		if(previewCache.value.audioUrl && previewCache.value.text !== newText) {
			console.log('检测到文本改变，清空试听缓存')
			console.log('原文本:', previewCache.value.text)
			console.log('新文本:', newText)
			clearPreviewCache()
		}
	})
	
	//关闭声音选择
	const closeVoiceSelect = (voice) => {
		// 停止VoiceList组件中的音频播放
		if(VoiceListRef.value && VoiceListRef.value.stopAudio) {
			VoiceListRef.value.stopAudio()
		}
		
		if(voice){
			selectedVoice.value = voice
			form.value.voiceId = voice.content
			
			// 音色改变时，只有当音色ID与缓存的不一致时才清空缓存
			if(previewCache.value.audioUrl && previewCache.value.voiceId !== voice.id) {
				console.log('音色已改变，需要重新合成声音')
				clearPreviewCache()
			}
		}
		voice_show.value = false
	}
	
	//新建声音
	const createNewVoice = () => {
		// 停止VoiceList组件中的音频播放
		if(VoiceListRef.value && VoiceListRef.value.stopAudio) {
			VoiceListRef.value.stopAudio()
		}
		voice_show.value = false
		$page.open('/pages/human/createVoice',true)
	}
	
	//预览选中的形象视频
	const previewSelectedImage = () => {
		if(!selectedImage.value || !selectedImage.value.material_url) {
			uni.showToast({
				title: '该形象暂无视频',
				icon: 'none'
			})
			return
		}
		currentVideo.value = selectedImage.value
		videoPreviewShow.value = true
		// 创建视频上下文
		setTimeout(() => {
			videoContext = uni.createVideoContext('previewVideo')
		}, 300)
	}
	
	//关闭视频预览
	const closeVideoPreview = () => {
		// 先停止视频播放
		if(videoContext) {
			try {
				videoContext.pause()
				videoContext.stop()
			} catch(e) {
				console.log('停止视频失败:', e)
			}
			videoContext = null
		}
		videoPreviewShow.value = false
		setTimeout(() => {
			currentVideo.value = {}
		}, 300)
	}
	
	//打开语言选择
	const openLanguageSelect = () => {
		language_show.value = true
	}
	
	//选择语言
	const selectLanguage = (language) => {
		if(!form.value.text) {
			uni.showToast({
				title: '请先输入讲述内容',
				icon: 'none',
				duration: 2000
			})
			language_show.value = false
			return
		}
		selectedLanguage.value = language.name
		language_show.value = false
		textTranslation()
	}

	//翻译
	const textTranslation = () => {
		
		uni.showLoading({
			title: '翻译中...',
			mask: true
		})
		
		// 调用AI文案生成接口
		$http.post('Human/textModel', {
			text: form.value.text,
			type: 'translate',
			language: selectedLanguage.value
		}).then(res => {
			uni.hideLoading()
			if(res.code == 200) {
				form.value.text = res.data.text || res.data
				textNum.value = form.value.text.length
				language_show.value = false
				// watch 会自动检测文本变化并清空试听缓存
				uni.showToast({
					title: res.msg,
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.msg || '翻译失败',
					icon: 'none'
				})
			}
		}).catch(err => {
			uni.hideLoading()
			uni.showToast({
				title: '翻译失败',
				icon: 'none'
			})
		})
	}
	
	//打开AI文案
	const openAICopywriting = () => {
		ai_show.value = true
		aiPrompt.value = ''
		aiTheme.value = 'koubo'
		aiModel.value = 'deepseek'
		aiLength.value = 'short'
	}
	
	//生成AI文案
	const generateAICopy = () => {
		if(!aiPrompt.value) {
			uni.showToast({
				title: '请输入主题描述',
				icon: 'none'
			})
			return
		}
		
		uni.showLoading({
			title: '生成中...',
			mask: true
		})
		
		// 将前端的值映射为服务端需要的值
		const lengthMap = {
			'short': '短篇',
			'medium': '中篇',
			'long': '长篇'
		}
		
		const themeMap = {
			'koubo': 'create',  // 口播文案 -> 创作
			'gaixi': 'rewrite'  // 文案改写 -> 改写
		}
		
		// 调用AI文案生成接口
		$http.post('Human/textModel', {
			text: aiPrompt.value,           // 文本内容
			type: 'copywriting',            // 类型：copywriting
			theme: themeMap[aiTheme.value] || 'create',  // 主题：create/rewrite
			model: aiModel.value,           // 模型：deepseek/doubao
			length: lengthMap[aiLength.value] || '短篇'  // 字数长度：短篇/中篇/长篇
		}).then(res => {
			uni.hideLoading()
			if(res.code == 200) {
				// 服务端返回的是字符串内容
				form.value.text = res.data || res.msg
				textNum.value = form.value.text.length
				ai_show.value = false
				// watch 会自动检测文本变化并清空试听缓存
				uni.showToast({
					title: '文案生成成功',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res.msg || '生成失败',
					icon: 'none'
				})
			}
		}).catch(err => {
			uni.hideLoading()
			uni.showToast({
				title: '生成失败',
				icon: 'none'
			})
		})
	}
	
	//打开我的文案
	const openMyCopywriting = () => {
		mycopy_show.value = true
		copyList.value = []
		copyQuery.value.page = 1
		copyFirstLoad.value = false
		copyStatus.value = 'loadmore'
		loadCopyList()
	}
	
	//加载文案列表
	const loadCopyList = () => {
		if(copyQuery.value.page === 1) {
			uni.showLoading({
				title: '加载中',
			})
		}
		
		// 构建请求参数
		const params = {
			page: copyQuery.value.page,
			pageSize: copyQuery.value.pageSize,
			prop: copyQuery.value.prop
		}
		
		$http.get('Human/myTextList', params).then(res => {
			uni.hideLoading()
			if(res.code == 200){
				let list = res.data.rows || []
				copyTotal.value = res.data.total || 0
				
				// 追加数据到列表
				for(let i = 0; i < list.length; i++) {
					copyList.value.push(list[i])
				}
				
				// 判断是否还有更多数据
				if(list.length < copyQuery.value.pageSize){
					copyFirstLoad.value = true
					copyStatus.value = "nomore"
				}else{
					copyFirstLoad.value = false
					copyStatus.value = "loadmore"
				}
			}else{
				copyFirstLoad.value = true
				copyStatus.value = "nomore"
				if(copyQuery.value.page > 1){
					copyQuery.value.page -= 1
				}
				if(copyQuery.value.page === 1) {
					uni.showToast({
						title: res.msg || '加载失败',
						icon: 'none'
					})
				}
			}
		}).catch(err => {
			uni.hideLoading()
			copyFirstLoad.value = true
			copyStatus.value = "nomore"
			if(copyQuery.value.page > 1){
				copyQuery.value.page -= 1
			}
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		})
	}
	
	//触底加载更多文案
	const handleCopyReachBottom = () => {
		if(!copyFirstLoad.value && copyStatus.value !== 'loading'){
			copyFirstLoad.value = true
			copyStatus.value = "loading"
			copyQuery.value.page += 1
			loadCopyList()
		}
	}
	
	//选择文案
	const selectCopy = (item) => {
		// 判断是否有已合成的声音：优先使用 local_url，如果没有则使用 url
		const audioUrl = item.local_url || item.url
		
		if(audioUrl) {
			// 如果有已合成的音频，先设置缓存（在修改文本之前）
			const newText = item.desc || item.text || item.content
			
			// 先更新缓存数据
			previewCache.value = {
				voiceId: form.value.voiceId || item.voice_id || '',  // 使用当前选中的音色或文案的音色
				text: newText,                                        // 文案文本
				audioUrl: audioUrl,                                   // 已合成的音频URL
				taskId: item.task_id || ''                            // 任务ID
			}
			
			// 再修改文本（这样 watch 检测时会发现缓存的文本与新文本一致，不会清空缓存）
			form.value.text = newText
			textNum.value = form.value.text.length
			
			// 设置为非播放状态，让按钮显示"播放"
			isPreviewPlaying.value = false
			
			console.log('使用文案中已合成的声音:', audioUrl)
			
			uni.showToast({
				title: '文案已应用，可直接制作',
				icon: 'success',
				duration: 2000
			})
		} else {
			// 如果没有音频，先清空缓存，再设置文本
			clearPreviewCache()
			form.value.text = item.desc || item.text || item.content
			textNum.value = form.value.text.length
			
			uni.showToast({
				title: '文案已应用',
				icon: 'success'
			})
		}
		
		mycopy_show.value = false
	}
	
	// 记录textarea的光标位置和字数
	const onTextareaInput = (e) => {
		const newText = e.detail.value
		textNum.value = newText.length
		// 文本变化的检测已由 watch 处理
	}
	
	//清空文字
	const clearText = () => {
		form.value.text = ''
		textNum.value = 0
		// 清空文字会触发 watch，自动清空试听缓存
	}
	
	//防抖，重复点击
	const fangdou = (e) => {
		// #ifdef MP-WEIXIN
		console.log(WEBCONFIG?.value?.message?.sendmsg_complete)
		if(WEBCONFIG?.value?.message?.sendmsg_complete){
			subscribe()
		}
		// #endif
		$tool.debounce(() => submitDigitalHuman(e), 500,true);
		
	}
	
	//提交制作数字人
	const submitDigitalHuman = (e) => {
		
		// 4. 检查是否有缓存的音频URL
		if(previewCache.value.audioUrl && 
		   previewCache.value.voiceId === form.value.voiceId && 
		   previewCache.value.text === form.value.text) {
			// 如果有缓存且音色和文本都匹配，直接使用缓存的音频URL制作
			console.log('使用缓存的音频URL制作数字人')
			createDigitalHumanWithAudio(previewCache.value.audioUrl)
		} else {
			// 5. 如果没有缓存或内容不匹配，先合成声音
			console.log('需要先合成声音')
			synthesizeVoiceBeforeCreate()
		}
	}
	
	// 先合成声音，再制作数字人
	const synthesizeVoiceBeforeCreate = () => {

		// 2. 验证是否选择了音色
		if(!form.value.voiceId){
			uni.showToast({
				title: '请选择我的音色',
				icon: 'none'
			})
			setTimeout(() => {
				openVoiceSelect()
			}, 1000)
			return false
		}
		
		// 3. 验证是否输入了讲述文字
		if(!form.value.text){
			uni.showToast({
				title: '请输入讲述文字',
				icon: 'none'
			})
			return false
		}

		uni.showLoading({
			title: '合成声音中...',
			mask: true
		})
		
		// 调用合成声音接口
		$http.post('Human/syntheticVoice', {
			voice_id: form.value.voiceId,
			text: form.value.text
		}).then(res => {
			if(res.code == 200){
				const audioUrl = res.data.audio_url || res.data.url
				
				// 保存到缓存（方便后续试听）
				previewCache.value = {
					voiceId: form.value.voiceId,
					text: form.value.text,
					audioUrl: audioUrl,
					taskId: res.data.task_id || ''
				}
				
				console.log('声音合成成功，开始制作数字人')
				
				// 使用合成的音频URL制作数字人
				createDigitalHumanWithAudio(audioUrl)
			}else{
				uni.hideLoading()
				// 积分不足时提示
				if(res.msg == '积分不足'){
					buy_show.value = true
				}else{
					uni.showToast({
						title: res.msg || '合成声音失败',
						icon: 'none'
					})
				}
			}
		}).catch(err => {
			uni.hideLoading()
			uni.showToast({
				title: '合成声音失败',
				icon: 'none'
			})
		})
	}
	
	// 使用音频URL制作数字人
	const createDigitalHumanWithAudio = (audioUrl) => {
		// 1. 验证是否选择了形象
		if(!form.value.imageId){
			uni.showToast({
				title: '请选择我的形象',
				icon: 'none'
			})
			return false
		}

		uni.showLoading({
			title: '制作中...',
			mask: true
		})
		
		// 提交制作数字人
		$http.post('Human/syntheticVideo', {
			audio_url: audioUrl,      // 声音的URL
			avatar_id: form.value.imageId  // 形象ID
		}).then(res => {
			uni.hideLoading()
			if(res.code == 200){
				uni.showModal({
					title: '温馨提示',
					content: res.msg || '数字人制作成功',
					success: function (modalRes) {
						if (modalRes.confirm) {
							$page.switch('/pages/videolist/videolist')
						} else if (modalRes.cancel) {
							console.log('用户点击取消');
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
			uni.showToast({
				title: '制作失败',
				icon: 'none'
			})
		})
	}
	
	//统一的试听按钮点击处理
	const togglePreview = () => {
		// 如果已经有缓存的音频
		if(previewCache.value.audioUrl) {
			// 如果正在播放，则暂停
			if(isPreviewPlaying.value) {
				pausePreviewAudio()
			} else {
				// 如果已暂停，则继续播放
				playPreviewAudio(previewCache.value.audioUrl)
			}
		} else {
			// 如果还没有生成，则生成试听
			previewDigitalHuman()
		}
	}
	
	//试听数字人（生成音频）
	const previewDigitalHuman = () => {
		// 1. 判断是否选择了音色
		if(!form.value.voiceId){
			uni.showToast({
				title: '请先选择我的音色',
				icon: 'none'
			})
			setTimeout(() => {
				openVoiceSelect()
			}, 1000)
			return false
		}
		
		// 2. 判断是否输入了文字
		if(!form.value.text){
			uni.showToast({
				title: '请输入讲述文字',
				icon: 'none'
			})
			return false
		}
		
		// 3. 检查缓存：如果音色ID和文本内容都没变，直接播放缓存的音频
		if(previewCache.value.voiceId === form.value.voiceId && 
		   previewCache.value.text === form.value.text && 
		   previewCache.value.audioUrl) {
			console.log('使用缓存的试听音频')
			playPreviewAudio(previewCache.value.audioUrl)
			return
		}
		
		// 4. 需要重新生成试听
		uni.showLoading({
			title: '生成试听中...',
			mask: true
		})
		
		// 调用合成声音接口
		$http.post('Human/syntheticVoice', {
			voice_id: form.value.voiceId,  // 音色ID（注意是voice_id不是voiceId）
			text: form.value.text           // 文本内容
		}).then(res => {
			uni.hideLoading()
			if(res.code == 200){
				// 保存到缓存
				previewCache.value = {
					voiceId: form.value.voiceId,
					text: form.value.text,
					audioUrl: res.data.audio_url || res.data.url,  // 音频地址
					taskId: res.data.task_id || ''                  // 任务ID
				}
				
				console.log('试听生成成功，已缓存')
				
				// 播放试听音频
				playPreviewAudio(previewCache.value.audioUrl)
			}else{
				// 积分不足时提示
				if(res.msg == '积分不足'){
					buy_show.value = true
				}else{
					uni.showToast({
						title: res.msg || '生成试听失败',
						icon: 'none'
					})
				}
			}
		}).catch(err => {
			uni.hideLoading()
			uni.showToast({
				title: '生成试听失败',
				icon: 'none'
			})
		})
	}
	
	//清空试听缓存（当音色或文本改变时调用）
	const clearPreviewCache = () => {
		// 停止播放
		if(previewAudioContext) {
			previewAudioContext.stop()
			previewAudioContext.destroy()
			previewAudioContext = null
		}
		// 清空缓存
		previewCache.value = {
			voiceId: '',
			text: '',
			audioUrl: '',
			taskId: ''
		}
		isPreviewPlaying.value = false
	}
	
	//播放试听音频
	let previewAudioContext = null
	const playPreviewAudio = (audioUrl) => {
		// 如果音频上下文已存在，直接播放
		if(previewAudioContext && previewAudioContext.src) {
			previewAudioContext.play()
			isPreviewPlaying.value = true
			return
		}
		
		// 创建新的音频上下文
		previewAudioContext = uni.createInnerAudioContext()
		previewAudioContext.src = $tool.imgReplace(audioUrl)
		
		previewAudioContext.onPlay(() => {
			console.log('开始播放试听')
			isPreviewPlaying.value = true
		})
		
		previewAudioContext.onPause(() => {
			console.log('暂停播放')
			isPreviewPlaying.value = false
		})
		
		previewAudioContext.onEnded(() => {
			console.log('播放结束')
			isPreviewPlaying.value = false
		})
		
		previewAudioContext.onError((err) => {
			console.error('播放失败:', err)
			isPreviewPlaying.value = false
			uni.showToast({
				title: '播放失败',
				icon: 'none'
			})
		})
		
		previewAudioContext.play()
	}
	
	//暂停试听音频
	const pausePreviewAudio = () => {
		if(previewAudioContext) {
			previewAudioContext.pause()
			isPreviewPlaying.value = false
		}
	}
	
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




	onLoad((e) =>{
		const config = WEBCONFIG?.value || '';
		if(config){
			shareData.value.title = config.sys.share_desc
			shareData.value.path = '/pages/index/index?spread='
			shareData.value.query ='/pages/index/index?spread='
			shareData.value.imageUrl = $tool.imgReplace(config.sys.logo) ? $tool.imgReplace(config.sys.logo) : '/static/img/cpimg.png'
			
			points.value = WEBCONFIG?.value.api.digital_human_points || 100
		}
		
		// #ifdef H5
		initUrlParams();
		// #endif
	})
	
	// 在onShow中也确保参数存在
	onShow(() => {
	  // #ifdef H5
	  setTimeout(() => {
	    ensureUrlHasParams();
	  }, 100);
	  // #endif
	})
	
	// 页面隐藏时停止视频和音频
	onHide(() => {
		if(videoContext) {
			try {
				videoContext.pause()
			} catch(e) {
				console.log('暂停视频失败:', e)
			}
		}
		// 停止试听音频
		if(previewAudioContext) {
			try {
				previewAudioContext.stop()
			} catch(e) {
				console.log('停止音频失败:', e)
			}
		}
	})
	
	// 页面卸载时清理资源
	onUnload(() => {
		if(videoContext) {
			try {
				videoContext.stop()
			} catch(e) {
				console.log('停止视频失败:', e)
			}
			videoContext = null
		}
		// 清理试听音频
		if(previewAudioContext) {
			try {
				previewAudioContext.stop()
				previewAudioContext.destroy()
			} catch(e) {
				console.log('清理音频失败:', e)
			}
			previewAudioContext = null
		}
	})
	

</script>

<style scoped  lang="scss">
	.infobox{
		font-size: $uni-font-size-base;
		color: $uni-text-color;
	}
	.box{
		padding: 0rpx 40rpx 40rpx 40rpx;
	}
	
	// 选择框样式
	.select-box{
		width: 100%;
		min-height: 150rpx;
		padding: 30rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		.select-placeholder{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			.select-text{
				margin-top: 20rpx;
				font-size: 28rpx;
				color: #bdbdbd;
			}
		}
		.selected-info{
			width: 100%;
			.selected-name{
				margin-left: 15rpx;
				font-size: 30rpx;
				color: #3b82f6;
				font-weight: bold;
			}
		}
		.image-preview-box{
			position: relative;
			width: 100%;
			height: 320rpx;
			border-radius: 15rpx;
			overflow: hidden;
			
			.preview-image{
				width: 100%;
				height: 100%;
				display: block;
			}
			
			.preview-btn-top{
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
			
			.image-name-overlay{
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				padding: 20rpx 15rpx;
				background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
				
				.image-name-text{
					margin-left: 10rpx;
					font-size: 28rpx;
					color: #fff;
					font-weight: bold;
				}
			}
		}
		
		.voice-selected-box{
			width: 100%;
			display: flex;
			align-items: center;
			gap: 20rpx;
			padding: 20rpx;
			background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
			border: 2rpx solid rgba(59, 130, 246, 0.3);
			border-radius: 15rpx;
			
			.voice-icon-wrapper{
				position: relative;
				width: 100rpx;
				height: 100rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.voice-wave{
					position: absolute;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					border: 2rpx solid #3b82f6;
					opacity: 0.6;
					animation: wave-animation 2s ease-out infinite;
					
					&.wave1{
						animation-delay: 0s;
					}
					&.wave2{
						animation-delay: 0.6s;
					}
					&.wave3{
						animation-delay: 1.2s;
					}
				}
				
				.voice-icon-center{
					position: relative;
					z-index: 2;
					width: 70rpx;
					height: 70rpx;
					border-radius: 50%;
					background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.4);
				}
			}
			
			.voice-info{
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				
				.voice-name{
					font-size: 32rpx;
					color: #fff;
					font-weight: bold;
				}
				
				.voice-status{
					display: flex;
					align-items: center;
					gap: 6rpx;
					
					.status-text{
						font-size: 24rpx;
						color: #10b981;
						font-weight: bold;
					}
				}
			}
			
			.change-btn{
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4rpx;
				padding: 10rpx 15rpx;
				background: rgba(59, 130, 246, 0.15);
				border-radius: 10rpx;
				
				.change-text{
					font-size: 22rpx;
					color: #3b82f6;
					font-weight: bold;
				}
			}
		}
		
		@keyframes wave-animation {
			0% {
				transform: scale(0.8);
				opacity: 0.8;
			}
			100% {
				transform: scale(1.5);
				opacity: 0;
			}
		}
	}
	
	.role_popup{
		padding: 40rpx;
		background-color: #232327;
		.role_bnt{
			font-size: 32rpx;
			border-radius: 20rpx;
			color: #fff;
			padding: 25rpx 20rpx;
			text-align: center;
			background: linear-gradient(130deg,
			#2cd2ff 10%,
			#0292ff 30%,
			#0292ff 70%,
			#33d3ff 100%
			);
		}
	}
	
	.text-tools{
		display: flex;
		gap: 20rpx;
		
		.tool-btn{
			flex: 1;
			display: flex;
			align-items: center;
			gap: 15rpx;
			padding: 20rpx;
			background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
			border: 2rpx solid rgba(59, 130, 246, 0.3);
			border-radius: 15rpx;
			
			.tool-icon{
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
				
				&.ai-icon{
					background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
					box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
				}
			}
			
			.tool-info{
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 4rpx;
				
				.tool-label{
					font-size: 28rpx;
					color: #fff;
					font-weight: bold;
				}
				
				.tool-value{
					font-size: 24rpx;
					color: #8b8b8b;
				}
			}
			
			.tool-arrow{
				display: flex;
				align-items: center;
			}
			
			&:active{
				opacity: 0.8;
				transform: scale(0.98);
			}
		}
	}
	
	.language_popup{
		padding: 40rpx;
		background-color: #232327;
		
		.popup-title{
			font-size: 34rpx;
			font-weight: bold;
			color: #fff;
			text-align: center;
			margin-bottom: 30rpx;
		}
		
		.language-scroll{
			max-height: 500rpx;
			
			.language-list{
				padding-bottom: 20rpx;
				
				.language-item{
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 25rpx 20rpx;
					margin-bottom: 15rpx;
					background-color: #333338;
					border-radius: 15rpx;
					border: 2rpx solid transparent;
					
					&.active{
						background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
						border-color: #3b82f6;
					}
					
					.language-name{
						font-size: 30rpx;
						color: #fff;
						font-weight: bold;
					}
					
					&:active{
						opacity: 0.8;
					}
				}
			}
		}
		
		.popup-close-btn{
			margin-top: 30rpx;
			font-size: 32rpx;
			border-radius: 20rpx;
			color: #fff;
			padding: 25rpx 20rpx;
			text-align: center;
			background-color: #333338;
			
			&:active{
				opacity: 0.8;
			}
		}
	}
	
	.ai_popup{
		padding: 40rpx;
		background-color: #232327;
		max-height: 80vh;
		overflow-y: auto;
		
		.popup-title{
			font-size: 34rpx;
			font-weight: bold;
			color: #fff;
			text-align: center;
			margin-bottom: 30rpx;
		}
		
		.ai-section{
			margin-bottom: 30rpx;
			
			.section-label{
				font-size: 28rpx;
				color: #fff;
				font-weight: bold;
				margin-bottom: 15rpx;
			}
			
			.theme-tabs, .model-tabs, .length-tabs{
				display: flex;
				gap: 15rpx;
			}
			
			.theme-tab, .length-tab{
				flex: 1;
				padding: 20rpx;
				text-align: center;
				font-size: 28rpx;
				color: #8b8b8b;
				background-color: #333338;
				border-radius: 15rpx;
				border: 2rpx solid transparent;
				
				&.active{
					color: #fff;
					background: rgba(59, 130, 246, 0.15);
					border-color: #3b82f6;
				}
				
				&:active{
					opacity: 0.8;
				}
			}
			
			.model-tab{
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 10rpx;
				padding: 20rpx;
				font-size: 28rpx;
				color: #8b8b8b;
				background-color: #333338;
				border-radius: 15rpx;
				border: 2rpx solid transparent;
				
				&.active{
					color: #fff;
					background: rgba(59, 130, 246, 0.15);
					border-color: #3b82f6;
				}
				
				.model-icon{
					width: 32rpx;
					height: 32rpx;
					
					&.emoji{
						font-size: 32rpx;
						width: auto;
						height: auto;
					}
				}
				
				&:active{
					opacity: 0.8;
				}
			}
		}
		
		.ai-input-box{
			.ai-textarea{
				width: 100%;
				min-height: 200rpx;
				padding: 20rpx;
				background-color: #333338;
				border-radius: 15rpx;
				border: 2rpx solid #444449;
				color: #fff;
				font-size: 28rpx;
				line-height: 1.6;
				box-sizing: border-box;
			}
		}
		
		.ai-generate-btn{
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			padding: 30rpx;
			margin-top: 40rpx;
			border-radius: 20rpx;
			font-size: 32rpx;
			color: #fff;
			background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
			box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.4);
			
			.generate-icon{
				font-size: 36rpx;
			}
			
			&:active{
				opacity: 0.8;
				transform: scale(0.98);
			}
		}
	}
	
	.mycopy_popup{
		padding: 40rpx;
		background-color: #232327;
		
		.popup-title{
			font-size: 34rpx;
			font-weight: bold;
			color: #fff;
			text-align: center;
			margin-bottom: 30rpx;
		}
		
		.copy-scroll{
			max-height: 600rpx;
			
			.copy-item{
				padding: 25rpx;
				margin-bottom: 20rpx;
				background-color: #333338;
				border-radius: 15rpx;
				border: 2rpx solid transparent;
				
				&:active{
					border-color: #3b82f6;
					background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
				}
				
				.copy-header{
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 15rpx;
					
					.copy-date{
						display: flex;
						align-items: center;
						gap: 6rpx;
						font-size: 24rpx;
						color: #8b8b8b;
					}
					
					.copy-status{
						display: flex;
						align-items: center;
						gap: 4rpx;
						font-size: 22rpx;
						padding: 4rpx 10rpx;
						border-radius: 8rpx;
						
						&.success{
							color: #10b981;
							background: rgba(16, 185, 129, 0.15);
						}
					}
				}
				
				.copy-content{
					font-size: 28rpx;
					color: #fff;
					line-height: 1.6;
					margin-bottom: 15rpx;
					word-break: break-all;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 3;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				
				.copy-footer{
					display: flex;
					align-items: center;
					justify-content: space-between;
					
					.copy-info{
						display: flex;
						align-items: center;
						gap: 15rpx;
						
						.copy-length{
							font-size: 24rpx;
							color: #8b8b8b;
						}
						
						.copy-duration{
							display: flex;
							align-items: center;
							gap: 4rpx;
							font-size: 22rpx;
							color: #8b8b8b;
						}
					}
					
					.copy-action{
						display: flex;
						align-items: center;
						gap: 6rpx;
						font-size: 26rpx;
						color: #3b82f6;
						font-weight: bold;
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
				.empty-tips{
					margin-top: 10rpx;
					font-size: 24rpx;
					color: #666;
				}
			}
		}
		
		.popup-close-btn{
			margin-top: 30rpx;
			font-size: 32rpx;
			border-radius: 20rpx;
			color: #fff;
			padding: 25rpx 20rpx;
			text-align: center;
			background-color: #333338;
			
			&:active{
				opacity: 0.8;
			}
		}
	}
	
	.card_tips{
		margin-top: 20rpx;
		text-align: center;
		font-size: 24rpx;
		font-weight: bold;
	}
	
	.action-buttons{
		display: flex;
		gap: 20rpx;
		align-items: center;
		
		.preview-btn-action{
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			padding: 30rpx 5rpx;
			border-radius: 30rpx;
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
			background: rgba(255, 255, 255, 0.15);
			transition: all 0.3s ease;
			
			// 已生成音频状态
			&.has-audio{
				background: linear-gradient(135deg, #10b981 0%, #059669 100%);
				box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
			}
			
			// 播放中状态
			&.playing{
				background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
				box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
			}
			
			// 播放图标
			.play-icon{
				width: 24rpx;
				height: 24rpx;
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.play-triangle{
					width: 0;
					height: 0;
					border-left: 20rpx solid #fff;
					border-top: 12rpx solid transparent;
					border-bottom: 12rpx solid transparent;
					margin-left: 4rpx;
				}
			}
			
			// 暂停图标
			.pause-icon{
				display: flex;
				align-items: center;
				gap: 6rpx;
				
				.pause-bar{
					width: 6rpx;
					height: 20rpx;
					background-color: #fff;
					border-radius: 2rpx;
				}
			}
			
			&:active{
				opacity: 0.7;
				transform: scale(0.98);
			}
		}
		
		.bigbnt{
			flex: 2;
			margin: 0;
		}
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
			  #3b82f6 10%,    /* 蓝色浅色 */
			  #1d4ed8 30%,   /* 蓝色深色起始点 */
			  #1d4ed8 70%,   /* 蓝色深色结束点 */
			  #3b82f6 100%   /* 蓝色浅色 */
			);
		}
		.desc{
			font-size: 32rpx;
			color: #dfdfdf;
			margin-left: 20rpx;
			
		}
		.neikuang{
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			background-color: #333338;
		}
		.neikuang1{
			padding: 0 25rpx;
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			background-color: #333338;
		}
		.qingkong{
			position: relative;
			top: -15rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.qingkong_bnt{
				font-size: 28rpx;
				border-radius: 10rpx;
				color: #afafaf;
				padding: 8rpx 20rpx;
				background-color: #464646;
				opacity: 0.8;
				margin-left: 20rpx;
				
				&:active{
					opacity: 1;
					background-color: #555555;
				}
			}
			.mycopy_bnt{
				margin-left: 15rpx;
			}
		}
		.upimg{
			padding: 30rpx 0;
		}
		.tips{
			font-size: 28rpx;
			color: #ffbb00;
			display: flex;
			align-items: center;
		}
	}
	.bigbnt{
		border-radius: 30rpx;
		color: #fff;
		padding: 30rpx 25rpx;
		background: linear-gradient(130deg,
		  #3b82f6 10%,    /* 蓝色浅色 */
		  #1d4ed8 30%,   /* 蓝色深色起始点 */
		  #1d4ed8 70%,   /* 蓝色深色结束点 */
		  #3b82f6 100%   /* 蓝色浅色 */
		);
		text-align: center;
		font-size: 32rpx;
	}
	.bnt{
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #fff;
		padding: 12rpx 20rpx;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
	}
	.bnt0{
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #fff;
		padding: 15rpx 20rpx;
		background: linear-gradient(130deg,
		  #505050 0%,    /* 左侧10%的浅色 */
		  #383838 100%   /* 右侧10%的浅色 */
		);
	}
	.top_bj{
		// #ifdef H5
		margin-top: 50rpx;
		// #endif
		// #ifdef MP-WEIXIN
		margin-top: 110rpx;
		// #endif
		position: relative;
		  top: 0;
		  left: 0;
		  /* 关键：设置容器为弹性布局 */
		  display: flex;
		  /* 水平居中（子元素沿主轴居中） */
		  justify-content: center;
		  /* 垂直居中（子元素沿交叉轴居中） */
		  align-items: center;
		  /* 如果内容高度不确定，可设置 min-height 避免垂直居中失效（根据需求调整） */
		  min-height: 某一具体值; /* 例如：min-height: 200rpx; 或根据内容自适应 */
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
