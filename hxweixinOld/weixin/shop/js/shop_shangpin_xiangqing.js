$(function() {
    $(".maskContent").css({
        "display": "none"
    });
    list = $(document).height();
    $(".mask").css({
        "height": list
    })
})

// 倒计时
function time_dao() {
    let times = 60;
    window.tt = window.setInterval(function() {
        times = times - 1;
        console.log(times);
        $(".yanzhengma").val(times);
        $(".yanzhengma").attr("disabled", true);
        if (times <= 0) {
            window.clearInterval(tt);
            $(".yanzhengma").attr("disabled", false);
            $(".yanzhengma").val("点击重新发送");
        }
    }, 1000);
}

/*显示蒙层 */
function show_mengceng() {
    var mengceng_html = "<div  class='dongtaimengceng'  style='width: 100%;height: 100%;position: fixed;background: #000000;opacity: 0.5; left: 0px;top: 0px;z-index:40'></div>";
    $("body").append(mengceng_html);
}
/*各种提示框*/
/*一个  按钮*/
function onanniu(centen_wenzi, anniu_wenzi) {
    var tishikuang_html = "<div style='z-index:99; width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div class='i_konw' style='margin:0.2rem 0 ;width: 80%;margin-left: 10%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}

//onanniu("阿斯顿发送到", 'anniu_wenzi');
function twoanniu(centen_wenzi, anniu_zuo_wenzi, anniu_you_wenzi) {
    var tishikuang_html = "<div style='width: 90%;height: 2rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'><div style='padding-bottom: 0.36rem;padding-top: 0.6rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "</div><div class='i_konw' style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_zuo_wenzi + "</div><div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_you_wenzi + "</div></div>";
    $("body").append(tishikuang_html)
}
/*点击 电话 图标  显示拨打电话号*/
