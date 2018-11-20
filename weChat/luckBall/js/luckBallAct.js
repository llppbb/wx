if (!getStorage("userData")) {
            window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
        } else {
            var userData = getStorage("userData");
        }
var uid =userData.uid;
var activityId = "";
window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};
// 获取积分
var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_ball_item.json';
var jsonObj = {
    "uid": uid
};
var sendDate = JSON.stringify(jsonObj);
fnAjax(sendUrl, "post", false, sendDate, function(data) {
    if (parseInt(data.state) == 0) {
        var datanew = data.result;
        var reward_item_html = '';
        activityId = datanew.activityModel.activityId; //活动id
        $.each(datanew.reward_item, function(i, k) {
            reward_item_html += '<p><span style="width:25%;display: inline-block;">' + k.itemName + '</span><span style="width:50%;display: inline-block;">' + k.itemDesc + '</span><span style="width:25%;display: inline-block;">数量：' + k.itemCount + '</span></p>';
        });
        // isFree Y：免费  N：消耗积分
        var footerHtml = '免费领取幸运球';
        if (datanew.isFree == "N") {
            footerHtml = '积分兑换幸运球'
        }
        $(".footer").html(footerHtml);
        $(".lotteryTime").html(timestampToTime(datanew.activityModel.lotteryTime / 1000, "y-m-d h:m"));
        $(".lotteryAddr").html(datanew.activityModel.lotteryAddr);
        $(".reward_item").html(reward_item_html);
    } else {

    }
}, function() {
    console.log("error");
})
// 规则详情
$("#seeRule").on("click", function() {
    window.location.href = "luckBallActrule.html";
})
// 历史开奖信息
$("#history_mes").on("click", function() {
    window.location.href = "luckBallAward.html";
})
// 我的幸运球
$("#myluckball").on("click", function() {
    window.location.href = WX_URL + "user.php?luckballlist=1";
    window.location.href = "luckBallList.html";
})
// 进入选号页面
$(".footer").on("click", function() {
    window.location.href = "luckBallPick.html?activityId=" + activityId;
})

// 开奖时间调整公告
$("#announcement").on("click", function() {
    window.location.href = "http://mp.weixin.qq.com/s/MPYBqSvmO8T8-CNt4_0PWg";
})

// 微信分享
var share = {
   "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
   "shareDesc": "-",
   "shareLink":WX_URL+"weChat/luckBall/luckBallAct.html",
   "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
};
wxShare(share);
