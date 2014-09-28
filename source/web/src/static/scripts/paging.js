window.startPaging = function (dataArray, pageItemCount, $preButton, $nextButton, loadData) {

    var pageCount = Math.ceil(dataArray.length / pageItemCount)

    var currentPage = 0

    if (pageCount === 1) {
        loadData(dataArray)
        $preButton.hide()
        $nextButton.hide()
    }
    else {
        loadData(dataArray.slice(0, pageItemCount))
        $preButton.attr('disabled', 'disabled')
        $nextButton.removeAttr('disabled')
   }

   $preButton.click(function () {
       currentPage = currentPage - 1

       if (currentPage > 0) {
           loadData(dataArray.slice(currentPage * pageItemCount, (currentPage + 1) * pageItemCount))
           $nextButton.removeAttr('disabled')
           $preButton.removeAttr('disabled')
       }
       else {
           loadData(dataArray.slice(currentPage * pageItemCount, (currentPage + 1) * pageItemCount))
           $nextButton.removeAttr('disabled')
           $preButton.attr('disabled', 'disabled')
       }
   })

   $nextButton.click(function () {
       currentPage = currentPage + 1

       if (currentPage === pageCount -1) {
           loadData(dataArray.slice(currentPage * pageItemCount, dataArray.length))
           $nextButton.attr('disabled', 'disabled')
           $preButton.removeAttr('disabled')
       }
       else {
           loadData(dataArray.slice(currentPage * pageItemCount, (currentPage + 1) * pageItemCount))
           $nextButton.removeAttr('disabled')
           $preButton.removeAttr('disabled')
       }
   })
}
