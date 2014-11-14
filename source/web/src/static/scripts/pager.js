window.startPaging = function (dataArray, pageItemCount, $preButton, $nextButton, loadData) {

    var pageCount = Math.ceil(dataArray.length / pageItemCount)

    var currentPage = 0

    function enablePrePage(enable) {
        if (enable) {
            $preButton.removeAttr('disabled')
            $preButton.find('img.pre').show()
            $preButton.find('img.pre-disabled').hide()
        }
        else {
            $preButton.attr('disabled', 'disabled')
            $preButton.find('img.pre').hide()
            $preButton.find('img.pre-disabled').show()
        }
    }

    function enableNextPage(enable) {
        if (enable) {
            $nextButton.removeAttr('disabled')
            $nextButton.find('img.next').show()
            $nextButton.find('img.next-disabled').hide()
        }
        else {
            $nextButton.attr('disabled', 'disabled')
            $nextButton.find('img.next').hide()
            $nextButton.find('img.next-disabled').show()
        }
    }

    if (pageCount === 0) {
        loadData(dataArray)
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
        $preButton.show()
        $nextButton.show()
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

        if (currentPage === pageCount - 1) {
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
