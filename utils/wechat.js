/**
 * 微信 JS-SDK 工具类（自动引入 jweixin-1.6.0.js）
 * 功能：初始化配置、自定义分享、微信支付、定位、扫一扫
 */
class WechatJSSDK {
  constructor() {
    this.isConfigured = false; // 初始化状态
    this.jsApiList = [
      'updateAppMessageShareData',
      'updateTimelineShareData',
      'getLocation',
      'scanQRCode',
      'chooseWXPay'
    ];
    this.sdkUrl = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'; // SDK 地址
  }

  /**
   * 自动引入微信 JS-SDK
   * @returns {Promise}
   */
  loadSDK() {
    return new Promise((resolve, reject) => {
      // 已加载则直接返回
      if (typeof wx !== 'undefined') {
        resolve(wx);
        return;
      }

      // 检查是否已存在加载中的 script 标签
      const existingScript = document.querySelector(`script[src="${this.sdkUrl}"]`);
      if (existingScript) {
        // 监听加载完成
        existingScript.addEventListener('load', () => {
          if (typeof wx !== 'undefined') resolve(wx);
          else reject(new Error('微信 SDK 加载失败'));
        });
        return;
      }

      // 动态创建 script 标签引入 SDK
      const script = document.createElement('script');
      script.src = this.sdkUrl;
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.onload = () => {
        if (typeof wx !== 'undefined') {
          resolve(wx);
        } else {
          reject(new Error('微信 SDK 加载失败'));
        }
      };
      script.onerror = () => {
        reject(new Error('微信 SDK 加载出错，请检查网络'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * 初始化 SDK 配置
   * @param {Object} config - 后端返回的签名配置
   * @returns {Promise}
   */
  async init(config) {
    try {
      // 先确保 SDK 已加载
      await this.loadSDK();

      return new Promise((resolve, reject) => {
        wx.config({
          debug: false,
          appId: config.appId,
          timestamp: config.timestamp,
          nonceStr: config.nonceStr,
          signature: config.signature,
          jsApiList: this.jsApiList,
          openTagList: []
        });

        wx.ready(() => {
          this.isConfigured = true;
          resolve('微信 JS-SDK 初始化成功');
        });

        wx.error((err) => {
          this.isConfigured = false;
          reject(new Error(`初始化失败: ${JSON.stringify(err)}`));
        });
      });
    } catch (err) {
      throw new Error(`加载 SDK 失败: ${err.message}`);
    }
  }

  /**
   * 检查初始化状态
   */
  checkConfig() {
    if (!this.isConfigured) {
      throw new Error('请先调用 init 方法初始化 SDK');
    }
  }

  /**
   * 1. 自定义分享配置
   * @param {Object} options - 分享参数
   * @returns {Promise}
   */
  setShareInfo(options) {
    this.checkConfig();
    return new Promise((resolve) => {
      // 分享给朋友
      wx.updateAppMessageShareData({
        title: options.title,
        desc: options.desc,
        link: options.link,
        imgUrl: options.imgUrl,
        success: () => resolve('朋友分享配置成功')
      });

      // 分享到朋友圈
      wx.updateTimelineShareData({
        title: options.title,
        link: options.link,
        imgUrl: options.imgUrl,
        success: () => resolve('朋友圈分享配置成功')
      });
    });
  }



  /**
   * 3. 获取定位
   * @param {string} type - 坐标系类型
   * @returns {Promise}
   */
  getLocation(type = 'gcj02') {
    this.checkConfig();
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type,
        success: (res) => resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          speed: res.speed,
          accuracy: res.accuracy
        }),
        fail: (err) => {
          const msg = err.errMsg.includes('deny') 
            ? '请开启位置权限' 
            : `定位失败: ${err.errMsg}`;
          reject(new Error(msg));
        }
      });
    });
  }

  /**
   * 4. 微信扫一扫
   * @param {Object} options - 扫码参数
   * @returns {Promise}
   */
  scanQRCode(options = { scene: 3 }) {
    this.checkConfig();
    return new Promise((resolve, reject) => {
      const scanType = options.scene === 1 
        ? ['barCode'] 
        : options.scene === 2 
          ? ['qrCode'] 
          : ['qrCode', 'barCode'];

      wx.scanQRCode({
        needResult: 1,
        scanType,
        success: (res) => resolve(res.resultStr),
        fail: (err) => reject(new Error(`扫码失败: ${err.errMsg}`))
      });
    });
  }
}

// 导出实例
export const wechatSDK = new WechatJSSDK();