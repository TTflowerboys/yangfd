/**
 * Created by Michael on 15/7/29.
 */


(function () {
    function ctrlAndroidSubscriptionList($scope, fctModal, api, $rootScope) {
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
            per_page: $scope.perPage,
            tag:['subscribe_android_app']
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
                    item.country = $rootScope.i18n('载入中...')
                    api.getCountry(item.ipaddress[0]).success(function (data) {
                        item.country = window.team.countryMap[data.val] || $rootScope.i18n('无结果')
                    })
                }else {
                    item.country = $rootScope.i18n('无ip地址')
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

    angular.module('app').controller('ctrlAndroidSubscriptionList', ctrlAndroidSubscriptionList)

})()

