//index.js
const app = getApp();
const pageBase = require('../pageBase');
const Util = require("../../../utils/util");

const curPage = {
    nw_fields: {
        pageId: 1155,
        pageName: '投保成功-投保成功页'
    },
    data: {
        //判断是否适配IPX
        isIpx: app.globalData.isIPX
    },
    onLoad: function (options) {
       
    },
    onShow: function (options) {
     
    }
 
}

Page(Object.assign({}, pageBase, curPage));