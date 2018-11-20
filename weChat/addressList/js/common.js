// 实名制商品须填写 收货地址
function getAddress(uid) {
	var newData = "";
	var sendUrl = APP_URL + 'HXXCServiceWeChat/product/get_address.json';
	var sendData = {
		"uid": uid
	}
	fnAjax(sendUrl, "get", false, sendData, function(data) {
		newData = data.result;
	}, function() {});
	return newData;
}
// 保存地址
function saveAddress(sendData) {
	var newData = "";
	var sendUrl = APP_URL + 'HXXCServiceWeChat/product/saveAddress.json';
	fnAjax(sendUrl, "post", false, sendData, function(data) {
		newData = data;
	}, function() {
		newData = false
	});
	return newData;
}

// 编辑地址 更换默认地址
function updateAddress(sendData) {
	var newData = "";
	var sendUrl = APP_URL + 'HXXCServiceWeChat/product/updateAddress.json';
	fnAjax(sendUrl, "post", false, sendData, function(data) {
		newData = data;
	}, function() {
		newData = false
	});
	return newData;
}

//地址详情
function addressDetail(sendData){
	var newData = "";
	var sendUrl = APP_URL + 'HXXCServiceWeChat/product/addressDetail.json';
	fnAjax(sendUrl, "get", false, sendData, function(data) {
		newData = data.result;
	}, function() {
		newData = false
	});
	return newData;
}
//删除地址
function delAddress(sendData){
	var newData = "";
	var sendUrl = APP_URL + 'HXXCServiceWeChat/product/deleteaddress.json';
	fnAjax(sendUrl, "get", false, sendData, function(data) {
		newData = data;
	}, function() {
		newData = false
	});
	return newData;
}
