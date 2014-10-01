/**
 * Created by Michael on 14/10/1.
 */


(function () {

    function ctrlMessageList($scope, $rootScope, $state, $stateParams, api) {
        $scope.messageList = []
        $scope.item = {}

        $scope.getMessages = function () {
            for (var i = 0; i < $rootScope.messageTypes.length; i += 1) {
                getMessageByIndex(i)
            }
        }
        function getMessageByIndex(index) {
            api.getAll({params: {type: $rootScope.messageTypes[index].value, _i18n: 'disabled'}})
                .success(function (data) {
                    $scope.messageList[index] = data.val || {}
                })
        }
    }

    angular.module('app').controller('ctrlMessageList', ctrlMessageList)

})()

