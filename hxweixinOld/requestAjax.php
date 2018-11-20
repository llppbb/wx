<?php
/**
 *ajax请求
 */
header('Access-Control-Allow-Origin:*');
require_once './Wxapi.php';
$tools = new WxApi();

if (isset($_SERVER["HTTP_X_REQUESTED_WITH"]) && strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) == "xmlhttprequest") {
	/*$sign = $_REQUEST['sign'];
	$timestamp = $_REQUEST['timestamp'];
	if (md5(MELIVE_SIGN.$timestamp) != $sign || time()-$timestamp > 60) {
	echo json_encode(['message'=>'ERROR', 'result'=>'无效请求或超时！', 'state'=>"1"]);
	exit;
	}*/
	extract($_REQUEST);

	/*********************************用户业务 start****************************/
	if ($identity == 'getUserCoin') {
		// 获取用户金币
		echo $tools->getUserCoin($uid);
	} elseif ($identity == 'getUserPoint') {
		// 获取用户积分
		echo $tools->getUserPoint($uid);
	} elseif ($identity == 'getUsedPoint') {
		// 获取已用积分
		echo $tools->getUsedPoint($uid);
	} elseif ($identity == 'qiandao') {
		// 获取用户签到记录
		// echo $tools->getSignInfo($uid, $mobile);
		echo $tools->signIn($uid);
	} elseif ($identity == 'getWxUserInfo') {
		// 获取用户微信头像，昵称等信息
		echo $tools->getWxUserInfo($access_token, $openid);
	} elseif ($identity == 'getWeiBeiUserInfo') {
		// 获取用户微贝头像，昵称等信息
		echo $tools->getWeiBeiUserInfo($openid);
	} elseif ($identity == 'getPraiseNum') {
		// 获取用户微贝点赞数，微贴数等
		echo $tools->getPraiseNum($openid);
	} elseif ($identity == 'sendMsg') {
		// 发送短信
		echo $tools->sendMsg($mobile, $channel);
	} elseif ($identity == 'bindMobile') {
		// 绑定手机
		if (!$tools->checkSMSCode($mobile, $verified)) { // 校验短信验证码
			echo json_encode(["message" => "ERROR", "result" => "验证码错误", "state" => "1"]);
		} else {
			$userInfo = $tools->getUserInfoByMobile($mobile);
			if (!empty($userInfo["result"]["uid"]) && $tools->checkHasCard($userInfo["result"]["uid"])) {
				// 通过手机号查询到用户，检测用户是否已经有卡
				echo json_encode(["message" => "ERROR", "result" => "手机号对应的用户已经有卡", "state" => "1"]);
			} else {
				echo $tools->getByMobile($mobile, $openid, $unionid);
			}
		}
	} elseif ($identity == 'getUserPointRecord') {
		// 获取用户积分记录
		echo $tools->getUserPointRecord($uid, $type, $page);
	} elseif ($identity == 'getUserCurrentPoint') {
		// 获取用户本年度当前积分
		echo $tools->getUserCurrentPoint($uid);
		/*********************************用户业务 end******************************/

		/*********************************贝泰业务 start****************************/
	} elseif ($identity == 'editAddress') {
		// 编辑/添加贝泰订单收货地址
		echo $tools->addBeiTaiOrderAddress($uid, $orderNo, $receiverName, $receiverMobile, $receiverAddress);
	} elseif ($identity == 'goShopping') {
		// 跳转贝泰商城
		echo $tools->getBeiTaiMarketURL($uid, $channel);
	} elseif ($identity == 'exchange') {
		// 积分换金币
		echo $tools->pointExchangeScore($uid, $productId);
		/*********************************贝泰业务 end******************************/

		/*********************************一手票业务 start**************************/
	} elseif ($identity == 'getBannerList') {
		// 获取banner列表
		echo $tools->getBannerList();
	} elseif ($identity == 'getTypeList') {
		// 获取项目类型列表
		echo $tools->getTypeList();
	} elseif ($identity == 'getProgramList') {
		// 项目列表
		echo $tools->getProgramList($typeId, $page, $pageSize);
	} elseif ($identity == 'getProgramDetail') {
		// 项目详情
		echo $tools->getProgramDetail($programId);
	} elseif ($identity == 'getSchedulePriceInfo') {
		// 获取场次价格信息
		echo $tools->getSchedulePriceInfo($onlineID);
	} elseif ($identity == 'getVenueAreaInfo') {
		// 获取价格对应的区域
		echo $tools->getVenueAreaInfo($onlineID, $scheduleId, $ticketPriceId);
	} elseif ($identity == 'getSeatInfo') {
		// 获取指定价格、指定区域对应的座位
		echo $tools->getSeatInfo($uid, $onlineID, $scheduleId, $ticketPriceId, $venueAreaId);
	} elseif ($identity == 'SaleReminder') {
		// 开售提醒
		echo $tools->ticketReminding($uid, $onlineID, $mobile);
	} elseif ($identity == 'ShortageRegistration') {
		// 缺货登记
		if (!isset($packgePriceId)) {
			$packgePriceId = '';
		}
		echo $tools->ticketRefillReminding($uid, $onlineID, $scheduleId, $ticketPriceId, $packgePriceId, $mobile);
	} elseif ($identity == 'localLockSeat') {
		// 本地缓存锁座
		echo $tools->localLockSeat($uid, $onlineID, $scheduleId, $ticketPriceId, $ticketNum, $packTicketId, $seatInfo, $flag);
	} elseif ($identity == 'lockSeat') {
		// 一手票锁座
		$lockInfo = $tools->lockSeat($uid, $onlineID, $scheduleId, $ticketPriceId, $ticketNum, $packTicketId, $seatInfo);
		if ($lockInfo['state'] == "0") {
			// 锁座成功
			$payInfo['orderNo'] = $lockInfo['result']['orderNo'];
			$json = json_encode($payInfo);
			echo $json;
		} elseif ($lockInfo['state'] == "1") {
			// 有未支付订单或锁座频繁
			echo json_encode($lockInfo);
		} else {
			// 其它错误
			echo -1;
		}
	} elseif ($identity == 'placeOrder') {
		// 一手票下单
		echo $tools->placeOrder($uid, $orderNo, $buyerNumber, $ticketType, $receiverMobile, $receiverAddress, $receiverName, $viewers, $useRule, $deliverType);
	} elseif ($identity == 'WXPayApi') {
		// 一手票获取支付签名
		echo $tools->WXPayApi($uid, $orderNo, $openId);
	} elseif ($identity == 'getTicketOrderList') {
		// 一手票订单列表
		echo $tools->getTicketOrderList($uid, $ticketFolderType, $pageSize, $page);
	} elseif ($identity == 'getTicketOrderDetail') {
		// 一手票订单详情
		echo $tools->getTicketOrderDetail($uid, $orderNo);
	} elseif ($identity == 'cancelTicketOrder') {
		// 一手票取消订单
		echo $tools->cancelTicketOrder($uid, $orderNo);
	} elseif ($identity == 'deleteUserAddress') {
		// 一手票删除常用收货地址
		echo $tools->deleteUserAddress($id, $uid);
	} elseif ($identity == 'addUserAddress') {
		// 一手票新增常用收货地址
		echo $tools->addUserAddress($uid, $name, $mobile, $address);
	} elseif ($identity == 'updateUserAddress') {
		// 一手票更新常用收货地址
		echo $tools->updateUserAddress($id, $uid, $name, $mobile, $address, $defaultValue);
	} elseif ($identity == 'getAddressList') {
		// 一手票获取常用收货地址列表
		$addressList = $tools->getAddressList($uid);
		if ($addressList != false) {
			echo json_encode(['message' => 'SUCCESS', 'result' => $addressList, 'state' => 0]);
		} else {
			echo json_encode(['message' => 'ERROR', 'result' => null, 'state' => 1]);
		}
	} elseif ($identity == 'addUserContacts') {
		// 一手票添加实名制信息
		echo $tools->addUserContacts($uid, $name, $idCard, $cardName, $cardType);
	} elseif ($identity == 'deleteUserContacts') {
		// 一手票删除常用联系人
		echo $tools->deleteUserContacts($id, $uid);
	} elseif ($identity == 'checkTicketInfo') {
		// 进场监测
		echo $tools->checkTicketInfo($programId, $scheduleId);
	} elseif ($identity == 'chooseSeatRule') {
		// 选座规则
		echo $tools->chooseSeatRule($seatArr);
		/*********************************一手票业务 end****************************/

		/**********************************商讯业务 start***************************/
	} elseif ($identity == 'verifyProduct') {
		// 商讯核销
		echo $tools->verifyProduct($verifyCode, $openid, $verifyDesc = '');
	} elseif ($identity == 'verifyTicket') {
		// fiba3x3核销
		echo $tools->verifyTicket($verifyCode, $openid, $ticketStatus);
	} elseif ($identity == 'verifyLogin') {
		// 商讯核销人员登陆
		echo $tools->getLoginInfo($openid, $userMobile);
		/**********************************商讯业务 end*****************************/

		/**********************************停车业务 START***************************/
	} elseif ($identity == 'bindingCar') {
		// 绑定车牌
		echo $tools->bindingCar($uid, $carNum, $openid);
	} elseif ($identity == 'queryCar') {
		// 查询车牌
		echo $tools->queryCar($uid);
	} elseif ($identity == 'deleteCarNum') {
		// 删除车牌
		echo $tools->deleteCarNum($uid, $carNum);
	} elseif ($identity == 'getInParkInfo') {
		// 获取在场停车信息
		echo $tools->getInParkInfo($uid, $carNum, $cityid);
	} elseif ($identity == 'getCostInfo') {
		// 获取停车费用信息
		echo $tools->getCostInfo($uid, $carNum, $cityid);
	} elseif ($identity == 'getParkingRecord') {
		// 获取停车记录
		echo $tools->getParkingRecord($uid);
	} elseif ($identity == 'getParkingPaySign') {
		// 获取停车微信支付签名
		echo $tools->getParkingPaySign($uid, $carNum, $parkAmount, $openId, $tradeId, $cityId);
	} elseif ($identity == 'getFreeOutTime') {
		// 获取免费离场时间
		echo $tools->getFreeOutTime($parkId);
	} elseif ($identity == 'getRecordDetail') {
		// 获取停车记录详情
		echo $tools->getRecordDetail($id, $uid);
	} elseif ($identity == 'getMemberRate') {
		// 获取停车支付后的加分倍率
		echo $tools->getMemberRate($uid);
	} elseif ($identity == 'queryListByCityId') {
		//获取轮播图详情
		echo $tools->queryListByCityId($cityId);
	} elseif ($identity == 'getRemark') {
		//获取轮播图详情
		echo $tools->getRemark($cityId);
	} elseif ($identity == 'queryParkList') {
		//获取停车场列表
		echo $tools->queryParkList($cityId);
		/**********************************停车业务 start***************************/

		/**********************************会员卡业务 start*************************/
	} elseif ($identity == 'active') {
		// 激活会员卡
		echo $tools->activeMemberCard($code, $dataArr);
	} elseif ($identity == 'getCardDetail') {
		// 卡券详情
		echo $tools->getCardDetail($cardId);
	} elseif ($identity == 'decryptCode') {
		// 解密code
		echo $tools->decryptCode($code);
	} elseif ($identity == 'activateManage') {
		// 更新激活状态
		echo $tools->activateManage($openid, $code, $cardId);
	} elseif ($identity == 'getUserCardInfo') {
		// 查询会员的会员卡信息
		echo $tools->getUserCardInfo($openid, $cardId);
	} elseif ($identity == 'getDefaultCardId') {
		// 获取默认会员卡信息
		echo json_encode($tools->getDefaultCardId());
	} elseif ($identity == 'reviseUserCardInfo') {
		// 修改用户会员卡信息
		echo $tools->reviseUserCardInfo($code, $openid, $dataArr);
		/**********************************会员卡业务 end***************************/

		/**********************************新开卡流程 start*************************/
	} elseif ($identity == 'getMemberCard') {
		// 会员卡资料入库
		echo $tools->getMemberCard($dataArr);
	} elseif ($identity == 'setMemberCardFalg') {
		// 会员卡资料入库
		echo $tools->setMemberCardFalg($uid,$mobile);
		/**********************************新开卡流程 end***************************/

		/******************************二维码、引导关注页 start***********************/
	} elseif ($identity == 'createQrCode') {
		// 构造二维码
		$url = $tools->createQrCode($idCard);
		echo json_encode(['message' => 'SUCCESS', 'result' => $url, 'state' => 0]);
	} elseif ($identity == 'closeSubscribeState') {
		// 关闭关注引导页
		$_SESSION["subscribeState"] = 1;
		echo json_encode(['message' => 'SUCCESS', 'result' => '', 'state' => 0]);
	} elseif ($identity == 'storeUserLocation') {
		// 记录用户定位信息
		echo $tools->storeUserLocation($location);
	} elseif ($identity == 'sessionLocation') {
		// 用户定位信息存入session
		//$location['expire'] = strtotime(date("Y-m-d H:i:s",strtotime("+20 second")));
		$location['expire'] = strtotime(date("Y-m-d", strtotime("+1 day")));
		$_SESSION["location_" . $location['openid']] = $location;
		echo json_encode(['message' => 'SUCCESS', 'result' => json_encode($location), 'state' => 0]);
		/****************************二维码、引导关注页 end***************************/

		/**********************************竞拍业务 start***************************/
	} elseif ($identity == 'getAuctionOrderList') {
		// 获取用户竞拍订单列表
		echo $tools->getAuctionOrderList($uid);
	} elseif ($identity == 'getAuctionOrderDetail') {
		// 获取用户竞拍订单详情
		echo $tools->getAuctionOrderDetail($uid, $orderID);
	} elseif ($identity == 'addReceiptInfo') {
		// 竞拍订单详情添加收货信息
		echo $tools->addReceiptInfo($uid, $orderID, $receAddress, $receName, $receMobile);
	} elseif ($identity == 'checkHasActivity') {
		// 查询竞拍活动是否存在
		echo $tools->checkHasActivity($cityId);
	} elseif ($identity == 'updateOrderUseStatus') {
		// 更新竞拍订单使用状态
		echo $tools->updateOrderUseStatus($uid, $orderID);
		/**********************************竞拍业务 end*****************************/

	} else {
		// 无对应标识,统一报错
		echo -1;
	}
}
