window.onpageshow = function(event) {
	if(event.persisted) {
		window.location.reload();
	}
};
if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_user_balls_list.json';
var json_ = {
	"uid": uid
};
fnAjax(sendUrl, "get", false, json_, function(data) {
	if(data.state == 0) {
		if(data.result.length == 0) {
			$("#jifenNo").show();
			$(".dingdan").hide();
		} else {
			var listhtml = '';
			$.each(data.result, function(i, k) {
				listhtml += '<div class="dingdan_list" activityId=' + k.activityId + '>' +
					'<div class="product_img">' +
					'<img src="' + k.image + '">' +
					'</div>' +
					'<div class="dingdan_list_name">' + k.activityName + '</div>' +
					'<div class="dingdan_list_number_state" style="margin-top:.14rem">' +
					'<div class="dingdan_list_number"></div>' +
					'<div class="dingdan_list_number" style="margin-top:.14rem">数量:' + k.ballsCount + '<span>' + k.payPoint + '积分</span></div>' +
					'</div>' +
					'<div class="jianhao"><img src="pic/gengduo.png"></div>' +
					'</div>';
			});
			$(".dingdan").html(listhtml);
		}
	} else {
		$("#jifenNo").show();
		$(".dingdan").hide();
	}
}, function() {
	console.log("请求错误！")
})

$(".dingdan_list").on("click", function() {
	var activityId = $(this).attr("activityId");
	location.href = "listDetail.html?activityId=" + activityId;
})

$("#gopiao").on("click", function() {
	location.href = "luckBallAct.html";
})


// 微信分享
var share = {
   "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
   "shareDesc": "-",
   "shareLink":WX_URL+"weChat/luckBall/luckBallAct.html",
   "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
};
wxShare(share);
