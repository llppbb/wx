var WX_URL = "https://melive.dev.huaxiweiying.com/"; // 定义URL
var COUPON_URL = "https://coupon.dev.huaxiweiying.com/"; // 定义URL
var APP_URL="https://app.dev.huaxiweiying.com/";  // 定义幸运球URL
var forum_code = '6lo40d7ffc'; // 微贝社区
var coupon_sign = 'SDE45FHW6KL'; // 商讯签名
var SMSCode = ''; // 短信验证码

// 初始化页面 获取用户信息
function getUserMes(codeJava,openIdJava) {
    var resdata = '';
    var sendUrl = WX_URL + 'HXXCServiceWeChat/wechat/getOpenId';
    var sendDate = {
        'code': codeJava,
        'openId': openIdJava,
        'state': 1
    };
    fnAjax(sendUrl, "get", false, sendDate, function(data) {
        resdata = data;
    }, function(data) {
        resdata = data;
        console.log(data);
    });
    return resdata;
}
