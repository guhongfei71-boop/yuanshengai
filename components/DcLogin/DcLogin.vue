<template>
	<view>
		<view class="p60" :style="`padding-bottom:${height}px;`">
			<view class="wechat" >
				<view class="acea-row row-center">
					<image class="logo" :src="WEBCONFIG?.sys.logo ?  $tool.imgReplace(WEBCONFIG?.sys.logo) : '/static/logo.png'"></image>
				</view>
				<text class="acea-row row-center m_top_30 text">{{WEBCONFIG?.sys.name}}</text>
			</view>
			<view class="acea-row row-center m_top_60" v-if="is_wechat && user_login_type == 0">
				<view class="button" :data-eventsync="true"
				@tap="login">
					立即授权登录
				</view>
			</view>
			<view class="phone m_top_40" v-else>
				<view class="phone_button acea-row row-middle">
					<view class="phone_left">手机号</view>
					<input
					v-model="form.account"
					maxlength='11'
					focus 
					placeholder="请填写手机号" 
					class="input_sty"
					/>
				</view>
				<view class="phone_button acea-row row-middle m_top_30" v-if="login_type == 2 && !is_reg">
					<view class="phone_left">注册密码</view>
					<input
					v-model="form.regpwd"
					maxlength='20'
					focus 
					placeholder="第一次注册必须填写密码" 
					:password="true"
					class="input_sty"
					/>
				</view>
				<view class="phone_button acea-row row-middle m_top_30" v-if="login_type == 3">
					<view class="phone_left">密码</view>
					<input
					v-model="form.pwd"
					maxlength='20'
					focus 
					placeholder="请填写密码" 
					:password="true"
					class="input_sty"
					/>
				</view>
				<view class="phone_button acea-row row-middle m_top_30" v-if="WEBCONFIG?.user.user_verification == 1">
					<view class="phone_left">图形验证</view>
					<input
					v-model="form.captchaValue"
					maxlength='20'
					focus 
					placeholder="图形验证码" 
					class="input_sty"
					style="width: 160rpx;"
					/>
					<image class="varcode" :src="vrcodeimg" @click="getImgCode"></image>
				</view>
				
				<view class="phone_button acea-row row-middle m_top_30" v-if="login_type == 2">
					<view class="phone_left">验证码</view>
					<input
					v-model="form.code"
					maxlength='20'
					focus 
					placeholder="填写验证码" 
					class="input_sty"
					style="width: 140rpx;"
					/>
					<u-verification-code :seconds="seconds" ref="uCode1"
							@change="codeChange"></u-verification-code>
					<u-button size='mini' type="default" :hair-line="false" @tap="getCode">{{tips}}</u-button>
				</view>
			
				<!-- <u-field
					v-model="form.regpwd"
					label="注册密码"
					maxlength='20'
					:password = "true"
					placeholder="第一次注册必须填写密码"
					:border-bottom = "false"
					class="phone_button m_top_30"
					v-if="login_type == 2 && !is_reg"
				>
				</u-field>
				<u-field
					v-model="form.pwd"
					label="密码"
					maxlength='20'
					:password = "true"
					placeholder="请填写密码"
					:border-bottom = "false"
					class="phone_button m_top_30"
					v-if="login_type == 3"
				>
				</u-field>
				<u-field
					v-model="form.captchaValue"
					label="图形验证"
					maxlength='4'
					placeholder="请填写验证码"
					:border-bottom = 'false'
					class="phone_button phone_button_padding m_top_30"
					v-if="WEBCONFIG?.user.user_verification == 1"
				>
					<template v-slot:right>
						<image class="varcode" :src="vrcodeimg" @click="getImgCode"></image>
					</template>
				</u-field>
				<u-field
					v-model="form.code"
					label="验证码"
					maxlength='4'
					placeholder="请填写验证码"
					:border-bottom = 'false'
					class="phone_button m_top_30"
					v-if="login_type == 2"
				>
					<template v-slot:right>
						<u-verification-code :seconds="seconds" ref="uCode1" 
								@change="codeChange"></u-verification-code>
						<u-button size='mini' type="default" :hair-line="false" @tap="getCode">{{tips}}</u-button>
					</template>
				</u-field> -->
				<view class="acea-row row-center m_top_60">
					<view class="button" :data-eventsync="true"
					@tap="login">
						<text v-if="is_reg">立即登录</text>
						<text v-else>立即注册</text>
					</view>
				</view>
				<view class="acea-row row-center m_top_40">
					<text @tap="swithType(2)" :style="login_type == 2 ? 'color: #00aaff;':'color: #272727;'">短信登录</text>
					<text style="padding: 0 30rpx;">|</text>
					<text @tap="swithType(3)" :style="login_type == 3 ? 'color: #00aaff;':'color: #272727;'">密码登录</text>
				</view>
				<view class="acea-row row-center m_top_60">
					<checkbox-group style="font-size: 24rpx;" @change="userCheckbox">
						<label>
							<checkbox value="tongyi" :checked="check_data" style="transform:scale(0.7)"/>
						</label>
						请阅读并同意<text @click="$page.open('/pages/page/page?name=fuwuxieyi&title=用户协议')" style="color: #55aa7f;">《用户协议》</text>
					</checkbox-group>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script setup>
	import { ref, defineEmits, nextTick } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import siteurl from '@/utils/siteurl.js'
	import { useRefs, useWebConfigStore, useUserStore } from '@/stores'
	import { useCache, $http, $tool, $page } from '@/utils'
	// #ifdef H5
	const height=ref(100)
	// #endif
	// #ifndef H5
	const height=ref(20)
	// #endif
	const { WEBCONFIG } = useRefs(useWebConfigStore())
	const emit = defineEmits(['close'])
	// #ifdef H5
	const is_wechat = ref($tool.isInWeChatBrowser())
	// #endif
	// #ifndef H5
	const is_wechat = ref(true)
	// #endif

	const form = ref({
		'account' : '',
		'regpwd' : '' ,
		'pwd':'',
		'code' : '',
		'imgcode' : '',
		'captchaId' : '',
		'captchaValue' : '',
	})
	const vrcodeimg = ref('')
	const tips = ref('')
	const seconds = ref(60)
	const uCode1 = ref()
	const check_data = ref(true)
	const is_reg = ref(true)	//手机号是否注册
	const login_type = ref(2)	//登录类型 1注册账号 2手机登录 3密码登录
	const code_type = ref('login')
	const user_login_type = ref(0)
	
	
	const userCheckbox = (e) =>{
		if(e.detail.value[0]){
			check_data.value = true
		}else{
			check_data.value = false
		}
	}
	
	//短信登录 和密码登录 互相切换
	const swithType = (type) =>{
		login_type.value = type
	}
	//获取验证码改变的字
	const codeChange = (text) =>{
		tips.value = text
	}
	//获取手机验证码
	const getCode = () =>{
		if(uCode1.value.canGetCode){
			let code_data = {
				account:form.value.account,
				type:code_type.value,
				captchaId:form.value.captchaId,
				captchaValue:form.value.captchaValue,
			}
			$http.post('Login/phonecode',code_data).then(res=>{
				if(res.code == 200){
					uni.showToast({
						title: res.msg,
						duration:2000
					})
					seconds.value = res.data.time;
					uCode1.value.start()
				}else{
					if(WEBCONFIG?.value.user.user_verification == 1){
						getImgCode()
					}
					if(res.msg == '该手机未注册'){
						is_reg.value = false
						code_type.value = 'register'
						form.value.captchaValue = ''
					}
				}
			})
		}else{
			uni.showToast({
				title: '倒计时结束后再发送'
			})
		}
		
	}
	
	//获取图形验证码
	const getImgCode = () =>{
		$http.get('Login/getcode').then(res=>{
			form.value.captchaId = res.data.id
			vrcodeimg.value = res.data.url
		})
	}
	
	
	const login = async () => {
		let saasid = siteurl.saasid()
		let spread = useCache().get('SPREAD') || 0
		const {  setUserInfo } = useUserStore()
		let provider = 'weixin'
		let data = {
			source: provider,
			spread: spread,
		}
		// #ifdef MP-TOUTIAO
		provider = 'toutiao'
		data.route = 'douyin'
		await (new Promise((res, err) => {
			tt.getUserProfile({
				force: true,
				success(result) {
					data.nickname = result.userInfo.nickName
					data.avatar = result.userInfo.avatarUrl
					res(true)
				},
				fail(e) {
					uni.hideToast()
					err(e)
				}
			})
		}))
		// #endif

		// #ifndef H5
		uni.login({
			provider: provider,
			success(res) {
				data.code = res.code
				data.spread = useCache().get('SPREAD')
				data.route = 'mp'
				$http.post('Login/authlogin', data).then(res => {
					setUserInfo(res.data)
					useCache().set('SPREAD',res.data.userInfo.id)
					emit('close')
					$page.back()
				})
			}
		})
		// #endif
		
		// #ifdef H5
		if(is_wechat.value && user_login_type.value == 0){
			const currentPages = getCurrentPages();
			const prevPage = currentPages[currentPages.length - 2];
			// 兼容 H5 下 route 可能为空，优先取 route，其次取 __route__
			const prevRoute = prevPage ? (prevPage.route || prevPage.__route__ || '') : '';
			// 拼接 query 参数（如 ?shopid=1&qrid=xxx&saasid=1）
			const prevOptions = prevPage?.options || {};
			const queryString = Object.keys(prevOptions)
				.map(k => `${k}=${encodeURIComponent(prevOptions[k])}`)
				.join('&');
			const state = prevRoute + (queryString ? '?' + queryString : '');
			let wx_data = {
				spread:spread,
				route:'wx',
				state:state
			}
			//在微信里一键登录
			$http.post('Login/authlogin',wx_data).then(res=>{
				let url = res.data
				location.assign(url);
			})
		}else{
			if(!check_data.value){
				uni.showToast({title:'请阅读并同意用户协议和隐私条款',icon:'none'})
				return true
			}
			let type = is_reg.value ? login_type.value : 1
			
			let h5_data = {
				spread:spread,
				login_type: type,// 1注册账号 2手机登录 3密码登录
				account:form.value.account,
				type:code_type.value,
				captchaId:form.value.captchaId,
				captchaValue:form.value.captchaValue,
			}
			if(!form.value.account){
				uni.showToast({
					title: '请填写手机号',
					icon:'none'
				});
				return true
			}
			if(type == 1){
				if(!form.value.regpwd){
					uni.showToast({
						title: '请填写注册密码',
						icon:'none'
					});
					return true
				}
				if(!form.value.code){
					uni.showToast({
						title: '请填写验证码',
						icon:'none'
					});
					return true
				}
				h5_data.regpwd = form.value.regpwd
				h5_data.code = form.value.code
			}else if(type == 2){
				if(!form.value.code){
					uni.showToast({
						title: '请填写验证码',
						icon:'none'
					});
					return true
				}
				h5_data.code = form.value.code
			}else if(type == 3){
				if(!form.value.pwd){
					uni.showToast({
						title: '请填写密码',
						icon:'none'
					});
					return true
				}
				h5_data.pwd = form.value.pwd
			}
			//不在微信里手机登录
			$http.post('Login/h5login',h5_data).then(res=>{
				if(res.code == 200){
					//console.log(res)
					uni.showToast({
						title: res.msg,
						duration: 2000
					});
					setUserInfo(res.data)
					useCache().set('SPREAD',res.data.userInfo.id)
					emit('close')
					$page.back()
				}else{
					if(WEBCONFIG?.value.user.user_verification == 1 && login_type.value == 3){
						getImgCode()
					}
				}
				
			})
		}
		
		// #endif
	}
	
	uni.$on('initConfig', (res) => {
		if(WEBCONFIG?.value.user.user_verification == 1){
			getImgCode()
		}
		user_login_type.value = WEBCONFIG?.value.user.login_type ? WEBCONFIG?.value.user.login_type : 0;
		
	})
	
	//这个必须放后面,有先后执行顺序
	onLoad( () =>{
		if(WEBCONFIG.value?.user.user_verification == 1){
			getImgCode()
		}
	})
	
</script>

<style scoped lang="scss">
	.button{
		font-size: 34rpx;
		color: #ffffff;
		width: 100%;
		text-align: center;
		padding: 26rpx 120rpx;
		background: linear-gradient(90deg, rgba(67, 158, 255, 1.0) , rgba(48, 199, 253, 1.0));
		border-radius: 100rpx;
		box-shadow: 0 10rpx 25rpx rgba(33, 202, 253, 0.5);
	}
	.wechat{
		.logo{
			width: 160rpx;
			height: 160rpx;
			background-color: #f1f1f1;
			border-radius: 40rpx;
		}
		.text{
			font-size: 32rpx;
			font-weight: bold;
		}
		
	}
	
	.phone{
		.phone_button{
			font-size: 28rpx;
			padding: 16rpx 40rpx;
			border-radius: 100rpx;
			background-color: #ffffff;
		}
		.varcode{
			width: 175rpx;
			height: 65rpx;
		}
		.phone_left{
			width: 23%;
			text-align: right;
			margin-right: 20rpx;
		}
		.input_sty{
			padding: 10rpx 20rpx;
			font-size: 28rpx;
		}
	}
</style>