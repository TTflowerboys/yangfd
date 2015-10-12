# -*- coding: utf-8 -*-
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict

f_app.common.memcache_server = ["172.20.101.98:11211"]
f_app.common.mongo_server = "172.20.101.98"

with f_app.mongo() as m:

    # 填写了门牌号的
    # print('填写了门牌号的:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': "rent"}}
    #     ]
    # )

    # target_tickets_id_list = []
    # for document in cursor:
    #     if(document['_id']):
    #         target_tickets_id_list.append(str(document['_id']))
    # print(target_tickets_id_list)
    # target_tickets = f_app.i18n.process_i18n(f_app.ticket.output(target_tickets_id_list, ignore_nonexist=True, permission_check=False))
    # total_tickets_count_with_house_name = 0
    # for ticket in target_tickets:
    #     if ticket and 'property' in ticket and 'house_name' in ticket['property']:
    #         total_tickets_count_with_house_name = total_tickets_count_with_house_name + 1
    #         print(ticket['title'] + ", " + str(ticket['id']) + ': ' + ticket['property']['house_name'])
    # print('Total tickets with house name count: ' + str(total_tickets_count_with_house_name))

    # 正在发布的出租房源的街区汇总
    # print('正在发布的出租房源的街区汇总:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': 'rent', 'status': 'to rent'}},
    #         {'$group': {'_id': "$property_id"}},
    #     ]
    # )

    # target_property_id_list = []
    # for document in cursor:
    #     if(document['_id']):
    #         target_property_id_list.append(str(document['_id']))

    # target_properties = f_app.i18n.process_i18n(f_app.property.output(target_property_id_list, ignore_nonexist=True, permission_check=False))
    # neighborhood_count_dic = {}
    # for target_property in target_properties:
    #     if target_property and 'maponics_neighborhood' in target_property and 'name' in target_property['maponics_neighborhood']:
    #         if(target_property['maponics_neighborhood']['name'] in neighborhood_count_dic):
    #             neighborhood_count_dic[target_property['maponics_neighborhood']['name']] += 1
    #         else:
    #             neighborhood_count_dic[target_property['maponics_neighborhood']['name']] = 1

    # for k, v in neighborhood_count_dic.items():
    #     print(k, v)

    # 查看过海外房产的用户及用户类型
    print('\n查看过海外房产的用户及用户类型:')
    cursor = m.log.aggregate(
        [
            {'$match': {
                'property_id': {'$exists': 'true'},
                "time":
                    {
                        '$gte': datetime(2015, 8, 1, 0, 0, 0)
                    }}},
            {'$group': {'_id': "$id", 'count': {'$sum': 1}}},
            # {'$limit': 10}
            {'$sort': {'count': -1}}
        ]
    )
    user_property_view_count_dic = {}
    for document in cursor:
        if(document['_id']):
            user_property_view_count_dic[str(document['_id'])] = document['count']

    user_property_view_count_dic = OrderedDict(sorted(user_property_view_count_dic.items(), key=lambda t: t[1], reverse=True))

    target_users = f_app.user.output(user_property_view_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)

    for user in target_users:
        if 'user_type' in user:
            print(user['nickname'].encode('utf-8') + ':' + " ".join(f_app.enum.get(x['id'])['value']['zh_Hans_CN'].encode('utf-8') for x in user['user_type']) + ', ' + str(user_property_view_count_dic[str(user['id'])]))
        else:
            print(user['nickname'].encode('utf-8') + ':' + str(user_property_view_count_dic[str(user['id'])]))
