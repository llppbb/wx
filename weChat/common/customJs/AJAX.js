// 构造传递的参数  之前函数名 createSign
// sign true:需要签名 | false:不需要签名
// obj 传入对象
// var cityinfo= {
//  	           "cityId":cityid
//               };
// var data = createSendData(true,cityinfo);
// 返回结果为
//      {
//       "sign": hex_md5(sign_tmp),
//         "timestamp": tmp,
//         "cityId":cityid
//     }

function createSendData(sign, obj) {
    var tmp_ = Date.parse(new Date()).toString();
    var tmp = tmp_.substr(0, 10);
    var sign_tmp = coupon_sign + tmp;
    var dataArr = {};
    if (sign == true) {
        dataArr = {
            "sign": hex_md5(sign_tmp),
            "timestamp": tmp
        }
    }
    if (obj != '') {
        for (var i in obj) {
            dataArr[i] = obj[i];
        }
    }
    return dataArr;
}

/**
 * ajax请求
 * sendUrl 请求地址
 * sendType 请求方式  get|post
 * sendMode 请求同步异步  false:同步|true:异步
 * sendDate 请求参数
 * callback 成功回调函数
 */
// var sendUrl=WX_URL + 'requestAjax.php';
// var sendDate={
//     'uid': uid,
//     'carNum': carNum,
//     'cityid': cityid,
//     'identity': "getCostInfo"
// };
// fnAjax (sendUrl, sendType, sendMode, sendDate, function(data){
//       if(data.state==0){
//
//       }
//   }, function(data){
//       console.log(data);
//   });
var fnAjax = function(sendUrl, sendType, sendMode, sendData, callback, errorCallback) {
    $.ajax({
        url: sendUrl,
        type: sendType,
        data: sendData,
        async: sendMode,
        contentType: 'application/json',
        dataType: "json",
        success: function(data) {
            console.log("请求成功地址：" + sendUrl);
            console.log(sendData);
            console.log(data);
            console.log('\n');
            if (callback) {
                callback(data);
            }
        },
        error: function(xhr, status, error) {
            console.log("请求失败地址：" + sendUrl);
            console.log(sendData);
            console.log(xhr);
            console.log('\n');
            if (xhr.status == "401") {
                console.log("你不能进行这个操作！");
            } else if (xhr.status == "408") {
                console.log("太久没有进行操作，请重新登录！");
            } else {
                console.log("服务器开小差了，请过一会在试。");
            }
            if (errorCallback) {
                errorCallback()
            }
        }
    });
};
/**
 *获取地址栏参数
 */
function getUrlParam(paras) {
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
        return  decodeURI(returnValue);       
    }  
}
//存储
function setStorage(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
//取值
function getStorage(key) {
    var newVal = JSON.parse(localStorage.getItem(key));
    var getStorageType = '';
    if (newVal == null) {
        console.log("meiyou key");
        getStorageType = false;
    } else {
        getStorageType = JSON.parse(localStorage.getItem(key));
    }
    return getStorageType;
}
//localStorage删除指定键对应的值
function deleteItem(keyName) {
    localStorage.removeItem(keyName);
}
//key val
//setStorage('a' ,'1234');
//var a = getStorage('a', 1000000);
//{usable: true, val: "1234"}
