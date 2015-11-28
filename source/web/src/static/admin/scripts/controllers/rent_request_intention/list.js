(function () {

    function ctrlRentRequestIntentionList($scope, fctModal, api, userApi, $state, $timeout) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        var params = {
            status:'requested',
            per_page: $scope.perPage,
            sort: 'time,desc'
        }

        function updateParams() {
            params.time = undefined
            for(var key in params) {
                if(params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            }
        }

        updateParams()
        api.getAll({
            params: params, errorMessage: true
        }).success(onGetList)


        $scope.refreshList = function () {
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }

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

            api.getAll({params: params, errorMessage: true})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        $scope.openImage = function (item) {
            window.open(item.visa)
        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = _.map(data.val, function (item, index) {
                // Calculate age from birthday
                item.age = (Date.now() - item.date_of_birth * 1000)/(365 * 24 * 60 * 60 * 1000)

                // Get ip when ticket is created from log
                item.log = {
                    ip: window.i18n('载入中...'),
                    link: ''
                }
                api.getLog(item.id)
                    .then(function (data) {
                        if(data.data.val && data.data.val.length && data.data.val[0].ip && data.data.val[0].ip.length) {

                            $scope.list[index].log = {
                                ip: data.data.val[0].ip[0],
                                link: 'http://www.ip2location.com/demo'
                            }
                        } else {
                            $scope.list[index].log = {
                                ip: window.i18n('无结果')
                            }
                        }
                    })

                return item
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

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.updateItem = function (item) {
            api.update(item)
                .success(function () {
                    $scope.refreshList()
                })
        }

        $scope.updateUserItem = function (item) {
            userApi.update(item.id, item)
                .success(function () {
                    $scope.refreshList()
                })
        }

    }

    angular.module('app').controller('ctrlRentRequestIntentionList', ctrlRentRequestIntentionList)

})()


