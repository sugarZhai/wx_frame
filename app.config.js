// 各环境接口地址
var ENV_API = {
    test: "https://tac-gw-api-itest.zhongan.com/gateway/api",
    uat: "https://tac-gw-api-uat.zhongan.com/gateway/api",
    prd: "https://tac-gw-api.zhongan.com/gateway/api"
};
// node各环境接口地址
var NODE_ENV_API = {
    test: "https://fileupload-dev.zhongan.com/api",
    // test: "http://dev.zhongan.com/api",
    uat: "https://fileupload-uat.zhongan.com/api",
    prd: "https://fileupload.zhongan.com/api"
};

var OSS_API = {
    test: "https://fileupload-dev.zhongan.com/api/commonUpload/toOss",
    uat: "https://fileupload-uat.zhongan.com/api/commonUpload/toOss",
    prd: "https://fileupload.zhongan.com/api/commonUpload/toOss"
};

// 内嵌H5的域名
var H5_DOMAIN = {
    test: "https://acttacdev.zhongan.com",
    uat: "https://acttacuat.zhongan.com",
    prd: "https://acttac.zhongan.com"
}

// 内嵌H5的域名 new
var H5_DOMAIN_NEW = {
    //test: "http://dev.zhongan.com",
    test: "https://acttacdev.zhongan.com",
    uat: "https://travel-uat.zhongan.com",
    prd: "https://travel.zhongan.com"
}

// 这里添加的属性，可以通过app.config来访问
var config = {
    version: '1.8.3',
    appName: 'wxapp_puerMouth',
    appDesc: 'XX口腔',
    env: 'test',
    cdnBase: 'http://za-tac.oss-cn-hzfinance.aliyuncs.com/wxapp/wxapp_traval_ins_in_one',
    // ilog 统计url域
    domain: 'http://wxapptravelInsInOne.zhongan.com/'
};

config.apiBase = ENV_API[config.env];
config.nodeApiBase = NODE_ENV_API[config.env];
config.activityChannel = 208;
config.ossApiBase = OSS_API[config.env];
config.h5Domain = H5_DOMAIN[config.env];
config.h5DomainNew = H5_DOMAIN_NEW[config.env];

module.exports = config;