/**
 * Created by chaowang on 17/06/15.
 */

$(function () {
    //Highlight email type user clicked
    if(team.getQuery('email_message_type')){
        $('strong[data-type=' + team.getQuery('email_message_type') + ']').addClass('selected')
    }

    $('input[type="checkbox"]').change(function (event) {
        if (window.user) {
            ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type'))

            var cMessageTypes = window.user.email_message_type
            if (_.indexOf(cMessageTypes, $(event.currentTarget).attr('data-type'))) {
                cMessageTypes = _.without(cMessageTypes, $(event.currentTarget).attr('data-type'))
            } else {
                cMessageTypes.push($(event.currentTarget).attr('data-type'))
            }
            $.betterPost('/api/1/user/edit', {
                email_message_type: JSON.stringify(cMessageTypes)
            }).done(function (data) {
                window.user = data

                ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type') + ' successfully')
            }).fail(function (ret) {
                window.alert(window.i18n('更新失败'))
                ga('send', 'event', 'email-unsubscribe', 'click', 'update ' + $(event.currentTarget).attr('data-type') + ' failed')
            })
        }
    })
})

