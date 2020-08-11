/*========================================
 * jquery.bootstrap.textbox
 * add by wangshw 2019-05-08
 *========================================*/
(function ($) {
    var addon_index = 0;
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "textbox_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("textboxName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox">');
        if (opts.label) {
            arr_htm.push('<label for="' + opts.id + '_input_group">' + opts.label + '</label>');
            arr_htm.push('<span class="view-label" style="display:none;"></span>');
        }
        arr_htm.push('<div class="input-group input-group-sm" style="display:none;">');
        if (opts.prepend.length) {
            arr_htm.push('<div class="input-group-prepend"></div>');
        }
        if (opts.multiline) {
            arr_htm.push('<textarea class="form-control textbox-value" name="' + opts.name + '" placeholder="' + opts.prompt
                + '" aria-label="' + (opts.prompt || opts.label || '') + '"></textarea>');
        }
        else {
            arr_htm.push('<input class="form-control textbox-value" name="' + opts.name + '" type="' + opts.type + '" placeholder="' + opts.prompt
                + '" aria-label="' + (opts.prompt || opts.label || '') + '">');
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
        opts.$textbox = opts.$inputGroup.find(".textbox-value");
        opts.$feedback = opts.$fromGroup.find(".invalid-feedback");

        if (opts.required) {
            opts.$textbox.attr("required", true).addClass("is-invalid");
        }

        addon_init(target);

        var e_data = { target: target };
        opts.$textbox.on('focus', function (e) {
            var _target = e.target;
            setTimeout(function () {
                _target.scrollIntoViewIfNeeded(true);
            }, 500);
        }).on('blur', e_data, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            var oldValue = opts.value, newValue = $(this).val();
            onChange_call(_target, newValue, oldValue);
        });
        if (opts.multiline) {
            opts.$textbox.on("input", function () {
                this.style.height = 'auto';
                $(this).height(this.scrollHeight);
            });
        }

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

            opts.$textbox.removeClass("is-invalid");
            opts.$feedback.hide();
            //opts.$textbox.attr("readonly", "readonly").removeClass("form-control").addClass("form-control-plaintext");
        } else {
            opts.$inputGroup.show();
            opts.$viewLable.hide();
            onValidate(target);

            setScrollHeight(target);
            //opts.$textbox.removeAttr("readonly").removeClass("form-control-plaintext").addClass("form-control");
        }
    }
    function setValue(target, value) {
        var opts = getOptions(target);
        var newValue = value || '';
        var oldValue = opts.$textbox.val();
        onChange_call(target, newValue, oldValue);
        if (!opts.readonly && newValue != oldValue) {
            setScrollHeight(target);
        }
    }
    function setViewLableText(target) {
        var opts = getOptions(target);
        var txt = opts.$textbox.val();
        if (opts.multiline) {
            txt = txt.replace(/\n/g, "<br/>");
        }
        opts.$viewLable.html(txt);
    }
    function onChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        if (oldValue != newValue) {
            opts.value = newValue;
            opts.$textbox.val(newValue);
            setViewLableText(target);
            onValidate(target);
            opts.onChange.call(target, newValue, oldValue);
        }
    }
    function onValidate(target) {
        var opts = getOptions(target);
        if (opts.required)
            app.bsValidate({
                value: opts.$textbox.val(),
                validType: opts.validType,
                $input: opts.$textbox,
                $feedback: opts.$feedback
            });
    }

    function setScrollHeight(target) {
        var opts = getOptions(target);
        if (opts.multiline) {
            var h = opts.$textbox[0].scrollHeight;
            h = h < 30 ? 50 : h;//防止bs modal 中初始化控件，modal hide时 scrollHeight 取值错误。
            opts.$textbox.height(h);
        }
    }
    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            addon_index = 0;
            opts.$fromGroup.remove();
        }
    }
    function getOptions(target) {
        return $.data(target, "textbox").options;
    }
    $.fn.textbox = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.textbox.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "textbox");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "textbox", {
                    options: $.extend(true, {}, $.fn.textbox.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.textbox.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$textbox.val();
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
        setScrollHeight: function (jq) {
            return jq.each(function () {
                setScrollHeight(this);
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
    $.fn.textbox.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $fromGroup: null,//from-group
        $viewLable: null,//view-lable
        $inputGroup: null,//input-group
        $textbox: null,//textbox-value input
        $feedback: null,

        prepend: [],
        append: [],

        type: 'text',//文本框类型。可用值有：text,password,tel。
        value: '',
        readonly: false,

        required: false,
        validType: null,
        missingMessage: '请填写此字段！',
        invalidMessage: null,

        multiline: false,
        prompt: '',
        label: null,

        bsHelpText: null,//bootstrap Help text

        onChange: function (newValue, oldValue) {
        }
    };
})(jQuery);
