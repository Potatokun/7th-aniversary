var anniversary = {};
var UA = {'login': 0, 'bind' : 0, 'ready' : 0};
var giftId = 0;

var redPack = '.red';

//Object extend
function extend(Child, Parent) {
　　var F = function(){};
　　F.prototype = Parent.prototype;
　　Child.prototype = new F();
　　Child.prototype.constructor = Child;
　　Child.uber = Parent.prototype;
}

(function(aniversary){

    'use strict';

    //TODO
    //1.class UserInfo -- get user information
    //2.class bindArea -- let user bind account to area

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
                //TODO
                this.successHandler();
                this.callback();
            },

            callback : function(){
                this.dataCache = {'name' : 'test'};
                this.callbackSupply(this.dataCache);
            },

            successHandler : function(){
                UA.ready = 1;
            },

            errHandler : function (){
                //TODO
            }
        };

        return UserInfo;
    }());
    anniversary.UserInfo = UserInfo;

    var Dialog = ( function ( ) {

        function Dialog(config){
            config = config || {};
            this.title = config.title || 'default';
            this.bodyNode = config.content;
            this.clz = config.clz||'default';
            this.off = config.off || function(){};
            this.ok = config.og || function(){};
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
                    'margin-left' : parseInt(this.node.width()) * -0.5,
                    'margin-top' : parseInt(this.node.height()) * -0.5,
                    'left' : '50%',
                    'top' : '50%'
                })
            },

            appear : function(){
                this.node.show();
            },

            suicide : function (){
                this.node.remove();
            },

            exist : function(){
                return $('.' + this.clz ).length;
            }

        };
        
        return Dialog;
    }());
    anniversary.Dialog = Dialog;

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
                // $.ajax({
                //     url: url,
                //     data: data,
                //     success: function(){
                //         self.callback();
                //     },
                //     error : function(){
                //         self.errHandler();
                //     },
                //     dataType: 'json',
                //     timeout : self.timelimt
                // });
                self.callback();               
            },

            callback : function (){
                $(redPack).addClass('shake-chunk');        
                setTimeout(function(){          
                    $(redPack).removeClass('shake-chunk');
                    new LotteryToast();
                },2000);                
            },

            errHandler : function (msg){
                new Toast({
                    'type' : 'error',
                    'text' : msg
                });
            }
        };

        return Lottery;
    }());
    anniversary.Lottery = Lottery;

    var AreaDialog = (function(){

        function AreaDialog(config,areaid){
            areaid = areaid || 0;
            this.title = '绑定大区';
            this.clz = 'ui-area';
            this.bodyNode =  '<div class="u-area"><div class="u-select">'+ this.setArea(areaid) +'</div><p class="nickname notice">昵称：<b>---</b></p><p class="err"></p><p class="notice">*绑定后不可修改</p><button class="u-btn submit">确定提交</button></div>';                            
            this.init();            
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
            });
        
            
            //todo ajaxHandler
            this.node.on('click','.u-btn.submit',function(){
                var val = $('#J-area').val();

                if(!val){
                    new Toast({
                        'type' : 'error',
                        'text' : '请选择大区'
                    });

                    return;
                }

                self.sendAjax();
            });            
        };

        AreaDialog.prototype.sendAjax = function(){
            //TODO
            this.successHandler();
        };

        AreaDialog.prototype.callback = function(){

        };

        AreaDialog.prototype.successHandler = function(){
            new Toast({
                'text' : decodeURI('大区绑定成功')
            });
            
            this.suicide();
        };

        AreaDialog.prototype.errHandler = function(msg){
            new Toast({
                'type' : 'error',
                'text' : decodeURI(msg)
            });
        };
        return AreaDialog;

    }());
    anniversary.AreaDialog = AreaDialog;

    var AdressDialog = (function(){
        function AdressDialog (){
            this.title = '填写邮寄地址';
            this.clz = 'ui-adress';
            this.bodyNode =  '<div class="u-win content">\
                                    <div class="notice">请填写正确的邮寄地址or个人信息，保持电话畅通，24小时内客服会与您核实信息！~</div>\
                                    <div class="adress-form">\
                                        <div class="form-row"><input name="name" placeholder="请填写收件人姓名" type="text"></div>\
                                        <div class="form-row"><input name="tel" placeholder="请填写收件人手机号码" type="text"></div>\
                                        <div class="form-row"><input name="adress" placeholder="请填写正确的邮寄信息" type="text"></div>\
                                    </div>\
                                    <div class="u-btn js-adress-comfirm submit">确认信息</div>\
                                </div>';                               
            this.init();
        };
        extend( AdressDialog , Dialog );

        AdressDialog.prototype.setPos = function(){
                this.node.css({
                    'margin-left' : parseInt(this.node.width()) * -0.5,
                    'margin-top' : parseInt(this.node.height()) * -0.5,
                    'left' : '50%',
                    'top' : '-100%'
                })        
        };

        AdressDialog.prototype.appear = function(){
            var _me = this;
            $('.ui-record,.reward-toast').animate({
                'top': '400%'},
                300, function() {
                _me.node.show().animate({'top': '50%'},300);
            });
        };
        
        AdressDialog.prototype.suicide = function(){
            var _me = this;
             _me.node.animate({
                'top': '-100%'},
                300, function() {
                _me.node.remove();
                $('.ui-record,.reward-toast').animate({'top': '50%'},300);
            });           
        };
        
        AdressDialog.prototype.evtBind = function(){
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

        AdressDialog.prototype.validate = function(){
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

        AdressDialog.prototype.sendAjax = function(){
            //todo ajax
            new Toast({
                'text' : '提交成功'
            })
            
            this.callback();
        };
        
        AdressDialog.prototype.callback = function (){
            this.suicide();
            UA.adressSubmit = 1;
        };

        return AdressDialog;
    }());
    anniversary.AdressDialog = AdressDialog;

    var LotteryToast = (function () {

        function LotteryToast (){
            this.title = '恭喜您获得以下奖励';
            this.clz = 'reward-toast';
            this.bodyNode = '<div class="u-win content">\
                                <div class="reward-view">\
                                    <ul>\
                                        <li>\
                                            <div class="item-detail">\
                                                <div class="item-pic"></div>\
                                                <div class="item-name"></div>\
                                            </div>\
                                            <div class="check-box" data-id="A001"><i></i></div>\
                                        </li>\
                                        <li>\
                                            <div class="item-detail"></div>\
                                            <div class="check-box" data-id="A002"><i></i></div>\
                                        </li>\
                                        <li>\
                                            <div class="item-detail"></div>\
                                            <div class="u-btn adress js-adress"></div>\
                                        </li>\
                                    </ul>\
                                </div>\
                                <div class="notice">现金红包和游戏虚拟道具2选1，确认领取后无法更改。</div>\
                                <button class="u-btn get-gift submit">确认领取</button>\
                            <div>'                            
            this.init();
        };
        extend( LotteryToast , Dialog );

        LotteryToast.prototype.suicide = function(){
            this.node.remove();
            giftId = 0;
        };

        LotteryToast.prototype.evtBind = function(){
            var self = this;
            this.node.on('click','button.close',function(){
                self.suicide();
            });
            
            //todo ajaxHandler
            this.node.on('click','.u-btn.submit',function(){
                self.validate();
                if(self._validate)self.sendAjax();
            });
            
            //check box simulation
            this.node.on('click','.check-box',function(){
                if(UA.getGift)return;

                var _me = $(this);

                _me.closest('.u-window').find('.check-box i').removeClass('on');
                _me.find('i').addClass('on');

                giftId = _me.data('id');
            });

            //window.adress
            this.node.on('click','.js-adress',function(){

                if(UA.adressSubmit){
                    new Toast({
                        'type' : 'error',
                        'text' : '您已提交过个人邮寄地址信息'
                    });
                    return;
                }

                new AdressDialog();
            });

        };

        LotteryToast.prototype.validate = function(){
            var self = this;
            self._validate = true;
            
            if(giftId == 0){
                new Toast({
                    'text' : '请选择奖励',
                    'type': 'error'
                }) ;
                
                self._validate = false;
            }
            
        };        

        LotteryToast.prototype.sendAjax = function(){
            //todo ajax
            new Toast({
                'text' : '提交成功'
            });
            
            this.callback();
        };
        
        LotteryToast.prototype.callback = function (){
            this.suicide();
            UA.getGift = 1;
            UA.openPack = 1;
        };

        return LotteryToast;
    }());
    anniversary.LotteryToast = LotteryToast;

    var RecordDialog = (function(){
        function RecordDialog (){
            this.title = '我的红包';
            this.clz = 'ui-record type-1';
            this.bodyNode = '<div class="u-win content">\
                                <div class="gift-list">\
                                    <div class="gift-item">现金红包15元</div>\
                                    <div class="gift-item">电竞鼠标</div>\
                                </div>\
                                <div class="notice">现金红包发放规则，实物道具发放规则，虚拟道具发放规则。</div>\
                            </div>';                        
            this.init();
        };
        extend( RecordDialog , Dialog );
        
        return RecordDialog;
    }());
    anniversary.RecordDialog = RecordDialog;

    var RecordDialogSP = (function(){
        function RecordDialogSP (){
            this.title =  '我的红包';
            this.clz = 'ui-record type-2';
            this.bodyNode = '<div class="u-win content">\
                                <div class="notice">现金红包和游戏虚拟道具2选1，确认领取后无法更改。</div>\
                                <div class="gift-list">\
                                    <div class="gift-item">\
                                        <div class="item-name">现金红包15元</div>\
                                        <div class="check-box"><i></i></div>\
                                    </div>\
                                    <div class="gift-item">\
                                        <div class="item-name">现金红包15元</div>\
                                        <div class="check-box"><i></i></div>\
                                    </div>\
                                    <button class="u-btn get-gift submit">确认领取</button>\
                                </div>\
                                <div class="gift-list">\
                                    <div class="gift-item">\
                                        <div class="item-name goods">电竞鼠标</div>\
                                    </div>\
                                    <div class="u-btn adress js-adress">填写邮寄地址</div>\
                                </div>\
                            </div>';                     
            this.init();
        };
        extend( RecordDialogSP , LotteryToast );

        RecordDialogSP.prototype.callback = function (){
            UA.getGift = 1;
            UA.openPack = 1;
        };        

        return RecordDialogSP;
    }());
    anniversary.RecordDialogSP = RecordDialogSP;
    
})( anniversary||{} );

var _User;
_User = new anniversary.UserInfo({
            'callback' : function(data){
                //TODO
                console.log(data.name);

                //UA.bind ? '' : new anniversary.AreaDialog({},1);
            }
});

$('#J-lottery').click(function(){
    if(!UA.ready){
        new Toast({
            'type' : 'info',
            'text' : '用户资料查询中，请稍后'
        });
        return;
    }     
    new anniversary.Lottery();    
});

//window.record
$('body').on('click','.js-record',function(){

    if(!UA.ready){
        new Toast({
            'type' : 'info',
            'text' : '用户资料查询中，请稍后'
        });
        return;
    }         

   UA.getGift ? new anniversary.RecordDialog() : new anniversary.RecordDialogSP();
});
