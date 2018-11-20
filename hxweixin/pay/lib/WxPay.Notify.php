<?php
/**
 *
 * 回调基础类
 * @author widyhu
 *
 */
require_once '../api/log.php';
$logHandler = new CLogFileHandler("../logs/" . date('Y-m-d') . '.log');
$log = Log::Init($logHandler, 15);
class WxPayNotify extends WxPayNotifyReply
{
    /**
     *
     * 回调入口
     * @param bool $needSign  是否需要签名输出
     */
    final public function Handle($needSign = true)
    {
        $msg = "OK";
        //当返回false的时候，表示notify中调用NotifyCallBack回调失败获取签名校验失败，此时直接回复失败
        $result = WxpayApi::notify(array($this, 'NotifyCallBack'), $msg);

        if ($result == false) {
            $this->SetReturn_code("FAIL");
            $this->SetReturn_msg($msg);
            $this->ReplyNotify(false);
            return;
        } else {
            //该分支在成功回调到NotifyCallBack方法，处理完成之后流程
            //1.调用服务端接口 传入 支付流水号
            //2.服务端返回成功后 调用查询接口 显示用户最新金币数量
            $xml = $GLOBALS['HTTP_RAW_POST_DATA'];

            libxml_disable_entity_loader(true);
            $values = json_decode(json_encode(simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA)), true);
            Log::DEBUG("outTradeNo:" . $values['out_trade_no']);
            $data = array(
                'outTradeNo' => $values['out_trade_no']  //参数
            );
            $data = json_encode($data);
            $info = $this->curl('http://app.huaxiweiying.com/HXWYServiceMain/wechat/order/recharge.json?data='.$data);
            $infos = json_decode($info, true);
            Log::DEBUG("info:" .$info);

            if ($infos['state'] == 0) {
                $this->SetReturn_code("SUCCESS");
                $this->SetReturn_msg("OK");
            } else {
                $this->SetReturn_code("FAIL");
                $this->SetReturn_msg($msg);
                $this->ReplyNotify(false);
                return;
            }

            //header("Location:http://wx.huaxiweiying.com/weixin/jinbichongzhi/index.html");
        }
        $this->ReplyNotify($needSign);
    }
    public function curl($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);

        $output = curl_exec($ch);
        $aStatus = curl_getinfo($ch);
        curl_close($ch);

        return $output;
    }

    /**
     *
     * 回调方法入口，子类可重写该方法
     * 注意：
     * 1、微信回调超时时间为2s，建议用户使用异步处理流程，确认成功之后立刻回复微信服务器
     * 2、微信服务器在调用失败或者接到回包为非确认包的时候，会发起重试，需确保你的回调是可以重入
     * @param array $data 回调解释出的参数
     * @param string $msg 如果回调处理失败，可以将错误信息输出到该方法
     * @return true回调出来完成不需要继续回调，false回调处理未完成需要继续回调
     */
    public function NotifyProcess($data, &$msg)
    {
        //TODO 用户基础该类之后需要重写该方法，成功的时候返回true，失败返回false
        return true;
    }

    /**
     *
     * notify回调方法，该方法中需要赋值需要输出的参数,不可重写
     * @param array $data
     * @return true回调出来完成不需要继续回调，false回调处理未完成需要继续回调
     */
    final public function NotifyCallBack($data)
    {
        $msg = "OK";
        $result = $this->NotifyProcess($data, $msg);

        if ($result == true) {
            $this->SetReturn_code("SUCCESS");
            $this->SetReturn_msg("OK");
        } else {
            $this->SetReturn_code("FAIL");
            $this->SetReturn_msg($msg);
        }
        return $result;
    }

    /**
     *
     * 回复通知
     * @param bool $needSign 是否需要签名输出
     */
    final private function ReplyNotify($needSign = true)
    {
        //如果需要签名
        if ($needSign == true &&
            $this->GetReturn_code($return_code) == "SUCCESS") {
            $this->SetSign();
        }
        WxpayApi::replyNotify($this->ToXml());
    }
}
