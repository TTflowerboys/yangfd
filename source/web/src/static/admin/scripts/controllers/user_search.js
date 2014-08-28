/* Created by frank on 14-8-28. */

(function () {

    function ctrlUserSearch($scope, $state, $http, $rootScope, $stateParams, fctModal, $timeout, api) {
        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []

        api.getAll({ params: {per_page: $scope.perPage} }).success(onGetList)

        $scope.onAddRole = function (item, roleToAdd) {
            api.addRole(item.id, roleToAdd, {successMessage: 'done', errorMessage: true})
                .success(function () {
                    item.role.push(roleToAdd)
                })
        }
        $scope.onRemoveRole = function (item, roleToRemove) {
            api.removeRole(item.id, roleToRemove, {successMessage: 'done', errorMessage: true})
                .success(function () {
                    item.role.splice(item.role.indexOf(roleToRemove), 1)
                })
        }

        $scope.refreshList = function () {
            api.getAll({ params: {per_page: $scope.perPage}}).success(onGetList)
        }

        $scope.nextPage = function () {
            api.getAll({params: {
                time: $scope.list[$scope.list.length - 1].time,
                per_page: $scope.perPage
            }})
                .success(function () {
                    $scope.currentPageNumber += 1
                })
                .success(onGetList)

        }

        $scope.prevPage = function () {

            var prevPrevPageNumber = $scope.currentPageNumber - 2
            var prevPrevPageData
            var time
            if (prevPrevPageNumber >= 1) {
                prevPrevPageData = $scope.pages[prevPrevPageNumber]
                time = prevPrevPageData[prevPrevPageData.length - 1].time
            }

            api.getAll({params: {
                time: time,
                per_page: $scope.perPage
            }})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val
            $scope.pages[$scope.currentPageNumber] = $scope.list

            if (!$scope.list || $scope.list.length < $scope.perPage) {
                $scope.noNext = true
            } else {
                $scope.noNext = false
            }
            if ($scope.currentPageNumber <= 1) {
                $scope.noPrev = true
            } else {
                $scope.noPrev = false
            }
        }


    }

    angular.module('app').controller('ctrlUserSearch', ctrlUserSearch)

})()


