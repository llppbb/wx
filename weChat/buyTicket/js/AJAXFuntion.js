// 公用方法 调用接口统一返回
function commonAjax(sendUrl, sendData, type) {
    var returnData = "";
    var sendUrl = sendUrl;
    var sendData = sendData;
    fnAjax(sendUrl, type, false, sendData, function(data) {
        returnData = data;
    }, function(error) {
        console.log(error);
        returnData = false
    })
    return returnData;
}

// 获取 类型
function ticketTypeAjax() {
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/ticketType.json";
    var sendData = "";
    var returnData = commonAjax(sendUrl, sendData, "get");
    return returnData;
}

// 获取banner
function bannerAjax() {
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/banner.json";
    var sendData = "";
    var returnData = commonAjax(sendUrl, sendData, "get");
    return returnData;
}

// 获取 项目列表
function listAjax(data) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/list.json";
    var sendData = data;
    var returnData = commonAjax(sendUrl, sendData, "get");
    return returnData;
}

// 获取项目详情
function detailAjax(data) {
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/detail.json";
    var sendData = data;
    var returnData = commonAjax(sendUrl, sendData, "get");
    return returnData;
}

//开售提醒
function SaleReminder(uid, mobile, onlineID, object) {
    var sendData = JSON.stringify({
        'uid': uid,
        'mobile': mobile,
        'onlineID': onlineID
    })
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/ticketReminding.json";
    fnAjax(sendUrl, "post", false, sendData, function(data) {
        if (data.state == 0) {
            tishi("设置成功！");
            object.hide();
        } else {
            tishi(data.message);
            object.hide();
        }
    }, function(error) {
        console.log(error);
    })
}

//缺货登记
function ShortageRegistration(uid, mobile, onlineID, scheduleId, ticketPriceId, packTicketId, object) {
    var sendData = JSON.stringify({
        'uid': uid,
        'mobile': mobile,
        'onlineID': onlineID,
        'scheduleId': scheduleId,
        'ticketPriceId': ticketPriceId,
        'packTicketId': packTicketId
    })
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/ticketRefillReminding.json";
    fnAjax(sendUrl, "post", false, sendData, function(data) {
        if (parseInt(data.state) == 0) {
            tishi("设置成功！");
            object.hide();
        } else {
            tishi(data.message);
            object.hide();
        }
    }, function(error) {
        console.log(error);
    })
}

// 项目场次票价详情
function programInfoAjax(id) {
    var sendData = {
        'id': id
    };
    var returnData = "";
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/programInfo.json";
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        if (parseInt(data.state) == 0) {
            returnData = data.result;
        } else {
            returnData = false;
        }
    }, function(error) {
        returnData = false;
        console.log(error);
    })
    return returnData;
}

// 锁座
function lockSeatAjax(data) {
    var returnData = "";
    var sendData = JSON.stringify(data);
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/lockSeat.json";
    fnAjax(sendUrl, "post", false, sendData, function(data) {
        returnData = data;
    }, function(error) {
        returnData = false;
        console.log(error);
    })
    return returnData;
}

// 本地锁座
// localLockSeat   ();  flag 1选座 2取消选座
function localLockSeat(uid, onlineID, scheduleId, ticketPriceId, packTicketId, seatinfo, flagtype) {
    var data = {
        "uid": uid,
        "onlineID": onlineID,
        "scheduleId": scheduleId,
        "ticketPriceId": ticketPriceId,
        "ticketNum": 1,
        'packTicketId': packTicketId,
        "seatInfo": seatinfo,
        "flag": flagtype
    }
    var sendData = JSON.stringify(data);
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/localLockSeat.json";
    fnAjax(sendUrl, "post", false, sendData, function(data) {

    }, function(error) {
        console.log(error)
    })
}

//获取价格对应的区域 svg
function getVenueAreaInfoAjax(data) {
    var returnData = "";
    var sendData = data;
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/getVenueAreaInfo.json";
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        returnData = data;
    }, function(error) {
        returnData = false;
        console.log(error);
    })
    return returnData;
}

// 获取指定价格、指定区域对应的座位
function getSeatInfo(onlineID, scheduleId, ticketPriceId, venueAreaId) {
    var sendData = {
        uid: uid,
        onlineID: onlineID,
        scheduleId: scheduleId,
        ticketPriceId: ticketPriceId,
        venueAreaId: venueAreaId
    };
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/getSeatInfo.json";
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        if (data.state != 0) {
            tishi(data.message);
            return false;
        } else {
            var dataResult = dataResult;
            var maxX = dataResult.maxX + 1;
            var maxY = dataResult.maxY + 1;
            var minx = dataResult.minX + 1;
            var miny = dataResult.minY + 1;
            CreateTable(maxX, maxY, minx, miny);
            $(".productName").html(dataResult.program.programName);
            $(".productScreenings").html(dataResult.program.scheduleName);
            $(".productPrices").html("");
            var seatcolor = '';
            $.each(dataResult.price, function(i, k) {
                var priceon = '';
                if (parseInt(ticketPriceId) == parseInt(k.ticketPriceId)) {
                    console.log(ticketPriceId);
                    yourseatsListprice = k.price;
                    priceon = 'priceon';
                    seatcolor = k.color;
                }
                var priceList = '<div onclick="priceList(this)" class="priceList ' + priceon + '" ticketPriceId=' + k.ticketPriceId + ' seatcolor=' + k.color + '>' + svg("svg", k.color) + k.price + '元</div>';
                $(".productPrices").append(priceList);
            });
            $.each(dataResult.seats, function(i, k) {
                $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").attr("venueAreaName", k.venueAreaName);
                $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").attr("lineno", k.lineno);
                $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").attr("rankno", k.rankno);
                $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").attr("seatcolor", seatcolor);
                if (k.isSold == false) {
                    $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").html(svg("svg", seatcolor));
                    $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").attr("isSold", k.isSold);
                } else {
                    $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").html(svg("svg", "F7F7F7"));
                    $("#td_lineno_" + k.lineno + "_rankno_" + k.rankno + "").attr("isSold", k.isSold);
                }
            });
        }
    }, function(error) {
        console.log(error);
    })
}

// 获取锁座信息  下单前调用 （pay。html）
function getLockInfoAjax(uid, orderNo) {
    var returnData = "";
    var sendData = {
        uid: uid,
        orderNo: orderNo
    };
    var sendUrl = APP_URL + "HXXCServiceWeChat/ticket/getLockInfo.json";
    fnAjax(sendUrl, "get", false, sendData, function(data) {
        if (parseInt(data.state) == 0) {
            returnData = data;
        } else {
            returnData = false;
        }
    }, function(error) {
        returnData = false;
        console.log(error);
    })
    return returnData;
}

// 选择大区 ； 自动分配作为 渲染  场次 价格
function schedulePriceInfo(data) {
    if (!data) {
        console.log("programInfo 出错");
    } else {
        var dataReturn = data;
        var choose_seesion_boxHTML = "";
        var choose_price_box = "";
        $.each(dataReturn.schedule, function(i, k) {
            choose_seesion_boxHTML += '<div class="choose_seesion_time" scheduleid="' + k.id + '" buyLimit="' + k.scheduleNumber + '">' + k.playTime + '</div>';
            var ticketPrice = "";
            var packTickets = "";
            $.each(k.ticketPrice, function(j, p) {
                var classNameState = (p.status == 3 || k.ticketCount == 0) ? 'choose_seesion_NOprice' : '';
                var description = (p.description == null) ? '' : p.description;
                ticketPrice += '<div class="choose_seesion_price ' + classNameState + '" ticketPriceId="' + p.id + '" price="' + p.price + '" ticketCount="' + p.ticketCount + '">' +
                    '<span>' + p.price + '元</span>' + description + '</div>';
            });
            $.each(k.packTickets, function(q, w) {
                var classNameState = (w.status == 3 || w.ticketCount == 0) ? 'choose_seesion_NOprice' : '';
                var description = (w.description == null) ? '' : w.description;
                packTickets += '<div class="choose_seesion_price ' + classNameState + '" packTicketId="' + w.id + '" ticketPriceId="' + w.ticketPriceId + '" price="' + packAmount + '" ticketCount="' + ticketCount + '">' +
                    name + '</div>';
            });
            choose_price_box += '<div class="choose_seesion_centen pricearea choose_seesion_price_box choose_seesion_price_boxnew" id="' + k.id + '">' +
                ticketPrice + '' + packTickets + '</div>'
        });
        $("#choose_seesion_box").html(choose_seesion_boxHTML);
        $("#choose_price_box").html(choose_price_box);
    }
}
