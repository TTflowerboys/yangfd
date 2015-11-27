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
            controller: function($scope, $element, $attrs, $transclude) {
                $scope.words = ''
                $scope.wordList = $scope.item.rule ? $scope.item.rule.split(',').map(function(word) {return word.trim()}) : []
                $scope.addWords = function(words) {
                    $scope.wordList = $scope.wordList.concat(words ? words.split(/[,，]+/).map(function(word) {return word.trim()}) : [])
                    $scope.words = ''
                }
                $scope.updateWords = function(words) {
                    $scope.wordList = words ? words.split(/[,，]+/).map(function(word) {return word.trim()}) : []
                    $scope.words = ''
                }
                $scope.removeWord = function(index) {
                    $scope.wordList.splice(index, 1)
                }
                $scope.$watch('wordList', function () {
                    $scope.item.rule = $scope.wordList.join(',')
                    if ($scope.edit === true && $scope.item.rule.length) {
                        $scope.submit()
                    }
                }, true)
            },
            bindToController: true
        }
    })
