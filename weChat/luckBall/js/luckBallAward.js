window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};
// 微信分享
var share = {
   "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
   "shareDesc": "-",
   "shareLink":WX_URL+"weChat/luckBall/luckBallAct.html",
   "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
};
wxShare(share);

//var uid = "<?php echo $uid?>";
if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_history_lottery.json';
var json_ = {
    "uid": uid
};
init(json_, "init");

function init(json, type) {
    var sendDate = JSON.stringify(json);
    fnAjax(sendUrl, "post", false, sendDate, function(data) {
        if (parseInt(data.state) == 0) {
            var datanew = data.result;
            var awardsbox_html = ''; //奖项设置
            // 头部开奖日期
            if (type == "init") {
                var date_list_html = '';
                $.each(datanew.activity_date, function(i, k) {
                    date_list_html += '<di class="date_list" activityId=' + k.activityId + ' onclick="changeact(this)">' + timestampToTime(k.lotteryTime / 1000, "y-m-d") + '</di>';
                });
                $(".dateBox").html(date_list_html);
                $(".date_list").eq(0).addClass('date_list_on');
            }
            // 奖项设置
            $.each(datanew.reward_item, function(i, k) {
                awardsbox_html += '<div class="flex_box flex_between font_14_color_706 bor_bot_D5C"><p>' + k.itemName + '：' + k.itemDesc + '</p><p>数量：' + k.itemCount + '</p></div>';
            });
            $(".awardsbox").html(awardsbox_html);
            // 没有中奖信息
            if (datanew.balls_pick.length == 0) {
                $(".mymesbox").html("本期未中奖，继续加油哦~");
                $(".mymesbox").addClass('Nomymesbox');
            } else {
                $(".mymesbox").html("");
                var mymesboxHtml = '';
                $.each(datanew.balls_pick, function(i, k) {
                    mymesboxHtml += '<div class="flex_box flex_between font_14_color_333 bor_top_333"><p>' + k.ballNo + '</p><p>' + k.itemName + '</p></div>';
                });
                $(".mymesbox").removeClass('Nomymesbox');
                $(".mymesbox").html(mymesboxHtml);
            }
            // 没有 开奖视频
            if (datanew.activityModel.lotteryVideoUrl == null) {
                $(".video").hide();
            } else {
                $(".video").show();
                // 有中奖视频
                $("#iframe").attr("src", datanew.activityModel.lotteryVideoUrl);
            }
            // 中奖信息
            var tbody = '';
            $.each(datanew.lottery_balls, function(i, k) {
                var ballNum = k.ballNo.split(",");
                console.log(ballNum);
                var ballSpan = '';
                for (var j = 0; j < ballNum.length; j++) {
                    ballSpan += '<span style="margin-left:.1rem;margin-right:.1rem">' + ballNum[j] + '</span>'
                }
                tbody += '<tr>' +
                    '<td><span style="margin-left:.1rem;display: block;">' + k.itemName + '</span></td>' +
                    '<td style="text-align:left;display:flex;flex-wrap:wrap;">' + ballSpan + '</td>' +
                    '</tr>';
            });
            $("#tbody").append(tbody);
        } else if (data.state == 1) {
            // 暂无历史信息
            console.log("暂无历史信息");
            $("#jifenNo").show();
            $(".wrap").hide();
        }
    }, function() {
        console.log("error");
    });
}

// 切换日期
function changeact(obj) {
    var id = $(obj).attr("activityId");
    var jsonchange = {
        "uid": uid,
        "activityId": id
    };
    $("#tbody").html("<tr><td><span style='margin-left:.1rem'>奖项</span></td><td><span style='margin-left:.1rem'>中奖号码</span></td></tr>");
    $(obj).addClass('date_list_on').siblings('').removeClass('date_list_on');
    $(".mymesbox").html("");
    init(jsonchange, "change");
}
// 规则详情
$(".actrule").on("click", function() {
    window.location.href = "luckBallActrule.html";
})
