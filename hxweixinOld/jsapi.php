<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>微信支付</title>
    <script src="/weixin/common/jquery.js"></script>
    <script src="/weixin/common/md5.js"></script>
    <script src="/weixin/common/common.js?v=311"></script>
    <script type="text/javascript">
        var orderNo = '<?php echo $orderNo?>';
        var productId = '<?php echo $productId?>';
        var buyNumber = '<?php echo $res['buyNumber']?>';
        // 非正常购买流程到此页面,直接跳到商品列表页
        window.onpageshow = function(event) {
            if (event.persisted) {
                window.location.href=WX_URL+"user.php?shop";
            }
        };
        //调用微信JS api 支付
        function jsApiCall()
        {
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest',
                <?php echo $jsApiParameters; ?>,
                function(res){
                    WeixinJSBridge.log(res.err_msg);
                    // alert(res.err_code+res.err_desc+res.err_msg);
                    // 使用以上方式判断前端返回,微信团队郑重提示：
                    // res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                    if(res.err_msg == "get_brand_wcpay_request:ok") {
                        // 支付成功
                        window.location.href=WX_URL+"user.php?duihuan_success=1&shangxun_orderNo="+orderNo;
                    } else { // 支付失败 注:get_brand_wcpay_request:cancel或者get_brand_wcpay_request:fail可以统一处理为用户遇到错误或者主动放弃，不必细化区分
                        window.location.href=WX_URL+"user.php?duihuan_fail=1&productId="+productId;
                    }
                }
            );
        }

        window.onload = function() {
            if (typeof WeixinJSBridge == "undefined"){
                if( document.addEventListener ){
                    document.addEventListener('WeixinJSBridgeReady', jsApiCall, false);
                }else if (document.attachEvent){
                    document.attachEvent('WeixinJSBridgeReady', jsApiCall);
                    document.attachEvent('onWeixinJSBridgeReady', jsApiCall);
                }
            }else{
                jsApiCall();
            }
        };

    </script>
</head>
<body>
</body>
</html>
