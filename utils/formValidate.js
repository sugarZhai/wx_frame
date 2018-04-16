


/**
 * 
 * @param {string} validationTime  验证时机 change/submit
 * @param {string} errmsg          错误信息 
 * @param {array} type             验证类型 
 * @param {string} value             
 */

const Utils = require('./util');

// function hasEnpty(obj){
    
//       let val =false; 
    
//       Object.keys(obj).map((item)=>{
//         if( !(obj[item] && obj[item].value)) return val = true;
//       })
    
//       return val
//     }

function ValidateData(types , value){
    
    const typeArr= types.split(',');
    let flag = null;

    typeArr.find((item)=>{
        switch (item){
            case 'required':
                flag = value ? true : false;
                break;
            case 'phone' :
                flag = Utils.validatePhone(value);
                break;
            case 'id' :
                flag = Utils.validateIdCardNo(value);
                break;
            case 'passport':
                flag = Utils.validatePassport(value);
            default:
                flag = false;
        }
        console.log("验证项------》", item,flag);
        return !flag;
    })

    return flag;
}
    
//单个input验证
function inputValidate (inputData){

    let data ={
        success: false,
        errMsg: inputData.errmsg,
        value :inputData.value
    };

    if(!(inputData && (typeof(inputData) ==='object'))) return data;
 
    inputData.type ? 
        (data.success = ValidateData(inputData.type,inputData.value )) :
        (data.success = true)

    data.success && (data.errMsg = '')

    return data
}

//整个form验证
function formValidate (formData){
    let val={
        success:false,
        errorMsg: '',
        value: {}
    };
    
    if(!(formData && (typeof(formData) === 'object'))){
        return val
    };

    Object.keys(formData).find((item)=>{
        let inputVal = inputValidate(formData[item]);
        console.log("input验证" ,inputVal);
        val.success= inputVal.success;
        val.errorMsg = inputVal.errMsg;
        val.value = {
            ...val.value,
            [item]:inputVal.value
        }
        return !val.success
    })

    return val
    
}

module.exports={
    formValidate
}