/**
 * Created by Michael on 14/9/12.
 */
/* Created by frank on 14-8-28. */
angular.module('app')
    .directive('selectLanguage', function (i18n_languages) {
        return {
            restrict: 'AE',
            link: function ($scope, elm, attrs) {
                $scope.availableLanguages = angular.copy(i18n_languages)
                $scope.onAddLanguage = function(value){
                    for(var i = 0,l=$scope.availableLanguages.length;i<l;i+=1){
                        if(value===$scope.availableLanguages[i].value){
                            $scope.availableLanguages.splice(i,1)
                            break
                        }
                    }
                }
                $scope.onRestoreLanguage = function(value){
                    console.log(value);
                    for(var i = 0,l=i18n_languages.length;i<l;i+=1){
                        if(value===i18n_languages[i].value){
                            $scope.availableLanguages.push(i18n_languages[i])
                            break
                        }
                    }
                }
            }
        }
    })
