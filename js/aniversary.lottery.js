var aniversary = {};

Object.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property]; 
    }
    return destination;
}

Object.extend(Object, { 
    inspect: function(object) {
        try {
        if (object == undefined) return'undefined';
        if (object ==null) return'null';
        return object.inspect ? object.inspect() : object.toString(); 
        } catch (e) {
        if (e instanceof RangeError) return'...';
        throw e;
        }
    },
    keys: function(object) {
        var keys = [];
        for (var property in object)
        keys.push(property);
        return keys;
    },
    values: function(object) {
        var values = [];
        for (var property in object) values.push(object[property]);
        return values;
    },
    clone: function(object) {
        returnObject.extend({}, object);
    }
});

(function(aniversary){

    'use strict';

    var Dialog = ( function ( ) {

        function Dialog(config){
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
                this.node.show();
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

            suicide : function (){
                this.node.remove();
            },

            exist : function(){
                return $('.u-window').length;
            }

        };
        
        return Dialog;
    }());
    aniversary.Dialog = Dialog;

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
    aniversary.Toast = Toast;

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
    aniversary.Lottery = Lottery;

})( aniversary||{} );

var LotteryToast;
$('#J-lottery').click(function(){
            
    $('.red').addClass('shake-chunk');        
    setTimeout(function(){          
        $('.red').removeClass('shake-chunk');

        LotteryToast = new aniversary.Dialog({
            'title' : '恭喜您获得以下奖励',
            'clz' : 'reward-toast',
            'content' : '<div class="u-win content">\
                            <div class="reward-view">\
                                <ul>\
                                    <li>\
                                        <div class="item-detail">\
                                            <div class="item-pic"></div>\
                                            <div class="item-name"></div>\
                                        </div>\
                                        <div class="check-box"><i></i></div>\
                                    </li>\
                                    <li>\
                                        <div class="item-detail"></div>\
                                        <div class="check-box"><i></i></div>\
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
        });

    },2000);
    
});

$('body').on('click','.check-box',function(){
    var _me = this;

    $(_me).closest('.u-window').find('.check-box i').removeClass('on');
    $(_me).find('i').addClass('on');
});

//window.adress
$('body').on('click','.js-adress',function(){
   new aniversary.Dialog({
       'title' : '填写邮寄地址',
       'clz' : 'ui-adress',
       'content' : '<div class="u-win content">\
                        <div class="notice">请填写正确的邮寄地址or个人信息，保持电话畅通，24小时内客服会与您核实信息！~</div>\
                        <div class="adress-form">\
                            <div class="form-row"><input name="" placeholder="请填写收件人姓名" type="text"></div>\
                            <div class="form-row"><input name="" placeholder="请填写收件人手机号码" type="text"></div>\
                            <div class="form-row"><input name="" placeholder="请填写正确的邮寄信息" type="text"></div>\
                        </div>\
                        <div class="u-btn js-adress-comfirm submit">确认信息</div>\
                    </div>'
   });
});


//window.record
$('body').on('click','.js-record',function(){
   recordTemp_2(); 
});

function recordTemp(){
    return    new aniversary.Dialog({
       'title' : '我的红包',
       'clz' : 'ui-record type-1',
       'content' : '<div class="u-win content">\
                        <div class="gift-list">\
                            <div class="gift-item">现金红包15元</div>\
                            <div class="gift-item">电竞鼠标</div>\
                        </div>\
                        <div class="notice">现金红包发放规则，实物道具发放规则，虚拟道具发放规则。</div>\
                    </div>'
   });    
};

function recordTemp_2(){
    return    new aniversary.Dialog({
       'title' : '我的红包',
       'clz' : 'ui-record type-2',
       'content' : '<div class="u-win content">\
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
                    </div>'
   });    
};

$(document).on('click','.ui-record button.submit',function(){
    new aniversary.Toast({
        'text' : '测试文本',
        'type' : 'error'
    });
});