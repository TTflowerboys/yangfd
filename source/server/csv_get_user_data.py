# -*- coding:utf-8 -*-
from bson.objectid import ObjectId
from app import f_app
import csv

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
    if s is 'landlord_type':
        return ''
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

    filters.update({"$or": [{"user_id": ObjectId(u["id"])}, {"creator_user_id": ObjectId(u["id"])}]})
    return module.get(module.search(filters))

with open('userData.csv', 'wb') as csvfile:
    spamwriter = csv.writer(csvfile,
                            delimiter=',',
                            quotechar='|',
                            quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(header)
    for user in f_app.user.get(f_app.user.get_active()):
        rent_tickets = get_related_data(user, 'rent_ticket')
        rent_intention_tickets = get_related_data(user, 'rent_intention_ticket')
        intention_tickets = get_related_data(user, 'intention_ticket')
        favorite_properties = get_related_data(user, 'favorite_property')
        spamwriter.writerow([
            get_data(user, 'nickname'),
            get_data(user, 'email'),
            '',
            get_data(user.get('country'), 'code'),
            '',
            get_enum_data(user, 'user_type'),
            '',
            get_data(user, 'landlord_type'),
            get_data(user, 'register_time'),
            "Y" if rent_tickets else "N",
            len(rent_tickets),
            '',  # TODO
            '',  # TODO
            '',  # TODO
            '',  # TODO
            "Y" if rent_intention_tickets else "N",
            "Y" if intention_tickets else "N",
            "Y" if favorite_properties else "N",
        ])
