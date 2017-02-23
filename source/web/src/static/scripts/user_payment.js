(function (ko) {

    ko.components.register('kot-user-payment', {
        viewModel: function(params) {

            this.cardList = ko.observableArray()
            this.addCardFormVisible = ko.observable()
            this.addCardButtonVisible = ko.observable()
            this.empty = ko.observable(true)

            this.errorMsg = ko.observable()
            this.errorMsg.subscribe(function (msg) {
                if(msg.length) {
                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(msg)})
                }
            })

            this.loadCardList = function() {
                $.betterPost('/api/1/adyen/list')
                    .done(_.bind(function (val) {
                        var cardListData = val
                        this.empty(cardListData.length === 0)
                        this.addCardFormVisible(cardListData.length === 0)
                        this.cardList(cardListData)
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }

            this.loadCardList()

            this.addCardButtonVisible(true)
            this.togglePaymentForm = function(){
                if (window.team.isPhone()) {
                    location.href='/user-payment-add'
                }else{
                    this.addCardFormVisible(true)
                    this.addCardButtonVisible(false)
                }
            }

            this.removeCard = function(card){
                this.cardList.remove(card)
                $.betterPost('/api/1/adyen/' + card.id + '/delete')
                    .done(_.bind(function (data) {
                        this.cardList.remove(card)
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }

            this.setDefault = function(card){
                $.betterPost('/api/1/adyen/' + card.id + '/make_default')
                    .done(_.bind(function (data) {
                        this.loadCardList()
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }
        },
        template: { element: 'kot-user-payment-tpl' }
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
            this.generationtime = new Date().toISOString()

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
                if(!this.validate('cardNumber', 'cardName', 'expiryYear','expiryMonth', 'cardCVC')) {
                    return
                }
                this.addCard()
            }
            this.addCard = function () {

                var key = '10001|CD589FCB1D6F086D6496A043D35402BB085101CC8AD97348FB1849003DBAB045A306AFD246E1E6835F166E646834E3B45BA166A2CC10275AF076737FC3CEFDF189E28EFB4B6C99DF2C319FE06B15AF450F727606B51DC811B51A8F315E472AB05BC4FA9B963739AE0B7C629FD1679B3002AC7C8EA25F055D60392AAD4B1A93A072049ECC019F22B8A553F6AFB9A3AD0B343DD33F8AFF14F9CC38739A8A91FE76B8B4F8DEC6EFC98989D0A2941A6683FBC348A9E75038D45958081322FDEB6764A70725504079AE9BB41A73C78299E6720EF8A050A6229995AFA5A8766B62672EA43B9828D451B468AD061CFCA75B46C8119913252E4C21DA794113EB61890E3D'
                var options = {}
                var cseInstance = window.window.adyen.encrypt.createEncryption(key, options)
                var cardData = {
                    number: this.cardNumber(),
                    cvc: this.cardCVC(),
                    holderName: this.cardName(),
                    expiryMonth: ('0' +  this.expiryMonth()).slice(-2),
                    expiryYear: '' + this.expiryYear(),
                    generationtime: this.generationtime
                }
                var encryptedCardData = cseInstance.encrypt(cardData)

                $.betterPost('/api/1/adyen/add', {card:encryptedCardData, default: true})
                    .done(_.bind(function (val) {
                        this.loadCardList()
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }

        },
        template: { element: 'add-payment-form-tpl' }
    })

    ko.components.register('kot-payment-list-phone', {
        viewModel: function(params) {

            this.cardList = ko.observableArray()

            this.errorMsg = ko.observable()
            this.errorMsg.subscribe(function (msg) {
                if(msg.length) {
                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(msg)})
                }
            })

            this.loadCardList = function() {
                $.betterPost('/api/1/adyen/list')
                    .done(_.bind(function (val) {
                        var cardListData = val
                        this.cardList(cardListData)
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }
            this.loadCardList()
        },
        template: { element: 'kot-payment-list-phone-tpl' }
    })
})(window.ko);
