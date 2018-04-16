//index.js
const app = getApp();
const pageBase = require('../pageBase');
const Util = require("../../../utils/util");

const curPage = {
  nw_fields: {
    pageId: 1155,
    pageName:'境内旅行险-被保人列表页'
  },
  data:{
    maskSelfName:'',
    selfIdNo:'',
    selfChecked:true,
    insurantList:[],
    checkedNum:0,
    //判断是否适配IPX
    isIpx: app.globalData.isIPX
  },
  onLoad:function(options){
   this.setData({
     maskSelfName: Util.maskName(options.name),
     selfIdNo: options.idNo,
     selfChecked: options.isChecked === 'true' ? true :false,
     checkedNum: options.count
   });
  },
  onShow:function(options){
    const appList = app.insurantList.concat();
    const _this = this;
    const data = { "param": { "activityChannel": "208" } };
    const ajaxOptions = {
      serviceName: "za.sales.weChatApp.userInsuredInfo.findByCondition",
      data,
      method: "POST"
    }
    app.ajax(ajaxOptions).then(function (res) {
      const data = res.data.value;
      data.map(function (item,index){
        if (!appList[index]){
          item.checked= false;
        }else{
          item.checked = appList[index].checked;
        }
      })
      console.log(_this.data.checkedNum);
      _this.setData({
        insurantList: data
      })
    })
  },
  toggleChecked: function (e) {
    const indx = e.currentTarget.dataset.index;
    const _this= this;
    const data = this.data.insurantList.concat();
    const item = data[indx];
    if (_this.data.selfChecked && item.idNo == _this.data.selfIdNo){
      _this.show_error('您重复选择了投保人');
    }
    if (this.data.checkedNum < 10 && item.checked == false){
        ++this.data.checkedNum;
        item.checked = item.checked ? !item.checked : true;
    } else if (item.checked == true){
      --this.data.checkedNum;
      item.checked = false;
    }else{
      _this.show_error('最多可添加10人');
    }
    this.setData({
      insurantList: data,
      checkedNum: this.data.checkedNum
    });
    
  },
  toggleSelfChecked:function(){
    console.log(this.data.checkedNum);
    if (this.data.checkedNum > 9 && this.data.selfChecked == false){
      this.show_error('最多可添加10人');
      return;
    }
    this.setData({
      selfChecked: !this.data.selfChecked,
      checkedNum: this.data.selfChecked ? parseInt(this.data.checkedNum)- 1 : parseInt(this.data.checkedNum )+1
    })
    const pages= getCurrentPages();
    const leastPage = pages[pages.length-2];
    leastPage.setData({
      switchBtn: this.data.selfChecked
    })
  },
  toEditInsurant:function(e){
    const index = e.currentTarget.dataset.index;
    const data = this.data.insurantList[index];
    wx.navigateTo({
      url: "../insurantAdd/insurantAdd?name=" + data.name + '&idNo=' + data.idNo + '&relation=' + data.relation +'&id='+ data.id
    });
    //this.push_asm(e);
  },
  sureAdd:function(e){
    app.insurantList = this.data.insurantList.concat();
    wx.navigateBack({
      delta: 1
    })
    //this.push_asm(e);
  },
  deletItem: function (e){
    const _this= this;
    const dataset = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要删除该被保人',
      success: function (res) {
        if (res.confirm) {
          const data = { "id": dataset.id };
          const options= {
            serviceName: "za.sales.weChatApp.userInsuredInfo.delete",
            data,
            method: "POST"
          }
          app.ajax(options).then(function (res){
            _this.data.insurantList.splice(dataset.index, 1);
            _this.setData({
              insurantList: _this.data.insurantList
            });
            app.insurantList = _this.data.insurantList;
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
}

Page(Object.assign({}, pageBase, curPage));