var click = false; //用作判断 是否点击
var raffleid = ""; // 获取奖品得到
var arr = []; //获取中奖位置
var isUsingPoint = false; //点击话费积分是改变

var addressMobile = "";
var addressName = "";
var addressAddress = "";
var orderno1 = '';


var luck = {
    index: -1, //当前转动到哪个位置，起点位置
    count: 0, //总共有多少个位置
    timer: 0, //setTimeout的ID，用clearTimeout清除
    speed: 20, //初始转动速度
    times: 0, //转动次数
    cycle: 50, //转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize: -1, //中奖位置
    init: function(id) {
        if ($("#" + id).find(".luck-unit").length > 0) {
            $luck = $("#" + id);
            $units = $luck.find(".luck-unit");
            this.obj = $luck;
            this.count = $units.length;
            $luck.find(".luck-unit-" + this.index).children(".tbBg").addClass("active2");
        };
    },
    roll: function() {
        var index = this.index;
        var count = this.count;
        var luck = this.obj;
        $(luck).find(".luck-unit-" + index).children(".tbBg").removeClass("active2");
        index += 1;
        if (index > count - 1) {
            index = 0;
        };
        $(luck).find(".luck-unit-" + index).children(".tbBg").addClass("active2");
        this.index = index;
        return false;
    },
    stop: function(index) {
        this.prize = index;
        return false;
    }
};

luck.init('luck'); //初始化 九宫格
getlist(); //调用 产品列表

// 点击抽奖
$("#btn").click(function() {
    if (mobile == 0) {
        $(".track_matte").show();
        $(".maskContent").show();
        return false;
    }
    console.log(raffleid);
    turn(click, raffleid, arr);
});

//接着抽
$(".thankesalert").find(".yes").on("click", function() {
    $(".track_matte").hide();
    $(".thankesalert").hide();
    turn(click, raffleid, arr);
});

//积分抽奖
$("#pointTurn").on("click", function() {
    $(".track_matte").hide();
    $(".jifenneed").hide();
    isUsingPoint = true;
    turn(click, raffleid, arr);
});

// 查看中奖
$(".checkedJiang").on("click", function() {
    location.href = WX_URL + "user.php?dingdan=1";
})

//没有绑定手机号
$("#maskContentYes").on("click", function() {
    console.log(0)
    var mobile_number = $("#inp3jifen").val();
    var mobile_number_peo = $("#inp4jifen").val();
    var yzm = checkMobileAndSMSCode(mobile_number, mobile_number_peo);
    if (!yzm) {
        tishi("验证码错误")
        return false;
    }
    var result = bindMobile(uid, mobile_number, mobile_number_peo);
    if (result.state != 0) {
        tishi(result.message);
        return false;
    } else {
        console.log(result.message);
        tishi('绑定成功！');
        mobile = mobile_number;
        $(".track_matte").hide();
        $(".maskContent").hide();
        return false;
    }
});

//绑定手机号  获取验证码
$("#maskContentGetcode").on("click", function() {
    var get_code = $("#maskContentGetcode");
    console.log(333);
    var mobile_number = $("#inp3jifen").val();
    getyzm(mobile_number,get_code);
})

//绑定手机号  取消
$("#maskContentNo").on("click", function() {
    $(".maskContent").hide();
    $(".track_matte").hide();
})

// 不填写地址 确定
$(".no_bind_no_address_no").on("click", function() {
    $(".no_bind_no_address").hide();
    $(".track_matte").hide();
})

// 转起来
function turn(click, raffleid, arr) {
    console.log(raffleid);
    console.log("isUsingPoint+test"+isUsingPoint);
    var test = checkHistory(raffleid);
    console.log(test);
    if (!test) {
        console.log("test")
        return false;
    }
    arr.splice(0, arr.length); //清空数组
    var raffleInfo = getRaffleInfo(isUsingPoint);
    console.log(raffleInfo);
    if (raffleInfo.state != 0) {
        console.log("没有获取到中奖信息");
        return false;
    }
    var prizeid = raffleInfo.result.prizeid;
    var typeid = raffleInfo.result.typeid;
    raffleWrap(raffleInfo, arr); // 弹出中奖提示
    if (click) { //当 没转完的时候 再次点击的 时候无效
        return false;
    } else {
        addcss();
        luck.speed = 100;
        roll(arr, prizeid, typeid);
        click = true;
        return false;
    }
}

// 获取历史记录
function checkHistory(raffleid) {
    var sendUrl = COUPON_URL + "Home/Requestajax/getHistoryLottery";
    var tmp = {"raffleId":raffleid, "uid":uid};
    var sendData = createSign(tmp);
    console.log(sendData);
    var res = '';
    fnAjax_(sendUrl, sendData, false, function(data) {
        /*lotterynum  当日总抽奖次数
        userlotterynum  用户已抽奖次数
        userwinningnum  当日已中奖次数
        winningnum 当日允许最大总中奖次数
        freerafflenum   当日免费抽奖次数*/
        console.log(data);
        if (parseInt(data.result.lotterynum) <= parseInt(data.result.userlotterynum)) { // 总抽奖次数用完
            console.log("总抽奖次数用完");
            reminder_($(".shownumberDeil"), function() {});
            res = false;
        } else if (parseInt(data.result.freerafflenum) != 0) { // 有免费抽奖次数限制
            console.log("有免费抽奖次数限制");
            if (parseInt(data.result.freerafflenum) <= parseInt(data.result.userlotterynum)) { // 免费抽奖次数用完
                console.log("免费抽奖次数用完");
                console.log(isUsingPoint);
                if (isUsingPoint == true) { // 花积分抽奖
                    console.log("花积分");
                var point_ = getUserPoint(uid);
                if (point_ < parseInt(data.result.point)) { // 积分不足
                    reminder_($(".no_jifen"), function() {
                        location.href = WX_URL + "user.php?shop=1";
                    });
                    res = -2;
                } else { //积分充足
                    // if(res==parseInt(-1)){
                    //     res = -3;
                    // }else{
                        if (mobile != 0) { // 已绑定手机
                            // reminder_zhuan($(".jifenneed"), function() {})
                            $(".track_matte").show();
                            $(".jifenneed").show();
                            res = false;
                        } else { // 未绑定手机
                            no_bind_phone($(".jinfenBIndmobile"), $("#inp1jifen"), $("#inp2jifen"));
                            res = false;
                        }
                    // }
                }
            }

            } else {
                console.log("免费抽奖次数未用完");
                res = true;
            }
        }
        // res = true;
    }, null);
    console.log(res);
    return res;
}

function roll(arr, prizeid, typeid) {
    luck.times += 1;
    luck.roll();
    if (luck.times > luck.cycle + 10 && luck.prize == luck.index) {
        console.log("times>cycle");
        clearTimeout(luck.timer);
        luck.prize = -1;
        luck.times = 0;
        click = false;
        //中奖提示
        setTimeout(function() {
            var index = slice_arr(arr);
            var productid = $(".luck-unit-" + index).attr("productid"); // directWinning(productid,producttype)
            var prizetype = $(".luck-unit-" + index).attr("prizetype"); //得到中奖奖品的  prizetype  确定是否弹出填写  地址弹窗
            coloecss();
            turnOver(productid, prizetype, prizeid, typeid);
        }, 500);
    } else {
        if (luck.times < luck.cycle) {
            luck.speed -= 10;
        } else if (luck.times == luck.cycle) {
            var index = slice_arr(arr);
            luck.prize = index;
        } else {
            if (luck.times > luck.cycle + 10 && ((luck.prize == 0 && luck.index == 7) || luck.prize == luck.index + 1)) {
                luck.speed += 110;
            } else {
                luck.speed += 20;
            }
        }
        if (luck.speed < 40) {
            luck.speed = 40;
        };
        luck.timer = setTimeout(
            function() {
                roll(arr, prizeid, typeid);
            }, luck.speed);
    }
    return false;
}

// 获取产品列表
function getlist() {
    var sendData = createSign();
    var sendUrl = COUPON_URL + "Home/Requestajax/getWebPrizeList";
    fnAjax_(sendUrl, sendData, false, function(data) {
        getnameList(data);
        if (data.result.prizeTypeList.length != 0) {
            $(".wrap").show();
            console.log(data);
            raffleid = data.result.raffleid;
            console.log(raffleid);
            // 添加页面上死数据
            addHtml(data.result, data.result.prizeTypeList);
            //  添加 滑动数据
            addSwiperInfo(data.result.typeInfo);
        } else {
            $("html").css("background", "rgb(244, 244, 244)");
            $("body").css("background", "rgb(244, 244, 244)");
            $(".noData").show();
        }
    }, null);
}

//添加结构
function addHtml(data, arr) {
    var state = "进行中";
    $(".start_time p").html("开始时间：" + data.startdate);
    $(".end_time p").html("结束时间：" + data.enddate);
    if (data.status != 0) {
        state = "结束";
    }
    $(".state_").html(state);
    $(".centenIntroduce p").html(data.raffledesc);
    $("#point").html(data.point);
    // 渲染奖品列表
    $.each(arr, function(i, k) {
        $(".luck-unit-" + i).html('<span><img src=' + k.imageurl + ' /></span>' + "<div class='tbBg'></div>");
        $(".luck-unit-" + i).attr("_id", k.typeid);
        $(".luck-unit-" + i).attr("prizeid", k.prizeid);
        $(".luck-unit-" + i).attr("prizetype", k.prizetype);
        $(".luck-unit-" + i).attr("productid", k.productid);
    });
}

//添加滑动结构 递归
function addSwiperInfo(arr) {
    var html = "";
    if (arr.length <= 3) {
        $.each(arr, function(i, k) {
            html += '<div class="prizeIntroduce_list">' +
                '<div class="prize">' + k.typename + '</div>' +
                '<div class="number">' + k.prizenum + '</div>' +
                '<div class="img"><img src=' + k.prizeimage + ' /></div>' +
                '<div class="money">' + k.prizename + '</div>' +
                '</div>';
        })
        var html_ = '<div class="swiper-slide">' + html + '</div>';
        $(".swiper-wrapper").append(html_);
    } else {
        var infoHtml = "";
        for (var i = 0; i < 3; i++) {
            var infoHtml_ = arr.shift();
            infoHtml += '<div class="prizeIntroduce_list">' +
                '<div class="prize">' + infoHtml_.typename + '</div>' +
                '<div class="number">' + infoHtml_.prizenum + '</div>' +
                ' <div class="img"><img src=' + infoHtml_.prizeimage + ' /></div>' +
                '<div class="money">' + infoHtml_.prizename + '</div>' +
                '</div>';
        }
        var html_ = '<div class="swiper-slide">' + infoHtml + '</div>';
        $(".swiper-wrapper").append(html_);
        addSwiperInfo(arr);
    }
}

//闪灯效果
var num = 0;
$(".shanDeng").attr("class", function() {
    setInterval(function() {
        num++;
        if (num % 2 == 0) {
            $('#deng').addClass("shanDeng2");
        } else {
            $('#deng').addClass("shanDeng");
            $('#deng').removeClass('shanDeng2');
        }
    }, 500)
})

//添加 点击抽奖 效果 背景 切换
function addcss() {
    $(".tbBg").css("opacity", 0.8);
    $("#btn").addClass("cjBtnDom");
    setTimeout(function() {
        $("#btn").removeClass("cjBtnDom");
    }, 1000);
    $(".yaotop").hide();
    $(".yaobot").show();
}

//关闭 蒙层 背景
function coloecss() {
    $(".tbBg").css("opacity", 0);
    $(".yaotop").show();
    $(".yaobot").hide();
}

// 滑动的 效果
var swiper = new Swiper('.swiper-container', {
    pagination: '.swiper-pagination',
    slidesPerView: 1,
    paginationClickable: true,
    spaceBetween: 0,
    freeMode: false
});

//获取 中奖名单
function getnameList(data) {
    var arr_ = data.result.winnerList;
    var jiangListHtml = "";
    if (arr_.length < 4) {
        $("#jiangList").css("top", "0px");
        $("#con ul").pause(); //暂停动画
        clearInterval(scrtime);
    }
    $.each(arr_, function(i, k) {
        jiangListHtml += '<li>' + k.mobile + ' 抽中 ' + k.prizename + '</li>';
    });
    $("#jiangList").html(jiangListHtml);
}

// 构造签名
function createSign(obj) {
    var tmp_ = Date.parse(new Date()).toString();
    var tmp = tmp_.substr(0, 10);
    var sign_tmp = "SDE45FHW6KL" + tmp;
    var dataArr = {
        "sign":hex_md5(sign_tmp),
        "timestamp":tmp
    }
    if (obj!='') {
        for(var i in obj) {
            dataArr[i] = obj[i];
        }
    }
    return dataArr;
}

//获取中奖信息
function getRaffleInfo(isUsingPoint) {
    var tmp = {"uid": uid,"isUsingPoint": isUsingPoint,"raffleId": raffleid};
    var sendData = createSign(tmp);
    var dataObj = '';
    var sendUrl = COUPON_URL + "Home/Requestajax/getRaffleInfo";
    fnAjax_(sendUrl, sendData, false, function(data) {
        console.log(data);
        isUsingPoint = false;
        dataObj = data;
    }, null);

    return dataObj;
}

// 弹出中奖提示
function raffleWrap(data, arr) {
    $("#getJiang_text").html("恭喜您！获得 " + data.result.prizename + " 奖品");
    $("#getJiang_img").attr("src", data.result.prizeimage);
    address_html = '<div class="tishikuang showAddress">' +
        '<div class="tishikuang_img jinfenBIndmobile_img">' +
        '<p class="showAddress_p">恭喜您！获得 ' + data.result.prizename + ' 奖品,请填写收货信息。</p>' +
        '</div>' +
        '<div class="showAddress_name"><input type="text" placeholder="请填写收货人姓名" /></div>' +
        '<div class="showAddress_mobile"><input type="number" placeholder="请填写收货人手机" /></div>' +
        '<div class="showAddress_address"><input type="text" placeholder="请填写收货人地址" /></div>' +
        '<div class="tishikuang_bot">' +
        '<div class="quxiao addressNo">取消</div>' +
        '<div class="queding addressYes">确认</div>' +
        '</div>' +
        '</div>';
    $.each($(".luck-unit"), function(i, k) {
        if ($(k).attr("_id") == data.result.typeid) {
            var n = $(k).attr("class");
            if (n.indexOf(" active1") != -1) {
                var c = n.replace(" active1", "");
                n = c
            }
            arr.push(n)
        };
    });
}

// 转停之后
function turnOver(productid, prizetype, prizeid, typeid) {
    if (prizetype == 1) { //弹出填写地址
        console.log('弹出填写地址');
        showAddress();
        console.log(prizeid+"222"+typeid);
        addressFun(prizeid,typeid);
        // 不填写地址 继续填写
        $(".no_bind_no_address_cont").on("click", function() {
            $(".no_bind_no_address").hide();
            $("body").append(address_html);
            addressFun(prizeid,typeid);
        })
        return false;
    } else {
        return directWinning(productid, prizetype, prizeid, typeid);
    }
}

//得出中奖位置   确定 roll 里的 中奖位置
function slice_arr(arr) {
    var new_index = [];
    for (var i = 0; i < arr.length; i++) {
        var k = arr[i].slice(-2);
        if (k.indexOf("-") != -1) {
            new_index.push(k.slice(-1));
        } else {
            new_index.push(k);
        }
    }
    var index = Math.random() * new_index.length;
    var b = parseInt(index);
    console.log("中奖位置： " + new_index[b]);
    return new_index[b];
}

// 弹出填写地址
function showAddress() {
    $(".track_matte").show();
    $(".showAddress").show();
    console.log(address_html);
    $("body").append(address_html);
    return true;
};

function addressFun(prizeid,typeid) {
    $(".addressYes").on("click", function() {
        addressName = $(".showAddress").find(".showAddress_name input").val();
        addressMobile = $(".showAddress").find(".showAddress_mobile input").val();
        addressAddress = $(".showAddress").find(".showAddress_address input").val();
        if (addressName == "" || addressMobile == "" || addressAddress == "") {
            tishi("请填写完善信息！");
            return false;
        }
        // 验证手机号
        function isPhoneNo(phone) { 
            var pattern = /^1[34578]\d{9}$/; 
            return pattern.test(phone);
        }
        var checked = isPhoneNo(addressMobile);
        console.log(checked)
        if (checked == false) {
            tishi("请填写正确手机号");
            return false
        }
        $(".track_matte").hide();
        $(".showAddress").remove();

        var data_ = winnerManage(prizeid,typeid);

        $(".showAddress_name input").val("");
        $(".showAddress_mobile input").val("");
        $(".showAddress_address input").val("");
    });
    $(".addressNo").on("click", function() {
        $(".showAddress").remove();
        $(".no_bind_no_address").show();
    })
}


/** 获取用户微信头像，昵称等信息*/
function getNickname() {
    var name_ = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            'access_token': access_token,
            'openid': openid,
            'identity': 'getWxUserInfo'
        },
        success: function(res) {
            console.log(res);
            name_ = res.nickname;
        },
        error: function() {
            console.log("cuowu")
        }
    })
    return name_;
}

//获取用户手机号
function getUserMobile(uid, mobile, openid, unionid) {
    var res = "";
    $.ajax({
        url: WX_URL + 'requestAjax.php',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            "uid": uid,
            "mobile": mobile,
            "openid": openid,
            "unionid": unionid,
            "identity": "getUserMobile"
        },
        success: function(data) {
            res = data.result.mobile;
        }
    })
    return res;
}

// 得出创建订单 时的 参数
function fun(a, productid, mobile, prizeid) {
    var data1 = "";
    var mobile = getUserMobile(uid, mobile, openid, unionid);
    if (a == 1) {
        data1 = {
            "buyNumber": "1",
            "uid": uid,
            "productId": productid,
            "userMobile": addressMobile,
            "mobile": mobile,
            "name": addressName,
            "address": addressAddress,
            "prizeId": prizeid
        }
    } else {
        data1 = {
            "buyNumber": "1",
            "uid": uid,
            "productId": productid,
            "userMobile": mobile,
            "mobile": mobile,
            "prizeId": prizeid
        }
    }

    return data1;
}

//记录信息
function winnerManage(prizeid, typeid) {
    console.log(typeid);
    var nickname = getNickname();
    var arrData = {
        "raffleId": raffleid,
        "typeId": typeid,
        "prizeId": prizeid,
        "uid": uid,
        "nickName": nickname,
        "openid": openid,
        "userMobile": addressMobile,
        "name": addressName,
        "address": addressAddress
    };
    arrData.mobile = getUserMobile(uid, mobile, openid, unionid);
    var data = createSign(arrData);
    var data1 = '';
    var sendUrl = COUPON_URL + "Home/Requestajax/winnerManage";
    fnAjax_(sendUrl, data, false, function(data) {
        console.log(data);
        if (data.state == 0) {
            console.log(data.result.productid);
            if (typeof(data.result) == "object") {
                producttype = data.result.prizetype;
                if (data.result.productid != "-") { //商家商品
                    var b = data.result.prizetype;
                    var productid = data.result.productid;
                    var prizeid = data.result.prizeid;
                    data1 = fun(b, productid, mobile, prizeid);
                    //记录成功 生成奖品订单
                    createOrder(data1); //创建订单
                } else { //自建商品
                    orderno1 = data.result.winnerId;
                    console.log(orderno1);
                }
            }
        }
    }, null);

    return data1;
}

//创建订单
function createOrder(data1) {
    //console.log(data1);
    var tmp_ = Date.parse(new Date()).toString();
    var sign_tmp = "SDE45FHW6KL" + tmp_.substr(0, 10);
    data1.sign = hex_md5(sign_tmp);
    data1.timestamp = tmp_.substr(0, 10);
    data1.mobile = getUserMobile(uid, mobile, openid, unionid);
    console.log(data1);
    $.ajax({
        type: "post",
        url: COUPON_URL + "Home/Requestajax/createOrder",
        async: false,
        dataType: "json",
        data: data1,
        success: function(data) {
            console.log(data);
            orderno1 = data.result.orderNo;
        },
        error: function() {
            tishi("错误")
        }
    })
}

//非实物的奖品
function directWinning(productid, producttype, prizeid, typeid) {
    var data_ = winnerManage(prizeid, typeid);
    if (prizeid != 0) { // 奖品不为谢谢参与
        console.log('奖品不为谢谢参与');

        reminder_($(".zhoangalert"), function() { // 查看奖品
            var isPrize = "1";
            if (productid != "-") {
                isPrize = 0;
            }
            location.href = WX_URL + "user.php?dingdan_xiangqing=1&shangxun_orderNo=" + orderno1 + "&producttype=" + producttype + "&isPrize=" + isPrize;
        });

        return true;

    } else {
        console.log('meizhong ');
        reminder_zhuan($(".thankesalert"), function() {});
        return false;
    }
}
