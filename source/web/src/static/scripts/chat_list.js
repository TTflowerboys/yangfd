
function chatListBind(ko, module) {
    ko.components.register('kot-chat-list', {
        viewModel: function (params) {
            var self = this
            this.pageIndex = 0
            this.pagePreStatus = true
            this.pageNexStatus = true
            this.pageLengthSingle = 10
            this.pagePreText = i18n('上一页')
            this.pageNexText = i18n('下一页')
            this.showAllText = i18n('全部')
            this.showNewText = i18n('未读')
            this.showReadText = i18n('已读')
            this.messageSourceData = categoryMessage(JSON.parse($('.messageData').text()))
            this.messageData = filterMessage(this.messageSourceData, 'all')
            this.switchTab = function (data) {
                self.tabActive(data)
                self.messageData = filterMessage(self.messageSourceData, data)
                self.messageData.forEach(function (data) {
                    data.expand(false)
                    data.expandStatus(i18n('展开'))
                })
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
            this.tabActive = ko.observable('all')
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
            this.pagePreTrigger = function () {
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
                var formatter = window.lang === 'en_GB'? 'DD-MM-YYYY': 'YYYY-MM-DD'
                this.time = window.moment(data.time * 1000).format(formatter)
                this.expand = ko.observable(false)
                this.expandStatus = ko.observable(i18n('展开'))
                this.hasRead = ko.observable((data.status === 'new' || data.status === 'sent') ? false : true)
                this.toggleExpand = function () {
                    function markMessageRead() {
                        self.status = 'read'
                        self.hasRead(true)
                        $.betterPost('/api/1/message/' + self.messageId + '/mark/' + 'read')
                            .done(function (data) {
                            })
                            .fail(function (ret) {
                            })
                            .always(function () {

                            })
                    }

                    self.expand(self.expand() ? false : true)

                    self.expandStatus(self.expand() ? i18n('收起') : i18n('展开'))

                    if (!self.hasRead()) {
                        markMessageRead()
                    }
                }
            }
            function categoryMessage(message) {
                var resultList = []
                message.forEach(function (data, index) {
                    if (typeof (data) === 'object' && data) {
                        resultList.push(new MessageListElement(data))
                    }
                })
                return resultList
            }
            function filterMessage(message, tab) {
                var resultList = []
                message.forEach(function (data, index) {
                    if (data.status === tab || tab === 'all') {
                        resultList.push(data)
                    }
                })
                return resultList
            }

        },
        template: { element: 'kotChatListTemplate' }
    })
}
chatListBind(window.ko, window.currantModule = window.currantModule || {})
