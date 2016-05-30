$(function () {
    // on page load

    function loadListData($list, array) {
        var $placeholder = $list.parent().find('#emptyPlaceHolder')
        $placeholder.hide()
        $list.empty()
        _.each(array, function (message) {
            var messageResult = _.template($('#messageCell_template').html())({message: message})
            $list.append(messageResult)
        })

        if (array && array.length) {
            $placeholder.hide()
        }
        else {
            $placeholder.show()
        }
    }


    function loadAllData(array) {
        loadListData($('.allList'), array)
    }


    function loadNewData(array) {
        loadListData($('.newList'), array)
    }


    function loadReadData(array) {
        loadListData($('.readList'), array)

    }

    window.allData = JSON.parse($('.messageData').text())

    function reloadData(allData) {
        var newData = []

        _.each(allData, function (item) {
            if (item.status === 'new') {
                newData.push(item)
            }
        })

        var readData = []
        _.each(allData, function (item) {
            if (item.status === 'read') {
                readData.push(item)
            }
        })

        window.startPaging(allData, 10, $('.allList_wrapper #pager #pre'), $('.allList_wrapper #pager #next'),
            loadAllData)

        window.startPaging(newData, 10, $('.newList_wrapper #pager #pre'), $('.newList_wrapper #pager #next'),
            loadNewData)

        window.startPaging(readData, 10, $('.readList_wrapper #pager #pre'), $('.readList_wrapper #pager #next'),
            loadReadData)
    }

    reloadData(window.allData)

    function showMessageListWithState(state) {
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .'+state).addClass('ui-tabs-selected')
        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state).removeClass('ghostButton').addClass('button')
        $('.list_wrapper').hide()
        if (window.isDataChanged) {
            reloadData(window.allData)
            window.isDataChanged = false
        }
        $('.' + state + 'List_wrapper').show()
    }

    function markMessageRead(messageId) {
        $.betterPost('/api/1/message/' + messageId + '/mark/' + 'read')
            .done(function (data) {
                markDataChanged(messageId)
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    function markDataChanged(messageId) {
        _.each(window.allData, function (item) {
            if (item.id === messageId) {
                item.status = 'read'
                window.isDataChanged = true
            }
        })
    }


    $('button#showAll').click(function () {
        showMessageListWithState('all')
    })

    $('button#showNew').click(function () {
        showMessageListWithState('new')
    })

    $('button#showRead').click(function () {
        showMessageListWithState('read')
    })

    $('.list').on('click', '.cell', function (event) {
        if ($(event.target).attr('id') === 'showHide' || $(event.target).attr('id') === 'title') {
            var $currentTarget = $(event.currentTarget)
            var $showHide = $currentTarget.find('#showHide')
            var status = $showHide.attr('data-status')
            var state = $showHide.attr('data-state')

            if (state === 'close') {
                $currentTarget.find('.content').show()
                $showHide.attr('data-state', 'open')
                $showHide.text(window.i18n('收起'))

                if (status === 'new') {
                    markMessageRead($showHide.attr('data-id'))
                }
            }
            else {
                $currentTarget.find('.content').hide()
                $showHide.attr('data-state', 'close')
                $showHide.text(window.i18n('展开'))
            }
        }
    })

    $('#showAllMsg').click(function () {
        showMessageListWithState('all')
    })

    $('#showNewMsg').click(function () {
        showMessageListWithState('new')
    })

    $('#showReadMsg').click(function () {
        showMessageListWithState('read')
    })

})

function messageListBind(ko, module) {
    ko.components.register('kot-message-list', {
        viewModel: function(params) {
            var self = this
            this.pageIndex = 0
            this.pagePreStatus = true
            this.pageNexStatus = true
            this.pageLengthSingle = 10
            this.pagePreText = '上一页'
            this.pageNexText = '下一页'
            this.showAllText = '全部'
            this.showNewText = '未读'
            this.showReadText = '已读'
            this.messageSourceData = categoryMessage(JSON.parse($('.messageData').text()))
            this.messageData = filterMessage(this.messageSourceData, 'All')
            this.switchTab = function(data) {
                self.tabActive(data)
                self.messageData = filterMessage(self.messageSourceData, data)
                self.messageList(self.messageData.slice(0, self.pageLengthSingle))
                self.pageIndex = 0
                self.pageShowIndex(1)
                self.pagePreDisabled('disabled')
                self.pagePreImgUrl('/static/images/user/pre-page-disabled.png')
                if (self.messageList().length >= self.messageData.length) {
                    self.pageNexDisabled('disabled')
                    self.pageNexImgUrl('/static/images/user/next-page-disabled.png')
                }
                else {
                    self.pageNexDisabled(null)
                    self.pageNexImgUrl('/static/images/user/next-page.png')
                }
            }

            this.pageShowIndex = ko.observable(1)
            this.tabActive = ko.observable('All')
            this.messageList = ko.observableArray(this.messageData.slice(0, this.pageLengthSingle))
            this.pagePreImgUrl = ko.observable('/static/images/user/pre-page-disabled.png')
            this.pageNexImgUrl = ko.observable('/static/images/user/next-page.png')
            if (this.pageLengthSingle > this.messageData) {
                this.pageNexImgUrl('/static/images/user/next-page-disabled.png')
            }
            this.pagePreDisabled = ko.observable('disabled')
            this.pageNexDisabled = ko.observable(null)
            this.pageNexTrigger = function () {
                var messageShowIndexBegin = self.pageIndex * self.pageLengthSingle
                var messageShowIndexEnd = messageShowIndexBegin + self.pageLengthSingle
                var messageShowNextPageIndexEnd = messageShowIndexEnd + self.pageLengthSingle
                if (messageShowIndexEnd < self.messageData.length) {
                    self.pageIndex += 1
                    self.pageShowIndex(self.pageIndex + 1)
                }
                if (messageShowNextPageIndexEnd >= self.messageData.length) {
                    self.pageNexDisabled('disabled')
                    self.pageNexImgUrl('/static/images/user/next-page-disabled.png')
                }
                messageShowIndexBegin = self.pageIndex * self.pageLengthSingle
                messageShowIndexEnd = messageShowIndexBegin + self.pageLengthSingle
                if (messageShowIndexBegin) {
                    self.pagePreDisabled(null)
                    self.pagePreImgUrl('/static/images/user/pre-page.png')
                }
                self.messageList(self.messageData.slice(messageShowIndexBegin, messageShowIndexEnd))
            }
            this.pagePreTrigger = function() {
                var messageShowIndexBegin = self.pageIndex * self.pageLengthSingle
                var messageShowIndexEnd = messageShowIndexBegin + self.pageLengthSingle
                if (self.pageIndex) {
                    self.pageIndex -= 1
                    self.pageShowIndex(self.pageIndex + 1)
                }
                if (!self.pageIndex) {
                    self.pagePreDisabled('disabled')
                    self.pagePreImgUrl('/static/images/user/pre-page-disabled.png')
                }
                messageShowIndexBegin = self.pageIndex * self.pageLengthSingle
                messageShowIndexEnd = messageShowIndexBegin + self.pageLengthSingle
                if (messageShowIndexEnd < self.messageData.length) {
                    self.pageNexDisabled(null)
                    self.pageNexImgUrl('/static/images/user/next-page.png')
                }
                self.messageList(self.messageData.slice(messageShowIndexBegin, messageShowIndexEnd))
            }
            function MessageListElement(data) {
                var self = this
                this.title = data.type_presentation.value + ' - ' + data.title
                this.content = data.text
                this.status = data.status
                this.messageId = data.id
                this.time = window.moment(data.time*1000).format('YYYY-MM-DD')
                this.expand = ko.observable(false)
                this.expandStatus = ko.observable('展开')
                this.hasRead = (data.status === 'new' || data.status === 'sent') ? false : true
                this.toggleExpand = function() {
                    function markMessageRead() {
                        $.betterPost('/api/1/message/' + self.messageId + '/mark/' + 'read')
                            .done(function (data) {
                                markDataChanged()
                            })
                            .fail(function (ret) {
                            })
                            .always(function () {

                            })
                    }
                    function markDataChanged() {
                        self.status = 'read'
                    }

                    if (self.expand()) {
                        self.expand(false)
                    }
                    else {
                        self.expand(true)
                    }
                    if (self.expandStatus() === '展开') {
                        self.expandStatus('收起')
                    }
                    else if (self.expandStatus() === '收起') {
                        self.expandStatus('展开')
                    }
                    markMessageRead(self.messageId)
                }
            }
            function categoryMessage(message) {
                var resultList = []
                message.forEach(function(data, index) {
                    if (typeof(data) === 'object' && data) {
                        resultList.push(new MessageListElement(data))
                    }
                })
                return resultList
            }
            function filterMessage(message, tab) {
                var resultList = []
                message.forEach(function(data, index) {
                    if (data.status === tab || tab === 'All') {
                        resultList.push(data)
                    }
                })
                return resultList
            }

        },
        template: {element: 'kotMessageListTemplate'}
    })
}
messageListBind(window.ko, window.currantModule = window.currantModule || {})
