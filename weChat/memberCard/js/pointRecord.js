var bodyH = $(".tabBox").height();
$(".listBox").css({
    "margin-top": bodyH + 10 + "px"
});
if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var uid = userData.uid;
var state_ = getUrlParam("state");
var page = "1";
var type = "daily";
getPointChangeHistory(type, page, type, "tab");
var borw = $(".tabbotList").eq(0).width();
$(".borbot").css({
    "width": borw + "px"
})
if (state_ == "used") {
    $("#used").html("已用积分");
}
// 点击切换  tab
$(".tabbotList").on("click", function() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    type = $(this).attr("typedata");
    page = 1;
    var lengthLi = $(this).attr('sizeli');
    var index = $(this).index();
    //  console.log(index);
    $(".borbot").css({
        "left": borw * index + "px"
    });
    //  if(lengthLi==0){
    //      // 显示暂无记录
    //     //  $(".bigbox").hide();
    //      $(".listBox").hide();
    //      $(".nodata").show();
    //      return false;
    //  }else{
    //  $(".bigbox").show();
    $(".nodata").hide();
    $(".listBox").hide();
    $("#box" + type).show();
    getPointChangeHistory(type, "1", type, "tab");
    // }
})

$(".morebtn").on("click", function() {
    if ($(this).hasClass('ccc')) {
        return false;
    } else {
        $(this).addClass('ccc');
        page = parseInt(page) + 1;
        console.log(page);
        getPointChangeHistory(type, page, type, "more");
    }
})

// 添加结构
// goHomeBtn("body");
// http://app.dev.huaxiweiying.com/HXXCServiceWeChat/user/require_user_point_detail?data={%22uid%22:%222028699748758%22,%22page%22:1,%22pageSize%22:10,%22type%22:%22daily%22}
// 积分记录列表  getPointChangeHistory     uid
function getPointChangeHistory(type, page, box, htmlstate) {
    var sendData = JSON.stringify({
        "uid": uid,
        "page": page,
        "type": type,
        "pageSize": 20
    });
    var sendUrl = APP_URL + "HXXCServiceWeChat/user/require_user_point_detail?data=" + sendData;
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        if (data.state == 0) {
            addHtml(type, data, box, htmlstate);
        } else {}
    }, function() {
        console.log("请求错误！")
    })
}

//   添加页面 结构  改数据
function addHtml(type, data, box, htmlstate) {
    //   总积分
    $(".allpoint").html(data.result.point);
    // 积分记录 列表
    var listhtml = '';
    var tabi = "";
    if (data.result.list.length == 0 && data.result.page == 1) {
        tabi = 0;
        // $(".bigbox").hide();
        $(".listBox").hide();
        $(".nodata").show();
        return false;
    } else {
        $.each(data.result.list, function(i, k) {
            tabi = i;
            var colorstate = "stateG";
            var pointnew = k.point;
            var display_ = 'style="display:flex"';
            if (parseInt(k.status) == 1) {
                colorstate = "stateR";
                if (parseInt(k.point) == 0) {
                    pointnew = "-" + k.point;
                }
            } else if (parseInt(k.status) == 0) {
                if (state_ == "used") {
                    display_ = 'style="display:none"';
                }
                pointnew = "+" + k.point;
            }
            listhtml += '<li ' + display_ + '>' +
                '<div>' +
                '<p class="desc">' + k.desc + '</p>' +
                '<p class="time">' + k.addTime + '</p>' +
                '</div>' +
                '<div class="point ' + colorstate + '">' + pointnew + '</div>' +
                '</li>';
        });
    }
    $(".morebtn").removeClass('ccc');
    if (parseInt(tabi) > 18) {
        console.log("还有下一页")
        $("#box" + box).find(".morebtn").show();
    } else {
        console.log("没有下一页")
        $("#box" + box).find(".morebtn").hide();
    }
    if (htmlstate == "tab") {
        console.log("tab")
        $("#box" + box).find("ul").html(listhtml);
        $("#tab" + box).attr("sizeli", tabi + 1);
        $("#tab" + box).attr("page", data.result.page);
    } else {
        console.log("more")
        $("#box" + box).find("ul").append(listhtml);
    }
}


// 微信分享
var share = {
    "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
    "shareDesc": "花钱有积分，积分当钱花！",
    "shareLink": WX_URL + "weChat/memberCard/membercardNew.html",
    "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);

getUserPointDJ(uid);
/**
 * 获取会员卡等级
 */

function getUserPointDJ(uid) {
    var point = "";
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/userPoint';
    var sendData = {
        'uid': uid
    };
    fnAjax(sendUrl, "get", false, sendData, function(res) {
        var icon_img = '';
        if (res.result.memberName == "普卡") {
            icon_img = "";
        } else if (res.result.memberName == "银卡") {
            icon_img = "<img class='icon_img' src='pic/img_silver.png'/>";
        } else if (res.result.memberName == "金卡") {
            icon_img = "<img class='icon_img' src='pic/img_gold.png'/>";
        } else if (res.result.memberName == "黑卡") {
            icon_img = "<img class='icon_img' src='pic/img_black.png'/>";
        } else if (res.result.memberName == "钻石卡") {
            icon_img = "<img class='icon_img' src='pic/img_diamond.png'/>";
        };
        $(".cartype").html(icon_img);
    }, function(error) {
        console.log(error)
    })

    return point;
}
