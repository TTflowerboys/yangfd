angular.module('app')
    .directive('selectReport', function ($rootScope, reportApi, $q) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_report.tpl.html',
            scope: {
                selectedReport: '=ngModel',
                neighborhood: '=neighborhood',
                zipcodeIndex: '=zipcodeIndex'
            },
            link: function (scope) {
                function updateReportList() {
                    if(_.isEmpty(scope.neighborhood) && _.isEmpty(scope.zipcodeIndex)) {
                        scope.reportList = []
                        return
                    }
                    var deferred1 = $q.defer();
                    var deferred2 = $q.defer();
                    if(scope.neighborhood) {
                        reportApi.search({
                            maponics_neighborhood: scope.neighborhood
                        })
                            .success(function (data) {
                                deferred1.resolve(data.val)
                            })
                    } else {
                        deferred1.resolve([])
                    }
                    if(scope.zipcodeIndex) {
                        reportApi.search({
                            zipcode_index: scope.zipcodeIndex
                        })
                            .success(function (data) {
                                deferred2.resolve(data.val)
                            })
                    } else {
                        deferred2.resolve([])
                    }
                    $q.all([deferred1.promise, deferred2.promise])
                        .then(function () {
                            scope.reportList = _.union.apply(null, arguments[0])
                        })

                }
                scope.$watch('neighborhood',  updateReportList)
                scope.$watch('zipcodeIndex',  updateReportList)
                updateReportList()
            }
        }
    })
