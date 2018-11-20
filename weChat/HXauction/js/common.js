// 隐藏弹框 
function hideModal(obj) {
	$("#" + obj).fadeOut();
}
// taost 显示
function taostModal(obj) {
	$("#" + obj).fadeIn();
	setTimeout(function() {
		$("#" + obj).fadeOut();
	}, 1000);
}