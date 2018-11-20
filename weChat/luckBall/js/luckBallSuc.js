if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var activityId = getUrlParam("activityId");
var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_ball_success.json';
var json_ = {
    "activityId": activityId,
    "uid": uid
};
var sendDate = JSON.stringify(json_);
fnAjax(sendUrl, "post", false, sendDate, function(data) {
    var datanew = data.result;
    $("#activityName").html(datanew.activityName);
    $("#pickPlus").html(datanew.pickPlus + "个");
    $("#lotteryTime").html(datanew.lotteryTime);
    $("#lotteryAddr").html(datanew.lotteryAddr);
    if (datanew.pickPlus == 0) {
        // 不可继续选号
        $("#back_shop").attr("state", "false");
        $("#back_shop").css({
            "border": "1px solid #CCCCCC",
            "color": "#CCCCCC"
        });
    }
}, function() {
    console.log("error")
})
$('#see_ball').on("click", function() {
    location.href = "luckBallList.html?activityId=" + activityId;
})
$("#back_shop").on("click", function() {
    if ($(this).attr("state") == "true") {
        window.location.href = "luckBallPick.html?activityId=" + activityId;
    }
})

// 微信分享
var share = {
    "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
    "shareDesc": "-",
    "shareLink": WX_URL + "weChat/luckBall/luckBallAct.html",
    "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
};
wxShare(share);
