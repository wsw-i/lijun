/*===============================================
 * 贵茶高端定制茶 gcs_product.js
 * dev by wangshw 2020-07-21
 *===============================================*/
+function (app) {
    app.defaults = {
        //hideLoadingWhenEndInit: false
    };
    app.options = app.parseOptions();

    app.init = function () {
        var prdtcode = emer.queryString('code')||'888888';
        $("#prdt_code").html("收藏编码：" + prdtcode);

        //loadTreeInfo(prdtcode);
    }

    function loadTreeInfo(prdtcode) {
        emer.guiteaApiAnonymous({
            url: '/gcoa/anonymous/gcs_queryProduct',
            jparam: {
                code: prdtcode
            },
            apiSuccess: function (r) {
                if (!r.data) {
                    emer.alert("数据查询失败，请重试！", function () {
                        emer.go2Weixin();
                    });
                    return;
                }

                var trees = r.data.trees;
                if (trees.length) {
                    $("#caizhai_time").empty().html(trees[0].FCAIZHDATE);

                    var arr_htm = [];
                    for (var i = 0; i < trees.length; i++) {
                        var tree = trees[i];
                        var tree_code = tree.FTREECODE;
                        var tree_age = tree.FAGE;

                        arr_htm.push('<div class="container">');
                        arr_htm.push('<div id="carousel_' + tree_code + '" class="carousel slide" data-ride="carousel">');

                        arr_htm.push('<div class="carousel-inner">');
                        arr_htm.push('<div class="carousel-item active">');
                        arr_htm.push('<img class="d-block w-100" src="//doc.guitea.com/gcoa/imgs/gcs/tree/' + tree_code + 'A.jpg">');
                        arr_htm.push('</div>');
                        arr_htm.push('<div class="carousel-item">');
                        arr_htm.push('<img class="d-block w-100" src="//doc.guitea.com/gcoa/imgs/gcs/tree/' + tree_code + 'B.jpg">');
                        arr_htm.push('</div>');
                        arr_htm.push('</div>');//end carousel-inner

                        arr_htm.push('<a class="carousel-control-prev" href="#carousel_' + tree_code + '" role="button" data-slide="prev">');
                        arr_htm.push('<span class="carousel-control-prev-icon" aria-hidden="true"></span>');
                        arr_htm.push('<span class="sr-only">Previous</span>');
                        arr_htm.push('</a>');
                        arr_htm.push('<a class="carousel-control-next" href="#carousel_' + tree_code + '" role="button" data-slide="next">');
                        arr_htm.push('<span class="carousel-control-next-icon" aria-hidden="true"></span>');
                        arr_htm.push('<span class="sr-only">Next</span>');
                        arr_htm.push('</a>');

                        arr_htm.push('</div>');//end carousel

                        arr_htm.push('<table class="table table-sm table-borderless mt-1">');
                        arr_htm.push('<tbody>');
                        arr_htm.push('<tr>');
                        arr_htm.push('<td>茶树编号：' + tree_code + '</td>');
                        arr_htm.push('<td>树龄：' + tree_age + '</td>');
                        arr_htm.push('</tr>');
                        arr_htm.push('</tbody>');
                        arr_htm.push('</table>');

                        arr_htm.push('</div>');
                    }

                    $("#tree_imgs_container").empty().html(arr_htm.join(""));

                    $('.carousel').carousel();
                }
            }
        });
    }

    function getValue(value) {
        return value || '';
    }

    return app;
}(app);