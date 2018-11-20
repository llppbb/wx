if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var activityId = getUrlParam("activityId");
var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_user_balls_detail.json.json';
var json_ = {
    "uid": uid,
    "activityId": activityId
};
fnAjax(sendUrl, "get", false, json_, function(data) {
    if (data.state == 0) {
        var datanew = data.result;
        var ballListHtml = '';
        var isLottery = '';
        $.each(datanew.list, function(i, k) {
            //    先判断是够开奖
            var erweimahtml = '<div class="erweima_tupian bigerweima_btn" qrcord=' + k.qrcord + ' name=' + k.itemDesc + ' onclick="seeqrcord(this)" clickStatus=' + k.clickStatus + ' ballNo=' + k.ballNo + '>' +
                '<div class="erweima_list">二维码<span class="see_youhuiquan" style="color:green;margin-left:0.1rem">（点击查看二维码)</span></div>' +
                '<div class="img_state"></div>' +
                '</div>';
            if (k.qrcordFlag) {
                //    isLottery="未中奖";
                $(".shangpinxinxi_erweima").append(erweimahtml);
            }
            ballListHtml += '<div class="ballList" style="margin-top:.1rem"><span>' + k.ballNo + '</span><span>' + k.addDate + '</span><span>' + k.lotteryStatusName + '</span></div>';
        });
        $(".ballsbox").html(ballListHtml);
        $("#prodcut_name").html(datanew.activityName);
        $("#ballsCount").html(datanew.ballsCount);
        $("#lotteryTime").html(datanew.lotteryTime);
        $("#lotteryAddr").html(datanew.lotteryAddr);
    } else {
        $("#jifenNo").show();
        $(".dingdan").hide();
    }
}, function() {
    console.log("请求错误！")
})

// 查看二维码
function seeqrcord(obj) {
    var src_ = getCode($(obj).attr("qrcord"));
    var clickStatus = $(obj).attr("clickStatus");
    var ballNo = $(obj).attr("ballNo");
    var clickStatusFont = "";
    //clickStatus 0未核销 1已核销
    if (clickStatus == 0) {
        clickStatusFont = "立即使用";
        $(".erweima_state_tishi").attr("clickState", "true");
        $(".erweima_state_tishi").attr("ballNo", ballNo);
        $(".erweima_state_tishi").css({
            "background": "#FFDD10"
        });
    } else if (clickStatus == 1) {
        clickStatusFont = "已使用";
        $(".erweima_state_tishi").attr("clickState", "false");
        $(".erweima_state_tishi").css({
            "background": "#ccc"
        });
    }
    $("#big_erweima").attr("src", src_);
    $(".erweima_name_tishi").html($(obj).attr("name"));
    $(".erweima_state_tishi").html(clickStatusFont);
    $(".mengceng").show();
    $(".erweima_tishi").show();
}
// 关闭弹窗
$(".closeBtn").on("click", function() {
    $(".erweima_tishi").hide();
    $(".mengceng").hide();
})

// 立即使用
$("#reueire_click").on("click", function() {
    $(".erweima_tishi").hide();
    twoanniuLuck("确定要使用吗？", "取消", "确定");
    $("#luckFalseBtn").on("click", function() {
        $(".mengceng").hide();
        $("#twoanniuM").remove();
    })
    $("#luckTrueBtn").on("click", function() {
        if ($("#reueire_click").attr("clickState") == "true") {
            var ballNo = $(("#reueire_click")).attr("ballNo");
            reueire_click(ballNo, activityId);
        }
    })
})

function reueire_click(ballNo, activityId) {
    // clickStatus 0未核销 1已核销
    var sendUrl = APP_URL + 'HXXCLuckyBall/ball/reueire_click.json';
    var json = JSON.stringify({
        "ballNo": ballNo,
        "activityId": activityId
    });
    fnAjax(sendUrl, "get", false, sendDate, function(data) {
        if (data.state == "0") {
            tishi("使用成功！");
            $(".mengceng").hide();
            $("#twoanniuM").remove();
            window.location.reload();
        } else {
            tishi(data.message);
        }
    }, function() {
        console.log("请求错误！")
    })
}

// 微信分享
var share = {
   "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
   "shareDesc": "-",
   "shareLink":WX_URL+"weChat/luckBall/listDetail.html",
   "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
};
wxShare(share);
 
