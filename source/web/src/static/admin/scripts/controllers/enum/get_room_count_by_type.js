/**
 * Created by zhou on 15-2-11.
 */
(function () {

    function ctrlGetRoomCountByType($scope, enumApi) {
        $scope.enums = []
        $scope.item = {}
        $scope.item.type = 'bedroom_count'
        $scope.$watch('item.type', function (newValue) {
            if (newValue) {
                enumApi.getEnumsByType(newValue).success(function (data) {
                    $scope.roomCount = data.val
                })
            }
        })
    }

    angular.module('app').controller('ctrlGetRoomCountByType', ctrlGetRoomCountByType)

})()