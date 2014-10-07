/* Created by frank on 14-10-6. */
(function ($) {
    var $intentionForm = $('form[name=intentionForm]')
    var $feedback = $intentionForm.find('[data-role=serverFeedback]')
    var $submit = $intentionForm.find('[type=submit]')
    $intentionForm.submit(function (e) {
        e.preventDefault()

        $submit.prop('disabled', true)
        $feedback.hide()
        var $form = $(this)

        var data = $form.serializeObject({noEmptyString: true})
        data.noregister = data.register === 'on' ? false : true
        data.register = undefined

        $.betterPost('/api/1/intention_ticket/add', data)
            .done(function () {
                $feedback.show().text($form.attr('data-message-success'))
            })
            .fail(function (errorCode) {
                $feedback.show().text($form.attr('data-message-' + errorCode) || $form.attr('data-message-unknown'))
            })
            .always(function () {
                $submit.prop('disabled', false)
            })

    }).on('change blur keyup', '[name]', function (e) {
        var valid = $.validate($intentionForm, {onError: function () { }})
        if (valid) {
            $intentionForm.find('[type=submit]').prop('disabled', false)
        } else {
            $intentionForm.find('[type=submit]').prop('disabled', true)
        }
    })
})(jQuery)
