# -*- coding: utf-8 -*-
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict


with f_app.mongo() as m:

    # Configure global filter params here
    # TODO

    # 用户总数
    print('用户总数:')
    print(m.users.count())

    # 按角色统计用户
    print('\n按角色统计用户:')
    cursor = m.users.aggregate(
        [
            {"$unwind": "$user_type"},
            {"$group": {"_id": "$user_type", "count": {"$sum": 1}}}
        ]
    )

    for document in cursor:
        print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'] + ":" + str(document['count']))

    # 出租房数量
    print('\n出租房数量:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent"}},
            {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        print(document['count'])

    # 出租房状态统计
    print('\n出租房状态统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent"}},
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
            {'$match': {'type': "rent"}},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'] + ":" + str(document['count']))

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
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'] + ":" + str(document['count']))

    # 按收藏类型统计
    print('\n按收藏类型统计:')
    cursor = m.favorites.aggregate(
        [
            {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
        ]
    )
    fav_type_dic = {
        'rent_ticket': '已出租',
        'property': '发布中',
        'item': '众筹'
    }

    for document in cursor:
        if(document['_id']):
            print(fav_type_dic[document['_id']] + ':' + str(document['count']))

    # 按用户统计的收藏出租房的数量排名
    print('\n按用户统计的收藏出租房的数量排名:')
    cursor = m.favorites.aggregate(
        [
            {'$match': {'type': "rent_ticket"}},
            {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
    )

    for document in cursor:
        print(f_app.user.output([document['_id']], custom_fields=f_app.common.user_custom_fields)[0]['nickname'] + ':' + str(document['count']))

    # 按用户统计的收藏海外房产的数量排名
    print('\n按用户统计的收藏海外房产的数量排名:')
    cursor = m.favorites.aggregate(
        [
            {'$match': {'type': "property"}},
            {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
    )

    user_fav_count_dic = {}
    for document in cursor:
        user_fav_count_dic[str(document['_id'])] = document['count']

    user_fav_count_dic = OrderedDict(sorted(user_fav_count_dic.items(), key=lambda t: t[1], reverse=True))
    target_users = f_app.user.output(user_fav_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)
    for user in target_users:
        print(user['nickname'] + ':' + str(user_fav_count_dic[str(user['id'])]))

    # 查看过联系方式的总用户数和查看总量
    print('\n查看过联系方式的总用户数和查看总量:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
            {'$group': {'_id': 'null', 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
        ]
    )

    for document in cursor:
        print('查看过联系方式的总用户数量' + ':' + str(document['totalUsersCount']))
        print('查看过联系方式的总数量' + ':' + str(document['totalRequestCount']))

    # 用户查看联系方式的使用个数
    print('\n用户查看联系方式的使用个数:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
    )

    for document in cursor:
        print(document['_id'] + ':' + str(document['count']))

    # 被查看过联系方式的房源数量和被查看总次数的统计
    print('\n被查看过联系方式的房源数量和被查看总次数的统计:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$group': {'_id': "$ticket_id", 'count': {'$sum': 1}}},
            {'$group': {'_id': 'null', 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
        ]
    )

    for document in cursor:
        print('被查看过联系方式的房源数量' + ':' + str(document['totalUsersCount']))
        print('查看过联系方式的总数量' + ':' + str(document['totalRequestCount']))

    # 房源被查看联系方式的个数
    print('\n房源被查看联系方式的次数排名:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$group': {'_id': "$ticket_id", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
    )

    target_ticket_dic = {}
    for document in cursor:
        if(document['_id']):
            target_ticket_dic[str(document['_id'])] = document['count']

    target_ticket_dic = OrderedDict(sorted(target_ticket_dic.items(), key=lambda t: t[1], reverse=True))
    target_tickets = f_app.i18n.process_i18n(f_app.ticket.output(target_ticket_dic.keys(), fuzzy_user_info=True))
    for ticket in target_tickets:
        print(ticket['title'] + ", " + str(ticket['id']) + ": " + str(target_ticket_dic.get(ticket['id'])))

    # 查看过海外房产数量的用户排名
    print('\n查看过海外房产数量的用户排名:')
    cursor = m.log.aggregate(
        [
            {'$match': {'property_id': {'$exists': 'true'}}},
            {'$group': {'_id': "$id", 'count': {'$sum': 1}}},
            # {'$limit': 10}
            {'$sort': {'count': -1}}
        ]
    )
    user_property_view_count_dic = {}
    for document in cursor:
        user_property_view_count_dic[str(document['_id'])] = document['count']

    user_property_view_count_dic = OrderedDict(sorted(user_property_view_count_dic.items(), key=lambda t: t[1], reverse=True))

    target_users = f_app.user.output(user_property_view_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)

    for user in target_users:
        print(user['nickname'] + ':' + str(user_property_view_count_dic[str(user['id'])]))
