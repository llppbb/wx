// 获取产品列表
function getlist() {
    var data = {
        "sign": md5_sign_tmp,
        "timestamp": tmp
    };
    var sendUrl = COUPON_URL+"Home/Requestajax/getWebPrizeList";
    fnAjax_(sendUrl, data, false, function(data) {
        getnameList(data);
        if (data.result.prizeTypeList.length != 0) {
            $(".wrap").show();
            console.log(data);
            raffleid = data.result.raffleid;
            // 添加页面上死数据
            addHtml(data.result,data.result.prizeTypeList);

            //  添加 滑动数据
            addSwiperInfo(data.result.typeInfo);
        } else {
            $("html").css("background","rgb(244, 244, 244)");
            $("body").css("background","rgb(244, 244, 244)");
            $(".noData").show();
        }

    }, null);
}

//添加结构
function addHtml(data,arr) {
    console.log(data);
    var state = "进行中";
    $(".start_time p").html("开始时间：" + data.startdate);
    $(".end_time p").html("结束时间：" + data.enddate);
    if (data.status != 0) {
        state = "结束";
    }
    $(".state_").html(state);
    $(".centenIntroduce p").html(data.raffledesc);
    $("#point").html(data.point);
    // 渲染奖品列表
    $.each(arr, function(i, k) {
        $(".luck-unit-" + i).html('<span><img src=' + k.imageurl + ' /></span>' + "<div class='tbBg'></div>");
        //$(".luck-unit-" + i).html('<span>' + k.prizename + '</span>' + "<div class='tbBg'></div>");
        $(".luck-unit-" + i).attr("_id", k.typeid);
        $(".luck-unit-" + i).attr("prizeid", k.prizeid);
        $(".luck-unit-" + i).attr("prizetype", k.prizetype);
        $(".luck-unit-" + i).attr("productid", k.productid);
    });
}

//添加滑动结构 递归
function addSwiperInfo(arr) {
    var html = "";
    if (arr.length <= 3) {
        $.each(arr, function(i, k) {
            html += '<div class="prizeIntroduce_list">' +
                '<div class="prize">' + k.typename + '</div>' +
                '<div class="number">' + k.prizenum + '</div>' +
                '<div class="img"><img src='+k.prizeimage+' /></div>'+
                '<div class="money">' + k.prizename + '</div>' +
                '</div>';
        })
        var html_ = '<div class="swiper-slide">' + html + '</div>';
        $(".swiper-wrapper").append(html_);
    } else {
        var infoHtml = "";
        for (var i = 0; i < 3; i++) {
            var infoHtml_ = arr.shift();
            infoHtml += '<div class="prizeIntroduce_list">' +
                '<div class="prize">' + infoHtml_.typename + '</div>' +
                '<div class="number">' + infoHtml_.prizenum + '</div>' +
                ' <div class="img"><img src='+infoHtml_.prizeimage+' /></div>'+
                '<div class="money">' + infoHtml_.prizename + '</div>' +
                '</div>';
        }
        var html_ = '<div class="swiper-slide">' + infoHtml + '</div>';
        $(".swiper-wrapper").append(html_);
        addSwiperInfo(arr);
    }
}
// 滑动的 效果
var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    slidesPerView: 1,
    paginationClickable: true,
    spaceBetween: 0,
    freeMode: false
});

 //获取 中奖名单
 function getnameList(data) {
     var arr_=data.result.winnerList;
     console.log(arr_);
     var jiangListHtml="";
     if(arr_.length<4){
         $("#jiangList").css("top","0px");
         $("#con ul").pause();//暂停动画
         clearInterval(scrtime);
     }
     $.each(arr_, function(i, k) {
         jiangListHtml+='<li>'+k.mobile+' 抽中 '+k.prizename+'</li>';
     });
    $("#jiangList").html(jiangListHtml);
 }
