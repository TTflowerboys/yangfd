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

        appversionApi.getAll({
            params:{
                'platform': 'ios'
            }
        })
            .success(function (data) {
                updateReleaseList(data.val)
            })

        $scope.selected = {}
        $scope.selected.per_page = 12

        $scope.$watch(function () {
            return [$scope.selected.platform, $scope.selected.release].join(',')
        }, function () {
            $scope.$parent.refreshListByPrams($scope.selected)
        })

    }

    angular.module('app').controller('ctrlAppversionItems', ctrlAppversionItems)

})()