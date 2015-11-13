# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict
from bson.code import Code

f_app.common.memcache_server = ["172.20.101.98:11211"]
f_app.common.mongo_server = "172.20.101.98"

with f_app.mongo() as m:
    # Configure global filter params here
    # TODO

    # 用户总数
    total_user_count = m.users.count()
    cursor = m.users.aggregate(
        [
            {'$match': {'register_time': {'$exists': 'true'}}},
            {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}}}
        ]
    )
    print('用户总数:' + str(total_user_count))
    for document in cursor:
        print('注册用户总数:' + str(document['totalUsersCount']))

    # 按角色统计用户
    print('\n按角色统计用户:')
    cursor = m.users.aggregate(
        [
            {"$unwind": "$user_type"},
            {"$group": {"_id": "$user_type", "count": {"$sum": 1}}}
        ]
    )

    for document in cursor:
        print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

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

    # 出租房源创建设备统计
    print('\n出租房源创建请求总数量:')
    cursor = m.log.aggregate(
        [
            {'$match': {'route': '/api/1/rent_ticket/add'}},
            {'$group': {'_id': None, 'count': {'$sum': 1}}}
        ]
    )
    for document in cursor:
        totalRentTicketCount = document['count']
        print(totalRentTicketCount)

    print('\n手机创建请求数量:')
    cursor = m.log.aggregate(
        [
            {'$match': {'route': '/api/1/rent_ticket/add', 'useragent': {'$regex': '.*currant.*'}}},
            {'$group': {'_id': 'None', 'count': {'$sum': 1}}}
        ]
    )
    for document in cursor:
        totalAppRentTicketCount = document['count']
        print(totalAppRentTicketCount)

    print('\n手机创建请求比例' + ': ' + format(totalAppRentTicketCount*1.0/totalRentTicketCount, '.2%'))

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
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 出租房出租类型统计
    print('\n正在发布中的房源里的出租类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent", 'status': "to rent"}},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 正在发布中的房源里的房东类型统计
    print('\n正在发布中的房源里的房东类型统计:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent", 'status': "to rent"}},
            {'$group': {'_id': "$landlord_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

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
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

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
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 求租意向单数量
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent_intention"}},
            {'$group': {'_id': 'null', 'count': {'$sum': 1}}}
        ]
    )
    for document in cursor:
        print('\n求租意向单总数：' + str(document['count']))

    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent_intention"}},
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
            {'$match': {'type': "rent_intention", 'city._id': ObjectId('555966cd666e3d0f578ad2cf')}},
            {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        if(document['_id']):
            print(f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'].encode('utf-8') + ":" + str(document['count']))

    # 按预算统计伦敦求租意向单
    print('\n统计200镑以上的伦敦求租意向单:')
    # 要统计的范围，比如200镑到300镑的表示方法为{'min': 200.0, 'max': 300.0}
    target_budget_currency = 'GBP'
    target_budget = {'min': 200.0}
    budget_filter = []

    for currency in f_app.common.currency:
        condition = {}
        conditions = {}
        if currency == target_budget_currency:
            if 'min' in target_budget:
                condition['rent_budget_min.unit'] = currency
                condition['rent_budget_min.value_float'] = {}
                condition['rent_budget_min.value_float']['$gte'] = target_budget['min']
            if 'max' in target_budget:
                condition['rent_budget_max.unit'] = currency
                condition['rent_budget_max.value_float'] = {}
                condition['rent_budget_max.value_float']['$lte'] = target_budget['max']
        else:
            if 'min' in target_budget:
                condition['rent_budget_min.unit'] = currency
                condition['rent_budget_min.value_float'] = {}
                condition['rent_budget_min.value_float']['$gte'] = float(f_app.i18n.convert_currency({"unit": target_budget_currency, "value_float": target_budget['min']}, currency))
            if 'max' in target_budget:
                condition['rent_budget_max.unit'] = currency
                condition['rent_budget_max.value_float'] = {}
                condition['rent_budget_max.value_float']['$lte'] = float(f_app.i18n.convert_currency({"unit": target_budget_currency, "value_float": target_budget['max']}, currency))
        conditions['$and'] = []
        conditions['$and'].append(condition)
        budget_filter.append(conditions)

    cursor = m.tickets.aggregate(
        [
            {'$match': {
                'type': "rent_intention",
                'city._id': ObjectId('555966cd666e3d0f578ad2cf'),
                '$or': budget_filter
                }},
            {'$group': {'_id': "null", 'count': {'$sum': 1}}}
        ]
    )

    for document in cursor:
        print('总数:' + str(document['count']))

    # 按街区统计伦敦求租意向单
    print('\n伦敦填写了街区的求租意向单:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': "rent_intention", 'city._id': ObjectId('555966cd666e3d0f578ad2cf'), 'maponics_neighborhood': {'$exists': 'true'}}},
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

    # 按收藏类型统计
    print('\n按收藏类型统计被收藏过的次数:')
    cursor = m.favorites.aggregate(
        [
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
            {'$match': {'type': "rent_ticket"}},
            {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
    )

    for document in cursor:
        print(f_app.user.output([document['_id']], custom_fields=f_app.common.user_custom_fields)[0]['nickname'].encode('utf-8') + ':' + str(document['count']))

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
        print(user['nickname'].encode('utf-8') + ':' + str(user_fav_count_dic[str(user['id'])]))

    # 查看过联系方式的总用户数和比例和查看总次数
    print('\n查看过联系方式的总用户数和查看总量:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
            {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
            {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
        ]
    )

    for document in cursor:
        total_requested_contact_user_count = document['totalUsersCount']
        print('查看过联系方式的总用户数量' + ':' + str(document['totalUsersCount']) + ', ' + '占总用户数的比例为' + format(document['totalUsersCount']*1.0/total_user_count, '.2%'))
        print('所有查看过联系方式的总次数' + ':' + str(document['totalRequestCount']))

    # 查看N次联系方式的用户数分布：
    print('\n查看N次联系方式的用户数分布:')
    for i in range(5):
        cursor = m.orders.aggregate(
            [
                {'$unwind': "$items"},
                {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
                {'$match': {'count': i}},
                {'$group': {'_id': 'null', 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
            ]
        )

        for document in cursor:
            print('查看过' + str(i) + '次联系方式的总用户数量' + ':' + str(document['totalUsersCount'])+ ', ' + '占总查看过联系方式用户数的比例为' + format(document['totalUsersCount']*1.0/total_requested_contact_user_count, '.2%'))
            print('查看过' + str(i) + '次联系方式的用户总共查看数量' + ':' + str(document['totalRequestCount']))

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
        print(document['_id'].encode('utf-8') + ':' + str(document['count']))

    # 被查看过联系方式的房源数量和被查看总次数的统计
    # TODO
    print('\n被查看过联系方式的房源数量和被查看总次数的统计:')
    cursor = m.orders.aggregate(
        [
            {'$unwind': "$items"},
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

    # 浏览过海外房产总数量
    total_property_views_count = m.log.find({'property_id': {'$exists': 'true'}}).count()
    print('\n浏览过海外房产总数量: ' + str(total_property_views_count))
    cursor = m.log.aggregate(
        [
            {'$match': {'property_id': {'$exists': 'true'}, 'id': None}},
            {'$group': {'_id': "$id", 'count': {'$sum': 1}}},
        ]
    )
    for document in cursor:
        print('未注册用户浏览量: ' + str(document['count']))
    print('注册用户浏览量: ' + str(total_property_views_count - document['count']))

    # 浏览过海外房产数量的用户排名
    print('\n浏览过海外房产数量的用户排名:')
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
        if(document['_id']):
            user_property_view_count_dic[str(document['_id'])] = document['count']

    user_property_view_count_dic = OrderedDict(sorted(user_property_view_count_dic.items(), key=lambda t: t[1], reverse=True))

    target_users = f_app.user.output(user_property_view_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)

    for user in target_users:
        print(user['nickname'].encode('utf-8') + ':' + str(user_property_view_count_dic[str(user['id'])]))

    # 被浏览最多的海外房产排名
    print('\n被浏览最多的海外房产排名:')
    cursor = m.log.aggregate(
        [
            {'$match': {'property_id': {'$exists': 'true'}}},
            {'$group': {'_id': "$property_id", 'count': {'$sum': 1}}},
            # {'$limit': 10}
            {'$sort': {'count': -1}}
        ]
    )
    property_viewed_count_dic = {}
    for document in cursor:
        property_viewed_count_dic[str(document['_id'])] = document['count']

    property_viewed_count_dic = OrderedDict(sorted(property_viewed_count_dic.items(), key=lambda t: t[1], reverse=True))

    target_properties = f_app.i18n.process_i18n(f_app.property.output(property_viewed_count_dic.keys(), ignore_nonexist=True, permission_check=False))

    for target_property in target_properties:
        if target_property and 'name' in target_property:
            print(target_property['name'].encode('utf-8') + ", " + str(target_property['id']) + ':' + str(property_viewed_count_dic[str(target_property['id'])]))

    # 分邮件类型来统计邮件发送和打开的状态
    print('\n分邮件类型来统计邮件发送成功,打开和点击的百分比:')
    # 计算每类邮件的总数

    func_map = Code('''
        function() {
        var list = []
            if (this.tag && this.email_id) {
                if (Array.isArray(this.target)) {
                    for (var index = 0; index < this.target.length; index ++) {
                        list = []
                        list.push({target: this.target[index],
                                   email_id: this.email_id});
                        emit(this.tag, {a:list});
                    }
                }
                else {
                    list.push({target: this.target,
                               email_id: this.email_id});
                    emit(this.tag, {a:list});
                }
            }
        }
    ''')
    func_reduce = Code('''
        function(key, values) {
            var list = []
            values.forEach(function(e) {
                if (e.a) {
                    list = list.concat(e.a)
                }
                else {
                    list = list.concat(e)
                }
            });
            return {a:list}
        }
    ''')
    result = f_app.task.get_database(m).map_reduce(func_map, func_reduce, "aggregation_tag", query={"type": "email_send"})
    tag_total = result.find().count()
    print "共有", unicode(tag_total), "类tag"
    print "%4s%30s%4s%7s%7s%6s%7s%6s%7s%7s%5s" % ("序号", "tag", "总数", "到达量", "到达率", "打开数量", "打开率", "重复打开量", "点击量", "点击率", "重复点击量")
    for index, tag in enumerate(result.find()):
        func_status_map = Code('''
            function() {
                var event = this.email_status_set;
                var event_detail = this.email_status_detail;
                if (event) {
                    event.forEach(function(e) {
                        emit(e, 1);
                        if (event_detail) {
                            event_detail.forEach(function(c) {
                                if (c.event == e) {
                                    emit(e+" (repeat)", 1)
                                }
                            });
                        }
                    });
                }
            }
        ''')
        func_status_reduce = Code('''
            function(key, value) {
                return Array.sum(value)
            }
        ''')
        query_param = {}
        or_param = []
        for single_param in tag["value"]["a"]:
            or_param.append(single_param)
        query_param.update({"$or": or_param})
        tag_result = f_app.email.status.get_database(m).map_reduce(func_status_map, func_status_reduce, "aggregation_tag_event", query=query_param)
        final_result = {}
        for thing in tag_result.find():
            final_result.update({thing["_id"]: thing["value"]})
        open_unique = final_result.get("open", 0)
        open_times = final_result.get("open (repeat)", 0)
        click_unique = final_result.get("click", 0)
        click_times = final_result.get("click (repeat)", 0)
        delivered_times = final_result.get("delivered", 0)
        total_email = len(tag["value"]["a"])
        print "%6d%30s%6d%10d%9.2f%%%10d%9.2f%%%10d%10d%9.2f%%%10d" % (index, tag["_id"], total_email, delivered_times, 100*delivered_times/total_email, open_unique, 100*open_unique/total_email, open_times, click_unique, 100*click_unique/total_email, click_times)
