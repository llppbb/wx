// 获取签名
function getSignPackage() {
    var returnData = "";
    var pargeUrl=getSignByUrl();
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/getSignPackage';
    var sendData = {
        'url': encodeURIComponent(pargeUrl)
    };
    fnAjax(sendUrl, "get", false, sendData, function(res) {
        returnData = res;
    }, function(error) {
        returnData = false;
        console.log(error)
    })
    return returnData;
}

function getSignByUrl() {
    var pargeUrl =  window.location.href.split('/');
    var newStr="/"+pargeUrl[3]+"/"+pargeUrl[4]+"/"+pargeUrl[5];
    return newStr;
}

function wxShare(share) {
    var signPackage=getSignPackage();
    // 微信分享
    wx.config({
        debug: false,
        appId: signPackage.appId,
        timestamp: signPackage.timestamp,
        nonceStr: signPackage.nonceStr,
        signature: signPackage.signature,
        jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord',
            'stopRecord', 'onRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation',
            'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'
        ]
    })
    // 微信分享给朋友
    wx.error(function(res) {
        console.log("出错了：");
        console.log(res.errMsg);
    });
    wx.ready(function() {
        wx.checkJsApi({
            jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'],
            success: function(res) {}
        });
        // 分享给朋友
        wx.onMenuShareAppMessage({
            title: share.shareTitle,
            desc: share.shareDesc,
            link: share.shareLink,
            imgUrl: share.posterImage,
            trigger: function(res) {
                // 用户确认分享后执行的回调函数
            },
            success: function(res) {
                // 用户确认分享后执行的回调函数
            },
            cancel: function(res) {
                console.log("取消分享：");
                console.log(JSON.stringify(res));
                // 用户取消分享后执行的回调函数
            },
            fail: function(res) {
                console.log("分享失败：");
                console.log(JSON.stringify(res));
            }
        });
        // 分享到朋友圈
        wx.onMenuShareTimeline({
            title: share.shareTitle,
            desc: share.shareDesc,
            link: share.shareLink,
            imgUrl: share.posterImage,
            trigger: function(res) {
                // 用户确认分享后执行的回调函数
            },
            success: function(res) {
                // 用户确认分享后执行的回调函数
            },
            cancel: function(res) {
                console.log("取消分享：");
                console.log(JSON.stringify(res));
                // 用户取消分享后执行的回调函数
            },
            fail: function(res) {
                console.log("分享失败：");
                console.log(JSON.stringify(res));
            }
        });
        console.log('已注册获取“发送给朋友”状态事件');
    })
}


// // 禁用微信分享
// function onBridgeReady() {
//     WeixinJSBridge.call('hideOptionMenu');
// }
//
// if (typeof WeixinJSBridge == "undefined") {
//     if (document.addEventListener) {
//         document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
//     } else if (document.attachEvent) {
//         document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
//         document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
//     }
// } else {
//     onBridgeReady();
// }
