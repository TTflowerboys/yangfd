/**
 * Created by Michael on 14/9/20.
 */
angular.module('app')
    .directive('getPropertyEnums', function (enumApi) {
        return {
            restrict: 'AE',
            link: function (scope) {
                enumApi.getEnumsByType('property_type')
                    .success(function (data) {
                        scope.propertyTypeList = data.val
                    })
                enumApi.getEnumsByType('intention')
                    .success(function (data) {
                        scope.intentionList = data.val
                    })
                enumApi.getEnumsByType('equity_type')
                    .success(function (data) {
                        scope.equityTypeList = data.val
                    })
                enumApi.getEnumsByType('decorative_style')
                    .success(function (data) {
                        scope.decorativeStyleList = data.val
                    })
                enumApi.getEnumsByType('facing_direction')
                    .success(function (data) {
                        scope.facingDirectionList = data.val
                    })
                enumApi.getEnumsByType('property_price_type')
                    .success(function (data) {
                        scope.propertyPriceTypeList = data.val
                    })
                enumApi.getEnumsByType('country')
                    .success(function (data) {
                        scope.systemCountries = data.val
                    })
                enumApi.getEnumsByType('city')
                    .success(function (data) {
                        scope.systemCities = data.val
                    })
//                scope.$watch('item.country', function (newValue) {
//                    console.log(newValue)
//                    if (newValue === undefined) {
//                        return
//                    }
//                    enumApi.getEnumsByType('city')
//                        .success(function (data) {
//                            scope.systemCities = data.val
//                        })
//                    geoApi.getCitiesByCountry({params: {_i18n: 'disabled', country: newValue}})
//                        .success(function (data) {
//                            console.log(data.val)
//                            scope.systemCities = data.val
//                        })
//                })
            }
        }
    })