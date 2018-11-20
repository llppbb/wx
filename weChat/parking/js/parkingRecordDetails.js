if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var listId = getUrlParam("listId");
//totalAmount 停车费用
//outDt 出场时间
var sendUrl = APP_PARKING_URL + 'parking/recordDetail.json';
var sendDate = JSON.stringify({
	"uid": uid,
	"id": listId
});
fnAjax(sendUrl, 'post', false, sendDate, function(data) {
	if(data.state == 0) {
		var ParkTime = data.result[0].parkTime;
		var ParkTimeNew = ParkTime.replace(/:/g, "时") + "分";
		$("#carNum").html(data.result[0].carNum);
		$("#inDt").html(data.result[0].inDt);
		$("#outDt").html(data.result[0].outDt);
		$("#ParkTimeNew").html(ParkTimeNew);
		$("#parkAmount").html("￥" + data.result[0].parkAmount);
		$("#deductionAmount").html("-￥" + data.result[0].deductionAmount);
		$("#deducte_point").html("-" + data.result[0].deductePoint);
		$("#cashAmount").html("￥" + data.result[0].cashAmount);
		$("#paidAmount").html("￥" + data.result[0].paidAmount);
		$("#addPoint").html(data.result[0].addPoint);
		$("#totalAmount").html("￥" + data.result[0].totalAmount);
		$("#parkName").html(data.result[0].parkName);
	}
}, function() {
	$(".centen").hide();
	$(".nodata").show();
	return false;
});
// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "会员积分免费停车",
   "shareLink":WX_URL+"weChat/parking/onlinePayment.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
