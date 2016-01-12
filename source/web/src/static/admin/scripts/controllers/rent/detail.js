(function () {

    function ctrlRentDetail($scope, fctModal, rentApi, $stateParams, $rootScope, misc, $state, growl, $timeout, userApi, rentRequestIntentionApi) {
        var api = $scope.api = rentApi
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)
        $scope.getRentIntentionList = function (item) {
            rentRequestIntentionApi.getAll({
                params: {
                    per_page: -1,
                    sort: 'time,desc',
                    interested_rent_tickets: JSON.stringify([item.id])
                },
                errorMessage: true
            })
                .success(function (data) {
                    $scope.rentIntentionList  = data.val
                })

        }

        if($state.current.name === 'dashboard.rent.detail') {
            if (itemFromParent) {
                $scope.item = itemFromParent
                $scope.getRentIntentionList($scope.item)
            } else {
                api.getOne($stateParams.id, {errorMessage: true})
                    .success(function (data) {
                        $scope.item  = data.val
                        $scope.getRentIntentionList($scope.item)
                    })
            }
        }

        $scope.onRemove = function (item) {
            fctModal.show(i18n('确认删除该房源?'), undefined, function () {
                api.remove(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')),
                        {enableHtml: true})
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                })
            })
        }

        $scope.onRefresh = function (item) {
            fctModal.show(i18n('确认刷新该房源?'), undefined, function () {
                api.refresh(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('已刷新')),
                        {enableHtml: true})
                    location.reload()
                })
            })
        }

        $scope.onRentOut = function (item) {
            fctModal.show(i18n('确认该房源已租出?'), undefined, function () {
                api.rentOut(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')),
                        {enableHtml: true})
                    location.reload()
                })
            })
        }

        $scope.onSuspend = function (item) {
            fctModal.show(i18n('确认下架该房源并通知房东?'), undefined, function () {
                api.suspend(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')),
                        {enableHtml: true})
                    location.reload()
                })
            })
        }

        $scope.updateUserItem = function (item) {
            return userApi.update(item.id, item)
        }
    }

    angular.module('app').controller('ctrlRentDetail', ctrlRentDetail)

})()

