//小程序 发行之后 必须在 vendor.js 里修改 require('../siteinfo.js')  另app.js里必须加入 siteInfo:require('siteinfo.js') 否则上传不了
import { siteinfo } from '@/siteinfo.js';
import config from '@/config'
import { useCache } from '@/utils'

const host = () => {
	// #ifndef H5
	return `${siteinfo.siteroot}${config.PLUGIN_PREFIX}${config.CONTROLLER}`;
	// #endif


	// #ifdef H5
	let baseURL = `${siteinfo.siteroot}${config.PLUGIN_PREFIX}${config.CONTROLLER}`;
	if (process.env.NODE_ENV !== 'development') {
		baseURL = globalThis.location.origin + globalThis.location.pathname;
		if (baseURL.endsWith("//")) {
			baseURL = baseURL.replace(/\/\/$/, "/");
		}
		baseURL = baseURL + config.CONTROLLER
	}
	return baseURL;
	// #endif
};

const imghost = (type = 0) => {
	// #ifndef H5
	return `${siteinfo.siteroot}`;
	// #endif


	// #ifdef H5
	let baseURL = `${siteinfo.siteroot}`;
	if (process.env.NODE_ENV !== 'development') {
		if(type){
			baseURL = globalThis.location.origin + globalThis.location.pathname;
		}else{
			baseURL = globalThis.location.origin;
		}
		if (baseURL.endsWith("//")) {
			baseURL = baseURL.replace(/\/\/$/, "/");
		}
	}
	return baseURL;
	// #endif
};

const saasid = () => {
	// #ifndef H5
	return siteinfo.saasid;
	// #endif
	
	// #ifdef H5
	let s_id = '';
	if (process.env.NODE_ENV == 'development') {
		s_id = siteinfo.saasid;
	}else{
		s_id = useCache().get('SAASID')
	}
	return s_id;
	// #endif
};


const baseUrl = `${host()}`;

export default {
	imghost,
	host,
	baseUrl,
	saasid,
};