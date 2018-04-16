
const tools={
  setFormData:function (that, key, value) {
    const item = {};
    item[key] = value;
    var newForm = Object.assign({}, that.data.formData, item);
    that.setData({
      formData: newForm
    })
    this.setDefault(that);
  },
  setDefault:function (that) {
    let flag=true;
    let dataVer = that.data.formData 
    dataVer.aggrement = that.data.checked;
    if (that.data && that.data.switchBtn){
      if (dataVer.aggrement&&dataVer.effectiveDate && dataVer.insuredPhone && dataVer.expiryDate && dataVer.insuredCertiNo && dataVer.insuredUserName && dataVer.msgKey){
        flag=true
      }else{
        flag=false
      }
    }else{
      if (dataVer.aggrement && dataVer.effectiveDate && dataVer.insuredPhone && dataVer.expiryDate && dataVer.insuredCertiNo && dataVer.insuredUserName && dataVer.msgKey && dataVer.elePolicyEmail){
         flag=true
      }else{
        flag=false
      }
    }
    // Object.keys(that.data.formData).map((item)=>{
    //   if (item === "aggrement" && !that.data.formData[item]  ){
    //     flag = false;
    //   } else if (that.data.formData[item] === ""){
    //     flag = false;
    //     if (item == "elePolicyEmail" && that.data.switchBtn) {
    //       flag = true;
    //     }
    //   }; 
    // });
    that.setData({
      submitDisable: !flag
    });
  },
maskPhone:function(phone){
  if (phone&& phone.length == 11){
      phone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'); 
    }
    return phone
  },
  maskCardNo :function (cardno, cardtype) {

    if (!cardno) return '';

    var cardtype = cardtype || 'I';
    if (cardtype == 'P') {
      cardno = cardno.substr(0, 4) + '*****';
    }
    else if (cardtype == 'I') {
      if (cardno.length == 15) {
        cardno = cardno.substr(0, 3) + '***********' + cardno.substr(14, 1);
      }
      else {
        cardno = cardno.substr(0, 3) + '**************' + cardno.substr(17, 1);
      }
    }

    return cardno;
  },
  maskName :function (name) {

    if (!name) return '';
    if (name.length > 2) {

        var starStr = '';
        for (var i = 0; i < name.length - 2; i++) {
            starStr += '*'
        }
        return name.substr(0, 1) + starStr + name.substring(name.length - 1);
    } else if (name.length == 2) {

        return name.substr(0, 1) + '*';
    }

    return name;
  },
  getBirthday:function(code) {
    var birthday = "", code = code || '';

    if (code.length == 15) {
      birthday = "19" + code.substr(6, 6);
    } else if (code.length == 18) {
      birthday = code.substr(6, 8);
    }
    if (birthday) {
      birthday = birthday.replace(/(.{4})(.{2})/, "$1/$2/");
    }
    return birthday
  },

  getGender:function(code){
    var gender = '', code = code || '';
    if (code.length == 15) {
      gender = code.substr(14, 1)
    }
    else if (code.length == 18) {
      gender = code.substr(16, 1)
    }

    if (gender) {
      if (+gender % 2 == 1) {
        gender = 'M'
      }
      else {
        gender = 'F'
      }
    }
     return gender;
  },
  

  checkPolicy :function(orderNo, checkTimes,app){
    const that=this;
    if (!orderNo){
      wx.hideLoading();
      app.show_error("缺少orderNo");
      return ;
    }
    checkTimes++;
    const data = {
      orderNo,
      activityChannel: 208
    };
    console.log("data",data);
    const policyFail = function () {
      wx.hideLoading();
      wx.navigateTo({
        url: '../orderFail/orderFail'
      })
    }, nextTry = function () {
      setTimeout(function () {
        that.checkPolicy(orderNo, checkTimes, app);
      }, 5000);
    };
    const options = {
      serviceName: 'SalesWeChatAppUnifiedOrderFindOrderStatus',
      data,
      method: 'POST'
    };
    console.log('第' + checkTimes + '核保:')
    if (checkTimes >= 24) {
      policyFail();
      return;
    }
    app.ajax(options).then(function (res) {
      if (res.data.success) {
        var status = res.data.value.orderStatus;
        // 出单失败
        if (status == 8) {
          policyFail();
          return;
        }else if (status == 9) {
          wx.hideLoading();
          wx.showToast({ title: '购买成功', mask: true });
          wx.navigateTo({
            url: '../orderDetail/orderDetail'
          });
          return;
        }
        nextTry();
      }else{
        nextTry();
      }
    });
    }
}

module.exports=tools;