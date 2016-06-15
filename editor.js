/**
 * markdown editor
 * @param ele
 */
define(function(require, exports, module) {
	var mark=require("plugin/markdown/markdown");
	
	var _saveV;
	function manualEditor(option){
		this.option=option;
	    this.elem=$(option.elem);
	    this.List=this.elem.find(".historyList");
	    this.Editor=this.elem.find(".editRigion .editor");
	    this.editStyle=this.elem.find(".editStyle");
	    this.um;
	    this.value;
	    this.getResult=getResult;
	}

	manualEditor.prototype.init=init;
	manualEditor.prototype.saveData=saveData;

	function init(){
	    var _this=this;
	    _listHistory(this);
	    
	    this.editStyle.on("click","a",function(){
	    	if($(this).is("active")){return;}
	    	$(this).siblings().removeClass("active").end().addClass("active");
	    	if(this.className.indexOf("richtext")>=0){
	    		var now=new Date().getTime(),
	    			richText="richeditor"+now;
	    		
	    		_this.Editor.append("<textarea id=\""+richText+"\"></textarea>");
	    		if(!_this.um){
		    		_initUM.call(_this,richText);
	    		}else{
	    			_this.um.show();
	    		}
	    		
	    		_this.Editor.find("#editor").addClass('hidden');
	    		
	    		_this.value&&_this.um.setContent(_this.value.replace(/\n/g,"<br>"));
	    	}else{
    			if(_this.um){_this.um.hide();}
	    		_this.Editor.find("#editor").removeClass('hidden').val(_this.value);
	    	}
	    	_editToShow.call(_this);
	    });
	    
	    _setData.call(this,this.option.data);
	    
	    this.Editor.on("keyup",function(){
	    	_editToShow.call(_this);
	    });
	}
	
	function _setData(data){
		if(data.trim()!=""){
			var _this=this;
		    this.value=this.option.data.split(this.splitChar||"::")[1];
		    
		    setTimeout(function(){
		    	_this.editStyle.find("."+data.split(this.splitChar||"::")[0]).click();
		    },500);
	    	
	    }
	}
	
	function getResult(){
		return this.editStyle.find(".active")[0].className.replace("active","").trim()+(this.option.splitChar||"::")+_saveV;
	}
	
	function _initUM(richText){
		this.um = UM.getEditor(richText);
		this.um.setWidth(this.Editor.width());
		this.um.setHeight(this.Editor.height());
	}

	function _listHistory(elem){
	    var listdata=_getLatestHisK(),
	    	arr=[];
	    listdata.forEach(function(item,index){
	        arr.push("<li data-k=\"",item,"\">",item,"<i>&times</i></li>");
	    });
	    elem.List.html(arr.join(""));
	    elem.List.on("click","li",function(){
	    	elem.Editor.val(localStorage.getItem($(this).attr("data-k")));
	        _editToShow.call(elem);
	    }).on("click","li>i",function(){
	        localStorage.removeItem($(this).parent().attr("data-k"));
	        $(this).parent().remove();
	        return false;
	    });
	}

	function _editToShow(){
	    var style=this.editStyle.find(".active")[0].className;

	    if(style.indexOf("text")>=0&&style.indexOf("richtext")<0){
	    	_saveV=this.value=this.Editor.find("#editor").val();
	    	this.Editor.next().text(this.value);
	    }else if(style.indexOf("richtext")>=0){
	    	this.value=this.um.getPlainTxt();
	    	_saveV=this.um.getContent();
	    	this.Editor.next().html(this.um.getContent());
	    }else{
	    	_saveV=this.value=this.Editor.find("#editor").val();
	    	this.Editor.next().html(markdown.toHTML(this.value));
	    }
	}

	function _getLatestHisK(){
	    var result=[],
	        len=localStorage.length;
	    if(len>5){
	        for(var i=len-1;i>len-6;i--){
	            _getKV(i);
	        }
	    }else{
	        for(var i=len-1;i>=0;i--){
	            _getKV(i);
	        }
	    }

	    function _getKV(index){
	        result.push(localStorage.key(index));
	    }

	    return result;
	}
	
	function saveData(){
		var _val=this.getResult();
		
		this.option.changeState&&this.option.changeState(_val);
		
		localStorage.setItem("manualContent", _val);
	}
	
	module.exports = manualEditor;
});
