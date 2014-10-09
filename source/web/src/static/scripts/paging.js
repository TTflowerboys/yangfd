window.startPaging = function (dataArray, pageItemCount, $preButton, $nextButton, loadData) {

    var pageCount = Math.ceil(dataArray.length / pageItemCount)

    var currentPage = 0

    function enablePrePage(enable) {
        if (enable) {
            $preButton.removeAttr('disabled')
            $preButton.find('img').attr('src', '/static/images/icon/user/pre-page.png')
        }
        else {
            $preButton.attr('disabled', 'disabled')
            $preButton.find('img').attr('src', '/static/images/icon/user/pre-page-disabled.png')
        }
    }

    function enableNextPage(enable) {
        if (enable) {
            $nextButton.removeAttr('disabled')
            $nextButton.find('img').attr('src', '/static/images/icon/user/next-page.png')
        }
        else {
            $nextButton.attr('disabled', 'disabled')
            $nextButton.find('img').attr('src', '/static/images/icon/user/next-page-disabled.png')
        }
    }

    if (pageCount === 0) {
        $preButton.hide()
        $nextButton.hide()
    }
    else if (pageCount === 1) {
        loadData(dataArray)
        $preButton.hide()
        $nextButton.hide()
    }
    else {
        loadData(dataArray.slice(0, pageItemCount))
        enablePrePage(false)
        enableNextPage(true)
   }

   $preButton.click(function () {
       currentPage = currentPage - 1

       if (currentPage > 0) {
           loadData(dataArray.slice(currentPage * pageItemCount, (currentPage + 1) * pageItemCount))
           enablePrePage(true)
           enableNextPage(true)
       }
       else {
           loadData(dataArray.slice(currentPage * pageItemCount, (currentPage + 1) * pageItemCount))
           enablePrePage(false)
           enableNextPage(true)
       }
   })

   $nextButton.click(function () {
       currentPage = currentPage + 1

       if (currentPage === pageCount -1) {
           loadData(dataArray.slice(currentPage * pageItemCount, dataArray.length))
           enablePrePage(true)
           enableNextPage(false)
       }
       else {
           loadData(dataArray.slice(currentPage * pageItemCount, (currentPage + 1) * pageItemCount))
           enablePrePage(true)
           enableNextPage(true)
       }
   })
}
