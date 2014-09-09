/**
 * Created by Michael on 14/9/9.
 */
angular.module('app')
    .constant('i18n_languages', [
        { name: '中文（中国）', value: 'zh_Hans_CN' },
        { name: 'English, UK', value: 'en_GB' },
    ]).run(function ($rootScope, i18n_languages) {
        $rootScope.i18n_languages = i18n_languages
    })