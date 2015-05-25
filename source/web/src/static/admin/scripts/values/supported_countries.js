/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('supportedCountries', [
        { name: i18n('英国'), value: 'GB'},
        { name: i18n('中国'), value: 'CN'},
        { name: i18n('香港'), value: 'HK'},
        { name: i18n('美国'), value: 'US'}
        /*{ name: i18n('印度'), value: 'IN'},
        { name: i18n('俄罗斯'), value: 'RU'},
        { name: i18n('日本'), value: 'JP'},
        { name: i18n('德国'), value: 'DE'},
        { name: i18n('法国'), value: 'FR'},
        { name: i18n('意大利'), value: 'IT'},
        { name: i18n('西班牙'), value: 'ES'}*/
    ]).run(function ($rootScope, supportedCountries) {
        $rootScope.supportedCountries = supportedCountries
    })