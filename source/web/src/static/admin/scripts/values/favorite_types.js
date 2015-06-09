/**
 * Created by levy on 15-6-9.
 */
angular.module('app')
    .constant('favoriteTypes', [
        {name: i18n('众筹房产'), value: 'item'},
        {name: i18n('出租房产'), value: 'rent_ticket'},
        {name: i18n('出售房产'), value: 'property'},
    ]).run(function ($rootScope, favoriteTypes) {
        $rootScope.favoriteTypes = favoriteTypes
    })
