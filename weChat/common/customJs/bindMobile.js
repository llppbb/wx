
/**
 *获取验证码
 */
function getyzm(mobile, obj) {
    if (obj.attr('canClick') == 0) {
        console.log("别动");
        return false;
    } else {
        console.log("走起")
        obj.css("background", "rgb(125,125,125)");
        obj.attr('canClick', 0);
    }
    if (!(/^1\d{10}$/.test(mobile))) {
        tishi("请输入正确的手机号");
        obj.css("background", "rgb(255, 211, 16)");
        obj.attr('canClick', 1);
        console.log("shahha");
        return false;
    } else {
        var count = 60;
        var t = setInterval(function() {
            obj.val(count + "s");
            if (count == 0) {
                obj.val("重新获取");
                obj.attr('canClick', 1);
                obj.css("background", "rgb(255, 211, 16)");
                clearInterval(t);
            }
            count--;
        }, 1000);
        var senddata =JSON.stringify({"mobile": mobile});
        // 16619934173
        var sendUrl=APP_URL+'HXXCServiceWeChat/sms/send.json?mobile='+mobile;
        console.log(sendUrl);
        $.ajax({
            url: sendUrl,
            type: "get",
            async: false,
            contentType: 'application/json',
            dataType: "json",
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, error) {
                console.log("请求失败地址：" + sendUrl);
                console.log(xhr);
            }
        });
    }
}

/**
 *绑定手机
 */
 // app.dev.huaxiweiying.com/HXXCServiceWeChat/sms/send.json?mobile=17600179410&code=2086&openid=oyJwUxANE7cdCNIhF39nlTISrpeo
function bindMobile(mobile, verified, openid, unionid) {
    var result;
    $.ajax({
        url:APP_URL+"HXXCServiceWeChat/sms/checkCode.json?mobile="+mobile.toString()+"&code="+verified.toString()+"&openid="+openid,
        type: 'get',
        async: false,
        dataType: 'json',
        contentType: 'application/json',
        success: function(res) {
            result = res;
        },
        error: function(res) {
            result = res;
        }
    })
    return result;
}
/**
 * 校验手机号和验证码
 */
function checkMobileAndSMSCode(mobile, VerifiyCode) {
    if (!(/^1\d{10}$/.test(mobile))) {
        tishi("请填写正确的手机号码！");
        return false;
    } else if (VerifiyCode != SMSCode || VerifiyCode == '') {
        tishi("请填写正确的验证码！");
        return false;
    } else {
        return true;
    }
}
