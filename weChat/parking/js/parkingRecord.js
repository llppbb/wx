if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
//totalAmount 停车费用
//outDt 出场时间
var sendUrl =  APP_PARKING_URL + 'parking/record.json';
var sendDate = JSON.stringify({"uid": uid});
fnAjax(sendUrl, 'post', false, sendDate, function(data) {
	if(parseInt(data.state)== 0) {
		var html = "";
		if(data.result.length == 0) {
			$(".centen").hide();
			$(".nodata").show();
			return false;
		}
		$.each(data.result, function(i, k) {
			var state_ = '';
			if(k.orderState == 2) {
				state_ = "已完成"
			}
			var ParkTime = k.parkTime;
			var ParkTimeNew = ParkTime.replace(/:/g, "时") + "分";
			html += '<div class="carportList" onclick="goDetails('+k.id+')">' +
				'<div class="bgH"><img src="pic/img_cordon.png"/></div>' +
				'<div class="botBor"><p><span class="licenseplatenumber">' + k.carNum + '</span></p>' +
				'<p><span class="carportState">' + state_ + '</span></p></div>' +
				'<div class="parkingLot">' + k.parkName + '</div>' +
				'<div><p><span class="appointmentTime">入场时间:' + k.inDt + '</span></p></div>' +
				'<div class="botBor"><p><span class="outTime">出场时间:' + k.outDt + '</span></p></div>' +
				'<div><p><span class="parkingDuration">时长:' + ParkTimeNew + '</span></p><p style="color:#E9064E;font-weight:bold;">实付:<span>￥' + k.totalAmount + '</span></p></div>' +
				// '<h3 class="bgs"><img src="weixin/parkingNew/pic/img_line2.png"/></h3>' +
				'</div>';
		});
		$(".centen").html(html);
	}
}, function() {
	$(".centen").hide();
	$(".nodata").show();
	return false;
});

// 进入 停车详情
function goDetails(listId){
	window.location.href ="parkingRecordDetails.html?listId=" + listId;
}
// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "会员积分免费停车",
   "shareLink":WX_URL+"weChat/parking/onlinePayment.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
