angular.module('app')
    .directive('editSynonyms', function ($http, $rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_synonyms.tpl.html',
            replace: true,
            scope: {
                item: '=ngModel',
                edit: '=edit',
                submit: '&',
            },
            link: function (scope, elm, attrs) {
                scope.wordList = scope.item.rule ? scope.item.rule.split(' ') : []
                scope.addWords = function(words) {
                    scope.wordList = scope.wordList.concat(words ? words.split(/[\s,\|]+/) : [])
                }
                scope.updateWords = function(words) {
                    scope.wordList = words ? words.split(/[\s,\|]+/) : []
                }
                scope.removeWord = function(index) {
                    scope.wordList.splice(index, 1)
                }
                scope.$watch('wordList', function () {
                    scope.item.rule = scope.wordList.join(' ')
                }, true)

            }
        }
    })
