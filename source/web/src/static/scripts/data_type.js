/* Created by frank on 14-10-6. */
(function ($) {
    $('[data-type]').on('keyup', function (e) {
        if (e.keyCode >= '48' && e.keyCode <= 57) {
            checkType(this)
        }
    }).each(function () {
        checkType(this)
    })

    function checkType(dom) {
        var $dom = $(dom)
        var type = $dom.attr('data-type')
        if (type === 'currency') {
            if (dom.tagName === 'input') {
                $dom.val(
                    team.encodeCurrency(
                        $dom.val()
                    )
                )
            } else {
                $dom.html(
                    team.encodeCurrency(
                        $dom.text()
                    )
                )
            }
        }
    }

})(jQuery)
