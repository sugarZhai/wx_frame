//  服务端错误日志
function Log(scopeName) {

  this.scopeName = scopeName + ' - '
}

var pt = Log.prototype;

pt._log = function (level, message, err_type) {

  var app = getApp();
  if (app.OS.platform == "devtools") {
    return;
  }

  if (typeof message != 'string') {
    message = JSON.stringify(message)
  }

  if (!this._OSInfo) {
    this._OSInfo = JSON.stringify(app.OS)
  }
  console.log('*****',app.User.extraInfo.openUserId)
  var reportMsg = this.scopeName + JSON.stringify({
    AppVersion: app.config.version,
    UID: app.User.extraInfo.openUserId,
    pagePath: app.launchInfo.path
  });

  if (err_type == 'script') {
    reportMsg += ' - ' + this._OSInfo;
  }

  reportMsg += ' - ' + message;

  wx.request({
    url: 'https://tac-gw-api.zhongan.com/logRecord/print',
    method: 'POST',
    data: {
      level,
      message: reportMsg
    }
  })
}

pt.error = function (msg, err_type) {

  this._log('ERROR', msg, err_type)
}

pt.info = function (msg) {
  this._log('INFO', msg)
}

module.exports = Log;
