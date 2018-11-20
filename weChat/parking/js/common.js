//停车 弹窗  输入
function twoanniuParking(centen_wenzi, anniu_wenzi, anniu_wenziR) {
	var tishikuang_html = "<div style='width: 90%;height: 2.1rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'>" +
		"<div style='padding-bottom: 0.1rem;padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "<div style='margin:0.2rem 0 ;width: 80%;height: 0.4rem;border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);'><input  val='' type='text' style='width:100%;height:100%;margin-left:10%;padding-left:.1rem;font-size:.15rem;color:rgb(128,128,128)' placeholder='请填写车牌号' /></div></div>" +

		"<div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;border:1px solid rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div>" +

		"<div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR + "</div></div>";
	$("body").append(tishikuang_html)
}

// 添加轮播图
function raffleImg(raffleImgArr) {
	$(".img_gallery").show();
	var imgHtml = '';
	var pointHtml = '';
	if(raffleImgArr.length == 1) {
		$(".img_gallery").html('<a href=' + raffleImgArr[0].link + ' ><img src=' + raffleImgArr[0].url + ' /></a>')
	} else {
		$.each(raffleImgArr, function(i, k) {
			imgHtml += '<li><a href=' + k.link + ' ><span><img src=' + k.url + ' /></span></a></li>';
			pointHtml += '<a href="#">' + i + '</a>';
		});
		$(".point").html(pointHtml);
		$("#img_box").html(imgHtml);
	}
	setTimeout(function() {
		var pointW = $(".point").width();
		$(".point").css("margin-left", "-" + pointW / 2 + "px");
	}, 10)
}

/**
 * 查询车牌列表
 * @param uid
 * @return
 */
function queryCar(uid) {
	var res = false;
	var jsonObj = 'uid=' + uid;
	fnAjax(APP_PARKING_URL + 'parking/queryCar.json', 'get', false, jsonObj, function(data) {
		res = data;
	}, function(data) {})
	return res;
}

/**
 * 绑定车牌
 * @param uid, carNum
 * @return
 */
function bindingCar(uid, carNum, openid) {
	var res = false;
	var sendDate = JSON.stringify({
		'uid': uid,
		'carNum': carNum,
		'openid': openid
	});
	fnAjax(APP_PARKING_URL + 'parking/bindingCar.json', 'post', false, sendDate, function(data) {
		res = data;
	}, function(data) {})
	return res;
}

/**
 * 删除车牌
 * @param uid, carNum
 * @return
 */
function deleteCarNum(uid, carNum) {
	var res = false;
	var sendDate = {
		'uid': uid,
		'carNum': carNum
	};
	fnAjax(APP_PARKING_URL + 'parking/deleteCarNum.json', 'get', false, sendDate, function(data) {
		res = data;
	}, function(data) {})
	return res;
}

//停车  获取免费时间
function freeOutTime(parkId) {
	var freeOutTime = '';
	var sendDate = {
		'parkId': parkId
	};
	fnAjax(APP_PARKING_URL + 'parking/getPark.json', 'get', false, sendDate, function(data) {
		freeOutTime = data.result;
	}, function(data) {})
	return freeOutTime;
}