/**
 * Created by Michael on 14/10/21.
 */
angular.module('app')
    .directive('editI18nImages', function ($rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_i18n_images.tpl.html',
            replace: true,
            scope: {
                images: '=editI18nImages'
            },
            link: function (scope, elm, attrs) {
                scope.userLanguage = $rootScope.userLanguage
                scope.onCopyClick = function () {
                    var copyItem = scope.images[scope.userLanguage.value]
                    for (var index in $rootScope.i18nLanguages) {
                        var itemLanguage = $rootScope.i18nLanguages[index].value
                        if (scope.userLanguage.value !== itemLanguage) {
                            if (!scope.images[itemLanguage]) {
                                scope.images[itemLanguage] = []
                            }
                            scope.images[itemLanguage] = _.uniq(scope.images[itemLanguage].concat(copyItem))
                        }
                    }
                }
            }
        }
    })
