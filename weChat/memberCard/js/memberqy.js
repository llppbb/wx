var uid = getUrlParam("uid");
console.log(uid);
goHomeBtn("body");
$(".getpoint").on("click", function() {
	window.location.href ="pointrule.html";
});
//获取用户本年度累计积分
var sendType = 'get';
var sendMode = true;
var sendDate = JSON.stringify({
	'uid': uid
});
var sendUrl = APP_URL + 'HXWYServiceMain/user/require_user_point_current.json?data='+sendDate;
fnAjax(sendUrl, sendType, sendMode, sendDate, function(data) {
$("#point").html(data.result.point);
}, function() {})
