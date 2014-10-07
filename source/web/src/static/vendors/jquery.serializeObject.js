/**
 * Created by frank on 1/8/14.
 * http://stackoverflow.com/questions/1184624/convert-form-data-to-js-object-with-jquery
 */
(function ($) {
    $.fn.serializeObject = function (options) {
        options = options || {}
        var defaults = {
            includeUnderscore: true,
            exclude: [],
            noEmptyString: false
        }
        options = $.extend({}, defaults, options)
        if (!$.isArray(options.exclude)) {
            options.exclude = [options.exclude]
        }

        var includeUnderscore = options.includeUnderscore
        var object = {}
        var array = this.find('input,select,textarea').serializeArray()
        $.each(array, function () {
            if (!includeUnderscore && this.name.indexOf('_') === 0) { return true }
            if ($.inArray(this.name, options.exclude) !== -1) { return true }

            object[this.name] = this.value.toString()
        })
        if (options.noEmptyString) {
            for (var key in object) {
                if (object[key] === '') {
                    object[key] = undefined
                }
            }
        }
        return object
    }

}).call(this, jQuery);
