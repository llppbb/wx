/**
 * 倒计时
 */
function timer(intDiff, obj, func) {
    var newintDiff = parseInt(intDiff);
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func();
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}
// 停车倒计时
function timer0(intDiff, obj, func) {
    var newintDiff = parseInt(intDiff);
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func();
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}
// 停车倒计时
function timer1(intDiff, obj, func) {
    var newintDiff = parseInt(intDiff);
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func();
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}
// 停车倒计时
function timer2(intDiff, obj, func) {
    var newintDiff = parseInt(intDiff);
    clearInterval(t);
    var t = setInterval(function() {
        var day = 0,
            hour = 0,
            minute = 0,
            second = 0; // 时间默认值
        if (newintDiff > 0) {
            day = Math.floor(newintDiff / (60 * 60 * 24));
            hour = Math.floor(newintDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(newintDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(newintDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        obj.html(minute + '分' + second + '秒');
        if (obj.html() == '00分00秒') {
            func(obj);
            clearInterval(t);
        }
        newintDiff--;
    }, 1000);
}

/**
 * 格式化时间戳
 * timestamp //时间戳为10位需*1000，时间戳为13位的话不需乘1000 传入的时间戳
 * type 想要的时间格式  y-m-d:年月日 | y-m-d h:m:年月日 时：分 | y-m-d h:m:s : y-m-d h:m:年月日 时：分 ：秒
 */
var timestampToTime = function(timestamp, type) {
    var date = "";
    var newTimestamp = '';
    if (typeof(timestamp) != "string") {
        newTimestamp = timestamp.toString();
    } else {
        newTimestamp = timestamp;
    }
    if (newTimestamp.length == 10) {
        date = new Date(timestamp * 1000);
    } else if (newTimestamp.length == 13) {
        date = new Date(timestamp * 1);
    }
    Y = date.getFullYear();
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours());
    m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
    s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    var date = '';
    switch (type) {
        case "y-m-d":
            date = Y + '-' + M + '-' + D;
            break;
        case "y-m-d h:m":
            date = Y + '-' + M + '-' + D + " " + h + ":" + m;
            break;
        case "y-m-d h:m:s":
            date = Y + '-' + M + '-' + D + " " + h + ":" + m + ":" + s;
            break;
    }
    return date;
}
// 倒计时插件
function leftTime(endTime) {
    //日期倒计时
    var newendTime = endTime.replace(/-/g, "/");
    $(function() {
        $.leftTime(newendTime, function(date_) {
            if (date_.status) {
                $(".day").html(date_.d);
                $(".hour").html(date_.h);
                $(".minute").html(date_.m);
                $(".second").html(date_.s);
            } else {
                //倒计时停止
                //				callback();
            }
        });
    })
}
//日期倒计时 回调函数形式 结构自己拼接  用于多个倒计时
function leftTimeReHtml(endTime, callback) {
    var newendTime = endTime.replace(/-/g, "/");
    $(function() {
        $.leftTime(newendTime, function(date_) {
            if (date_.status) {
                callback(date_);
            } else {
                //倒计时停止
            }
        });
    })
}
