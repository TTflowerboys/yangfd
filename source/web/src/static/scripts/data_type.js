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
            if (dom.tagName.toLowerCase() === 'input') {
                var oldPos = team.getCaretPostion(dom)
                var oldValue = $dom.val()
                var newValue = team.encodeCurrency(oldValue)
                $dom.val(newValue)
                team.setCaretPosition(dom, oldPos + (newValue.match(/,/g) || []).length -  (oldValue.match(/,/g) || []).length)
            } else {
                $dom.html(
                    team.encodeCurrency(
                        $dom.text()
                    )
                )
            }
        }
        else if (type === 'formatted_currency') {
            if (dom.tagName.toLowerCase() === 'input') {
                $dom.val(
                    team.formatCurrency(
                        $dom.val()
                    )
                )
            } else {
                $dom.html(
                    team.formatCurrency(
                        $dom.text()
                    )
                )
            }
        }else if (type === 'formatted_currency_mouth') {
            if (dom.tagName.toLowerCase() === 'input') {
                $dom.val(
                    team.formatCurrency(
                        $dom.val()
                    )
                )
            } else {
                $dom.html(
                    team.formatCurrency(
                        $dom.attr('data-price')
                    )
                )
            }
        }
    }

})(jQuery)
