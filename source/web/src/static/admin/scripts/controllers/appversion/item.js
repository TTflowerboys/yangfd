(function () {

    function ctrlAppversionItems($scope, $rootScope, appversionApi) {

        $scope.addChangeLog = function () {
            /*if (_.isEmpty($scope.item.changelog)) {
                $scope.item.changelog = {}
            }*/
            if (!$scope.item.changelog) {
                $scope.item.changelog = []
            }
            $scope.item.changelog.push('')
        }


        $scope.onRemoveChangeLog = function (index) {
            $scope.item.changelog.splice(index, 1)
        }

        function updateReleaseList (parentList) {
            $scope.releaseList = _.map(_.filter(parentList, function (val) {
                return val.platform === 'ios'
            }), function (val) {
                return val.version_name
            })
        }
        if($scope.$parent.list && $scope.$parent.list.length) {
            updateReleaseList($scope.$parent.list)
        } else {
            appversionApi.getAll({
                params:{
                    'platform': 'ios'
                }
            })
                .success(function (data) {
                    updateReleaseList(data.val)
                })
        }

    }

    angular.module('app').controller('ctrlAppversionItems', ctrlAppversionItems)

})()