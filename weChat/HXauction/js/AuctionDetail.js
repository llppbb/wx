if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var sendUrl = AUCTION_URL + 'get_goods_detail.json';
var auctionID = getStorage('auctionID');
var token = userData.openId;

var sendDate = {
    "token": token,
    "auctionID": auctionID
};
var jumpToRecord_data = '';
fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
    var newdata = data.detail;
    jumpToRecord_data = data;
    //倒计时
    leftTime(newdata.endTime);
    //存贮跳转需要的参数
    setStorage("userDataAuction", data.userData);
    setStorage("detail", data.detail);
    if (parseInt(data.state) == 0) {
        //活动未开始
        var noStart = moment(newdata.startTime).isAfter(new Date());
        //活动已结束
        var overAct = moment(newdata.endTime).isBefore(new Date());
        //活动进行中
        var betweenAct = moment(new Date()).isBetween(newdata.startTime, newdata.endTime);
        var newPrice = newdata.newPrice === null ? newdata.initPrice : newdata.newPrice;
        if (noStart) {
            $(".statusbarPre").show();
            var pointslineHtml = '<div class="goodspoint">起拍价 <span class="goodspointbigline">' + newdata.initPrice + '</span></div><div class="goodspoint1">积分</div>';
            $(".pointsline").html(pointslineHtml);
            //隐藏出价记录
            $(".pricelist").hide();
            if (data.userData.enroll == true) {
                $(".bottombtndone").show();
            } else {
                $(".bottombtn").show();
            }
        } else if (overAct) {
            var pointslineHtml = '<div class="goodspoint">成交价 <span class="goodspointbigline">' + newPrice + '</span>' + '</div><div class="goodspoint1">积分</div>';
            if (newdata.newest3bidding.length == 0) {
                //流拍
                pointslineHtml = '<div class="goodspoint">流拍</div>';
                //隐藏出价记录
                $(".pricelist").hide();
                //隐藏 准入积分 参与奖励  会员等级
                $(".liupaihide").hide();
            }
            $(".pointsline").html(pointslineHtml);
            $(".statusbarEnd").show();
        } else if (betweenAct) {
            var pointslineHtml = '<div class="goodspoint">当前价<span class="goodspointbigline">' + newPrice + '</span></div>' +
                '<div class="goodspoint1">积分</div>';
            $(".pointsline").html(pointslineHtml);
            $(".statusbarOpen").show();
            $(".bottombtnpai").show();
        }
        $(".topimg").attr("src", newdata.picUrl);
        $(".goodsname").html(newdata.goodsName);
        //出价记录
        $(".listName").html("出价记录 " + newdata.biddingCounter + "条>");
        bidRecord(newdata.newest3bidding);
        $(".startpiont").find("span").html(newdata.initPrice + "积分");
        $(".pointstep").find("span").html(newdata.raiseUnit + "积分");
        $(".starttime").find("span").html(newdata.startTime.substring(5));
        $(".endtime").find("span").html(newdata.endTime.substring(5));
        //即将开始 时间
        $(".overtitleDownPre").html(newdata.startTime.substring(5));
        //结束 时间
        $(".overtitleDownEnd").html(newdata.endTime.substring(5));
        var minPoint = newdata.minPoint == 0 ? '无限制' : newdata.minPoint;
        if (newdata.minRank == 1) {
            $(".qualification").hide();
        } else {
            $(".minPoint").hide();
        }
        $(".minPoint").find("span").html(minPoint);
        $(".qualification").find("span").html(newdata.qualification);
        $(".participate").find("span").html(newdata.bonus);
        $(".descpage").html(utf16To8(base64Decode(newdata.descriptions))); //商品详情
        var prompt = newdata.prompt == "" ? newdata.productPrompt : newdata.prompt;
        $(".promptcontent").html(utf16To8(base64Decode(prompt))); //温馨提示
    }
}, function(xhr, status, error_) {
    console.log(xhr, status, error_)
})

//出价记录
function bidRecord(arr) {
    var html = '';
    $.each(arr, function(i, k) {
        var bidType = i == 0 ? "领先" : "出局";
        var calName = i == 0 ? "lineBlackBig" : "lineBlack";
        html += '<div class=' + calName + '><div class="nameLine">' + k.nickName + '</div>' +
            '<div class="typesLine">' + bidType + '</div>' +
            '<div class="dataLine">' + k.auctionTime.substring(5, 10) + '</div>' +
            '<div class="timeLine">' + k.auctionTime.substring(10) + '</div>' +
            '<div class="pointLine">' + k.price + '积分</div></div>';
    })
    $(".pricelistBox").html(html);
}
//去竞价
$(".bottombtnpai").on("click", function() {
    jumpToRecord(jumpToRecord_data);
})
// 判断 积分 会员等级。
function jumpToRecord(data) {
    //用户信息 userData   当前商品所需积分数  minPoint
    if (data.userData.point < data.detail.minPoint) {
        //		alert("您当前的账户积分未达到本次竞拍的准入积分值");
        $(".sucmodalname").find("span").html('您当前的账户积分未达到本次竞拍的准入积分值');
        $(".twobtn").show();
        $("#offerFeil").show();
    } else if (data.userData.userRank < data.detail.minRank) {
        var title = '本次竞拍需要' + data.detail.qualification + '及以上级别会员可参与';
        //		alert(title);
        $(".sucmodalname").find("span").html(title);
        $("#onebtn").show();
        $("#offerFeil").show();
    } else if (data.userData.point < data.detail.initPrice) {
        //		alert("您当前的账户积分未达到本次竞拍的起拍价");
        $(".sucmodalname").find("span").html("您当前的账户积分未达到本次竞拍的起拍价");
        $(".twobtn").show();
        $("#offerFeil").show();
    } else {
        console.log("点击跳转到竞拍出价页面");
        window.location.href = "PriceRecord.html";
    }
}

//出价记录
$(".listName").on("click", function() {
    window.location.href = "PriceList.html?auctionID=" + auctionID + "&token=" + token;
})

//免费报名
$("#signUpBtn").on("click", function() {
    window.location.href = "SignUp.html";
})


// 微信分享
var share = {
   "shareTitle": "竞拍中心",
   "shareDesc": "华熙会员中心",
   "shareLink":WX_URL+"weChat/HXauction/AuctionList.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share,userMes.signPackage);
