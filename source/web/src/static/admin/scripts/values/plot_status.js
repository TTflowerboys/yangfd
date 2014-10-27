/**
 * Created by Michael on 14/10/27.
 */
angular.module('app')
    .constant('plotStatus', [
        {name: i18n('在售中'), value: 'selling'},
        {name: i18n('已售罄'), value: 'sold out'}
    ]).run(function ($rootScope, plotStatus) {
        $rootScope.plotStatus = plotStatus
    })
