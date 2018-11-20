//弹窗  输入

function twoanniu(centen_wenzi, anniu_wenzi, anniu_wenziR) {
    var tishikuang_html = "<div style='width: 90%;height: 2.1rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'>" +
        "<div style='padding-bottom: 0.1rem;padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "<div style='margin:0.2rem 0 ;width: 80%;height: 0.4rem;border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);'><input  val='' type='text' style='width:100%;height:100%;margin-left:10%;padding-left:.1rem;font-size:.15rem;color:rgb(128,128,128)' placeholder='请填写车牌号' /></div></div>" +

        "<div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;border:1px solid rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div>" +

        "<div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR + "</div></div>";
    $("body").append(tishikuang_html)
}

// 添加轮播图
function raffleImg(raffleImgArr) {
    $(".img_gallery").show();
    console.log(raffleImgArr);
    var imgHtml = '';
    var pointHtml = '';
    if (raffleImgArr.length == 1) {
        $(".img_gallery").html('<a href=' + raffleImgArr[0].link + ' ><img src=' + raffleImgArr[0].url + ' /></a>')
    } else {
        $.each(raffleImgArr, function(i, k) {
            imgHtml += '<li><a href=' + k.link + ' ><span><img src=' + k.url + ' /></span></a></li>';
            pointHtml += '<a href="#">' + i + '</a>';
        });
        $(".point").html(pointHtml);
        $("#img_box").html(imgHtml);
    }
    setTimeout(function() {
        var pointW = $(".point").width();
        $(".point").css("margin-left", "-" + pointW / 2 + "px");
    }, 10)
}

//ajax请求
var fnAjaxParking = function(sendType,sendUrl,senAsync,sendDate, callback, errorCallback) {
    //ajax提交
    $.ajax({
        type: sendType,
        url: sendUrl,
        data: sendDate,
        async:senAsync,
        dataType: "json",
        success: function(data) {
            if (callback) {
                console.log("--------"+sendDate.identity+"--------");
                console.log(sendDate);
                console.log(data);
                console.log("\n");
                callback(data);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.status == "401") {
                alert("你不能进行这个操作！");
            } else if (xhr.status == "408") {
                alert("太久没有进行操作，请重新登录！");
            } else {
                alert("服务器开小差了，请过一会在试。");
            }
            if (errorCallback) {
                errorCallback(error)
            }
        }
    });
};

// var sendUrl=WX_URL + 'requestAjax.php';
// var sendDate={
//     uid: uid,
//     carNum: carNum,
//     cityid: cityid,
//     identity: "getCostInfo"
// };
// fnAjaxParking ('post',sendUrl,false,sendDate, function(data){
//       if(data.state==0){
//
//       }
//   }, function(data){
//       console.log(data);
//   });
