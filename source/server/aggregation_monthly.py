# -*- coding: utf-8 -*-
from __future__ import unicode_literals, print_function
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict

f_app.common.memcache_server = ["172.20.101.98:11211"]
f_app.common.mongo_server = "172.20.101.98"

with f_app.mongo() as m:

    # 用户总数
    total_user_count = m.users.count()

    # 本月用户总数
    selected_start_month = 12
    selected_start_date = 15
    selected_end_month = 12
    selected_end_date = 21
    print(str(selected_start_month), '至', str(selected_end_month), '月用户数据统计:')

    print('\n用户总数:')
    cursor = m.users.aggregate(
        [
            {"$match": {
                "register_time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {"$group": {"_id": None, "count": {"$sum": 1}}}
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
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {"$group": {"_id": "$user_type", "count": {"$sum": 1}}}
        ]
    )

    for document in cursor:
        print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", str(document['count']))

    # 出租房数量
    print('\n出租房数量:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
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
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
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
        print(status_dic[document['_id']], ':', str(document['count']))

    # 出租房出租类型统计
    print('\n出租房出租类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", str(document['count']))

    # 出租房出租类型统计
    print('\n已经出租的房源里的出租类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent",
                'status': "rent",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8'), ":", str(document['count']))

    # 按收藏类型统计
    print('\n按收藏类型统计被收藏过的次数:')
    cursor = m.favorites.aggregate(
        [
            {'$match': {
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
        ]
    )
    fav_type_dic = {
        'rent_ticket': '出租房源',
        'property': '海外房产',
        'item': '众筹'
    }

    for document in cursor:
        if(document['_id']):
            print(fav_type_dic[document['_id']], ':', str(document['count']))

    # 按用户统计的收藏出租房的数量排名
    print('\n按用户统计的收藏出租房的数量排名:')
    cursor = m.favorites.aggregate(
        [
            {'$match': 
                {
                    'type': "rent_ticket",
                    "time":
                        {
                            '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                            '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                        }
                }},
            {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
    )
    for document in cursor:
        target_user = f_app.user.output([document['_id']], custom_fields=f_app.common.user_custom_fields)[0]
        if 'nickname' in target_user:
            print (target_user['nickname'].encode('utf-8'), ':', str(document['count']))
        else:
            print (target_user['id'], ':', str(document['count']))

    # 咨询申请数量
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'status': 'requested',
                'type': "rent_intention",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': 'null', 'count': {'$sum': 1}}}
        ]
    )
    for document in cursor:
        print('\n咨询申请数量：', str(document['count']))

    # 按用户统计的咨询申请单排名
    print('\n按用户统计的咨询申请单排名:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'status': 'requested',
                'type': "rent_intention",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
    )

    user_request_count_dic = {}
    for document in cursor:
        user_request_count_dic[str(document['_id'])] = document['count']

    user_request_count_dic = OrderedDict(sorted(user_request_count_dic.items(), key=lambda t: t[1], reverse=True))
    target_users = f_app.user.output(user_request_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)
    for user in target_users:
        print(user['nickname'].encode('utf-8'), ':', user_request_count_dic[str(user['id'])])

    # 房源对应的咨询申请
    print('\n按房源统计的咨询申请单排名:')
    cursor = m.tickets.aggregate(
        [
            {'$unwind': "$interested_rent_tickets"},
            {'$match': {
                'status': 'requested',
                'type': "rent_intention",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': '$interested_rent_tickets', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
    )
    target_ticket_dic = {}
    for document in cursor:
        if(document['_id']):
            target_ticket_dic[str(document['_id'])] = document['count']

    target_ticket_dic = OrderedDict(sorted(target_ticket_dic.items(), key=lambda t: t[1], reverse=True))
    target_tickets = f_app.i18n.process_i18n(f_app.ticket.output(target_ticket_dic.keys(), ignore_nonexist=True, permission_check=False))
    for ticket in target_tickets:
        if ticket is not None:
            print(ticket['title'].encode('utf-8'), ", ", ticket['id'], ": ", target_ticket_dic.get(ticket['id']))