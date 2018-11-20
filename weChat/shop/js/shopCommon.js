// 商品 免费时 创建 订单
function createOrder(sendData) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/createOrder.json";
    var newData='';
    // 免费商品时 创建订单
    fnAjax(sendUrl, "post", false, sendData, function(data) {
            newData=data;
    }, function(error){newData=false; console.log(error)});
    return newData;
}

// 获取 个人 兑换 总数 用于 创建订单前校验
function getUserExchangeNum(uid,productid) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/user_exchange_quantity.json";
    var sendData = {
        "uid": uid,
        "productId": productid
    };
    var newData="";
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        newData=data.result;
        // //已购买总数
        // window.buytotalnumber = data.result.buyTotalNumber;
        // //目前剩余总数
        // window.now_surplusnumber = data.result.surplusNumber;
        // //单个用户最大兑换数
        // window.now_exchangemaxnumber = data.result.exchangeMaxNumber
        ;
        // //用户历史购买数量
        // window.exchangenum = data.result.exchangeNum;
        //alert(exchangenum);
    }, function(error) {newData=false; console.log(error)})
    return newData;
}

//获取 个人积分
function userPoint(uid) {
    var point = "";
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/userPoint.json';
    var sendData = {
        'uid': uid
    }
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        point = data.result.point;
    }, function() {});
    return point;
}

// 获取签名
function getWXPaySign(orderNo,openid) {
    var signData = "";
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/wxPay.json';
    var sendData = {
        "orderNo": orderNo,
        "openid":openid
    }
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        signData = data.result ;
    }, function() {});
    return signData;
}
function parkingPay(data,orderNo,productId) {
    if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', jsApiCall);
            document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
        }
    } else {
        jsApiCall(data,orderNo,productId);
    }
};

//调用微信JS api 支付
function jsApiCall(data,orderNo,productId) {
    WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        data,
        function(res) {
            // alert(res.err_msg);
            WeixinJSBridge.log(res.err_msg);
            // alert(res.err_code + res.err_desc + res.err_msg);
            // 使用以上方式判断前端返回,微信团队郑重提示：
            // res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            if (res.err_msg == "get_brand_wcpay_request:ok") {
                // 支付成功
                // alert("支付成功");
                // alert(orderNo);
                // alert("changeSuccess.html?shangxun_orderNo="+orderNo);
                window.location.href="changeSuccess.html?shangxun_orderNo="+orderNo;
                // alert(3333333)
            } else { // 支付失败 注:get_brand_wcpay_request:cancel或者get_brand_wcpay_request:fail可以统一处理为用户遇到错误或者主动放弃，不必细化区分
                // alert("支付失败");
                window.location.href="changeFail.html?productId="+productId;
            }
        }
    );
}
// 实名制商品须填写 收货地址
// http://app.dev.huaxiweiying.com/HXXCServiceWeChat/product/get_address.json?uid=2015828284104
function getAddress(uid){
    var newData = "";
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/get_address.json';
    var sendData = {
        "uid": uid
    }
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        newData = data.result;
    }, function() {});
    return newData;
}
