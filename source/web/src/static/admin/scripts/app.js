/* Created by frank on 14-8-14. */


angular.module('app',
    ['ui.router', 'angular-loading-bar', 'angularFileUpload', 'ui.bootstrap', 'angular-growl', 'multi-select', 'ang-drag-drop', 'textAngular', 'ui.bootstrap.datetimepicker', 'mj.scrollingTabs', 'luegg.directives'])
    .run(function ($rootScope, $state, $stateParams, $sce) {
        $rootScope.i18n = i18n;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.renderHtml = function (html) {
            if (typeof  html !== 'string') { return '' }
            return $sce.trustAsHtml(html || '');
        }
        $rootScope.transferTime = function (time, unit) {
            var value = time.value_float || parseInt(time.value)
            var config = {
                second: 1,
                minute: 60,
                hour: 3600,
                day: 3600 * 24,
                week: 3600 * 24 * 7,
                month: 3600 * 24 * 30.4368498984,
                year: 3600 * 24 * 365.242198781
            }
            value = value * config[time.unit] / config[unit]
            return _.extend(_.clone(time), {
                unit: unit,
                value: value < 1 ? 1 : Math.round(value).toString(),
                value_float: value
            })
        }
        $rootScope.isStudentHouse = function (rentTicket) {
            return rentTicket && rentTicket.property && rentTicket.property.property_type && rentTicket.property.property_type.slug === 'student_housing' && rentTicket.property.partner === true
        }
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                $rootScope.fromState = fromState
                if (toState.name === 'signIn') {
                    toParams.from = fromState.name
                    return
                }
                if (toState.name.indexOf('detail') >= 0 || toState.name.indexOf('edit') >= 0) {
                    toParams.from = fromState.name
                    return
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
        //userDistance
        var userDistanceAtLocal = window.localStorage.getItem('adminUserDistance')
        $rootScope.userDistance = {
            value: userDistanceAtLocal || ''
        }
        $rootScope.$watch('userDistance', function (newValue, oldValue) {
            window.localStorage.setItem('adminUserDistance', newValue.value)
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
