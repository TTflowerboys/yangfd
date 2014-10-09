/* Created by frank on 14-8-20. */

angular.module('app')
    .factory('misc', function (i18nLanguages) {
        /**
         * Delayer constructor, do a task in the future, and you can update the task
         * @param options {data:{},task:function(){},delay:200}
         * @constructor
         */
        function Delayer(options) {
            options = options || {}
            this.data = options.data
            this.task = options.task
            this.delay = options.delay || 200
            this.timer = setTimeout(function () {
                if (this.task) {
                    this.task(this.data)
                }
            }.bind(this), this.delay)
        }

        Delayer.prototype.update = function (options) {
            options = options || {}
            if (options.task !== undefined) {
                this.task = options.task
            }
            if (options.data !== undefined) {
                this.data = options.data
            }
            if (options.delay !== undefined) {
                this.delay = options.delay
            }

            if (this.timer) {
                window.clearTimeout(this.timer)
            }
            this.timer = setTimeout(function () {
                this.task(this.data)
            }.bind(this), this.delay)
        }

        Delayer.prototype.cancel = function () {
            window.clearTimeout(this.timer)
        }

        var self = {

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

            getChangedI18nAttributes: function (newJson, oldJson) {
                var result
                var constructor = newJson.constructor
                var addToResult
                if (constructor === Array) {
                    result = []
                    addToResult = function (index, value) {
                        this.push(value)
                    }.bind(result)
                } else if (constructor === Object) {
                    result = {}
                    addToResult = function (key, value) {
                        this[key] = value
                    }.bind(result)
                }
                var allKeys = _.union(_.keys(newJson), _.keys(oldJson))

                for (var keyIndex = 0, keyLength = allKeys.length; keyIndex < keyLength; keyIndex += 1) {
                    var key = allKeys[keyIndex]
                    if (oldJson[key] === undefined) {
                        addToResult(key, newJson[key])
                    } else if (newJson[key] === undefined) {
                        if (oldJson[key]._i18n_unit !== undefined) {
                            newJson[key] = angular.copy(oldJson[key])
                            newJson[key].value = '0'
                            delete newJson[key]._i18n_unit
                            delete newJson[key].type
                            delete newJson[key].value_float
                            addToResult(key, newJson[key])
                        } else {
                            addToResult(key, '')
                        }
                    } else if (oldJson[key] === null) {
                        if (newJson[key] !== null) {
                            addToResult(key, newJson[key])
                        }
                    }
                    else if (newJson.hasOwnProperty(key) &&
                        newJson[key] !== oldJson[key] &&
                        newJson[key].toString() !== oldJson[key].toString()) {
                        addToResult(key, newJson[key])
                    } else if (_.isArray(newJson[key])) {
                        if (!angular.equals(newJson[key], oldJson[key])) {
                            addToResult(key, newJson[key])
                        }
                    } else if (_.isObject(newJson[key])) {
                        var obj = newJson[key]
                        if (obj._i18n !== undefined) {
                            if (!angular.equals(newJson[key], oldJson[key])) {
                                delete newJson[key]._i18n
                                addToResult(key, newJson[key])
                            }
                        } else if (obj._i18n_unit !== undefined) {
                            if (!angular.equals(newJson[key], oldJson[key])) {
                                delete newJson[key]._i18n_unit
                                delete newJson[key].value_float
                                delete newJson[key].type
                                addToResult(key, newJson[key])
                            }
                        } else {
                            var temp = self.getChangedI18nAttributes(newJson[key], oldJson[key])
                            if (temp) {
                                addToResult(key, temp)
                            }
                        }
                    }
                }
                return _.isEmpty(result) ? undefined : result
            },
            resetArray: function (array, items) {
                if (array === undefined) { array = [] }
                array.splice.apply(array, [0, array.length].concat(items))
            },

            Delayer: Delayer,

            getIntersectionById: function (object, compare) {
                return _.filter(object, function (item) {
                    return _.findWhere(compare, {id: item.id})
                })
            },

            cleanI18nEmptyUnit: function (i18nData) {
                for (var i in i18nData) {
                    if (_.isNumber(i18nData[i])) {
                        continue
                    }
                    if (_.isEmpty(i18nData[i])) {
                        delete i18nData[i]
                        continue
                    }
                    if (i18nData[i].unit === undefined) {
                        if (_.isEmpty(i18nData[i].value)) {
                            delete i18nData[i].value
                        }
                        if (_.isEmpty(i18nData[i])) {
                            delete i18nData[i]
                            continue
                        }
                    } else {
                        if (_.isObject(i18nData[i])) {
                            if (_.isString(i18nData[i].unit)) {
                                if (_.isNumber(i18nData[i].value)) {
                                    continue
                                }
                                if (_.isEmpty(i18nData[i].value)) {
                                    delete i18nData[i]
                                    continue
                                }
                            } else {
                                if (_.isObject(i18nData[i].unit) || _.isObject(i18nData[i].price)) {

                                    if (_.isNumber(i18nData[i].unit.value) && _.isNumber(i18nData[i].price.value)) {
                                        if (_.isString(i18nData[i].unit.unit) && _.isString(i18nData[i].price.unit)) {
                                            continue
                                        } else {
                                            delete i18nData[i]
                                            continue
                                        }
                                    }
                                    if (_.isEmpty(i18nData[i].unit.value) || _.isEmpty(i18nData[i].price.value)) {
                                        delete i18nData[i]
                                        continue
                                    }
                                }
                            }
                        }
                    }
                }
                return i18nData
            },

            cleanTempData: function (object) {
                for (var key in object) {
                    if (key.indexOf('temp') === 0) {
                        delete object[key]
                    }
                }
                return object
            },
            getPropByString: function (object, propString) {
                if (!propString) {
                    return object;
                }

                var prop, props = propString.split('.');

                for (var i = 0, length = props.length - 1; i < length; i += 1) {
                    prop = props[i];

                    var candidate = object[prop];
                    if (candidate !== undefined) {
                        object = candidate;
                    } else {
                        break;
                    }
                }
                return object[props[i]];
            }
        }

        return self
    })
