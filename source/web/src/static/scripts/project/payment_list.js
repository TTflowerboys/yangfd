(function (ko) {
	ko.components.register('kot-payment-list', {
        viewModel: function(params) {
            var cardData = JSON.parse($('#cardData').text())
            var self = this;

            self.cardList = ko.observableArray(cardData)

            self.removeCard = function(){
                self.cardList.remove(this)
                /*$.betterPost('/api/1/card/' + this.id + '/remove')
                    .done(function (data) {
                        self.cardList.remove(this)
                    })
                    .fail(function (ret) {
                    })
                    .always(function () {

                    })*/
            }
            self.settingDefault = function(){
                this.isdefault = true
            }
            

        },
        template: { element: 'kot-payment-list-tpl' }
    })
})(window.ko);