$.fn.dateRangePickerCustom = function (inputObj) {
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
        function bindEvents () {
            box.find('.prevYear').on('click', function () {
                if(inputObj.val()){
                    setDate(window.moment(inputObj.val()).subtract(1, 'years').format('YYYY-MM-DD'))
                }else{
                    setDate(window.moment().subtract(1, 'years').format('YYYY-MM-DD'))
                }

            })
            box.find('.nextYear').on('click', function () {
                if(inputObj.val()){
                    setDate(window.moment(inputObj.val()).add(1, 'years').format('YYYY-MM-DD'))
                }else{
                    setDate(window.moment().add(1, 'years').format('YYYY-MM-DD'))
                }
            })
        }
        function setDate (date) {
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