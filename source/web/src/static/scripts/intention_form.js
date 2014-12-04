/* Created by frank on 14-10-6. */
(function ($) {
    var $intentionForm = $('form[name=intentionForm]')
    var $feedback = $intentionForm.find('[data-role=serverFeedback]')
    var $submit = $intentionForm.find('[type=submit]')

    function validateForm(){
        var valid = $.validate($intentionForm, {onError: function () { }})
        if (valid) {
            $intentionForm.find('[type=submit]').prop('disabled', false)
        } else {
            $intentionForm.find('[type=submit]').prop('disabled', true)
        }
    }
    $intentionForm.submit(function (e) {
        ga('send', 'event', 'property_detail', 'submit', 'requirement-submit');
        e.preventDefault()

        $submit.prop('disabled', true)
        $feedback.hide()
        var $form = $(this)

        var data = $form.serializeObject({noEmptyString: true})

        if (window.user) {
            data.register = undefined
        }
        else {
            data.noregister = data.register === 'on' ? false : true
            data.register = undefined
        }

        var api = '/api/1/intention_ticket/add'
        $.betterPost(api, data)
            .done(function () {
                $feedback.show().text($form.attr('data-message-success'))
                ga('send', 'event', 'property_detail', 'result', 'requirement-submit-success');
            })
            .fail(function (errorCode) {
                $feedback.empty()
                $feedback.append(window.getErrorMessageFromErrorCode(errorCode, api))
                $feedback.show()
                ga('send', 'event', 'property_detail', 'click', 'requirement-submit-failed',window.getErrorMessageFromErrorCode(errorCode, api));
            })
            .always(function () {
                $submit.prop('disabled', false)
            })

    }).on('change blur keyup', '[name]', function (e) {
        validateForm()
    })

    validateForm() //user may have logged in all data is ready
})(jQuery)
