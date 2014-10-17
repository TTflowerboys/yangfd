/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('i18nLanguages', [
        { name: '简体中文(中国)', value: 'zh_Hans_CN' },
//        { name: '繁體中文(香港)', value: 'zh_Hant_HK' },
        { name: 'English (UK)', value: 'en_GB' }
    ])
    .constant('i18nCurrency', [
        'CNY',
        'GBP',
        'USD',
        'EUR',
        'HKD'
    ])
    .constant('i18nLength', [
        'mile',
        'foot',
        'inch',
        'meter',
        'kilometer',
        'centimeter'
    ])
    .constant('i18nArea', [
        'foot ** 2',
        'acre',
        'meter ** 2',
        'kilometer ** 2'
    ])
    .run(function ($rootScope, i18nLanguages, i18nCurrency, i18nLength, i18nArea) {
        $rootScope.i18nLanguages = i18nLanguages
        $rootScope.i18nCurrency = i18nCurrency
        $rootScope.i18nLength = i18nLength
        $rootScope.i18nArea = i18nArea

    })

