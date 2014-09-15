/**
 * Created by Michael on 14/9/12.
 */
/* Created by frank on 14-8-28. */
angular.module('app')
    .directive('selectLanguage', function (i18nLanguages) {
        return {
            restrict: 'AE',
            link: function ($scope, elm, attrs) {
                $scope.availableLanguages = angular.copy(i18nLanguages)
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
                    for(var i = 0,l=i18nLanguages.length;i<l;i+=1){
                        if(value===i18nLanguages[i].value){
                            $scope.availableLanguages.push(i18nLanguages[i])
                            break
                        }
                    }
                }
            }
        }
    })
