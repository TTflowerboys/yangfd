angular.module('app')
    .constant('countries', [
        {name: '中国', value: 'CN'},
        {name: '英国', value: 'UK'},
        {name: '香港', value: 'HK'},
        {name: '美国', value: 'US'}
    ]).constant('defaultCountry', 'CN')