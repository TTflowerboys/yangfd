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
                if (value === '' || value === undefined) {
                    return urlWithoutHash.replace(re, function (match, p1, p2) {
                            return p2 === '' ? '' : (p1 === '?' ? '?' : p2)
                        }) + hash
                } else {
                    return urlWithoutHash.replace(re, '$1' + name + '=' + encodeURIComponent(value) + '$2') + hash
                }
            } else if(value !== '' && value !== undefined) {
                return urlWithoutHash + separator + name + '=' + encodeURIComponent(value) + hash
            } else {
                return urlWithoutHash + hash
            }
        },
        getHash: function (n) {
            var m = window.location.hash.match(new RegExp('(#|&)' + n + '=([^&]*)(&|$)'));
            return !m ? '' : decodeURIComponent(m[2]);
        },

        getLocationUrl: function (href) {
            var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
            return match && {
                protocol: match[1],
                host: match[2],
                hostname: match[3],
                port: match[4],
                pathname: match[5],
                search: match[6],
                hash: match[7]
            }
        },

        /**
         * Convert a number to a friendly currency
         * @param {string | number} number 123456.789
         * @returns {string} currency 123,456.78
         */
        encodeCurrency: function (number, fixedBit) {
            if (fixedBit === undefined) {
                fixedBit = 2
            }
            var parts;
            if (number !== 0 && !number) {return '';}
            var numberString = number.toString()
            numberString = team.decodeCurrency(numberString)
            if (numberString.indexOf('.') >= 0) {
                numberString = parseFloat(numberString, 10).toFixed(fixedBit).toString()
            }
            parts = numberString.split('.')
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
        formatCurrency: function (number, fixedBit, currencyType) {
            if (!currencyType) {
                currencyType = window.currency
            }
            if(isNaN(parseInt(number))) {
                return number
            }
            if (currencyType === 'CNY' && window.lang === 'zh_Hans_CN') {
                if (parseInt(number) > 100000000) {
                    return team.encodeCurrency(parseInt(number) / 100000000, fixedBit) + '亿'
                }
                else if (parseInt(number) > 10000) {
                    return team.encodeCurrency(parseInt(number) / 10000) + '万'
                }
                else {
                    return team.encodeCurrency(number, fixedBit)
                }
            }
            else {
                if (parseInt(number) > 1000000) {
                    return team.encodeCurrency(parseInt(number) / 1000000, fixedBit) + 'm'
                }
                else if (parseInt(number) > 1000) {
                    return team.encodeCurrency(parseInt(number) / 1000, fixedBit) + 'k'
                }
                else {
                    return team.encodeCurrency(number, fixedBit)
                }
            }
        },
        dayCountBefore: function (date) {
            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            var today = new Date();
            var diffDays = Math.round((date.getTime() - today.getTime()) / (oneDay));
            return diffDays;
        },
        parsePublishDate: function (tdate) {
            var system_date = new Date(tdate * 1000);
            var user_date = new Date();
            if (navigator.userAgent.match(/MSIE\s([^;]*)/) && tdate.replace) {
                system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'))
            }
            var diff = Math.floor((user_date - system_date) / 1000);
            if (diff <= 86400) {return window.i18n('今天');}
            if (diff <= 129600) {return window.i18n('昨天');}
            if (diff < 604800) {return Math.round(diff / 86400) + window.i18n('天前');}
            if (diff <= 777600) {return window.i18n('上周');}
            if(system_date.toLocaleDateString) {
                return system_date.toLocaleDateString();
            }
            return tdate
        },

        isToday: function (tdate) {
            var system_date = new Date(tdate * 1000);
            var user_date = new Date();
            if (navigator.userAgent.match(/MSIE\s([^;]*)/) && tdate.replace) {
                system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'))
            }
            var diff = Math.floor((user_date - system_date) / 1000);
            if (diff <= 86400) {
                return true
            } else {
                return false
            }
        },
        isChinese: function (str) {
            //http://stackoverflow.com/questions/21109011/javascript-unicode-string-chinese-character-but-no-punctuation
            return /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(str)
        },
        /**
         * Share something to Weibo
         * @param {object} {title:'',url:'',pic:''}
         */
        shareToWeibo: function (_options, _config) {
            var defaultOptions = {
                url: location.href || '',
                title: document.title || '',
                searchPic: false
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
        /**
         * Share something to Twitter
         * @param {object} {title:'',url:'',pic:''}
         */
        shareToTwitter: function (_options, _config) {
            var defaultOptions = {
                url: location.href || '',
                text: document.title || ''
            }
            var defaultConfig = {
                width: 800,
                height: 252
            }
            var options = $.extend({}, defaultOptions, _options)
            var config = $.extend({}, defaultConfig, _config)
            var query = _.pairs(options).map(function (item) {
                return [encodeURIComponent(item[0]), encodeURIComponent(item[1])].join('=')
            }).join('&')

            var url = 'https://twitter.com/share?' + query

            var width = config.width
            var height = config.height
            var left = (screen.width / 2) - (width / 2)
            var top = (screen.height / 2) - (height / 2)

            window.open(url, '_blank',
                    'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
                    width + ', height=' + height + ', top=' + top + ', left=' + left)
            return false
        },
        /**
         * Share something to Linkedin
         * @param {object} {title:'',url:'',pic:''}
         */
        shareToLinkedin: function (_options, _config) {
            var defaultOptions = {
                url: location.href || '',
                text: document.title || '',
                name:'linkedin_popup'
            }
            var defaultConfig = {
                width: 600,
                height: 450
            }
            var options = $.extend({}, defaultOptions, _options)
            var config = $.extend({}, defaultConfig, _config)
            var query = _.pairs(options).map(function (item) {
                return [encodeURIComponent(item[0]), encodeURIComponent(item[1])].join('=')
            }).join('&')

            var url = 'http://www.linkedin.com/shareArticle?' + query

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
        isCurrantClient: function (versionStr) {
            var ua = navigator.userAgent.toLowerCase()
            if (versionStr) {
                var match = /currant\/([0-9\.]*)/.exec(ua)
                if (match && match.length >= 2) {
                    var version = match[1]
                    if (versionStr.substr(0, 2) === '>=') {
                        return team.compareVersion(version, versionStr.substr(2)) >= 0
                    }
                    else if (versionStr.substr(0, 1) === '>') {
                        return team.compareVersion(version, versionStr.substr(1)) > 0
                    }
                    else if (versionStr.substr(0, 2) === '<=') {
                        return team.compareVersion(version, versionStr.substr(2)) <= 0
                    }
                    else if (versionStr.substr(0, 1) === '<') {
                        return team.compareVersion(version, versionStr.substr(1)) < 0
                    }
                    else {
                        return team.compareVersion(version, versionStr) === 0
                    }
                }
                return false
            }
            else {
                return (/currant/.test(ua)) ? true : false
            }
        },
        /**
         * Compare Version use nature ordering, like 1 2 3 4 5 6 7 10 11 12 20 21
         * Unit Test http://jsfiddle.net/pCX3V/
         */
        //http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
        compareVersion: function (v1, v2, options) {
            var lexicographical = options && options.lexicographical,
                zeroExtend = options && options.zeroExtend,
                v1parts = v1.split('.'),
                v2parts = v2.split('.');

            function isValidPart(x) {
                return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
            }

            if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                return NaN;
            }

            if (zeroExtend) {
                while (v1parts.length < v2parts.length) {
                    v1parts.push('0')
                }
                while (v2parts.length < v1parts.length) {
                    v2parts.push('0')
                }
            }

            if (!lexicographical) {
                v1parts = v1parts.map(Number);
                v2parts = v2parts.map(Number);
            }

            for (var i = 0; i < v1parts.length; ++i) {
                if (v2parts.length === i) {
                    return 1;
                }

                if (v1parts[i] === v2parts[i]) {
                    continue;
                }
                else if (v1parts[i] > v2parts[i]) {
                    return 1;
                }
                else {
                    return -1;
                }
            }

            if (v1parts.length !== v2parts.length) {
                return -1;
            }

            return 0;
        },
        isProduction: function () {
            if (window.location.host === 'yangfd.com' || window.location.host === 'youngfunding.co.uk' || window.location.host === 'yangfd.cn') {
                return true
            } else {
                return false
            }
        },
        isQQBrowser: function () {
            var ua = navigator.userAgent.toLowerCase()
            return /mqqbrowser/.test(ua)
        },
        isAndroidBrowser: function () {
            var ua = navigator.userAgent.toLowerCase()
            return /android.+chrome/.test(ua)
        },
        isAndroid: function () {
            var ua = navigator.userAgent.toLowerCase()
            return /android/.test(ua)
        },
        isIOS: function () {
            var ua = navigator.userAgent.toLowerCase()

            return (/iPhone|currant/i).test(ua)
        },
        isIpad: function () {
            var ua = navigator.userAgent.toLowerCase()
            return (/ipad/i).test(ua)
        },
        /**
         * 返回当前的客户端：pc,mobile,wechat,app之一
         * @returns {string}
         */
        getClient: function () {
            if(window.team.isWeChat()) {
                return 'wechat'
            }
            if(window.team.isCurrantClient()) {
                return 'app'
            }
            if(window.team.isPhone()) {
                return 'mobile'
            }
            return 'pc'
        },
        getClients: function () {
            var clients = []
            if(window.team.isWeChat()) {
                clients.push('wechat')
            }
            if(window.team.isCurrantClient()) {
                clients.push('app')
            }
            if(window.team.isPhone()) {
                clients.push('mobile')
            }
            if(window.team.isAndroid()) {
                clients.push('android')
            }
            if(window.team.isIOS()) {
                clients.push('ios')
            }
            if(window.team.isIpad()) {
                clients.push('ipad')
            }
            if(!clients.length) {
                clients.push('pc')
            }
            return clients
        },
        /**
         * convert to https link
         * @param {object} {link:'',property_id:'',news_id:''}
         * @returns {string}
         */
        convertToHttps: function (options) {
            // var idString = ''
            // var thumbnail = ''
            // if (options.property_id) {
            //     idString = 'property_id=' + options.property_id
            // } else if (options.news_id) {
            //     idString = 'news_id=' + options.news_id
            // }
            // if (options.thumbnail) {
            //     thumbnail = '_thumbnail'
            // }
            // return ['/image/fetch?link=', encodeURIComponent(options.link), thumbnail, '&', idString].join('')
            var link = options.link
            if (options.thumbnail) {
                link += '_thumbnail'
            }
            return link
        },
        getCaretPostion: function (elem) {
            var caretPos = 0;
            // IE Support
            if (document.selection) {

                var sel = document.selection.createRange();
                sel.moveStart('character', -elem.value.length);
                caretPos = sel.text.length;
            }
            // Firefox support
            else if (elem.selectionStart || elem.selectionStart === '0') {
                caretPos = elem.selectionStart;
            }

            return (caretPos);
        },
        setCaretPosition: function (elem, caretPos) {
            if (elem !== null) {
                if (elem.createTextRange) {
                    var range = elem.createTextRange();
                    range.move('character', caretPos);
                    range.select();
                }
                else {
                    if (elem.selectionStart) {
                        elem.setSelectionRange(caretPos, caretPos);
                    }
                }
            }
        },
        truncate: function (string, length) {            
            var trimmedString = string.length > length ?
                string.substring(0, length - 3) + '...' :
                string.substring(0, length)
            return trimmedString
        },
        countryMap: {
            'CN': i18n('中国'),
            'GB': i18n('英国'),
            'US': i18n('美国'),
            'IN': i18n('印度'),
            'RU': i18n('俄罗斯'),
            'JP': i18n('日本'),
            'DE': i18n('德国'),
            'FR': i18n('法国'),
            'IT': i18n('意大利'),
            'ES': i18n('西班牙'),
            'NL': i18n('荷兰'),
            'HK': i18n('香港'),
            'TW': i18n('台湾'),
            'SG': i18n('新加坡'),
            'MY': i18n('马来西亚'),
            'IE': i18n('爱尔兰')
        },
        countryCodeMap: {
            'CN': '86',
            'GB': '44',
            'US': '1',
            'IN': '91',
            'RU': '7',
            'JP': '81',
            'DE': '49',
            'FR': '33',
            'IT': '39',
            'ES': '34',
            'NL': '31',
            'HK': '852',
            'TW': '886',
            'SG': '65',
            'MY': '60',
            'IE': '353'
        },
        getPhoneCodeOfCountry: function (countryCode) {
            return this.countryCodeMap[countryCode]
        },
        getCountryFromPhoneCode: function (code) {
            return _.invert(this.countryCodeMap)[code]
        },
        parsePeriodUnit: function(unit) {
            return {
                'day': window.i18n('天'),
                'week': window.i18n('周'),
                'month': window.i18n('个月'),
                'year': window.i18n('年')
            }[unit]
        },
        getCurrencySymbol: function (code) {
            return {
                'CNY': '¥',
                'GBP': '£',
                'USD': '$',
                'EUR': '€',
                'HKD': '$'
            }[code]
        },
        initDisplayOfElement: function initDisplayOfElement () { //根据data-show-client初始化元素在不同客户端的显示或隐藏状态
            $('[data-show-client]').each(function () {
                var $this = $(this)
                var clients = window.team.getClients()
                var showClient = $this.attr('data-show-client')
                if(!(_.intersection(showClient.split(','), clients).length)) {
                    $this.hide()
                } else {
                    $this.css('display','')
                }
            })

            $('[data-hide-client]').each(function () {
                var $this = $(this)
                var clients = window.team.getClients()
                var hideClient = $this.attr('data-hide-client')
                if(_.intersection(hideClient.split(','), clients).length) {
                    $this.hide()
                }
            })
        },
        setUserType: function (userType) {
            if (window.user) {
                var apiUrl = '/api/1/user/edit'
                var userTypeData
                if (!window.user.user_type) {
                    userTypeData = window.userTypeMap[userType]
                } else if (_.pluck(window.user.user_type, 'slug').indexOf(userType) < 0) {
                    userTypeData = JSON.stringify(_.pluck(window.user.user_type, 'id').concat([window.userTypeMap[userType]]))
                }
                if(userTypeData && userTypeData.length) {
                    $.betterPost(apiUrl, {user_type: userTypeData})
                        .done(function (val) {
                            window.user = val
                        })
                }
            }
        },
        /*生成一个指定长度的从1开始递增的自然数数组*/
        generateArray: function (length, start) {
            start = start === undefined ? 1 : start
            return _.map(new Array((length || 0) + 1).join('0').split(''), function (val, index) {
                return index + start
            })
        },
        openLink: function (url) {
            if(window.team.isCurrantClient() && window.bridge) {
                window.bridge.callHandler('openURLInNewController', url)
                return
            }
            location.href = url
        },
        /* DD-MM-YYYY to YYYY-MM-DD */
        normalizeDateString: function(val){
            var UKdateRegex = /^\d{2}-\d{2}-\d{4}$/;
            if (UKdateRegex.test(val) && window.lang === 'en_GB') {
                var dateArr = val.split('-');
                return dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];
            }else{
                return val;
            }
        }
    }
})
();
