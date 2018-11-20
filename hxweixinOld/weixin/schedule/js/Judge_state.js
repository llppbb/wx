 //  修改 添加效果 
            function Judge_state(classNeme) {
                var state =classNeme ;
                var state_size = state.size();
                var aaa="eeeeeeeee"
                //console.log(state[0].innerHTML);
                //console.log(state_size)
                    // var farther_html=state[1]      
                    // $(farther_html).addClass("yuColor")
                for(var i = 0; i < state_size; i++) {
                    //var farther_html = state[1]
                    var inner_html = state[i].innerHTML;
                    //console.log(inner_html);
                    panduanColor(inner_html, i);
                    
                    panduanChangciLength(inner_html,i);
                    
                    panduanJiaqianLength(inner_html, i)
                } 
                 
                function panduanColor(inner_html, i){
                    var farther_html = state[i]
                    switch(inner_html) {
                        case "售票中":
                            $(farther_html).addClass("zhongColor")
                            break;
                        case "预售":
                            $(farther_html).addClass("yuColor")
                            break;
                        case "未开售":
                            $(farther_html).addClass("weiColor")
                            break;
                        case "已售罄":
                            $(farther_html).addClass("wanColor")
                            break;
                        case "预购":
                            //alert(2)
                            $(farther_html).css("background","rgb(87,211,111)")
                            break;
                        case "开票提醒":
                            //alert(2)
                            $(farther_html).css("background","rgb(255,80,16)")
                            break;
                        case "购票":
                            //alert(2)
                            $(farther_html).css("background","rgb(255,221,16)")
                            break;
                    }
                }
                
                
                // 选择 场次  页面  比较里面的文字 多少
                 function panduanChangciLength(inner_html, i){
                    var farther_html = state[i];
                    var inner_html_arr=inner_html.split("").length;
                   console.log(inner_html_arr);                   
                   if(inner_html_arr<9){
                       // alert("hahah")
                        $(farther_html).addClass("choose_seesion_price_W")
                   }     
                }
                 
                // 选择 价钱  页面  比较里面的文字 多少
                 function panduanJiaqianLength(inner_html, i){
                    var farther_html = state[i];
                    var inner_html_arr=inner_html.split("").length;
                   console.log(inner_html_arr);                   
                   if(inner_html_arr<5){
                       // alert("hahah")
                        $(farther_html).addClass("choose_seesion_price_W")
                   }     
                } 
                 
                
            }
            