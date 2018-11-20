if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var cityid = getUrlParam("cityid");
// 获取车牌列表
getList();
// 添加车牌  灰色
var index = $(".plateNumberBox li").length;
if(index >= 3) {
	$("#addplateNumber").removeClass("carMin");
	$("#addplateNumber").addClass("carMax");
	$("#addplateNumber").find("img").attr("src", "pic/btn_add_gray.png");
};

// 添加车牌号
$("#addplateNumber").on("click", function() {
	$(this).css({
		"-webkit-tap-highlight-color": "rgba(0,0,0,0)",
		"-webkit-tap-highlight-color":   "transparent"
	})
	var clas = $(this).attr("class");
	var tf = clas.indexOf("carMin");
	if(parseInt(tf) == parseInt(-1)) {
		console.log("您最多绑定三个这牌");
	} else {
		window.location.href = "addCarNum.html?cityid="+cityid;
	}
})

//获取车牌号列表
function getList() {
	var querycar = queryCar(uid);
	var html = "";
	$.each(querycar.result, function(i, k) {
		html += '<li class="plateNumberList"><span>' + k + '</span><span class="delbtn"  onclick="twoanniu_message(this)" carnumber="' + k + '"><img src="pic/icon_delete.png"/></span></li>'
	});
	$(".plateNumberBox").html(html);
	var index = $(".plateNumberBox li").length;
	if(index >= 3) {
		$("#addplateNumber").removeClass("carMin");
		$("#addplateNumber").addClass("carMax");
		$("#addplateNumber").find("img").attr("src", "pic/btn_add_gray.png");
	} else {
		$("#addplateNumber").removeClass("carMax");
		$("#addplateNumber").addClass("carMin");
		$("#addplateNumber").find("img").attr("src", "pic/btn_add.png");
	}
}
//确认删除弹窗
function twoanniu_message(that) {
	$(".trackMatte").show();
	var carnumber = $(that).attr("carnumber");
	twoanniu_mes("确定删除车牌号" + carnumber + "吗？", "", "取消", "确定");
	$("#delTrue").on("click", function() {
		var delreturn = delcar(that);
		if(parseInt(delreturn) != 0) {
			$("#delmesT").html(delreturn);
			$("#delTrue").hide();
			$("#delNo").html("关闭");
			$("#delNo").css("margin-left", "30%")
		} else {
			$(".trackMatte").hide();
			$("#delBox").remove();
		}
	})
	$("#delNo").on("click", function() {
		$(".trackMatte").hide();
		$("#delBox").remove();
	})
}
//删除车牌号
function delcar(that) {
	var delstate = 0;
	var carnumber = $(that).attr("carnumber");
	var res = deleteCarNum(uid, carnumber);
	if(res.state == 0) {
		console.log("删除成功");
		getList();
	} else {
		delstate = res.message;
		console.log("删除失败");
	}
	return delstate;
}
//确认删除弹框
function twoanniu_mes(centen_wenziT, centen_wenzi, anniu_wenzil, anniu_wenzir) {
	var tishikuang_html =
		"<div style='width: 90%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 1.5rem;z-index:50' id='delBox'><div style='padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);font-size: 0.16rem;'>" +
		"<p style='color: rgb(51,51,51);padding-top:.1rem' id='delmesT'>" + centen_wenziT + "</p>" +
		"<p id='delmes' style='color: rgb(224,0,61);padding:.07rem .15rem .2rem .15rem;font-size: 0.12rem'>" + centen_wenzi + "</p>" +
		"</div><div style='-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;border:1px solid rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' id='delNo'>" +
		anniu_wenzil +
		"</div><div style='-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;' id='delTrue'>" +
		anniu_wenzir +
		"</div></div>";
	$("body").append(tishikuang_html)
}

// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "会员积分免费停车",
   "shareLink":WX_URL+"weChat/parking/onlinePayment.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
