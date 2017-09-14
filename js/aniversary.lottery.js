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
            this.diss = this.suicide;
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
                isExist? '' : this.node.appendTo('body');
                this.evtBind();
                this.node.show();
            },

            evtBind : function(){
                var self = this;
                this.node.on('click','button.close',function(){
                    self.suicide();
                });
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

        var LotteryToast = new aniversary.Dialog({
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
                            <button class="u-btn get-gift">确认领取</button>\
                        <div>'
        });

        console.log(LotteryToast);

    },2000);
    
});

$('body').on('click','.reward-toast .check-box',function(){
    var _me = this;

    $('.reward-toast .check-box').find('i').removeClass('on');
    $(_me).find('i').addClass('on');
});