/* Created by frank on 14-3-27. */

/**
 * validators:
 *   trim
 *   required
 *   email
 *   decimal
 *   number
 *   sameAs(password)
 */
/**
 * TODO:
 * [ ] Support input:radio & input:checkbox
 */
(function ($) {
    var serializeObject = function ($form) {
        var object = {}
        var array = $form.serializeArray()
        $.each(array, function () {
            object[this.name] = this.value.toString()
        })
        return object
    }
    var include = function (source, search) {
        return source.indexOf(search) >= 0
    }

    var contain = function (array, element) {
        for (var i = 0, length = array.length; i < length; i += 1) {
            if (array[i] === element) {
                return true
            }
        }
        return false
    }


    $.validate = function ($form, options) {

        options = options || {}
        if (options.onError === undefined) {
            throw 'Need onError'
        }
        var exclude = options.exclude || []
        var emailRegex = options.emailRegex || /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        var nonDecimalRegex = /[^0-9.\s,]/
        var numberRegex = /^[0-9]+$/

        var result = true
        if (!($form instanceof $)) {
            $form = $($form)
        }
        var valueMap = serializeObject($form)

        var errorIndex = 0
        $form.find('[name]').each(function (index, dom) {

            var name = dom.getAttribute('name')

            if (exclude.length > 0 && contain(exclude, name)) { return true }
            if (dom.getAttribute('type') !== 'hidden' && $(dom).is(':hidden')) { return true }


            var validator = dom.getAttribute('data-validator') || ''

            if (validator === undefined) { return true }
            var value = dom.value || dom.getAttribute('data-value')
            var trim = include(validator, 'trim')
            value = (trim ? $.trim(value) : value) || ''

            if (include(validator, 'required') && value === '') {
                result = false
                errorIndex += 1
                if (options.onError(dom, 'required', errorIndex - 1) !== 'continue') { return false }
            }
            if (include(validator, 'email') && !emailRegex.test(value)) {
                result = false
                errorIndex += 1
                if (options.onError(dom, 'email', errorIndex - 1) !== 'continue') { return false }
            }
            if (include(validator, 'non-zero') && !/[^0]/.test(value)) {
                result = false
                errorIndex += 1
                if (options.onError(dom, 'non-zero', errorIndex - 1) !== 'continue') { return false }
            }

            if (include(validator, 'decimal') && nonDecimalRegex.test(value)) {
                result = false
                errorIndex += 1
                if (options.onError(dom, 'decimal', errorIndex - 1) !== 'continue') { return false }
            }

            if (include(validator, 'number') && !numberRegex.test(value)) {
                result = false
                errorIndex += 1
                if (options.onError(dom, 'number', errorIndex - 1) !== 'continue') { return false }
            }

            if (include(validator, 'nolessthancent')) {
                if (value.indexOf('.') >= 0) {
                    if (value.split('.')[1].length > 2) {
                        result = false
                        errorIndex += 1
                        if (options.onError(dom, 'nolessthancent', errorIndex - 1) !== 'continue') { return false }
                    }
                }
            }

            var match, target

            if (include(validator, 'sameAs')) {
                match = /sameAs\(([^)]+)\)/.exec(validator)
                if (match && match[1]) {
                    target = $.trim(match[1])
                    if (value !== valueMap[target]) {
                        result = false
                        errorIndex += 1
                        if (options.onError(
                            dom, 'sameAs', errorIndex - 1
                        ) !== 'continue') { return false }
                    }
                }
            }

            if (include(validator, 'need') && $.trim(value) !== '') {
                match = /need\(([^)]+)\)/.exec(validator)
                if (match && match[1]) {
                    target = $.trim(match[1])
                    if (valueMap[target] === undefined || $.trim(valueMap[target]) === '') {
                result = false
                        errorIndex += 1
                        if (options.onError(dom, 'need', errorIndex - 1) !== 'continue') {return false}
                    }

                }

            }

            var length
            if (include(validator, 'sizeGreaterThan')) {
                match = /sizeGreaterThan\(([^)]+)\)/.exec(validator)
                if (match && match[1]) {
                    length = $.trim(match[1])
                    if (value.length <= length) {
                        result = false
                        errorIndex += 1
                        if (options.onError(dom, 'sizeGreaterThan', errorIndex - 1 ) !== 'continue') {return false}
                    }

                }
            }

        })
        return result
    }

}).call(this, jQuery);
