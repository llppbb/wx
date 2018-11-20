// 时间戳   加密
var tmp = Date.parse(new Date()).toString();
tmp = tmp.substr(0, 10);
var sign_tmp = "SDE45FHW6KL" + tmp;
var md5_sign_tmp = hex_md5(sign_tmp);
// 构造签名
function createSign(obj) {
    var tmp_ = Date.parse(new Date()).toString();
    var tmp = tmp_.substr(0, 10);
    var sign_tmp = "SDE45FHW6KL" + tmp;
    var dataArr = {
        "sign":hex_md5(sign_tmp),
        "timestamp":tmp
    }
    if (obj!='') {
        for(var i in obj) {
            dataArr[i] = obj[i];
        }
    }
    return dataArr;
}
//ajax请求

var fnAjax = function(sendUrl, sendDate, callback, errorCallback) {
    //ajax提交
    $.ajax({
        type: "post",
        url: sendUrl,
        data: sendDate,
        async: false,
        dataType: "json",
        success: function(data) {
            // console.log(data);
            if (callback) {
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
}
$.common_html = function(options) {
    return new common_html(options);
}
// 进入页面
var infor = function(obj, characteristicName, inforUrl) {
    $(obj).on("click", function() {
        var characteristic = $(this).attr("attr_name");
        var url = inforUrl + "&" + characteristicName + "=" + characteristic;
        location.href = url;
    });
}

/*领取规则*/
var getrulesFun = function() {
    function module(centen_wenzi, anniu_wenzi) {
        var tishikuang_html = "<div class='tishikuang_html' style='width: 90%;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.3rem;z-index:50'><div class='tanchuang_p' style='padding-bottom: 0.36rem;padding-top: 0.3rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' class='i_know' id='ikonw'>" + anniu_wenzi + "</div></div>";
        $("body").append(tishikuang_html);
    }

    var get_rules = '<p class="title_wenzi">领取规则</p>' +
        '<p style="margin-bottom:0.1rem !important">1.免费领取：一个买家持有同一个卖家的有效的优惠券的数量由卖家决定。如果其中一张过期或已被使用，则无法再使用，店铺优惠券无法转赠。</p>' +
        '<p> 2.积分兑换：买家可使用积分兑换优惠券，积分可由签到，APP分享，社区活跃等方式获得。</p>' +
        '<p class="title_wenzi">优惠券使用</p>' +
        '<p  style="margin-bottom:0.1rem !important">1.店铺优惠券仅限于当前发放的卖家店铺中购物使用;</p>' +
        '<p>2.一张店铺优惠券仅限于单笔订单消费抵用，不可拆分，过期即作废。</p>';

    show_mengceng();

    module(get_rules, "我知道了");
    setTimeout(function() {
        console.log($(".i_know"));
        $("#ikonw").on("click", function() {
            $(this).parent().remove();
            $(".dongtaimengceng").remove();
        })
    }, 100)
}
/*获取 地址栏参数*/
// var  Name  =  request('Name'); 
// var  ID  =  request('ID'); 
function  request(paras) {      
    var  url  =  location.href;       
    var  paraString  =  url.substring(url.indexOf("?") + 1, url.length).split("&");       
    var  paraObj  =   {};      
    for  (var  i = 0;  j = paraString[i];  i++) {           
        paraObj[j.substring(0, j.indexOf("=")).toLowerCase()]  =  j.substring(j.indexOf("=") + 1, j.length);       
    }       
    var  returnValue  =  paraObj[paras.toLowerCase()];      
    if (typeof(returnValue) == "undefined") {           
        return  "";       
    } else {           
        return  returnValue;       
    }  
}
/*显示蒙层 */
function show_mengceng() {
    var mengceng_html = "<div style='width: 100%;height: 100%;position: fixed;background: #000000;opacity: 0.7; left: 0px;top: 0px;z-index:40' class='dongtaimengceng'></div>";
    $("body").append(mengceng_html);
}
/*提示框*/
/*一个  按钮的  */
function onanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;' class='i_know'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}

function twoanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}
// 倒计时  提交页
(function(window, undefined) {    
    var TimeCountDown = function(container, params) {        
        if (!(this instanceof TimeCountDown)) return new TimeCountDown(container, params);                
        var defaults = {                
            endTime: '', //title
            startTime: '', //请传入ID，或DOM对象
            Lid: '',
            leftTitle: "", //左侧名称
            colonStat: false, //是否把小时分转换成 ：//关闭执行的回调函数 
            timeCallBack: null         
        }       
        params = params || {};       
        var originalParams = {};       
        for (var param in params) {                     
            if (typeof params[param] === 'object' && params[param] !== null && !(params[param].nodeType || params[param] === window || params[param] === document || (typeof Dom7 !== 'undefined' && params[param] instanceof Dom7) || (typeof jQuery !== 'undefined' && params[param] instanceof jQuery))) {                
                originalParams[param] = {};                
                for (var deepParam in params[param]) {                    
                    originalParams[param][deepParam] = params[param][deepParam];                
                }            
            }            
            else {                
                originalParams[param] = params[param];            
            }       
        }       
        for (var def in defaults) {            
            if (typeof params[def] === 'undefined') {                
                params[def] = defaults[def];            
            }            
            else if (typeof params[def] === 'object') {                
                for (var deepDef in defaults[def]) {                    
                    if (typeof params[def][deepDef] === 'undefined') {                        
                        params[def][deepDef] = defaults[def][deepDef];                    
                    }                
                }            
            }      
        }       
        var s = this;        
        s.params = params;        
        s.container = container;        
        s.currentBreakpoint = undefined;        
        s.calculateTime = function() {            
            var startTime = s.vert(this.params.startTime);                         
            var endTime = s.vert(this.params.endTime);            
            var time = endTime - startTime;  //时间差的毫秒数 ;                                        
            return time;        
        }        
        s.vert = function(time) {            
            if (typeof time == "undefined" || time == "") {                
                return false;            
            }            
            var strtime = (time).replace(/-/g, "/");            
            var date1 = new Date(strtime);            
            return parseInt(date1.getTime());                  
        }        
        s.nTime = s.calculateTime();        
        s.countdown();     
    };         
    TimeCountDown.prototype = {            
        countdown: function() {                    
            var interval = 1000; //毫秒                                                     
            var time;                    
            this.nTime = this.nTime - interval;                                      
            var leave1 = this.nTime; //计算天数后剩余的毫秒数                                 
            var t = Math.floor(Math.floor((leave1 / (3600 * 1000)) / 24));                    
            var hleave = this.nTime % ((24 * 3600 * 1000));                     //把剩余毫秒数转换为小时                                            
            var h = Math.floor(hleave / (3600 * 1000)) < 10 ? "0" + Math.floor(hleave / (3600 * 1000)) : Math.floor(hleave / (3600 * 1000));                     
            var leave2 = this.nTime % (3600 * 1000);        //计算小时数后剩余的毫秒数
                                 //把转换小时之后，剩余毫秒数转换为分钟
                                
            var m = Math.floor(leave2 / (60 * 1000)) < 10 ? "0" + Math.floor(leave2 / (60 * 1000)) : Math.floor(leave2 / (60 * 1000));                                          //把转换分钟之后，剩余毫秒数转换为秒
                                
            var leave3 = leave2 % (60 * 1000);      //计算分钟数后剩余的毫秒数
                                
            var s = Math.round(leave3 / 1000) < 10 ? "0" + Math.round(leave3 / 1000) : Math.round(leave3 / 1000);                                          
            if (!this.params.colonStat) {                        
                if (t == 0) {                            
                    //time = this.params.leftTitle + "<span>" + h + "</span><label>时</label><span>" + m + "</span><label>分</label><span>" + s + "</span><label>秒<label>";                                                     
                    time = this.params.leftTitle + "<span></span><label></label><span>" + m + "</span><label>分</label><span>" + s + "</span><label>秒<label>";                                                     
                } else {                                                         
                    time = this.params.leftTitle + "<span>" + t + "</span><label>天</label><span>" + h + "</span><label>时</label><span>" + m + "</span><label>分</label><span>" + s + "</span><label>秒<label>";                        
                }                                          
            } else {                            
                //time = this.params.leftTitle + "<span>" + h + "</span><label>:</label><span>" + m + "</span><label>:</label><span>" + s + "</span><label><label>";                                       
                time = this.params.leftTitle + "<span></span><label>:</label><span>" + m + "</span><label>:</label><span>" + s + "</span><label><label>";                                       
            }                                  
            var callBackTime = t + h + m + s;                                        
            document.querySelector("#" + this.container).innerHTML = time;                    
            if (callBackTime <= 0) { 
                // 当倒计时为  零 的时候
                //  alert("shijiandao");                          
                $("#queding_btn").html("重新购买");
                clearInterval(time_s);
                eval(this.params.timeCallBack);                    
                return false;                    
            }                    
            var that = this;                    
            var time_s = setTimeout(function() {                        
                that.countdown();                    
            }, interval);                           
        }    
    }    
    window.TimeCountDown = TimeCountDown;
})(window, undefined);

// 获取 当前时间 和 设置截止时间    提交页
function getNowFormatDate() {    
    var date = new Date();    
    var seperator1 = "-";    
    var seperator2 = ":";    
    var month = date.getMonth() + 1;    
    var strDate = date.getDate();    
    if (month >= 1 && month <= 9) {        
        month = "0" + month;    
    }    
    if (strDate >= 0 && strDate <= 9) {        
        strDate = "0" + strDate;    
    }   
    window.currentdate_start = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + date.getMinutes() + seperator2 + date.getSeconds();
    var end_fen = date.getMinutes() * 1 + 10;
    if (end_fen >= 60) {
        var end_fen_new = end_fen - 60;
        var getHours = date.getHours() * 1 + 1;
        window.currentdate_end = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + getHours + seperator2 + end_fen + seperator2 + date.getSeconds(); 
    }
    window.currentdate_end = date.getFullYear() + seperator1 + month + seperator1 + strDate + " " + date.getHours() + seperator2 + end_fen + seperator2 + date.getSeconds(); 
    //console.log(currentdate);
}


// 时间的 差值  判断是否 过期
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
    switch (diffType) {
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
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum))
}

/*显示蒙层 */
function show_mengceng1() {
    var mengceng_html = "<div class='track_matte' style='width: 100%;height: 100%;position: fixed;background: #000000;opacity: 0.7; left: 0px;top: 0px;z-index:40;display:none'></div>";
    $("body").append(mengceng_html);
}

function twoanniu1(centen_wenzi, anniu_wenziL, anniu_wenziR) {
    var tishikuang_html = "<div id='reminder' style='width: 90%;height: 2.2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-left: 0.1rem;padding-right: 0.1rem;padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div id='reminder_hide' style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenziL + "</div><div id='confirm' style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR + "</div></div>";
    $("body").append(tishikuang_html)
};

var reminder = function(centen, reminder_hide, confirm, callback) {
    var data = 0;
    show_mengceng1();
    twoanniu1(centen, reminder_hide, confirm);
    setTimeout(function() {
        $("#reminder_hide").on("click", function() {
            $(".track_matte").remove();
            $("#reminder").remove();
        });
        $("#confirm").on("click", function() {
            callback(data);
            $(".track_matte").remove();
            $("#reminder").remove();
        });
    }, 100)
};
show_mengceng1();
var reminder_ = function(obj, callback) {
    $(".track_matte").show();
    obj.show();
    $(".no").on("click", function() {
        $(".track_matte").hide();
        obj.hide();
    });
    var a = obj.find(".yes");
    a.on("click", function() {
        callback();
        $(".track_matte").hide();
        obj.hide();
    });
};

var reminder_zhuan = function(obj, callback) {
    $(".track_matte").show();
    obj.show();
    $(".no").on("click", function() {
        $(".track_matte").hide();
        obj.hide();
    });

};
//ajax请求
var fnAjax_ = function(sendUrl, sendDate, async_, callback, errorCallback) {
    //ajax提交
    $.ajax({
        type: "GET",
        url: sendUrl,
        async: async_,
        data: sendDate,
        dataType: "json",
        success:function(data) {
            if (callback) {
                callback(data);
            }
        },
        error: function(xhr, status, error) {
            if (xhr.status == "401") {
                alert("你不能进行这个操作！");
            } else if (xhr.status == "408") {
                alert("太久没有进行操作，请重新登录！");
            } else {
                alert("服务器繁忙，请稍后重试！");
            }
            if (errorCallback) {
                errorCallback()
            }
        }
    });
};

//进入抽奖页面
function infoSlyder() {
    var infoSlyder_html = '<div class="info_slyder">' +
        '<img src="weixin/shop/pic/enter.png" id="go_infoSlyder"/>' +
        '<img src="weixin/shop/pic/close.png" id="close_infoSlyder"/>' +
        '</div>';
    $(".wrap").append(infoSlyder_html);
    $(".info_slyder").css({
        "width": "0.7rem",
        "height": " 0.7rem",
        "position": "fixed",
        "right": "0.1rem",
        "top": "45%",
        "z-index": "100"
    })
    $("#go_infoSlyder").css({
        'width': '100%'
    })
    $("#close_infoSlyder").css({
        'position': 'absolute',
        'right': '0rem',
        'top': '-0.2rem',
        'z-index': '101',
        'width': '0.2rem',
        'height': '0.2rem'
    })
    $("#close_infoSlyder").on("click", function() {
        $(".info_slyder").hide();
    })
    $("#go_infoSlyder").on("click", function() {
        location.href = WX_URL + "user.php?slyder=1";
    })
}
<!--  免费次数用完  还需话费提示 -->
// 纯文字提示 自动消失
function fontShow(obj,message){
        obj.css({
            'border-radius':'.04rem',
            'background':'#000',
            'opacity':'.8',
            'position':'fixed',
            'padding':'.07rem .14rem',
            'top':'30%',
            'color':'#fff',
            'text-align':'center',
            'z-index':'100'
        })
        obj.find("p").html(message);
        var windowWidth = $(window).width();
        var tiShiBoxWidth = obj.innerWidth();
        var leftMargin = (windowWidth - tiShiBoxWidth) / 2;
        obj.css({
             "left": leftMargin + "px",
             'opacity':'0.7'
        })
        setTimeout(function() {
            obj.fadeOut(1000);
        }, 1500);
}

// 没有数据显示
function showNodata(imgurl,font){
	var html='<div class="nodata">'+
		'<img src="'+imgurl+'" />'+
		'<p>'+font+'</p>'+
	'</div>';
	$("body").append(html);
	$(".nodata img").css({
		'width': '90%',
		'display': 'block',
		'margin': '.8rem 0 .2rem 5%'
	})
	$(".nodata p").css({
		'text-align': 'center',
		'font-size': '.16rem',
		'color': 'rgb(51,51,51)'
	})
}
// 构造签名
function createSign(obj) {
    var tmp_ = Date.parse(new Date()).toString();
    var tmp = tmp_.substr(0, 10);
    var sign_tmp = "SDE45FHW6KL" + tmp;
    var dataArr = {
        "sign":hex_md5(sign_tmp),
        "timestamp":tmp
    }
    if (obj!='') {
        for(var i in obj) {
            dataArr[i] = obj[i];
        }
    }
    return dataArr;
}
