/*免费  和  领取完  提示*/
var mianfei_tishi = "<div class='mianfei_tishi'>免费</div>"
  //  $(".canyin_list_img").append(mianfei_tishi); $(".fuzhuang_list_img").append(mianfei_tishi);
var lingquwan_tishi = "<div class='lingquwan_mengceng_tishi'></div><img class='lingquwan_img_tishi' src='pic/icon_overdue.png'/>"
    //$(".fuzhuang_list_img").append(lingquwan_tishi);
var heng_jiaqian = "<div class='heng_jiaqian'></div>";
//$(".canyin_list_qian").append(heng_jiaqian);


/*点击 全部商品 回到 主页 全部商品*/
$("#backall_btn").on("click", function() {
        location.href = WX_URL+"user.php?shop=1";
})

function add_boxhtml(boxHtml,k){
    boxHtml+='<div class="canyin" id="typeid'+k.producttype+'">'+
        '<div class="canyin_top more_Btn" attr_name="typeid'+k.producttype+'" onclick="more_(this)">'+
          '  <div class="canyin_top_left">'+k.typename+'</div>'+
           '<div class="canyin_top_right">更多'+
                '<div class="jianhao"><img src="weixin/shop/pic/gengduo.png" /></div>'+
          '  </div>'+
        '</div>'+
    '</div>';
    return boxHtml;
}

function ajax_common(type) {
    $.ajax({
        type: "post",
        url: COUPON_URL+"Home/Requestajax/getGoodsList",
        async: false,
        dataType: "json",
        data: {
            "sign": md5_sign_tmp,
            "timestamp": tmp
        },
        success: function(data){
            console.log(data);
            var centen_html = "";
            var boxHtml = "";
            var newboxHtml = "";
            var moreHtml="";
            if(data.result.length==0){
               $(".nodata").show();
               return false;
            }
            $.each(data.result, function(i, k) {
              //进入更多
              moreHtml+='<div class="tab_canyin typeid'+k.producttype+'" attr_type="typeid'+k.producttype+'">'+
                    '<p>'+k.typename+'</p>'+
                  '</div>';
                // 获取商品 类型
            var producttype = k.producttype;
             newboxHtml+=add_boxhtml(boxHtml,k);
             setTimeout(function(){
                all_function(producttype, data.result[i].list, centen_html,type);
                },10)
            })
            //console.log(newboxHtml);
            $(".section").append(newboxHtml);
            $("#head_box").append(moreHtml);



        },
        error: function() {
            console.log(error)
        }
    });
}
// 全部的 函数
function all_function(producttype, arr, centen_html,type) {
      $.each(arr, function(l, m) {
          console.log(type);
          if(type=="all"){
              if(l>3){
                  return false;
              }
          }
          add_centenhtml(centen_html, m,l);
      })
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
    // 免费

    if(m.exchangetype == 0) {
        centen_html += '<div class="canyin_list_state">免费</div>' +
            '</div>' +
            '</div>';
         setTimeout(function(){
             console.log(l);
             console.log($(".canyin_list_img").length);
             $(".mianfei_tishi"+m.exchangetype).append(mianfei_tishi);
        },100)

        // 话费积分
    } else if(m.exchangetype == 1) {
        centen_html += '<div class="canyin_list_state">' + m.point + '积分</div>' +
            '</div>' +
            '</div>'
    }else if(m.exchangetype == 2){
      centen_html += '<div class="canyin_list_state">' + m.price + '元</div>' +
          '</div>' +
          '</div>'
    }
    $("#typeid"+m.producttype).append(centen_html);
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

function more_(obj){
  var producttype=$(obj).attr("attr_name");
  location.href = WX_URL+"user.php?canyin=1&producttype="+producttype;
}
