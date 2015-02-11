/**
 * Created by zhou on 15-2-11.
 */
angular.module('app')
    .constant('roomCountType', [
        {name: i18n('居室数'), value: 'bedroom_count'},
        {name: i18n('客厅数'), value: 'living_room_count'},
        {name: i18n('厨房数'), value: 'kitchen_count'},
        {name: i18n('厕所数'), value: 'bathroom_count'}
    ]).run(function ($rootScope, roomCountType) {
        $rootScope.roomCountType = roomCountType
    })
