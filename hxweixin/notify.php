<?php
ini_set('date.timezone', 'Asia/Shanghai');
error_reporting(E_ERROR);

require_once __DIR__ . '/log.php';
require_once __DIR__ . '/local_conf.php';
require_once __DIR__ . "/lib/WxPay.Api.php";
require_once __DIR__ . '/lib/WxPay.Notify.php';

//初始化日志
$logHandler = new CLogFileHandler(__DIR__ . '/log/WXPay-'. date('Y-m-d') . '.log');
$log = Log::Init($logHandler, 15);
class PayNotifyCallBack extends WxPayNotify
{
    public $hiup_dbh = null;
    public function __construct() {
        if ($this->hiup_dbh == null) {
            try {
                $this->hiup_dbh = new PDO(HIUP_DSN, HIUP_USER, HIUP_PASSWORD);
                $this->hiup_dbh->query('set names utf8;');
            } catch (PDOException $e) {
                $this->mLog('Connection failed: ' . $e ->getMessage());
            }
        }
    }
    //查询订单
    public function Queryorder($transaction_id)
    {
        $input = new WxPayOrderQuery();
        $input->SetTransaction_id($transaction_id);
        $result = WxPayApi::orderQuery($input);
        Log::DEBUG("query:" . json_encode($result));
        if (array_key_exists("return_code", $result)
            && array_key_exists("result_code", $result)
            && $result["return_code"] == "SUCCESS"
            && $result["result_code"] == "SUCCESS") {

            return true;
        }

        return false;
    }

    //重写回调处理函数
    public function NotifyProcess($data, &$msg)
    {
        Log::DEBUG("call back:" . json_encode($data) . PHP_EOL);
        $notfiyOutput = array();

        if (!array_key_exists("transaction_id", $data)) {
            $msg = "输入参数不正确";

            return false;
        }
        //查询订单，判断订单真实性
        if (!$this->Queryorder($data["transaction_id"])) {
            $msg = "订单查询失败";

            return false;
        }

        // 验签成功, 回调数据入库
        $dataArr = [];
        $dataArr['appid'] = $data['appid'];
        $dataArr['bank_type'] = $data['bank_type'];
        $dataArr['cash_fee'] = $data['cash_fee'];
        $dataArr['fee_type'] = $data['fee_type'];
        $dataArr['is_subscribe'] = $data['is_subscribe'];
        $dataArr['mch_id'] = $data['mch_id'];
        $dataArr['nonce_str'] = $data['nonce_str'];
        $dataArr['openid'] = $data['openid'];
        $dataArr['out_trade_no'] = $data['out_trade_no'];
        $dataArr['result_code'] = $data['result_code'];
        $dataArr['return_code'] = $data['return_code'];
        $dataArr['sign'] = $data['sign'];
        $dataArr['time_end'] = $data['time_end'];
        $dataArr['total_fee'] = $data['total_fee'];
        $dataArr['trade_type'] = $data['trade_type'];
        $dataArr['transaction_id'] = $data['transaction_id'];
        $dataArr['addTime'] = date("Y-m-d H:i:s");
        Log::DEBUG("验签成功, 组织好的微信回调数据:" . json_encode($dataArr) . PHP_EOL);

        $sql = "insert into t_trade_wechat_info (";
        $sql .= implode(',' , array_keys($dataArr)) . ") values ('";
        $sql .= implode("','" , array_values($dataArr)) . "')";
        $rs = $this->hiup_dbh->exec($sql);
        Log::DEBUG("验签成功, 组织好的微信回调数据入库 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if (!$rs) {
            $msg = "微信回调数据入库失败";

            return false;
        }

        // 通过支付流水号获得订单号
        $sql = "select orderNo from t_trade_info where tradeNo='" . $data['out_trade_no'] . "'";
        $rs = $this->hiup_dbh->query($sql);
        $res = $rs->fetch(PDO::FETCH_ASSOC);
        Log::DEBUG("通过支付流水号获得订单号 | 执行语句：" . $sql . " | 返回值为：" . json_encode($res) . PHP_EOL);
        $orderNo = $res['orderNo'];

        // 开启事务
        $this->hiup_dbh->beginTransaction();

        // 更新订单支付表支付状态
        $sql = "update t_orders_trade set payStatus=1, modifyTime=now() where orderNo='" . $orderNo . "'";
        $rs = $this->hiup_dbh->exec($sql);
        Log::DEBUG("更新订单支付表支付状态 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if ($rs != 1) {
            $this->hiup_dbh->rollBack();
            $msg = "更新订单支付表支付状态失败";

            return false;
        }
        // 更新订单主表支付状态
        $sql = "update t_orders set orderStatus=1, modifyTime=now() where orderNo='" . $orderNo . "' and orderStatus=0";
        $rs = $this->hiup_dbh->exec($sql);
        Log::DEBUG("更新订单主表支付状态 | 执行语句：" . $sql . " | 返回值为：" . $rs . PHP_EOL);
        if ($rs != 1) {
            $this->hiup_dbh->rollBack();
            $msg = "更新订单主表支付状态失败";

            return false;
        }

        $this->hiup_dbh->commit();

        return true;
    }
}

Log::DEBUG("----------------------begin notify----------------------" . PHP_EOL);
$notify = new PayNotifyCallBack();
$notify->Handle(false);
