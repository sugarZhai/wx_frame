const app = getApp();
const OS = app.OS;
const Util = require('../../utils/util');
const not_need_ilog = app.config.env === 'prd';

const pageBase = {
  //页面loading
  showPageLoading,

  //页面取消loading
  hidePageLoading,

  //埋点
  push_asm,

  //pv统计
  push_pv,

  //
  set_data,

  //客服电话
  call_phone,

  //提示错误
  show_error,

  //打开pdf
  openFile,

  //复制
  tap_copy,

  //
  tab_jump,

  //navTo
  navTo,

  setFormData,

  setDefault,
  sendFormId,
  btnViewClick,

  bindFormData,

  onShow: function() {
    this.setData({
      contactus_show: Util.offWork()
    });
    // if (this.auto_push !== false) {
    //   //this.push_pv();
    // }
  },
  noop: () => {},
  navigateToMiniProgram: function(e, data) {
    var ds = data || e.currentTarget.dataset;
    if (ds.appid) {
      if (!wx.navigateToMiniProgram) {
        app.showError('先升级下微信版本，再来点我哦！', 3);
        return;
      }
      var envVersions = {
        prd: 'release',
        uat: 'trial',
        test: 'develop'
      };

      wx.navigateToMiniProgram({
        appId: ds.appid,
        path: ds.path,
        envVersion: envVersions[app.config.env],
        extraData: ds.extraData
      });
    }
  },
  isWxAvailable
};

function isWxAvailable(func, cb) {
  if (func) {
    typeof cb === 'function' && cb();
  } else {
    wx.showModal({
      showCancel: false,
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
      success() {
        wx.navigateTo({
          url: '../index/index'
        });
      }
    });
    return;
  }
}
// 仅针对input元素
function bindFormData(e) {
  const ds = e.currentTarget.dataset;
  let value = e.detail.value;
  let regularRes = true;

  if (ds.regular) {
    switch (ds.regular) {
      case 'name':
        regularRes = Util.validateName(value);
        break;
      case 'nameEng':
        value = value.toUpperCase();
        regularRes = Util.validateNameEng(value);
        break;
    }
    regularRes || (value = this.formData[ds.name] || '');
  }
  this.formData[ds.name] = value;
  return {
    value
  };
}

function setFormData(key, value) {
  const item = {};
  item[key] = value;
  var newForm = Object.assign({}, this.data.formData, item);
  this.setData({
    formData: newForm
  });
  this.setDefault();
//   this.checkFormData();
}

function setDefault() {
  let flag = true;
  const _this = this;
  console.log('_this.data.formData', _this.data.formData);
  Object.keys(_this.data.formData).map(item => {
    if (item === 'aggrement' && !_this.data.formData[item]) {
      flag = false;
    } else if (_this.data.formData[item] === '') {
      flag = false;
      if (
        _this.data.needInvoice &&
        item == 'invoiceName' &&
        _this.data.formData[item] == ''
      ) {
        flag = true;
      }
    }
  });
  _this.setData({
    submitDisable: !flag
  });
}

function showPageLoading() {
  const _this = this;
  _this.setData({
    ui_pageloading: {
      hidden: false
    }
  });
}

function hidePageLoading() {
  const _this = this;
  _this.setData({
    ui_pageloading: {
      hidden: true
    }
  });
}

function push_asm(e) {
  const _this = this;
  const ilog_asm_url = 'https://static.zhongan.com/asm.gif?';
  const dataset = e.currentTarget.dataset;

  var subQuery = {
    scene: app.launchInfo.scene,
    subscene: app.launchInfo.subscene,
    uid: app.User.extraInfo.openUserId
  };
  var urlParams = {
    asm: dataset.ilog,
    asm_href:
      app.config.domain + _this.route + ',' + Util.param(subQuery, false),
    asm_txt: dataset.ilogtxt || '',
    uid: app.User.extraInfo.openUserId,
    _: Date.now()
  };
  if (not_need_ilog || !dataset.ilog) {
    send_ilog(ilog_asm_url + Util.param(urlParams));
    Object.assign(subQuery, urlParams);
    subQuery.type = 'asm';
    wx.reportAnalytics('wxapp_domesticTravelIns', subQuery);
  }
}

function send_ilog(url) {
  wx.request({
    url: url,
    header: {
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Cache-Control': 'no-cache'
    },
    success(res) {
      if (res.statusCode !== 200) {
        app.Log.error(
          'ilog统计发送失败:' +
            JSON.stringify({
              errMsg: res.errMsg,
              statusCode: res.statusCode
            })
        );
      }
    },
    fail(res) {
      console.log('ilog统计发送失败:' + JSON.stringify(res));
    }
  });
}

function push_pv(pageid) {
  const _this = this;
  const pageId = pageid || _this.data.pageid;
  const ilog_pv_url =
    'https://static.zhongan.com/ilog_1.gif?' +
    Util.param({
      browser: 'wxapp',
      lang: app.OS.language,
      os: app.OS.system + '|' + app.OS.SDKVersion,
      agent: app.config.appName,
      cookie: '',
      referer: app.launchInfo.scene
    });
  const subQuery = {
    pageid: pageId,
    scene: app.launchInfo.scene,
    subscene: app.launchInfo.subscene,
    uid: app.User.extraInfo.openUserId,
    _: Date.now()
  };

  const url =
    ilog_pv_url +
    '&url=' +
    encodeURIComponent(
      app.config.domain + _this.route + ',' + Util.param(subQuery, false)
    );
  if (not_need_ilog) {
    send_ilog(url);
    subQuery.type = 'pv';
    wx.reportAnalytics('wxapp_domesticTravelIns', subQuery);
  }
}

function set_data(e) {
  const ds = e.currentTarget.dataset;
  ds.prop &&
    this.setData({
      [ds.prop]: ds.val
    });
  //this.push_asm(e);
}

function call_phone(e) {
  var ds = e.currentTarget.dataset;
  wx.makePhoneCall({
    phoneNumber: ds.phone || '1010-9955'
  });
  ds.ilog && this.push_asm(e);
}

function show_error(errorMsg) {
  const _this = this;
  _this.setData({
    errorTip: {
      flag: true,
      msg: errorMsg
    }
  });

  setTimeout(function() {
    _this.setData({
      errorTip: {
        flag: false,
        msg: ''
      }
    });
  }, 1500);
}

function tab_jump(e) {
  const ds = e.currentTarget.dataset;
  wx.redirectTo({
    url: ds.path
  });
  ds.ilog && this.push_asm(e);
}

function openFile(url, beforeOpen) {
  const _this = this;
  wx.showLoading({
    title: '加载中'
  });
  url = url.replace(/http:/, 'https:');
  wx.downloadFile({
    url: url,
    success: function(res) {
      if (beforeOpen && beforeOpen(res) === false) {
        wx.hideLoading();
        return;
      }
      console.log(' res.tempFilePath', res.tempFilePath);
      wx.openDocument({
        filePath: res.tempFilePath,
        complete: function() {
          wx.hideLoading();
        },
        fail: function(res) {
          _this.show_error('文件打开失败');
        }
      });
    },
    fail: function(e) {
      _this.show_error('文件下载失败');
      wx.hideLoading();
    }
  });
}

function tap_copy(e) {
  const data = e.currentTarget.dataset.copy;
  wx.setClipboardData({
    data: data,
    success: function(res) {
      wx.showToast({
        title: '复制成功',
        icon: 'success',
        duration: 1000
      });
    }
  });
}

function navTo(e) {
  const path = e.currentTarget.dataset.path;
  wx.navigateTo({
    url: path
  });
}

function sendFormId(e) {
  if (!e || e.type !== 'submit' || e.__formid_handled === true) return;

  e.__formid_handled = true;

  var reportData = {
    activityChannel: app.config.activityChannel,
    formId: e.detail.formId,
    formType: 1,
    formSourceType: e.target.dataset.nwname || e.target.dataset.formsource,
    totalMessageCount: 1
  };

  // if (reportData.formId == 'the formId is a mock one') {
  //   return;
  // }

  app.ajax({
    serviceName: 'za.sales.weChatApp.userFormId.create',
    method: 'POST',
    data: reportData
  });
}

function btnViewClick(e) {
  // console.log(e)
  const click = e.currentTarget.dataset.click;
  if (typeof this[click] !== 'function') {
    return;
  }

  const event = e;
  event.currentTarget.dataset = e.currentTarget.dataset.outterdata || {};

  this[click](e);
}

module.exports = pageBase;
