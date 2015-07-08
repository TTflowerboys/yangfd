(function () {

    function ctrlRentDigest($scope, api, $stateParams, misc, $state) {
        $scope.api = api
        $scope.digest = {
            typeMap : [{
                'name': '1px',
                'value': '1px'
            },{
                'name': 'logo',
                'value': 'logo'
            }],
            type:'1px',
            utm_campaign: 'property-to-rent-digest-' + $stateParams.id
        }

        $scope.generate = function () {
            var res = location.protocol + '//' + location.host + '/track/' + $stateParams.id + '/none/' +  $scope.digest.type + '.png'
            if($scope.digest.needTag) {
                res = '<img src="' + res + '"/>'
            }
            $scope.result = res
        }
    }

    angular.module('app').controller('ctrlRentDigest', ctrlRentDigest)

})()

