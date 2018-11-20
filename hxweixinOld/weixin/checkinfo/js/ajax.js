
        function data_fixed(data){
                                var programName = data.programName;
                                var scheduleName = data.scheduleName;
                                var venueName = data.venueName;
                                var stadiumName = data.stadiumName;
                                var scheduleCheckCount = data.scheduleCheckCount;
                                var seatCount = data.seatCount;
                                 var zongbili = (scheduleCheckCount / seatCount) * 100;

                                var zongbiliNew = Math.round(zongbili * 100) / 100 + "%";

                                var scheduleSoldCount=data.scheduleSoldCount;
                                 //alert(zongbiliNew);
                                $(".programName").html(programName);
                                $(".scheduleName").html(scheduleName);
                                $(".venueName").html(venueName);
                                $(".stadiumName").html(stadiumName);
                                $(".scheduleCheckCount").html(scheduleCheckCount);
                                $(".seatCount").html(seatCount);
                               $(".zongbili").html(zongbiliNew);
                                $(".scheduleSoldCount").html(scheduleSoldCount);
           }

           function data_arr(data){
             var data_data_arr = data.data;
             var html_tr = ''
                //alert(JSON.stringify(data_data_arr));
                   //alert(data_data_arr[0].seatAreaCount);
             $("#area_body").html("");
             $.each(data_data_arr, function(i, k) {

               html_tr = '<tr class="groups"><td>' + data_data_arr[i].seatAreaName + '</td><td>' + data_data_arr[i].seatAreaCount + '</td><td>' + data_data_arr[i].areaSoldCount + '</td><td>' + data_data_arr[i].checkNumber + '</td></tr>'

              $("#area_body").append(html_tr);


                  //  alert(data_data_arr[i].seatAreaCount);
                 var color_baifen = '';
                 var area_color="as";
                 var color_baifenbi = Math.round(data_data_arr[i].checkNumber / data_data_arr[i].seatAreaCount * 100) / 100;
              //      alter(data_data_arr[i].checkNumber)
                  var area_id = data_data_arr[i].seatAreaId;
                  //alert(area_bili);
                   add_color(area_id,area_color,color_baifenbi);
               });
           }
 function add_color(area_id,area_color,area_bili){
   if(area_bili <= 0.2) {
                //console.log(color_baifenbi);
                area_color = "rgb(53,210,0)";
            } else if(area_bili <= 0.4) {
               //console.log(color_baifenbi);
                area_color = "rgb(127,229,4)"
            } else if(area_bili <= 0.6) {
              //console.log(color_baifenbi);
                area_color = "rgb(250,237,43)"
            } else if(area_bili <= 0.8) {
              // console.log(color_baifenbi);
                area_color = "rgb(255,174,68)"
            }else if(area_bili <= 1) {
               // console.log(color_baifenbi);
                area_color = "rgb(249,57,64)"
            }
         $("#" + area_id).css("fill", area_color);

           }
