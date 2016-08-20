(function () {

    function ctrlStatistics_top_ticket_search_keywords($scope, fctModal, api, $stateParams) {

        $scope.list = []
        $scope.lastUpdatedTime = 0
        $scope.refreshResult = ''

        $scope.get = function () {
            api.getTopTicketSearchKeywords().success(function (data) {
                $scope.lastUpdatedTime = data.val.last_updated
                var mostCommon = data.val.most_common
                $scope.list = _.sortBy(_.map(_.keys(mostCommon), function (key) {
                    return {name: key, value: mostCommon[key]}
                }), function (item) {
                    return -item.value
                })
            })
        }

        $scope.refresh = function () {
            api.refreshTopTicketSearchKeywords().success(function (data) {
                if (data.ret === 0) {
                    //刷新成功
                    $scope.refreshResult = i18n('刷新成功，由于数据生成不是实时的，可能需要几分钟后再来查看')
                    $scope.get()
                }
                else {
                    $scope.refreshResult = i18n('刷新失败！')
                }
            })
        }

        //get when display
        $scope.get()
    }

    angular.module('app').controller('ctrlStatistics_top_ticket_search_keywords', ctrlStatistics_top_ticket_search_keywords)
})()
