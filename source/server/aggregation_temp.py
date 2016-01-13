# -*- coding: utf-8 -*-
from __future__ import unicode_literals, print_function
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict
import sys
from bson.code import Code

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

    # 正在发布的出租房源的街区汇总
    print('正在发布的出租房源的街区汇总:')
    cursor = m.tickets.aggregate(
        [
            {'$match': {'type': 'rent', 'status': 'to rent'}},
            {'$group': {'_id': "$property_id"}},
        ]
    )

    target_property_id_list = []
    for document in cursor:
        if(document['_id']):
            target_property_id_list.append(str(document['_id']))

    target_properties = f_app.i18n.process_i18n(f_app.property.output(target_property_id_list, ignore_nonexist=True, permission_check=False))
    neighborhood_count_dic = {}
    for target_property in target_properties:
        if target_property and 'maponics_neighborhood' in target_property and 'name' in target_property['maponics_neighborhood']:
            if(target_property['maponics_neighborhood']['name'] in neighborhood_count_dic):
                neighborhood_count_dic[target_property['maponics_neighborhood']['name']] += 1
            else:
                neighborhood_count_dic[target_property['maponics_neighborhood']['name']] = 1


    # # 分邮件类型来统计邮件发送和打开的状态
    # print('\n分邮件类型来统计邮件发送成功,打开和点击的百分比:')
    # # 计算每类邮件的总数

    # func_map = Code('''
    #     function() {
    #     var list = []
    #         if (this.tag && this.email_id) {
    #             if (Array.isArray(this.target)) {
    #                 for (var index = 0; index < this.target.length; index ++) {
    #                     list = []
    #                     list.push({target: this.target[index],
    #                                email_id: this.email_id});
    #                     emit(this.tag, {a:list});
    #                 }
    #             }
    #             else {
    #                 list.push({target: this.target,
    #                            email_id: this.email_id});
    #                 emit(this.tag, {a:list});
    #             }
    #         }
    #     }
    # ''')
    # func_reduce = Code('''
    #     function(key, values) {
    #         var list = []
    #         values.forEach(function(e) {
    #             if (e.a) {
    #                 list = list.concat(e.a)
    #             }
    #             else {
    #                 list = list.concat(e)
    #             }
    #         });
    #         return {a:list}
    #     }
    # ''')
    # result = f_app.task.get_database(m).map_reduce(func_map, func_reduce, "aggregation_tag", query={"type": "email_send"})
    # tag_total = result.find().count()
    # total_email_not_only_new = 0
    # total_email_contain_new_only = 0
    # print ("共有", tag_total, "类tag")
    # print ("%4s%30s%4s%7s%7s%6s%7s%6s%7s%7s%5s" % ("序号", "tag", "总数", "到达量", "到达率", "打开数量", "打开率", "重复打开量", "点击量", "点击率", "重复点击量"))
    # for index, tag in enumerate(result.find()):
    #     func_status_map = Code('''
    #         function() {
    #             var event = this.email_status_set;
    #             var event_detail = this.email_status_detail;
    #             if (event_detail && event) {
    #                 if (event.indexOf("processed") != -1) {
    #                     emit("total_email", 1);
    #                 }
    #                 if (event.length > 1 && event.indexOf("new") != -1 && event.indexOf("processed") == -1) {
    #                     emit("total_email_not_only_new", 1);
    #                 }
    #                 if (event.length == 1 && event.indexOf("new") != -1) {
    #                     emit("total_email_contain_new_only", 1);
    #                 }
    #                 event.forEach(function(e) {
    #                     emit(e, 1);
    #                     if (event_detail) {
    #                         event_detail.forEach(function(c) {
    #                             if (c.event == e) {
    #                                 emit(e+" (repeat)", 1);
    #                             }
    #                         });
    #                     }
    #                 });
    #             }
    #         }
    #     ''')
    #     func_status_reduce = Code('''
    #         function(key, value) {
    #             return Array.sum(value)
    #         }
    #     ''')
    #     query_param = {}
    #     or_param = []
    #     for single_param in tag["value"]["a"]:
    #         or_param.append(single_param)
    #     query_param.update({"$or": or_param})
    #     tag_result = f_app.email.status.get_database(m).map_reduce(func_status_map, func_status_reduce, "aggregation_tag_event", query=query_param)
    #     final_result = {}
    #     for thing in tag_result.find():
    #         final_result.update({thing["_id"]: thing["value"]})
    #     open_unique = final_result.get("open", 0)
    #     open_times = final_result.get("open (repeat)", 0)
    #     click_unique = final_result.get("click", 0)
    #     click_times = final_result.get("click (repeat)", 0)
    #     delivered_times = final_result.get("delivered", 0)
    #     total_email = final_result.get("total_email", 0)
    #     total_email_not_only_new += final_result.get("total_email_not_only_new", 0)
    #     total_email_contain_new_only += final_result.get("total_email_contain_new_only", 0)
    #     print ("%6d%30s%6d%10d%9.2f%%%10d%9.2f%%%10d%10d%9.2f%%%10d" % (index, tag["_id"], total_email, delivered_times, 100*delivered_times/total_email, open_unique, 100*open_unique/total_email, open_times, click_unique, 100*click_unique/total_email, click_times))
    # print ("total_email_contain_new_only", total_email_contain_new_only)
    # print ("total_email_not_only_new", total_email_not_only_new)

    # 正在发布中的房源里按最短接受租期的统计:
    # 日租<1month 1month<=中短<3month <=3month中长<6month >=6month长租
    # print('\n正在发布中的房源里按最短接受租期的统计:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {
    #             'type': "rent",
    #             'status': "to rent"
    #             }},
    #         {'$group': {'_id': "$minimum_rent_period", 'count': {'$sum': 1}}}
    #     ]
    # )

    # period_count = {
    #     'short': 0,
    #     'short_middle': 0,
    #     'middle_long': 0,
    #     'long': 0,
    #     'extra_long': 0
    # }

    # def covert_to_month(period):
    #     if(period['unit'] == 'week'):
    #         period['value'] = float(period['value'])/4
    #     if(period['unit'] == 'day'):
    #         period['value'] = float(period['value'])/31
    #     if(period['unit'] == 'year'):
    #         period['value'] = float(period['value'])*12
    #     else:
    #         period['value'] = float(period['value'])
    #     return period

    # for document in cursor:
    #     if(document['_id']):
    #         period = covert_to_month(document['_id'])
    #         if(period['value'] < 1.0):
    #             period_count['short'] += document['count']
    #         if(period['value'] >= 1.0 and period['value'] < 3.0):
    #             period_count['short_middle'] += document['count']
    #         if(period['value'] >= 3.0 and period['value'] < 6.0):
    #             period_count['middle_long'] += document['count']
    #         if(period['value'] >= 6.0 and period['value'] < 12.0):
    #             period_count['long'] += document['count']
    #         if(period['value'] >= 12.0):
    #             period_count['extra_long'] += document['count']

    # print('日租<1month:', period_count['short'])
    # print('1month<=中短<3month:', period_count['short_middle'])
    # print('>=3month中长<6month:', period_count['middle_long'])
    # print('>=6month长租<12month:', period_count['long'])
    # print('>=12month:', period_count['extra_long'])

    # 刷新房产的房源排名
    # db.log.aggregate([{'$match':{'route':{'$regex': '/api/1/rent_ticket/[a-zA-Z0-9]{24}/edit'},'param_status':'to rent'}},{'$group':{'_id':'$route','count':{'$sum':1}}},{'$match':{'count':{'$gte':2}}},{'$sort':{'time':-1}}])

    # 用户登录次数统计
    # print('\n用户登录次数统计:')
    # cursor = m.log.aggregate(
    #     [
    #         {'$match': {'type': 'login'}},
    #         {'$group': {'_id': "$id", 'count': {'$sum': 1}}},
    #         {'$match': {'count': {'$gte': 2}}},
    #         {'$sort': {'count': -1}}
    #     ]
    # )
    # user_login_count_dic = {}
    # for document in cursor:
    #     if(document['_id']):
    #         user_login_count_dic[str(document['_id'])] = document['count']

    # user_login_count_dic = OrderedDict(sorted(user_login_count_dic.items(), key=lambda t: t[1], reverse=True))

    # target_users = f_app.user.output(user_login_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)

    # for user in target_users:
    #     print(user['nickname'].encode('utf-8') + ':' + str(user_login_count_dic[str(user['id'])]))

    # 统计多少房源没有填写地理位置
    # print('\n统计多少房源没有填写哪些信息:')
    # cursor = m.tickets.aggregate(
    #     [
    #         {'$match': {
    #             'type': 'rent',
    #             'status': 'to rent'}}  
    #     ]
    # )

    # target_tickets_id_list = []
    # for document in cursor:
    #     if(document['_id']):
    #         target_tickets_id_list.append(str(document['_id']))
    # target_tickets = f_app.i18n.process_i18n(f_app.ticket.output(target_tickets_id_list, ignore_nonexist=True, permission_check=False))
    # total_tickets_count = len(target_tickets)

    # tickets_count_without_location = []
    # tickets_count_without_report = []
    # tickets_count_insufficient_pic = []
    # tickets_count_without_address = []
    # tickets_count_without_des = []
    # tickets_count_without_indoor = []
    # tickets_count_without_outdoor = []
    # tickets_count_without_surroundings = []

    # for ticket in target_tickets:
    #     if ticket and 'property' in ticket and 'latitude' not in ticket['property']:
    #         tickets_count_without_location.append(ticket)
    #     if ticket and 'property' in ticket and 'report_id' not in ticket['property']:
    #         tickets_count_without_report.append(ticket)
    #     if ticket and 'property' in ticket and 'reality_images' in ticket['property'] and len(ticket['property']['reality_images']) <= 3:
    #         tickets_count_insufficient_pic.append(ticket)
    #     if ticket and 'property' in ticket and 'address' in ticket['property'] and not ticket['property']['address']:
    #         tickets_count_without_address.append(ticket)
    #     if ticket and 'property' in ticket and 'description' in ticket['property'] and not ticket['property']['description']:
    #         tickets_count_without_des.append(ticket)
    #     if ticket and 'property' in ticket and 'indoor_facility' in ticket['property'] and len(ticket['property']['indoor_facility']) < 1:
    #         tickets_count_without_indoor.append(ticket)
    #     if ticket and 'property' in ticket and 'community_facility' in ticket['property'] and len(ticket['property']['community_facility']) < 1:
    #         tickets_count_without_outdoor.append(ticket)
    #     if ticket and 'property' in ticket and 'featured_facility' in ticket['property'] and len(ticket['property']['featured_facility']) < 1:
    #         tickets_count_without_surroundings.append(ticket)
    # print('Total tickets: ' + str(total_tickets_count))
    # print('\nTotal tickets less than 3 pics: ' + str(len(tickets_count_insufficient_pic)))
    # print('\nTotal tickets without address: ' + str(len(tickets_count_without_address)))
    # print('\nTotal tickets without description: ' + str(len(tickets_count_without_des)))
    # print('\nTotal tickets without indoor_facility: ' + str(len(tickets_count_without_indoor)))
    # print('\nTotal tickets without community_facility: ' + str(len(tickets_count_without_outdoor)))
    # print('\nTotal tickets without surroundings: ' + str(len(tickets_count_without_surroundings)))
    # print('\nTotal tickets without location: ' + str(len(tickets_count_without_location)))
    # print('\nTotal tickets without report: ' + str(len(tickets_count_without_report)))

    # for ticket in tickets_count_without_both:
    #     if ticket is not None:
    #         print(ticket['title'].encode('utf-8') + ", http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/rent/" + str(ticket['id']))
    # print('\nTotal tickets without location: ' + str(len(tickets_count_without_location)))
    # for ticket in tickets_count_without_location:
    #     if ticket is not None:
    #         print(ticket['title'].encode('utf-8') + ", http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/rent/" + str(ticket['id']))
    # print('\nTotal tickets without report: ' + str(len(tickets_count_without_report)))
    # for ticket in tickets_count_without_report:
    #     if ticket is not None:
    #         print(ticket['title'].encode('utf-8') + ", http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/rent/" + str(ticket['id']))

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
    # user_login_count_dic = {}
    # for document in cursor:
    #     if(document['_id']):
    #         user_login_count_dic[str(document['_id'])] = document['count']

    # user_login_count_dic = OrderedDict(sorted(user_login_count_dic.items(), key=lambda t: t[1], reverse=True))

    # target_users = f_app.user.output(user_login_count_dic.keys(), custom_fields=f_app.common.user_custom_fields)

    # for user in target_users:
    #     if 'user_type' in user:
    #         print(user['nickname'].encode('utf-8') + ':' + " ".join(f_app.enum.get(x['id'])['value']['zh_Hans_CN'].encode('utf-8') for x in user['user_type']) + ', ' + str(user_login_count_dic[str(user['id'])]))
    #     else:
    #         print(user['nickname'].encode('utf-8') + ':' + str(user_login_count_dic[str(user['id'])]))

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
