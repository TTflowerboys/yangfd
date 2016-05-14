(function () {

    function ctrlAffiliateList($scope, fctModal, api, affiliate_user_detail_api, $q, $state) {
        $scope.list = []
        $scope.selected = {}
        $scope.filterApply = true

        $scope.selected.per_page = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api
        $scope.fetched = false

        var params = {
            per_page: $scope.selected.per_page,
            country: $scope.selected.country,
            user_type: $scope.selected.user_type,
            occupation: $scope.selected.occupation,
            role: ['affiliate']
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

            $scope.filterApply = false
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
        // api.getAll({params: params}).success(onGetList)

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
            $scope.list = _.map(data.val, function (item, index) {
                api.getLog(item.id)
                    .then(function (data) {
                        if(data.data.val && data.data.val.length && data.data.val[0] && $scope.list[index]) {
                            $scope.list[index].log = data.data.val[0]
                        } else if($scope.list[index]) {
                            $scope.list[index].log = {}
                        }
                    })
                return item
            })
            $scope.pages[$scope.currentPageNumber] = $scope.list

            if (!$scope.list || $scope.list.length < $scope.selected.per_page) {
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
        $scope.updateItem = function (item, config) {
            return api.update(item.id, item, config)
        }

        $scope.selectOption = [
          {
            'value': 'member_count',
            'label': '会员人数'
          },
          {
            'value': 'register_time',
            'label': '注册时间'
          }
        ]
        $scope.per_page = 12
        $scope.method = {}
        $scope.method.sort_by = 'member_count'
        $scope.aggregation_result = []
        $scope.noAggPrev = true
        $scope.noAggNext = true
        var aggFullList = []

        var index = 0
        var index_end = 0
        $scope.aggregationPrevPage = function() {
          index -= $scope.per_page
          if (index < 0) {
            index = 0
          }
          onPageUpdate()
        }
        $scope.aggregationNextPage = function() {
          index += $scope.per_page
          if (index > aggFullList.length) {
            index -= $scope.per_page
          }
          onPageUpdate()
        }
        $scope.applyFilter = function() {
          $scope.filterApply = true
          aggregation_api.get_aggregation({
            'sort_by': $scope.method.sort_by,
            'nickname': $scope.selected.query,
            'referral_code': $scope.selected.referral_code
          }).success(onGetAggList)
        }
        $scope.applyFilter()
        function compare_value(a, b) {
          if (a.register_time > b.register_time) {
            return 1;
          }
          if (a.register_time < b.register_time) {
            return -1;
          }
          return 0;
        }
        function onGetAggList(data) {
          aggFullList = data.val.affiliate_member_count
          $scope.affiliate_user_count = data.val.affiliate_user_count

          if ($scope.method.sort_by === 'register_time') {
            aggFullList.sort(compare_value).reverse()
          }

          aggFullList = _.map(data.val.affiliate_member_count, function (item, aggindex) {
              api.getLog(item.id)
                  .then(function (data) {
                      if(data.data.val && data.data.val.length && data.data.val[0] && aggFullList[aggindex]) {
                          aggFullList[aggindex].log = data.data.val[0]
                      } else if(aggFullList[aggindex]) {
                          aggFullList[aggindex].log = {}
                      }
                  })
              return item
          })

          index = 0
          onPageUpdate()
        }
        function onPageUpdate() {
          $scope.noAggPrev = (index < $scope.per_page)?true:false
          $scope.noAggNext = (index + $scope.per_page > aggFullList.length)?true:false
          index_end = index + $scope.per_page
          if (index_end > aggFullList.length) {
            index_end = aggFullList.length
          }
          $scope.aggregation_result = aggFullList.slice(index, index_end)
        }
    }

    angular.module('app').controller('ctrlAffiliateList', ctrlAffiliateList)
})()
