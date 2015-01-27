/**
 * Created by zhou on 15-1-27.
 */
angular.module('app')
    .constant('plotFilterBuildingArea', [
        {name: i18n('50平米以下'), value: ',50'},
        {name: i18n('50-100平米'), value: '50,100'},
        {name: i18n('100-200平米'), value: '100,200'},
        {name: i18n('200-300平米'), value: '200,300'},
        {name: i18n('300平米以上'), value: '300,'}
    ]).run(function ($rootScope, plotFilterBuildingArea) {
        $rootScope.plotFilterBuildingArea = plotFilterBuildingArea
    })
