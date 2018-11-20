// 获取列表
function getTicketOrderList(uid,ticketFolderType,nowtime,page,pageSize,type){
    $.ajax({
            url: WX_URL + "requestAjax.php",
            type: 'POST',
            dataType: 'json',
            async:false,
            data: {
                "uid":uid,
                "ticketFolderType":ticketFolderType,  //0未开始
                "pageSize":pageSize,
                "page":page,
                "identity": 'getTicketOrderList'
            },
            success:function(data){
                   console.log(data);
                    if(type=="init"){
                        if(data.result.length==0){
                            $("#jifenNo").show();
                            return false;
                        }
                    }
                    var html='';
                    var pages=data.pages;
                    currentpagenew=data.page;
                    // pages 总页数   page 当前页
                   //  判断是否显示 加载更多
                    clickMore(currentpagenew,pages);
                    $.each(data.result,function(i, k) {
                        var surplus=k.payExpTime-nowtime;
                        var dasbor='';
                        var continuePay='';
                       if(k.orderStatus==0){
                           dasbor='dasbor';
                           continuePay='<div class="botbtn">'+
                               '<div class="quxiaodingdanBtn">'+
                                   '<p >取消订单</p>'+
                               '</div>'+
                               '<div class="zhifuBtn" id="zhifuBtn_'+i+'" orderNo="'+k.orderNo+'">'+
                                   '<p>支付 <span id="timer_'+i+'">--:--</span></p>'+
                               '</div>'+
                           '</div>';
                       }
                        html+='<div class="centen_list" onclick="centen_listFun(this)" id="centen_list_'+i+'" oid="'+i+'" orderStatus='+k.orderStatus+' orderNo="'+k.orderNo+'" surplus="'+surplus+'">'+
                           '<div class="centen_list_centen">'+
                               '<div class="font_16_color_51 cnName">'+k.cnName+'<div class="jianhao"><img src="weixin/ticketfolder/pic/gengduo.png"/></div></div>'+
                               '<p class="font_14_color_179  font_14_color_179_p1" style="margin-top:.14rem">'+k.startTime+'</p>'+
                               '<p class="font_14_color_179">'+k.stadiumName+'</p>'+
                               '<p class="font_14_color_128 '+dasbor+'" style="padding-bottom: .14rem;"><span class="font_18_color_233">'+k.ticketNumber+'</span> 张 <span class="font_18_color_233 font_18_color_233_l">'+k.totalAmount+'</span> 元</p>'+
                           '</div></div>'+continuePay
                    //    '</div>';
                   });
                   $(".centen").append(html);
            }
        })
}
function clickMore(currentpagenew,pages){
    if(parseInt(currentpagenew) < parseInt(pages)){
         console.log("显示加载更多");
         $(".morebtn").show();
    }else{
        console.log("隐藏示加载更多");
        $(".morebtn").hide();
    }
}
$(".morebtn").on("click",function(){
    console.log("加载更多");
    var nextpage=parseInt(currentpagenew)+1;
    getTicketOrderList(uid,0,nowtime,nextpage,10,"more");
})
// 没有数据显示
function showNodata(imgurl,font){
	var html='<div class="nodata">'+
		'<img src="'+imgurl+'" />'+
		'<p>'+font+'</p>'+
	'</div>';
	$("body").append(html);
	$(".nodata img").css({
		'width': '90%',
		'display': 'block',
		'margin': '.8rem 0 .2rem 5%'
	})
	$(".nodata p").css({
		'text-align': 'center',
		'font-size': '.16rem',
		'color': 'rgb(51,51,51)'
	})
}
