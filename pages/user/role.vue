<template>
	<view class="infobox">
			<view class="list acea-row" v-if="total">	
				<view class="img_kuang" v-for="(item,index) in dataList" :key="index">
				<view class="piao">
					<view class="k_bnt_del" @click="del(item.id,index)" v-if="item.status != 1">
						<uni-icons type="trash" size="16" color="#fff" ></uni-icons>
					</view>
				</view>
				<view class="jiazai_kuang" v-if="item.status == 1">
					<view class="acea-row row-center">
						<u-loading mode="circle"></u-loading>
						<view class="text">创建中</view>
					</view>
				</view>
				<view class="text_kuang">
					<view class="text_shibai text_display" v-if="item.status == 3">创建失败</view>
					<view class="text text_display" v-else>{{item.name}}</view>
				</view>
				<image :src="item?.img ? $tool.imgReplace(item.img) : '/static/img/300-200.png'" class="img" mode="aspectFill" @click="$tool.previewImage($tool.imgReplace(item.img))"></image>
				</view>
			</view>
			<view v-else class="m_top_30">
				<u-empty text="暂无数据" mode="list" color="#757581" icon-color="#757581"></u-empty>
			</view>
			<view class="m_top_30" v-if="total">
				<u-loadmore :status="status" :load-text="loadText"/>
			</view>
			<view style="height: 160rpx;"></view>
			<view class="role_bnt_kuang">
				<view class="role_bnt m_top_30" @click="showPopup">新建角色</view>
			</view>
		<!-- 新建角色 -->
		<u-popup v-model="role_show" mode="bottom" border-radius="20" :closeable="false" z-index="888">
			<view class="role_popup">
				<view class="input">
					<u-input v-model="form.name" placeholder="请输入角色名称" :custom-style="customStyle"/>
				</view>
				<view class="upkuang acea-row row-center-wrapper m_top_30">
					<u-upload :custom-btn="true" max-count="1" ref="upload" :auto-upload="false" :limitType="['png', 'jpg', 'jpeg', 'webp', 'gif','mp4']" @on-choose-complete="upimg" @on-remove="delimg">
						<template v-slot:addBtn>
							<view class="tupiankuang">
								<view>
									<view class="acea-row row-center">
										<uni-icons type="plusempty" size="24" color="#bdbdbd" style="margin-right: 5rpx;"></uni-icons>
									</view>
									<view>上传图片或视频</view>
								</view>
							</view>
							
						</template>
					</u-upload>
					<view>真人仅支持图片上传,视频请确保你拥有创作角色的版权,视频自动截取最开始的3秒,请确保视频前3秒人物肖像为正面</view>
				</view>
				<view class="role_bnt11 m_top_30" @click="create">立即创建<text v-if="WEBCONFIG?.api.role_points">(消耗{{WEBCONFIG?.api.role_points}}积分)</text></view>
			</view>
		</u-popup>
		<!-- 购买积分弹窗 -->
		<u-popup v-model="buy_show" mode="center" border-radius="20" :closeable="false" z-index="1001" :mask-close-able="false">
			<PointsTips ref="PointsTipsRef"  @close="buy_show = false"></PointsTips>
		</u-popup>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad , onReachBottom,onPullDownRefresh } from '@dcloudio/uni-app'
	import { useCache, $page, $tool, $cookie, $http } from '@/utils'
	import { useUserStore, useWebConfigStore, useRefs } from '@/stores/index.js'
	const { USERINFO } = useRefs(useUserStore())
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const keyword = ref('')
	const role_show = ref(false)
	//购买积分弹窗
	const buy_show = ref(false)
	const customStyle = ref({
		color: '#a7a7a7',
	})
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
		$http.get('Role/list', query.value).then(res => {
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

	//删除视频
	const del = (id,index) => {
		uni.showModal({
			title: '温馨提示',
			content: '确定要删除吗?',
			success: function (res) {
				if (res.confirm) {
					uni.showLoading({
						title: '加载中',
						mask: false
					})
					$http.post('Role/delRole', {id:id}).then(res => {
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


	//创建角色
	const create = () => {
		if(!form.value.name){
			uni.showToast({
				title: '请输入角色名称',
				icon: 'none'
			})
			return false
		}
		if(!form.value.reference){
			uni.showToast({
				title: '请上传角色图片或视频',
				icon: 'none'
			})
			return false
		}
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		$http.post('Role/createRole', form.value).then(res => {
			if(res.code == 200){
				uni.showToast({
					title: res.msg,
					icon: 'none'
				})
				role_show.value = false
				form.value.name = ''
				form.value.reference = ''
				getData()
			}else{
				if(res.msg == '积分不足'){
					buy_show.value = true
				}else{
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			}
		}).catch(err => {
			uni.hideLoading()
		})
	}

	//显示弹窗
	const showPopup = () => {
		form.value.name = ''
		form.value.reference = ''
		role_show.value = true
	}

	//图片上传------------------------------------start
	const upload = ref(null)
	const form = ref({
		name:'',
		reference:''
	})
	const delimg = () => {
		form.value.reference = ''
	}
	const upimg = (e) => {
		if(e[0].url){
			uni.showLoading({
				title: '上传中',
				mask: true
			})
			$http.upload('Upload/upload', { name:"file",filePath:e[0].url}).then(res => {
				if(res.code == 200){
					form.value.reference = $tool.imgReplace(res.src)
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
		if(query.open == 1){
			showPopup()
		}
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
	.infobox{
		padding: 0rpx 40rpx;
	}
	.piao{
			position: absolute;
			left: 0;
			z-index: 4;
		}
	.k_bnt_del{
		padding: 6rpx 20rpx;
		font-size: 24rpx;
		background-color: #646464;
		opacity: 0.8;
		border-top-left-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
	}
	.tupiankuang{
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #a7a7a7;
		
	}
	.upkuang{
		color: #ffe600;
		border: #6a6a71 2rpx dashed;
		width: 100%;
		border-radius: 20rpx;
		padding: 30rpx 50rpx;
	}
	.role_bnt_kuang{
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 10;
		width: 100%;
	}
	.role_bnt{
		margin: 0 40rpx 20rpx 40rpx;
		font-size: 32rpx;
		border-radius: 20rpx;
		color: #fff;
		padding: 25rpx 20rpx;
		text-align: center;
		background: linear-gradient(130deg,
			#2cd2ff 10%,    /* 左侧10%的浅色 */
			#0292ff 30%,   /* 中间80%的深色起始点 */
			#0292ff 70%,   /* 中间80%的深色结束点 */
			#33d3ff 100%   /* 右侧10%的浅色 */
		)
	}
	.role_bnt11{
		font-size: 32rpx;
		border-radius: 20rpx;
		color: #fff;
		padding: 25rpx 20rpx;
		text-align: center;
		background: linear-gradient(130deg,
			  #ff0000 10%,    /* 左侧10%的浅色 */
			  #b10000 30%,   /* 中间80%的深色起始点 */
			  #b10000 70%,   /* 中间80%的深色结束点 */
			  #ff0000 100%   /* 右侧10%的浅色 */
			);
	}
	.role_popup{
		padding: 40rpx;
		background-color: #333338;
		.input{
			padding: 10rpx 30rpx;
			border: #6a6a71 2rpx dashed;
			border-radius: 20rpx;
		}
	}
	.biaoti{
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
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
			z-index: 3;
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
			.text_shibai{
				width: 300rpx;
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