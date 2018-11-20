if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var openid =userData.openId;
var cityid =getUrlParam("cityid");
if($(window).width() == 375 && $(window).height() == 724) {
	$(".layui-m-layercont").css({
		"padding-bottom": ".34rem",
		"background": "#F6F6F6"
	})
}
//  确定添加
$("#confirm").on("click", function() {
	var val = $(".car_input").attr("data-pai").replace(/ /g, '');
	if(!(/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领a-zA-Z]{1}[a-zA-Z]{1}[a-zA-Z0-9]{4,5}[a-zA-Z0-9挂学警港澳]{1}$/.test(val))) {
		$("#message").html("请输入正确的车牌号");
		return false;
	}
	var result = bindingCar(uid, val, openid);
	if(parseInt(result.state) == 0) {
		$("#message").html("");
		tishi("添加车牌成功");
		setTimeout(function(){ window.location.href = "registrationVehicles.html?cityid="+cityid;},1500);
	} else {
		$("#message").html(result.message);
	}
})

// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "会员积分免费停车",
   "shareLink":WX_URL+"weChat/parking/onlinePayment.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
 
