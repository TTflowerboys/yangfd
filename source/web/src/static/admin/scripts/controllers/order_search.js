/**
 * Created by zhou on 15-1-23.
 */
(function () {

    function ctrlOrderSearch($scope) {

        $scope.selected = {}

        var params = {
            per_page: $scope.perPage
        }

        function updateParams() {
            if (isNaN($scope.selected.starttime)) { $scope.selected.starttime = 0; }
            if ($scope.selected.starttime === undefined || $scope.selected.starttime === '' || $scope.selected.starttime === 0) {
                delete params.starttime
            } else {
                params.starttime = $scope.selected.starttime;
            }
            if (isNaN($scope.selected.endtime)) { $scope.selected.endtime = 0; }

            if ($scope.selected.endtime === undefined || $scope.selected.endtime === '' || $scope.selected.endtime === 0) {
                delete params.endtime
            } else {
                params.endtime = $scope.selected.endtime;
            }
            if ($scope.selected.status === undefined || $scope.selected.status === '') {
                delete params.status
            } else {
                params.status = $scope.selected.status;
            }
        }

        $scope.searchOrder = function () {
            updateParams()
            $scope.api.getAll({params: params}).success($scope.onGetList)
        }
    }

    angular.module('app').controller('ctrlOrderSearch', ctrlOrderSearch)

})()

