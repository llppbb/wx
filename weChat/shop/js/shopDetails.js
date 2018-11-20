if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
}
var productid = getUrlParam("productid");
var mobile = userData.mobile;
var uid = userData.uid;
var false_ = true;
// 初始化页面
init(productid);

// 如果 false_ 为真的 时候 可以 点击   为 假的 的 时候  剩余 张数 不足
if (false_) {
    // 获取 个人 兑换 总数
    var userExchangeNum=getUserExchangeNum(uid,productid); //
    var now_exchangemaxnumber=userExchangeNum.exchangeMaxNumber;      // 单个用户最大兑换数
    var exchangenum=userExchangeNum.exchangenum;      // 单个用户最大兑换数
    $(".footer_btn").on("click", function() {
        if (mobile == 0) {
            no_bind_phone();
        } else {
            // 免费
            if (parseInt(exchangetype)  == 0) {
                //免费兑换
                exchangetype_free();
            } else if (parseInt(exchangetype) == 1) {
                //积分 兑换
                exchangetype_integral();
            } else if (parseInt(exchangetype) == 2) {
                // 花钱
                exchangetype_money();
            }
        }
    })
}

// 初始化页面
function init(productid) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/product_info_list.json?page=" + 1 + "&pageSize=4&productId=" + productid;
    fnAjax(sendUrl, "get", false, "", function(data) {
        var data = data.result.list[0];
        // 获取 已兑换 张数 要穿的  参数 项目 id
        window.productId = data.productId;
        window.producttype = data.productType;
        window.needrealname = data.needRealName;
        // 获取 最大 限定 张数
        window.exchangemaxnumber = data.exchangeMaxNumber;
        //console.log(data);
        exchangetype = data.exchangeType;
        // 添加 结构
        add_html(data);
        // 判断 是否 免费
        judge_money(data);
    }, function() {});
}
//页面结构
function add_html(data) {
    $("#header_img_src").attr("src", data.productImage);
    $("#product_id").html(data.productName);
    $("#title").html(data.productName);
    var surplusnumber = 0;
    if (data.surplusNumber == 0) {
        surplusnumber = "无货";
    } else if (data.surplusNumber > 0 && data.surplusNumber <= 10) {
        surplusnumber = "稀缺商品";
    } else if (data.surplusNumber > 10 && data.surplusNumber <= 50) {
        surplusnumber = "库存紧张";
    } else if (data.surplusNumber > 50) {
        surplusnumber = "库存充足";
    }
    $("#product_surplusnumber").html(surplusnumber);
    $("#product_productDesc").html(data.productDesc);
    $("#reminderText").html(data.reminderText);
    $("#address").html(data.address);
    $("#name").html(data.shopName);
    var phone_arr = data.phone.split(",");
    if (parseInt(data.productType) == 13) {
        $("#times").html("开始时间：");
        $("#product_enddate").html(data.startDate.slice(0,data.startDate.length-3));
    } else {
        $("#product_enddate").html(data.endDate.slice(0,data.endDate.length-3));
    }
    for (var i = 0; i < phone_arr.length; i++) {
        var phone_arr_html = '<div class="mobile_number">' +
            '<a href="tel:' + phone_arr[i] + '">' + phone_arr[i] + '</a>' +
            '</div>';
        $(phone_arr_html).insertBefore('.mobile_quxiao_btn')
    }
}

//判断剩余票数
function funSurplusnumber(surplusnumber) {
    // 判断 剩余 的 张数
    if (surplusnumber > 0) {
        //alert("剩余票数大于0可以兑换")
        $(".footer_btn").css({
            "background": "rgb(255, 221, 16)"
        });
    } else {
        false_ = false;
        return false;
    }
}
// 判断 商品 类型
function judge_money(data) {
    // 免费
    if (data.exchangeType == 0) {
        //  alert("maifei");
        $("#product_price").html("免费");
        $("#product_price").next().hide();
        funSurplusnumber(data.surplusNumber);
    }
    //积分
    else if (data.exchangeType == 1) {
        //alert("jifen");  积分 换
        $("#product_price").html(data.point);
        $(".footer_btn").html("积分兑换");
        funSurplusnumber(data.surplusNumber);
    }
    //花钱
    else if (data.exchangeType == 2) {
        $("#product_price").html(data.price);
        $("#product_price").next().html("元");
        $(".footer_btn").html("立即购买");
        funSurplusnumber(data.surplusNumber);
    }
}

//没有 绑定 手机
function no_bind_phone() {
    show_mengceng();
    $(".maskContent").show();
    var obj = $("#get_code");
    //获取验证码
    $("#get_code").on("click", function() {
        var mobile_number = $(".inp1").val();
        //alert("mobile"+mobile_number);
        getyzm(mobile_number, obj)
    })
    //绑定手机
    $("#queding_btn").on("click", function() {
        var mobile_number = $(".inp1").val();
        var mobile_number_peo = $(".inp2").val();
        var yzm = checkMobileAndSMSCode(mobile_number, mobile_number_peo);
        if (!yzm) {
            alert("验证码错误")
            return false;
        }
        var result = bindMobile(uid, mobile_number, mobile_number_peo);
        if (result.state != 0) {
            alert(result.message);
            return false;
        } else {
            alert('绑定成功！');
            $(".dongtaimengceng").remove();
            $(".maskContent").hide();
            window.location.reload();
        }
    })
}

// 免费 兑换
function exchangetype_free() {
    $("#product_price").html('免费');
    $("#product_price").next().hide();
    if (parseInt(exchangenum) >= parseInt(now_exchangemaxnumber) || (parseInt(exchangenum) + 1) > parseInt(now_exchangemaxnumber)) {
        //提示框
        show_mengceng();
        onanniu('此商品只能兑换' + now_exchangemaxnumber + '次，您的次数已用完', '知道了');
        i_konw_hide();
        // 可兑换
    } else {
        // 商品 免费时 创建 订单
        var sendData =JSON.stringify({
            "uid": uid,
            "productId": productid,
            "userMobile": mobile,
            "buyNumber":1
        });
        var orderData=createOrder(sendData);
        if (orderData.state == 0) {
            var orderNo=orderData.result.orderNo;
            location.href =  "changeSuccess.html?shangxun_orderNo=" + orderNo;
        } else {
            alert("创建订单失败！");
            return false;
        }
    }
}

//  积分  兑换
function exchangetype_integral() {
    // 不可兑换
    if (getUserExchangeNum * 1 > exchangemaxnumber * 1) {
        show_mengceng();
        if (needrealname == 1) {
            onanniu('该场次每个用户限购' + exchangemaxnumber + '张', '确定');
        } else {
            onanniu('此商品只能兑换' + exchangemaxnumber + '次，您的次数已用完', '知道了');
        }
        i_konw_hide();
        // 可兑换
    } else {
        // 获取个人积分 userPoint(uid)
        judge_point(userPoint(uid));
    }
}

// 判断 积分是否 充足
function judge_point(point) {
    var product_price = $("#product_price").html();
    if (point < product_price) {
        //alert("积分不足");
        show_mengceng();
        onanniu('抱歉，您的积分不足', '知道了');
        i_konw_hide();
    } else {
        if (needrealname == 1) {
            // 需要填写实名制信息
            location.href = "createOrderNeedName.html?productid=" + productid;
        } else {
            // 不需要填写实名制信息
            location.href =  "createOrder.html?productid=" + productid;
        }
    }
}

//付款
function exchangetype_money() {
    if (parseInt(exchangenum) >= parseInt(now_exchangemaxnumber) || (parseInt(exchangenum) + 1) > parseInt(now_exchangemaxnumber)) {
        //提示框
        show_mengceng();
        if (needrealname == 1) {
            onanniu('该场次每个用户限购' + exchangemaxnumber + '张', '确定');
        } else {
            onanniu('此商品只能兑换' + exchangemaxnumber + '次，您的次数已用完', '知道了');
        }
        i_konw_hide();
        // 可兑换
    } else {
        if (needrealname == 1) {
            location.href = "createOrderNeedName.html?productid=" + productid;
        } else {
            location.href = "createOrder.html?productid=" + productid;
        }
    }
}

//  绑定手机 弹窗 点击  取消
$("#quxiao_btn").on("click", function() {
    $(".inp1").val("");
    $(".inp2").val("");
    $(".maskContent").hide();
    $(".dongtaimengceng").remove();
})

// 已兑换次数 超过 最大兑换数  提示框
function i_konw_hide() {
    setTimeout(function() {
        console.log($(".i_konw"));
        $(".i_konw").on("click", function() {
            $(this).parent().remove();
            $(".dongtaimengceng").remove();
        })
    }, 1000);
}

//设置头图的样式
var W = $("#header_img_src").width();
var H = (W / 1.05);

$("#header_img_src").css("height", H + "px");
var HH = $("#header_img_src").height();

if (W == 320) {
    $("#header_img_src").css("height", 304 + "px");
    var HH1 = $("#header_img_src").height();
}

$("#mobile_btn").on('click', function() {
    //alert(3);
    show_mengceng();
    $(".mobile_html").css({
        "bottom": "0.1rem",
        "transition": " bottom 0.5s",
        "-moz-transition": " bottom 0.5s",
        /* Firefox 4 */
        "-webkit-transition": "bottom 0.5s",
        /* Safari 和 Chrome */
        "-o-transition": " bottom 0.5s",
    })
})
$(".mobile_quxiao_btn").on("click", function() {
    $(".mobile_html").css({
        "bottom": "-5rem",
        "transition": " bottom 0.5s",
        "-moz-transition": " bottom 0.5s",
        /* Firefox 4 */
        "-webkit-transition": "bottom 0.5s",
        /* Safari 和 Chrome */
        "-o-transition": " bottom 0.5s",
    })
    $(".dongtaimengceng").remove();
})

// 回到首页
// goHomeBtn("body");
$("#back_shop").css('bottom', '0.6rem');












$(function() {
    $(".maskContent").css({
        "display": "none"
    });
    list = $(document).height();
    $(".mask").css({
        "height": list
    })
})

// 倒计时
function time_dao() {
    let times = 60;
    window.tt = window.setInterval(function() {
        times = times - 1;
        console.log(times);
        $(".yanzhengma").val(times);
        $(".yanzhengma").attr("disabled", true);
        if (times <= 0) {
            window.clearInterval(tt);
            $(".yanzhengma").attr("disabled", false);
            $(".yanzhengma").val("点击重新发送");
        }
    }, 1000);
}

/*显示蒙层 */
function show_mengceng() {
    var mengceng_html = "<div  class='dongtaimengceng'  style='width: 100%;height: 100%;position: fixed;background: #000000;opacity: 0.5; left: 0px;top: 0px;z-index:40'></div>";
    $("body").append(mengceng_html);
}
/*各种提示框*/
/*一个  按钮*/
function onanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div style='z-index:99; width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div class='i_konw' style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}

//onanniu("阿斯顿发送到", 'anniu_wenzi');
function twoanniu(centen_wenzi, anniu_zuo_wenzi, anniu_you_wenzi) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div class='i_konw' style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_zuo_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_you_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}
/*点击 电话 图标  显示拨打电话号*/
