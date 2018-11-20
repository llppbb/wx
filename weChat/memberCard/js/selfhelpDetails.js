if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}

var id_ = getUrlParam("id");
var uid = userData.uid;
var sendDate = JSON.stringify({
    "uid": uid,
    "id": id_
});
var sendUrl = APP_URL + "HXXCServiceWeChat/shopping/getRecordDetail";
fnAjax(sendUrl, "post", false, sendDate, function(data) {
    var font = '';
    var className = '';
    var dot = ''
    if (data.result.status == 0) {
        font = "审核中";
        className = "stateR";
    } else if (data.result.status == 1) {
        font = "已完成";
        className = "stateG";
    } else {
        className = "stateR";
        font = "审核失败";
        var des = "失败原因：" + data.result.deleteStatus;
        $(".errordescribe").show();
        $(".errordescribe").html(des);
    }
    $("#addtime").html(timestampToTime(data.result.addTime, "y-m-d"));
    $("#state").html(font);
    $("#state").addClass(className);
    $("#point").html(data.result.point);
    $("#money").html(data.result.amount);
    $(".imgBox img").attr("src", data.result.imgUrl);
}, function() {})

goHomeBtn("body");
