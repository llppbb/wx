/*获取 地址栏参数*/
var  Name  =  request('Name'); 
var  ID  =  request('ID'); 
Name  =  decodeURI(Name);
// 时间戳   加密
var tmp = Date.parse( new Date() ).toString();
tmp = tmp.substr(0,10);
var sign_tmp="SDE45FHW6KL"+tmp;
var md5_sign_tmp=hex_md5(sign_tmp);
//ajax请求

function  request(paras) {      
    var  url  =  location.href;       
    var  paraString  =  url.substring(url.indexOf("?") + 1, url.length).split("&");       
    var  paraObj  =   {};      
    for (var  i = 0;  j = paraString[i];  i++) {           
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()]  =  j.substring(j.indexOf("=") + 1, j.length);       
    }       
    var  returnValue  =  paraObj[paras.toLowerCase()];      
    if(typeof(returnValue) == "undefined") {           
        return  "";       
    } else {           
        return  returnValue;       
    }  
}
// 进入页面
    var infor=function(obj,characteristicName,inforUrl){
         $(obj).on("click",function(){
            var characteristic=$(this).attr("attr_name");
             var url= inforUrl+"&"+characteristicName+"="+characteristic;
             location.href =url;
         });
    }

    /*领取规则*/
    var getrulesFun=function(){
      function module(centen_wenzi,anniu_wenzi){
       var tishikuang_html = "<div class='tishikuang_html' style='width: 90%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.3rem;z-index:50'><div class='tanchuang_p' style='padding-bottom: 0.36rem;padding-top: 0.3rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>"+centen_wenzi+"</div><div style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' class='i_know' id='ikonw'>"+anniu_wenzi+"</div></div>";
       $("body").append(tishikuang_html);
      }

      var get_rules='<p class="title_wenzi">领取规则</p>'+
       '<p style="margin-bottom:0.1rem !important">1.免费领取：一个买家持有同一个卖家的有效的优惠券的数量由卖家决定。如果其中一张过期或已被使用，则无法再使用，店铺优惠券无法转赠。</p>'+
       '<p> 2.积分兑换：买家可使用积分兑换优惠券，积分可由签到，APP分享，社区活跃等方式获得。</p>'+
       '<p class="title_wenzi">优惠券使用</p>'+
       '<p  style="margin-bottom:0.1rem !important">1.店铺优惠券仅限于当前发放的卖家店铺中购物使用;</p>'+
       '<p>2.一张店铺优惠券仅限于单笔订单消费抵用，不可拆分，过期即作废。</p>';

       show_mengceng();

       module(get_rules,"我知道了");
       setTimeout(function(){
           console.log($(".i_know"));
           $("#ikonw").on("click",function() {
           $(this).parent().remove();
           $(".dongtaimengceng").remove();
          })
    },100)
}
/*显示蒙层 */
function show_mengceng() {
    var mengceng_html = "<div style='width: 100%;height: 100%;position: fixed;background: #000000;opacity: 0.7; left: 0px;top: 0px;z-index:40'></div>";
    $("body").append(mengceng_html);
}
/*各种提示框*/
/*一个  按钮的  */
function onanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}

function twoanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}

// 获取系统时间
function getNowFormatDate() {    
    var date = new Date();    
    var seperator1 = "-";    
    var seperator2 = ":";    
    var month = date.getMonth() + 1;    
    var strDate = date.getDate();    
    if(month >= 1 && month <= 9) {        
        month = "0" + month;    
    }    
    if(strDate >= 0 && strDate <= 9) {        
        strDate = "0" + strDate;    
    }    
    return window.currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate  + " " + date.getHours() + seperator2 + date.getMinutes()             + seperator2 + date.getSeconds();   
}

// GetDateDiff("2010-10-11 00:00:00","2010-10-11 00:01:40", "minute")//是计算秒数
// var cha=parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
//console.log(time_yu);

// 时间的 差值
function GetDateDiff(startTime, endTime, diffType) {
    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
    startTime = startTime.replace(/-/g, "/");
    endTime = endTime.replace(/-/g, "/");
    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    var sTime = new Date(startTime); //开始时间
    var eTime = new Date(endTime); //结束时间
    //作为除数的数字
    var divNum = 1;
    switch(diffType) {
        case "second":
            divNum = 1000;
            break;
        case "minute":
            divNum = 1000 * 60;
            break;
        case "hour":
            divNum = 1000 * 3600;
            break;
        case "day":
            divNum = 1000 * 3600 * 24;
            break;
        default:
            break;
    }
    window.time_yu = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum))
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));

}
//ajax请求
var fnAjax = function(sendUrl, sendDate, async, callback, errorCallback) {
    //ajax提交
    $.ajax({
        type: "GET",
        url: sendUrl,
        async: async,
        data: sendDate,
        dataType: "json",
        success: function(data) {
            if(callback) {
                callback(data);
            }
        },
        error: function(xhr, status, error) {
            if(xhr.status == "401") {
                alert("你不能进行这个操作！");
            } else if(xhr.status == "408") {
                alert("太久没有进行操作，请重新登录！");
            } else {
                alert("服务器开小差了，请过一会在试。");
            }
            if(errorCallback) {
                errorCallback()
            }
        }
    });
};

//构造函数 创建页面
var common_html = function(options) {
    console.log(options);
    //定义默认参数
    var defailtOption = {
            value: 0.5
        }
        //扩展默认参数
    var settings = $.extend(defailtOption, options);
    //创建页面
    var context = "<div class='box'>测试创建页面</div>";
    console.log(settings.el)
    settings.el.html(context);
}
$.common_html = function(options) {
    return new common_html(options);
}

/*显示蒙层 */
function show_mengceng1() {
    var mengceng_html = "<div id='track_matte' style='width: 100%;height: 100%;position: fixed;background: #000000;opacity: 0.7; left: 0px;top: 0px;z-index:40'></div>";
    $("body").append(mengceng_html);
}

function twoanniu1(centen_wenzi, anniu_wenziL, anniu_wenziR) {
    var tishikuang_html = "<div id='reminder' style='width: 90%;height: 2.2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-left: 0.1rem;padding-right: 0.1rem;padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div id='reminder_hide' style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenziL + "</div><div id='confirm' style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR + "</div></div>";
    $("body").append(tishikuang_html)
};

var reminder = function(centen,reminder_hide,confirm,callback) {
    var data = 0;
    show_mengceng1();
    twoanniu1(centen, reminder_hide, confirm);
    setTimeout(function() {
        $("#reminder_hide").on("click", function() {
            $("#track_matte").remove();
            $("#reminder").remove();
        });
        $("#confirm").on("click", function() {
            callback(data);
            $("#track_matte").remove();
            $("#reminder").remove();
        });
    }, 100)
};

var reminder_ = function(callback) {
    show_mengceng1();
    $(".jifenneed").show();
    setTimeout(function() {
        $(".jifenneed_no").on("click", function() {
            $("#track_matte").remove();
            $(".jifenneed").hide();
        });
        $(".jifenneed_yes").on("click", function() {
            callback();
            $("#track_matte").remove();
            $(".jifenneed").hide();
        });
    }, 100)
};



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
