define(function(require, exports, module) {
	
	function uploadImage(option){
		this.option=option;
		this.result=_result;
	}
	
	var flag=false,target=null,deg=0,startX,startY;
	
	function _mousedown(e){
		var left=$(".operation")[0].offsetLeft,
			top=$(".operation")[0].offsetTop;
		flag=true;
		target=e.target;
		startX=e.clientX-left;
		startY=e.clientY-top;
		e.stopPropagation();
	}
	
	function _mousemove(e){
		if(flag){
			var x=e.clientX,
				y=e.clientY,
				op=$(this).find(".operation")[0],
				left=op.offsetLeft,
				top=op.offsetTop,
				w=op.offsetWidth-2,
				h=op.offsetHeight-2,
				posX=_getPosi(op).x,
				posY=_getPosi(op).y,
				aW=x-posX,
				aH=y-posY;
			
			switch(target.className){
				case "left":
					_changeLeft(op,left+aW);
					_changeWidth(op,w-aW);
					break;
				case "leftUp":
					_changeLeft(op,left+aW);
					_changeWidth(op,w-aW);
					_changeTop(op,top+aH);
					_changeHeight(op,h-aH);
					break;
				case "up":
					_changeTop(op,top+aH);
					_changeHeight(op,h-aH);
					break;
				case "rightUp":
					_changeTop(op,top+aH);
					_changeHeight(op,h-aH);
					_changeWidth(op,aW);
					break;
				case "right":
					_changeWidth(op,aW);
					break;
				case "rightBottom":
					_changeWidth(op,aW);
					_changeHeight(op,aH);
					break;
				case "bottom":
					_changeHeight(op,aH);
					break;
				case "leftBottom":
					_changeLeft(op,left+aW);
					_changeWidth(op,w-aW);
					_changeHeight(op,aH);
					break;
				case "operation":
					_changeLeft(op,x-startX);
					_changeTop(op,y-startY);
					break;
				default:
					break;
			};
			_changeImg.call(this,op);
			
		}
	}
	
	function _changeLeft(obj,left){
		obj.style.left=Math.max(0,Math.min(left,200-obj.offsetWidth))+"px";
	}
	
	function _changeTop(obj,top){
		obj.style.top=Math.max(0,Math.min(top,200-obj.offsetHeight))+"px";
	}
	
	function _changeHeight(obj,height){
		$(obj).height(Math.min(height,198-obj.offsetTop));
	}
	
	function _changeWidth(obj,width){
		$(obj).width(Math.min(width,198-obj.offsetLeft));
	}
	
	function _changeImg(obj){
		var top=obj.offsetTop,
			left=obj.offsetLeft,
			w=obj.offsetWidth,
			h=obj.offsetHeight;
		$(obj).prev().css({"clip":"rect("+top+"px,"+(left+w)+"px,"+(top+h)+"px,"+left+"px)"});
		
		_changePreview(top,left,w,h);
	}
	
	function _changePreview(top,left,w,h){
		var cvs=document.createElement('canvas'),
			ctx=cvs.getContext("2d"),
			img=$("img.rad")[0];
		cvs.width=img.width;
	    cvs.height=img.height;
		ctx.clearRect(0,0,cvs.width,cvs.height);
		
		if(w>h){
			ctx.drawImage(img,left+(w-h)/2,top,h,h,0,0,cvs.width,cvs.height);
		}else{
			ctx.drawImage(img,left,top+(h-w)/2,w,w,0,0,cvs.width,cvs.height);
		}
		$("img.photo")[0].src=cvs.toDataURL('image/jpeg',1);
	}
	
	function _render(src){
        var image=new Image(),that=this;
        image.onload=function(){
            _changeSrc(_imgToCvsBase(image,200));
            //_addHis.call(that,base64);
        };
        image.src=src;
    };
    
    function _imgToCvsBase(image,containerW){
    	var canvas=document.createElement('canvas'),
	    	w=image.width,
	    	h=image.height;
	    
	    if(w>h){
	    	canvas.width=containerW;
	        canvas.height=containerW*h/w;
	    }else{
	    	canvas.width=containerW*w/h;
	        canvas.height=containerW;
	    }
	    
	    var con=canvas.getContext('2d');
	    con.drawImage(image,0,0,w,h,0,0,canvas.width,canvas.height);
	    return canvas.toDataURL('image/jpeg',1);
    }
	
	function _mouseup(e){
		flag=false;
		startX=e.clientX;
		startY=e.clientY;
	}
	
	function _getPosi(node){
		var _pos={x:0,y:0};
		while(node.offsetParent){
			_pos.x+=node.offsetLeft;
			_pos.y+=node.offsetTop;
			node=node.offsetParent;
		}
		return _pos;
	}
	
	function _preview(){
		var file = this.files[0];

		if(typeof file == 'undefined'){
			return false;
		}
		
		if (!/image\/\w+/.test(file.type)) {
			alert("Please select image only!");
			return false;
		}
		
		var objUrl = _getObjectURL(file);
        if (objUrl){
            _render.call(this,objUrl);
        }
		
        deg=0;
        _restore();
	}
    
    function _addHis(src){
    	var hisList=$(this).parents(".history");
    	if(hisList.find("a").length>=6){
    		$(this).parent().prev().remove();
    	};
    	hisList.find("a").removeClass("active");
		hisList.prepend("<a class=\"active\"><img src=\""+src+"\"/></a>");
    }
	
	function _getObjectURL(file) {
        var url = null ; 
        if (window.createObjectURL!=undefined) {
            url = window.createObjectURL(file) ;
        } else if (window.URL!=undefined) {
            url = window.URL.createObjectURL(file) ;
        } else if (window.webkitURL!=undefined) {
            url = window.webkitURL.createObjectURL(file) ;
        }
        return url ; 
    }
	
	function _rotate(e){
		var ev = e || event,
			t=ev.target;
		_restore();
		if(t.className=="left"){
			deg-=90;
		}else{
			deg+=90;
		}
		$(".resize img").css({"transform":"rotate("+deg+"deg)"});
		$("img.photo").css({"transform":"rotate("+deg+"deg)"});
	}
	
	function _restore(){
		$(".operation").attr("style",null);
		$(".operation").prev().css({"clip":"rect(0px,200px,200px,0px)"});
	}
	
	function _init(){
		var elem=this.option.elem,
			ops=elem.find(".operation>div");
		document.onmousemove = function(e){
	        var ev = e || event;
	        ev.cancelBubble=true;
	        ev.returnValue = false;
	    };
	    elem.find(".operation").on("mousedown",_mousedown);
		ops.on("mousedown",_mousedown);
		elem.on("mousemove",_mousemove).on("mouseup",_mouseup).on("change",".uploadBtn",_preview)
			.on("click",".rotate a",_rotate).on("click",".history a:not(:last)",_selectImg);
		
	}
	
	function _selectImg(){
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
		_changeSrc($(this).find("img").attr("src"));
		_restore();
	}
	
	function _changeSrc(src){
		var obj=$(".operation")[0],
			top=obj.offsetTop,
			left=obj.offsetLeft,
			w=obj.offsetWidth,
			h=obj.offsetHeight;
		$("img.opa")[0].src=src;
        $("img.rad")[0].src=src;
        _changePreview(top,left,w,h);
	}
	
	function _result(){
		return $("img.photo")[0].src;
	}
	
	uploadImage.prototype={
			constructor:uploadImage,
			init:_init
	};
	
	module.exports = uploadImage;
});