$.fn.dateRangePickerCustom = function () {
    //利用jquery.daterangepicker.js暴露的API进行一些定制,目前仅增加上一年、下一年的功能
    var exposeApi = this.data('dateRangePicker')
    if(!exposeApi) {
        return this
    }
    var box = exposeApi.getDatePicker()
    function addEasyYear () {

        function addEasyYearUI () {
            box.find('.caption').prepend('<th style="width:27px;cursor: pointer;"><span class="prevYear">&lt;&lt;</span></th>')
            box.find('.caption').append('<th style="width:27px;cursor: pointer;"><span class="nextYear">&gt;&gt;</span></th>')
            box.find('.month-name').attr('colspan', '3')
        }
        function getCurrentYear () {
            return window.moment(parseInt(box.find('[time]').eq(10).attr('time'))).year()
        }
        function bindEvents () {
            box.find('.prevYear').on('click', function () {
                setDate(getCurrentYear() - 1)
            })
            box.find('.nextYear').on('click', function () {
                setDate(getCurrentYear() + 1)
            })
        }
        function setDate (year) {
            var date = year + '-1-1'
            exposeApi.setDateRange(date, date)
            exposeApi.open(0)
        }
        function setup () {
            addEasyYearUI()
            bindEvents()
        }
        setup()
    }
    addEasyYear()
}