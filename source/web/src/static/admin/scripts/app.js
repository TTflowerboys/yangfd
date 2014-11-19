/* Created by frank on 14-8-14. */


angular.module('app',
    ['ui.router', 'angular-loading-bar', 'angularFileUpload', 'ui.bootstrap', 'angular-growl', 'wysiwyg.module', 'multi-select', 'ang-drag-drop'])
    .run(function ($rootScope, $state, $stateParams, $sce) {
        $rootScope.i18n = i18n;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.renderHtml = function (html) {
            if (typeof  html !== 'string') { return '' }
            return $sce.trustAsHtml(html || '');
        }
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'signIn') {
                    toParams.from = fromState.name
                }

            })
        //userLanguage
        var userLanguageAtLocal = localStorage.getItem('adminUserLanguage')
        $rootScope.userLanguage = {
            value: userLanguageAtLocal || window.lang
        }
        $rootScope.$watch('userLanguage', function (newValue, oldValue) {
            localStorage.setItem('adminUserLanguage', newValue.value)
        }, true)
        //userArea
        var userAreaAtLocal = window.localStorage.getItem('adminUserArea')
        $rootScope.userArea = {
            value: userAreaAtLocal || ''
        }
        $rootScope.$watch('userArea', function (newValue, oldValue) {
            window.localStorage.setItem('adminUserArea', newValue.value)
        }, true)
        //userCurrency
        var userCurrencyAtLocal = window.localStorage.getItem('adminUserCurrency')
        $rootScope.userCurrency = {
            value: userCurrencyAtLocal || ''
        }
        $rootScope.$watch('userCurrency', function (newValue, oldValue) {
            window.localStorage.setItem('adminUserCurrency', newValue.value)
        }, true)
        //dashboardLanguage
        var dashboardLanguageAtLocal = localStorage.getItem('adminDashboardLanguage')
        $rootScope.dashboardLanguage = {
            value: dashboardLanguageAtLocal || window.lang
        }
        $rootScope.$watch('dashboardLanguage', function (newValue, oldValue) {
            localStorage.setItem('adminDashboardLanguage', newValue.value)
        }, true)
    })

angular.element(document).ready(function () {
    $.get('/api/1/user').done(function (response) {
        window._user = response.val;
        angular.bootstrap(document, ['app']);
    }).fail(function (response) {
    })
})
