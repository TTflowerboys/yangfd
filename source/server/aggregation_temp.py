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

    # 分邮件类型来统计邮件发送和打开的状态
    print('\n分邮件类型来统计邮件发送成功,打开和点击的百分比:')
    # 计算每类邮件的总数
    tasks_count_by_tag = {}
    cursor = m.tasks.aggregate(
        [
            {'$match': {'type': "email_send"}},
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
    # print('\n统计200镑以上的伦敦求租意向单:')
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
