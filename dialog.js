!function($){

	"use strict";

	var Dialog=function(options){
		var defoptions={
			width:'auto',
			height:'auto',
			hasTitle:true,
			titleContent:"标题",
			titleClass:"",
			hasBody:true,
			bodyContent:"内容",
			bodyClass:"",
			hasBtn:true,
			okBtnText:"提交",
			okBtnClass:"",
			cancelBtnText:"取消",
			cancelBtnClass:"",
			okBtnEvt:function(){
				alert('ok');
			}
		};
		this.options=$.extend({}, defoptions, options);
	};

	Dialog.prototype={
		constructor:Dialog,
		init:function(fn) {
			var self=this,array=[],opt=this.options;
			array.push("<div class=\"dialogmask\"></div>");
			array.push("<div class=\"dialog\">");
			opt.hasTitle&&array.push("<h2 class=\"",opt.titleClass,"\">",opt.titleContent,"</h2>");
			opt.hasBody&&array.push("<div class=\"dialogbody ",opt.bodyClass,"\">",opt.bodyContent,"</div>");
			opt.hasBtn&&array.push("<div class=\"btn clearfix\"><input class=\"submit ",opt.okBtnClass,"\" type=\"button\" value=\"",opt.okBtnText,"\"/><input class=\"cancel ",opt.cancelBtnClass,"\" type=\"button\"  value=\"",opt.cancelBtnText,"\"/></div>");
			array.push("</div>");
			$("body").append(array.join(""))
				.find('.dialogmask').css({
				    width: '100%',
    				height: '100%',
					position: 'fixed',
					top: '0',
					left: '0',
					"z-index":'99',
					background: 'rgba(0,0,0,0.4)'
				}).end()
				.find('.dialog').css({
					position: 'fixed',
					top: '50%',
					left: '50%',
					width:opt.width,
					height:opt.height,
					"z-index":'99',
					transform: 'translateX(-50%) translateY(-50%)',
					background: '#fff'
				})
				.on('click', '.submit', function(event) {
					event.preventDefault();
					opt.okBtnEvt && opt.okBtnEvt(self);
				})
				.on('click', '.cancel', function(event) {
					event.preventDefault();
					opt.cancelBtnEvt && opt.cancelBtnEvt(self);
				});
				fn && fn();
		},
		destory:function(){
			$(".dialogmask").remove();
			$(".dialog").remove();
		}
	};

	window.Dialog=Dialog;
}(window.jQuery)