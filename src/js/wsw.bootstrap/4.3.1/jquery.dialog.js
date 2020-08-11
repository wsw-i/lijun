/*========================================
 * jquery.bootstrap.dialog
 * add by wangshw 2019-07-09
 *========================================*/
(function ($) {
    function init(target) {
        var opts = getOptions(target);
        if (opts.initCount == 0) {
            opts.id = $(target).attr("id");
            if (!opts.id) opts.id = "dialog_" + Math.random();
        }
        else {
            destroy(target);
        }
        opts.initCount++;

        var arr_htm = [];
        arr_htm.push('<div class="modal fade bootstrap-dialog" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-header">');
        var title = opts.title || '';
        if (opts.iconCls) {
            title = '<i class="' + opts.iconCls + '"></i>&nbsp;' + title;
        }
        arr_htm.push('<h5 class="modal-title">' + title + '</h5>');
        if (opts.closable) {
            arr_htm.push('<ul class="nav nav-pills float-right">');
            arr_htm.push('<li class="nav-item">');
            arr_htm.push('<a class="btn btn-link header-tools-btn btn-close" href="javascript:;">');
            arr_htm.push('<i class="fa fa-remove"></i>');
            arr_htm.push('</a>');
            arr_htm.push('</li>');
            arr_htm.push('</ul>');
        }
        arr_htm.push('</div>');//end header

        arr_htm.push('<div class="modal-body">');
        arr_htm.push('</div>');//end body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('</div>');//end footer

        arr_htm.push('</div>');//end content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal

        opts.$dialog = $(arr_htm.join('')).insertAfter($(target));
        opts.$body = opts.$dialog.find(".modal-body");
        opts.$footer = opts.$dialog.find(".modal-footer");
        opts.$btnClose = opts.$dialog.find(".btn-close");

        opts.$dialog.modal({
            backdrop: 'static',
            keyboard: true,
            focus: true,
            show: !opts.closed
        });
        opts.$dialog.on('show.bs.modal', { target: target }, function (e) {
            opts.onBeforeOpen.call(e.data.target);
        }).on('shown.bs.modal', { target: target }, function (e) {
            opts.onOpen.call(e.data.target);
        }).on('hide.bs.modal', { target: target }, function (e) {
        }).on('hidden.bs.modal', { target: target }, function (e) {
            opts.onClose.call(e.data.target);
        });

        opts.$btnClose.off().on('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.$dialog.modal('hide');
        });

        content_init(target);
        buttons_init(target);
    }
    function content_init(target) {
        var opts = getOptions(target);
        opts.$tables = $(target).find("table");
        if (opts.$tables.length) {
            //处理table
            opts.$tables.each(function (i) {
                $table = $(this);
                var m_title = $table.attr('data-m-title');//手机端配置的table标题
                var card_cls = m_title ? '' : 'card-header-none';

                var arr_card_htm = [];
                arr_card_htm.push('<div class="card bg-light ' + card_cls + '">');
                if (m_title) {
                    arr_card_htm.push('<div class="card-header">');
                    arr_card_htm.push(m_title);
                    arr_card_htm.push('</div>');
                }
                arr_card_htm.push('<ul class="list-group list-group-flush">');
                arr_card_htm.push('</ul>');
                arr_card_htm.push('</div>');
                var $card = $(arr_card_htm.join(''));

                $table.hide();
                opts.$body.append($card);
                $card.append($table);

                $table.find("td").each(function (i) {
                    //已经初始化td中的控件
                    var $formGroup = $(this).find('.form-group');
                    if ($formGroup.length) {
                        var $li = $('<li class="list-group-item"></li>');
                        $li.appendTo($formGroup.closest("div.card").find(".list-group"));
                        $li.append($formGroup);
                        return;
                    }
                    //未初始化td中的控件
                    var $input = $(this).find('input,textarea');
                    if ($input.length) {
                        var $li = $('<li class="list-group-item"></li>');
                        $li.appendTo($input.closest("div.card").find(".list-group"));
                        $li.append($input);
                    }
                });
            });
        }
    }
    function buttons_init(target) {
        var opts = getOptions(target);
        if (opts.buttons.length) {
            //button = {
            //    text: '修改',
            //    iconCls: '',
            //    handler: function () { }
            //};
            var arr_htm = [];
            for (var i = 0; i < opts.buttons.length; i++) {
                var button = opts.buttons[i];
                arr_htm.push('<a class="btn btn-primary btn-sm button-dialog" href="javascript:;" role="button">');
                var text = button.text || '';
                if (button.iconCls) {
                    text = '<i class="' + button.iconCls + '"></i>&nbsp;' + text;
                }
                arr_htm.push(text);
                arr_htm.push('</a>');
            }
            $(arr_htm.join('')).appendTo(opts.$footer);

            //注册事件
            opts.$footer.find(".button-dialog").each(function (i) {
                var _handler = opts.buttons[i].handler;
                if (_handler) {
                    $(this).off().on('click', { target: target }, function (e) {
                        _handler.call(this, e);
                    });
                }
            });
        }
    }

    function destroy(target) {
        var opts = getOptions(target);
        if (opts.$dialog) {
            addon_index = 0;
            opts.$dialog.remove();
        }
    }
    function getOptions(target) {
        return $.data(target, "dialog").options;
    }
    $.fn.dialog = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.dialog.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "dialog");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "dialog", {
                    options: $.extend(true, {}, $.fn.dialog.defaults, options)
                });
            }
            init(this);
        });
    };
    $.fn.dialog.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        open: function (jq) {
            return jq.each(function () {
                var opts = getOptions(this);
                opts.$dialog.modal("show");
            });
        },
        close: function (jq) {
            return jq.each(function () {
                var opts = getOptions(this);
                opts.$dialog.modal("hide");
            });
        },

        destroy: function (jq) {
            return jq.each(function () {
                destroy(this);
            });
        }
    };
    $.fn.dialog.defaults = {
        id: '',
        name: '',
        initCount: 0,//初始化次数
        closed: false,
        closable: true,

        title: '',
        iconCls: '',
        buttons: [],

        onBeforeOpen: function () { },
        onOpen: function () { },
        onClose: function () { }
    };
})(jQuery);
