(function () {
    $('#cvView').find('button[name=edit]').on('click', function () {
        $('#cvView').hide()

        var $editView = $('#cvEdit')
        $editView.find('.success').hide()
        $editView.find('.error').hide()

        $editView.find('input[name=nickname]').val(window.user.nickname)
        if (window.user.gender) {
            $editView.find('input[name=gender][value=' + window.user.gender + ']').attr('checked', 'checked')
        }
        else {
            $editView.find('input[name=gender]').removeAttr('checked')
        }
        if (window.user.country) {
            $editView.find('[name=country] option[value=' + window.user.country.code + ']').attr('selected', 'selected')
        }
        else {
            $editView.find('[name=country] option').removeAttr('selected')
        }

        $('#cvEdit').show()
    })

    $('#cvEdit').find('button[name=cancel]').on('click', function () {
        $('#cvView').show()
        $('#cvEdit').hide()

    })

    $('#cvEdit').submit(function (e) {

        e.preventDefault()

        var successArea = $(this).find('.success')
        var errorArea = $(this).find('.error')
        successArea.hide()
        errorArea.hide()
        var valid = $.validate(this, {onError: function (dom, validator, index) {
            errorArea.text(window.getErrorMessage(dom.name, validator))
            errorArea.show()
        }})

        if (!valid) {return}
        var params = $(this).serializeObject()
        if (!params.gender) {
            errorArea.text(window.i18n('性别不能为空'))
            errorArea.show()
            return
        }
        if (!params.country) {
            errorArea.text(window.i18n('国家不能为空'))
            errorArea.show()
            return
        }

        $.betterPost('/api/1/user/edit', params)
            .done(function (data) {
                window.user = data
                successArea.text(window.i18n('更新成功'))
                successArea.show()

                window.location.reload()
            })
            .fail(function (data) {
                errorArea.text(window.i18n('更新失败'))
                errorArea.show()
            })


    })

    function getCurrentMessageTypes($content) {
        var cMessageTypes
        var checkboxes = $content.find('input[type=checkbox]')
        if(window.user) {
            cMessageTypes = _.clone(window.user.email_message_type) || []
            checkboxes.each(function (index, elem) {
                var type = $(elem).attr('data-type')
                if($(elem).is(':checked') && cMessageTypes.indexOf(type) < 0) {
                    cMessageTypes.push(type)
                } else if(!$(elem).is(':checked')) {
                    cMessageTypes = _.without(cMessageTypes, type)
                }
            })
        }
        return JSON.stringify(cMessageTypes)
    }
    $('.messageTableWrapper input[type="checkbox"]').unbind("change").change(function (event) {
        console.log(event)
        if (window.user) {
            ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type'))
            if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/user/edit'] && window.betterAjaxXhr['/api/1/user/edit'].readyState !== 4) {
                window.betterAjaxXhr['/api/1/user/edit'].abort()
            }
            $.betterPost('/api/1/user/edit', {
                email_message_type: getCurrentMessageTypes($('.messageTableWrapper'))
            }).done(function (data) {
                window.user = data

                ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type') + ' successfully')
            }).fail(function (ret) {
                //window.alert(window.i18n('更新失败'))
                ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type') + ' failed')
            })
        }
    })
})()