/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlOperationContent($scope, $state , adApiFactory, channelApi, misc,fctModal, $timeout) {
        $scope.channelApi = channelApi
        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.adApiFactory = adApiFactory
        $scope.fetched = false

        //Work around angular can not watch primitive type
        $scope.selected = {}
        $scope.selected.channel = ''

        var params = {
            per_page: $scope.perPage
        }

        //Get Channel List
        channelApi.getAll()
            .success(function (data) {
                $scope.availableChannels = data.val

                //If got more than one channel, default select first one to show
                if($scope.availableChannels.length > 0){
                    $scope.selected.channel = $scope.availableChannels[0]
                }
            })

        $scope.$watch('selected.channel',function(newValue, oldValue){
            // Ignore initial setup.
            if ( newValue === oldValue ) {
                return;
            }

            $scope.adApiFactory = adApiFactory($scope.selected.channel)
            $scope.adApiFactory.getAll({ params: params }).success(onGetList)
        },true)

        $scope.refreshList = function () {
            $scope.adApiFactory.getAll({ params: params}).success(onGetList)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                $scope.adApiFactory.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.time) {params.time = lastItem.time}
            if (lastItem.register_time) {params.register_time = lastItem.register_time}
            if (lastItem.insert_time) {params.insert_time = lastItem.insert_time}

            $scope.adApiFactory.getAll({params: params})
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
                if (lastItem.time) {params.time = lastItem.time}
                if (lastItem.register_time) {params.register_time = lastItem.register_time}
                if (lastItem.insert_time) {params.insert_time = lastItem.insert_time}
            } else {
                delete params.time
                delete params.register_time
                delete params.insert_time
            }

            $scope.adApiFactory.getAll({params: params})
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

    angular.module('app').controller('ctrlOperationContent', ctrlOperationContent)

})()

