<?php
/**
 * 核销专用
 */
require_once __DIR__ . '/Wxapi.php';

try {
    $tools = new WxApi();
    $openid = $tools->GetOpenid();
    $signPackage = $tools->getSignPackage();
    extract($_GET);
    $tools->mLog("fiba3x3核销程序，接收的参数：" . json_encode($_GET) . PHP_EOL);

    // 检测核销人真实性
    $sql = "select b.verifyUid, b.userName, b.merchantId, b.authority from t_login_authorize a left join t_verify_user b on a.verifyUid=b.verifyUid where a.openId='".$openid."' and merchantId=88 and b.deleteStatus=0";
    $rs = $tools->hiup_dbh->query($sql);
    $res = $rs->fetch(PDO::FETCH_ASSOC);
    $tools->mLog("检测是否免登陆，核销人openid：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
    if (!$res) { // 核销员不存在，直接跳转商城首页
        Header("Location: " . WX_URL . "user.php?shop");
        exit;
    } else { // 开始核销流程
        // 核销员编号
        $verifyUid = $res['verifyUid'];
        // 核销员姓名
        $userName = $res['userName'];
        // 核销员权限
        $authority = $res['authority']; // 21进场 22出场 23进出场
        // 核销员所属商家编号
        $userForMerchantId = $res['merchantId'];

        // 查询二维码真实性
        $sql = "select b.productId from t_orders_info a left join t_orders b on a.orderNo=b.orderNo left join t_product_info c on c.productId=b.productId where a.verifyCode='" . $verifyCode . "' and b.merchantId='" . $userForMerchantId . "' and c.startDate like '".date("Y-m-d")."%'";
        $rs = $tools->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $tools->mLog("查询二维码真实性，核销码verifyCode：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);

        // 统计3x3票状态(0未入场、1入场、2出场)
        $sql = "SELECT b.useStatus, count(b.useStatus)as peopleNum FROM t_orders a, t_orders_info b, t_product_info c WHERE a.orderNo = b.orderNo AND c.productId = a.productId AND a.merchantId = '".$userForMerchantId."' AND a.orderStatus=1 AND c.startDate like '".date("Y-m-d")."%' GROUP BY b.useStatus";
        $rs = $tools->hiup_dbh->query($sql);
        $ticketStatusList = $rs->fetchAll(PDO::FETCH_ASSOC);
        $tools->mLog("统计票状态(0未入场、1入场、2出场)：执行语句：" . $sql . " | 返回值为：" . json_encode($ticketStatusList) . PHP_EOL);
        $getNuil = 0; // 未入场
        $getInto = 0; // 入场
        $getAuto = 0; // 出场(累计总核出数)
        foreach ($ticketStatusList as $k => $v) {
            switch ($v['useStatus']) {
                case '0': // 未入场
                    $getNuil = $v['peopleNum'];
                    break;
                case '1': // 入场
                    $getInto = $v['peopleNum'];
                    break;
                case '2': // 出场
                    $getAuto = $v['peopleNum'];
                    break;
            }
        }
        $verifyTotal = $getInto+$getAuto; // 累计总核销数

        if (!$res) { // 未查询到二维码信息
            $useStatus = -1; // 该场次查无此票
        } else {
            // 查询二维码是否过期、使用状态及除外日期
            $sql = "select a.useStatus, c.startDate, c.endDate, c.useDate, c.productId, c.productName, c.price from t_orders_info a, t_orders b, t_product_info c where a.orderNo = b.orderNo and b.productId = c.productId and a.verifyCode = '".$verifyCode."' and a.deleteStatus = 0";
            $rs = $tools->hiup_dbh->query($sql);
            $res = $rs->fetch(PDO::FETCH_ASSOC);
            $tools->mLog("查询二维码是否过期、使用状态及除外日期，核销码verifyCode：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
            $schedule = date("m月d日", strtotime($res['startDate'])); // 场次
            $productName = $res['productName']; // 名称
            $price = $res['price']; // 票价
            $startDate = $res['startDate']; // 开始日期
            $sql = "SELECT productId from t_product_info WHERE productType=13 AND startDate LIKE '".date("Y-m-d")."%' AND expireStatus=0 AND productStatus=0 AND reviewerStatus=0 AND deleteStatus=0 AND merchantId='".$userForMerchantId. "'";
            $rs = $tools->hiup_dbh->query($sql);
            $productList = $rs->fetchAll(PDO::FETCH_ASSOC);
            // $inventory = $tools->redis->get($res['productId'])?:0; // 库存数
            $inventory = 0;
            foreach ($productList as $k => $v) {
                $inventory += $tools->redis->get($v['productId'])?:0;
            }
            $useStatus = $res['useStatus']; // 0未使用 1已入场  2已出场

            $useDate = explode(",", $res['useDate']);
            $today = date("w");
            $useDateStatus = 0;
            if (in_array($today, $useDate)) {
                $useDateStatus = 1;
            }

            if (strtotime($res['startDate'])>time()) { // 优惠券未开始
                $ExpTimeStatus = -1;
            } elseif (strtotime($res['endDate'])<time()) { // 优惠券已过期
                $ExpTimeStatus = 1;
            } else { // 优惠券正常
                $ExpTimeStatus = 0;
            }
        }

        // 引入核销页面
        include_once __DIR__ . "/weixin/fiba3x3/hexiao_erweima.html";
        exit;
    }
} catch (Exception $e) {
    // 输出异常到日志
    $tools->mLog(json_decode($e->getMessage()) . PHP_EOL);
}
