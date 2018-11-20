/*免费  和  领取完  提示*/
var mianfei_tishi = "<div class='mianfei_tishi'>免费</div>"
  //  $(".canyin_list_img").append(mianfei_tishi); $(".fuzhuang_list_img").append(mianfei_tishi);
var lingquwan_tishi = "<div class='lingquwan_mengceng_tishi'></div><img class='lingquwan_img_tishi' src='pic/icon_overdue.png'/>"
    //$(".fuzhuang_list_img").append(lingquwan_tishi);
var heng_jiaqian = "<div class='heng_jiaqian'></div>";
//$(".canyin_list_qian").append(heng_jiaqian);

function checkHasActivity(cityid){
    $.ajax({
        type: "post",
        url: WX_URL + 'requestAjax.php',
        async: false,
        dataType: "json",
        data: {
            "identity":"checkHasActivity",
            "cityId":cityid
        },
        success: function(data){
            console.log(data);
            if( parseInt(data.hasActivity) ==0){
                $(".head_zhuye").hide();
            }
        },
        error: function(res) {
            console.log(res)
        }
    });
}

function getProductTypeList(cityid){
    $.ajax({
        type: "post",
        url: COUPON_URL+"Home/Requestajax/getProductTypeListNew",
        async: false,
        dataType: "json",
        data: {
            "sign": md5_sign_tmp,
            "timestamp": tmp,
            "showCity": cityid
        },
        success: function(data){
            console.log(data);
            var tabhtml='';
            var ntype=0;
            $.each(data.result,function(i, k) {
                if(k.hasproduct!=0){
                    var tab_list_on="";
                    if(ntype==0){
                        console.log("diyici");
                        console.log(k);
                        tab_list_on="tab_list_on";
                        producttype=k.typeid;
                        ajax_common(k.typeid,1,cityid);
                    }
                    tabhtml+='<div class="tab_list '+tab_list_on+'" typeid='+k.typeid+'>'+k.typename+'</div>';
                    ntype++;
                }
            });
            var moreshow='<div class="tab_list" style="width:.55rem;"></div>';
            $(".tabsbox").append(tabhtml);
            $(".tabsbox").append(moreshow);
        },
        error: function() {
            console.log(error)
        }
    });
}

/*点击 全部商品 回到 主页 全部商品*/
$("#backall_btn").on("click", function() {
        location.href = WX_URL+"user.php?shop=1";
})

function ajax_common(producttype,pageNum,cityid) {
    $.ajax({
        type: "post",
        url: COUPON_URL+"Home/Requestajax/getGoodsListNew",
        async: false,
        dataType: "json",
        data: {
            "sign": md5_sign_tmp,
            "timestamp": tmp,
            "productType":producttype,
            "pageNum":pageNum,
            "showCity":cityid
        },
        success: function(data){
            console.log(data);
            var centen_html = "";
            var boxHtml = "";
            var newboxHtml = "";
            if(data.result.length==0){
               $(".dingdan").hide();
               $(".jifenNo").show();
               return false;
            }
            window.currentpagenew=data.currentpage;
            if(parseInt(data.currentpage) < parseInt(data.pagetotal)){
                 console.log("显示加载更多");
                 $(".morebtn").show();
            }else{
                console.log("隐藏示加载更多");
                $(".morebtn").hide();
            }
            $.each(data.result, function(i, k) {
                // 获取商品 类型
               var producttype = k.producttype;
                add_centenhtml(centen_html,k,i)
            })
        },
        error: function() {
            console.log(error)
        }
    });
}

function add_centenhtml(centen_html, m,l){

    var newname=m.productname;
    if(newname.length>18){
         newname=m.productname.slice(0,14)+"...";
    }
    centen_html += '<div class="canyin_list in_xiangqing_btn" attr_name="'+m.productid+'" onclick="infor_(this)">' +
        '<div class="canyin_list_border">' +
        '<div class="canyin_list_img mianfei_tishi'+m.exchangetype+'"><img src="' + m.productimage + '"/></div>' +
        '<div class="canyin_list_name">' + newname + '</div>';
    var yjpriceH='';
    if(m.orprice!=0){
        var yjpriceHfont=''
        if(m.exchangetype == 1) {
            yjpriceHfont="积分"
        }else if(m.exchangetype == 2){
          yjpriceHfont="元"
        }
        yjpriceH='<span class="yjprice">'+m.orprice+yjpriceHfont+'<span class="yjpriceH"></span></span>';
    }
    // 免费
    if(m.exchangetype == 0) {
        centen_html += '<div class="canyin_list_state">免费</div>' +
            '</div>' +
            '</div>';
         setTimeout(function(){
            //  console.log(l);
            //  console.log($(".canyin_list_img").length);
             $(".mianfei_tishi"+m.exchangetype).append(mianfei_tishi);
        },100)
        // 话费积分
    } else if(m.exchangetype == 1) {
        centen_html += '<div class="canyin_list_state">' + m.point + '积分'+yjpriceH+'</div>' +
            '</div>' +
            '</div>'
    }else if(m.exchangetype == 2){
      centen_html += '<div class="canyin_list_state">' + m.price + '元'+yjpriceH+'</div>' +
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

function infor_(obj){
    window.productid=$(obj).attr("attr_name");
    location.href = WX_URL+"user.php?xiangqing=1&productid="+productid;
}
