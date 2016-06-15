(function () {

    var AjaxResult = {
        success: 1,
        unknown: 0,
        failed: -1,
        script: 2
    }

    var Platform = {

        AjaxRequest: function (option) {
        	var url=option.url, 
        		formParams=option.formParams,
        		successCallback=option.successCallback,
        		failedCallback=option.failedCallback,
        		customCallback=option.customCallback;
        	
            var contentType = "";
            if (!formParams) {
                formParams = {};
            }
            var fp = {};
            if (typeof formParams == "object") {
                //contentType = "application/json; charset=utf-8";
                contentType = "application/x-www-form-urlencoded; charset=utf-8";
                fp = $.param(formParams);
                // fp = JSON.stringify(fp);
            }
            else if (typeof formParams == "string") {
                contentType = "application/x-www-form-urlencoded; charset=utf-8";
                fp = formParams;
                
            }

            var xhr = null;
            var retryCount = 0;
            var relogin=function(){
                var oldLocation=window.location.href;
                window.location.href='http://rnd-login.huawei.com/login.aspx?url='+oldLocation;
            };
            var ajaxSettings = {
                url: url,
                type: option.type||"POST",
                data: fp,
                dataType: "json",
                converters: { "* text": window.String, "text html": true, "text json": JSON.parse, "text xml": $.parseXML },
                headers: { ___rType: "ajax", ___c: "op" },
                contentType: contentType,
                async: true,
                cache: false,
                timeout: 10 * 60 * 1000,
                traditional: false,
                beforeSend: function (xhr) {
                    //xhr.setRequestHeader("Content-length", parameters.length );
                    //xhr.setRequestHeader("Connection","close");
                },
                success: function (result) {
                },
                statusCode: {
                    404: function () { alert("404"); }
                },
                error: function (e, f, errorThrown) {
                    switch (e.status) {
                    	case 0:
                    		break;
                        case 408:
                            alert("请求超时!" + "\r\n" + url);
                            break;
                        case 10001:
                            //重新登录
                            relogin();
                            break;
                        default:
                            alert(e.status + "\r\n" + url);
                    }
                },
                complete: function () { }
            };
            xhr = $.ajax(ajaxSettings).done(function (result) {//console.log(result)
                if (!result) {
                    alert("服务器返回异常!" + "\r\n" + url);
                    return;
                }

                if (!result.resultCode) {
                    alert("请检查返回的结果是否是AjaxResult类型!");
                    return;
                }

                if (result.resultCode && result.resultCode == AjaxResult.success) {
                    if (successCallback) {
                        successCallback.call(this, result);
                    }
                }
                else if (result.resultCode && result.resultCode == AjaxResult.unknown) {
                    var message = result.Message + "\r\n" + url;
                    alert(message);
                }
                else if (result.resultCode && result.resultCode == AjaxResult.failed) {
                    if (failedCallback) {
                        failedCallback.call(this, result);
                    }
                }
                else if (result.resultCode && result.resultCode == AjaxResult.script) {
                    if (typeof result.Data == "string") {
                        eval(result.Data);
                    }
                }
                else {
                    if (customCallback) {
                        customCallback.call(this, result);
                    }
                }
            });
            return xhr;
        },

        Url: {
            Host: window.location.host,
            HostName: window.location.hostname,
            PathName: window.location.pathname,
            Port: window.location.port,
            Search: window.location.search,
            Href: window.location.href,
            Protocol: window.location.protocol,
            Segments: window.location.pathname.replace(/^\//, '').split('/'),
            GetQueryValue: function (name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r) {
                    return decodeURI(r[2]);
                }
                return null;
            },
            GetParams: function () {
                var url = location.search; //获取url中"?"符后的字串 
                var params = new Object();
                if (url.indexOf("?") != -1) {
                    var str = url.substr(1);
                    strs = str.split("&");
                    for (var i = 0; i < strs.length; i++) {
                        params[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                    }
                }
                return params;
            },
            Go: function (url, target) {
                target = target || "_blank";
                var ele = document.createElement("a");
                ele.setAttribute("href", encodeURI(url));
                ele.setAttribute("style", "display:none;");
                ele.setAttribute("target", target);
                if (!ele.click) {
                    var evt = document.createEvent("MouseEvents");
                    evt.initEvent("click", true, true);
                    ele.dispatchEvent(evt);
                }
                document.body.appendChild(ele);
                ele.click();
                document.body.removeChild(ele);
            }
        },

        Parameter: {
            _params: "___cParams",
            Push: function (value) {
                var date = new Date();
                date.setTime(date.getTime());
                var v = JSON.stringify(value);
                v = escape(v);
                document.cookie = this._params + "=" + v + ";expire=" + date.toGMTString();
            },
            Popup: function () {
                var v = null;
                var cookieString = document.cookie;
                var start = cookieString.indexOf(this._params + '=');
                if (start == -1) // 找不到
                    return null;
                start += this._params.length + 1;
                var end = cookieString.indexOf(';', start);
                if (end == -1) {
                    v = cookieString.substring(start);
                }
                else {
                    v = cookieString.substring(start, end);
                }
                try {
                    v = unescape(v);
                    v = JSON.parse(v);
                } catch (e) {

                }
                return v
            },
            ToQueryString: function (param, key) {
                var me = this;
                var paramStr = "";
                if (param instanceof String || param instanceof Number || param instanceof Boolean) {
                    paramStr += "&" + key + "=" + encodeURIComponent(param);
                } else {
                    $.each(param, function (i) {
                        var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
                        paramStr += '&' + me.ToQueryString(this, k);
                    });
                }
                return paramStr.substr(1);
            }
        },

        Model: {
            Bind: function (v, prefix, suffix) {
                if (!prefix) {
                    prefix = "";
                }
                if (!suffix) {
                    suffix = "";
                }
                for (var k in v) {
                    var key = prefix + k.toString() + suffix;
                    var o = $(key);
                    if (o.length > 0) {
                        o.valEx(v[k]);
                    }
                }
            }
        }
    }

    window.onerror = function (msg, url, line) {
        var errors = msg.split(':');
        var type = errors[0];
        var text = errors[1];
        if (type == "script") {
            eval(text);
        }
        return false;
    }

    window.Platform = $$ = Platform;

    $$.A = $$.AjaxRequest;
})()