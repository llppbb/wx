<?php
/**
 * 核销专用
 */
require_once __DIR__ . '/Wxapi.php';

try {
    $tools = new WxApi();
    $openid = $tools->GetOpenid($_GET);
    $signPackage = $tools->getSignPackage();
    //接收传递过来的参数
    if (isset($_GET['code'])) {
        $state = $_GET['state'];
        $queryStr = json_decode($state, true);
    } else {
        $queryStr = $_GET;
    }
    extract($queryStr);
    $tools->mLog("进入核销程序，接收的参数：" . json_encode($queryStr) . PHP_EOL);
    // 核销人员登陆
    // 检测核销人真实性及是否免登陆
    $sql = "select count(a.id) as count, a.verifyUid, b.merchantId from t_login_authorize a left join t_verify_user b ON a.userMobile=b.userMobile where a.openId='".$openid."'". "and a.expTime>now() and b.expTime>now() and b.deleteStatus=0 and b.status=0 and a.deleteStatus=0";
    $rs = $tools->hiup_dbh->query($sql);
    $res = $rs->fetch(PDO::FETCH_ASSOC);
    $tools->mLog("核销人员登陆，检测是否免登陆，核销人openid：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
    if ($res['count']) { // 免登陆用户
        $verifyUid = $res['verifyUid'];

        // 当前核销员所属商家
        $userForMerchantId = $res['merchantId'];

        // 查询当前产品所属商家
        $sql = "select b.merchantId from t_orders_info a left join t_orders b on a.orderNo=b.orderNo where a.verifyCode='" . $verifyCode . "'";
        $rs = $tools->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $tools->mLog("核销人员登陆，查询当前优惠券所属商家，核销码verifyCode：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $productForMerchantId = $res['merchantId'];

        // 核销产品
        if ($userForMerchantId != $productForMerchantId) { // 当前产品不属于核销员所在的商家
            include_once __DIR__ . "/weixin/shop/duqubudao_erweima.html"; // 引入读取不到二维码信息页面
            exit;
        } else {
            // 判断核销人员权限
            $sql = "select b.authority from t_login_authorize a left join t_verify_user b on a.verifyUid=b.verifyUid where a.openId='".$openid."' and b.deleteStatus=0";
            $rs = $tools->hiup_dbh->query($sql);
            $res = $rs->fetch(PDO::FETCH_ASSOC);
            $tools->mLog("判断核销人员权限，核销人openId为：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
            $authority = $res['authority'];

            // 二维码是否过期、使用状态及除外日期
            $sql = "SELECT a.useStatus, c.startDate, c.endDate, c.useDate FROM t_orders_info a, t_orders b, t_product_info c WHERE a.orderNo = b.orderNo AND b.productId = c.productId AND a.verifyCode = '".$verifyCode."' AND a.deleteStatus = 0";
            $rs = $tools->hiup_dbh->query($sql);
            $res = $rs->fetch(PDO::FETCH_ASSOC);
            $tools->mLog("优惠券是否过期及使用状态，核销码verifyCode：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
            $useStatus = $res['useStatus'];
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

            // 进入核销页
            include_once __DIR__ . "/weixin/shop/hexiao_erweima.html"; // 核销页面
            exit;
        }
    } else { // 跳转登陆页
        include_once __DIR__ . "/weixin/shop/login.html"; // 登陆页面
        exit;
    }
} catch (Exception $e) {
    // 输出异常到日志
    $tools->mLog(json_decode($e->getMessage()) . PHP_EOL);
}
