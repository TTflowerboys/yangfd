angular.module('app')
    .directive('selectReport', function ($rootScope, reportApi) {
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
                    var config = {}
                        if(_.isEmpty(scope.neighborhood) && _.isEmpty(scope.zipcodeIndex)) {
                            scope.reportList = []
                            scope.selectedReport = undefined
                            return
                        }
                        if(scope.neighborhood) {
                            config.maponics_neighborhood = scope.neighborhood
                        }
                        if(scope.zipcodeIndex) {
                            config.zipcode_index = scope.zipcodeIndex
                        }

                    if(!_.isEmpty(config)){
                        reportApi.search(config)
                            .success(function (data) {
                                scope.reportList = data.val
                            })
                    }
                }
                scope.$watch('neighborhood',  updateReportList)
                scope.$watch('zipcodeIndex',  updateReportList)
                updateReportList()
            }
        }
    })
