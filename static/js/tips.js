var g_oTimerHide=null,
	tips = {};

$.getJSON('static/js/tipsData.js',function(json, textStatus) {
	tips = json;
});

bindTopic('[data-tip]');

function bindTopic(selector){
	
	//var i=0;
	//aElement[i].onmouseover=function (ev){showTopic(this.znsIndex, window.event || ev);};
	$('body').on('mouseover',selector,function(ev){
		//ev.stopPropagation();
		showTopic($(this).data('tip'), ev);
	});

	$('body').on('mouseleave',selector,function(ev){
		ev.stopPropagation();
		hideTopic();
	});

	$('body').on('mousemove',selector,function(ev){
		//ev.stopPropagation();
		setPosition(ev.clientX, ev.clientY);
	});
}

function showTopic(id, ev){

	var topic = $('#J-tips');
	
	if(g_oTimerHide){
		clearTimeout(g_oTimerHide);
	}
	
	var node = '',
		data = tips[id];

	if(!data)return;

	for(var name in data){
		if(name=='itemColor')continue;
		if(name=='itemDesc')continue;
		if(name=='type1')continue;
		else if(name == 'itemName'){
			node += '<div class="'+ name + ' ' + setColor(data.itemColor) +'">'+ data[name] +'</div>';
		}
		else if(name == 'type2'){
			node += '<div class="type2">'+ data.type2 +'</div>';
		}
		else{
			node += '<div class="'+ name +'">'+ data[name] +'</div>';
		}		
	}
	if(data.itemDesc)node += '<div class="itemDesc">'+ data.itemDesc +'</div>';
		
	topic.find('.inner_html').html(node);
	topic.show();
	
	setPosition(ev.clientX, ev.clientY);
}

function hideTopic(){

	var topic = $('#J-tips');
	
	if(g_oTimerHide)
	{
		clearTimeout(g_oTimerHide);
	}
	g_oTimerHide=setTimeout
	(
		function ()
		{
			topic.hide();
		},50
	);
}

function setPosition(x, y){

	var top = document.body.scrollTop || document.documentElement.scrollTop;
	var left = document.body.scrollLeft || document.documentElement.scrollLeft;
	
	x += left;
	y += top;
	
	var topic = $('#J-tips');
	var l = x + 20 ;
	var t = y - (topic.outerHeight() - 20 );
	var bRight = true;
	var bTop = true;
	var iPageRight = left + document.documentElement.clientWidth;
	var iPageTop = top + document.documentElement.clientHeight;
	
	if( l+ topic.outerWidth() > iPageRight )
	{
		bRight=false;
		
		l=x-(topic.outerWidth()+20);
		topic.find('div')[0].className='adorn_r';
	}
	else
	{
		topic.find('div')[0].className='adorn';
	}

	if( t - topic.outerHeight() < 0 )
	{
		bTop=false;
		
		t=y-(topic.outerHeight()-250);
		topic.find('div')[0].className='adorn_r';
	}
	else
	{
		topic.find('div')[0].className='adorn';
	}	
	
	topic.css({
		'left' : l,
		'top' : t
	});
}

function setColor(str){
	var color = '';
	switch(str){
		case '金':
			return 'gold';
			break;
		case '紫':
			return 'purple';
			break;
		case '暗金':
			return 'dGold';
			break;
		case '橙':
			return 'orange';
			break;
		case '蓝':
			return 'blue';
			break;
		default :
			return 'green';									
	}
};