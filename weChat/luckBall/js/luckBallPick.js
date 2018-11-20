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
var activityId = getUrlParam("activityId");
var random = MathRand();
//判断选号是否结束
judgeActState(activityId, uid);
// 获取积分 判断兑换方式
changeType(uid);
// 随机选号
$("#radombtn").on("click", function() {
	var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_ball_random.json';
	var json_ = {
		"activityId": activityId,
		"uid": uid,
		"random": random
	};
	var sendDate = JSON.stringify(json_);
	fnAjax(sendUrl, "post", false, sendDate, function(data) {
		console.log(data);
		if(data.state == 0) {
			$("#ballnum").val(data.result);
			var radomarr = data.result.split(""); //字符串转化为数组
			console.log(radomarr);
			for(var i = 0; i < radomarr.length; i++) {
				$(".inputBalllist").eq(i).html(radomarr[i]);
			}
		} else {
			tishi(data.message);
		}
	}, function() {
		console.log("error")
	})
})
$(".footer").on("click", function() {
	var ballNo = $("#ballnum").val();
	console.log(ballNo.length);
	console.log(ballNo);
	if(ballNo.length != 4) {
		tishi("请输入4位数字！");
	} else {
		save_ball(activityId, uid, ballNo);
	}
})
$(".backHomePage").on("click", function() {
		window.location.href ="luckBallAct.html";
	})
	// 选球入库
function save_ball(activityId, uid, ballNo) {
	var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_save_ball.json';
	var json_ = {
		"activityId": activityId,
		"uid": uid,
		"ballNo": ballNo
	};
	var sendDate = JSON.stringify(json_);
	fnAjax(sendUrl, "post", false, sendDate, function(data) {
		if(data.state == "0") {
			window.location.href = "luckBallSuc.html?activityId=" + activityId;
		} else if(data.state == "1") {
			tishi(data.message);
		} else if(data.state == "2") {
			$(".mongoliaLayer").show();
			onanniLuckball(data.message, "确定");
			// i_know 弹窗错误提示
			$(".i_know").on("click", function() {
				$(".mongoliaLayer").hide();
				$(".confirm_alert_onebtn").remove();
			})
		}
	}, function() {
		console.log("error")
	})
}
// 创建随机数
function MathRand() {
	var Num = "";
	for(var i = 0; i < 4; i++) {
		Num += Math.floor(Math.random() * 10);
	}
	return Num;
}

$('#ballnum').on("focus", function(event) {
	$('#ballnum').val("");
	for(var i = 0; i < 4; i++) {
		$(".inputBalllist").eq(i).html("");
	}
	$(".inputBalllist").eq(0).addClass('ballNumOn').siblings('').removeClass('ballNumOn');
});
$('#ballnum').on("blur", function(event) {
	for(var i = 0; i < 4; i++) {
		$(".inputBalllist").eq(i).removeClass('ballNumOn');
	}
});
$('#ballnum').on('keyup', function() {
	var val = $(this).val();
	// $(".inputBallNum").html(val);
	if(val.length > 4) {
		var sub = $(this).val().substring(0, 4);
		$(this).val(sub);
		return false;
	} else {
		$(".inputBalllist").eq(val.length).addClass('ballNumOn').siblings('').removeClass('ballNumOn');
		showBallNum(val);
	}
});

// 创建显示球号
function showBallNum(num) {
	var arr = numToarr(num);
	var kongnum = 4 - arr.length;
	if(arr.length != 4) {
		for(var i = 0; i < kongnum; i++) {
			arr.push("");
		}
	}
	for(var i = 0; i < arr.length; i++) {
		$(".inputBalllist").eq(i).html(arr[i]);
	}
}
// 数字转数组
function numToarr(num) {
	var newnum = num.toString();
	var obj2 = newnum.split(""); //字符串转化为数组
	return obj2;
}
// 兑换方式
function changeType(uid) {
	var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_ball_item.json';
	var json = {
		"uid": uid
	};
	var sendDate = JSON.stringify(json);
	fnAjax(sendUrl, "post", false, sendDate, function(data) {
		var datanew = data.result;
		payPoint = datanew.activityModel.payPoint;
		var reward_item_html = '';
		activityId = datanew.activityModel.activityId;
		var footerHtml = '免费领取幸运球';
		if(datanew.isFree == "N") {
			$("#payPoint").html(payPoint);
			$(".footer").html("积分兑换");
			$(".pointshowBox").show();
		}
	}, function() {
		console.log("error");
	});
}
//判断选号是否结束
function judgeActState(activityId, uid) {
	var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_can_getBall.json';
	var json = {
		"activityId": activityId,
		"uid": uid
	};
	var sendDate = JSON.stringify(json);
	fnAjax(sendUrl, "post", false, sendDate, function(data) {
		if(data.state == 1) {
			$("#jifenNo").show();
			$(".wrap").hide();
		} else if(data.state == 2) {
			$(".mongoliaLayer").show();
			onanniLuckball(data.message, "查看我的幸运球");
			// i_know 弹窗错误提示
			$(".i_know").on("click", function() {
				$(".mongoliaLayer").hide();
				$(".confirm_alert_onebtn").remove();
				window.location.href = "luckBallList.html";
			})
		}
	}, function() {
		console.log("error")
	});
}
// 微信分享
var share = {
   "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
   "shareDesc": "-",
   "shareLink":WX_URL+"weChat/luckBall/luckBallAct.html",
   "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
};
wxShare(share);
