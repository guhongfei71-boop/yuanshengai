import { useUserStore } from "@/stores"
import siteurl from './siteurl';
import { $page,useCache } from "@/utils";
import { showError } from '@/utils/error-dialog';


const baseURL = siteurl.baseUrl;

// H5 下防止重复跳登录页的锁
let isRedirectingLogin = false;
// 小程序下防止重复无感登录的锁
let isMpLogining = false;

const buildHeaders = (options = {}) => {
	const { isLogin, getToken, initUserInfo } = useUserStore();
	const headers = {
		'Accept': 'application/json, text/plain, */*',
		...options.header,
	};
	initUserInfo()
	if (isLogin()) {
		headers['Authorization'] = getToken();
	}
	headers['Saasid'] = siteurl.saasid()
	return headers;
};


const request = (options) => {
	const { setUserInfo } = useUserStore();
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			header: buildHeaders(options),
			success: (res) => {
				const { data } = res;
				if (data.code === 200) {
					resolve(data);
				} else if (data.code == 404 || data.code == 402) {
					uni.showToast({
						title: data.msg,
						duration: 2000,
						icon:'none'
					});
					resolve(data);
				} else if(data.code == 999){
					// #ifdef H5
					// 防止 H5 下 getCurrentPages 不可靠导致重复跳转
					if (isRedirectingLogin) {
						uni.hideLoading()
						return
					}
					isRedirectingLogin = true
					setTimeout(() => { isRedirectingLogin = false }, 3000)
					const currentPages = getCurrentPages();
					const len = currentPages.length;
					// 兼容 H5 下 route 为空的情况，取 __route__
					const curRoute = len > 0
						? (currentPages[len - 1].route || currentPages[len - 1].__route__ || '')
						: '';
					if (curRoute !== 'pages/login/login') {
						const { clearUserInfo } = useUserStore()
						clearUserInfo()
						$page.open('/pages/login/login')
						uni.hideLoading()
					} else {
						uni.hideLoading()
					}
					// #endif
					// #ifdef MP-WEIXIN
					// 防止重复无感登录
					if (isMpLogining) {
						uni.hideLoading()
						reject(new Error('登录中'))
						return
					}
					isMpLogining = true
					const mpPages = getCurrentPages();
					const currentPage = mpPages[mpPages.length - 1];
					const currentPath = currentPage ? '/' + currentPage.route : '/pages/index/index';
					uni.login({
						provider: 'weixin',
						success(loginRes) {
							const loginData = {
								code: loginRes.code,
								spread: useCache().get('SPREAD'),
								route: 'mp'
							}
							$http.post('Login/authlogin', loginData).then(loginResult => {
								setUserInfo(loginResult.data)
								isMpLogining = false
								// 登录成功后重新执行原始请求
								const originalRequest = () => {
									uni.request({
										...options,
										header: buildHeaders(options),
										success: (res) => {
											resolve(res.data)
										},
										fail: (err) => {
											reject(err)
										}
									})
								}
								originalRequest()
							}).catch(() => {
								isMpLogining = false
								reject(new Error('登录失败'))
							})
						},
						fail: () => {
							isMpLogining = false
							reject(new Error('微信登录失败'))
						}
					})
					// #endif
				} else {
					if(res.statusCode == 500){
						showError( res.data.message,{title:'错误:500',duration: 3000});
						uni.hideLoading()
					}else if(res.statusCode == 404){
						showError('正在请求不存在的服务器记录！',{title:'错误:404',duration: 3000});
						uni.hideLoading()
					}else{
						showError( res.data.msg,{title:'错误提示',duration: 3000});
						uni.hideLoading()
					}
					reject(res);
				}
			},
			fail: (err) => {
				uni.hideLoading()
				reject(err)
			}
		});
	});
};

export const $http = {
	baseURL,

	get: (url, data = {}, options = {}) => {
		options = {
			...options,
			url: `${baseURL}${url}`,
			data,
			method: 'GET',
		};
		return request(options);
	},

	post: (url, data = {}, options = {}) => {
		options = {
			...options,
			url: `${baseURL}${url}`,
			data,
			method: 'POST',
		};
		return request(options);
	},

	custom: (url, method, data = {}, options = {}) => {
		options = {
			...options,
			url: `${baseURL}${url}`,
			data,
			method,
		};
		return request(options);
	},

	upload: (url, options = {}) => {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				...options,
				header: buildHeaders(options),
				url: `${baseURL}${url}`,
				success: (res) => {
					let data = res.data
					const isString1 = typeof data === 'string';
					if (isString1) {
						data = JSON.parse(data)
					}
					if (data.code == 200) {
						resolve(data);
					} else {
						uni.showModal({
							title: '温馨提示',
							content: data.msg
						})
						reject(res);
					}
				},
				fail: (err) => reject(err),
			});
		});
	},
};