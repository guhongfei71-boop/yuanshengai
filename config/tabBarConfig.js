// 底部导航配置文件 - 集中管理所有导航相关配置
export default {
  // 基础样式配置
  style: {
	height: '56px', // 导航栏高度
    activeColor: '#ffffff',  // 选中颜色
    inactiveColor: '#92979e',// 未选中颜色
    fontSize: '12px',        // 文字大小
    iconSize: '24px'         // 图标大小
  },
  
  // 中间按钮配置(可选)
  midButton: {
    show: true,
    iconPath: '/static/img/mid.png',
	text: '首页',
    selectedIconPath: '/static/img/mid.png',
    width: '50px',
    height: '50px',
    pagePath: '/pages/index/index',
    isTab: true
  },
  
  // 导航项配置
  items: [
    {
      pagePath: '/pages/videolist/videolist',
      text: '作品',
      iconPath: '/static/img/bnt3.png',
      selectedIconPath: '/static/img/bnt3_on.png',
      isTab: true,
    },
    {
      pagePath: '/pages/user/profile',
      text: '我的',
      iconPath: '/static/img/bnt2.png',
      selectedIconPath: '/static/img/bnt2_on.png',
      isTab: true,
	  badge: 0 // 消息提示数
    }
  ]
}
    