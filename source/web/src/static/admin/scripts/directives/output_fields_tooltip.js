angular.module('app')
    .directive('outputFieldsTooltip', function ($rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/output_fields_tooltip.tpl.html',
            scope: {
                output: '=ngModel',
                placement: '=placement'
            },
            controller: function ($scope, $element, $rootScope, $compile) {

                $scope.tooltip = function () {
                    setTimeout(function () {
                        $element.find('[data-toggle="tooltip"]').tooltip({
                            title: $element.find('[data-toggle="tooltip"]').attr('data-title')
                        })
                    }, 200)
                }
                $scope.initOutputFields = function () {
                    setTimeout(function () {
                        $element.find('[data-toggle="tooltip"]').popover({
                            title: $rootScope.i18n('导出文本'),
                            content: $compile(
                                $element.find('[data-content]').html()
                            )($scope),
                            html: true,
                            trigger: 'click',
                        })
                    }, 200)
                }

                $scope.showEditCustomFields = function () {
                    $element.find('[data-toggle="tooltip"]').popover('toggle')
                }
            },
            link: function (scope, elem) {

                elem.delegate('.copyOutputBtn', 'click', function () {

                })
                elem.delegate('.hiddenPopover', 'click', function () {
                    elem.find('.outputBtn').popover('hide')
                })
            }
        }
    })
