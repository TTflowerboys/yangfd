(function () {

    function ctrlRentIntentionList($scope, fctModal, api, userApi, $state, $timeout) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        var params = {
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

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = _.map(data.val, function (item, index) {
                item.refer = {
                    text: window.i18n('载入中...'),
                    link: ''
                }
                api.getRefer(item.id)
                    .then(function (data) {
                        if(data.data.val && data.data.val.length && data.data.val[0].referer) {
                            var refer = data.data.val[0].referer
                            // Check if have id in url path
                            var id = (refer.split('?')[0].match(/(?!property\-to\-rent\/)([a-z0-9]{24})/) || [])[1]
                            // If no rent id in path, check if in url param
                            if(!id){
                                id = team.getQuery('ticketId',refer)
                            }
                            $scope.list[index].refer = {
                                id: id,
                                link: refer,
                                text: id ? window.i18n('查看来源房产') : refer
                            }
                        } else {
                            $scope.list[index].refer = {
                                text: window.i18n('无结果')
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
            return api.update(item)
        }

        $scope.updateUserItem = function (item) {
            return userApi.update(item.id, item)
        }

    }

    angular.module('app').controller('ctrlRentIntentionList', ctrlRentIntentionList)

})()


