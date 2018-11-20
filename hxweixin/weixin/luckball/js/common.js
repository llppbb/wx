// 没有数据显示
function showNodata(imgurl,font){
	var html='<div class="nodata">'+
		'<img src="'+imgurl+'" />'+
		'<p>'+font+'</p>'+
	'</div>';
	$("body").append(html);
	$(".nodata img").css({
		'width': '90%',
		'display': 'block',
		'margin': '.8rem 0 .2rem 5%'
	})
	$(".nodata p").css({
		'text-align': 'center',
		'font-size': '.16rem',
		'color': 'rgb(51,51,51)'
	})
}
/*一个  按钮的  */
function onanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div class='confirm_alert_onebtn' style='width: 82%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 9%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' class='i_know'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}
/*一个  按钮的  */
function onanniLuckball(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div class='confirm_alert_onebtn' style='width: 90%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.25rem;padding-top: 0.25rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 60%;margin-left: 20%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' class='i_know'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}

function twoanniuLuck(centen_wenzi, anniu_wenziL,anniu_wenziR) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50' id='twoanniuM'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;border:1px solid rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' id='luckFalseBtn'>" + anniu_wenziL + "</div><div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;' id='luckTrueBtn'>" + anniu_wenziR + "</div></div>";
    $("body").append(tishikuang_html)
}

var javaFnAjax=function(sendUrl,sendDate,callback,errorCallback){
	$.ajax({
		url: sendUrl,
		type: 'post',
		dataType: 'json',
		async:false,
		contentType:'application/json',
		data: sendDate,
		success:function(data){
			if (callback) {
				callback(data);
			}
		},
		error: function(xhr, status, error) {
			if (xhr.status == "401") {
				alert("你不能进行这个操作！");
			} else if (xhr.status == "408") {
				alert("太久没有进行操作，请重新登录！");
			} else {
				alert("服务器开小差了，请过一会在试。");
			}
			if (errorCallback) {
				errorCallback()
			}
		}
	})
}
