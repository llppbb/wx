/**
 *提示函数
 */
function tishi(message) { //提示信息
    $('.shezhi_tishi p').html(message);
    $('.shezhi_tishi').show();
    var windowWidth = $(window).width();
    var tiShiBoxWidth = $(".shezhi_tishi").innerWidth();
    var leftMargin = (windowWidth - tiShiBoxWidth) / 2;
    $(".shezhi_tishi").css("left", leftMargin + "px");
    $('.shezhi_tishi').css('opacity', '0.7');
    setTimeout(function() {
        $('.shezhi_tishi').fadeOut(1000);
    }, 1500)
}
// 返回  商城主页    5.9
function goHomeBtn(obj) {
    var back_shop = '<div id="back_shop" style="opacity:0.7; width: 0.51rem;height: 0.51rem;position: fixed;left: 0.1rem;bottom: 0.1rem;" ><img style="width: 100%;height: 100%;" src="/weChat/common/pic/btn_home.png"/></div>'
    $(obj).append(back_shop);
    $("#back_shop").on("click", function() {
        location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
    })
}
/*提示框 一个按钮的 会员卡主页*/
function onanniuMemberCen(centen_wenzi, anniu_wenzi) {
	var tishikuang_html =
		"<div style='width: 80%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 10%;top: 1.2rem;z-index:9999' class='onekuang'><div style='padding-bottom: 0.36rem;padding-top: 0.4rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" +
		centen_wenzi +
		"</div><div style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' class='i_know'>" +
		anniu_wenzi + "</div></div>";
	$("body").append(tishikuang_html);
}
function tishinew(message) { //提示信息
    $('.shezhi_tishinew p').html(message);
    $('.shezhi_tishinew').show();
    var windowWidth = $(window).width();
    var tiShiBoxWidth = $(".shezhi_tishinew").outerWidth();
    if (tiShiBoxWidth >= windowWidth * 0.6) {
        console.log(3333)
        tiShiBoxWidth = windowWidth * 0.6;
        $('.shezhi_tishinew').css("width", tiShiBoxWidth + "px");
    }
    var leftMargin = (windowWidth - tiShiBoxWidth) / 2;
    $(".shezhi_tishinew").css("left", leftMargin + "px");
    $('.shezhi_tishinew').css('opacity', '0.7');
    setTimeout(function() {
        $('.shezhi_tishinew').fadeOut(1000);
    }, 1500)
}
