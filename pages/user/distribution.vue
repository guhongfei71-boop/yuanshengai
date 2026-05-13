<template>
	<view class="box">
		<view class="card acea-row row-between-wrapper">
			<view class="zhong">
				<view class="card_commission">{{userinfo.brokerage_price}}</view>
				<view class="card_title">当前佣金</view>
			</view>
			<view class="zhong">
				<image src="/static/img/money.png" class="icon" mode="aspectFill"></image>
				<view class="card_commission">{{commission_total}}</view>
				<view class="card_title acea-row row-right">已提佣金</view>
			</view>
		</view>
		<view class="anniu acea-row row-between-wrapper m_top_30">
			<view class="anniu_bnt acea-row row-center-wrapper" @click="tixian_show = true">
				<image src="/static/img/mybnt4.png" class="icon"></image>
				<text style="margin-left: 10rpx;">立即提现</text>
			</view>
			<view class="anniu_bnt acea-row row-center-wrapper" @click="$page.open('/pages/user/extractList',true)">
				<image src="/static/img/mybnt1.png" class="icon"></image>
				<text style="margin-left: 10rpx;">提现记录</text>
			</view>
		</view>
		<view>
			<view v-if="total">
				<view class="list m_top_30"  v-for="(item,index) in dataList" :key="index">
					<view class="acea-row row-between-wrapper">
						<view>
							<view class="list-title acea-row row-middle">
								{{item.title}}
							</view>
							<view class="time">
								{{item.add_time}}
							</view>
						</view>
						<view class="jifen">
							<text v-if="item.pm == 0" style="color: #9e9e9e;">- {{item.number}}</text>
							<text v-if="item.pm == 1" style="color: #00e238;">+ {{item.number}}</text>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="m_top_50">
				<u-empty text="暂无数据" mode="list" iconColor="#484a4d"></u-empty>
			</view>
			<view class="m_top_30" v-if="total">
				<u-loadmore :status="status" :load-text="loadText"/>
			</view>
			
		</view>
		
		<!-- 提现 -->
		<u-popup v-model="tixian_show" mode="bottom" border-radius="20" :closeable="true" z-index="999">
			<view class="gong_tc">
				<scroll-view scroll-y="true" class="neirong">
						<view class="title">请上传收款码</view>
						<view class="acea-row m_top_40">
							<u-upload max-count="1" ref="upload" :auto-upload="false" @on-choose-complete="upimg" @on-remove="delimg">
							</u-upload>
						</view>
				</scroll-view>
				<view class="ggbnt" @click="withdrawal()">立即提交</view>
			</view>
		</u-popup>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad , onReachBottom,onPullDownRefresh } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	const {  setUserInfo,clearUserInfo } = useUserStore()
	const { USERINFO } = useRefs(useUserStore())
	const commission_total = ref(0)
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
	const userinfo = ref([])
	
	const getLsit = () => {
		$http.get('User/financelist', query.value).then(res => {
			if(res.code == 200){
				let list = res.data.rows
				total.value = res.data.total
				commission_total.value = res.data.commission_total
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
	
	//立即提现
	const withdrawal = () => {
		let data = {
			type:3,
			cordimg:img.value,
			extract_price:userinfo.value.brokerage_price
		}
		$http.post('User/extcomm',data).then(res => {
			if(res.code == 200){
				getUserInfo()
				getData()
				tixian_show.value = false
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
	
	//图片上传------------------------------------start
	const img = ref('')
	const tixian_show = ref(false) 	//提现弹窗
	const upload = ref(null)
	
	const delimg = () => {
		img.value = ''
	}
	const upimg = (e) => {
		if(e[0].url){
			uni.showLoading({
				title: '上传中',
				mask: true
			})
			$http.upload('Upload/upload', { name:"file",filePath:e[0].url}).then(res => {
				if(res.code == 200){
					img.value = $tool.imgReplace(res.src)
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
	
	//图片上传------------------------------------end
	

	onLoad((query) =>{
		getData()
		getUserInfo()
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
	
	
</script>

<style scoped lang="scss">
	page{
		//background-color: #ffffff;
	}
	.box{
		padding: 30rpx 30rpx;
	}
	
	.gong_tc{
		padding: 50rpx;
		.neirong{
			height: 430rpx;
			.title{
				font-size: 36rpx;
				font-weight: bold;
				text-align: center;
				padding: 10rpx 0;
			}
			.desc{
				margin-top: 15rpx;
				font-size: 32rpx;
				line-height: 50rpx;
			}
		}
		.ggbnt{
			color: #ffffff;
			padding: 30rpx 0;
			background: linear-gradient(130deg,
			  #2cd2ff 10%,    /* 左侧10%的浅色 */
			  #0292ff 30%,   /* 中间80%的深色起始点 */
			  #0292ff 70%,   /* 中间80%的深色结束点 */
			  #33d3ff 100%   /* 右侧10%的浅色 */
			);
			font-weight: bolder;
			text-align: center;
			border-radius: 100rpx;
			font-size: 32rpx;
		}
		
	}
	.anniu{
		.anniu_bnt{
			width: 47%;
			padding: 30rpx;
			background-color: #232327;
			border: 2rpx solid #333338;
			border-radius: 20rpx;
			color: #bebebe;
			font-size: 36rpx;
			font-weight: bold;
		}
		.icon{
			width: 60rpx;
			height: 60rpx;
		}
	}
	.card{
		width: 100%;
		height: 230rpx;
		border-radius: 20rpx;
		background: linear-gradient(130deg,
		  #ff0000 10%,    /* 左侧10%的浅色 */
		  #b10000 30%,   /* 中间80%的深色起始点 */
		  #b10000 70%,   /* 中间80%的深色结束点 */
		  #ff0000 100%   /* 右侧10%的浅色 */
		);
		position: relative;
		.zhong{
			padding: 20rpx 50rpx;
		}
		.card_title{
			font-size: 32rpx;
			color: #ffffff;
			margin-top: 10rpx;
			opacity: 0.7;
		}
		.card_commission{
			font-size: 54rpx;
			color: #ffffff;
			font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
		}
		.icon{
			width: 290rpx;
			height: 290rpx;
			position: absolute;
			right: 190rpx;
			top: -20rpx;
			opacity: 0.3;
		}
	}
	.list{
		background-color: #232327;
		border-radius: 20rpx;
		padding: 30rpx 35rpx;
		.list-title{
			color: #bdbdbd;
			font-size: 32rpx;
		}
		.icon{
			margin-right: 20rpx;
			border-radius: 100rpx;
			background-color: #eaeaea;
			width: 35rpx;
			height: 35rpx;
		}
		.jifen{
			font-weight: bold;
		}
		.time{
			margin-top: 40rpx;
			color: #989898;
			padding: 10rpx 30rpx;
			background-color: #323238;
			border-radius: 100rpx;
			font-size: 24rpx;
		}
	}
</style>
