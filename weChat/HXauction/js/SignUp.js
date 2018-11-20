if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var userDataStorage = getStorage('userDataAuction');
console.log(userDataStorage);
$("#userName").html(userDataStorage.userName); //收货人
$("#userMobile").html(userDataStorage.userMobile); //手机号
//点击切换是否选中 同意协议
$(".imgtip").on("click", function() {
    var cli = $(this).attr("cli");
    console.log(cli);
    if (cli == "true") {
        $(this).attr("src", "Images/chb.png");
        $(this).attr("cli", "false");
    } else {
        $(this).attr("src", "Images/chb_pre.png");
        $(this).attr("cli", "true");
    }
})
//用户协议
$(".xieyi").on("click", function() {
    window.location.href = "SignUpArg.html";
})
//点击报名
$(".signbtn").on("click", function() {
    var checkedImg = $(".imgtip").attr("cli");
    if (checkedImg == "false") {
        $(".desText").html("竞拍需同意《竞拍协议》");
        $("#signUpFail").show();
    } else if (checkedImg == "true") {
        //报名
        signOn();
    }
})
//报名
function signOn() {
    var sendUrl = AUCTION_URL + 'sign_on.json';
    var auctionID = getStorage('auctionID');
    console.log(auctionID)
    var sendDate = {
        "token": userData.openId,
        "auctionID": auctionID,
        "uid": userData.uid
    };
    fnAjax(sendUrl, "post", false, JSON.stringify(sendDate), function(data) {
        if (parseInt(data.state) == 0) {
            $(".desText").html(data.message);
            if (data.message == "报名成功") {
                //是否关注公众号 false 没关注 true 关注
                if (userDataStorage.followship == false) {
                    //没有会员卡
                    $(".huodebg").show();
                } else {
                    if (data.message.indexOf("会员可参与") == -1) {
                        // 显示如何获取积分
                        $(".twobtn").show();
                    } else {
                        //报名成功
                        $("#onebtn").show();
                    }
                    $("#signUpSuc").show();
                }
            } else {
                //报名失败
                console.log("报名失败");
                $("#signUpFail").show();
            }
        } else {
            //报名失败
            console.log("报名失败");
            $(".desText").html(data.message);
            $("#signUpFail").show();
        }
    }, function(xhr, status, error_) {
        console.log(xhr, status, error_)
    })
}

//如何获取积分
function getPoint() {
    //进入如何获取积分页面
     window.location.href='../memberCard/pointrule.html';
}
//报名成功 跳转到 报名成功页面
function hideModalJump(obj) {
    $("#" + obj).fadeOut();
    window.location.href = "SuccessPage.html";
}

// 微信分享
var share = {
   "shareTitle": "竞拍中心",
   "shareDesc": "华熙会员中心",
   "shareLink":WX_URL+"weChat/HXauction/AuctionList.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share,userMes.signPackage);
