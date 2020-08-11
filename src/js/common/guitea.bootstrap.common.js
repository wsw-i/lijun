/*===============================================
 * guitea.bootstrap.common js
 * author wangshw 2019-4-16
 ================================================*/
+function (emer) {
    /*--------------------------------
     * guitea.bootstrap.extend
     *================================*/
    emer._dialog = function (options) {
        var opts = {
            msg: "提示内容",
            title: "操作提示",
            btnok: "确定",
            btncl: "取消",
            iconCls: '',
            icon: 'info'
        };
        $.extend(opts, options);

        switch (opts.icon) {
            case "info": opts.iconCls = "fa fa-info-circle"; break;
            case "warning": opts.iconCls = "fa fa-exclamation-circle "; break;
            case "error": opts.iconCls = "fa fa-exclamation-triangle"; break;
            case "question": opts.iconCls = "fa fa-question-circle"; break;
            default: break;
        }

        var arr_htm = [];
        arr_htm.push('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');
        arr_htm.push('<div class="modal-header">');
        var icon_htm = opts.iconCls ? '<i class="' + opts.iconCls + '"></i>&nbsp;' : '';
        arr_htm.push('<h5 class="modal-title">' + icon_htm + '[Title]</h5>');
        arr_htm.push('<button type="button" class="close" data-dismiss="modal" aria-label="Close">');
        arr_htm.push('<span aria-hidden="true">&times;</span>');
        arr_htm.push('</button>');
        arr_htm.push('</div>');//end header

        arr_htm.push('<div class="modal-body"><p>[Message]</p></div>');
        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<button type="button" class="btn btn-primary btn-sm ok" data-dismiss="modal">[BtnOk]</button>');
        arr_htm.push('<button type="button" class="btn btn-secondary btn-sm cancel" data-dismiss="modal">[BtnCancel]</button>');
        arr_htm.push('</div>');//end footer

        arr_htm.push('</div>');//end content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal
        var str_htm = arr_htm.join('');
        var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
        str_htm = str_htm.replace(reg, function (node, key) {
            return {
                Title: opts.title,
                Message: opts.msg,
                BtnOk: opts.btnok,
                BtnCancel: opts.btncl
            }[key];
        });

        var $dialog = $(str_htm);
        $(document.body).append($dialog);
        $dialog.modal({
            backdrop: 'static',
            keyboard: false,
            focus: true,
            show: true
        });
        return $dialog;
    }
    emer.alert = function (options, callback) {
        var opts = {};
        typeof (options) == 'string' ? opts.msg = options : $.extend(opts, options);

        var $dialog = emer._dialog(opts);
        $dialog.find('.ok').removeClass('btn-secondary').addClass('btn-primary');
        $dialog.find('.cancel').hide();

        $dialog.find('.ok').click(function () { $dialog.modal('hide'); });
        $dialog.find('.close').click(function () { $dialog.modal('hide'); });
        //当模态框完全对用户隐藏时触发。
        $dialog.on('hidden.bs.modal', function () {
            $dialog.remove();
            if (callback && typeof callback == 'function') {
                callback(true);
            }
        });
    }
    emer.confirm = function (options, callback) {
        var opts = {
            icon: "question"
        };
        typeof (options) == 'string' ? opts.msg = options : $.extend(opts, options);

        var $dialog = emer._dialog(opts);
        $dialog.find('.ok').removeClass('btn-secondary').addClass('btn-primary');

        $dialog.find('.ok').click(function () {
            $dialog.modal('hide');
            if (callback && typeof callback == 'function') {
                callback(true);
            }
        });
        $dialog.find('.close').click(function () {
            $dialog.modal('hide');
            if (callback && typeof callback == 'function') {
                callback(false);
            }
        });
        $dialog.find('.cancel').click(function () {
            $dialog.modal('hide');
            if (callback && typeof callback == 'function') {
                callback(false);
            }
        });

        //当模态框完全对用户隐藏时触发。
        $dialog.on('hidden.bs.modal', function () { $dialog.remove(); });
    };

    /*--------------------------------
     * guitea.bootstrap.loading
     *================================*/
    emer._loading = function (options) {
        var opts = {
            msg: "加载中..."
        };
        $.extend(opts, options);

        var arr_htm = [];
        arr_htm.push('<div id="__guitealoading">');
        arr_htm.push('<div class="guitea-loading">[Message]</div>');
        arr_htm.push('<div class="guitea-loading-backdrop"></div>');
        arr_htm.push('</div');
        var str_htm = arr_htm.join('');
        var reg = new RegExp("\\[([^\\[\\]]*?)\\]", 'igm');
        str_htm = str_htm.replace(reg, function (node, key) {
            return {
                Message: opts.msg
            }[key];
        });
        var $msk = $(str_htm);
        $(document.body).append($msk);
        return $msk;
    }
    emer.loading = function (s, options) {
        if (s == 'show') {
            var opts = {};
            typeof (options) == 'string' ? opts.msg = options : $.extend(opts, options);
            var $msk = $("#__guitealoading");
            if ($msk.length == 0) {
                emer._loading(opts);
            }
            else {
                //加载层已存在
                $msk.find('.guitea-loading').html(opts.msg);
            }
        }
        else if (s == 'hide') {
            var $msk = $("#__guitealoading");
            if ($msk.length) $msk.remove();
        }
    }

    /*--------------------------------
     * emer openWindow
     * add 2019-05-14 by wangshw
     *================================*/
    emer.openWin = function (s) {
        var opts = {
            id: 'emer_open_' + emer.random().toString(),
            title: '开窗选择',
            winType: 'list',//默认列表开窗
            openView: '',
            winWhere: '',//开窗查询条件
            sqlFormat: '',//sqlFormat格式为json数据。带入条件的另一种方式，不建议使用，需要开窗视图中配置参数。
            controlIds: '',
            windowFields: '',
            afterColseCallback: '',//执行controlIds赋值后，执行afterColseCallback
            onEndCallback: '', //设置了onEndCallback后controlIds与afterColseCallback不再起作用
            allSelect: false,//是否有全选按钮
            onlyLeafCheck: false,
            multiSelect: false,//是否能多选
            joinAdd: false,//是否有追加按钮
            gridTargert: '',
            isGridColumn: false,
            tools: []
        };
        $.extend(opts, s);
        if (!opts.openView) {
            emer.alert('开窗视图不能为空，请配置开窗视图！'); return;
        }
        if (opts.sqlFormat) opts.sqlFormat = JSON.stringify(opts.sqlFormat);

        $win = $('<div></div>').appendTo("body");
        switch (opts.winType.toLowerCase()) {
            case "treegrid":
            case "tree":
            case "tree1":
            case "opentree": {
                opts.url = opts.url || '/OpenWindow/TreeGridDataBind';
                opts.url = emer.url(opts.url);
                $win.opentree(opts);
                break; break;
            }
            case "list":
            case "grid":
            default: {
                opts.url = opts.url || '/OpenWindow/GridDataBind';
                opts.url = emer.url(opts.url);
                $win.openlist(opts);
                break;
            };
        }
    }

    /*--------------------------------
     * emer.operate
     * add by wangshw 2019-05-30
     *================================*/
    emer.operate = function (options) {
        //options = {
        //    tools: [{
        //        text:'',
        //        iconCls: '',
        //        btnCls: '',
        //        handler: function (e) { },
        //    }],
        //    eventData:{}
        //};
        options.eventData = options.eventData || {};
        options.tools = options.tools || [];
        options.tools.push({
            text: '关闭',
            iconCls: 'fa fa-dot-circle-o',
            btnCls: 'btn-secondary'
        });

        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-operate" tabindex="-1" role="dialog">');
        arr_htm.push('<div class="modal-dialog" role="document">');
        arr_htm.push('<div class="modal-content">');
        arr_htm.push('</div>');
        arr_htm.push('</div>');
        arr_htm.push('</div>');

        var $operate = $(arr_htm.join('')).appendTo("body");
        var $content = $operate.find(".modal-content");
        for (var i = 0, len = options.tools.length; i < len; i++) {
            var tool = options.tools[i];
            tool.text = tool.text || '';
            var btnCls = tool.btnCls || 'btn-primary';
            var btnTxt = tool.iconCls ? '<i class="' + tool.iconCls + '"></i>&nbsp;' : '';
            btnTxt += tool.text;

            var $btn = $('<a class="btn ' + btnCls + ' btn-block" href="javascript:;" role="button" aria-label="' + tool.text + '">' + btnTxt + '</a>');

            options.eventData.$operate = $operate;
            options.eventData.tool = tool;
            var data = {
                $operate: $operate,
                tool: tool,
                eventData: options.eventData
            };
            $btn.on('click', data, function (e) {
                var tool = e.data.tool;
                if (tool.handler) tool.handler.call(this, e);
                e.data.$operate.modal('hide');
            });
            $btn.appendTo($content);
        }
        $operate.modal({
            backdrop: 'static',
            keyboard: false,
            focus: true,
            show: true
        });
        $operate.on('hidden.bs.modal', function (e) {
            e.target.remove();
        });
    }

    /*--------------------------------
     * emer upload download
     * add by wangshw 2019-05-31
     *================================*/
    emer.upload_cors = true;//文档附件是否跨域上传到文档服务器，默认上传到文档服务器
    //跨域文件压缩下载
    emer.jsonpZipDownLoad = function (url) {
        //跨域ajax处理
        emer.ajax({
            type: "get",
            dataType: "jsonp",
            url: emer.doc_host + '/Upload/FileZipDownload',
            data: {
                url: url.replace(emer.doc_host, '').replace('/' + emer.websrc, ''),
                websrc: emer.websrc
            },
            success: function (r) {
                $.messager.progress('close');
                if (r.success) emer.downLoad(r.data);
                else {
                    $.messager.alert('提示', r.errmsg, 'info');
                }
            }
        });
    }
    emer.download_token = function (fn, eventData) {
        if (emer.loginUser) {
            var description = eventData.description || "文件下载mobile端鉴权";
            //获取token
            emer.guiteaApi({
                url: '/gcoa/sys/getToken',
                jparam: {
                    userCode: emer.loginUser.UserCode,
                    description: emer.sarea + description
                },
                apiSuccess: function (r) {
                    if (r.data.token) {
                        eventData.token = r.data.token;
                        fn.call(this, eventData);
                    }
                }
            });
        }
    }
    emer.getTokenUrl = function (url, token) {
        return url = url + (url.indexOf('?') > 0 ? '&' : '?') + 'token=' + token;
    }
    emer.downLoad = function (url) {
        if (url) {
            emer.download_token(emer.onDownloading, {
                description: "文件下载mobile端鉴权",
                url: url
            });
            return;
        }
        emer.alert("下载地址无效！");
    }
    emer.onDownloading = function (e) {
        var url = e.url;
        var fileExtend = url.substring(url.lastIndexOf('.')).toLowerCase();
        if (fileExtend.indexOf("?") > 0) {
            fileExtend = fileExtend.substring(0, fileExtend.indexOf("?"));
        }
        switch (fileExtend) {
            case ".gif": case ".jpg": case ".jpeg": case ".bmp": case ".png"://图片格式，执行图片浏览
            case ".txt": {
                url = emer.getTokenUrl(url, e.token);
                window.open(url); break; //txt格式，直接浏览器打开
            }
            case ".doc": case ".docx": case ".xls": case ".xlsx":
            case ".ppt": case ".pptx": case ".ppsx":
            case ".rar": case ".zip": case ".7z": {
                //浏览器支持直接下载的文件格式
                url = emer.getTokenUrl(url, e.token);
                if (!$("#emer_downIframe").length) {
                    var iframe = document.createElement("iframe");
                    iframe.id = "emer_downIframe";
                    document.body.appendChild(iframe);
                }
                $("#emer_downIframe")[0].src = url;
                $("#emer_downIframe")[0].style.display = "none";
                break;
            }
            default: {
                //其他的文件格式使用压缩下载
                $.messager.progress({
                    title: '打包下载等待',
                    msg: '打包下载中...'
                });
                //判断文件是否在文档服务器上
                if (url.indexOf(emer.doc_host) < 0) {
                    //在本地服务器上
                    emer.ajax({
                        url: emer.url('/Sys_Upload/FileZipDownload'),
                        data: { url: url },
                        success: function (r) {
                            $.messager.progress('close');
                            if (r.success) emer.downLoad(r.data);
                            else {
                                $.messager.alert('提示', r.errmsg, 'info');
                            }
                        }
                    });
                }
                else {
                    emer.jsonpZipDownLoad(url); //在文档服务器上
                }
                break;
            }
        }
    }
    emer.imgView = function (url) {
        emer.download_token(emer.onImgViewing, {
            description: "图片浏览mobile端鉴权",
            url: url
        });
    }
    emer.onImgViewing = function (e) {
        var url = e.url;
        url = emer.getTokenUrl(url, e.token);
        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-imgview" tabindex="-1" role="dialog">');
        arr_htm.push('<div class="modal-dialog modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-body">');
        arr_htm.push('<img src="' + url + '" class="img-fluid">');
        arr_htm.push('</div>');

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal"><i class="fa fa-dot-circle-o"></i>&nbsp;关闭</button>');
        arr_htm.push('</div>');

        arr_htm.push('</div>');//modal-content
        arr_htm.push('</div>');//modal-dialog
        arr_htm.push('</div>');//modal

        emer.loading('show', '图片加载中...');
        var $imgview = $(arr_htm.join('')).appendTo("body");
        $imgview.modal({
            backdrop: 'static',
            keyboard: false,
            focus: true,
            show: false
        }).on('hidden.bs.modal', function (e) {
            e.target.remove();
        }).find('.img-fluid')[0].onload = function () {
            emer.loading('hide');
            $imgview.modal('show');
        }
    }
    emer.isImg = function (url) {
        if (url) {
            //通过后缀名判断是否是图片 gif,jpg,jpeg,bmp,png
            var fileExtend = url.substring(url.lastIndexOf('.')).toLowerCase();
            switch (fileExtend) {
                case ".gif":
                case ".jpg":
                case ".jpeg":
                case ".bmp":
                case ".png": return true;
                default: return false;
            }
        }
        return false;
    }

    /*--------------------------------
     * emer.bootstrap.common
     *================================*/
    emer.call_src = 'mobile2';//发起调用来源
    emer.mobile2 = true;//是否手机V2版

    emer.weixin = emer.browser.weixin;//是否微信端
    emer.wxwork = emer.browser.wxwork;//是否企微端
    emer.deviceName = emer.browser.deviceName;
    if ($("#loginUser").length) {
        emer.loginUser = JSON.parse(emer.decode($("#loginUser").val()));
    }

    emer.ajax = function (s) {
        //hideLoadingWhenOk 是否成功后关闭loading
        var _settings = {
            type: 'POST',
            dataType: 'json',
            timeout: 30000,//初始超时时间30s
            async: true,
            cache: false,
            success: function (r) {
                if (r.success) {
                    if (s.hideLoadingWhenOk != false) emer.loading('hide');
                    if (typeof s.emerSuccess == 'function') s.emerSuccess(r);
                    else if (r.errmsg) emer.alert(r.errmsg);
                }
                else {
                    emer.loading('hide');
                    if (r.errcode == 9001) {
                        if (emer.weixin) {
                            emer.alert({ title: '登录提示', msg: '微信授权登录失败或授权超时，请退出重进！' }, function () {
                                emer.go2Weixin();
                            });
                            return;
                        }
                        //登录超时
                        emer.alert({ title: '登录提示', msg: '未登陆或登陆超时，请重新登陆' }, function () {
                            top.window.location.href = emer.url_index();
                        });
                        return;
                    }
                    if (r.errcode == 9991) {
                        //微信登录未授权或授权已失效
                        emer.alert({ title: '微信鉴权提示', msg: '操作已超时，微信登录授权已失效，请退出重进！' }, function () {
                            emer.go2Weixin();
                        });
                        return;
                    }
                    if (typeof s.emerError == 'function') s.emerError(r);
                    else if (r.errmsg) emer.alert(r.errmsg);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                emer.loading('hide');
                switch (textStatus) {
                    case "timeout": {
                        emer.alert('请求服务器超时！'); break;
                    }
                    default: {
                        emer.alert('请求服务器失败,请重试，失败原因:' + errorThrown); break;
                    }
                }
            }
        };
        $.extend(_settings, s);
        $.ajax(_settings);
    }
    emer.guiteaApi = function (s) {
        emer.baseGuiteaApi(s);
    }
    emer.guiteaApiAnonymous = function (s) {
        s.oa_api_url = '/api/guitea_api_anonymous';
        emer.baseGuiteaApi(s);
    }
    emer.baseGuiteaApi = function (s) {
        s.oa_api_url = s.oa_api_url || emer.url('/api/guitea_api');
        if (s.showloading != false)
            emer.loading('show', s.loading_msg || '加载中...');
        emer.ajax({
            url: s.oa_api_url,
            data: {
                url: emer.api_node_host + s.url,
                jparam: emer.encode(JSON.stringify(s.jparam || {}))
            },
            emerSuccess: function (r) {
                if (s.hideLoadingWhenOk != false) emer.loading('hide');
                if (typeof s.apiSuccess == 'function') s.apiSuccess(r);
                else if (r.errmsg) emer.alert(r.errmsg);
            },
            emerError: function (r) {
                emer.loading('hide');
                if (typeof s.apiError == 'function') s.apiError(r);
                else if (r.errmsg) emer.alert(r.errmsg);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                emer.loading('hide');
                if (typeof s.error == 'function') s.error(XMLHttpRequest, textStatus, errorThrown);
                else {
                    switch (textStatus) {
                        case "timeout": {
                            emer.alert('请求服务器超时！'); break;
                        }
                        default: {
                            emer.alert('请求服务器失败,请重试，失败原因:' + errorThrown); break;
                        }
                    }
                }
            }
        });
    }

    emer.go2Weixin = function () {
        if (emer.weixin) {
            WeixinJSBridge.call('closeWindow');
        }
        else {
            emer.go2Memu();
        }
    }
    emer.go2Memu = function () {
        var index_url = '/mobile2/m_index';
        if (emer.sarea && emer.sarea.indexOf('gcoa') < 0) {
            index_url = "/" + emer.sarea + "/m2/m2_index";
        }
        window.location.href = emer.getHost() + emer.url(index_url);
    }

    emer.guitea_auth = function (options) {
        var uid = '';
        if (emer.weixin) {
            var code = emer.queryString("code");
            if (!code) {
                var redirect_uri = window.location.href,
                    description = options.description || '贵茶登录鉴权';
                var auth_url = emer.surl('/home/guitea_htm_auth') +
                    "&redirect_uri=" + emer.encode(redirect_uri) +
                    "&description=" + description +
                    "&v=" + Math.random();
                window.location.href = auth_url;
                return;
            }
            uid = options.uid || emer.queryString("uid");
            $.messager.progress({ msg: '鉴权中...', interval: 100 });
            //验证code值
            emer.ajax({
                url: emer.surl('/home/auth_code_check') + "&uid=" + uid,
                data: {
                    code: code
                },
                emerSuccess: function (r) {
                    emer.loginUser = r.data;
                    if (options.success) options.success();
                }
            });
        }
        else {
            uid = options.uid || emer.queryString("uid");
            $.messager.progress({ msg: '鉴权中...', interval: 100 });
            emer.ajax({
                url: emer.surl('/home/LoginCheck') + "&uid=" + uid,
                emerSuccess: function (r) {
                    emer.loginUser = r.data;
                    if (options.success) options.success();
                }
            });
        }
    }

    return emer;
}(emer);

var app = function (emer) {
    app = {
        defaults: {},   //默认配置
        config: {},     //外部配置
        options: {
            hideLoadingWhenEndInit: true,   //init后是否关闭loading
            enableSessionPolling: false      //是否启用轮询Session，防止session超时。
        }
    };
    app.parseOptions = function () {
        return $.extend(true, app.options, app.defaults, app.config);
    }
    app.mid = emer.queryString('mid');
    app.url = function (url) {
        if (emer.loginUser) return emer.url(url) + '&mid=' + app.mid;
        return emer.surl(url);
    }
    app.getEditUrl = function (url) {
        var arr = [], _url = '', finalUrl = '';
        if (url.indexOf("?sarea=") > 0) {
            arr = url.split('?sarea=');
        }
        else if (url.indexOf("&sarea=") > 0) {
            arr = url.split('&sarea=');
        }
        _url = arr.length ? arr[0] : url;
        switch (_url) {
            case "/BasePage/ListPage":
            case "/BasePage/ListSingle":
            case "/BasePage/ListSingle_Win":
            case "/mobile2/listpage": {
                finalUrl = "/mobile2/singlepage";
                break;
            }
            case "/BasePage/ListPage/?urls_edit=DoubleDoc":
            case "/mobile2/listpage?edit_url=|mobile2|doublepage":
            case "/mobile2/listpage?edit_url=/mobile2/doublepage": {
                finalUrl = "/mobile2/doublepage";
                break;
            }
            default: {
                finalUrl = url;
                break;
            }
        }
        var _urlSuffix = arr.length > 1 ? arr[1] : "";
        finalUrl += _urlSuffix;

        if (finalUrl.indexOf('customEdit=') > 0) {
            var ctrllerPath = finalUrl.split('customEdit=')[1];
            return '/' + ctrllerPath.replace('|', '/');
        }
        if (finalUrl.indexOf('|') > 0) {
            var _arr = finalUrl.split('|').splice(0, 1);
            return '/' + _arr.join('/');
        }

        return finalUrl;
    }

    app.serializeJson = function (s) {
        //s=$("form");
        var o = {};
        var a = s.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(emer.doEscape(this.value));

            } else {
                o[this.name] = emer.doEscape(this.value);
            }
        });
        return o;
    }

    app.bsreadonly = function (s, mode) {
        if (s.hasClass('easyui-textbox')) {
            s.textbox('readonly', mode); return;
        }
        if (s.hasClass('easyui-textwindow')) {
            s.textwindow('readonly', mode); return;
        }
        if (s.hasClass('easyui-numberbox')) {
            s.numberbox('readonly', mode); return;
        }
        if (s.hasClass('easyui-combobox')) {
            s.combobox('readonly', mode); return;
        }
        if (s.hasClass('easyui-checkbox')) {
            s.checkbox('readonly', mode); return;
        }
        if (s.hasClass('easyui-datebox') || s.hasClass('easyui-datetimebox')) {
            s.datebox('readonly', mode); return;
        }
    }
    app.readonly = {
        //兼容PC端js中方法，直接使用请用 bsreadonly
        textbox: function (s, readonly) {
            app.bsreadonly(s, readonly);
        },
        numberbox: function (s, readonly) {
            app.bsreadonly(s, readonly);
        },
        combobox: function (s, readonly) {
            app.bsreadonly(s, readonly);
        },
        textwindow: function (s, readonly) {
            app.bsreadonly(s, readonly);
        },
        switchbutton: function (s, readonly) {
            app.bsreadonly(s, readonly);
        }
    };
    app.textReadonly = {
        textbox: function (s, readonly) {
            app.bsreadonly(s, readonly);
        }
    };

    app.setValue = function (s, v) {
        if (s.hasClass('easyui-textbox')) {
            s.textbox('setValue', v); return;
        }
        if (s.hasClass('easyui-textwindow')) {
            s.textwindow('setValue', v); return;
        }
        if (s.hasClass('easyui-numberbox')) {
            s.numberbox('setValue', v); return;
        }
        if (s.hasClass('easyui-combobox')) {
            s.combobox('setValue', v); return;
        }
        if (s.hasClass('easyui-checkbox')) {
            s.checkbox('setValue', v); return;
        }
        s.val(v);
    }
    app.setText = function (s, txt) {
        if (s.hasClass('easyui-textwindow')) {
            s.textwindow('setText', txt);
        }
    }
    app.getValue = function (s) {
        if (s.hasClass('easyui-textbox')) {
            return s.textbox('getValue');
        }
        if (s.hasClass('easyui-textwindow')) {
            return s.textwindow('getValue');
        }
        if (s.hasClass('easyui-numberbox')) {
            return s.numberbox('getValue');
        }
        if (s.hasClass('easyui-combobox')) {
            return s.combobox('getValue');
        }
        if (s.hasClass('easyui-checkbox')) {
            return s.checkbox('getValue');
        }
        return s.val();
    }
    app.bsValidate = function (s) {
        //s = {
        //    value: value,
        //    validType: validType,
        //    $input: $input,
        //    $feedback: $feedback
        //};
        if (s.validType) {
            var valid = $.fn.form.defaults.validRules[s.validType];
            if (valid) {
                var isvalid = valid.validator(s.value);
                if (isvalid) {
                    s.$input.removeClass("is-invalid").addClass("is-valid");
                    s.$feedback.hide();
                }
                else {
                    s.$input.removeClass("is-valid").addClass("is-invalid");
                    s.$feedback.html(valid.message).show();
                }
            }
            return;
        }
        if (!emer.isNullOrEmpty(s.value)) {
            s.$input.removeClass("is-invalid").addClass("is-valid");
            s.$feedback.hide();
        }
        else {
            s.$input.removeClass("is-valid").addClass("is-invalid");
            s.$feedback.show();
        }
    }

    /*
     * bootstrap extend
     *===================================*/
    app.bs_extend = function () {
        app.modal_extend();
    }
    app.modal_extend = function () {
        // 通过该方法来为每次弹出的模态框设置最新的zIndex值，从而使最新的modal显示在最前面
        $(document).on('show.bs.modal', '.modal', function () {
            var zIndex = 1040 + (10 * $('.modal:visible').length);
            $(this).css('z-index', zIndex);
            setTimeout(function () {
                $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
            }, 0);
        });
    }

    app.sessionPolling = function () {
        emer.ajax({
            url: emer.url('/Home/LoginCheck'),
            success: function (r) {
                setTimeout("app.sessionPolling()", 60000);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                setTimeout("app.sessionPolling()", 60000);
            }
        });
    }

    app.dev_alert = function () {
        emer.alert('此功能还未开放，程序员正在开发中....');
    }

    //通过appid浏览对应单据
    app.appidView = function (appids) {
        if (!appids) return;
        emer.ajax({
            url: emer.url('/Utils/Query'),
            data: {
                from: 'v_t_appidmod',
                where: 'appid in (' + appids + ')'
            },
            emerSuccess: function (r) {
            }
        });
    }

    //判断是否为mobile v1版路径
    app.mobile_v1 = function (url) {
        if (url.indexOf('/gcMobile/cmStoresCostApp') >= 0) {
            return true;
        }
        return false;
    }

    app.resize = function () {
        $(".guitea-body").height($(window).height());
        if (app.page_resize) app.page_resize();
    }

    app.getTabSysTitle = function (_sarea, title) {
        if (emer.area == "gcoa")
            return emf.SAREA_TAB(_sarea) + title;
        return title;
    }

    return app;
}(emer);

var emf = formatter = baseFormatter = function (emer) {
    return {
        datetime: function (v, row) {
            return v.replace("T", " ");
        },
        dept: function (value, row) {
            if (value)
                return value.replace('贵茶集团/', '')
                    .replace('贵州贵茶(集团)有限公司', '贵州贵茶')
                    .replace('广州吾茶餐饮服务有限公司', '广州吾茶')
                    .replace('贵州三贵连锁贸易有限公司', '三贵连锁')
                    .replace('贵州雷山贵茶有限公司', '雷山贵茶')
                    .replace('贵茶（贵安新区）茶业有限公司', '贵茶贵安')
                    .replace('贵州赐力茶叶机械有限公司', '赐力茶机')
                    .replace('铜仁贵茶股份公司', '铜仁贵茶');
        },
        audit: function (value, row) {
            if (value) {
                switch (value) {
                    case "Y": return '<span class="badge badge-success">已审核</span>';
                    case "I": return '<span class="badge badge-danger">审核中</span>';
                    case "V": return '<span class="badge badge-warning">已驳回</span>';
                    default: return '<span class="badge badge-primary">未提交</span>';
                }
            }
        }
    };
}(emer);

//兼容PC端js中easyui方法
(function ($) {
    $.messager = {
        alert: function (title, msg, icon, fn) {
            var options = typeof title == "object" ? title : { title: title, msg: msg, icon: icon, fn: fn };
            emer.alert(options, options.fn);
        },
        confirm: function (title, msg, fn) {
            var options = typeof title == "object" ? title : { title: title, msg: msg, fn: fn };
            emer.confirm(options, options.fn);
        },
        prompt: function (title, msg, fn) {
            //暂未实现
        },
        progress: function (opts) {
            if (typeof opts == "string") {
                if (opts == 'close') {
                    emer.loading('hide'); return;
                }
                emer.loading('show', opts);
            }
            emer.loading('show', opts.msg);
        }
    };
})(jQuery);

//兼容PC端js中emer方法
(function (emer) {
    emer.easyui = {
        getValue: function (s) {
            return app.getValue(s);
        },
        setValue: function (s, v) {
            app.setValue(s, v);
        }
    };
})(emer);

//兼容PC端js中emf方法
(function (emf) {
    emf.DateFormatter = function (options) {
        var date = options.date;
        var datetype = options.datetype || '';
        var formatstring = options.formatstring;
        if (!emer.isNullOrEmpty(date)) {
            var da;
            if (datetype == 'json')
                da = new Date(parseInt(date.replace("/Date(", "").replace(")/", "").split("+")[0]));
            else da = date;
            switch (formatstring) {
                case "YYYY-MM-DD": return da.getFullYear() + "-" + emer.numToString((da.getMonth() + 1), 2) + "-" + emer.numToString(da.getDate(), 2);
                case "YYYY/MM/DD": return da.getFullYear() + "/" + emer.numToString((da.getMonth() + 1), 2) + "/" + emer.numToString(da.getDate(), 2);
                case "YYYY-MM": return da.getFullYear() + "-" + emer.numToString((da.getMonth() + 1), 2);
                case "YYYYMMDD": return da.getFullYear() + emer.numToString((da.getMonth() + 1), 2) + emer.numToString(da.getDate(), 2);
                case "YYYYMM": return da.getFullYear() + emer.numToString((da.getMonth() + 1), 2);
                case "YYYY": return da.getFullYear();
                default: return da.getFullYear() + "-" + emer.numToString((da.getMonth() + 1), 2) + "-" + emer.numToString(da.getDate(), 2) + " " +
                    emer.numToString(da.getHours(), 2) + ":" + emer.numToString(da.getMinutes(), 2) + ":" + emer.numToString(da.getSeconds(), 2);
            }
        }
        else return '';
    }
    emf.AuditStatus = emf.audit;
    //贵茶部门全称
    emf.gcBmqcFormatter = emf.dept;

    emf.DateTimeFormatter = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 19).replaceAll("T", " ");
    }
    //datetime
    emf.date = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 19).replaceAll("T", " ");
    };
    //yyyy
    emf.date0 = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 4);
    };
    //yyyymm
    emf.date1 = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 7).replaceAll("-", "");
    };
    //yyyymmdd
    emf.date2 = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 10).replaceAll("-", "");
    };
    //yyyy-mm
    emf.date3 = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 7);
    };
    //yyyy-mm-dd
    emf.date4 = function (value, row, index) {
        if (emer.isNullOrEmpty(value)) return '';
        return value.substr(0, 10);
    };
    emf.MemoFormatter = function (value, row, index) {
        if (value) return emer.memoHtmlFormat(value);
    };
    //有效码，启用禁用
    emf.FYouXiaoMa = function (value, row, index) {
        if (value) {
            switch (value) {
                case 'Y': return '<span style="color:#f26202">有效</span>';
                default: return '<span style="color:#975b33">禁用</span>';
            }
        }
        return value;
    };
    //是否
    emf.YesOrNo = function (value, row, index) {
        if (value) {
            switch (value) {
                case 'Y': return '<span style="color:#ff8c00">是</span>';
                default: return '<span style="color:#0c80d7">否</span>';
            }
        }
        return value;
    };
    //百分比
    emf.Percent = function (value, row, index) {
        if (value) {
            return (parseFloat(value) * 100).toFixed(2) + '<span style="color:purple">%</span>';
        }
        return value;
    };

    //提交编号浏览原单
    emf.APPID = function (value, row, index) {
        return value;
        //if (value) {
        //    var appid = (value + '').split('-')[0];
        //    return '<button type="button" class="btn btn-link"  onclick="app.appidView(\'' + appid + '\');">' + value + '</button>';
        //}
    };
    //制单设备
    emf.DeviceName = function (value, row, index) {
        if (value) {
            var iconCls = emer.getDeviceIconCls(value);
            return iconCls ? '<i class="' + iconCls + '" title="' + value + '"></i>' : value;
        }
        return '';
    };

    emf.SAREA = function (value, row, index) {
        switch (value) {
            case 'gcoa': return '<span style="color:#007bff">【贵茶oa】</span>';
            case 'gcsvsp': return '<span style="color:#17a2b8">【服务平台】</span>';
            case 'gclm': return '<span style="color:#dc3545">【贵茶联盟】</span>';
            case 'jcoa': return '<span style="color:#28a745">【净茶oa】</span>';
            case 'bemytea': return '<span style="color:#ff8c00">【吾茶大健康】</span>';
            case 'gcbi': return '<span style="color:#CC6633">【贵茶BI】</span>';
            default: return value;
        }
    }
    emf.SAREA_TAB = function (value, row, index) {
        if (value == "gcoa") return "";
        return emf.SAREA(value, row, index);
    }

})(emf);

$(function () {
    app.bs_extend();
    if (app.init) app.init();
    if (app.resize) {
        app.resize();
        $(window).resize(function () { app.resize(); });
    }
    if (app.options.hideLoadingWhenEndInit) {
        if ($("#__guitealoading").length) $("#__guitealoading").remove();
    }
    if (app.options.enableSessionPolling) {
        app.sessionPolling();
    }
});