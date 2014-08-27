/* Created by frank on 14-8-20. */
angular.module('app')
    .constant('errors', {
        40103: 'Incorrect phone number or password',
        40100: 'Please <a href="/admin#/signIn">sign in</a>',
        404: 'API not found',
        unknown: 'Something is not right, please try later'
    })
