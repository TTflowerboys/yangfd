/* Created by frank on 14-9-17. */
/* jshint -W083:true */

(function () {

    function ctrlPropertyList($scope, fctModal, api, $state, growl) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        $scope.selected = {}
        $scope.selected.status = 'not reviewed'

        var params = {
            status: $scope.selected.status,
            country: $scope.selected.country,
            city: $scope.selected.city,
            property_type: $scope.selected.property_type,
            per_page: $scope.perPage,
            sort: 'mtime,desc'
        }

        function updateParams() {
            params.short_id = $scope.selected.short_id
            params.status = $scope.selected.status
            params.country = $scope.selected.country
            params.city = $scope.selected.city
            params.property_type = $scope.selected.property_type
            params.mtime = undefined
            params = _.omit(params, function (val) {
                return val === '' || val === undefined
            })
        }

        $scope.isInvalid = function (item) {
            if(!_.every(item.main_house_types, function (item) {
                    return item.building_area_min && item.building_area_min.unit && item.building_area_min.value
                })) {
                growl.addErrorMessage(window.i18n('户型的最小面积未填写完整'), {enableHtml: true})
                return true
            }
            if(!_.every(item.main_house_types, function (item) {
                    return item.total_price_min && item.total_price_min.unit && item.total_price_min.value
                })) {
                growl.addErrorMessage(window.i18n('户型的最低总价未填写完整'), {enableHtml: true})
                return true
            }
        }
        $scope.searchProperty = function () {
            updateParams()
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.refreshList = function () {
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id, {errorMessage: true}).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.nextPage = function () {
            var lastItem = $scope.list[$scope.list.length - 1]
            if (lastItem.mtime) {
                params.mtime = lastItem.mtime
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
                if (lastItem.mtime) {
                    params.mtime = lastItem.mtime
                }
                if (lastItem.register_time) {
                    params.register_time = lastItem.register_time
                }
                if (lastItem.insert_time) {
                    params.insert_time = lastItem.insert_time
                }
            } else {
                delete params.mtime
                delete params.register_time
                delete params.insert_time
            }

            api.getAll({params: params, errorMessage: true})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val.content
            $scope.pages[$scope.currentPageNumber] = $scope.list
            for (var index in $scope.list) {

                var listItem = $scope.list[index]
                if (listItem.target_property_id) {
                    (function (index) {
                        api.getOne(listItem.target_property_id, {errorMessage: true})
                            .success(function (data) {
                                $scope.list[index] = angular.extend(data.val, $scope.list[index])
                                _.each($scope.list[index].unset_fields, function (field) {
                                    delete $scope.list[index][field]
                                })
                            })
                    })(index)
                }
            }
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

        $scope.toEditProperty = function (id) {
            var result = id;
            api.getAll({
                params: {
                    target_property_id: id,
                    status: 'draft,not translated,translating,not reviewed,rejected'
                }, errorMessage: true
            })
                .success(function (data) {
                    var res = data.val.content
                    if (!_.isEmpty(res)) {
                        result = res[0].id
                    }
                })['finally'](function () {
                $state.go('.edit', {id: result})
            })
        }

    }

    angular.module('app').controller('ctrlPropertyList', ctrlPropertyList)

})()


