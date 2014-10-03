/* Created by frank on 14-9-25. */
(function ($) {
    $.fn.tabs = function () {
        this.each(function () {
            var $tabContainer = $(this)
            $tabContainer
                .on('click.tabs', '[data-tab]', function (e) {

                    var $target = $(e.currentTarget)
                    $target.addClass('selectedTab').siblings().removeClass('selectedTab')
                    var tabName = $target.data('tab')
                    $tabContainer.find('[data-tab-name=' + tabName + ']').eq(0).show().addClass('selectedTab')
                        .siblings().removeClass('selectedTab').hide()
                    $tabContainer.trigger('openTab', e.currentTarget)
                })
        })
        return this
    }
})(jQuery)
