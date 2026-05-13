<template>
	<view class="infobox">
		<view class="top_bj">
			<image :src="$tool.imgReplace(WEBCONFIG?.sys.topimg) ? $tool.imgReplace(WEBCONFIG?.sys.topimg) : '/static/img/top.png'" class="img" mode="widthFix"></image>
		</view>
		<view class="box m_top_20">
			<!-- 发光Banner入口 -->
			<view class="image-banner m_bottom_20" @click="golink(homeButtons[0]?.url || '/pages/image/image')">
				<view class="banner-glow"></view>
				<view class="banner-particle p1"></view>
				<view class="banner-particle p2"></view>
				<view class="banner-particle p3"></view>
				<view class="banner-content acea-row row-middle">
					<view class="banner-icon-wrap">
						<view class="banner-icon">
							<uni-icons type="image" size="28" color="#fff"></uni-icons>
						</view>
						<view class="banner-icon-ring"></view>
					</view>
					<view class="banner-text">
						<view class="banner-title">{{ homeButtons[0]?.title || 'AI制图' }}</view>
						<view class="banner-subtitle">{{ homeButtons[0]?.desc || '输入描述词 · 一键生成精美图片' }}</view>
					</view>
				</view>
				<view class="banner-arrow">
					<uni-icons type="right" size="20" color="#fff"></uni-icons>
				</view>
			</view>

			<view class="acea-row row-between-wrapper m_top_40">
				<view class="card_left" @click="golink(homeButtons[1]?.url || '/pages/sora/sora')">
					<image src="/static/img/jqr.png" class="card_bg_img" mode="widthFix"></image>
					<view class="bard_title">{{ homeButtons[1]?.title || '视频生成' }}</view>
					<view class="bard_desc">{{ homeButtons[1]?.desc || '一句话生成视频' }}</view>
				</view>
				<view class="card_right" @click="golink(homeButtons[2]?.url || '/pages/human/human')">
					<image src="/static/img/szr.png" class="card_bg_img" mode="widthFix"></image>
					<view class="bard_title">{{ homeButtons[2]?.title || 'AI数字人' }}</view>
					<view class="bard_desc">{{ homeButtons[2]?.desc || '您的AI专属数字人' }}</view>
				</view>
			</view>
			
			<view v-if="WEBCONFIG?.api.guangchang_kg == 1">
				<view v-if="total" class="m_top_10">
					<view class="acea-row row-between-wrapper" >
						<view class="list_gc" v-for="(item,index) in dataList" :key="index">
							<view class="video-card">
								<!-- 类型标识：图片/视频 -->
								<view :class="['type-badge', item.type === 'image' ? 'type-badge--image' : 'type-badge--video']">
									<uni-icons :type="item.type === 'image' ? 'image' : 'videocam'" size="14" color="#fff"></uni-icons>
									<text class="type-text">{{ item.type === 'image' ? '图片' : '视频' }}</text>
								</view>
								<!-- 模型标识（仅视频显示） -->
								<!-- 已删除 -->
								
								<image :src="item.url ? $tool.imgReplace(item.img)  || $tool.imgReplace(item.loacl_url) || $tool.imgReplace(item.url) : '/static/img/300-200.png'" mode="aspectFill" class="img" @click="goinfo(item.id)"></image>
								<view class="bnt_kuang">
									<!-- 图片类型：只显示做同款 -->
									<block v-if="item.type === 'image'">
										<view class="k_bnt1 acea-row row-middle" @click="openSheet(item, index)"><uni-icons type="refresh" size="16" color="#e7e7e7" style="margin-right: 5rpx;"></uni-icons>做同款</view>
									</block>
									<!-- 视频类型：显示预览和做同款 -->
									<block v-else>
										<view class="k_bnt1 acea-row row-middle" @click="pay(item.url)"><uni-icons type="videocam" size="16" color="#e7e7e7" style="margin-right: 5rpx;"></uni-icons>预览</view>
										<view class="k_bnt1 acea-row row-middle" @click="openSheet(item, index)" style="margin-left: 20rpx;"><uni-icons type="refresh" size="16" color="#e7e7e7" style="margin-right: 5rpx;"></uni-icons>做同款</view>
									</block>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view v-else class="m_top_40">
					<u-empty text="暂无数据" mode="list" iconColor="#484a4d"></u-empty>
				</view>
				<!-- 做同款操作面板 -->
				<u-popup v-model="imgSheetVisible" mode="bottom" :round="24" :border-radius="24" z-index="999" :mask-close-able="true" @close="imgSheetVisible = false">
					<view class="img_sheet">
						<view class="img_sheet_handle acea-row row-center">
							<view class="handle_bar"></view>
						</view>
						<view class="img_sheet_preview" v-if="activeImgItem" @click="sheetPreviewImg">
							<image :src="activeImgItem.url ? $tool.imgReplace(activeImgItem.url) : (activeImgItem.img ? $tool.imgReplace(activeImgItem.img) : '/static/img/300-200.png')" mode="aspectFit" class="sheet_preview_img"></image>
						</view>
						<view class="img_sheet_actions acea-row" v-if="activeImgItem">
							<view class="sheet_action_item" @click="doSheetRedo">
								<view class="sheet_action_circle sheet_act_redo">
									<uni-icons type="refresh" size="24" color="#3b82f6"></uni-icons>
								</view>
								<text class="sheet_action_label">做同款</text>
							</view>
							<view class="sheet_action_item" @click="doSheetDown">
								<view class="sheet_action_circle sheet_act_down">
									<uni-icons type="cloud-download" size="24" color="#10b981"></uni-icons>
								</view>
								<text class="sheet_action_label">下载</text>
							</view>
						</view>
						<view style="height: 200rpx;"></view>
					</view>
				</u-popup>
				<view class="m_top_40">
					<u-loadmore :status="status" :load-text="loadText"/>
				</view>	
			</view>
			
			
			<view style="height: 200rpx;"></view>
		</view>
		

		<uni-popup ref="VideoShowRef" type="center" border-radius="20rpx" background-color="#fff">
			<view class="video_kuang">
				<video id="myVideo" 
				:src="video_url"
				@error="videoErrorCallback" 
				:style="{ height: '800rpx' }"
				controls>
				</video>
			</view>
		</uni-popup>
		<!-- 自定义导航 -->
		<CustomTabBar></CustomTabBar>
	</view>
</template>

<script setup>
	import { ref,getCurrentInstance,nextTick,onMounted,onUnmounted   } from 'vue';
	import { onLoad,onShow,onShareAppMessage, onShareTimeline,onReady, onReachBottom} from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	// #ifdef H5
	import { useUrlParams } from '@/utils/useUrlParams'
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
	const keyword = ref('')
	// v-model绑定的这个变量不要在分页请求结束中自己赋值，直接使用即可
	const query = ref({
		page: 1,
		pageSize: 10,
		where:[],
		prop:'id desc'
	})
	//数据加载
	const dataList = ref([])
	const status = ref('loadmore')
	const loadText = ref(
		{
			loadmore: '上拉加载更多',
			loading: '加载数据中',
			nomore: '我是有底线的'
		}
	)
	const firstLoad = ref(false)
	const total = ref(0)
	// 统一存储 home_button 三条数据：banner用[0]，左卡[1]，右卡[2]
	const homeButtons = ref([])
	
	// 操作面板
	const imgSheetVisible = ref(false)
	const activeImgItem = ref(null)
	const activeImgIndex = ref(-1)
	
	const getLsit = () => {
		$http.get('Index/caseList', query.value).then(res => {
			if(res.code == 200){
				let list = res.data.rows
				total.value = res.data.total
				for(let i = 0; i< list.length; i++) {
					dataList.value.push(list[i]);
				}
				if(list.length<query.value.pageSize){
					firstLoad.value = true
					status.value = "nomore"
				}else{
					firstLoad.value = false
				}
						
			}else{
				firstLoad.value = true
				status.value = "nomore"
				if(query.value.page>1){
					query.value.page-=1
				}
			}
		})
	}
	
	//搜索方法
	const getData = () => {
		let where = [];
		query.value.page = 1
		firstLoad.value = false
		status.value = "loadmore"
		dataList.value = []
		if (keyword.value) {
			where.push(
				{
					op: 'op_like',
					key: 'id,title',
					content:keyword.value,
				}
			);
		}
		
		if(where.length>0){
			where = JSON.stringify(where)
		}
		query.value.where = where
		getLsit()
	}

	const golink = (url) => { 
		$page.open(url)
	}

	const goinfo = (id) => { 
		$page.open('/pages/videolist/info?id='+id)
	}
	
	// 打开操作面板
	const openSheet = (item, index) => {
		activeImgItem.value = item
		activeImgIndex.value = index
		imgSheetVisible.value = true
	}
	
	// 面板操作：做同款
	const doSheetRedo = () => {
		imgSheetVisible.value = false
		if (activeImgIndex.value >= 0) {
			const item = dataList.value[activeImgIndex.value]
			if (item.type === 'image') {
				redoImg(activeImgIndex.value)
			} else {
				redoVideo(activeImgIndex.value)
			}
		}
	}
	
	// 面板操作：下载
	const doSheetDown = () => {
		imgSheetVisible.value = false
		if (activeImgItem.value) downImg(activeImgItem.value)
	}
	
	// 预览图片
	const sheetPreviewImg = () => {
		if (activeImgItem.value && activeImgItem.value.url) {
			$tool.previewImage(activeImgItem.value.url)
		}
	}
	
	// 下载图片/视频
	const downImg = (item) => {
		// 根据类型决定下载链接
		const url = item.type === 'image' ? (item.url || '') : (item.url || '')
		if (!url) {
			uni.showToast({ title: '文件暂未生成', icon: 'none' })
			return
		}
		uni.showLoading({ title: '下载中...', mask: true })
		uni.downloadFile({
			url: $tool.imgReplace(url),
			success: (res) => {
				if (res.statusCode === 200) {
					if (item.type === 'image') {
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
							fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
						})
					} else {
						uni.saveVideoToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
							fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
						})
					}
				}
			},
			fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
			complete: () => uni.hideLoading()
		})
	}
	
	// 获取模型显示名称
	const getMakerName = (maker) => {
		const makerMap = {
			'sora': 'Sora2',
			'sora-official': 'Sora官方',
			'veo': 'Veo3.1',
			'xai': 'GroK'
		}
		return makerMap[maker] || maker
	}

	//重做视频
	const redoVideo = (index) => {
		const data = dataList.value[index];
		const form = {
			'desc': encodeURIComponent(data.desc || ''),
			'reference': encodeURIComponent(
				Array.isArray(data.reference)
					? JSON.stringify(data.reference)
					: (data.reference || '')
			),
			'proportion': encodeURIComponent(data.proportion || ''),
			'duration': encodeURIComponent(data.duration || ''),
			'model': encodeURIComponent(data.model || ''),
			'quality': encodeURIComponent(data.size || '')
		};

		// 处理 additional 字段（用于 seedance2.0 的 multimodal、video_url、audio_url）
		if (data.additional && Object.keys(data.additional).length > 0) {
			form.additional = encodeURIComponent(JSON.stringify(data.additional));
		}

		const queryStr = Object.entries(form)
			.filter(([key, value]) => value)
			.map(([key, value]) => `${key}=${value}`)
			.join('&');
		const targetUrl = `/pages/sora/sora?${queryStr}`;
		$page.open(targetUrl, true)
	}
	
	// 重做图片
	const redoImg = (index) => {
		const data = dataList.value[index];
		const form = {
			'desc': encodeURIComponent(data.desc || ''),
			'model': encodeURIComponent(data.model || ''),
			'size': encodeURIComponent(data.size || ''),
			'proportion': encodeURIComponent(data.proportion || ''),
			'reference': encodeURIComponent(
				Array.isArray(data.reference)
					? JSON.stringify(data.reference)
					: (data.reference || '')
			)
		};
		const queryStr = Object.entries(form)
			.filter(([key, value]) => value)
			.map(([key, value]) => `${key}=${value}`)
			.join('&');
		const targetUrl = `/pages/image/image?${queryStr}`;
		$page.open(targetUrl, true)
	}

	// -----------------------播放视频弹窗start
	const video_url = ref('')
	const VideoShowRef = ref(null)
	const pay = (url) =>{
		video_url.value = url
		VideoShowRef.value.open('center')
	}
	//播放出错触发
	const videoErrorCallback = (e) => {
		uni.showToast({
			title: e.target.errMsg,
			icon: 'none'
		})
	}
	// -----------------------播放视频弹窗end
	

	//切换tab
	const handleTabChange = (tabInfo) => {
		if (tabInfo.path === '/pages/index/index') {
			getData()
		    console.log('切换导航执行/pages/index/index')
		}
		
	}
	//重复点击触发
	const handleTabReclick = (tabInfo) => {
		if (tabInfo.path === '/pages/index/index') {
		    console.log('重复点击导航执行/pages/index/index')
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

	uni.$on('initConfig', (res) => {
		//修改标题
		// #ifdef H5
		uni.setNavigationBarTitle({
			title: WEBCONFIG?.value.sys.name
		})
		// #endif
		// #ifdef MP-WEIXIN
		shareData.value.title = WEBCONFIG?.value.sys.share_desc
		shareData.value.path = '/pages/index/index?spread='
		shareData.value.query ='/pages/index/index?spread='
		shareData.value.imageUrl = $tool.imgReplace(WEBCONFIG?.value.sys.logo) ? $tool.imgReplace(WEBCONFIG?.value.sys.logo) : '/static/img/cpimg.png'

		initInterstitialAd()
		setTimeout(()=>{
			showAdIfLoaded()
		},5000)
		
		// #endif
		
		if(WEBCONFIG?.value.sys.home_button){
				homeButtons.value = WEBCONFIG.value.sys.home_button.map((item, index) => ({
					title: item.title,
					desc: item.desc,
					url: index === 0 ? '/pages/image/image' : (index === 1 ? '/pages/sora/sora' : '/pages/human/human')
				}))
			}
		
		
	})


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
			if(config.sys.home_button){
				homeButtons.value = config.sys.home_button.map((item, index) => ({
					title: item.title,
					desc: item.desc,
					url: index === 0 ? '/pages/image/image' : (index === 1 ? '/pages/sora/sora' : '/pages/human/human')
				}))
			}
		}
		
		getData()
		// #ifdef H5
		initUrlParams();
		// #endif
	})
	
	onReachBottom(() =>{
		if(!firstLoad.value){  //此处判断，上锁，防止重复请求
				firstLoad.value = true
				// 修改当前列表加载状态
				status.value = "loading"
				// 请求数据
				query.value.page += 1;
				getLsit()
		}
	})

	// 在onShow中也确保参数存在
	onShow(() => {
	  // #ifdef H5
	  setTimeout(() => {
	    ensureUrlHasParams();
	  }, 100);
	  // #endif
	})
	
	onReady((e) =>{
	    // #ifdef H5
	    uni.hideTabBar();
	    // #endif
	})
	
	onMounted(() => {
		  // 监听全局 Tab 事件
		  uni.$on('onGlobalTabChange', handleTabChange)
		  uni.$on('onGlobalTabReclick', handleTabReclick)
	})
		
	onUnmounted(() => {
	  // 清理事件监听
	  uni.$off('onGlobalTabChange', handleTabChange)
	  uni.$off('onGlobalTabReclick', handleTabReclick)
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
	.card_left{
		width: 47%;
		height: 180rpx;
		font-size: 28rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, #232327 0%, #2d2d3a 50%, #3a3a4a 100%);
		border: 2rpx solid #565664;
		padding: 30rpx 30rpx;
		position: relative;
		overflow: hidden;
	}
	.card_bg_img{
		position: absolute;
		bottom: 0rpx;
		right: -10rpx;
		width: 44%;
		height: auto;
		opacity: 0.4;
		pointer-events: none;
		z-index: 0;
	}
	.card_left .bard_title,
	.card_left .bard_desc,
	.card_right .bard_title,
	.card_right .bard_desc{
		position: relative;
		z-index: 1;
	}
	.card_right{
		width: 47%;
		height: 180rpx;
		font-size: 28rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, #b60b0b 0%, #741919 50%, #333338 100%);
		border: 2rpx solid #e21122;
		padding: 30rpx 30rpx;
		position: relative;
		overflow: hidden;
	}
	.bard_title{
		margin-top: 5rpx;
		font-size: 36rpx;
		font-weight: bold;
		color: #fff;
	}
	.bard_desc{
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #bbbbbb;
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
	.list_gc{
		margin-top: 30rpx;
		border-radius: 20rpx;
		position: relative;
		
		.video-card{
			position: relative;
		}
		
		// 模型标识徽章
		.model-badge{
			position: absolute;
			top: 10rpx;
			left: 10rpx;
			z-index: 4;
			padding: 4rpx 20rpx;
			border-radius: 30rpx;
			font-size: 22rpx;
			font-weight: bold;
			backdrop-filter: blur(10rpx);
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
			
			.badge-text{
				color: #fff;
				text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.5);
			}
		}
		
		// Sora2 - 蓝紫色
		.badge-sora{
			background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9));
			border: 2rpx solid rgba(99, 102, 241, 0.5);
		}
		
		// Sora官方 - 金色
		.badge-sora-official{
			background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
			border: 2rpx solid rgba(245, 158, 11, 0.5);
		}
		
		// Veo3.1 - 青色
		.badge-veo{
			background: linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(14, 165, 233, 0.9));
			border: 2rpx solid rgba(6, 182, 212, 0.5);
		}
		
		// GroK - 绿色
		.badge-xai{
			background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9));
			border: 2rpx solid rgba(34, 197, 94, 0.5);
		}
		
		// 类型标识（图片/视频）
		.type-badge{
			position: absolute;
			top: 10rpx;
			right: 10rpx;
			z-index: 4;
			padding: 4rpx 16rpx;
			border-radius: 30rpx;
			font-size: 20rpx;
			font-weight: bold;
			display: flex;
			align-items: center;
			gap: 6rpx;
			backdrop-filter: blur(10rpx);
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
		}
		
		// 图片标识 - 紫色
		.type-badge--image{
			background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9));
			border: 2rpx solid rgba(139, 92, 246, 0.5);
		}
		
		// 视频标识 - 红色
		.type-badge--video{
			background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9));
			border: 2rpx solid rgba(239, 68, 68, 0.5);
		}
		
		.type-text{
			color: #fff;
		}
		
		.bnt_kuang{
			position: absolute;
			z-index: 3;
			bottom: 20rpx;
			left: 0;
			right: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			.k_bnt{
				border-radius: 100rpx;
				color: #fff;
				padding: 8rpx 20rpx;
				font-size: 24rpx;
				// background: linear-gradient(130deg,
				//  #ff0000 10%,    /* 左侧10%的浅色 */
				//  #b10000 30%,   /* 中间80%的深色起始点 */
				//  #b10000 70%,   /* 中间80%的深色结束点 */
				//  #ff0000 100%   /* 右侧10%的浅色 */
				// );
				background-color: #003c62;
				border: 1px solid #0077c6;
			}
			.k_bnt1{
				border-radius: 100rpx;
				color: #e7e7e7;
				padding: 8rpx 20rpx;
				font-size: 24rpx;
				background-color: #303030;
				opacity: 0.7;
			}
		}
		.img{
			width: 315rpx;
			height: 400rpx;
			border-radius: 20rpx;
		}
		.title{
			margin-top: 10rpx;
			width: 310rpx;
			color: #c3c3c3;
		}
		.ys1{
			color: #ff0000;
		}
		.ys2{
			color: #00de3f;
		}
		.ys3{
			color: #00bbff;
		}
		.time{
			font-size: 24rpx;
			color: #7e7e7e;
		}
		.k_bnt{
			border-radius: 100rpx;
			color: #fff;
			padding: 8rpx 20rpx;
			font-size: 24rpx;
			// background: linear-gradient(130deg,
			//  #ff0000 10%,    /* 左侧10%的浅色 */
			//  #b10000 30%,   /* 中间80%的深色起始点 */
			//  #b10000 70%,   /* 中间80%的深色结束点 */
			//  #ff0000 100%   /* 右侧10%的浅色 */
			// );
			background-color: #003c62;
			border: 1px solid #0077c6;
		}
		.k_bnt1{
			border-radius: 20rpx;
			color: #cccccc;
			padding: 8rpx 20rpx;
			font-size: 24rpx;
			background-color: #303030;
		}
	}

	// AI制图发光Banner
	.image-banner {
		width: 100%;
		height: 190rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #6d28d9 100%);
		padding: 0 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		overflow: hidden;
		box-shadow: 0 8rpx 30rpx rgba(124, 58, 237, 0.4);

		&:active {
			transform: scale(0.98);
		}

		// 背景光晕
		.banner-glow {
			position: absolute;
			top: -30rpx;
			right: -30rpx;
			width: 200rpx;
			height: 200rpx;
			border-radius: 50%;
			background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
			pointer-events: none;
		}

		// 浮动粒子
		.banner-particle {
			position: absolute;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.3);
			pointer-events: none;
			animation: floatParticle 3s ease-in-out infinite;

			&.p1 {
				width: 14rpx;
				height: 14rpx;
				top: 20rpx;
				left: 30%;
				animation-delay: 0s;
			}

			&.p2 {
				width: 10rpx;
				height: 10rpx;
				top: 60%;
				left: 55%;
				animation-delay: 1s;
			}

			&.p3 {
				width: 18rpx;
				height: 18rpx;
				top: 30%;
				right: 25%;
				animation-delay: 2s;
			}
		}

		.banner-content {
			position: relative;
			z-index: 1;
			flex: 1;
		}

		.banner-icon-wrap {
			position: relative;
			width: 80rpx;
			height: 80rpx;
			flex-shrink: 0;

			.banner-icon {
				width: 80rpx;
				height: 80rpx;
				border-radius: 18rpx;
				background: rgba(255, 255, 255, 0.2);
				border: 2rpx solid rgba(255, 255, 255, 0.3);
				display: flex;
				align-items: center;
				justify-content: center;
				backdrop-filter: blur(10rpx);
			}

			.banner-icon-ring {
				position: absolute;
				top: -4rpx;
				left: -4rpx;
				right: -4rpx;
				bottom: -4rpx;
				border-radius: 22rpx;
				border: 1rpx solid rgba(255, 255, 255, 0.2);
				animation: pulseRing 2s ease-in-out infinite;
			}
		}

		.banner-text {
			margin-left: 24rpx;

			.banner-title {
				font-size: 36rpx;
				font-weight: 800;
				color: #fff;
				letter-spacing: 2rpx;
			}

			.banner-subtitle {
				font-size: 22rpx;
				color: rgba(255, 255, 255, 0.7);
				margin-top: 6rpx;
			}
		}

		.banner-arrow {
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.2);
			border: 1rpx solid rgba(255, 255, 255, 0.3);
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			z-index: 1;
			flex-shrink: 0;
			backdrop-filter: blur(10rpx);
		}
	}

	@keyframes floatParticle {
		0%, 100% { transform: translateY(0); opacity: 0.3; }
		50% { transform: translateY(-10rpx); opacity: 0.7; }
	}

	@keyframes pulseRing {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(1.05); }
	}

	.m_bottom_20 {
		margin-bottom: 20rpx;
	}

	/* ========== 操作面板 ========== */
	.img_sheet{
		padding: 16rpx 32rpx 48rpx;
		background: rgba(28,28,30,0.96);
		backdrop-filter: blur(40rpx);
		-webkit-backdrop-filter: blur(40rpx);

		.img_sheet_handle{
			padding: 16rpx 0 28rpx;
			.handle_bar{
				width: 72rpx;
				height: 8rpx;
				border-radius: 999rpx;
				background: rgba(255,255,255,0.25);
			}
		}

		.img_sheet_preview{
			margin: 0 0 32rpx;
			min-height: 280rpx;
			max-height: 380rpx;
			border-radius: 24rpx;
			background: #000;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
		}
		.sheet_preview_img{
			width: 100%;
			height: 380rpx;
			object-fit: contain;
		}

		.img_sheet_actions{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-around;
			align-items: flex-start;
		}

		.sheet_action_item{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			min-width: 100rpx;
			padding: 0 8rpx;
			&:active{ opacity: 0.65; }
		}

		.sheet_action_circle{
			width: 68rpx;
			height: 68rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 10rpx;
		}
		.sheet_act_redo{ background: rgba(59,130,246,0.15); border: 1.5rpx solid rgba(96,165,250,0.4); }
		.sheet_act_down{ background: rgba(16,185,129,0.15); border: 1.5rpx solid rgba(134,239,172,0.4); }

		.sheet_action_label{
			font-size: 22rpx;
			color: rgba(255,255,255,0.75);
			line-height: 1.2;
			text-align: center;
		}
	}

</style>
