<?php
require __DIR__ . '/local_conf.php';

$wechatObj = new wechatCallbackapiTest();
// $wechatObj->valid();
$wechatObj->responseMsg();

class wechatCallbackapiTest
{
    public $hiup_dbh = null;
    public $redis = null;
    public function __construct()
    {
        if ($this->hiup_dbh == null) {
            try {
                $this->hiup_dbh = new PDO(HIUP_DSN, HIUP_USER, HIUP_PASSWORD);
                $this->hiup_dbh->query('set names utf8;');
            } catch (PDOException $e) {
                $this->mLog('Connection failed: ' . $e ->getMessage());
            }
        }
        if ($this->redis == null) {
            $this->redis = new redis();
            $this->redis->connect(REDIS_IP, 6379);
            $this->redis->auth(REDIS_PWD);
        }
    }

    public function valid()
    {
        $echoStr = $_GET["echostr"];
        if ($this->checkSignature()) {
            ob_clean();
            echo $echoStr;
            exit;
        }
    }

    public function responseMsg()
    {
        $postStr = $GLOBALS["HTTP_RAW_POST_DATA"];
        if (!empty($postStr)) {
            libxml_disable_entity_loader(true);
            $postObj = simplexml_load_string($postStr, 'SimpleXMLElement', LIBXML_NOCDATA);
            $this->mLog("接到微信事件推送---->" . json_encode($postObj) . PHP_EOL);

            $fromUsername = $postObj->FromUserName;
            $toUsername = $postObj->ToUserName;
            $keyword = trim($postObj->Content);
            $msgType = $postObj->MsgType;
            $event = $postObj->Event;
            $time = time();
            $createTime = $postObj->CreateTime;
            $notifyRs = $this->redis->get($fromUsername . $createTime . $event);
            $this->mLog("查询redis中是否已存在该推送---->key:" . $fromUsername . $createTime . $event . " | 返回:" . $notifyRs . PHP_EOL);
            if (empty($notifyRs)) {
                $rs = $this->redis->set($fromUsername . $createTime . $event, json_encode($postObj));
                $this->redis->expire($fromUsername . $createTime . $event, 60);
                $this->mLog("推送存入redis，开始处理---->key:" . $fromUsername . $createTime . $event . " | 有效期为:60s | 返回:" . $rs . PHP_EOL);
                $textTmp = "<xml>
                           <ToUserName><![CDATA[%s]]></ToUserName>
                           <FromUserName><![CDATA[%s]]></FromUserName>
                           <CreateTime>%s</CreateTime>
                           <MsgType><![CDATA[%s]]></MsgType>
                           <Content><![CDATA[%s]]></Content>
                           </xml>";

                $newsTmp = "<xml>
                           <ToUserName><![CDATA[%s]]></ToUserName>
                           <FromUserName><![CDATA[%s]]></FromUserName>
                           <CreateTime>%s</CreateTime>
                           <MsgType><![CDATA[%s]]></MsgType>
                           <ArticleCount>1</ArticleCount>
                           <Articles>
                           <item>
                           <Title><![CDATA[%s]]></Title>
                           <Description><![CDATA[%s]]></Description>
                           <PicUrl><![CDATA[%s]]></PicUrl>
                           <Url><![CDATA[%s]]></Url>
                           </item>
                           </Articles>
                           </xml>";
                if ($msgType  == "text") {
                    echo '';
                    exit;
                    $MsgType = 'text';
                    $resultStr = sprintf($textTmp, $fromUsername, $toUsername, $time, $MsgType, $contentStr);
                    echo $resultStr;
                } elseif ($msgType == 'event') {
                    if ($event == 'subscribe') { // 关注
                        $MsgType = 'text';
                        $contentStr = "Hi，欢迎关注“华熙会员中心”。\n\n点击开通<a href='https://melive.huaxiweiying.com/user.php'>“华熙会员Hi卡”</a>，获取积分，参与多重福利活动，玩转华熙LIVE。";
                        $resultStr = sprintf($textTmp, $fromUsername, $toUsername, $time, $MsgType, $contentStr);
                    //    $title = "免费停车+现金大奖+积分赠送！诚邀您来属于华熙LIVE的疯狂三月！";
                    //    $desc = "免费停车+2万元现金大奖+积分赠送。华熙LIVE疯狂三月，等你来！";
                    //    $pic = "http://mmbiz.qpic.cn/mmbiz_jpg/BL2zdKKyojgqicKty7e9tc99eJwYvQQ3QFTq6uPKuJrvRa0VbnlJ7lKnNRDUp35JLobujJYMoP8ZgTPDpCZZCQg/0?wx_fmt=jpeg";
                    //    $url = "http://mp.weixin.qq.com/s/12Hq1UVtN3RDlz-GiIIMYQ";
                    //    $MsgType = 'news';
                    //    $resultStr = sprintf($newsTmp, $fromUsername, $toUsername, $time, $MsgType, $title, $desc, $pic, $url);
                        echo $resultStr;
                    } elseif ($event == 'user_get_card') { // 领取卡券

                       $openId = $postObj->FromUserName;
                       $cardId = $postObj->CardId;
                       $code = $postObj->UserCardCode;
                       $sourceNo = $postObj->OuterStr?:'null';

                       // 检测用户是否领过微信会员卡
                       $sql = "select * from t_card_userinfo where openid='".$openId."' and cardId='".$cardId."'";
                       $rs = $this->hiup_dbh->query($sql);
                       $userCardInfo = $rs->fetch(PDO::FETCH_ASSOC);
                       $this->mLog("检测用户是否领过微信会员卡---->执行语句：" . $sql . " | 返回值为：" . json_encode($userCardInfo) . PHP_EOL);

                       if (empty($userCardInfo)) { // 来自领卡物料二维码或因异常跳过资料填写页面
                            $mobile = '-';
                            $name = '-';
                            $sex = '男';
                            $birthday = date("Y-m-d H:i:s");
                            $address = '-';

                            $sql = "insert into t_card_userinfo
                            (cardId, code, openid, mobile, name, sex, birthday, address, addTime, modifyTime, sourceNo)
                            values
                            ('".$cardId."', '".$code."', '".$openId."', '".$mobile."', '".$name."', '".$sex."', '".$birthday."', '".$address."', now(), now(), '".$sourceNo."')";
                            $rs = $this->hiup_dbh->exec($sql);
                            $this->mLog("[异常]来自领卡物料二维码或因跳过资料填写页面[如小程序先触发领卡事件后提交资料],插入微信会员卡领取记录---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                       } elseif (!empty($userCardInfo) && $sourceNo != 'null') {
                            $sql = "update t_card_userinfo set code='".$code."', sourceNo='".$sourceNo."', modifyTime=now() where openid='".$openId."' and cardId='".$cardId."'";
                            $rs = $this->hiup_dbh->exec($sql);
                            $this->mLog("小程序领卡[之前已经提交资料没有领卡]，更新来源sourceNo和code字段[在submit_membercard_user_info事件中处理开卡后序流程]---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                       } else {
                            if ($userCardInfo['deleteStatus'] == 1) { // 之前领过卡，用户手动删除了
                               $sql = "update t_card_userinfo set code='".$code."', modifyTime=now(), deleteStatus=0 where openid='".$openId."' and cardId='".$cardId."'";
                               $rs = $this->hiup_dbh->exec($sql);
                               $this->mLog("更新微信会员卡领取记录---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                            } else { // 新流程领卡
                                // 更新会员卡资料表code字段
                                $sql = "update t_card_userinfo set code='".$code."', modifyTime=now() where openid='".$openId."' and cardId='".$cardId."'";
                                $rs = $this->hiup_dbh->exec($sql);
                                $this->mLog("更新会员卡资料表code字段---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                                if ($rs) {
                                    // 获取用户填写的会员卡资料
                                    $sql = "select * from t_card_userinfo where openid='".$openId."' and cardId='".$cardId."'";
                                    $rs = $this->hiup_dbh->query($sql);
                                    $dataArr = $rs->fetch(PDO::FETCH_ASSOC);
                                    $this->mLog("获取用户填写的会员卡资料---->执行语句：" . $sql . " | 返回值为：" . json_encode($dataArr) . PHP_EOL);

                                    // 开卡通知
                                    $this->activateCardNotify($dataArr['uid'], $dataArr['modifyTime']);
                                    // 修改会员卡背景
                                    $this->editCardBg($dataArr['cardId'], $dataArr['code'], $dataArr['name']);
                                    // 激活会员卡加积分
                                    $this->addPoint($dataArr['uid'], ADD_POINT, $code);
                                }
                            }
                        }
                   } elseif ($event == "submit_membercard_user_info") { // 提交开卡资料(小程序)
                       $openId = $postObj->FromUserName;
                       $cardId = $postObj->CardId;
                       $code = $postObj->UserCardCode;
                       // 通过cardId 和 code 拉取用户填写的开卡资料
                       $mobile = '-';
                       $name = '-';
                       $sex = '男';
                       $birthday = date("Y-m-d H:i:s");
                       $address = '-';
                       $activationInfo = $this->getActivationInfo($cardId, $code);
                       $obj = json_decode($activationInfo, true);
                       foreach ($obj['user_info']['common_field_list'] as $v) {
                           switch ($v['name']) {
                               case 'USER_FORM_INFO_FLAG_MOBILE':
                                   $mobile = $v['value'];
                                   break;
                               case 'USER_FORM_INFO_FLAG_NAME':
                                   $name = $v['value'];
                                   break;
                               case 'USER_FORM_INFO_FLAG_SEX':
                                   $sex = $v['value'];
                                   break;
                               case 'USER_FORM_INFO_FLAG_BIRTHDAY':
                                   $birthday = $v['value'];
                                   break;
                               case 'USER_FORM_INFO_FLAG_LOCATION':
                                   $address = $v['value'];
                                   break;
                           }
                       }

                       $unionid = $this->getUnionid($openId);

                       // 查询会员卡注册来源sourceNo
                       $sql = "select uid, sourceNo, modifyTime from t_card_userinfo where openid='".$openId."' and cardId='".$cardId."' and code='".$code."'";
                       $rs = $this->hiup_dbh->query($sql);
                       $dataArr = $rs->fetch(PDO::FETCH_ASSOC);
                       $this->mLog("查询会员卡注册来源sourceNo---->执行语句：" . $sql . " | 返回值为：" . json_encode($dataArr) . PHP_EOL);
                       if (empty($dataArr['uid'])) {
                           $userInfo = $this->getByMobile($mobile, $openId, $unionid, $dataArr['sourceNo']);
                           $uid = $userInfo['result']['uid'];
                       } else {
                           $uid = $dataArr['uid'];
                       }
                       // 更新会员卡资料
                       $sql = "update t_card_userinfo set uid=$uid, mobile='".$mobile."', name='".$name."', sex='".$sex."', birthday='".$birthday."', address='".$address."', modifyTime=now() where openid='".$openId."' and cardId='".$cardId."' and code='".$code."'";
                       $rs = $this->hiup_dbh->exec($sql);
                       $this->mLog("更新会员卡资料(小程序)---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                       if ($rs) {
                           // 开卡通知
                           $this->activateCardNotify($uid, $dataArr['modifyTime']);
                           // 修改会员卡背景
                           $res = $this->editCardBg($cardId, $code, $name);
                           // 激活会员卡加积分
                           $res = $this->addPoint($uid, ADD_POINT, $code);
                       }
                   } elseif ($event == "user_del_card") { // 删除卡券
                       $openId = $postObj->FromUserName;
                       $cardId = $postObj->CardId;
                       $code = $postObj->UserCardCode;
                       $sql = "update t_card_userinfo set deleteStatus=1, modifyTime=now() where openid='".$openId."' and cardId='".$cardId."' and code='".$code."'";
                       $rs = $this->hiup_dbh->exec($sql);
                       $this->mLog("删除微信会员卡---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                   } elseif ($event == "CLICK") {
                       $eventkey = $postObj->EventKey;
                       if ($eventkey == 'parking') {
                           $contentStr = "升级维护中...";
                       }
                       $MsgType = 'text';
                       $resultStr = sprintf($textTmp, $fromUsername, $toUsername, $time, $MsgType, $contentStr);
                       echo $resultStr;
                   }
               }
            } else {
                $this->mLog("-------------------------key:".$fromUsername . $createTime . $event .", 已存在该推送，处理中-------------------------".PHP_EOL);
            }
        } else {
            echo "";
            exit;
        }
    }

    private function checkSignature()
    {
        $signature = $_GET["signature"];
        $timestamp = $_GET["timestamp"];
        $nonce = $_GET["nonce"];
        $token = TOKEN;
        $tmpArr = array($token, $timestamp, $nonce);
        sort($tmpArr);
        $tmpStr = implode($tmpArr);
        $tmpStr = sha1($tmpStr);
        if ($tmpStr == $signature) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 注册送积分
     * @param string $uid
     * @param string $mobile
     * @return
     */
    public function signUp($uid, $mobile)
    {
        $data = compact('uid', 'mobile');
        $json = json_encode($data);
        $url = APP_URL . 'HXWYServiceMain/user/require_wechat_register_new.json?data=' . $json;
        $res = $this->curl('get', $url);
        $this->mLog('注册送积分---->Request URL: '. $url .' | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
    * 激活会员卡增加积分
    * @param string uid
    * @param string point
    * @return boolval
    */
    public function addPoint($uid, $point, $memberCode)
    {
        $memberCode = (string)$memberCode;
        $data = compact('uid', 'point', 'memberCode');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL . "/user/require_active_member.json?data=" . $json);
        $this->mLog('增加积分---->Request URL: '. APP_DEV_URL.'user/require_active_member.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 开卡通知
     * @param string uid
     * @param string activateCardTime
     * @return
     */
    public function activateCardNotify($uid, $activateCardTime)
    {
        $data = compact('uid', 'activateCardTime');
        $json = json_encode($data);
        $postData = array(
           'data' => $json
        );
        $postData = http_build_query($postData);

        $url = APP_URL . 'HXXCUserMemberTimer/user/activateCard.json';
        $res = $this->curl('post', $url, $postData);
        $this->mLog('开卡通知---->Request URL: '. $url.' | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
    * 获取用户填写的开卡资料(小程序)
    * @param string cardId
    * @param string code
    * @return boolean
    */
    public function getActivationInfo($card_id, $code)
    {
        $json = '{"card_id":"'.$card_id.'", "code":"'.$code.'"}';
        $url = "https://api.weixin.qq.com/card/membercard/userinfo/get?access_token=" . $this->getAccess_Token();
        $res = $this->curl('post', $url, $json);
        $this->mLog('获取用户填写的开卡资料(小程序)---->Request URL: '. $url .' | Request method: POST | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 通过openId获取用户基本信息(包括UnionID机制)
     * @param openId
     * @return
     */
    public function getUnionid($openId)
    {
        $url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=".$this->getAccess_Token()."&openid=".$openId."&lang=zh_CN";
        $res = $this->curl('get', $url);
        $this->mLog('通过openId获取用户基本信息(包括UnionID机制)---->Request URL: '. $url .' | Request method: GET | Return data: ' . $res . PHP_EOL);
        $wxUserInfo = json_decode($res, true);

        return $wxUserInfo['unionid'];
    }

    /**
     * 根据mobile获取用户信息，不存在则创建
     * @param string $mobile
     * @return
     */
    public function getByMobile($mobile, $openid, $unionid, $sourceNo)
    {
        $json = '{"channelType":"'.channelType.'", "channelCode":"'.channelCode.'", "mobile":"'.$mobile.'", "openid":"'.$openid.'", "unionid":"'.$unionid.'", "sourceNo":"'.$sourceNo.'"}';
        $url = APP_USER_URL . "user/login/get_by_mobile.json";
        $res = $this->curl('post', $url, $json, 'json');
        $this->mLog('根据mobile获取用户信息---->Request URL: '.  $url . ' | Request method: POST | Param:' . $json . ' | Return data: ' . $res . PHP_EOL);
        $userInfo = json_decode($res, true);
        // 注册送积分
        $this->signUp($userInfo['result']['uid'], $mobile);

        return $userInfo;
    }

    /**
     * 修改自定义会员卡背景图
     * @param string $mobile
     * @return
     */
    public function editCardBg($cardId, $code, $name)
    {
        $data = [];
        $data['timestamp'] = time();
        $data['sign'] = md5(COUPON_SIGNCODE.$data['timestamp']);
        $data['card_id'] = $cardId;
        $data['code'] = $code;
        $data['name'] = $name;
        $res = $this->curl('post', COUPON_URL . "Home/Requestajax/updateUserInfo", $data);
        $this->mLog('修改自定义会员卡背景图---->Request URL: ' . COUPON_URL . 'Home/Requestajax/updateUserInfo | Request method : POST | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    private function getAccess_Token()
    {
        $access_token = $this->redis->get(ACCESS_TOKEN);
        $this->mLog("从redis中获取的access_token_melive数据: " . $access_token . PHP_EOL);

        return $access_token;
    }

    /**
     * CRUL请求
     */
    public function curl($method, $url, $post_data = '', $type = '')
    {
        //初始化curl
        $ch = curl_init();
        //设置超时
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        if ($method == 'post') {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        }
        if ($type == 'json') {
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                    'Content-Type: application/json; charset=utf-8',
                    'Content-Length: ' . strlen($post_data)
                )
            );
        }
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // return array($httpCode, $response);
        return $response;
    }

    /**
    * 日志记录
    * @param 日志内容  $res
    * @param 日志类型  $type error access
    */
    public function mLog($res)
    {
        $fileName = date('Ymd', time());
        $logPath = LOG_PATH;
        if (!is_dir($logPath)) {
            mkdir($logPath, 0700, true);
        }
        $logFile = $logPath . $fileName . '.log';
        $errDate = date('Y-m-d H:i:s', time());
        if (!empty($_SERVER['HTTP_REFERER'])) {
            $url = $_SERVER['HTTP_REFERER'];
        } else {
            $url = $_SERVER['REQUEST_URI'];
        }
        if (is_array($res)) {
            $logHeadInfo = "$errDate\t$url\n";
            error_log($logHeadInfo, 3, $logFile);
            $res = var_export($res, true);
            $res = $res . "\n";
            error_log($res, 3, $logFile);
        } else {
            $logHeadInfo = "$errDate\t$url\t$res\n";
            error_log($logHeadInfo, 3, $logFile);
        }
    }
}
