/*========================================
 * jquery.bootstrap.combobox
 * add by wangshw 2019-05-15
 *========================================*/
(function ($) {
    var addon_index = 0;
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "combobox_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("comboboxName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox bootstrap-combobox">');
        if (opts.label) {
            arr_htm.push('<label for="' + opts.id + '_input_group">' + opts.label + '</label>');
            arr_htm.push('<span class="view-label" style="display:none;"></span>');
        }
        arr_htm.push('<div class="input-group input-group-sm" style="display:none;">');
        if (opts.prepend.length) {
            arr_htm.push('<div class="input-group-prepend"></div>');
        }
        arr_htm.push('<select class="form-control combobox-value" name="' + opts.name + '" placeholder="' + opts.prompt
            + '" aria-label="' + (opts.prompt || opts.label || '') + '"></select>');
        if (opts.append.length) {
            arr_htm.push('<div class="input-group-append"></div>');
        }
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
        opts.$combobox = opts.$inputGroup.find(".combobox-value");
        opts.$feedback = opts.$fromGroup.find(".invalid-feedback");

        if (opts.required) {
            opts.$combobox.attr("required", true).addClass("is-invalid");
        }

        addon_init(target);
        loadData(target, opts.data);

        opts.$combobox.bind("change", { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            var oldValue = opts.value, newValue = $(this).val();
            onChange_call(_target, newValue, oldValue);
        });

        readonly(target, opts.readonly);
        if (!emer.isNullOrEmpty(opts.value)) {
            setValue(target, opts.value);
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
            opts.$combobox.removeClass("is-invalid");
            opts.$feedback.hide();
        } else {
            opts.$inputGroup.show();
            opts.$viewLable.hide();
            onValidate(target);
        }
    }
    function loadData(target, data) {
        var opts = getOptions(target);
        var $select = opts.$combobox;
        $select.empty();
        for (var i = 0; i < data.length; i++) {
            $select.append('<option value="' + data[i][opts.valueField] + '">' + data[i][opts.textField] + '</option>');
        }
        opts.data = data;
        setValue(target, opts.value);
    }

    function setViewLableText(target) {
        var opts = getOptions(target);
        opts.$viewLable.html(opts.$combobox.find("option:selected").text());
    }
    function onChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        if (oldValue != newValue) {
            opts.value = newValue;
            opts.$combobox.val(newValue);
            setViewLableText(target);
            onValidate(target);
            opts.onChange.call(target, newValue, oldValue);
        }
    }
    function onValidate(target) {
        var opts = getOptions(target);
        if (opts.required)
            app.bsValidate({
                value: opts.$combobox.val(),
                validType: opts.validType,
                $input: opts.$combobox,
                $feedback: opts.$feedback
            });
    }
    function setValue(target, value) {
        var opts = getOptions(target);
        var newValue = value || '';
        var oldValue = opts.$combobox.val();
        onChange_call(target, newValue, oldValue);
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            addon_index = 0;
            opts.$fromGroup.remove();
        }
    }
    function getOptions(target) {
        return $.data(target, "combobox").options;
    }
    $.fn.combobox = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.combobox.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "combobox");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "combobox", {
                    options: $.extend(true, {}, $.fn.combobox.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.combobox.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$combobox.val() || "";
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
        getData: function (jq) {
            return getOptions(jq[0]).data;
        },
        loadData: function (jq, data) {
            return jq.each(function () {
                loadData(this, data);
            });
        },

        destroy: function (jq) {
            return jq.each(function () {
                destroy(this);
            });
        }
    };
    $.fn.combobox.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $fromGroup: null,//from-group
        $viewLable: null,//view-lable
        $inputGroup: null,//input-group
        $combobox: null,//combobox-value input
        $feedback: null,

        prepend: [],
        append: [],

        prompt: '',
        label: null,

        bsHelpText: null,//bootstrap Help text

        value: '',
        readonly: false,

        valueField: 'label',
        textField: 'value',

        required: false,
        validType: null,
        missingMessage: '请选择此字段信息！',
        invalidMessage: null,

        data: [],
        url: undefined,//远程加载处理，暂未实现

        onChange: function (newValue, oldValue) {
        }
    };
})(jQuery);
