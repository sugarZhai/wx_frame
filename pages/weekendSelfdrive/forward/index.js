// pages/activityRecommend/forward/index.js

const pageBase = require('../pageBase');

const app = getApp();

Page({
  data: {
    back: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const { path, appid } = options;

    const decodePath = decodeURIComponent(path);

    if (path && appid) {
      pageBase.navigateToMiniProgram(null, {
        appid,
        path: decodePath
      });
    }
  },
  onShow() {
    if (this.data.back) {
      setTimeout(() => {
        //只有是从其他小程序中返回时链接未改变时才返回上层（链接改变时表示跳到poster页面）
        if (app.launchInfo.path === 'pages/forward/index') {
          wx.navigateBack();
        }
      }, 100);
      if (getCurrentPages().length > 1) {
      } else if (getCurrentPages().length === 1) {
        //wx.navigateBack();
      }
    }
    this.setData({
      back: true
    });
  }
});
