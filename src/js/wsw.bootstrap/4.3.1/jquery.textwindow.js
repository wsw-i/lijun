/*========================================
 * jquery.bootstrap.textwindow
 * add by wangshw 2019-05-13
 *========================================*/
(function ($) {
    var addon_index = 0;
    var openwin_append = {
        type: "button",
        cls: 'btn-primary',
        iconCls: 'fa fa-search',
        handler: function (e) {
            var opts = getOptions(e.data.target);
            if (opts.onBeforeClickIcon.call()) {
                openWindow(e.data.target);
            }
        }
    };
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "textwindow_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("textwindowName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox bootstrap-textwindow">');
        if (opts.label) {
            arr_htm.push('<label for="' + opts.id + '_input_group">' + opts.label + '</label>');
            arr_htm.push('<span class="view-label" style="display:none;"></span>');
        }
        arr_htm.push('<div class="input-group input-group-sm" style="display:none;">');
        if (opts.prepend.length) {
            arr_htm.push('<div class="input-group-prepend"></div>');
        }
        arr_htm.push('<input class="form-control textwindow-text" type="text" placeholder="' + opts.prompt
               + '" aria-label="' + (opts.prompt || opts.label || '') + '" readonly>');
        arr_htm.push('<input class="textwindow-value" name="' + opts.name + '" type="hidden">');

        opts.append.push(openwin_append);
        arr_htm.push('<div class="input-group-append"></div>');
        arr_htm.push('</div>');//end input-group
        if (opts.required) {
            arr_htm.push('<div class="invalid-feedback">' + opts.missingMessage + '</div>');
        }
        if (opts.bsHelpText) {
            arr_htm.push('<small class="form-text text-muted">' + opts.bsHelpText + '</small>');
        }
        arr_htm.push('</div>');//end form-group

        opts.$fromGroup = $(arr_htm.join('')).insertAfter($(target));
        opts.$viewLable = opts.$fromGroup.find(".view-label");
        opts.$inputGroup = opts.$fromGroup.find(".input-group");
        opts.$textInput = opts.$inputGroup.find(".textwindow-text");
        opts.$valueInput = opts.$inputGroup.find(".textwindow-value");
        opts.$feedback = opts.$fromGroup.find(".invalid-feedback");

        if (opts.required) {
            opts.$textInput.attr("required", true).addClass("is-invalid");
        }

        addon_init(target);
        readonly(target, opts.readonly);
        if (!emer.isNullOrEmpty(opts.value)) {
            setValue(target, opts.value);
            setText(target, opts.text);
        }
    }
    function addon_init(target) {
        var opts = getOptions(target);
        if (opts.prepend.length) {
            var $prepend = opts.$inputGroup.find('.input-group-prepend');
            for (var i = 0; i < opts.prepend.length; i++) {
                var addon = opts.prepend[i];
                var $addon;
                if (addon.type == 'label') {
                    $addon = $('<span class="input-group-text" id="' + opts.id + '_input_addon_' + (++addon_index) + '">'
                        + addon.text
                        + '</span>').appendTo($prepend);
                }
                if (addon.type == 'button') {
                    var txt = (addon.iconCls ? '<i class="' + addon.iconCls + '"></i>&nbsp;' : '') + (addon.text || '');
                    var cls = addon.cls || 'btn-primary';
                    $addon = $('<a class="btn btn-sm ' + cls + '" id="' + opts.id + '_input_addon_' + (++addon_index) + '" href="javascript:;">'
                        + txt
                        + '</a>').appendTo($prepend);
                    $addon.unbind().bind('click', { target: target }, function (e) {
                        if (addon.handler) {
                            addon.handler.call(this, e);
                        }
                    });
                }
            }
        }
        if (opts.append.length) {
            var $append = opts.$inputGroup.find('.input-group-append');
            for (var i = 0; i < opts.append.length; i++) {
                var addon = opts.append[i];
                var $addon;
                if (addon.type == 'label') {
                    $addon = $('<span class="input-group-text" id="' + opts.id + '_input_addon_' + (++addon_index) + '">'
                        + addon.text
                        + '</span>').appendTo($append);
                }
                if (addon.type == 'button') {
                    var txt = (addon.iconCls ? '<i class="' + addon.iconCls + '"></i>&nbsp;' : '') + (addon.text || '');
                    var cls = addon.cls || 'btn-primary';
                    $addon = $('<a class="btn btn-sm ' + cls + '" id="' + opts.id + '_input_addon_' + (++addon_index) + '" href="javascript:;">'
                        + txt
                        + '</a>').appendTo($append);
                    //$addon.bind('click', addon.handler);
                    $addon.unbind().bind('click', { target: target }, function (e) {
                        if (addon.handler) {
                            addon.handler.call(this, e);
                        }
                    });
                }
            }
        }
    }

    function readonly(target, mode) {
        var opts = getOptions(target);
        opts.readonly = mode == undefined ? true : mode;
        if (opts.readonly) {
            opts.$inputGroup.hide();
            setViewLableText(target);
            opts.$viewLable.show();
            opts.$textInput.removeClass("is-invalid");
            opts.$feedback.hide();
        } else {
            opts.$inputGroup.show();
            opts.$viewLable.hide();
            onValidate(target);
        }
    }

    function openWindow(target) {
        var opts = getOptions(target);
        var winWhere = getWinWhere(opts);
        emer.openWin({
            id: opts.id,
            title: opts.windowTitle,
            url: opts.windowUrl,
            winType: opts.winType,
            openView: opts.table,
            winWhere: winWhere,//开窗查询条件
            controlIds: opts.controlIds,
            windowFields: opts.windowFields,
            afterColseCallback: opts.afterColseCallback,//执行controlIds赋值后，执行afterColseCallback
            onEndCallback: opts.onEndCallback,
            onlyLeafCheck: opts.onlyLeafCheck,
            multiSelect: opts.multiSelect,
            joinAdd: opts.joinAdd,
            gridTargert: opts.gridTargert,
            isGridColumn: opts.isGridColumn,
            tools: [{
                iconCls: 'fa fa-trash-o fa-16',
                handler: function () {
                }
            }]
        });
    }
    function getWinWhere(opts) {
        var where = opts.winWhere || '';
        if (where) {
            if (where.indexOf('@') > 0) {
                //常量条件
                if (where.indexOf('@user') > 0) {
                    where = where.replaceAll('@user', "'" + emer.loginUser.UserCode + "'");
                }
                else if (where.indexOf('@dept') > 0) {
                    where = where.replaceAll('@dept', "'" + emer.loginUser.DeptCode + "'");
                }
                else if (where.indexOf('@sysdate') > 0) {
                    where = where.replaceAll('@sysdate', "'" + emf.DateFormatter({ date: new Date(), formatstring: 'YYYY-MM-DD' }) + "'");
                }
                opts.winWhere = where;
            }

            if (where.indexOf('#') > 0) {
                //单头条件 单据控件值 条件
                if (opts.winWhereCtrlIds) {
                    var ctrlIds = opts.winWhereCtrlIds.split(',');
                    for (var i = 0; i < ctrlIds.length; i++) {
                        var cTarget = "#" + ctrlIds[i];
                        var v = app.getValue($(cTarget));
                        if (!v) v = '';
                        where = where.replaceAll(cTarget, "'" + v + "'");
                    }
                }
            }

            if (where.indexOf('$') > 0) {
                //单身条件
                if (opts.winWhereCtrlIds) {
                    var ctrlIds = opts.winWhereCtrlIds.split(',');
                    var grid = bod.grid;
                    for (var i = 0; i < ctrlIds.length; i++) {
                        var cTarget = "$" + ctrlIds[i];
                        var editor = grid.datagrid('getEditor', { index: bod.editIndex, field: ctrlIds[i] });
                        if (editor && editor.actions.getValue) {
                            var v = editor.actions.getValue(editor.target);
                            if (!v) v = '';
                            if (editor.type == 'textwindow') v = v.split('[')[0];
                            where = where.replace(cTarget, "'" + v + "'");
                        }
                    }
                }
            }
        }
        return where;
    }

    function setValue(target, value) {
        var opts = getOptions(target);
        var newValue = value || '';
        var oldValue = opts.$valueInput.val();
        onValueChange_call(target, newValue, oldValue);
    }
    function setText(target, text) {
        var opts = getOptions(target);
        var newText = text || '';
        var oldText = opts.$textInput.val();
        onTextChange_call(target, newText, oldText);
    }
    function setViewLableText(target) {
        var opts = getOptions(target);
        var v = opts.$valueInput.val();
        var txt = opts.$textInput.val();
        v = v == txt ? v : (v ? v + (txt ? '【' + txt + '】' : '') : '');
        opts.$viewLable.html(v);
    }
    function onValueChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        if (oldValue != newValue) {
            opts.value = newValue;
            opts.$valueInput.val(newValue);
            setViewLableText(target);
            onValidate(target);
            opts.onChange.call(target, newValue, oldValue);
            opts.onValueChange.call(target, newValue, oldValue);
        }
    }
    function onTextChange_call(target, newText, oldText) {
        var opts = getOptions(target);
        if (oldText != newText) {
            opts.text = newText;
            opts.$textInput.val(newText);
            setViewLableText(target);
            onValidate(target);
            opts.onTextChange.call(target, newText, oldText);
        }
    }
    function onValidate(target) {
        var opts = getOptions(target);
        if (opts.required)
            app.bsValidate({
                value: opts.$valueInput.val(),
                validType: opts.validType,
                $input: opts.$textInput,
                $feedback: opts.$feedback
            });
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            addon_index = 0;
            opts.$fromGroup.remove();
            emer.removeArrayItem(opts.append, openwin_append);
        }
    }
    function getOptions(target) {
        return $.data(target, "textwindow").options;
    }
    $.fn.textwindow = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.textwindow.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "textwindow");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "textwindow", {
                    options: $.extend(true, {}, $.fn.textwindow.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.textwindow.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$valueInput.val();
        },
        getText: function (jq) {
            return getOptions(jq[0]).$textInput.val();
        },
        setValue: function (jq, value) {
            return jq.each(function () {
                setValue(this, value);
            });
        },
        setText: function (jq, text) {
            return jq.each(function () {
                setText(this, text);
            });
        },
        readonly: function (jq, mode) {
            return jq.each(function () {
                readonly(this, mode);
            });
        },

        destroy: function (jq) {
            return jq.each(function () {
                destroy(this);
            });
        }
    };
    $.fn.textwindow.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $formGroup: null,//form-group
        $viewLable: null,
        $inputGroup: null,//input-group
        $textInput: null,//text input
        $valueInput: null,//value input
        $feedback: null,

        prepend: [],
        append: [],

        prompt: '请选择...',
        label: null,

        value: '',
        text: '',
        readonly: false,

        required: false,
        validType: null,
        missingMessage: '请选择此字段信息！',
        invalidMessage: null,

        bsHelpText: null,//bootstrap Help text

        windowTitle: '开窗选择',
        windowUrl: '',
        controlIds: '',
        windowFields: '',
        table: '',
        winWhere: '',//开窗where条件
        winWhereCtrlIds: '',//开窗取条件控件 ID1,ID2

        onlyLeafCheck: false,//树Tree开窗专用 ，是否只有最底层节点 可选择
        multiSelect: false,//是否能多选
        joinAdd: false,//是否有追加按钮

        winType: 'grid',//开窗类型 grid
        isGridColumn: false,//是否grid列
        gridTargert: 'gridDetail',//grid上开窗列带值相关

        onChange: function (newValue, oldValue) {
        },
        onValueChange: function (newValue, oldValue) {
        },
        onTextChange: function (newText, oldText) {
        },
        onBeforeClickIcon: function () {
            return true;
        },

        onEndCallback: '',//设置了onEndCallback后controlIds与afterColseCallback不再起作用
        afterColseCallback: ''
    };
})(jQuery);
