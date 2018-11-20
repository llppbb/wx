window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};
var codeJava = getUrlParam("code");
var openIdJava = getUrlParam("openId");
console.log("页面初始数据");
var userMes = getUserMes(codeJava, openIdJava); //页面初始数据
// 用于存储 常用数据
// deleteItem("userData");
if (getStorage("userData").uid != userMes.uid) {
    setLocalStorage(userMes);
}

// 获取定位列表
getcitylist();
var sessionLocation = JSON.parse(userMes.sessionLocation);
if (sessionLocation == false) {
    // 定位
    getCity();
} else {
    $("#cityBox option").each(function(i, k) {
        // if (sessionLocation.cityName == $(k).attr('city')) {
        if (sessionLocation.cityId == $(k).val()) {
            $(k).prop('selected', true);
            tishi("当前城市：" + sessionLocation.cityName);
            return false;
        }
    });
}
// alert(JSON.stringify(userMes))
console.log(userMes);
if (userMes.mobile != null) { // 有手机
    $("#cardCenter").show();
    if (userMes.hasCard == 1) { // 有卡
        $("#havepoint").show();
        $(".centen").show();
        // 生成一维码+二维码
        var numcode = userMes.cardUserInfoModel.code;
        // var codeImg = getCodeJava(2, numcode); //获取二维码 跳转路径
        var codeImg = WX_URL + 'HXXCServiceWeChat/wechat/getQRCode?code=' + numcode; //获取二维码 跳转路径
        var tiaoSrc = WX_URL + 'HXXCServiceWeChat/wechat/getBarCode?code=' + numcode; //  获取条维码 跳转路径
        var numcodeNew = numcode.substr(0, 4) + " " + numcode.substr(4, 4) + " " + numcode.substr(8, 4);
        $(".tiaobox img").attr('src', tiaoSrc);
        $(".tiaoboxcode").html(numcodeNew);
        $(".codeBoxbot img").attr('src', codeImg);
        // 卡信息
        $(".carName").html(userMes.cardListModel.brandName);
        $(".title").html(userMes.cardListModel.title);
        $(".cardname").html(userMes.cardUserInfoModel.name);
        $("#carnum").html(numcode);
        $(".nowpoint").html(userMes.pointMap.result.point); //当前积分
        $(".usepointfont").html(userMes.pointMap.result.memberName); //卡等
        changStyle(userMes.pointMap.result.memberName); // 不同卡等显示不同颜色
        // 签到 未换成 java接口
        singIn(userMes.uid);
        $(".closeBtn").on("click", function() {
            qiandaoxiangqing();
        });
        $(".iknow").on("click", function() {
            qiandaoxiangqing();
        });
    } else { // 无卡
        $("#getCard").show();
        // $("#cardInfo").show();
    }
} else { // 无手机
    $("#cardInfo").show();
}
// 点击领取会员卡
$("#getCard").on("click", function() {
    var sendData={
        mobile:userMes.mobile,
        openid:openIdJava,
        uid:userMes.uid
    }
     storageCardInfo1(sendData);
});

// 是否同意会员使用说明
$(".checkbox").click(function(event) {
    if ($(this).attr("checked_") == "1") {
        $(this).attr("checked_", "0");
        $(this).find("img").attr("src", "pic/selected.png");
        $(".carState").removeClass('noactivate');
        $(".carState").addClass('activate');
        $(".carState").attr("act", "0");
    } else if ($(this).attr("checked_") == "0") {
        $(this).attr("checked_", "1");
        $(this).find("img").attr("src", "pic/selected_1.png");
        $(".carState").removeClass('activate');
        $(".carState").addClass('noactivate');
        $(".carState").attr("act", "1");
    }
});

// 绑定手机+领取微信会员卡
$("#activate").on("click", function() {
    if ($(this).attr('act') == '0') {
        var arr = {};
        arr.uid = userMes.uid;
        arr.cardId = userMes.cardListModel.cardId;
        arr.openid = userMes.openId;
        arr.mobile = $("#bmmobilenum").val();
        arr.name = $("#name").val().trim();
        arr.sex = $("#sex").val();
        arr.birthday = $("#birthday").html();
        if (!(/^1\d{10}$/.test(arr.mobile))) {
            tishi("请填写正确的手机号码");
            return false;
        }
        if (arr.name == "" || arr.birthday == "") {
            tishi("请完善信息！");
            return false;
        }
        if ($("#getyzm").length > 0) {
            if ($("#bmmobilenum").val() == '') {
                tishi("请使用本机获取验证码");
                return false;
            }
            var mobile_number = $("#bmmobilenum").val();
            var mobile_number_peo = $("#bmauthcCode").val();
            // var yzm = checkMobileAndSMSCode(mobile_number, mobile_number_peo);
            // console.log(yzm);
            // console.log(getSMSCodeMobile);
            // console.log(mobile_number);
            // return false;
            // if (!yzm || (getSMSCodeMobile != mobile_number)) {
            //     tishi("手机号或验证码错误")
            //     return false;
            // }
            var result = bindMobile(mobile_number, mobile_number_peo, userMes.openId);
            console.log(result);
            if (parseInt(result.state) != 0) {
                tishi("绑定手机失败");
                return false;
            }
            arr.uid = result.result.uid;
            mobile = result.result.mobile;
            tishi('绑定成功！');
            $(".bindmobile").hide();
            $(".trackmatte").remove();
        }
        storageCardInfo(arr);
    } else {
        return false;
    }
});

//绑定手机号  获取验证码
$("#bmgetCode").on("click", function() {
    var get_code = $("#bmgetCode");
    getSMSCodeMobile = $("#bmmobilenum").val();
    getyzm(getSMSCodeMobile, get_code);
})

//   点击右上角显示二维码
$(".codeImg").on("click", function() {
    $(".mengceng").show();
    $(".codeBox").show();
});
$(".coloeCode").on("click", function() {
    $(".mengceng").hide();
    $(".codeBox").hide();
});

// if ($("#cityBox option:selected").attr("city") == "北京市") {
//     $(".luckballBox").show();
// }
// 幸运球 logo
var logonTop = $(".head").height() + $(".tab").height() - 10;
if ($(".centen").css("display") != "none") {
    $(".selectBox").show();
}
if ($(".selectBox").css("display") != "none") {
    logonTop = $(".head").height() + $(".tab").height() + 24;
}
$(".luckballBox").css("top", logonTop + "px");
$(".luckballIcon").on("click", function() {
    $(".luckballIcon").css({
        "-webkit-tap-highlight-color": "rgba(0,0,0,0)"
    })
    if ($(this).attr("luckball") == 1) {
        // 点击球进入详情页
        window.location.href = "../luckBall/luckBallAct.html";
        return false;
    } else if ($(this).attr("luckball") == 0) {
        // 显示
        $(".luckballIcon").attr('luckball', 1);
        $(".luckballIcon").css({
            "right": ".03rem",
            "-webkit-transition": " right .5s"
        })
        $(".luckballFloatIcon").css({
            "left": "-.3rem",
            "-webkit-transition": " left .5s"
        })
    }
});
$(".luckballFloatIcon").on("click", function() {
    // 隐藏
    $(".luckballIcon").attr('luckball', 0);
    $(".luckballIcon").css({
        "right": "-.3rem",
        "-webkit-transition": " right .5s"
    })
    $(".luckballFloatIcon").css({
        "left": ".43rem",
        "-webkit-transition": " left .5s"
    });
})
// 幸运球弹窗
// 关闭弹窗
$(".closeluckball").on("click", function() {
    $(".luckball").hide();
    $(".mengceng").hide();
})
// 立即领取
$(".receiveBtn").on("click", function() {
    $(".luckball").hide();
    $(".mengceng").hide();
    // 点击球进入详情页
    window.location.href = "../luckBall/luckBallAct.html";
})
if ($(".qiandaoxiangqing").css("display") == "none") {
    // if ($("#cityBox option:selected").attr("city") == "北京市" && obj.result) {
    if ($("#cityBox option:selected").attr("city") == "北京市") {
        // 判断是否有选号活动
        require_isBarraged(userMes.uid);
    }
}
// 当前积分
$("#nowpoint").click(function(event) {
    window.location.href = "pointRecord.html";
    return;
});
// 会员等级
$("#membershipGrade").click(function(event) {
    window.location.href = "memberqy.html?uid=" + userMes.uid;
    return;
});
// 我的管理
$("#myManagement").click(function(event) {
    window.location.href = "myManagement.html";
    return;
});
// 会员卡信息使用说明
$("#directionuse").on("click", function() {
    window.location.href = "directionuse.html";
})
//切换城市中
$("#cityBox").change(function(event) {
    tishi("切换城市中....");
    $("#centenBox").html("");
    var locationarr = {
        "cityId": $(this).val(),
        "cityName": $("#cityBox option:selected").attr("city"),
        "openid": userMes.openId
    };
    // if ($("#cityBox option:selected").val() == 1) {
    //     $(".luckballBox").show();
    // } else {
    //     $(".luckballBox").hide();
    // }
    getModuleInfo($("#cityBox").val());
    sessionLocationFun(locationarr);
	getModuleInfo($("#cityBox").val());
});
// 出现 会员卡激活成功后 点击确认按钮
$(".actsuccessBtn").on("click", function() {
    // alert(222)
    window.location.reload();
})

// 初始化页面 获取用户信息
function getUserMes(codeJava, openIdJava) {
    var resdata = '';
    var sendUrl = WX_URL + 'HXXCServiceWeChat/wechat/getOpenId';
    var sendDate = {
        'code': codeJava,
        'openId': openIdJava,
        'state': 1
    };
    fnAjax(sendUrl, "get", false, sendDate, function(data) {
        resdata = data;
    }, function(data) {
        resdata = data;
        console.log(data);
    });
    return resdata;
}

// 会员卡信息入库
function storageCardInfo(arr) {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/register.json';
    fnAjax(sendUrl, "POST", false, JSON.stringify(arr), function(data) {
        if (parseInt(data.state) == 0) {
            // getJsapiToken();
            // alert("领取成功！");
            $(".mengceng").show();
            $(".actsuccess").show();
        } else {
            tishi(data.message);
        }
    }, function(data) {
        console.log(data);
    });
}



// 会员卡信息入库  领取会员卡
function storageCardInfo1(arr) {
    var sendUrl = APP_URL + 'HXXCServiceWeChat/wechat/register1.json';
    fnAjax(sendUrl, "POST", false, JSON.stringify(arr), function(data) {
        if (parseInt(data.state) == 0) {
            $(".mengceng").show();
            $(".actsuccess").show();
        } else {
            tishi(data.message);
        }
    }, function(data) {
        console.log(data);
    });
}

// 获取jsapitoken
function getJsapiToken() {
    var sendUrl = WX_URL + "HXXCServiceWeChat/wechat/ticket.json";
    fnAjax(sendUrl, "get", false, "", function(data) {
        if (parseInt(data.state) == 0) {
            var res = data.result;
            getWxCardTest(res.cardId, res.appid, res.timestamp, res.nonceStr, res.signature);
        }
    }, function(data) {
        console.log(data);
    });
}

// 领取微信会员卡
function getWxCardTest(cardId, appIdTest, timestampTest, nonceStrTest, signatureTest) {
    wx.config({
        debug: false,
        appId: appIdTest,
        timestamp: timestampTest,
        nonceStr: nonceStrTest,
        signature: signatureTest,
        jsApiList: ['checkJsApi', 'addCard']
    });
    wx.ready(function() {
        wx.checkJsApi({
            jsApiList: ['addCard'],
            success: function(res) {
                // console.log(res);
            }
        });
        wx.addCard({
            cardList: [{
                cardId: cardId,
                cardExt: '{"nonce_str":"' + nonceStrTest + '", "timestamp": "' + timestampTest + '", "signature":"' + signatureTest + '"}'
            }],
            success: function(res) {
                console.log(res.cardList);
                window.location.reload();
            },
            cancel: function(res) {
                // console.log(res);
                window.location.reload();
            },
            fail: function(res) {
                console.log(res);
            }
        });
    });
    wx.error(function(res) {
        // console.log(res);
    });
}

function storeUserLocation(locationarr) {
    var sendUrl = WX_URL + 'HXXCServiceWeChat/wechat/storeUserLocation';
    fnAjax(sendUrl, "POST", false, JSON.stringify(locationarr), function(data) {
        if (parseInt(data.state) == 0) {}
    }, function(data) {
        console.log(data);
    });
}

// 将定位信息存入 session
function sessionLocationFun(locationarr) {
    var sendUrl = WX_URL + 'HXXCServiceWeChat/wechat/sessionLocation';
    fnAjax(sendUrl, "POST", false, JSON.stringify(locationarr), function(data) {
        if (parseInt(data.state) == 0) {}
    }, function(data) {
        console.log(data);
    });
}
// 定位
function getCity() {
    wx.config({
        debug: true,
        appId: userMes.signPackage.appId,
        timestamp: userMes.signPackage.timestamp,
        nonceStr: userMes.signPackage.nonceStr,
        signature: userMes.signPackage.signature,
        jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord',
            'stopRecord', 'onRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation',
            'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'
        ]
    })
    wx.ready(function() {
        wx.checkJsApi({
            jsApiList: ['getLocation', 'checkJsApi'],
            success: function(res) {}
        });
        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function(res) {
                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                var speed = res.speed; // 速度，以米/每秒计
                var accuracy = res.accuracy; // 位置精度
                // 地址解析:https://lbs.qq.com/javascript_v2/guide-service.html#link-four
                var geocoder = new qq.maps.Geocoder({
                    complete: function(result) {
                        // alert(result.detail.addressComponents.city)
                        cityselect(result.detail.addressComponents.city, latitude, longitude);
                    }
                })
                var coord = new qq.maps.LatLng(res.latitude, res.longitude)
                geocoder.getAddress(coord);
            },
            cancel: function(res) {
                // alert('用户拒绝授权获取地理位置');
                var locationarr = {
                    "cityId": 1,
                    "cityName": "北京市",
                    "openid": userMes.openId
                };
                sessionLocationFun(locationarr);
            }
        });
    })
}
// 卡等级不一样 显示的颜色不一致
function changStyle(memberName) {
    var addclass = '';
    var hyqion = '';
    var cardLevel = memberName;
    // var cardLevel = "钻石卡";
    if (cardLevel == "普卡") {
        addclass = "colorp";
        hyqion = "hyqipk";
    } else if (cardLevel == "银卡") {
        addclass = "colory";
        hyqion = "hyqiyk";
    } else if (cardLevel == "金卡") {
        addclass = "colorj";
        hyqion = "hyqijk";
    } else if (cardLevel == "黑卡") {
        addclass = "colorh";
        hyqion = "hyqihk";
    } else if (cardLevel == "钻石卡") {
        addclass = "colorz";
        hyqion = "hyqizsk";
    };
    $(".usepoint").addClass(addclass);
    $(".hyqi").addClass(hyqion);
}
// 判断是否有选号活动
function require_isBarraged(uid) {
    var sendUrl = APP_URL + 'HXXCLuckyBall/ball/require_isBarraged.json';
    var sendDate = JSON.stringify({
        "uid": uid
    });
    fnAjax(sendUrl, "post", false, sendDate, function(data) {
        //显示弹屏
        if (data.state == 0) {
            $(".luckball").show();
            $(".mengceng").show();
        }
    }, function() {
        console.log("error")
    });
}

function cityselect(city, latitude, longitude) {
    tishi("当前城市:" + city);
    var locationarr = {
        "cityId": "1",
        "cityName": city,
        "openid": userMes.openId,
        "latitude": latitude,
        "longitude": longitude
    };
    storeUserLocation(locationarr);
    sessionLocationFun(locationarr);
    $("#cityBox option").each(function(i, k) {
        console.log($(k).attr('city'));
        if (city == $(k).attr('city')) {
            $(k).prop('selected', true);
            return false;
        }
    });
}

// 日期插件 start
$("#birthday").css({
    "-webkit-tap-highlight-color": " rgba(0,0,0,0)",
    "-webkit-tap-highlight-color":   "transparent"
})
var calendar = new datePicker();
calendar.init({
    'trigger': '#birthday',
    'type': 'date',
    'minDate': '1900-1-1',
    'maxDate': '2100-12-31',
    'onSubmit': function() { /*确认时触发事件*/
        var theSelectData = calendar.value;
        $("#birthday").html(theSelectData);
    },
    'onClose': function() { /*取消时触发事件*/ }
});
// 日期插件 end

// 获取定位列表
function getcitylist() {
    var sendUrl = WX_URL + 'HXXCServiceWeChat/wechat/getCityList';
    fnAjax(sendUrl, "get", false, "", function(data) {
        if (parseInt(data.state) == 0) {
            var optionHtml = '';
            $.each(data.result, function(i, k) {
                optionHtml += '<option value="' + k.cityId + '" city="' + k.cityName + '">' + k.desc + '</option>'
            });
            $("#cityBox").html(optionHtml);
        }
    }, function(data) {
        console.log(data);
    });
}
getModuleInfo($("#cityBox").val());
// 获取九宫格数据
function getModuleInfo(cityId) {
    var sendUrl = WX_URL + 'HXXCServiceWeChat/wechat/getModuleInfo';
    fnAjax(sendUrl, "get", false, {
        "cityId": cityId
    }, function(data) {
        if (parseInt(data.state) == 0) {
            var arrNew = [];
            if (cityId == 1) {
                arrNew = data.moduleInfos.slice(0, 6);
                var eatyData = {
                    addTime: null,
                    cityId: 1,
                    enabled: 1,
                    id: 10,
                    imageUrl: "/weChat/memberCard/pic/icon_mall.png",
                    modifyTime: null,
                    moduleId: 10,
                    moduleName: "吃喝玩乐",
                    order: 1,
                    url: "/weixin/parking/parkingReser.html"
                };
				arrNew.push(eatyData);
                var memberData = {
                    addTime: null,
                    cityId: 1,
                    enabled: 1,
                    id: 11,
                    imageUrl: "/weChat/eatPlay/pic/icon_vip.png",
                    modifyTime: null,
                    moduleId: 11,
                    moduleName: "会员权益",
                    order: 1,
                    url: "/weixin/parking/parkingReser.html"
                };
				arrNew.push(memberData);
                var cardVoucherData = {
                    addTime: null,
                    cityId: 1,
                    enabled: 1,
                    id: 12,
                    imageUrl: "/weChat/eatPlay/pic/icon_tikects.png",
                    modifyTime: null,
                    moduleId: 12,
                    moduleName: "我的卡券",
                    order: 1,
                    url: "/weixin/parking/parkingReser.html"
                };
				arrNew.push(cardVoucherData);
            } else {
                arrNew = data.moduleInfos;
            }
			$("#centenBox").html("");
            renderingModule(arrNew);
        }
    }, function(data) {
        console.log(data);
    });
}

// 渲染九宫格结构
function renderingModule(arr) {
    if (arr.length >= 3) {
        var html = '';
        $.each(arr.slice(0, 3), function(i, k) {
            html += '<div class="centenCom"  onclick=moduleHref(' + k.enabled + ',' + k.moduleId + ')>' +
                '<p class="comImg"><img src="' + k.imageUrl + '" /></p>' +
                '<p>' + k.moduleName + '</p>' +
                '</div>';
        });
        var newhtml = '<div class="centenY">' + html + '</div>';
        $("#centenBox").append(newhtml);
        arr.splice(0, 3);
        renderingModule(arr);
    } else {
        if (arr.length != 0) {
            var html = '';
            $.each(arr, function(i, k) {
                html += '<div class="centenCom"  onclick=moduleHref(' + k.enabled + ',' + k.moduleId + ')>' +
                    '<p class="comImg"><img src="' + k.imageUrl + '" /></p>' +
                    '<p>' + k.moduleName + '</p>' +
                    '</div>';
            });
            var emptyDivNum = 3 - arr.length;
            for (var i = 0; i < emptyDivNum; i++) {
                html += '<div class="centenCom"></div>';
            }
            var newhtml = '<div class="centenY">' + html + '</div>';
            $("#centenBox").append(newhtml);
        }
        return false;
    }
}
// 九宫格跳传
function moduleHref(enabled, moduleId) {
    //	 是否可用  0 不可用  1可用  enabled;
    if (enabled == 0) {
        // if ($("#cityBox option:selected").attr("city") != "北京市") {
        tishi("敬请期待！");
        //     return;
        // }
        // $(".mengceng").show();
        // onanniu('好货上架中......<br>敬请期待！', '确定');
        // $(".i_know").on("click", function() {
        //     $(".onekuang").remove();
        //     $(".mengceng").hide();
        // });
    } else if (enabled == 1) {
        // 跳转路径
        jumpURL(moduleId);
    }
}
// 跳转路径
function jumpURL(enabled) {
    var cityid = $("#cityBox").val();
    switch (enabled) {
        case 1:
            //停车
            window.location.href = "../parking/onlinePayment.html?cityid=" + cityid;
            break;
        case 2:
            //就餐取号
            if ($("#cityBox option:selected").attr("city") != "北京市") {
                tishi("敬请期待！");
                return;
            }

            window.location.href = "http://api.mwee.cn/api/web/weixin/near.php?token=f6cddc2391f9a108d38116a4456ec0b35aa2a88d&mall=168650&openid="+userMes.openId;
            break;
        case 3:
            //自助积分
            window.location.href = "selfhelp.html?cityid=" + cityid;
            break;
        case 4:
            //购票
            window.location.href = "../buyTicket/ticketList.html";
            break;
        case 5:
            //HI玩
            // window.location.href = WX_URL + 'weixin/game/gamesmenu/index.html';
            window.location.href = "http://melive.huaxiweiying.com/weixin/game/gamesmenu/index.html?token=" + userMes.openId + "&hasCard=" + userMes.hasCard;

            break;
        case 6:
            //社区
            window.location.href = "http://melive.huaxiweiying.com/weibei/6lo40d7ffc";
            break;
        case 7:
            //商城
            window.location.href = "../shop/shopAll.html?openId=" + openIdJava + "&cityId=" + cityid;
            break;
        case 8:
            //抽奖活动
            // window.location.href = WX_URL + "user.php?slyderNew=1&cityid=" + cityid+"&openId=" + openIdJava;
            window.location.href = "../shop/slyder_adventures.html?openId=" + openIdJava + "&cityId=" + cityid;
            break;
        case 9:
            //竞拍
            window.location.href = "../HXauction/AuctionList.html?cityid=" + cityid;
            break;
        case 10:
            //吃喝玩乐
            window.location.href = "../eatPlay/eatPlay.html";
            break;
        case 11:
            //会员权益
            window.location.href = "memberqy.html?uid=" + userMes.uid;
            break;
        case 12:
            //我卡券
            window.location.href = "../shop/shoporder.html";
            break;
    }
}
// 用于存储 常用数据
function setLocalStorage(userMes) {
    var localStorageData = {};
    localStorageData.uid = userMes.uid;
    localStorageData.unionId = userMes.unionId;
    localStorageData.signPackage = userMes.signPackage;
    localStorageData.mobile = userMes.mobile;
    localStorageData.hasCard = userMes.hasCard;
    localStorageData.openId = userMes.openId
    setStorage("userData", localStorageData);
}
/**
 *签到
 */
function singIn(uid) {
    var sendData = JSON.stringify({
        'uid': uid
    });
    var sendUrl = APP_URL + "HXXCServiceWeChat/user/require_wechat_login_new.json?data=" + sendData;
    fnAjax(sendUrl, "get", false, "", function(data) {
        if (data.state == 0) {
            var returnData = data.result;
            if (returnData.firstTimeLogin == true) {
                var dijitian = $('.dijitian');
                for (var i = 1; i < returnData.loginRecords; i++) {
                    dijitian[i].className = "dijitian zaidijitian";
                }
                $(".mengceng").show();
                $(".mengceng").css("opacity", "0.7");
                $(".qiandaoxiangqing").show();
            } else {
                return false;
            }
            $('.pspan').text('连续签到' + returnData.loginRecords + '天');
            $('.memberName').text(returnData.memberName);
            $('.todayBonus').text(returnData.todayBonus);
            $('#LjifenNum').html(returnData.point);
        }
    }, function(error) {
        console.log(error)
    })
}
/**
 *签到详情
 */
function qiandaoxiangqing() {
    $(".mengceng").hide();
    $(".qiandaoxiangqing").hide(500, function() {
        $('.ptext').show();
        setTimeout(function() {
            $('.ptext').fadeOut(1500);
        }, 500);
        window.location.reload();
    });
}

// 微信分享
var share = {
    "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
    "shareDesc": "会员积分免费停车",
    "shareLink": WX_URL + "HXXCServiceWeChat/wechat/wechat_verify",
    "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
