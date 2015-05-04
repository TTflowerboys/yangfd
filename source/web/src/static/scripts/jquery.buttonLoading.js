/**
 * Created by levy on 15-5-4.
 */
(function($) {
    $.ajaxSetup({
        beforeSend: function(){
            if($('.buttonLoadingClicked').length > 0) {
                $('.buttonLoadingClicked').trigger('start')
            }
        }
    })
    $.fn.buttonLoading = function(opts) {
        return $(this).each(function() {
            if($(this).data('buttonLoading') === undefined){
                return new ButtonLoading(this, opts)
            }
        })
    }
    function ButtonLoading(elem, opts) {
        var defaultOptions = {
            endTrigger: 'end'
        }
        this.elem = $(elem)
        this.elem.data('buttonLoading', true)
        this.options = $.extend(defaultOptions, opts)
        this.bindEvent()
        //this.start()
    }
    $.extend(ButtonLoading.prototype, {
        start: function() {
            this.elem.removeClass('buttonLoadingClicked').addClass('buttonLoading').prop('disabled', true)
        },
        end: function() {
            this.elem.removeClass('buttonLoading').prop('disabled', false)
        },
        bindEvent: function() {
            var _ = this
            _.elem.bind('start', function() {
                _.start()
            })
            _.elem.bind('click', function() {
                $('.buttonLoadingClicked').removeClass('buttonLoadingClicked')
                $(this).addClass('buttonLoadingClicked')
            })
            _.elem.bind(_.options.endTrigger, function() {
                _.end()
            })
        }
    })
    $('.ajaxButton').buttonLoading()
})(jQuery)