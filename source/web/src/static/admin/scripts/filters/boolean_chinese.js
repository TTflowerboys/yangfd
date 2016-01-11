
angular.module('app')
    .filter('booleanChinese', function () {
        return function(input) {
            return input === true ? i18n('是') : (input === false ? i18n('否') : '')
        }
    })