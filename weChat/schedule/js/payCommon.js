// 下单
function placeOrder(uid, orderNo, buyerNumber, ticketType, receiverMobile, receiverAddress, receiverName, viewers, useRule, deliverType, openId) {
    var data = {
        'uid': uid,
        'orderNo': orderNo,
        'buyerNumber': buyerNumber,
        'ticketType': ticketType,
        'receiverMobile': receiverMobile,
        'receiverAddress': receiverAddress,
        'receiverName': receiverName,
        'viewers': viewers,
        'useRule': useRule,
        "deliverType":deliverType
    };
    var sendUrl = APP_URL + 'HXXCServiceWeChat/ticket/placeOrder.json';
    var sendData = JSON.stringify(data)
    fnAjax(sendUrl, "post", false, sendData, function(data) {
        if (data.state == 1) {
            $("#foo").hide();
            tishinew(data.message.trim());
            $(".zhifuBtn").attr("click", "true");
            $(".zhifuBtn ").css('background', '#FFDD10');
            return false;
        } else {
            setTimeout(function() {
                //   支付
                WXPayApi(uid, orderNo, openId,"pay")
            }, 1000)
            // return false;
        }
    }, function(res) {
        console.log(res)
    });
}

// 获取支付签名
function WXPayApi(uid, orderNo, openId,falg) {
     var sendUrl=APP_URL + 'HXXCServiceWeChat/ticket/weChatPayApi.json';
     var sendData= {
		 'uid': uid,
		 'orderNo': orderNo,
		 'openId': openId
	 }
   fnAjax(sendUrl,"get",false,sendData,function(data){
	   if (data.state == 0) {
   		// 支付
   		if (typeof WeixinJSBridge == "undefined") {
   			if (document.addEventListener) {
   				document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
   			} else if (document.attachEvent) {
   				document.attachEvent('WeixinJSBridgeReady', jsApiCall);
   				document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
   			}
   		} else {
   			WeixinJSBridge.invoke(
   				'getBrandWCPayRequest', data.result,
   				function(res) {
					alert(res.err_msg);
   					WeixinJSBridge.log(res.err_msg);
   					// 支付成功
   					if (res.err_msg == "get_brand_wcpay_request:ok") {
   						window.location.href = "paySuccess.html?&orderNo=" + orderNo;
   					}
   					// 支付过程中用户取消 (支付失败 get_brand_wcpay_request:fail) 注:get_brand_wcpay_request:cancel或者get_brand_wcpay_request:fail可以统一处理为用户遇到错误或者主动放弃，不必细化区分
   					if (res.err_msg == "get_brand_wcpay_request:cancel") {
   						window.location.href ="payFail.html";
   					}
   				}
   			);
   		}
   	} else {
   		tishinew(data.message);
         if(falg=="pay"){
             $(".zhifuBtn").attr("click", "true");
             $(".zhifuBtn ").css('background', '#FFDD10');
             $("#foo").hide();
         }
   	}
   },function(error){console.log(error)})
}

//获取票夹详情
function getTicketOrderDetail(uid, orderNo) {
    var returnData='';
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/ticketFolderDetail.json";
    var sendData = {
        'uid': uid,
        'orderNo': orderNo
    };
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        if (data.state == 0) {
         returnData=data.result;
        }else{
              returnData=false;
        }
    }, function(error) {
         returnData=false;
        console.log(error)
    })
    return  returnData;
}
