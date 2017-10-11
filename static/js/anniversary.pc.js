if(anniversary.env.isSP)document.location = site + '/m/index.html';

var _User;
_User = new anniversary.UserInfo({
            'callback' : function(){
                $('.user-ctrl').before('<div class="welcome">欢迎您，仙术师，'+ UA.info.user_id + '</div>');
                $('.js-login').remove();
                $('.user-ctrl').prepend('<a class="u-btn logout" href="'+ site +'/oauth/logout/"></a>');

                $('body,html').animate({'scrollTop': 1000 },400);
                
                UA.bind ? '' : new anniversary.AreaDialog({},UA.info.area_id);
            }
});

new anniversary.LuckyList(function(data){
    var node = '';
    for(var i=0;i<data.length;i++){
        var item = data[i];
        node += '<li>'+ item.area_name +' '+ item.user_id +' 获得<span class="item-name">'+ item.prize_name +'！</span></li>'
    }

    $('.reward-list ul').html(node);
},13);

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