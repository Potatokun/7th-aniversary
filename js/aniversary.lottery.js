var anniversary = {};
var UA = {};
var giftId = 0;
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
                $.ajax({
                    url: url,
                    data: data,
                    success: function(){},
                    error : function(){
                        self.errHandler();
                    },
                    dataType: 'json',
                    timeout : self.timelimt
                });                
            },

            callback : function (){
                
            },

            errHandler : function (){

            }
        };

        return Lottery;
    }());
    anniversary.Lottery = Lottery;

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

var LotteryToast;
$('#J-lottery').click(function(){
            
    $('.red').addClass('shake-chunk');        
    setTimeout(function(){          
        $('.red').removeClass('shake-chunk');

        new anniversary.LotteryToast();

    },2000);
    
});

$('body').on('click','.check-box',function(){

    if(UA.getGift)return;

    var _me = $(this);

    _me.closest('.u-window').find('.check-box i').removeClass('on');
    _me.find('i').addClass('on');

    giftId = _me.data('id');
});

//window.adress
$('body').on('click','.js-adress',function(){

    if(UA.adressSubmit){
        new anniversary.Toast({
            'type' : 'error',
            'text' : '您已提交过个人邮寄地址信息'
        });
        return;
    }

   new anniversary.AdressDialog();
});

//window.record
$('body').on('click','.js-record',function(){
   UA.getGift ? new anniversary.RecordDialog() : new anniversary.RecordDialogSP();
});
