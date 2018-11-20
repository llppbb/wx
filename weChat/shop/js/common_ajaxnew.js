/*免费  和  领取完  提示*/
var mianfei_tishi = "<div class='mianfei_tishi'>免费</div>"
//  $(".canyin_list_img").append(mianfei_tishi); $(".fuzhuang_list_img").append(mianfei_tishi);
var lingquwan_tishi = "<div class='lingquwan_mengceng_tishi'></div><img class='lingquwan_img_tishi' src='pic/icon_overdue.png'/>"
//$(".fuzhuang_list_img").append(lingquwan_tishi);
var heng_jiaqian = "<div class='heng_jiaqian'></div>";
//$(".canyin_list_qian").append(heng_jiaqian);
// 判断是否有拍品活动
function checkHasActivity(cityid) {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/has_activity.json';
    var sendDate = {
        "cityId": cityid
    };
    fnAjax(sendUrl, "get", false, sendDate, function(data) {
        if (data.state == 0) {
            if (parseInt(data.hasActivity) == 0) {
                $(".head_zhuye").hide();
            }
        }
    }, function(data) {
        console.log(data);
    });
}
// 获取全部商品类型    java
function getProductTypeList(cityid) {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/typeList.json';
    var sendDate = {};
    fnAjax(sendUrl, "get", false, sendDate, function(data) {
        if (data.state == 0) {
            var tabhtml = '';
            var ntype = 0;
            $.each(data.result, function(i, k) {
                if (k.hasProduct != 0) {
                    var tab_list_on = "";
                    if (ntype == 0) {
                        tab_list_on = "tab_list_on";
                        producttype = k.typeId;
                        ajax_common(k.typeId, 1, cityid);
                    }
                    tabhtml += '<div class="tab_list ' + tab_list_on + '" typeid=' + k.typeId + '>' + k.typeName + '</div>';
                    ntype++;
                }
            });
            var moreshow = '<div class="tab_list" style="width:.55rem;"></div>';
            $(".tabsbox").append(tabhtml);
            $(".tabsbox").append(moreshow);
        }
    }, function(data) {
        console.log(data);
    });
}

/*点击 全部商品 回到 主页 全部商品*/
$("#backall_btn").on("click", function() {
    location.href = "shopAll.html";
})

function ajax_common(producttype, pageNum, cityid) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/product_info_list.json?page=" + parseInt(pageNum) + "&pageSize=4&showCity=" + parseInt(cityid) + "&productType=" + producttype;
    fnAjax(sendUrl, "get", false, "", function(data) {
        var centen_html = "";
        var boxHtml = "";
        var newboxHtml = "";
        if (data.result.list.length == 0) {
            $(".dingdan").hide();
            $(".jifenNo").show();
            return false;
        }
        window.currentpagenew = data.result.page;
        if (parseInt(data.result.page) < parseInt(data.result.pages)) {
            console.log("显示加载更多");
            $(".morebtn").show();
        } else {
            console.log("隐藏示加载更多");
            $(".morebtn").hide();
        }
        $.each(data.result.list, function(i, k) {
            // 获取商品 类型
            var producttype = k.productType;
            add_centenhtml(centen_html, k, i)
        })
    }, function() {});
}

function add_centenhtml(centen_html, m, l) {
    var newname = m.productName;
    if (newname.length > 18) {
        newname = m.productName.slice(0, 14) + "...";
    }
    centen_html += '<div class="canyin_list in_xiangqing_btn" attr_name="' + m.productId + '" onclick="infor_(this)">' +
        '<div class="canyin_list_border">' +
        '<div class="canyin_list_img mianfei_tishi' + m.exchangeType + '"><img src="' + m.productImage + '"/></div>' +
        '<div class="canyin_list_name">' + newname + '</div>';
    var yjpriceH = '';
    if (m.orPrice != 0) {
        var yjpriceHfont = ''
        if (m.exchangeType == 1) {
            yjpriceHfont = "积分"
        } else if (m.exchangeType == 2) {
            yjpriceHfont = "元"
        }
        yjpriceH = '<span class="yjprice">' + m.orPrice + yjpriceHfont + '<span class="yjpriceH"></span></span>';
    }
    // 免费
    if (m.exchangeType == 0) {
        centen_html += '<div class="canyin_list_state">免费</div>' +
            '</div>' +
            '</div>';
        setTimeout(function() {
            //  console.log(l);
            //  console.log($(".canyin_list_img").length);
            $(".mianfei_tishi" + m.exchangeType).append(mianfei_tishi);
        }, 100)
        // 话费积分
    } else if (m.exchangeType == 1) {
        centen_html += '<div class="canyin_list_state">' + m.point + '积分' + yjpriceH + '</div>' +
            '</div>' +
            '</div>'
    } else if (m.exchangeType == 2) {
        centen_html += '<div class="canyin_list_state">' + m.price + '元' + yjpriceH + '</div>' +
            '</div>' +
            '</div>'
    }
    $(".productbox").append(centen_html);
}

/*控制 状态条  (免费   钱+金币、积分)*/
function posL(name) {
    var centen_img_list_state_w = $(name).innerWidth();
    var centen_img_list_w = $(".centen_img_list").innerWidth();
    var posL = (centen_img_list_w - centen_img_list_state_w) / 2;
    //alert(name);
    $(name).css({
        "left": posL
    })
};
posL(".centen_img_list_state_mianfei");
posL(".centen_img_list_state_fufei");

function infor_(obj) {
    window.productid = $(obj).attr("attr_name");
    location.href ="/weChat/shop/shopDetails.html?productid=" + productid;
}
