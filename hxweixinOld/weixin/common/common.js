var WX_URL = "https://melive.dev.huaxiweiying.com/"; // 定义URL
var COUPON_URL = "https://coupon.dev.huaxiweiying.com/"; // 定义URL
var APP_URL="https://app.dev.huaxiweiying.com/";  // 定义幸运球URL
var forum_code = '6lo40d7ffc'; // 微贝社区
var coupon_sign = 'SDE45FHW6KL'; // 商讯签名
var SMSCode = ''; // 短信验证码

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

/**
 *提示函数
 */
function tishi(message) { //提示信息
    $('.shezhi_tishi p').html(message);
    $('.shezhi_tishi').show();
    var windowWidth = $(window).width();
    var tiShiBoxWidth = $(".shezhi_tishi").innerWidth();
    console.log(windowWidth);
    console.log(tiShiBoxWidth);
    var leftMargin = (windowWidth - tiShiBoxWidth) / 2;
    $(".shezhi_tishi").css("left", leftMargin + "px");
    $('.shezhi_tishi').css('opacity', '0.7');
    setTimeout(function() {
        $('.shezhi_tishi').fadeOut(1000);
    }, 1500)
}

function tishinew(message) { //提示信息
    $('.shezhi_tishinew p').html(message);
    $('.shezhi_tishinew').show();
    var windowWidth = $(window).width();
    var tiShiBoxWidth = $(".shezhi_tishinew").outerWidth();
    if (tiShiBoxWidth >= windowWidth * 0.6) {
        console.log(3333)
        tiShiBoxWidth = windowWidth * 0.6;
        $('.shezhi_tishinew').css("width", tiShiBoxWidth + "px");
    }
    var leftMargin = (windowWidth - tiShiBoxWidth) / 2;
    $(".shezhi_tishinew").css("left", leftMargin + "px");
    $('.shezhi_tishinew').css('opacity', '0.7');
    setTimeout(function() {
        // $('.shezhi_tishinew').fadeOut(1000);
    }, 1500)
}

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
        var data = {
            'mobile': mobile,
            'channel': 'wechat',
            'identity': 'sendMsg',
        }
        $.post(WX_URL + 'requestAjax.php', data, function(res) {
            if (res.state == 0) {
                tishi("短信已发送");
                SMSCode = res.result.SMSCode;
            } else {
                tishi("短信发送失败，请重试！");
            }
        }, 'json');
    }
}

//获取用户手机号
function getUserMobile(uid, mobile, openid, unionid) {
    var res = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            "uid": uid,
            "mobile": mobile,
            "openid": openid,
            "unionid": unionid,
            "identity": "getUserMobile"
        },
        success: function(data) {
            res = data.result.mobile;
        }
    })
    return res;
}

/**
 *绑定手机
 */
function bindMobile(mobile, verified, openid, unionid) {
    var result;
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        async: false,
        dataType: 'json',
        data: {
            'mobile': mobile,
            'verified': verified,
            'openid': openid,
            'unionid': unionid,
            'identity': 'bindMobile',
        },
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
 *签到
 */
 function qiandao(url, uid) {
     var data = {
         'uid': uid,
         'identity': 'qiandao'
     }
     $.ajax({
           type : "post",
           url : url,
           data : data,
           async : false,
           dataType:'json',
           success : function(res){
               if (res.result.firstTimeLogin == true) {
                   var dijitian = $('.dijitian');
                   for (var i = 1; i < res.result.loginRecords; i++) {
                       dijitian[i].className = "dijitian zaidijitian";
                   }
                   $(".mengceng").show();
                   $(".mengceng").css("opacity", "0.7");
                   $(".qiandaoxiangqing").show();
               } else {
                   return false;
               }
               $('.pspan').text('连续签到' + res.result.loginRecords + '天');
               $('.memberName').text(res.result.memberName);
               $('.todayBonus').text(res.result.todayBonus);
               $('#LjifenNum').html(res.result.point);
           }
      });
 }
/**
 *签到详情
 */
function qiandaoxiangqing() {
    $(".mengceng").hide();
    $(".qiandaoxiangqing").hide(500, function() {
        $('.ptext').show();
        setTimeout(function() {
            $('.ptext').fadeOut(1500);
        }, 500);
        window.location.reload();
    });
}
/**
 *积分换金币
 */
function exchange(url, uid, productId) {
    var data = {
        'uid': uid,
        'productId': productId,
        'identity': 'exchange',
    }
    $.post(url, data, function(res) {
        if (res.state == 0) {
            if (res.result.status != false) {
                $("#myPoint").text(res.result.userPoints);
                tishi("兑换成功！");
            } else {
                tishi(res.result.msg);
            }
        } else if (res.state == 1) {
            tishi(res.message);
            return;
        }
    }, 'json');
}

function SaleReminder(uid, mobile, onlineID, object) { //开售提醒
    var data = {
        'uid': uid,
        'mobile': mobile,
        'onlineID': onlineID,
        'identity': 'SaleReminder',
    }
    $.post(WX_URL + 'requestAjax.php', data, function(res) {
        console.log(res.state);
        if (res.state == 0) {
            tishi("设置成功！");
            object.hide();
        } else {
            tishi(res.message);
            object.hide();
        }
    }, 'json');
}

function ShortageRegistration(uid, mobile, onlineID, scheduleId, ticketPriceId, packTicketId, object) { //缺货登记
    var data = {
        'uid': uid,
        'mobile': mobile,
        'onlineID': onlineID,
        'scheduleId': scheduleId,
        'ticketPriceId': ticketPriceId,
        'packTicketId': packTicketId,
        'identity': 'ShortageRegistration',
    }
    $.post(WX_URL + 'requestAjax.php', data, function(res) {
        if (res.state == 0) {
            tishi("设置成功！");
            object.hide();
        } else {
            tishi(res.message);
            object.hide();
        }
    }, 'json');
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
/**
 * 声明对象
 */
function ObjStory(name_name, hao, cardName, cardType) {
    this.name = name_name.trim();
    this.idCard = hao;
    this.cardName = cardName.trim();
    this.cardType = cardType;
}
/**
 * 倒计时
 */

function timer(intDiff, obj, func) {
    var newintDiff = parseInt(intDiff);
    console.log(typeof(newintDiff));
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func();
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}

function timer0(intDiff, obj, func) {
    console.log(intDiff);
    var newintDiff = parseInt(intDiff);
    console.log(typeof(newintDiff));
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func();
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}

function timer1(intDiff, obj, func) {
    console.log(intDiff);
    var newintDiff = parseInt(intDiff);
    console.log(typeof(newintDiff));
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func();
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}

function timer2(intDiff, obj, func) {
    console.log(obj);
    console.log(obj.index());
    var newintDiff = parseInt(intDiff);
    console.log(typeof(newintDiff));
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func(obj);
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}

/**
 * 获取用户金币
 */
function getUserCoin(uid, userGold) {
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'uid': uid,
            'identity': 'getUserCoin'
        },
        success: function(res) {
            if (res.state == 0 && res.result != null) {
                userGold.text(res.result.score);
            }
        }
    })
}
/**
 * 获取用户积分
 */
function getUserPoint(uid, userPoint) {
    var point = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'uid': uid,
            'identity': 'getUserPoint'
        },
        success: function(res) {
            if (userPoint != "") {
                userPoint.text(res.result.point);
            }
            point = res.result.point;
        }
    });

    return point;
}
/**
 * 获取已用积分
 */
function getUsedPoint(uid, usedPoint) {
    var point = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'uid': uid,
            'identity': 'getUsedPoint'
        },
        success: function(res) {
            if (usedPoint != "") {
                usedPoint.text(res.result.point);
            }
            point = res.result.point;
        }
    });

    return point;
}
/**
 * 获取用户微信头像，昵称等信息
 */
function getWxUserInfo(access_token, openid, headimgurl, nickname) {
    var wxnickname = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'access_token': access_token,
            'openid': openid,
            'identity': 'getWxUserInfo'
        },
        success: function(res) {
            wxnickname = res.nickname;
            if (headimgurl != "" && nickname != "") {
                headimgurl.attr('src', res.headimgurl);
                nickname.text(res.nickname);
            }
        }
    });

    return wxnickname;
}
/**
 * 获取用户微贝头像，昵称等信息
 */
function getWeiBeiUserInfo(openid, headimgurl, hansansui) {
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'openid': openid,
            'identity': 'getWeiBeiUserInfo',
        },
        success: function(res) {
            user_id = res.data.user_id;
            headimgurl.attr('src', res.data.avatar);
            hansansui.text(res.data.nickname);
        }
    })
}
/**
 * 获取用户微贝点赞数，微贴数等
 */
function getPraiseNum(openid, postTotal, favoriteTotal, balance, newCount) {
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'openid': openid,
            'identity': 'getPraiseNum',
        },
        success: function(res) {
            if (res.code != 1) {
                return false;
            } else {
                postTotal.text(res.data.postTotal);
                favoriteTotal.text(res.data.favoriteTotal);
                balance.text(res.data.balance);
                if (res.data.newCount > 0) {
                    newCount.show();
                } else {
                    newCount.hide();
                }
            }
        }
    })
}

/**
 * 获取二维码
 * @param num
 * @return url
 */
function getCode(idCard) {
    var url = '';
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'idCard': idCard,
            'identity': 'createQrCode',
        },
        success: function(data) {
            if (data.state != 0) {
                return false;
            } else {
                url = data.result;
            }
        }
    })
    return url;
}

/**
 * 绑定车牌
 * @param uid, carNum
 * @return
 */
function bindingCar(uid, carNum, openid) {
    var res = false;
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'uid': uid,
            'carNum': carNum,
            'openid': openid,
            'identity': 'bindingCar'
        },
        success: function(data) {
            res = data;
        }
    })

    return res;
}

/**
 * 查询车牌列表
 * @param uid
 * @return
 */
function queryCar(uid) {
    var res = false;
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'uid': uid,
            'identity': 'queryCar'
        },
        success: function(data) {
            res = data;
        }
    })

    return res;
}

/**
 * 删除车牌
 * @param uid, carNum
 * @return
 */
function deleteCarNum(uid, carNum) {
    var res = false;
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'uid': uid,
            'carNum': carNum,
            'identity': 'deleteCarNum'
        },
        success: function(data) {
            res = data;
        }
    })

    return res;
}

// 构造签名
function createSign(obj) {
    var tmp_ = Date.parse(new Date()).toString();
    var tmp = tmp_.substr(0, 10);
    var sign_tmp = coupon_sign + tmp;
    var dataArr = {
        "sign": hex_md5(sign_tmp),
        "timestamp": tmp
    }
    if (obj != '') {
        for (var i in obj) {
            dataArr[i] = obj[i];
        }
    }
    return dataArr;
}

// 返回  商城主页    5.9
function goHomeBtn(obj) {
    var back_shop = '<div id="back_shop" style="opacity:0.7; width: 0.51rem;height: 0.51rem;position: fixed;left: 0.1rem;bottom: 0.1rem;" ><img style="width: 100%;height: 100%;" src="/weixin/shop/pic/btn_home.png"/></div>'
    $(obj).append(back_shop);
    $("#back_shop").on("click", function() {
        location.href = WX_URL + "user.php?center=1";
    })
}

//停车  获取免费时间
function freeOutTime(parkId) {
    var freeOutTime = '';
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'post',
        dataType: 'json',
        async: false,
        data: {
            parkId: parkId,
            identity: "getFreeOutTime"
        },
        success: function(data) {
            // console.log(data);
            freeOutTime = data.result;
        },
        error: function() {
            console.log("错误")
        }
    })
    return freeOutTime;
}

//ajax请求
var fnAjax = function(sendUrl, sendDate, callback, errorCallback) {
    //ajax提交
    $.ajax({
        type: "post",
        url: sendUrl,
        data: sendDate,
        async: false,
        dataType: "json",
        success: function(data) {
            // console.log(data);
            if (callback) {
                callback(data);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.status == "401") {
                alert("你不能进行这个操作！");
            } else if (xhr.status == "408") {
                alert("太久没有进行操作，请重新登录！");
            } else {
                alert("服务器开小差了，请过一会在试。");
            }
            if (errorCallback) {
                errorCallback()
            }
        }
    });
};
// 格式化时间戳
function timestampToTime(timestamp,type) {
        var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear();
        M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
        D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate());
        h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours());
        m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes());
        s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
        var date='';
        switch (type) {
            case "y-m-d":
                 date=Y+'-'+M+'-'+D;
                break;
            case "y-m-d h:m":
                 date=Y+'-'+M+'-'+D+" "+h+":"+m;
                break;
            case "y-m-d h:m:s":
                date=Y+'-'+M+'-'+D+" "+h+":"+m+":"+s;
                break;
        }
        return date;
    }
