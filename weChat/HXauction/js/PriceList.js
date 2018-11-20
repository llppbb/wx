if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var sendUrl = AUCTION_URL + 'get_auction_records.json';
var auctionID = getStorage('auctionID');
var token = userData.openId;
var sendDate = {
    "msgType": 'getAuctionRecords',
    "auctionID": auctionID
};
fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
    if (parseInt(data.state) == 0) {
        if (data.records.length != 0) {
            var html = "";
            $.each(data.records, function(i, k) {
                var className = i == 0 ? (k.userToken == token ? "lineRecordRedBig" : "lineRecordBlackBig") : (k.userToken == token ? "lineRecordRed" : "lineRecordBlack");
                var firstLine = i == 0 ? "领先" : "出局";
                html += '<div class="' + className + '">' +
                    '<div class="name">' + k.nickName + '</div>' +
                    '<div class="types">' + firstLine + '</div>' +
                    '<div class="data">' + k.auctionTime.substring(5, 10) + '</div>' +
                    '<div class="time">' + k.auctionTime.substring(10) + '</div>' +
                    '<div class="point">' + k.price + '积分</div>' +
                    '</div>';
            });
            $(".recordMainDataBox").html(html);
        } else {
            $("#haverecord").hide();
            $("#norecord").show();
        }
    } else {

    }
}, function(xhr, status, error_) {
    console.log(xhr, status, error_)
})

// 微信分享
var share = {
   "shareTitle": "竞拍中心",
   "shareDesc": "华熙会员中心",
   "shareLink":WX_URL+"weChat/HXauction/AuctionList.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share,userMes.signPackage);
