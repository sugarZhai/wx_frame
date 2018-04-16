// insurantAdd.js
const app = getApp();
const pageBase = require('../pageBase');
const Util = require("../../../utils/util");
const personRelation = ['父母', '配偶', '子女', '其他'];

const curPage = {
  nw_fields: {
    pageId: 1156,
    pageName:'境内旅行险-新增被保人页'
  },
  formData:{},
  data: {
    personRelation,
    submitDisable:false,
    id:'',
    formData:{
      insuredUserName:'',
      insuredCertiNo:'',
      relation:0
    },
    isCreate:true,
     //判断是否适配IPX
     isIpx: app.globalData.isIPX  
  },
  onLoad: function (options) {
    const _this= this;
    if (options.name){
      _this.setData({
        isCreate: false,
        id: options.id,
        formData: {
          insuredUserName: options.name,
          insuredCertiNo: options.idNo,
          relation: parseInt(options.relation)-1
        }
      });
    }
  },
  unifiedFormData(baseData, newData){
    let formData = {};
    Object.keys(baseData).map((item)=>{
      formData[item] =  baseData[item]; 
      if (newData[item] || newData[item]==0){
        formData[item] = newData[item];
      }
    })
    return formData;
  },
  bindPickerChange: function (e) {
    this.formData.relation = e.detail.value;
    this.setData({
      formData: this.unifiedFormData(this.data.formData,this.formData)
    }) 
  },

  formSubmit:function (e){
    console.log("提交了么")
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    const _this= this;
    
    this.formData = this.unifiedFormData( this.data.formData,this.formData);

    const formData = this.formData;

    const gender = Util.getGender(formData.insuredCertiNo);
    const insuredCertiNo = formData.insuredCertiNo;
    const validateIdCardNo = Util.validateIdCardNo(insuredCertiNo);
    const birthday = Util.getBirthday(formData.insuredCertiNo);
  
    if (validateIdCardNo.msg || !formData.insuredUserName) {
      wx.hideLoading();
      _this.show_error(validateIdCardNo.msg ||'请完整填写页面信息');
      return;
    }

    const createData = { 
      "name": formData.insuredUserName, 
      "pingyin": "", 
      "gender": gender, 
      "birthday": birthday, 
      "idNo": insuredCertiNo.toUpperCase(), 
      "idType": "1", 
      "relation": parseInt(formData.relation) + 1 , 
      "activityChannel": "208", 
      "isDefault": "N" 
    }
    const updateData = Object.assign({}, createData, {"id": this.data.id});
    let data = updateData;
    let serviceName ='za.sales.weChatApp.userInsuredInfo.update';
    if (_this.data.isCreate){
      serviceName ='za.sales.weChatApp.userInsuredInfo.create';
      data = createData;
    }
    const options = {
      serviceName,
      data,
      method: 'POST'
    }
    
    app.ajax(options).then(function (res){
      wx.hideLoading();
      if (res.data.success){
        wx.navigateBack({
          delta: 1
        })    
      }else{
        _this.show_error(res.data.errorMsg);
      }
    })
    //_this.push_asm(e);
  }
}

Page(Object.assign({}, pageBase, curPage));
