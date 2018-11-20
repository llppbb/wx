/*获取 地址栏参数*/
var  Name  =  request('Name'); 
var  ID  =  request('ID'); 
Name  =  decodeURI(Name);
console.log(Name);
console.log(ID);

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
var fnAjax = function(sendUrl, sendDate, callback, errorCallback) {
    //ajax提交
    $.ajax({
        type: "GET",
        url: sendUrl,
        data: sendDate,
        dataType: "json",
        success: function(data) {
            console.log(data);
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
var common_html=function(options){
    console.log(options);
    //定义默认参数
    var defailtOption={
            value:0.5
    }
    //扩展默认参数
    var settings=$.extend(defailtOption,options);   
    //创建页面
    var context="<div class='box'>测试创建页面</div>";
    console.log(settings.el)
    settings.el.html(context);
}
$.common_html=function(options){
        return new common_html(options);
}
