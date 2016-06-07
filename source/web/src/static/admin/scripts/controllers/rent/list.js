(function () {

    function ctrlRentList($scope, fctModal, api, $state, $rootScope, growl, $timeout, userApi) {

        $scope.list = []
        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.api = api

        $scope.selected = {}
        $scope.selected.status = 'to rent'
        $scope.selected.partner_student_housing = ''

        var params = {
            status: $scope.selected.status,
            country: $scope.selected.country,
            city: $scope.selected.city,
            rent_type: $scope.selected.rent_type,
            partner_student_housing: $scope.selected.partner_student_housing,
            per_page: $scope.perPage,
            sort: 'time,desc'
        }

        function updateParams() {
            params.status = $scope.selected.status
            params.country = $scope.selected.country
            params.city = $scope.selected.city
            params.rent_type = $scope.selected.rent_type
            params.partner_student_housing = $scope.selected.partner_student_housing
            params.landlord_type = $scope.selected.landlord_type
            params.short_id = $scope.selected.short_id
            params.time = undefined

            if ($scope.selected.rent_available_time) {
                params.rent_available_time = $scope.selected.rent_available_time
            }else {
                params.rent_available_time = undefined
            }

            if ($scope.selected.rent_deadline_time){
                params.rent_deadline_time = $scope.selected.rent_deadline_time
            }else {
                params.rent_deadline_time = undefined
            }

            for(var key in params) {
                if(params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            }
        }

        $scope.searchRent = function () {
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

        if($state.params.code) {
            delete params.status
            delete params.partner_student_housing
            params.status = (['to rent', 'rent', 'hidden']).join(',')
            params.short_id = $state.params.code
            $scope.refreshList()
        }

        $scope.onRemove = function (item) {
            fctModal.show(i18n('确认删除该房源?'), undefined, function () {
                api.remove(item.id, {errorMessage: true}).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.onRefresh = function (item) {
            fctModal.show(i18n('确认刷新该房源?'), undefined, function () {
                api.refresh(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('已刷新')),
                        {enableHtml: true})
                })
            })
        }

        $scope.onRentOut = function (item) {
            fctModal.show(i18n('确认该房源已租出?'), undefined, function () {
                api.rentOut(item.id, {errorMessage: true}).success(function () {
                    location.reload()
                })
            })
        }

        $scope.onSuspend = function (item) {
            fctModal.show(i18n('确认下架该房源并通知房东?'), undefined, function () {
                api.suspend(item.id, {errorMessage: true}).success(function () {
                    location.reload()
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
        $scope.generateImage = function (item) {
            item.isGenerating = true
            item.digestStatus = 'new'
            api.generateImage(item.id)
                .success(function (data) {
                    item.digestStatus = 'new'
                    $timeout(function () {
                        getDigestStatus(item)
                    },2000)
                })

        }
        function getDigestStatus (item) {
            api.getDigestStatus(item.id)
                .success(function (data) {
                    item.digestStatus = data.val.status
                    if(data.val.status === 'completed' || data.val.status === 'failed') {
                        updateTicket(item)
                        return
                    }
                    $timeout(function () {
                        getDigestStatus(item)
                    },5000)
                })
        }
        function updateTicket (item){
            api.getOne(item.id, {errorMessage: true})
                .success(function (data) {
                    item.digest_image  = data.val.digest_image
                    item.digest_image_generate_time  = data.val.digest_image_generate_time
                    item.digest_image_task_id = data.val.digest_image_task_id
                    item.isGenerating = false
                })
        }
        $scope.openImage = function (item) {
            window.open(item.digest_image)
        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.list = data.val
            _.each($scope.list, function (item) {
                if(!item.isGenerating && (!item.digest_image_task_id || (item.digest_image_generate_time && Date.now() / 1000 - item.digest_image_generate_time > 24 * 3600))){
                    return
                }
                if (!item.digest_image) {
                    item.isGenerating = true
                    getDigestStatus(item)
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

        $scope.updateItem = function (item) {
            api.update(item.id, item)
                .success(function () {
                    $scope.refreshList()
                })
        }

        $scope.updateUserItem = function (item) {
            return userApi.update(item.id, item)
        }


    }

    angular.module('app').controller('ctrlRentList', ctrlRentList)

})()
