
//当窗口拉动的时候解决问题
		function remSet(){
			var width=750/2;
			var rem=$(window).width()/width*100;
			$("html").css({"font-size":rem})
		}
		remSet();
		$(window).resize(function(){
			remSet();
		})
