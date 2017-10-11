if(!anniversary.env.isSP)document.location = site + '/index.html';

(function(aniversary){

    'use strict';

    //class 用户信息
    var UserInfoMobile = (function () {

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
                // 配置id和免登录验证接口地址
                kd.config({
                    id: 'kdwebjs',
                    api: {
                        freeLogin: site + '/oauth/pocket/?m=' + Math.random() // 后台验证接口地址，验证成功后，需根据传入的 uid 等信息实现自动登录
                    }
                });

                // 调用免登录接口，进行免登录验证
                kd.freeLogin(function(response, b, c){
                    self.normalLogin();
                });

            },

            normalLogin : function(){
                var self = this;
                $.ajax({
                    'type': 'GET',
                    'url':  anniversary.ajaxUrlMap.userInfo + '?m=' + Math.random(),
                    'data':{},
                    'dataType': 'json',
                    'success': function (resp) {
                        self.callback(resp);
                    },
                    'error': function () {
                        new anniversary.Toast({
                            'type' : 'error',
                            'text' : '服务器繁忙，请稍后再试！'
                        });
                    }
                });                 
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
    anniversary.UserInfoMobile = UserInfoMobile;

    //class 绑定大区
    anniversary.AreaDialog.prototype.setPos = function(){
            this.node.css({
                'margin-left' : parseInt(this.node.outerWidth()) * -0.5,
                'margin-top' : parseInt(this.node.outerHeight()) * -0.5,
                'left' : '50%',
                'top' : '30%'
            })        
    };
    
})( anniversary||{} );


$(function() {
    // The trick
    if (/ip(hone|od)|ipad/i.test(navigator.userAgent)) {
        $("body").css ("cursor", "pointer");
    }
});


var _User;
_User = new anniversary.UserInfoMobile({
            'callback' : function(){
                $('.activity-wrapper').before('<div class="welcome">欢迎您，仙术师，'+ UA.info.user_id + '</div>');
                $('.js-login').remove();
                $('.user-ctrl').prepend('<a class="u-btn logout" href="'+ site +'/oauth/logout/"></a>');
                
                UA.bind ? '' : new anniversary.AreaDialog({},UA.info.area_id);
            }
});

new anniversary.LuckyList(function(data){
    var node = '';
    for(var i=0;i<data.length;i++){
        var item = data[i];
        node += '<li>'+ item.area_name +' '+ item.user_id +' 获得<span class="item-name">'+ item.prize_name +'！</span></li>'
    }

    node += node;

    $('.reward-list ul').html(node);
},5);

$('.js-login').click(function(){
    mslogin.login();
});

$('#J-lottery').click(function(){

    if($(this).hasClass('dismiss'))return;

    if(!UA.ready){
        new anniversary.Toast({
            'type' : 'info',
            'text' : '用户资料查询中，请稍后'
        });
        return;
    }
    
    if(!UA.login)return mslogin.login();
    if(!UA.bind)return new anniversary.AreaDialog({},UA.info.area_id);
    if(UA.openPack!="0")return new anniversary.Toast({
            'type' : 'error',
            'text' : '您已参加过活动，详情请点击我的红包按钮'
    });

    new anniversary.Lottery();    
});

//window.record
$('body').on('click','.js-record',function(){

    if($(this).hasClass('dismiss'))return;

    if(!UA.ready){
        new anniversary.Toast({
            'type' : 'info',
            'text' : '用户资料查询中，请稍后'
        });
        return;
    }         

    if(!UA.login)return mslogin.login();
    if(!UA.bind)return new anniversary.AreaDialog({},UA.info.area_id);

    if(UA.openPack==0)return new anniversary.Toast({
        'type' : 'error',
        'text' : '您还没有红包记录'
    });    

    var restFlag;
    if(!$.isEmptyObject(UA.lotteryCache)){
        if(UA.lotteryCache.lottery.list.length){
            restFlag = !((UA.lotteryCache.item.status==1) && (UA.lotteryCache.lottery.status==1));
        }
        else{
            restFlag = !((UA.lotteryCache.item.status==1));
        }

        restFlag ? new anniversary.RecordDialogSP({},UA.lotteryCache) : new anniversary.RecordDialog({},UA.lotteryCache);        
    }
    else{
        $('.js-record').addClass('dismiss');
        var _loaidng = new anniversary.Loading();

        $.get (anniversary.ajaxUrlMap.record ,{'r': new Date().getTime()},function(resp){
            _loaidng.suicide();
            if(resp.code==0){

                if(resp.data.lottery.list.length){
                    restFlag = !((resp.data.item.status==1) && (resp.data.lottery.status==1));
                }
                else{
                    restFlag = !((resp.data.item.status==1));
                }

                restFlag ? new anniversary.RecordDialogSP({},resp.data) : new anniversary.RecordDialog({},resp.data);

                UA.lotteryCache = resp.data;
            }
            else if(resp.code==4){
                mslogin.login();
            }
            else{
                //err 
                var _msg = resp.msg|| '请稍后再试';
                new anniversary.Toast({
                    'type' : 'error',
                    'text' : decodeURI(_msg)
                });            
            }
            
            $('.js-record').removeClass('dismiss');
        },'json');
    }
    
});