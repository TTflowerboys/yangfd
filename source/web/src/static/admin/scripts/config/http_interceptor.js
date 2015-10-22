/* Created by frank on 14-8-14. */
angular.module('app')
    .config(function ($provide, $httpProvider, errors) {

        function getErrorMessage(response) {
            var errorCode
            if (response.status !== 200) {
                errorCode = response.status
            } else {
                errorCode = response.data.ret
            }
            if (errorCode === 0) { return }

            if (!response.config.errorMessage) {return}

            return response.data.debug_msg || response.config.errorMessage[errorCode] || errors[errorCode] ||
                errors.unknown + ' Error code: ' + errorCode
        }

        $provide.factory('myHttpInterceptor', function ($q, growl, $rootScope, $sce) {

            return {

                'response': function (response) {

                    if (response.data.ret !== undefined) {

                        if (response.data.ret !== 0) {
                            var errorMessage = getErrorMessage(response)
                            if (errorMessage) {
                                growl.addErrorMessage($rootScope.renderHtml(errorMessage), {enableHtml: true})
                            }
                            return $q.reject(response)
                        } else {
                            var successMessage = response.config.successMessage
                            if (successMessage) {
                                growl.addSuccessMessage(successMessage)
                            }
                            return response
                        }
                    }
                    return response
                },

                'responseError': function (response, b, c) {
                    if (response.data && response.data.ret !== undefined) {
                        var errorMessage = getErrorMessage(response)

                        if (errorMessage) {
                            growl.addErrorMessage($rootScope.renderHtml(errorMessage), {enableHtml: true})
                        }
                    }
                    return $q.reject(response)
                }
            }
        })

        $httpProvider.interceptors.push('myHttpInterceptor')
    })
