<template>
	<view class="infobox">
		<view class="box">
			<view class="acea-row">
				<view :class="query.type == 1 ? 'bnt' : 'bnt0'" @click="anli(1)">视频作品</view>
				<view :class="query.type == 2 ? 'bnt' : 'bnt0'" style="margin-left: 30rpx;" @click="anli(2)">AI数字人</view>
				<view :class="query.type == 3 ? 'bnt' : 'bnt0'" style="margin-left: 30rpx;" @click="anli(3)">图片作品</view>
			</view>
			<!-- #ifdef MP -->
			<view v-if="WEBCONFIG?.mp_banner" class="acea-row row-center-wrapper" style="padding: 20rpx 0 0 0;">
				<ad-custom :unit-id="WEBCONFIG?.mp_banner" bindload="adLoad" binderror="adError" bindclose="adClose"></ad-custom>
			</view>
			<!-- #endif -->
			<view class="daohang acea-row row-between-wrapper m_top_20" v-if="query.type == 1">
				<view :class="query.status == 0 ? 'dh_bnt2' : 'dh_bnt1'" @click="zhuangtai(0)">全部</view>
				<view :class="query.status == 1 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(1)">生成中 <text class="num" v-if="stats.tj1">{{stats.tj1 > 99 ? '99+' : stats.tj1}}</text></view>
				<view :class="query.status == 2 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(2)">已完成 <text class="num" v-if="stats.tj2">{{stats.tj2 > 99 ? '99+' : stats.tj2}}</text></view>
				<view :class="query.status == 3 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(3)">失败 <text class="num" v-if="stats.tj3">{{stats.tj3 > 99 ? '99+' : stats.tj3}}</text></view>
			</view>
			<view class="daohang acea-row row-between-wrapper m_top_20" v-if="query.type == 2">
				<view :class="query.classify == 1 ? 'dh_bnt2' : 'dh_bnt1'"  @click="aitiaozhuan(1)">数字人视频 <text class="num" v-if="stats.tj1">{{stats.tj1 > 99 ? '99+' : stats.tj1}}</text></view>
				<view :class="query.classify == 2 ? 'dh_bnt2' : 'dh_bnt1'"  @click="aitiaozhuan(2)">我的形象 <text class="num" v-if="stats.tj2">{{stats.tj2 > 99 ? '99+' : stats.tj2}}</text></view>
				<view :class="query.classify == 3 ? 'dh_bnt2' : 'dh_bnt1'"  @click="aitiaozhuan(3)">我的音色 <text class="num" v-if="stats.tj3">{{stats.tj3 > 99 ? '99+' : stats.tj3}}</text></view>
			</view>
			<view class="daohang acea-row row-between-wrapper m_top_20" v-if="query.type == 3">
				<view :class="query.status == 0 ? 'dh_bnt2' : 'dh_bnt1'" @click="zhuangtai(0)">全部</view>
				<view :class="query.status == 1 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(1)">生成中 <text class="num" v-if="stats.tj1">{{stats.tj1 > 99 ? '99+' : stats.tj1}}</text></view>
				<view :class="query.status == 2 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(2)">已完成 <text class="num" v-if="stats.tj2">{{stats.tj2 > 99 ? '99+' : stats.tj2}}</text></view>
				<view :class="query.status == 3 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(3)">失败 <text class="num" v-if="stats.tj3">{{stats.tj3 > 99 ? '99+' : stats.tj3}}</text></view>
			</view>
			<view class="tips_kuang m_top_20 acea-row row-middle" v-if="WEBCONFIG?.api.cuenchu_kg == 0">
				<uni-icons type="info" size="18" color="#bdbdbd" style="margin-right: 5rpx;"></uni-icons>请尽快下载,视频生成完成后,将在24小时自动删除
			</view>
			<view v-if="total">
				<view class="list" v-for="(item,index) in dataList" :key="index"  v-if="query.type == 1">
					<view class="acea-row kuang">
						<view class="piao">
							<view class="k_bnt_del" @click="delVideo(item.id,index)" v-if="item.status != 1">
								<uni-icons type="trash" size="16" color="#fff" ></uni-icons>
							</view>
						</view>
						<image :src="item.img ? $tool.imgReplace(item.img) : '/static/img/300-200.png'" mode="aspectFill" class="img" @click="goinfo(item.id)">
						</image>
						<view class="right">
							<view class="text_display title"  @click="goinfo(item.id)">{{item.desc}}</view>
							<view class="acea-row row-between-wrapper m_top_30">
								<view class="ys3" v-if="item.status == 1">生成中</view>
								<view class="ys2" v-if="item.status == 2">已完成</view>
								<view class="k_bnt_gongkai acea-row row-middle" v-if="item.announce == 0 && item.status == 2" @click="videoSquare(item.id,index,1)">公开</view>
								<view class="k_bnt_gongkai1 acea-row row-middle" v-if="item.announce == 1 && item.status == 2" @click="videoSquare(item.id,index,2)">隐藏</view>
								<view class="ys1" v-if="item.status == 3">失败</view>
								<view class="time">{{item.add_time}}</view>
							</view>
							<view class="acea-row row-between-wrapper m_top_30">
								<view class="video_action_btn primary" @click="pay(item.url)"><uni-icons type="videocam" size="16" color="#fff" ></uni-icons>播放</view>
								<view class="video_action_btn secondary" @click="redo(index)"><uni-icons type="refresh" size="16" color="#fff" ></uni-icons>重做</view>
								<view v-if="WEBCONFIG?.api.cuenchu_kg == 1">
									<view class="video_action_btn success" @click="down(item.url)" v-if="item.down == 1"><uni-icons type="cloud-download" size="16" color="#fff" ></uni-icons>下载</view>
									<view class="video_action_btn loading" v-else><uni-icons type="cloud-download" size="16" color="#fff" ></uni-icons>加载中</view>
								</view>
								<view class="video_action_btn success" @click="down(item.url)" v-else><uni-icons type="cloud-download" size="16" color="#fff" ></uni-icons>下载</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 图片作品 -->
				<view class="acea-row row-between-wrapper" v-if="query.type == 3">
					<view class="list_gc list_gc_img" v-for="(item,index) in dataList" :key="'img-' + index">
						<view class="tupian tupian_square" @click="openImgSheet(item, index)">
							<!-- 图片封面 -->
							<image
								:src="item.url ? $tool.imgReplace(item.url) : '/static/img/300-200.png'"
								mode="aspectFill"
								class="img"
							></image>
							<!-- 生成中遮罩 -->
							<view class="jiazai_kuang" v-if="item.status == 1">
								<view class="acea-row row-center">
									<u-loading mode="circle" color="#a78bfa"></u-loading>
									<view class="text">生成中</view>
								</view>
							</view>
							<!-- 失败遮罩 -->
							<view class="jiazai_kuang error_kuang" v-if="item.status == 3">
								<view class="error_content">
									<view class="error_icon">
										<uni-icons type="closeempty" size="50" color="#ef4444"></uni-icons>
									</view>
									<view class="error_text">生成失败</view>
									<view class="error_tips">请重新生成</view>
								</view>
							</view>
							<!-- 公开/隐藏状态角标（右上角小标签，平时可见） -->
							<view class="img_pub_tag" :class="item.announce == 1 ? 'img_pub_tag--hide' : 'img_pub_tag--pub'" v-if="item.status == 2">
								{{ item.announce == 0 ? '公开' : '隐藏' }}
							</view>
						</view>
					</view>
				</view>

				<!-- 图片操作面板：点击图片后底部弹出，类似 Instagram/iOS 分享卡 -->
				<u-popup v-model="imgSheetVisible" mode="bottom" :round="24" :border-radius="24" z-index="999" :mask-close-able="true" @close="imgSheetVisible = false">
					<view class="img_sheet">
						<!-- 面板顶部：圆角把手 + 关闭按钮 -->
						<view class="img_sheet_handle acea-row row-center">
							<view class="handle_bar"></view>
						</view>
						<!-- 预览图：黑色背景 + 圆角 + 点击可放大 -->
						<view class="img_sheet_preview" v-if="activeImgItem" @click="sheetPreviewImg">
							<image :src="activeImgItem.url ? $tool.imgReplace(activeImgItem.img)  || $tool.imgReplace(activeImgItem.loacl_url) || $tool.imgReplace(activeImgItem.url) : '/static/img/300-200.png'" mode="aspectFit" class="sheet_preview_img"></image>
						</view>
						<!-- 操作按钮网格：均分宽松 -->
						<view class="img_sheet_actions acea-row" v-if="activeImgItem">
							<!-- 重做 -->
							<view class="sheet_action_item" @click="doSheetRedo">
								<view class="sheet_action_circle sheet_act_redo">
									<uni-icons type="refresh" size="24" color="#3b82f6"></uni-icons>
								</view>
								<text class="sheet_action_label">重做</text>
							</view>
							<!-- 下载 -->
							<view class="sheet_action_item" @click="doSheetDown">
								<view class="sheet_action_circle sheet_act_down">
									<uni-icons type="cloud-download" size="24" color="#10b981"></uni-icons>
								</view>
								<text class="sheet_action_label">下载</text>
							</view>
							<!-- 公开 / 隐藏 -->
							<view class="sheet_action_item" v-if="activeImgItem.announce == 0" @click="doSheetPub(1)">
								<view class="sheet_action_circle sheet_act_pub">
									<uni-icons type="eye" size="24" color="#f97316"></uni-icons>
								</view>
								<text class="sheet_action_label">公开</text>
							</view>
							<view class="sheet_action_item" v-if="activeImgItem.announce == 1" @click="doSheetPub(2)">
								<view class="sheet_action_circle sheet_act_hide">
									<uni-icons type="eye-slash" size="24" color="#6b7280"></uni-icons>
								</view>
								<text class="sheet_action_label">隐藏</text>
							</view>
							<!-- 删除 -->
							<view class="sheet_action_item" @click="doSheetDel">
								<view class="sheet_action_circle sheet_act_del">
									<uni-icons type="trash" size="24" color="#ef4444"></uni-icons>
								</view>
								<text class="sheet_action_label">删除</text>
							</view>
						</view>
						<view style="height: 200rpx;"></view>
					</view>
				</u-popup>

				<!-- 我的形象：新建按钮 -->
		<view class="create-bar m_top_20" v-if="query.type == 2 && query.classify == 1">
			<view class="create-btn" @click="$page.open('/pages/human/human', true)">
				<uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
				<text>制作数字人</text>
			</view>
		</view>
				<view class="acea-row row-between-wrapper" v-if="query.type == 2 && query.classify == 1" >
					<view class="list_gc" v-for="(item,index) in dataList" :key="index">
						<view class="tupian">
							<!-- 删除按钮 -->
							<view class="k_bnt_del k_bnt_del_abs" @click="delVideo(item.id,index)" v-if="item.status == 2">
								<uni-icons type="trash" size="16" color="#fff"></uni-icons>
							</view>
							<!-- 创建中遮罩 -->
							<view class="jiazai_kuang" v-if="item.status == 1">
								<view class="acea-row row-center">
									<u-loading mode="circle" color="#3b82f6"></u-loading>
									<view class="text">创建中</view>
								</view>
							</view>
							<!-- 失败遮罩 -->
							<view class="jiazai_kuang error_kuang" v-if="item.status == 3">
								<view class="error_content">
									<view class="error_icon">
										<uni-icons type="closeempty" size="50" color="#ef4444"></uni-icons>
									</view>
									<view class="error_text">生成失败</view>
									<view class="error_tips">请重新创建</view>
								</view>
							</view>
							<view class="bnt_kuang" v-if="item.status == 2">
								<view class="k_bnt1 acea-row row-middle" @click="pay(item.url)"><uni-icons type="videocam" size="16" color="#e7e7e7" style="margin-right: 5rpx;"></uni-icons>预览</view>
								<view class="k_bnt1 acea-row row-middle" @click="down(item.url)" style="margin-left: 20rpx;"><uni-icons type="refresh" size="16" color="#e7e7e7" style="margin-right: 5rpx;"></uni-icons>下载</view>
							</view>
							<image :src="item.img ? $tool.imgReplace(item.img) : '/static/img/300-200.png'" mode="aspectFill" class="img"></image>
						</view>
					</view>
				</view>

		<!-- 我的形象：新建按钮 -->
		<view class="create-bar m_top_20" v-if="query.type == 2 && query.classify == 2">
			<view class="create-btn" @click="$page.open('/pages/human/createImage', true)">
				<uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
				<text>新建形象</text>
			</view>
		</view>

		<view class="acea-row row-between-wrapper" v-if="query.type == 2 && query.classify == 2" >
				<view class="list_gc" v-for="(item,index) in dataList" :key="index">
						<view class="tupian tupian_square">
							<!-- 删除按钮 -->
							<view class="k_bnt_del k_bnt_del_abs" @click="delHuman(item.id,index)" v-if="item.status == 2">
								<uni-icons type="trash" size="16" color="#fff"></uni-icons>
							</view>
							<!-- 创建中遮罩 -->
							<view class="jiazai_kuang" v-if="item.status == 1">
								<view class="acea-row row-center">
									<u-loading mode="circle" color="#3b82f6"></u-loading>
									<view class="text">创建中</view>
								</view>
							</view>
							<!-- 失败遮罩 -->
							<view class="jiazai_kuang error_kuang" v-if="item.status == 3">
								<view class="error_content">
									<view class="error_icon">
										<uni-icons type="closeempty" size="50" color="#ef4444"></uni-icons>
									</view>
									<view class="error_text">生成失败</view>
									<view class="error_tips">请重新创建</view>
								</view>
							</view>
							<image :src="item.img ? $tool.imgReplace(item.img) : '/static/img/300-200.png'" mode="aspectFill" class="img" @click="pay(item.material_url)"></image>
							<view class="tupian_square_name text_display">{{ item.name || '未命名形象' }}</view>
						</view>
					</view>
				</view>

			<!-- 我的音色：新建按钮 -->
			<view class="create-bar m_top_20" v-if="query.type == 2 && query.classify == 3">
				<view class="create-btn" @click="$page.open('/pages/human/createVoice', true)">
					<uni-icons type="plusempty" size="18" color="#fff"></uni-icons>
					<text>新建音色</text>
				</view>
			</view>

			<!-- 我的声音：列表（名称、波形、播放/暂停） -->
			<view class="voice_list" v-if="query.type == 2 && query.classify == 3">
					<view class="voice_card" v-for="(item, index) in dataList" :key="'voice-' + index">
						<!-- 状态遮罩层 -->
						<view class="voice_status_overlay" v-if="item.status != 2">
							<view class="status_content" v-if="item.status == 1">
								<view class="status_icon creating">
									<u-loading mode="circle" color="#3b82f6" size="40"></u-loading>
								</view>
								<view class="status_text creating">音色生成中...</view>
								<view class="status_tips">预计需要1-3分钟</view>
							</view>
							<view class="status_content" v-if="item.status == 3">
								<view class="status_icon failed">
									<uni-icons type="closeempty" size="50" color="#ef4444"></uni-icons>
								</view>
								<view class="status_text failed">生成失败</view>
								<view class="status_tips">{{ item.error_msg || '请重新创建' }}</view>
							</view>
						</view>
						
						<!-- 原有内容 -->
						<view class="voice_card_content" :class="{ disabled: item.status != 2 }">
							<view class="voice_card_top">
								<view class="voice_icon_box">
									<view class="voice_icon_wave">
										<view class="wave_bar_mini" v-for="n in 5" :key="n"></view>
									</view>
								</view>
								<view class="voice_name_box">
									<view class="voice_name text_display">{{ item.name || '未命名声音' }}</view>
									<view class="voice_status_badge success" v-if="item.status == 2">
										<uni-icons type="checkmarkempty" size="14" color="#10b981"></uni-icons>
										<text>可用</text>
									</view>
								</view>
							</view>
							<view class="voice_card_mid">
								<view class="voice_wave_teal" :class="{ playing: currentVoiceIndex === index && isVoicePlaying }">
									<view class="wave_bar_teal" v-for="n in 25" :key="n" :class="{ playing: currentVoiceIndex === index && isVoicePlaying }"></view>
								</view>
							</view>
							<view class="voice_card_btm">
								<view class="voice_btn voice_btn_play" @click.stop="item.status == 2 ? playVoice(item, index) : null" :class="{ disabled: item.status != 2 }">
									<view class="icon_play" v-if="currentVoiceIndex !== index || !isVoicePlaying"></view>
									<view class="icon_pause" v-else>
										<view class="icon_pause_bar"></view>
										<view class="icon_pause_bar"></view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="card m_top_30">
				<u-empty text="暂无数据" mode="list" iconColor="#484a4d"></u-empty>
			</view>
			<view class="m_top_30">
				<u-loadmore :status="status" :load-text="loadText"/>
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
		<u-popup v-model="progressPopup" mode="center" :mask-close-able="false" border-radius="20">
					  <view class="tckuang">
						  <u-circle-progress active-color="#2979ff" :percent="progress">
						  	<view class="u-progress-content">
						  		<text class='u-progress-info'>下载中</text>
						  	</view>
						  </u-circle-progress>
					  </view>
						
		</u-popup>
		
		<!-- 自定义导航 -->
		<CustomTabBar></CustomTabBar>
	</view>
</template>

<script setup>
	import { ref,getCurrentInstance,onMounted,onUnmounted  } from 'vue';
	import { onLoad,onShow,onShareAppMessage, onShareTimeline , onReachBottom,onPullDownRefresh,onReady,onHide,onUnload} from '@dcloudio/uni-app'
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
	
	const {  setUserInfo,clearUserInfo } = useUserStore()
	
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const storage = useCache()
	
	const keyword = ref('')
	// v-model绑定的这个变量不要在分页请求结束中自己赋值，直接使用即可
	const query = ref({
		page: 1,
		pageSize: 10,
		where:[],
		prop:'id desc',
		type:1,
		status:0,
		classify:1,	//1:数字人视频,2:我的形象,3:我的声音
	})
	const stats = ref([])	//j统计数据
	
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
	
	const progress = ref(0); // 下载进度百分比
	const progressPopup = ref(false); // 进度弹窗引用
	let isDownloading = false; // 防重复点击开关
	
	//公开视频到广场
	const videoSquare = (id,index,type) => {
		var msg = ''
		if(type == 1){
			type = 1
			msg = '公开后,所有用户将可以在案例广场查看'
		}else{
			type = 2
			msg = '隐藏后,将不展示到案例广场'
		}
		uni.showModal({
			title: '温馨提示',
			content: msg,
			success: function (res) {
				if (res.confirm) {
					uni.showLoading({
						title: '加载中',
						mask: false
					})
					$http.post('User/videoSquare', {id:id,type:type}).then(res => {
						if(res.code == 200){
							dataList.value[index].announce = type == 1 ? 1:0
							uni.showToast({
								title: res.msg,
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
				} else if (res.cancel) {
					
				}
			}
		});
	}

	//公开/隐藏图片
	const imgSquare = (id,index,type) => {
		var msg = type == 1 ? '公开后,所有用户将可以在案例广场查看' : '隐藏后,将不展示到案例广场'
		uni.showModal({
			title: '温馨提示',
			content: msg,
			success: function (res) {
				if (res.confirm) {
					uni.showLoading({ title: '加载中', mask: false })
					$http.post('User/videoSquare', {id, type}).then(res => {
						if(res.code == 200){
							dataList.value[index].announce = type == 1 ? 1 : 0
							uni.showToast({ title: res.msg, icon: 'none' })
						}else{
							uni.showToast({ title: res.msg, icon: 'none' })
						}
					}).catch(() => uni.hideLoading())
				}
			}
		})
	}

	//图片重做，跳转到AI制图页面
	const redoImg = (index) => {
		const data = dataList.value[index]
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
		}
		const queryStr = Object.entries(form)
			.filter(([key, value]) => value)
			.map(([key, value]) => `${key}=${value}`)
			.join('&')
		const targetUrl = `/pages/image/image?${queryStr}`
		$page.open(targetUrl, true)
	}

	//删除视频
	const delVideo = (id,index) => {
		uni.showModal({
			title: '温馨提示',
			content: '确定要删除吗?',
			success: function (res) {
				if (res.confirm) {
					uni.showLoading({
						title: '加载中',
						mask: false
					})
					$http.post('User/delVideo', {id:id}).then(res => {
						if(res.code == 200){
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
							dataList.value.splice(index, 1);
						}else{
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					}).catch(err => {
						uni.hideLoading()
					})
				} else if (res.cancel) {
					
				}
			}
		});
	}


	//删除我的形象
	const delHuman = (id,index) => {
		uni.showModal({
			title: '温馨提示',
			content: '确定要删除吗?',
			success: function (res) {
				if (res.confirm) {
					uni.showLoading({
						title: '加载中',
						mask: false
					})
					$http.post('User/delHuman', {id:id}).then(res => {
						if(res.code == 200){
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
							dataList.value.splice(index, 1);
						}else{
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					}).catch(err => {
						uni.hideLoading()
					})
				} else if (res.cancel) {
					
				}
			}
		});
	}
	
	const down = (url) => {
		// 区分平台：H5 端用浏览器下载，小程序用原有逻辑
		// #ifdef H5
			uni.showModal({
				title: '下载提示',
				content: 'H5无法下载视频,请使用小程序下载',
				showCancel: false,
				confirmText: '知道了'
			})
		// #endif
		
		// #ifndef H5
		  if (isDownloading) return;
		  isDownloading = true;
		
		  // 显示进度弹窗
		  progressPopup.value = true;
		  progress.value = 0;
		
		  try {
			
			// 小程序端保留原有逻辑（略作优化）
			const downloadTask = uni.downloadFile({
			  url: url,
			  success: (res) => {
				if (res.statusCode === 200) {
				  uni.saveVideoToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => uni.showToast({ title: '视频保存成功', icon: 'success' }),
					fail: (saveErr) => {
					  let errMsg = '保存失败';
					  if (saveErr.errMsg.includes('auth deny')) {
						errMsg = '请授权相册权限后重试';
						uni.openSetting({
						  success: (settingRes) => {
							if (settingRes.authSetting['scope.writePhotosAlbum']) {
							  uni.saveVideoToPhotosAlbum({ filePath: res.tempFilePath });
							}
						  }
						});
					  }
					  uni.showToast({ title: errMsg, icon: 'error' });
					},
					complete: () => {
					  progress.value = 0;
					  progressPopup.value = false;
					  isDownloading = false;
					}
				  });
				} else {
				  uni.showToast({ title: `下载失败，状态码: ${res.statusCode}`, icon: 'error' });
				  progress.value = 0;
				  progressPopup.value = false;
				  isDownloading = false;
				}
			  },
			  fail: (err) => {
				uni.showToast({ title: `下载失败: ${err.errMsg}`, icon: 'error' });
				progress.value = 0;
				progressPopup.value = false;
				isDownloading = false;
			  },
			});
		
			downloadTask.onProgressUpdate((res) => {
			  progress.value = res.progress;
			  console.log(`下载进度: ${res.progress}%`);
			});
			
		
		  } catch (error) {
			console.error('保存失败:', error);
			uni.showToast({ title: '下载失败', icon: 'none' });
			progress.value = 0;
			progressPopup.value = false;
			isDownloading = false;
		  }
	  // #endif
	};
	
	
	// -----------------------播放视频弹窗start
	const video_url = ref('')
	const VideoShowRef = ref(null)

	// -----------------------图片操作面板（类 Instagram/iOS 分享卡）
	const imgSheetVisible = ref(false)
	const activeImgItem = ref(null)
	const activeImgIndex = ref(-1)

	const openImgSheet = (item, index) => {
		if (item.status == 1) return // 生成中不响应
		activeImgItem.value = item
		activeImgIndex.value = index
		imgSheetVisible.value = true
	}

	const doSheetRedo = () => {
		imgSheetVisible.value = false
		if (activeImgIndex.value >= 0) redoImg(activeImgIndex.value)
	}

	const doSheetDown = () => {
		imgSheetVisible.value = false
		if (activeImgItem.value) downImg(activeImgItem.value)
	}

	const doSheetPub = (type) => {
		imgSheetVisible.value = false
		if (activeImgItem.value && activeImgIndex.value >= 0) imgSquare(activeImgItem.value.id, activeImgIndex.value, type)
	}

	const doSheetDel = () => {
		imgSheetVisible.value = false
		if (activeImgItem.value && activeImgIndex.value >= 0) delVideo(activeImgItem.value.id, activeImgIndex.value)
	}

	const sheetPreviewImg = () => {
		if (activeImgItem.value && activeImgItem.value.url) {
			$tool.previewImage(activeImgItem.value.url)
		}
	}

	const downImg = (item) => {
		const url = item.url || ''
		if (!url) {
			uni.showToast({ title: '图片暂未生成', icon: 'none' })
			return
		}
		uni.showLoading({ title: '下载中...', mask: true })
		uni.downloadFile({
			url: $tool.imgReplace(url),
			success: (res) => {
				if (res.statusCode === 200) {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => uni.showToast({ title: '保存成功', icon: 'success' }),
						fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
					})
				}
			},
			fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
			complete: () => uni.hideLoading()
		})
	}
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
	
	// -----------------------我的声音：播放
	const currentVoiceIndex = ref(-1)
	const isVoicePlaying = ref(false)
	const voiceCurrentTime = ref('00:00')
	const voiceDuration = ref('00:00')
	let voiceAudio = null
	
	const formatVoiceTime = (s) => {
		if (s === undefined || s === null || isNaN(s)) return '00:00'
		const m = Math.floor(s / 60)
		const sec = Math.floor(s % 60)
		return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
	}
	
	const playVoice = (item, index) => {
		const src = item.material_url || ''
		if (!src) {
			uni.showToast({ title: '暂无音频', icon: 'none' })
			return
		}
		if (!voiceAudio) {
			voiceAudio = uni.createInnerAudioContext()
			voiceAudio.onPlay(() => { isVoicePlaying.value = true })
			voiceAudio.onPause(() => { isVoicePlaying.value = false })
			voiceAudio.onStop(() => { isVoicePlaying.value = false })
			voiceAudio.onEnded(() => {
				isVoicePlaying.value = false
				currentVoiceIndex.value = -1
				voiceCurrentTime.value = '00:00'
			})
			voiceAudio.onError(() => {
				isVoicePlaying.value = false
				currentVoiceIndex.value = -1
				voiceCurrentTime.value = '00:00'
				voiceDuration.value = '00:00'
				uni.showToast({ title: '播放失败', icon: 'none' })
			})
			voiceAudio.onCanplay(() => {
				if (voiceAudio.duration && voiceAudio.duration > 0) {
					voiceDuration.value = formatVoiceTime(voiceAudio.duration)
				}
			})
			voiceAudio.onTimeUpdate(() => {
				voiceCurrentTime.value = formatVoiceTime(voiceAudio.currentTime)
				if (voiceAudio.duration && voiceAudio.duration > 0 && voiceDuration.value === '00:00') {
					voiceDuration.value = formatVoiceTime(voiceAudio.duration)
				}
			})
		}
		if (currentVoiceIndex.value === index && isVoicePlaying.value) {
			voiceAudio.pause()
			return
		}
		if (currentVoiceIndex.value === index && !isVoicePlaying.value) {
			voiceAudio.play()
			return
		}
		currentVoiceIndex.value = index
		voiceCurrentTime.value = '00:00'
		voiceDuration.value = '00:00'
		voiceAudio.src = $tool.imgReplace ? $tool.imgReplace(src) : src
		voiceAudio.play()
	}
	
	
	// 页面隐藏时停止播放
	onHide(() => {
		if (voiceAudio && isVoicePlaying.value) {
			voiceAudio.pause()
			isVoicePlaying.value = false
		}
	})
	
	// 页面卸载时停止播放
	onUnload(() => {
		if (voiceAudio) {
			voiceAudio.stop()
			voiceAudio.destroy()
			voiceAudio = null
			isVoicePlaying.value = false
			currentVoiceIndex.value = -1
		}
	})

	onUnmounted(() => {
		if (voiceAudio) {
			voiceAudio.destroy()
		}
	})
	// -----------------------我的声音 end
	
	//切换tab
	const handleTabChange = (tabInfo) => {
		if (tabInfo.path === '/pages/videolist/videolist') {
			getData()
		    console.log('切换导航执行/pages/videolist/videolist')
		}
	}
	//重复点击触发
	const handleTabReclick = (tabInfo) => {
		if (tabInfo.path === '/pages/videolist/videolist') {
		    console.log('重复点击导航执行/pages/videolist/videolist')
		}
	}
	
	 //我的作品按钮
	const anli = (index) =>{
		query.value.type = index
		if(query.value.type == 2){
			query.value.status = 1
		}else{
			query.value.status = 0
		}
		getData()
	}
	
	//切换状态按钮
	const zhuangtai = (index) =>{
		query.value.status = index
		getData()
	} 
	
	//切换分类按钮
	const aitiaozhuan = (index) =>{
		query.value.classify = index
		if (voiceAudio && isVoicePlaying.value) {
			voiceAudio.pause()
			isVoicePlaying.value = false
		}
		getData()
	}
	
	const getLsit = () => {
		$http.get('Video/list', query.value).then(res => {
			if(res.code == 200){
				let list = res.data.rows
				total.value = res.data.total
				stats.value = res.data.stats
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
	
	
	const goinfo = (id) => { 
		$page.open('/pages/videolist/info?id='+id,true)
	}
	
	//重做视频
	const redo = (index) => {
		const data = dataList.value[index];
		// 1. 处理 form 数据：对 URL 字段（reference）进行编码，避免特殊字符问题
		const form = {
			'desc': encodeURIComponent(data.desc || ''), // 提示词也编码（防止含中文/特殊符号）
			'reference': encodeURIComponent(
				Array.isArray(data.reference)
					? JSON.stringify(data.reference)
					: (data.reference || '')
			),
			'proportion': encodeURIComponent(data.proportion || ''),
			'duration': encodeURIComponent(data.duration || ''),
			'model': encodeURIComponent(data.model || ''), // 模型参数
			'quality': encodeURIComponent(data.size || '') // 清晰度参数
		};

		// 2. 处理 additional 字段（用于 seedance2.0 的 multimodal、video_url、audio_url）
		if (data.additional && Object.keys(data.additional).length > 0) {
			form.additional = encodeURIComponent(JSON.stringify(data.additional));
		}

		// 3. 将 form 序列化为 key=value 格式的查询字符串
		const queryStr = Object.entries(form)
			.filter(([key, value]) => value) // 过滤空值
			.map(([key, value]) => `${key}=${value}`) // 遍历键值对，转为 "key=value"
			.join('&'); // 用 & 连接所有键值对，形成查询串（如 "desc=xxx&reference=xxx"）

		// 4. 拼接路径与查询串，执行跳转（注意路径与查询串之间加 ?）
		const targetUrl = `/pages/sora/sora?${queryStr}`;
		$page.open(targetUrl, true)
	}

	
	onLoad(() =>{
		const config = WEBCONFIG?.value || '';
		if(config){
			shareData.value.title = config.sys.share_desc
			shareData.value.path = '/pages/index/index?spread='
			shareData.value.query ='/pages/index/index?spread='
			shareData.value.imageUrl = $tool.imgReplace(config.sys.logo) ? $tool.imgReplace(config.sys.logo) : '/static/img/cpimg.png'
		}
		// 初始化URL参数
		// #ifdef H5
	    initUrlParams();
		// #endif
		getData()

	})
	
	// 在onShow中也确保参数存在
	onShow(() => {
	  // #ifdef H5
	  setTimeout(() => {
	    ensureUrlHasParams();
	  }, 100);
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
	
	onPullDownRefresh(() =>{
		setTimeout(function () {
			keyword.value = ''
			getData()
		    uni.stopPullDownRefresh();
		}, 1000);
		
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
	.video_kuang{
		background-color: #1f1f1f;
	}
	.tips_kuang{
		border: 2rpx solid #555555; 
		border-radius: 20rpx;
		padding: 15rpx 25rpx;
	}
	
	.create-bar{
		display: flex;
		justify-content: flex-end;
		
		.create-btn{
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 14rpx 28rpx;
			border-radius: 30rpx;
			font-size: 26rpx;
			font-weight: bold;
			color: #fff;
			background: linear-gradient(130deg,
				#3b82f6 10%,
				#1d4ed8 30%,
				#1d4ed8 70%,
				#3b82f6 100%
			);
			
			&:active{
				opacity: 0.8;
				transform: scale(0.96);
			}
		}
	}
	.box{
		padding: 30rpx;
	}
	.bnt0{
		border-radius: 100rpx;
		color: #fff;
		padding: 20rpx 35rpx;
		background: linear-gradient(130deg,
		  #555555 0%,    /* 左侧10%的浅色 */
		  #363636 100%   /* 右侧10%的浅色 */
		);
	}
	.bnt{
		border-radius: 100rpx;
		color: #fff;
		padding: 20rpx 35rpx;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
	}
	.daohang{
		padding: 15rpx;
		width: 100%;
		border-radius: 100rpx;
		background: #232327;
		position: relative;
		.dh_bnt1{
			border-radius: 100rpx;
			color: #c2c2c2;
			padding: 15rpx 40rpx;
			background: linear-gradient(130deg,
			  #555555 0%,    /* 左侧10%的浅色 */
			  #363636 100%   /* 右侧10%的浅色 */
			);
		}
		.dh_bnt2{
			border-radius: 100rpx;
			color: #fff;
			padding: 15rpx 40rpx;
			background: linear-gradient(130deg,
			 #ff0000 10%,    /* 左侧10%的浅色 */
			 #b10000 30%,   /* 中间80%的深色起始点 */
			 #b10000 70%,   /* 中间80%的深色结束点 */
			 #ff0000 100%   /* 右侧10%的浅色 */
			);
		}
		.num{
			position: absolute;
			top: 10rpx;
			font-size: 24rpx;
			color: #1f1f1f;
			border-radius: 100rpx;
			background-color: #ffb83d;
			padding: 0rpx 5rpx;
			opacity: 0.6;

		}
	}
	.k_bnt_del{
		border-radius: 20rpx 0 20rpx 0;
		padding: 6rpx 20rpx;
		font-size: 24rpx;
		background-color: #646464;
		opacity: 0.8;
	}
	.k_bnt_del_abs{
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
	}
	.list{
		margin-top: 30rpx;
		padding: 20rpx;
		border-radius: 20rpx;
		background: #232327;
		.kuang{
			position: relative;
		}
		.piao{
			position: absolute;
			left: 0;
		}
		.img{
			width: 200rpx;
			height: 200rpx;
			border-radius: 20rpx;
		}
		.title{
			color: #c3c3c3;
		}
		.right{
			margin-left: 25rpx;
			width: 64%;
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
		.k_bnt_gongkai{
			border-radius: 100rpx;
			color: #fff;
			padding: 6rpx 20rpx;
			font-size: 24rpx;
			background-color: #ff5500;
		}
		.k_bnt_gongkai1{
			border-radius: 100rpx;
			color: #d5d5d5;
			padding: 6rpx 20rpx;
			font-size: 24rpx;
			background-color: #3f3f3f;
		}

		.video_action_btn{
				display: flex;
				align-items: center;
				gap: 8rpx;
				padding: 6rpx 14rpx;
				border-radius: 50rpx;
				font-size: 24rpx;
				color: #fff;
				font-weight: 500;
				transition: all 0.3s ease;
				border: 2rpx solid transparent;
				
				&.primary{
					background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
					box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
					
					&:active{
						transform: scale(0.95);
						box-shadow: 0 2rpx 8rpx rgba(59, 130, 246, 0.2);
					}
				}
				
				&.secondary{
					background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
					box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.3);
					
					&:active{
						transform: scale(0.95);
						box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.2);
					}
				}
				
				&.success{
					background: linear-gradient(135deg, #10b981 0%, #059669 100%);
					box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
					
					&:active{
						transform: scale(0.95);
						box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.2);
					}
				}
				
				&.loading{
					background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
					opacity: 0.7;
					pointer-events: none;
				}
			}
	}
	/* ========== 图片作品卡片（干净展示，点击后弹出面板） ========== */
	.list_gc.list_gc_img{
		width: calc((100% - 30rpx) / 2);
		flex: 0 0 calc((100% - 30rpx) / 2);
		box-sizing: border-box;
		border-radius: 24rpx;
		overflow: visible;
		box-shadow: 0 6rpx 24rpx rgba(0,0,0,0.18);

		.tupian.tupian_square{
			width: 100%;
			height: 0;
			padding-bottom: 100%;
			position: relative;
			overflow: hidden;
			border-radius: 24rpx;
		}

		.tupian_square .img{
			position: absolute !important;
			left: 0; top: 0;
			width: 100% !important;
			height: 100% !important;
			border-radius: 24rpx;
			z-index: 0;
		}

		/* 遮罩层 */
		.jiazai_kuang{ z-index: 2; }
		.error_kuang{ z-index: 2; }

		/* 公开/隐藏状态角标：右上角小标签 */
		.img_pub_tag{
			position: absolute;
			top: 14rpx;
			right: 14rpx;
			z-index: 3;
			padding: 6rpx 14rpx;
			border-radius: 999rpx;
			font-size: 20rpx;
			font-weight: 600;
			letter-spacing: 1rpx;
		}
		.img_pub_tag--pub{
			background: rgba(234,88,12,0.82);
			color: #fff;
			border: 1rpx solid rgba(254,215,170,0.6);
		}
		.img_pub_tag--hide{
			background: rgba(55,65,81,0.78);
			color: #e5e7eb;
			border: 1rpx solid rgba(156,163,175,0.4);
		}
	}

	/* ========== 图片操作面板（类 Instagram/iOS 分享卡，底部弹出） ========== */
	.img_sheet{
		padding: 16rpx 32rpx 48rpx;
		background: rgba(28,28,30,0.96);
		backdrop-filter: blur(40rpx);
		-webkit-backdrop-filter: blur(40rpx);

		/* 顶部圆角把手 */
		.img_sheet_handle{
			padding: 16rpx 0 28rpx;
			.handle_bar{
				width: 72rpx;
				height: 8rpx;
				border-radius: 999rpx;
				background: rgba(255,255,255,0.25);
			}
		}

		/* 预览图：黑色背景 + 圆角 + 点击放大 */
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

		/* 操作按钮网格：横向均分，宽松间距 */
		.img_sheet_actions{
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-around;
			align-items: flex-start;
		}

		/* 每个操作按钮：图标在上、文字在下，垂直排列 */
		.sheet_action_item{
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			min-width: 100rpx;
			padding: 0 8rpx;
			&:active{ opacity: 0.65; }
		}

		/* 小圆图标背景 */
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
		.sheet_act_pub{ background: rgba(249,115,22,0.15); border: 1.5rpx solid rgba(253,186,116,0.4); }
		.sheet_act_hide{ background: rgba(75,85,99,0.25); border: 1.5rpx solid rgba(156,163,175,0.35); }
		.sheet_act_del{ background: rgba(239,68,68,0.12); border: 1.5rpx solid rgba(252,165,165,0.35); }

		/* 按钮文字 */
		.sheet_action_label{
			font-size: 22rpx;
			color: rgba(255,255,255,0.75);
			line-height: 1.2;
			text-align: center;
		}
	}
	.list_gc{
		margin-top: 30rpx;
		border-radius: 20rpx;
		position: relative;
		.tupian{
			position: relative;
		}
		.img{
			width: 320rpx;
			height: 500rpx;
			border-radius: 20rpx;
		}
		/* 正方形图片（我的形象） */
		.tupian_square{
			position: relative;
		}
		.tupian_square .img{
			width: 320rpx;
			height: 320rpx;
			border-radius: 20rpx;
		}
		.tupian_square_name{
			position: absolute;
			bottom: 5rpx;
			left: 0;
			right: 0;
			width: 100%;
			text-align: center;
			color: #fff;
			font-size: 28rpx;
			padding: 15rpx 20rpx;
			background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
			border-radius: 0 0 20rpx 20rpx;
		}
		.title{
			width: 300rpx;
			height: 75rpx;
			color: #c3c3c3;
			padding: 10rpx;
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
		.bnt_kuang{
			position: absolute;
			z-index: 3;
			bottom: 20rpx;
			left: 0;
			right: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 16rpx;
			
			
			// 旧样式保留以防其他地方使用
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
	

		.text_kuang{
			position: absolute;
			z-index: 3;
			bottom: 8rpx;
			background-color: rgba(0,0,0,0.5);
			border-bottom-left-radius: 20rpx;
			border-bottom-right-radius: 20rpx;
			.text{
				width: 320rpx;
				position: relative;
				padding: 15rpx 0;
				text-align: center;
				font-size: 28rpx;
				font-weight: bold;
				color: #fff;
			}
			.text_shibai{
				width: 320rpx;
				position: relative;
				padding: 15rpx 0;
				text-align: center;
				font-size: 28rpx;
				font-weight: bold;
				color: #ff0000;
				
			}
		}

		.jiazai_kuang{
			position: absolute;
			z-index: 1;
			 top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0,0,0,0.5);
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 20rpx;
			.text{
				width: 320rpx;
				position: relative;
				padding: 15rpx 0;
				text-align: center;
				font-size: 28rpx;
				font-weight: bold;
				color: #fff;
			}
		}
		
		.error_kuang{
			background-color: rgba(0,0,0,0.7);
			
			.error_content{
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 16rpx;
			}
			
			.error_icon{
				width: 100rpx;
				height: 100rpx;
				border-radius: 50%;
				background: rgba(239, 68, 68, 0.15);
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			.error_text{
				font-size: 32rpx;
				font-weight: bold;
				color: #ef4444;
			}
			
			.error_tips{
				font-size: 24rpx;
				color: #8b8b8b;
				text-align: center;
				padding: 0 20rpx;
			}
			
			.error_retry_btn{
				margin-top: 20rpx;
				display: flex;
				align-items: center;
				gap: 10rpx;
				padding: 16rpx 32rpx;
				background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
				border-radius: 50rpx;
				
				text{
					font-size: 28rpx;
					color: #fff;
					font-weight: bold;
				}
			}
		}
	}

	/* 我的声音列表 - 参考图样式 */
	.voice_list{
		margin-top: 30rpx;
	}
	.voice_card{
		position: relative;
		margin-bottom: 24rpx;
		border-radius: 24rpx;
		background: linear-gradient(135deg, #2a2a2e 0%, #1c1c1f 100%);
		padding: 30rpx;
		box-sizing: border-box;
		overflow: hidden;
	}
	
	/* 状态遮罩层 */
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
		background: rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10rpx);
		border-radius: 24rpx;
	}
	.status_content{
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}
	.status_icon{
		width: 100rpx;
		height: 100rpx;
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
		font-size: 32rpx;
		font-weight: bold;
		
		&.creating{
			color: #3b82f6;
		}
		&.failed{
			color: #ef4444;
		}
	}
	.status_tips{
		font-size: 24rpx;
		color: #8b8b8b;
	}
	.retry_btn{
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 16rpx 32rpx;
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		border-radius: 50rpx;
		
		text{
			font-size: 28rpx;
			color: #fff;
			font-weight: bold;
		}
	}
	
	/* 卡片内容 */
	.voice_card_content{
		&.disabled{
			opacity: 0.3;
			pointer-events: none;
		}
	}
	
	.voice_card_top{
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	.voice_icon_box{
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		border: 1rpx solid rgba(255,255,255,0.12);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
		flex-shrink: 0;
	}
	.voice_icon_wave{
		display: flex;
		align-items: flex-end;
		gap: 4rpx;
		height: 28rpx;
	}
	.wave_bar_mini{
		width: 4rpx;
		height: 12rpx;
		border-radius: 2rpx;
		background: rgba(0,187,255,0.7);
	}
	.wave_bar_mini:nth-child(1){ height: 8rpx; }
	.wave_bar_mini:nth-child(2){ height: 18rpx; }
	.wave_bar_mini:nth-child(3){ height: 12rpx; }
	.wave_bar_mini:nth-child(4){ height: 22rpx; }
	.wave_bar_mini:nth-child(5){ height: 10rpx; }
	.voice_name_box{
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}
	.voice_name{
		flex: 1;
		font-size: 28rpx;
		color: #e0e0e0;
		min-width: 0;
	}
	.voice_status_badge{
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		flex-shrink: 0;
		
		&.success{
			background: rgba(16, 185, 129, 0.15);
			border: 1rpx solid rgba(16, 185, 129, 0.3);
			
			text{
				font-size: 22rpx;
				color: #10b981;
			}
		}
	}
	.voice_card_mid{
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}
	.voice_wave_teal{
		flex: 1;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 4rpx;
		height: 48rpx;
		padding: 0 40rpx;
	}
	.wave_bar_teal{
		flex: 1;
		min-width: 4rpx;
		height: 12rpx;
		border-radius: 4rpx;
		background: rgba(0,200,180,0.5);
		transition: height 0.15s ease;
	}
	.wave_bar_teal.playing{
		background: #00c8b4;
		animation: wave_teal 0.5s ease-in-out infinite;
	}
	.wave_bar_teal.playing:nth-child(odd){ animation-delay: 0.1s; }
	@keyframes wave_teal{
		0%, 100% { height: 12rpx; }
		50% { height: 40rpx; }
	}
	.voice_card_btm{
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 32rpx;
	}
	.voice_btn{
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: rgba(255,255,255,0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		
		&.disabled{
			opacity: 0.3;
			pointer-events: none;
		}
	}
	.voice_btn_play{
		width: 88rpx;
		height: 88rpx;
		background: rgba(255,255,255,0.22);
	}
	/* 播放：三角形 */
	.icon_play{
		width: 0;
		height: 0;
		border-left: 24rpx solid #fff;
		border-top: 16rpx solid transparent;
		border-bottom: 16rpx solid transparent;
		margin-left: 8rpx;
	}
	/* 暂停：两条竖线 */
	.icon_pause{
		display: flex;
		gap: 12rpx;
		align-items: center;
		justify-content: center;
	}
	.icon_pause_bar{
		width: 10rpx;
		height: 32rpx;
		background: #fff;
		border-radius: 4rpx;
	}
	// ========== 图片预览弹窗 ==========
	.tupian_desc {
		font-size: 28rpx;
		color: #9ca3af;
		margin-top: 8rpx;
		padding: 0 4rpx;
	}

</style>
