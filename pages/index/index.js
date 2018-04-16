//index.js
const app = getApp();
const pageBase = require('../pageBase');
const moment = require('../../utils/moment.min');
const Util = require('../../utils/util.js');

let timer = null;

const travelType = [];
const activity1212StartDate = '2017/12/5 00:00:00';
const activity1212EndDate = '2017/12/25 00:00:00';
const accessFlag = '__accessed__';

const imgUrls = [
    'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner/01.png',
    'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner/02.png',
    'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner/03.png',
    'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner/04.png',
    'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner/banner-shanghua.png'
]
//     'https://tac-cdn.zhongan.com/project/product/springfestival/banner/in_travel.jpg',
//     'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner_zero.png',
//     'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner_springFestival.jpg',
//     'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner_ski_new.png',
//     'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner_eu.png',
//     'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner_gloal.jpg',
//     'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/banner_valentineDay.png'
// // 'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/bnr_free_insurance.jpg'

const curPage = {
    data: {
        ui_pageloading: {
            hidden: false
        },

        imgUrls: imgUrls,
        indicatorDots: imgUrls.length > 1,
        autoplay: true,
        interval: 4000,
        duration: 500,

        pageid: 1152,
        checkResult: '',
        indexOrderNo: '',
        scene: app.launchInfo.scene,
        orderNo: '',
        showAcc: true,
        showLogo: false,
        showModal: false,
        ui_tab: {
            current: 'index'
        },
        encrypt_code: '',
        //默认显示状态，第一次访问并且在活动时间内显示
        activityModalVisible: true,
        //判断春节红包活动显示
        springfestivalVisible: false,
        // 判断1212活动显示
        activityStarted: false,
        //判断风险提示浮层是否展示
        risktipVisible: false,
        isFirstAccess: false,
        //判断是否适配IPX
        isIpx: app.globalData.isIPX,

        // 订阅title
        isSubscribe: false,
        subscribeTitle: '',
        currentActive: 0,//默认选择全部
        travelType,
        fixedTitDefault: false,
        prdsList: [], //['全部','境内旅行','出境旅行','航空出行']
        prdsLength: '',//产品的个数
        nation: ''//国家名
    },
    onLoad: function (options) {
        this.activityConfig();//获取活动配置
            this.riskTipEnter();//风险提示入口判断
        this.setData({
            encrypt_code: options.encrypt_code || ''
        });
        this.loadData();
    },
    onShow() {
        this.loadSubscribeInfo();
        this.zeroOutLine();
        this.isWxAvailable(wx.showShareMenu, () => {
            wx.showShareMenu()
        });
        const state = {};
        //赠险活动时间
        if (Date.now() > new Date('2017/12/31 00:00:00').getTime()) {
            state.showAcc = false;
        }
        const nowtime = new Date().getTime();

        //判断是否在活动日期

        if (nowtime > new Date(activity1212StartDate).getTime() && nowtime < new Date(activity1212EndDate).getTime()) {
            state.activityStarted = true;
        }


        //用户是否首次访问首页
        const accessedBefore = wx.getStorageSync(accessFlag);
        if (!accessedBefore) {
            wx.setStorageSync(accessFlag, true);
            state.isFirstAccess = true;
        }
        state.showSanyueyinghua = Util.during(new Date('2018-03-19 13:00:00').getTime(), new Date('2018-03-26 23:59:59').getTime());
        this.setData(state);
    },
    scroll(e) {
        console.log(e)
    },
    onShareAppMessage: function () {
        return {
            title: '买旅行保险，享旅途安心',
            path: 'pages/index/index'
        }
    },
    onPageScroll: function (e) {
        const scrollTop = e.scrollTop;
        this.data.scrollTop = scrollTop;

        if (scrollTop > 283 && this.data.fixedTitDefault) {
            return;
        }
        if (scrollTop < 283 && !this.data.fixedTitDefault) {
            return;
        }

        if (scrollTop > 283) {
            console.log(scrollTop + '************')
            this.setData({
                fixedTitDefault: true
            })
        } else {
            console.log(scrollTop + '-----------')
            this.setData({
                fixedTitDefault: false
            })
        }

    },
    onHide: function () {
        this.push_pv();
    },
    // /*进摄影大赛测试*/
    // toggleModal(e) {
    //   // wx.navigateTo({
    //   //   url: '../photoContest/index'
    //   // })
    //   let showModal = !this.data.showModal
    //   this.setData({
    //     showModal
    //   })
    //   if (showModal) {
    //     this.push_asm(e)
    //   }
    // },

    /*检查活动是否开始跳转赠险*/

    goAcc(e) {
        console.log('跳转旅行险===', e)
        this.preCheck();
    },
    //跳转境内旅行险小程序
    navigateToMiniProgram: function (e) {
        const _this = this;
        var ds = e.currentTarget.dataset;
        if (ds.appid) {
            if (!wx.navigateToMiniProgram) {
                _this.show_error('先升级下微信版本，再来点我哦！', 3);
                return;
            }
            var envVersions = {
                'prd': 'release',
                'uat': 'trial',
                'test': 'develop'
            };
            let opt = {
                appId: ds.appid,
                path: (ds.path || 'pages/productDetail/productDetail?isGroupBuy=true') + '&scene=' + (ds.scene || '') + '&encrypt_code=' + _this.data.encrypt_code,
                envVersion: envVersions[app.config.env]
            }
            wx.navigateToMiniProgram(opt)
        }

        this.push_asm(e);
    },
    //风险提示入口
    riskTipEnter: function () {
        var self = this;
        app.ajax({
            serviceName: 'za.activity.weChatApp.travel.appTravelPlan.isPopUp',
            serviceVersion: '1.0.0',
            method: 'POST'
        }).then(function (res) {
            if (res.data.success) {
                self.setData({ risktipVisible: res.data.value === 'N' })
            } else {
                self.show_error(res.errorMsg);
            }
            self.hidePageLoading();
        })
    },

    /*检查活动*/
    preCheck() {
        const _this = this;
        const data = { "activityChannel": 208, "activityCode": "thumbUp008", "giftCode": "10002535961_51308837" }
        //const data = { "activityChannel": 208, "activityCode": "thumbUp008", "giftCode": "giftCodeTravel" };
        const options = {
            serviceName: "za.sales.activity.gift.giftRelease.preCheck4app",
            data,
            version: "1.0.0",
            method: "POST",  //默认get,
        }
        // console.log('检查活动接口入参=====', options)
        app.ajax(options).then(function (res) {
            wx.hideLoading();
            //   console.log('检查活动接口返回=====', res)
            if (res && res.data.success) {
                if (res && res.data.value === true) {
                    //   console.log('正常进入页面')
                    wx.navigateTo({
                        url: '../indexDonate/indexDonate'
                    })
                } else {
                    if (res.data && res.data.extraInfo && res.data.extraInfo.releaseCheckResult) {
                        if (res.data.extraInfo.releaseCheckResult === 2 && res.data.extraInfo.giftBizIds) {
                            _this.setData({
                                giftBizIds: res.data.extraInfo.giftBizIds[0],
                                checkResult: res.data.extraInfo.releaseCheckResult,
                                orderNo: res.data.extraInfo.giftBizIds[0]
                            })
                            setTimeout(function () {
                                wx.navigateTo({
                                    url: "../inviteGet/inviteGet?giftBizIds=" + _this.data.giftBizIds + '&checkResult=' + _this.data.checkResult + '&orderNo=' + _this.data.orderNo
                                })
                            }, 0)
                        } else if (res.data.extraInfo.releaseCheckResult === 3) {
                            _this.setData({
                                checkResult: res.data.extraInfo.releaseCheckResult,
                            })
                            setTimeout(function () {
                                wx.navigateTo({
                                    url: "../inviteGet/inviteGet?checkResult=" + _this.data.checkResult
                                })
                            }, 0)

                            console.log('检查结果码======', _this.data.checkResult)
                        } else {
                            wx.navigateTo({
                                url: '../indexDonate/indexDonate'
                            })
                        }
                    }
                }
            } else {
                const errMsg = res.data.errorMsg
                _this.show_error(errMsg)
            }
        })
    },
    /*检查结束*/
    tabJump: function (e) {
        const path = e.currentTarget.dataset.path;
        wx.redirectTo({
            url: path
        });
        this.push_asm(e);
    },
    // 寒假活动配置
    activityConfig: function () {

        var self = this;
        app.ajax({
            serviceName: 'za.sales.activity.activityPageComponent.findPageComponentByActivityPageComponentDTO',
            serviceVersion: '1.0.0',
            method: 'POST',
            data: {
                activityChannel: app.config.activityChannel,
                activityCode: 'stageRedPacket001',
                cpId: 'ff633ad873686cf6b008afe24f48aa1423d9bde915b9',
                pageType: 'index'
            }
        }).then(function (res) {
            var resData = res.data;
            if (resData.success && resData.value) {
                var value = resData.value[0]
                self.setData({
                    zeroImageUrl: value.imageUrl,
                })
            }
        })
    },
    takeZero: function () {
        var self = this;
        app.ajax({
            serviceName: 'za.sales.weChatApp.activity.thumbup.thumbUpRecord.findJoinThumbUpActivity',
            serviceVersion: '1.0.0',
            method: 'POST',
            data: {
                activityChannel: app.config.activityChannel,
                activityCode: 'stageRedPacket001',
            }
        }).then(function (res) {
            var resData = res.data;
            const envVersions = {
                'prd': 'release',
                'uat': 'trial',
                'test': 'develop'
            };
            console.log(envVersions[app.config.env]);
            if (resData.success) {
                // if (resData.value){
                //     wx.navigateToMiniProgram({
                //         appId: 'wx3860781d95d8589d',
                //         path: 'pages/activityZero/index?url=/msf/activities/zero/self/&shareCode=' + self.data.shareCode,
                //         envVersion: envVersions[app.config.env]
                //     })

                // }else{
                //   wx.navigateToMiniProgram({
                //       appId: 'wx3860781d95d8589d',
                //       path: 'pages/activityZero/index?url=/msf/activities/zero',
                //       envVersion: envVersions[app.config.env]
                //   })
                wx.navigateTo({
                    url: '/pages/activityZero/index?url=/msf/activities/zero'
                })
                // }

            } else {
                self.show_error(res.errorMsg);
            }
            self.hidePageLoading();
        })

    },

    goZero(e) {
        wx.navigateTo({
            url: '/pages/activityZero/index?url=/msf/activities/zero'
        })
    },
    zeroOutLine() {
        this.setData({
            zeroDownLine: new Date().getTime() > new Date('2018/2/25').getTime()
        })
    },
    chunjie_ad(e) {
        wx.navigateTo({
            url: '/pages/activitySpring/index/index?scene=1356'
        })
    }
}

curPage.changeType = function (e) {
    const id = e.target.dataset.id;
    if (this.data.currentActive == id) {
        return;
    }
    this.setData({
        currentActive: id,
        prdsLength: this.data.prdsList[id].length
    })
}

curPage.changeTravelType = function (e) {
    const id = e.detail.current;
    if (this.data.currentActive == id) {
        return;
    }
    this.setData({
        currentActive: id,
        prdsLength: this.data.prdsList[id].length
    })
}

curPage.loadSubscribeInfo = function () {
    var self = this;
    app.ajax({
        serviceName: 'za.activity.travel.appTravelPlan.checkSubscription',
        serviceVersion: '1.0.0',
        method: 'POST',
    }).then(function (ret) {
        const res = ret.data;
        console.log(res)
        if (res.success && res.value) {
            self.setData({
                isSubscribe: res.value.status,
                subscribeTitle: res.value.title,
                nation: res.value.nation
            })
        } else {
            self.show_error(res.errorMsg);
        }
    })
}

curPage.goToNew = function (e) {
    wx.navigateTo({
        url: '/pages/safeGuide/index/index'
    })
}

curPage.loadData = function () {
    var self = this;
    app.ajax({
        serviceName: 'za.cms.product.getPage&pageId=30001',
        serviceVersion: '1.0.0',
        method: 'GET',
    }).then(function (ret) {
        const res = ret.data;
        console.log(res)
        self.setData({
            'ui_pageloading.hidden': true
        })
        if (res.success && res.value) {
            var productGroups = res.value.productGroups || [];
            var prdsAllList = [];
            var travelTypeList = [];
            productGroups.map((item, index) => {
                var prdsList = [];
                travelTypeList.push({ name: item.groupName,id:index})
                item.products.map((item,idx)=>{
                    var prdObj = {};
                    prdObj.src = item.imageUrl;
                    prdObj.path = item.targetWxUrl;
                    prdObj.appid = item.targetWxAppId;
                    prdObj.isStar = item.isStar || '';//明星产品
                    prdsList.push(Object.assign({}, JSON.parse(item.addition), prdObj));//一组一组数据
                    // prdsAllList.push(Object.assign({}, JSON.parse(item.addition), prdObj));//全部数据
                })
                self.data.prdsList.push(prdsList);//4组数据
            })
            // var prdsAllListNew = [];//排序后的全部数据
            // prdsAllList.map((item, idx) => {
            //     if (item.isStar=="Y"){
            //         prdsAllListNew.unshift(item);
            //     }else{
            //         prdsAllListNew.push(item);
            //     }
            // })
            // self.data.prdsList.unshift(prdsAllListNew)
            self.setData({
                prdsList: self.data.prdsList,
                prdsLength: self.data.prdsList[0].length,
                travelType: travelTypeList
            })
        } else {
            self.show_error(res.errorMsg);
        }
    })
}

Page(Object.assign({}, pageBase, curPage));
