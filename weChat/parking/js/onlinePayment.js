window.onpageshow = function(event) {
	if(event.persisted) {
		window.location.reload();
	}
};

if (!getStorage("userData")) {
		window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
	var userData = getStorage("userData");
	if(parseInt(userData.hasCard)==0){
		window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
	}
}
var tempTimerArray = [];
var tempCarNum = "";
var carNum = "";
var uid = userData.uid;
var cityid = getUrlParam("cityid");
var notime = 0;
var timestart = false;
var timez = function(obj) {
	obj.removeClass('cdtimeb');
	obj.addClass('cdtimer');
	var index_ = obj.index();
	$(".cdmes").hide();
	if(index_ == 1) {
		$("#cdmes0").show();
		$("#cdmes0").html("请在倒计时结束前驶离车场，<br>超时请至人工收费处确认是否需补缴费用");
		$("#cdtime0").css({
			"color": "#FE4857"
		});
		$("#cdmes0").css({
			"background": "url(pic/tip_red.png) no-repeat",
			"background-size": "100% 100%"
		});
	} else if(index_ == 2) {
		$("#cdmes1").show();
		$("#cdmes1").html("请在倒计时结束前驶离车场，<br>超时请至人工收费处确认是否需补缴费用");
		$("#cdtime1").css({
			"color": "#FE4857"
		});
		$("#cdmes1").css({
			"background": "url(pic/tip_red.png) no-repeat",
			"background-size": "100% 100%"
		});
	} else if(index_ == 3) {
		$("#cdmes2").show();
		$("#cdmes2").html("请在倒计时结束前驶离车场，<br>超时请至人工收费处确认是否需补缴费用");
		$("#cdtime2").css({
			"color": "#FE4857"
		});
		$("#cdmes2").css({
			"background": "url(pic/tip_red.png) no-repeat",
			"background-size": "100% 100%"
		});
	}
}

checkCar(uid); // 判断 是否 绑定车牌号 如 没有绑定 显示 绑定车牌号按键  （checkCar  获取车牌号数据）
getcar("", notime, cityid); //获取卡信息
getBanner(cityid); // 获取 banner 图
getParkList(); // 获取停车场列表

// orderState  0 已入场  1已支付未出场
function getcar(carNum, notime, cityid) {
	//重复点击当前页签不重新加载，只加载一次。当有新值，更换重新加载该页面。
	var sendUrl = APP_PARKING_URL + "parking/inParkCar.json";
	var sendDate = "uid=" + uid + "&carNum=" + carNum + "&cityId=" + cityid;
	fnAjax(sendUrl, 'get', false, sendDate, function(data) {
		if(data.state == 0) {
			var html = '';
			var htmlTime = '';
			if(data.result.carsInParking.length == 0) {
				console.log("您的车辆未入场");
				$(".havecar").hide();
				$(".nocar").show();
				$(".botiput").hide();
				// 免费时间 获取
				$("#freeOutTime").html(freeOutTime("-1").freeOutTime);
				return false;
			} else {
				$(".botiput").show();
				// 免费时间 获取
				$("#freeOutTime").html(freeOutTime(data.result.carsInParking[0].parkId).freeOutTime);
			}
			//  canDeduction 0 不享受  1享受
			$.each(data.result.carsInParking, function(i, k) {
				var redfont = "";
				var res = k;
				if(parseFloat(res.unPayAmount) > 0) {
					redfont = "<span><img src='pic/icon_free.png'/></span>减免可用";
					if(data.result.canDeduction == 0) {
						redfont = "<span><img src='pic/icon_free_gray.png'/></span>减免不可用";
					}
				}
				html += '<div class="cartab" id="carnum' + i + '" state=' + i + ' carnum=' + res.carNumber + ' orderstate=' + res.orderState + '>' + res.carNumber + '</div>';
				if(i == 0) {
					//   车场信息 减免显示
					$("#parkName").html(res.parkName);
					var parkTime = res.parkTime;
					var parkTimeNew = parkTime.replace(/:/g, "时") + "分";
					htmlTime += '<div class="timebox" id="cartime' + i + '" state=' + i + '>' +
						'<div>' +
						'<p>入场时间</p>' +
						'<p>' + res.inDt + '</p>' +
						'</div>' +
						'<div class="timeboxC">' +
						'<p>入场时长</p>' +
						'<p>' + parkTimeNew + '</p>' +
						// '<p class="redmes"><img src="weixin/parkingNew/pic/icon_vip.png"/>' + "会员免费停车5小时" + '</p>' +
						'</div>' +
						'<div>' +
						'<p>当前停车费</p>' +
						'<p>￥' + res.unPayAmount + '</p>' +
						'</div>' +
						'</div>';
					if(res.isPaidOnline == 0) { // 车辆在场
						$(".countdown").hide();
						$(".timeboxF").html(htmlTime);
						$(".timeboxF").show();
						// 显示减免是否可用
						$("#redfont").html(redfont);
						$(".botiput").show();
						$(".botiput").attr("act", "go");
					} else if(res.isPaidOnline == 1) { //显示倒计时
						$(".timeboxF").hide();
						$(".countdown").show();
						$("#cdtime").html("");
						$(".botiput").hide();
						$(".botiput").attr("act", "stop");
						var time_ = res.second;
						var timerStart = true;
						clearInterval();
						console.log(tempTimerArray);
						for(var i = 0; i < 4; i++) {
							if(tempTimerArray[i] == res.carNumber) {
								console.log("timerStart" + timerStart);
								timerStart = false;
								break;
							}
						}
						var obj = "";
						$("#cdtime0").hide();
						$("#cdtime1").hide();
						$("#cdtime2").hide();
						$(".cdmes").hide();
						console.log("notimenotimenotimenotime" + notime)
						if(notime == 0) {
							$("#cdtime0").show();
							$("#cdmes0").show();
							obj = $("#cdtime0");
						} else if(notime == 1) {
							$("#cdtime1").show();
							$("#cdmes1").show();
							obj = $("#cdtime1");
						} else if(notime == 2) {
							$("#cdtime2").show();
							$("#cdmes2").show();
							obj = $("#cdtime2");
						}
						console.log(timerStart);
						if(timerStart) {
							tempTimerArray.push(res.carNumber);
							timer2(time_, obj, timez);
						}
					}
					if(parseFloat(res.unPayAmount) == 0) {
						console.log("隐藏支付按钮");
						$(".botiput").hide();
					}
				}
			});
			if(carNum) {} else {
				$(".carnumber").html(html);
			}
		}
	}, function(data) {
		console.log(data);
	});
}

$(".timebox").hide();
$("#cartime0").show();
$("#carnum0").addClass('carnumberOn');
var arr = [];
var tempId = "";
$(".cartab").on("click", function() {
		$(this).addClass('carnumberOn').siblings().removeClass('carnumberOn');
		var id = $(this).attr("id");
		var index = $(this).index();
		if(tempId == id) {
			return;
		} else {
			tempId = id;
		}
		var carnum = $(this).attr("carnum");
		getcar(carnum, index, cityid);
	})
	//出场缴费
$(".botiput").on("click", function() {
	if($(this).attr("act") == "go") {
		var carNum = $(".carnumberOn").html();
		console.log(carNum)
		window.location.href = "costbreakdown.html?carNum=" + carNum + "&cityid=" + cityid;
	}
})

if(carNum) {
	$.each($(".carnumber div"), function(k, v) {
		if($(v).attr("carnum") == carNum) {
			$(v).addClass('carnumberOn').siblings().removeClass('carnumberOn');
			getcar(carNum, notime, cityid);
		}
	});
}

// 是否有车牌号
function checkCar(uid) {
	var querycar = queryCar(uid);
	if(querycar.result.length == 0) {
		$(".center").hide();
		$(".nocarnum").show();
	}
}
// 进入 输入车牌号页面
$(".nocarnumBtn").on("click", function() {
		window.location.href = "addCarNum.html?cityid="+cityid;
	})
	// 进入 车牌号列表 页面
$("#gocarList").on("click", function() {
		window.location.href = "registrationVehicles.html?cityid="+cityid;
	})
	//停车记录
$("#parkingRecord").on("click", function() {
		window.location.href = "parkingRecord.html";
	})
	//会员须知
$("#insetboot").on('click', function(event) {
	window.location.href = "parkingGuideRule.html?cityId=" + cityid;
});

//关闭 引导开卡页面
$(".skipbtn").on("click", function() {
	$(".repast").hide();
	$(".wrap").show();
	$.post(WX_URL + 'requestAjax.php', {
		identity: 'closeSubscribeState'
	}, function(data) {
		console.log(data);
	});
})

// 获取轮播图
function getBanner(cityid) {
	var sendUrl = APP_PARKING_URL + "parking/queryListByCityId.json";
	var sendDate = JSON.stringify({
		"cityId": cityid
	});
	fnAjax(sendUrl, 'post', false, sendDate, function(data) {
		if(data.state == 0) {
			if(data.result.length != 0) { //没有轮播图
				$("#tabBox").removeClass('tabBox').addClass('haveBannerTab');
				$(".center").addClass('haveBannerCenter');
				raffleImg(data.result);
			}
		}
	}, function(res) {})
}

// 停车场列表
function getParkList() {
	var sendUrl = APP_PARKING_URL + 'parking/queryParkList.json';
	var sendDate = {
		"cityId": 0
	};
	fnAjax(sendUrl, 'get', false, sendDate, function(data) {
		var parkingAreaListHtml = '';
		$.each(data.result, function(i, k) {
			parkingAreaListHtml += '<div class="parkingAreaList">' +
				'<div class="parkingName">' + k.parkName + '</div>' +
				'<div class="parkingMes">' + k.parkAddress + '</div>' +
				'</div>';
		});
		$(".parkingAreaLists").html(parkingAreaListHtml);
	}, function(res) {})
}

// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "会员积分免费停车",
   "shareLink":WX_URL+"weChat/parking/onlinePayment.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
