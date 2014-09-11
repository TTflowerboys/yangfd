/* Created by frank on 14-9-11. */
angular.module('app')
    .directive('i18nSelect', function (userLanguage, $parse, i18n_languages) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/i18n_select.tpl.html',
            link: function (scope, elm, attrs) {
                scope.userLanguage = userLanguage

                var fields = attrs.fields
                if (!fields) {
                    throw 'i18nEdit needs fields'
                }
                var fieldList = fields.split(',')
                if (!fieldList || fieldList.length <= 0) {
                    return
                }

                var model = scope[attrs.ngModel]
                if (!model) { model = scope[attrs.ngModel] = {} }

                for (var i = 0 , length = fieldList.length; i < length; i += 1) {
                    var oneField = model[fieldList[i]]
                    if (!oneField) { oneField = model[fieldList[i]] = {} }

                    for (var j = 0, jLength = i18n_languages.length; j < jLength; j += 1) {
                        oneField[i18n_languages[j].value] = ''
                    }
                }

            }
        }
    })

