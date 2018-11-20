//弹窗  输入

 	function twoanniu(centen_wenzi, anniu_wenzi,anniu_wenziR) {
    var tishikuang_html = "<div style='width: 90%;height: 2.1rem;position: fixed;background: #ffffff; border-radius: 0.04rem; left: 5%;top: 0.69rem;z-index:50'>"+
    "<div style='padding-bottom: 0.1rem;padding-top: 0.2rem;text-align: center;border-bottom: 1px solid rgb(230,230,203);color: rgb(51,51,51);font-size: 0.16rem;'>" + centen_wenzi + "<div style='margin:0.2rem 0 ;width: 80%;height: 0.4rem;border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);'><input  val='' type='text' style='width:100%;height:100%;margin-left:10%;padding-left:.1rem;font-size:.15rem;color:rgb(128,128,128)' placeholder='请填写车牌号' /></div></div>"+
        
    "<div style='margin:0.2rem 0 ;width: 40%;float:left;margin-left: 7%;height: 0.4rem;border:1px solid rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem;'>" + anniu_wenzi + "</div>"+

    "<div style='margin:0.2rem 0 ;width: 40%;margin-right: 7%;height: 0.4rem;background: rgb(255,221,16);border-radius: 0.2rem;font-size: 0.16rem;color: rgb(51,51,51);text-align: center;line-height: 0.4rem; float:right;'>" + anniu_wenziR + "</div></div>";
    $("body").append(tishikuang_html)
     }
	