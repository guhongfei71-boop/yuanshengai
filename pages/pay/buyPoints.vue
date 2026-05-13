<template>
	<view class="box">
		<view class="acea-row topjifen">
			<view>您当前的积分：</view>
			<view style="color: #2cd2ff;font-weight: bold;">{{Math.floor(userinfo.integral)}}</view>
		</view>
		<view class="m_top_30" v-if="WEBCONFIG?.pay_gonggao">
			<u-notice-bar mode="horizontal" type="error" border-radius="15" :list="[WEBCONFIG?.pay_gonggao]"></u-notice-bar>
		</view>
		<view class="jifenlist acea-row row-between-wrapper m_top_50">
			<view :class="pointsId == index + 1 ? 'jifen_kuang bg' : 'jifen_kuang'" v-for="(item,index) in pointsList" :key="index" @click="choice(index,item)">
				<view class="points acea-row row-center-wrapper m_top_40">
					<image src="/static/img/jf_1.png" class="img"></image>
					<text>{{item.points}}</text>
				</view>
				<view class="money m_top_20">￥{{item.money}}</view>
			</view>
		</view>
		<view class="bnt m_top_30" @click="goPay" v-if="jixing == 'android'">
			￥{{xuan_money}}元 立即充值
		</view>
		<view v-else>
			<view class="bnt m_top_30" @click="goPay" v-if="WEBCONFIG?.ios_kg == 1">
				￥{{xuan_money}}元 立即充值
			</view>
			<view class="bnt m_top_30" v-else>苹果系统不支持虚拟支付</view>
		</view>
		
		<view class="xieyi m_top_20">
						<checkbox value="checkbox1" checked style="transform:scale(0.6)"/>
						我已阅读并同意<text style="color: #2cd2ff;" @click="$page.open('/pages/page/page?name=paydesc&title=充值协议')">《充值协议》</text></view>
						
						
		<u-popup v-model="query_show" mode="center" border-radius="20" :closeable="false" z-index="1001" :mask-close-able="false">
			<view class="popup" style="max-width: 500rpx;">
				<view class="m_top_10 title" style="text-align: center;"><u-loading mode="circle" size="80"></u-loading></view>
				<view class="acea-row row-center m_top_20" style="color: #545454;font-size: 42rpx;font-weight: bold;">
					{{count}}
				</view>
				<view class="acea-row row-center m_top_20" style="color: #545454;font-size: 32rpx;font-weight: bold;">
					支付结果查询中
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	import { pay } from '@/utils/pay.js'
	const {  setUserInfo,clearUserInfo } = useUserStore()
	
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const count = ref(10)
	const userinfo = ref([])
	const gonggao = ref([])
	const pointsList = ref([])
	const pointsId = ref(1)
	const form = ref({
		id:0,
		paytype:1,	//支付平台 1微信 2支付宝 3激活码
		type:2, //1购买会员 2购买积分
		xxsroute:''	//wx 微信公众号 mp微信小程序
	})
	const prop_id = ref('');	//道具ID
	const query_show = ref(false)
	const xuan_money = ref(0)
	const jixing = ref(uni.getSystemInfoSync().platform)
	
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
	
	//获取积分列表
	const getPointsList = () => {
		$http.get('Pay/getPointsList').then(res => {
			pointsList.value = res.data
			if(pointsList.value.length){
				form.value.id = 1
				xuan_money.value = pointsList.value[0].money
				prop_id.value = pointsList.value[0].id
			}
		})
	}
	
	// 定时查询订单状态
	const regularQuery = (order_id) => {
		$http.get('Pay/regularQuery',{id:order_id}).then(res => {
			console.log('查询充值',res)
			if(res.code == 200){
				count.value = 10
				query_show.value = false
				getUserInfo()
				uni.showToast({
					title: res.msg,
					icon: 'none'
				})
			}else{
				if (count.value > 0) {
					setTimeout(() => {
						regularQuery(order_id)
						count.value--
					}, 1000)
				} else {
					query_show.value = false
					count.value = 10
					uni.showToast({
						title: '查询订单状态失败',
						icon: 'none'
					})
				}
			}
		}).catch(err => {
			uni.hideLoading()
		})
	}
	
	
	// 点击充值按钮
	const goPay = (e) => {
		$tool.debounce(() => createOrder(e), 500,true);
	}
	
	//获取微信支付的数据
	const getPayData = async (xxsroute,order_id) => {
		if(xxsroute == 'mp'){
			wx.login({
				success: async (res) => {
					if (res.code) {
						const result = await $http.get('Login/getSessionKey', {
							code: res.code
						});
						await $http.get('Pay/pullPay', { xxsroute: xxsroute, order_id:order_id, session_key: result.data.session_key,product_id:prop_id.value }).then(res => {
							const config = res.data
							pay(xxsroute, config).then(res1 => {
								//支付成功后，开始监听查询支付状态
								console.log('xxs_pay',res1)
								query_show.value = true
								regularQuery(order_id)
							}).catch(err => {
								uni.hideLoading()
								console.log('用户取消支付',err)
								uni.showToast({
									title: err?.message || '支付失败',
									icon: 'none',
									duration: 3000
								})
							})
						})

					}
				}
			});
		}else{
			await $http.get('Pay/pullPay', { xxsroute: xxsroute, order_id:order_id }).then(res => {
				const config = res.data
				pay(xxsroute, config).then(res1 => {
					//支付成功后，开始监听查询支付状态
					console.log('xxs_pay',res1)
					query_show.value = true
					regularQuery(order_id)
				}).catch(err => {
					uni.hideLoading()
					console.log('用户取消支付',err)
				})
			})
		}
	}
	
	//创建订单
	const createOrder = (e) => {
		uni.showLoading({
			title: '加载中',
			mask: false
		})
		// #ifdef H5
			form.value.xxsroute = 'wx'
		// #endif
		// #ifdef MP-WEIXIN
			form.value.xxsroute = 'mp'
		// #endif
		$http.post('Pay/createorder', form.value).then(res => {
			if(res.code == 200){
				getPayData(form.value.xxsroute,res.data)
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
	
	//选择积分
	const choice = (index,item) => {
		xuan_money.value = item.money
		pointsId.value = index + 1
		form.value.id = pointsId.value
		prop_id.value = item?.id
	}
	onLoad((query) =>{
		getUserInfo()
		getPointsList()
		console.log(jixing.value)
	})
	
	
</script>

<style scoped lang="scss">
	page{
		//background-color: #ffffff;
	}
	.box{
		padding: 40rpx;
	}
	.gonggao{
		border-radius: 20rpx;
		background-color: #232327;
		border: 2rpx solid #333338;
		padding: 30rpx 30rpx;
		color: #ffffff;
	}
	.topjifen{
		font-size: 32rpx;
		color: #fff;
	}
	.bnt{
		font-size: 32rpx;
		text-align: center;
		border-radius: 100rpx;
		color: #fff;
		padding: 25rpx 25rpx;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
	}
	.xieyi{
		color: #b3b3b3;
		text-align: center;
	}
	.jifenlist{
		color: #ffffff;
		.jifen_kuang{
			margin-bottom: 34rpx;
			border-radius: 20rpx;
			background-color: #232327;
			border: 2rpx solid #333338;
			padding: 30rpx 20rpx;
			width: 200rpx;
			height: 250rpx;
		}
		.bg{
			background: linear-gradient(130deg,
			  #ffaa00 10%,    /* 左侧10%的浅色 */
			  #cb8700 30%,   /* 中间80%的深色起始点 */
			  #cb8700 70%,   /* 中间80%的深色结束点 */
			  #ffaa00 100%   /* 右侧10%的浅色 */
			);
			border: 2rpx solid #ffd900;
		}
		.points{
			font-size: 32rpx;
		}
		.money{
			text-align: center;
			font-size: 40rpx;
			font-weight: bold;
			
		}
		.img{
			width: 40rpx;
			height: 40rpx;
		}
	}
</style>
