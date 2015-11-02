# coding: utf-8
from bson.objectid import ObjectId
from datetime import datetime
from app import f_app
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

f_app.common.memcache_server = ["172.20.101.98:11211"]
f_app.common.mongo_server = "172.20.101.98"


def get_data_directly(user, part, deep=None):
    if user is None:
        return
    user_part = user.get(part, None)
    if (user_part is not None) and (deep is not None):
        return user.get(part).get(deep, None)
    if f_app.util.batch_iterable(user_part):
        user_part = '/'.join(user_part)
    return user_part


def get_data_complex(user, target, condition, element):

    '''this func make dict provide get_data_enum to use.
    with user's id and 'condition' to search in the database 'target'
    then gether element in search result, make a new dict return
    '''

    dic = {}
    user_id = user.get("id", None)
    target_database = getattr(f_app, target)
    condition.update({"$or": [{"user_id": ObjectId(user_id)},
                              {"creator_user_id": ObjectId(user_id)}]})
    select_item = target_database.get(target_database.search(condition, per_page=-1))
    element_list = []
    for ticket in select_item:
        element_list.append(ticket.get(element, None))
    dic.update({element: element_list})
    return dic


def get_data_enum(user, enum_name):
    if user is None:
        return
    single = user.get(enum_name, None)
    value_list = []
    if f_app.util.batch_iterable(single):
        for true_single in single:
            if true_single is None:
                continue
            enum_id = true_single.get("id", None)
            value = enum_type_list[enum_name].get(enum_id, None)
            value_list.append(value)
    elif single is not None:
        if single.get("id", None):
            enum_id = str(single.get("id", None))
            value = enum_type_list[enum_name].get(enum_id, None)
            #print enum_id
            #print enum_type_list[enum_name]
            if value is not None:
                value_list.append(value)
    if not f_app.util.batch_iterable(value_list):
        value_list = [value_list]
    value_set = set(value_list)
    value_list = list(value_set)
    return '/'.join(value_list)


def format_fit(sheet):
    simsun_font = Font(name="SimSun")
    header_fill = PatternFill(fill_type='solid', start_color='00dddddd', end_color='00dddddd')
    alignment_fit = Alignment(shrink_to_fit=True)
    for cell in sheet.rows[0]:
        cell.fill = header_fill
    for row in sheet.rows:
        for cell in row:
            cell.font = simsun_font
            cell.alignment = alignment_fit
    for num, col in enumerate(sheet.columns):
        lenmax = 0
        for cell in col:
            lencur = 0
            if isinstance(cell.value, int) or isinstance(cell.value, datetime):
                lencur = len(str(cell.value).encode("GBK"))
            elif cell.value is not None:
                lencur = len(cell.value.encode("GBK", "replace"))
            if lencur > lenmax:
                lenmax = lencur
        if num > 90:
            sheet.column_dimensions['A'+chr(num-26)]
            print "col "+'A'+chr(num-26)+" fit."
        else:
            sheet.column_dimensions[chr(num+65)].width = lenmax*0.86
            print "col "+chr(num+65)+" fit."


def get_all_rent_intention():
    params = {"type": "rent_intention"}
    return f_app.i18n.process_i18n(f_app.ticket.output(f_app.ticket.search(params, per_page=-1)))


enum_type = ["rent_type"]
enum_type_list = {}
for enum_singlt_type in enum_type:
    print "enum type " + enum_singlt_type + " loading."
    enum_list_subdic = {}
    for enumitem in f_app.i18n.process_i18n(f_app.enum.get_all(enum_singlt_type)):
        enum_list_subdic.update({enumitem["id"]: enumitem["value"]})
    enum_type_list.update({enum_singlt_type: enum_list_subdic})
    print "enum type " + enum_singlt_type + " done."

header = ["状态", "标题", "客户", "提交时间", "出租需求", "period", "出租位置", "备注",
          "样房东有无匹配搭配", "打电话了？", "有接到？", "房子租到了么？", "通过样房东",
          "如果不是通过样房东，那么是通过哪里什么样的房源？有没有交中介费", "对平台体验的想法及反馈",
          "在找房子中用户最疼的点有哪些？", "备注"]


wb = Workbook()
ws = wb.active

ws.append(header)

for number, ticket in enumerate(get_all_rent_intention()):
    period_start = get_data_directly(ticket, "rent_available_time")
    period_end = get_data_directly(ticket, "rent_deadline_time")
    if period_end is None or period_start is None:
        time = "不明"
    else:
        period = period_end - period_start
        if period.days > 180:
            time = "6 months"
        elif 180 >= period.days > 90:
            time = "3 - 6 months"
        elif period.days <= 30:
            time = "less than 1 month"
    city = ticket.get("city", {})
    country = ticket.get("country", {})
    maponics_neighborhood = ticket.get("maponics_neighborhood", {})
    match = []
    if "partial_match" in ticket.get("tags", []):
        match.append("部分满足")
    if "perfect_match" in ticket.get("tags", []):
        match.append("完全满足")
    print country
    print maponics_neighborhood
    print ticket.get("tags", '')

    ws.append(["已提交" if (get_data_directly(ticket, "status") == "new") else "已出租",
               get_data_directly(ticket, "title"),
               get_data_directly(ticket, "nickname"),
               get_data_directly(ticket, "time"),
               get_data_enum(ticket, "rent_type"),
               time,
               ' '.join([country.get("code", ''),
                         city.get("name", ''),
                         maponics_neighborhood.get("name", ''),
                         ticket.get("address", ''),
                         ticket.get("zipcode_index", '')]),
               '',
               '/'.join(match)
               ])
    print 'ticket.' + str(number) + ' done.'
format_fit(ws)
wb.save("user_rent_intention.xlsx")
