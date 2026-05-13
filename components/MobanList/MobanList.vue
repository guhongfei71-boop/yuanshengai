<template>
	<view class="infobox">
		<scroll-view scroll-y="true" class="scroll-Y" @scrolltolower="handleReachBottom">
			<view class="biaoti">模板库列表</view>
			<view class="list acea-row m_top_20" v-if="total">	
				<view class="img_kuang" @click="onclick(item)" v-for="(item,index) in dataList" :key="index">
				<view class="text_kuang">
					<view class="text text_display">{{item.title}}</view>
				</view>
				<image :src="item?.img ? $tool.imgReplace(item.img) : '/static/img/300-200.png'" class="img" mode="aspectFill"></image>
				</view>
			</view>
			<view v-else class="m_top_30">
				<u-empty text="暂无数据" mode="list" color="#757581" icon-color="#757581"></u-empty>
			</view>
			<view class="m_top_30" v-if="total">
				<u-loadmore :status="status" :load-text="loadText"/>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import { ref, defineEmits } from 'vue'
	import { onLoad, onReachBottom, onPullDownRefresh} from '@dcloudio/uni-app'
	import siteurl from '@/utils/siteurl.js'
	import { useRefs, useWebConfigStore, useUserStore } from '@/stores'
	import { useCache, $http, $tool, $page ,wechatSDK } from '@/utils'
	
	
	
	const latitude = ref('') //纬度
	const longitude = ref('') //经度
	const emit = defineEmits(['close']);
	
	//加载列表数据-------------------------------------start
	const keyword = ref('')
	const query = ref({
		page: 1,
		pageSize: 10,
		where:[],
		prop:'id desc',
		
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
		uni.showLoading({
			title: '加载中...'
		})
		$http.get('Index/mobanList', query.value).then(res => {
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
			uni.hideLoading()
		})
	}
	
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
	
	//加载列表数据-------------------------------------end
	
	
	const onclick = (item) => {
		emit('close',item);
	}

	//开始执行地址组件内容
	const open = () => {
		getData()
	}

	const handleReachBottom = () => {
	    if(!firstLoad.value){  //此处判断，上锁，防止重复请求
	    		firstLoad.value = true
	    		// 修改当前列表加载状态
	    		status.value = "loading"
	    		// 请求数据
	    		query.value.page += 1;
	    		getLsit()
	    }
	};

	
	defineExpose({
	  open // 将 open 方法暴露出去
	})
	
</script>

<style scoped lang="scss">

	.infobox{
		padding: 0rpx 0rpx;
	}
	.scroll-Y {
		height: 800rpx;
	}
	.biaoti{
		font-size: 32rpx;
		font-weight: bold;
		color: #dfdfdf;
		text-align: center;
	}
	.list{
		padding: 0rpx 0rpx;
		.img_kuang{
			position: relative;
			margin: 15rpx 15rpx;
		}
		.img{	
			width: 300rpx;
			height: 300rpx;
			border-radius: 20rpx;
		}
		.text_kuang{
			position: absolute;
			z-index: 1;
			bottom: 8rpx;
			background-color: rgba(0,0,0,0.5);
			border-bottom-left-radius: 20rpx;
			border-bottom-right-radius: 20rpx;
			.text{
				width: 300rpx;
				position: relative;
				padding: 15rpx 0;
				text-align: center;
				font-size: 28rpx;
				font-weight: bold;
				color: #fff;
				
			}
		}
	}
</style>