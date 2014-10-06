/* Created by frank on 14-8-4. */

(function () {
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

    window.team = {
        Delayer: Delayer,
        getQuery: function (name, url) {
            var matches
            if (!url) {
                matches = window.location.search.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)'));
                return !matches ? '' : decodeURIComponent(matches[2]);
            } else {
                matches = url.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)'));
                return !matches ? '' : decodeURIComponent(matches[2]);
            }

        },
        setQuery: function (name, value, url) {
            var _url = location.href || url
            var re = new RegExp('([?&])' + name + '=.*?(&|$)', 'i');
            var separator = _url.indexOf('?') !== -1 ? '&' : '?';
            if (_url.match(re)) {
                return _url.replace(re, '$1' + name + '=' + encodeURIComponent(value) + '$2');
            }
            else {
                return _url + separator + name + '=' + encodeURIComponent(value);
            }
        },
        getHash: function (n) {
            var m = window.location.hash.match(new RegExp('(#|&)' + n + '=([^&]*)(&|$)'));
            return !m ? '' : decodeURIComponent(m[2]);
        },


        /**
         * Convert a number to a friendly currency
         * @param {string | number} number 123456.789
         * @returns {string} currency 123,456.78
         */
        encodeCurrency: function (number) {
            var parts;
            if (number !== 0 && !number) {return '';}
            var numberString = number.toString()
            numberString = team.decodeCurrency(numberString)
            if (numberString.indexOf('.') >= 0) {
                numberString = parseFloat(numberString, 10).toFixed(2).toString()
            }
            parts = numberString.split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            if (parts[1]) {
                if (parts[1].length === 1) { parts[1] = parts[1] + '0' }
                if (parts[1].length > 2) { parts[1] = parts[1].substr(0, 2) }
            }
            return parts.join('.')
        },


        /**
         * Convert a friendly currency to a number
         * @param {string} currency 123,456.78
         * @returns {string} number 123456.78
         */
        decodeCurrency: function (currency) {
            return currency.replace(/[,\s]/g, '')
        }
    }
})();
