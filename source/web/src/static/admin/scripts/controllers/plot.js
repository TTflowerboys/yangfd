/**
 * Created by Michael on 14/10/22.
 */
(function () {

    function ctrlPlotList($scope, $state, $http, $rootScope, $stateParams, fctModal, propertyApi, enumApi, api) {
        $scope.item = {}
        $scope.api = api
        $scope.fetched = false

        enumApi.getEnumsByType('property_type').success(function (data) {
            var list = data.val
            var res
            for (var item in list) {
                if (list[item].slug === 'new_property' || list[item].slug === 'student_housing') {
                    if (res) {
                        res += ',' + list[item].id
                    } else {
                        res = list[item].id
                    }
                }
            }
            propertyApi.getAll({params: {property_type: res, status: 'selling'}}).success(function (data) {
                $scope.propertyList = data.val.content
            })
        })

        $scope.onPropertyChange = function () {
            api.search({ params: {property_id: $scope.item.propertyId}}).success(onGetList)
        }

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val

        }

    }

    angular.module('app').controller('ctrlPlotList', ctrlPlotList)

})()

