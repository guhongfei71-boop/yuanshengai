export const pay = (type, data) => {
	return new Promise((resolve, reject) => {
		if (type == 'wx' || type=='mp') {
			// #ifdef MP-WEIXIN
			// uni.requestPayment({
			// 	"appId": data.appId,
			// 	"timeStamp": data.timeStamp,
			// 	"nonceStr": data.nonceStr,
			// 	"package": data.package,
			// 	"signType": "MD5",
			// 	"paySign": data.paySign,
			// 	success(res) {
			// 		resolve(res)
			// 	},
			// 	fail(error) {
			// 		reject(error)
			// 	}
			// })

			wx.requestVirtualPayment({
				signData: data.signData,      // 直接用字符串
				paySig: data.paySig,
				signature: data.signature,
				mode: data.mode,
				success(res) {
					resolve(res)
				},
				fail({ errMsg }) {
					reject(new Error(errMsg))
				}
			})
			// #endif

			// #ifdef H5
			WeixinJSBridge.invoke('getBrandWCPayRequest', {
				"appId": data.appId,
				"timeStamp": data.timeStamp,
				"nonceStr": data.nonceStr,
				"package": data.package,
				"signType": "MD5",
				"paySign": data.paySign
			}, function(result) {
				if (result.err_msg == "get_brand_wcpay_request:ok") {
					resolve(result)
				} else {
					reject()
				}
			})
			// #endif
		}
		
		if(type=='epay'){
			window.location.href = data;
		}

		if (type == 'douyin') {
			uni.requestPayment({
				orderInfo: data,
				service: 5,
				success(res) {
					resolve(res)
				},
				fail(error) {
					reject(error)
				}
			})
		}
	})
}