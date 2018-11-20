<?php
/*
 * 统一入口
 * return
 */
require_once __DIR__ . '/Wxapi.php';

try {
    $tools = new WxApi();



    /*********************************userinfo start***************************/
    if (isset($_SESSION['openid'])) {
        $openid = $_SESSION['openid'];
    } else {
        $openid = $tools->getOpenid();
    }

    $access_token = $tools->getAccessToken($openid);
    $userWxInfo = $tools->getWxUserInfo($access_token, $openid);
    $unionid = json_decode($userWxInfo, true)['unionid'];
    $json = $tools->getByOpenid($openid, $unionid);
    $userInfo = json_decode($json, true);
    if (!isset($userInfo['state']) || $userInfo['state'] != 0) {
        throw new Exception("根据openid,unionid获取用户资料----错误----" . $json);
        echo "<script>alert('未知错误，请重试！');</script>";
        exit;
    }
    $uid = $userInfo['result']['uid'];
    $mobile = $userInfo['result']['mobile']?:0;
    $lastLocation = json_encode($tools->getLastLocation($openid));
    $sessionLocation = $_SESSION["location_".$openid];
    if ( !empty($sessionLocation) && $sessionLocation['expire'] > time() ) {
        $sessionLocation = json_encode($_SESSION["location_".$openid]);
    } else {
        $_SESSION["location_".$openid] = null;
        $sessionLocation = 'false';
    }

    $queryStr = $_GET;
    unset($queryStr['openid']);
    extract($queryStr);
    /*********************************userinfo end*****************************/



    // 手机号加星号显示
    $showMobile = $mobile?(substr($mobile, 0, 3).'****'.substr($mobile, 7, 10)):'';



    /*********************************jsapi start******************************/
    $signPackage = $tools->getSignPackage();
    $timestamp = $signPackage["timestamp"];
    $nonceStr = $signPackage["nonceStr"];
    $signature = $signPackage["signature"];
    $jsapi = $tools->formatResponse($signPackage,"false");
    /*********************************jsapi end********************************/



    /*********************************无卡用户强制领卡 start*********************/
    // 获取默认会员卡
    $res = $tools->getDefaultCardId();
    // 查询用户会员卡信息
    $obj = $tools->getUserCardInfo($openid, $res['cardId']);
    if (!isset($queryStr['ticketList']) && !isset($queryStr['ticketDetail'])) {
        if (json_decode($obj)->hasCard == 0) {
            $api_ticket = $tools->getApiTicket();
            $cardSignature = $tools->getCardSign($timestamp, $api_ticket, $nonceStr, $res['cardId']);
            include_once __DIR__ . '/weixin/membercardNew/membercenter.html';
            exit;
        }
    }
    /*********************************无卡用户强制领卡 end***********************/



    /*********************************积分、金币 start**************************/
    if (isset($queryStr['userPoint'])) { // 积分页面
        include_once __DIR__ . '/weixin/jifen/index.html';
        exit;
    // } elseif (isset($queryStr['userGold'])) { // 金币页面
    //     include_once __DIR__ . '/weixin/jinbi/index.html';
    //     exit;
    // } elseif (isset($queryStr['recharge'])) { // 金币充值
    //     include_once __DIR__ . '/weixin/jinbichongzhi/index.html';
    //     exit;
    // } elseif (isset($queryStr['goldRecharge'])) { // 签名，拉起支付
    //     if (time()-$timestamp > 60) { // 支付超时时间 秒
    //         echo "<script>alert('操作超时，请重试！');window.location.href='".WX_URL."user.php?recharge=1';</script>";
    //         exit;
    //     }
    //     $outTradeNo = $tools->getOutTradeNo($uid, $sign, $timestamp);
    //     $money = $tools->getPrice($sign, $timestamp);
    //     if (!$outTradeNo || !$money) {
    //         echo "<script>alert('订单异常，请重试！');window.location.href='".WX_URL."user.php?recharge=1';</script>";
    //         exit;
    //     }
    //     require_once __DIR__ . '/pay/lib/WxPay.Api.php';
    //     require_once __DIR__ . '/pay/api/WxPay.JsApiPay.php';
    //     require_once __DIR__ . '/pay/api/log.php';
    //     // 初始化日志
    //     $logHandler = new CLogFileHandler(__DIR__ . '/pay/logs/'.date('Y-m-d').'.log');
    //     $log = Log::Init($logHandler, 15);
    //     $JsApiPay = new JsApiPay();
    //     $data = array();
    //     $data['goods_detail']['goods_id'] = 'coins_'.$money*100;
    //     $data['goods_detail']['goods_name'] = '金币'.$money*100;
    //     $data['goods_detail']['quantity'] = 1;
    //     $data['goods_detail']['price'] = $money*100;
    //     $data = json_encode($data);
    //
    //     $detail = '<![CDATA['.$data.']]>';
    //     $input = new WxPayUnifiedOrder();
    //     $input->SetBody('华熙微影-金币充值');
    //     $input->SetAttach('金币充值');
    //     $input->SetOut_trade_no($outTradeNo);
    //     $input->SetTotal_fee($money*100);
    //     // $input->SetDetail($detail);
    //     $input->SetTime_start(date('YmdHis'));
    //     $input->SetTime_expire(date('YmdHis', time() + 600)); // 支付过期时间 秒
    //     $input->SetGoods_tag('coin');
    //     $input->SetNotify_url('http://' . $_SERVER['HTTP_HOST'] . '/pay/api/notify.php');
    //     $input->SetTrade_type('JSAPI');
    //     $input->SetOpenid($openid);
    //     $order = WxPayApi::unifiedOrder($input);
    //     $jsApiParameters = $JsApiPay->GetJsApiParameters($order);
    //     $tools->mLog("组织好的支付签名串---->" . $jsApiParameters . PHP_EOL);
    //     include __DIR__ . '/pay/pay.html';
    //     exit;
    // } elseif (isset($queryStr['chargeLog'])) { // 充值记录
    //     $orderStatus = 1;// 0待付款 1已付款
    //     $chargeList = $tools->getUserChargeLog($uid, $orderStatus);
    //     include_once __DIR__ . '/weixin/chargelog/index.html';
    //     exit;
    // } elseif (isset($queryStr['exchange'])) { // 积分换金币
    //     include_once __DIR__ . '/weixin/jinbichongzhi-duihuan/index.html';
    //     exit;
    /*********************************积分、金币 end****************************/



    /********************************竞猜、贝泰 start***************************/
    // } elseif (isset($queryStr['guessing'])) { // 竞猜
    //     $result = $tools->redis->get(REDIS_SHAKE_KEY . $uid);
    //     if (!$result) { // 判断是否赠送过200金币
    //         $tools->wechatRegister($uid);
    //     }
    //     $channel = 'wechat';
    //     $res = $tools->getBeiTaiMarketURL($uid, $channel);
    //     $urlArr = json_decode($res, true);
    //     $url = $urlArr['result']['main_page_url'];
    //     header('Location:' . $url . '&Source=hxwy_wechat');
    //     exit;
    // } elseif (isset($queryStr['beiTaiMall'])) { // 贝泰商城
    //     $channel = 'wechat';
    //     $res = $tools->getBeiTaiMarketURL($uid, $channel);
    //     $urlInfo = json_decode($res, true);
    //     if ($urlInfo['state'] != 0) {
    //         echo "<script>alert('未获取到商城URL，请重试！');history.go(-1);</script>";
    //     } else {
    //         $url = $urlInfo['result']['mall_url'];
    //         header('Location:' . $url . '&Source=hxwy_wechat');
    //     }
    //     exit;
    // } elseif (isset($queryStr['orderList'])) { // 贝泰订单列表
    //     $orderList = $tools->getBeiTaiOrderList($uid);
    //     include_once __DIR__ . '/weixin/mydingdan/index.html';
    //     exit;
    // } elseif (isset($queryStr['beiTaiOrderNo'])) { // 贝泰订单详情
    //     $orderList = $tools->getBeiTaiOrderList($uid);
    //     $orderDetail = '';
    //     foreach ($orderList as $k => $v) {
    //         if ($v['beiTaiOrderNo'] == $queryStr['beiTaiOrderNo']) {
    //             $orderDetail = $v;
    //         }
    //     }
    //     if (isset($queryStr['editAddress'])) {
    //         include_once __DIR__ . '/weixin/orderaddress/editAddress.html';
    //         exit;
    //     }
    //     if (empty($orderDetail['giftType'])) {
    //         //实物订单详情
    //         include __DIR__ . '/weixin/dingdanxiangqing-material/index.html';
    //         exit;
    //     } elseif ($orderDetail['giftType'] == 1) {
    //         //虚拟订单详情
    //         include_once __DIR__ . '/weixin/dingdanxiangqing-virtual/index.html';
    //         exit;
    //     }
    /********************************竞猜、贝泰 end*****************************/



    /********************************一手票 start*******************************/
    } elseif (array_key_exists('ticketDetail', $queryStr)) { // 一手票项目详情
        // $sql = "select * from t_ticket_program_manage_detail where programId=$queryStr[ticketDetail]";
        // $rs = $tools->dbh->query($sql);
        // $ticketdetail = $rs->fetchAll(PDO::FETCH_CLASS);
        // $ticketdetail = (array)$ticketdetail[0];
        // $showlabels = explode(',', $ticketdetail['showLabel']);
        // $showlabel = '';
        // if (in_array("无标识", $showlabels)) {
        //     $showlabel = '';
        // } else {
        //     foreach ($showlabels as $v) {
        //         $showlabel .= "<div>" . $v . "</div>";
        //     }
        // }
        // $sql = "select * from t_ticket_program_manage where publishStatus=1 and programId=$queryStr[ticketDetail]";
        // $rs = $tools->dbh->query($sql);
        // $ticket = $rs->fetchAll(PDO::FETCH_CLASS);
        // $ticket = (array)$ticket[0];
        // $tools->mLog("获取一手票项目详情---->" . json_encode($ticketdetail) . PHP_EOL);
        include_once __DIR__ . '/weixin/buyticket/ticketDetail.html';
        exit;
    } elseif (array_key_exists('onlineID', $queryStr)) { // 一手票场次价格
        $schedulePriceInfo = $tools->getSchedulePriceInfo($onlineID);
        // if (false === $schedulePriceInfo) {
        //     echo "<script>alert('未获取到场次价格，请重试！');history.go(-1);</script>";
        //     exit;
        // }
        if($canChooseSeat==1){
            // 选座
            include_once __DIR__ . '/weixin/schedule/constituency.html';
        }else{
            include_once __DIR__ . '/weixin/schedule/Selfhelp.html';
        }
        exit;
    } elseif (array_key_exists('selectedseats', $queryStr)) { // 一手票 选座
        include_once __DIR__ . '/weixin/schedule/selectedseats.html';
        exit;
    } elseif (array_key_exists('ticketList', $queryStr)) { // 一手票项目列表
        // $sql = "select a.programId,a.showTitle,a.posterImage,a.showDate,a.showVenue,a.showPrice,a.status,a.sequence,a.modifyTime,b.status as bstatus from t_ticket_program_manage as a left join t_ticket_program as b on a.programId=b.programId where a.publishStatus=1 and b.status=0 and b.activeStatus=0 order by a.sequence DESC,a.modifyTime DESC";
        // $rs = $tools->dbh->query($sql);
        // $ticketlist = $rs->fetchAll(PDO::FETCH_CLASS);
        // $tools->mLog("获取一手票项目列表---->" . json_encode($ticketlist) . PHP_EOL);
        include_once __DIR__ . '/weixin/buyticket/ticketList.html';
        exit;
    } elseif (array_key_exists('placeOrder', $queryStr)) { // 一手票下单
        // 查询锁座信息
        $lockInfo = $tools->getLockInfo($uid, $orderNo);
        if (false == $lockInfo) {
            echo "<script>window.location.href='".WX_URL.DIRPATH."user.php?ticketDetail=$programId';</script>";
            exit;
        }
        // 获取用户默认地址
        $addressList = $tools->getAddressList($uid);
        $defaultAddress = [];
        if (!empty($aid)) {
            foreach ($addressList as $v) {
                if ($v['id'] == $aid) {
                    $defaultAddress = $v;
                    break;
                }
            }
        } else {
            foreach ($addressList as $v) {
                if ($v['defaultValue'] == 1) {
                    $defaultAddress = $v;
                    break;
                }
            }
        }

        // 获取用户实名制信息列表
        $peiSongRealNameList = [];//定义空列表
        if (!empty($contacts)) {
            $ids = explode(',', $contacts);

            $res = $tools->getRealNameList($uid);
            $realNameList = (false === $res)?'':$res;
            foreach ($ids as $v) {
                foreach ($realNameList as $v1) {
                    if ($v == $v1['id']) {
                        $peiSongRealNameList[] = $v1;
                    }
                }
            }
        }
        include_once __DIR__ . '/weixin/schedule/zhifu.html';
        exit;
    } elseif (array_key_exists('orderNoPay', $queryStr)) { // 一手票调用支付接口，拉起支付
       include __DIR__ . '/weixin/schedule/zhifuContinue.html';
    } elseif (array_key_exists('paySuccess', $queryStr)) { // 一手票支付成功页面
        $orderdetail = $tools->getTicketOrderDetail($uid, $paySuccess);
        include_once __DIR__ . '/weixin/schedule/paySuccess.html';
        exit;
    } elseif (array_key_exists('cbaOrderList', $queryStr)) { // 一手票订单列表
        $orderlist = $tools->getTicketOrderList($uid);
        $timer = time();
        foreach ($orderlist['result'] as $k => $v) {
            $orderlist['result'][$k]['surplus'] = $v['payExpTime'] - $timer;
        }
        include_once __DIR__ . '/weixin/cbaorder/index.html';
        exit;
    } elseif (array_key_exists('CBAOrderDetail', $queryStr)) { // 一手票订单详情
        $orderdetail = $tools->getTicketOrderDetail($uid, $orderNo);
        $uri = $tools->createQrCode("1234567890123456987");
        include_once __DIR__ . '/weixin/cbaorder/CBAOrderDetail.html';
        exit;
    } elseif (array_key_exists('addressList', $queryStr)) { // 一手票收货地址列表
        $res = $tools->getAddressList($uid);
        $addresslist = (false === $res)?'':$res;
        if (array_key_exists('chooseAddress', $queryStr)) { // 选择一手票收货地址
           include_once __DIR__ . '/weixin/addresslist/chooseAddress.html';
            exit;
        } elseif (array_key_exists('addOrEditTicketAddress', $queryStr)) {
            $addressInfo = [];
            if ($queryStr['addOrEditTicketAddress'] == 'edit') { // 编辑一手票收货地址
                foreach ($addresslist as $v) {
                    if ($v['id'] == $queryStr['aid']) {
                        $addressInfo = $v;
                    }
                }
                $title = "编辑收货地址";
            } elseif ($queryStr['addOrEditTicketAddress'] == 'add') { // 增加一手票收货地址
                $title = "增加收货地址";
            }
            include_once __DIR__ . '/weixin/addresslist/addOrEditTicketAddress.html';
            exit;
        }
        include_once __DIR__ . '/weixin/addresslist/addressList.html';
        exit;
    } elseif (array_key_exists('realNameList', $queryStr)) { // 一手票实名制列表
        if (array_key_exists('addRealName', $queryStr)) { // 增加一手票实名制信息
            include_once __DIR__ . '/weixin/realname/addRealName.html';
            exit;
        }
        $res = $tools->getRealNameList($uid);
        $realnamelist = (false === $res)?'':$res;
        if (array_key_exists('chooseRealName', $queryStr)) { // 选择一手票实名制信息
            // 查询锁座信息
            $lockInfo = $tools->getLockInfo($uid, $orderNo);
            include_once __DIR__ . '/weixin/realname/chooseRealName.html';
            exit;
        }
        include_once __DIR__ . '/weixin/realname/realNameList.html';
        exit;
    } elseif (array_key_exists('ticketFolder', $queryStr)) { // 电子票夹 开始
        $jsonData = $tools->getTicketFolderList($uid);
        include_once __DIR__ . '/weixin/ticketfolder/ticketstart.html';
        exit;
    } elseif (array_key_exists('test', $queryStr)) { // 电子票夹 开始
        $jsonData = $tools->getTicketFolderList($uid);
        include_once __DIR__ . '/weixin/ticketfolder/test.html';
        exit;
    } elseif (array_key_exists('ticketend', $queryStr)) { // 电子票夹 结束
        $jsonData = $tools->getTicketFolderList($uid);
        include_once __DIR__ . '/weixin/ticketfolder/ticketend.html';
        exit;
    }elseif (array_key_exists('ticketListmessage', $queryStr)) { // 票夹 列表
        $jsonData = $tools->getTicketFolderDetail($uid, $programId, $scheduleId);
        include_once __DIR__ . '/weixin/ticketfolder/ticketList.html';
        exit;
    }elseif (array_key_exists('ticketParticulars', $queryStr)) { // 票夹 详情
        $jsonData = $tools->getTicketFolderDetail($uid, $programId, $scheduleId);
        $res = json_decode($jsonData, true);
        $dataArr = $res['result'];
        $detail = [];
        foreach ($dataArr as $k => $v) {
            if ((int)$key == (int)$k) {
                $detail = $v;
            }
        }
        $jsonDetail = json_encode(["message" => "SUCCESS", "result" => $detail, "state"=>"0"]);
        if(array_key_exists('idx', $queryStr)){
            include_once __DIR__ . '/weixin/ticketfolder/ticketParticularsEr.html';
        }else{
            include_once __DIR__ . '/weixin/ticketfolder/ticketParticulars.html';
        }
        exit;

    /********************************一手票 end*********************************/



    /********************************入场监测 start*****************************/
    // } elseif (array_key_exists('checkTicketInfo', $queryStr)) { // 入场监测
    //     include_once __DIR__ . '/weixin/checkinfo/weiqutu.html';
    //     exit;
    // } elseif (array_key_exists('mobileCheckTicketInfo', $queryStr)) { // 入场监测 手机版
    //     include_once __DIR__ . '/weixin/checkinfo/weiqutu_mobile_ruchang.html';
    //     exit;
    // } elseif (array_key_exists('pdaCheckTicketInfo', $queryStr)) { // 入场监测 PDA
    //     include_once __DIR__ . '/weixin/checkinfo/weiqutu_mobile_pda.html';
    //     exit;
    /********************************入场监测 end*******************************/



    /********************************商讯商城 start*****************************/
    } elseif (array_key_exists('shop', $queryStr)) { // 商讯首页全部产品
        // include_once __DIR__ . '/weixin/shop/shop_quanbu.html';
        include_once __DIR__ . '/weixin/shop/shop_quanbunew.html';
        exit;
    } elseif (array_key_exists('shopnew', $queryStr)) { // 商讯首页全部产品
        // include_once __DIR__ . '/weixin/shop/shop_quanbu.html';
        include_once __DIR__ . '/weixin/shop/shop_quanbunew.html';
        exit;
    } elseif (array_key_exists('xuni', $queryStr)) { // 商讯虚拟类产品列表
        include_once __DIR__ . '/weixin/shop/shop_quanbu_xuni.html';
        exit;
    } elseif (array_key_exists('canyin', $queryStr)) { // 商讯优惠券产品列表
        include_once __DIR__ . '/weixin/shop/shop_quanbu_canyin.html';
        exit;
    } elseif (array_key_exists('xianshi', $queryStr)) { // 商讯限时爆款
        include_once __DIR__ . '/weixin/shop/shop_xianshi.html';
        exit;
    } elseif (array_key_exists('tijiaoCBA', $queryStr)) { // 商讯 CBA 提交订单
        //获取用户默认地址
        $addressList = $tools->getAddressList($uid);
        $defaultAddress = [];
        if (!empty($aid)) {
            foreach ($addressList as $v) {
                if ($v['id'] == $aid) {
                    $defaultAddress = $v;
                    break;
                }
            }
        } else {
            foreach ($addressList as $v) {
                if ($v['defaultValue'] == 1) {
                    $defaultAddress = $v;
                    break;
                }
            }
        }
        $addressJson = json_encode($defaultAddress);
        include_once __DIR__ . '/weixin/shop/shop_tijiaoCBA.html';
        exit;
    } elseif (array_key_exists('tijiao', $queryStr)) { // 商讯实物 提交订单
        //获取用户默认地址
        $addressList = $tools->getAddressList($uid);
        $defaultAddress = [];
        if (!empty($aid)) {
            foreach ($addressList as $v) {
                if ($v['id'] == $aid) {
                    $defaultAddress = $v;
                    break;
                }
            }
        } else {
            foreach ($addressList as $v) {
                if ($v['defaultValue'] == 1) {
                    $defaultAddress = $v;
                    break;
                }
            }
        }
        $addressJson = json_encode($defaultAddress);

        include_once __DIR__ . '/weixin/shop/shop_tijiao.html';
        exit;
    } elseif (isset($queryStr['WXPay'])) { // 签名，拉起支付
        if (!$tradeNo) {
            echo "<script>alert('订单异常，请重试！');</script>";
            exit;
        }
        // 根据支付流水号获取产品名称，购买数量，产品价格
        $sql = "select a.orderNo, c.productId, c.productName, b.price, b.buyNumber, b.payExpTime from t_trade_info a left join t_orders b on b.orderNo = a.orderNo left join t_product_info c on c.productId = b.productId where a.tradeNo =  '" . $tradeNo . "'";
        $rs = $tools->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $tools->mLog("根据支付流水号获取产品名称，购买数量，产品价格 | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $orderNo = $res['orderNo'];
        $productId = $res['productId'];
        $productName = $res['productName'];
        $amount = $res['price']*$res['buyNumber']*100;
        $payExpTime = $res['payExpTime']; // 支付过期时间

        $input = new WxPayUnifiedOrder();
        $input->SetBody($productName);
        $input->SetAttach("test-attach"); // 附加数据，在查询API和支付通知中原样返回
        $input->SetOut_trade_no($tradeNo);
        $input->SetTotal_fee($amount); // 订单总金额，单位为分，只能为整数
        $input->SetTime_start(date("YmdHis")); // 订单生成时间，格式为yyyyMMddHHmmss
        $input->SetTime_expire(date("YmdHis", strtotime($payExpTime))); // 订单失效时间，格式为yyyyMMddHHmmss
        $input->SetGoods_tag($productId);
        // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $protocol = HTTP_PROTOCOL;
        $input->SetNotify_url($protocol . $_SERVER['HTTP_HOST'] . "/notify.php");
        $input->SetTrade_type("JSAPI");
        $input->SetOpenid($openid);
        /** 进行支付 **/
        $order = WxPayApi::unifiedOrder($input);
        $jsApiParameters = $tools->GetJsApiParameters($order);
        $tools->mLog("组织好的支付签名串---->" . $jsApiParameters . PHP_EOL);
        include __DIR__ . '/jsapi.php';
        exit;
    } elseif (array_key_exists('xiangqing', $queryStr)) { // 商讯产品详情页
        $ip = ip2long($tools->getIp());
        // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $protocol = HTTP_PROTOCOL;
        $accessPage = $protocol . $_SERVER ['HTTP_HOST'] . $_SERVER['PHP_SELF'] . "?" . $_SERVER['QUERY_STRING'];
        $description = "商讯产品详情页";

        $tools->RecordVisitorInformation($ip, $uid, WXAPP, $openid, $accessPage, $description, $productid);
        include_once __DIR__ . '/weixin/shop/shop_shangpin_xiangqing.html';
        exit;
    } elseif (array_key_exists('dingdan', $queryStr)) { // 商讯订单列表
        // include_once __DIR__ . '/weixin/shop/shop_dingdan.html';
        include_once __DIR__ . '/weixin/shop/shop_dingdannew.html';
        exit;
    } elseif (array_key_exists('dingdan_xiangqing', $queryStr)) { // 商讯订单详情
        if ($ordertype == 2) {
            $producttype = 1;
        } else {
            // 获取商品的父类型
            $sql = "select parentId from t_product_type where typeId =  '" . $producttype . "'";
            $rs = $tools->hiup_dbh->query($sql);
            $res = $rs->fetch(PDO::FETCH_ASSOC);
            $tools->mLog("获取商品的父类型 | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
            if ($res['parentId']) {
                $producttype = $res['parentId'];
            }
        }
        if ($producttype == 1) { // 实物
            include_once __DIR__ . '/weixin/shop/shop_dingdan_xiangqing_shiwu.html';
        } elseif ($producttype == 6) { // 优惠券
            include_once __DIR__ . '/weixin/shop/shop_dingdan_xiangqing_youhuiquan.html';
        } elseif ($producttype == 10) { // 虚拟
            include_once __DIR__ . '/weixin/shop/shop_dingdan_xiangqing_xuni.html';
        }
        exit;
    } elseif (array_key_exists('duihuan_success', $queryStr)) { // 商讯兑换成功页面
        include_once __DIR__ . '/weixin/shop/shop_duihuan_success.html';
        exit;
    } elseif (array_key_exists('duihuan_fail', $queryStr)) { // 商讯兑换失败页面
        include_once __DIR__ . '/weixin/shop/shop_duihuan_fail.html';
        exit;
    /********************************商讯商城 end*******************************/



    /********************************商讯核销 start*****************************/
    } elseif (array_key_exists('hexiao_xiangqing', $queryStr)) { // 商讯核销订单详情页面
        include_once __DIR__ . '/weixin/shop/hexiao_xiangqing.html';
        exit;
    } elseif (array_key_exists('data_statement', $queryStr)) { // 商讯核销数据报表列表页面
        include_once __DIR__ . '/weixin/shop/data_statement.html';
        exit;
    } elseif (array_key_exists('hexiao_show_all', $queryStr)) { // 商讯核销数据报表详情页面
        include_once __DIR__ . '/weixin/shop/hexiao_show_all.html';
        exit;
    } elseif (array_key_exists('hexiao_show_yihe', $queryStr)) { // 商讯核销数据报表已核页面
        include_once __DIR__ . '/weixin/shop/hexiao_show_yihe.html';
        exit;
    } elseif (array_key_exists('hexiao_show_weihe', $queryStr)) { // 商讯核销数据报表未核页面
        include_once __DIR__ . '/weixin/shop/hexiao_show_weihe.html';
        exit;
    } elseif (array_key_exists('shopAdministration', $queryStr)) { // 商家管理 主页
        include_once __DIR__ . '/weixin/shop/shopAdministration.html';
        exit;
    } elseif (array_key_exists('userlist', $queryStr)) { // 商家管理 核销人员页面
        include_once __DIR__ . '/weixin/shop/userlist.html';
        exit;
    } elseif (array_key_exists('add_peopel', $queryStr)) { // 商家管理 添加核销人员页面
        include_once __DIR__ . '/weixin/shop/add_peopel.html';
        exit;
    } elseif (array_key_exists('userxiangqing', $queryStr)) { // 商家管理 编辑核销人员页面（详情）
        include_once __DIR__ . '/weixin/shop/userxiangqing.html';
        exit;
    /********************************商讯核销 end*******************************/



    /********************************商讯抽奖 start*****************************/
   } elseif (array_key_exists('slyder', $queryStr)) { // 抽奖
        include_once __DIR__ . '/weixin/shop/slyder_adventures.html';
        // include_once __DIR__ . '/weixin/shop/slyder_adventuresPink.html';
        //include_once __DIR__ . '/weixin/shop/slyder_newyear.html';
        // include_once __DIR__ . '/weixin/shop/slyder_christmas.html';
        exit;
    /********************************商讯抽奖 end*******************************/



    /********************************停车业务 start*****************************/
    } elseif (array_key_exists('parking', $queryStr)) { // 停车
        include_once __DIR__ . '/weixin/parking/registrationVehicles.html';
        exit;
    }  elseif (array_key_exists('parkingReser', $queryStr)) { // 停车
        include_once __DIR__ . '/weixin/parking/parkingReser.html';
        exit;
    } elseif (array_key_exists('parkingnew', $queryStr)) { // 停车 简化版
        if (!isset($_SESSION['subscribeState'])) {
            $_SESSION['subscribeState'] = 0;
        }
        $res = $tools->getWxUserInfoByOpenid($openid); // 获取用户微信信息,查看是否关注
        $wxUserInfo = json_decode($res);
        $subscribe = $wxUserInfo->subscribe?:0;

        include_once __DIR__ . '/weixin/parkingNew/registrationVehicles.html';
        exit;
    } elseif (array_key_exists('onlinepayment', $queryStr)) { // 停车缴费
        $carNum = isset($_GET['carNum'])?$carNum:'';
        include_once __DIR__ . '/weixin/parkingNew/onlinepayment.html';
        exit;
    } elseif (array_key_exists('costbreakdown', $queryStr)) { // 停车费用明细+微信支付
        include_once __DIR__ . '/weixin/parkingNew/costbreakdown.html';
        exit;
    } elseif (array_key_exists('parkingRecord', $queryStr)) { // 停车记录
        include_once __DIR__ . '/weixin/parkingNew/parkingRecord.html';
        exit;
    } elseif (array_key_exists('parkingRecordDetails', $queryStr)) { // 停车记录 详情
        include_once __DIR__ . '/weixin/parkingNew/parkingRecordDetails.html';
        exit;
    } elseif (array_key_exists('parkingguide', $queryStr)) { // 停车 指导
        include_once __DIR__ . '/weixin/parkingNew/parkingGuide.html';
        exit;
    } elseif (array_key_exists('parkingguiderule', $queryStr)) { // 停车及优惠规则
        include_once __DIR__ . '/weixin/parkingNew/parkingGuideRule.html';
        exit;
    } elseif (array_key_exists('addCarNum', $queryStr)) { // 停车 添加 车牌号
        include_once __DIR__ . '/weixin/parkingNew/addCarNum.html';
        exit;
    /********************************停车业务 end*******************************/



    /********************************会员卡 start*******************************/
    } elseif (array_key_exists('center', $queryStr)) { // 新开卡流程---->会员卡首页
        // 获取默认会员卡
        $res = $tools->getDefaultCardId();
        // 查询用户会员卡信息
        $obj = $tools->getUserCardInfo($openid, $res['cardId']);
        $api_ticket = $tools->getApiTicket();
        $cardSignature = $tools->getCardSign($timestamp, $api_ticket, $nonceStr, $res['cardId']);
        include_once __DIR__ . '/weixin/membercardNew/membercenter.html';
        exit;
    } elseif (array_key_exists('uploading', $queryStr)) { // 拍照上传
        include_once __DIR__ . '/weixin/membercardNew/selfhelp.html';
        exit;
    } elseif (array_key_exists('selfhelpdetails', $queryStr)) { // 自助积分详情
        include_once __DIR__ . '/weixin/membercardNew/selfhelpdetails.html';
        exit;
    } elseif (array_key_exists('pointrecord', $queryStr)) { // 积分记录  修改成  三个 tab
        include_once __DIR__ . '/weixin/membercardNew/pointrecordnew.html';
        exit;
    } elseif (array_key_exists('userInfo', $queryStr)) { // 会员卡个人信息
        // 获取默认会员卡
        $res = $tools->getDefaultCardId();
        // 查询用户会员卡信息
        $obj = $tools->getUserCardInfo($openid, $res['cardId']);
        include_once __DIR__ . '/weixin/membercardNew/userinfo.html';
        exit;
    } elseif (array_key_exists('myManagement', $queryStr)) { // 会员卡 我的管理
        include_once __DIR__ . '/weixin/membercardNew/myManagement.html';
        exit;
    /********************************会员卡 end*********************************/



    /********************************就餐取号 start*****************************/
    } elseif (array_key_exists('mwee', $queryStr)) {
        $res = $tools->getWxUserInfoByOpenid($openid); // 获取用户微信信息,查看是否关注
        $wxUserInfo = json_decode($res);
        if (!isset($_SESSION['subscribeState'])) {
            $_SESSION['subscribeState'] = 0;
        }
        if ($wxUserInfo->subscribe || $_SESSION['subscribeState']) { // 关注
            $url = "http://api.mwee.cn/api/web/weixin/near.php?token=".MWEE_TOKEN."&mall=".MWEE_MALL."&openid=".$openid;
            Header("Location: $url");
        } else {
            include_once __DIR__ . '/weixin/membercardNew/repast.html';
        }
        exit;
    /********************************就餐取号 end*******************************/



    /********************************小游戏 start*******************************/
    } elseif (array_key_exists('game', $queryStr)) { // 微信小游戏
        // $url = WX_URL . 'weixin/game/index.html';
        $url = WX_URL . 'weixin/game/gamesmenu/index.html';
        Header("Location: $url");
        exit;
    /********************************小游戏 end*********************************/



    /********************************竞拍 start*********************************/
    } elseif (array_key_exists('auction', $queryStr)) {
        $url = WX_URL . 'weixin/game/hxauction/index.html';
        Header("Location: $url");
        exit;
    /********************************竞拍 end***********************************/



    /********************************幸运球 start*******************************/
    } elseif (array_key_exists('luckballpick', $queryStr)) {     //选号页面
        include_once __DIR__ . '/weixin/luckball/luckballpick.html';
        exit;
    } elseif (array_key_exists('luckballsuccess', $queryStr)) {    //兑换成功
        include_once __DIR__ . '/weixin/luckball/luckballsuccess.html';
        exit;
    } elseif (array_key_exists('luckballlist', $queryStr)) {       //幸运球列表
        include_once __DIR__ . '/weixin/luckball/luckballlist.html';
        exit;
    } elseif (array_key_exists('luckballlistdetail', $queryStr)) {  //幸运球 详情
        include_once __DIR__ . '/weixin/luckball/luckballlistdetail.html';
        exit;
    } elseif (array_key_exists('luckballaward', $queryStr)) {       //幸运球 开奖信息
        include_once __DIR__ . '/weixin/luckball/luckballaward.html';
        exit;
    } elseif (array_key_exists('luckballact', $queryStr)) {     //幸运球 活动页
        include_once __DIR__ . '/weixin/luckball/luckballact.html';
        exit;
    } elseif (array_key_exists('luckballactrule', $queryStr)) {     //幸运球 活动规则页
        include_once __DIR__ . '/weixin/luckball/luckballactrule.html';
        exit;
    } elseif (array_key_exists('luckbaltrailer', $queryStr)) {    //活动预告页
        include_once __DIR__ . '/weixin/luckball/luckbalTrailer.html';
        exit;
    } elseif (array_key_exists('test1', $queryStr)) {    //活动预告页
        include_once __DIR__ . '/weixin/test/test1.html';
        exit;
    /********************************幸运球 end*********************************/



    /********************************默认首页 start*****************************/
    } else { // 首页
        // 获取默认会员卡
        $res = $tools->getDefaultCardId();
        // 查询用户会员卡信息
        $obj = $tools->getUserCardInfo($openid, $res['cardId']);
        $api_ticket = $tools->getApiTicket();
        $cardSignature = $tools->getCardSign($timestamp, $api_ticket, $nonceStr, $res['cardId']);
        include_once __DIR__ . '/weixin/membercardNew/membercenter.html';
        exit;
    }
    /********************************默认首页 end*******************************/
} catch (Exception $e) {
    //输出异常到日志
    $tools->mLog(json_decode($e->getMessage()) . PHP_EOL);
}
