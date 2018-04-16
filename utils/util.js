 function param(obj, encode) {
  if (typeof obj !== "object") {
    return '';
  }
  return Object.keys(obj).map(key => {
    if (obj[key] === null || obj[key] === undefined) {
      return key + '=';
    }
    if (encode !== false) {
      return key + '=' + encodeURIComponent(obj[key])
    }
    return key + '=' + obj[key]
  }).join('&');
}

function normalizeDate(date) {
  if (typeof dete === "string") {
    date = date.replace(/-/g, '/');
    date = new Date(date);
  }
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  if (date.toString() === 'Invalid Date') {
    return ''
  }
  return date;
}

function formatDate(date, fmt) {
  const _date = normalizeDate(date);
  var o = {
    "M+": _date.getMonth() + 1, //月份 
    "d+": _date.getDate(), //日 
    "h+": _date.getHours(), //小时 
    "m+": _date.getMinutes(), //分 
    "s+": _date.getSeconds(), //秒 
    "q+": Math.floor((_date.getMonth() + 3) / 3), //季度 
    "S": _date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function during(start, end, now) {

    start = this.normalizeDate(start);
    end = this.normalizeDate(end);

    var ret = true, now = now || Date.now();
    if (start && now <= start) {
        ret = false
    }

    if (end && now >= end) {
        ret = false
    }

    return ret;
}

function offWork(){
  const date = new Date();
  const d = date.getDay();

  const start = new Date(formatDate(date, 'yyyy/MM/dd 09:00:00'));
  const end = new Date(formatDate(date, 'yyyy/MM/dd 18:00:00'));
  return   date > start && date < end && d >= 1 && d <= 5
}

function maskName(name, isComplete = true) {

  if (!name) return '';
  if (name.length > 2) {
    var starStr = '';
    if (isComplete) {
      for (var i = 0; i < name.length - 2; i++) {
        starStr += '*'
      }
    } else {
      starStr = '***'
    }
    
    return name.substr(0, 1) + starStr + name.substring(name.length - 1);
  } else if (name.length == 2) {

    return name.substr(0, 1) + '*';
  }

  return name;
}

function maskCardNo(cardno, cardtype) {
  if (!cardno) return '';

  var cardtype = cardtype || 'I';
  if (cardtype == 'P') {
    //cardno = cardno.substr(0, 4) + '*****';
    let str ='';
    for (let i = 0; i < cardno.length-2; i++){
      str = str + '*';
    }
    cardno = cardno.substr(0, 2) + str;
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
}

function getBirthday(code) {
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
}

function getGender(code) {
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
}

function validateIdCardNo(num) {
  var error = {
    code: 1,
    msg: '请输入身份证号'
  }

  if (!num) {
    return error;
  }

  error.code = 2;
  error.msg = '身份证号格式不正确';

  //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
  if (!(/^\d{17}([0-9]|X)$/.test(num))) {
    return error;
  }

  //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
  //下面分别分析出生日期和校验位
  var re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
  var arrSplit = num.match(re);

  //检查生日日期是否正确
  var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
  if ('Invalid Date' != dtmBirth) {

    //检验18位身份证的校验码是否正确。
    //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
    var valnum;
    var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    var nTemp = 0,
      i;
    for (i = 0; i < 17; i++) {
      nTemp += num.substr(i, 1) * arrInt[i];
    }
    valnum = arrCh[nTemp % 11];
    if (valnum == num.substr(17, 1)) {
      error.code = 0;
      error.msg = '';
    }
  }

  return error;
}
function parseParam(paramStr, delimiter = '&') {

    var arr = paramStr.split(delimiter),
        obj = {};

    arr.length && arr.forEach(item => {
        var tempArr = item.split('=');
        obj[tempArr[0]] = tempArr[1]
    })

    return obj;
}

function tryMergeQrParam(target, scene) {

    if (scene) {

        scene = decodeURIComponent(scene);
        if (scene.indexOf('$') != -1) {
            var params = this.parseParam(scene, '$');
            Object.assign(target, params);
        }
    }
}

function saveImageToPhotosAlbum(path) {

    var app = getApp();
    if (!wx.saveImageToPhotosAlbum) {
        app.show_error('先升级下微信版本，再来点我哦！', 3);
        return;
    }

    wx.saveImageToPhotosAlbum({
        filePath: path,
        success(res) {
            if (/ios/i.test(app.OS.system)) {
                wx.showToast({
                    title: '已保存'
                });
            }
        },
        fail(res) {
            if (res.errMsg.indexOf('auth') != -1) {
                wx.showModal({
                    title: '授权保存图片',
                    content: '请在“设置”中打开“保存到相册”授权，您就可以保存图片了',
                    confirmText: '去设置',
                    success(res) {
                        if (res.confirm) {
                            wx.openSetting()
                        }
                    }
                })
            }
        }
    })
}

function maskPhone(num) {
  return num.substr(0, 3) + '****' + num.substr(7, 11);
}

function formateCalendar(date, mode) {
  return `${+date.substr(0, 4)}${mode === '-' ? '-' : '/'}${date.substr(4, 2)}${mode === '-' ? '-' : '/'}${date.substr(6,2)}`;
}


function validatePhone(num) {
  const rule = /^1[0-9]{10}$/;
  return rule.test(num);
}

function validatePassport(num) {
  const rule = /(P\d{7})|(G\d{8})/;
  return rule.test(num);
}


function regChinese(str) {
  var rname=/[\u4E00-\u9FA5]/
  return rname.test(str);
}

function regEmoji(str) {
  var rname = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
  return rname.test(str);
}

 function validatePhone(num) {
   const rule = /^1[0-9]{10}$/;
   return rule.test(num);
 }

 function validatePassport(num) {
   const rule = /(P\d{7})|(G\d{8})/;
   return rule.test(num);
 }
 function validateName(name) {
     const rule = /^[a-zA-Z\u4e00-\u9fa5\s]*$/;
     return rule.test(name);
 }

 function validateNameEng(name) {
     const rule = /^[a-zA-Z\s]*$/;
     return rule.test(name);
 }


module.exports = {
  normalizeDate,
  formateCalendar,
  formatDate,
  during,
  param,
  offWork,
  maskName,
  maskCardNo,
  maskPhone,
  getBirthday,
  getGender,
  validateIdCardNo,
  validatePhone,
  validatePassport,
  parseParam,
  tryMergeQrParam,
  regChinese,
  regEmoji,
  validatePhone,
  validatePassport,
  validateName,
  validateNameEng,
  saveImageToPhotosAlbum
}
