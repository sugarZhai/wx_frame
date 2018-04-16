// orderFail.js
const app = getApp();
const pageBase = require('../pageBase');

const curPage = {
  nw_fields: {
    pageId: 1163,
    pageName:'境内旅行险-投保失败页面'
  },
  data: {
  },
  onLoad: function () {
  },
  go_home: function (e) {
    wx.redirectTo({
      url: "../index/index"
    });
    //this.push_asm(e);
  }
}

Page(Object.assign({}, pageBase, curPage));