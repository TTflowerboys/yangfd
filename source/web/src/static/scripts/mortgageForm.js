/* Created by frank on 14-10-6. */
(function ($) {

    function isScrolledIntoView(elem)
    {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    var $mortgageForm = $('form[name=mortgageForm]')
    $mortgageForm.on('change blur keyup', '[name]', function (e) {
        var data = $mortgageForm.serializeObject({noEmptyString: true})
        if (data._total && data._down_payment) {
            data.loan = team.decodeCurrency(data._total) - team.decodeCurrency(data._down_payment)
            if (!data.loan || data.loan < 0) {data.loan = 0}
            $mortgageForm.find('[name=loan]').val(team.encodeCurrency(data.loan))
        }
        $.validate($mortgageForm, {onError: function () { }})
        var valid = $.validate($mortgageForm, {onError: function () { }})
        if (valid) {
            $mortgageForm.find('[type=submit]').prop('disabled', false)
        }

    }).submit(function (e) {
        e.preventDefault()
        $mortgageForm.find('.error').remove().end()
            .find('[data-name]').text('').end()
            .find('[type=submit]').prop('disabled', true)
        var valid = $.validate($mortgageForm, {onError: function (dom, error) {
            var $dom = $(dom)
            $dom.before('<div class="error">' + ($dom.attr('data-message-' + error) || '') + '</div>')
            $dom.closest('.row').get(0).scrollIntoView(true)
        }})

        if (!valid) {
            $mortgageForm.find('[type=submit]').prop('disabled', false)
            return
        }

        var $result = $mortgageForm.find('[data-ui=result]')
        $result.slideDown()
        if (!isScrolledIntoView($result[0])) {
            $('html, body').animate({scrollTop: $result.offset().top - ($(window).height() - $result.height() - 20) }, 'fast');
        }

        var data = $mortgageForm.serializeObject({includeUnderscore: false})
        data.loan = team.decodeCurrency(data.loan)

        $.betterPost('/api/1/mortgage_calculate', data)
            .done(function (data) {
                var result = data[$mortgageForm.find('[name=_type]').val()]
                for (var key in result) {
                    $mortgageForm.find('[data-name=' + key + ']').text(team.encodeCurrency(result[key]))
                }

            })
            .always(function () {
                $mortgageForm
                    .find('[type=submit]').prop('disabled', false)
            })

    })

})(jQuery)
