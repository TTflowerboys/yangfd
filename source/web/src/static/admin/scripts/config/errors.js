/* Created by frank on 14-8-20. */
angular.module('app')
    .constant('errors', {
        40103: 'Incorrect phone number or password',
        40100: '请先<a href="/admin#/signIn">登录</a>',
        40300: '没有权限',
        404: 'API not found',
        unknown: 'Something is not right, please try later'
    })
