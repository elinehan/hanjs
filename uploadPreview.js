!function($){
	"use strict";

	function uploadPreview(option){
		this.option=option;
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

	uploadPreview.prototype={
		constructor:uploadPreview,
		init:function(fn){
			var opt=this.option,self=this;
			opt.multiple && (this.files=[]);
			opt.$upload.on('change', function(event) {
				event.preventDefault();
				
				var file = this.files[0];
				opt.multiple && self.files.push(file);

				if(typeof file == 'undefined'){
					return false;
				}
				
				if (!/image\/\w+/.test(file.type)) {
					alert("Please select image only!");
					return false;
				}
				
				var objUrl = _getObjectURL(file);
		        if (objUrl){
		        	if(opt.$preview){
		        		opt.$preview.attr("src",objUrl);
		        	}else{
		        		fn && fn.call(self,objUrl);
		        	}
		        }
			});
			return this;
		}
	};
	
	window.uploadPreview = uploadPreview;
}(window.jQuery)