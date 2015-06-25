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
            if(!$scope.digest.utm_source || !$scope.digest.utm_medium) {
                return
            }
            var sourceArr = $scope.digest.utm_source.split(/\n/)
            var mediumArr = $scope.digest.utm_medium.split(/\n/)
            $scope.result = _.reduce(sourceArr, function (preOutside, source) {
               return _.reduce(mediumArr, function (preInside, media) {
                    return generateDigest(source, media, $scope.digest.type, $scope.digest.utm_campaign, $scope.digest.needTag) + preInside
               }, '') + preOutside
            },'')
        }
        function generateDigest (source, media, type, campaign, needTag) {
            var res = location.protocol + '//' + location.host + '/track/' + $stateParams.id + '/none/' + type + '.png'
            if(needTag) {
                res = '<img src="' + res + '"/>'
            }
            res += '\n'
            return res
        }
    }

    angular.module('app').controller('ctrlRentDigest', ctrlRentDigest)

})()

