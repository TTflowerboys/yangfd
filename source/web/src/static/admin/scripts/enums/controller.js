/* Created by frank on 14-8-15. */


(function () {

    function ctrlEnums($scope, $state, api) {
        $scope.enumTypes = ['property_type', 'intention', 'equity_type', 'decorative_style',
            'facing_direction', 'school_type', 'school_grade', 'facilities']
        $scope.enums = [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {}
        ]
        $scope.setEnumData = function (index, data) {
        }
        $scope.getEnums = function () {
            for (var i = 0; i < $scope.enumTypes.length; i += 1) {
                $scope.getEnumByType(i)
            }
//            api.getEnumsByType('property_type').success(function (data) {
////TODO
//            })
//            api.getEnumsByType('intention').success(function (data) {
//                $scope.intentions = data.val
//            })
//            api.getEnumsByType('equity_type').success(function (data) {
//                $scope.equityTypes = data.val
//            })
//            api.getEnumsByType('decorative_style').success(function (data) {
////TODO
//            })
//            api.getEnumsByType('facing_direction').success(function (data) {
////TODO
//            })
//            api.getEnumsByType('school_type').success(function (data) {
////TODO
//            })
//            api.getEnumsByType('school_grade').success(function (data) {
////TODO
//            })
//            api.getEnumsByType('facilities').success(function (data) {
////TODO
//            })
        }
        $scope.getEnumByType = function (index) {
            api.getEnumsByType($scope.enumTypes[index]).success(function (data) {
                $scope.enums[index] = data.val
            })
        }

    }

    angular.module('app').controller('ctrlEnums', ctrlEnums)

})()

