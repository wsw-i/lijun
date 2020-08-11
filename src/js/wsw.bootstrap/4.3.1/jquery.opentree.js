/*====================================
 * jquery.bootstrap.opentree
 * add by wangshw 2019-05-15
 *===================================*/
(function ($) {
    function init(target) {
        var opts = getOptions(target);
        opts.id = $(target).attr("id");
        if (!opts.id) opts.id = "opentree_" + Math.random();
        $(target).removeClass("bootstrap-opentree").addClass("bootstrap-opentree-parent");

        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-opentree" tabindex="-1" role="dialog" aria-hidden="true">');
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
        arr_htm.push('<nav aria-label="树状导航" class="sticky-top">');
        arr_htm.push('<ol class="breadcrumb">');
        arr_htm.push('<li class="breadcrumb-item"><a href="javascript:;">根节点</a></li>');
        arr_htm.push('</ol>');
        arr_htm.push('</nav>');//end breadcrumb
        arr_htm.push('<ul class="list-group list-group-flush">');
        arr_htm.push('<li class="list-group-item text-muted">没有符合的数据显示！</li>');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<span class="font-12 text-secondary">注：树状选择，直接点击将进入下一层节点选择</span>');
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

        opts.$breadcrumb = opts.$body.find('.breadcrumb');

        $modal.modal({
            backdrop: 'static',
            keyboard: true,
            focus: true,
            show: false
        });
        $modal.on('shown.bs.modal', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.isOpen = true;
            emer.loading('hide');
        });
        $modal.on('hidden.bs.modal', { target: target }, function (e) {
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
            page: opts.pageNumber,
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
                $(target).opentree("loadData", data);
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
        onLoadBreadcrumb(target);
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

        if (data.total == 0) {
            opts.$listGroup.empty().append('<li class="list-group-item text-muted">没有符合的数据显示！</li>');
            return;
        }
        var arr_htm = [];
        for (var i = 0; i < data.rows.length; i++) {
            var row = data.rows[i];
            arr_htm.push('<li class="list-group-item opentree-row">');
            arr_htm.push('<span class="rowindex guitea-hidden">' + i + '</span>');
            arr_htm.push('<div class="d-flex">');
            arr_htm.push('<div class="p-1 flex-grow-1">');
            arr_htm.push('<a class="btn btn-outline-primary btn-sm btn-block text-left btn-node" href="javascript:;">');
            arr_htm.push('<div class="d-flex justify-content-start">');
            if (row.state == 'closed') {
                arr_htm.push('<div class="align-self-center">');
                arr_htm.push('<i class="fa fa-plus-square-o"></i>&nbsp;');
                arr_htm.push('</div>');
            }
            arr_htm.push('<div>');
            for (var j = 0, len = opts.mobileColums.length; j < len; j++) {
                var mcol = opts.mobileColums[j];
                if (row[mcol.field])
                    arr_htm.push('<p class="guitea-mb-1">' + row[mcol.field] + '</p>');
            }
            arr_htm.push('</div>');

            arr_htm.push('</div>');
            arr_htm.push('</a>');
            arr_htm.push('</div>');
            if (!opts.onlyLeafCheck || (opts.onlyLeafCheck && row.state == 'open')) {
                arr_htm.push('<div class="opentree-checkbox p-2 align-self-center">');
                arr_htm.push('<div class="custom-control custom-checkbox">');
                arr_htm.push('<input type="checkbox" class="custom-control-input" value="" id="customCheck' + i + '">');
                arr_htm.push('<label class="custom-control-label" for="customCheck' + i + '"></label>');
                arr_htm.push('</div>');
                arr_htm.push('</div>');//end opentree-checkbox
            }
            arr_htm.push('</div>');//--d-flex
            arr_htm.push('</li>');
        }

        var $row = $(arr_htm.join(''));
        opts.$listGroup.empty().append($row);

        //注册rowclick事件
        opts.$listGroup.find(".btn-node").each(function (i) {
            var e_data = {
                target: target,
                rowTarget: getClosestTarget(this, 'li.opentree-row')
            };
            $(this).unbind().bind("click", e_data, function (e) {
                row_onClick(e.data.target, e.data.rowTarget);
            });
        });
        //注册checked事件
        opts.$listGroup.find("input[type='checkbox']").each(function (i) {
            var e_data = {
                target: target,
                rowTarget: getClosestTarget(this, 'li.opentree-row')
            };
            $(this).unbind().bind("change", e_data, function (e) {
                var checked = $(this).prop('checked');
                row_onSelect(e.data.target, e.data.rowTarget, checked);
            });
        });
    }
    function onLoadBreadcrumb(target) {
        var opts = getOptions(target);
        if (opts.parentid == '0') {
            opts.breadcrumb_data = [];
            opts.$breadcrumb.empty().append('<li class="breadcrumb-item"><a href="javascript:;" data-parentid="0">根节点</a></li>');
            breadcrumb_eventbind(target);
            return;
        }
        else {
            //del by wangshw for api加载效率太低
            //emer.guiteaApi({
            //    url: '/gcoa/sys/getOpenTreeParents',
            //    jparam: {
            //        code: opts.openView,
            //        parentid: opts.parentid + ''
            //    },
            //    apiSuccess: function (r) {
            //        var parents = r.data.parents;
            //        var arr_htm = [];
            //        arr_htm.push('<li class="breadcrumb-item"><a href="javascript:;" data-parentid="0">根节点</a></li>');
            //        for (var i = 0; i < parents.length; i++) {
            //            arr_htm.push('<li class="breadcrumb-item"><a href="javascript:;" data-parentid="' + parents[i].ID + '">' + parents[i].NAME + '</a></li>');
            //        }
            //        opts.$breadcrumb.empty().append(arr_htm.join(''));
            //        breadcrumb_eventbind(target);
            //    }
            //});

            var arr_htm = [];
            arr_htm.push('<li class="breadcrumb-item"><a href="javascript:;" data-parentid="0">根节点</a></li>');
            for (var i = 0; i < opts.breadcrumb_data.length; i++) {
                var row = opts.breadcrumb_data[i];
                arr_htm.push('<li class="breadcrumb-item"><a href="javascript:;" data-parentid="' + row.ID + '">' + row.NAME + '</a></li>');
            }
            opts.$breadcrumb.empty().append(arr_htm.join(''));
            breadcrumb_eventbind(target);
        }
    }
    function breadcrumb_eventbind(target) {
        var opts = getOptions(target);
        opts.$breadcrumb.find('a').unbind().bind('click', { target: target }, function (e) {
            opts.parentid = $(this).attr("data-parentid");
            var arr_find = $.grep(opts.breadcrumb_data, function (e) { return e.ID == opts.parentid; });
            if (arr_find) {
                var obj = arr_find[0];
                var index = $.inArray(obj, opts.breadcrumb_data);
                index++;
                opts.breadcrumb_data.splice(index, opts.breadcrumb_data.length - index);

                onLoadBreadcrumb(target);
                var where = "PARENTID='" + opts.parentid + "'";
                if (opts.parentid == '0') {
                    where = opts.winWhere ? opts.winWhere
                        : (" 1=1 and (" + where + " or PARENTID is null or PARENTID='')");
                }
                $(e.data.target).opentree('load', { where: where });
            }
        });
    }

    function row_onClick(target, rowTarget) {
        var opts = getOptions(target);
        var rowIndex = $(rowTarget).find(".rowindex").html();
        var row = getRow(target, rowIndex);
        if (row.state == 'closed') {
            opts.breadcrumb_data.push(row);
            opts.parentid = row.ID;
            var where = "PARENTID='" + opts.parentid + "'";
            $(target).opentree('load', { where: where });
            return;
        }
        //选中
        row_onSelect(target, rowTarget, true);
    }
    function row_onSelect(target, rowTarget, checked) {
        var opts = getOptions(target);
        if (opts.multiSelect == false) {
            $(target).find(".opentree-row").find(".btn-node").removeClass("active");
        }
        if (checked) {
            $(rowTarget).find(".btn-node").addClass('active');
        }
        else {
            $(rowTarget).find(".btn-node").removeClass("active");
        }
        if (opts.multiSelect == false) {
            ok_onClick(target);
        }
    }

    function getSelections(target) {
        var opts = getOptions(target);
        var selections = [];
        opts.$listGroup.find(".btn-node.active").each(function () {
            var rowTarget = getClosestTarget(this, 'li.opentree-row')
            var rowIndex = $(rowTarget).find(".rowindex").html();
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

    function clear_onClick(target) {
        var opts = getOptions(target);
        opts.$modal.modal('hide');
        clearValue(target);
    }
    function search_onClick(target) {
        var opts = getOptions(target);
        var where = getWhere(target);
        $(target).opentree("load", { where: where });
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
    function getWhere(target) {
        var opts = getOptions(target);
        var v_search = opts.$searchInput.val() || '';
        if (v_search) {
            var arr = [];
            for (var i = 0, len = opts.columns.length; i < len; i++) {
                arr.push(opts.columns[i].field + " like '(LIKE)" + v_search + "(LIKE)'");
            }
            var filter = '(' + arr.join(' or ') + ')';
            return opts.winWhere ? (opts.winWhere + ' and ' + filter) : filter;
        }
        return opts.winWhere;
    }
    function getRow(target, rowIndex) {
        var opts = getOptions(target);
        return opts.data.rows[rowIndex];
    }
    function getClosestTarget(elem_target, clsName) {
        var t = $(elem_target).closest(clsName || "div.bootstrap-opentree");
        if (t.length)
            return t[0];
        return undefined;
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
        return $.data(target, 'opentree').options;
    }
    $.fn.opentree = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.opentree.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'opentree');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, 'opentree', {
                    options: $.extend(true, {}, $.fn.opentree.defaults, options)
                });
                init(this);
            }
        });
    };
    $.fn.opentree.methods = {
        //获取 opentree options
        options: function (jq) {
            return getOptions(jq[0]);
        },
        //远程Url加载第一页数据
        load: function (jq, params) {
            return jq.each(function () {
                var opts = $(this).opentree("options");
                if (typeof params == "string") {
                    opts.url = params;
                    params = null;
                }
                onload(this, params);
            })
        },
        //远程Url加载当前页数据
        reload: function (jq, params) {
            return jq.each(function () {
                var opts = $(this).opentree("options");
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
        //清除opentree controlIds 中内容
        clearValue: function (jq) {
            return jq.each(function () {
                clearValue(this);
            });
        }
    };
    $.fn.opentree.defaults = {
        id: '',
        isOpen: false,//开窗是否已经打开
        title: '',//开窗标题
        iconCls: '',//开窗标题图标

        url: '/OpenWindow/TreeGridDataBind',
        method: 'post',
        openWinOptions: undefined,//开出视图配置

        openView: '',
        sqlFormat: '',
        controlIds: '',
        windowFields: '',
        winWhere: '',//开窗where条件
        winWhereCtrlIds: '',//开窗取条件控件 ID1,ID2

        onlyLeafCheck: false,
        multiSelect: false,//是否能多选
        joinAdd: false,//是否有追加按钮

        winType: 'grid',//开窗类型 grid
        isGridColumn: false,//是否grid列
        gridTargert: 'gridDetail',//grid上开窗列带值相关

        pageNumber: 1,//页数
        pageSize: 999,//每页显示数

        sortName: null,
        sortOrder: 'asc',

        columns: [],
        mobileColums: [],

        queryParams: {},
        data: null,
        breadcrumb_data: [],
        parentid: '0',

        hasClear: true,
        onBeforClearClick: function (opts) {
            return true;
        },
        onEndCallback: null,
        afterColseCallback: null
    };
})(jQuery);
