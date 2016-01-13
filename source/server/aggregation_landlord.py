# -*- coding: utf-8 -*-
from __future__ import unicode_literals, print_function
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

    # # 出租房数量
    # print('\n出租房数量:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': "rent"}},
    #         {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
    #     ]
    # )

    # for document in cursor:
    #     print(document['count'])

    # # 出租房源创建设备统计
    # print('\n出租房源创建请求总数量:')
    # cursor = m.log.aggregate(
    #     [
    #         {'$match': {'route': '/api/1/rent_ticket/add'}},
    #         {'$group': {'_id': None, 'count': {'$sum': 1}}}
    #     ]
    # )
    # for document in cursor:
    #     totalRentTicketCount = document['count']
    #     print(totalRentTicketCount)

    # print('\n手机创建请求数量:')
    # cursor = m.log.aggregate(
    #     [
    #         {'$match': {'route': '/api/1/rent_ticket/add', 'useragent': {'$regex': '.*currant.*'}}},
    #         {'$group': {'_id': 'None', 'count': {'$sum': 1}}}
    #     ]
    # )
    # for document in cursor:
    #     totalAppRentTicketCount = document['count']
    #     print(totalAppRentTicketCount)

    # print('\n手机创建请求比例' + ': ' + format(totalAppRentTicketCount*1.0/totalRentTicketCount, '.2%'))

    # # 出租房状态统计
    # print('\n出租房状态统计:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': "rent"}},
    #         {'$group': {'_id': "$status", 'count': {'$sum': 1}}}
    #     ]
    # )
    # status_dic = {
    #     'rent': '已出租',
    #     'to rent': '发布中',
    #     'draft': '草稿',
    #     'deleted': '已删除'
    # }

    # for document in cursor:
    #     print(status_dic[document['_id']], ':', document['count'])

    # # 出租房出租类型统计
    # print('\n出租房出租类型统计:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': "rent"}},
    #         {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
    #     ]
    # )

    # for document in cursor:
    #     if(document['_id']):
    #         print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", document['count'])

    # # 出租房出租类型统计
    # print('\n正在发布中的房源里的出租类型统计:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': "rent", 'status': "to rent"}},
    #         {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
    #     ]
    # )

    # for document in cursor:
    #     if(document['_id']):
    #         print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", document['count'])

    # # 正在发布中的房源里的房东类型统计
    # print('\n正在发布中的房源里的房东类型统计:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {'type': "rent", 'status': "to rent"}},
    #         {'$group': {'_id': "$landlord_type", 'count': {'$sum': 1}}}
    #     ]
    # )

    # for document in cursor:
    #     if(document['_id']):
    #         print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", document['count'])

    # # 正在发布的出租房源的国家分布

    # # 正在发布的出租房源的街区分布
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

    # 正在发布的出租房源的租金分布
    print('\n正在发布的出租房源的租金分布')
    cursor = m.tickets.find(
        {
            'type': "rent",
            'status': "to rent"
        }
    )
    target_currency = 'GBP'
    rent_type_price_array = []
    for document in cursor:
        rent_type = f_app.enum.get(document['rent_type']['_id'])['value']['zh_Hans_CN'].encode('utf-8')
        for currency in f_app.common.currency:
            if currency == target_currency:
                rent_type_price_array.append({'rent_type': rent_type, 'price': document['price']['value_float']})
            else:
                converted_price_value = float(f_app.i18n.convert_currency({"unit": target_currency, "value_float": document['price']['value_float']}, currency))
                rent_type_price_array.append({'rent_type': rent_type, 'price': converted_price_value})
    print(rent_type_price_array)

    # 正在发布中的整套房源里的房东类型统计
    print('\n正在发布中的整套房源里的房东类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent", 'status': "to rent", 'rent_type._id': ObjectId('55645cf5666e3d0f57d6e284')}},
            {'$group': {'_id': "$landlord_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", document['count'])

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

    print('日租<1month:', period_count['short'])
    print('1month<=中短<3month:', period_count['short_middle'])
    print('>=3month中长<6month:', period_count['middle_long'])
    print('>=6month长租<12month:', period_count['long'])
    print('>=12month:', period_count['extra_long'])

    # 出租房出租类型统计
    print('\n已经出租的房源里的出租类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent", 'status': "rent"}},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", document['count'])
