# -*- coding:utf-8 -*-
from bson.objectid import ObjectId
from app import f_app
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment


header = ['用户', '邮箱', '性别', '国家', '城市', '用户类型', '职业', '房东类型', '注册时间', '有没有发房产',
          '发布房产量', '单间整套', '已租出', '确认已租出了', '有没有草稿', '有没有提交求租单', '提交投资意向单',
          '有没有收藏房产', '备注']


def get_all_enum_list(s):
    list_set = f_app.i18n.process_i18n(f_app.enum.get_all(s))
    dic = dict()
    for e in list_set:
        dic[e.get('id')] = e.get('value')
    return dic


def get_data(u, s):
    if u is None:
        return ''
    v = u.get(s)
    if v is None:
        v = ''
    if s is 'register_time':
        v = str(v)
    return v.encode("utf-8")


def get_enum_data(u, s):
    list_dic = get_all_enum_list(s)
    t = ''
    if u is None:
        return ''
    v = u.get(s)
    if isinstance(v, list):
        for single_type in v:
            if single_type == v[-1]:
                t += list_dic[single_type.get('id')]
            else:
                t += list_dic[single_type.get('id')] + '/'
    return t.encode('utf-8')


def get_related_data(u, s):
    if s == "rent_ticket":
        module = f_app.ticket
        filters = {"type": "rent"}
    elif s == "rent_intention_ticket":
        module = f_app.ticket
        filters = {"type": "rent_intention"}
    elif s == "intention_ticket":
        module = f_app.ticket
        filters = {"type": "intention"}
    elif s == "favorite_property":
        module = f_app.user.favorite
        filters = {"type": "property"}
    else:
        raise NotImplementedError

    filters.update({"$or": [{"user_id": ObjectId(u["id"])},
                            {"creator_user_id": ObjectId(u["id"])}]})
    return module.get(module.search(filters, per_page=-1))


wb = Workbook()
ws = wb.active
ws.append(header)
# land_enum = f_app.i18n.process_i18n(f_app.enum.get_all('landlord_type'))
# print f_app.util.json_dumps(land_enum,ensure_ascii = False)
rent_type_enum = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
landlord_type_enum = f_app.i18n.process_i18n(f_app.enum.get_all('landlord_type'))
landlord_type_enum_map = {enum["id"]: enum for enum in landlord_type_enum}
user_whole = f_app.user.get(f_app.user.get_active())

for user in user_whole:
    rent_tickets = get_related_data(user, 'rent_ticket')
    single_flag = 0
    all_flag = 0
    draft_flag = 0
    rent_count = 0
    single_all_info = []
    landlord_info = []
    for rent_ticket in rent_tickets:
        #单个用户的每份出租信息
        if rent_ticket.get('status') == "rent":
            rent_count += 1
        if rent_ticket.get('status') == "draft":
            draft_flag = 1
        ticket_landlord_type = rent_ticket.get('landlord_type')
        ticket_single_all_type = rent_ticket.get('rent_type')
        for landlord_type in landlord_type_enum:
            if ticket_landlord_type is not None and ticket_landlord_type.get('id') == landlord_type.get('id'):
                info = landlord_type.get('value')
                if not info in landlord_info:
                    landlord_info.append(info)
        for rent_type in rent_type_enum:
            if ticket_single_all_type is not None and ticket_single_all_type.get('id') == rent_type.get('id'):
                info = rent_type.get('value')
                if not info in single_all_info:
                    single_all_info.append(info)
    rent_intention_tickets = get_related_data(user, 'rent_intention_ticket')
    intention_tickets = get_related_data(user, 'intention_ticket')
    favorite_properties = get_related_data(user, 'favorite_property')
    ws.append([get_data(user, 'nickname'),
               get_data(user, 'email'),
               '',
               get_data(user.get('country'), 'code'),
               '',
               get_enum_data(user, 'user_type'),
               '',
               '/'.join(landlord_info),
               get_data(user, 'register_time'),
               "Y" if rent_tickets else "N",
               len(rent_tickets),
               '/'.join(single_all_info),
               rent_count,
               '',
               "Y" if draft_flag else "N",
               "Y" if rent_intention_tickets else "N",
               "Y" if intention_tickets else "N",
               "Y" if favorite_properties else "N",
               ])
simsun_font = Font(name="SimSun")
header_fill = PatternFill(fill_type='solid', start_color='00dddddd', end_color='00dddddd')
alignment_fit = Alignment(shrink_to_fit=True)
for c in ws.rows[0]:
    c.fill = header_fill
for row in ws.rows:
    for c in row:
        c.font = simsun_font
        c.alignment = alignment_fit
for i, col in enumerate(ws.columns):
    lenmax = 0
    for c in col:
        lencur = 0
        if isinstance(c.value, int):
            lencur = len(str(c.value).encode("GBK"))
        elif c.value is not None:
            lencur = len(c.value.encode("GBK"))
        if lencur > lenmax:
            lenmax = lencur
    ws.column_dimensions[chr(i+65)].width = lenmax*0.86
wb.save("userData.xlsx")
