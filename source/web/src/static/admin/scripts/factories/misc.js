/* Created by frank on 14-8-20. */

angular.module('app')
    .factory('misc', function () {
        return{
            findBy: function (array, by, value) {
                var found
                angular.forEach(array, function (item, key) {
                    if (item[by] === value) {
                        found = item
                        return false
                    }
                })
                return found
            },
            findById: function (array, id) {
                var found
                angular.forEach(array, function (value, key) {
                    if (value.id === id) {
                        found = value
                        return false
                    }
                })
                return found
            },
            getChangedAttributes: function (newJson, oldJson) {
                var result = null
                for (var key in newJson) {
                    if (oldJson[key] === undefined) {
                        if (!result) { result = {} }
                        result[key] = newJson[key]
                    } else if (newJson.hasOwnProperty(key) && newJson[key].toString() !== oldJson[key].toString()) {
                        if (!result) { result = {} }
                        result[key] = newJson[key]
                    }
                }
                return result
            },
            resetArray: function (array, items) {
                if (array === undefined) { array = [] }
                array.splice.apply(array, [0, array.length].concat(items))
            }
        }
    })
