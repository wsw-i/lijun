/*========================================
 * jquery.bootstrap.linkbutton
 * add by wangshw 2019-07-10
 *========================================*/
(function ($) {
    function init(target) {
        var opts = getOptions(target);
        opts.id = $(target).attr("id");
        $(target).removeClass("btn btn-primary btn-sm").addClass("btn btn-primary btn-sm");
        $(target).attr("role", "button");

        var text = opts.text || '';
        if (opts.iconCls) {
            text = '<i class="' + opts.iconCls + '"></i>&nbsp;' + text;
        }
        $(target).html(text);
        $(target).off().on("click", function (e) {
            opts.onClick.call(this.e);
        });
    }

    function getOptions(target) {
        return $.data(target, "linkbutton").options;
    }
    $.fn.linkbutton = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.linkbutton.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "linkbutton");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "linkbutton", {
                    options: $.extend(true, {}, $.fn.linkbutton.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.linkbutton.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        }
    };
    $.fn.linkbutton.defaults = {
        id: '',
        text: '',
        btnCls: '',
        iconCls: '',
        onClick: function () {
        }
    };
})(jQuery);
