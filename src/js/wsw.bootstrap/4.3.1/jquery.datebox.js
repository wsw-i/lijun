/*==============================================
 * jquery.bootstrap.datebox
 * add by wangshw 2019-05-22
 * 依赖于 bootstrap扩展插件datetimepicker
 *==============================================*/
(function ($) {
    $.fn.datetimepicker.dates['zh-CN'] = {
        days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
        daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        today: "今天",
        clear: "清除",
        suffix: [],
        meridiem: ["上午", "下午"]
    };
}(jQuery));

(function ($) {
    var addon_index = 0;
    var append_calendar = {
        type: "button",
        cls: 'btn-primary',
        iconCls: 'fa fa-calendar ',
        handler: function (e) {
            var opts = getOptions(e.data.target);
            opts.$datebox.datetimepicker('show');
        }
    };
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "datebox_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("dateboxName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox bootstrap-datebox">');
        if (opts.label) {
            arr_htm.push('<label for="' + opts.id + '_input_group">' + opts.label + '</label>');
            arr_htm.push('<span class="view-label" style="display:none;"></span>');
        }
        arr_htm.push('<div class="input-group input-group-sm" style="display:none;">');
        if (opts.prepend.length) {
            arr_htm.push('<div class="input-group-prepend"></div>');
        }
        arr_htm.push('<input class="form-control datebox-value" name="' + opts.name + '" type="text" placeholder="' + opts.prompt
            + '" aria-label="' + (opts.prompt || opts.label || '') + '" readonly>');

        opts.append.push(append_calendar);
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
        opts.$datebox = opts.$inputGroup.find(".datebox-value");
        opts.$feedback = opts.$fromGroup.find(".invalid-feedback");

        datetimepicker_init(target);

        if (opts.required) {
            opts.$datebox.attr("required", true).addClass("is-invalid");
        }

        opts.$datebox.unbind('click focus').bind('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.$datebox.datetimepicker('show');
        });

        addon_init(target);
        readonly(target, opts.readonly);
        if (opts.value) {
            setValue(target, opts.value);
        }
    }
    function datetimepicker_init(target) {
        var opts = getOptions(target);

        var todayBtn = true;
        var format = 'yyyy-mm-dd hh:ii';
        var startView = 'month';
        var minView = 'hour';

        format = opts.formatstring.toLowerCase().replace(":mi", ':ii').replace(':ss', '');
        switch (format) {
            case "yyyy": {
                startView = 'decade';
                minView = 'decade';
                todayBtn = false;
                break;
            }
            case "yyyy-mm":
            case "yyyymm": {
                startView = 'year';
                minView = 'year';
                todayBtn = false;
                break;
            }
            case "yyyy-mm-dd":
            case "yyyymmdd": {
                startView = 'month';
                minView = 'month';
                break;
            }
            default: break;
        }
        opts.$datebox.datetimepicker({
            language: 'zh-CN',
            fontAwesome: true,
            format: format,
            autoclose: true,
            //todayBtn: todayBtn,
            //clearBtn: true,
            startView: startView,
            minView: minView,
            viewSelect: minView
        }).on('changeDate', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            var oldValue = opts.value;
            var newValue = opts.$datebox.val();
            onChange_call(_target, newValue, oldValue);
        }).on('show', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            opts.$modal.modal('show');
        }).on('beforehide', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            opts.$modal.modal('hide');
        }).on('show.bs.modal', function (e) {
            e.preventDefault();//停止事件的触发
            e.stopPropagation();//阻止事件向上或向下冒泡
        }).on('shown.bs.modal', function (e) {
            e.preventDefault(); e.stopPropagation();
        }).on('hide.bs.modal', function (e) {
            e.preventDefault(); e.stopPropagation();
        }).on('hidden.bs.modal', function (e) {
            e.preventDefault(); e.stopPropagation();
        });

        opts.$picker = opts.$datebox.data('datetimepicker').picker;
        $(document).off('mousedown touchend', opts.$picker.clickedOutside);

        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-datebox-modal" tabindex="-1" role="dialog">');
        arr_htm.push('<div class="modal-dialog modal-dialog-centered" role="document">');
        arr_htm.push(' <div class="modal-content">');
        arr_htm.push(' <div class="modal-body">');
        arr_htm.push('</div>');

        arr_htm.push(' <div class="modal-footer">');
        arr_htm.push('<a class="btn btn-primary btn-sm today" href="javascript:;" role="button">今天</a>');
        arr_htm.push('<a class="btn btn-secondary btn-sm clear" href="javascript:;" role="button">清除</a>');
        arr_htm.push('<a class="btn btn-secondary btn-sm btn-close" href="javascript:;" role="button">关闭</a>');
        arr_htm.push('</div>');

        arr_htm.push('</div>');
        arr_htm.push('</div>');
        arr_htm.push('</div>');

        opts.$modal = $(arr_htm.join('')).appendTo('body');
        opts.$picker.appendTo(opts.$modal.find('.modal-body'));
        opts.$modal.modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });

        opts.$modal.find(".modal-footer .today").on('click', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            opts.$datebox.datetimepicker('today');
        });
        opts.$modal.find(".modal-footer .clear").on('click', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            opts.$datebox.datetimepicker('clear');
        });
        opts.$modal.find(".modal-footer .btn-close").on('click', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            opts.$datebox.datetimepicker('hide');
        });
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
            opts.$datebox.removeClass("is-invalid");
            opts.$feedback.hide();
        } else {
            opts.$inputGroup.show();
            opts.$viewLable.hide();
            onValidate(target);
        }
    }
    function setViewLableText(target) {
        var opts = getOptions(target);
        var v = opts.$datebox.val();
        if (v) {
            v = opts.$datebox.datetimepicker('getFormattedDate')
        }
        opts.$viewLable.html(v);
    }
    function onChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        if (oldValue != newValue) {
            opts.$datebox.datetimepicker('update', newValue);
            opts.value = newValue;
            var v = newValue ? opts.$datebox.datetimepicker('getFormattedDate') : '';
            opts.$datebox.val(v);
            setViewLableText(target);
            onValidate(target);
            opts.onChange.call(target, newValue, oldValue);
        }
    }
    function onValidate(target) {
        var opts = getOptions(target);
        if (opts.required)
            app.bsValidate({
                value: opts.$datebox.val(),
                validType: opts.validType,
                $input: opts.$datebox,
                $feedback: opts.$feedback
            });
    }
    function setValue(target, value) {
        var opts = getOptions(target);
        var newValue = value || '';
        var oldValue = opts.$datebox.val();
        onChange_call(target, newValue, oldValue);
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            addon_index = 0;
            opts.$fromGroup.remove();
            opts.$modal.remove();
            emer.removeArrayItem(opts.append, append_calendar);
        }
    }
    function getOptions(target) {
        return $.data(target, "datebox").options;
    }
    $.fn.datebox = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.datebox.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "datebox");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "datebox", {
                    options: $.extend(true, {}, $.fn.datebox.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.datebox.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$datebox.val();
        },
        setValue: function (jq, value) {
            return jq.each(function () {
                setValue(this, value);
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
    $.fn.datebox.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $fromGroup: null,//from-group
        $viewLable: null,//view-lable
        $inputGroup: null,//input-group
        $datebox: null,//datebox-value input
        $feedback: null,

        prepend: [],
        append: [],

        value: '',
        readonly: false,

        required: false,
        validType: null,
        missingMessage: '请选择日期！',
        invalidMessage: null,

        prompt: '',
        label: null,

        bsHelpText: null,//bootstrap Help text

        onChange: function (newValue, oldValue) {
        }
    };

    $.fn.datetimebox = $.fn.datebox;
})(jQuery);
