// productDetail.js
const app = getApp();
const pageBase = require('../pageBase');
const dataSource = require('../data.js').productData;
const insurantPriceArr = [
    {
        title: '基础版',
        case: [
            { date: '1天', dueDate: '1', price: 4 },
            { date: '2-3天', dueDate: '3', price: 6 },
            { date: '4-7天', dueDate: '7', price: 15 },
            { date: '8-15天', dueDate: '15', price: 30 }
        ]
    },
    {
        title: '升级版',
        case: [
            { date: '1天', dueDate: '1', price: 12 },
            { date: '2-3天', dueDate: '3', price: 19 },
            { date: '4-7天', dueDate: '7', price: 34 },
            { date: '8-15天', dueDate: '15', price: 65 }
        ]
    },
    {
        title: '尊享版',
        case: [
            { date: '1天', dueDate: '1', price: 20 },
            { date: '2-3天', dueDate: '3', price: 29 },
            { date: '4-7天', dueDate: '7', price: 54 },
            { date: '8-15天', dueDate: '15', price: 102 }
        ]
    }
];
const proCode = [
    'ff633ad873686cf6bd0aa3e24f48aa1420dbbae910b9',
    'ff633ad873686cf6bd0aa3e24f48aa1420dbbae913b9',
    'ff633ad873686cf6bd0aa3e24f48aa1420dbbae912b9'
];

const curPage = {
    nw_fields: {
        pageId: 1153,
        pageName: '境内旅行险-商详页'
    },
    data: {
        productCode: '',
        productData: {},
        insurantPriceArr,
        destination: '',
        curCardList: '',
        showNavtoOrderList: false,
        showPackUp: false,
        packUp: true,
        price: '',
        insurantTypeChecked: 0,
        caseModal: {
            chooseCase: 0,
            chooseDate: 0
        },
        //判断是否适配IPX
        isIpx: app.globalData.isIPX
    },
    onLoad: function (options) {
        const _this = this;
        //从小程序码进入的情况
        const { sc } = app.launchInfo.query;

        const shareCode = options.shareCode ? options.shareCode : sc;

        const item = dataSource[0];

        console.log('item.pageid', item.pageid);
        _this.nw_set({
            pageId: item.pageid
        });
        _this.setData({
            productCode: 'ff633ad873686cf6bd0aa3e24f48aa1420dbbae910b9',
            price: item.productDetail.price,
            productData: item.productDetail,
            destination: options.destination || '',
            encrypt_code: options.encrypt_code || '',
            showPackUp: true,
            curCardList: item.productDetail.insurantType[0].cardList.slice(0, 5),
            // 通过推荐有礼进入的用户显示提示
            isShowShareTips: !!options.isShowShareTips,
            invitorShareCode: shareCode,
            scene: app.launchInfo.query.scene
        });
        
        const data = { activityChannel: 208 };
        const ajaxOptions = {
            serviceName: 'za.sales.weChatApp.flyingTravel.findUserOrderRecord',
            data,
            method: 'POST'
        };
        app.ajax(ajaxOptions).then(function (res) {
            if (res.data.value !== null) {
                _this.setData({
                    showNavtoOrderList: true
                });
            }
        });
        // 新增推荐分享访问记录
        shareCode && this.recordShareCode(shareCode);

        this.genShareCode();
        //授权允许获取用户信息
        pageBase.isWxAvailable(wx.authorize, () => {
            wx.authorize({
                scope: 'scope.userInfo',
                success: () => {
                    wx.getUserInfo({
                        withCredentials: true
                    });
                }
            });
        });
    },
    // 访问记录
    recordShareCode: function (shareCode) {
        const data = {
            subType: 5,
            shareCode
        };
        const options = {
            serviceName: 'za.sales.weChatApp.activity.share.follow.discuss',
            data,
            method: 'POST'
        };
        app.ajax(options);
    },
    onShow: function () {
        if (app.config.env != 'prd') {
            wx.setNavigationBarTitle({
                title: '周末自驾游' + app.config.env + '-数据无效】'
            });
        }
    },
    toOtherWxapp: function (e) {
        if (!wx.navigateToMiniProgram) {
            this.show_error('先升级下微信版本，再来点我哦！');
            return;
        } else {
            const envVersions = {
                prd: 'release',
                uat: 'trial',
                test: 'develop'
            };
            console.log(envVersions[app.config.env]);
            wx.navigateToMiniProgram({
                appId: 'wx3860781d95d8589d',
                path: 'pages/index/index?scene=' + (app.launchInfo.scene || ''),
                envVersion: envVersions[app.config.env]
            });
        }
    },
    navToTravelInOne: function () {
        if (!wx.navigateToMiniProgram) {
            wx.navigateTo({
                url: '../orderList/orderList'
            });
        } else {
            const envVersions = {
                prd: 'release',
                uat: 'trial',
                test: 'develop'
            };

            wx.navigateToMiniProgram({
                appId: 'wx3860781d95d8589d',
                path: 'pages/orderList/orderList?scene=' + (app.launchInfo.scene || ''),
                envVersion: envVersions[app.config.env]
            });
        }
    },
    onShareAppMessage: function ({ from }) {
        return {
            title: '这份安心送给我最关心的你。游遍境内无心事，保障用起来！',
            path: `pages/productDetail/productDetail?shareCode=${this.data
                .shareCode || ''}&scene=${app.launchInfo.query.scene}`,
            imageUrl:
            'https://tac-cdn.zhongan.com/wxapp/wxapp_traval_ins_in_one/recommend_gift_poster/share-bg-internal.png'
        };
    },

    genShareCode: function () {
        const data = {
            activityCode: 'ShareBuyPolicyGivenPoint208'
        };
        const options = {
            serviceName: 'za.sales.weChatApp.activity.share.follow.generate',
            data,
            method: 'POST'
        };
        app.ajax(options).then(({ data }) => {
            if (data.value) {
                this.setData({
                    shareCode: data.value.shareCode
                });
            }
        });
    },

    detailPdf: function (e) {
        const _this = this;
        const appUrl = 'http://za-tac.oss-cn-hzfinance.aliyuncs.com/wxapp/wxapp_traval_ins_in_one/weekend_selfdrive'
        const url = appUrl + e.currentTarget.dataset.url;
        _this.openFile(url, function (res) {
            if (res.statusCode == 301) {
                _this.show_error('超过每日最大下载次数（20次），请明天再来下载哦');
                return false;
            }
        });
        //this.push_asm(e);
    },
    switchInsurantType: function (e) {
        const _this = this;
        const val = e.currentTarget.dataset.val;
        const arr = _this.data.productData.insurantType[val].cardList;
        const flag = arr.length > 5 ? true : false;
        _this.setData({
            insurantTypeChecked: val,
            packUp: true,
            showPackUp: flag,
            curCardList: arr.slice(0, 5),
            price: this.data.insurantPriceArr[val].case[0].price
        });
        //this.push_asm(e);
    },
    showMore: function (e) {
        const _this = this;
        const data =
            _this.data.productData.insurantType[_this.data.insurantTypeChecked]
                .cardList;
        _this.setData({
            packUp: !_this.data.packUp,
            curCardList: _this.data.packUp ? data : data.slice(0, 5)
        });
    },
    toOrder: function (e) {
        const _this = this;
        const col = _this.data.caseModal.chooseCase;
        const row = _this.data.caseModal.chooseDate;
        const data = this.data.productData.insurantType[
            this.data.insurantTypeChecked
        ];
        const url =
            '../order/order?productCode=' +
            proCode[this.data.insurantTypeChecked] +
            '&date=' +
            this.data.insurantPriceArr[col].case[row].dueDate +
            '&price=' +
            this.data.price +
            '&destination=' +
            this.data.destination +
            '&insRule=' +
            data.insRule +
            '&needKnow=' +
            data.needKnow +
            '&encrypt_code=' +
            _this.data.encrypt_code +
            '&shareCode=' +
            (_this.data.invitorShareCode || '');
        if (_this.data.mod_layer_show === '4') {
            wx.navigateTo({ url });
        } else {
            _this.setData({
                mod_layer_show: '4',
                caseModal: {
                    chooseCase: this.data.insurantTypeChecked,
                    chooseDate: 0
                }
            });
        }
        //_this.push_asm(e);
    },
    //跳旅行险救援页面
    go_rescue: function () {
        wx.navigateTo({
             url:  '../../rescue/index?scene=' +
                (app.launchInfo.scene || '') +
                '&tabIndex=' +
                '2',
        });
    },
    computedPrice: function (e) {
        const _this = this;
        const ds = e.currentTarget.dataset;
        if (ds.prop === 'chooseCase') {
            _this.setData({
                insurantTypeChecked: ds.val
            });
        }
        const newCaseModal = Object.assign(this.data.caseModal, {
            [ds.prop]: ds.val
        });
        this.setData({
            caseModal: newCaseModal,
            price: this.data.insurantPriceArr[this.data.caseModal.chooseCase].case[
                this.data.caseModal.chooseDate
            ].price
        });
    },
    resetPrice: function () {
        this.setData({
            mod_layer_show: 0,
            caseModal: {
                chooseCase: this.data.caseModal.chooseCase,
                chooseDate: 0
            },
            price: this.data.insurantPriceArr[this.data.caseModal.chooseCase].case[0]
                .price
        });
    }
};

Page(Object.assign({}, pageBase, curPage));
