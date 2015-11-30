# -*- coding: utf-8 -*-
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
    selected_start_month = 11
    selected_start_date = 24
    selected_end_month = 11
    selected_end_date = 30
    print(str(selected_start_month) + '至' + str(selected_end_month) + '月用户数据统计:')

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
        print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

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
        print(status_dic[document['_id']] + ':' + str(document['count']))

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
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

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
            print(fav_type_dic[document['_id']] + ':' + str(document['count']))

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
        print(f_app.user.output([document['_id']], custom_fields=f_app.common.user_custom_fields)[0]['nickname'].encode('utf-8') + ':' + str(document['count']))

    # 查看过联系方式的总用户数和比例和查看总次数
    print('\n查看过联系方式的总用户数和查看总量:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$match': {
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
            {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
        ]
    )

    for document in cursor:
        total_requested_contact_user_count = document['totalUsersCount']
        print('查看过联系方式的总用户数量' + ':' + str(document['totalUsersCount']) + ', ' + '占总用户数的比例为' + format(document['totalUsersCount']*1.0/total_user_count, '.2%'))
        print('所有查看过联系方式的总次数' + ':' + str(document['totalRequestCount']))

        # 被查看过联系方式的房源数量和被查看总次数的统计
    # TODO
    print('\n被查看过联系方式的房源数量和被查看总次数的统计:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$match': {
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
            {'$group': {'_id': "$ticket_id", 'count': {'$sum': 1}}},
            {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
        ]
    )

    for document in cursor:
        print('被查看过联系方式的房源数量' + ':' + str(document['totalUsersCount']))
        print('查看过联系方式的总数量' + ':' + str(document['totalRequestCount']))

    # 房源被查看联系方式的个数
    print('\n出租房源被查看联系方式的次数排名:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$match': {
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }
                }},
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
    target_tickets = f_app.i18n.process_i18n(f_app.ticket.output(target_ticket_dic.keys(), ignore_nonexist=True, permission_check=False))
    for ticket in target_tickets:
        if ticket is not None:
            print(ticket['title'].encode('utf-8') + ", " + str(ticket['id']) + ": " + str(target_ticket_dic.get(ticket['id'])))

    # 求租意向单数量
    cursor = m.tickets.aggregate(
        [
            {'$match': {
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
        print('\n求租意向单总数：' + str(document['count']))

    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent_intention",
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': '$city', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
    )
    for document in cursor:
        print(f_app.geonames.gazetteer.get(document['_id']['_id'])['name'] + ': ' + str(document['count']))

    # 按出租类型统计伦敦求租意向单
    print('\n按单间整租统计伦敦求租意向单:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent_intention",
                'city._id': ObjectId('555966cd666e3d0f578ad2cf'),
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 按预算统计伦敦求租意向单
    # print('\n按预算统计伦敦求租意向单:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {
    #             'type': "rent_intention",
    #             'city._id': ObjectId('555966cd666e3d0f578ad2cf'),
    #             "time":
    #                 {
    #                     '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0)
    #                 }}},
    #         {'$group': {'_id': "$rent_budget", 'count': {'$sum': 1}}},
    #         {'$sort': {'count': -1}}
    #     ]
    # )

    # for document in cursor:
    #     if(document['_id']):
    #         print(f_app.enum.get(document['_id']['_id'])['currency'].encode('utf-8') + f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 按街区统计伦敦求租意向单
    print('\n伦敦填写了街区的求租意向单:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent_intention",
                'city._id': ObjectId('555966cd666e3d0f578ad2cf'),
                'maponics_neighborhood': {'$exists': 'true'},
                "time":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': 'null', 'count': {'$sum': 1}}},
        ]
    )
    for document in cursor:
        print('总数:' + str(document['count']))

    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent_intention", 'city._id': ObjectId('555966cd666e3d0f578ad2cf'), 'maponics_neighborhood': {'$exists': 'true'}}},
            {'$group': {'_id': '$maponics_neighborhood', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
    )
    region_rent_intention_count_dic = {}
    for document in cursor:
        region_rent_intention_count_dic[str(document['_id']['_id'])] = document['count']

    region_rent_intention_count_dic = OrderedDict(sorted(region_rent_intention_count_dic.items(), key=lambda t: t[1], reverse=True))

    target_regions = f_app.maponics.neighborhood.get(region_rent_intention_count_dic.keys())

    for target_region in target_regions:
        if 'parent_name' in target_region:
            print(target_region['name'].encode('utf-8') + ',' + target_region['parent_name'].encode('utf-8') + ':' + str(region_rent_intention_count_dic[str(target_region['id'])]))
        else:
            print(target_region['name'].encode('utf-8') + ':' + str(region_rent_intention_count_dic[str(target_region['id'])]))

    # 分邮件类型来统计邮件发送和打开的状态
    print('\n分邮件类型来统计邮件发送成功,打开和点击的百分比:')
    # 计算每类邮件的总数
    tasks_count_by_tag = {}
    cursor = m.tasks.aggregate(
        [
            {'$match': {
                'type': "email_send",
                "start":
                    {
                        '$gte': datetime(2015, selected_start_month, selected_start_date, 0, 0, 0),
                        '$lte': datetime(2015, selected_end_month, selected_end_date, 0, 0, 0)
                    }}},
            {'$group': {'_id': "$tag", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if (document['_id']):
            tasks_count_by_tag[document['_id']] = document['count']

    # 统计每类邮件发送成功率，打开率和点击率
    for email_tag in tasks_count_by_tag.keys():
        # print(email_tag + '邮件总数: ' + str(tasks_count_by_tag[email_tag]))
        cursor = m.tasks.find({'tag': email_tag})
        total_count = 0
        target_status_rate = {
            'delivered': 0,
            'open': 0,
            'click': 0
        }
        for task in cursor:
            if ('email_id' in task and 'target' in task):
                emails_status_id = f_app.email.status.get_email_status_id(task['email_id'], task['target'])
                if(isinstance(emails_status_id, list)):
                    for email_status_id in emails_status_id:
                        try:
                            email = f_app.email.status.get(email_status_id)
                        except AttributeError:
                            email = None
                        if 'email_status_set' in email and 'processed' in email['email_status_set']:
                            total_count += 1
                            for status in target_status_rate.keys():
                                if status in email['email_status_set']:
                                    target_status_rate[status] += 1
                else:
                    try:
                        email = f_app.email.status.get(emails_status_id)
                    except AttributeError:
                        email = None
                    if email and 'email_status_set' in email and 'processed' in email['email_status_set']:
                            total_count += 1
                            for status in target_status_rate.keys():
                                if status in email['email_status_set']:
                                    target_status_rate[status] += 1
        print('\n' + email_tag.encode('utf-8') + '邮件总数: ' + str(total_count) + ', 其中:')
        if(total_count != 0):
            for key in target_status_rate.keys():
                print(key.encode('utf-8') + ': ' + str(float(target_status_rate[key])/total_count))