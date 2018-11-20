  window.onpageshow = function(event) {
            if (event.persisted) {
                window.location.reload();
            }
        };

        // 微信分享
    var share = {
        "shareTitle": "翻滚吧 幸运球，2万现金大奖等你来拿~",
        "shareDesc": "-",
        "shareLink": WX_URL + "weChat/luckBall/luckBallAct.html",
        "posterImage": "http://hxwy.oss-cn-beijing.aliyuncs.com/melive/20180307165521_48001.jpg",
    };
    wxShare(share);
