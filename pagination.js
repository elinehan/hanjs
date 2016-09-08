!function ($) {

    "use strict";

    /* Pagination CLASS DEFINITION
    * ====================== */
    /*
    option
        language: 'en', //'en','zh-cn'
        autoWidth: true,
        loaded: false,
        pageIndex: 0,
        pageGroupNum: 5,
        rowList: [10, 20, 30],
        rowNum: 10,
        totalPages: 0,
        totalRecords: 0,
        navButtons: [], //自定义按钮[buttonicon;按钮图标class,onClickButton:按钮click回调,title:标题]
        viewBoder: false,
        viewRecords: false,
        viewRowList: true,
        loadingPage: null, //页面改变事件
    method
        firstPage
        previousPage
        nextPage
        lastPage
        goTo
        reload
        navButtonAdd
        getOption(optionName)
         */

    var Pagination = function (element, options) {
        this.defoptions = {
            language: 'zh-cn',
            autoWidth: true,
            loaded: false,
            pageIndex: 0,
            pageGroupNum: 5,
            rowList: [10, 20, 30],
            rowNum: 10,
            totalPages: 0,
            totalRecords: 0,
            navButtons: [], //自定义按钮[buttonicon;按钮图标class,onClickButton:按钮click回调,title:标题]
            viewBoder: false,
            viewRecords: false,
            viewRowList: false,

            loadingPage: null, //页面改变事件
        };
        this.options = options;
        this.options = jQuery.extend(this.defoptions, this.options);
        this.options.hasMenu = (this.options.menu && this.options.menu.length > 0);
        this.$element = $(element);
        this.$container = null;
    };

    Pagination.prototype = {
        constructor: Pagination,

        init: function () {
            var that = this;
            var thisid = this.$element.attr('id');
            this.$element.addClass("ui-state-default nui-spager ui-corner-bottom");

            if (this.options.rowList && this.options.rowList.length > 0) {
                var inlist = false;
                for (var i = 0; i < this.options.rowList.length; i++) {
                    if (this.options.rowList[i] == this.options.rowNum) {
                        inlist = true;
                        break;
                    }
                }

                if (!inlist) {
                    this.options.rowNum = Number(this.options.rowList[0]);
                }
            }

            if (this.options.viewBoder) this.$element.addClass('nui-spager-border');

            var viewinfo = '';
            if (this.options.viewRecords && this.options.language == 'en') {
                viewinfo = '<div dir="ltr" style="text-align:right" class="ui-paging-info">View  -  of </div>';
            }
            if (this.options.viewRecords && this.options.language == 'zh-cn') {
                viewinfo = '<div dir="ltr" style="text-align:right" class="ui-paging-info">  -  共 条 </div>';
            }

            this.$element.append('<div id="npg_' + thisid + '" class="nui-spager-control"><table cellspacing="0" cellpadding="0" border="0" class="nui-spager-table" style="width:100%;table-layout:fixed;height:100%;"><tbody><tr><td id="' + thisid + '_center" align="center" style="white-space: pre; width: 487px;"></td><td id="' + thisid + ' _right" align="right">' + viewinfo + '</td></tr></tbody></table></div>');
            var rowlisthtml = '';

            if (this.options.viewRowList && this.options.rowList && this.options.rowList.length > 0) {
                rowlisthtml = '<td dir="ltr"><select class="nui-spager-selbox ui-widget-content ui-corner-all" role="listbox" title="Records per Page">';

                for (var i = 0; i < this.options.rowList.length; i++) {
                    var strselected = '';
                    if (this.options.rowList[i] == this.options.rowNum) strselected = 'selected="selected"';
                    rowlisthtml = rowlisthtml + '<option role="option" value="' + this.options.rowList[i] + '" ' + strselected + '>' + this.options.rowList[i] + '</option>';
                }

                rowlisthtml = rowlisthtml + '</select></td>';
            }

            var pgCenter = this.$element.find('#' + thisid + '_center');
            var pgCenterhtml = ''; 
            pgCenterhtml = '<table cellspacing="0" cellpadding="0" border="0" style="table-layout:auto;" class="nui-spager-table">' +
                    '<tbody>' +
                        '<tr>' +
                            '<td id="prev_' + thisid + '" class="nui-spager-button ui-corner-all ui-state-disabled" title="Previous Page"><span class="ui-icon ui-icon-seek-prev">上一页</span></td>' +
                            '<td id="pagenum_' + thisid + '">';
            
            pgCenterhtml = pgCenterhtml + '</td>' +
                            '<td id="next_' + thisid + '" class="nui-spager-button ui-corner-all" title="Next Page"><span class="ui-icon ui-icon-seek-next">下一页</span></td>' +
                            '<td id="input_' + thisid + '" dir="ltr" class="goto">转到 <input class="nui-spager-input ui-corner-all" type="text" size="2" maxlength="7" value="0" role="textbox"> 页 <a id="goto_' + thisid + '">转到</a></td>' +
                            '</td>' + rowlisthtml +
                        '</tr>' +
                    '</tbody>' +
                '</table>';

            pgCenter.append(pgCenterhtml);
            this.$element.find('.nui-spager-selbox').change(function () {
                that.options.rowNum = Number($(this).val());
                that.reload(that.options.totalRecords);
                if (that.options.loadingPage != null) {
                    that.options.loadingPage.call(this);
                }
            });

            var firstnav = $('#first_' + thisid + ' span').click(function () {
                if ($(this).parent().hasClass('ui-state-disabled')) return;
                that.firstPage();
            });

            var prevnav = $('#prev_' + thisid + ' span').click(function () {
                if ($(this).parent().hasClass('ui-state-disabled')) return;
                that.previousPage();
            });

            var nextnav = $('#next_' + thisid + ' span').click(function () {
                if ($(this).parent().hasClass('ui-state-disabled')) return;
                that.nextPage();
            });

            var lastnav = $('#last_' + thisid + ' span').click(function () {
                if ($(this).parent().hasClass('ui-state-disabled')) return;
                that.lastPage();
            });

            $('#input_' + thisid + ' input').blur(function () {
                _goto.call(this);
            });

            $('#input_' + thisid + ' input').keydown(function (event) {
                if (event.keyCode == 13) {
                    _goto.call(this);
                }
            });

            $('#goto_' + thisid).click(function () {
                _goto.call($('#input_' + thisid + ' input')[0]);
            });

            function _goto(){
                var pattern = /^[0-9]*[1-9][0-9]*$/;
                var page = $(this).val().trim();

                if (page != this.options)
                    if (pattern.test(page))
                        that.goTo(Number(page));
            }

            this.reload(this.options.totalRecords);
        },
        firstPage: function () {
            //console.info('firstPage');
            var thisid = this.$element.attr('id');
            this.options.pageIndex = 1;
            $('#input_' + thisid + ' input').val(this.options.pageIndex);
            if (this.options.loadingPage != null) {
                this.options.loadingPage.call(this);
            }
        },
        previousPage: function () {
            //console.info('previousPage');
            var thisid = this.$element.attr('id');
            if (this.options.pageIndex > 1)
                this.options.pageIndex = this.options.pageIndex - 1;
            else
                this.options.pageIndex = 1;
            $('#input_' + thisid + ' input').val(this.options.pageIndex);

            if (this.options.loadingPage != null) {
                this.options.loadingPage.call(this);
            }

            this.reload(this.options.totalRecords);
        },
        nextPage: function () {
            //console.info('nextPage');
            var thisid = this.$element.attr('id');
            if (this.options.pageIndex < this.options.totalPages)
                this.options.pageIndex = this.options.pageIndex + 1;
            else
                this.options.pageIndex = this.options.totalPages;
            $('#input_' + thisid + ' input').val(this.options.pageIndex);

            if (this.options.loadingPage != null) {
                this.options.loadingPage.call(this);
            }

            this.reload(this.options.totalRecords);
        },
        lastPage: function () {
            //console.info('lastPage');
            var thisid = this.$element.attr('id');
            this.options.pageIndex = this.options.totalPages;
            $('#input_' + thisid + ' input').val(this.options.pageIndex);

            if (this.options.loadingPage != null) {
                this.options.loadingPage.call(this);
            }
        },
        goTo: function (page) {
            //console.info('goTo');

            if (typeof (page) == "string") page = Number(page);

            var thisid = this.$element.attr('id');
            if (page >= 1 && page <= this.options.totalPages)
                this.options.pageIndex = page;
            else
                this.options.pageIndex = this.options.totalPages;

            $('#input_' + thisid + ' input').val(page);

            if (this.options.loadingPage != null) {
                this.options.loadingPage.call(this);
            }
            this.reload(this.options.totalRecords);
        },
        reload: function (totalRecords, page) {
            var that = this;
            var thisid = this.$element.attr('id');
            var processZero = function () {
                that.options.pageIndex = 0;
                that.options.totalPages = 0;
                that.options.totalRecords = 0;

                that.$element.find('#prev_' + thisid).addClass('ui-state-disabled');
                that.$element.find('#next_' + thisid).addClass('ui-state-disabled');
                that.$element.find('#pagenum_' + thisid).html('');
                if (that.options.language == 'en') {
                    that.$element.find('.ui-paging-info').html('View 0 - 0 of 0');
                }
                else {
                    that.$element.find('.ui-paging-info').html('0 - 0 共 0 条 ');
                }
                $('#input_' + thisid + ' input').val(0);
                that.$element.find('#sp_1_' + thisid).html('0');
                return;
            }

            if (totalRecords == 0) {
                processZero();
                return;
            }

            //console.info('reload');
            var totalRecordsChanged = totalRecords == this.options.totalRecords;
            var pageIndexChanged = page == this.options.pageIndex;

            this.options.totalRecords = totalRecords;

            var pm = this.options.totalRecords % this.options.rowNum;
            if (pm == 0) {
                this.options.totalPages = this.options.totalRecords / this.options.rowNum;
            }
            else {
                this.options.totalPages = (this.options.totalRecords - pm) / this.options.rowNum + 1;
            }

            if (typeof (page) == "number" && page != this.options.pageIndex) {
                this.options.pageIndex = page;
                pageIndexChanged = true;
            }

            if (this.options.pageIndex < 1) {
                this.options.pageIndex = 1;
                pageIndexChanged = true;
            }

            if (this.options.pageIndex > this.options.totalPages) {
                this.options.pageIndex = this.options.totalPages;
                pageIndexChanged = true;
            }

            $('#input_' + thisid + ' input').val(this.options.pageIndex);

            var crs = (this.options.pageIndex - 1) * this.options.rowNum + 1;
            var ces = crs + this.options.rowNum - 1;
            if (ces > this.options.totalRecords) ces = this.options.totalRecords;
            if (this.options.language == 'en') {
                this.$element.find('.ui-paging-info').html('View ' + crs + ' - ' + ces + ' of ' + this.options.totalRecords);
            }
            else {
                this.$element.find('.ui-paging-info').html('' + crs + ' - ' + ces + ' &nbsp;&nbsp;共 ' + this.options.totalRecords + ' 条 ');
            }
            this.$element.find('#sp_1_' + thisid).html(this.options.totalPages);
            var firstnav = $('#first_' + thisid);
            var prevnav = $('#prev_' + thisid);
            var nextnav = $('#next_' + thisid);
            var lastnav = $('#last_' + thisid);

            firstnav.removeClass('ui-state-disabled');
            prevnav.removeClass('ui-state-disabled');
            nextnav.removeClass('ui-state-disabled');
            lastnav.removeClass('ui-state-disabled');

            if (this.options.pageIndex == 1) {
                firstnav.addClass('ui-state-disabled');
                prevnav.addClass('ui-state-disabled');

                if (this.options.totalRecords <= 1) {
                    nextnav.addClass('ui-state-disabled');
                    lastnav.addClass('ui-state-disabled');
                }
            }

            if (this.options.pageIndex == this.options.totalPages) {
                nextnav.addClass('ui-state-disabled');
                lastnav.addClass('ui-state-disabled');
            }

            var refreshPageNum = function () {
                var pgCenterhtml = '';

                if (that.options.totalPages >= 1) {
                    var curclass = '';
                    if (that.options.pageIndex == 1) curclass = 'num-current';
                    pgCenterhtml = pgCenterhtml + '<a href="javascript:;" class="num ' + curclass + '">1</a>';
                }

                var totalpages = that.options.totalPages;
                var pageIndex = that.options.pageIndex;

                if (totalpages < 8) {
                    for (var i = 2; i < totalpages; i++) {
                        var curclass = '';
                        if (pageIndex == i) curclass = 'num-current';
                        pgCenterhtml = pgCenterhtml + '<a href="javascript:;" class="num ' + curclass + '">' + i + '</a>';
                    }
                } else {
                    var hasleftsp = false;
                    var hasrightsp = false;
                    var pgourphtml = '';
                    var pgourp = [];
                    var cpageIndex = pageIndex;

                    if (pageIndex == 1) {
                        cpageIndex = cpageIndex + 1;
                    }
                    else if (pageIndex == totalpages) {
                        cpageIndex = cpageIndex - 1;
                    }

                    cpageIndex = cpageIndex - 1;
                    var pgroupnum = Math.ceil(cpageIndex / that.options.pageGroupNum);

                    var startpGroupNum = (pgroupnum - 1) * that.options.pageGroupNum + 2;
                    var endGroupNum = startpGroupNum + that.options.pageGroupNum - 1;
                    if (endGroupNum >= that.options.totalPages) {
                        endGroupNum = that.options.totalPages - 1;
                        startpGroupNum = endGroupNum - that.options.pageGroupNum + 1;
                    }

                    for (var i = startpGroupNum; i <= endGroupNum; i++) {
                        var curclass = '';
                        pgourp.push(i);
                        if (i == pageIndex) curclass = 'num-current';
                        pgourphtml = pgourphtml + '<a href="javascript:;" class="num ' + curclass + '">' + i + '</a>';
                    }

                    if (pgourp[0] > 2) {
                        hasleftsp = true;
                    }

                    if (pgourp[pgourp.length - 1] < (totalpages - 1)) {
                        hasrightsp = true;
                    }

                    if (hasleftsp) {
                        pgourphtml = '<span class="spc-left" style="margin-right: 6px;">...</span>' + pgourphtml;
                    }

                    if (hasrightsp) {
                        pgourphtml = pgourphtml + '<span class="spc-right" style="margin-right: 6px;">...</span>';
                    }

                    pgCenterhtml = pgCenterhtml + pgourphtml;
                }

                if (totalpages >= 2) {
                    var curclass = '';
                    if (pageIndex == totalpages) curclass = 'num-current';
                    pgCenterhtml = pgCenterhtml + '<a href="javascript:;" class="num num-last ' + curclass + '">' + totalpages + '</a>';
                }

                that.$element.find('#pagenum_' + thisid).append(pgCenterhtml);

                that.$element.find('a.num').click(function () {
                    var page = $(this).html().trim();
                    that.goTo(Number(page));
                });
            };
            
            if (!this.options.loaded) {
                refreshPageNum();
                this.options.loaded = true;
            }
            else {
                this.$element.find('#pagenum_' + thisid).html('');
                refreshPageNum();
            }
        },
        navButtonAdd: function (opt) {
            var thisid = this.$element.attr('id');

            if (this.options.navButtons.length == 0) {
                if (this.$element.find('.navtable').length == 0) {
                    var tablehtml = '<table cellspacing="0" cellpadding="0" border="0" class="nui-spager-table navtable" style="float:left;table-layout:auto;"><tbody><tr></tr></tbody></table>';
                    this.$element.find('#' + thisid + '_left').append(tablehtml);
                }
            }

            var $navtableTr = $(this.$element.find('.navtable tr'));
            var tdhtml = '<td class="nui-spager-button ui-corner-all" title="" data-original-title="' + opt.title + '"><div class="nui-spager-div"><span class="ui-icon ' + opt.buttonicon + '"></span></div></td>';
            $navtableTr.append(tdhtml);
            $navtableTr.find('.nui-spager-button .nui-spager-div').last().click(function () {
                if (opt.onClickButton && typeof (opt.onClickButton) == "function") {
                    opt.onClickButton.call(this);
                }
            });
        },
        getOption: function (name) {
            var thisid = this.$element.attr('id');
            if (this.options[name] != null && typeof (this.options[name]) == "function")
                return null;

            return this.options[name];
        }
    };

    /* Pagination PLUGIN DEFINITION
    * ======================= */

    $.fn.pagination = function () {
        var option = arguments[0],
        args = arguments;

        if (typeof option === 'string') {
            var res;

            this.each(function () {
                var $this = $(this),
                    data = $this.data('pagination'),
                    options = $.extend({}, $.fn.pagination.defaults, $this.data(), typeof option === 'object' && option);

                if (!data) {
                    $this.data('pagination',
                        (
                        data = new Pagination(this, options)
                        ));
                }

                res = data[option](args[1]);
            });

            return res;
        } else {
            return this.each(function () {
                var $this = $(this),
                    data = $this.data('pagination'),
                    options = $.extend({}, $.fn.pagination.defaults, $this.data(), typeof option === 'object' && option);

                if (!data) {
                    $this.data('pagination',
                        (
                        data = new Pagination(this, options)
                        ));
                }

                data.init();
            });
        }
    };

    $.fn.pagination.defaults = {};

    $.fn.pagination.Constructor = Pagination;

}(window.jQuery);
