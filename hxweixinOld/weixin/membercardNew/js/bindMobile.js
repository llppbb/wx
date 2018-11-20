// 绑定手机
//没有绑定手机号
$("#bmconfirm").on("click", function() {
    console.log(0)
    var mobile_number = $("#bmmobilenum").val();
    var mobile_number_peo = $("#bmauthcCode").val();
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
        $(".bindmobile").hide();
        $(".mengceng").remove();
        return false;
    }
});

//绑定手机号  获取验证码
$("#bmgetCode").on("click", function() {
    var get_code = $("#bmgetCode");
    console.log(333);
    var mobile_number = $("#bmmobilenum").val();
    getyzm(mobile_number, get_code);
})

//绑定手机号  取消
$("#bmabolish").on("click", function() {
    $(".bindmobile").hide();
    $(".mengceng").remove();
})
