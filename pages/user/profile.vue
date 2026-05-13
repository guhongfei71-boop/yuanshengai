<template>
	<view class="infobox">
		<view class="box">
			<view class="top">
				<u-navbar title="" :is-back="false" :border-bottom="false" :background="dhbj" title-color="#ffffff"></u-navbar>
			</view>
			<view class="card_wk">
				<u-navbar title="" :is-back="false" :border-bottom="false" :background="dhbj" title-color="#ffffff"></u-navbar>
				<view class="card_box">
					<!-- 头像名称 -->
					<veiw>
						<view class="acea-row row-center">
							<view class="tx_kuang circle-breath">
								<image :src="$tool.imgReplace(USERINFO?.userInfo.avatar) ? $tool.imgReplace(USERINFO?.userInfo.avatar) : '/static/img/user1.png'" class="touxiang"></image>
							</view>
						</view>
						<view class="desc_kj">
							<view class="touxiang_text">
								{{USERINFO?.userInfo.nickname}}
							</view>
							<view class="acea-row row-center m_top_30">
								<view class="jibie acea-row row-middle">
									<image :src="USERINFO?.userInfo.group_day == 0 ? '/static/img/VIP0.png' : '/static/img/VIP.png'" class="icon"></image>{{USERINFO?.userInfo.group_name}}
								</view>
								<view class="jibie acea-row row-middle" style="margin-left:30rpx ;" v-if="USERINFO?.userInfo.sing_ok">
									<image src="/static/img/qiandao.png" class="icon"></image>每日签到
								</view>
								<view class="jibie acea-row row-middle" style="margin-left:30rpx ;" v-else @click="signPoints">
									<image src="/static/img/qiandao_1.png" class="icon"></image>每日签到
								</view>
							</view>
							
						</view>
					</veiw>
					
					<!-- 统计数量 -->
					<view class="tongji_kuang acea-row row-between-wrapper m_top_50">
						<view class="tongji" @click="golink('videolist')">
							<view class="num">{{USERINFO?.userInfo.work_num}}</view>
							<view class="text">作品数量</view>
						</view>
						<view class="tongji" @click="golink('points')">
							<view class="num">{{Math.floor(USERINFO?.userInfo.integral)}}</view>
							<view class="text">我的积分</view>
						</view>
						<view class="tongji" @click="golink('team')">
							<view class="num">{{USERINFO?.userInfo.team_num}}</view>
							<view class="text">我的团队</view>
						</view>
					</view>
					<!-- 会员 -->
					<view class="vip" @click="$page.open('/pages/pay/buyPoints',true)">
						<image src="/static/img/user_vip.png" class="icon"></image>
						<view class="title">积分充值</view>
						<view class="desc">积分可生成所有视频</view>
					</view>
					
					<view class="order card m_top_30">
						<view class="fuwu">
							<view class="acea-row row-between-wrapper fuwu_kj" @click="mfjifen">
								<view class="acea-row row-middle"><uni-icons type="vip" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>免费获取积分</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<!-- #ifndef H5 -->
							<view class="acea-row row-between-wrapper fuwu_kj">
								<view class="acea-row row-middle"><uni-icons type="personadd" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>
								<button open-type="share" class="custom-share-btn">
								  邀请好友
								</button>
								</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<!-- #endif -->
							
							<!-- #ifdef H5 -->
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('haoyou')">
								<view class="acea-row row-middle"><uni-icons type="personadd" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>
								  邀请好友
								</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<!-- #endif -->

							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('role')">
								<view class="acea-row row-middle"><uni-icons type="person" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>角色管理</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('distribution')" v-if="WEBCONFIG?.user.user_commission == 1">
								<view class="acea-row row-middle"><uni-icons type="staff" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>分销中心</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('exchange')">
								<view class="acea-row row-middle"><uni-icons type="wallet" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>卡密兑换</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('points')">
								<view class="acea-row row-middle"><uni-icons type="map" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>积分明细</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
						</view>
					</view>
					<!-- 其他菜单 -->
					<view class="order card m_top_30">
						<view class="fuwu">
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('kefu')">
								<view class="acea-row row-middle"><uni-icons type="headphones" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>联系客服</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('describe')">
								<view class="acea-row row-middle"><uni-icons type="flag" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>使用协议</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
							<view class="acea-row row-between-wrapper fuwu_kj" @click="golink('kefu')" v-if="WEBCONFIG?.sys.dajian_kg == 1">
								<view class="acea-row row-middle"><uni-icons type="loop" size="20" style="margin-right: 15rpx;" color="#d1d1d1" ></uni-icons>搭建一个同样的小程序</view>
								<view class="acea-row row-middle"><uni-icons type="right" size="18" style="margin-left: 10rpx;" color="#d1d1d1" ></uni-icons></view>
							</view>
						</view>
					</view>
					<view class="m_top_40">
						<view class="bnt" @click="outlogin">退出登录</view>
					</view>
					
				
				</view>
				
				<view style="height: 200rpx;"></view>
			</view>
			
			<!-- 组件区 -->
			<!-- 联系客服 -->
			<u-popup v-model="show" mode="center" border-radius="20" :closeable="true" z-index="1000">
				<view class="popup">
					<view class="m_top_10 title">联系客服</view>
					<view class="acea-row row-center m_top_40" v-if="WEBCONFIG?.sys.kefuimg">
						<image :src="$tool.imgReplace(WEBCONFIG?.sys.kefuimg)" class="img" @click="viewImg($tool.imgReplace(WEBCONFIG?.sys.kefuimg))"></image>
					</view>
				</view>
			</u-popup>
			
			<!-- 卡密兑换 -->
			<u-popup v-model="kami_show" mode="bottom" border-radius="20" :closeable="true" z-index="1001">
				<view class="kami_title">卡密兑换</view>
				<view class="kami_kuang">
					<view class="input_sry">
						<u-input v-model="key" placeholder="请输入卡密" :border="false"/>
					</view>
					<view class="bnt m_top_40" @click="activateCard">立即兑换</view>
				</view>
			</u-popup>
			
			<!-- H5分享好友 -->
			<view class="mask-share" v-if="h5_show">
				  <image src="@/static/img/share-info.png" class="img" :style="'height: '+windowHeight+'px;'" @click="h5_show = false"></image>
			</view>
			
			<!-- 免费积分 -->
			<uni-popup ref="jifenShow" type="center" border-radius="20rpx" background-color="">
				<view>
					<view class="mf_kuang">每日签到可获<text class="text">{{USERINFO?.userInfo.group_signin}}</text>积分</view>
					<view class="mf_kuang m_top_40">分享拉新人每次可获<text class="text">{{USERINFO?.userInfo.group_promotion}}</text>积分</view>
				</view>
			</uni-popup>
		</view>
		
		<!-- 自定义导航 -->
		<CustomTabBar></CustomTabBar>
	</view>
</template>

<script setup>
	import { ref,getCurrentInstance,onMounted,onUnmounted} from 'vue';
	import { onLoad,onShow,onShareAppMessage, onShareTimeline ,onReady} from '@dcloudio/uni-app'
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
	const storage = useCache();
	const userinfo = ref([])
	const model_content = ref('')
	const dhbj = ref({
		background : ''
	})
	const show = ref(false)
	const kami_show = ref(false)
	const h5_show = ref(false)
	const jifenShow = ref(null)
	const key = ref('')
	const windowHeight = ref(uni.getSystemInfoSync().windowHeight)

	
	//免费积分弹窗
	const mfjifen = () => {
		jifenShow.value.open('center')
	}
	
	//切换tab
	const handleTabChange = (tabInfo) => {
		if (tabInfo.path === '/pages/user/profile') {
			getUserInfo()
		    console.log('切换导航执行/pages/user/profile')
		}
		
	}
	//重复点击触发
	const handleTabReclick = (tabInfo) => {
		if (tabInfo.path === '/pages/user/profile') {
		    console.log('重复点击导航执行/pages/user/profile')
		}
	}
	
	const viewImg = (img) => {
		uni.previewImage({  
		    urls: [img],  
		    current: 0  
		})
	}
	
	const golink = (name) => {
		if(name == 'describe'){
			$page.open('/pages/page/page?name='+name+'&title=使用协议')
		}else if(name == 'kefu'){
			show.value = true
		}else if(name == 'points'){
			$page.open('/pages/user/points',true)
		}else if(name == 'exchange'){
			kami_show.value = true
		}else if(name == 'haoyou'){
			h5_show.value = true
		}else if(name == 'distribution'){
			$page.open('/pages/user/distribution',true)
		}else if(name == 'team'){
			$page.open('/pages/user/teamList',true)
		}else if(name == 'videolist'){
			$page.switch('/pages/videolist/videolist',true)
		}else if(name == 'role'){
			$page.open('/pages/user/role',true)
		}
	}
	
	//获取用户数据
	const getUserInfo = () => {
		$http.get('User/userinfo').then(res => {
			let data = {
				token:USERINFO.value?.token,
				userInfo:res.data
			}
			useUserStore().setUserInfo(data);
			userinfo.value = res.data
		})
	}
	
	
	//每日签到
	const signPoints = () => {
		$http.post('User/signPoints').then(res => {
			if(res.code == 200){
				getUserInfo()
				uni.showToast({
					title: res.msg,
					duration: 2000,
					icon:'none'
				});
			}
		})
	}
	
	//卡密激活
	const activateCard = () => {
		if(!key.value){
			uni.showToast({
				title: '请填写卡密',
				icon: 'none'
			})
			return false
		}
		$http.post('Pay/activation',{type:2,codes:key.value}).then(res => {
			if(res.code == 200){
				getUserInfo()
				kami_show.value = false
				key.value = ''
				uni.showToast({
					title: res.msg,
					duration: 2000,
					icon:'none'
				});
			}else{
				uni.showToast({
					title: res.msg,
					duration: 2000,
					icon:'none'
				});
			}
			
		})
	}
	
	
	//退出登录
	const outlogin = () =>{
		uni.showModal({
			title: '温馨提示',
			content: '您确定要退出登陆吗？',
			success: function (res){
				if (res.confirm) {
					$http.post('Login/logout').then(res => {
						clearUserInfo()
						storage.remove('SPREAD')
						uni.showToast({
							title: res.msg,
							duration: 2000,
							icon:'none'
						});
					
					})
				} else if (res.cancel) {
					
				}
			}
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
	
	onLoad(() => {
		// #ifdef MP-WEIXIN
		const config = WEBCONFIG?.value || '';
		if(config){
			shareData.value.title = config.sys.share_desc
			shareData.value.path = '/pages/index/index?spread='
			shareData.value.query ='/pages/index/index?spread='
			shareData.value.imageUrl = $tool.imgReplace(config.sys.logo) ? $tool.imgReplace(config.sys.logo) : '/static/img/cpimg.png'
		}
		// #endif
		
		// #ifdef H5
		initUrlParams();
		// #endif
		getUserInfo()
		
	})

	
	onReady((e) =>{
	    // #ifdef H5
	    uni.hideTabBar();
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
		background: radial-gradient(ellipse 250px 150px at 80% 5%, #41005d, #18181b);
		position: relative;
		.card_wk{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%; /* 添加这行 */
		}
		.cord{
			
		}
		.top{
			height: 900rpx;
			overflow: hidden;
		}
	}
	.mf_kuang{
		font-size: 32rpx;
		border-radius: 60rpx 0 60rpx 0;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
		border: 2rpx solid #00f3ff;
		color: #fff;
		padding: 30rpx 30rpx;
		.text{
			color: #ffff7f;
			padding: 0 10rpx;
			font-size: 58rpx;
			font-weight: bold;
		}
	}
	.circle-breath {
		//box-shadow: 0 0 0 0 rgb(204, 73, 152);
		border-radius: 100rpx;
		//font-size: 24rpx;
		animation: donghua 1s infinite;
	}
	
	@keyframes donghua {
		0% {
			//transform: scale(0.60);
			/* 注意rgba中的a的设置 */
			box-shadow: 0 0 0 0 rgba(0, 255, 183, 0.7);
		}
	
		60% {
			//transform: scale(1);
			box-shadow: 0 0 0 20rpx rgba(0, 255, 183, 0.0);
		}
	
		100% {
			//transform: scale(0.60);
			box-shadow: 0 0 0 0 rgba(0, 255, 183, 0.0);
		}
	}
	.mask-share {
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  z-index: 1888;
	  .img {
	    width: 100%;
	  }
	}
	/* 去除button默认样式 */
	.custom-share-btn {
	    background: none !important;
	    border: none !important;
	    padding: 0 !important;
	    margin: 0 !important;
	    line-height: normal !important;
	    font-size: inherit !important;
	    color: inherit !important;
	    border-radius: 0 !important;
	    width: auto !important;
	    height: auto !important;
	    min-width: 0 !important;
	    min-height: 0 !important;
	}
	
	/* 去除button的点击效果 */
	.custom-share-btn::after {
	    border: none !important;
	    content: none !important;
	}
	
	/* 如果需要，可以设置hover和active状态 */
	.custom-share-btn:hover,
	.custom-share-btn:active {
	    background: none !important;
	    opacity: 1 !important;
	}
	.kami_title{
		margin-top: 30rpx;
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		color: #000;
	}
	.kami_kuang{
		padding: 50rpx;
		.input_sry{
			padding: 10rpx 40rpx;
			border: #cecece solid 2rpx;
			border-radius: 20rpx;
		}
	}
	.vip{
		padding: 30rpx 50rpx;
		background: linear-gradient(130deg,
		  #ff0000 10%,    /* 左侧10%的浅色 */
		  #b10000 30%,   /* 中间80%的深色起始点 */
		  #b10000 70%,   /* 中间80%的深色结束点 */
		  #ff0000 100%   /* 右侧10%的浅色 */
		);
		border-radius: 0 0 20rpx 20rpx;
		position: relative;
		.title{
			font-size: 38rpx;
			font-weight: bold;
			color: #ffffff;
		}
		.desc{
			margin-top: 10rpx;
			color: #e5e5e5;
			font-size: 30rpx;
		}
		.icon{
			width: 178rpx;
			height: 166rpx;
			position: absolute;
			right: 50rpx;
			top: -20rpx;
		}
	}
	.bnt{
		border-radius: 20rpx;
		color: #fff;
		padding: 25rpx;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
		text-align: center;
		font-size: 32rpx;
	}
	
	.card_box{
		padding: 20rpx 35rpx;
		.touxiang{
			width: 150rpx;
			height: 150rpx;
			border-radius: 100%;
		}
		.desc_kj{
			text-align: center;
		}
		.touxiang_text{
			font-size: 32rpx;
			margin-top: 20rpx;
			font-weight: bold;
			color: #dddddd;
		}
		.jibie{
			padding: 10rpx 20rpx;
			 background-color: rgba(227, 210, 255, 0.1);
			border-radius: 100rpx;
			isplay: flex;
			justify-content: center; /* 水平居中 */
			color: #a2a2a2;
			.icon{
				width: 40rpx;
				height: 40rpx;
				margin-right: 10rpx;
			}
		}
		.tongji_kuang{
			background: linear-gradient(130deg,
			  #46464d 10%,    /* 左侧10%的浅色 */
			  #333338 100%   /* 右侧10%的浅色 */
			);
			border-radius: 20rpx 20rpx 0 0;
			width: 100%;
			opacity: 0.9;
			.tongji {
			  width: 31%;
			  padding: 30rpx 26rpx;
			  border-radius: 20rpx;
			  position: relative; /* 确保 after 定位正确 */
			}
			.tongji:after {
			  content: "";
			  position: absolute;
			  right: 0; /* 边线靠最右侧（替代原 margin-left） */
			  top: 0;
			  height: 100%; /* 继承父元素高度 */
			  width: 2rpx; /* 边线宽度 = 原 border-right 宽度 */
			  
			  /* 核心：垂直渐变（上下透明，中间有颜色） */
			  background-image: linear-gradient(
			    to bottom, /* 渐变方向：从上到下 */
			    transparent 0%, /* 顶部开始透明 */
			    #505050 20%, /* 上 20% 仍透明 */
			    #505050 80%, /* 80% 后恢复透明 */
			    transparent 100% /* 底部完全透明 */
			  );
			  
			  /* 可选：优化渐变过渡（避免边缘模糊） */
			  background-size: 100% 100%;
			  background-repeat: no-repeat;
			}

			.tongji:last-child:after {
			  display: none; /* 隐藏边线 */
			}
			
			.num{
				font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
				color: #ffffff;
				font-size: 42rpx;
				text-align: center;
			}
			.text{
				margin-top: 10rpx;
				text-align: center;
				color: #b5b5b5;
			}
		}
		.card{
			padding: 30rpx 40rpx;
			background-color: #232327;
			border-radius: 20rpx;
		}
		.order{
			.order_top{
				padding-bottom: 30rpx;
				border-bottom: 2rpx solid #333338;
			}
			.title{
				font-size: 32rpx;
				font-weight: bold;
				color: #ebebeb;
			}
			.title_right{
				color: #737373;
			}
			.order_kj{
				padding: 30rpx 20rpx 0 20rpx;
			}
			.order_icon{
				width: 80rpx;
				height: 80rpx;
			}
		}
		.fuwu{
			.fuwu_kj{
				padding: 25rpx 0;
				font-size: 32rpx;
				color: #c2c2c2;
			}
		}
	}
	
	
</style>
