//app.js
const config = require('./app.config');


const NW = require('./utils/nightswatch.min.js');

NW.setData({
  appType: 1,
  appId: config.activityChannel,
  version: config.version
}).run({
  env: config.env
});


const User = {
  userInfo: {},
  launchInfo: {},  //场景信息
  sessionKey: '',
  encryptedData: '',
  iv: '',
  extraInfo: {
    openUserId: 0,
    containsUnionId: false
  }
};
let isShowBoot;
const Util = require('utils/util');
const Log = new (require('/utils/log'))('【' + config.appDesc + config.env.toUpperCase() + '】');
//订单详情
const orderMsg = {
  name: '',
  idNo: '',
  orderCount: '',
  orderDetail: {}
};

const SESSION_KEY = 'session_key';

console.log('AppVersion:', config.version);
console.log('AppEnv:', config.env);

App({
  config,

  User,
  insurantList: [],
  launchInfo: {},
  orderMsg,
  globalData: {},
  Log,
  isShowBoot,
  onLaunch: function (options) {

    this.restoreUserInfo();

    this.login((data) => {
      if (data) {
        NW.ready(data);
      }
    });

    // 判断iphone X适配
    this.globalData.isIPX = !!(this.OS.model.indexOf('iPhone X') >= 0);

    this.setLaunchInfo(options);

    console.log('LaunchInfo:', this.launchInfo);

    let env = config.env
    if (env === "prd") return;
    console.log("===============")
    console.log("当前环境：" + env)
    console.log("===============")
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({
      title: '旅行保险( ' + env + ' )'
    })
  },
  onShow: function (options) {
    this.setLaunchInfo(options);
  },
  onError(msg) {
    const _this = this;
    _this.Log.error(msg, 'script');
    if (_this.config.env != 'prd') {
      _this.show_error(msg.substr(0, 200), 3);
      console.log(msg);
    }
  },

  restoreUserInfo(){

      try {
          var extraInfo = wx.getStorageSync('EXTRA_INFO');
          Object.assign(this.User.extraInfo, extraInfo)
      } catch (err) { }
  },

  setLaunchInfo(options = {}) {
    const {scene, channel} = options.query || {}
    //默认取传参中的场景值
    this.launchInfo = { ...options, subscene: scene || '', channel: channel || '' };
    //自定义场景
    if (scene) {
      //转义场景值传参
      const queryScene = Util.parseParam(decodeURIComponent(scene), '$');
      Object.assign(options.query, queryScene)
      this.launchInfo.subscene = options.query.scene || '';
      this.launchInfo.channel = options.query.channel || '';
    }
  },

  OS: (function () { try { return wx.getSystemInfoSync() } catch (e) { return {} } })(),
  store: {
    session: SESSION_KEY
  },
  login, //login
  doLogin, //
  ajax,
  syncAjax,
  show_error,
  loginSuccessCb: () => {},
  loginSuccess: function (func) {
      this.loginSuccessCb = func;
  }
})

function syncAjax(options, isToNode = false) {
  const _this = this;
  const session = wx.getStorageSync(SESSION_KEY);
  const version = options.version || '1.0.0';
  const method = options.method || 'POST';
  const reqUrl = config.apiBase + '?serviceName=' + options.serviceName + '&serviceVersion=' + version;
  const nodeUrl = isToNode && config.nodeApiBase + options.path;
  const _onSuccess = options.onSuccess || (() => { });
  const _onError = options.onError || (() => { });
  if (session === '') {
    
    _this.doLogin(function () {
      _this.syncAjax(options);
    });
  } else {
    wx.request({
      url: reqUrl,
      method,
      data: options.data,
      header: {
        'Session-Key': session
      },
      success: function (res) {
        if (res.statusCode === 200) {
          _onSuccess(res);
        } else if (res.statusCode === 403) {
          // 如果session过期
          _this.doLogin(function () {
            _this.syncAjax(options);
          });
        } else {
          wx.hideLoading();
          _this.show_error("网络有点点问题哦！稍后重试～～");
          _onError(res);
        }
      },
      fail: function (error) {
        if (!session) {
          _this.doLogin();
        }
        _onError(error);
      }
    })
  };

}

function ajax(options, isToNode = false, isShowErrMsg = true) {
  const _this = this;
  const session = wx.getStorageSync(SESSION_KEY);
  const version = options.version || '1.0.0';
  const method = options.method || 'POST';
  const reqUrl = config.apiBase + '?serviceName=' + options.serviceName + '&serviceVersion=' + version;
  const nodeUrl = isToNode && config.nodeApiBase + options.path;
  return new Promise(function (resolve, reject) {
    if (session === '') {
      _this.doLogin(function () {
        _this.ajax(options).then(function (res) {

          resolve(res);
        });
      });
    } else {
      console.log('session-key===', session)
      wx.request({
        url: !isToNode ? reqUrl : nodeUrl,
        method,
        data: options.data,
        header: {
          'Session-Key': session
        },
        success: function (res) {
          if (res.statusCode === 200) {
            resolve(res);
          } else if (res.statusCode === 403) {
            // 如果session过期
            _this.doLogin(function () {
              _this.ajax(options).then(function (res) {
                resolve(res);
              });
            });
          } else {
            wx.hideLoading();
            isShowErrMsg && _this.show_error("网络有点点问题哦！稍后重试～～");
          }
        },
        fail: function (error) {
          if (!session) {
            _this.doLogin();
          }
          reject(error);
        }
      })
    };
  })
}

function show_error(errorMsg) {
  const _compEvent = {
    errorTip: {
      flag: true,
      msg: ''
    }
  };
  let pages = getCurrentPages();
  let curPage = pages[pages.length - 1];
  Object.assign(curPage.data, _compEvent);
  curPage.setData({
    errorTip: {
      flag: true,
      msg: errorMsg
    }
  });

  setTimeout(function () {
    curPage.setData({
      errorTip: {
        flag: false,
        msg: ''
      }
    })
  }, 1500);
}

function login(cb = () => { }) {
  let _this = this;
  let onFail = function () {
    console.info("session失效，重新登录流程");
    _this.doLogin(cb);
  };
  wx.checkSession({
    success: function () {
      console.info("wx session 未过期");
      if (_this.User.sessionKey) {
        cb && cb(User)
      } else {
        onFail(cb);
      }
    },
    fail: function () {
      onFail(cb);
    }
  })
}

function doLogin(cb = () => { }) {

  let _this = this;
  const getSessionFail = function (res) {
    console.log('doLogin request failed - ', JSON.stringify(res))
  };
  const doSessionRequest = function (code) {
    const sessionData = {
      loginCode: code,
      activityChannel: 208,
      userInfo: _this.User.userInfo,
      encryptedData: _this.User.encryptedData,
      iv: _this.User.iv,
      activityScene: {
        scene: _this.launchInfo.scene,
        subscene: _this.launchInfo.subscene,
        channel: _this.launchInfo.channel
      }
    };
    wx.request({
      url: _this.config.apiBase + '?serviceName=za.sales.weChatApp.auth.login&serviceVersion=1.0.0',
      data: sessionData,
      method: 'POST',
      success: function (res) {
        const resData = res.data;
        if (resData.success && resData.value) {
          // 使用新的登陆接口
          // _this.User.sessionKey = resData.value;
          // if (resData.extraInfo) {
          //   _this.User.extraInfo = resData.extraInfo;
          //   NW.setData('userId', res.data.extraInfo.openUserId);
          //   wx.setStorage({
          //     key: "EXTRA_INFO",
          //     data: resData.extraInfo
          //   });
          // }
          // NW.setData('sessionId', resData.value);
          // NW.ready();
          // console.log("_this.User.extraInfo", _this.User.extraInfo);
          // wx.setStorageSync(SESSION_KEY, resData.value);
          const resVal = resData.value;
          _this.User.extraInfo = resVal;
          _this.User.extraInfo.openUserId = resVal.openUserIdEncrypt;
          _this.User.sessionKey = resVal.sessionKey;
          NW.setData('userId', _this.User.extraInfo.openUserId);
          NW.setData('sessionId', _this.User.sessionKey);
          NW.ready();
          wx.setStorageSync(SESSION_KEY, _this.User.sessionKey);
          wx.setStorage({
            key: "EXTRA_INFO",
            data: _this.User.extraInfo
          });
          _this.loginSuccessCb();
          if (typeof cb == 'function') cb();
        } else {
          getSessionFail();
        }
      },
      fail: getSessionFail
    })
  }
  wx.login({
    success: function (res) {
      if (res.code) {
        const code = res.code;
        wx.getUserInfo({
          withCredentials: true,
          lang: 'zh_CN',
          success: function (userData) {
            _this.User.userInfo = userData.userInfo;
            _this.openId = userData.userInfo.openId;
            _this.User.encryptedData = userData.encryptedData;
            _this.User.iv = userData.iv;
            doSessionRequest(code);
          },
          fail: function (error) {
            doSessionRequest(code);
            // wx.openSetting()
          }
        })
      }
    }
  })


}
