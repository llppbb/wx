window.onpageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};
if (!getStorage("userData")) {
    window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
} else {
    var userData = getStorage("userData");
    if(parseInt(userData.hasCard)==0){
        window.location.href = WX_URL + "HXXCServiceWeChat/wechat/wechat_verify";
    }
}
var uid = userData.uid;
var mobile = userData.mobile;
var cityid = getUrlParam("cityid");
var u = navigator.userAgent,
    app = navigator.appVersion;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; // android终端或者uc浏览器
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
//渲染积分记录列表
getIntegralRecord();

var nohouse = getUrlParam("nohouse");
if (nohouse != 1) {
    // 返回  商城 主页
    goHomeBtn('body');
}

var demo_h5_upload_ops = {
    init: function() {
        this.eventBind();
    },
    eventBind: function() {
        var that = this;
        $("#uploadImg").change(function() {
            var reader = new FileReader();
            reader.onload = function(e) {
                that.compress(this.result);
            };
            reader.readAsDataURL(this.files[0]);
        });
    },
    compress: function(res) {
        var that = this;
        var img = new Image(),
            maxH = 600;

        img.onload = function() {
            var cvs = document.createElement('canvas'),
                ctx = cvs.getContext('2d');

            if (img.height > maxH) {
                img.width *= maxH / img.height;
                img.height = maxH;
            }
            cvs.width = img.width;
            cvs.height = img.height;

            ctx.clearRect(0, 0, cvs.width, cvs.height);
            ctx.drawImage(img, 0, 0, img.width, img.height);
            dataUrl = cvs.toDataURL('image/jpeg', 1);
            $("#div1").hide();
            $("#div2").show();
            $("#uploadImgView").show();
            $("#uploadImgView").attr("src",dataUrl);
        };
        img.src = res;
    }
};

$(document).ready(function() {
    demo_h5_upload_ops.init();
});



$("#reCamera").click(function(event) {
    $("#uploadImg").click();
});

$("#div1").click(function(event) {
    $("#uploadImg").click();
    console.log(333)
});
// 点击图片
$("#uploadImgView").click(function(event) {
    $("#uploadImg").click();
});

$("#reUploading").on("click", function() {
    var attr = $(this).attr("state");
    if (attr == "0") {
        alert('请不要重复提交！');
        return false;
    }
    addShoppingList(uid, mobile, $("#uploadImgView").attr("src"), cityid, 0)
});

// 拍照上传
function addShoppingList(uid, mobile, dataUrl, cityid, uploadType) {
    var tmp = {
        "uid": uid,
        "mobile": mobile,
        "imgUrl": dataUrl,
        "cityId": cityid,
        "uploadType": uploadType
    };
    var sendUrl = APP_URL + "HXXCServiceWeChat/shopping/addShoppingList";
    var sendDate = JSON.stringify(tmp);
    console.log(sendUrl);
    console.log(sendDate);
    $("#foo").show();// 显示加载效果
    $.ajax({
        url: sendUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        async: false,
        data: sendDate,
        beforeSend: function() {
            $("#reUploading").attr("state", "0");
        },
        success: function(data) {
            $("#foo").hide();// 显示加载效果
            console.log(data)
            if (data.state == 0) {
                tishi("上传成功");
                setTimeout(function() {
                    window.location.reload()
                }, 200)
            }
        },
        error: function(data) {
            console.log(data);
            $("#foo").hide();// 显示加载效果
        }
    })
}

// 积分记录列表  getIntegralRecord  积分记录列表    参数uid
function getIntegralRecord() {
    var sendUrl = APP_URL + "/HXXCServiceWeChat/shopping/getIntegralRecord";
    var sendDate = JSON.stringify({
        "uid": uid
    });
    fnAjax(sendUrl, "post", false, sendDate, function(data) {
        var html = '';
        if (data.result.length == 0) {
            $(".norecord").show();
            return false;
        }
        $.each(data.result, function(i, k) {
            var font = '';
            var className = '';
            var des = '本次积分：' + k.point + '';
            var dot = '';
            var sh = '<p class="seedetails" id_=' + k.id + '>查看详情 〉〉</p>';
            if (k.status == 0) {
                font = "审核中";
                className = "stateR";
                // sh='';
            } else if (k.status == 1) {
                font = "已完成";
                className = "stateG";
            } else {
                className = "stateR";
                font = "审核失败";
                if (k.description.length >= 14) {
                    dot = "...";
                }
                des = "失败原因：" + k.description + dot;
            }
            var newAddTime = timestampToTime(k.addTime, "y-m-d");
            html += '<div class="recordList">' +
                '<div>' +
                '<p class="zpoint">自助积分 (' + newAddTime + ')</p>' +
                '<p class="state ' + className + '">' + font + '</p>' +
                '</div>' +
                '<div>' +
                '<p class="needpoint">' + des + '</p>' +
                sh +
                '</div>' +
                '</div>';
        });
        $(".recordBox").html(html);
    }, function() {})
}

$(".seedetails").on("click", function() {
    var id_ = $(this).attr("id_");
    window.location.href = "selfhelpDetails.html?id=" + id_;
})



//修改图片
function addImg(imgUrl) {
    // var formData = new FormData();
    // var imgs = $("input[name=photo]").val();
    // formData.append('file', imgUrl[0]);
    // $.ajax({
    //     url: APP_URL + 'HXXCServiceWeChat/shopping/uploadShopListImg',
    //     type: 'POST',
    //     data: formData,
    //     async: false,
    //     cache: false,
    //     contentType: false,
    //     processData: false,
    //     success: function(returndata) {
    //         alert(JSON.stringify(returndata))
    //         $("#div1").hide();
    //         $("#div2").show();
    //         $("#uploadImgView").show();
    //         $("#uploadImgView").attr("src", returndata.url);
    //     },
    //     error: function(returndata) {
    //         alert(returndata)
    //         console.log(returndata);
    //     }
    // });
}

// 菊花加载
$(function() {
	var opts = {
		lines: 9, // The number of lines to draw
		length: 0, // The length of each line
		width: 10, // The line thickness
		radius: 15, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};
	var target = document.getElementById('foo');
	var spinner = new Spinner(opts).spin(target);
})
// 微信分享
var share = {
   "shareTitle": "吃喝玩乐 华熙LIVE一卡通",
   "shareDesc": "花钱有积分，积分当钱花！",
   "shareLink":WX_URL + "weChat/memberCard/selfhelp.html",
   "posterImage": "https://melive.huaxiweiying.com/tmp/title.png",
};
wxShare(share);
