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
            var _url = url || location.href
            var urlWithoutHash = _url
            var hash = ''

            var indexOfHash = _url.indexOf('#')
            if (indexOfHash >= 0) {
                hash = _url.substring(indexOfHash)
                urlWithoutHash = _url.substring(0, indexOfHash)
            }

            var re = new RegExp('([?&])' + name + '=.*?(&|$)', 'i');
            var separator = urlWithoutHash.indexOf('?') !== -1 ? '&' : '?';
            if (urlWithoutHash.match(re)) {
                return urlWithoutHash.replace(re, '$1' + name + '=' + encodeURIComponent(value) + '$2') + hash
            }
            else {
                return urlWithoutHash + separator + name + '=' + encodeURIComponent(value) + hash
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
                if (parts[1].length === 1) {
                    parts[1] = parts[1] + '0'
                }
                if (parts[1].length > 2) { parts[1] = parts[1].substr(0, 2) }
            }
            else {
                parts[1] = '00'
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
        },
        formatCurrency: function (number, currencyType) {
            if (!currencyType) {
                currencyType = window.currency
            }

            if (currencyType === 'CNY') {
                if (parseInt(number) > 10000) {
                    return team.encodeCurrency(parseInt(number) / 10000)  + '万'
                }
                else {
                    return team.encodeCurrency(number)
                }
            }
            else {
                if (parseInt(number) > 1000) {
                    return team.encodeCurrency(parseInt(number) / 1000) + 'k'
                }
                else {
                    return team.encodeCurrency(number)
                }
            }

        },

        /**
         * Share something to Weibo
         * @param {object} {title:'',url:'',pic:''}
         */
        shareToWeibo: function (_options, _config) {
            var defaultOptions = {
                url: location.href || '',
                title: document.title || ''
            }
            var defaultConfig = {
                width: 800,
                height: 480
            }
            var options = $.extend({}, defaultOptions, _options)
            var config = $.extend({}, defaultConfig, _config)
            var query = _.pairs(options).map(function (item) {
                return [encodeURIComponent(item[0]), encodeURIComponent(item[1])].join('=')
            }).join('&')

            var url = 'http://service.weibo.com/share/share.php?' + query

            var width = config.width
            var height = config.height
            var left = (screen.width / 2) - (width / 2)
            var top = (screen.height / 2) - (height / 2)

            window.open(url, '_blank',
                        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
                        width + ', height=' + height + ', top=' + top + ', left=' + left)

            return false
        },

        isPhone: function () {
            return $(window).width() < 768
        },
        isWeChat: function () {
            var ua = navigator.userAgent.toLowerCase()
            return (/micromessenger/.test(ua)) ? true : false
        },
        isWeChatiOS: function () {
            var ua = navigator.userAgent.toLowerCase()
            return (/micromessenger/.test(ua)) && ((/iphone/.test(ua)) || /ipad/.test(ua)) ? true : false
        },
        /**
         * convert to https link
         * @param {object} {link:'',property_id:'',news_id:''}
         * @returns {string}
         */
        convertToHttps: function (options) {
            var idString = ''
            var thumbnail = ''
            if (options.property_id) {
                idString = 'property_id=' + options.property_id
            } else if (options.news_id) {
                idString = 'news_id=' + options.news_id
            }
            if (options.thumbnail) {
                thumbnail = '_thumbnail'
            }
            return ['/image/fetch?link=', encodeURIComponent(options.link), thumbnail, '&', idString].join('')
        },
        getCaretPostion: function (elem) {
            var caretPos = 0;
            // IE Support
            if (document.selection) {

                elem.focus ();
                var sel = document.selection.createRange ();
                sel.moveStart ('character', -elem.value.length);
                caretPos = sel.text.length;
            }
            // Firefox support
            else if (elem.selectionStart || elem.selectionStart === '0') {
                caretPos = elem.selectionStart;
            }

            return (caretPos);
        },
        setCaretPosition: function (elem, caretPos) {
            if(elem !== null) {
                if(elem.createTextRange) {
                    var range = elem.createTextRange();
                    range.move('character', caretPos);
                    range.select();
                }
                else {
                    if(elem.selectionStart) {
                        elem.focus();
                        elem.setSelectionRange(caretPos, caretPos);
                    }
                    else {
                        elem.focus();
                    }
                }
            }
        }
    }
})();
