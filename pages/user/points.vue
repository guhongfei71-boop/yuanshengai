<template>
	<view class="box">
		<view>
			<view v-if="total">
				<view class="list m_top_30"  v-for="(item,index) in dataList" :key="index">
					<view class="acea-row row-between-wrapper">
						<view>
							<view class="list-title acea-row row-middle">
								<image src="/static/img/jifen.png" class="icon"></image>
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
		$http.get('User/pointslist', query.value).then(res => {
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
