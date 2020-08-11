/*=========================================================================================================
 * jquery.bootstrap.datagrid
 * add by wangshw 2019-04-22
 * modi by wangshw 2019-06-14 add editor & code optimize
 * modi by wangshw 2020-04-03 for fix grid多次init时因url有值造成数据多次加载，且其他地方若调用了onload 会造成多个回调返回数据顺序的不确定
 *      修改为只在第一次init时执行onload，其他时候加载数据请手动调用onload
 *=========================================================================================================*/
(function ($) {
    function _getRowIndex(rows, row) {
        return emer.indexOfArray(rows, row);
    }
    function _removeRow(rows, o, id) {
        return emer.removeArrayItem(rows, o, id);
    }
    //function _addRow(rows, o, r) {
    //    return emer.addArrayItem(rows, o, r);
    //}

    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "datagrid_" + Math.random();
            $(target).removeClass("bootstrap-datagrid").addClass("bootstrap-datagrid");

            opts.canRowClick = opts.onClickRow && typeof opts.onClickRow == 'function';
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="card">');
        if (opts.showHeader) {
            //datagrid-header
            arr_htm.push('<div class="card-header datagrid-header">');
            if (opts.iconCls) {
                arr_htm.push('<i class="' + opts.iconCls + '"></i>&nbsp;');
            }
            arr_htm.push(opts.title || '');
            arr_htm.push('</div>');
        }
        //datagrid-body
        arr_htm.push('<div class="datagrid-body">');
        arr_htm.push('<ul class="list-group list-group-flush"><li class="list-group-item text-muted">没有符合的数据显示！</li></ul>');
        arr_htm.push('</div>');

        if (opts.pagination) {
            //datagrid-pagination
            var fix_cls = opts.pagePosition ? 'fixed-' + opts.pagePosition : '';
            arr_htm.push('<div class="card-footer bg-light ' + fix_cls + '">');
            arr_htm.push('<ul class="nav justify-content-center datagrid-pagination">');

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
            arr_htm.push('</div>');
        }
        arr_htm.push('</div>');//end card datagrid-view
        $(target).append(arr_htm.join(''));

        opts.$card = $(target).find('.card');
        opts.$header = opts.$card.find('.card-header');
        opts.$body = opts.$card.find('.datagrid-body');
        opts.$listGroup = opts.$body.find('.list-group');
        opts.$footer = opts.$card.find('.card-footer');

        opts.$pagination = opts.$footer.find(".datagrid-pagination");
        opts.$btnPrePage = opts.$pagination.find('.btn-pre-page');
        opts.$btnNextPage = opts.$pagination.find('.btn-next-page');
        opts.$lblPageIndex = opts.$pagination.find('.lbl-page-index');
        opts.$lblPageCountgeIndex = opts.$pagination.find('.lbl-page-count');
        opts.$lblListItemTotal = opts.$pagination.find('.lbl-list-itemtotal');

        setHeight(target, opts.height);
        tool_init(target);
        if (opts.initCount == 1) {
            onload(target);
        }
    }
    function tool_init(target) {
        var opts = getOptions(target);
        if (opts.tools.length) {
            //tool = {
            //    id: '',
            //    title: '',
            //    iconCls: '',
            //    btnCls: '',
            //    handler: function () { }
            //};
            var arr_htm = [];
            arr_htm.push('<ul class="nav nav-pills float-right">');
            for (var i = 0; i < opts.tools.length; i++) {
                var item = opts.tools[i];
                arr_htm.push('<li class="nav-item">');
                var id_htm = item.id ? 'id="' + item.id + '" ' : '';
                arr_htm.push('<a ' + id_htm + 'class="btn btn-outline-primary header-tools-btn" href="javascript:;">');
                var title = item.title ? '&nbsp;' + item.title : '';
                arr_htm.push('<i class="' + item.iconCls + '"></i>' + title);
                arr_htm.push('</a>');
                arr_htm.push('</li>');
            }
            arr_htm.push('</ul>');
            var $nav = $(arr_htm.join('')).appendTo(opts.$header);

            //注册事件
            $nav.find(".header-tools-btn").each(function (i) {
                var _handler = opts.tools[i].handler;
                if (_handler) {
                    $(this).unbind().bind('click', { target: target }, function (e) {
                        _handler.call(this, e);
                    });
                }
            });
        }
    }

    function setHeight(target, height) {
        if (height == 'auto') return;
        var opts = getOptions(target);
        opts.height = height;
        var h_body = height;
        if (opts.showHeader) {
            h_body -= opts.$header.outerHeight();
        }
        if (opts.pagination) {
            h_body -= opts.$footer.outerHeight();
        }
        opts.$body.css("height", h_body + "px");
    }

    function onload(target, params) {
        var opts = getOptions(target);
        if (!opts.url) return;

        var queryParams = opts.queryParams;
        if (params) $.extend(queryParams, params);
        if (opts.pagination) {
            $.extend(queryParams, { page: opts.pageNumber || 1, rows: opts.pageSize });
        }
        if (opts.sortName) {
            $.extend(queryParams, { sort: opts.sortName, order: opts.sortOrder });
        }
        if (opts.onBeforeLoad.call(target, queryParams) == false) {
            return;
        }

        if (opts.showLoading) {
            opts.$listGroup.empty().append('<li class="list-group-item text-muted"><i class="fa fa-spinner fa-pulse"></i>&nbsp;加载中...</li>');
        }
        if (opts.guiteaApi) {
            emer.guiteaApi({
                url: opts.url,
                jparam: queryParams,
                apiSuccess: function (r) {
                    $(target).datagrid("loadData", r.data);
                }
            });
            return;
        }
        if (opts.showLoading) {
            emer.loading('show');
        }
        $.ajax({
            type: opts.method,
            url: opts.url,
            data: queryParams,
            dataType: "json",
            timeout: 30000,//初始超时时间30s
            success: function (data) {
                emer.loading('hide');
                $(target).datagrid("loadData", data);
                opts.onLoadSuccess.call(target, data);
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

        onListGroupRender(target);

        if (opts.$listGroup.height() >= opts.$body.height()) {
            opts.$listGroup.removeClass("border-bottom");
        }
        else {
            opts.$listGroup.addClass("border-bottom");
        }
    }

    function onListGroupRender(target) {
        var opts = getOptions(target);
        var data = opts.data;

        pagerRefresh(target);

        if (data.total == 0) {
            opts.$listGroup.empty().append('<li class="list-group-item text-muted">没有符合的数据显示！</li>');
            return;
        }
        var arr_htm = [];
        for (var i = 0; i < data.rows.length; i++) {
            arr_htm.push(onRowRender(target, data.rows[i], i));
        }
        var $row = $(arr_htm.join(''));
        opts.$listGroup.empty().append($row);

        onRowsEventBind(target);
    }
    function onRowRender(target, row, index) {
        var opts = getOptions(target);
        var arr_htm = [];
        var rowid = 'id="' + getRowId(opts, index) + '"';
        if (opts.canRowClick) {
            arr_htm.push('<a ' + rowid + ' href="javascript:;" class="list-group-item list-group-item-action datagrid-row" datagrid-row-index="' + index + '">');
        }
        else {
            arr_htm.push('<li ' + rowid + ' class="list-group-item datagrid-row"  datagrid-row-index="' + index + '">');
        }
        var row_htm = opts.onBeforeRowRender(row, opts.columns);
        if (row_htm) arr_htm.push(row_htm);
        arr_htm.push(opts.canRowClick ? '</a>' : '</li>');
        return arr_htm.join('');
    }
    function onRowsEventBind(target) {
        var opts = getOptions(target);
        if (opts.canRowClick) {
            //注册rowclick事件
            opts.$listGroup.find(".datagrid-row").each(function () {
                rowClickEventBind(target, this);
            });
        }
    }
    function onRowEventBind(target, rowTarget) {
        var opts = getOptions(target);
        if (opts.canRowClick) {
            rowClickEventBind(target, rowTarget);
        }
    }
    //注册rowclick事件
    function rowClickEventBind(target, rowTarget) {
        var e_data = {
            target: target,
            rowTarget: rowTarget
        };
        $(rowTarget).off().on("click", e_data, function (e) {
            var t_row = e.data.rowTarget;
            var rowIndex = $(t_row).attr("datagrid-row-index");
            row_onClick(e.data.target, t_row, parseInt(rowIndex));
        });
    }

    function pagerRefresh(target) {
        var opts = getOptions(target);
        if (!opts.pagination) return;

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
            opts.$btnPrePage.removeClass('disabled').addClass('disabled').unbind('click');
        }

        opts.$lblPageCountgeIndex.html(pageCount);
        if (pageCount > 1 && pageNumber < pageCount) {
            opts.$btnNextPage.removeClass('disabled').unbind().bind('click', { target: target }, function (e) {
                nextPage_onClick(e.data.target);
            });
        }
        else {
            opts.$btnNextPage.removeClass('disabled').addClass('disabled').unbind('click');
        }
        opts.$lblListItemTotal.html(total);
    }
    function prePage_onClick(target) {
        var opts = getOptions(target);
        opts.pageNumber--;
        if (opts.pageNumber <= 0)
            opts.pageNumber = 1;
        $(target).datagrid("reload");
        opts.$body.prop('scrollTop', '0');
    }
    function nextPage_onClick(target) {
        var opts = getOptions(target);
        opts.pageNumber++;
        if (opts.pageNumber > opts.pageCount)
            opts.pageNumber = opts.pageCount;
        $(target).datagrid("reload");
        opts.$body.prop('scrollTop', '0');
    }

    function row_onClick(target, row_target, rowIndex) {
        var opts = getOptions(target);
        unselectAll(target);
        selectRow(target, $(row_target));
        var row = getRow(target, rowIndex);
        opts.onClickRow.apply(target, [rowIndex, row]);
    }

    function beginEdit(target, index, row) {
        var opts = getOptions(target);
        opts.editRowIndex = index;
        opts.editRow = row;

        if (opts.$editModal) {
            opts.$editModal.remove();
        }
        opts.onBeforeEdit.call(target, index, row);
        editModal_init(target);

        var modal_title = opts.editRowIndex == -1
          ? '<i class="fa fa-plus"></i>&nbsp;添加'
          : '<i class="fa fa-pencil-square-o"></i>&nbsp;修改';
        opts.$editModal.find(".modal-title").html(modal_title);

        opts.$editModal.modal('show');
        columnEditor_loadData(target); //控件数据加载
    }
    function editModal_init(target) {
        var opts = getOptions(target);
        var arr_htm = [];
        arr_htm.push('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-header">');
        arr_htm.push('<h5 class="modal-title"></h5>');
        arr_htm.push('</div>');//end header

        arr_htm.push('<div class="modal-body">');
        arr_htm.push('<ul class="list-group list-group-flush">');
        arr_htm.push('</ul>');
        arr_htm.push('</div>');//end body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<a class="btn btn-primary btn-sm btn-save" href="javascript:;" role="button"><i class="fa fa-check"></i>&nbsp;保存</a>');
        arr_htm.push('<a class="btn btn-secondary btn-sm btn-cancel" href="javascript:;" role="button"><i class="fa fa-dot-circle-o"></i>&nbsp;取消</a>');
        arr_htm.push('</div>');//end footer

        arr_htm.push('</div>');//end content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal

        opts.$editModal = $(arr_htm.join(''));
        $(target).append(opts.$editModal);

        opts.$editModal.modal({
            backdrop: 'static',
            keyboard: true,
            focus: true,
            show: false
        });
        opts.$editModal.on('shown.bs.modal', { target: target }, function (e) {
            //to fix textbox 在modal显示前初始化multiline scrollHeight无法计算正确
            var _target = e.data.target;
            var opts = getOptions(e.data.target);
            for (var i = 0, len = opts.columns.length; i < len; i++) {
                var column = opts.columns[i];
                var bs_editor = column.bs_editor;
                if (bs_editor.type == "textbox") {
                    bs_editor.target.textbox('setScrollHeight');
                }
            }
        }).on('hide.bs.modal', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.editRowIndex = -1;
            opts.editRow = null;
        });

        opts.$editModal.find(".btn-cancel").on('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.$editModal.modal('hide');
        });
        opts.$editModal.find(".btn-save").on('click', { target: target }, function (e) {
            var _target = e.data.target;
            btnSave_onClick(_target);
        });

        columnEditor_init(target);
    }

    function columnEditor_init(target) {
        var opts = getOptions(target);
        var $listgroup = opts.$editModal.find(".list-group");
        for (var i = 0, len = opts.columns.length; i < len; i++) {
            var column = opts.columns[i];
            var $li = $('<li class="list-group-item"></li>');
            if (column.hidden) $li.addClass("guitea-hidden");

            var $ctrl = $('<input type="text"/>');
            $li.append($ctrl).appendTo($listgroup);

            var options = $.extend({}, column.editor.options, {
                label: column.title + "："
            });

            var bs_editor = {
                type: column.editor ? column.editor.type : '',
                field: column.field,
                target: $ctrl,
                actions: {
                    getValue: function ($ed_target) {
                        return $ed_target.textbox('getValue');
                    },
                    setValue: function ($ed_target, v) {
                        $ed_target.textbox('setValue', v);
                    }
                }
            };

            if (column.editor) {
                switch (column.editor.type) {
                    case "textbox": {
                        $ctrl.textbox(options);
                        break;
                    }
                    case "textwindow": {
                        $ctrl.textwindow(options);

                        bs_editor.actions = {
                            getValue: function ($ed_target) {
                                return $ed_target.textwindow('getValue');
                            },
                            setValue: function ($ed_target, v) {
                                $ed_target.textwindow('setValue', v);
                            },
                            getText: function ($ed_target) {
                                return $ed_target.textwindow('getText');
                            },
                            setText: function ($ed_target, v) {
                                $ed_target.textwindow('setText', v);
                            }
                        };

                        break;
                    }
                    case "numberbox": {
                        $ctrl.numberbox(options);

                        bs_editor.actions = {
                            getValue: function ($ed_target) {
                                return $ed_target.numberbox('getValue');
                            },
                            setValue: function ($ed_target, v) {
                                $ed_target.numberbox('setValue', v);
                            }
                        };
                        break;
                    }
                    case "combobox": {
                        if (!emer.isNullOrEmpty(options.data) && typeof (options.data) == 'string') {
                            var jsonData = [];
                            var _strArr = options.data.split(';');
                            for (var j = 0; j < _strArr.length; j++) {
                                var jsonItem = {
                                    text: _strArr[j].split(',')[0],
                                    value: _strArr[j].split(',')[1]
                                };
                                jsonData.push(jsonItem);
                            }
                            options.data = jsonData;
                        }
                        $ctrl.combobox(options);

                        bs_editor.actions = {
                            getValue: function ($ed_target) {
                                return $ed_target.combobox('getValue');
                            },
                            setValue: function ($ed_target, v) {
                                $ed_target.combobox('setValue', v);
                            }
                        };
                        break;
                    }
                    case "datebox":
                    case "datetimebox": {
                        $ctrl.datebox(options);

                        bs_editor.actions = {
                            getValue: function ($ed_target) {
                                return $ed_target.datebox('getValue');
                            },
                            setValue: function ($ed_target, v) {
                                $ed_target.datebox('setValue', v);
                            }
                        };

                        break;
                    }
                    case "mxlabel": {
                        options.readonly = true;
                        $ctrl.textbox(options);
                        break;
                    }
                    default: break;
                }
            }
            else {
                //单身ID，单头ID
                options.readonly = true;
                $ctrl.textbox(options);
            }
            column.bs_editor = bs_editor;
        }
    }
    function columnEditor_loadData(target) {
        var opts = getOptions(target);
        for (var i = 0, len = opts.columns.length; i < len; i++) {
            var column = opts.columns[i];
            var bs_editor = column.bs_editor,
                ed_options = column.editor ? column.editor.options : null;
            var v = '';
            if (opts.editRowIndex == -1) {
                //add
                if (bs_editor.type == 'textwindow') {
                    //处理默认值
                    var defaultvalue = ed_options ? ed_options.defaultvalue : '';
                    var txt = '';
                    switch (defaultvalue) {
                        case "user": {//登录用户
                            v = emer.loginUser.UserCode;
                            txt = emer.loginUser.UserName;
                            break;
                        }
                        case "dept": {//登录部门
                            v = emer.loginUser.DeptCode;
                            txt = emer.loginUser.DeptFullName;
                            break;
                        }
                        default: {
                            if (defaultvalue && defaultvalue.indexOf(';') > 0) {
                                v = defaultvalue.split(";")[0];
                                txt = defaultvalue.split(";")[1];
                            }
                            break;
                        }
                    }
                    bs_editor.actions.setValue(bs_editor.target, v);
                    bs_editor.actions.setText(bs_editor.target, txt);
                }
                else {
                    v = opts.editRow[column.field] || '';
                    if (ed_options) {
                        v = opts.editRow[column.field] || ed_options.value || '';
                    }
                    bs_editor.actions.setValue(bs_editor.target, v);
                }
            }
            else {
                //编辑
                v = opts.editRow[column.field] || '';
                if (bs_editor.type == 'textwindow') {
                    var txt = v || '';
                    if (v.indexOf('[') > 0) {
                        var v_arr = v.split('[');
                        v = v_arr[0];
                        txt = v_arr[1].substring(0, v_arr[1].length - 1);
                    }
                    bs_editor.actions.setValue(bs_editor.target, v);
                    bs_editor.actions.setText(bs_editor.target, txt);
                }
                else {
                    bs_editor.actions.setValue(bs_editor.target, v);
                }
            }
        }
    }
    function columnEditor_onValidate(target) {
        var isOk = true;
        var opts = getOptions(target);
        var $listgroup = opts.$editModal.find(".list-group");
        var $invalid = $listgroup.find(".is-invalid");
        isOk = $invalid.length == 0;
        if (!isOk) {
            $.messager.alert('数据验证提示', '单身验证不通过！请将红色边框的数据按相应格式填写完整！', 'info');
            return false;
        }
        isOk = opts.onAfterValidate.call(target);
        return isOk;
    }
    function columnEditor_getData(target) {
        var opts = getOptions(target);
        var row = {};
        for (var i = 0, len = opts.columns.length; i < len; i++) {
            var column = opts.columns[i];
            var bs_editor = column.bs_editor;
            if (bs_editor.type == 'textwindow') {
                var v = bs_editor.actions.getValue(bs_editor.target),
                    txt = bs_editor.actions.getText(bs_editor.target);
                v = v || '', txt = txt || '';
                var displayType = column.editor.options.displayType;
                if (displayType == "all") {
                    v = v ? v + '[' + txt + ']' : '';
                }
                row[column.field] = v;
            }
            else {
                row[column.field] = bs_editor ? bs_editor.actions.getValue(bs_editor.target) : '';
            }
        }
        return row;
    }

    function btnSave_onClick(target) {
        if (!columnEditor_onValidate(target)) return;
        var opts = getOptions(target);
        var index = opts.editRowIndex;
        var row = columnEditor_getData(target);
        if (index == -1) {
            //添加
            index = opts.data.rows.length;
            appendRow(target, row);
        }
        else {
            //修改
            updateRow(target, row, index);
        }
        opts.onAfterEdit.call(target, index, row, {});
        opts.$editModal.modal('hide');
    }

    function appendRow(target, row) {
        var opts = getOptions(target);
        if (opts.data.total == 0) {
            opts.$listGroup.empty();
        }
        opts.data.rows.push(row);
        opts.data.total++;
        opts.insertedRows.push(row);

        var rowHtm = onRowRender(target, row, opts.data.rows.length - 1);
        var $rowTarget = $(rowHtm);
        onRowEventBind(target, $rowTarget[0]);
        opts.$listGroup.prepend($rowTarget);

        unselectAll(target);
        selectRow(target, $rowTarget);

        opts.onAfterAppendRow.call(target, row);
    }
    function updateRow(target, up_row, index) {
        var opts = getOptions(target);
        var row = getRow(target, index);

        var isChange = false;
        for (var name in up_row) {
            if (row[name] !== up_row[name]) {
                isChange = true; break;
            }
        }
        if (isChange) {
            if (_getRowIndex(opts.insertedRows, row) == -1) {
                if (_getRowIndex(opts.updatedRows, row) == -1) {
                    opts.updatedRows.push(row);
                }
            }
            $.extend(row, up_row);

            var $rowTarget = getRowTarget(target, index);
            if ($rowTarget.length) {
                var htm = opts.onBeforeRowRender(row, opts.columns);
                $rowTarget.html(htm);
            }
        }
    }
    function deleteRow(target, index) {
        var opts = getOptions(target);
        var data = opts.data;
        var insertedRows = opts.insertedRows;
        var updatedRows = opts.updatedRows;
        var deletedRows = opts.deletedRows;

        var row = getRow(target, index);
        if (_getRowIndex(insertedRows, row) >= 0) {
            _removeRow(insertedRows, row);
        }
        else {
            deletedRows.push(row);
            if (_getRowIndex(updatedRows, row) >= 0) {
                _removeRow(updatedRows, row);
            }
        }

        //为 selectedRows，checkedRows 做预留
        //_removeRow(opts.selectedRows, opts.idField, row[opts.idField]);
        //_removeRow(opts.checkedRows, opts.idField, row[opts.idField]);

        var $rowTarget = getRowTarget(target, index);
        if ($rowTarget.length) {
            $rowTarget.remove();
        }
        for (var i = index + 1; i < data.rows.length; i++) {
            var $row = getRowTarget(target, i);
            if ($row.length) {
                $row.attr("datagrid-row-index", i - 1);
                $row.attr("id", getRowId(opts, i - 1));
            }
        }
        data.total -= 1;
        data.rows.splice(index, 1);

        if (data.total == 0) {
            opts.$listGroup.empty().append('<li class="list-group-item text-muted">没有符合的数据显示！</li>');
        }
    }

    function getChanges(target, type) {
        var opts = getOptions(target);
        switch (type) {
            case "inserted": return opts.insertedRows;
            case "deleted": return opts.deletedRows;
            case "updated": return opts.updatedRows;
            default: {
                var rows = [];
                rows = rows.concat(opts.insertedRows);
                rows = rows.concat(opts.deletedRows);
                rows = rows.concat(opts.updatedRows);
                return rows;
            }
        }
    }
    function acceptChanges(target) {
        var opts = getOptions(target);
        var data = opts.data;
        var rows = data.rows;

        var originalRows = [];
        for (var i = 0; i < rows.length; i++) {
            originalRows.push($.extend({}, rows[i]));
        }
        opts.originalRows = originalRows;
        opts.updatedRows = [];
        opts.insertedRows = [];
        opts.deletedRows = [];
    }
    function getRow(target, rowIndex) {
        return getOptions(target).data.rows[parseInt(rowIndex)];
    }
    function getRowTarget(target, index) {
        var opts = getOptions(target);
        var rowid = "#" + getRowId(opts, index);
        return $(rowid);
    }
    function getRowId(opts, index) {
        return opts.id + opts.rowIdPrefix + index;
    }
    function getEditor(target, options) {
        //获取指定编辑器，options包含2个属性：
        //index：行索引。 （兼容easyui属性，bootstrp中不需要）
        //field：字段名称。 
        var opts = getOptions(target);
        var field = options.field;
        if (opts.$editModal) {
            var arr_filter = opts.columns.filter(function (col) {
                return col.field == field;
            });
            if (arr_filter.length == 0) return null;
            var column = arr_filter[0];
            return column.bs_editor;
        }
        return null;
    }
    function getColumnFields(target) {
        var opts = getOptions(target);
        var fields = [];
        for (var i = 0, len = opts.columns.length; i < len; i++) {
            fields.push(opts.columns[i].field);
        }
        return fields;
    }
    function getColumnOption(target, colField) {
        var opts = getOptions(target);
        for (var i = 0, len = opts.columns.length; i < len; i++) {
            var col = opts.columns[i];
            if (col.field == colField) {
                return col;
            }
        }
        return null;
    }

    //function getClosestTarget(elem_target, clsName) {
    //    var t = $(elem_target).closest(clsName || "div.bootstrap-datagrid");
    //    if (t.length) return t[0];
    //    return undefined;
    //}

    function unselectAll(target) {
        $(target).find(".datagrid-row").removeClass("active");
    }
    function selectRow(target, index) {
        var $rowTarget = (typeof index == "object") ? index : getRowTarget(target, index);
        if ($rowTarget.length) {
            $rowTarget.addClass('active');
        }
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (!opts.data) {
            opts.data = {
                total: 0,
                rows: []
            };
        }
        opts.originalRows = [];
        opts.updatedRows = [];
        opts.insertedRows = [];
        opts.deletedRows = [];

        if (opts.$card) opts.$card.remove();
        if (opts.$editModal) opts.$editModal.remove();
    }
    function getOptions(target) {
        return $.data(target, 'datagrid').options;
    }
    $.fn.datagrid = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.datagrid.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'datagrid');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, 'datagrid', {
                    options: $.extend(true, {}, $.fn.datagrid.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.datagrid.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        setHeight: function (jq, height) {
            return jq.each(function () {
                setHeight(this, height);
            });
        },

        load: function (jq, params) {
            return jq.each(function () {
                var opts = $(this).datagrid("options");
                if (typeof params == "string") {
                    opts.url = params;
                    params = null;
                }
                opts.pageNumber = 1;
                onload(this, params);
                opts.$body.prop('scrollTop', '0');
            })
        },
        reload: function (jq, params) {
            return jq.each(function () {
                var opts = getOptions(this);
                if (typeof params == "string") {
                    opts.url = params;
                    params = null;
                }
                onload(this, params);
            });
        },
        loadData: function (jq, data) {
            return jq.each(function () {
                onLoadData(this, data);
            });
        },
        getData: function (jq) {
            return getOptions(jq[0]).data;
        },
        getPager: function (jq) {
            return getOptions(jq[0]).$pagination;
        },
        getFooter: function (jq) {
            return getOptions(jq[0]).$footer;
        },

        getRow: function (jq, index) {
            return getRow(jq[0], index);
        },
        getRows: function (jq) {
            return getOptions(jq[0]).data.rows;
        },

        getColumnFields: function (jq) {
            return getColumnFields(jq[0]);
        },
        getColumnOption: function (jq, colField) {
            return getColumnOption(jq[0], colField);
        },

        validateRow: function (jq, index) {
            return columnEditor_onValidate(jq[0]);
        },
        appendRow: function (jq, row) {
            appendRow(jq[0], row);
        },
        updateRow: function (jq, param) {
            //param = {index:'',row:''}
            updateRow(jq[0], param.row, param.index);
        },
        deleteRow: function (jq, index) {
            deleteRow(jq[0], index);
        },

        beginEdit: function (jq, param) {
            //param = {index:'',row:''}
            beginEdit(jq[0], param.index, param.row);
        },
        cancelEdit: function (jq, index) {
        },
        getEditor: function (jq, options) {
            return getEditor(jq[0], options);
        },

        getChanges: function (jq, type) {
            return getChanges(jq[0], type);
        },
        acceptChanges: function (jq) {
            acceptChanges(jq[0]);
        },

        unselectAll: function (jq) {
            unselectAll(jq[0]);
        },
        selectRow: function (jq, index) {
            selectRow(jq[0], index);
        },

        showColumn: function (jq, field) {
            var col = $(jq[0]).datagrid("getColumnOption", field);
            if (col.hidden) {
                col.hidden = false;
            }
        },
        hideColumn: function (jq, field) {
            var col = $(jq[0]).datagrid("getColumnOption", field);
            if (!col.hidden) {
                col.hidden = true;
            }
        },
        setColumnTitle: function (jq, param) {
            //param = {
            //    field: '', text: ''
            //}
            var col = $(jq[0]).datagrid("getColumnOption", param.field);
            col.title = param.text;
        },

        destroy: function (jq) {
            return jq.each(function () {
                destroy(this);
            });
        },

        resize: function (jq, param) {
            return false;//兼容easyui
        },
        loading: function (jq) {
            emer.loading('show');
        },
        loaded: function (jq) {
            emer.loading('hide');
        }
    };
    $.fn.datagrid.defaults = {
        id: '',
        initCount: 0,//初始化次数

        $header: null,
        $body: null,
        $footer: null,
        $pagination: null,
        $listGroup: null,

        height: 'auto',
        title: '',//在Cards的card-header显示标题文本。
        iconCls: '',//在Cards的card-header显示的图标
        cls: '',//添加一个CSS类ID到card。
        headerCls: '',//添加一个CSS类ID到card-header。
        bodyCls: '',//添加一个CSS类ID到bootstrap-datagrid-body。

        showHeader: true,
        showLoading: true,//是否显示加载

        tools: [],

        pagination: true,//是否显示分页
        pagePosition: 'none', //分页停靠方式，none、top、bottom
        pageNumber: 1,//页数
        pageSize: 10,//每页显示数
        pageCount: 0,//总页数

        sortName: null,
        sortOrder: 'asc',

        columns: undefined,

        url: '',
        method: 'post',
        guiteaApi: false,//url是否是guiteaapi调用
        queryParams: {},
        data: {
            total: 0,
            rows: []
        },

        rowIdPrefix: '_dg_rowid_',

        $editModal: null,
        editRowIndex: -1,
        editRow: null,

        originalRows: [],
        updatedRows: [],
        insertedRows: [],
        deletedRows: [],

        onBeforeLoad: function (queryParams) {
            return true;
        },
        onLoadSuccess: function (data) {
        },
        onBeforeRowRender: function (row, columns) {
            return null;
        },

        onClickRow: null,//行点击事件

        onAfterAppendRow: function (row) {
        },
        onAfterValidate: function () {
            return true;
        },
        onBeforeEdit: function (index, row) {
        },
        onAfterEdit: function (index, row, changes) {
        }
    };
})(jQuery);
