 //  修改 添加效果
            function Judge_state(classNeme,type) {
                var state =classNeme ;
                // console.log(state)
                var state_size = state.length;
                var aaa="eeeeeeeee"
                //console.log(state[0].innerHTML);
                //console.log(state_size)
                    // var farther_html=state[1]
                    // $(farther_html).addClass("yuColor")
                for(var i = 0; i < state_size; i++) {
                    //var farther_html = state[1]
                    var inner_html = state[i].innerHTML.trim();
                    var status = state[i].getAttribute('status');
                    panduanColorList(status, i);
                    panduanChangciLength(inner_html,i);
                    panduanJiaqianLength(inner_html, i);
                }

                function panduanColorList(status, i){
                    var farther_html = state[i];
                    switch(parseInt(status)) {
                        case 1:  //售票中
                        // console.log("售票中");
                            $(farther_html).css({"border":"1px solid #E8375E","color":"#E8375E"});
                            break;
                        case 0: //预售
                            $(farther_html).css({"border":"1px solid #FBA248","color":"#FBA248"});
                            break;
                        case 2:  //未开售
                            $(farther_html).css({"border":"1px solid #43ABF4","color":"#43ABF4"});
                            break;
                        case "已售完":
                            $(farther_html).css({"border":"1px solid #B3B3B3","color":"#B3B3B3"});
                            break;
                        case 3:  //已结束
                            $(farther_html).css({"border":"1px solid #B3B3B3","color":"#B3B3B3"});
                            break;
                    }
                }


                // function panduanColor(inner_html, i){
                //     console.log(inner_html)
                //     var farther_html = state[i]
                //     switch(inner_html) {
                //         case "售票中":
                //             $(farther_html).css({"border":"1px solid #E8375E","color":"#E8375E"});
                //             break;
                //         case "预售":
                //             $(farther_html).css({"border":"1px solid #FBA248","color":"#FBA248"});
                //             break;
                //         case "未开售":
                //             $(farther_html).css({"border":"1px solid #43ABF4","color":"#43ABF4"});
                //             break;
                //         case "已售完":
                //             $(farther_html).css({"border":"1px solid #B3B3B3","color":"#B3B3B3"});
                //             break;
                //         case "已结束":
                //             $(farther_html).css({"border":"1px solid #B3B3B3","color":"#B3B3B3"});
                //             break;
                //         case "预购":
                //             $(farther_html).css({"background":"#F4687B","color":"#ffffff"});
                //             break;
                //         case "开票提醒":
                //             $(farther_html).css({"background":"#5AB1F2","color":"#ffffff"});
                //             break;
                //         case "购票":
                //             $(farther_html).css({"background":"rgb(255,221,16)","color":"#333333"});
                //             break;
                //         case "已售罄":
                //             $(farther_html).css({"background":"#CCCCCC","color":"#7A7A7A"});
                //             break;
                //     }
                // }
                // 选择 场次  页面  比较里面的文字 多少
                 function panduanChangciLength(inner_html, i){
                    var farther_html = state[i];
                    var inner_html_arr=inner_html.split("").length;
                    // console.log(inner_html_arr);
                    if(inner_html_arr<9){
                         // alert("hahah")
                         $(farther_html).addClass("choose_seesion_price_W")
                    }
                 }

                // 选择 价钱  页面  比较里面的文字 多少
                 function panduanJiaqianLength(inner_html, i){
                     var farther_html = state[i];
                     var inner_html_arr=inner_html.split("").length;
                    //    console.log(inner_html_arr);
                       if(inner_html_arr<5){
                           // alert("hahah")
                            $(farther_html).addClass("choose_seesion_price_W")
                       }

                }


            }
// 购票详情
            function panduanColorDetail(){
                var status=$('.aseter').attr('salestatus');
                console.log(status);
                switch(parseInt(status)) {
                    //状态 0 预售 1 售票中 2 未开售 3已结束
                    case 0:
                        $('.aseter').css({"background":"#F4687B","color":"#ffffff"});
                        break;
                    case 2:
                        $('.aseter').css({"background":"#5AB1F2","color":"#ffffff"});
                        break;
                    case 1:
                        $('.aseter').css({"background":"rgb(255,221,16)","color":"#333333"});
                        break;
                    case 3:
                        $('.aseter').css({"background":"#CCCCCC","color":"#7A7A7A"});
                        break;
                }
            }
