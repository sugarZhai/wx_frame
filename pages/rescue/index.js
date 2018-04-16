//jiuyuan
const app = getApp();
const pageBase = require('../pageBase');
const datas = require('./data');
const curPage = {
    data: {
        currentTab:0,
        active:[0,0],
        rescueData:{},
        conShow:false,
        phoneCall: "+864008910152"
    },
    onLoad: function (options) {
    //   console.log(options)
    //   console.log('页面去向==',this.options.tabIndex)
      var tabIndex = this.options.tabIndex || 0
      this.toggleTab(tabIndex)
    },
    onShow() {
      
    },
    onHide: function () {
        this.push_pv();
    },
    changeTab(e){
        var currentIndex=e.currentTarget.dataset.current
        this.toggleTab(currentIndex)
        this.setData({
            currentTab: currentIndex
        })
    },
    toggleTab(index){
        let rescueData = datas.rescueData[index];
        this.setData({
            rescueData,
            currentTab:index,
            active: rescueData.active
        })
        var tabPhone ="+864008910152"
        switch (index) {
            case '0':
                tabPhone = "+864008910152"
                break;
            case '1':
                tabPhone = "+81422351555"
                break;
            case '2':
                tabPhone = "4008910152"
                break;
        }
        this.setData({
            phoneCall: tabPhone
        })
    },
    showDetail(e){
        // console.log(e)
        var indexer = e.currentTarget.dataset.index
   
       if (this.data.active.toString()==indexer.toString()){
            this.setData({
                active:[-1,-1]
            })
        }else{
           this.setData({
               active: indexer
           })
        }
        // console.log('this.,data.active===', this.data.active)
    },
 callPhone(){
     const _this=this
     wx.showModal({
         title:'确定拨打',
         content: '救援电话' + _this.data.phoneCall,
         showCancel:true,
         confirmText:'拨打',
         success: function (res) {
             if (res.confirm) {
                 console.log('用户点击确定')
                 wx.makePhoneCall({
                     phoneNumber: _this.data.phoneCall
                 })
             } else if (res.cancel) {
                 console.log('用户点击取消')
             }
         }
     })
    }
}

Page(Object.assign({}, pageBase, curPage));
