function goHomeBtn(obj) {
    var back_shop = '<div id="back_shop" style="opacity:0.7; width: 0.51rem;height: 0.51rem;position: fixed;left: 0.1rem;bottom: 0.1rem;" ><img style="width: 100%;height: 100%;" src="/weixin/shop/pic/btn_home.png"/></div>'
    $(obj).append(back_shop);
    $("#back_shop").on("click", function() {
        location.href = WX_URL + "user.php?center=1";
    })
}
