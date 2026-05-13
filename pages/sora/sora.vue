<template>
	<view class="infobox">
		<view class="box m_top_40">
			<!-- 模型选择 - 顶部虚线框 -->
			<view class="model-select-box">
				<view class="model-header">
					<uni-icons type="apps" size="16" color="#00d3f8" style="margin-right: 10rpx;"></uni-icons>
					<text class="model-header-text">选择模型</text>
				</view>
				<view class="model-grid">
					<view 
						v-for="model in modelList" 
						:key="model.key"
						:class="selectedModel == model.key ? 'model-btn-active' : 'model-btn'"
						@click="selectModel(model.key)"
					>
						<text>{{ model.name }}</text>
						<view class="model-badge" v-if="model.badge">{{ model.badge }}</view>
					</view>
				</view>
			</view>
			
			<view class="card m_top_30">
				<view class="acea-row row-between-wrapper">
					<veiw class="acea-row row-middle">
						<view class="title_bnt">第一步</view><view class="desc">填写描述词</view>
					</veiw>
					<veiw>
						{{descTextNum}}/{{WEBCONFIG?.api.miaoshu_max}}
					</veiw>
					
				</view>
				<view class="neikuang m_top_30">
					<textarea placeholder="请详细描述你想创作的视频场景!"
					v-model="formDesc"
					:maxlength="WEBCONFIG?.api?.miaoshu_max || 500"
					style=" padding: 20rpx 30rpx;font-size: 28rpx; width: 90%;"
					@input="onTextareaInput"
					ref="textareaRef"
					/>
					<veiw class="qingkong acea-row row-between-wrapper">
						<view class="qingkong_bnt" @click="clearDesc"><uni-icons type="trash" size="16" color="#afafaf" style="margin-right: 5rpx;"></uni-icons>清空</view>
						<view class="sj_bnt" @click="randDesc"><uni-icons type="compose" size="16" color="#afafaf" style="margin-right: 5rpx;"></uni-icons>随机描述</view>
					</veiw>
					<veiw class="suiji">
						
					</veiw>
				</view>
				<view class="acea-row row-between-wrapper">
					<view class="acea-row m_top_30">
						<view class="bnt6 acea-row row-middle" @click="openRole"><uni-icons type="personadd" size="16" color="#00d3f8" style="margin-right: 5rpx;"></uni-icons>角色</view>
					</view>
					<veiw class="acea-row m_top_30">
						<view class="bnt1" @click="openAICopywriting">
							<uni-icons type="star-filled" size="16" color="#ffe135" class="ai-icon-animate" style="margin-right: 5rpx;"></uni-icons>
							AI文案
						</view>
						<view class="bnt acea-row row-middle" @click="openMoban"><uni-icons type="fire" size="16" color="#fff" style="margin-right: 5rpx;"></uni-icons>模板库</view>
					</veiw>
				</view>
				
				
			</view>
			<view class="card m_top_30">
				<!-- 标题行 -->
				<view class="acea-row row-middle">
					<view class="title_bnt">第二步</view>
					<view class="desc" style="margin-left: 20rpx;">上传参考</view>
				</view>

				<!-- Veo3 模式 Tab（仅 veo3 显示，标题下方独立一行） -->
				<view v-if="selectedModel === 'veo3'" class="veo-mode-bar m_top_20">
					<view
						v-for="mode in veo3Modes"
						:key="mode.value"
						class="veo-bar-tab"
						:class="{ active: currentVeMode == mode.value }"
						@click="switchVeMode(mode.value)"
					>
						<uni-icons :type="mode.icon" size="15" :color="currentVeMode == mode.value ? '#00d3f8' : '#9ca3af'" style="margin-right: 6rpx;"></uni-icons>
						<text>{{ mode.label }}</text>
					</view>
				</view>

				<!-- Seedance2 参考开关（仅 seedance2 显示） -->
				<view v-if="selectedModel === 'seedance2'" class="acea-row row-middle m_top_20">
					<text class="seedance-ref-hint">参考视频/音频</text>
					<switch :checked="seedanceRefEnabled" @change="seedanceRefEnabled = !seedanceRefEnabled" color="#00d3f8" style="transform: scale(0.75);margin-left: 16rpx;" />
				</view>

				<!-- 参考图片区域 -->
				<view class="neikuang1 m_top_30" v-if="selectedModel !== 'veo3' || currentVeMode !== 'TEXT'">
					<view class="upimg">
						<u-upload :custom-btn="true" :max-count="5" ref="upload" :auto-upload="false" width="162rpx" height="162rpx" @on-choose-complete="upimg" @on-remove="delimg">
							<template v-slot:addBtn>
								<view class="tupiankuang">
									<view>
										<view class="acea-row row-center">
											<uni-icons type="plusempty" size="24" color="#bdbdbd" style="margin-right: 5rpx;"></uni-icons>
										</view>
										<view>上传图片</view>
									</view>
								</view>
							</template>
						</u-upload>
					</view>
				</view>
				<!-- Veo3 TEXT 模式提示 -->
				<view v-if="selectedModel === 'veo3' && currentVeMode === 'TEXT'" class="veo-text-tip m_top_30">
					<uni-icons type="info" size="14" color="#9ca3af" style="margin-right: 8rpx;"></uni-icons>
					<text>文生视频模式，无需上传参考图片</text>
				</view>

				<!-- Seedance2.0 参考视频/音频展开区 -->
				<view v-if="selectedModel === 'seedance2' && seedanceRefEnabled" class="seedance-ref-section m_top_30">
					<view class="ref-media-box">
						<view class="ref-media-item acea-row row-middle">
							<view class="ref-media-icon">
								<uni-icons type="videocam" size="18" color="#00d3f8"></uni-icons>
							</view>
							<view class="acea-row row-between-wrapper" style="flex: 1; margin-left: 16rpx;">
								<view class="acea-row row-middle">
									<text class="ref-media-name">参考视频</text>
									<text class="ref-media-tip">（可选）</text>
								</view>
								<view v-if="seedanceRefVideo" class="acea-row row-middle">
									<uni-icons type="checkmark-circle" size="14" color="#4ade80"></uni-icons>
									<text class="ref-media-success">已上传</text>
								</view>
							</view>
							<view class="ref-media-upload-btn" @click="chooseSeedanceVideo">
								<text>{{ seedanceRefVideo ? '重新上传' : '上传视频' }}</text>
							</view>
						</view>
						<view class="ref-media-item acea-row row-middle m_top_20">
							<view class="ref-media-icon">
								<uni-icons type="mic" size="18" color="#00d3f8"></uni-icons>
							</view>
							<view class="acea-row row-between-wrapper" style="flex: 1; margin-left: 16rpx;">
								<view class="acea-row row-middle">
									<text class="ref-media-name">参考音频</text>
									<text class="ref-media-tip">（可选）</text>
								</view>
								<view v-if="seedanceRefAudio" class="acea-row row-middle">
									<uni-icons type="checkmark-circle" size="14" color="#4ade80"></uni-icons>
									<text class="ref-media-success">已上传</text>
								</view>
							</view>
							<view class="ref-media-upload-btn" @click="chooseSeedanceAudio">
								<text>{{ seedanceRefAudio ? '重新上传' : '上传音频' }}</text>
							</view>
						</view>
						<view class="ref-media-tips m_top_20">
							<uni-icons type="info" size="12" color="#9ca3af" style="margin-right: 6rpx;"></uni-icons>
							<text>视频/音频二选一上传，可增强动作和声音风格参考</text>
						</view>
					</view>
				</view>

				<veiw class="acea-row row-between-wrapper m_top_30" v-if="selectedModel !== 'veo3' || currentVeMode !== 'TEXT'">
					<view class="tips"><uni-icons type="info" size="18" color="#ffbb00" style="margin-right: 5rpx;"></uni-icons>图片不能包含人物肖像</view>
					<view class="bnt acea-row row-middle" @click="openMaterial()"><uni-icons type="images" size="16" color="#fff" style="margin-right: 5rpx;"></uni-icons>历史素材</view>
				</veiw>
			</view>
			<!-- #ifdef MP -->
			<view v-if="WEBCONFIG?.mp_banner" class="acea-row row-center-wrapper m_top_30">
				<ad-custom :unit-id="WEBCONFIG?.mp_banner" bindload="adLoad" binderror="adError" bindclose="adClose"></ad-custom>
			</view>
			<!-- #endif -->
			
			
			<view class="card m_top_30">
				<view class="acea-row row-middle">
					<view class="title_bnt">第三步</view><view class="desc">视频配置</view>
				</view>

				<!-- 视频尺寸 -->
				<view class="config-section m_top_30" v-if="currentConfig?.showProportion">
					<view class="section-title">视频尺寸</view>
					<view class="acea-row m_top_20">
						<view 
							v-for="item in (currentConfig?.proportions || [])" 
							:key="selectedModel + '_p_' + item.value"
							:class="currentProportion == item.value ? 'bnt' : 'bnt0'" 
							:style="item.value !== currentConfig?.proportions?.[0]?.value ? 'margin-left: 30rpx;' : ''"
							@click="switchProportion(item.value)"
						>
							{{ item.label }}
						</view>
					</view>
				</view>
				
				<!-- 视频时长 -->
				<view class="config-section m_top_30">
					<view class="section-title">视频时长</view>
					<view class="acea-row m_top_20">
						<view 
							v-for="(item, index) in (currentConfig?.durations || [])" 
							:key="selectedModel + '_d_' + item.value"
							:class="currentDuration == item.value ? 'bnt' : 'bnt0'" 
							:style="index > 0 ? 'margin-left: 30rpx;' : ''"
							@click="switchDuration(item.value)"
						>
							{{ item.label }}
						</view>
					</view>
				</view>
				
				<!-- 视频清晰度 -->
				<view class="config-section m_top_30" v-if="currentConfig?.showQuality">
					<view class="section-title">视频清晰度</view>
					<view class="acea-row m_top_20">
						<view 
							v-for="(item, index) in (currentConfig?.qualities || [])" 
							:key="selectedModel + '_q_' + item.value"
							:class="currentQuality == item.value ? 'bnt' : 'bnt0'" 
							:style="index > 0 ? 'margin-left: 30rpx;' : ''"
							@click="switchQuality(item.value)"
						>
							{{ item.label }}
						</view>
					</view>
				</view>
			</view>
			<view class="m_top_40">
					<view class="bigbnt" @click="fangdou">立即生成<text style="margin-left: 10rpx;font-size: 28rpx;">(扣除{{points}}积分)</text></view>

					<view class="card_tips">
						(本页面视频由AI技术生成)
					</view>

			</view>
		</view>
		
		<!-- 素材选择 -->
		<uni-popup ref="MaterialShowRef" type="center" border-radius="20rpx" background-color="#fff">
			<Material ref="MaterialRef"  @close="closeMaterial"></Material>
		</uni-popup>

		<!-- 角色选择 -->
		<u-popup v-model="role_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="role_popup">
				<RoleList ref="RoleListRef"  @close="closeRole"></RoleList>
				<view class="role_bnt m_top_30" @click="$page.open('/pages/user/role?open=1',true)">新建角色</view>
			</view>
		</u-popup>

		<!-- 模板库列表 -->
		<u-popup v-model="moban_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="role_popup">
				<MobanList ref="MobanListRef"  @close="closeMoban"></MobanList>
			</view>
		</u-popup>

		<!-- 模板库详情页 -->
		<u-popup v-model="moban_info_show" mode="center" border-radius="20" width="95%" height="800rpx" :closeable="true" :mask-close-able="false" z-index="998" v-if="moban_info" close-icon-color="#000">
			<view class="moban_popup">
				<view class="title">{{moban_info.title}}</view>
				<view class="acea-row row-between-wrapper m_top_30">
					<view class="left">
						<u-upload :custom-btn="true" max-count="1" ref="anupload" :auto-upload="false" width="100%" @on-choose-complete="upanimg" @on-remove="delimg">
							<template v-slot:addBtn>
								<view class="imgkuang">
									<view>
										<view class="acea-row row-center">
											<uni-icons type="plusempty" size="24" color="#505050" style="margin-right: 5rpx;"></uni-icons>
										</view>
										<view class="tips">上传图片</view>
										<view class="tips1">图片中不得有人物出现,否则生成失败</view>
									</view>
									
								</view>
							</template>
						</u-upload>
					</view>
					<view class="right">
						<view class="shiliimg">参考图片示例</view>
						<u-swiper :list="moban_info.imglist" height="500" border-radius="20"></u-swiper>
					</view>
				</view>
				<view class="m_top_30" v-for="(item,index) in moban_info.free_field" :key="index" v-if="moban_info.free_field">
					<view class="input_title">{{item.name}}</view>
					<view class="input">
						<u-input v-model="mobanform[item.field]" :placeholder="item.desc" :border="true" placeholder-style="color:#8b8b8b" />
					</view>
				</view>
				<view class="dibu">
					<view class="bnt00" @click="mobanSubmit()">立即生成<text style="margin-left: 10rpx;font-size: 28rpx;">(扣除{{points}}积分)</text></view>
				</view>
				
			</view>
		</u-popup>
		
		<!-- 购买积分弹窗 -->
		<u-popup v-model="buy_show" mode="center" border-radius="20" :closeable="false" z-index="1001" :mask-close-able="false">
			<PointsTips ref="PointsTipsRef"  @close="buy_show = false"></PointsTips>
		</u-popup>
		<!-- AI文案弹窗 -->
		<u-popup v-model="ai_show" mode="bottom" border-radius="20" :closeable="false" z-index="1001">
			<view class="ai_popup">
				<view class="popup-title">AI文案</view>
				
				<!-- 主题选择 -->
				<view class="ai-section">
					<view class="section-label">主题</view>
					<view class="theme-tabs">
						<view class="theme-tab" :class="{ active: aiTheme == 'koubo' }" @click="aiTheme = 'koubo'">文案创作</view>
						<view class="theme-tab" :class="{ active: aiTheme == 'gaixi' }" @click="aiTheme = 'gaixi'">文案改写</view>
					</view>
				</view>
				
				<!-- 模型选择 -->
				<view class="ai-section">
					<view class="section-label">模型</view>
					<view class="model-tabs">
						<view class="model-tab" :class="{ active: aiModel == 'deepseek' }" @click="aiModel = 'deepseek'">
							<text>deepseek</text>
						</view>
						<view class="model-tab" :class="{ active: aiModel == 'doubao' }" @click="aiModel = 'doubao'">
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
						<view class="length-tab" :class="{ active: aiLength == 'short' }" @click="aiLength = 'short'">短篇</view>
						<view class="length-tab" :class="{ active: aiLength == 'medium' }" @click="aiLength = 'medium'">中篇</view>
						<view class="length-tab" :class="{ active: aiLength == 'long' }" @click="aiLength = 'long'">长篇</view>
					</view>
				</view>
				
				<!-- 生成按钮 -->
				<view class="ai-generate-btn" @click="generateAICopy">
					<text>生成文案</text>
				</view>
			</view>
		</u-popup>
		
	</view>
</template>

<script setup>
	import { ref,getCurrentInstance,nextTick,onMounted,onUnmounted,computed,watch   } from 'vue';
	import { onLoad,onShow,onShareAppMessage, onShareTimeline,onReady } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	import Material from '../../components/Material/Material.vue';
	// #ifdef H5
	import { useUrlParams } from '@/utils/useUrlParams'
import PointsTips from '../../components/PointsTips/PointsTips.vue';
import MobanList from '../../components/MobanList/MobanList.vue';
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
	const descTextNum = ref(0)	//描述词字数
	const form = ref({
		'desc':'',	//提示词
		'reference':[],	//参考图
		'proportion':'portrait',	//横竖
		'duration':10,	//时长
		'quality':'',	//清晰度
		'model':'',	//模型
	})
	const points = ref(0) //积分
	const buy_show = ref(false) //购买积分弹窗
	
	// 模型选择
	const selectedModel = ref('sora2-official')
	const modelList = ref([
		{ key: 'sora2-official', name: 'Sora2官方直连', badge: '官方' },
		{ key: 'veo3', name: 'Veo3.1', badge: '' },
		{ key: 'grok', name: 'GroK', badge: '' },
		{ key: 'seedance2', name: 'Seedance2.0', badge: '' }
	])

	// 每个模型的独立配置状态
	const modelStates = ref({
		'sora2-official': { proportion: 'portrait', duration: 4, quality: 'standard' },
		'veo3': { proportion: 'portrait', duration: 8, quality: '720p', veMode: 'TEXT' },
		'grok': { proportion: '9:16', duration: 6, quality: '720p' },
		'seedance2': { proportion: 'portrait', duration: 5, quality: '720p' }
	})
	
	// 模型配置映射（包含服务端对应的模型名称和计费类型）
	const modelConfigs = {
		'sora2-official': {
			showProportion: true,
			showQuality: true,
			proportions: [
				{ value: 'portrait', label: '9:16(竖屏)' },
				{ value: 'landscape', label: '16:9(横屏)' }
			],
			durations: [
				{ value: 4, label: '4秒' },
				{ value: 8, label: '8秒' },
				{ value: 12, label: '12秒' }
			],
			qualities: [
				// modelName 对应服务端 video_model 中的 model_name
				{ value: 'standard', label: '标清', modelName: 'sora-2-official', type: 2, points: 40 },
				{ value: 'pro', label: '高清Pro', modelName: 'sora-2-pro-official', type: 2, points: 150 }
			],
			defaultProportion: 'portrait',
			defaultDuration: 4,
			defaultQuality: 'standard'
		},
		'veo3': {
			showProportion: true,
			showQuality: true,
			showVeMode: true,
			proportions: [
				{ value: 'portrait', label: '9:16(竖屏)' },
				{ value: 'landscape', label: '16:9(横屏)' }
			],
			durations: [
				{ value: 8, label: '8秒' }
			],
			qualities: [
				// modelName 对应服务端 video_model 中的 model_name
				{ value: '720p', label: '720P', modelName: 'veo3.1-fast-spare', type: 1, points: 40 },
				{ value: '1080p', label: '1080P', modelName: 'veo3.1-fast-spare', type: 1, points: 40 },
				{ value: '4k', label: '4K', modelName: 'veo3.1-components-4K-spare', type: 1, points: 100 }
			],
			defaultProportion: 'portrait',
			defaultDuration: 8,
			defaultQuality: '720p'
		},
		'grok': {
			showProportion: true,
			showQuality: true,
			proportions: [
				{ value: '3:2', label: '3:2' },
				{ value: '2:3', label: '2:3' },
				{ value: '1:1', label: '1:1' },
				{ value: '16:9', label: '16:9' },
				{ value: '9:16', label: '9:16' }
			],
			durations: [
				// modelName 对应服务端 video_model 中的 model_name
				{ value: 6, label: '6秒', modelName: 'grok-video-3', type: 1, points: 30 },
				{ value: 10, label: '10秒', modelName: 'grok-video-3-pro', type: 1, points: 35 },
				{ value: 12, label: '12秒', modelName: 'grok-video-3', type: 1, points: 35 },
				{ value: 16, label: '16秒', modelName: 'grok-video-3-pro', type: 1, points: 40 },
				{ value: 20, label: '20秒', modelName: 'grok-video-3-max', type: 1, points: 45 }
			],
			qualities: [
				{ value: '720p', label: '720P' }
			],
			defaultProportion: '9:16',
			defaultDuration: 6,
			defaultQuality: '720p'
		},
		'seedance2': {
			showProportion: true,
			showQuality: true,
			showReferenceMedia: true,
			proportions: [
				{ value: 'portrait', label: '9:16(竖屏)' },
				{ value: 'landscape', label: '16:9(横屏)' }
			],
			durations: [
				{ value: 4, label: '4秒', modelName: 'seedance2', type: 1, points: 20 },
				{ value: 5, label: '5秒', modelName: 'seedance2', type: 1, points: 25 },
				{ value: 10, label: '10秒', modelName: 'seedance2', type: 1, points: 40 },
				{ value: 15, label: '15秒', modelName: 'seedance2', type: 1, points: 60 }
			],
			qualities: [
				{ value: '480p', label: '480P', modelName: 'seedance2', type: 1, points: 20 },
				{ value: '720p', label: '720P', modelName: 'seedance2', type: 1, points: 25 }
			],
			defaultProportion: 'portrait',
			defaultDuration: 5,
			defaultQuality: '720p'
		}
	}

	// 服务端下发的模型配置数据（包含真实积分）
	const serverVideoModels = ref([])
	const serverImageModels = ref([])

	// Seedance2.0 价格配置（从 Video/getVideoPriceConfig 获取）
	const seedancePriceConfig = ref(null)

	// Seedance2 参考视频/音频
	const seedanceRefEnabled = ref(false)
	const seedanceRefVideo = ref('')
	const seedanceRefAudio = ref('')
	const seedanceUploadLoading = ref(false)

	// 监听 seedanceRefEnabled，关闭时清除参考视频/音频
	watch(seedanceRefEnabled, (newVal) => {
		if (!newVal) {
			seedanceRefVideo.value = ''
			seedanceRefAudio.value = ''
		}
	})

	// 将服务端积分数据映射到 modelConfigs，覆盖硬编码值
	const applyServerPoints = () => {
		const modelData = WEBCONFIG?.value?.model
		if (!modelData) return

		serverVideoModels.value = modelData.video_model || []
		serverImageModels.value = modelData.image_model || []

		// 建立前端 modelName -> 服务端配置 的映射
		const videoMap = {}
		serverVideoModels.value.forEach(item => {
			videoMap[item.model_name] = item
		})

		// sora2-official: 根据 quality 的 modelName 匹配
		modelConfigs['sora2-official'].qualities.forEach(q => {
			const serverItem = videoMap[q.modelName]
			if (serverItem) {
				q.type = parseInt(serverItem.type) || 2
				q.points = parseInt(serverItem.points) || q.points
				q.name = serverItem.name // 保存服务端 name 用于提交
			}
		})

		// veo3: 根据 quality 的 modelName 匹配
		modelConfigs['veo3'].qualities.forEach(q => {
			const serverItem = videoMap[q.modelName]
			if (serverItem) {
				q.type = parseInt(serverItem.type) || 1
				q.points = parseInt(serverItem.points) || q.points
				q.name = serverItem.name // 保存服务端 name 用于提交
			}
		})

		// grok: 根据时长和 modelName 匹配
		modelConfigs['grok'].durations.forEach(d => {
			const serverItem = videoMap[d.modelName]
			if (serverItem) {
				d.type = parseInt(serverItem.type) || 1
				d.points = parseInt(serverItem.points) || d.points
				d.name = serverItem.name // 保存服务端 name 用于提交
			}
		})

		// seedance2: 根据时长和 modelName 匹配
		modelConfigs['seedance2'].durations.forEach(d => {
			const serverItem = videoMap[d.modelName]
			if (serverItem) {
				d.type = parseInt(serverItem.type) || 1
				d.points = parseInt(serverItem.points) || d.points
				d.name = serverItem.name
			}
		})
		modelConfigs['seedance2'].qualities.forEach(q => {
			const serverItem = videoMap[q.modelName]
			if (serverItem) {
				q.type = parseInt(serverItem.type) || 1
				q.points = parseInt(serverItem.points) || q.points
				q.name = serverItem.name
			}
		})
	}

	// 获取 Seedance2.0 价格配置
	const fetchSeedancePriceConfig = async () => {
		try {
			const res = await $http.get('Video/getVideoPriceConfig', { model_name: 'Seedance2.0' })


			// 处理 res.code 为 0 或 200 的情况
			if ((res.code === 0 || res.code === 200) && res.data) {
				// res.data 可能是对象或数组
				const priceConfigData = Array.isArray(res.data) ? res.data[0] : res.data
				seedancePriceConfig.value = priceConfigData?.price_config || null

				// 获取配置后立即更新积分
				updatePoints()
			}
		} catch (e) {
			console.error('获取Seedance2.0价格配置失败', e)
		}
	}

	// 更新积分计算
	const updatePoints = () => {
		const modelKey = selectedModel.value
		const currentState = modelStates.value[modelKey]
		const duration = currentState.duration
		const quality = currentState.quality
		const config = modelConfigs[modelKey]

		if (!config) {
			points.value = 0
			return
		}

		let pointsValue = 0
		let billingType = 1
		let basePoints = 0

		if (modelKey == 'sora2-official') {
			const qualityConfig = config.qualities.find(q => q.value == quality)
			if (qualityConfig) {
				billingType = qualityConfig.type
				basePoints = qualityConfig.points
				form.value.model = qualityConfig.name || qualityConfig.modelName
			}
		} else if (modelKey == 'veo3') {
			const qualityConfig = config.qualities.find(q => q.value == quality)
			if (qualityConfig) {
				billingType = qualityConfig.type
				basePoints = qualityConfig.points
				form.value.model = qualityConfig.name || qualityConfig.modelName
			}
		} else if (modelKey == 'grok') {
			const durationConfig = config.durations.find(d => d.value == duration)
			if (durationConfig) {
				billingType = durationConfig.type
				basePoints = durationConfig.points
				form.value.model = durationConfig.name || durationConfig.modelName
			}
		} else if (modelKey == 'seedance2') {
			const priceCfg = seedancePriceConfig.value

			if (priceCfg && priceCfg.type === 'token_table') {
				// 参考 jimeng 的 token_table 计算逻辑
				const tokenTable = priceCfg.token_table || {}
				const multiple = priceCfg.multiple || 0
				const resolution = (quality || '720p').toLowerCase()
				const outputDuration = parseInt(duration) || 5
				const hasVideo = !!seedanceRefVideo.value

				// 获取分辨率配置
				const resolutionTable = tokenTable[resolution]
				if (!resolutionTable) {
					console.warn('分辨率配置不存在:', resolution)
					pointsValue = 0
				} else {
					const outputKey = `output_${outputDuration}`

					if (hasVideo) {
						// 含视频计算逻辑
						// 视频单价: 1080p = 31, 其他 = 28
						const videoUnitPrice = resolution === '1080p' ? 31 : 28

						// 档位映射，按从大到小排序
						const slotMapping = [
							{ key: 'input_15', value: 15 },
							{ key: 'input_7', value: 7 },
							{ key: 'input_4', value: 4 },
							{ key: 'input_3', value: 3 },
							{ key: 'input_2', value: 2 },
						]

						// 找最近的可用档位
						let bestKey = null
						let bestValue = Infinity
						for (const slot of slotMapping) {
							if (resolutionTable[slot.key] && resolutionTable[slot.key][outputKey]) {
								const diff = Math.abs(slot.value - 2) // 默认使用 input_2 档位
								if (slot.value >= 2 && diff < bestValue) {
									bestKey = slot.key
									bestValue = diff
								}
							}
						}
						// 如果没找到 >= 的，找最大的
						if (!bestKey) {
							for (const slot of slotMapping) {
								if (resolutionTable[slot.key] && resolutionTable[slot.key][outputKey]) {
									bestKey = slot.key
									break
								}
							}
						}

						if (!bestKey) {
							console.warn('没有找到可用的 input 档位')
							pointsValue = 0
						} else {
							const inputKey = bestKey
							const token = resolutionTable[inputKey][outputKey]

							if (token <= 0) {
								console.warn('token 计算失败')
								pointsValue = 0
							} else {
								// 含视频: points = round((token × videoUnitPrice + videoUnitPrice × (inputUsed + output) × 28) / 10000)
								const inputUsed = 2 // 默认使用 2 档位
								const basePointsCalc = Math.round((token * videoUnitPrice + videoUnitPrice * (inputUsed + outputDuration) * 28) / 10000)
								pointsValue = multiple > 0 ? Math.round(basePointsCalc * (1 + multiple)) : basePointsCalc
								console.log('含视频计算: token=', token, 'videoUnitPrice=', videoUnitPrice, 'inputUsed=', inputUsed, 'pointsValue=', pointsValue)
							}
						}
					} else {
						// 不含视频计算逻辑
						// 单位价格: 1080p = 51, 其他 = 46
						const unitPrice = resolution === '1080p' ? 51 : 46

						const noInputTable = resolutionTable['no_input']
						if (!noInputTable || !noInputTable[outputKey]) {
							console.warn('no_input 配置不存在')
							pointsValue = 0
						} else {
							const token = noInputTable[outputKey]
							// 不含视频: points = round(token × unit_price / 10000)
							const basePointsCalc = Math.round(token * unitPrice / 10000)
							pointsValue = multiple > 0 ? Math.round(basePointsCalc * (1 + multiple)) : basePointsCalc
							console.log('不含视频计算: token=', token, 'unitPrice=', unitPrice, 'pointsValue=', pointsValue)
						}
					}
				}

				form.value.model = 'Seedance2.0'
				// token_table 计算完成后直接使用 pointsValue，不再走通用逻辑
				console.log('final pointsValue from seedance2:', pointsValue)
				points.value = pointsValue
				return
			}
		}

		if (billingType == 2) {
			pointsValue = basePoints * duration
		} else {
			pointsValue = basePoints
		}

		console.log('final pointsValue:', pointsValue)
		points.value = pointsValue
	}

	// 监听 WEBCONFIG 变化，服务端模型数据就绪后应用积分配置
	watch(() => WEBCONFIG.value, (newVal) => {
		if (newVal?.model) {
			applyServerPoints()
			updatePoints()
		}
	}, { immediate: true })

	// seedance2: 参考视频切换后重新计算积分
	watch(seedanceRefVideo, () => {
		if (selectedModel.value === 'seedance2' && seedancePriceConfig.value) {
			updatePoints()
		}
	})

	// 当前配置
	const currentConfig = computed(() => {
		if (!modelConfigs || !modelConfigs[selectedModel.value]) {
			return {
				showProportion: false,
				showQuality: false,
				proportions: [],
				durations: [],
				qualities: []
			}
		}
		return modelConfigs[selectedModel.value] || modelConfigs['sora2-official']
	})
	
	// 当前模型各属性的独立 computed，确保 Vue 精确追踪依赖
	const currentDuration = computed(() => modelStates.value[selectedModel.value]?.duration)
	const currentQuality  = computed(() => modelStates.value[selectedModel.value]?.quality)
	const currentProportion = computed(() => modelStates.value[selectedModel.value]?.proportion)
	const currentVeMode = computed(() => modelStates.value[selectedModel.value]?.veMode || 'TEXT')

	// form.desc 的计算属性，用于模板双向绑定
	const formDesc = computed({
		get: () => form.value?.desc || '',
		set: (val) => { if (form.value) form.value.desc = val }
	})

	// Veo3 模式选项
	const veo3Modes = [
		{ value: 'TEXT', label: '文生视频', icon: 'chat' },
		{ value: 'FIRST&LAST', label: '首尾帧', icon: 'image' },
		{ value: 'REFERENCE', label: '参考图', icon: 'star' }
	]

	// 选择 Veo3 模式
	const switchVeMode = (mode) => {
		const oldMode = modelStates.value[selectedModel.value].veMode
		modelStates.value[selectedModel.value].veMode = mode
		// 切换模式时清除参考图片（TEXT 模式不需要参考图）
		if (mode === 'TEXT' && oldMode !== 'TEXT') {
			form.value.reference = []
			if (upload.value) {
				upload.value.lists = []
			}
		}
	}
	
	// AI文案
	const ai_show = ref(false)
	const aiPrompt = ref('')
	const aiTheme = ref('koubo')
	const aiModel = ref('deepseek')
	const aiLength = ref('short')
	
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
	
	//图片上传------------------------------------start
	const upload = ref(null)
	const anupload = ref(null)
	const delimg = (index) => {
		form.value.reference.splice(index, 1)
	}

	const chooseSeedanceVideo = () => {
		uni.chooseVideo({
			success: async (res) => {
				if (!res.tempFilePath) return
				seedanceUploadLoading.value = true
				try {
					const uploadRes = await $http.upload('Upload/upload', {
						name: 'file',
						filePath: res.tempFilePath
					})
					if (uploadRes.code == 200) {
						seedanceRefVideo.value = $tool.imgReplace(uploadRes.src)
						uni.showToast({ title: '视频上传成功', icon: 'success' })
					} else {
						uni.showToast({ title: uploadRes.msg || '上传失败', icon: 'none' })
					}
				} catch {
					uni.showToast({ title: '上传失败', icon: 'none' })
				} finally {
					seedanceUploadLoading.value = false
				}
			}
		})
	}

	const chooseSeedanceAudio = () => {
		// #ifdef MP-WEIXIN
		uni.chooseMessageFile({
			count: 1,
			type: 'file',
			fail: (err) => {
				console.log('chooseMessageFile fail:', err)
				uni.showToast({ title: '选择文件失败', icon: 'none' })
			},
			success: async (res) => {
				const file = res.tempFiles[0]
				if (!file) return
				seedanceUploadLoading.value = true
				try {
					const uploadRes = await $http.upload('Upload/upload', {
						name: 'file',
						filePath: file.path
					})
					if (uploadRes.code == 200) {
						seedanceRefAudio.value = $tool.imgReplace(uploadRes.src)
						uni.showToast({ title: '音频上传成功', icon: 'success' })
					} else {
						uni.showToast({ title: uploadRes.msg || '上传失败', icon: 'none' })
					}
				} catch {
					uni.showToast({ title: '上传失败', icon: 'none' })
				} finally {
					seedanceUploadLoading.value = false
				}
			}
		})
		// #endif
		// #ifdef H5 || APP-PLUS
		uni.chooseFile({
			extensions: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
			success: async (res) => {
				if (!res.tempFiles || res.tempFiles.length === 0) return
				const file = res.tempFiles[0]
				seedanceUploadLoading.value = true
				try {
					const uploadRes = await $http.upload('Upload/upload', {
						name: 'file',
						filePath: file.path
					})
					if (uploadRes.code == 200) {
						seedanceRefAudio.value = $tool.imgReplace(uploadRes.src)
						uni.showToast({ title: '音频上传成功', icon: 'success' })
					} else {
						uni.showToast({ title: uploadRes.msg || '上传失败', icon: 'none' })
					}
				} catch {
					uni.showToast({ title: '上传失败', icon: 'none' })
				} finally {
					seedanceUploadLoading.value = false
				}
			},
			fail: (err) => {
				console.log('chooseFile fail:', err)
				if (err.errMsg && !err.errMsg.includes('cancel')) {
					uni.showToast({ title: '选择音频失败', icon: 'none' })
				}
			}
		})
		// #endif
	}

	//上传单张图片
	const upanimg = (e) => {
		if(e[0].url){
			uni.showLoading({
				title: '上传中',
				mask: true
			})
			$http.upload('Upload/upload', { name:"file",filePath:e[0].url}).then(res => {
				if(res.code == 200){
					form.value.reference[0] = $tool.imgReplace(res.src)
					if (upload.value) {
						upload.value.lists[0] = {url:form.value.reference[0]}
					}
					uni.showToast({
						title: '上传成功',
						icon: 'none'
					})
				}else{
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}).catch(err => {
				uni.hideLoading()
			})
		}
	}

	//上传多张图片
	const upimg = (e) => {
		let imgList = e
		form.value.reference = []
		if (!imgList || imgList.length === 0) return
		
		// 分类处理：网络图片和本地图片
		const networkImages = []  // 网络图片
		const localImages = []    // 需要上传的本地图片
		
		imgList.forEach((item, index) => {
			const url = item.url || item.path || item.tempFilePath
			console.log(`处理图片${index}: ${url}`) // 添加调试
			
			// 判断是否为网络URL（排除小程序的临时文件）
			if (url && url.startsWith('http://') || url.startsWith('https://')) {
				// 关键修改：排除小程序临时文件
				if (url.startsWith('http://tmp/') || url.startsWith('https://tmp/') || url.includes('/tmp/')) {
					console.log(`识别为小程序临时文件: ${url}`)
					localImages.push({
						url: url,
						index: index
					})
				} else {
					console.log(`识别为网络图片: ${url}`)
					networkImages.push(url)
				}
			} else if (url) {
				console.log(`识别为本地路径: ${url}`)
				localImages.push({
					url: url,
					index: index
				})
			}
		})
		
		console.log(`网络图片: ${networkImages.length}, 需要上传的本地图片: ${localImages.length}`)
		
		// 1. 先添加网络图片
		if (networkImages.length > 0) {
			form.value.reference = [...form.value.reference, ...networkImages]
		}
		
		// 2. 如果没有需要上传的本地图片，直接完成
		if (localImages.length === 0) {
			showUploadCompleteMessage(imgList.length)
			return
		}
		
		// 3. 上传本地图片
		uni.showLoading({
			title: `上传中 (0/${localImages.length})`,
			mask: true
		})
		
		let uploadSuccessCount = 0
		
		// 使用Promise.all并发上传（或按顺序上传，根据服务器性能决定）
		const uploadPromises = localImages.map((image, idx) => {
			return new Promise((resolve, reject) => {
				console.log(`开始上传: ${image.url}`)
				$http.upload('Upload/upload', { 
					name: "file", 
					filePath: image.url 
				}).then(res => {
					if (res.code == 200) {
						console.log(`上传成功:`, res)
						uploadSuccessCount++
						
						// 更新loading提示
						uni.showLoading({
							title: `上传中 (${uploadSuccessCount}/${localImages.length})`,
							mask: true
						})
						
						resolve(res.src)  // 返回上传成功的URL
					} else {
						reject(new Error(`第${image.index + 1}张上传失败: ${res.msg}`))
					}
				}).catch(err => {
					reject(new Error(`第${image.index + 1}张上传失败`))
				})
			})
		})
		
		// 并发上传所有图片
		Promise.all(uploadPromises)
			.then(results => {
				// 添加上传成功的图片到数组
				form.value.reference = [...form.value.reference, ...results]
				
				uni.hideLoading()
				showUploadCompleteMessage(imgList.length)
				
				console.log('当前图片列表:', form.value.reference)
			})
			.catch(err => {
				uni.hideLoading()
				uni.showToast({
					title: err.message,
					icon: 'none',
					duration: 2000
				})
			})
	}

	// 显示上传完成消息
	const showUploadCompleteMessage = (totalCount) => {
		// 延迟显示，确保loading已关闭
		setTimeout(() => {
			const currentCount = form.value.reference.length
			uni.showToast({
			title: `已添加 ${totalCount} 张图片，共 ${currentCount} 张`,
			icon: 'none',
			duration: 2000
			})
		}, 300)
	}
	
	//图片上传------------------------------------end
	
	//防抖，重复点击
	const fangdou = (e) => {
		// #ifdef MP-WEIXIN
		console.log(WEBCONFIG?.value?.message?.sendmsg_complete)
		if(WEBCONFIG?.value?.message?.sendmsg_complete){
			subscribe()
		}
		// #endif
		$tool.debounce(() => subVideo(e), 500,true);
		
	}
	//生成视频
	const subVideo = (e) => {
		if(!form.value.desc){
			uni.showToast({
				title: '请填写提示词',
				icon: 'none'
			})
			return false
		}
		
		// 获取当前模型的状态
		const currentState = modelStates.value[selectedModel.value]

		// seedance2 不需要比例验证
		if (!currentState.proportion) {
			uni.showToast({ title: '请选择视频比例', icon: 'none' })
			return false
		}

		if(!currentState.duration){
			uni.showToast({
				title: '请填选择视频时长',
				icon: 'none'
			})
			return false
		}

		// 根据选中的模型配置，构造提交数据（使用当前模型的独立状态）
		const submitData = {
			desc: form.value.desc,
			reference: form.value.reference,
			proportion: currentState.proportion || '',
			duration: currentState.duration,
			model: form.value.model  // 使用服务端模型名称（如 sora-2-pro）
		}

		// veo3、grok、seedance2 需要 quality 参数
		if (['veo3', 'grok', 'seedance2'].includes(selectedModel.value)) {
			submitData.quality = currentState.quality
		}

		// veo3 携带生成模式，TEXT 模式不传 reference
		if (selectedModel.value === 'veo3') {
			submitData.veo_type = currentState.veMode
			if (currentState.veMode === 'TEXT') {
				submitData.reference = []
			}
		}

		// seedance2 额外携带视频/音频参考
		if (selectedModel.value === 'seedance2') {
			if (seedanceRefVideo.value) {
				submitData.video_url = seedanceRefVideo.value
			}
			if (seedanceRefAudio.value) {
				submitData.audio_url = seedanceRefAudio.value
			}
		}
		
		uni.showLoading({
			title: '生成中',
			mask: false
		})

		// grok 模型使用单独接口
		if (selectedModel.value === 'grok') {
			$http.post('Video/grok', submitData).then(res => {
				if(res.code == 200){
					uni.hideLoading()
					uni.showModal({
						title: '温馨提示',
						content: res.msg,
						success: function (res) {
							if (res.confirm) {
								$page.switch('/pages/videolist/videolist')
							} else if (res.cancel) {
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
			})
		} else {
			$http.post('Video/generate', submitData).then(res => {
				if(res.code == 200){
					uni.hideLoading()
					uni.showModal({
						title: '温馨提示',
						content: res.msg,
						success: function (res) {
							if (res.confirm) {
								$page.switch('/pages/videolist/videolist')
							} else if (res.cancel) {
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
			})
		}
		
	}
	
	//选择素材弹出框------------------------------------start
	const MaterialShow = ref(false)
	const MaterialShowRef = ref(null)	//选择水站地址弹窗
	const MaterialRef = ref(null)	//水站地址组件
	
	//关闭历史素材
	const closeMaterial = (path) => {
		let num = 5;
		if(upload.value.lists.length > num){
			uni.showToast({
				title: '最多只能上传'+(num+1)+'张图片',
				icon: 'none'
			})
			return false
		}
		form.value.reference.push(path)
		upload.value.lists.push({url:path})
		MaterialShowRef.value.close()
		MaterialShow.value = false
	}
	
	//打开素材弹出弹窗
	const openMaterial = async () => {
		// 方式 1：使用 onMounted（推荐，明确等待 DOM 挂载）
		if (MaterialShowRef.value) { // 二次判断，避免意外
			MaterialShowRef.value.open('center')
			MaterialShow.value = true
			await nextTick() 
			await nextTick()
			await nextTick()
			await nextTick()
			await nextTick()
			if (MaterialRef.value) {
			  MaterialRef.value.open() 
			}
		}
	}
	//选择素材弹出框------------------------------------end

	//模板库详情弹出框------------------------------------start
	const moban_info_show = ref(false)
	const moban_info = ref({})
	const mobanform = ref({})

	const mobanSubmit = async () => {
		try {
			// 1. 获取所有自定义字段的key
			const customFields = Object.keys(mobanform.value)
			
			if (customFields.length === 0) {
				uni.showToast({
					title: '没有需要填写的字段',
					icon: 'none',
					duration: 3000
				})
				return
			}
			
			// 2. 验证必填字段（所有字段都验证）
			const missingFields = []
			
			customFields.forEach(field => {
				if (!mobanform.value[field] || mobanform.value[field].toString().trim() === '') {
					// 获取字段的显示名称（如果有的话）
					const fieldInfo = moban_info.value.free_field?.find(item => item.field === field)
					const fieldName = fieldInfo?.name || field
					missingFields.push(fieldName)
				}
			})
			
			if (missingFields.length > 0) {
				uni.showToast({
					title: `请填写完整信息：\n${missingFields.join('、')}`,
					icon: 'none',
					duration: 3000
				})
				return
			}
			
			// 3. 替换模板内容
			let finalContent = moban_info.value.desc
			
			// 使用正则表达式替换所有占位符
			finalContent = finalContent.replace(/{(\w+)}/g, (match, key) => {
				return mobanform.value[key] !== undefined ? mobanform.value[key] : match
			})
			

			// 4. 验证是否所有占位符都被替换
			const hasUnreplacedPlaceholders = /{[^}]+}/.test(finalContent)
			if (hasUnreplacedPlaceholders) {
				// 找出未替换的占位符
				const unreplacedMatches = finalContent.match(/{([^}]+)}/g) || []
				const unreplacedFields = unreplacedMatches.map(match => match.replace(/[{}]/g, ''))
				
				uni.showToast({
					title: `以下字段未填写：${unreplacedFields.join('、')}`,
					icon: 'none'
				})
				return
			}
			
			form.value.desc = finalContent
			moban_info_show.value = false
			
		} catch (error) {
			console.error('提交出错：', error)
			uni.showToast({
				title: '提交失败，请重试',
				icon: 'none'
			})
			throw error
		}
	}


	//模板库详情弹出框------------------------------------end


	//模板库列表弹出框------------------------------------start

	const moban_show = ref(false)
	const MobanListRef = ref(null)	//角色组件
	
	//关闭模板库列表
	const closeMoban = (item) => {
		moban_show.value = false
		moban_info_show.value = true
		moban_info.value = item
		mobanform.value = {}
	}
	
	//打开模版库弹出弹窗
	const openMoban = async () => {
		moban_show.value = true
		await nextTick() 
		await nextTick()
		await nextTick()
		await nextTick()
		await nextTick()
		if (MobanListRef.value) {
			MobanListRef.value.open() 
		}
	}
	//模板库列表弹出框------------------------------------end



	//选择角色弹出框------------------------------------start

	// 存储光标位置
	const cursorPos = ref(0)
	const textareaRef = ref(null)

	// 记录textarea的光标位置
	const onTextareaInput = (e) => {
		cursorPos.value = e.detail.cursor
		descTextNum.value = e.detail.cursor
	}

	const role_show = ref(false)
	const RoleListRef = ref(null)	//角色组件
	const role_name = ref('')	//角色名
	
	//关闭角色
	const closeRole = (name) => {
		role_name.value = name
		role_show.value = false

		const currentText = form.value.desc
		const insertText = `@${name} ` // 用方括号包裹，可根据需要调整格式
		
		if (!currentText) {
			// 如果文本为空，直接赋值
			form.value.desc = insertText
			cursorPos.value = insertText.length
		} else {
			// 在光标位置插入
			const beforeCursor = currentText.slice(0, cursorPos.value)
			const afterCursor = currentText.slice(cursorPos.value)
			
			form.value.desc = beforeCursor + insertText + afterCursor
			
			// 更新光标位置
			cursorPos.value = beforeCursor.length + insertText.length
		}
		
		// 关闭角色弹窗
		role_show.value = false
		
		// 可选：重新聚焦到textarea
		nextTick(() => {
			if (textareaRef.value) {
			// 注意：小程序端可能需要特殊处理聚焦
			// textareaRef.value.focus()
			}
		})
	}
	
	//打开角色弹出弹窗
	const openRole = async () => {
		role_show.value = true
		await nextTick() 
		await nextTick()
		await nextTick()
		await nextTick()
		await nextTick()
		if (RoleListRef.value) {
			RoleListRef.value.open() 
		}
	}
	//选择角色弹出框------------------------------------end
	
	// 模型选择
	const selectModel = (modelKey) => {
		if (!modelConfigs[modelKey]) {
			console.error('Invalid model key:', modelKey)
			return
		}
		
		selectedModel.value = modelKey
		form.value.model = ''
		
		// 更新积分（会自动设置正确的服务端模型名称）
		updatePoints()
	}
	
	// 选择视频时间
	const switchDuration = (time) => {
		// 只更新当前模型的时长选择
		console.log('time',time)
		console.log('selectedModel.value',selectedModel.value)
		console.log('currentDuration',currentDuration.value)
		modelStates.value[selectedModel.value].duration = time
		console.log('modelStates.value[selectedModel.value].duration',modelStates.value[selectedModel.value].duration)
		updatePoints()
	}
	
	// 选择视频比例
	const switchProportion = (name) => {
		// 只更新当前模型的比例选择
		modelStates.value[selectedModel.value].proportion = name
	}
	
	// 选择视频清晰度
	const switchQuality = (quality) => {
		// 只更新当前模型的清晰度选择
		modelStates.value[selectedModel.value].quality = quality
		updatePoints()
	}

	//清空描述词
	const clearDesc = () => {
		form.value.desc = ''
		descTextNum.value = 0
	}
	
	// 打开AI文案
	const openAICopywriting = () => {
		ai_show.value = true
		aiPrompt.value = ''
		aiTheme.value = 'koubo'
		aiModel.value = 'deepseek'
		aiLength.value = 'short'
	}
	
	// 生成AI文案
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
		
		const lengthMap = { 'short': '短篇', 'medium': '中篇', 'long': '长篇' }
		const themeMap = { 'koubo': 'create', 'gaixi': 'rewrite' }
		
		$http.post('Human/textModel', {
			text: aiPrompt.value,
			type: 'copywriting',
			theme: themeMap[aiTheme.value] || 'create',
			model: aiModel.value,
			length: lengthMap[aiLength.value] || '短篇'
		}).then(res => {
			uni.hideLoading()
			if(res.code == 200) {
				form.value.desc = res.data || res.msg
				descTextNum.value = form.value.desc.length
				ai_show.value = false
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
	
	
	//随机描述词
	const randDesc = () => {
		uni.showLoading({
			title: '加载中',
		})
		$http.get('Video/getrandDesc').then(res => {
			form.value.desc = res.data.title
			if(res.data.reference){
				// 处理reference：如果是字符串，按逗号分割成数组
				if (typeof res.data.reference === 'string') {
					// 分割字符串并过滤空值
					form.value.reference = res.data.reference
					.split(',')
					.map(url => url.trim()) // 去除首尾空格
					.filter(url => url !== '') // 过滤空字符串
				} else if (Array.isArray(res.data.reference)) {
					// 如果已经是数组，直接使用
					form.value.reference = res.data.reference
				} else {
					// 其他情况设为空数组
					form.value.reference = []
				}
				// 更新u-upload组件的显示
				// upload.value.lists 需要的是对象数组格式
				if (upload.value) {
					upload.value.lists = form.value.reference.map(url => ({ url }))
				}
			}else{
				form.value.reference = []
				upload.value.lists = []
			}
			uni.hideLoading()
		}).catch(err => {
			uni.hideLoading()
		})
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



	// 插屏广告
	let interstitialAd = null
	const isAdLoading = ref(false);
	const isAdShowing = ref(false);
	const isAnyAdShowing = ref(false);
	const lastAdShowTime = ref(0);
	
	// 初始化插屏广告
	const initInterstitialAd = () => {
	  // #ifdef MP-WEIXIN
	  // 关键修复：每次初始化前先销毁可能存在的旧实例
	  if (interstitialAd) {
	    interstitialAd.destroy();
	    interstitialAd = null;
	  }
	  
	  interstitialAd = wx.createInterstitialAd({
	    adUnitId: WEBCONFIG?.value.mp_chaping
	  })
	  
	  interstitialAd.onLoad(() => {
	    console.log('插屏广告加载成功')
	    isAdLoading.value = false;
	  })
	  
	  interstitialAd.onError((err) => {
	    console.error('插屏广告加载失败', err)
	    isAdLoading.value = false;
	    isAdShowing.value = false;
	    
	    // 错误码1007表示广告正在展示中，强制重置状态
	    if (err.code === 1007) {
	      console.warn('检测到广告状态异常，强制重置')
	      interstitialAd = null;
	      setTimeout(initInterstitialAd, 2000);
	    }
	  })
	  
	  interstitialAd.onClose((res) => {
	    console.log('插屏广告关闭', res)
	    isAdShowing.value = false;
	    isAnyAdShowing.value = false; // 重置全局状态
	    setTimeout(loadAdIfNeeded, 2000);
	  });
	  
	  loadAdIfNeeded();
	  // #endif
	}
	
	// 加载广告（如果需要）
	const loadAdIfNeeded = () => {
	  // 关键修复：增加广告实例有效性检查
	  if (!interstitialAd) {
	    console.log('广告实例不存在，重新初始化')
	    initInterstitialAd();
	    return;
	  }
	  
	  if (!isAdLoading.value && !isAdShowing.value) {
	    isAdLoading.value = true;
	    interstitialAd.load()
	      .then(() => {
	        console.log('广告加载成功');
	        isAdLoading.value = false;
	      })
	      .catch(err => {
	        console.error('广告加载失败:', err);
	        isAdLoading.value = false;
	        // 加载失败后延迟重试
	        setTimeout(loadAdIfNeeded, 3000);
	      });
	  }
	};
	
	
	// 显示广告（如果已加载）
	const showAdIfLoaded = () => {
	  // 关键修复：检查是否有任何广告正在展示（包括激励视频）
	  if (isAnyAdShowing.value) {
	    console.log('有其他广告正在展示，跳过插屏广告');
	    return;
	  }
	
	  if (!interstitialAd) {
	    console.log('广告实例不存在，尝试重新初始化');
	    initInterstitialAd();
	    return;
	  }
	
	  if (isAdShowing.value) {
	    console.log('插屏广告正在显示，跳过本次展示');
	    return;
	  }
	
	  // 尝试显示广告
	  interstitialAd.show().then(() => {
	    console.log('插屏广告显示成功');
	    isAdShowing.value = true;
	    isAnyAdShowing.value = true; // 标记有广告正在展示
	  }).catch(err => {
	    console.error('插屏广告显示失败:', err);
	    isAdShowing.value = false;
	    isAnyAdShowing.value = false; // 重置全局状态
	    if (interstitialAd) {
	      interstitialAd.destroy();
	      interstitialAd = null;
	    }
	  });
	};

	

	onLoad((e) =>{
		const config = WEBCONFIG?.value || '';
		if(config){
			shareData.value.title = config.sys.share_desc
			shareData.value.path = '/pages/index/index?spread='
			shareData.value.query ='/pages/index/index?spread='
			shareData.value.imageUrl = $tool.imgReplace(config.sys.logo) ? $tool.imgReplace(config.sys.logo) : '/static/img/cpimg.png'
		}

		// 确保服务端积分已应用（后备：若 watch 已触发则 nextTick 后直接返回）
		nextTick(() => {
			applyServerPoints()
			updatePoints()
		})

		// 获取 Seedance2.0 价格配置
		fetchSeedancePriceConfig()
		
		// 处理URL参数
		if(e.desc){
			form.value.desc = decodeURIComponent(e.desc || '')
			
			// 处理reference
			if(e.reference){
				let reference = decodeURIComponent(e.reference || '')
				if (typeof reference === 'string') {
					form.value.reference = reference
						.split(',')
						.map(url => url.trim())
						.filter(url => url !== '')
				} else if (Array.isArray(reference)) {
					form.value.reference = reference
				} else {
					form.value.reference = []
				}
			}
			
			// 处理模型参数 - 根据 model 反向推导前端模型选择
			let frontendModelKey = 'sora2-official' // 默认
			if(e.model) {
				const serverModel = decodeURIComponent(e.model || '')
				form.value.model = serverModel
				
				// 根据服务端模型名称推导前端模型key
				if(serverModel.includes('sora-2')) {
					if(serverModel.includes('official')) {
						frontendModelKey = 'sora2-official'
					}
				} else if(serverModel.includes('seedance') || serverModel.includes('Seedance')) {
					frontendModelKey = 'seedance2'
				} else if(serverModel.includes('veo')) {
					frontendModelKey = 'veo3'
				} else if(serverModel.includes('grok')) {
					frontendModelKey = 'grok'
				}
			}
			
			// 设置模型选择状态
			selectedModel.value = frontendModelKey
			
			// 使用 nextTick 确保模型切换完成后再设置其他参数
			nextTick(() => {
				// 处理基础参数，更新到当前模型的独立状态
				if(e.proportion) {
					let proportionValue = decodeURIComponent(e.proportion || '')
					// veo3、seedance2 的 proportion 映射：服务端 "9:16" -> 前端 "portrait"，"16:9" -> 前端 "landscape"
					if(frontendModelKey === 'veo3' || frontendModelKey === 'seedance2') {
						if(proportionValue === '16:9') {
							proportionValue = 'landscape'
						} else if(proportionValue === '9:16') {
							proportionValue = 'portrait'
						}
					}
					modelStates.value[frontendModelKey].proportion = proportionValue
				}
				if(e.duration) {
					modelStates.value[frontendModelKey].duration = parseInt(decodeURIComponent(e.duration || '10'))
				}
				if(e.quality) {
					// 质量参数需要做大小写不敏感匹配（如 "4K" 和 "4k"）
					const qualityValue = decodeURIComponent(e.quality || '').toLowerCase()
					modelStates.value[frontendModelKey].quality = qualityValue
				}

				// 处理 additional 字段
				if(e.additional) {
					try {
						const additional = JSON.parse(decodeURIComponent(e.additional || '{}'))

						// seedance2.0 的 multimodal 模式
						if(additional.multimodal) {
							seedanceRefEnabled.value = true
							setTimeout(() => {
								if(additional.video_url) {
									seedanceRefVideo.value = additional.video_url
								}
								if(additional.audio_url) {
									seedanceRefAudio.value = additional.audio_url
								}
							}, 100)
						}

						// VEO3 的参考图模式
						if(additional.veo_type === 'REFERENCE') {
							modelStates.value['veo3'].veMode = 'REFERENCE'
						} else if(additional.veo_type === 'FIRST&LAST') {
							modelStates.value['veo3'].veMode = 'FIRST&LAST'
						}
					} catch(err) {
						console.log('解析 additional 参数失败:', err)
					}
				}

				// 手动更新积分
				updatePoints()
			})
			
			// 处理上传的参考图片
			if(form.value.reference){
				setTimeout(()=>{
					upload.value.lists = form.value.reference.map(url => ({ url }))
				},1000)
			}
		} else {
			// 没有URL参数，初始化默认模型
			selectModel('sora2-official')
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
	

</script>

<style scoped  lang="scss">
	.infobox{
		font-size: $uni-font-size-base;
		color: $uni-text-color;
	}
	.box{
		padding: 0rpx 40rpx 40rpx 40rpx;
	}
	.moban_popup{
		padding: 40rpx;
		width: 100%;
		height: 100%;
		.dibu{
			padding: 40rpx 0;
		}
		.input_title{
			font-size: 28rpx;
			font-weight: bold;
			color: #363636;
		}
		.input{
			margin-top: 15rpx;
		}
		.title{
			font-size: 32rpx;
			color: #363636;
			margin-top: -15rpx;
		}
		.left{
			width: 45%;
			height: 500rpx;
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			.imgkuang{
				margin: 50rpx 10rpx;
				width: 90%;
				border-radius: 10rpx;
				.tips{
					color: #505050;
					text-align: center;
				}
				.tips1{
					margin-top: 20rpx;
					color: #ff0000;
					text-align: center;
				}
			}
		}
		.right{
			width: 50%;
			position: relative;
			.shiliimg{
				width: 100%;
				z-index: 1;
				font-size: 28rpx;
				color: #fff;
				padding: 15rpx 30rpx;
				background-color: rgba(0,0,0,0.5);
				border-radius: 20rpx 20rpx 0rpx 0rpx;
				position: absolute;
				text-align: center;
				top: 0rpx;
				left: 0rpx;
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
			#2cd2ff 10%,    /* 左侧10%的浅色 */
			#0292ff 30%,   /* 中间80%的深色起始点 */
			#0292ff 70%,   /* 中间80%的深色结束点 */
			#33d3ff 100%   /* 右侧10%的浅色 */
			);
		}
	}
	.card_tips{
		margin-top: 20rpx;
		text-align: center;
		font-size: 24rpx;
		font-weight: bold;
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
			  #ff0000 10%,    /* 左侧10%的浅色 */
			  #b10000 30%,   /* 中间80%的深色起始点 */
			  #b10000 70%,   /* 中间80%的深色结束点 */
			  #ff0000 100%   /* 右侧10%的浅色 */
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
		}
		.neikuang1{
			padding: 0 25rpx;
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			background-color: #333338;
		}
		.tupiankuang{
			margin: 10rpx 10rpx;
			width: 162rpx;
			height: 162rpx;
			border-radius: 10rpx;
			background-color: #464646;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.qingkong{
			position: relative;
			top: -15rpx;
			.qingkong_bnt{
				font-size: 28rpx;
				border-radius: 10rpx;
				color: #afafaf;
				padding: 8rpx 20rpx;
				background-color: #464646;
				opacity: 0.8;
				margin-left: 20rpx;
			}
			.sj_bnt{
				font-size: 28rpx;
				border-radius: 10rpx;
				color: #cecece;
				padding: 8rpx 20rpx;
				background-color: #464646;
				opacity: 0.8;
				margin-right: 20rpx;
			}
		}
		.upimg{
			padding: 30rpx 0;
		}
		.tips{
			font-size: 28rpx;
			color: #ffbb00;
		}
	}
	.bigbnt{
		border-radius: 30rpx;
		color: #fff;
		padding: 30rpx 25rpx;
		background: linear-gradient(130deg,
		  #ff0000 10%,    /* 左侧10%的浅色 */
		  #b10000 30%,   /* 中间80%的深色起始点 */
		  #b10000 70%,   /* 中间80%的深色结束点 */
		  #ff0000 100%   /* 右侧10%的浅色 */
		);
		text-align: center;
		font-size: 32rpx;
	}
	.bnt00{
		font-size: 28rpx;
		border-radius: 20rpx;
		color: #fff;
		padding: 25rpx 20rpx;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
		text-align: center;
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
	.bnt5{
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #afafaf;
		padding: 15rpx 20rpx;
		background-color: #333338;
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
	.bnt6{
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #00d3f8;
		padding: 13rpx 20rpx;
		background-color: #005279;
		border: 2rpx solid #00aaf8;
	}
	.bnt1{
		font-size: 28rpx;
		margin-right: 20rpx;
		border-radius: 10rpx;
		color: #fff;
		padding: 15rpx 20rpx;
		background: linear-gradient(130deg,
		  #ff6b35 10%,
		  #d94521 30%,
		  #d94521 70%,
		  #ff6b35 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.ai-icon-animate{
		display: inline-block;
		animation: starRotate 2s linear infinite;
	}
	
	@keyframes starRotate {
		0% {
			transform: rotate(0deg) scale(1);
		}
		50% {
			transform: rotate(180deg) scale(1.1);
		}
		100% {
			transform: rotate(360deg) scale(1);
		}
	}
	
	// 模型选择盒子 - 虚线框设计
	.model-select-box{
		padding: 30rpx;
		border: 2rpx dashed rgba(255, 255, 255, 0.3);
		border-radius: 20rpx;
		backdrop-filter: blur(10rpx);
		position: relative;
		
		&::before{
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border-radius: 20rpx;
			background: linear-gradient(135deg, 
				rgba(0, 211, 248, 0.05) 0%, 
				rgba(0, 146, 255, 0.03) 100%
			);
			pointer-events: none;
		}
		
		.model-header{
			display: flex;
			align-items: center;
			margin-bottom: 25rpx;
			
			.model-header-text{
				font-size: 30rpx;
				font-weight: bold;
				color: #fff;
				letter-spacing: 1rpx;
			}
		}
		
		.model-grid{
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
		}
		
		.model-btn{
			position: relative;
			font-size: 28rpx;
			border-radius: 10rpx;
			color: #fff;
			padding: 15rpx 30rpx;
			background: linear-gradient(130deg,
				#505050 0%,
				#383838 100%
			);
			transition: all 0.3s;
			
			&:active{
				opacity: 0.8;
				transform: scale(0.98);
			}
		}
		
		.model-btn-active{
			position: relative;
			font-size: 28rpx;
			border-radius: 10rpx;
			color: #fff;
			padding: 15rpx 30rpx;
			background: linear-gradient(130deg,
				#2cd2ff 10%,
				#0292ff 30%,
				#0292ff 70%,
				#33d3ff 100%
			);
			box-shadow: 0 6rpx 20rpx rgba(2, 146, 255, 0.35);
			transition: all 0.3s;
			
			&:active{
				opacity: 0.8;
				transform: scale(0.98);
			}
		}
		
		.model-badge{
			position: absolute;
			top: -6rpx;
			right: -6rpx;
			padding: 4rpx 10rpx;
			background: linear-gradient(135deg, #ffd700, #ffb800);
			color: #333;
			font-size: 20rpx;
			font-weight: bold;
			border-radius: 10rpx;
			line-height: 1;
			box-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.6);
		}
	}
	
	.config-section{
		.section-title{
			font-size: 28rpx;
			color: #afafaf;
			margin-bottom: 10rpx;
		}
	}

	// ========== Veo3 模式 Tab ==========
	.veo-mode-tabs{
		display: flex;
		background: #1a1a1f;
		border-radius: 12rpx;
		padding: 6rpx;
		gap: 6rpx;
	}

	.veo-mode-tab{
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx 10rpx;
		border-radius: 10rpx;
		font-size: 26rpx;
		color: #9ca3af;
		background: transparent;
		transition: all 0.25s;

		&.active{
			background: rgba(0, 211, 248, 0.15);
			color: #00d3f8;
			font-weight: 600;
		}

		&:active{ opacity: 0.8; }
	}

	// Veo3 标题栏内嵌模式 Tab（紧凑版）
	.veo-mode-inline{
		display: flex;
		background: #1e1e24;
		border-radius: 8rpx;
		padding: 3rpx;
		gap: 3rpx;
	}

	// Veo3 标题下方独立一行 Tab 条
	.veo-mode-bar{
		display: flex;
		background: #1e1e24;
		border-radius: 10rpx;
		padding: 4rpx;
		gap: 4rpx;
	}

	.veo-bar-tab{
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 14rpx 10rpx;
		border-radius: 8rpx;
		font-size: 26rpx;
		color: #9ca3af;
		background: transparent;
		transition: all 0.2s;

		&.active{
			background: rgba(0, 211, 248, 0.15);
			color: #00d3f8;
			font-weight: 600;
		}

		&:active{ opacity: 0.8; }
	}

	.veo-inline-tab{
		display: flex;
		align-items: center;
		padding: 6rpx 14rpx;
		border-radius: 6rpx;
		font-size: 24rpx;
		color: #9ca3af;
		background: transparent;
		transition: all 0.2s;
		white-space: nowrap;

		&.active{
			background: rgba(0, 211, 248, 0.15);
			color: #00d3f8;
			font-weight: 600;
		}

		&:active{ opacity: 0.8; }
	}

	// Veo3 文生视频提示
	.veo-text-tip{
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 10rpx;
		font-size: 24rpx;
		color: #9ca3af;
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
				
				&:active{ opacity: 0.8; }
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
				
				&:active{ opacity: 0.8; }
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
			font-weight: bold;
			color: #fff;
			background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
			
			&:active{
				opacity: 0.8;
				transform: scale(0.98);
			}
		}
	}

	// ========== Seedance2 参考视频/音频 ==========
	.seedance-ref-section{
		padding: 20rpx 24rpx;
		border-radius: 12rpx;
		background: rgba(0, 0, 0, 0.2);
		border: 2rpx dashed rgba(255, 255, 255, 0.12);
	}

	.seedance-ref-header{
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
	}

	.seedance-ref-title{
		font-size: 26rpx;
		color: #dfdfdf;
		font-weight: 600;
	}

	.seedance-ref-hint{
		font-size: 24rpx;
		color: #9ca3af;
		margin-right: 8rpx;
	}

	.ref-media-box{
		padding: 20rpx;
		border-radius: 10rpx;
		background: rgba(0, 0, 0, 0.15);
	}

	.ref-media-item{
		background: #2a2a35;
		border-radius: 10rpx;
		padding: 16rpx 20rpx;
	}

	.ref-media-icon{
		width: 56rpx;
		height: 56rpx;
		background: rgba(0, 211, 248, 0.12);
		border-radius: 10rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ref-media-name{
		font-size: 26rpx;
		color: #fff;
		font-weight: 600;
	}

	.ref-media-tip{
		font-size: 22rpx;
		color: #9ca3af;
		margin-left: 6rpx;
	}

	.ref-media-success{
		font-size: 22rpx;
		color: #4ade80;
		margin-left: 6rpx;
	}

	.ref-media-upload-btn{
		font-size: 22rpx;
		color: #00d3f8;
		padding: 8rpx 16rpx;
		border-radius: 6rpx;
		background: rgba(0, 211, 248, 0.1);
		border: 2rpx solid rgba(0, 211, 248, 0.3);
		flex-shrink: 0;
	}

	.ref-media-tips{
		font-size: 22rpx;
		color: #9ca3af;
		padding: 10rpx 14rpx;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 6rpx;
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
	
</style>
