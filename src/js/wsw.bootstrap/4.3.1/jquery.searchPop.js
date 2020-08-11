/*====================================
 * jquery.bootstrap.searchPop
 * add by wangshw 2019-05-07
 *===================================*/
(function ($) {
    var operData = [
            { "text": "包含", "value": "cn" },
            { "text": "等于", "value": "eq" },
            { "text": "不等于", "value": "ne" },
            { "text": "小于", "value": "lt" },
            { "text": "小于等于", "value": "le" },
            { "text": "大于", "value": "gt" },
            { "text": "大于等于", "value": "ge" },
            { "text": "不包含", "value": "nc" },
            { "text": "开始于", "value": "bw" },
            { "text": "不开始于", "value": "bn" },
            { "text": "结束于", "value": "ew" },
            { "text": "不结束于", "value": "en" },
            { "text": "属于", "value": "in" },
            { "text": "不属于", "value": "ni" },
            { "text": "为空", "value": "nu" },
            { "text": "不为空", "value": "nn" }
    ],
    andORData = [
            { "text": "并且", "value": "and" },
            { "text": "或者", "value": "or" }
    ];

    function init(target) {
        var opts = getOptions(target);

        opts.id = $(target).attr("id");
        if (!opts.id) opts.id = "searchPop_" + Math.random();
        $(target).removeClass("bootstrap-searchPop").addClass("bootstrap-searchPop");

        var arr_htm = [];
        arr_htm.push('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">');
        arr_htm.push('<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">');
        arr_htm.push('<div class="modal-content">');

        arr_htm.push('<div class="modal-header">');
        arr_htm.push('<h5 class="modal-title"><i class="fa fa fa-search"></i>&nbsp;查询</h5>');
        arr_htm.push('</div>');//end modal-header

        arr_htm.push('<div class="modal-body">');

        arr_htm.push('<div class="alert alert-light" role="alert">');
        arr_htm.push('<div class="input-group mb-1">');
        arr_htm.push('<div class="input-group-prepend">');
        arr_htm.push('<select class="form-control andOr">');
        arr_htm.push('</select>');
        arr_htm.push('</div>');
        arr_htm.push('<select class="form-control searchField">');
        arr_htm.push('</select>');
        arr_htm.push('</div>');//end input-group

        arr_htm.push('<div class="form-group mb-1">');
        arr_htm.push('<select class="form-control oper">');
        arr_htm.push('</select>');
        arr_htm.push('</div>');
        arr_htm.push('<div class="form-group mb-0">');
        arr_htm.push('<input type="text" class="form-control condition" placeholder="请输入条件">');
        arr_htm.push('</div>');
        arr_htm.push('</div>');//end alert

        arr_htm.push(' <a href="javascript:;" class="btn btn-link btn-sm addNew"><i class="fa fa-plus-circle"></i>&nbsp;增加条件</a>');
        arr_htm.push('</div>');//end modal-body

        arr_htm.push('<div class="modal-footer">');
        arr_htm.push('<button type="button" class="btn btn-primary btn-sm search"><i class="fa fa fa-search"></i>&nbsp;查询</button>');
        arr_htm.push('<button type="button" class="btn btn-primary btn-sm search-all"><i class="fa fa fa-search"></i>&nbsp;查询全部</button>');
        arr_htm.push('<button type="button" class="btn btn-secondary btn-sm btn-close"><i class="fa fa-dot-circle-o"></i>&nbsp;取消</button>');
        arr_htm.push('</div>');//end modal-footer

        arr_htm.push('</div>');//end modal-content
        arr_htm.push('</div>');//end modal-dialog
        arr_htm.push('</div>');//end modal

        var $modal = $(arr_htm.join('')).appendTo($(target));
        opts.$modal = $modal;
        $modal.modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });
        $modal.on('hidden.bs.modal', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            if (opts.execQuery) {
                var filters = JSON.stringify(opts.filters);
                opts.onSearchClick.call(_target, filters);
            }
        });

        var $andOr = $(target).find('.andOr');
        $andOr.empty();
        for (var i = 0; i < opts.andORData.length; i++) {
            $andOr.append('<option value="' + opts.andORData[i].value + '">' + opts.andORData[i].text + '</option>'); //为Select追加一个Option(下拉项)
        }
        $andOr.get(0).selectedIndex = 0;

        var $searchField = $(target).find('.searchField');
        $searchField.empty();
        for (var i = 0; i < opts.fieldData.length; i++) {
            $searchField.append('<option value="' + opts.fieldData[i].field + '">' + opts.fieldData[i].title + '</option>');
        }
        $searchField.get(0).selectedIndex = 0;

        var $oper = $(target).find('.oper');
        $oper.empty();
        for (var i = 0; i < opts.operData.length; i++) {
            $oper.append('<option value="' + opts.operData[i].value + '">' + opts.operData[i].text + '</option>');
        }
        $oper.get(0).selectedIndex = 0;

        var $addNew = $(target).find('.addNew');
        $addNew.click(function () {
            addNew_onClick(target);
        });

        $(target).find('.search').on('click', { target: target }, function (e) {
            var _target = e.data.target;
            var opts = getOptions(_target);
            opts.execQuery = true;
            getFilters(_target);
            opts.$modal.modal('hide');
        });
        $(target).find('.search-all').on('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.execQuery = true;
            opts.filters = [];
            opts.$modal.modal('hide');
        });
        $(target).find('.btn-close').on('click', { target: target }, function (e) {
            var opts = getOptions(e.data.target);
            opts.execQuery = false;
            opts.$modal.modal('hide');
        });
    }

    function addNew_onClick(target) {
        var opts = getOptions(target);
        var $addNew = $(target).find('.addNew');

        var pnl = $('.alert:first').clone(true);
        $(pnl).addClass('alert-dismissible fade show');

        $(pnl).append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

        $(pnl).find('.andOr').get(0).selectedIndex = 0;
        $(pnl).find('.searchField').get(0).selectedIndex = 1;
        $(pnl).find('.oper').get(0).selectedIndex = 0;
        $(pnl).find('.condition').val('');

        $addNew.before(pnl);
    }

    function open(target) {
        var opts = getOptions(target);
        opts.$modal.modal('show');
    }
    function close(target) {
        var opts = getOptions(target);
        opts.$modal.modal('hide');
    }
    function getFilters(target) {
        var opts = getOptions(target);
        var filters = [];
        $(target).find(".alert").each(function (index, element) {
            var andOR = $(this).find(".andOr").val();
            var field = $(this).find(".searchField").val();
            var oper = $(this).find(".oper").val();
            var data = $(this).find(".condition").val();
            filters.push({
                andOR: andOR,
                field: field,
                oper: oper,
                data: data
            });
        });
        opts.filters = filters;
        return opts.filters;
    }

    function getOptions(target) {
        return $.data(target, "searchPop").options;
    }
    $.fn.searchPop = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.searchPop.methods[options];
            if (method) {
                return method(this, param);
            }
        }
        options = options || {};
        return this.each(function () {
            var state = $.data(this, "searchPop");
            if (state) {
                $.extend(true, state.options, options);
            } else {
                state = $.data(this, "searchPop", {
                    options: $.extend(true, {}, $.fn.searchPop.defaults, options)
                });
                init(this);
            }
        });
    };
    $.fn.searchPop.methods = {
        options: function (jq) {
            return getOptions(jq[0]);
        },
        open: function (jq) {
            return jq.each(function () {
                open(this);
            });
        },
        close: function (jq) {
            return jq.each(function () {
                close(this);
            });
        },
        getFilters: function (jq) {
            return getFilters(jq[0]);
        }
    };
    $.fn.searchPop.defaults = {
        id: '',
        fieldData: null,
        operData: operData,
        andORData: andORData,
        filters: [],
        execQuery: false,//是否执行查询
        onSearchClick: function (filters) { }
    };
})(jQuery);
