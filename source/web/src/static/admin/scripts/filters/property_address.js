angular.module('app')
    .filter('propertyAddress', function ($rootScope) {
        function getValue(item, key){
            key = key || $rootScope.userLanguage.value
            if (!_.isObject(item)) {
                return item
            } else {
                return item[key]
            }
        }
        return function (property) {
            if (!property) {
                return ''
            }
            return (_.compact([(_.compact([getValue(property.floor), getValue(property.house_name)])).join('-')].concat([getValue(property.community), getValue(property.street), getValue(property.city, 'name'), window.team.countryMap[getValue(property.country, 'code')]]))).join(',')
        }
    })