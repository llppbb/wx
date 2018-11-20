var cityid = getUrlParam("cityId");
// cityid 1 北京 2 成都  3 重庆
$(".tabBox div").eq(cityid - 1).addClass('tabBoxOn').siblings('').removeClass('tabBoxOn');
getRemark(cityid);
$(".tabBox div").on("click", function() {
	$(this).addClass('tabBoxOn').siblings('').removeClass('tabBoxOn');
	var tabattr = $(this).attr("cityId");
	getRemark(tabattr);
})

// 富文本信息
function getRemark(cityid, parkId) {
	var sendUrl = APP_PARKING_URL + 'parking/getRemark.json';
	var sendDate = {
		"cityId": cityid
	};
	fnAjax(sendUrl, 'get', false, sendDate, function(data) {
		if(data.state == 0) {
			$(".center").html(data.result);
		} else {
			$(".center").html("<p class='nodata'>敬请期待</p>");
		}
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
