/**
 * Created by Michael on 14/10/28.
 */
(function () {

    function ctrlHousingDetail($scope, api, $stateParams, misc) {
        $scope.api = api
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    $scope.item = data.val
                })
        }
        $scope.salesCommentEnabled = false

        var oldComment

        $scope.editSalesComment = function () {
            $scope.salesCommentEnabled = true
            oldComment = angular.copy($scope.item.sales_comment)
            $('#sales_comment').removeAttr('disabled')
        }

        $scope.cancelEditSalesComment = function () {
            $scope.salesCommentEnabled = false
            $scope.item.sales_comment = angular.copy(oldComment)
            oldComment = undefined
            $('#sales_comment').attr('disabled', 'disabled')
        }

        $scope.updateSalesComment = function () {
            api.editSalesComment($stateParams.id, {content: $scope.item.sales_comment}, {
                successMessage: 'Update successfully',
                errorMessage: 'Update failed'
            })
        }
    }

    angular.module('app').controller('ctrlHousingDetail', ctrlHousingDetail)

})()

