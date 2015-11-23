# coding: utf-8
from app import f_app
from datetime import datetime
from openpyxl import Workbook
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment

username = "13545078924"
password = "bbt12345678"
keywords_list = [u"英国房产出租", u"英国房屋出租"]


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
                temp.append(cell.value)
    return result


def get_weibo_search_result(keywords_list):

    header = ['微薄帐号', '时间', '最新内容']
    result_weibo = {}

    def get_correct_col_index(num):
        if num > 26*26:
            return "ZZ"
        if num >= 26:
            return get_correct_col_index(num/26-1)+chr(num-26+65)
        else:
            return chr(num+65)

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

    with f_app.sina_search(username=username, password=password) as ss:
        def simplify(keywords):
            result_list = []
            for keyword in keywords:
                ok = 1
                page = 1
                count = 0
                total = 0
                max_page = 0
                while ok:
                    result_search = ss.search(keyword, page=page)
                    ok = result_search['ok']
                    if ok:
                        result_list.extend(result_search['mblogList'])
                        count = len(result_list)
                    else:
                        break
                    # print (result_search, page)
                    total = result_search['total_number']
                    max_page = result_search['maxPage']
                    if count >= total or page >= max_page:
                        break
                    page += 1
            return result_list

        def format_weibo(weibo_list):
            dic = {}
            for single in weibo_list:
                user = single['user']['screen_name']
                text = single['text']
                time = single['created_timestamp']
                single['time'] = datetime.fromtimestamp(time)
                time = datetime.fromtimestamp(time)
                if user in dic:
                    if time > dic[user]['time']:
                        dic.update({
                            user, {
                                "text": text,
                                "time": time
                            }
                        })
                else:
                    dic.update({
                        user: {
                            "text": text,
                            "time": time
                        }
                    })
            return dic

        result_weibo = format_weibo(simplify(keywords_list))

    wb = Workbook()
    ws = wb.active

    ws.append(header)

    for single in result_weibo:
        ws.append([single, result_weibo[single]['time'], result_weibo[single]['text']])

    format_fit(ws)
    wb.save('weibo_search.xlsx')

get_weibo_search_result(generate_keyword_list("key words for Arnold (1).xlsx"))
