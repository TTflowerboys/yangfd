/* Created by frank on 14-8-15. */


(function () {

    function ctrlPropertyCreate($scope, $state, api, misc) {
        var delayer = new misc.Delayer({
            task: function () {
                createOrUpdate()
            },
            delay: 6000
        })


        function createOrUpdate() {
            if ($scope.item.id) {
                update($scope.item)
            } else {
                create($scope.item)
            }
            delayer.update()
        }

        function create(data) {
            api.create(data, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                createSuccess(data)
            })['finally'](function () {
                $scope.loading = false
            })
        }

        function update(data) {
            api.update(data, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            }).success(function (data) {
                updateSuccess(data)
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
            }
        }

        function updateSuccess(data) {
            if ($scope.submitted) {
                if ($scope.$parent.currentPageNumber === 1) {
                    $scope.$parent.refreshList()
                }
                $scope.cancelDelayer()
                $state.go('^')
            } else {
                $scope.item.id = data.val
            }
        }

        $scope.cancelDelayer = function(){
            delayer.cancel()
        }

        $scope.item = {}

        $scope.submit = function ($event, form) {
            $event.preventDefault()
            $scope.submitted = true
            $scope.loading = true
            $scope.item = misc.cleanTempData($scope.item)
            $scope.item = misc.cleanI18nEmptyUnit($scope.item)
            createOrUpdate()
        }

        $scope.submitForReview = function ($event, form) {
            $scope.item.status = 'not reviewed'
            $scope.submit($event, form)
        }
    }

    angular.module('app').controller('ctrlPropertyCreate', ctrlPropertyCreate)

})()

