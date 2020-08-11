/*========================================
 * jquery.bootstrap.upload
 * add by wangshw 2019-06-03
 *========================================*/
(function ($) {
    function init(target) {
        if (!WebUploader.Uploader.support()) {
            emer.alert('Web Uploader 不支持您的浏览器！');
            return;
        }
        var opts = getOptions(target);

        var w = $(window).width();
        opts.thumbnailWidth = opts.thumbnailHeight = (w - 24 - 16 - 2) / 3;//li(magin 4*6) +modal(magin 8*2)+boder 1*2

        opts.id = $(target).attr("id");
        if (!opts.id) opts.id = "upload_" + Math.random();
        $(target).removeClass("bootstrap-upload bootstrap-upload-parent")
            .addClass("bootstrap-upload-parent");

        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-upload" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-header">');
        arr_htm.push('<h5 class="modal-title"><i class="' + opts.iconCls + '"></i>&nbsp;' + opts.title + '</h5>');
        arr_htm.push('<ul class="nav nav-pills float-right">');
        arr_htm.push('<li class="nav-item">');
        arr_htm.push('<a class="btn btn-link header-tools-btn btn-close" href="javascript:;">');
        arr_htm.push('<i class="fa fa-remove"></i>');
        arr_htm.push('</a>');
        arr_htm.push('</li>');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end header

        arr_htm.push('<div class="modal-body">');

        arr_htm.push('<div id="uploader">');
        arr_htm.push('<div class="queueList">');
        arr_htm.push('<div id="dndArea" class="placeholder">');
        arr_htm.push('<div id="filePicker"></div>');
        arr_htm.push('<p>最多可选<span class="fileNumLimit">300</span>个</p>');
        arr_htm.push('</div>');
        arr_htm.push('<ul class="filelist"></ul>');
        arr_htm.push('</div>');
        arr_htm.push('</div>');

        arr_htm.push('</div>');//end body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<div class="d-flex flex-column w-100">');

        arr_htm.push('<div class="statusBar float-left border-bottom mb-2 pb-2" style="display: none;">');
        arr_htm.push('<div class="progress">');
        arr_htm.push('<span class="text">0%</span>');
        arr_htm.push('<span class="percentage"></span>');
        arr_htm.push('</div>');
        arr_htm.push('<div class="info"></div>');
        arr_htm.push('</div>');

        arr_htm.push('<div class="d-flex justify-content-end">');
        arr_htm.push('<div class="btns">');
        arr_htm.push('<div id="filePicker2" style="float: left;"></div>');
        arr_htm.push('<div class="uploadBtn" style="text-align: center"><i class="fa fa-upload"></i>&nbsp;开始上传</div>');
        arr_htm.push('</div>');
        arr_htm.push('<a class="btn btn-secondary btn-sm btn-close" href="javascript:;" role="button"><i class="fa fa-remove"></i>&nbsp;关闭</a>');
        arr_htm.push('</div>');

        arr_htm.push('</div>');//end flex
        arr_htm.push('</div>');//end footer

        arr_htm.push('</div>');//end content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal
        var $modal = $(arr_htm.join('')).appendTo($(target));
        opts.$modal = $modal;

        $modal.modal({
            backdrop: 'static',
            keyboard: true,
            focus: true,
            show: false
        });

        $modal.on('shown.bs.modal', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.uploader.refresh();
        }).on('hidden.bs.modal', { target: target }, function (e) {
            onBeforeClose(e.data.target);
        });

        opts.$header = $modal.find(".modal-header");
        opts.$body = $modal.find('.modal-body');
        opts.$footer = $modal.find('.modal-footer');

        opts.$btnClose = opts.$modal.find(".btn-close");

        opts.$uploader = $('#uploader');
        opts.$queue = opts.$uploader.find('.filelist');
        opts.$placeHolder = opts.$uploader.find('.placeholder');

        opts.$statusBar = opts.$footer.find('.statusBar');
        opts.$progress = opts.$statusBar.find('.progress').hide();
        opts.$info = opts.$statusBar.find('.info');
        opts.$btn_upload = opts.$footer.find(".uploadBtn");

        opts.$uploader.find(".fileNumLimit").html(opts.uploader_config.fileNumLimit);

        opts.$btnClose.unbind().bind('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.$modal.modal('hide');
        });

        optsExtend(target);
        uploader_init(target);

        opts.$btn_upload.addClass('state-' + opts.state)
            .on('click', { target: target }, function (e) {
                var opts = getOptions(e.data.target);
                if ($(this).hasClass('disabled')) return false;
                if (opts.state === 'ready') {
                    opts.uploader.upload();
                } else if (opts.state === 'paused') {
                    opts.uploader.upload();
                } else if (opts.state === 'uploading') {
                    opts.uploader.stop();
                }
            });
        opts.$info.on('click', '.retry', { target: target }, function () {
            var opts = getOptions(e.data.target);
            opts.uploader.retry();
        }).on('click', '.ignore', { target: target }, function () {
            //alert('todo');
        });

        updateTotalProgress(target);
    }
    function optsExtend(target) {
        var opts = getOptions(target);
        opts.uploader_config.formData = $.extend({}, opts.uploader_config.formData, {
            websrc: emer.websrc == 'gcoatest' ? 'gcoa' : emer.websrc,
            userCode: emer.loginUser.UserCode,
            userName: emer.loginUser.UserName
        });
    }
    function uploader_init(target) {
        var opts = getOptions(target);
        // 实例化
        opts.uploader = WebUploader.create(opts.uploader_config)
            .on('dndAccept', uploader_onDndAccept)
            .on('fileQueued', uploader_onFileQueued, target)
            .on('fileDequeued', uploader_onFileDequeued, target)
            .on('uploadProgress', uploader_onUploadProgress, target)
            .on('uploadSuccess', uploader_onUploadSuccess, target)
            .on('all', uploader_onAll, target)
            .on('error', uploader_onError, target);

        opts.uploader.addButton({
            id: '#filePicker2',
            innerHTML: '<i class="fa fa-plus-circle"></i>&nbsp;添加文件'
        });
    }

    //拖拽文件许可
    function uploader_onDndAccept(items) {
        //拖拽时不接受 js, txt 文件。
        var denied = false, len = items.length, i = 0,
            unAllowed = 'text/plain;application/javascript ';
        for (; i < len; i++) {
            if (~unAllowed.indexOf(items[i].type)) {
                denied = true; break;
            }
        }
        return !denied;
    }
    //当文件被加入队列以后触发
    function uploader_onFileQueued(file) {
        var target = this;
        var opts = getOptions(target);
        opts.fileCount++;
        opts.fileSize += file.size;
        if (opts.fileCount === 1) {
            opts.$placeHolder.addClass('element-invisible');
            opts.$statusBar.show();
        }
        addFile(target, file);
        setState(target, 'ready');
        updateTotalProgress(target);
    }
    //当文件被移除队列后触发
    function uploader_onFileDequeued(file) {
        var target = this;
        var opts = getOptions(target);
        opts.fileCount--;
        opts.fileSize -= file.size;
        if (!opts.fileCount) {
            setState(target, 'pedding');
        }
        removeFile(target, file);
        updateTotalProgress(target);
    }
    //上传过程中触发，携带上传进度。
    function uploader_onUploadProgress(file, percentage) {
        var target = this;
        var opts = getOptions(target);
        var $li = $('#' + file.id),
            $percent = $li.find('.progress span');
        $percent.css('width', percentage * 100 + '%');
        opts.percentages[file.id][1] = percentage;
        updateTotalProgress(target);
    }
    //当文件上传成功时触发。
    function uploader_onUploadSuccess(file, response) {
        var target = this;
        var opts = getOptions(target);
        opts.fileResult.push(response);
    }
    function uploader_onAll(eventName) {
        var target = this;
        switch (eventName) {
            case 'ready': {
                var opts = getOptions(target);
                window.uploader = opts.uploader;
                break;
            }
            case 'uploadFinished':
                setState(target, 'confirm'); break;
            case 'startUpload':
                setState(target, 'uploading'); break;
            case 'stopUpload':
                setState(target, 'paused'); break;
        }
    }
    function uploader_onError(code) {
        var target = this;
        var opts = getOptions(target);
        switch (code) {
            case "F_DUPLICATE": {
                $.messager.alert("提示", "该文件重复"); break;
            }
            case "Q_EXCEED_SIZE_LIMIT": {
                $.messager.alert("提示", "该文件大小超出最大限制"); break;
            }
            case "Q_TYPE_DENIED": {
                $.messager.alert("提示", "只能上传" + opts.uploader.option("accept")[0].extensions + "类型的文件"); break;
            }
            case "Q_EXCEED_NUM_LIMIT": {
                $.messager.alert("提示", "文件数目超出个数限制，只能上传" + opts.uploader_config.fileNumLimit + "个文件！"); break;
            }
            default: {
                $.messager.alert("提示", "错误信息：" + code); break;
            }
        }
    }

    function addFile(target, file) {
        var opts = getOptions(target);
        var $li = $('<li id="' + file.id + '">' +
           '<p class="title">' + file.name + '</p>' +
           '<p class="imgWrap"></p>' +
           '<p class="progress"><span></span></p>' +
           '</li>'),
           $prgress = $li.find('p.progress span'),
           $wrap = $li.find('p.imgWrap'),
           $info = $('<p class="error"></p>'),
           showError = function (code) {
               switch (code) {
                   case 'exceed_size': text = '文件大小超出'; break;
                   case 'interrupt': text = '上传暂停'; break;
                   default: text = '上传失败，请重试'; break;
               }
               $info.text(text).appendTo($li);
           };
        $li.css({
            width: opts.thumbnailWidth,
            height: opts.thumbnailHeight
        });
        $wrap.css({
            width: opts.thumbnailWidth,
            height: opts.thumbnailHeight
        });
        if (file.getStatus() === 'invalid') {
            showError(file.statusText);
        } else {
            // @todo lazyload
            $wrap.text('预览中');
            opts.uploader.makeThumb(file, function (error, src) {
                var $img;
                if (error) {
                    $wrap.text('不能预览');
                    var thumbnailUrl = getThumbnailUrl(file.name);
                    $img = $('<div class="guitea-thumbnail" style="background-image: url(' + thumbnailUrl
                        + ')" valign="top" title="' + file.name
                        + '"><span class="guitea-thumbnail-text">' + file.name + '</span></div>')
                        .css({
                            "width": opts.thumbnailWidth + "px",
                            "height": opts.thumbnailHeight + "px",
                            "background-size": opts.thumbnailWidth + "px " + opts.thumbnailHeight + "px"
                        });
                    $wrap.empty().append($img);
                    return;
                }
                if (emer.supportBase64()) {
                    $img = $('<img src="' + src + '">');
                    $wrap.empty().append($img);
                }
            }, opts.thumbnailWidth, opts.thumbnailHeight);
            opts.percentages[file.id] = [file.size, 0];
            file.rotation = 0;
        }
        file.on('statuschange', function (cur, prev) {
            if (prev === 'progress') {
                $prgress.hide().width(0);
            } else if (prev === 'queued') {
                $li.off('click');
            }
            // 成功
            if (cur === 'error' || cur === 'invalid') {
                showError(file.statusText);
                opts.percentages[file.id][1] = 1;
            } else if (cur === 'interrupt') {
                showError('interrupt');
            } else if (cur === 'queued') {
                opts.percentages[file.id][1] = 0;
            } else if (cur === 'progress') {
                $info.remove();
                $prgress.css('display', 'block');
            } else if (cur === 'complete') {
                $li.append('<span class="success"></span>');
            }

            $li.removeClass('state-' + prev).addClass('state-' + cur);
        });
        $li.on('click', {
            target: target,
            file: file
        }, function (e) {
            var eventData = e.data;
            emer.operate({
                tools: [{
                    text: '移除',
                    iconCls: 'fa fa-minus-circle',
                    btnCls: '',
                    handler: function (e) {
                        var opts = getOptions(e.data.eventData.target);
                        opts.uploader.removeFile(e.data.eventData.file);
                    }
                }],
                eventData: e.data
            });
        }).appendTo(opts.$queue);
    }
    function removeFile(target, file) {
        var opts = getOptions(target);
        var $li = $('#' + file.id);
        delete opts.percentages[file.id];
        updateTotalProgress(target);
        $li.off().find('.file-panel').off().end().remove();
    }
    function setState(target, val) {
        var opts = getOptions(target);
        var file, stats;
        if (val === opts.state) return;
        opts.$btn_upload.removeClass('state-' + opts.state);
        opts.$btn_upload.addClass('state-' + val);
        opts.state = val;
        switch (opts.state) {
            case 'pedding':
                opts.$placeHolder.removeClass('element-invisible');
                opts.$queue.hide();
                opts.$statusBar.addClass('element-invisible');
                opts.uploader.refresh();
                break;
            case 'ready':
                opts.$placeHolder.addClass('element-invisible');
                $('#filePicker2').removeClass('element-invisible');
                opts.$queue.show();
                opts.$statusBar.removeClass('element-invisible');
                opts.uploader.refresh();
                break;
            case 'uploading':
                $('#filePicker2').addClass('element-invisible');
                opts.$progress.show();
                opts.$btn_upload.text('暂停上传');
                break;
            case 'paused':
                opts.$progress.show();
                opts.$btn_upload.text('继续上传');
                break;
            case 'confirm':
                opts.$progress.hide();
                $('#filePicker2').removeClass('element-invisible');
                opts.$btn_upload.text('开始上传');
                stats = opts.uploader.getStats();
                if (stats.successNum && !stats.uploadFailNum) {
                    setState(target, 'finish'); return;
                }
                break;
            case 'finish':
                stats = opts.uploader.getStats();
                if (stats.successNum) {
                    $.messager.alert("提示", "上传成功");
                } else {
                    // 没有成功的图片，重设
                    opts.state = 'done';
                    reload(target);
                }
                break;
        }
        updateStatus(target);
    }
    function updateTotalProgress(target) {
        var opts = getOptions(target);
        var loaded = 0,
            total = 0,
            spans = opts.$progress.children(),
            percent;
        $.each(opts.percentages, function (k, v) {
            total += v[0];
            loaded += v[0] * v[1];
        });
        percent = total ? loaded / total : 0;
        spans.eq(0).text(Math.round(percent * 100) + '%');
        spans.eq(1).css('width', Math.round(percent * 100) + '%');
        updateStatus(target);
    }
    function updateStatus(target) {
        var opts = getOptions(target);
        var text = '', stats;
        switch (opts.state) {
            case "ready": {
                text = '选中' + opts.fileCount + '个文件，共' + WebUploader.formatSize(opts.fileSize) + '。';
                break;
            }
            case "confirm": {
                stats = opts.uploader.getStats();
                if (stats.uploadFailNum) {
                    text = '已成功上传' + stats.successNum + '个文件，' + stats.uploadFailNum +
                        '个文件上传失败，<a class="retry" href="#">重新上传</a>失败文件或<a class="ignore" href="#">忽略</a>'
                }
                break;
            }
            default: {
                stats = opts.uploader.getStats();
                text = '共' + opts.fileCount + '个（' + WebUploader.formatSize(opts.fileSize) + '），已上传' + stats.successNum + '个';
                if (stats.uploadFailNum) {
                    text += '，失败' + stats.uploadFailNum + '个';
                }
                break;
            }
        }
        opts.$info.html(text);
    }

    function onBeforeClose(target) {
        var opts = getOptions(target);
        if (typeof opts.endCallback == 'function') {
            opts.endCallback(opts.fileResult);
        }
        else if (opts.controlId) {
            var arr_v = [];
            for (var i = 0; i < opts.fileResult.length; i++) {
                arr_v.push(opts.fileResult[i][opts.windowField]);
            }
            var $elem = $("#" + opts.controlId);
            if ($elem.hasClass("bootstrap-attachment")) {
                $elem.attachment("setIncrementValue", arr_v.join(','));
            }
        }
        reload(target);
    }

    function getThumbnailUrl(fileName) {
        var url = "/Scripts/UploadPage/thumbnail/",
            suffix = fileName.substring(fileName.lastIndexOf("."), fileName.length);
        switch (suffix.toLowerCase()) {
            case ".doc":
            case ".docx":
            case ".dot": return url + "docx.png";
            case ".xls":
            case ".xlsx": return url + "xlsx.png";
            case ".ppt":
            case ".ppsx":
            case ".pptx": return url + "pptx.png";
            case ".txt": return url + "txt.png";
            case ".pdf": return url + "pdf.png";
            case ".rar":
            case ".7z":
            case ".zip": return url + "zip.png";
            default: return url + 'unknow.png';
        }
    }
    function reload(target) {
        var opts = getOptions(target);
        opts.uploader.destroy();//销毁uploader
        //初始化变量数据
        opts.state = 'pedding';
        opts.percentages = {};
        opts.fileCount = 0;
        opts.fileSize = 0;
        opts.fileResult = [];

        $(target).find('.bootstrap-upload').remove();
        init(target);
    }

    function getOptions(target) {
        return $.data(target, 'upload').options;
    }
    $.fn.upload = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.upload.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'upload');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, 'upload', {
                    options: $.extend(true, {}, $.fn.upload.defaults, options)
                });
                init(this);
            }
        });
    };
    $.fn.upload.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        show: function (jq) {
            return jq.each(function () {
                var opts = getOptions(this);
                if (!emer.loginUser) {
                    $.messager.alert("异常提示", "参数丢失，请重新登录", "info", function () {
                        top.window.location.href = emer.url_index();
                    });
                    return;
                }
                opts.$modal.modal('show');
            });
        },
        hide: function (jq) {
            return jq.each(function () {
                var opts = getOptions(this);
                opts.$modal.modal('hide');
            });
        }
    };
    $.fn.upload.defaults = {
        id: '',

        title: '文件上传',
        iconCls: 'fa fa-paperclip',

        urls: {
            InstallSwf: "/libs/webUploader/expressInstall.swf", //InstallSwf
        },

        ratio: window.devicePixelRatio || 1,// 优化retina, 在retina下这个值是2
        thumbnailWidth: 110 * this.ratio,// 缩略图大小
        thumbnailHeight: 110 * this.ratio,
        state: 'pedding',// 可能有pedding, ready, uploading, confirm, done.
        percentages: {},// 所有文件的进度信息，key为file id

        fileCount: 0,  // 添加的文件数量
        fileSize: 0,   // 添加的文件总大小
        fileResult: [],

        uploader: null,//WebUploader实例
        uploader_config: {
            swf: "/libs/webUploader/Uploader.swf",//swf文件
            server: emer.upload_cors
                ? emer.doc_host + "/Upload/UploadFile"
                : emer.url("/Sys_Upload/UploadFile"),   //上传（跨域或本地）
            method: "POST",                             //文件上传方式
            formData: {},                               //文件上传请求的参数表

            pick: {
                id: '#filePicker',
                innerHTML: '点击选择文件',
                multiple: true
            },                      //选择文件的按钮容器，不指定则不创建按钮,格式如 {id: '#filePicker',label: '点击选择图片',multiple:true}
            dnd: null,              //指定Drag And Drop拖拽的容器，如果不指定，则不启动。
            paste: null,            //此功能为通过粘贴来添加截屏的图片
            chunked: true,              //是否要分片处理大文件上传。
            chunkSize: 512 * 1024,      //512KB 如果要分片，分多大一片？ 默认大小为5M
            chunkRetry: 2,              //如果某个分片由于网络问题出错，允许自动重传多少次

            fileNumLimit: 300,          //验证文件总数量, 超出则不允许加入队列
            fileSizeLimit: 1 * 1024 * 1024 * 1024, //1G 验证文件总大小是否超出限制, 超出则不允许加入队列  默认1G
            fileSingleSizeLimit: 1 * 1024 * 1024 * 1024,  //验证单个文件大小是否超出限制, 超出则不允许加入队列,默认1G

            disableGlobalDnd: true,  //是否禁掉整个页面的拖拽功能，如果不禁用，图片拖进来的时候会默认被浏览器打开
            auto: false,             //不需要手动调用上传，有文件选择即开始上传。
            accept: null,            //指定接受哪些类型的文件,格式如:{title: 'Images',extensions: 'gif,jpg,jpeg,bmp,png',mimeTypes: 'image/*'}
            compress: false,         //配置压缩的图片的选项,格式如：{width: 1600,height: 1600,quality: 90,allowMagnify: false,crop: false,preserveHeaders: true,noCompressIfLarger: false,compressSize: 0}
            prepareNextFile: false,  //是否允许在文件传输时提前把下一个文件准备好。 对于一个文件的准备工作比较耗时，比如图片压缩，md5序列化。 如果能提前在当前文件传输期处理，可以节省总体耗时
            threads: 3,              //允许同时最大上传进程数
            fileVal: "file",         //设置文件上传域的name
            sendAsBinary: false,     //是否已二进制的流的方式发送文件
            duplicate: false         //去重， 根据文件名字、文件大小和最后修改时间来生成hash Key
        },

        controlId: '',
        windowField: '',
        endCallback: null
    };
})(jQuery);
