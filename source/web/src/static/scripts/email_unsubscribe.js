/**
 * Created by chaowang on 17/06/15.
 */

$(function () {
    //Highlight email type user clicked
    if(team.getQuery('email_message_type')){
        $('strong[data-type=' + team.getQuery('email_message_type') + ']').addClass('selected')
    }
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
    $('input[type="checkbox"]').change(function (event) {
        if (window.user) {
            ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type'))
            if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/user/edit'] && window.betterAjaxXhr['/api/1/user/edit'].readyState !== 4) {
                window.betterAjaxXhr['/api/1/user/edit'].abort()
            }
            $.betterPost('/api/1/user/edit', {
                email_message_type: getCurrentMessageTypes($('.table_wrapper'))
            }).done(function (data) {
                window.user = data

                ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type') + ' successfully')
            }).fail(function (ret) {
                //window.alert(window.i18n('更新失败'))
                if(ret !== 0) {
                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)});
                }
                ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type') + ' failed')
            })
        }
    })
})

