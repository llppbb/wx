/**
 * 获取用户积分
 */

function getUserPoint(uid, userPoint) {
    var point = "";
    var sendUrl = APP_URL + 'HXXCServiceWeChat/product/userPoint';
    var sendData = {
        'uid': uid
    };
    fnAjax(sendUrl, "get", false, sendData, function(res) {
        if (userPoint != "") {
            userPoint.text(res.result.point);
        }
        point = res.result.point;
    }, function(error) {
        console.log(error)
    })

    return point;
}

/**
 * 获取用户微信头像，昵称等信息
 */
function getWxUserInfo(access_token, openid, headimgurl, nickname) {
    var wxnickname = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'access_token': access_token,
            'openid': openid,
            'identity': 'getWxUserInfo'
        },
        success: function(res) {
            wxnickname = res.nickname;
            if (headimgurl != "" && nickname != "") {
                headimgurl.attr('src', res.headimgurl);
                nickname.text(res.nickname);
            }
        }
    });

    return wxnickname;
}
/**
 * 获取用户微贝头像，昵称等信息
 */
function getWeiBeiUserInfo(openid, headimgurl, hansansui) {
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'openid': openid,
            'identity': 'getWeiBeiUserInfo',
        },
        success: function(res) {
            user_id = res.data.user_id;
            headimgurl.attr('src', res.data.avatar);
            hansansui.text(res.data.nickname);
        }
    })
}
/**
 * 获取用户微贝点赞数，微贴数等
 */
function getPraiseNum(openid, postTotal, favoriteTotal, balance, newCount) {
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        data: {
            'openid': openid,
            'identity': 'getPraiseNum',
        },
        success: function(res) {
            if (res.code != 1) {
                return false;
            } else {
                postTotal.text(res.data.postTotal);
                favoriteTotal.text(res.data.favoriteTotal);
                balance.text(res.data.balance);
                if (res.data.newCount > 0) {
                    newCount.show();
                } else {
                    newCount.hide();
                }
            }
        }
    })
}

/**
 * 获取二维码
 * @param num
 * @return url
 */
function getCode(idCard) {
    var url = '';
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'idCard': idCard,
            'identity': 'createQrCode',
        },
        success: function(data) {
            if (data.state != 0) {
                return false;
            } else {
                url = data.result;
            }
        }
    })
    return url;
}
