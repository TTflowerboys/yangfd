/**
 * Created by chaowang on 9/23/14.
 */
(function () {

    function ctrlUserProfile($scope, $state, $http, growl, fctModal, api, misc) {
        $scope.api = api

        if ($state.current.url === '/:id') {
            // Refer to favs if someone enter url to access
            $state.go('.favs')
        }


        //Get User Profile Information
        var itemFromParent = misc.findById($scope.$parent.list, $state.params.id)
        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            api.getOne($state.params.id, { errorMessage: true})
                .success(function (data) {
                    $scope.item = data.val
                })
        }


        $scope.onRandomString = function (length) {
            var chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
            var pass = '';
            for (var x = 0; x < length; x++) {
                var i = Math.floor(Math.random() * chars.length);
                pass += chars.charAt(i);
            }
            $('#randomString').val(pass)
        }

        $scope.onChangePassword = function ($event, form) {
            var password = $('#randomString').val()
            var id = $('#id').val()
            if (password.length < 0) {
                growl.addWarnMessage('密码不能为空')
            }else{
                fctModal.show('确定重置密码?', undefined, function () {
                    var params = {
                        'user_id': id,
                        'password': Base64.encode(password)
                    }
                    return $http.post('/api/1/user/edit', params, {successMessage: i18n('密码修改成功'), errorMessage: true})
                })
            }            
        }

    }

    angular.module('app').controller('ctrlUserProfile', ctrlUserProfile)

})()

