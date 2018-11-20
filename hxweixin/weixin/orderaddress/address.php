<?php
isset($_GET["orderNo"]) ? $orderno = $_GET['orderNo'] : die("订单号不能为空");
isset($_GET["uid"]) ? $uid = $_GET['uid'] : die("uid不能为空");
isset($_GET["name"]) ? $goodsname = base64_decode($_GET['name']) : die("商品名不能为空");
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta name="format-detection" content="telephone=no"/>
    <meta name="format-detection" content="email=no"/>
    <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" id="viewport" name="viewport">
    <title></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/font-awesome.css">
    <link rel="stylesheet" href="weixin/common/common.css">
    <style>
        .bianjidizhi{
            display: block;
        }
        .footer1{
            display: block;
        }
        .tishiColor::-webkit-input-placeholder{
            color: #E9054D ;
            font-family: "微软雅黑";
        }
        .tjdz-chenggong{
            width: 100%;
            height: 1.27rem;
            background:  #FFF3AE;
            text-align: center;
            margin-bottom: 0.1rem;
            padding-bottom: 0.285rem;
        }
        .cg-h3{
            margin-top: 0.33rem;
            font-size: 0.18rem;
            color: #333333;
            margin-bottom: 0.13rem;
            position: relative;
            padding-left: 0.2rem;
        }
        .cg-h3 span{
            display: inline-block;
            vertical-align: middle;
            width: 0.18rem;
            height: 0.18rem;
            position: absolute;
            left: 37%;
            top: 0.03rem;
        }
        .cg-h3 span img{
            width: 100%;
        }
        .tjdz-chenggong p{
            color: #333333;
            font-size: 0.14rem;
            line-height: 0.22rem;
        }
        .cg-span{
            font-size: 0.16rem;
            color: #E9054D;
            font-weight: bold;
        }
        .footer1{
            position: fixed;
            left: 0px;
            bottom: 0px;
        }
    </style>
</head>
<body>
<div class="wrap">
    <div class="tjdz-chenggong">
        <h3 class="cg-h3"><span><img src="weixin/orderaddress/pic/icon_sec.png"/></span>兑换成功</h3>
        <p>您已成功兑换<span class="cg-span"><?php echo $goodsname?></span>,为了让您及时收到礼品</p>
        <p>请填写收货地址</p>
    </div>
    <section class="section">
        <div class="bianjidizhi">
            <ul>
                <input type="hidden" id="orderNo" value="<?php echo $orderno;?>">
                <input type="hidden" id="uid" value="<?php echo $uid;?>">
                <li>收货人：<input type="text" id="receiverName" placeholder="请输入收货人姓名"/></li>
                <li>手机：<input type="number" id="receiverMobile" placeholder="请输入手机号"/></li>
                <li>详细地址：<input type="text" id="receiverAddress" placeholder="请输入详细地址信息"></li>
            </ul>
        </div>
    </section>
    <footer class="footer1">保存</footer>
</div>
<div class="shezhi_tishi">
    <P>设置成功</P>
</div>
<script src="weixin/common/jquery.js"></script>
<script src="weixin/common/fontSize.js"></script>
<script src="weixin/common/common.js"></script>
<script type="text/javascript" src="https://pingjs.qq.com/h5/stats.js" name="MTAH5" sid="500338441" ></script>
<script>
    var uid = $('#uid').val();
    var orderNo = $('#orderNo').val();
    $(".footer1").click(function () {
        var receiverName = $("#receiverName").val();
        var receiverMobile = $("#receiverMobile").val();
        var receiverAddress = $("#receiverAddress").val();
        if (receiverName == "" && receiverMobile == "" && receiverAddress == "") {
            tishi("请填写完整的信息！");
            return false;
        } else if (receiverName == '') {
            tishi("请填写收货人姓名！");
            return false;
        } else if(!(/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(receiverMobile))) {
            tishi("请填写正确的手机号！");
            return false;
        } else if (receiverAddress == '') {
            tishi("请填写收货地址！");
            return false;
        } else {
            var data = {
                'uid': uid,
                'orderNo': orderNo,
                'receiverName': receiverName,
                'receiverMobile': receiverMobile,
                'receiverAddress': receiverAddress,
                'identity':'editAddress'
            }
            $.post(WX_URL+'requestAjax.php', data, function(res) {
                var res = eval('(' + res + ')');
                if (res.state == 0) {
                    //跳转订单详情
                    location.href=WX_URL+"user.php?beiTaiOrderNo="+orderNo;
                } else {
                    tishi(res.message);return;
                }
            });
        }
    })
</script>
</body>
</html>
