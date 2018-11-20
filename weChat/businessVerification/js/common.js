// 检测 是否是免登录用户 和 读取不到二维码页面
function checkVerify(openId, verifyCode) {
    var newFlag="";
    var sendURL = APP_URL + "HXXCServiceWeChat/verify/checkVerify.json";
    var sendData = {
        "openid": openId,
        "verifyCode": verifyCode
    }
    fnAjax(sendURL, "get", false, sendData, function(data) {
        //flag 1跳转登录页面 2引入读取不到二维码信息页面 3核销页面

         if(parseInt(data.state)==0){
             newFlag= data.result;
         }
    }, function(error) {
        console.log(error);
         newFlag=false;
    })
    return newFlag;
}

// 获取jsapitoken
function getJsapiToken() {
    var returnData = "";
    var sendUrl = WX_URL + "HXXCServiceWeChat/wechat/ticketNew.json";
    fnAjax(sendUrl, "get", false, {"url":encodeURIComponent(window.location.href.split('#')[0])}, function(data) {
        if (parseInt(data.state) == 0) {
            returnData = data.result;
        }
    }, function(data) {
        console.log(data);
        returnData = false;
    });
    return returnData;
}
/**
 * 微信拉起扫一扫
 * @param appId, timestamp, nonceStr, signature, domId
 * @return
 */
function scanQRCode(appId, timestamp, nonceStr, signature) {
    wx.config({
        debug: false,
        appId: appId,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signature: signature,
        jsApiList: ['checkJsApi', 'scanQRCode']
    });
    wx.error(function(res) {
        // alert("出错了：" + res.errMsg);
    });
    wx.ready(function() {
        wx.checkJsApi({
            jsApiList: ['scanQRCode'],
            success: function(res) {}
        });
        //扫描二维码
        wx.scanQRCode({
            needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function(res) {}
        });
    })
}

// 核销页显示数据
function getVerifyInfoDetail(verifyCode) {
    var sendUrl = WX_URL + "HXXCServiceWeChat/verify/getVerifyInfoDetail.json";
    var sendData = {
        "verifyCode": verifyCode
    }
    fnAjax(sendUrl, "get", false,sendData, function(data) {
        if (parseInt(data.state) == 0) {
            $("#productname").text(data.result.productName);
            $("#exDate").text(data.result.startDate);
            $("#endDate").text(data.result.endDate);
            $("#keyouTime").text(data.result.verifydate);
            $("#verifyuser").text(data.result.verifyUser);

            $("#usedate").text(data.result.useDate);
            $("#orderno").text(data.result.orderNo);
            $("#orderNo").val(data.result.orderNo);

            if (data.result.useStatus == 1) {
                var usestatus = "已核销";
            } else if (data.result.useStatus == 0) {
                var usestatus = "未核销";
            }
            $("#useStatus").text(usestatus);
            $("#useState").val(data.result.usestatus);
        }
    }, function(data) {
        console.log(data);
    });
}


// 核销
function verifyProduct(verifyCode,openId){
    var sendUrl = WX_URL + "HXXCServiceWeChat/verify/verifyProduct.json";
    var sendData = {
        "verifyCode": verifyCode,
        "openid":openId
    }
    fnAjax(sendUrl, "get", false,sendData, function(data) {
        if (parseInt(data.state) == 0) {
            // alert("核销成功");
            $(".centen").hide();
            $("#hexiao_success").show();
        }else{
            alert(data.message);
            $(".centen").hide();
            $("#hexiao_failed").show();
        }

    }, function(data) {
        console.log(data);
    });
}
// 登录接口
function loginIn(openId, userMobile, code,verifyCode) {
    var sendURL = APP_URL + "HXXCServiceWeChat/verify/login.json";
    var sendData = {
        "openid": openId,
        "mobile": userMobile,
        "code": code
    }
    fnAjax(sendURL, "get", false, sendData, function(data) {
        if (data.state == 0) {
            // location.href = "verificationQrcode.html?verifyCode="+verifyCode +"&openid="+openId;
            var returnData = checkVerify(openId, verifyCode);
            var newFlag = parseInt(returnData.flag);
            if (!newFlag) {
                console.log("获取openid出错")
            } else {
                if (newFlag == 2) {
                    // 没有读取到二维吗
                    window.location.href = "notReadQrcode.html";
                } else if (newFlag == 3) {
                        // 可以核销
                    window.location.href = "verificationQrcode.html?verifyCode=" + verifyCode +"&openid="+openId;
                }
            }
        } else {
            alert(data.message);
        }
    }, function(error) {
        console.log(error)
    })
}
