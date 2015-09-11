
angular.module('app')
    .constant('displayTypes', [
        {name: i18n('展示'), value: true},
        {name: i18n('不展示'), value: false}
    ])
    .run(function ($rootScope, displayTypes) {
        $rootScope.displayTypes = displayTypes
    })
