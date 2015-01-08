/**
 * Created by chaowang on 10/10/14.
 */
var user_id = window.team.getQuery('user_id')
var code = window.team.getQuery('code')

if(!_.isEmpty(window.team.getQuery('code'))&&!_.isEmpty(window.team.getQuery('user_id'))){
    var params = {
        code:code
    }
    $.betterPost('/api/1/user/'+user_id+'/email_verification/verify', params)
        .done(function (data) {
            $('.loadIndicator').hide()
            $('.verify-success').show()
        })
        .fail(function (data) {
            $('.loadIndicator').hide()
            $('.verify-failed').show()
        })
}else{
    $('.loadIndicator').hide()
    $('.verify-failed').show()
}
$('.rmm-button').removeClass('rmm-button-user').addClass('rmm-button-user-settings')