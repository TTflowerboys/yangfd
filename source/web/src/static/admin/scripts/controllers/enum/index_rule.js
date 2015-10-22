(function () {

    function ctrlIndexRule($scope, api, $q, fctModal) {
        $scope.synonymsList = []
        $scope.getSynonymsList = function () {
            api.getChannel('synonyms')
                .success(function (data) {
                    $scope.synonymsList = data.val
                })
        }
        $scope.addSynonymsItem = function () {
            $scope.synonymsList.unshift({channel: 'synonyms', edit: true})
        }
        $scope.editSynonymsItem = function (item) {
            item.channel = 'synonyms'
            item.edit = true
        }
        $scope.removeSynonymsItem = function (item, index) {
            function removeFromList() {
                $scope.synonymsList.splice(index, 1)
            }
            if (item.id) {
                fctModal.show('Do you want to remove it?', undefined, function () {
                    api.remove(item.id, {
                        successMessage: 'Update successfully',
                        errorMessage: 'Update failed'
                    })
                        .success(function () {
                            removeFromList()
                        })
                })

            } else {
                removeFromList()
            }
        }

        $scope.submitSynonymsItem = function (item, index) {
            function successHanddler(data) {
                item.edit = false
                item.id = _.isEmpty(data.val) ? item.id : data.val
                $scope.synonymsList[index] = item
            }
            if (item.id) {
                api.update(item, {
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                })
                    .success(successHanddler)
            } else {
                api.create(item, {
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                })
                    .success(successHanddler)
            }
        }
        $scope.getUserDictList = function () {
            api.getChannel('user_dict')
                .success(function (data) {
                    $scope.userDictList = data.val
                })
        }
        $scope.addUserDict = function (words) {
            $scope.words = ''
            var wordList = words ? words.split(/[\s,\|]+/) : []
            $q.all(_.map(wordList, function (word) {
                var defer = $q.defer()
                api.create({
                    rule: word,
                    channel: 'user_dict'
                },{
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                })
                    .success(function (data) {
                        $scope.userDictList.unshift({channel: 'user_dict', rule: word, id: data.val})
                        defer.resolve(data.val)
                    })
                    .error(function (data) {
                        defer.reject(data.ret)
                    })
                return defer.promise
            }))
        }
        $scope.editUserDictItem = function (item) {
            item.channel = 'user_dict'
            item.edit = true
        }
        $scope.removeUserDictItem = function (item, index) {
            function removeFromList() {
                $scope.userDictList.splice(index, 1)
            }
            if (item.id) {
                fctModal.show('Do you want to remove it?', undefined, function () {
                    api.remove(item.id, {
                        successMessage: 'Update successfully',
                        errorMessage: 'Update failed'
                    })
                        .success(function () {
                            removeFromList()
                        })
                })

            } else {
                removeFromList()
            }
        }
        $scope.submitUserDictItem = function (item, index) {
            function successHanddler(data) {
                item.edit = false
                item.id = _.isEmpty(data.val) ? item.id : data.val
                $scope.userDictList[index] = item
            }
            if (item.id) {
                api.update(item, {
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                })
                    .success(successHanddler)
            } else {
                api.create(item, {
                    successMessage: 'Update successfully',
                    errorMessage: 'Update failed'
                })
                    .success(successHanddler)
            }
        }
    }

    angular.module('app').controller('ctrlIndexRule', ctrlIndexRule)

})()

