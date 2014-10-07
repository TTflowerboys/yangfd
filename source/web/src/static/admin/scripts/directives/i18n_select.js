/* Created by frank on 14-9-11. */
angular.module('app')
    .directive('i18nSelect', function ($parse, i18nLanguages) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/i18n_select.tpl.html',
            link: function (scope, elm, attrs) {

                var fields = attrs.fields
                if (!fields) {
                    return
                }
                var fieldList = fields.split(',')
                if (!fieldList || fieldList.length <= 0) {
                    return
                }

                var model = scope[attrs.ngModel]
                if (!model) {
                    model = scope[attrs.ngModel] = {}
                }

                for (var i = 0 , length = fieldList.length; i < length; i += 1) {
                    var oneField = model[fieldList[i]]
                    if (!oneField) {
                        oneField = model[fieldList[i]] = {}
                    }

                    for (var j = 0, jLength = i18nLanguages.length; j < jLength; j += 1) {
                        oneField[i18nLanguages[j].value] = oneField[i18nLanguages[j].value] || ''
                    }
                }

            }
        }
    })

