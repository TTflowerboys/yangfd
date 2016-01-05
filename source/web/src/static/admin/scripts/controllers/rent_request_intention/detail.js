(function () {

    function ctrlRentRequestIntentionDetail($scope, fctModal, api,  misc, $stateParams, growl, $rootScope, $state) {
        $scope.api = api
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    var item =  data.val
                    item.age = (Date.now() - item.date_of_birth * 1000)/(365 * 24 * 60 * 60 * 1000)

                    // Get ip when ticket is created from log
                    item.log = {
                        ip: window.i18n('载入中...'),
                        link: ''
                    }
                    api.getLog(item.id)
                        .then(function (data) {
                            if(data.data.val && data.data.val.length && data.data.val[0].ip && data.data.val[0].ip.length) {

                                item.log = {
                                    ip: data.data.val[0].ip[0],
                                    link: 'http://www.ip2location.com/demo/' + data.data.val[0].ip[0]
                                }
                            } else {
                                item.log = {
                                    ip: window.i18n('无结果')
                                }
                            }
                            $scope.item  = item
                        })
                })
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')), {enableHtml: true})
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                })
            })
        }
    }

    angular.module('app').controller('ctrlRentRequestIntentionDetail', ctrlRentRequestIntentionDetail)

})()


