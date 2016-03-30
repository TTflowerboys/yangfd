(function () {

    function ctrlAffiliateRole($scope, $state, misc, api, statisticsApi, $timeout) {
        var date = new Date()
        $scope.selected = {
            date_from: new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000,
            date_to: date.getTime() / 1000
        }
        $scope.data = {}
        $scope.coupon = {}

        $scope.item = $scope.user
        $scope.coupon = _.extend($scope.coupon, _.clone($scope.item.coupons) || {discount: {value: '50', unit: 'GBP'}})

        $scope.list = []

        $scope.selected.per_page = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false

        var params = {
            per_page: $scope.selected.per_page,
            referral: $scope.user.id,
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

        $timeout(function () {
            $scope.searchTicket()
        })


        function updateParams() {
            delete params.query
            delete params.referral_code
            delete params.time
            delete params.last_modified_time
            delete params.register_time
            delete params.insert_time
            if($scope.selected.date_to && $scope.selected.date_to > 0) {
                params.register_time = $scope.selected.date_to
            }
            _.extend(params, $scope.selected, {referral: $scope.user.id})
            delete params.date_from
            delete params.date_to
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
                if($scope.selected.date_from && $scope.selected.date_from > 0) {
                    return item.register_time >= parseInt($scope.selected.date_from)
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
                /*couponApi.search({
                    user_id: item.id
                })
                    .success(function (data) {
                        //todo 等接口修复后再填充优惠券数据
                    })*/
                return item
            })
            $scope.pages[$scope.currentPageNumber] = $scope.list

            if (!$scope.list || $scope.list.length < $scope.selected.per_page || ($scope.selected.date_from && $scope.selected.date_from > 0 && data.val[data.val.length - 1].register_time <= parseInt($scope.selected.date_from))) {
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


        $timeout(function () {
            statisticsApi.getNewAffiliateUserBehavior({
                user_id: $scope.user.id
            }).success(function (data) {
                if(data.val && data.val.length) {
                    $scope.data.userTotal = data.val[0].affiliate_new_user_total //总注册会员数
                }
            })
        })

        $scope.getAggregateData = function () {
            statisticsApi.getNewAffiliateUserBehavior(_.extend({
                user_id: $scope.user.id
            }, misc.cleanEmptyData($scope.selected, true))).success(function (data) {
                if(data.val && data.val.length) {
                    $scope.data.userNew = data.val[0].affiliate_new_user_total //所选时间段新注册会员数
                }
            })
            $scope.searchTicket()
        }
    }

    angular.module('app').controller('ctrlAffiliateRole', ctrlAffiliateRole)
})()


