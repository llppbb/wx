if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var token = userData.openId;
var uid = userData.uid;
var storageDetail = getStorage('detail');
var auctionID = getStorage('auctionID'); //拍品id
var endTime = storageDetail.endTime; //结束时间
var raiseUnit = storageDetail.raiseUnit; // 加价幅度
var initPrice = storageDetail.newPrice === null ? storageDetail.initPrice : storageDetail.newPrice; //当前价格
var userPoint = getStorage('userDataAuction').point; //当前用户积分
var recordList = ''; //出价列表
//页面初始显示的钱数
var startPrice = parseInt(initPrice) + parseInt(raiseUnit);
// 初始化页面
initfun(auctionID, raiseUnit);
//倒计时
leftTime(endTime);
$(".price").html(startPrice);
//加价
function addPrice() {
    var nowPrice = parseInt($(".price").html()) + parseInt(raiseUnit);
    $(".price").html(nowPrice);
    //当前价格大于最低价格（startPrice）则减号可以点击
    if (nowPrice > startPrice) {
        $(".jianqian").attr("cancut", "true");
        $(".jianqian").find("img").attr("src", "Images/icon_reduce.png");
    }
}
//减价
function cutPrice(obj) {
    if ($(obj).attr("cancut") == "true") {
        var nowPrice = parseInt($(".price").html()) - parseInt(raiseUnit);
        //当前价格小于等于最低价格（startPrice）则减号不可以点击
        if (nowPrice <= startPrice) {
            nowPrice = startPrice;
            $(".jianqian").attr("cancut", "false");
            $(".jianqian").find("img").attr("src", "Images/btn_reduce.png");
        }
        $(".price").html(nowPrice);
    }
}
//获取出价记录
function initfun(auctionID, raiseUnit) {
    var sendUrl = AUCTION_URL + 'get_auction_records.json'; //获取出价记录
    var sendDate = {
        "msgType": 'getAuctionRecords',
        "auctionID": auctionID
    };
    fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
        recordList = data.records;
        if (parseInt(data.state) == 0) {
            if (data.records.length == 0) {
                //暂无出价记录
                $("#noData").show();
            } else {
                //有出价记录
                $("#haveData").show();
                var recordHtml = '';
                startPrice = data.records[0].price + parseInt(raiseUnit); // 页面初始化 积分
                $.each(data.records, function(i, k) {
                    var claName = i == 0 ? (k.userToken == token ? "lineRecordRedBig" : "lineRecordBlackBig") : (k.userToken == token ? "lineRecordRed" : "lineRecordBlack");
                    var people = k.userToken == token ? '我' : k.nickName;
                    var typeStatus = i == 0 ? "领先" : "出局";
                    recordHtml += '<div class="' + claName + '">' +
                        '<div class="name">' + people + '</div>' +
                        '<div class="types">' + typeStatus + '</div>' +
                        '<div class="data">' + k.auctionTime.substring(5, 10) + '</div>' +
                        '<div class="time">' + k.auctionTime.substring(10) + '</div>' +
                        '<div class="point">' + k.price + '积分</div>' +
                        '</div>';
                })
                $("#haveData").html(recordHtml);
            }
        } else {

        }
    }, function(xhr, status, error_) {
        console.log(xhr, status, error_)
    })
}
//点击出价
function auctionClick() {
    var nowPrice = $(".price").html();
    var retData = offerFun(auctionID, nowPrice);
    if (retData.message == '活动已结束') {
        console.log('活动已结束');
        $(".modalname").html('活动已结束');
        $("#errorShow").show();
    } else {
        if (userPoint < nowPrice) {
            console.log('帐户积分不足，无法出价');
            $(".modalname").html('帐户积分不足，无法出价');
            $("#errorShow").show();
        } else if (recordList.length > 0 && nowPrice < recordList[0].price) {
            console.log('您的叫价低于当前最高出价请重新出价')
            $(".modalname").html('您的叫价低于当前最高出价请重新出价');
            $("#errorShow").show();
        } else if (nowPrice < initPrice) {
            console.log('您的叫价低于当前最高出价请重新出价');
            $(".modalname").html('您的叫价低于当前最高出价请重新出价');
            $("#errorShow").show();
        } else {
            //确认出价
            console.log("确认出价！");
            $(".modaltitlerecord").find("span").html(nowPrice);
            $("#suerShow").show();
        }
    }
}
//出价
function offerFun(auctionID, nowPrice) {
    var newData = '';
    var sendUrl = AUCTION_URL + 'check_bidding.json';
    var sendDate = {
        token: token,
        auctionID: auctionID,
        msgType: 'auction',
        price: nowPrice
    }
    fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
        if (parseInt(data.message) == 0) {
            newData = data;
        } else {

        }
    }, function(xhr, status, error_) {
        console.log(xhr, status, error_);
    })
    return newData;
}

//确认出价
function suerOffer() {
    var nowPrice = $(".price").html();
    var sendUrl = AUCTION_URL + 'bidding_activity.json';
    var sendDate = {
        token: token,
        auctionID: auctionID,
        uid:uid,
        price: nowPrice
    }
    fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
        if (parseInt(data.message) == 0) {
            $("#suerShow").hide();
            taostModal("sucShow");
            setTimeout(function() {
                window.location.href = "AuctionDetail.html"
            }, 1000);
        } else {
            $("#suerShow").hide();
            $(".modalname").html(data.message);
            $("#errorShow").show();
        }
    }, function(xhr, status, error_) {
        console.log(xhr, status, error_);
    })
}

// 微信分享
var share = {
   "shareTitle": "竞拍中心",
   "shareDesc": "华熙会员中心",
   "shareLink":WX_URL+"weChat/HXauction/AuctionList.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share,userMes.signPackage);
