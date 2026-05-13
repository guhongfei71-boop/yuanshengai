import uView from './uni_modules/vk-uview-ui'
import App from './App'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { showError } from './utils/error-dialog.js'

const pinia = createPinia()
export function createApp() {
	const app = createSSRApp(App)
	app.use(pinia)
	app.use(uView);
	// 注册全局方法
	app.config.globalProperties.$showError = showError;
	return {
		app
	}
}
