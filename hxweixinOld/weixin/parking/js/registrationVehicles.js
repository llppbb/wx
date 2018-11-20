var uid="<?php echo $uid ?>";
// 获取车牌列表
getList();
   /*一个  按钮的  */
   function twoanniu(centen_wenzi, anniu_wenzi,anniu_wenziR) {
    var tishikuang_html = "<div id='hidechuang' style='width: 90%;height: 2.3rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'>"+
    "<div style='padding-bottom: 0.36rem;padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "<div style='margin:0.2rem 0 ;width: 80%;height: 0.4rem;border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);'><input type='text' style='width:100%;height:100%;margin-left:10%' placeholder='请填写车牌号' id='carnumber' /></div></div>"+

    "<div id='abolish' style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div>"+

    "<div id='confirm' style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR + "</div></div>";
    $("body").append(tishikuang_html);
};
 twoanniu('请输入车牌号','取消','确定');
 $("#hidechuang").hide();
//  添加车牌号
 $(".addplateNumber").on("click",function(){
    $("#hidechuang").show();
    $(".trackMatte").show();
})
//  取消添加
$("#abolish").on("click",function(){
     $("#hidechuang").hide();
     $(".trackMatte").hide();
     $("#carnumber").val("");
 })
//  确定添加
 $("#confirm").on("click",function(){
     var val=$("#carnumber").val();
     var result=bindingCar(uid,val);
     if(result.state==0){
         console.log("添加车牌成功");
         $("#hidechuang").hide();
         $(".trackMatte").hide();
         var arr=queryCar(uid).result;
         var lastarr=arr.pop();
         var html='<li class="plateNumberList"><span>'+lastarr+'</span><span onclick="delcar(this)" carnumber="'+lastarr+'">删除</span></li>';
         $(".plateNumberBox").append(html);
     }else{
         alert(result.message)
         console.log("添加车牌失败");
     }
     $("#carnumber").val("");
     console.log(result);
  })

function getList(){
   var querycar=queryCar(uid);
   console.log(querycar);
   var html="";
    $.each(querycar.result,function(i,k) {
        // if(i>=3){
        //     $(".addplateNumber").hide();
        //     return false;
        // }
        html+='<li class="plateNumberList"><span>'+k+'</span><span onclick="delcar(this)" carnumber="'+k+'">删除</span></li>'
    });
    $(".plateNumberBox").html(html);
}

function delcar(that){
   var carnumber=$(that).attr("carnumber");
   var res=deleteCarNum(uid,carnumber);
   console.log(res);
   if(res.state==0){
       console.log("删除成功");
       getList();
   }else{
       console.log("删除失败");
   }
}
