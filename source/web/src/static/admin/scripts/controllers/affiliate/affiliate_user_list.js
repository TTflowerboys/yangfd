(function () {

    function ctrlAffiliateDetailUsers($scope, fctModal, api, $q, $state, couponApi) {
        $scope.list = []

        $scope.selected.per_page = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false

        var params = {
            per_page: $scope.selected.per_page,
            referral: $state.params.id,
        }
        if($state.params.dateTo && $state.params.dateTo > 0) {
            params.register_time = $state.params.dateTo
        }

        $scope.refreshList = function () {
            _.each(params, function (val, key) {
                if(val === '') {
                    delete params[key]
                }
            })
            api.getAll({params: params}).success(onGetList)
        }
        
        $scope.searchTicket = function () {
            updateParams()
            $scope.refreshList()
        }
        
        function updateParams() {
            delete params.query
            delete params.referral_code
            delete params.time
            delete params.last_modified_time
            delete params.register_time
            delete params.insert_time
            _.extend(params, $scope.selected)
        }
        $scope.$watch(function () {
            return [$scope.selected.country, $scope.selected.user_type, $scope.selected.occupation].join(',')
        }, function (oldValue, newValue) {
            if(oldValue !== newValue) {
                updateParams()
                $scope.refreshList()
            }
        }, true)

        if($state.params.code){
            params.query = $state.params.code
        }
        api.getAll({params: params}).success(onGetList)

        $scope.onSuspend = function (item) {
            fctModal.show('Do you want to suspend it?', undefined, function () {
                $q.all(api.suspend(item.id), api.update(item.id, {email_message_type: []})).then(function () {
                    $scope.refreshList()
                })
            })
        }

        $scope.onActivate = function (item) {
            fctModal.show('Do you want to activate it?', undefined, function () {
                $q.all(api.activate(item.id), api.update(item.id, {email_message_type: ['system', 'rent_ticket_reminder', 'rent_intention_ticket_check_rent']})).then(function () {
                    $scope.refreshList()
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }
            if (lastItem.last_modified_time) {
                params.last_modified_time = lastItem.last_modified_time
            }
            if (lastItem.register_time) {
                params.register_time = lastItem.register_time
            }
            if (lastItem.insert_time) {
                params.insert_time = lastItem.insert_time
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
                if (lastItem.last_modified_time) {
                    params.last_modified_time = lastItem.last_modified_time
                }
                if (lastItem.register_time) {
                    params.register_time = lastItem.register_time
                }
                if (lastItem.insert_time) {
                    params.insert_time = lastItem.insert_time
                }
            } else {
                delete params.time
                delete params.last_modified_time
                delete params.register_time
                delete params.insert_time
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
            $scope.list = _.map(_.filter(data.val, function (item) {
                if($state.params.dateFrom && $state.params.dateFrom > 0) {
                    return item.register_time >= parseInt($state.params.dateFrom)
                } else {
                    return true
                }
            }), function (item, index) {
                api.getLog(item.id)
                    .then(function (data) {
                        if(data.data.val && data.data.val.length && data.data.val[0] && $scope.list[index]) {
                            $scope.list[index].log = data.data.val[0]
                        } else if($scope.list[index]) {
                            $scope.list[index].log = {}
                        }
                    })
                couponApi.search({
                    user_id: item.id
                })
                    .success(function (data) {
                        if(data.val && data.val.length) {
                            $scope.list[index].offer = data.val[0]
                        }
                    })
                return item
            })
            $scope.pages[$scope.currentPageNumber] = $scope.list

            if (!$scope.list || $scope.list.length < $scope.selected.per_page || ($state.params.dateFrom && $state.params.dateFrom > 0 && data.val[data.val.length - 1].register_time <= parseInt($state.params.dateFrom))) {
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
        $scope.updateItem = function (item) {
            return api.update(item.id, item)
        }
    }

    angular.module('app').controller('ctrlAffiliateDetailUsers', ctrlAffiliateDetailUsers)
})()


