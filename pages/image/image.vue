<template>
	<view class="infobox">
		<view class="box m_top_20">

			<!-- 生图模型 -->
			<view class="model-select-box">
				<view class="model-header">
					<uni-icons type="apps" size="16" color="#a78bfa" style="margin-right: 10rpx;"></uni-icons>
					<text class="model-header-text">选择模型</text>
				</view>
				<!-- 展开下拉 -->
				<view class="custom-select" @click="toggleModelDropdown">
					<view class="select-trigger acea-row row-between-wrapper">
						<view class="acea-row row-middle">
							<view class="model-icon-bg acea-row row-center">
								<text>{{ selectedModelOption?.icon || '🎨' }}</text>
							</view>
							<view class="model-info">
								<text class="model-name">{{ selectedModelOption?.name || '请选择模型' }}</text>
								<text class="model-desc">{{ selectedModelOption?.desc || '' }}</text>
							</view>
						</view>
						<uni-icons :type="showModelDropdown ? 'up' : 'down'" size="14" color="#9ca3af"></uni-icons>
					</view>
					<!-- 下拉列表 -->
					<view v-if="showModelDropdown" class="select-dropdown">
						<view
							v-for="model in modelOptions"
							:key="model.value"
							class="dropdown-item acea-row row-middle"
							:class="{ 'active': selectedModel == model.value }"
							@click.stop="doSelectModel(model)"
						>
							<text class="item-icon">{{ model.icon }}</text>
							<view class="item-content">
								<view class="acea-row row-middle">
									<text class="item-name">{{ model.name }}</text>
									<text v-if="model.tag" class="item-tag">{{ model.tag }}</text>
								</view>
								<text class="item-desc">{{ model.desc }}</text>
							</view>
							<uni-icons v-if="selectedModel == model.value" type="checkmarkempty" size="18" color="#a78bfa"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<!-- 参考图片 -->
			<view class="card m_top_30">
				<view class="acea-row row-between-wrapper">
					<view class="acea-row row-middle">
						<view class="title_bnt" style="background: linear-gradient(130deg, #f59e0b 10%, #d97706 30%, #b45309 100%);">第二步</view>
						<view class="desc">参考图片</view>
					</view>
					<view class="tips">可选，最多5张</view>
				</view>
				<!-- 已上传图片 -->
				<view class="upload-grid acea-row row-middle m_top_20">
					<view
						v-for="(img, index) in referenceImages"
						:key="index"
						class="img-item"
					>
						<image :src="img.url" mode="aspectFill" class="preview-img" @click="previewReferenceImage(img.url)"></image>
						<view class="img-overlay acea-row row-center">
							<view class="delete-btn acea-row row-center" @click.stop="removeImage(index)">
								<uni-icons type="close" size="14" color="#fff"></uni-icons>
							</view>
						</view>
						<view class="img-index acea-row row-center">{{ index + 1 }}</view>
					</view>
					<!-- 上传按钮 -->
					<view v-if="referenceImages && referenceImages.length < 5" class="upload-item acea-row row-center" @click="chooseImage">
						<view v-if="!uploadLoading" class="acea-row row-center-wrapper">
							<uni-icons type="plus" size="28" color="#a78bfa"></uni-icons>
							<text class="upload-text">上传图片</text>
						</view>
						<view v-else class="acea-row row-center-wrapper">
							<view class="loading-spinner-sm"></view>
							<text style="margin-left: 8rpx; font-size: 22rpx; color: #9ca3af;">上传中</text>
						</view>
					</view>
				</view>
				<view class="upload-tips acea-row row-middle">
					<uni-icons type="info" size="12" color="#a78bfa" style="margin-right: 6rpx;"></uni-icons>
					<text>支持JPG/PNG格式，单张≤5MB，最多5张</text>
				</view>
			</view>

			<!-- 填写提示词 -->
			<view class="card m_top_30">
				<view class="acea-row row-between-wrapper">
					<view class="acea-row row-middle">
						<view class="title_bnt" style="background: linear-gradient(130deg, #a78bfa 10%, #7c3aed 30%, #6d28d9 100%);">第三步</view>
						<view class="desc">填写描述词</view>
					</view>
					<view>{{ descTextNum }}/{{ WEBCONFIG?.api.miaoshu_max || 500 }}</view>
				</view>
				<view class="neikuang m_top_30">
					<textarea
						v-model="formDesc"
						:maxlength="WEBCONFIG?.api.miaoshu_max || 500"
						placeholder="请详细描述你想创作图片的场景、风格、色调等!"
						placeholder-class="textarea-placeholder"
						style="padding: 20rpx 30rpx;font-size: 28rpx;width: 92%;height: 120rpx;color: #fff;"
					/>
					<view class="textarea-actions acea-row row-between-wrapper">
						<view class="action-btns acea-row row-middle">
							<view class="action-btn-purple" @click="translateToEnglish">
								<uni-icons type="reload" size="13" color="#a78bfa" style="margin-right: 4rpx;"></uni-icons>
								翻译英文
							</view>
							<view class="action-btn-gray" @click="clearDesc">
								<uni-icons type="trash" size="13" color="#9ca3af" style="margin-right: 4rpx;"></uni-icons>
								清空
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 画面比例 -->
			<view class="card m_top_30">
				<view class="section-header">
					<text class="section-title">画面比例</text>
				</view>
				<view class="aspect-grid acea-row row-middle">
					<view
						v-for="ratio in availableAspectRatios"
						:key="ratio"
						class="aspect-btn"
						:class="{ 'active': selectedProportion == ratio }"
						@click="selectedProportion = ratio"
					>
						<view class="aspect-shape" :class="'shape-' + ratio.replace(':', '_')"></view>
						<text>{{ ratio }}</text>
					</view>
				</view>
			</view>

			<!-- 分辨率 -->
			<view class="card m_top_30" v-if="showResolution">
				<view class="section-header">
					<text class="section-title">分辨率</text>
				</view>
				<view class="resolution-grid acea-row row-middle">
					<view
						v-for="res in availableResolutions"
						:key="res.value"
						class="resolution-btn"
						:class="{ 'active': selectedSize == res.value, 'premium': res.premium }"
						@click="selectedSize = res.value"
					>
						<text class="res-label">{{ res.label }}</text>
						<text class="res-size">{{ res.size }}</text>
						<text v-if="res.premium" class="premium-badge">PRO</text>
					</view>
				</view>
			</view>

			<!-- 生成按钮 -->
			<view class="generate-btn m_top_30 acea-row row-center" @click="handleGenerate">
				<view v-if="generateLoading" class="acea-row row-middle">
					<view class="loading-icon"></view>
					<text style="margin-left: 10rpx;">生成中...</text>
				</view>
				<view v-else class="acea-row row-middle">
					<uni-icons type="image" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
					<text>开始生成</text>
					<view class="points-tag" v-if="selectedModelOption">{{ selectedModelOption.points || 0 }}积分</view>
				</view>
			</view>

		</view>

		<!-- 积分不足弹窗 -->
		<u-popup v-model="buy_show" mode="bottom" border-radius="20" :closeable="true" z-index="1001">
			<view class="buy_popup">
				<view class="popup-title">积分不足</view>
				<view class="popup-desc">当前积分不足，需要 {{ selectedModelOption?.points || 0 }} 积分才能生成</view>
				<view class="popup-btn" @click="$page.open('/pages/pay/buyPoints',true)">去充值</view>
			</view>
		</u-popup>

	</view>
</template>

<script setup>
	import { ref, computed, watch } from 'vue';
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'

	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const storage = useCache()

	// ========== 模型相关 ==========
	const showModelDropdown = ref(false)
	const selectedModel = ref('')
	const modelOptions = ref([])
	const modelIcons = ['🎨', '✨', '💎', '🌟', '⚡', '🔮', '🎭', '🌈', '🚀', '💫']

	const selectedModelOption = computed(() => {
		return modelOptions.value.find(m => m.value === selectedModel.value) || null
	})

	const availableResolutions = computed(() => {
		if (!selectedModelOption.value) return resolutions
		const name = selectedModelOption.value.name || ''
		// Seedream-5.0-lite 专属分辨率
		if (name.includes('Seedream-5.0-lite')) {
			return seedreamResolutions
		}
		return resolutions
	})

	// 是否隐藏分辨率（gpt-image2 不需要分辨率）
	const showResolution = computed(() => {
		if (!selectedModelOption.value) return true
		return !selectedModelOption.value.name.includes('gpt-image2')
	})

	// gpt-image2 专属比例
	const gptImage2Ratios = ['1:1', '3:2', '2:3', 'auto']

	const aspectRatiosDefault = ['1:1', '3:4', '4:3', '9:16', '16:9']

	const availableAspectRatios = computed(() => {
		if (!selectedModelOption.value) return aspectRatiosDefault
		const name = selectedModelOption.value.name || ''
		if (name.includes('gpt-image2')) {
			return gptImage2Ratios
		}
		return aspectRatiosDefault
	})

	const resolutions = [
		{ label: '1K', value: '1k', size: '1024×1024', premium: false },
		{ label: '2K', value: '2k', size: '2048×2048', premium: false },
		{ label: '4K', value: '4k', size: '4096×4096', premium: true }
	]
	const seedreamResolutions = [
		{ label: '2K', value: '2k', size: '2048×2048', premium: false },
		{ label: '3K', value: '3k', size: '3072×3072', premium: true }
	]

	const toggleModelDropdown = () => {
		showModelDropdown.value = !showModelDropdown.value
	}

	const doSelectModel = (model) => {
		selectedModel.value = model.value
		showModelDropdown.value = false
		// 校验分辨率是否在当前模型可用范围内
		const validSizes = availableResolutions.value.map(r => r.value)
		if (!validSizes.includes(selectedSize.value)) {
			selectedSize.value = validSizes[0]
		}
		// 校验比例是否在当前模型可用范围内
		if (!availableAspectRatios.value.includes(selectedProportion.value)) {
			selectedProportion.value = availableAspectRatios.value[0]
		}
	}

	const initModelOptions = (imageModels) => {
		if (!imageModels || !Array.isArray(imageModels) || imageModels.length === 0) return
		modelOptions.value = imageModels.map((model, index) => {
			let tag = ''
			if (model.desc && model.desc.includes('4K')) tag = '4K'
			return {
				value: model.name, // 使用 name 作为提交值
				name: model.name,
				model_name: model.model_name, // 保留 model_name 用于内部匹配
				desc: model.desc || '高质量图像生成',
				icon: modelIcons[index % modelIcons.length],
				tag,
				points: model.points,
				type: model.type,
				url: model.url
			}
		})
		// 默认选中第一个
		if (!selectedModel.value && modelOptions.value.length > 0) {
			selectedModel.value = modelOptions.value[0].value
		}
	}

	// ========== 参考图片 ==========
	const referenceImages = ref([])
	const uploadLoading = ref(false)
	const fileInputRef = ref(null)

	const chooseImage = () => {
		if (uploadLoading.value) return
		const maxCount = 5 - referenceImages.value.length
		if (maxCount <= 0) {
			uni.showToast({ title: '最多只能上传5张图片', icon: 'none' })
			return
		}
		uni.chooseImage({
			count: maxCount,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				await uploadImages(res.tempFilePaths)
			}
		})
	}

	const uploadImages = async (tempFilePaths) => {
		if (!tempFilePaths || tempFilePaths.length === 0) return
		uploadLoading.value = true
		try {
			for (const filePath of tempFilePaths) {
				const info = await uni.getImageInfo({ src: filePath })
				// 简单文件大小估算（实际以服务端返回为准）
				const uploadRes = await $http.upload('Upload/upload', {
					name: 'file',
					filePath
				})
				if (uploadRes.code == 200) {
					const imageUrl = $tool.imgReplace(uploadRes.src)
					referenceImages.value.push({ url: imageUrl })
					uni.showToast({ title: '上传成功', icon: 'success' })
				} else {
					uni.showToast({ title: uploadRes.msg || '上传失败', icon: 'none' })
				}
			}
		} catch (err) {
			uni.showToast({ title: '上传失败，请重试', icon: 'none' })
		} finally {
			uploadLoading.value = false
		}
	}

	const removeImage = (index) => {
		referenceImages.value.splice(index, 1)
	}

	// ========== 参考图预览（系统原生，支持缩放） ==========
	const previewReferenceImage = (url) => {
		$tool.previewImage(url)
	}

	// ========== 提示词 ==========
	const form = ref({
		desc: ''
	})
	const formDesc = computed({
		get: () => form.value.desc,
		set: (v) => { form.value.desc = v }
	})
	const descTextNum = computed(() => (form.value.desc || '').length)
	const selectedProportion = ref('1:1')
	const selectedSize = ref('2k')

	const clearDesc = () => {
		form.value.desc = ''
	}

	const translateToEnglish = () => {
		if (!form.value.desc.trim()) {
			uni.showToast({ title: '请先输入提示词', icon: 'none' })
			return
		}
		uni.showLoading({ title: '翻译中...', mask: true })
		$http.post('Human/textModel', {
			text: form.value.desc.trim(),
			type: 'translate',
			language: '英文'
		}).then(res => {
			uni.hideLoading()
			if (res.code == 200) {
				form.value.desc = res.data.text || res.data
				uni.showToast({ title: res.msg || '翻译成功', icon: 'success' })
			} else {
				uni.showToast({ title: res.msg || '翻译失败', icon: 'none' })
			}
		}).catch(() => {
			uni.hideLoading()
			uni.showToast({ title: '翻译失败', icon: 'none' })
		})
	}

	// ========== 生成 ==========
	const generateLoading = ref(false)
	const buy_show = ref(false)

	const handleGenerate = async () => {
		if (!form.value.desc.trim()) {
			uni.showToast({ title: '请输入描述词', icon: 'none' })
			return
		}
		if (!selectedModel.value) {
			uni.showToast({ title: '请选择生图模型', icon: 'none' })
			return
		}

		const userInfo = USERINFO.value?.userInfo
		if (!userInfo?.id) {
			uni.showToast({ title: '请先登录', icon: 'none' })
			$page.open('/pages/login/login')
			return
		}

		generateLoading.value = true

		const params = {
			prompt: form.value.desc.trim(),
			model: selectedModel.value,
			size: selectedSize.value,
			proportion: selectedProportion.value,
		}
		if (referenceImages.value.length > 0) {
			params.images = referenceImages.value.map(img => img.url)
		}

		try {
			const res = await $http.post('Image/generateImage', params)

			if (res.code == 200) {
				uni.showModal({
					title: '温馨提示',
					content: res.msg || '图片生成中，请稍后前往作品列表查看',
					confirmText: '查看作品',
					cancelText: '留在此页',
					success: (modal) => {
						if (modal.confirm) {
							$page.switch('/pages/videolist/videolist?type=3')
						}
					}
				})
			} else if (res.msg === '积分不足') {
				buy_show.value = true
			} else {
				uni.showToast({ title: res.msg || '生成失败', icon: 'none' })
			}
		} catch (err) {
			uni.showToast({ title: '网络错误，请重试', icon: 'none' })
		} finally {
			generateLoading.value = false
		}
	}

	// ========== pendingParams 暂存 ==========
	// 重做时从 URL 暂存的参数（等模型列表加载完再匹配）
	const pendingParams = ref({})

	// 根据 name 匹配并应用重做参数
	const applyPendingParams = () => {
		const p = pendingParams.value
		if (!p.model && !p.proportion && !p.size) return
		if (modelOptions.value.length === 0) return

		if (p.model) {
			// 优先用 name 匹配
			const matched = modelOptions.value.find(m => m.value === p.model)
			if (matched) {
				selectedModel.value = matched.value
			}
		}
		if (p.proportion && availableAspectRatios.value.includes(p.proportion)) {
			selectedProportion.value = p.proportion
		}
		if (p.size) {
			const found = availableResolutions.value.find(r => r.value === p.size)
			if (found) {
				selectedSize.value = p.size
			}
		}
	}

	// ========== 页面加载 ==========
	onLoad((e) => {
		pendingParams.value = {}
		if (!e) return
		if (e.desc) {
			form.value.desc = decodeURIComponent(e.desc || '')
		}
		if (e.reference) {
			let refList = []
			if (Array.isArray(e.reference)) {
				refList = e.reference
			} else {
				const decoded = decodeURIComponent(e.reference || '')
				try { refList = JSON.parse(decoded) } catch { refList = [decoded] }
			}
			if (refList.length) {
				referenceImages.value = refList.map(url => ({ url: $tool.imgReplace(url) }))
			}
		}
		if (e.model)       pendingParams.value.model      = decodeURIComponent(e.model || '')
		if (e.proportion)  pendingParams.value.proportion = decodeURIComponent(e.proportion || '')
		if (e.size)        pendingParams.value.size      = decodeURIComponent(e.size || '')

		if (WEBCONFIG.value?.model?.image_model) {
			initModelOptions(WEBCONFIG.value.model.image_model)
			applyPendingParams()
		}
	})

	// 监听 WEBCONFIG，加载模型列表
	watch(() => WEBCONFIG.value, (newVal) => {
		if (newVal?.model?.image_model) {
			initModelOptions(newVal.model.image_model)
		}
	}, { immediate: true })

	// 监听模型列表加载完成 → 此时才应用 pendingParams
	watch(modelOptions, (newVal) => {
		if (newVal.length > 0) {
			applyPendingParams()
			pendingParams.value = {}
		}
	})

	// 在页面显示时关闭下拉
	onShow(() => {
		showModelDropdown.value = false
	})
</script>

<style lang="scss" scoped>
	.box {
		padding: 0rpx 40rpx 40rpx 40rpx;
	}

	// ========== 模型选择 ==========
	.model-select-box {
		padding: 30rpx;
		border: 2rpx dashed rgba(167, 139, 250, 0.4);
		border-radius: 20rpx;
		background: linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(124, 58, 237, 0.03) 100%);

		.model-header {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			.model-header-text {
				font-size: 30rpx;
				font-weight: bold;
				color: #fff;
			}
		}
	}

	.custom-select {
		position: relative;
	}

	.select-trigger {
		padding: 20rpx 24rpx;
		background: #2d2d3a;
		border: 2rpx solid #444449;
		border-radius: 14rpx;
	}

	.model-icon-bg {
		width: 72rpx;
		height: 72rpx;
		background: rgba(167, 139, 250, 0.2);
		border-radius: 16rpx;
		font-size: 36rpx;
		flex-shrink: 0;
	}

	.model-info {
		margin-left: 16rpx;
		flex: 1;

		.model-name {
			font-size: 30rpx;
			font-weight: bold;
			color: #fff;
			display: block;
		}

		.model-desc {
			font-size: 22rpx;
			color: #9ca3af;
			display: block;
			margin-top: 4rpx;
		}
	}

	.select-dropdown {
		position: absolute;
		top: calc(100% + 8rpx);
		left: 0;
		right: 0;
		background: #1e1e28;
		border: 2rpx solid #444449;
		border-radius: 14rpx;
		z-index: 999;
		overflow: hidden;
	}

	.dropdown-item {
		padding: 20rpx 24rpx;
		border-bottom: 1rpx solid rgba(68, 68, 73, 0.5);

		&:last-child {
			border-bottom: none;
		}

		&.active {
			background: rgba(167, 139, 250, 0.12);

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				bottom: 0;
				width: 4rpx;
				background: #a78bfa;
			}
		}
	}

	.item-icon {
		font-size: 36rpx;
		margin-right: 16rpx;
	}

	.item-content {
		flex: 1;

		.item-name {
			font-size: 28rpx;
			font-weight: 600;
			color: #fff;
		}

		.item-desc {
			font-size: 22rpx;
			color: #9ca3af;
			margin-top: 4rpx;
		}
	}

	.item-tag {
		margin-left: 10rpx;
		padding: 2rpx 12rpx;
		background: linear-gradient(135deg, #a78bfa, #7c3aed);
		border-radius: 20rpx;
		font-size: 18rpx;
		color: #fff;
	}

	// ========== 通用卡片 ==========
	.card {
		font-size: 28rpx;
		border-radius: 20rpx;
		background-color: #232327;
		border: 2rpx solid #333338;
		padding: 30rpx 30rpx;

		.title_bnt {
			font-size: 30rpx;
			font-weight: bold;
			border-radius: 10rpx;
			color: #fff;
			padding: 12rpx 24rpx;
		}

		.desc {
			font-size: 28rpx;
			color: #dfdfdf;
			margin-left: 16rpx;
		}

		.m_left_20 {
			margin-left: 20rpx;
		}

		.neikuang {
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
			background-color: #333338;
		}
	}

	.tips {
		font-size: 24rpx;
		color: #9ca3af;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #e5e7eb;
	}

	// ========== 参考图片 ==========
	.upload-grid {
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.img-item {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		overflow: hidden;
		border: 2rpx solid #444449;

		.preview-img {
			width: 100%;
			height: 100%;
		}

		.img-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			opacity: 0;
			transition: opacity 0.3s;

			&:active {
				opacity: 1;
			}
		}

		&:active .img-overlay {
			opacity: 1;
		}

		.delete-btn {
			width: 40rpx;
			height: 40rpx;
			background: rgba(239, 68, 68, 0.9);
			border-radius: 50%;
		}

		.img-index {
			position: absolute;
			top: 4rpx;
			left: 4rpx;
			width: 32rpx;
			height: 32rpx;
			background: linear-gradient(135deg, #a78bfa, #7c3aed);
			border-radius: 50%;
			font-size: 20rpx;
			color: #fff;
			font-weight: bold;
		}
	}

	.upload-item {
		width: 120rpx;
		height: 120rpx;
		border: 2rpx dashed #444449;
		border-radius: 12rpx;
		background: #2d2d3a;
		flex-shrink: 0;

		&:active {
			border-color: #a78bfa;
			background: rgba(167, 139, 250, 0.05);
		}

		.upload-text {
			font-size: 22rpx;
			color: #9ca3af;
			margin-top: 6rpx;
		}
	}

	.upload-tips {
		margin-top: 16rpx;
		padding: 10rpx 16rpx;
		background: rgba(167, 139, 250, 0.08);
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #9ca3af;
	}

	// ========== 提示词 ==========
	.textarea-placeholder {
		color: #9ca3af;
	}

	.neikuang {
		textarea[placeholder] {
			color: #fff !important;
		}
	}

	.textarea-actions {
		padding: 20rpx;

		.action-btns {
			gap: 12rpx;
		}
	}

	.action-btn-purple {
		display: flex;
		align-items: center;
		padding: 8rpx 20rpx;
		background: rgba(167, 139, 250, 0.15);
		border: 1rpx solid rgba(167, 139, 250, 0.5);
		border-radius: 8rpx;
		color: #a78bfa;
		font-size: 24rpx;
	}

	.action-btn-gray {
		display: flex;
		align-items: center;
		padding: 8rpx 20rpx;
		background: #2d2d3a;
		border: 1rpx solid #444449;
		border-radius: 8rpx;
		color: #9ca3af;
		font-size: 24rpx;
	}

	// ========== 画面比例 ==========
	.aspect-grid {
		gap: 16rpx;
		flex-wrap: wrap;
	}

	.aspect-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		padding: 14rpx 20rpx;
		background: #2d2d3a;
		border: 2rpx solid #444449;
		border-radius: 10rpx;
		color: #e5e7eb;
		font-size: 22rpx;
		flex: 1;
		min-width: 100rpx;
		transition: all 0.3s;

		.aspect-shape {
			background: #6b7280;
			border-radius: 4rpx;
			opacity: 0.6;
		}

		&.active {
			background: rgba(167, 139, 250, 0.15);
			border-color: #a78bfa;
			color: #a78bfa;

			.aspect-shape {
				background: #a78bfa;
				opacity: 1;
			}
		}
	}

	.shape-1_1 { width: 32rpx; height: 32rpx; }
	.shape-3_4 { width: 24rpx; height: 32rpx; }
	.shape-4_3 { width: 32rpx; height: 24rpx; }
	.shape-9_16 { width: 22rpx; height: 40rpx; }
	.shape-16_9 { width: 40rpx; height: 22rpx; }
	.shape-3_2 { width: 36rpx; height: 24rpx; }
	.shape-2_3 { width: 24rpx; height: 36rpx; }
	.shape-auto {
		width: 32rpx;
		height: 32rpx;
		background: #6b7280;
		border-radius: 4rpx;
		opacity: 0.6;
		position: relative;
		overflow: hidden;

		&::before {
			content: 'A';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 18rpx;
			color: #fff;
			font-weight: bold;
		}
	}

	// ========== 分辨率 ==========
	.resolution-grid {
		gap: 16rpx;
	}

	.resolution-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6rpx;
		padding: 16rpx 12rpx;
		background: #2d2d3a;
		border: 2rpx solid #444449;
		border-radius: 14rpx;
		position: relative;
		transition: all 0.3s;

		&.active {
			background: rgba(167, 139, 250, 0.15);
			border-color: #a78bfa;
		}

		&.premium {
			border-color: rgba(245, 158, 11, 0.4);
		}

		&.active.premium {
			border-color: #a78bfa;
		}
	}

	.res-label {
		font-size: 30rpx;
		font-weight: bold;
		color: #fff;
	}

	.resolution-btn.active .res-label {
		color: #a78bfa;
	}

	.res-size {
		font-size: 20rpx;
		color: #9ca3af;
	}

	.premium-badge {
		position: absolute;
		top: 4rpx;
		right: 4rpx;
		padding: 2rpx 10rpx;
		background: linear-gradient(135deg, #f59e0b, #d97706);
		border-radius: 20rpx;
		font-size: 16rpx;
		color: #fff;
		font-weight: bold;
	}

	// ========== 生成按钮 ==========
	.generate-btn {
		border-radius: 30rpx;
		color: #fff;
		padding: 30rpx;
		background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%);
		font-size: 32rpx;
		font-weight: bold;

		&:active {
			opacity: 0.9;
			transform: scale(0.98);
		}

		.points-tag {
			margin-left: 16rpx;
			font-size: 24rpx;
			background: rgba(0, 0, 0, 0.3);
			padding: 5rpx 16rpx;
			border-radius: 20rpx;
		}
	}

	// ========== 积分弹窗 ==========
	.buy_popup {
		padding: 60rpx 40rpx;

		.popup-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
			text-align: center;
			margin-bottom: 20rpx;
		}

		.popup-desc {
			font-size: 28rpx;
			color: #666;
			text-align: center;
			margin-bottom: 40rpx;
		}

		.popup-btn {
			height: 90rpx;
			line-height: 90rpx;
			text-align: center;
			background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
			border-radius: 45rpx;
			color: #fff;
			font-size: 32rpx;
			font-weight: bold;
		}
	}

	// ========== 加载动画 ==========
	.loading-icon {
		width: 36rpx;
		height: 36rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-icon-sm {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid rgba(167, 139, 250, 0.3);
		border-top-color: #a78bfa;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-icon-lg {
		width: 56rpx;
		height: 56rpx;
		border: 4rpx solid rgba(167, 139, 250, 0.3);
		border-top-color: #a78bfa;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-spinner-sm {
		width: 28rpx;
		height: 28rpx;
		border: 3rpx solid rgba(167, 139, 250, 0.3);
		border-top-color: #a78bfa;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-spinner-xs {
		width: 20rpx;
		height: 20rpx;
		border: 2rpx solid rgba(245, 158, 11, 0.3);
		border-top-color: #f59e0b;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
