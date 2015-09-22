# -*- coding: utf-8 -*-
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict

f_app.common.memcache_server = ["172.20.101.98:11211"]
f_app.common.mongo_server = "172.20.101.98"

with f_app.mongo() as m:

    # 本月用户总数
    selected_month = 9
    print(str(selected_month) + '月至今用户数据统计:')

    print('\n用户总数:')
    cursor = m.users.aggregate(
        [
            {"$match": {
                "register_time":
                    {
                        '$gte': datetime(2015, selected_month, 1, 0, 0, 0)
                    }
                }},
            {"$group": {"_id": "null", "count": {"$sum": 1}}}
        ]
    )
    for document in cursor:
            print(str(document['count']))

    # 按角色统计用户
    print('\n按角色统计用户:')
    cursor = m.users.aggregate(
        [
            {"$unwind": "$user_type"},
            {"$match": {
                "register_time":
                    {
                        '$gte': datetime(2015, selected_month, 1, 0, 0, 0)
                    }
                }},
            {"$group": {"_id": "$user_type", "count": {"$sum": 1}}}
        ]
    )

    for document in cursor:
        print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 出租房数量
    print('\n出租房数量:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_month, 1, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        print(document['count'])

    # 出租房状态统计
    print('\n出租房状态统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_month, 1, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$status", 'count': {'$sum': 1}}}
        ]
    )
    status_dic = {
        'rent': '已出租',
        'to rent': '发布中',
        'draft': '草稿',
        'deleted': '已删除'
    }

    for document in cursor:
        print(status_dic[document['_id']] + ':' + str(document['count']))

    # 出租房出租类型统计
    print('\n出租房出租类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_month, 1, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 出租房出租类型统计
    print('\n已经出租的房源里的出租类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                'status': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_month, 1, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))