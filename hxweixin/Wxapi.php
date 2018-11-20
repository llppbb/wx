<?php
require __DIR__ . '/local_conf.php';
require_once __DIR__ . "/lib/WxPay.Api.php";
require_once __DIR__ . "/phpqrcode/phpqrcode.php";
require_once __DIR__ . "/barcode/BarcodeGenerator.php";
require_once __DIR__ . "/barcode/BarcodeGeneratorPNG.php";

class WxApi
{
    public $redis = null;
    public $dbh = null;
    public $hiup_dbh = null;
    public function __construct() {
        if ($this->redis == null) {
            $this->redis = new redis();
            $this->redis->connect(REDIS_IP, 6379);
            $this->redis->auth(REDIS_PWD);
        }
        if ($this->dbh == null) {
            try {
                $this->dbh = new PDO(DSN, USER, PASSWORD);
                $this->dbh->query('set names utf8;');
            } catch (PDOException $e) {
                $this->mLog('Connection failed: ' . $e->getMessage());
            }
        }
        if ($this->hiup_dbh == null) {
            try {
                $this->hiup_dbh = new PDO(HIUP_DSN, HIUP_USER, HIUP_PASSWORD);
                $this->hiup_dbh->query('set names utf8;');
            } catch (PDOException $e) {
                $this->mLog('Connection failed: ' . $e ->getMessage());
            }
        }

        session_save_path(SESSION_PATH);
        session_start();
    }

    /**
     * 获取openid
     * @return string $openid
     */
    public function getOpenid($parm = "")
    {
        if (!isset($_SESSION['openid'])) {
            $code = $this->getCode($parm);
            $openid = $this->getOpenidFromMp($code)['openid'];
        } else {
            $openid = $_SESSION['openid'];
            $this->mLog('获取session中存储的openid---->'. $openid . PHP_EOL);
        }

        return $openid;
    }
    /**
     * 获取access_token
     * @return string $access_token
     */
    public function getAccessToken($openid, $parm = "")
    {
        $access_token = $this->redis->get($openid);
        $this->mLog('获取redis中存储的access_token---->'. $access_token . PHP_EOL);
        if (!$access_token) {
            $code = $this->getCode($parm);
            $access_token = $this->getOpenidFromMp($code)['access_token'];
        }

        return $access_token;
    }
    /**
     * 获取code
     * @param mixed 可选，当前页面需要的参数
     * @return string $code
     */
    public function getCode($parm = "")
    {
        if (!isset($_GET['code'])) {
            // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            $protocol = HTTP_PROTOCOL;
            $currentUrl = $protocol . $_SERVER['HTTP_HOST'] . DIRPATH . $_SERVER['PHP_SELF'] . "?" . $_SERVER['QUERY_STRING'];
            $baseUrl = urlencode($currentUrl);
            $url = $this->createOauthUrlForCode($baseUrl);
            if (!empty($parm)) {
                $state = json_encode($parm);
                $url = str_replace("STATE", $state, $url);
            }
            $this->mLog('构造获取code的URL: '. $url . PHP_EOL);
            Header("Location: $url");
            exit;
        } else {
            $code = $_GET['code'];
            $this->mLog('获取的code为: '. $code . PHP_EOL);

            return $code;
        }
    }
    /**
     * 兼容key没有双引括起来的JSON字符串解析
     * @param  String  $str JSON字符串
     * @param  boolean $mod true:Array,false:Object
     * @return Array/Object
     */
    public function ext_json_decode($str, $mode = false)
    {
        if (!strstr($str, '"')) {
            $str = str_replace('{', '{"', $str);
            $str = str_replace('}', '"}', $str);
            $str = str_replace(':', '":"', $str);
            $str = str_replace(',', '","', $str);
        }

        return json_decode($str, $mode);
    }
    /**
     * 构造获取code的url连接
     * @param string $redirectUrl 微信服务器回调url，需要url编码
     * @return 返回构造好的url
     */
    private function createOauthUrlForCode($redirectUrl)
    {
        $urlObj['appid'] = APPID;
        $urlObj['redirect_uri'] = $redirectUrl;
        $urlObj['response_type'] = 'code';
        $urlObj['scope'] = 'snsapi_userinfo';
        $urlObj['state'] = 'STATE'.'#wechat_redirect';
        $bizString = $this->toUrlParams($urlObj);

        return 'https://open.weixin.qq.com/connect/oauth2/authorize?'.$bizString;
    }
    /**
     * 拼接签名字符串
     * @param array $urlObj
     * @return 返回querystring
     */
    private function toUrlParams($urlObj)
    {
        $buff = "";
        foreach ($urlObj as $k => $v)
        {
            if($k != "sign"){
                $buff .= $k . "=" . $v . "&";
            }
        }
        $buff = trim($buff, "&");

        return $buff;
    }
    /**
     * 根据code获取access_token和openid
     * @param string $code
     * @return array
     */
    private function getOpenidFromMp($code)
    {
        $url = $this->createOauthUrlForOpenid($code);
        $res = $this->curl('get', $url);
        $this->mLog('根据code获取access_token和openid---->Request URL: ' . $url . ' | Request method: GET | Param: ' . json_encode(compact('code')) .' | Return data: ' . $res . PHP_EOL);
        $data = json_decode($res, true);
        if (isset($data['errcode'])) { // code无效
            $queryStr = $_GET;
            unset($queryStr['code']);
            unset($queryStr['state']);
            // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            $protocol = HTTP_PROTOCOL;
            $url = $protocol.$_SERVER['HTTP_HOST'] . DIRPATH . $_SERVER['PHP_SELF'] . '?' . http_build_query($queryStr);
            Header("Location: $url");
            exit;
        }
        $_SESSION['openid'] = $data['openid'];
        // $_SESSION['access_token'] = $data['access_token'];
        $this->redis->set($_SESSION['openid'], $data['access_token']);
        $this->redis->expire($_SESSION['openid'], 3600);

        return $data;
    }
    /**
     * 根据access_token, openid拉取用户微信资料(需scope为 snsapi_userinfo)
     * @param string $access_token, $openid
     * @return array $UserInfo用户信息
     */
    public function getWxUserInfo($access_token, $openid)
    {
        $res = $this->redis->get('WXUSERINFO_'.$openid);
        $this->mLog('根据openid获取redis中存储的用户微信资料---->' . $res . PHP_EOL);
        if (!$res) {
            $url = $this->createOauthUrlForUserInfo($access_token, $openid);
            $res = $this->curl('get', $url);
            $this->mLog('根据access_token, openid拉取用户微信资料---->Request URL: ' . $url . ' | Request method: GET | Param: ' . json_encode(compact('access_token', 'openid')) .' | Return data: ' . $res . PHP_EOL);
            $userInfo = json_decode($res, true);
            if (isset($userInfo['errcode'])) { //access_token无效
                $this->redis->del($_SESSION['openid']);
                // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                $protocol = HTTP_PROTOCOL;
                $url = $protocol.$_SERVER['HTTP_HOST'] . DIRPATH . $_SERVER['PHP_SELF'] . '?' . $_SERVER['QUERY_STRING'];
                Header("Location: $url");
                exit;
            }
            $this->redis->set('WXUSERINFO_'.$openid, $res);
            $this->redis->expire('WXUSERINFO_'.$openid, 86400);
        }

        return $res;
    }
    /**
     * 通过openid获取用户微信息(需要用户关注公众号)
     * @param openid
     * @return
     */
    public function getWxUserInfoByOpenid($openid)
    {
        $url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token=".$this->getAccess_Token()."&openid=".$openid."&lang=zh_CN";
        $res = $this->curl('get', $url);
        $this->mLog('通过openid获取用户微信息---->Request URL: '. $url.' | Request method: GET | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 构造获取openid和access_toke的url地址
     * @param string $code，微信跳转带回的code
     * @return 请求的url
     */
    private function createOauthUrlForOpenid($code)
    {
        $urlObj['appid'] = APPID;
        $urlObj['secret'] = SECRET;
        $urlObj['code'] = $code;
        $urlObj['grant_type'] = 'authorization_code';
        $bizString = $this->toUrlParams($urlObj);

        return 'https://api.weixin.qq.com/sns/oauth2/access_token?' . $bizString;
    }
    /**
     * 构造拉取用户信息的url地址
     * @param string $access_token, $openid
     * @return 请求的url
     */
    private function createOauthUrlForUserInfo($access_token, $openid)
    {
        $urlObj['access_token'] = $access_token;
        $urlObj['openid'] = $openid;
        $urlObj['lang'] = 'zh_CN';
        $bizString = $this->toUrlParams($urlObj);

        return 'https://api.weixin.qq.com/sns/userinfo?' . $bizString;
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
     * 生成二维码图片
     * @param $verifyCode  核销码
     * @return string url
     */
    public function createQrCode($idCard) // 生成二维码图片
    {
        $outfile = false;// 默认为否，不生成文件，只将二维码图片返回，否则需要给出存放生成二维码图片的路径
        $level = 'L';// 纠错级别：L 7%、M 15%、Q 25%、H 30% 二维码容错率，不同的参数表示二维码可被覆盖的区域百分比
        $size = 4;// 点的大小：1到10,用于手机端4就可以了
        $margin = 1;// 二维码空白区域的大小
        // $saveandprint = true;// 保存二维码图片并显示出来，$outfile必须传递图片路径。
        ob_start();
        QRcode::png($idCard,$outfile,$level,$size,$margin);
        $imageString = base64_encode(ob_get_contents());
        ob_end_clean();
        $src = 'data:image/png;base64,' . $imageString;

        return $src;
    }
    /**
     * 生成条形码
     * @param code
     * @return
     */
    public function createBarcode($code)
    {
        $generator = new Picqer\Barcode\BarcodeGeneratorPNG();
        $generated = $generator->getBarcode($code, $generator::TYPE_CODE_128);
        $src = 'data:image/png;base64,' . base64_encode($generated);

        return $src;
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

    public function getIp() {
        //strcasecmp 比较两个字符，不区分大小写。返回0，>0，<0。
        if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')) {
            $ip = getenv('HTTP_CLIENT_IP');
        } elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) {
            $ip = getenv('HTTP_X_FORWARDED_FOR');
        } elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) {
            $ip = getenv('REMOTE_ADDR');
        } elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        $res =  preg_match ( '/[\d\.]{7,15}/', $ip, $matches ) ? $matches [0] : '';

        return $res;
    }
    /**
     * 记录来访者信息
     * @param $ip, $uid, $wxapp, $openid, $accessPage, $description, $productId
     * @return
     */
    public function RecordVisitorInformation($ip, $uid, $wxapp, $openid, $accessPage, $description, $productId)
    {
        $data = [];
        $data['ip'] = $ip;
        $data['uid'] = $uid;
        $data['wxapp'] = $wxapp;
        $data['openid'] = $openid;
        $data['accessPage'] = $accessPage?:'-';
        $data['description'] = $description?:'-';
        $data['productId'] = $productId?:'-';
        $data['addTime'] = date("Y-m-d H:i:s");

        $sql = 'insert into t_access_log (';
        $sql .= implode(',', array_keys($data)) . ") values ('";
        $sql .= implode("','", array_values($data)) . "')";

        $rs = $this->hiup_dbh->exec($sql);
        $this->mLog("记录来访者信息---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
    }

    /**
     * 选座规则
     */
    public function chooseSeatRule($seatArr)
    {
        $this->mLog("选座规则---->接收的座位数组：" . json_encode($seatArr) . PHP_EOL);
        ksort($seatArr);

        $key = key($seatArr);

        $arr = [];
        foreach ($seatArr as $k => $v) {
            $arr[$k-$key+1] = $v;
        }

        $canChoose = [];
        $chooseYet = [];
        $notChoose = [];

        foreach ($arr as $k => $v) {
            switch ($v) {
                case 'canChoose':
                    $canChoose[] = $k;
                    break;
                case 'chooseYet':
                    $chooseYet[] = $k;
                    break;
                case 'notChoose':
                    $notChoose[] = $k;
                    break;
            }
        }

        for ($i=1; $i < count($chooseYet); $i++) {
            if ($chooseYet[$i]-$chooseYet[$i-1] == 2 && in_array($chooseYet[$i]-1, $canChoose)) {
                return json_encode(['message'=>'ERROR', 'result'=>'已选定座位中间不能为空', 'state'=>1]);
            }
        }

        foreach ($chooseYet as $v) {
            // 往左找空且只空一个的
            $x = $v-1;
            $y = $v-2;
            if (in_array($x, $canChoose) && !in_array($y, $canChoose)) {
                // 往右找，遇到不可选就打断，遇到空就报错
                for ($i=$v+1; $i < count($arr); $i++) {
                    if (in_array($i, $notChoose)) {
                        break;
                    } elseif (in_array($i, $canChoose)) {
                        return json_encode(['message'=>'ERROR', 'result'=>'已选定座位旁边不能为空', 'state'=>1]);
                    }
                }
            }
        }

        foreach ($chooseYet as $v) {
            // 往左找空两个以上的
            $x = $v-1;
            $y = $v-2;
            if (in_array($x, $canChoose) && in_array($y, $canChoose)) {
                // 往右找，遇到不可选就打断，遇到空且只空一个才报错
                for ($i=$v+1; $i <= count($arr); $i++) {
                    $z = $i+1;
                    if (in_array($i, $notChoose)) {
                        break;
                    } elseif (in_array($i, $canChoose) && in_array($z, $canChoose)) {
                        break;
                    } elseif (in_array($i, $canChoose) && !in_array($z, $canChoose)) {
                        return json_encode(['message'=>'ERROR', 'result'=>'已选定座位旁边不能为空', 'state'=>1]);
                    }
                }
            }
        }

        return json_encode(['message'=>'SUCCESS', 'result'=>'ok!', 'state'=>0]);
    }

    /**
     * 获取用户上一次的定位信息
     * @param string openid
     * @return
     **/
    public function getLastLocation($openid)
    {
        $sql = "select cityId, cityName, longitude, latitude, addTime from t_location_log where openid='".$openid."' order by addTime DESC";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("获取用户上一次的定位信息 | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);

        return $res;
    }

    /**
     * 记录用户定位信息
     * @param array location
     * @return
     **/
    public function storeUserLocation($location)
    {
        $this->mLog("记录用户定位信息---->接收的参数：" . json_encode($location) . PHP_EOL);
        $lastLocation = $this->getLastLocation($location['openid']);
        if ($location['cityId'] != $lastLocation['cityId']) {
            $location['addTime'] = date('Y-m-d H:i:s');
            $sql = 'insert into t_location_log (';
            $sql .= implode(',', array_keys($location)) . ") values ('";
            $sql .= implode("','", array_values($location)) . "')";
            $rs = $this->hiup_dbh->exec($sql);
            $this->mLog("记录用户定位信息 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
            if (!$rs) {
                return json_encode(['message'=>'ERROR', 'result'=>'记录用户定位信息失败', 'state'=>1]);
            }
        }
        return json_encode(['message'=>'SUCCESS', 'result'=>'ok', 'state'=>0]);
    }

    /************************************************微信JSAPI************************************************/

    /**
     * 获取jsapi支付的参数
     * @param array $UnifiedOrderResult 统一支付接口返回的数据
     * @throws WxPayException
     * @return json数据，可直接填入js函数作为参数
     */
    public function GetJsApiParameters($UnifiedOrderResult)
    {
        if (!array_key_exists("appid", $UnifiedOrderResult)
        || !array_key_exists("prepay_id", $UnifiedOrderResult)
        || $UnifiedOrderResult['prepay_id'] == "") {
            throw new WxPayException("参数错误");
        }
        $jsapi = new WxPayJsApiPay();
        $jsapi->SetAppid($UnifiedOrderResult["appid"]);
        $timeStamp = time();
        $jsapi->SetTimeStamp("$timeStamp");
        $jsapi->SetNonceStr(WxPayApi::getNonceStr());
        $jsapi->SetPackage("prepay_id=" . $UnifiedOrderResult['prepay_id']);
        $jsapi->SetSignType("MD5");
        $jsapi->SetPaySign($jsapi->MakeSign());
        $parameters = json_encode($jsapi->GetValues());

        return $parameters;
    }

    public function getSignPackage() {
        $jsapiTicket = $this->getJsApiTicket();

        // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $protocol = HTTP_PROTOCOL;
        $url = $protocol . $_SERVER['HTTP_HOST'] . DIRPATH . $_SERVER['PHP_SELF'] . "?" . $_SERVER['QUERY_STRING'];

        $timestamp = time();
        $nonceStr = $this->createNonceStr();

        // 这里参数的顺序要按照 key 值 ASCII 码升序排序
        $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";
        $signature = sha1($string);
        $signPackage = array(
            "appId"     => APPID,
            "nonceStr"  => $nonceStr,
            "timestamp" => $timestamp,
            "url"       => $url,
            "signature" => $signature,
            "rawString" => $string
        );
        $this->mLog("signPackage: ".json_encode($signPackage) . PHP_EOL);

        return $signPackage;
    }

    private function createNonceStr($length = 16)
    {
        $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        $str = "";
        for ($i = 0; $i < $length; $i++) {
            $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
        }

        return $str;
    }

    private function getJsApiTicket()
    {
       $ticket = $this->redis->get(JSAPI_TICKET);
       $this->mLog("从redis中获取的jsApiTicket数据: " . $ticket . PHP_EOL);

       return $ticket;
    }

    private function getAccess_Token()
    {
       $access_token = $this->redis->get(ACCESS_TOKEN);
       $this->mLog("从redis中获取的access_token_melive数据: " . $access_token . PHP_EOL);

       return $access_token;
    }

    public function formatResponse(array $signPacket, $debug="true")
    {
        $appId = $signPacket['appId'];
        $nonceStr = $signPacket['nonceStr'];
        $timestamp = $signPacket['timestamp'];
        $signature = $signPacket['signature'];
        $retStr = "wx.config({
            debug:$debug,
            appId:'$appId',
            timestamp:$timestamp,
            nonceStr:'$nonceStr',
            signature:'$signature',
            jsApiList:['checkJsApi',
                      'onMenuShareTimeline',
                      'onMenuShareAppMessage',
                      'onMenuShareQQ',
                      'onMenuShareWeibo',
                      'hideMenuItems',
                      'showMenuItems',
                      'hideAllNonBaseMenuItem',
                      'showAllNonBaseMenuItem',
                      'translateVoice',
                      'startRecord',
                      'stopRecord',
                      'onRecordEnd',
                      'playVoice',
                      'pauseVoice',
                      'stopVoice',
                      'uploadVoice',
                      'downloadVoice',
                      'chooseImage',
                      'previewImage',
                      'uploadImage',
                      'downloadImage',
                      'getNetworkType',
                      'openLocation',
                      'getLocation',
                      'hideOptionMenu',
                      'showOptionMenu',
                      'closeWindow',
                      'scanQRCode',
                      'chooseWXPay',
                      'openProductSpecificView',
                      'addCard',
                      'chooseCard',
                      'openCard']
        });";

        return $retStr;
    }

    /************************************************用户相关业务************************************************/

    /**
     * 获取用户积分记录
     * @param string $uid
     * @return
     */
    public function getUserPointRecord($uid, $type, $page)
    {
        $pageSize = 20;
        $date = compact('uid', 'type', 'page', 'pageSize');
        $url = APP_DEV_URL . "user/require_user_point_detail.json?data=".json_encode($date);
        $res = $this->curl('get', $url);
        $this->mLog('获取用户积分记录---->Request URL: '.  $url . ' | Request method: GET | Param:' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取已用积分
     * @param string $uid
     * @return
     */
    public function getUsedPoint($uid)
    {
        $pageSize = 20;
        $date = compact('uid');
        $url = APP_DEV_URL . "user/require_user_point_minus.json?data=".json_encode($date);
        $res = $this->curl('get', $url);
        $this->mLog('获取已用积分---->Request URL: '.  $url . ' | Request method: GET | Param:' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取用户积分
     * @param string $uid
     * @return 用户积分信息
     */
    public function getUserPoint($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'user/require_user_point.json?data='.$json);
        $this->mLog('获取用户积分---->Request URL: '. APP_DEV_URL.'user/require_user_point.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);
        $pointInfo = json_decode($res, true);
        if ($pointInfo['state'] != 0) {
            return false;
        }

        return $res;
    }

    /**
     *获取用户本年度累计积分
     *@param string $uid
     *@return json
     */
    public function getUserCurrentPoint($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'user/require_user_point_current.json?data='.$json);
        $this->mLog('获取用户当前积分---->Request URL: '. APP_DEV_URL.'user/require_user_point_current.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 签到
     * @param string $uid
     * @return
     */
    public function signIn($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        $url = APP_URL . 'HXWYServiceMain/user/require_wechat_login_new.json?data=' . $json;
        $res = $this->curl('get', $url);
        $this->mLog('获取用户签到记录---->Request URL: '. $url .' | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
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
     * 根据mobile获取用户信息，不存在则创建
     * @param string $mobile
     * @return
     */
    public function getByMobile($mobile, $openid, $unionid)
    {
        $data = [];
        $data['channelType'] = channelType;
        $data['channelCode'] = channelCode;
        $data['mobile'] = $mobile;
        $data['openid'] = $openid;
        $data['unionid'] = $unionid;
        $data['sourceNo'] = sourceNo;
        $url = APP_USER_URL . "user/login/get_by_mobile.json";
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('根据mobile获取用户信息---->Request URL: '.  $url . ' | Request method: POST | Param:' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);
        // 注册送积分
        $rs = json_decode($res, true);
        $this->signUp($rs['result']['uid'], $mobile);

        return $res;
    }

    /**
     * 根据openid获取用户信息
     * @param string $openid, $unionid
     * @return
     */
    public function getByOpenid($openid, $unionid)
    {
        $data = [];
        $data['channelCode'] = channelCode;
        $data['openid'] = $openid;
        $data['unionid'] = $unionid;
        $data['sourceNo'] = sourceNo;
        $url = APP_USER_URL . "user/login/get_by_openid.json";
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('根据openid获取用户信息---->Request URL: '.  $url . ' | Request method: POST | Param:' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 通过手机号获取用户信息
     * @param string $mobile
     * @return
     * 用户存在 {"result":{"uid":"10002767","mobile":"15201617952","tempUser":false},"state":"0","message":"SUCCESS"}
     * 用户不存在 {"result":{"uid":null,"mobile":null,"tempUser":false},"state":"0","message":"SUCCESS"}
     */
    public function getUserInfoByMobile($mobile)
    {
        $data = [];
        $data['mobile'] = $mobile;;
        $url = APP_USER_URL . "user/get/get_by_mobile.json";
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('根据mobile查询用户信息---->Request URL: '.  $url . ' | Request method: POST | Param:' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);

        return json_decode($res, true);
    }

    /**
     * 发送短信验证码
     * @param string $mobile, $channel
     * @return
     */
    public function sendMsg($mobile, $channel)
    {
        //'channel' => 'wechat'
        $data = compact('mobile', 'channel');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL . 'sms/require_verify_sm.json?data=' . $json);
        $this->mLog('发送短信验证码---->Request URL: '. APP_DEV_URL . 'sms/require_verify_sm.json | Request method: GET | Param:'. $json .' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 校验手机验证码
     * @param mobile verified
     * @return
     */
    public function checkSMSCode($mobile, $verified)
    {
        $reidsCode = $this->redis->get(REDIS_SMS_KEY.$mobile);
        $this->mLog('校验手机验证码---->参数:'. json_encode(compact("mobile", "smsCode")) .' | 返回值: ' . $reidsCode . PHP_EOL);
        if (empty($reidsCode) || $verified != $reidsCode) {
            return false;
        }

        return true;
    }

    /**
     * 微信用户首次注册送200金币
     * @param string uid
     * @return
     */
    public function wechatRegister($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'user/require_wechat_register.json?data='.$json);
        $this->mLog('微信用户首次注册送200金币---->Request URL: '. APP_DEV_URL.'user/require_wechat_register.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取用户金币
     * @param string $uid
     * @return 用户金币信息
     */
    public function getUserCoin($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'user/require_user_score.json?data='.$json);
        $this->mLog('获取用户金币---->Request URL: '. APP_DEV_URL.'user/require_user_score.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);
        $coinInfo = json_decode($res, true);
        if ($coinInfo['state'] != 0) {
            return false;
        }

        return $res;
    }
    /**
     * 获取用户金币充值记录
     * @param string uid, orderStatus(0待付款 1已付款)
     * @return 用户充值记录
     */
    public function getUserChargeLog($uid, $orderStatus)
    {
        $data = compact('uid', 'orderStatus');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL . 'user/inquire_recharge_list.json?data=' . $json);
        $this->mLog('获取用户金币充值记录---->Request URL: '. APP_DEV_URL.'user/inquire_recharge_list.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);
        $chargeList = json_decode($res, true);
        if ($chargeList['state'] != 0) {
            return false;
        }

        return $chargeList['result']['list'];
    }
    /**
     *积分换金币
     * @param string uid, productId
     * @return {"message":"SUCCESS","result":{"status":true,"userScore":1100,"msg":null,"userPoints":0},"state":"0"}
     */
    public function pointExchangeScore($uid, $productId)
    {
        $data = compact('uid', 'productId');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'user/require_point_exchange_score.json?data='.$json);
        $this->mLog('积分换金币---->Request URL: '. APP_DEV_URL.'user/require_point_exchange_score.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取金币充值金额
     * @param string $sign 加密串 , $timestamp 时间戳
     * @return string price 金币充值金额
     */
    public function getPrice($sign, $timestamp)
    {
        $price = false;
        $this->mLog('加密码串---->' . $sign . PHP_EOL);
        $amountArr = unserialize(AMOUNTARR);
        $this->mLog('价格列表---->' . json_encode($amountArr) . PHP_EOL);
        foreach ($amountArr as $v) {
            if (md5($timestamp.SIGNCODE.$v) == $sign) {
                $price = $v;
                $this->mLog('获取的充值金额---->' . $price . PHP_EOL);
                break;
            }
        }

        return $price;
    }
    /**
     * 生成金币充值流水号
     * @param string uid, money
     * @return
     */
    public function getOutTradeNo($uid, $sign, $timestamp)
    {
        $money = $this->getPrice($sign, $timestamp);
        if (!$money) {
            $this->mLog('生成金币充值流水号---->Request URL: '. APP_DEV_URL.'wechat/order/beitai_order.json | 未获取到充值金额' . PHP_EOL);
            return false;
        }
        $data = ['uid'=>$uid, 'receiver'=>'BT', 'productID'=>'BT'.$money, 'totalFee'=>$money];
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'wechat/order/beitai_order.json?data='.$json);
        $this->mLog('生成金币充值流水号---->Request URL: '. APP_DEV_URL.'wechat/order/beitai_order.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);
        $outTradeNoInfo = json_decode($res, true);
        if ($outTradeNoInfo['state'] != 0) {
            return false;
        }

        return $outTradeNoInfo['result']['outTradeNo'];
    }
    /**
     * 金币充值(验证微信支付回调信息)
     * @param string outTradeNo 微信支付回调信息中的支付流水号
     * @return {"message":"SUCCESS","result":null,"state":"0"}
     */
    public function recharge($outTradeNo)
    {
        $data = compact('outTradeNo');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL . 'wechat/order/recharge.json?data='.$json);
        $this->mLog('金币充值(验证微信支付回调信息)---->Request URL: '. APP_DEV_URL.'wechat/order/recharge.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);
        $result = json_decode($res, true);

        return $result;
    }
    /**
     * 获取贝泰订单
     * @param string $uid
     * @return 订单列表
     */
    public function getBeiTaiOrderList($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        //获取订单列表
        $res = $this->curl('get', APP_DEV_URL.'user/order/inquire_exchange_order.json?data=' . $json);
        $this->mLog('获取贝泰订单---->Request URL: '. APP_DEV_URL.'user/order/inquire_exchange_order.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);
        $orderList = json_decode($res, true);
        if ($orderList['state'] != 0) {
            return false;
        }

        return $orderList['result']['list'];
    }
    /**
     *添加贝泰订单收货地址
     *@param string $uid, $orderNo, $receiverName, $receiverMobile, $receiverAddress
     *@return json
     */
    public function addBeiTaiOrderAddress($uid, $orderNo, $receiverName, $receiverMobile, $receiverAddress)
    {
        $data = compact('uid', 'orderNo', 'receiverName', 'receiverMobile', 'receiverAddress');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL . 'user/order/require_edit_order_address.json?data=' . $json);
        $this->mLog('添加/编辑贝泰订单收货地址---->Request URL: '. APP_DEV_URL.'user/order/require_edit_order_address.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     *获取贝泰商城、竞猜等URL
     *@param string $uid, $channel 渠道 默认为wechat
     *@return json
     */
    public function getBeiTaiMarketURL($uid, $channel)
    {
        $data = compact('uid', 'channel');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL.'lottery/api/getUrls.json?data='.$json);
        $this->mLog('获取贝泰商城、竞猜等URL---->Request URL: '. APP_DEV_URL.'lottery/api/getUrls.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /***************************************票务1.0业务************************************************/

    /**
     * 获取项目类型列表
     *
     * @return array
     */
    public function getTypeList()
    {
        $url = APP_URL."HXXCTicketMain/ticket/get_type.json";
        $res = $this->curl('get', $url);
        $this->mLog('获取项目类型列表---->Request URL: '. $url . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取banner列表
     *
     * @return array
     */
    public function getBannerList()
    {
        $url = APP_URL."HXXCTicketMain/ticket/get_banners.json";
        $res = $this->curl('get', $url);
        $this->mLog('获取banner列表---->Request URL: '. $url . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取项目列表
     *
     * @return array
     */
    public function getProgramList($typeId=0, $page=1, $pageSize=10)
    {
        $owner=0; // 展示渠道 0微信 1小程序
        // $typeQuery = empty($typeId)?'':"&typeId=$typeId";
        $url = APP_URL."HXXCTicketMain/ticket/ticket_info_list.json?owner=$owner&page=$page&pageSize=$pageSize&typeId=$typeId";
        $res = $this->curl('get', $url);
        $this->mLog('获取项目列表---->Request URL: '. $url . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取项目详情
     *
     * @return array
     */
    public function getProgramDetail($programId)
    {
        $url = APP_URL."HXXCTicketMain/ticket/ticket_detail.json?programId=$programId";
        $res = $this->curl('get', $url);
        $this->mLog('获取项目详情---->Request URL: '. $url . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取场次价格信息
     *
     * @param  string $onlineID 项目ID
     * @param  string $owner    'hxxc'
     * @return array
     */
    public function getSchedulePriceInfo($onlineID)
    {
        $owner = OWNER;
        $data = compact('onlineID', 'owner');

        $url = GWL_SERVER . 'ticket/programInfoNew.json?'.http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('获取场次价格信息---->Request URL: '. $url . ' | Request method: GET | Return data: ' . $res . PHP_EOL);
        $schedulePriceInfo = json_decode($res, true);
        if (!array_key_exists('state', $schedulePriceInfo) || $schedulePriceInfo['state'] != 0) {
            return false;
        }

        return $schedulePriceInfo['result'];
    }

    /**
     * 获取价格对应的区域
     *
     * @param  string onlineID 项目ID
     * @param  string owner
     * @param  string scheduleId
     * @param  string ticketPriceId
     * @return array
     */
    public function getVenueAreaInfo($onlineID, $scheduleId, $ticketPriceId)
    {
        $owner = OWNER;
        $data = compact('onlineID', 'owner', 'scheduleId', 'ticketPriceId');
        $json = json_encode($data);
        $res = $this->curl('post', GWL_SERVER . 'ticket/programPrice_new.json', $json, 'json');
        $this->mLog('获取价格对应的区域---->Request URL: '. GWL_SERVER . 'ticket/programPrice_new.json | Request method: POST | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取指定价格、指定区域对应的座位
     *
     * @param  string onlineID
     * @param  string scheduleId
     * @param  string ticketPriceId
     * @param  string venueAreaId
     * @return array
     */
    public function getSeatInfo($uid, $onlineID, $scheduleId, $ticketPriceId, $venueAreaId, $flag="234")
    {
        $data = compact('uid', 'onlineID', 'scheduleId', 'ticketPriceId', 'venueAreaId', 'flag');
        $json = json_encode($data);
        $res = $this->curl('post', GWL_SERVER . 'ticket/seatInfo_new.json', $json, 'json');
        $this->mLog('获取指定价格、指定区域对应的座位---->Request URL: '. GWL_SERVER . 'ticket/seatInfo_new.json | Request method: POST | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 本地缓存锁座 array
     *
     * @param  string $uid           用户ID
     * @param  string $onlineID      项目ID
     * @param  string $scheduleId    场次ID
     * @param  string $ticketPriceId 价格ID
     * @param  string $packTicketId  套票ID
     * @param  string $ticketNum     票数
     * @param  string $owner         主办方标识
     * @param  string $seatInfo      座位信息 {"venueAreaId":279642,"venueAreaName":"首层看台","seats":[{"lineno":19,"rankno":1},{"lineno":19,"rankno":2}]}
     * @param  string $flag          1选座 2取消选座
     */
    public function localLockSeat($uid, $onlineID, $scheduleId, $ticketPriceId, $ticketNum, $packTicketId, $seatInfo, $flag=1)
    {
        $owner = OWNER;
        $this->mLog('本地缓存锁座---->seatInfo参数包：' . json_encode($seatInfo) . PHP_EOL);
        extract($seatInfo);
        $data = compact('uid', 'onlineID', 'scheduleId', 'ticketPriceId', 'ticketNum', 'owner', 'packTicketId', 'venueAreaId', 'venueAreaName', 'seats', 'flag');

        $json = json_encode($data);
        $res = $this->curl('post', GWL_SERVER . 'order/lock/redis.json', $json, 'json');
        $this->mLog('本地缓存锁座---->Request URL: '. GWL_SERVER . 'order/lock/redis.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 锁座 array
     *
     * @param  string $uid           用户ID
     * @param  string $onlineID      项目ID
     * @param  string $scheduleId    场次ID
     * @param  string $ticketPriceId 价格ID
     * @param  string $ticketNum     票数
     * @param  string $owner         主办方标识
     * @param  string $packTicketId  套票ID
     * @param  string $seatInfo      座位信息 {"venueAreaId":279642,"venueAreaName":"首层看台","seats":[{"lineno":19,"rankno":1},{"lineno":19,"rankno":2}]}
     * @return array $lockInfo
     */
    public function lockSeat($uid, $onlineID, $scheduleId, $ticketPriceId, $ticketNum, $packTicketId, $seatInfo='')
    {
        $owner = OWNER;
        if (!empty($seatInfo)) {
            $this->mLog('锁座---->seatInfo参数包：' . json_encode($seatInfo) . PHP_EOL);
            extract($seatInfo);
            $data = compact('uid', 'onlineID', 'scheduleId', 'ticketPriceId', 'ticketNum', 'owner', 'packTicketId', 'venueAreaId', 'venueAreaName', 'seats');
        } else {
            $data = compact('uid', 'onlineID', 'scheduleId', 'ticketPriceId', 'ticketNum', 'owner', 'packTicketId');
        }
        $json = json_encode($data);
        $res = $this->curl('post', GWL_SERVER . 'order/lock.json', $json, 'json');
        $this->mLog('锁座---->Request URL: '. GWL_SERVER . 'order/lock.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);
        $lockInfo = json_decode($res, true);

        return $lockInfo;
    }
    /**
     * 下单
     * @param string uid
     * @param string orderNo
     * @param string buyerNumber
     * @param string ticketType
     * @param string receiverMobile
     * @param string receiverAddress
     * @param string receiverName
     * @param string viewers
     * @param string useRule
     * @param string deliverType
     * @return
     */
    public function placeOrder($uid, $orderNo, $buyerNumber, $ticketType, $receiverMobile, $receiverAddress, $receiverName, $viewers, $useRule, $deliverType)
    {
        $owner = OWNER;
        $data = compact('uid', 'orderNo', 'owner', 'buyerNumber', 'ticketType', 'receiverMobile', 'receiverAddress', 'receiverName', 'viewers', 'useRule', 'deliverType');
        $json = json_encode($data);
        $res = $this->curl('post', APP_URL . 'HXXCTicketMain/ticket/order/require_buy_ticket_new.json', $json, 'json');
        $this->mLog('下单---->Request URL: '. APP_URL . 'HXXCTicketMain/ticket/order/require_buy_ticket_new.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 查询锁座信息
     * @param string $orderNo
     * @return 项目所有信息
     */
    public function getLockInfo($uid, $orderNo)
    {
        $data = compact('uid', 'orderNo');
        $url = GWL_SERVER . 'order/lockInfo_new.json?'. http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('查询锁座信息---->Request URL: '. $url . ' | Request method: GET | Return data: ' . $res . PHP_EOL);
        $lockInfo = json_decode($res, true);
        if (!array_key_exists('state', $lockInfo) || $lockInfo['state'] != 0) {
            return false;
        }

        return $lockInfo['result'];
    }
    /**
     * 获取用户地址列表
     * @param string $uid
     * @return 地址列表
     */
    public function getAddressList($uid)
    {
        $data = compact('uid');
        $url = APP_URL . 'HXXCTicketMain/user/inquire_user_addresses_new.json?'.http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('获取用户地址列表---->Request URL: '. $url . ' | Request method: GET | Return data: ' . $res . PHP_EOL);
        $addressList = json_decode($res, true);
        if ($addressList['state'] != 0) {
            return false;
        }

        return $addressList['result']['list'];
    }
    /**
     * 新增常用收货地址
     * @param string $uid, $name, $mobile, $address
     * @return id
     */
    public function addUserAddress($uid, $name, $mobile, $address)
    {
        $name = trim($name);
        $mobile = trim($mobile);
        $address = trim($address);
        $district = '-';
        $data = compact('uid', 'name', 'mobile', 'address', 'district');
        $json = json_encode($data);

        $res = $this->curl('post', APP_URL . 'HXXCTicketMain/user/require_add_user_address_new.json', $json, 'json');
        $this->mLog('新增常用收货地址---->Request URL: '. APP_URL . 'HXXCTicketMain/user/require_add_user_address_new.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 更新常用收货地址
     * @param string $id, $uid, $name, $mobile, $address
     * @return id
     */
    public function updateUserAddress($id, $uid, $name, $mobile, $address, $defaultValue)
    {
        $name = trim($name);
        $mobile = trim($mobile);
        $address = trim($address);
        $district = '-';
        $data = compact('id', 'uid', 'name', 'mobile', 'address', 'defaultValue', 'district');
        $json = json_encode($data);
        // 更新常用收货地址
        $res = $this->curl('post', APP_URL . 'HXXCTicketMain/user/require_update_user_address_new.json', $json, 'json');
        $this->mLog('更新常用收货地址---->Request URL: ' . APP_URL . 'HXXCTicketMain/user/require_update_user_address_new.json | Request method: POST | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 删除常用收货地址
     * @param string $id, $uid, $name, $mobile, $address
     * @return
     */
    public function deleteUserAddress($id, $uid)
    {
        $data = compact('id', 'uid');
        $url = APP_URL . 'HXXCTicketMain/user/require_delete_user_address_new.json?'.http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('删除常用收货地址---->Request URL: ' . $url . ' | Request method: POST | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取用户实名制列表
     * @param string $uid
     * @return 实名制列表
     */
    public function getRealNameList($uid)
    {
        $data = compact('uid');
        $url = APP_URL . 'HXXCTicketMain/user/inquire_user_contacts_new.json?'.http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('获取用户实名制列表---->Request URL: '. $url . ' | Request method: GET | Return data: ' . $res . PHP_EOL);
        $realNameList = json_decode($res, true);
        if ($realNameList['state'] != 0) {
            return false;
        }

        return $realNameList['result']['list'];
    }
    /**
     * 添加实名制信息
     * @param string $uid, $name, $idCard
     * @return id
     */
    public function addUserContacts($uid, $name, $idCard, $cardName, $cardType)
    {
        $data = compact('uid', 'name', 'idCard', 'cardName', 'cardType');
        $json = json_encode($data);
        $res = $this->curl('post', APP_URL . 'HXXCTicketMain/user/require_add_user_contacts_new.json', $json, 'json');
        $this->mLog('添加实名制信息---->Request URL: '. APP_URL . 'HXXCTicketMain/user/require_add_user_contacts_new.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 删除常用联系人
     * @param string $id, $uid
     * @return
     */
    public function deleteUserContacts($id, $uid)
    {
        $data = compact('id', 'uid');
        $url = APP_URL . 'HXXCTicketMain/user/require_delete_user_contacts_new.json?' . http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('删除常用联系人---->Request URL: ' . $url . ' | Request method: GET | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取一手票订单列表
     * @param string ticketFolderType 0未开始   1已过期
     * @return
     */
    public function getTicketOrderList($uid, $ticketFolderType=0, $pageSize=20, $page=1)
    {
        $channel = OWNER;
        $data = compact('uid', 'ticketFolderType', 'pageSize', 'page', 'channel');
        $url = APP_URL . 'HXXCTicketMain/ticket/ticket_folder_list.json?'.http_build_query($data);
        $res = $this->curl('get', $url);
        $this->mLog('获取一手票订单列表---->Request URL: '. $url . ' | Request method: GET | Param：' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取一手票订单详情
     * @param string $uid
     * @param string $orderNo
     * @return 订单详情
     */
    public function getTicketOrderDetail($uid, $orderNo)
    {
        $data = compact('uid', 'orderNo');
        $url = APP_URL . 'HXXCTicketMain/ticket/ticket_folder_detail.json?'.http_build_query($data);

        $res = $this->curl('get', $url);
        $this->mLog('获取一手票订单详情---->Request URL: '.$url.' | Request method: GET | Param：'.json_encode($data) .' | Return data: '. $res . PHP_EOL);

        return $res;
    }

    /**
     * 取消购票订单
     * @param string $uid, $orderNo
     * @return 被取消的订单号 orderNo
     */
    public function cancelTicketOrder($uid, $orderNo)
    {
        $data = compact('uid', 'orderNo');
        $json = json_encode($data);
        $res = $this->curl('post', APP_URL.'HXXCTicketMain/ticket/order/require_cancel_ticket_order_new.json', $json, 'json');
        $this->mLog('取消购票订单---->Request URL: '. APP_URL . 'HXXCTicketMain/ticket/order/require_cancel_ticket_order_new.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取拉起微信支付的签名
     * @param string $uid
     * @param string $openId
     * @param string $orderNo
     * @return 签名
     */
    public function WXPayApi($uid, $orderNo, $openId)
    {
        $channel = PAYSIGN;
        $data = compact('uid', 'orderNo', 'openId', 'channel');
        $json = json_encode($data);
        $res = $this->curl('get', APP_DEV_URL . 'wechat/ticket/xcx/pay_ticket_order.jaon?data=' . $json);
        $this->mLog('获取拉起微信支付的签名---->Request URL: '. APP_DEV_URL.'wechat/ticket/xcx/pay_ticket_order.json | Request method: GET | Param: ' . $json . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 开售提醒
     * @param string $uid, $onlineID, $mobile
     * @return
     */
    public function ticketReminding($uid, $onlineID, $mobile)
    {
        $data = compact('uid', 'onlineID', 'mobile');
        $json = json_encode($data);
        $res = $this->curl('post', APP_URL.'HXXCTicketMain/ticket/order/require_ticket_reminding_new.json', $json, 'json');
        $this->mLog('开售提醒---->Request URL: '. APP_URL.'HXXCTicketMain/ticket/order/require_ticket_reminding_new.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 缺货登记
     * @param string $uid, $onlineID, $scheduleId, $ticketPriceId, $packgePriceId, $mobile
     * @return
     */
    public function ticketRefillReminding($uid, $onlineID, $scheduleId, $ticketPriceId, $packgePriceId, $mobile)
    {
        $data = compact('uid', 'onlineID', 'scheduleId', 'ticketPriceId', 'packgePriceId', 'mobile');
        $json = json_encode($data);
        $res = $this->curl('post', APP_URL.'HXXCTicketMain/ticket/order/require_ticket_refill_reminding_new.json', $json, 'json');
        $this->mLog('缺货登记---->Request URL: '. APP_URL.'HXXCTicketMain/ticket/order/require_ticket_refill_reminding_new.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 进场监测
     * @param string $programId, $scheduleId
     * @return
     */
    public function checkTicketInfo($programId, $scheduleId)
    {
        $data = compact('programId', 'scheduleId');
        $json = json_encode($data);

        $postData = http_build_query($data);
        $res = $this->curl('post', APP_DEV_CHECK.'ticket/api/requireCheckTicketInfo.json', $postData);
        $this->mLog('进场监测---->Request URL: '. APP_DEV_CHECK . 'ticket/api/requireCheckTicketInfo.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 电子票夹列表
     * @param
     * @return
     */
    public function getTicketFolderList($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);

        $res = $this->curl('get', APP_DEV_URL.'ticket/program/inquire_program_info.json?data=' . $json);
        $this->mLog('电子票夹列表---->Request URL: '. APP_DEV_URL . 'ticket/program/inquire_program_info.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 电子票夹详情
     * @param
     * @return
     */
    public function getTicketFolderDetail($uid, $programId, $scheduleId)
    {
        $data = compact('uid', 'programId', 'scheduleId');
        $json = json_encode($data);

        $res = $this->curl('get', APP_DEV_URL.'ticket/detail/inquire_ticket_info.json?data=' . $json);
        $this->mLog('电子票夹详情---->Request URL: '. APP_DEV_URL . 'ticket/detail/inquire_ticket_info.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /************************************************微贝社区************************************************/

    /**
     * 签名方法
     * @param string $timestamp 11位时间戳，KEY密钥
     * @return string 签名字符串
     */
    private function encryption($timestamp)
    {
        return md5($timestamp.KEY);
    }

    /**
     * 统计总数数据
     * @param string $openid
     * @return int postTotal帖子总数/int favoriteTotal收藏总数/double balance余额/int newCount新消息总数
     */
    public function getPraiseNum($openid)
    {
        $timestamp = time();
        $token = $this->encryption($timestamp);
        $data = compact('token', 'timestamp', 'openid');
        $querystring = http_build_query($data);
        $res = $this->curl('get', WB_URL.'huaxi/my-stat?' . $querystring);
        $this->mLog('统计总数数据---->Request URL: ' . WB_URL . 'huaxi/my-stat | Request method: GET | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);
        $statisticalData = json_decode($res, true);

        if ($statisticalData['code'] != 1 || empty($statisticalData)) {
            return ['postTotal' => 0, 'favoriteTotal' => 0, "balance" => "0.00", "newCount" => 0];
        }

        return $res;
    }
    /**
     * 设置数据
     * @param string $openid
     * @return
     */
    public function getWeiBeiUserInfo($openid)
    {
        $timestamp = time();
        $token = $this->encryption($timestamp);
        $data = compact('token', 'timestamp', 'openid');
        $querystring = http_build_query($data);
        $res = $this->curl('get', WB_URL.'huaxi/my-profile?' . $querystring);
        $this->mLog('设置数据---->Request URL: ' . WB_URL . 'huaxi/my-profile | Request method: GET | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);
        $userInfo = json_decode($res, true);

        if ($userInfo['code'] != 1 || empty($userInfo)) {
            return false;
        }

        return $res;
    }

    /************************************************商讯************************************************/

    /**
     * 商讯核销人员登陆
     */
    public function getLoginInfo($openid, $userMobile)
    {
        // 检测核销人员真实性
        $sql = "select count(id) as count, verifyUid from t_verify_user where userMobile=$userMobile and expTime>now() and status=0 and deleteStatus=0";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("检测核销人员真实性，接收的核销人手机号为：" . $userMobile . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        if (!$res['count']) {
            return json_encode(['message'=>'ERROR', 'result'=>'用户不存在或已删除！', 'state'=>1]);
        } else { // 加入免登陆用户表
            $verifyUid = $res['verifyUid'];
            $sql = "select count(id) as count, expTime from t_login_authorize where openId='".$openid."' and userMobile=$userMobile and deleteStatus=0";
            $rs = $this->hiup_dbh->query($sql);
            $res = $rs->fetch(PDO::FETCH_ASSOC);
            $this->mLog("检测核销人是否在免登陆用户表，核销人openId为：" . $openid . " | 核销人userMobile为：" . $userMobile . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
            if ($res['count']) { // 在免登陆用户表
                if (strtotime($res['expTime']) <= time()) { // 免登陆时间过期的 更新
                    $sql = "update t_login_authorize set expTime='" . date("Y-m-d H:i:s", strtotime("+30 days")) . "' where openId='".$openid."'";
                    $rs = $this->hiup_dbh->exec($sql);
                    $this->mLog("更新免登陆时间，核销人openId为：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                    if (!$rs) {
                        return json_encode(['message'=>'ERROR', 'result'=>'更新免登陆时间失败', 'state'=>1]);
                    }
                    return json_encode(['message'=>'SUCCESS', 'result'=>'登陆成功，7天免登陆！', 'state'=>0]);
                }
                return json_encode(['message'=>'SUCCESS', 'result'=>'登陆成功！', 'state'=>0]);
            } else { // 不在免登陆用户表的 插入
                $sql = "insert into t_login_authorize
                (openId, verifyUid, userMobile, expTime, addTime, modifyTime, deleteStatus)
                values
                ('".$openid."', '".$verifyUid."',$userMobile,date_add(NOW(), INTERVAL 30 DAY),now(),now(),0)";
                $rs = $this->hiup_dbh->exec($sql);
                $this->mLog("将核销人加入免登陆用户表，核销人openId为：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
                if (!$rs) {
                    return json_encode(['message'=>'ERROR', 'result'=>'新增免登陆用户失败', 'state'=>1]);
                }
                return json_encode(['message'=>'SUCCESS', 'result'=>'登陆成功，30天免登陆！', 'state'=>0]);
            }
        }
    }
    /**
     * 核销，成功时增加核销记录
     */
    public function verifyProduct($verifyCode, $openid, $verifyDesc='')
    {
        $sql = "update t_orders_info set useStatus=1 where verifyCode='".$verifyCode."'";
        $rs = $this->hiup_dbh->exec($sql);
        $this->mLog("更新二维码使用状态，接收的核销码为：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if (!$rs) { // 失败
            return json_encode(["message"=>"ERROR","result"=>$rs,"state"=>"1"]);
        }
        $verifyInfo = [];
        // 成功，增加核销记录
        // 查询核销人信息
        $sql = "select a.openId, a.verifyUid, b.userName from t_login_authorize a left join t_verify_user b on a.verifyUid=b.verifyUid where a.openId='".$openid."'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("更新二维码使用状态成功，查询核销人信息，用户openId：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $verifyInfo['openId'] = $res['openId'];
        $verifyInfo['verifyUid'] = $res['verifyUid'];
        $verifyInfo['verifyUser'] = $res['userName'];

        // 查询订单信息
        $sql = "select a.orderNo, b.productId from t_orders_info a left join t_orders b on a.orderNo=b.orderNo where verifyCode='".$verifyCode."'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("更新二维码使用状态成功，查询订单信息，核销码：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $verifyInfo['orderNo'] = $res['orderNo'];
        $verifyInfo['productId'] = $res['productId'];

        $sql = "insert into t_verify_info
        (openId, verifyUid, orderNo, productId, verifyCode, verifyNumber, verifyUser, verifyDesc, addTime, modifyTime, deleteStatus)
        values
        ('".$verifyInfo['openId']."', '".$verifyInfo['verifyUid']."', '".$verifyInfo['orderNo']."', '".$verifyInfo['productId']."', '".$verifyCode."', 1, '".$verifyInfo['verifyUser']."', '".$verifyDesc."', now(), now(), 0)";
        $rs = $this->hiup_dbh->exec($sql);
        $this->mLog("更新二维码使用状态成功，增加核销记录 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if (!$rs) { // 失败
            return json_encode(["message"=>"ERROR","result"=>'添加核销记录失败',"state"=>"1"]);
        }

        return json_encode(["message"=>"SUCCESS","result"=>$rs,"state"=>"0"]);
    }

    /**
     * fiba3x3核销，成功时增加/更新核销记录
     */
    public function verifyTicket($verifyCode, $openid, $ticketStatus, $verifyDesc='')
    {
        // 查询二维码使用状态
        $sql = "select useStatus from t_orders_info where verifyCode='".$verifyCode."'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("查询二维码使用状态，接收的核销码为：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        if (!$res) {
            return json_encode(["message"=>"ERROR","result"=>"该场查无此票","state"=>"1"]);
        } else {
            if ($res['useStatus'] == 0) {
                $newUseStatus = 1;
                $verifyDesc = '已核入，核销员openid为：'.$openid;
                $message = "核销成功";
            } elseif ($res['useStatus'] == 1) {
                $newUseStatus = 2;
                $verifyDesc = '已核出，核销员openid为：'.$openid;
                $message = "核出成功";
            } else {
                return json_encode(["message"=>"ERROR","result"=>"该票已被核出","state"=>"1"]);
            }
        }
        // 更新二维码及使用状态
        $verifyUrl = $this->createQrCode(WX_URL . "fiba.php?verifyCode=".$verifyCode."&ticketStatus=".$newUseStatus);
        // 开启事务
        $this->hiup_dbh->beginTransaction();
        $sql = "update t_orders_info set useStatus=$newUseStatus, verifyUrl='".$verifyUrl."', modifyTime=now() where verifyCode='".$verifyCode."' and useStatus=$ticketStatus and deleteStatus=0";
        $rs = $this->hiup_dbh->exec($sql);
        $this->mLog("更新二维码使用状态，接收的核销码为：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if (!$rs) { // 失败
            if ($ticketStatus == 0) {
                $msg = '该票已被核销';
            } elseif ($ticketStatus == 1) {
                $msg = '该票已被核出';
            } else {
                $msg = '核销失败';
            }
            return json_encode(["message"=>"ERROR","result"=>$msg,"state"=>"1"]);
        }
        $verifyInfo = [];
        // 成功，增加核销记录
        // 查询核销人信息
        $sql = "select a.openId, a.verifyUid, b.userName from t_login_authorize a left join t_verify_user b on a.verifyUid=b.verifyUid where a.openId='".$openid."'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("更新二维码使用状态成功，查询核销人信息，用户openId：" . $openid . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $verifyInfo['openId'] = $res['openId'];
        $verifyInfo['verifyUid'] = $res['verifyUid'];
        $verifyInfo['verifyUser'] = $res['userName'];

        // 查询订单信息
        $sql = "select a.orderNo, b.productId from t_orders_info a left join t_orders b on a.orderNo=b.orderNo where verifyCode='".$verifyCode."'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("更新二维码使用状态成功，查询订单信息，核销码：" . $verifyCode . " | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $verifyInfo['orderNo'] = $res['orderNo'];
        $verifyInfo['productId'] = $res['productId'];
        // 查询核销记录是否已存在
        $sql = "select count(id) as count from t_verify_info where verifyCode='" . $verifyCode . "'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("更新二维码使用状态成功，查询核销记录是否已存在 | 执行语句：" . $sql . " | 返回值为：" . $res . PHP_EOL);
        if ($res['count']) { // 更新核销记录
            $sql = "update t_verify_info set verifyDesc='".$verifyDesc."', modifyTime=now() where verifyCode='".$verifyCode."'";
            $rs = $this->hiup_dbh->exec($sql);
            $this->mLog("更新二维码使用状态成功，更新核销记录 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
            if (!$rs) { // 更新失败
                $this->hiup_dbh->rollBack();
                return json_encode(["message"=>"ERROR","result"=>'更新核销记录失败',"state"=>"1"]);
            }
        } else { // 增加核销记录
            $sql = "insert into t_verify_info
            (openId, verifyUid, orderNo, productId, verifyCode, verifyNumber, verifyUser, verifyDesc, addTime, modifyTime, deleteStatus)
            values
            ('".$verifyInfo['openId']."', '".$verifyInfo['verifyUid']."', '".$verifyInfo['orderNo']."', '".$verifyInfo['productId']."', '".$verifyCode."', 1, '".$verifyInfo['verifyUser']."', '".$verifyDesc."', now(), now(), 0)";
            $rs = $this->hiup_dbh->exec($sql);
            $this->mLog("更新二维码使用状态成功，增加核销记录 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
            if (!$rs) { // 增加失败
                $this->hiup_dbh->rollBack();
                return json_encode(["message"=>"ERROR","result"=>'增加核销记录失败',"state"=>"1"]);
            }
        }
        $this->hiup_dbh->commit();
        // 核出成功，库存加1
        if ($newUseStatus == 2) {
            $kucun = $this->redis->incr($verifyInfo['productId']);
            $this->mLog("核出成功，库存加1 | productId：" . $verifyInfo['productId'] . " | 返回库存数为：" . $kucun . PHP_EOL);
        }

        return json_encode(["message"=>"SUCCESS","result"=>$message,"state"=>"0"]);
    }

    /************************************************停车************************************************/

    /**
     * 绑定车牌
     * @param uid, carNum
     * @return
     */
    public function bindingCar($uid, $carNum, $openid)
    {
        $data = compact('uid', 'carNum', 'openid');
        $json = json_encode($data);

        $res = $this->curl('post', APP_PARKING_URL.'parking/bindingCar.json',$json, 'json');
        $this->mLog('绑定车牌---->Request URL: ' . APP_PARKING_URL . 'parking/bindingCar.json | Request method: POST | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 查询车牌
     * @param uid
     * @return
     */
    public function queryCar($uid)
    {
        $data = compact('uid');
        // $json = json_encode($data);
        $json = 'uid='.$uid;

        $res = $this->curl('get', APP_PARKING_URL.'parking/queryCar.json?' . $json);
        $this->mLog('查询车牌---->Request URL: ' . APP_PARKING_URL . 'parking/queryCar.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 删除车牌
     * @param uid carNum
     * @return
     */
    public function deleteCarNum($uid, $carNum)
    {
        $data = compact('uid', 'carNum');
        // $json = json_encode($data);
        $json = 'uid='.$uid.'&carNum='.$carNum;

        $res = $this->curl('get', APP_PARKING_URL.'parking/deleteCarNum.json?'.$json);
        $this->mLog('删除车牌---->Request URL: ' . APP_PARKING_URL . 'parking/deleteCarNum.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取在场停车信息
     * @param uid
     * @return
     */
    public function getInParkInfo($uid, $carNum = '' ,$cityid)
    {
        // if (empty($carNum)) {
        //     $data = 'uid='.$uid;
        // } else {
        //     $data = 'uid='.$uid.'&carNum='.$carNum;
        // }
        $json ='uid='.$uid.'&carNum='.$carNum.'&cityId='.$cityid;

        $res = $this->curl('get', APP_PARKING_URL.'parking/inParkCar.json?' . $json);
        $this->mLog('获取在场停车信息---->Request URL: ' . APP_PARKING_URL . 'parking/inParkCar.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取停车费用信息
     * @param uid
     * @return
     */
    public function getCostInfo($uid, $carNum,$cityid)
    {
        $data = compact('uid', 'carNum','cityid');
        // $json = json_encode($data);
        $json = 'uid='.$uid.'&carNum='.$carNum.'&cityId='.$cityid;

        $res = $this->curl('get', APP_PARKING_URL.'parking/cost.json?' . $json);
        $this->mLog('获取停车费用信息---->Request URL: ' . APP_PARKING_URL . 'parking/cost.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取停车记录
     * @param uid
     * @return
     */
    public function getParkingRecord($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);

        $res = $this->curl('post', APP_PARKING_URL.'parking/record.json' , $json , "json");
        $this->mLog('获取停车记录---->Request URL: ' . APP_PARKING_URL . 'parking/record.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取停车微信支付签名
     * @param uid carNum parkAmount
     * @return string
     */
    public function getParkingPaySign($uid, $carNum, $parkAmount, $openId, $tradeId,$cityId)
    {
        $data = compact('uid', "carNum", "parkAmount", "openId", "tradeId", "cityId");
        $json = json_encode($data);

        $res = $this->curl('post', APP_DEV_URL.'parking/payment.json' , $json ,'json');
        $this->mLog('获取停车微信支付签名---->Request URL: ' . APP_DEV_URL . 'parking/payment.json | Request method: GET | Param：' . $json . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取免费离场时间
     * @param parkId
     * @return string
     */
    public function getFreeOutTime($parkId)
    {
        $data = compact('parkId');
        // $json = json_encode($data);
        $json ='parkId='.$parkId;
        // $postData = array(
        //    'data' => $json
        // );
        // $postData = http_build_query($postData);
        $res = $this->curl('get', APP_PARKING_URL.'parking/getPark.json?'. $json);
        // $this->mLog('获取免费离场时间---->Request URL: ' . APP_PARKING_URL . 'parking/getPark.json | Request method: POST | Param：' . $postData . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }
    /**
     * 获取停车记录详情
     * @param id
     * @return string
     */
    public function getRecordDetail($id,$uid)
    {
        $data = compact('id','uid');
        $json = json_encode($data);
        // $postData = array(
        //    'data' => $json
        // );
        // $postData = http_build_query($postData);
        $res = $this->curl('post', APP_PARKING_URL.'parking/recordDetail.json', $json,'json');
        $this->mLog('获取停车记录详情---->Request URL: ' . APP_PARKING_URL . 'parking/recordDetail.json | Request method: POST | Param：' . $postData . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取停车支付后的加分倍率
     * @param string uid
     * @return
     */
    public function getMemberRate($uid)
    {
        $data = compact('uid');
        $json = json_encode($data);
        $postData = array(
           'data' => $json
        );
        $postData = http_build_query($postData);
        $res = $this->curl('post', APP_URL.'HXWYServiceMain/user/require_user_point.json', $postData);
        $this->mLog('获取停车支付后的加分倍率---->Request URL: ' . APP_URL . 'HXWYServiceMain/user/require_user_point.json | Request method: POST | Param：' . $postData . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取停车banner
     * @param string uid
     * @return
     */
     public function queryListByCityId($cityId) {
         $data = compact('cityId');
         $json = json_encode($data);
         $postData = http_build_query($data);
         $res = $this->curl('post', APP_URL . 'HXWYParkingMain/parking/queryListByCityId.json', $json ,"json");
         $this->mLog('获取轮播图详情---->Request URL: ' . APP_PARKING_URL . 'parking/queryListByCityId.json | Request method: POST | Param：' . $postData . '| Return data: ' . $res . PHP_EOL);

         return $res;
     }

     /**
      * 会员须知
      * @param
      * @return
      */
     public function getRemark($cityId) {
        //  $data = compact('cityId');
        //  $json = json_encode($data);
        //  $postData = http_build_query($data);
         $json="cityId=".$cityId;
         $res = $this->curl('get', APP_URL . 'HXWYParkingMain/parking/getRemark.json?'.$json);
         $this->mLog('获取轮播图详情---->Request URL: ' . APP_PARKING_URL . 'parking/getRemark.json | Request method: POST | Param：' . $postData . '| Return data: ' . $res . PHP_EOL);

         return $res;
     }

     /**
      * 停车场列表
      * @param
      * @return
      */
     public function queryParkList($cityId) {
         $json="cityId=".$cityId;
         $res = $this->curl('get', APP_URL . 'HXWYParkingMain/parking/queryParkList.json?'.$json);
         $this->mLog('获取轮播图详情---->Request URL: ' . APP_PARKING_URL . 'parking/queryParkList.json | Request method: POST | Param：' . $postData . '| Return data: ' . $res . PHP_EOL);

         return $res;
     }
    /************************************************微信会员卡************************************************/

    /**
     * 卡券 api_ticket
     */
    public function getApiTicket()
    {
        $api_ticket = $this->redis->get('API_TICKET');
        $this->mLog('获取redis中存储的api_ticket---->'. $api_ticket . PHP_EOL);
        if (!$api_ticket) {
            $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=".$this->getAccess_Token()."&type=wx_card";
            $res = json_decode($this->curl('get', $url));
            $api_ticket = $res->ticket;
            $this->redis->set('API_TICKET', $api_ticket);
            $this->redis->expire('API_TICKET', 7000);
            $this->mLog("api_ticket: " . $api_ticket . PHP_EOL);
        }

        return $api_ticket;
    }

    /**
     * 卡券签名
     */
    public function getCardSign($timestamp, $api_ticket, $nonceStr, $cardId){
        $card = array($timestamp, $api_ticket, $cardId, $nonceStr);
        sort($card,SORT_STRING);
        $cardSign = '';
        foreach($card as $k=>$v){
            $cardSign .= $v;
        }
        $this->mLog("卡券签名---->".sha1($cardSign) . PHP_EOL);

        return sha1($cardSign);
    }

    /**
     * 获取默认会员卡信息
     * @return cardId
     */
    public function getDefaultCardId()
    {
        $sql = "select * from t_membercard_list where deleteStatus=0 and isDefault=0";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("获取默认会员卡---->执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);

        return $res;
    }

    /**
     * 查询用户会员卡信息
     * @param uid
     * @return
     */
    public function getUserCardInfo($openid, $cardId)
    {
        $hasCard = 0; // 没有卡
        $info = []; // 卡信息
        if (!is_null($cardId) && !empty($cardId)) {
            $sql = "select * from t_card_userinfo where openId = '". $openid ."' and cardId = '" . $cardId . "'";
            $rs = $this->hiup_dbh->query($sql);
            $info = $rs->fetch(PDO::FETCH_ASSOC);
            $this->mLog("查询会员卡信息---->执行语句：" . $sql . " | 返回值为：" . json_encode($info) . PHP_EOL);
        }
        if ($info && $info['deleteStatus']!=1) { // 有卡
            $hasCard = 1;
        }
        $dataArr = json_encode(["hasCard" => $hasCard, "result" => $info]);
        $this->mLog("查询会员卡信息---->返回值为：" . $dataArr . PHP_EOL);

        return $dataArr;
    }

    /**
     * 查询用户是否有卡
     * @param string $mobile
     * @return
     */
    public function checkHasCard($uid)
    {
        $res = $this->getDefaultCardId();
        $cardId = $res['cardId'];
        $sql = "select count(id) as count from t_card_userinfo where uid = '". $uid ."' and cardId = '" . $cardId . "'";
        $rs = $this->hiup_dbh->query($sql);
        $info = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("查询用户是否有卡---->执行语句：" . $sql . " | 返回值为：" . json_encode($info) . PHP_EOL);

        return $info['count'] > 0;
    }

    /**
     * 修改用户会员卡信息
     * @param uid
     * @return
     */
    public function reviseUserCardInfo($code, $openid, $dataArr)
    {
        $this->mLog('修改户会员卡信息---->接收得参数包为:' . json_encode($dataArr) . PHP_EOL);

        if (empty($code)) {
            return json_encode(["message"=>"ERROR", "result"=>"param code is null", "state"=>"1"]);
        }
        if (empty($openid)) {
            return json_encode(["message"=>"ERROR", "result"=>"param openid is null", "state"=>"1"]);
        }

        // 获取默认会员卡
        $res = $this->getDefaultCardId();
        $cardId = $res['cardId'];

        // 检测检测会员资料是否存在
        $sql = "select count(*) as count from t_card_userinfo where cardId='" . $cardId . "' and openid='" . $openid . "'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("修改用户会员卡信息,检测会员资料是否存在---->执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);

        if ($res['count'] == 0) {
            return json_encode(["message"=>"ERROR", "result"=>"会员资料不存在", "state"=>"-1"]);
        }

        $sql = "update t_card_userinfo set ";
        foreach ($dataArr as $k => $v) {
            $sql .= $k . "='" . $v . "',";
        }
        $sql = rtrim($sql , ',');
        $sql .= " where openid='" . $openid . "' and cardId='" . $cardId . "'";

        $rs = $this->hiup_dbh->exec($sql);
        $this->mLog("修改用户会员卡信息---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);

        if (!$rs) {
            return json_encode(["message"=>"ERROR", "result"=>"修改用户会员卡信息失败", "state"=>"1"]);
        }

        // 修改会员卡背景
        $data = [];
        $data['timestamp'] = time();
        $data['sign'] = md5(COUPON_SIGNCODE.$data['timestamp']);
        $data['card_id'] = $cardId;
        $data['code'] = $code;
        $data['name'] = $dataArr['name'];
        $res = $this->curl('post', COUPON_URL . "Home/Requestajax/updateUserInfo", $data);
        $upRes = json_decode($res);
        $this->mLog('修改自定义会员卡背景图---->Request URL: ' . COUPON_URL . 'Home/Requestajax/updateUserInfo | Request method: POST | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);

        if ($upRes->state == 0) {
            $this->mLog('修改自定义会员卡背景图成功');
        } else {
            $this->mLog('修改自定义会员卡背景图失败');
        }

        return json_encode(["message"=>"SUCCESS", "result"=>"修改用户会员卡信息成功", "state"=>"0"]);
    }

    /**
     * 会员卡信息入库
     */
    public function getMemberCard($dataArr)
    {
        $this->mLog('会员卡信息入库---->接收得参数包为:' . json_encode($dataArr) . PHP_EOL);

        if (empty($dataArr['cardId'])) {
            return json_encode(["message"=>"ERROR", "result"=>"param cardId is null", "state"=>"1"]);
        }
        if (empty($dataArr['openid'])) {
            return json_encode(["message"=>"ERROR", "result"=>"param openid is null", "state"=>"1"]);
        }
        if (empty($dataArr['mobile'])) {
            return json_encode(["message"=>"ERROR", "result"=>"param mobile is null", "state"=>"1"]);
        }
        if (empty($dataArr['name'])) {
            return json_encode(["message"=>"ERROR", "result"=>"param name is null", "state"=>"1"]);
        }
        if (empty($dataArr['birthday'])) {
            return json_encode(["message"=>"ERROR", "result"=>"param birthday is null", "state"=>"1"]);
        }

        // 检测检测会员资料是否已存在
        $sql = "select count(*) as count from t_card_userinfo where cardId='" . $dataArr['cardId'] . "' and openid='" . $dataArr['openid'] . "'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        $this->mLog("会员卡信息入库,检测会员资料是否已存在---->执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        if ($res['count'] != 0) {
            return json_encode(["message"=>"ERROR", "result"=>"会员资料已存在", "state"=>"-1"]);
        }
        // 会员资料入库
        $dataArr['addTime'] = date("Y-m-d H:i:s");
        $dataArr['modifyTime'] = date("Y-m-d H:i:s");
        foreach ($dataArr as $k => $v) {
            if ($v == '') {
                unset($dataArr[$k]);
            }
        }

        $sql = 'insert into t_card_userinfo (';
        $sql .= implode(',', array_keys($dataArr)) . ") values ('";
        $sql .= implode("','", array_values($dataArr)) . "')";

        $rs = $this->hiup_dbh->exec($sql);
        $this->mLog("会员资料入库---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if (!$rs) {
            return json_encode(["message"=>"ERROR", "result"=>"会员资料入库失败", "state"=>"1"]);
        }

        return json_encode(["message"=>"SUCCESS", "result"=>"会员资料入库成功", "state"=>"0"]);
    }

    /**
     * 新增
     * @param uid
     * @return
     */
    public function setMemberCardFalg($uid,$mobile)
    {

        if(!$uid){
            return json_encode(["message"=>"ERROR", "result"=>"uid is null", "state"=>"1"]);
        }elseif(!$mobile){
            return json_encode(["message"=>"ERROR", "result"=>"mobile is null", "state"=>"1"]);
        }

        $sql = "update t_card_userinfo set getCardFalg = 1 where uid='" . $uid . "' and mobile='" . $mobile . "' and deleteStatus = 0";
        $this->mLog("会员注冊 点击领取按钮更新该记录状态---->执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);

        $rs = $this->hiup_dbh->query($sql);
        if(!($rs && $rs == 1)){
            //沒有、不存在
            return json_encode(["message"=>"ERROR", "result"=>"data is null", "state"=>"1"]);
        }
        return json_encode(["message"=>"SUCCESS", "result"=>"更新成功", "state"=>"0"]);;
    }

    /************************************************竞拍业务************************************************/

    /**
     * 获取用户竞拍订单列表
     * @param uid
     * @return
     */
    public function getAuctionOrderList($uid)
    {
        $url = AUCTION_URL . "goods/get_user_order_list.json";
        $data = compact('uid');
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('获取用户竞拍订单列表---->Request URL: ' . $url . ' | Request method: POST | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 获取用户竞拍订单详情
     * @param uid orderID
     * @return
     */
    public function getAuctionOrderDetail($uid, $orderID)
    {
        // echo 33333333;die;
        $url = AUCTION_URL . "goods/get_user_order_detail.json";
        $data = compact('uid', 'orderID');
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('获取用户竞拍订单详情---->Request URL: ' . $url . ' | Request method: POST | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 竞拍订单详情添加收货信息
     * @param uid orderID
     * @return
     */
    public function addReceiptInfo($uid, $orderID, $receAddress, $receName, $receMobile)
    {
        $url = AUCTION_URL . "goods/add_order_address.json";
        $data = compact('uid', 'orderID', 'receAddress', 'receName', 'receMobile');
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('竞拍订单详情添加收货信息---->Request URL: ' . $url . ' | Request method: POST | Param：' . json_encode($data) . '| Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 查询竞拍活动是否存在
     * @param
     * @return int 0 1
     */
    public function checkHasActivity($cityId)
    {
        $url = AUCTION_URL . "goods/has_activity.json";
        $res = $this->curl('post', $url, json_encode(compact('cityId')), 'json');
        $this->mLog('查询竞拍活动是否存在---->Request URL: ' . $url . ' | Request method: POST | Param：'.json_encode(compact('cityId')).' | Return data: ' . $res . PHP_EOL);

        return $res;
    }

    /**
     * 更新竞拍订单使用状态
     * @param string uid
     * @param string orderID
     * @return
     */
    public function updateOrderUseStatus($uid, $orderID)
    {
        $url = AUCTION_URL . "goods/update_use_status.json";
        $data = compact('uid', 'orderID');
        $res = $this->curl('post', $url, json_encode($data), 'json');
        $this->mLog('更新竞拍订单使用状态---->Request URL: ' . $url . ' | Request method: POST | Param：' . json_encode($data) . ' | Return data: ' . $res . PHP_EOL);

        return $res;
    }
}
