/*========================================
 * jquery.bootstrap.form
 * add by wangshw 2019-05-21
 *========================================*/
(function ($) {
    function init(target) {
        var opts = $.data(target, 'form').options;
        opts.id = $(target).attr("id");
        $(target).addClass("form-horizontal");

        if ($("table").length) {
            initFromPcDesign(target);
            $("#headDetail").show();
            return;
        }
        initFromCurrentPage(target);
    }
    //从电脑端界面设计初始化页面控件
    function initFromPcDesign(target) {
        var opts = $.data(target, 'form').options;
        $("table").each(function (i) {
            $table = $(this);
            var tbl_id = $table.attr("id");
            var hide = $table.css('display') == 'none';
            var m_title = $table.attr('data-m-title');//手机端配置的table标题

            var $tbl_head = $table.find(".head");
            var hasHead = $tbl_head.length > 0;
            var tbl_type = $table.attr("data-tbl-type") || '0', tbl_title = '';
            if (hasHead) {
                var $tbl_head_td = $tbl_head.find("td");
                if ($tbl_head_td.length == 1) {
                    tbl_type = '1';
                    tbl_title = $tbl_head_td.html();
                    if ($tbl_head.next().find('input,textarea').length == 0) {
                        tbl_type = '3';
                    }
                }
                else tbl_type = '2';
            }
            $table.attr("data-tbl-type", tbl_type);

            hasHead = hasHead || !emer.isNullOrEmpty(m_title);
            var head_title = m_title || tbl_title || '基本信息';

            var arr_card_htm = [];
            var card_cls = hasHead ? '' : 'card-header-none';
            if (tbl_type == '2' || tbl_type == '3') {
                card_cls = "card-striped";
            }
            else if (tbl_type == '99') {
                card_cls += " card-note-99";
            }
            card_cls += tbl_id ? " " + tbl_id : '';
            arr_card_htm.push('<div class="card bg-light ' + card_cls + '">');
            if (hasHead) {
                arr_card_htm.push('<div class="card-header">');
                arr_card_htm.push(head_title);
                arr_card_htm.push('</div>');
            }
            arr_card_htm.push('<ul class="list-group list-group-flush">');
            arr_card_htm.push('</ul>');
            arr_card_htm.push('</div>');
            $card = $(arr_card_htm.join(''));

            if (hide) $card.hide();
            $table.hide();
            $("#headDetail").append($card);
            $card.append($table);

            var li_index = 0
            if (tbl_type == '2' || tbl_type == '3') {
                //列表
                $table.find("tr").each(function (i) {
                    var $tr = $(this);
                    var _index = $tr.find('input,textarea').length ? li_index++ : 0;
                    $tr.find("td").each(function () {
                        var $input = $(this).find('input,textarea');
                        if ($input.length) {
                            input_init(opts, $input, _index);
                        }
                    });
                });
                return;
            }
            if (tbl_type == '99') {
                //备注
                var arr_htm = [];
                $table.find("tr").each(function (i) {
                    var $tr = $(this);
                    arr_htm.push('<li class="list-group-item">');
                    $tr.find("td").each(function (i) {
                        var txt = $(this).text();
                        if (txt) arr_htm.push($(this).html());
                    });
                    arr_htm.push('</li>');
                });
                if (arr_htm.length)
                    $card.find('.list-group').append(arr_htm.join(''));
                return;
            }
            $table.find("td").each(function (i) {
                var $input = $(this).find('input,textarea');
                if ($input.length) {
                    input_init(opts, $input, li_index++);
                }
            });
        });

        $(".mxOa_Input").each(function (i) {
            opts.mxInputList.push($(this));
        });

        if ($("#APPID").length) {
            $("#APPID").remove();
            $('<span id="APPID" class="badge badge-primary guitea-appid"></span>').appendTo($(target));
        }
    }
    function input_init(opts, $input, li_index) {
        $input.attr('data-li-index', li_index);
        if ($input.hasClass("easyui-textbox")) {
            textbox_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-textwindow")) {
            textwindow_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-numberbox")) {
            numberbox_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-combobox")) {
            combobox_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-datebox") || $input.hasClass("easyui-datetimebox")) {
            datebox_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-checkbox")) {
            checkbox_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-switchbutton")) {
            switchbutton_init(opts, $input); return;
        }
        if ($input.hasClass("easyui-tagbox")) {
            tagbox_init(opts, $input); return;
        }
    }
    //从当前页面内容初始化控件
    function initFromCurrentPage(target) {
        var opts = $.data(target, 'form').options;
        $(".bootstrap-textbox").each(function (i) {
            textbox_init(opts, $(this));
        });
        $(".bootstrap-textwindow").each(function (i) {
            textwindow_init(opts, $(this));
        });
        $(".bootstrap-numberbox").each(function (i) {
            numberbox_init(opts, $(this));
        });
        $(".bootstrap-combobox").each(function (i) {
            combobox_init(opts, $(this));
        });
        $(".bootstrap-datebox").each(function (i) {
            datebox_init(opts, $(this));
        });
        $(".bootstrap-checkbox").each(function (i) {
            checkbox_init(opts, $(this));
        });
        $(".bootstrap-switchbutton").each(function (i) {
            switchbutton_init(opts, $(this));
        });
        $(".bootstrap-tagbox").each(function (i) {
            tagbox_init(opts, $(this));
        });
        $(".mxOa_Input").each(function (i) {
            opts.mxInputList.push($(this));
        });
    }

    /*
     * 控件初始化
     *=================*/
    function ctrl_extend(s) {
        var $td = s.closest("td"), $tr = $td.closest("tr"), $table = $tr.closest("table");

        var parentVisible = $td.css('display') != 'none' && $tr.css('display') != 'none';
        var liCls = $tr.attr('id') || $td.attr('id');
        var tbl_type = $table.attr('data-tbl-type');

        var label = $td.prev().text();
        if (emer.isNullOrEmpty(label)) {
            var index = $td.index();
            if (tbl_type == '2') {
                label = $table.find('tr:first').children("td").eq(index).text();

            }
            else if (tbl_type == '3') {
                label = $table.find('tr:eq(1)').children("td").eq(index).text();
            }
            label = label ? label + '：' : label;
        }
        return {
            parentVisible: parentVisible,
            label: label,
            li_index: s.attr('data-li-index'),
            liCls: liCls
        };
    }
    function ctrl_dataOpts(s) {
        var options = {};
        var o = $.trim(s.attr("data-options"));
        if (o) {
            if (o.substring(0, 1) != "{") o = "{" + o + "}";
            options = (new Function("return " + o))();
        }
        options.readonly = true;
        return options;
    }
    function getFinalOptions(s, config) {
        var data_opts = ctrl_dataOpts(s);
        var ex_opts = ctrl_extend(s);
        ex_opts.label = data_opts.mobileLabel || ex_opts.label;
        var options = $.extend({}, config, data_opts, ex_opts);
        var $li = s.closest("div.card").find(".list-group li:eq(" + options.li_index + ")");
        if ($li.length == 0) {
            $li = $('<li class="list-group-item"></li>');
            if (options.liCls) $li.removeClass(options.liCls).addClass(options.liCls);
            if (options.parentVisible == false) $li.css('display', 'none');
            $li.appendTo(s.closest("div.card").find(".list-group"));
        }
        $li.append(s);
        return options;
    }

    function textbox_init(opts, s) {
        opts.textboxList.push(s);
        var config = {
            prompt: s.attr('data-prompt'),
            type: s.attr('data-type'),
            multiline: s.attr('data-multiline') == "true",
            required: s.attr('data-required') == "true",
            validType: s.attr('data-validtype'),
            missingMessage: s.attr('data-missingmessage')
        };
        config = getFinalOptions(s, config);
        s.textbox(config);
    }
    function numberbox_init(opts, s) {
        opts.numberboxList.push(s);
        var _precision = s.attr('data-precision');
        if (emer.isNullOrEmpty(_precision)) _precision = 0;
        var config = {
            precision: _precision,
            required: s.attr('data-required') == "true",
            validType: s.attr('data-validtype'),
            missingMessage: s.attr('data-missingmessage')
        };
        config = getFinalOptions(s, config);
        s.numberbox(config);
    }
    function textwindow_init(opts, s) {
        opts.textwindowList.push(s);
        var config = {
            prompt: s.attr('data-prompt') || '请选择...',
            table: s.attr('table'),
            winWhere: s.attr('data-where') || '',
            winWhereCtrlIds: s.attr('data-wherectrlids') || '',
            controlIds: s.attr('controlids'),
            windowFields: s.attr('windowfields'),
            winType: s.attr('windowtype'),
            windowUrl: s.attr('windowurl'),
            windowTitle: s.attr('wintitle') || '弹出窗口',
            required: s.attr('data-required') == "true",
            validType: s.attr('data-validtype'),
            onlyLeafCheck: s.attr('onlyleafcheck') == "true",
            missingMessage: s.attr('data-missingmessage')
        };
        config = getFinalOptions(s, config);
        s.textwindow(config);
    }
    function combobox_init(opts, s) {
        opts.comboboxList.push(s);
        var strData = s.attr('data-strdata');
        var config = {};
        if (!emer.isNullOrEmpty(strData)) {
            var arr_data = [];
            var _strArr = strData.split(';');
            for (var j = 0; j < _strArr.length; j++) {
                arr_data.push({
                    label: _strArr[j].split(',')[0],
                    value: _strArr[j].split(',')[1]
                });
            }
            config = {
                editable: false,
                valueField: 'value',
                textField: 'label',
                data: arr_data,
                required: s.attr('data-required') == "true",
                validType: s.attr('data-validtype'),
                missingMessage: s.attr('data-missingmessage')
            };
        }
        config = getFinalOptions(s, config);
        s.combobox(config);
    }
    function checkbox_init(opts, s) {
        opts.checkboxList.push(s);
        var config = {
            checkedValue: s.attr("checkedvalue"),
            unCheckedValue: s.attr("uncheckedvalue")
        };
        var onCheckChange = s.attr("oncheckchange");
        if (onCheckChange) config.onChange = function (checked) {
            try {
                eval(onCheckChange);
            }
            catch (e) { }
        }
        config = getFinalOptions(s, config);
        s.checkbox(config);
    }
    function datebox_init(opts, s) {
        opts.dateboxList.push(s);
        var config = {
            formatstring: s.attr('formatstring'),
            required: s.attr('data-required') == "true",
            validType: s.attr('data-validtype'),
            missingMessage: s.attr('data-missingmessage')
        };
        config = getFinalOptions(s, config);
        s.datebox(config);
    }
    function switchbutton_init(opts, s) {
        opts.switchbuttonList.push(s);
        var onCheckChange = s.attr("oncheckchange");
        var config = {
            checkedValue: s.attr("checkedvalue"),
            unCheckedValue: s.attr("uncheckedvalue"),
            //onText: s.attr("data-ontext"),
            //offText: s.attr("data-offtext")
        };
        if (onCheckChange) config.onChange = function (checked) {
            try {
                eval(onCheckChange);
            }
            catch (e) { }
        }
        config = getFinalOptions(s, config);
        s.switchbutton(config);
    }
    function tagbox_init(opts, s) {
        opts.tagboxList.push(s);
        var config = {};
        config = getFinalOptions(s, config);
        s.tagbox(config);
    }

    /*
     * 控件状态设置
     *=================*/
    function setStatus(target, status) {
        var opts = $.data(target, 'form').options;
        setCtrlsStatus(opts.textboxList, status, 'textbox');
        setCtrlsStatus(opts.comboboxList, status, 'combobox');
        setCtrlsStatus(opts.numberboxList, status, 'numberbox');
        setCtrlsStatus(opts.dateboxList, status, 'datebox');
        setCtrlsStatus(opts.textwindowList, status, 'textwindow');
        setCtrlsStatus(opts.checkboxList, status, 'checkbox');
        setCtrlsStatus(opts.switchbuttonList, status, 'switchbutton');
        setCtrlsStatus(opts.tagboxList, status, 'tagbox');
    }
    function setCtrlsStatus(arr, formStatus, t) {
        if (arr.length) {
            for (var i = 0, len = arr.length; i < len; i++) {
                var s = arr[i];
                ctrl_readonly(s, t, s.attr("data-" + formStatus + "Readonly") == 'true');
            }
        }
    }
    function ctrl_readonly(s, t, r) {
        switch (t) {
            case "textbox": {
                s.textbox("readonly", r); break;
            }
            case "textwindow": {
                s.textwindow("readonly", r); break;
            }
            case "numberbox": {
                s.numberbox("readonly", r); break;
            }
            case "combobox": {
                s.combobox("readonly", r); break;
            }
            case "checkbox": {
                s.checkbox("readonly", r); break;
            }
            case "datebox":
            case "datetimebox": {
                s.datebox('readonly', r); break;
            }
            case "switchbutton": {
                s.switchbutton('readonly', r); break;
            }
            case "tagbox": {
                s.tagbox('readonly', r); break;
            }
            default: break;
        }
    }

    /*
     * 默认值设置
     *=================*/
    function setDefaultValue(target) {
        var opts = $.data(target, 'form').options;
        var data = {};
        ctrl_defaultValueSet(opts.textboxList, data);
        ctrl_defaultValueSet(opts.textwindowList, data);
        ctrl_defaultValueSet(opts.numberboxList, data);
        ctrl_defaultValueSet(opts.dateboxList, data);
        ctrl_defaultValueSet(opts.comboboxList, data);
        ctrl_defaultValueSet(opts.checkboxList, data);
        ctrl_defaultValueSet(opts.switchbuttonList, data);
        ctrl_defaultValueSet(opts.tagboxList, data);
        ctrl_defaultValueSet(opts.mxInputList, data);
        $(target).form('load', data);
    }
    function ctrl_defaultValueSet(arr, data) {
        if (arr.length) {
            for (var i = 0; i < arr.length; i++) {
                var s = arr[i];
                var dftvalue = s.attr("defaultvalue");
                var id = s.attr("id"), cls = s.attr("class");
                if (!emer.isNullOrEmpty(dftvalue)) {
                    var v = '', t = dftvalue.split(',')[0];
                    switch (t) {
                        case "sysdate": {
                            //系统时间
                            var formatstring = s.attr('formatstring');
                            v = emf.DateFormatter({ date: new Date(), formatstring: formatstring });
                            break;
                        }
                        case "serverdate": {
                            //服务器时间
                            var formatstring = s.attr('formatstring'), target = "#" + id;
                            emer.ajax({
                                url: app.url('/Utils/Query'),
                                data: {
                                    select: "to_char(sysdate,'yyyy/MM/dd HH24:mi:ss') SERVERDATE",
                                    from: 'dual'
                                },
                                success: function (r) {
                                    if (r.data && r.data.length) {
                                        v = emf.DateFormatter({ date: new Date(r.data[0].SERVERDATE), formatstring: formatstring });
                                        $(target).textbox('setValue', v);
                                    }
                                },
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
                                    v = emf.DateFormatter({ date: new Date(), formatstring: formatstring });
                                    $(target).textbox('setValue', v);
                                }
                            });
                            break;
                        }
                        case "uuid": { v = emer.guid(); break; }
                        case "user": {
                            //登录用户
                            v = emer.loginUser.UserCode + ';' + emer.loginUser.UserName;
                            if (s.hasClass('mxOa_Input')) {
                                v = emer.loginUser.UserCode;
                            }
                            break;
                        }
                        case "user_dis": {
                            //只显示的控件默认值赋值
                            v = emer.loginUser.UserCode + '[' + emer.loginUser.UserName + ']';
                            break;
                        }
                        case "userCode": {
                            v = emer.loginUser.UserCode; break;//登录用户MV001
                        }
                        case "dept": {
                            v = emer.loginUser.DeptCode + ';' + emer.loginUser.DeptFullName; break;//登录部门
                        }
                        case "dept_emf": {
                            v = emer.loginUser.DeptCode + ';' + emf.gcBmqcFormatter(emer.loginUser.DeptFullName); break;//登录部门
                        }
                        case "dept_dis": {
                            //只显示的控件默认值赋值
                            v = emer.loginUser.DeptCode + '[' + emer.loginUser.DeptFullName + ']';
                            break;
                        }
                        case "BillNo": {
                            //单号
                            if (app.options) {
                                var targetId = dftvalue.split(',')[2];
                                emer.ajax({
                                    url: app.url('/Utils/GetBillNo'),
                                    data: {
                                        table: app.options.moduleInfo.masterTable,
                                        field: dftvalue.split(',')[1]
                                    },
                                    emerSuccess: function (r) {
                                        $("#" + targetId).textbox('setValue', r.data);
                                    }
                                });
                            }
                            break;
                        }
                        case "NextBH": {
                            //下一个编号
                            if (app.options) {
                                var arr_v = dftvalue.split(',');
                                var targetId = arr_v[2];
                                var db = '0';
                                if (arr_v.length > 3) db = arr_v[3];
                                emer.ajax({
                                    url: app.url('/Utils/GetNextBH'),
                                    data: {
                                        table: app.options.moduleInfo.masterTable,
                                        field: arr_v[1],
                                        db: db
                                    },
                                    emerSuccess: function (r) {
                                        $("#" + targetId).textbox('setValue', r.data);
                                    }
                                });
                            }
                            break;
                        }
                        case "CurrentPeriod"://渠道当前期间
                        case "HrSalCurrentPeriod"://工资管理当前期间
                        case "MtCurrentPeriod": {//物料管理当前期间
                            var from = (t == 'CurrentPeriod' && 'CMBASEHED') || (t == 'HrSalCurrentPeriod' && 'SALBASEHED') || (t == 'MtCurrentPeriod' && 'MTBASEHED'),
                                target = "#" + id;
                            emer.ajax({
                                url: app.url('/Utils/Query'),
                                data: {
                                    select: 'FVALUES',
                                    from: from,
                                    where: "FKEY = 'CurrentPeriod'"
                                },
                                emerSuccess: function (r) {
                                    if (r.data && r.data.length) $(target).textbox('setValue', r.data[0].FVALUES);
                                }
                            });
                            break;
                        }
                        default: { v = dftvalue; break; }
                    }
                    if (s.hasClass("easyui-textwindow")) {
                        data[id] = v.split(";")[0];
                        data[id + '_DISPLAY'] = v.split(";")[1];
                    }
                    else data[id] = v;
                }
            }
        }
    }

    /*
     * 加载数据
     *=================*/
    function loadData(target, data) {
        var opts = $.data(target, 'form').options;
        //textboxList
        if (opts.textboxList.length) {
            for (var i = 0, len = opts.textboxList.length; i < len; i++) {
                var id = opts.textboxList[i].attr('id');
                $("#" + id).textbox('setValue', data[id]);
            }
        }
        //textwindowList
        if (opts.textwindowList.length) {
            for (var i = 0, len = opts.textwindowList.length; i < len; i++) {
                var control = opts.textwindowList[i],
                    ctrl_opts = control.textwindow('options'),
                    id = ctrl_opts.id.toUpperCase(),
                    displayType = ctrl_opts.displayType || 'all';

                var value = data[id], text = data[id + '_DISPLAY'];
                value = emer.isNullOrEmpty(value) ? "" : value;
                text = emer.isNullOrEmpty(text) ? "" : text;
                control.textwindow('setValue', value).textwindow('setText', displayType == 'all' ? text : value);
            }
        }
        //numberboxList
        if (opts.numberboxList.length) {
            for (var i = 0, len = opts.numberboxList.length; i < len; i++) {
                var id = opts.numberboxList[i].attr('id');
                $("#" + id).numberbox('setValue', data[id]);
            }
        }
        //comboboxList
        if (opts.comboboxList.length) {
            for (var i = 0, len = opts.comboboxList.length; i < len; i++) {
                var id = opts.comboboxList[i].attr('id');
                $("#" + id).combobox('setValue', data[id]);
            }
        }
        //dateboxList
        if (opts.dateboxList.length) {
            for (var i = 0, len = opts.dateboxList.length; i < len; i++) {
                var id = opts.dateboxList[i].attr('id'), v = data[id] || '';
                $("#" + id).datebox('setValue', v.replace('T', ' '));
            }
        }
        //checkboxList
        if (opts.checkboxList.length) {
            for (var i = 0, len = opts.checkboxList.length; i < len; i++) {
                var id = opts.checkboxList[i].attr('id');
                $("#" + id).checkbox('setValue', data[id]);
            }
        }
        //switchbuttonList
        if (opts.switchbuttonList.length) {
            for (var i = 0, len = opts.switchbuttonList.length; i < len; i++) {
                var id = opts.switchbuttonList[i].attr('id');
                $("#" + id).switchbutton('setValue', data[id]);
            }
        }
        //tagboxList
        if (opts.tagboxList.length) {
            for (var i = 0, len = opts.tagboxList.length; i < len; i++) {
                var id = opts.tagboxList[i].attr('id');
                $("#" + id).tagbox('setValue', data[id]);
            }
        }
        //mxInputList
        if (opts.mxInputList.length) {
            for (var i = 0, len = opts.mxInputList.length; i < len; i++) {
                var id = opts.mxInputList[i].attr('id');
                $("#" + id).val(data[id]);
            }
        }
    }
    function validate(target) {
        var opts = $.data(target, 'form').options;
        var $invalid = $(target).find(".is-invalid");
        return $invalid.length == 0;
    }

    function reset(target) {
        target.reset();
        var $from = $(target);
        $from.form("load", {});
    }

    function serializeJson(target) {
        var opts = $.data(target, 'form').options;
        var $from = $(target);
        var o = app.serializeJson($from);
        //注：input=checkbox禁用时 serializeArray 序列化不到
        //switchbutton取值处理
        if (opts.switchbuttonList.length) {
            $.each(opts.switchbuttonList, function (i, swbtn) {
                var checked = swbtn.switchbutton('options').checked;
                o[swbtn.attr('id')] = emer.doEscape(checked ? swbtn.attr("checkedvalue") : swbtn.attr("uncheckedvalue"));
            });
        }
        if (opts.checkboxList.length) {
            $.each(opts.checkboxList, function (i, chk) {
                var checked = chk.checkbox('options').checked;
                o[chk.attr('id')] = emer.doEscape(checked ? chk.attr("checkedvalue") : chk.attr("uncheckedvalue"));
            });
        }
        return o;
    }

    $.fn.form = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.form.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'form');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, 'form', {
                    options: $.extend(true, {}, $.fn.form.defaults, options)
                });
                init(this);
            }
        });
    };
    $.fn.form.methods = {
        options: function (jq) {
            return $.data(jq[0], 'form').options;
        },
        clear: function (jq) {
        },
        reset: function (jq) {
            return jq.each(function () {
                reset(this);
            });
        },
        setStatus: function (jq, status) {
            setStatus(jq[0], status);
        },
        load: function (jq, data) {
            loadData(jq[0], data);
        },
        setDefaultValue: function (jq) {
            return jq.each(function () {
                setDefaultValue(this);
            });
        },
        validate: function (jq) {
            return validate(jq[0]);
        },
        invalidFocus: function (jq) {
            $(jq[0]).find(".is-invalid")
                .filter(":not(:disabled):first")
                .closest("div.form-group")
                .find("input,textarea")
                .focus();
        },
        serializeJson: function (jq) {
            return serializeJson(jq[0]);
        }
    };
    $.fn.form.defaults = {
        id: '',

        mxInputList: [],//非bootstrap控件集合
        textboxList: [],
        comboboxList: [],
        numberboxList: [],
        dateboxList: [],
        checkboxList: [],
        textwindowList: [],
        switchbuttonList: [],
        tagboxList: [],

        validRules: {
            phoneRex: {
                validator: function (value) {
                    return emer.reg.phone(value);
                },
                message: '请输入正确电话或手机格式'
            },
            mobileRex: {
                validator: function (value) {
                    return emer.reg.mobile(value);
                },
                message: '请输入正确手机格式'
            },
            idcared: {
                validator: function (value) {
                    return emer.isIdCard(value);
                },
                message: '不是有效的身份证号码'
            },
            isNumber: {
                validator: function (value) {
                    return emer.reg.isNumber(value);
                },
                message: '只能输入数字，请去掉空格与非数字字符'
            },
            greaterThan0: {
                validator: function (value) {
                    value = parseFloat(value);
                    return value > 0;
                },
                message: '数字需大于0'
            }
        }
    };
})(jQuery);
