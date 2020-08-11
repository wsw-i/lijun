/*===================================
 * jquery.bootstrap.attachment
 * add by wangshw 2019-05-29
 * 附件上传控件
 *===================================*/
(function ($) {
    function init(target) {
        var opts = getOptions(target);
        opts.id = $(target).attr("id");
        if (!opts.id) opts.id = "attachment_" + Math.random();
        $(target).removeClass("bootstrap-attachment").addClass("bootstrap-attachment");

        var arr_htm = [];
        arr_htm.push('<figure class="figure text-center figure-btn-add">');
        arr_htm.push('<a class="btn btn-light align-middle active btn-add" href="javascript:;" role="button">');
        arr_htm.push('<img src="/Scripts/UploadPage/image/image.png" class="figure-img img-fluid rounded" alt="点击添加">');
        arr_htm.push('</a>');
        arr_htm.push('<figcaption class="figure-caption text-center">点击添加</figcaption>');
        arr_htm.push('</figure>');
        var $figureBtnAdd = $(arr_htm.join(''));
        opts.$figureBtnAdd = $figureBtnAdd;

        arr_htm = [];
        arr_htm.push('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-header">');
        arr_htm.push('<h5 class="modal-title"><i class="fa fa-paperclip"></i>&nbsp;附件</h5>');
        arr_htm.push('<ul class="nav nav-pills float-right">');
        arr_htm.push('<li class="nav-item">');
        arr_htm.push('<a class="btn btn-link header-tools-btn btn-close" href="javascript:;">');
        arr_htm.push('<i class="fa fa-remove"></i>');
        arr_htm.push('</a>');
        arr_htm.push('</li>');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end header

        arr_htm.push('<div class="modal-body">');
        arr_htm.push('</div>');//end body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<a class="btn btn-primary btn-sm btn-add" href="javascript:;" role="button"><i class="fa fa-plus-circle"></i>&nbsp;添加附件</a>');
        arr_htm.push('<a class="btn btn-primary btn-sm btn-downloadAll" href="javascript:;" role="button"><i class="fa fa-download"></i>&nbsp;打包下载</a>');
        arr_htm.push('<a class="btn btn-secondary btn-sm btn-close" href="javascript:;" role="button"><i class="fa fa-remove"></i>&nbsp;关闭</a>');
        arr_htm.push('</div>');//end footer

        arr_htm.push('</div>');//end content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal

        var $modal = $(arr_htm.join(''));
        var $valueInput = $('<input class="attachment-value" type="hidden" value=""/>');

        opts.$valueInput = $valueInput;
        opts.$modal = $modal;
        opts.$header = $modal.find(".modal-header");

        opts.$body = $modal.find('.modal-body');
        opts.$footer = $modal.find('.modal-footer');

        opts.$body.empty().append(opts.$figureBtnAdd);

        opts.$btnClose = opts.$modal.find(".btn-close");
        opts.$btnAdd = opts.$modal.find(".btn-add");
        opts.$btnDownloadAll = opts.$modal.find(".btn-downloadAll");

        $modal.modal({
            backdrop: 'static',
            keyboard: true,
            focus: true,
            show: false
        });
        $modal.on('shown.bs.modal', function (e) {
            emer.loading('hide');
        });

        opts.$btnClose.unbind().bind('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.$modal.modal('hide');
        });
        opts.$btnAdd.bind('click', { target: target }, function (e) {
            add_onClick(e.data.target);
        });
        opts.$btnDownloadAll.bind('click', { target: target }, function (e) {
            downloadAll_onClick(e.data.target);
        });

        $(target).append($modal);
        $(target).append($valueInput);
    }

    function readonly(target, mode) {
        var opts = getOptions(target);
        opts.readonly = mode == undefined ? true : mode;
        if (mode) {
            opts.$figureBtnAdd.hide();
            opts.$btnAdd.hide();
        }
        else {
            opts.$btnAdd.show();
            opts.$figureBtnAdd.show();
        }
    }
    function setValue(target, newValue) {
        var opts = getOptions(target);
        var oldValue = opts.$valueInput.val();
        onChange_call(target, newValue, oldValue);
    }
    function setIncrementValue(target, value) {
        var opts = getOptions(target);
        if (emer.isNullOrEmpty(value)) return;
        var oldValue = opts.value;
        var newValue = emer.isNullOrEmpty(oldValue) ? value : oldValue + ',' + value;
        setValue(target, newValue);
        loadAttachment(target);
    }

    function loadAttachment(target, callback) {
        var opts = getOptions(target);
        opts.files = [];
        if (opts.value) {
            emer.loading('show');
            emer.ajax({
                url: emer.url(opts.fileUrl),
                data: {
                    ids: opts.value
                },
                emerSuccess: function (r) {
                    loadFiles(target, r.data);
                    if (typeof callback == 'function') callback(target);
                }
            });
        }
        else {
            if (typeof callback == 'function') callback(target);
        }
    }
    function loadFiles(target, files) {
        var opts = getOptions(target);
        if (files) opts.files = files;

        var arr_htm = [];
        for (var i = 0, len = opts.files.length; i < len; i++) {
            var file = opts.files[i],
                thumbnailUrl = file.FTHUMBNAIL,
                img_fixheight = "";
            if (emer.isNullOrEmpty(thumbnailUrl)) {
                thumbnailUrl = getThumbnailUrl(file.F_FILENAME);
            }
            if (thumbnailUrl.indexOf('/Scripts/UploadPage/thumbnail/') < 0) {
                //图片缩略图
                if (file.FWEBHOST) {
                    //跨域文件服务器
                    thumbnailUrl = file.FWEBHOST + '/' + file.FWEBSRC + thumbnailUrl;
                }
            }
            else {
                img_fixheight = "img-fixheight";
            }

            arr_htm.push('<figure class="figure text-center figure-fileitem">');
            arr_htm.push('<span class="file-id" style="display:none;">' + file.ID + '</span>');
            arr_htm.push('<a class="btn btn-light active align-middle" href="javascript:;" role="button">');
            arr_htm.push('<img src="' + thumbnailUrl + '" class="figure-img img-fluid rounded ' + img_fixheight + '" alt="' + file.F_FILENAME + '" title="' + file.F_FILENAME + '">');
            arr_htm.push('</a>');
            arr_htm.push('<figcaption class="figure-caption text-center">' + file.F_FILENAME + '</figcaption>');
            arr_htm.push('</figure>');
        }
        if (opts.$fileitem) opts.$fileitem.remove();
        opts.$body.prepend(arr_htm.join(''));
        opts.$fileitem = opts.$body.find(".figure-fileitem");
        setImgSize(target);

        opts.$fileitem.on('click', { target: target }, function (e) {
            fileitem_onClick(e.data.target, $(this));
        });
    }
    function setImgSize(target) {
        var opts = getOptions(target);
        var w = $(window).width() > 480 ? 480 : $(window).width();
        var h = (w / 3 - 6) * .75;
        opts.$fileitem.find("a").css("height", h + 2);
        opts.$fileitem.find("img").css({ "min-height": h });
        opts.$body.find(".img-fixheight").css("height", h);
    }

    function show(target) {
        //加载文件信息
        loadAttachment(target, function (target) {
            var opts = getOptions(target);
            opts.$modal.modal('show');
        });
    }
    function hide(target) {
        var opts = getOptions(target);
        opts.$modal.modal('hide');
    }

    /*
     * event
     *================*/
    function onChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        if (oldValue != newValue) {
            opts.value = newValue;
            opts.$valueInput.val(newValue);
            opts.onChange.call(target, newValue, oldValue);
        }
    }
    function add_onClick(target) {
        var opts = getOptions(target);
        if ($(".bootstrap-upload").length == 0) {
            var $upload = $('<div></div>').appendTo($(target));
            opts.$upload = $upload;
            $upload.upload({
                title: '附件上传',
                iconCls: 'fa fa-paperclip',
                uploader_config: {
                    fileNumLimit: opts.max - opts.files.length,
                    formData: {
                        floderCode: 'attachment',
                        floderName: '附件',
                        mId: opts.moduleInfo.id,
                        masterTable: opts.moduleInfo.masterTable,
                        masterKey: opts.masterKey
                    }
                },
                controlId: opts.id,
                windowField: 'ID',
            });
        }
        var up_opts = opts.$upload.upload('options');

        opts.$upload.upload('show');
    }
    function fileitem_onClick(target, $fileitem) {
        var opts = getOptions(target);
        var fileid = $fileitem.find('.file-id').html();
        var file = getFile(target, fileid);
        var eventData = {
            target: target,
            $fileitem: $fileitem,
            file: file
        };
        var tools = [];
        if (opts.readonly == false) {
            tools.push({
                text: '删除',
                iconCls: 'fa fa-minus-circle',
                btnCls: '',
                handler: function (e) {
                    $.messager.confirm('提示', '是否确定删除该附件？', function (yes) {
                        if (yes) {
                            del_onClick(e.data.eventData);
                        }
                    });
                }
            });
        }
        tools.push({
            text: '下载',
            iconCls: 'fa fa-download',
            btnCls: '',
            handler: function (e) {
                download_onClick(e.data.eventData);
            }
        });
        if (file) {
            var path = getFilePath(file);
            if (emer.isImg(path)) {
                tools.push({
                    text: '预览',
                    iconCls: 'fa fa-eye',
                    btnCls: '',
                    handler: function (e) {
                        var path = getFilePath(e.data.eventData.file);
                        emer.imgView(path);
                    }
                });
            }
        }
        emer.operate({
            tools: tools,
            eventData: eventData
        });
    }
    function del_onClick(e) {
        var target = e.target, file = e.file;
        var opts = getOptions(target);
        if (!file) {
            $.messager.alert('提示', '删除的文件不存在！'); return;
        }
        if (file.FWEBHOST) {
            //文档在文档服务器上（ajax跨域处理）
            //数据库删除文件记录信息，服务器删除文件
            emer.loading('show', '删除中...');
            emer.ajax({
                type: "get",
                dataType: "jsonp",
                url: emer.doc_host + '/Upload/DelAttachment',
                data: {
                    id: file.ID,
                    websrc: emer.websrc
                },
                emerSuccess: function (r) {
                    emer.loading('hide');
                    $.messager.alert('提示', r.errmsg, "info", function () { endDel(e); });
                }
            });
        }
        else {
            //文档在本地服务器上，数据库删除文件记录信息，服务器删除文件
            emer.loading('show', '删除中...');
            emer.ajax({
                url: emer.url('/Sys_Upload/DelAttachment'),
                data: { id: file.ID, },
                emerSuccess: function (r) {
                    emer.loading('hide');
                    $.messager.alert('提示', r.errmsg, "info", function () { endDel(e); });
                }
            });
        }
    }
    function endDel(e) {
        var target = e.target;
        var opts = getOptions(target);
        var fileid = e.file.ID + '';

        //opts.files.splice($.inArray(file, opts.files), 1);
        opts.files = $.grep(opts.files, function (item, i) {
            return item.ID != fileid;
        });
        var arr_v = opts.value.split(",");
        arr_v.splice($.inArray(fileid, arr_v), 1);

        setValue(target, arr_v.join(","));
        e.$fileitem.remove();
    }
    function download_onClick(e) {
        //var opts = getOptions(target);
        var file = e.file;
        if (file) {
            var path = getFilePath(file);
            emer.downLoad(path);
            return;
        }
        $.messager.alert('提示', '下载的文件不存在！'); return;
    }
    function downloadAll_onClick(target) {
        var opts = getOptions(target);
        if (emer.isNullOrEmpty(opts.value)) {
            $.messager.alert("提示", "没有附件需要下载!"); return;
        }
        var m = opts.moduleInfo;
        $.messager.progress({
            title: '打包下载等待',
            msg: '打包下载中...'
        });
        if (emer.upload_cors) {
            //跨域ajax处理
            emer.ajax({
                type: "get",
                dataType: "jsonp",
                url: emer.doc_host + '/Upload/AttachmentAllDown',
                data: {
                    mId: m.id,
                    mName: m.name,
                    masterTable: m.masterTable,
                    masterKey: opts.masterKey,
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
        else {
            emer.ajax({
                url: emer.url('/Sys_Upload/AttachmentAllDown'),
                data: {
                    mId: m.id,
                    masterTable: m.masterTable,
                    masterKey: opts.masterKey
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
    }

    function getThumbnailUrl(fileName) {
        var url = "/Scripts/UploadPage/thumbnail/",
            suffix = fileName.substring(fileName.lastIndexOf("."), fileName.length);
        switch (suffix.toLowerCase()) {
            case ".doc":
            case ".docx":
            case ".dot": return url + "docx_thum.png";
            case ".xls":
            case ".xlsx": return url + "xlsx_thum.png";
            case ".ppt":
            case ".pptx": return url + "pptx_thum.png";
            case ".txt": return url + "txt_thum.png";
            case ".pdf": return url + "pdf_thum.png";
            case ".rar":
            case ".7z":
            case ".zip": return url + "zip_thum.png";
            default: return url + 'unknow_thum.png';
        }
    }
    function getFilePath(file) {
        var path = file.F_FILEPATH;
        if (path.indexOf('/UploadFiles') < 0) {
            path = '/UploadFiles/Attachment/' + path;
        }
        //跨域文件服务器路径处理
        if (file.FWEBHOST) {
            path = file.FWEBHOST + '/' + file.FWEBSRC + path;
        }
        return path;
    }
    function getFile(target, fileid) {
        var opts = getOptions(target);
        var arr_filter = opts.files.filter(function (file) {
            return file.ID == fileid
        });
        if (arr_filter.length) return arr_filter[0];
        return null;
    }

    function getOptions(target) {
        return $.data(target, 'attachment').options;
    }
    $.fn.attachment = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.attachment.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'attachment');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, 'attachment', {
                    options: $.extend(true, {}, $.fn.attachment.defaults, options)
                });
                init(this);
            }
        });
    };
    $.fn.attachment.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        setValue: function (jq, newValue) {
            newValue = newValue || '';
            return jq.each(function () {
                setValue(this, newValue);
            });
        },
        setIncrementValue: function (jq, value) {
            return jq.each(function () {
                setIncrementValue(this, value);
            });
        },
        readonly: function (jq, mode) {
            return jq.each(function () {
                readonly(this, mode);
            });
        },
        show: function (jq) {
            show(jq[0]);
        },
        hide: function (jq) {
            hide(jq[0]);
        },
        loadFiles: function (jq, files) {
            loadFiles(jq[0], files);
        }
    };
    $.fn.attachment.defaults = {
        id: '',

        $valueInput: null,
        $modal: null,

        value: '',
        files: [],
        readonly: false,

        min: 0,//最小附件数
        max: 50,//最大附件数

        moduleInfo: null,//附件所属模块
        masterKey: null,//单据ID

        fileUrl: '/OpenWindow/GetUploadFile',

        onChange: function (newValue, oldValue) {
        }
    };
})(jQuery);