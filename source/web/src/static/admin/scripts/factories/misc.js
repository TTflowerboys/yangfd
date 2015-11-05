/* Created by frank on 14-8-20. */

angular.module('app')
    .factory('misc', function () {
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

                _.each(allKeys, function (key) {
                    if(oldJson[key] === newJson[key] || angular.equals(newJson[key], oldJson[key])) {
                        return
                    }
                    if (oldJson[key] === undefined || (oldJson[key] === null && newJson[key] !== null)) {
                        return addToResult(key, newJson[key])
                    }
                    if (newJson[key] === undefined) {
                        if (oldJson[key]._i18n_unit !== undefined) {
                            newJson[key] = angular.copy(oldJson[key])
                            newJson[key].value = '0'
                            delete newJson[key].type
                            delete newJson[key].value_float
                            return addToResult(key, newJson[key])
                        }
                        if (_.isNumber(oldJson[key])) {
                            return addToResult(key, 0)
                        }
                        if (oldJson[key] === true) {
                            return addToResult(key, false)
                        }
                        if (_.isEmpty(oldJson[key])) {
                            return
                        }
                        if (_.isArray(oldJson[key])) {
                            return addToResult(key, [])
                        }
                        if (_.isObject(oldJson[key])) {
                            result.unset_fields = result.unset_fields || []
                            return result.unset_fields.push(key)
                        }
                        return addToResult(key, '')
                    }
                    if (_.isObject(newJson[key]) && !_.isArray(newJson[key])) {
                        var obj = newJson[key],
                            temp
                        if (obj._i18n !== undefined || key === 'unit_price') {
                            return addToResult(key, newJson[key])
                        }
                        if (obj._i18n_unit !== undefined) {
                            delete newJson[key].value_float
                            delete newJson[key].type
                            return addToResult(key, newJson[key])
                        }
                        temp = self.getChangedI18nAttributes(newJson[key], oldJson[key])
                        return temp ? addToResult(key, temp) : undefined
                    }
                    return addToResult(key, newJson[key])
                })
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

            //Clean all i18n initialized value when i18n input not modified
            cleanI18nEmptyUnit: function (i18nData) {
                if (_.isNumber(i18nData) || i18nData === true) {
                    return i18nData
                } else if (_.isEmpty(i18nData)) {
                    return undefined
                }
                for (var i in i18nData) {
                    if (_.isArray(i18nData[i])) {
                        i18nData[i] = self.cleanI18nEmptyUnit(i18nData[i])
                    }
                    if (_.isNumber(i18nData[i]) || i18nData[i] === true) {
                        continue
                    }
                    if (_.isEmpty(i18nData[i])) {
                        delete i18nData[i]
                        continue
                    }
                    if (_.isObject(i18nData[i])) {
                        if (i18nData[i].unit === undefined) {
                            if (_.isEmpty(i18nData[i].value)) {
                                delete i18nData[i].value
                            }
                            if (_.isEmpty(i18nData[i])) {
                                delete i18nData[i]
                                continue
                            }
                        } else if (i18nData[i].unit === '') {
                            delete i18nData[i]
                            continue
                        }
                        if (_.isString(i18nData[i].unit)) {
                            if (_.isNumber(i18nData[i].value)) {
                                continue
                            }
                            if (_.isEmpty(i18nData[i].value)) {
                                delete i18nData[i]
                                continue
                            }
                        } else {
                            if (_.isObject(i18nData[i].unit) && _.isObject(i18nData[i].price)) {

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
                        i18nData[i] = self.cleanI18nEmptyUnit(i18nData[i])
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

            cleanEmptyData: function (object) {
                return _.omit(object, function (val) {
                    return val === undefined || val === ''
                })
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
            },
            formatUnsetField: function (data) {
                if (data.unset_fields) {
                    if (data.unset_fields) {
                        var index1 = data.unset_fields.indexOf('latitude_longitude')
                        if (index1 >= 0) {
                            data.unset_fields.splice(index1, 1)
                            data.unset_fields.push('latitude')
                            data.unset_fields.push('longitude')
                        }
                        var index2 = data.unset_fields.indexOf('rental_guarantee')
                        if (index2 >= 0) {
                            data.unset_fields.splice(index2, 1)
                            data.unset_fields.push('rental_guarantee_rate')
                            data.unset_fields.push('rental_guarantee_term')
                        }
                    }
                }
                return data
            }
        }

        return self
    })
