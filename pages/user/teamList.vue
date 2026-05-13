<template>
	<view class="box">
		<view>
			<view class="daohang acea-row row-between-wrapper">
				<view :class="query.type == 0 ? 'dh_bnt2' : 'dh_bnt1'" @click="zhuangtai(0)">直邀团员</view>
				<view :class="query.type == 1 ? 'dh_bnt2' : 'dh_bnt1'"  @click="zhuangtai(1)">二级团员</view>
			</view>
			<view v-if="total">
				<view class="list m_top_30"  v-for="(item,index) in dataList" :key="index">
					<view class="acea-row">
						<view class="acea-row row-center-wrapper">
							<image :src="$tool.imgReplace(item.avatar) ? $tool.imgReplace(item.avatar) : '/static/img/user1.png'" class="touxiang"></image>
						</view>
							
						<view style="margin-left: 40rpx; width: 400rpx;" class="text_display">
							<view class="list-title">{{item.nickname}}</view>
							<view class="title2">{{item.trantime1}} 关联 | {{item.trantime2}} 在线</view>
							<view class="icon3 acea-row">
								<view :class="item.group_time?'bg1_1':'bg1'">VIP</view>
								<view class="bg2" v-if="item.group_type == 2">后台赠送</view>
								<view class="bg2" v-if="item.group_type == 3">激活码激活</view>
							</view>
						</view>
					</view>
					<view class="m_top_40" v-if="item.fail_msg">
						<u-alert-tips type="info" :title="'拒绝原因:'+item.fail_msg" :title-style="tips_style"></u-alert-tips>
					</view>
				</view>
			</view>
			<view v-else class="card m_top_30">
				<u-empty text="暂无数据" mode="list" iconColor="#484a4d"></u-empty>
			</view>
			<view class="m_top_30" v-if="total">
				<u-loadmore :status="status" :load-text="loadText"/>
			</view>
			
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad , onReachBottom,onPullDownRefresh } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	const {  setUserInfo,clearUserInfo } = useUserStore()
	const { USERINFO } = useRefs(useUserStore())
	
	const keyword = ref('')
	// v-model绑定的这个变量不要在分页请求结束中自己赋值，直接使用即可
	const query = ref({
		page: 1,
		pageSize: 10,
		where:[],
		prop:'id desc',
		type:0,
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
	
	const getLsit = () => {
		$http.get('User/teamlist', query.value).then(res => {
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
	
	//切换状态按钮
	const zhuangtai = (index) =>{
		query.value.type = index
		getData()
	} 
	
	onLoad((query) =>{
		getData()
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
	.daohang{
		padding: 25rpx 50rpx;
		width: 100%;
		border-radius: 20rpx;
		background: #232327;
		position: relative;
		.dh_bnt1{
			font-size: 32rpx;
			border-radius: 100rpx;
			color: #c2c2c2;
			padding: 25rpx 70rpx;
			background: linear-gradient(130deg,
			  #555555 0%,    /* 左侧10%的浅色 */
			  #363636 100%   /* 右侧10%的浅色 */
			);
		}
		.dh_bnt2{
			font-size: 32rpx;
			border-radius: 100rpx;
			color: #fff;
			padding: 25rpx 70rpx;
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
	.list{
		background-color: #232327;
		border: 2rpx solid #333338;
		border-radius: 20rpx;
		padding: 30rpx 35rpx;
		.touxiang{
			width: 100rpx;
			height: 100rpx;
			border-radius: 100%;
		}
		.list-title{
			color: #bdbdbd;
			font-weight: bold;
		}
		.title2{
			color: #838383;
			padding: 15rpx 0;
			font-size: 24rpx;
		}
		.icon{
			margin-right: 20rpx;
			border-radius: 100rpx;
			background-color: #eaeaea;
			width: 35rpx;
			height: 35rpx;
		}

		.icon3{
			margin-top: 8rpx;
			.bg1{
				font-size: 24rpx;
				border-radius: 10rpx;
				padding: 0rpx 10rpx;
				background-color: #909090;
				margin-right: 15rpx;
			}
			.bg1_1{
				font-size: 24rpx;
				border-radius: 10rpx;
				padding: 0rpx 10rpx;
				background-color: #ffaa00;
				color: #FFFFFF;
				margin-right: 15rpx;
			}
			.bg2{
				font-size: 24rpx;
				border-radius: 10rpx;
				padding: 0rpx 10rpx;
				background-color: #55aa7f;
				color: #FFFFFF;
				margin-right: 15rpx;
			}
		}
		
	}
</style>
