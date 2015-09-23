
angular.module('app')
    .filter('userReferrer', function (misc, $rootScope) {
        return function (id) {
            if($rootScope.referrerList) {
                if(_.find($rootScope.referrerList, function(item){return item.id === id})) {
                    return _.find($rootScope.referrerList, function(item){return item.id === id}).value[$rootScope.userLanguage.value]
                }
            }
            return id
        }
    })