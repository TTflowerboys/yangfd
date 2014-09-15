angular.module('app')
    .constant('countries', [
        {name: '中国', value: 'CN'},
        {name: '英国', value: 'GB'},
        {name: '香港', value: 'HK'},
        {name: '美国', value: 'US'}
    ])
    .constant('defaultCountry', 'CN')
    .run(function ($rootScope, countries, defaultCountry) {
        $rootScope.countries = countries
        $rootScope.defaultCountry = defaultCountry
    })
