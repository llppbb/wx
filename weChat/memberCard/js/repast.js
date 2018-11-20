goHomeBtn("body");
$(".skipbtn").on("click", function() {
	// $.post(WX_URL + 'requestAjax.php', {
	// 	identity: 'closeSubscribeState'
	// }, function(data) {
	// 	console.log(data);
	// });
	window.location.href = "https://api.mwee.cn/api/web/weixin/near.php?token=f6cddc2391f9a108d38116a4456ec0b35aa2a88d&mall=168650";
})
