/**
 * Created by Michael on 14/11/14.
 */
(function () {

    function ctrlCrowdfundingItems($scope) {

        $scope.addManageTeam = function () {
            if (!$scope.item.management_team) {
                $scope.item.management_team = []
            }
            var temp = {
                name: {},
                title: {},
                description: {}
            }
            $scope.item.management_team.push(temp);
        }

        $scope.onRemoveManageTeam = function (index) {
            $scope.item.management_team.splice(index, 1)
        }

        $scope.addCapital = function () {
            if (!$scope.item.capital_structure) {
                $scope.item.capital_structure = []
            }
            var temp = {
                name: {}
            }
            $scope.item.capital_structure.push(temp);
        }

        $scope.onRemoveCapital = function (index) {
            $scope.item.capital_structure.splice(index, 1)
        }

    }

    angular.module('app').controller('ctrlCrowdfundingItems', ctrlCrowdfundingItems)

})()