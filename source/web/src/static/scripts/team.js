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
        }
    }
})();
