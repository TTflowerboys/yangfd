/**
 * Created by Michael on 14/10/1.
 */


(function () {
    function ctrlInvitationList($scope, fctModal, api) {
        $scope.list = []
        $scope.perPage = 10
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false

        //Work around angular can not watch primitive type
        $scope.selected = {}
        $scope.selected.status = {}

        var params = {
            per_page: $scope.perPage
        }

        api.getAll({ params: params }).success(onGetList)

        $scope.refreshList = function () {
            api.getAll({ params: params}).success(onGetList)
        }

        $scope.onSend = function (item) {
            api.invite(item.email).success(function () {
                api.update(item.id,'invited').success(function(){
                    $scope.refreshList()
                })
            })
        }

        $scope.$watch('selected.status', function (newValue, oldValue) {
            // Ignore initial setup.
            if (newValue === oldValue) {
                return
            }

            delete params.time
            params.status = $scope.selected.status
            $scope.refreshList()
        }, true)

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }

            api.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber += 1
                })
                .success(onGetList)

        }
        $scope.prevPage = function () {

            var prevPrevPageNumber = $scope.currentPageNumber - 2
            var prevPrevPageData
            var lastItem
            if (prevPrevPageNumber >= 1) {
                prevPrevPageData = $scope.pages[prevPrevPageNumber]
                lastItem = prevPrevPageData[prevPrevPageData.length - 1]
            }

            if (lastItem) {
                if (lastItem.time) {
                    params.time = lastItem.time
                }
            } else {
                delete params.time
            }

            api.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)
        }

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val
            _.each($scope.list, function (item) {
                if(_.isArray(item.ipaddress) && item.ipaddress.length) {
                    api.getCountry(item.ipaddress[0]).success(function (data) {
                        item.country = data.country_name
                    })
                }
            })
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

    angular.module('app').controller('ctrlInvitationList', ctrlInvitationList)

})()

