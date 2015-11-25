# coding: utf-8
from __future__ import unicode_literals
from app import f_app
from datetime import datetime
# from datetime import timedelta
from openpyxl import Workbook
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment

username = "13545078924"
password = "bbt12345678"


def generate_keyword_list(filename):
    wb = load_workbook(filename=filename)
    ws = wb.active
    temp = []
    result = []
    for row in ws.rows:
        for cell in row:
            if cell.value is None:
                if len(temp):
                    result.append(' '.join(temp))
                temp = []
            else:
                if len(temp) >= 2:
                    result.append(' '.join(temp))
                    temp = []
                temp.append(cell.value)
    return result


def get_weibo_search_result(keywords_list):

    with f_app.sina_search(username=username, password=password) as ss:

        header = ['微薄帐号', '时间', '链接地址', '最新内容', '长期/短期', '名字', '电话', '微信', '邮箱', 'qq', '地址']
        result_weibo = {}

        def get_correct_col_index(num):
            if num > 26*26:
                return "ZZ"
            if num >= 26:
                return get_correct_col_index(num/26-1)+chr(num-26+65)
            else:
                return chr(num+65)

        def add_link(sheet, target, link=None):
            if target is None:
                return
            if f_app.util.batch_iterable(target):
                pass
            else:
                for index in range(2, len(sheet.rows)+1):
                    cell = sheet[target + unicode(index)]
                    if len(cell.value):
                        if link is None:
                            cell.hyperlink = cell.value
                        else:
                            cell.hyperlink = unicode(link)

        def format_fit(sheet):
            simsun_font = Font(name="SimSun")
            alignment_fit_shrink = Alignment(shrink_to_fit=True)
            alignment_fit_wrap = Alignment(wrap_text=True)
            for row in sheet.rows:
                for cell in row:
                    cell.font = simsun_font
                    cell.alignment = alignment_fit_shrink
            for num, col in enumerate(sheet.columns):
                lenmax = 0
                for cell in col:
                    lencur = 0
                    if cell.value is None:
                        cell.value = ''
                    if isinstance(cell.value, int) or isinstance(cell.value, datetime):
                        lencur = len(unicode(cell.value).encode("GBK"))
                    elif cell.value is not None:
                        lencur = len(cell.value.encode("GBK", "replace"))
                    if lencur > 150:
                        cell.alignment = alignment_fit_wrap
                        lencur = 150
                    if lencur > lenmax:
                        lenmax = lencur

                sheet.column_dimensions[get_correct_col_index(num)].width = lenmax*0.86
                print "col "+get_correct_col_index(num)+" fit."

        def simplify(keywords):
            result_list = []
            search_count = 0
            for keyword in keywords:
                print f_app.util.json_dumps(keyword, ensure_ascii=False)
                result_search = {}
                ok = 1
                page = 1
                count = 0
                total = 0
                max_page = 0
                while ok:
                    # result_search = ss.search(keyword, page=page)
                    '''time_now = datetime.utcnow()
                    if search_count > 100:
                        search_count = 0
                        time_delta = timedelta(minutes=2)
                        time_wait = time_now + time_delta
                        print "wait"
                        while time_now < time_wait:
                            time_now = datetime.utcnow()'''
                    try:
                        result_search = ss.search(keyword, page=page)
                        search_count += 1
                    except:
                        print f_app.util.json_dumps("fail" + unicode(page), ensure_ascii=False)
                        break
                    ok = result_search['ok']
                    print ("page" + unicode(page) + "ok:" + unicode(ok))
                    if ok == 1:
                        if result_search.get('mblogList', None):
                            print "page" + unicode(page) + "count:" + unicode(len(result_search['mblogList']))
                        else:
                            print f_app.util.json_dumps(result_search, ensure_ascii=False)
                        result_list.extend(result_search['mblogList'])
                        count += len(result_search['mblogList'])
                    else:
                        print "end"
                        print f_app.util.json_dumps(result_search, ensure_ascii=False)
                        break
                    total = result_search['total_number']
                    max_page = result_search['maxPage']
                    page += 1

                    max_page = 2
                    if count >= total or page > max_page:
                        break
                print f_app.util.json_dumps(["===", keyword, "count" + unicode(count), "total" + unicode(total)], ensure_ascii=False)
                print "search_count " + unicode(search_count)
            return result_list

        def reduce_weibo(weibo_list):
            dic = {}
            for single in weibo_list:
                user = single['user']['screen_name']
                text = single['text']
                time = single['created_timestamp']
                link = "http://weibo.com/" + unicode(single['user']['id']) + "/" + single['bid']
                single['time'] = datetime.fromtimestamp(time)
                time = datetime.fromtimestamp(time)
                if user in dic:
                    if time > dic[user]['time']:
                        dic.update({
                            user: {
                                "text": text,
                                "time": time,
                                "link": link
                            }
                        })
                else:
                    dic.update({
                        user: {
                            "text": text,
                            "time": time,
                            "link": link
                        }
                    })
            return dic

        result_weibo = reduce_weibo(simplify(keywords_list))

        wb = Workbook()
        ws = wb.active

        ws.append(header)

        for single in result_weibo:
            ws.append([
                single,
                result_weibo[single]['time'],
                result_weibo[single]['link'],
                result_weibo[single]['text']
            ])

        add_link(ws, 'C')
        format_fit(ws)
        wb.save('weibo_search.xlsx')

list_keyw = generate_keyword_list("keywords_search_weibo.xlsx")
# print f_app.util.json_dumps(list_keyw, ensure_ascii=False)
# get_weibo_search_result([u"伯明翰 出租"])
get_weibo_search_result(list_keyw)
# print f_app.util.json_dumps(generate_keyword_list("key words for Arnold (1).xlsx"), ensure_ascii=False)
