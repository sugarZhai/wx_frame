//order.js
const app = getApp();
const pageBase = require('../pageBase');
const Util = require("../../../utils/util");

const date = new Date();

const curPage = {
    nw_fields: {
        pageId: 1154,
        pageName: '境内旅行险-投保页'
    },
    formData: {
        aggrement: true
    },
    data: {
        dueDate: 0,
        index: 0,
        inputDisable: false,
        submitDisable: true,
        insRule: '',
        needKnow: '',
        switchBtn: false,
        insurantList: [],
        formData: {
            effectiveDate: "",
            expiryDate: "",
            insuredCertiNo: "",
            insuredUserName: "",
            aggrement: true,
            insuredPhone: "",
            invoiceName: '',
            invoiceNum: ''
        },
        effectiveDate: {
            start: '',
            end: '',
        },
        fistInput: 0,
        newUser: true,
        newMaskName: '',
        newMaskID: '',
        newMaskPhone: '',
        productCode: '',
        price: '',
        totalPrice: '',
        destination: '',
        checkedNum: 0,
        useCoupon: false,
        coupon: {},
        encrypt_code: '',
        isDisName: false,
        isDisID: false,
        isDisPhone: false,
        needInvoice: false,
        //判断是否适配IPX
        isIpx: app.globalData.isIPX
    },
    onLoad: function (options) {
        console.log('透传过来的参数试试很么===', options)
        const time = new Date();
        const nowDate = new Date(time.getTime() + 24 * 60 * 60 * 1000);
        const endDate = Util.formatDate(new Date(time.getTime() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
        this.initOrderDate(nowDate, options.date);
        this.setData({
            productCode: options.productCode,
            price: options.price,
            dueDate: options.date,
            totalPrice: options.price,
            insRule: options.insRule,
            needKnow: options.needKnow,
            destination: options.destination,
            encrypt_code: options.encrypt_code,
            effectiveDate: {
                start: this.data.formData.effectiveDate,
                end: endDate
            },
            shareCode: options.shareCode || ''
        });
        this.checkUserOrder();
    },
    onShow: function () {
        const appList = app.insurantList;
        const _this = this;
        const data = { "param": { "activityChannel": "208" } };
        const options = {
            serviceName: "za.sales.weChatApp.userInsuredInfo.findByCondition",
            data,
            method: "POST"
        }
        let checkedNum = _this.data.switchBtn ? 1 : 0;
        app.ajax(options).then(function (res) {
            appList.map(function (item, index) {
                Object.assign(item, res.data.value[index]);
                if (item.checked) {
                    checkedNum++;
                }
            });
            console.log(checkedNum, _this.data.useCoupon, _this.data.coupon);
            let preTotalPrice = _this.data.useCoupon ? (checkedNum - 1) * parseInt(_this.data.price) + _this.data.coupon.targetPremiumAmount : checkedNum * _this.data.price;
            preTotalPrice > 0 || (preTotalPrice = 0);
            _this.setData({
                insurantList: appList,
                totalPrice: preTotalPrice,
                checkedNum,
                submitDisable: checkedNum > 0 ? false : true
            });
        });
    },
    onUnload: function () {
        app.insurantList = [];
    },

    unifiedFormData(baseData, newData) {
        let formData = {};
        Object.keys(baseData).map((item) => {
            formData[item] = baseData[item];
            if (!formData[item]) {
                formData[item] = newData[item];
            }
        })
        return formData;
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

    checkUserOrder: function () {
        const _this = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        const data = {
            "activityChannel": 208,
            "filterIdType": [1],
            "needUserInfo": [1, 3],
            "importUserInfo": true,
            "allowUseCoupon": true,
            "queryOrderCount": true,
            "travelDay": parseInt(_this.data.dueDate),
            "productCode": _this.data.productCode
        }
        _this.data.encrypt_code == '' || (Object.assign(data, { "couponCode": _this.data.encrypt_code }))
        const options = {
            serviceName: "SalesWeChatAppUnifiedOrderFindOrderUser",
            data,
            method: "POST",  //默认get
            version: "2.0.0"
        }
        app.ajax(options).then(function (res) {
            wx.hideLoading();
            const resData = res.data;
            const resValue = resData.value;

            let phone = resData.extraInfo.userPhoneList[0] ? resData.extraInfo.userPhoneList[0].phone : '',
                maskPhone = '';
            let newFormData = Object.assign({}, _this.data.formData);

            // this.formData里面存放的是非掩码的
            // this.data.formData里面存放的是掩码的

            if (resValue.length !== 0) {
                const value = resValue[0];
                newFormData.insuredUserName = value.name;
                newFormData.insuredPhone = phone;
                newFormData.insuredCertiNo = value.idNo;

                _this.formData = { ...newFormData };

                newFormData.insuredUserName = Util.maskName(value.name);
                newFormData.insuredCertiNo = Util.maskCardNo(value.idNo);
                newFormData.insuredPhone = phone && Util.maskPhone(phone);
                _this.setData({
                    formData: newFormData,
                    newUser: false
                });
            }
            resData.extraInfo.userBenefit ? (_this.setData({
                useCoupon: resData.extraInfo.userBenefit && resData.extraInfo.userBenefit.ifAvailableCoupon,
                coupon: {
                    ...resData.extraInfo.userBenefit
                }
            })
            ) : (console.log("券码不存在哦！"));
            _this.setData({
                isDisName: !!_this.formData.insuredUserName,
                isDisID: !!_this.formData.insuredCertiNo,
                isDisPhone: !!_this.formData.insuredPhone
            })
        })
    },

    navToAddInsurant: function (e) {
        const insurantList = this.data.insurantList.concat();
        const formData = this.formData;
        if (!formData.insuredUserName || !formData.insuredCertiNo || !formData.insuredPhone) {
            this.show_error('请先完善投保人信息');
            return;
        }
        let count = this.data.switchBtn ? 1 : 0;
        insurantList.map(item => {
            if (item.checked == true) {
                count++;
            }
            return count;
        })
        const url = "../insurantList/insurantList?name=" + this.formData.insuredUserName + '&idNo=' + this.formData.insuredCertiNo + '&isChecked=' + this.data.switchBtn + '&count=' + count;
        wx.navigateTo({
            url
        });
        //this.push_asm(e);
    },

    bindPickerChange: function (e) {
        this.initOrderDate(e.detail.value);
    },

    checkboxChange: function (e) {
        const flag = e.detail.value.length > 0;
        this.setFormData("aggrement", flag);
    },

    initOrderDate: function (date, dueDate) {
        const startDate = Util.formatDate(date, "yyyy-MM-dd");
        const time = new Date(date).getTime();
        const dayCount = dueDate || this.data.dueDate;
        const endDate = Util.formatDate(new Date(time + (parseInt(dayCount) - 1) * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

        this.formData = { ...this.formData, effectiveDate: startDate, expiryDate: endDate };

        const newFormData = Object.assign(this.data.formData, { effectiveDate: startDate, expiryDate: endDate });
        this.setData({
            formData: newFormData
        });
    },

    changeMsgCard: function () {
        this.setData({
            fistInput: 0,
            switchBtn: false,
            checkedNum: + this.data.checkedNum - 1,
            formData: this.formData
        })
    },

    switchChange: function (e) {
        const num = this.data.switchBtn ? this.data.checkedNum - 1 : this.data.checkedNum + 1;
        const formData = this.formData;
        if (!formData.insuredUserName || !formData.insuredCertiNo || !formData.insuredPhone) {
            this.show_error('请先完善投保人信息');
            this.setData({
                switchBtn: false
            });
            return;
        }
        if (num > 10) {
            this.show_error('最多可添加10人');
            this.setData({
                switchBtn: false
            });
            return;
        }

        let Fi = 0;
        const _this = this;
        let newMaskID = '', newMaskPhone = '', newMaskName = '';
        if (this.data.newUser) {
            Fi = this.data.fistInput === 0 ? 1 : 0;
            newMaskName = Util.maskName(formData.insuredUserName);
            newMaskID = Util.maskCardNo(formData.insuredCertiNo, 'I');
            newMaskPhone = Util.maskPhone(formData.insuredPhone);
            this.setData({
                formData: this.formData
            })
        }
        let preTotalPrice = this.data.coupon && this.data.coupon.ifAvailableCoupon ? (num - 1) * this.data.price + this.data.coupon.targetPremiumAmount : num * this.data.price;
        preTotalPrice > 0 || (preTotalPrice = 0);

        this.setData({
            totalPrice: preTotalPrice,
            switchBtn: !this.data.switchBtn,
            fistInput: Fi,
            newMaskName,
            newMaskID,
            newMaskPhone,
            checkedNum: num,
            useCoupon: this.data.coupon && this.data.coupon.ifAvailableCoupon && num > 0 ? true : false,
            submitDisable: num > 0 ? false : true
        });
    },

    invoiceChange() {
        let needInvoice = !this.data.needInvoice
        this.setData({
            needInvoice
        })
    },

    toEditInsurant: function (e) {
        const index = e.currentTarget.dataset.index;
        const data = this.data.insurantList[index];
        wx.navigateTo({
            url: "../insurantAdd/insurantAdd?name=" + data.name + '&idNo=' + data.idNo + '&relation=' + data.relation + '&id=' + data.id
        });
    },

    deletItem: function (e) {
        const num = this.data.checkedNum - 1;
        const index = e.currentTarget.dataset.index;
        const data = app.insurantList;
        data[index].checked = !data[index].checked;
        let preTotalPrice = this.data.coupon.ifAvailableCoupon ? (num - 1) * this.data.price + this.data.coupon.targetPremiumAmount : num * this.data.price;
        preTotalPrice > 0 || (preTotalPrice = 0);
        this.setData({
            insurantList: data,
            checkedNum: num,
            totalPrice: preTotalPrice,
            submitDisable: num > 0 ? false : true,
        });
    },

    formSubmit: function (e) {

        wx.showLoading({
            title: '订单处理中...',
            mask: true
        });

        const _this = this;
        let newList = app.insurantList.concat();
        const formData = this.formData;
        if (this.data.switchBtn) {
            newList.unshift({
                name: formData.insuredUserName,
                idNo: formData.insuredCertiNo,
                relation: 5,
                checked: true
            })
        }

        const travelStartDate = Util.formatDate(this.data.formData.effectiveDate, "yyyyMMdd") + "000000";
        // const unmaskId = this.data.unmaskID !== '' ? this.data.unmaskID : this.data.formData.insuredCertiNo;
        // const unmaskName = this.data.unmaskName === '' ? this.data.formData.insuredUserName : this.data.unmaskName;
        const { insuredCertiNo: unmaskId, insuredUserName: unmaskName, insuredPassport: unmaskPPNo } = formData;

        const validateIdCardNo = Util.validateIdCardNo(unmaskId);
        const birthday = Util.getBirthday(unmaskId);
        const gender = Util.getGender(unmaskId);
        if (validateIdCardNo.msg) {
            wx.hideLoading();
            _this.show_error(validateIdCardNo.code == 2 ? "投保人身份证信息不正确" : validateIdCardNo.msg);
            return;
        }

        //发票信息
        if (_this.data.needInvoice) {
            if (!formData.invoiceName) {
                wx.hideLoading();
                _this.show_error('请先完善发票信息！');
                return
            }
        }

        //验证手机号
        if (formData.insuredPhone) {
            if (!Util.validatePhone(formData.insuredPhone)) {
                wx.hideLoading();
                _this.show_error('请输入正确的手机号');
                return
            }
        }

        let orderDetails = [];
        let flag = true;
        newList.map((item, index) => {
            if (item.checked && item.checked === true) {
                if (item.idNo === _this.data.unmaskID && item.relation !== 5) {
                    flag = false;
                    return
                }
                const relation = ['父母', '配偶', '子女', '其他', '本人'][parseInt(item.relation) - 1];
                const insuredGender = Util.getGender(item.idNo);
                const insuredBirthDay = Util.getBirthday(item.idNo);
                let data = null;
                if (_this.data.coupon.ifAvailableCoupon && index == 0) {
                    data = {
                        "productCategory": "3",
                        "totalFee": _this.data.price,
                        "couponFee": _this.data.coupon.couponFee,
                        "payFee": _this.data.coupon.targetPremiumAmount,
                        "request": {
                            "travelDay": _this.data.dueDate,
                            "productCode": _this.data.productCode,
                            "premiumAmount": _this.data.coupon.targetPremiumAmount,
                            "requireInvoice": _this.data.needInvoice ? "Y" : "N",
                            "invoiceTitle": formData.invoiceName,
                            "taxpayerRegNum": formData.invoiceNum,
                            "policyHolderType": "1",
                            "policyHolderUserName": unmaskName,
                            "policyHolderCertiType": "I",
                            "policyHolderCertiNo": unmaskId,
                            "policyHolderGender": gender == '女' ? "F" : "M",
                            "policyHolderBirthDate": Util.formatDate(birthday, "yyyyMMdd"),
                            "policyHolderPhone": formData.insuredPhone,
                            "insuredUserName": item.name,
                            "insuredCertiType": "I",
                            "insuredCertiNo": item.idNo,
                            "insuredGender": insuredGender,
                            "insuredPhone": "",
                            "insuredBirthDay": Util.formatDate(insuredBirthDay, "yyyyMMdd"),
                            "travelStartDate": travelStartDate,
                            "destination": "中国境内（不含港澳台）",
                            "contactMail": "",
                            "extraInfo": {
                                "uid": app.User.extraInfo.openUserId,
                                "scene": app.launchInfo.scene,
                                "subscene": app.launchInfo.subscene,
                                "effectiveDate": Util.formatDate(formData.effectiveDate, "yyyyMMdd"),
                                "expiryDate": Util.formatDate(formData.expiryDate, "yyyyMMdd"),
                                "elePolicyEmail": "",
                                "isEffectiveNow": "N",
                                "destination": _this.data.destination,
                                "relation": relation,
                                "isUsedCoupon": _this.data.coupon.ifAvailableCoupon ? 'Y' : 'N',
                                "couponInfo": {
                                    "couponDefCode": _this.data.coupon.couponDefCode,
                                    "couponNo": _this.data.coupon.couponCode,
                                },
                                "shareGivenPoint": {
                                    "shareCode": this.data.shareCode
                                }
                            }
                        }
                    }
                } else {
                    data = {
                        "productCategory": "3",
                        "totalFee": _this.data.price,
                        "couponFee": 0,
                        "payFee": _this.data.price,
                        "request": {
                            "travelDay": _this.data.dueDate,
                            "productCode": _this.data.productCode,
                            "requireInvoice": _this.data.needInvoice ? "Y" : "N",
                            "invoiceTitle": formData.invoiceName,
                            "taxpayerRegNum": formData.invoiceNum,
                            "policyHolderType": "1",
                            "policyHolderUserName": unmaskName,
                            "policyHolderCertiType": "I",
                            "policyHolderCertiNo": unmaskId,
                            "policyHolderGender": gender == '女' ? "F" : "M",
                            "policyHolderBirthDate": Util.formatDate(birthday, "yyyyMMdd"),
                            "policyHolderPhone": formData.insuredPhone,
                            "insuredUserName": item.name,
                            "insuredCertiType": "I",
                            "insuredCertiNo": item.idNo,
                            "insuredGender": insuredGender,
                            "insuredPhone": "",
                            "insuredBirthDay": Util.formatDate(insuredBirthDay, "yyyyMMdd"),
                            "travelStartDate": travelStartDate,
                            "destination": "中国境内（不含港澳台）",
                            "premiumAmount": _this.data.price,
                            "contactMail": "",
                            "extraInfo": {
                                "uid": app.User.extraInfo.openUserId,
                                "scene": app.launchInfo.scene,
                                "subscene": app.launchInfo.subscene,
                                "effectiveDate": Util.formatDate(formData.effectiveDate, "yyyyMMdd"),
                                "expiryDate": Util.formatDate(formData.expiryDate, "yyyyMMdd"),
                                "elePolicyEmail": "",
                                "isEffectiveNow": "N",
                                "destination": _this.data.destination,
                                "relation": relation,
                                "shareGivenPoint": {
                                    "shareCode": this.data.shareCode
                                }
                            }
                        }
                    }
                }

                orderDetails.push(data);
            }
        })
        console.log(orderDetails);
        if (!flag) {
            wx.hideLoading();
            _this.show_error('您重复选择了被保人！');
            return
        }
        if (orderDetails.length === 0) {
            wx.hideLoading();
            _this.show_error('请先选定被保人');
            return
        }

        const data = {
            "order": {
                "activityChannel": 208,
                "tradeType": "JSAPI"
            },
            'orderDetails': orderDetails
        }


        const options = {
            serviceName: 'za.sales.weChatApp.multiUnifiedOrder.createOrder',
            data,
            method: 'POST'
        }
        console.log("最新的", data);
        submitForm(options);


        function submitForm(options) {
            app.ajax(options).then(function (res) {
                if (res.data.success) {
                    const value = res.data.value;
                    wx.requestPayment({
                        'timeStamp': value.timeStamp,
                        'nonceStr': value.nonceStr,
                        'package': value.package,
                        'signType': value.signType,
                        'paySign': value.paySign,
                        'success': function (res) {
                            const checkTimes = 0;
                            checkPolicy(value.orderNo, checkTimes);
                        },
                        'fail': function (error) {
                            //取消支付
                            wx.hideLoading();
                            _this.show_error("嘤嘤嘤～您取消支付了！")
                            const data = {
                                activityChannel: 208,
                                orderNo: value.orderNo,
                                orderStatus: 5,
                                errorMsg: error.errMsg
                            };
                            const options = {
                                serviceName: 'SalesWeChatAppUnifiedOrderPayFailNotify',
                                data,
                                method: 'POST'
                            };
                            app.ajax(options);
                        }
                    })
                } else {
                    wx.hideLoading();
                    if (res.data.errorMsg === null) {
                        res.data.value.orderDetailResult.map(item => {
                            if (!item.success) {
                                _this.show_error(item.errorMsg);
                                return
                            }
                        })
                    } else {
                        _this.show_error(res.data.errorMsg);
                    }


                }
            });
        }


        function checkPolicy(orderNo, checkTimes) {
            wx.showLoading({
                title: '核保中...',
                mask: true
            });
            const that = this;
            if (!orderNo) {
                wx.hideLoading();
                _this.show_error("缺少orderNo");
                return;
            }
            checkTimes++;
            const data = {
                orderNo,
                activityChannel: 208
            };
            console.log("data", data);
            const policyFail = function () {
                wx.hideLoading();
                wx.navigateTo({
                    url: '../orderFail/orderFail'
                })
            }, nextTry = function () {
                setTimeout(function () {
                    checkPolicy(orderNo, checkTimes, app);
                }, 5000);
            };
            const options = {
                serviceName: 'za.sales.weChatApp.multiUnifiedOrder.findOrderStatus',
                data,
                method: 'POST'
            };
            console.log('第' + checkTimes + '轮询:')
            if (checkTimes >= 24) {
                policyFail();
                return;
            }
            app.ajax(options).then(function (res) {
                console.log(res);
                if (res.data.success) {
                    var status = res.data.value.orderStatus;
                    // 出单失败
                    if (status == 8) {
                        policyFail();
                        return;
                    } else if (status == 9) {
                        wx.hideLoading();
                        wx.showToast({ title: '购买成功', mask: true });
                        wx.navigateTo({
                            url: '../orderSuccess/index'
                        });
                        // if (!wx.navigateToMiniProgram) {
                        //   wx.navigateTo({
                        //     url: '../orderSuccess/index'
                        //   });
                        // } else {
                        //   const envVersions = {
                        //     'prd': 'release',
                        //     'uat': 'trial',
                        //     'test': 'develop'
                        //   };

                        //   wx.navigateToMiniProgram({
                        //     appId: 'wx3860781d95d8589d',
                        //     path: 'pages/orderList/orderList?scene=' + (app.launchInfo.scene || ''),
                        //     envVersion: envVersions[app.config.env]
                        //   })
                        // }
                        return;
                    }
                    nextTry();
                } else {
                    nextTry();
                }
            });
        }

    },

    toggleInvoiceExplain() {
        let showInvoiceExplain = !this.data.showInvoiceExplain;
        this.setData({
            showInvoiceExplain
        })
    },

    // 获取手机号
    getPhoneNumber: function (e) {
        const _this = this
        const { iv, encryptedData } = e.detail;
        if (iv && encryptedData) {
            const data = {
                activityChannel: 208,
                checkPhoneMethod: 'WECHAT',
                isNeedReturnPhone: true,
                phone: encryptedData,
                iv
            }
            const ajaxOptions = {
                serviceName: "za.sales.weChatApp.userPhone.create",
                data,
                method: "POST"
            };
            console.log('自动获取手机号的入参===', ajaxOptions)
            app.ajax(ajaxOptions).then(function (res) {
                const data = res.data;
                _this.formData.insuredPhone = data.extraInfo.phone;
                console.log('之前的formData===', _this.data.formData)
                _this.setData({
                    formData: {
                        ..._this.formData,
                        insuredPhone: data.extraInfo.phone
                    },
                    isDisPhone: true
                });
                console.log('之后的formData===', _this.data.formData)
            });
        }
    },

}




Page(Object.assign({}, pageBase, curPage));