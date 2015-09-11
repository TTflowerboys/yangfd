
angular.module('app')
    .constant('venueStatus', [
        {name: i18n('展示'), value: 'show'},
        {name: i18n('隐藏'), value: 'hide'}
    ])
    .run(function ($rootScope, venueStatus) {
        $rootScope.venueStatus = venueStatus
    })
