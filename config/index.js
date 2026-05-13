import { siteinfo } from '@/siteinfo.js';
const DEFAULT_CONFIG = {
	
	//每个项目必须定义一个不相同的前缀，否则会出现缓存冲突
	PROJECT_PREFIX: siteinfo.app_name + '_',
	
	//插件前缀
	PLUGIN_PREFIX: 'app/'+ siteinfo.app_name +'/',
	//控制器地址
	CONTROLLER: 'api/',
}

export default DEFAULT_CONFIG
