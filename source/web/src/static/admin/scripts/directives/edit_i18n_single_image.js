/**
 * Created by Michael on 14/10/29.
 */
angular.module('app')
    .directive('editI18nSingleImage', function ($rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_i18n_single_image.tpl.html',
            replace: true,
            scope: {
                image: '=editI18nSingleImage',
                widthLimit: '@widthLimit',
                ratio: '@ratio',
                thumbnailSize: '@thumbnailSize',
                text: '@text',
                watermark: '@watermark'
            },
            link: function (scope, elm, attrs) {
                scope.userLanguage = $rootScope.userLanguage
                scope.onCopyClick = function () {
                    var copyItem = scope.image[scope.userLanguage.value]
                    for (var index in $rootScope.i18nLanguages) {
                        var itemLanguage = $rootScope.i18nLanguages[index].value
                        if (scope.userLanguage.value !== itemLanguage) {
                            scope.image[itemLanguage] = copyItem
                        }
                    }
                }

            }
        }
    })