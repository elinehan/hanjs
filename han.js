/* 定义一些常用对象原型方法 */
;(function(undefined){

  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, '') }

  /** 
   * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
   * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
   * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
   */
  if (Date.prototype.Format === undefined)
    Date.prototype.Format = function(fmt){
      var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
      }; 
      if(/(y+)/.test(fmt)) 
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
      for(var k in o) 
        if(new RegExp("("+ k +")").test(fmt)) 
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
      return fmt; 
    }

})()

var Han = (function($){
  this.unique=function(arr) {
    var result = [];
    for (var i = 0; i<arr.length; i++) {
      if (arr[i]!=null&&arr[i]!=''&&result.indexOf(arr[i])<0)
        result.push(arr[i]);
    }
    return result;
  };


})($)

// If `H` is not yet defined, point it to `Han`
window.Han = Han
H in window || (window.H = Han)

