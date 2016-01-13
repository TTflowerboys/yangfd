# coding: utf-8
from __future__ import unicode_literals
import sys
from app import f_app
from datetime import datetime, timedelta
from datetime import date
# from datetime import timedelta
from openpyxl import Workbook
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment
import Levenshtein
import re
import json
from six.moves import urllib
from pyquery import PyQuery as pq

username = "13545078924"
password = "bbt12345678"

day_shift = int(sys.argv[1]) if len(sys.argv) > 1 else 0  # the date how many days before will be loaded


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

        header = ['微薄帐号', '时间', '链接地址', '最新内容', '来源关键词', '长期/短期', '名字', '电话', '微信', '邮箱', 'qq', '地址']
        header_powerapple = ['论坛帐号', '时间', '链接地址', '标题', '联系方式', '长期/短期', '名字', '电话', '微信', '邮箱', 'qq', '地址']
        result_weibo = []
        result_powerapple = []

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
                # print "col "+get_correct_col_index(num)+" fit."

        def simplify(keywords):
            # get weibo into a list
            result_list = []
            search_count = 0
            search_times = 0
            keyword_total = len(keywords)
            for num, keyword in enumerate(keywords):
                print unicode((num, keyword_total)) + " " + keyword
                result_search = {}
                analyze_keyword_count_orign[keyword] = 0
                for page in range(1, 3):
                    try:
                        result_search = ss.search(keyword, page=page)
                        search_times += 1
                    except:
                        # print "page " + unicode(page) + " fail"
                        continue
                    else:
                        if 'ok' not in result_search or result_search['ok'] != 1:
                            # print "page " + unicode(page) + " ok " + unicode(result_search['ok'])
                            continue
                        count = len(result_search['mblogList'])
                        for index in range(count):
                            result_search['mblogList'][index].update({"keyword": keyword})
                        result_list.extend(result_search['mblogList'])
                        search_count += count
                        analyze_keyword_count_orign[keyword] += count
                        # print "page " + unicode(page) + " count " + unicode(count)
                print "count " + unicode(search_count) + " times " + unicode(search_times)
            return result_list

        def reduce_weibo(weibo_list):
            result = []
            today = date.today()
            time_start = datetime(today.year, today.month, today.day) - timedelta(days=day_shift, hours=7)
            cleanr = re.compile('<.*?>')
            total = 0
            count = 0
            for single in weibo_list:
                total += 1
                user = single['user']['screen_name']
                text = unicode(re.sub(cleanr, '', single['text']))
                time = single['created_timestamp']
                link = "http://weibo.com/" + unicode(single['user']['id']) + "/" + single['bid']
                single['time'] = datetime.fromtimestamp(time)
                time = datetime.fromtimestamp(time)
                if time < time_start:
                    continue
                count += 1
                if single['keyword'] in analyze_keyword_count_date:
                    analyze_keyword_count_date[single['keyword']] += 1
                else:
                    analyze_keyword_count_date[single['keyword']] = 1
                result.append({
                    "name": user,
                    "text": text,
                    "time": time,
                    "link": link,
                    "keyword": single['keyword']
                })
            print "after date filter " + unicode(count) + '/' + unicode(total) + " left."
            return result

        def remove_overlap(weibo_list):
            result = []
            result_extra = []
            count = 0
            total = len(weibo_list)
            for single in weibo_list:
                while weibo_list.count(single) > 1:
                    weibo_list.remove(single)
            for single_weibo in weibo_list:
                step = 0
                cur_keyword_list = [single_weibo['keyword']]
                if single_weibo in result_extra:
                    continue
                for index in weibo_list:
                    if index == single_weibo or index in result_extra:
                        continue
                    step = Levenshtein.distance(single_weibo['text'], index['text'])
                    if step*1.0/len(unicode(single_weibo['text'])) < 0.17 and step*1.0/len(unicode(index['text'])) < 0.17:
                        result_extra.append(index)
                        cur_keyword_list.append(index['keyword'])
                if single_weibo['keyword'] in analyze_keyword_count_final:
                    analyze_keyword_count_final[single_weibo['keyword']] += 1
                else:
                    analyze_keyword_count_final[single_weibo['keyword']] = 1
                count += 1
                result.append({
                    "name": single_weibo['name'],
                    "text": single_weibo['text'],
                    "time": single_weibo['time'],
                    "link": single_weibo['link'],
                    "keyword": cur_keyword_list
                })
            print "after remove overlaping " + unicode(count) + '/' + unicode(total) + " left."
            for single in result_extra:
                print single['time']
                print single['text']
            return result

        def crawler_powerapple():
            list_url = 'http://www.powerapple.com/bbs/forums/10141'
            page = 1
            result_list = []
            while(page <= 8):
                print 'page: '+unicode(page)
                target_url = list_url + '?page=' + unicode(page)
                page += 1
                max_time = datetime(1970, 1, 1)
                try:
                    list_page = f_app.request.get(target_url)
                except:
                    continue
                dom = pq(list_page.content)
                topics = dom('li.topic-li')
                for topic_dom in topics:
                    topic = pq(topic_dom)
                    result = {}
                    array = []
                    if topic.attr('data-stick') == 'false':
                        result.update({'text': topic('h4')('span')[0].text})
                        result.update({'link': 'http://www.powerapple.com' + topic('h4')('a').attr('href')})
                        result.update({'name': topic('div.authortime div.username a')[0].text})
                        time = datetime.strptime(topic('div.authortime div.threadtime')[0].text.replace('\n', '').replace(' ', ''), '%Y-%m-%d')
                        result.update({'time': unicode(time)})
                        max_time = max(time, max_time)
                        try:
                            topic_page = f_app.request.get(result['link'])
                        except:
                            continue
                        text = [single.text() for single in pq(pq(topic_page.content)('div.post-list li')[1])('div.post-main div.postbody').items()]
                        for t in text:
                            for i in re.split(',|\.|。|，', t):
                                for example in ['微信', '电话', '联系', '邮箱', '地址']:
                                    if i.find(example) != -1:
                                        print i
                                        array.append(i)
                        result.update({'keyword': array})
                        result_list.append(result)

                if max_time < datetime(2015, 11, 1):
                    break
            return result_list

        # result_weibo = remove_overlap(reduce_weibo(simplify(keywords_list)))
        result_powerapple = crawler_powerapple()

        wb = Workbook()
        ws = wb.active
        ws_powerapple = wb.create_sheet()

        ws.append(header)

        for single in result_weibo:
            ws.append([
                single['name'],
                single['time'],
                single['link'],
                single['text'],
                ' & '.join(single['keyword'])
            ])
        add_link(ws, 'C')
        format_fit(ws)

        ws_powerapple.append(header_powerapple)
        for single in result_powerapple:
            ws_powerapple.append([
                single['name'],
                single['time'],
                single['link'],
                single['text']
            ])
        add_link(ws_powerapple, 'C')
        format_fit(ws_powerapple)

        today = date.today()
        if day_shift:
            wb.save('weibo_search' + unicode(today - timedelta(days=day_shift)) + '~' + unicode(today) + '.xlsx')
        else:
            wb.save('weibo_search' + unicode(today) + '.xlsx')

        # wb = Workbook()
        # ws = wb.active
        #
        # ws.append(["keyword", "源数据量", "按日期筛选后剩余", "去重以后剩余"])
        #
        # for single in analyze_keyword_count_orign:
        #     ws.append([
        #         single,
        #         unicode(analyze_keyword_count_orign[single]) if single in analyze_keyword_count_orign else unicode(0),
        #         unicode(analyze_keyword_count_date[single]) if single in analyze_keyword_count_date else unicode(0),
        #         unicode(analyze_keyword_count_final[single]) if single in analyze_keyword_count_final else unicode(0)
        #     ])
        #
        # format_fit(ws)
        # if day_shift:
        #     wb.save('weibo_search_keyword_analyze' + unicode(today - timedelta(days=day_shift)) + '~' + unicode(today)+'.xlsx')
        # else:
        #     wb.save('weibo_search_keyword_analyze' + unicode(today)+'.xlsx')


analyze_keyword_count_orign = {}
analyze_keyword_count_date = {}
analyze_keyword_count_final = {}
list_keyw = generate_keyword_list("keywords_search_weibo.xlsx")
get_weibo_search_result(list_keyw)
