<?php
/*
 * 统一入口
 * return
 */
require_once __DIR__ . '/Wxapi.php';

try {
    $tools = new WxApi();
    /*if (isset($_SESSION['openid'])) {
        $userInfo = $tools->getUserInfoByOpenid($_SESSION['openid']);
    } else {
        $code = $tools->getCode();
        //根据code获取用户资料
        $userInfo = $tools->getUserInfoByCode($code);
    }

    $uid = $userInfo['result']['pk_user'];
    $mobile = empty($userInfo['result']['mobile']) ? 0 : $userInfo['result']['mobile'];
    $openid = $userInfo['result']['ext_weixin']['openid'];
    $unionid = $userInfo['result']['ext_weixin']['unionid'];

    $queryStr = $_GET;
    extract($queryStr);

    // 获取合并后的用户UID
    $amalgamate = $tools->getAppUid($uid, $mobile, $openid, $unionid);
    $uid = empty($amalgamate['result']['uid']) ? $uid : $amalgamate['result']['uid'];

    if (is_null($uid)) {
        throw new Exception('uid is null');
        echo "<script>alert('未知错误，请重试！');</script>";
        exit;
    }

    // 手机号
    $mobile = empty($amalgamate['result']['appMobile'])?(empty($mobile)?(empty($amalgamate['result']['wechatMobile'])?0:$amalgamate['result']['wechatMobile']):$mobile):$amalgamate['result']['appMobile'];
    // 手机号加星号显示
    if ($mobile) {
        $showMobile = substr($mobile, 0, 3).'****'.substr($mobile, 7, 10);
    }*/



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
    $mobile = $userInfo['result']['mobile'];

    $queryStr = $_GET;
    extract($queryStr);
    $showMobile = $mobile?(substr($mobile, 0, 3).'****'.substr($mobile, 7, 10)):'';
    /*********************************userinfo end*****************************/



    /*********************************jsapi start******************************/
    $signPackage = $tools->getSignPackage();
    $timestamp = $signPackage["timestamp"];
    $nonceStr = $signPackage["nonceStr"];
    $signature = $signPackage["signature"];
    /*********************************jsapi end********************************/



    // 首页
    include_once __DIR__ . '/weixin/mypiao/index.html';
    exit;

} catch (Exception $e) {
    //输出异常到日志
    $tools->mLog(json_decode($e->getMessage()));
}
