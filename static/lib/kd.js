(function(global, $){
	var
	debug = function(str){
		console.log(str);
	},
	ua = navigator.userAgent.toLowerCase(),
	is = {
		android: function(){
			return /(android)/i.test(ua);
		},
		ios: function(){
			return /(iphone|ipad|ipod|ios)/i.test(ua);
		}
	};

	var kd = {
		config: function(options){
			$.extend(true, this, options);
		},
		isApp: function(){
			return typeof kdjs !== 'undefined' || typeof callKDMSGToResponse !== 'undefined';
		},
		hasLogged: function(){
			if(is.android()){
				return kdjs.getKDUid();
			}else if(is.ios()){
				return typeof getKDUid !== 'undefined';
			}
		},
		getUserInfo: function(){
			if(is.android()){
				return {
					uid: kdjs.getKDUid(),
					token: kdjs.getKDToken(this.id),
					secheme: kdjs.getKDTokenSecheme()
				};
			}else if(is.ios()){
				return {
					uid: getKDUid(),
					token: getKDToken(this.id),
					secheme: getKDTokenSecheme()
				};
			}
		},
		showLoginPage: function(){
			if(is.android()){
				if(typeof kdjs.openLoginPage !== 'undefined'){
					kdjs.openLoginPage();
				}else{
					debug('\u7248\u672c\u8fc7\u4f4e\uff0c\u4e0d\u652f\u6301\u8be5\u529f\u80fd\uff01');
				}
			}else if(is.ios()){
				if(typeof getKDVersion !== 'undefined'){
					var n = parseInt(getKDVersion().replace(/\D/g, ''));

					if(n > 310){
						callKDMSGToResponse(encodeURI(JSON.stringify({
							'responseType': 12
						})));
					}else{
						debug('\u7248\u672c\u8fc7\u4f4e\uff0c\u4e0d\u652f\u6301\u8be5\u529f\u80fd\uff01');
					}
				}
			}
		},
		freeLogin: function(callback){
			if(this.isApp() && this.hasLogged()){
				var user = this.getUserInfo();

				$.ajax({
					type: 'GET',
					cache: false,
					url: this.api.freeLogin,
					data: {
						id: this.id,
						uid: user.uid,
						token: user.token,
						secheme: user.secheme
					},
					dataType: 'json'
				})
				.done(function(data, textStatus, jqXHR){
					if(typeof callback === 'function'){
						callback(data, textStatus, jqXHR);
					}
				})
				.fail(function(XMLHttpRequest, textStatus, errorThrown){
					if(typeof callback === 'function'){
						callback(XMLHttpRequest, textStatus, errorThrown);
					}
				});
			}else{
				if(typeof callback === 'function'){
					callback();
				}
			}
		}
	};

	global.kd = kd;
})(window, jQuery);