<template>
	<view class="infobox">
		<view class="popup" style="max-width: 500rpx;">
				<view class="m_top_10 title" style="text-align: center;">温馨提示</view>
				<view class="acea-row row-center m_top_40" style="color: #545454;font-size: 30rpx;">
					你当前的积分不足，无法生成视频，请先充值积分
				</view>
				<view class="acea-row row-between-wrapper m_top_40">
					<view class="bnt0" style="font-size: 32rpx;" @click="onclick">暂时观望</view>
					<view class="bnt" style="font-size: 32rpx;" @click="$page.open('/pages/pay/buyPoints',true)">前往充值</view>
				</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, defineEmits } from 'vue'
	import { onLoad, onReachBottom, onPullDownRefresh} from '@dcloudio/uni-app'
	import { useRefs, useWebConfigStore, useUserStore } from '@/stores'
	import { useCache, $http, $tool, $page ,wechatSDK } from '@/utils'
	
	const emit = defineEmits(['close']);


	const onclick = () => {
		emit('close');
	}

	//开始执行地址组件内容
	const open = () => {

	}


	defineExpose({
	  open // 将 open 方法暴露出去
	})
	
</script>

<style scoped lang="scss">

	.infobox{
		padding: 0rpx 0rpx;
	}
	.bnt0{
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #fff;
		padding: 15rpx 20rpx;
		background: linear-gradient(130deg,
		  #505050 0%,    /* 左侧10%的浅色 */
		  #383838 100%   /* 右侧10%的浅色 */
		);
	}
	.bnt{
		font-size: 28rpx;
		border-radius: 10rpx;
		color: #fff;
		padding: 12rpx 20rpx;
		background: linear-gradient(130deg,
		  #2cd2ff 10%,    /* 左侧10%的浅色 */
		  #0292ff 30%,   /* 中间80%的深色起始点 */
		  #0292ff 70%,   /* 中间80%的深色结束点 */
		  #33d3ff 100%   /* 右侧10%的浅色 */
		);
	}
</style>