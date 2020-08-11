/*====================================
 * jquery.bootstrap.openlist
 * add by wangshw 2019-05-15
 *===================================*/
(function ($) {
    function init(target) {
        var opts = getOptions(target);
        opts.id = $(target).attr("id");
        if (!opts.id) opts.id = "openlist_" + Math.random();
        $(target).removeClass("bootstrap-openlist").addClass("bootstrap-openlist-parent");

        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-openlist" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-header">');
        var icon_htm = '<i class="' + (opts.iconCls || 'fa fa-list') + '"></i>&nbsp;';
        arr_htm.push('<h5 class="modal-title">' + icon_htm + opts.title + '</h5>');
        arr_htm.push('<ul class="nav nav-pills float-right">');
        if (opts.hasClear) {
            arr_htm.push('<li class="nav-item">');
            arr_htm.push('<a class="btn btn-link header-tools-btn btn-clear" href="javascript:;">');
            arr_htm.push('<i class="fa fa-trash-o"></i>');
            arr_htm.push('</a>');
            arr_htm.push('</li>');
        }
        arr_htm.push('<li class="nav-item">');
        arr_htm.push('<a class="btn btn-link header-tools-btn btn-close" href="javascript:;">');
        arr_htm.push('<i class="fa fa-remove"></i>');
        arr_htm.push('</a>');
        arr_htm.push('</li>');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end header

        arr_htm.push('<div class="modal-body">');
        arr_htm.push('<div class="bg-light sticky-top">');
        arr_htm.push('<div class="input-group search-bar">');
        arr_htm.push('<input type="text" class="form-control form-control-sm search-input" aria-label="查询条件" placeholder="查询条件">');
        arr_htm.push('<div class="input-group-append">');
        arr_htm.push('<a class="btn btn-outline-secondary btn-sm btn-search" href="javascript:;" role="button"><i class="fa fa-search"></i>&nbsp;查询</a>');
        arr_htm.push('<a class="btn btn-outline-secondary btn-sm btn-ok" href="javascript:;" role="button"><i class="fa fa-check-square-o"></i>&nbsp;确定</a>');
        arr_htm.push('</div>');
        arr_htm.push('</div>');//end input-group
        arr_htm.push('</div>');
        arr_htm.push('<ul class="list-group list-group-flush">');
        arr_htm.push('<li class="list-group-item text-muted">没有符合的数据显示！</li>');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<ul class="nav justify-content-center">');
        arr_htm.push('<li class="nav-item" style="margin-right:.5rem">');
        arr_htm.push('<a class="btn btn-outline-primary btn-sm disabled btn-pre-page" href="javascript:;" role="button">');
        arr_htm.push('<i class="fa fa-chevron-circle-left"></i>&nbsp;上页');
        arr_htm.push('</a>');
        arr_htm.push('</li>');
        arr_htm.push('<li class="nav-item" style="margin-right:.5rem">');
        arr_htm.push('<a href="javascript:;" class="btn btn-outline-primary btn-sm" role="button">');
        arr_htm.push('<span class="lbl-page-index">1</span>/');
        arr_htm.push('<span class="lbl-page-count" style="padding-right: 10px">0</span>[共');
        arr_htm.push('<span class="lbl-list-itemtotal">0</span>条]');
        arr_htm.push('</a>');
        arr_htm.push('</li>');
        arr_htm.push('<li class="nav-item">');
        arr_htm.push('<a class="btn btn-outline-primary btn-sm disabled btn-next-page" href="javascript:;" role="button">');
        arr_htm.push('下页&nbsp;<i class="fa fa-chevron-circle-right"></i>');
        arr_htm.push('</a>');
        arr_htm.push('</li>');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end footer

        arr_htm.push('</div>');//end content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal

        $modal = $(arr_htm.join(''));
        $(target).append($modal);

        opts.$modal = $modal;
        opts.$header = $modal.find(".modal-header");
        opts.$btnClear = opts.$header.find(".btn-clear");
        opts.$btnClose = opts.$header.find(".btn-close");

        opts.$body = $modal.find('.modal-body');
        opts.$searchBar = opts.$body.find(".search-bar");
        opts.$searchInput = opts.$searchBar.find(".search-input");
        opts.$btnSearch = opts.$searchBar.find(".btn-search");
        opts.$btnOk = opts.$searchBar.find(".btn-ok");
        opts.$listGroup = opts.$body.find('.list-group');

        opts.$footer = $modal.find('.modal-footer');
        opts.$btnPrePage = opts.$footer.find('.btn-pre-page');
        opts.$btnNextPage = opts.$footer.find('.btn-next-page');
        opts.$lblPageIndex = opts.$footer.find('.lbl-page-index');
        opts.$lblPageCountgeIndex = opts.$footer.find('.lbl-page-count');
        opts.$lblListItemTotal = opts.$footer.find('.lbl-list-itemtotal');

        opts.$modal.modal({
            backdrop: 'static',
            keyboard: true,
            focus: true,
            show: false
        });

        opts.$modal.on('shown.bs.modal', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.isOpen = true;
            emer.loading('hide');
        }).on('hidden.bs.modal', { target: target }, function (e) {
            $(e.data.target).remove();
        });

        if (opts.hasClear) {
            opts.$btnClear.unbind().bind('click', { target: target }, function (e) {
                var opts = getOptions(e.data.target);
                if (opts.onBeforClearClick.call(e.data.target, opts))
                    clear_onClick(e.data.target);
            });
        }
        opts.$btnClose.unbind().bind('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.$modal.modal('hide');
        });

        opts.$btnSearch.unbind().bind('click', { target: target }, function (e) {
            search_onClick(e.data.target);
        });
        opts.$btnOk.unbind().bind('click', { target: target }, function (e) {
            ok_onClick(e.data.target);
        });

        loadOpenWinOpts(target);
    }

    function loadOpenWinOpts(target) {
        var opts = getOptions(target);
        emer.guiteaApi({
            hideLoadingWhenOk: false,
            url: '/gcoa/sys/getOpenWinOpts',
            jparam: {
                code: opts.openView,
                db: emer.sarea
            },
            apiSuccess: function (r) {
                opts.openWinOptions = r.data.options;

                opts.columns = [];
                var arr_field = opts.openWinOptions.FFIELDS.split(','),
                    arr_title = opts.openWinOptions.FTITLES.split(',');
                for (var i = 0; i < arr_field.length ; i++) {
                    opts.columns.push({
                        title: arr_title[i],
                        field: arr_field[i]
                    });
                }

                var mFields = opts.openWinOptions.MFIELDS || opts.openWinOptions.FFIELDS;
                var arr_m_field = mFields.split(',');
                opts.mobileColums = [];
                for (var i = 0; i < arr_m_field.length ; i++) {
                    var m_field = arr_m_field[i];
                    var config = m_field.split('|');
                    opts.mobileColums.push({
                        field: config[0],
                        showTitle: config[1] == 'false' ? false : true
                    });
                }

                opts.sortName = opts.openWinOptions.SORTNAME || opts.columns[0].field || opts.sortName;
                opts.sortOrder = opts.openWinOptions.SORTORDER || opts.sortOrder;

                onload(target);
            }
        });
    }

    function onload(target, params) {
        var opts = getOptions(target);
        if (params) opts.queryParams = params;
        var queryParams = $.extend({}, {
            openView: opts.openView,
            sqlFormat: opts.sqlFormat,
            where: opts.winWhere,
            page: opts.pageNumber || 1,
            rows: opts.pageSize
        });
        if (opts.sortName) {
            $.extend(queryParams, { sort: opts.sortName, order: opts.sortOrder });
        }
        $.extend(queryParams, opts.queryParams);

        emer.loading('show');
        $.ajax({
            type: opts.method,
            url: opts.url,
            data: queryParams,
            dataType: "json",
            success: function (data) {
                $(target).openlist("loadData", data);
                if (!opts.isOpen) opts.$modal.modal('show');
                else emer.loading('hide');
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
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
        });
    }
    function onLoadData(target, data) {
        var opts = getOptions(target);
        if ($.isArray(data)) {
            data = {
                total: data.length,
                rows: data
            };
        }
        data.total = parseInt(data.total);
        opts.data = data;
        pagerRefresh(target);

        if (data.total == 0) {
            opts.$listGroup.empty().append('<li class="list-group-item text-muted">没有符合的数据显示！</li>');
            return;
        }
        var arr_htm = [];
        for (var i = 0; i < data.rows.length; i++) {
            var row = data.rows[i];
            arr_htm.push('<a href="javascript:;" class="list-group-item list-group-item-action openlist-row">');
            arr_htm.push('<span class="rowindex guitea-hidden">' + i + '</span>');

            for (var j = 0, len = opts.mobileColums.length; j < len; j++) {
                var mcol = opts.mobileColums[j];
                var v = row[mcol.field], txt = v;
                if (v) {
                    var arr_find = $.grep(opts.columns, function (e) { return e.field == mcol.field; });
                    var col = arr_find.length ? arr_find[0] : null;
                    if (col) {
                        txt = mcol.showTitle ? col.title + "：" + v : v;
                    }
                    arr_htm.push('<p class="guitea-mb-1">' + txt + '</p>');
                }
            }

            arr_htm.push('</a>');
        }

        var $row = $(arr_htm.join(''));
        opts.$listGroup.empty().append($row);

        //注册rowclick事件
        opts.$listGroup.find(".openlist-row").each(function (i) {
            var e_data = {
                target: target,
                rowTarget: this
            };
            $(this).unbind().bind("click", e_data, function (e) {
                row_onClick(e.data.target, e.data.rowTarget);
            });
        });
    }

    function row_onClick(target, rowTarget) {
        var opts = getOptions(target);
        if (opts.multiSelect == false) {
            $(target).find(".openlist-row").removeClass("active");
        }
        $(rowTarget).addClass('active');
        if (opts.multiSelect == false) {
            ok_onClick(target);
        }
    }

    function getSelections(target) {
        var opts = getOptions(target);
        var selections = [];
        opts.$listGroup.find(".openlist-row.active").each(function () {
            var rowIndex = $(this).find(".rowindex").html();
            var row = getRow(target, rowIndex);
            selections.push(row);
        });
        return selections;
    }
    function getSelected(target) {
        var selections = getSelections(target);
        if (selections.length) return selections[0];
        return null;
    }

    function pagerRefresh(target) {
        var opts = getOptions(target);
        var pageNumber = opts.pageNumber,
            pageSize = opts.pageSize,
            total = opts.data.total,
            pageCount = Math.ceil(total / pageSize);
        opts.pageCount = pageCount;
        opts.$lblPageIndex.html(pageNumber);
        if (pageNumber > 1) {
            opts.$btnPrePage.removeClass('disabled').unbind().bind('click', { target: target }, function (e) {
                prePage_onClick(e.data.target);
            });
        }
        else {
            opts.$btnPrePage.removeClass('disabled').addClass('disabled').unbind();
        }

        opts.$lblPageCountgeIndex.html(pageCount);
        if (pageCount > 1 && pageNumber < pageCount) {
            opts.$btnNextPage.removeClass('disabled').unbind().bind('click', { target: target }, function (e) {
                nextPage_onClick(e.data.target);
            });
        }
        else {
            opts.$btnNextPage.removeClass('disabled').addClass('disabled').unbind();
        }
        opts.$lblListItemTotal.html(total);
    }
    function prePage_onClick(target) {
        var opts = getOptions(target);
        opts.pageNumber--;
        if (opts.pageNumber <= 0)
            opts.pageNumber = 1;
        $(target).openlist("reload");
    }
    function nextPage_onClick(target) {
        var opts = getOptions(target);
        opts.pageNumber++;
        if (opts.pageNumber > opts.pageCount)
            opts.pageNumber = opts.pageCount;
        $(target).openlist("reload");
    }

    function clear_onClick(target) {
        var opts = getOptions(target);
        opts.$modal.modal('hide');
        clearValue(target);
    }
    function search_onClick(target) {
        var opts = getOptions(target);
        var where = getWhere(target);
        $(target).openlist("load", { where: where });
    }
    function ok_onClick(target) {
        var opts = getOptions(target);
        var selections = getSelections(target);
        if (selections.length == 0) {
            emer.alert('请选择数据！'); return;
        }
        if (opts.onEndCallback) {
            if (typeof opts.onEndCallback == 'string') {
                eval(opts.onEndCallback + "(selections);");
            }
            else if (typeof opts.onEndCallback == 'function') {
                opts.onEndCallback(selections);
            }
        }
        else if (opts.controlIds) {
            var row = selections[0];
            var arr_ids = opts.controlIds.split(',');
            var arr_fields = opts.windowFields.split(',');
            for (var i = 0; i < arr_ids.length; i++) {
                var ctrlid = arr_ids[i].split('.');
                if (ctrlid.length > 1 && ctrlid[1] == 'text') {
                    setText(target, ctrlid[0], row[arr_fields[i]]);
                }
                else {
                    setValue(target, ctrlid[0], row[arr_fields[i]]);
                }
            }
        }
        opts.$modal.modal('hide');

        //afterColseCallback
        if (opts.afterColseCallback) {
            if (typeof opts.afterColseCallback == 'string') {
                eval(opts.afterColseCallback + "(selections);");
            }
            else if (typeof opts.afterColseCallback == 'function') {
                opts.afterColseCallback(selections);
            }
        }
    }

    function clearValue(target) {
        var opts = getOptions(target);
        if (opts.controlIds) {
            var arr_ids = opts.controlIds.split(',');
            for (var i = 0; i < arr_ids.length; i++) {
                var ctrlid = arr_ids[i].split('.');
                if (ctrlid.length > 1 && ctrlid[1] == 'text') {
                    setText(target, ctrlid[0], '');
                }
                else {
                    setValue(target, ctrlid[0], '');
                }
            }
        }
    }

    function getRow(target, rowIndex) {
        var opts = getOptions(target);
        return opts.data.rows[rowIndex];
    }
    function getWhere(target) {
        var opts = getOptions(target);
        var v_search = opts.$searchInput.val() || '';
        if (v_search) {
            var arr = [];
            //注：sqlserver端采用存数过程进行分页查询，为防止 查询条件超字数 设置查询列数上限
            var max = 5;
            for (var i = 0, len = opts.columns.length; i < len; i++) {
                if (i < max)
                    arr.push(opts.columns[i].field + " like '(LIKE)" + v_search + "(LIKE)'");
            }
            var filter = '(' + arr.join(' or ') + ')';
            return opts.winWhere ? (opts.winWhere + ' and ' + filter) : filter;
        }
        return opts.winWhere;
    }

    function setText(target, s, text) {
        var opts = getOptions(target);
        text = emer.isNullOrEmpty(text) ? '' : text;
        if (opts.isGridColumn) {
            var grid = $("#" + opts.gridTargert);
            if (opts.gridTargert == "gridDetail") {
                //单身明细1开窗
                var ed = grid.datagrid('getEditor', { index: bod.editIndex, field: s });
                ed.actions.setText(ed.target, text);
                return;
            }
            else if (opts.gridTargert.toLowerCase().indexOf('_celledit') > 0) {
                var ed = grid.datagrid('getEditor', grid.datagrid('cell'));
                ed.actions.setText(ed.target, text);
                return;
            }
        }
        app.setText($("#" + s), text);
    }
    function setValue(target, s, v) {
        var opts = getOptions(target);
        v = emer.isNullOrEmpty(v) ? '' : v;
        if (opts.isGridColumn) {
            var grid = $("#" + opts.gridTargert);
            if (opts.gridTargert == "gridDetail") {
                //单身明细1开窗
                var ed = grid.datagrid('getEditor', { index: bod.editIndex, field: s });
                if (ed.actions.setValue) ed.actions.setValue(ed.target, v);
                return;
            }
            else if (opts.gridTargert.toLowerCase().indexOf('_celledit') > 0) {
                var ed = grid.datagrid('getEditor', grid.datagrid('cell'));
                if (ed.actions.setValue) ed.actions.setValue(ed.target, v);
                return;
            }
        }
        app.setValue($("#" + s), v);
    }

    function getOptions(target) {
        return $.data(target, 'openlist').options;
    }
    $.fn.openlist = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.openlist.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'openlist');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, 'openlist', {
                    options: $.extend(true, {}, $.fn.openlist.defaults, options)
                });
                init(this);
            }
        });
    };
    $.fn.openlist.methods = {
        //获取 openlist options
        options: function (jq) {
            return getOptions(jq[0]);
        },
        //远程Url加载第一页数据
        load: function (jq, params) {
            return jq.each(function () {
                var opts = $(this).openlist("options");
                if (typeof params == "string") {
                    opts.url = params;
                    params = null;
                }
                opts.pageNumber = 1;
                onload(this, params);
            })
        },
        //远程Url加载当前页数据
        reload: function (jq, params) {
            return jq.each(function () {
                var opts = $(this).openlist("options");
                if (typeof params == "string") {
                    opts.url = params;
                    params = null;
                }
                onload(this, params);
            });
        },
        //将data数据加载到页面
        loadData: function (jq, data) {
            return jq.each(function () {
                onLoadData(this, data);
            });
        },
        //返回第一个被选中的行或如果没有选中的行则返回null。
        getSelected: function (jq) {
            return jq.each(function () {
                getSelected(this);
            });
        },
        //返回所有被选中的行，当没有记录被选中的时候将返回一个空数组。
        getSelections: function (jq) {
            return jq.each(function () {
                getSelections(this);
            });
        },
        //清除openlist controlIds 中内容
        clearValue: function (jq) {
            return jq.each(function () {
                clearValue(this);
            });
        }
    };
    $.fn.openlist.defaults = {
        id: '',
        isOpen: false,//开窗是否已经打开

        title: '',//开窗标题
        iconCls: '',//开窗标题图标

        url: '/OpenWindow/GridDataBind',
        method: 'post',
        openWinOptions: undefined,//开出视图配置

        openView: '',
        sqlFormat: '',
        controlIds: '',
        windowFields: '',
        winWhere: '',//开窗where条件
        winWhereCtrlIds: '',//开窗取条件控件 ID1,ID2
        multiSelect: false,//是否能多选
        joinAdd: false,//是否有追加按钮

        winType: 'grid',//开窗类型 grid
        isGridColumn: false,//是否grid列
        gridTargert: 'gridDetail',//grid上开窗列带值相关

        pageNumber: 1,//页数
        pageSize: 10,//每页显示数
        pageCount: 0,//总页数

        sortName: null,
        sortOrder: 'asc',

        columns: [],
        mobileColums: [],

        queryParams: {},
        data: null,

        hasClear: true,
        onBeforClearClick: function (opts) {
            return true;
        },
        onEndCallback: null,
        afterColseCallback: null
    };
})(jQuery);
