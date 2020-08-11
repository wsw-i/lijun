/*========================================
 * jquery.bootstrap.tagbox
 * add by wangshw 2019-05-24
 *========================================*/
(function ($) {
    var addon_index = 0;
    var append_plus = {
        type: "button",
        cls: 'btn-primary',
        iconCls: 'fa fa-plus',
        handler: function (e) {
            var opts = getOptions(e.data.target);
            if (opts.onBeforeAddTagClick.call()) {
            }
        }
    };
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "tagbox_" + Math.random();
            opts.name = $(target).attr("name");
            $(target).removeAttr("name").attr("tagboxName", opts.name).hide();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        if (opts.icons.length) {
            for (var i = 0; i < opts.icons.length; i++) {
                var icon = opts.icons[i];
                if (icon.iconCls == "icon-add") {
                    append_plus.handler = icon.handler; continue;
                }
                var btn_append = {
                    type: "button",
                    cls: 'btn-primary',
                    iconCls: icon.iconCls,
                    handler: icon.handler
                };
                emer.removeArrayItem(opts.append, btn_append);
                opts.append.push(btn_append);
            }
        }

        var arr_htm = [];
        arr_htm.push('<div class="form-group bootstrap-textbox bootstrap-tagbox">');
        if (opts.label) {
            arr_htm.push('<label for="' + opts.id + '_input_group">' + opts.label + '</label>');
            arr_htm.push('<span class="view-label" style="display:none;"></span>');
        }
        arr_htm.push('<div class="input-group" style="display:none;">');
        arr_htm.push('<div class="d-flex w-100">');
        arr_htm.push('<div class="input-group-text tagbox-container flex-grow-1"></div>');
        arr_htm.push('<input class="tagbox-value" name="' + opts.name + '" type="hidden">');

        opts.append.push(append_plus);
        arr_htm.push('<div class="input-group-append align-self-start"></div>');
        arr_htm.push('</div>');//end d-flex
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
        opts.$valueInput = opts.$inputGroup.find(".tagbox-value");
        opts.$tagContainer = opts.$inputGroup.find(".tagbox-container");
        opts.$feedback = opts.$fromGroup.find(".invalid-feedback");

        if (opts.required) {
            opts.$valueInput.attr("required", true).addClass("is-invalid");
        }

        addon_init(target);
        readonly(target, opts.readonly);
        if (opts.value) {
            setValue(target, opts.value);
        }
    }
    function addon_init(target) {
        var opts = getOptions(target);
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

    function readonly(target, mode) {
        var opts = getOptions(target);
        opts.readonly = mode == undefined ? true : mode;
        if (opts.readonly) {
            opts.$inputGroup.hide();
            setViewLableText(target);
            opts.$viewLable.show();
            opts.$valueInput.removeClass("is-invalid");
            opts.$feedback.hide();
        } else {
            opts.$inputGroup.show();
            opts.$viewLable.hide();
            onValidate(target);
        }
    }
    function setViewLableText(target) {
        var opts = getOptions(target);
        opts.$viewLable.html(opts.$valueInput.val());
    }
    function setValue(target, value) {
        var opts = getOptions(target);
        var newValue = value || '';
        var oldValue = opts.$valueInput.val();
        onChange_call(target, newValue, oldValue);
    }
    function onChange_call(target, newValue, oldValue) {
        var opts = getOptions(target);
        onTagDataLoad(target, newValue);

        if (oldValue != newValue) {
            opts.value = newValue;
            opts.$valueInput.val(newValue);
            setViewLableText(target);
            onValidate(target);
            opts.onChange.call(target, newValue, oldValue);
        }
    }
    function onTagDataLoad(target, data) {
        var opts = getOptions(target);
        var arr_htm = [];
        if (data) {
            var tags = data.split(',');
            arr_htm.push('<div class="w-100 tags">');
            for (var i = 0, len = tags.length; i < len; i++) {
                arr_htm.push('<div class="alert alert-primary alert-dismissible" role="alert">');
                arr_htm.push('<span class="tag-text">' + tags[i] + '</span>');
                arr_htm.push('<a class="close" href="javascript:;" data-dismiss="alert" aria-label="Close" role="button">');
                arr_htm.push('<span aria-hidden="true">&times;</span>');
                arr_htm.push('</a>');
                arr_htm.push('</div>');
            }
            arr_htm.push('</div>');
        }
        $tags = $(arr_htm.join(''));
        opts.$tagContainer.empty().append($tags);

        //event
        $tags.find(".tag-text").off().on('click', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            var v = $(this).html();
            opts.onClickTag.call(_target, v);
        });
        $tags.find(".close").off().on('click', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            var v = $(this).closest("div.alert").find('.tag-text').html();
            var oldValue = opts.$valueInput.val();
            var tags = opts.$valueInput.val().split(',');
            tags.splice($.inArray(v, tags), 1);
            var newValue = tags.join(',');

            onChange_call(_target, newValue, oldValue)
        });
    }
    function onValidate(target) {
        var opts = getOptions(target);
        if (opts.required)
            app.bsValidate({
                value: opts.$valueInput.val(),
                validType: opts.validType,
                $input: opts.$valueInput,
                $feedback: opts.$feedback
            });
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$fromGroup) {
            addon_index = 0;
            opts.$fromGroup.remove();
            emer.removeArrayItem(opts.append, append_plus);
        }
    }
    function getOptions(target) {
        return $.data(target, "tagbox").options;
    }
    $.fn.tagbox = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.tagbox.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "tagbox");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "tagbox", {
                    options: $.extend(true, {}, $.fn.tagbox.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.tagbox.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        getValue: function (jq) {
            return getOptions(jq[0]).$valueInput.val();
        },
        setValue: function (jq, value) {
            return jq.each(function () {
                setValue(this, value);
            });
        },
        getValues: function (jq) {
            var value = getOptions(jq[0]).$valueInput.val();
            if (value)
                return value.split(',');
            return [];
        },
        setValues: function (jq, values) {
            return jq.each(function () {
                var value = values.join();
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
    $.fn.tagbox.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数

        $fromGroup: null,//from-group
        $viewLable: null,//view-lable
        $inputGroup: null,//input-group
        $tagContainer: null,
        $valueInput: null,//tagbox-value input
        $feedback: null,

        append: [],
        icons: [],

        value: '',
        readonly: false,

        required: false,
        validType: null,
        missingMessage: '请添加此标签字段！',
        invalidMessage: null,

        prompt: '',
        label: null,

        bsHelpText: null,//bootstrap Help text

        onBeforeAddTagClick: function () {
            return true;
        },
        onChange: function (newValue, oldValue) {
        },
        onClickTag: function (value) {
        }
    };
})(jQuery);
