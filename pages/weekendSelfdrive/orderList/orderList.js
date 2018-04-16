//order.js
const app = getApp();
const pageBase = require('../pageBase');
const Util = require("../../../utils/util");

const curPage = {
  data: {
    pageid: 1042,
    listData: [],
    hasOrder: false,
    oneUser: false,
    ui_pageloading:false,
    ui_tab: {
      current: 'orderList'
    },
  },
  onLoad: function (options) {
    if (options.skipTo==='true'){
      if (!wx.navigateToMiniProgram) {
        wx.navigateTo({
          url: '../orderList/orderList'
        });
      } else {
        const envVersions = {
          'prd': 'release',
          'uat': 'trial',
          'test': 'develop'
        };
        
        wx.navigateToMiniProgram({
          appId: 'wx3860781d95d8589d',
          path: 'pages/orderList/orderList?scene=' + (app.launchInfo.scene || ''),
          envVersion: envVersions[app.config.env]
        })
      }
    }
    const _this = this;
    const data = { "activityChannel": 208 };
    const ajaxOptions = {
      serviceName: "za.sales.weChatApp.flyingTravel.findUserOrderRecord",
      data,
      method: "POST"
    };

    app.ajax(ajaxOptions).then(function (res) {
      if (res.data.value===null){
        _this.setData({
          ui_pageloading: true,
          hasOrder: false,
          oneUser: true
        });
      }else{
        const data = res.data.value.map(item => {
          item.insuredUserName = Util.maskName(item.insuredUserName);
          item.policyStartDate = Util.formatDate(item.policyStartDate, 'yyyy/MM/dd hh:mm');
          item.policyEndDate = Util.formatDate(item.policyEndDate, 'yyyy/MM/dd hh:mm');
          return item;
        })
        console.log("data",data);
        if (data.length > 0) {
          _this.setData({
            hasOrder: true,
            ui_pageloading: true,
            listData: data
          });
          if (data.length > 1) {
            _this.setData({
              ui_pageloading: true,
              oneUser: false
            });
          }
        }
      }
    });

  },
  

  showModal:function(){

  },
  seePolicy: function (e) {
    const _this = this;
    var url = e.target.dataset.contracturl;
    _this.openFile(url, function (res) {
      if (res.statusCode == 301) {
        _this.show_error('超过每日最大下载次数（20次），请明天再来下载哦!!')
        return false
      }
    });
    _this.push_asm(e);
  }
}

Page(Object.assign({}, pageBase, curPage));