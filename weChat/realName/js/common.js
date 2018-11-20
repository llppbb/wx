//获取实名制信息列表
function getContacts(uid) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/getContacts.json";
    var sendData = {
        'uid': uid
    };
    var newData = '';
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        newData = data;
    }, function(res) {
        newData = false;
        console.log(res)
    })
    return newData;
}
//新增实名制信息
function addContacts(uid, name, idCard,cardName, cardType) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/saveContact.json";
    var sendData = {
        "uid": uid,
        "name": name,
        "idCard": parseInt(idCard),
        "cardType":parseInt(cardType),
        "cardName": cardName
    };
    var newData = '';
    fnAjax(sendUrl, "post", false, JSON.stringify(sendData), function(data) {
        newData = data;
    }, function(res) {
        newData = false;
        console.log(res)
    })
    return newData;
}
//删除实名制信息
function delContacts(uid, rid) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/product/deleteContact.json";
    var sendData = {
        'id': rid,
        'uid': uid
    };
    var newData = '';
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        newData = data;
    }, function(res) {
        newData = false;
        console.log(res)
    })
    return newData;
}
