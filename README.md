# /weixin/common/common.js.prod  --prod
# /weixin/common/common.js.dev  --dev

|-- weChat                             			// 源码目录
|   |-- common                        			// 公共 样式与方法
|       |-- pic                        			// 公共图片
|       |-- css                        			// 公共样式
|           |-- initCss.css            			// 页面初始化css
|           |-- common.css             			// 页面公用样式
|           |-- styleLunbo.css             		// 图片轮播样式
|       |-- js                         			// 公用 js 库
|           |-- customJs                        // 公用 js 自己封装的方法
|                   |-- AJAX.js                 // AJAX 公用 方法 （ajax；获取地址栏参数；localStorage存储，取值）
|                   |-- base64.js               // 加密解密
|                   |-- bindMobile.js           // 绑定手机，获取验证码，检测验证码是否正确
|                   |-- getUserMes.js           // 获取用户信息 （获取用户金币；获取用户积分；获取已用积分；获取用户 （微信 && 微呗） 头像，昵称等信息；获取用户微贝点赞数，微贴数等；获取二维码）
|         		    |-- time.js                 // 倒计时；格式化时间戳，得到日期格式；
|         		    |-- toastDialog.js          // toast，提示框 ,返回首页
|         		    |-- URL.js                  // 路径管理
|          		    |-- common.js               // 公用 方法 测试环境
|          		    |-- common.js.dev           // 公用 方法 测试环境
|           	    |-- common.js.gray          // 公用 方法 灰度环境
|           	    |-- common.js.prod          // 公用 方法 正式环境
|           |-- officialJs                      // 公用 js 引用jq库；插件...
|                   |-- leftTime.min.js         // 倒计时插件
|         		    |-- moment.js               // 时间比较插件
|           		|-- fontSize.js             // 与rem组合使用
|          		    |-- jquery-1.8.2.min.js     // js 库
|           		|-- md5.js                  // 加密js库
|           		|-- spin.min.js             // 图片轮播，switch
|           		|-- WeixinApi.js            // 微信api
|           		|-- zepto.min.js            // 轻量级 js库
|           		|-- jqlunbo.js              // 图片轮播插件
|           		|-- jquery.event.drag.js    // 图片轮播插件
|           		|-- jquery.touchSlider.js   // 图片轮播插件
|           		|-- datePicker.js   		// 日期插件
|       |-- weUI                       			// 引用 UI 样式库
|   |-- membercard                     			// 会员卡
|       |-- css                        			// 样式包
|           |-- activatecar.css        			// 激活卡
|           |-- bindMobile.css         			// 绑定手机
|           |-- directionuse.css        		// 会员卡信息使用声明
|           |-- memberCenter.css       			// 会员卡主页
|           |-- memderqy.css           			// 会员权益
|           |-- myManagment.css        			// 我的管理
|           |-- pointRecord.css        			// 积分记录
|           |-- repast.css        				// 就餐取号
|           |-- selfhelp.css           			// 自助积分
|           |-- selfhelpDetails.css    			// 自助积分详情
|           |-- userinfo.css           			// 用户信息
|       |-- js                         			// js包
|           |-- common.js              			// 公用方法
|           |-- bindMobile.js          			// 绑定手机
|           |-- memberCenter.js        			// 会员卡主页
|           |-- memberqy.js        			    // 会员权益
|           |-- myManagment.js         			// 我的管理
|           |-- pointRecord.js         			// 积分记录
|           |-- repast.js         			    // 就餐取号
|           |-- selfhelp.js            			// 自助积分
|           |-- selfhelpDetails.js     			// 自助积分详情
|           |-- userinfo.js            			// 用户信息
|       |-- pic                        			// 图片包
|       |-- directionuse.html         			// 会员卡信息使用声明
|       |-- memberCenter.html          			// 会员卡主页
|       |-- memderqy.html              			// 会员权益
|       |-- myManagment.html           			// 我的管理
|       |-- pointRecord.html           			// 积分记录
|       |-- pointRule.html             			// 规则
|       |-- repast.html                 		// 就餐取号
|       |-- selfhelp.html              			// 自助积分
|       |-- selfhelpDetails.html       			// 自助积分详情
|       |-- userinfo.html              			// 用户信息
|   |-- parking                        			// 停车
|       |-- css                        			// 样式包
|           |-- common.css             			// 公用样式
|           |-- addCarNum.css          			// 添加车牌号
|           |-- costbreakdown.css      			// 费用明细
|           |-- layer.css              			// 样式插件
|           |-- lc_switch.css          			// 样式插件
|           |-- onlinepayment.css      			// 停车管理
|           |-- parkingInput.css       			// 输入车牌号
|           |-- parkingGuideRule.css   			// 会员须知
|           |-- parkingRecord.css      			// 停车记录
|           |-- parkingRecordDetails   			// 停车记录详情
|           |-- registerationVehicles  			// 车牌号列表
|       |-- js                         			// js包
|           |-- common.js              			// 公用方法
|           |-- addCarNum.js           			// 添加车牌号
|           |-- costbreakdown.js       			// 费用明细
|           |-- layer.js               			// 输入车牌号插件
|           |-- onlinepayment.js       			// 停车管理
|           |-- parkingGuideRule.js    			// 会员须知
|           |-- parkingInput.js        			// 输入车牌号
|           |-- parkingRecord.js       			// 停车记录
|           |-- parkingRecordDetails.js			// 停车记录详情
|           |-- registrationVehicles.js			// 车牌号列表
|       |-- pic                        			// 图片包
|       |-- addCarNum.html             			// 添加车牌号
|       |-- costbreakdown.html         			// 费用明细
|       |-- onlinepayment.html         			// 停车管理
|       |-- parkingGuideRule.html      			// 会员须知
|       |-- parkingRecord.html         			// 停车记录
|       |-- parkingRecordDetails.html  			// 停车记录详情
|       |-- registrationVehicles.html  			// 车牌号列表
|   |-- luckBall                       			// 幸运球
|       |-- css                        			// 样式包
|           |-- common.css             			// 公用样式
|           |-- listDetail.css         			// 订单详情
|           |-- luckBallAct.css        			// 幸运球活动
|           |-- luckBallActrule.css    			// 活动规则
|           |-- luckBallAward.css      			// 开奖信息
|           |-- luckBallList.css       			// 订单
|           |-- luckBallPick.css       			// 选号页面
|           |-- luckBallSuc.css        			// 选号成功
|           |-- luckBalTrailer.css     			// 幸运球奖品介绍
|       |-- js                         			// js包
|           |-- common.css             			// 公用样式
|           |-- listDetail.css         			// 订单详情
|           |-- luckBallAct.css        			// 幸运球活动
|           |-- luckBallActrule.css    			// 活动规则
|           |-- luckBallAward.css      			// 开奖信息
|           |-- luckBallList.css       			// 订单
|           |-- luckBallPick.css       			// 选号页面
|           |-- luckBallSuc.css        			// 选号成功
|       |-- pic                        			// 图片包
|       |-- listDetail.html            			// 订单详情
|       |-- luckBallAct.html           			// 幸运球活动
|       |-- luckBallActrule.html       			// 活动规则
|       |-- luckBallAward.html         			// 开奖信息
|       |-- luckBallList.html          			// 订单
|       |-- luckBallPick.html          			// 选号页面
|       |-- luckBallSuc.html           			// 选号成功
|       |-- luckBalTrailer.html        			// 幸运球奖品介绍
