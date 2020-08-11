/*========================================
 * jquery.bootstrap.numberbox
 * add by wangshw 2019-05-21
 *========================================*/
(function ($) {
    var addon_index = 0;
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "numberbox_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("numberboxName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox bootstrap-numberbox">');
        if (opts.label) {
            arr_htm.push('<label for="' + opts.id + '_input_group">' + opts.label + '</label>');
            arr_htm.push('<span class="view-label" style="display:none;"></span>');
        }
        arr_htm.push('<div class="input-group input-group-sm" style="display:none;">');

        if (opts.prefix) {
            opts.prepend.push(getPrefix(target));
        }
        if (opts.prepend.length) {
            arr_htm.push('<div class="input-group-prepend"></div>');
        }
        arr_htm.push('<input class="form-control numberbox-value" name="' + opts.name + '" type="number" placeholder="' + opts.prompt
                + '" aria-label="' + (opts.prompt || opts.label || '') + '">');
        if (opts.suffix) {
            opts.append.push(getSuffix(target));
        }
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
        opts.$numberbox = opts.$inputGroup.find(".numberbox-value");
        opts.$feedback = opts.$fromGroup.find(".invalid-feedback");

        if (opts.required) {
            opts.$numberbox.attr("required", true).addClass("is-invalid");
        }

        addon_init(target);

        var regTxt = /[^\-?\d]/g;//只能输入数字
        if (opts.precision > 0) {
            regTxt = /[^\-?\d.]/g;//只能输入数字和小数点
        }
        opts.$numberbox
            .css("ime-mode", "disabled") //CSS设置输入法不可用
            .on('keyup', function () {
                $(this).val($(this).val().replace(regTxt, ''));
            })
            .on("paste", function () {  //CTR+V事件处理    
                $(this).val($(this).val().replace(regTxt, ''));
            })
            .on('blur', { target: target }, function (e) {
                var _target = e.data.target;
                var opts = getOptions(_target);
                var oldValue = opts.value, newValue = $(this).val();
                onChange_call(_target, newValue, oldValue);
            })
            .on('focus', function (e) {
                var _target = e.target;
                setTimeout(function () {
                    _target.scrollIntoViewIfNeeded(true);
                }, 500);
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
    function getPrefix(target) {
        var opts = getOptions(target);
        return {
            type: "label",
            text: opts.prefix
        }
    }
    function getSuffix(target) {
        var opts = getOptions(target);
        return {
            type: "label",
            text: opts.suffix
        }
    }

    function readonly(target, mode) {
        var opts = getOptions(target);
        opts.readonly = mode == undefined ? true : mode;
        if (opts.readonly) {
            opts.$inputGroup.hide();
            setViewLableText(target);
            opts.$viewLable.show();
            opts.$numberbox.removeClass("is-invalid");
            opts.$feedback.hide();
        } else {
            opts.$inputGroup.show();
            opts.$viewLable.hide();
            onValidate(target);
        }
    }

    function setViewLableText(target) {
        var opts = getOptions(target);
        opts.$viewLable.html(opts.$numberbox.val());
    }
    function setValue(target, value) {
        var oldValue = getOptions(target).$numberbox.val();
        onChange_call(target, value, oldValue);
    }
    function value_deal(target, value) {
        var opts = getOptions(target);
        var v = emer.isNullOrEmpty(value) ? 0 : parseFloat(value);
        if (opts.max) {
            v = v > parseFloat(opts.max) ? parseFloat(opts.max) : v;
        }
        if (opts.min) {
            v = v < parseFloat(opts.min) ? parseFloat(opts.min) : v;
        }
        opts.precision = emer.isNullOrEmpty(opts.precision) ? 0 : parseFloat(opts.precision);
        v = parseFloat(v.toFixed(opts.precision));
        return v;
    }
    function onChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        var str_oldValue = oldValue + '',
            str_newValue = newValue + '';
        if (str_oldValue != str_newValue) {
            //oldValue = emer.isNullOrEmpty(oldValue) ? 0 : parseFloat(oldValue);
            newValue = value_deal(target, newValue);
            opts.value = newValue;
            opts.$numberbox.val(newValue);
            setViewLableText(target);
            onValidate(target);
            opts.onChange.call(target, newValue, oldValue);
        }
    }
    function onValidate(target) {
        var opts = getOptions(target);
        if (opts.required)
            app.bsValidate({
                value: opts.$numberbox.val(),
                validType: opts.validType,
                $input: opts.$numberbox,
                $feedback: opts.$feedback
            });
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            addon_index = 0;
            opts.$fromGroup.remove();
            if (opts.prefix) {
                emer.removeArrayItem(opts.prepend, getPrefix(target));
            }
            if (opts.suffix) {
                emer.removeArrayItem(opts.append, getSuffix(target));
            }
        }
    }
    function getOptions(target) {
        return $.data(target, "numberbox").options;
    }
    $.fn.numberbox = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.numberbox.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "numberbox");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "numberbox", {
                    options: $.extend(true, {}, $.fn.numberbox.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.numberbox.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$numberbox.val();
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
        setLabel: function (jq, label) {
            return jq.each(function () {
                var opts = getOptions(this);
                opts.label = label;
                opts.$fromGroup.find("label").html(label);
            });
        },

        destroy: function (jq) {
            return jq.each(function () {
                destroy(this);
            });
        }
    };
    $.fn.numberbox.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $fromGroup: null,//from-group
        $viewLable: null,//view-lable
        $inputGroup: null,//input-group
        $numberbox: null,//numberbox-value input
        $feedback: null,

        prepend: [],
        append: [],

        prompt: '',
        label: null,

        bsHelpText: null,//bootstrap Help text

        value: undefined,
        readonly: false,

        required: false,
        validType: null,
        missingMessage: '请填写数字！',
        invalidMessage: null,

        min: null,
        max: null,
        precision: 0,

        prefix: '',
        suffix: '',

        onChange: function (newValue, oldValue) {
        }
    };
})(jQuery);
