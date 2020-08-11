/*========================================
 * jquery.bootstrap.switchbutton
 * add by wangshw 2019-05-22
 *========================================*/
(function ($) {
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "switchbutton_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("switchbuttonName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox form-check-inline bootstrap-switchbutton">');
        arr_htm.push('<div class="custom-control custom-switch">');
        var id_switch = opts.id + '_switch_input';
        if (opts.labelPosition == 'after') {
            opts.label = opts.label.replaceAll(':', '').replaceAll('：', '');
        }
        var lbl_htm = '<label class="custom-control-label" for="' + id_switch + '">' + opts.label + '</label>'
        if (opts.labelPosition == 'before') {
            arr_htm.push(lbl_htm);
        }
        arr_htm.push('<input type="checkbox" class="custom-control-input switchbutton-value" value="" id="' + id_switch + '" name="' + opts.name
            + '" aria-label="' + (opts.prompt || opts.label || '') + '">');
        if (opts.labelPosition == 'after') {
            arr_htm.push(lbl_htm);
        }
        arr_htm.push('</div>');//end custom-control
        if (opts.bsHelpText) {
            arr_htm.push('<small class="form-text text-muted">' + opts.bsHelpText + '</small>');
        }
        arr_htm.push('</div>');//end form-group

        opts.$fromGroup = $(arr_htm.join('')).insertAfter($(target));
        opts.$inputGroup = opts.$fromGroup.find(".custom-control");
        opts.$switchbutton = opts.$inputGroup.find(".switchbutton-value");

        opts.$switchbutton.on("change", { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            var checked = $(this).prop('checked');
            onChange_call(_target, checked);
        });

        readonly(target, opts.readonly);
        if (!emer.isNullOrEmpty(opts.value)) {
            setValue(target, opts.value);
        }
    }

    function readonly(target, mode) {
        var opts = getOptions(target);
        opts.readonly = mode == undefined ? true : mode;
        if (opts.readonly) {
            opts.$switchbutton.attr("disabled", "disabled");
        } else {
            opts.$switchbutton.removeAttr("disabled");
        }
    }
    function setValue(target, value) {
        var opts = getOptions(target);
        var newValue = value || opts.unCheckedValue;
        var checked = newValue == opts.checkedValue;
        if (checked)
            opts.$switchbutton.attr("checked", 'checked');
        else
            opts.$switchbutton.removeAttr("checked");
        onChange_call(target, checked);
    }
    function onChange_call(target, checked) {
        var opts = getOptions(target);
        opts.checked = checked;
        opts.value = checked ? opts.checkedValue : opts.unCheckedValue;
        opts.$switchbutton.val(opts.value);

        opts.onChange.call(target, checked);
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            opts.$fromGroup.remove();
        }
    }
    function getOptions(target) {
        return $.data(target, "switchbutton").options;
    }
    $.fn.switchbutton = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.switchbutton.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "switchbutton");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "switchbutton", {
                    options: $.extend(true, {}, $.fn.switchbutton.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.switchbutton.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$switchbutton.val();
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
    $.fn.switchbutton.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $fromGroup: null,//from-group
        $viewLable: null,//view-lable
        $inputGroup: null,//input-group
        $switchbutton: null,//switchbutton-value input

        label: null,
        labelPosition: 'after',//'before','after'
        prompt: '',

        bsHelpText: null,//bootstrap Help text

        value: null,
        checked: false,
        readonly: false,

        checkedValue: true,
        unCheckedValue: false,

        onChange: function (checked) {
        }
    };
})(jQuery);
