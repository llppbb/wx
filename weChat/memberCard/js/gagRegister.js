window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};

var openId = getUrlParam("openid");
// 是否同意会员使用说明
$(".checkbox").click(function(event) {
    if ($(this).attr("checked_") == "1") {
        $(this).attr("checked_", "0");
        $(this).find("img").attr("src", "pic/selected.png");
        $(".carState").removeClass('noactivate');
        $(".carState").addClass('activate');
        $(".carState").attr("act", "0");
    } else if ($(this).attr("checked_") == "0") {
        $(this).attr("checked_", "1");
        $(this).find("img").attr("src", "pic/selected_1.png");
        $(".carState").removeClass('activate');
        $(".carState").addClass('noactivate');
        $(".carState").attr("act", "1");
    }
});
var uid = "";
// 绑定手机+领取微信会员卡
$("#activate").on("click", function() {
    if ($(this).attr('act') == '0') {
        var arr = {};
        arr.cardId = getDefaultCard().result;
        arr.openid = openId;
        arr.mobile = $("#bmmobilenum").val();
        arr.name = $("#name").val().trim();
        arr.sex = $("#sex").val();
        arr.birthday = $("#birthday").html();
        arr.sourceNo = "melive";
        if (!(/^1\d{10}$/.test(arr.mobile))) {
            tishi("请填写正确的手机号码");
            return false;
        }
        if (arr.name == "" || arr.birthday == "") {
            tishi("请完善信息！");
            return false;
        }
        if ($("#getyzm").length > 0) {
            if ($("#bmmobilenum").val() == '') {
                tishi("请使用本机获取验证码");
                return false;
            }
            var mobile_number = $("#bmmobilenum").val();
            var mobile_number_peo = $("#bmauthcCode").val();
            if (!(/^1\d{10}$/.test(mobile_number))) {
                tishi("请填写正确的手机号码！");
                return false;
            } else if (mobile_number_peo == '') {
                tishi("请填写正确的验证码！");
                return false;
            }
            var qrCode = getStorage("gagQrCode");
            var productId = queryMerchantCode(qrCode);
            console.log(productId);
            var result = bindMobileGag(mobile_number, mobile_number_peo, openId, productId);
            if (parseInt(result.state) != 0) {
                tishi("绑定手机失败");
                return false;
            }
            arr.uid = result.result.uid;
            uid = result.result.uid;
            mobile = result.result.mobile;
            // tishi('绑定成功！');
            $(".bindmobile").hide();
            $(".trackmatte").remove();
        }
        storageCardInfo(arr);
    } else {
        return false;
    }
});

//绑定手机号  获取验证码
$("#bmgetCode").on("click", function() {
    var get_code = $("#bmgetCode");
    getSMSCodeMobile = $("#bmmobilenum").val();
    getyzm(getSMSCodeMobile, get_code);
})

// 点击 提示 中 确定  跳转到注册成功页面
$(".actsuccessBtn").on("click", function() {
    var cityId = getUrlParam("cityId");
    var backStorage = getStorage("gagQrCode");
    addShoppingPoint(uid, backStorage, cityId);
})

// 会员卡信息入库
function storageCardInfo(arr) {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/register.json';
    fnAjax(sendUrl, "POST", false, JSON.stringify(arr), function(data) {
        if (parseInt(data.state) == 0) {
            $(".mengceng").show();
            $(".actsuccess").show();
        } else {
            tishi(data.message);
        }
    }, function(data) {
        console.log(data);
    });
}

// 日期插件 start
$("#birthday").css({
    "-webkit-tap-highlight-color": " rgba(0,0,0,0)",
    "-webkit-tap-highlight-color":   "transparent"
})
var calendar = new datePicker();
calendar.init({
    'trigger': '#birthday',
    'type': 'date',
    'minDate': '1900-1-1',
    'maxDate': '2100-12-31',
    'onSubmit': function() { /*确认时触发事件*/
        var theSelectData = calendar.value;
        $("#birthday").html(theSelectData);
    },
    'onClose': function() { /*取消时触发事件*/ }
});
// 日期插件 end

function getDefaultCard() {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/getDefaultCard.json';
    var returnData = "";
    fnAjax(sendUrl, "get", false, "", function(data) {
        if (parseInt(data.state) == 0) {
            returnData = data;
        } else {
            returnData = false;
        }
    }, function(data) {
        returnData = false;
    });
    return returnData;
}
// 会员卡信息使用说明
$("#directionuse").on("click", function() {
    window.location.href = "directionuse.html";
})
// 微信分享
var share = {
    "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
    "shareDesc": "会员积分免费停车",
    "shareLink": WX_URL + "weChat/memberCard/membercardNew.html",
    "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);

/**
 *绑定手机
 */
// app.dev.huaxiweiying.com/HXXCServiceWeChat/sms/send.json?mobile=17600179410&code=2086&openid=oyJwUxANE7cdCNIhF39nlTISrpeo
function bindMobileGag(mobile, verified, openid, productId) {
    var result;
    $.ajax({
        url: APP_URL + "HXXCServiceWeChat/sms/checkCode.json?mobile=" + mobile.toString() + "&code=" + verified.toString() + "&openid=" + openid + "&registerCode1=2&registerCode2=" + parseInt(productId),
        type: 'get',
        async: false,
        dataType: 'json',
        contentType: 'application/json',
        success: function(res) {
            console.log("bindMobileGag");
            console.log(res);
            result = res;
        },
        error: function(res) {
            result = res;
        }
    })
    return result;
}
// 获取商家id
function queryMerchantCode(qrCode) {
    var result;
    $.ajax({
        url: APP_URL + "HXXCServiceWeChat/point/queryMerchantCode.json?qrCode=" + qrCode,
        type: 'get',
        async: false,
        dataType: 'json',
        contentType: 'application/json',
        success: function(res) {
            console.log("queryMerchantCode");
            console.log(res);
            result = res.merchantCode;
        },
        error: function(res) {
            result = res;
        }
    })
    return result;
}
//立即领取  flag 0 未领取  1 领取过
function addShoppingPoint(uid, backStorage, cityid) {
    var sendUrl = WX_URL + "HXXCServiceWeChat/point/addShoppingPoint";
    var getPayInfoSendata = {
        "uid": uid,
        "qrCode": backStorage,
        "cityId": cityid
    };
    fnAjax(sendUrl, "get", false, getPayInfoSendata, function(data) {console.log(data);
    window.location.href = "../buyAndBuy/longinSuccess.html?amount=" + data.amount+"&point="+data.point;}, function(error) {});
}
