angular.module('app')
    .filter('timePeriod', function ($rootScope) {
        return function (period) {
            if (!period || !period.value) {
                return $rootScope.i18n('不限')
            }
            return period.value + (period.i18n_unit || period.unit)
        }
    })