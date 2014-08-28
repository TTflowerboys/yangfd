/* Created by frank on 14-8-14. */

angular.module('app')
    .config(function ($stateProvider) {
        var projectResolve = {
            api: function (apiFactory) {
                return apiFactory('project')
            }
        }
        var newsResolve = {
            api: function (apiFactory) {
                return apiFactory('news')
            }
        }
        var teamResolve = {
            api: function (apiFactory) {
                return apiFactory('member')
            }
        }

        var partnersResolve = {
            api: function (apiFactory) {
                return apiFactory('partner')
            }
        }

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/static/admin/templates/dashboard.tpl.html',
                controller: 'ctrlDashboard'
            })

            .state('signIn', {
                url: '/signIn?from',
                templateUrl: '/static/admin/templates/signIn.tpl.html',
                controller: 'ctrlSignIn'
            })
            .state('signUp', {
                url: '/signUp?from',
                templateUrl: '/static/admin/templates/signUp.tpl.html',
                controller: 'ctrlSignUp'
            })
            .state('forgot', {
                url: '/forgot?from',
                templateUrl: '/static/admin/templates/forgotPassword.tpl.html',
                controller: 'ctrlForgotPassword'
            })
    })
