import { ref } from 'vue';
import { useCache } from '@/utils/cache.js';

export default () => {
	const storage = useCache();
	const USERINFO = ref(null);

	const setUserInfo = (user) => {
		USERINFO.value = user;
		storage.set('USERINFO', user);
		//因为是手机登录这里返回必须携带SPREAD推广人ID
	};

	const getToken = () => USERINFO.value?.token;

	const clearUserInfo = () => {
		USERINFO.value = null;
		storage.remove('USERINFO');
	};

	const initUserInfo = () => {
		const user = storage.get('USERINFO');
		if (user) {
			setUserInfo(user);
		}
	};

	const isLogin = () => {
		const token = USERINFO.value?.token;
		return !!token;
	};

	return {
		USERINFO,
		setUserInfo,
		getToken,
		clearUserInfo,
		initUserInfo,
		isLogin,
	};
};

