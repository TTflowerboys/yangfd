(function (ko) {
    window.openPaymentPopup = function (ticketId, isPopup) {
        var args = arguments
        $('body').trigger('openPaymentPopup', Array.prototype.slice.call(args))
    }
    ko.components.register('kot-payment-popup',{
        viewModel: function(){
            this.cardData = JSON.parse($('#cardData').text())

            this.openPaymentPopup = function (ticketId, isPopup) {
                return function () {
                    window.openPaymentPopup(ticketId, isPopup)
                }
            }
            this.visible = ko.observable()
            this.step = ko.observable(this.cardData? 2: 1)

            this.showForm = function(){
                this.step(1)
            }

            this.open = function(isPopup){
                this.visible(true)
                if(isPopup) {
                    var popup = $('#payment_popup')
                    var wrapper = popup.find('.payment_wrapper')
                    var headerHeight = wrapper.outerHeight() - wrapper.innerHeight()

                    if (wrapper.outerHeight() - headerHeight > $(window).height()) {
                        wrapper.css('top', $(window).scrollTop() - headerHeight)
                    }
                    else {
                        wrapper.css('top',
                            $(window).scrollTop() - headerHeight + ($(window).height() - (wrapper.outerHeight() - headerHeight)) / 2)
                    }
                }
            }
            this.close = function(){
                this.visible(false)
            }
            this.ticketId = ko.observable()

            var ticketId = (location.href.match(/user\-chat\/([0-9a-fA-F]{24})\/details/) || [])[1]
            var isShowPaymentPopup = window.location.href.match('showPaymentPopup=true')
            if (isShowPaymentPopup) {
                window.openPaymentPopup(ticketId, true)
                this.open(true)
            }

        },
        template: { element: 'kot-payment-popup-tpl'}
    })

	ko.components.register('add-payment-form', {
        viewModel: function(params) {
        	var nowYear = new Date().getFullYear()

        	function generateYearList(total) {
                total = total || 15
                
                return _.map(window.team.generateArray(15), function (val, index) {
                    return nowYear + index
                })
            }

            //Let the field number only for editing and paste
            var cardNoInput = $('add-payment-form input.cardNO').get(0)                
            window.inputTypeNumberPolyfill.polyfillElement(cardNoInput)

            var cardCvcInput = $('add-payment-form input.cardCVC').get(0)                
            window.inputTypeNumberPolyfill.polyfillElement(cardCvcInput)

            this.user = ko.observable(window.user)
            this.cardName = ko.observable()
            this.cardNumber = ko.observable()
            this.cardCVC = ko.observable()
            this.cardPostalCode = ko.observable()
            this.submitDisabled = ko.observable(true)

        	this.expiryYearList = ko.observableArray(generateYearList(15))
            this.expiryYear = ko.observable(nowYear)
            this.expiryMonthList = ko.observableArray(window.team.generateArray(12))
            this.expiryMonth = ko.observable(1)
            
            this.countryCodeList = ko.observableArray(_.map(JSON.parse($('#countryData').text()), function (country) {
                country.name = window.team.countryMap[country.code]
                country.countryCode = window.team.countryCodeMap[country.code]
                return country
            }))
            this.country = ko.observable(this.user() ? _.find(this.countryCodeList(), {countryCode: this.user().country_code.toString()}) : this.countryCodeList()[0])

            this.errorMsg = ko.observable()
            this.errorMsg.subscribe(function (msg) {
                if(msg.length) {
                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(msg)})
                }
            })

            this.params = ko.computed(function () {
                var params = {
                    card_name: this.cardName(),
                    card_number: this.cardNumber(),
                    card_cvc: this.cardCVC(),
                    expiry_month: this.expiryMonth(),
                    expiry_year: this.expiryYear(),
                    country: this.country(),
                    card_postal_code: this.cardPostalCode()
                }
                return params 
            }, this)

            this.validate = function () {
                var errorList = []
                var config = {
                    cardName: function () {
                        if(!this.params().card_name) {
                            return errorList.push(window.i18n('姓名不能为空'))
                        }
                        if(window.project.includePhoneOrEmail(this.params().card_name)) {
                            return errorList.push(window.i18n('姓名中不能包含电话或者email'))
                        }
                    },
                    cardNumber: function () {
                        if(!this.params().card_number) {
                            return errorList.push(window.i18n('请填写cardNumber'))
                        }
                    },
                    cardCVC: function () {
                        if(!this.params().card_cvc) {
                            return errorList.push(window.i18n('请填写cardCVC'))
                        }
                    },
                    expiryYear: function(){
                        if(!this.params().expiry_year) {
                            return errorList.push(window.i18n('请填写expiryYear'))
                        }
                    },
                    expiryMonth: function(){
                        if(!this.params().expiry_month) {
                            return errorList.push(window.i18n('请填写expiryMonth'))
                        }
                    },
                    country: function(){
                        if (!this.params().country) {
                            return errorList.push(window.i18n('请填写country'))
                        }
                    },
                    cardPostalCode: function(){
                        if (!this.params().card_postal_code) {
                            return errorList.push(window.i18n('请填写cardPostalCode'))
                        }
                    }
                }
                var keys = arguments.length ? Array.prototype.slice.call(arguments) : Object.keys(config)
                _.each(keys, _.bind(function (key) {
                    config[key].call(this)
                }, this))
                if(errorList.length) {
                    this.errorMsg(errorList.shift())
                    return false
                } else {
                    this.errorMsg('')
                    return true
                }
            }

            this.submit = function(){
                if(!this.validate('cardNumber', 'cardName', 'expiryYear','expiryMonth', 'cardCVC', 'country', 'cardPostalCode')) {
                    return
                }
                this.submitTicket()
            }
            this.submitTicket = function () {
                /*$.betterPost('', this.params())
                    .done(_.bind(function (val) {
                        $('#add_payment_popup').hide()
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
                    .always(_.bind(function () {
                        this.submitDisabled(false)
                    }, this))*/
            }

        },
        template: { element: 'add-payment-form-tpl' }
    })

    ko.components.register('show-payment-form', {
        viewModel: function(params) {
            this.isShow = ko.observable(false)
            this.showPaymentDrop = function(){
                this.isShow(this.isShow() ? false : true)
            }
        },
        template: { element: 'show-payment-form-tpl' }
    })
})(window.ko);