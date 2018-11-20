//修改 。36  。1
function twoanniu(centen_wenzi, anniu_wenzi, anniu_wenziR) {
    var tishikuang_html = "<div style='width: 90%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'>" +
        "<div style='padding-bottom: 0.3rem;padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi +
        "<div style='margin:0.2rem 0 ;width: 80%;height: 0.4rem;border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);'><input  val='' type='text' style='width:100%;height:100%;margin-left:10%;padding-left:.1rem;font-size:.15rem;' placeholder='请填写车牌号' /><p style='width:3rem;font-size:.14rem;color:rgb(185,185,185);margin:.06rem .14rem .24rem .2rem'>友情提示：您可以在个人中心进行车辆管理。</p></div></div>" +

        "<div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;border:1px solid rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi +
        "</div>" +

        "<div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR +
        "</div></div>";
    $("body").append(tishikuang_html)
}

function twoanniu_mes(centen_wenzi, anniu_wenzir) {
    var tishikuang_html =
        "<div style='width: 80%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 10%;top: 0.69rem;z-index:50' id='twoanniu_mes'><div style='padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);font-size: 0.16rem;' id='delBox'>" +
        "<p style='color: rgb(51,51,51);padding:.07rem .15rem .2rem .15rem'>" + centen_wenzi + "</p>" +
        "</div><div style='margin:0.2rem 0 ;width: 60%;margin-right:20%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;' id='delTrue'>" +
        anniu_wenzir +
        "</div></div>";
    $("body").append(tishikuang_html)
}
if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var openId = userData.openId;
var carNum = getUrlParam('carNum');
var cityid = getUrlParam("cityid");
var orderState = '';
var parkAmount = '';
var tradeId = '';
var decuctAmount_ = '';
//初始化页面
initFun(uid, carNum, cityid);
if (orderState == null) {
    window.history.go(-1);
}
var cityidInt = parseInt(cityid);
$(".footer").on("click", function() {
    if ($(this).attr("clickStyle") == "true") {
        $(this).attr("clickStyle", "false");
        $(this).html('<img src="pic/btn_confirm_payment_gray.png"/>');
        if (orderState == null) {
            window.history.go(-1);
        } else {
            //获取停车微信支付签名
            getParkingPaySign();
        }
    }
})
//获取停车微信支付签名
function getParkingPaySign() {
    var sendDate = {
        uid: uid,
        carNum: carNum,
        cityId: cityidInt,
        parkAmount: parkAmount,
        // parkAmount: '0.01',
        openId: openId,
        tradeId: tradeId
    };
    var sendUrl = APP_URL + "HXWYParkingMain/parking/payment.json";
    fnAjax(sendUrl, 'post', false, JSON.stringify(sendDate), function(data) {
        if (data.state == 0) {
            if (parseInt(data.state) != 0) {
                $(".trackMatte").show();
                twoanniu_mes("当前费用已发生变化，<br>请重新支付!", "确定");
                $("#delTrue").on("click", function() {
                    $(".trackMatte").hide();
                    $("#twoanniu_mes").remove();
                    window.location.reload();
                })
            }
            var jsonobj = {};
            jsonobj.appId = data.appId;
            jsonobj.nonceStr = data.nonceStr;
            jsonobj.package = data.package;
            jsonobj.paySign = data.paySign;
            jsonobj.signType = data.signType;
            jsonobj.timeStamp = data.timeStamp;
            parkingPay(jsonobj);
        } else {
            $(".footer").attr("clickStyle", "true");
            $(".footer").html('<img src="pic/btn_confirm_payment.png"/>');
        }
    }, function(data) {
        console.log("获取在场停车信息 错误");
        console.log(data);
        $(".footer").attr("clickStyle", "true");
        $(".footer").html('<img src="pic/btn_confirm_payment.png"/>');
    });
}
//调用微信JS api 支付
function jsApiCall(data) {
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        data,
        function(res) {
            // alert(res.err_msg);
            WeixinJSBridge.log(res.err_msg);
            // alert(res.err_code + res.err_desc + res.err_msg);
            // 使用以上方式判断前端返回,微信团队郑重提示：
            // res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            if (res.err_msg == "get_brand_wcpay_request:ok") {
                // 支付成功
                // alert("支付成功");
                $(".trackMatte").show();
                $(".paysuccess").css("bottom", "0rem");
				getMemberRate(uid);

                setTimeout(function() {
                    window.location.href = "onlinePayment.html?cityid=" + cityid;
                }, 2000)

            } else { // 支付失败 注:get_brand_wcpay_request:cancel或者get_brand_wcpay_request:fail可以统一处理为用户遇到错误或者主动放弃，不必细化区分
                // alert("支付失败")
                window.location.reload();
            }
        }
    );
}

function parkingPay(data) {
    if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', jsApiCall);
            document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
        }
    } else {
        jsApiCall(data);
    }
};

$(".colsePay").on("click", function() {
    $(".trackMatte").hide();
    $(".paysuccess").css("bottom", "-4rem");
})

// 微信分享
var share = {
    "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
    "shareDesc": "会员积分免费停车",
    "shareLink": WX_URL + "weChat/parking/onlinePayment.html",
    "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);

//orderState
//说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为 精确的乘法结果。
//调用：accMul(arg1,arg2)
//返回值：arg1乘以arg2的精确结果
function accMul(arg1, arg2) {
    var m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length
    } catch (e) {}
    try {
        m += s2.split(".")[1].length
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

// 菊花加载
$(function() {
    var opts = {
        lines: 9, // The number of lines to draw
        length: 0, // The length of each line
        width: 10, // The line thickness
        radius: 15, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#000', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    var target = document.getElementById('foo');
    var spinner = new Spinner(opts).spin(target);
})

//初始化页面
function initFun(uid, carNum, cityid) {
    var sendUrl = APP_PARKING_URL + 'parking/cost.json';
    var sendDate = {
        "uid": uid,
        "carNum": carNum,
        "cityId": cityid
    };
    fnAjax(sendUrl, 'get', false, sendDate, function(data) {
        if (data.state == 0) {
            var ParkTime = data.result.carsInParking.parkTime;
            orderState = data.result.carsInParking.orderState;
            var ParkTimeNew = ParkTime.replace(/:/g, "小时") + "分钟";
            // parkAmount = data.result.carsInParking.unPayAmount;
            parkAmount = data.result.carsInParking.decuctAmount;
            if (parseFloat(parkAmount) == 0) {
                $(".footer").hide();
                $(".wxshow").hide();
            }
            tradeId = data.result.carsInParking.tradeId;
            $(".carnum").html(data.result.carsInParking.carNumber);
            $("#inDt").html(data.result.carsInParking.inDt);
            $("#ParkTime").html(ParkTimeNew);
            // 收费标准
            $("#chargeRule").html(data.result.carsInParking.chargeRule);
            $("#unPayAmount").html("￥" + data.result.carsInParking.unPayAmount);
            $("#freeMinsAmount").html("-￥" + data.result.carsInParking.freeMinsAmount);
            $("#deductPoint").html("-" + data.result.carsInParking.deductPoint);
            $("#decuctAmount").html("￥" + data.result.carsInParking.decuctAmount);
            decuctAmount_ = data.result.carsInParking.decuctAmount;
            $("#freeOutTime").html(freeOutTime(data.result.carsInParking.parkId).freeOutTime);
        }
    }, function(data) {
        console.log("获取在场停车信息 错误");
        console.log(data);
    });
}

function getMemberRate(uid){
	var sendType = 'get';
	var sendMode = true;
	var sendDate = JSON.stringify({
		'uid': uid
	});
    var sendUrl = APP_URL + 'HXWYServiceMain/user/require_user_point.json?data='+sendDate;
	fnAjax(sendUrl, sendType, sendMode, sendDate, function(data) {
		var memberRate = data.result.memberRate;
		console.log(decuctAmount_);
		// var newpoint=memberRate*10000*decuctAmount_/10000;
		var newpoint = accMul(memberRate, decuctAmount_);
		$("#zengPoint").html(parseInt(newpoint));
	}, function() {
		$(".footer").attr("clickStyle", "true");
		// $("#foo").show();
		$(".footer").html('<img src="pic/btn_confirm_payment.png"/>');
	})
}
