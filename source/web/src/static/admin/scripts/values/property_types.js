/**
 * Created by Michael on 14/9/6.
 */
angular.module('app')
    .constant('property_types', [
        { name: '楼盘', value: 'property' },
        { name: '现代公寓', value: 'house' },
        { name: '联排别墅', value: 'villas1' },
        { name: '独栋别墅', value: 'villas2' },
        { name: '半独立别墅', value: 'villas3' },
        { name: '平房式别墅', value: 'villas4' },
    ]).run(function ($rootScope, property_types) {
        $rootScope.property_types = property_types
    })
