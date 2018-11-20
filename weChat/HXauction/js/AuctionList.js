if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var sendUrl = AUCTION_URL + 'goods_list.json';
var token = userData.openId;
var cityId= getUrlParam("cityid");
console.log(token);
var sendDate = {
    "token": token,
    "cityId": cityId
};
init(sendUrl, sendDate);
//初始化页面
function init(sendUrl, sendDate) {
    fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
        if (parseInt(data.state) == 0) {
            if (data.ended.length == 0 && data.notstart.length == 0 && data.ongoing.length == 0) {
                $(".auctionListMain").hide();
                $("#noData").show();
                return false;
            } else {
                // 正在热拍
                if (data.ongoing.length != 0) {
                    var ongoingHtml = '';
                    $.each(data.ongoing, function(i, k) {
                        var hotgoodsimgUrl = k.picUrl == null ? "../Images/img_loading1.png" : k.picUrl;
                        var newPrice = k.newPrice == null ? k.price : k.newPrice;
                        ongoingHtml += '<div class="hotgoods" onclick=goDetail("' + k.auctionID + '")>' +
                            '<img class="hotgoodsimg" src="' + hotgoodsimgUrl + '" alt="" />' +
                            '<div class="hotdiv">' +
                            '<div class="goodstimeline"></div>' +
                            '<div class="goodstitleline">' + k.name + '</div>' +
                            '<div class="goospointline">当前价 <span class="goodspointbigline">' + newPrice + '积分</span></div>' +
                            '</div>' +
                            '</div>';
                        //倒计时
                        leftTimeReHtml(k.endTime, function(data) {
                            var countDown = '<div class="countdowngb">' +
                                '<div class="datanum1 day">' + data.d + '</div>' +
                                '<div class="danwei1">天</div>' +
                                '<div class="datanum1 hour">' + data.h + '</div>' +
                                '<div class="danwei1">:</div>' +
                                '<div class="datanum1 minute">' + data.m + '</div>' +
                                '<div class="danwei1">:</div>' +
                                '<div class="datanum1 second">' + data.s + '</div>' +
                                '</div>';
                            $(".goodstimeline").eq(i).html(countDown);
                        })
                    });
                    $("#hotauctionBox").html(ongoingHtml);
                }
                // 竞拍预告
                if (data.notstart.length != 0) {
                    var notstartHtml = '';
                    $.each(data.notstart, function(i, k) {
                        var notstartimgUrl = k.picUrl == null ? "../Images/img_loading1.png" : k.picUrl;
                        var time1;
                        var time = parseInt(new Date().getDate());
                        if (time === parseInt(k.startTime.substring(8, 10))) {
                            time1 = '今天' + k.startTime.substring(10)
                        } else {
                            time1 = k.startTime
                        }
                        notstartHtml += '<div class="pregoods" onclick=goDetail("' + k.auctionID + '")>' +
                            '<img class="goodsimg" src="' + notstartimgUrl + '" alt="" />' +
                            '<div class="goodstitlerow">' + k.name + '</div>' +
                            '<div class="goodstimerow">' + time1 + '</div>' +
                            '<div class="goospointrow">起拍价 <span class="goodspointbig">' + k.price + '积分</span></div>' +
                            '</div>';
                    });
                    $(".preauction").find(".goodsrow").html(notstartHtml);
                }
                // 已结束
                if (data.ended.length != 0) {
                    var endedHtml = '';
                    $.each(data.ended, function(i, k) {
                        var time1;
                        var time = parseInt(new Date().getDate());
                        if (time === parseInt(k.startTime.substring(8, 10))) {
                            time1 = '今天' + k.startTime.substring(10)
                        } else {
                            time1 = k.startTime
                        }
                        var endedimgUrl = k.picUrl == null ? "../Images/img_loading1.png" : k.picUrl;
                        var newPrice = k.newPrice == null ? k.price : k.newPrice;
                        endedHtml += '<div class="pregoods" onclick=goDetail("' + k.auctionID + '")>' +
                            '<div class="overtitle">结束</div>' +
                            '<img class="goodsimgover" src="' + endedimgUrl + '" alt="" />' +
                            '<div class="goodstitlerow">' + k.name + '</div>' +
                            '<div class="goodstimerow">' + time1 + '</div>' +
                            '<div class="goospointrow">成交价 <span class="goodspointbig">' + newPrice + '积分</span></div>' +
                            '</div>';
                    });
                    $(".endauction").find(".goodsrow").html(endedHtml);
                }
            }
        } else {

        }
    }, function(xhr, status, error_) {
        console.log(xhr, status, error_)
    })
}
//进入竞拍详情
function goDetail(auctionID) {
    setStorage('auctionID', auctionID);
    window.location.href = "AuctionDetail.html?";
}
//下拉刷新
$(document.body).pullToRefresh().on("pull-to-refresh", function() {
    init(sendUrl, sendDate);
    setTimeout(function() {
        //停止下拉刷新
        $(document.body).pullToRefreshDone();
    }, 2000);
});

$(".goodstap").on("click",function(){
    window.location.href="../shop/shopAll.html?cityId=" + cityId;
})

// 微信分享
var share = {
   "shareTitle": "竞拍中心",
   "shareDesc": "华熙会员中心",
   "shareLink":WX_URL+"weChat/HXauction/AuctionList.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share,userMes.signPackage);
