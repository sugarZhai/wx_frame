const app = getApp();
const OS = app.OS;
const Util = require("../utils/util");
const whiteList = require("../constant/whiteList");
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

    //显示tips
    tipShow,

    //
    tab_jump,

    go_back() { wx.navigateBack() },

    //navTo
    navTo,

    setFormData,

    setDefault,
    // 获取手机号
    getPhoneNumber,
    compatiblePhoneNumber,
    // 发送验证码
    sendSms,
    // 手动绑定手机号
    bindRightNow,
    // 关闭弹层
    closeMask,
    // 参赛上传图片
    choosePhoto,
    clickTelInput,
    onTelNumberChange,
    checksumTap,
    telInputBlur,
    clickVerifyInput,
    verifyInputBlur,
    countDown,

    //跳转到别的小程序
    navigateToMiniProgram,
    // 兼容微信版本
    isWxAvailable,
    // formId
    btnViewClick,
    sendFormId,
    onShow: function () {
        // this.setData({
        //   contactus_show: Util.offWork()
        // });
        if (this.auto_push !== false) {
            this.push_pv();
        }
    }
}

function navigateToMiniProgram(e, data) {

    var ds = data || e.currentTarget.dataset;
    if (ds.appid) {

        if (!wx.navigateToMiniProgram) {
            app.showError('先升级下微信版本，再来点我哦！', 3);
            return;
        }
        var envVersions = {
            'prd': 'release',
            'uat': 'trial',
            'test': 'develop'
        };

        wx.navigateToMiniProgram({
            appId: ds.appid,
            path: ds.path,
            envVersion: envVersions[app.config.env],
            extraData: ds.extraData
        })
    }

    this.push_asm(e);
}

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
                })
            }
        });
        return;
    }
}
function choosePhoto(e, verify) {
    let _this = this
    _this.push_asm(e);
    if (Date.now() > new Date('2017/10/17 00:00:00').getTime()) {
        wx.showModal({
            showCancel: false,
            title: '提示',
            content: '您来晚啦！当前活动已结束',
            success() {
                wx.navigateTo({
                    url: '../index/index'
                })
            }
        });
        return;
    }
    if (!verify) {
        _this.isWxAvailable(wx.getSetting, () => {
            wx.getSetting({
                success(res) {
                    let setting = res.authSetting || {},
                        userInfo = setting['scope.userInfo']
                    if (!userInfo) {
                        wx.showModal({
                            showCancel: false,
                            title: '提示',
                            content: '需要同意授权才能参加此活动！',
                            success(res) {
                                if (res.confirm) {
                                    wx.openSetting()
                                }
                            }
                        })
                    } else {
                        _this.choosePhoto(e, true)
                    }
                }
            });
            return;
        });
    }
    wx.chooseImage({
        count: 1,
        sizeType: 'compressed',
        success(res) {
            let path = res.tempFilePaths[0]
            wx.getImageInfo({
                src: path,
                success(e) {
                    let { width, height } = e
                    if (width / height > 2 || height / width > 2) {
                        wx.showModal({
                            title: '提示',
                            content: '上传的图片长宽比不能超过2:1',
                            confirmText: '重新上传',
                            success(res) {
                                if (res.confirm) {
                                    _this.choosePhoto()
                                }
                            }
                        })
                    } else {
                        app.selectedPhoto = {
                            path,
                            width,
                            height
                        }
                        app.newTagTemp = {}
                        wx.navigateTo({
                            url: '../photoEditor/photoEditor'
                        })
                    }
                }
            })
        }
    })
}
function getPhoneNumber(e) {

    this.push_asm(e);
    const _this = this
    const { iv, encryptedData } = e.detail;

    if (iv && encryptedData) {
        const data = {
            activityChannel: 208,
            checkPhoneMethod: 'WECHAT',
            phone: encryptedData,
            iv
        }
        const ajaxOptions = {
            serviceName: "za.sales.weChatApp.userPhone.create",
            data,
            method: "POST"
        };
        app.ajax(ajaxOptions).then(function (res) {
            _this.setData({
                ifPhone: true
            });
            _this.tipShow(res.data.success ? '绑定成功' : '绑定失败，请稍后再试~');
        });
    } else {
        this.setData({
            isShowMask: true
        })
    }

}

//兼容不支持wx直接获取手机号码
function compatiblePhoneNumber() {
    if (!wx.canIUse('button.open-type.getPhoneNumber')) {
        this.setData({
            isShowMask: true
        })
    }
}

function bindRightNow() {
    const _this = this;
    const smsVerificationCode = this.data.verifyCodeSpan.join('');
    const phone = this.data.telNumber.split(' ').join('');
    const data = {
        activityChannel: 208,
        checkPhoneMethod: 'SMS',
        smsVerificationCode,
        smsTemplateNo: 'tac_1608005',
        phone
    }
    const ajaxOptions = {
        serviceName: "za.sales.weChatApp.userPhone.create",
        data,
        method: "POST"
    };
    app.ajax(ajaxOptions).then(function (res) {
        if (res.data.success) {
            _this.tipShow('恭喜你！绑定成功~');
            _this.setData({ isShowMask: false, ifPhone: true });
        } else {
            _this.tipShow('绑定失败，请再试一下~');
        }
    });
}

function sendSms(e) {
    const _this = this;
    const c1 = e.currentTarget.dataset.ca;
    const c2 = e.currentTarget.dataset.cb;
    const phone = this.data.telNumber.split(' ').join('');
    const legalPhone = /^1[0-9]{10}$/.test(phone);
    const data = {
        phone,
        templateNo: 'tac_1608005',
        activityChannel: 208,
        activityCode: 'photoMatch001'
    }
    const ajaxOptions = {
        serviceName: 'SalesSendSms',
        data,
        method: 'POST'
    };
    legalPhone ?
        app.ajax(ajaxOptions).then(function (res) {
            if (res.data.success) {
                _this.tipShow('短信已发送，请注意查收~');

                _this.countDown(60, c1, c2);
            } else {
                _this.tipShow('发送失败，请稍后再试~');
            }
        }) :
        _this.tipShow('请输入正确的手机号~');
}
function closeMask() {
    this.setData({
        isShowMask: false
    })
}
function clickTelInput() {
    this.setData({ focusTel: true })
}

function onTelNumberChange(e) {
    this.setData({ telNumber: e.detail.value.replace(/\D/g, '').replace(/^.{3}|.{4}(?!$)/g, '$& ').replace(/^(.{3}) $/, '$1') })
}

function checksumTap(e) {
    this.setData({ inputFocus: true, focusVerifyCode: true });
}

function telInputBlur(e) {
    if (e.detail.value.length === 0) {
        this.setData({ focusTel: false })
    }
}

function clickVerifyInput(e) {
    console.log(e.detail.value);
    const val = e.detail.value;
    const newVal = val.split('').filter(function (item) {
        return !!item;
    });
    val.length == 6 && this.setData({ isCanBind: true })
    this.setData({
        focusVerifyCode: true,
        verifyCodeSpan: newVal
    })
}

function verifyInputBlur(e) {
    if (e.detail.value.length === 0) {
        this.setData({ focusVerifyCode: false })
    }
}

function countDown(count, c1, c2) {
    const that = this;
    if (count == 0) {
        this.setData({
            msgCodeBtn: {
                text: '发送验证码',
                tap: 'sendSms',
                className: c1
            }
        });
        return;
    } else {
        this.setData({
            msgCodeBtn: {
                text: count + 's可重发',
                tap: '',
                className: c2
            }
        });
    }
    var time = setTimeout(function () {
        count--;
        that.countDown(count, c1, c2);
    }, 1000);
}

function tipShow(errorMsg) {
    this.setData({
        praiseFail: errorMsg,
        tipShow: true
    });
    setTimeout(() => {
        this.setData({
            tipShow: false
        });
    }, 1500);
}


function setFormData(key, value) {
    const item = {};
    item[key] = value;
    var newForm = Object.assign({}, this.data.formData, item);
    this.setData({
        formData: newForm
    })
    if (typeof (value) == 'string') this.setDefault();
}

function setDefault() {
    let flag = true;
    const _this = this;
    Object.keys(_this.data.formData).map((item) => {
        if (item === "aggrement" && !_this.data.formData[item]) {
            flag = false;
        } else if (_this.data.formData[item] === "") {
            flag = false;
            if (item == "elePolicyEmail" && _this.data.switchBtn) {
                flag = true;
            }
        };
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
    const ilog_asm_url = "https://static.zhongan.com/asm.gif?"

    if (!e || !e.currentTarget || !e.target) {
        return
    }
    const dataset = e.currentTarget.dataset;

    var subQuery = {
        scene: app.launchInfo.scene,
        subscene: app.launchInfo.subscene,
        uid: app.User.extraInfo.openUserId,
    }
    var urlParams = {
        asm: dataset.ilog,
        asm_href: app.config.domain + _this.route + ',' + Util.param(subQuery, false),
        asm_txt: dataset.ilogtxt || '',
        uid: app.User.extraInfo.openUserId,
        _: Date.now()
    };
    if (not_need_ilog && dataset.ilog) {
        send_ilog(ilog_asm_url + Util.param(urlParams));
        Object.assign(subQuery, urlParams);
        subQuery.type = 'asm';
        //wx.reportAnalytics('wxapp_domesticTravelIns', subQuery);
    }
}

function send_ilog(url) {
    wx.request({
        url: url,
        header: {
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Cache-Control': 'no-cache'
        },
        success(res) {
            if (res.statusCode !== 200) {
                app.Log.error('ilog统计发送失败:' + JSON.stringify({
                    errMsg: res.errMsg,
                    statusCode: res.statusCode
                }))
            }
        },
        fail(res) {
            console.log('ilog统计发送失败:' + JSON.stringify(res))
        }
    })
}

function push_pv(pageid) {
    const _this = this;
    const pageId = pageid || _this.data.pageid;
    const ilog_pv_url = "https://static.zhongan.com/ilog_1.gif?" + Util.param({
        browser: 'wxapp',
        lang: app.OS.language,
        os: app.OS.system + '|' + app.OS.SDKVersion,
        agent: app.config.appName,
        cookie: '',
        referer: app.launchInfo.scene || '1001'
    });
    const subQuery = {
        pageid: pageId,
        scene: app.launchInfo.scene || '1001',
        subscene: app.launchInfo.subscene,
        uid: app.User.extraInfo.openUserId,
        _: Date.now()
    }

    const url = ilog_pv_url + '&url=' + encodeURIComponent(app.config.domain + _this.route + ',' + Util.param(subQuery, false));
    console.info('push_pv url', url)
    if (not_need_ilog) {
        send_ilog(url)
        subQuery.type = 'pv'
        // wx.reportAnalytics('wxapp_domesticTravelIns', subQuery);
    }
}

function set_data(e) {
    const ds = e.currentTarget.dataset;
    ds.prop && this.setData({
        [ds.prop]: ds.val
    });
    this.push_asm(e);
}


function call_phone(e) {
    var ds = e.currentTarget.dataset;
    wx.makePhoneCall({
        phoneNumber: ds.phone || '1010-9955'
    })
    ds.ilog && this.push_asm(e)
}

function show_error(errorMsg) {
    const _this = this;
    _this.setData({
        errorTip: {
            flag: true,
            msg: errorMsg
        }
    });

    setTimeout(function () {
        _this.setData({
            errorTip: {
                flag: false,
                msg: ''
            }
        })
    }, 1500);
}

function tab_jump(e) {
    console.log(e)
    const ds = e.currentTarget.dataset;
    console.log(ds)
    console.log(ds.path)
    wx.redirectTo({
        url: ds.path,
        success: function (res) {
            console.log('当前的路径==', res)
        }
    });
    ds.ilog && this.push_asm(e)
}

function openFile(url, beforeOpen) {
    const _this = this;
    wx.showLoading({
        title: '加载中',
    });
    url = url.replace(/http:/, 'https:');
    wx.downloadFile({
        url: url,
        success(res) {
            if (beforeOpen && beforeOpen(res) === false) {
                wx.hideLoading();
                return
            }
            wx.openDocument({
                filePath: res.tempFilePath,
                complete: function () {
                    wx.hideLoading();
                },
                fail: function (res) {
                    _this.show_error('文件打开失败');
                }
            })
        },
        fail(e) {
            _this.show_error('文件下载失败');
            wx.hideLoading();
        }
    })

}

function tap_copy(e) {
    const data = e.currentTarget.dataset.copy.toString();
    wx.setClipboardData({
        data: data,
        success: function (res) {
            wx.showToast({
                title: '复制成功',
                icon: 'success',
                duration: 1000
            })
        }
    })
}

function navTo(e) {
    const path = e.currentTarget.dataset.path;
    console.log('传递过来的路径是什么====', e)
    wx.navigateTo({
        url: path
    });
    //this.push_asm(e);
}

function btnViewClick(e) {
    console.log('button clicked');
    const click = e.currentTarget.dataset.click;
    if (typeof this[click] !== 'function') {
        return;
    }

    const event = e;
    event.currentTarget.dataset = e.currentTarget.dataset.outterdata || {};
    this[click](e);
}


function sendFormId(e) {
    console.log('测试时检验formId', e)
    if (!e || e.type !== 'submit' || e.__formid_handled === true) return;

    e.__formid_handled = true;

    var reportData = {
        activityChannel: app.config.activityChannel,
        formId: e.detail.formId,
        formType: 1,
        formSourceType: e.target.dataset.nwname || e.target.dataset.formsource || '默认按钮',
        totalMessageCount: 1
    }

    // if (reportData.formId == 'the formId is a mock one') {
    //   return;
    // }

    app.ajax({
        serviceName: 'za.sales.weChatApp.userFormId.create',
        method: 'POST',
        data: reportData
    }, false, false)
}


module.exports = pageBase;
