# -*- coding: utf-8 -*-
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict
import sys

if len(sys.argv) > 1:
    if sys.argv[1] == '-s':
        if sys.argv[2] == 'dev':
            f_app.common.memcache_server = ["172.20.1.22:11211"]
            f_app.common.mongo_server = "172.20.1.22"
        if sys.argv[2] == 'test':
            f_app.common.memcache_server = ["172.20.101.102:11211"]
            f_app.common.mongo_server = "172.20.101.102"
else:
    f_app.common.memcache_server = ["172.20.101.98:11211"]
    f_app.common.mongo_server = "172.20.101.98"

with f_app.mongo() as m:

    # 正在发布中的房源里按最短接受租期的统计:
    # 日租<1month 1month<=中短<3month <=3month中长<6month >=6month长租
    print('\n正在发布中的房源里按最短接受租期的统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                'status': "to rent"
                }},
            {'$group': {'_id': "$minimum_rent_period", 'count': {'$sum': 1}}}
        ]
    )

    period_count = {
        'short': 0,
        'short_middle': 0,
        'middle_long': 0,
        'long': 0,
        'extra_long': 0
    }

    def covert_to_month(period):
        if(period['unit'] == 'week'):
            period['value'] = float(period['value'])/4
        if(period['unit'] == 'day'):
            period['value'] = float(period['value'])/31
        if(period['unit'] == 'year'):
            period['value'] = float(period['value'])*12
        else:
            period['value'] = float(period['value'])
        return period

    for document in cursor:
        if(document['_id']):
            period = covert_to_month(document['_id'])
            if(period['value'] < 1.0):
                period_count['short'] += document['count']
            if(period['value'] >= 1.0 and period['value'] < 3.0):
                period_count['short_middle'] += document['count']
            if(period['value'] >= 3.0 and period['value'] < 6.0):
                period_count['middle_long'] += document['count']
            if(period['value'] >= 6.0 and period['value'] < 12.0):
                period_count['long'] += document['count']
            if(period['value'] >= 12.0):
                period_count['extra_long'] += document['count']

    print('日租<1month:' + str(period_count['short']))
    print('1month<=中短<3month:' + str(period_count['short_middle']))
    print('>=3month中长<6month:' + str(period_count['middle_long']))
    print('>=6month长租<12month:' + str(period_count['long']))
    print('>=12month:' + str(period_count['extra_long']))

    # 按预算统计伦敦求租意向单
    # print('\n统计200镑以上的伦敦求租意向单:')
    # # 要统计的范围，比如200镑到300镑的表示方法为{'min': 200.0, 'max': 300.0}
    # target_budget_currency = 'GBP'
    # target_budget = {'min': 200.0}
 
    # budget_filter = []
    # for currency in f_app.common.currency:
    #     condition = {}
    #     conditions = {}
    #     if currency == target_budget_currency:
    #         if 'min' in target_budget:
    #             condition['rent_budget_min.unit'] = currency
    #             condition['rent_budget_min.value_float'] = {}
    #             condition['rent_budget_min.value_float']['$gte'] = target_budget['min']
    #         if 'max' in target_budget:
    #             condition['rent_budget_max.unit'] = currency
    #             condition['rent_budget_max.value_float'] = {}
    #             condition['rent_budget_max.value_float']['$lte'] = target_budget['max']
    #     else:
    #         if 'min' in target_budget:
    #             condition['rent_budget_min.unit'] = currency
    #             condition['rent_budget_min.value_float'] = {}
    #             condition['rent_budget_min.value_float']['$gte'] = float(f_app.i18n.convert_currency({"unit": target_budget_currency, "value_float": target_budget['min']}, currency))
    #         if 'max' in target_budget:
    #             condition['rent_budget_max.unit'] = currency
    #             condition['rent_budget_max.value_float'] = {}
    #             condition['rent_budget_max.value_float']['$lte'] = float(f_app.i18n.convert_currency({"unit": target_budget_currency, "value_float": target_budget['max']}, currency))
    #     conditions['$and'] = []
    #     conditions['$and'].append(condition)
    #     budget_filter.append(conditions)
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {
    #             'type': "rent_intention",
    #             '$or': budget_filter
    #             }},
    #         {'$group': {'_id': "null", 'count': {'$sum': 1}}}
    #     ]
    # )

    # for document in cursor:
    #     print('总数:' + str(document['count']))

    # 学生和已工作比例
    # 用户总数
    # total_user_count = m.users.count()
    # cursor = m.users.aggregate(
    #     [
    #         {'$match': {'register_time': {'$exists': 'true'}}},
    #         {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}}}
    #     ]
    # )
    # print('用户总数:' + str(total_user_count))
    # for document in cursor:
    #     print('注册用户总数:' + str(document['totalUsersCount']))

    # print('\n学生和已工作比例:')
    # cursor = m.users.aggregate(
    #     [
    #         {"$match": {'occupation': {'$exists': 'true'}}},
    #         {"$group": {"_id": "$occupation", "count": {"$sum": 1}}}
    #     ]
    # )

    # for document in cursor:
    #     print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

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

    # 正在发布的海外房产的街区汇总
    # print('\n正在发布的海外房产的街区汇总:')
    # cursor = m.propertys.aggregate(
    #     [
    #         {'$match': {'status': 'selling'}},
    #         {'$group': {'_id': "$_id"}}
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
    # print('\n查看过海外房产的用户及用户类型:')
    # cursor = m.log.aggregate(
    #     [
    #         {'$match': {
    #             'property_id': {'$exists': 'true'},
    #             "time":
    #                 {
    #                     '$gte': datetime(2015, 8, 1, 0, 0, 0)
    #                 }}},
    #         {'$group': {'_id': "$id", 'count': {'$sum': 1}}},
    #         # {'$limit': 10}
    #         {'$sort': {'count': -1}}
    #     ]
    # )
    # user_property_view_count_dic = {}
    # for document in cursor:
    #     if(document['_id']):
    #         user_property_view_count_dic[str(document['_id'])] = document['count']

    # user_property_view_count_dic = OrderedDict(sorted(user_property_view_count_dic.items(), key=lambda t: t[1], reverse=True))

    # target_users = f_app.user.output(user_property_view_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)

    # for user in target_users:
    #     if 'user_type' in user:
    #         print(user['nickname'].encode('utf-8') + ':' + " ".join(f_app.enum.get(x['id'])['value']['zh_Hans_CN'].encode('utf-8') for x in user['user_type']) + ', ' + str(user_property_view_count_dic[str(user['id'])]))
    #     else:
    #         print(user['nickname'].encode('utf-8') + ':' + str(user_property_view_count_dic[str(user['id'])]))

    # 租客的国家比例
    # print('\n租客的国家比例:')
    # cursor = m.users.aggregate(
    #     [
    #         {"$unwind": "$user_type"},
    #         {'$match': {'user_type._id': ObjectId('55b6538b8c829eeb6fe0ac69')}},
    #         {"$group": {"_id": "$country", "count": {"$sum": 1}}}
    #     ]
    # )

    # for document in cursor:
    #     if document['_id'] is None:
    #         print("None: " + str(document['count']))
    #     else:
    #         print(document['_id']['code'] + ": " + str(document['count']))
