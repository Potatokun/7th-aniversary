/** 
 * 用于 index.html&/m/index.html
 * PC端与移动端公用逻辑
 * @date    2017-09-26
 */

var anniversary = {'env' : {}};

var site = location.host.indexOf('192.168.') != -1 ? '' : '/m3g/7zn';

/** 
 * ajax地址map 
 * login--登录 userInfo--获取用户信息 lottery--抽奖 bind--绑定大区 
 * queryNick--查询用户指定大区角色昵称 address--提交邮寄地址 getGift--领取奖励
 * record--我的红包获奖记录 luckList--中奖用户名单
 */
anniversary.ajaxUrlMap = {
    'login' : site + '/oauth/login/',
    'userInfo' : site + '/oauth/user/',
    'lottery' : site + '/api/lottery/draw/',
    'bind' : site + '/api/area/bind/',
    'queryNick' : site + '/api/game/area/',
    'address' : site + '/api/lottery/address/',
    'getGift' : site + '/api/lottery/receive/',
    'record' : site + '/api/lottery/mine/',
    'luckyList' : site + '/api/lottery/list/'
};

mslogin.loginurl = anniversary.ajaxUrlMap.login;

/** 
 * 用户浏览环境监测
 * isiOS -- 是否为iOS环境
 * idDroid -- 是否为安卓环境
 * isSP -- 是否为移动端环境
 * 以上变量全局下可通过annniversary.XXX访问
 */
var _ua = navigator.userAgent;
var isiOS, isDroid, isSP;

anniversary.env.isiOS   = isiOS   = (_ua.indexOf('iPhone') > 0 || _ua.indexOf('iPad') > 0 || _ua.indexOf('iPod') > 0);
anniversary.env.isDroid = isDroid = (_ua.indexOf('Android') > 0);
anniversary.env.isSP    = isSP    = (isiOS || isDroid);

/** 
 * 用户相关活动信息缓存
 * login -- 是否登录 ==1已登录 ==0未登录
 * bind -- 是否绑定过大区 ==1已绑定 ==0未绑定
 * ready -- /oauth/user/接口是否请求完毕 ==1完毕 ==0未得到返回 ==0时点击相关功能按钮提示“用户信息查询中，请稍等”
 * lotteryCache -- 用户获奖记录缓存，用户抽奖或第一次请求记录接口后被赋值
 * openPack -- 用户是否已抽过红包，==1已抽 ==0未抽 ==1时抽奖按钮锁住提示用户已抽过红包
 * 以上变量全局下可通过UA.XXX访问
 */
var UA = {'login': 0, 'bind' : 0, 'ready' : 0, 'lotteryCache': {}};
var giftId = -1;

var redPack = '.red';

//Object extend
function extend(Child, Parent) {
　　var F = function(){};
　　F.prototype = Parent.prototype;
　　Child.prototype = new F();
　　Child.prototype.constructor = Child;
　　Child.uber = Parent.prototype;
}

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

//ajax超时，统一20秒
$.ajaxSetup({
    timeout : 20 * 1000
});

(function(aniversary){

    'use strict';

    /**
     * class 遮罩
     *
     * @prototype    init--实例化
     * @returns  object
     *
     */  
    var Mask = (function(){

        function Mask(){
            this.node = $('<div class="u-mask"></div>');
            this.init();
        };

        Mask.prototype = {
            init : function(){

                if(!$('.u-mask').length)this.node.appendTo('body');
                $('.u-mask').show();
            }
        };

        return Mask;
    }());

    /**
     * class 通信提示Loading
     *
     * @prototype    init--实例化
     * @prototype    suicide--自毁
     * @returns  object
     *
     */  
    var Loading = (function(){

        function Loading(){
            this.node = $('<div class="u-loading"><div class="content">请稍后……</div></div>')
            this.init();
        };

        Loading.prototype = {
            init : function(){
                if(!$('.u-loading').length)this.node.appendTo('body');
                $('.u-loading').show();
            },

            suicide : function(){
                this.node.remove();
            }
        };

        return Loading;
    }());
    anniversary.Loading = Loading;

    /**
     * class 用户信息
     * @param    json  config--相关配置
     * @param    function   config.callback--请求结束后的回调函数
     * 
     * @prototype    init--实例化
     * @prototype    sendAjax--发送请求
     * @prototype    callback--请求成功后的回调
     * @prototype    successHandler--response.code==0执行的回调
     * @prototype    errHandler--暂无作用
     * @returns  object
     *
     * 全局下可通过anniversary.UserInfo调用
     * 
     * @example new anniversary.UserInfo({'callback':fn})
     */  
    var UserInfo = (function () {

        function UserInfo(config){
            this.dataCache = {};
            this.callbackSupply = config.callback;
            this.init();
        };

        UserInfo.prototype = {
            init : function (){
                this.sendAjax();
            },

            sendAjax : function(){
                var self = this;
                $.get(anniversary.ajaxUrlMap.userInfo,{'r': new Date().getTime()},function(resp){
                    self.callback(resp);
                },'json');
            },

            callback : function(resp){
                UA.info = resp.data;               
                if(resp.code==4){
                    //未登录
                }
                else if(resp.code==0){
                    //已登录                   
                    this.successHandler();
                }             
                else{
                    //TODO
                }
                UA.openPack = UA.info.stage; 
                UA.ready = 1;             
            },

            successHandler : function(){               
                UA.login = 1;
                if(UA.info.area_id!='0')UA.bind = 1;
                this.callbackSupply(UA.info);   
            },

            errHandler : function (){
                //TODO
            }
        };

        return UserInfo;
    }());
    anniversary.UserInfo = UserInfo;

    /**
     * class 弹窗
     * @param    json  config--相关配置
     * @param    string   config.title--弹窗title
     * @param    string   config.bodyNode--弹窗内容区域的node
     * @param    string   config.clz--弹窗的class，便于CSS控制
     * @param    function   config.ok&&config.off--原定于用来改写弹窗确定键和关闭键的函数，暂无作用
     * 
     * @prototype    init--实例化
     * @prototype    set--填充弹窗内容节点/绑定节点事件/定位/显示
     * @prototype    evtBind--控制弹窗内DOM的事件绑定
     * @prototype    setPos--定下弹窗在浏览器窗口的显示位置
     * @prototype    appear--显示
     * @prototype    suicide--自灭，删除自身节点，和相关绑定事件
     * @prototype    exsist--判断该弹窗是否已经存在 返回真假值
     * @returns  object
     *
     * 全局下可通过anniversary.Dialog调用
     * 
     * @example new anniversary.Dialog({config})
     */  
    var Dialog = ( function ( ) {

        function Dialog(config){
            config = config || {};
            this.title = config.title || 'default';
            this.bodyNode = config.content;
            this.clz = config.clz||'default';
            this.off = config.off || function(){};
            this.ok = config.ok || function(){};
            this.init();
        };

        Dialog.prototype = {

            init : function(){
                this.set();
            },

            set : function(){
                this.node = $(
				'<div class="u-window '+ this.clz +'">' + 
					'<div class="header">' + 
						'<div class="title">' + this.title + '</div>' + 
						'<button class="close">×</button>' + 
					'</div>' +
					'<div class="body"></div>' + 
                '</div>');

                $(this.bodyNode).appendTo(this.node.find('.body'));
                
                var isExist = this.exist();
                //isExist? '' : this.node.appendTo('body');
                this.node.appendTo('body');
                this.evtBind();
                this.setPos();
                new Mask();
                this.appear();
            },

            evtBind : function(){
                var self = this;
                this.node.on('click','button.close',function(){
                    self.suicide();
                });
            },

            setPos : function(){
                this.node.css({
                    'margin-left' : parseInt(this.node.outerWidth()) * -0.5,
                    'margin-top' : parseInt(this.node.outerHeight()) * -0.5,
                    'left' : '50%',
                    'top' : '50%'
                })
            },

            appear : function(){
                this.node.show();
            },

            suicide : function (){
                this.node.remove();
                $('.u-mask').hide();
            },

            exist : function(){
                return $('.' + this.clz ).length;
            }

        };
        
        return Dialog;
    }());
    anniversary.Dialog = Dialog;

    /**
     * class 系统消息通知
     * @param    string   text--toast的文本
     * @param    string  type--toast的class，便于CSS控制
     * 
     * @prototype    init--实例化
     * @prototype    setType--设定toast的type
     * @prototype    setText--设定toast的显示文本
     * @prototype    show--控制toast显示
     * @prototype    suicide--自灭，暂无内容
     * @prototype    isExsist--判断文档流内是否已经有toast节点
     * @returns  object
     *
     * 全局下可通过anniversary.Toast调用
     * 
     * @example new anniversary.Toast({'type':XXX,'text':XXX})
     */  
    var Toast = (function () {

        function Toast (config){
            this.type = config.type;
            this.text = config.text;
            
            this.init();
        };

        Toast.prototype = {

            init : function(){

                this.node = $('<div class="u-toast"><div></div></div>');

                if(!this.isExist()){
                    $('body').append(this.node);
                }
                else{
                    this.node = $('.u-toast');
                };

                this.setType();
                this.setText();

                this.show();
            },

            isExist : function(){
                return $('.u-toast').length ? true : false;
            },

            setType: function() {
                //'success', 'error', 'info', 'warn'
                this.node.children()[0].className = ( this.type || 'success');
            },            

            setText: function(){
                this.node.children().html(this.text);
            },            

            show: function(){
                this.node.stop(true, true)
                    .fadeIn().delay(1000)
                    .fadeOut();
            },
                
            suicide : function(){
                //TODO
            }

        };

        return Toast;

    }());
    anniversary.Toast = Toast;

    /**
     * class 红包
     * 
     * @prototype    init--实例化
     * @prototype    sendAjax--发送ajax请求，成功后执行callback里的内容，并实例化LotteryToast对象
     * @prototype    callback--请求后回调函数
     * @prototype    errHandler--resp.code!=0执行
     * @prototype    suicide--自灭，暂无内容
     * @returns  object
     *
     * 全局下可通过anniversary.Lottery调用
     * 
     * @example new anniversary.Lottery()
     */  
    var Lottery = (function () {

        function Lottery( config ){
            this.config = config || {};
            this.init();
        };

        Lottery.prototype = {
            init : function (){
                this.sendAjax();
            },

            suicide : function (){
            },

            sendAjax : function (){               
                this.timelimt = 1000 * 10;
                this.url = '';

                var self = this;
                $('#J-lottery').addClass('dismiss');
                var _loading = new Loading();
                $.ajax({
                    url: anniversary.ajaxUrlMap.lottery,
                    data: {'r': new Date().getTime()},
                    success: function(resp){
                        _loading.suicide();
                        if(resp.code==0){
                            self.callback(resp);
                        }
                        else if(resp.code==4){
                            mslogin.login();
                        }
                        else{
                            self.errHandler(resp);
                        }
                        $('#J-lottery').removeClass('dismiss');
                    },
                    error : function(){
                        _loading.suicide();
                        self.errHandler({'msg':'请稍后再试'});
                        $('#J-lottery').removeClass('dismiss');
                    },
                    dataType: 'json'
                });


                // var _bk = {"code":0,"data":{"item":{"status":0,"list":[{"id":"1","prize_id":"4","prize_type":"big","prize_name":"3\u5143\u73b0\u91d1\u7ea2\u5305","sign":"6cd58cb5e8671ed848b79b5eede463a1"},{"id":"2","prize_id":"0","prize_type":"property","prize_name":"\u5468\u5e74\u5e86\u793c\u5305Lv5","sign":"d3350967fd8eefec8dd22fdc2cde6e92"}]},"lottery":{"status":0,"list":[{"id":"3","prize_id":"11","prize_type":"lottery","prize_name":"\u952e\u76d8","sign":"ce5bd1973baf8cd34b137ad9dee7bdf2"}]}},"msg":"ok"}

                // self.callback(_bk);               
            },

            callback : function (rewardData){

                $(redPack).addClass('shake-chunk');        
                setTimeout(function(){          
                    $(redPack).removeClass('shake-chunk');
                    new LotteryToast({},rewardData.data);
                    UA.openPack = '1';
                    UA.lotteryCache = rewardData.data;
                },2000);
                              
            },

            errHandler : function (resp){
                new Toast({
                    'type' : 'error',
                    'text' : decodeURI(resp.msg) || '请稍后再试'
                });
            }
        };

        return Lottery;
    }());
    anniversary.Lottery = Lottery;

    /**
     * class 绑定大区
     * 继承自Dialog对象
     * 
     * @param    json   config--同父级
     * @param    string  areaid--用户大区id--用于控制弹窗内容初始状态
     * 
     * @prototype    sendAjax--发送ajax请求，成功后若resp.code==0执行successHandler里的内容
     * @prototype    setArea--填充大区列表
     * @prototype    queryArea--根据传入的大区id返回相应的大区名称
     * @prototype    getNickName--根据传入的大区id返回用户相应的大区的昵称，相关调用在evtBind方法里
     * @prototype    evtBind--弹窗内容内相关节点事件绑定
     * @prototype    errHandler--resp.code!=0&&resp.code!=4执行
     * @prototype    suicide--自灭，删除节点与相关事件绑定
     * @returns  object
     *
     * 全局下可通过anniversary.AreaDialog调用
     * 
     * @example new anniversary.AreaDialog({},1)
     */  
    var AreaDialog = (function(){

        function AreaDialog(config,areaid){
            areaid = areaid || 0;
            this.title = '绑定大区';
            this.clz = 'ui-area';
            this.json = {};
            this.token = '';
            this.bodyNode =  '<div class="u-area"><div class="u-select">'+ this.setArea(areaid) +'</div><p class="nickname notice">昵称：<b>---</b></p><p class="err"></p><p class="notice">*绑定后不可修改</p><button class="u-btn submit">确定提交</button></div>';
            
            this.init();
            if(areaid!='0')this.getNickName();           
        };

        extend( AreaDialog , Dialog );

        AreaDialog.prototype.setArea = function (areaid){
			areaid = areaid || 0;

			var aData = [{"id":1,"name":"火烧赤壁"},{"id":2,"name":"草船借箭"},{"id":6,"name":"荆州之战"},{"id":7,"name":"青梅煮酒"},{"id":8,"name":"官渡之战"},{"id":9,"name":"桃园结义"},{"id":11,"name":"九伐中原"},{"id":12,"name":"逐鹿中原"},{"id":13,"name":"三分天下"}];
			var i=0,l=aData.length;

			var ret = '';
			for (; i < l; i++) {
				ret += '<li><a href="javascript:;" selectid="'+ aData[i].id +'">'+ aData[i].name +'</a></li>';
			};
			ret = '<div id="u-select"><div class="now">'+ this.queryArea(areaid) +'</div><ul class="u-list">'+ ret +'</ul></div><input name="" type="hidden" value="'+ areaid +'" id="J-area"/>';

			return ret;
        };

        AreaDialog.prototype.queryArea = function(num){
            var area = '请选择大区';

            if(num==1){
                area = '火烧赤壁';
            }
            else if(num==2){
                area = '草船借箭';
            }
            else if(num==6){
                area = '荆州之战';
            }
            else if(num==7){
                area = '青梅煮酒';
            }
            else if(num==8){
                area = '官渡之战';
            }
            else if(num==9){
                area = '桃园结义';
            }
            else if(num==11){
                area = '九伐中原';
            }
            else if(num==12){
                area = '逐鹿中原';
            }					
            else if(num==13){
                area = '三分天下';
            }

            return area;            
        };

        AreaDialog.prototype.evtBind = function(){
            var self = this;
            this.node.on('click','button.close',function(){
                self.suicide();
            });

            this.node.on('click','.u-select .now',function(){
                $('.u-select .u-list').show();
            });

            this.node.on('click','.u-select .u-list li',function(){
                var area = $(this).html();
                var _areaId = $(this).find('a').attr('selectid');

                $('.u-select .now').html(area);
                $('#J-area').val(_areaId);
                $('.u-select .u-list').hide();

                self.getNickName();
            });
        
            this.node.on('click','.u-btn.submit',function(){
                var val = $('#J-area').val();

                if(!val){
                    new Toast({
                        'type' : 'error',
                        'text' : '请选择大区'
                    });

                    return;
                }


                if(!self.token){
                    new Toast({
                        'type' : 'error',
                        'text' : '请绑定有效大区'
                    });

                    return;
                }                

                self.sendAjax();
            });            
        };

        AreaDialog.prototype.sendAjax = function(){
            var self = this;

            if(self.node.find('.submit').hasClass('dismiss'))return;

            self.node.find('.submit').addClass('dismiss');

            $.get(anniversary.ajaxUrlMap.bind,{'areaId': $('#J-area').val(),'token' : this.token,'json': this.json,'r': new Date().getTime()},function(resp){
                if(resp.code==0){
                    self.successHandler(resp);
                }
                else if(resp.code==4){
                    self.suicide();
                    mslogin.login();
                }
                else{
                    self.errHandler(resp)
                }

                self.node.find('.submit').removeClass('dismiss');
            },'json');
        };

        AreaDialog.prototype.callback = function(){

        };

        AreaDialog.prototype.getNickName = function(){
            var val = $('#J-area').val();

            var self = this;

            $('.u-area .err').html('查询中……');
            $.get( anniversary.ajaxUrlMap.queryNick ,{'areaId':val,'r': new Date().getTime()}, function(resp) {
                if(resp.code == 0){
                    $('.u-area .nickname b').html(resp.data.nick);
                    $('.u-area .err').html('');

                    self.token = resp.data.token;
                    self.json = resp.data.json;                    
                }
                else if(resp.code==4){
                    self.suicide();
                    mslogin.login();
                }
                else{
                    $('.u-area .nickname b').html('---');
                    $('.u-area .err').html('角色不存在');

                    self.token = '';
                    self.json = {};
                }
            },'json');            
        };

        AreaDialog.prototype.successHandler = function(resp){
            new Toast({
                'text' : decodeURI('大区绑定成功')
            });

            UA.bind = 1;
            
            this.suicide();
        };

        AreaDialog.prototype.errHandler = function(resp){
            new Toast({
                'type' : 'error',
                'text' : decodeURI(resp.msg) || '请稍后再试'
            });
        };
        return AreaDialog;

    }());
    anniversary.AreaDialog = AreaDialog;

    /**
     * class 用户邮寄地址弹窗
     * 继承自Dialog对象
     * 
     * @param    json   config--同父级
     * @param    string  sing--奖励道具的sign--用于控制弹窗内容初始状态
     * @param    string  id--奖励道具的id--用于控制弹窗内容初始状态
     * 
     * @prototype    setPos--邮寄地址弹窗定位
     * @prototype    appear--邮寄地址弹窗显示
     * @prototype    sendAjax--发送ajax请求，成功后若resp.code==0执行callback里的内容并更新UA.lotteryCache
     * @prototype    validate--验证相关提交参数是否有效(全部相关项不为空)
     * @prototype    evtBind--弹窗内容内相关节点事件绑定
     * @prototype    callback--请求成功的回调函数
     * @prototype    suicide--自灭，删除节点与相关事件绑定，让红包结果通知或我的红包弹窗复位
     * @returns  object
     *
     * 全局下可通过anniversary.AddressDialog调用
     * 
     * @example new anniversary.AddressDialog({},1,1)
     */  
    var AddressDialog = (function(){
        function AddressDialog (cofig,sign,id){
            this.title = '填写邮寄地址';
            this.clz = 'ui-adress';
            this.bodyNode =  '<div class="u-win content">\
                                    <div class="notice">请填写正确的邮寄地址or个人信息，保持电话畅通，24小时内客服会与您核实信息！~</div>\
                                    <div class="adress-form">\
                                        <div class="form-row"><input name="name" placeholder="请填写收件人姓名" type="text"></div>\
                                        <div class="form-row"><input name="phone" placeholder="请填写收件人手机号码" type="text"></div>\
                                        <div class="form-row"><input name="address" placeholder="请填写正确的邮寄信息" type="text"></div>\
                                        <input name="id" type="hidden" value="'+ id +'">\
                                        <input name="sign" type="hidden" value="'+ sign +'">\
                                    </div>\
                                    <div class="u-btn js-adress-comfirm submit">确认信息</div>\
                                </div>';                               
            this.init();
        };
        extend( AddressDialog , Dialog );

        AddressDialog.prototype.setPos = function(){
                this.node.css({
                    'margin-left' : parseInt(this.node.outerWidth()) * -0.5,
                    'margin-top' : parseInt(this.node.outerHeight()) * -0.5,
                    'left' : '50%',
                    'top' : '-100%'
                })        
        };

        AddressDialog.prototype.appear = function(){
            var _me = this;
            $('.ui-record,.reward-toast').animate({
                'top': '400%'},
                300, function() {
                _me.node.show().animate({'top': '50%'},300);
            });
        };
        
        AddressDialog.prototype.suicide = function(){
            var _me = this;
             _me.node.animate({
                'top': '-100%'},
                300, function() {
                _me.node.remove();
                $('.ui-record,.reward-toast').animate({'top': '50%'},300);
            });           
        };
        
        AddressDialog.prototype.evtBind = function(){
            var self = this;
            this.node.on('click','button.close',function(){
                self.suicide();
            });
            
            //todo ajaxHandler
            this.node.on('click','.u-btn.submit',function(){
                self.validate();
                if(self._validate)self.sendAjax();
            });              
        };

        AddressDialog.prototype.validate = function(){
            var self = this;
            self._validate = true;
            
            $("input[name]").each(function(){
                var val = $(this).val();

                if(!val){
                    new Toast({
                        'type' : 'error',
                        'text' : $(this).attr('placeholder')
                    })

                    self._validate = false;

                    return false;
                }
            });
            
        };        

        AddressDialog.prototype.sendAjax = function(){
            //todo ajax
            var self = this;

            if(self.node.find('.submit').hasClass('dismiss'))return;

            self.node.find('.submit').addClass('dismiss'); 

            $.ajax({
                url: anniversary.ajaxUrlMap.address,
                type: 'POST',
                dataType: 'json',
                data: {
                    'r' : new Date().getTime(),
                    'phone' : $('input[name=phone]').val(),
                    'address' : $('input[name=address]').val(),
                    'name' : $('input[name=name]').val(),
                    'sign' : $('input[name=sign]').val() || '',
                    'id' : $('input[name=id]').val() || ''
                }
            })
            .done(function(resp) {
                if(resp.code == 0){
                    new Toast({
                        'text' : '提交成功'
                    })                   
                    self.callback(resp);
                    lotteryCacheUpdate('lottery');
                }
                else if(resp.code==4){
                    self.suicide();
                    mslogin.login();
                }                
                else{
                    new Toast({
                        'text' : decodeURI(resp.msg) || '请稍后再试',
                        'type': 'error'
                    })
                    self.node.find('.submit').removeClass('dismiss');   
                }                
            })
            .fail(function() {
                new Toast({
                    'text' : decodeURI('请稍后再试'),
                    'type': 'error'
                })
                self.node.find('.submit').removeClass('dismiss');    
            });
        };
        
        AddressDialog.prototype.callback = function (){
            this.suicide();
            $('.ui-record,.reward-toast').find('.js-adress').addClass('dismiss');
            UA.adressSubmit = 1;
        };

        return AddressDialog;
    }());
    anniversary.AddressDialog = AddressDialog;

    /**
     * class 用户支付宝信息提交弹窗
     * 继承自Dialog对象
     * 
     * @param    json   config--同父级
     * @param    string  sing--奖励道具的sign--用于控制弹窗内容初始状态
     * @param    string  id--奖励道具的id--用于控制弹窗内容初始状态
     * 
     * @prototype    setPos--邮寄地址弹窗定位
     * @prototype    appear--邮寄地址弹窗显示
     * @prototype    sendAjax--发送ajax请求，成功后若resp.code==0执行callback里的内容
     * @prototype    validate--验证相关提交参数是否有效(全部相关项不为空)
     * @prototype    evtBind--弹窗内容内相关节点事件绑定
     * @prototype    callback--请求成功的回调函数并更新UA.lotteryCache
     * @prototype    suicide--自灭，删除节点与相关事件绑定，让红包结果通知或我的红包弹窗复位
     * @returns  object
     *
     * 全局下可通过anniversary.AlipayDialog调用
     * 
     * @example new anniversary.AlipayDialog({},1,1)
     */  
    var AlipayDialog = (function(){
        function AlipayDialog (config,sign,id){
            this.title = '填写支付宝账号';
            this.clz = 'ui-adress';
            this.bodyNode =  '<div class="u-win content">\
                                    <div class="notice">请确保您的支付宝账号填写正确，否则会收不到现金红包哦~</div>\
                                    <div class="adress-form">\
                                        <div class="form-row"><input name="account" placeholder="请填写支付宝账号" type="text"></div>\
                                        <div class="form-row"><input name="account_2" placeholder="请再次填写支付宝账号" type="text"></div>\
                                        <div class="form-row"><input name="phone" placeholder="请填写您的手机号" type="text"></div>\
                                        <input name="id" type="hidden" value="'+ id +'">\
                                        <input name="sign" type="hidden" value="'+ sign +'">\
                                    </div>\
                                    <div class="u-btn js-adress-comfirm submit">确认信息</div>\
                                </div>';                               
            this.init();
        };
        extend( AlipayDialog , Dialog );

        AlipayDialog.prototype.setPos = function(){
                this.node.css({
                    'margin-left' : parseInt(this.node.outerWidth()) * -0.5,
                    'margin-top' : parseInt(this.node.outerHeight()) * -0.5,
                    'left' : '50%',
                    'top' : '-100%'
                })        
        };

        AlipayDialog.prototype.appear = function(){
            var _me = this;
            $('.ui-record,.reward-toast').animate({
                'top': '400%'},
                300, function() {
                _me.node.show().animate({'top': '50%'},300);
            });
        };
        
        AlipayDialog.prototype.suicide = function(){
            var _me = this;
             _me.node.animate({
                'top': '-100%'},
                300, function() {
                _me.node.remove();
                $('.ui-record,.reward-toast').animate({'top': '50%'},300);
            });           
        };
        
        AlipayDialog.prototype.evtBind = function(){
            var self = this;
            this.node.on('click','button.close',function(){
                self.suicide();
            });
            
            //todo ajaxHandler
            this.node.on('click','.u-btn.submit',function(){
                self.validate();
                if(self._validate)self.sendAjax();
            });              
        };

        AlipayDialog.prototype.validate = function(){
            var self = this;
            self._validate = true;
            
            $("input[name]").each(function(){
                var val = $(this).val();

                if(!val){
                    new Toast({
                        'type' : 'error',
                        'text' : $(this).attr('placeholder')
                    })

                    self._validate = false;

                    return false;
                }
            });

            var _account = $('[name=account]').val(),
                _account_2 = $('[name=account_2]').val();

            if(_account!==_account_2){
                new Toast({
                    'type' : 'error',
                    'text' : '支付宝两次输入结果不一致'
                })

                self._validate = false;           
            }
          
        };        

        AlipayDialog.prototype.sendAjax = function(){
            var self = this;

            if(self.node.find('.submit').hasClass('dismiss'))return;

            self.node.find('.submit').addClass('dismiss');    

            $.ajax({
                url: anniversary.ajaxUrlMap.getGift,
                type: 'POST',
                dataType: 'json',
                data: {'r': new Date().getTime(),
                        'id': $('input[name=id]').val(),
                        'sign': $('input[name=sign]').val(),
                        'alipay' : $('input[name=account]').val(),
                        'phone' : $('input[name=phone]').val()
                }
            })
            .done(function(resp) {

                if(resp.code == 0){
                    new Toast({
                        'text' : decodeURI(resp.msg)
                    });
                    self.callback();
                }
                else{
                    new Toast({
                        'text' : decodeURI(resp.msg) || '请稍后再试',
                        'type' : 'error'
                    });
                    self.node.find('.submit').removeClass('dismiss');                    
                }

            })
            .fail(function() {
                new Toast({
                    'text' : decodeURI('请稍后再试'),
                    'type' : 'error'
                });
                self.node.find('.submit').removeClass('dismiss'); 
            });            
                       
        };
        
        AlipayDialog.prototype.callback = function (){
            this.suicide();
            //TODO
            $('.ui-record,.reward-toast').find('.get-gift').addClass('dismiss').html('已领取');
            $('.ui-record,.reward-toast').find('.check-box').attr('read',true);
            $('.ui-record,.reward-toast').find('[data-type="money"] i').addClass('on');            
            UA.AlipaySubmit = 1;
            lotteryCacheUpdate('money');
        };

        return AlipayDialog;
    }());
    anniversary.AlipayDialog = AlipayDialog;

    /**
     * class 获奖结果通知弹窗
     * 继承自Dialog对象
     * 
     * @param    json   config--同父级
     * @param    json  data--获奖数据的相关data，格式参考lottery接口
     * 
     * @prototype    setList--填充获奖选项列表
     * @prototype    appear--邮寄地址弹窗显示
     * @prototype    sendAjax--发送ajax请求，成功后若resp.code==0执行callback里的内容
     * @prototype    validate--验证相关提交参数是否有效
     * @prototype    evtBind--弹窗内容内相关节点事件绑定
     * @prototype    errHandler--resp.code!=0&&resp.code!=4执行
     * @prototype    callback--请求成功的回调函数并更新UA.lotteryCache
     * @returns  object
     *
     * 全局下可通过anniversary.LotteryToast调用
     * 
     * @example new anniversary.LotteryToast({},{})
     */  
    var LotteryToast = (function () {

        function LotteryToast ( cofig , data ){
            this.title = '恭喜您获得以下奖励';
            this.clz = 'reward-toast';
            this.choseMoney = false;
            this.id = -1;
            this.sign = '';
            this.bodyNode = '<div class="u-win content">\
                                <div class="reward-view">\
                                    <ul>'+ this.setList(data) +'</ul>\
                                </div>\
                                <div class="notice">现金红包和七周年回馈礼包2选1，确认领取后无法更改。</div>\
                                <button class="u-btn get-gift submit">确认领取</button>\
                            <div>'                            
            this.init();
        };
        extend( LotteryToast , Dialog );

        LotteryToast.prototype.suicide = function(){
            this.node.remove();
            $('.u-mask').hide();
            giftId = 0;
        };

        LotteryToast.prototype.setList = function(data){
            var ret = '';

            for(var i = 0; i < data.item.list.length; i++){
                var item = data.item.list[i];

                //TODO read = true
                if(item.prize_id!=0){
                    ret += '<li><div class="item-detail money"><div class="item-pic redPack"></div><div class="item-name">'+ item.prize_name.replace('现金红包', '') +'</div></div><div class="check-box" data-id="'+ item.id +'" data-type="money" data-sign="'+ item.sign+'" data-name="'+ item.prize_name +'" data-index = "'+ i +'"><i></i></div></li>';
                }
                else{
                    ret += '<li><div class="item-detail"><div class="item-pic A'+ item.id +'" data-tip="A'+ item.grade +'"></div><div class="item-name">'+ item.prize_name+'</div></div><div class="check-box" data-id="'+ item.id +'" data-type="normal" data-sign="'+ item.sign +'" data-name="'+ item.prize_name +'" data-index = "'+ i +'"><i></i></div></li>';
                }              
            }

            if(data.lottery.list.length){
                ret += '<li><div class="item-detail A'+ data.lottery.list[0].prize_id +'"><img src="static/images/gift/reward-r-'+ data.lottery.list[0].prize_id +'.png"><div class="item-name">'+ data.lottery.list[0].prize_name+'</div></div><div class="u-btn adress js-adress" data-id="'+ data.lottery.list[0].id +'" data-sign="'+ data.lottery.list[0].sign +'"></div></li>';
            }

            return ret;
        };

        LotteryToast.prototype.evtBind = function(){
            var self = this;
            this.node.on('click','button.close',function(){
                self.suicide();
            });
            
            //todo ajaxHandler
            this.node.on('click','.u-btn.submit',function(){
                self.validate();

                if(self.choseMoney){
                    if($(this).hasClass('dismiss'))return;

                    new AlipayDialog({},self.sign,self.id);
                    return;
                }

                if(self._validate)self.sendAjax();
                //if(self._validate)self.callback();
             
            });
            
            //check box simulation
            this.node.on('click','.check-box',function(){
                if(UA.getGift)return;

                if($(this).attr('read'))return;

                var _me = $(this);

                _me.closest('.u-window').find('.check-box i').removeClass('on');
                _me.find('i').addClass('on');

                giftId = _me.data('id');
                self.id = _me.data('id');
                self.sign = _me.data('sign');

                if(_me.data('type')=='money'){
                    self.choseMoney = true;
                }
                else{
                    self.choseMoney = false;
                }
            });

            //window.adress
            this.node.on('click','.js-adress',function(){

                var id = $(this).data('id'),
                    sign = $(this).data('sign');

                if($(this).hasClass('dismiss')){
                    new Toast({
                        'type' : 'error',
                        'text' : '您已提交过个人邮寄地址信息'
                    });
                    return;
                }

                new AddressDialog({},sign,id);
            });

        };

        LotteryToast.prototype.validate = function(){
            var self = this;
            self._validate = true;
            
            if(giftId == -1){
                new Toast({
                    'text' : '请选择奖励',
                    'type': 'error'
                }) ;
                
                self._validate = false;
            }
            
        };        

        LotteryToast.prototype.sendAjax = function(){
            //todo ajax
            var self = this;

            if(self.node.find('.submit').hasClass('dismiss'))return;

            self.node.find('.submit').addClass('dismiss');            

            var self = this;
            $.ajax({
                url: anniversary.ajaxUrlMap.getGift,
                type: 'POST',
                dataType: 'json',
                data: {'r': new Date().getTime(),
                        'id': self.id,
                        'sign': self.sign,
                }
            })
            .done(function(resp) {

                if(resp.code == 0){
                    new Toast({
                        'text' : '提交成功'
                    });
                    self.callback();
                }
                else{
                    new Toast({
                        'text' : decodeURI(resp.msg) || '请稍后再试',
                        'type' : 'error'
                    });
                    self.node.find('.submit').removeClass('dismiss');                     
                }

            })
            .fail(function() {
                new Toast({
                    'text' : decodeURI('请稍后再试'),
                    'type' : 'error'
                });
                self.node.find('.submit').removeClass('dismiss');  
            });   
        };
        
        LotteryToast.prototype.callback = function (){
            //this.suicide();
            $('.ui-record,.reward-toast').find('.get-gift').addClass('dismiss').html('已领取');
            $('.ui-record,.reward-toast').find('.check-box').attr('read',true);
            $('.ui-record,.reward-toast').find('[data-type="normal"] i').addClass('on');            

            UA.getGift = 1;
            lotteryCacheUpdate('item');
            UA.openPack = '1';
        };

        return LotteryToast;
    }());
    anniversary.LotteryToast = LotteryToast;

    /**
     * class 我的红包（领取完毕）
     * 继承自Dialog对象
     * 
     * @param    json   config--同父级
     * @param    json  data--获奖数据的相关data，格式参考lottery接口
     * 
     * @prototype    setList--填充获奖物品列表
     * @returns  object
     *
     * 全局下可通过anniversary.RecordDialog调用
     * 
     * @example new anniversary.RecordDialog({},{})
     */  
    var RecordDialog = (function(){
        function RecordDialog ( config , data ){
            this.title = '我的红包';
            this.clz = 'ui-record type-1';
            this.bodyNode = '<div class="u-win content">'+ this.setList(data) +'<div class="notice"><p>1.选择现金红包，将发放至支付宝账号；选择周年庆礼包，将发放至游戏账号。</p><p>2.实物奖励将于十一假期结束后寄送到您填写的收货地址。</p></div></div>';

            this.init();
        };
        extend( RecordDialog , Dialog );

        RecordDialog.prototype.setList = function(data){
            var ret = ''
            data = data || {};
            data.lottery = data.lottery || [];
            for(var i = 0; i < data.item.list.length ;i++){
                var item = data.item.list[i];
                ret += '<div class="gift-item">'+ item.prize_name +'</div>';
            }

            for(var i = 0; i < data.lottery.list.length ;i++){
                var item = data.lottery.list[i];
                ret += '<div class="gift-item">'+ item.prize_name +'</div>';
            }            

            ret = '<div class="gift-list">'+ ret +'</div>';

            return ret;
        };
        
        return RecordDialog;
    }());
    anniversary.RecordDialog = RecordDialog;

    /**
     * class 我的红包（有未领取奖励）
     * 继承自LotteryToast对象
     * 
     * @param    json   config--同父级
     * @param    json  data--获奖数据的相关data，格式参考lottery接口
     * 
     * @prototype    setList--填充获奖选项列表
     * @returns  object
     *
     * 全局下可通过anniversary.RecordDialogSP调用
     * 
     * @example new anniversary.RecordDialogSP({},{})
     */     
    var RecordDialogSP = (function(){
        function RecordDialogSP ( config , data){
            this.title =  '我的红包';
            this.clz = 'ui-record type-2';
            this.bodyNode = '<div class="u-win content">\
                                <div class="notice">现金红包和游戏虚拟道具2选1，确认领取后无法更改。</div>'+ this.setList(data) +'</div>';                     
            this.init();
        };
        extend( RecordDialogSP , LotteryToast );

        RecordDialogSP.prototype.setList = function(data){
            var ret = '';

            var status_item = data.item.status,
                status_lottery = data.lottery.status;

            for(var i = 0 ; i < data.item.list.length;i++){

                //debugger;
                var item = data.item.list[i];
                if(item.prize_id != 0){
                    ret += '<div class="gift-item"><div class="item-name">'+ item.prize_name +'</div>'+ _setBtnM(status_item,item.id,item.sign,item.prize_name,i) +'</div>';
                }
                else{
                    ret += '<div class="gift-item"><div class="item-name">'+ item.prize_name +'</div>'+ _setBtnN(status_item,item.id,item.sign,item.prize_name,i) +'</div>';
                }
            }

            ret = status_item=='1' ? '<div class="gift-list">'+ ret +'</div>' : '<div class="gift-list">'+ ret +'<button class="u-btn get-gift submit">确认领取</button></div>';

            if(data.lottery.list.length){
                ret += status_lottery=='1' ? '<div class="gift-list"><div class="gift-item"><div class="item-name goods">'+ data.lottery.list[0].prize_name +'</div></div></div>' : '<div class="gift-list"><div class="gift-item"><div class="item-name goods">'+ data.lottery.list[0].prize_name +'</div></div><div class="u-btn adress js-adress" data-id="'+ data.lottery.list[0].id +'" data-sign="'+ data.lottery.list[0].sign +'">填写邮寄地址</div></div>';
            }

            function _setBtnM(bStatus,id,sign,name,index){
                return bStatus? '': '<div class="check-box" data-id="'+ id +'" data-type="money" data-sign="'+ sign +'" data-name="'+ name +'" data-index = "'+ index +'"><i></i></div>';
            };

            function _setBtnN(bStatus,id,sign,name,index){
                return bStatus? '': '<div class="check-box" data-id="'+ id +'" data-type="normal" data-sign="'+ sign +'" data-name="'+ name +'" data-index = "'+ index +'"><i></i></div>';
            };

            return ret;
        };

        return RecordDialogSP;
    }());
    anniversary.RecordDialogSP = RecordDialogSP;

    /**
     * class 用户中奖名单
     * 
     * @param    function   callback--请求完成之后的回调函数
     * @param    number  size--请求的条数，可不传参，默认为10条
     * 
     * @prototype    init--实例化
     * @returns  object
     *
     * 全局下可通过anniversary.LuckyList调用
     * 
     * @example new anniversary.LuckyList(function(){},20)
     */      
    var LuckyList = (function(){
        function LuckyList(callback,size){
            this.callback = callback;
            this.init(size);
        };

        LuckyList.prototype = {
            'init' : function(size){
                size = size || 10;
                var self = this;
                $.get( anniversary.ajaxUrlMap.luckyList,{
                    'r': new Date().getTime(),
                    'size': size
                },function(resp){
                    if(resp.code==0)return self.callback(resp.data);
                    if(resp.code!=0)throw '用户获奖名单获取失败，请检查相关网络状态';                   
                },'json');
            }
        };

        return LuckyList;
    }());
    anniversary.LuckyList = LuckyList;

    /**
     * 中奖数据缓存更新
     * 
     * @param   string  type:'money'--现金相关更新 'lottery'--实物相关更新 'item'--游戏道具相关更新
     * 
     * @returns  void
     *
     */       
    function lotteryCacheUpdate(type){

        if(type == 'lottery'){
            UA.lotteryCache.lottery.status = 1;
        }
        else if( type == 'money' ){
            for(var i = 0; i < UA.lotteryCache.item.list.length;i++){
                var item = UA.lotteryCache.item.list[i];

                if(item.prize_id == 0){
                    UA.lotteryCache.item.list.remove(item);
                    break;
                }               
            }

            UA.lotteryCache.item.status = 1;
        }
        else if( type == 'item' ){
            for(var i = 0; i < UA.lotteryCache.item.list.length;i++){
                var item = UA.lotteryCache.item.list[i];

                if(item.prize_id != 0){
                    UA.lotteryCache.item.list.remove(item);
                    break;
                }               
            }

            UA.lotteryCache.item.status = 1;
        }
        else{
            throw "缓存更新type参数错误，请检查调用"
        }

    };    
    
})( anniversary||{} );

