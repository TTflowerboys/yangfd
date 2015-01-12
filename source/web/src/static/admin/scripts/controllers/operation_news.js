/**
 * Created by chaowang on 10/02/14.
 */
(function () {

    function ctrlOperationNews($scope, growl, weixinApi, fctModal, newsApi) {
        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.fetched = false
        $scope.api = newsApi

        var params = {
            per_page: $scope.perPage
        }

        newsApi.getAll({params: params}).success(onGetList)

        $scope.refreshList = function () {
            newsApi.getAll({params: params}).success(onGetList)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                newsApi.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }
            if (lastItem.register_time) {
                params.register_time = lastItem.register_time
            }
            if (lastItem.insert_time) {
                params.insert_time = lastItem.insert_time
            }

            newsApi.getAll({params: params})
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
                if (lastItem.register_time) {
                    params.register_time = lastItem.register_time
                }
                if (lastItem.insert_time) {
                    params.insert_time = lastItem.insert_time
                }
            } else {
                delete params.time
                delete params.register_time
                delete params.insert_time
            }

            newsApi.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        $scope.onGetList = onGetList

        function onGetList(data) {
            $scope.fetched = true
            getNewsIds()
            $scope.list = data.val
            for (var index in $scope.list) {
                if (news_ids.indexOf($scope.list[index].id) >= 0) {
                    $scope.list[index].selected = true
                }
            }
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

        //Work around angular can not watch primitive type
        $scope.selected = {}
        $scope.selected.category = {}

        /*        $scope.$watch('newsCategoryList', function (value) {
         console.log(value)
         if(!_.isUndefined(value)&&value.length>0){
         $scope.selected.category = value[0]
         }
         })*/

        $scope.$watch('selected.category', function (newValue, oldValue) {
            // Ignore initial setup.
            if (newValue === oldValue) {
                return
            }

            params.category = $scope.selected.category.id
            newsApi.getAll({params: params, errorMessage: true}).success($scope.onGetList)
        }, true)

        var news_ids = []

        function getNewsIds(){
            for (var index in $scope.list) {
                var item = $scope.list[index]
                if (item.selected !== undefined) {
                    if (item.selected) {
                        if (news_ids.indexOf(item.id) < 0) {
                            news_ids.push(item.id)
                        }
                    } else {
                        news_ids.splice(news_ids.indexOf(item.id), 1)
                    }
                }
            }
        }

        $scope.sync2Weixin = function () {
            getNewsIds()
            if (_.isEmpty(news_ids)) {
                growl.addErrorMessage(i18n('未选择新闻'), {enableHtml: true})
            } else {
                weixinApi.newsSend(news_ids, {errorMessage: true, successMessage: i18n('同步成功')})
            }
        }

    }

    angular.module('app').controller('ctrlOperationNews', ctrlOperationNews)

})()

