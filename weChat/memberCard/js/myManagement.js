window.onpageshow = function(event) {
	if(event.persisted) {
		window.location.reload();
	}
};

// 个人信息
$("#userInfo").on("click", function() {
	window.location.href = "userInfo.html";
	return;
});
// 我的卡券
$("#order").on("click", function() {
	window.location.href = "../shop/shoporder.html";
	return;
});
// 票夹
$("#wallet").on("click", function() {
	// tishi("敬请期待！");
	window.location.href = "../ticketFolder/ticketStart.html";
	return;
});
// 实名制信息
$("#realname").on("click", function() {
	window.location.href = "../realName/realNameList.html";
	return;
});
// 收货地址管理
$("#address").on("click", function() {
	window.location.href = "../addressList/addressList.html";
	return;
});
// 我的幸运球
$("#myluckball").on("click", function() {
	window.location.href = "../luckBall/luckBallList.html";
	return;
});

// 加载回到主面按钮
goHomeBtn("body");

// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "花钱有积分，积分当钱花！",
   "shareLink":WX_URL+"weChat/memberCard/myManagement.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
