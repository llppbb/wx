window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};
if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var openid = userData.openId;
var userInfoData = getUserInfo(openid);
if (!userInfoData) {
    console.log("查询个人信息接口未调通");
} else {
    if (parseInt(userInfoData.state) == 0) {
        $("#mobile").val(userInfoData.result.mobile);
        $("#name").val(userInfoData.result.name);
        $("#birthday").html(userInfoData.result.birthdayDate);
        $("#address").val(userInfoData.result.address);
        if (userInfoData.result.sex == "男") {
            $("#boy").prop("selected", true);
        } else {
            $("#girl").prop("selected", true);
        }
    }
}

// 提交修改
$("#activate").click(function(event) {
    if ($(this).hasClass('activate')) {
        var arr = {};
        arr.name = $("#name").val();
        arr.sex = $("#sex").val();
        arr.address = $("#address").val();
        arr.openid =   openid;
        arr.cardId = userInfoData.result.cardId;
        arr.code = userInfoData.result.code;
        // cardId  code
        //		$.ajax({
        //			url: WX_URL + 'requestAjax.php',
        //			type: 'POST',
        //			dataType: 'json',
        //			async: false,
        //			data: {
        //				'code': data.result.code,
        //				'openid': openid,
        //				'dataArr': arr,
        //				'identity': 'reviseUserCardInfo'
        //			},
        //			success: function(data) {
        //				console.log(data);
        //				if(data.state == 0) {
        //					tishi("修改成功");
        //					window.location.reload();
        //				} else {
        //					// alert(data.result);
        //				}
        //			}
        //		})
        reviseUserCardInfo(arr);
    }
});

// 修改个人信息
function reviseUserCardInfo(obj) {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/updateUser.json';
    var sendData = JSON.stringify(obj);
    fnAjax(sendUrl, "post", false, sendData, function(data) {
        if (data.state == 0) {
            tishi("修改成功");
            window.location.reload();
        } else {}
    }, function() {
        console.log("请求错误！")
    })
}

// 查询个人信息
function getUserInfo(openId) {
    var backData = '';
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/getUserInfo';
    var sendData = {
        'openId': openId
    };
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        backData = data;
    }, function() {
        backData = false;
        console.log("请求错误！")
    })
    return backData;
}


// 加载回到主面按钮
// goHomeBtn("body");
//var appId = '<?php echo APPID?>';
//var nonceStr = '<?php echo $nonceStr;?>';
//var timestamp = '<?php echo $timestamp;?>';
//var signature = '<?php echo $signature;?>';
//// 微信分享
//wx.config({
//	debug: false,
//	appId: appId,
//	timestamp: timestamp,
//	nonceStr: nonceStr,
//	signature: signature,
//	jsApiList: ['checkJsApi', 'onMenuShareAppMessage']
//});
//wx.ready(function() {
//	wx.checkJsApi({
//		jsApiList: ['onMenuShareAppMessage'],
//		success: function(res) {
//			console.log(res);
//		}
//	});
//	wx.onMenuShareAppMessage({
//		title: '吃喝玩乐 华熙LIVE一卡通', // 分享标题
//		desc: '花钱有积分，积分当钱花！', // 分享描述
//		link: WX_URL + 'user.php?userInfo=1', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
//		imgUrl: WX_URL + 'tmp/title.png', // 分享图标
//		type: '', // 分享类型,music、video或link，不填默认为link
//		dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
//		success: function() {
//			// 用户确认分享后执行的回调函数
//			console.log("分享成功");
//		},
//		cancel: function() {
//			// 用户取消分享后执行的回调函数
//			console.log("取消分享");
//		}
//	});
//});
//wx.error(function(res) {
//	// console.log(res);
//});
