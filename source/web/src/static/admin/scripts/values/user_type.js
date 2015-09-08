
angular.module('app')
    .constant('userType', [
        { name: i18n('租客'), value: 'tenant' },
        { name: i18n('房东'), value: 'landlord' },
        { name: i18n('投资人'), value: 'investors' }
    ]).run(function ($rootScope, userType) {
        $rootScope.userType = userType
    })
