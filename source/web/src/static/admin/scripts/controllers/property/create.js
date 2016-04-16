/* Created by frank on 14-8-15. */


(function () {

    function ctrlPropertyCreate($scope, $state, api, misc) {
        var delayer = new misc.Delayer({
            task: function () {
                createOrUpdate()
            },
            delay: 2 * 60 * 1000
        })

        function createOrUpdate() {
            if ($state.current.controller !== 'ctrlPropertyCreate') {
                $scope.cancelDelayer()
                return
            }
            $scope.submitItem = JSON.parse(angular.toJson($scope.item))
            $scope.submitItem = misc.cleanTempData($scope.submitItem)
            $scope.submitItem = misc.cleanI18nEmptyUnit($scope.submitItem)
            if ($scope.item.id) {
                update($scope.item.id, misc.getChangedI18nAttributes($scope.submitItem, $scope.lastItem))
            } else {
                create($scope.submitItem)
            }
            delayer.update()
        }

        function create(param) {
            if (_.isEmpty(param)) {
                return
            }
            api.create(param, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                createSuccess(data)
            })['finally'](function () {
                $scope.loading = false
            })
        }

        function update(id, param) {
            if (_.isEmpty(param)) {
                return
            }
            api.update(id, param, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function () {
                updateSuccess()
            })['finally'](function () {
                $scope.loading = false
            })
        }

        function createSuccess(data) {
            if ($scope.submitted) {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $scope.cancelDelayer()
                $state.go('^')
            } else {
                $scope.item.id = data.val
                $scope.lastItem = $scope.submitItem
            }
        }

        function updateSuccess() {
            if ($scope.submitted) {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $scope.cancelDelayer()
                $state.go('^')
            } else {
                $scope.lastItem = $scope.submitItem
            }
        }

        $scope.cancelDelayer = function () {
            delayer.cancel()
        }

        $scope.item = {}
        $scope.lastItem = {}
        $scope.submitItem = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanTempData($scope.item)
            $scope.item = misc.cleanI18nEmptyUnit($scope.item)
            createOrUpdate()
        }

        $scope.submitForReview = function ($event, form) {
            if($scope.isInvalid($scope.item)) {
                return false
            }
            $scope.item.status = 'not reviewed'
            $scope.submit($event, form)
        }
    }

    angular.module('app').controller('ctrlPropertyCreate', ctrlPropertyCreate)

})()

