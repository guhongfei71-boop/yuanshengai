<template>
	<view class="box">
		<view>
			<view v-if="total">
				<view class="list m_top_30"  v-for="(item,index) in dataList" :key="index">
					<view class="acea-row row-between-wrapper">
						<view class="acea-row">
							<image :src="$tool.imgReplace(USERINFO.userInfo?.avatar) ? $tool.imgReplace(USERINFO.userInfo?.avatar) : '/static/img/user1.png'" class="touxiang"></image>
							<view style="margin-left: 40rpx; width: 300rpx;" class="text_display">
								<view class="list-title acea-row row-middle" style="color: #55aa00;" v-if="item.status == 1">
									已付款
								</view>
								<view class="list-title acea-row row-middle" style="color: #9e9e9e;" v-if="item.status == 0">
									审核中
								</view>
								<view class="list-title acea-row row-middle" style="color: #ff0000;" v-if="item.status == -1">
									拒绝
								</view>
								<view class="time">
									{{item.add_time}}
								</view>
							</view>
						</view>
						<view class="jifen">
							<text style="color: #9e9e9e;">￥{{item.extract_price}}</text>
						</view>
					</view>
					<view class="m_top_40" v-if="item.fail_msg">
						<u-alert-tips type="error" :title="'拒绝原因:'+item.fail_msg" :title-style="tips_style"></u-alert-tips>
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
	
	const getLsit = () => {
		$http.get('Extract/extractlist', query.value).then(res => {
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
	.list{
		background-color: #232327;
		border: 2rpx solid #333338;
		border-radius: 20rpx;
		padding: 30rpx 35rpx;
		.touxiang{
			width: 90rpx;
			height: 90rpx;
			border-radius: 100%;
		}
		.list-title{
			color: #bdbdbd;
			font-size: 32rpx;
			font-weight: bold;
		}
		.icon{
			margin-right: 20rpx;
			border-radius: 100rpx;
			background-color: #eaeaea;
			width: 35rpx;
			height: 35rpx;
		}
		.jifen{
			text-align: center;
			font-weight: bold;
		}
		.time{
			margin-top: 20rpx;
			color: #838383;
			font-size: 24rpx;
		}
	}
</style>
