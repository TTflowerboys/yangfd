#coding:utf-8
from pymongo import MongoClient
#from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict
from bson.objectid import ObjectId
#import json

import csv

header = ['用户', '邮箱', '性别', '国家', '城市', '用户类型', '职业', '房东类型', '注册时间', '有没有发房产',
          '发布房产量', '单间整套', '已租出', '确认已租出了', '有没有草稿', '有没有提交求租单', '提交投资意向单',
          '有没有收藏房产', '备注']


def get_all_enum_list(s):
    return f_app.i18n.process_i18n(f_app.enum.get_all(s))


def get_data(u, s):
    if u is None:
        return ''
    v = u.get(s)
    if v is None:
        v = ''
    if s is 'register_time':
        v = str(v)
    return v.encode("utf-8")


def get_enum_data(u, s):
    if s is 'landlord_type':
        return ''
    t = ''
    if u is None:
        return ''
    v = u.get(s)
    if isinstance(v, list):
        for single_type in v:
            for comp_type in get_all_enum_list(s):
                if comp_type.get('id') == single_type.get('id'):
                    t += comp_type.get('value')+' '
    return t.encode('utf-8')


with open('userData.csv', 'wb') as csvfile:
    spamwriter = csv.writer(csvfile,
                            delimiter=',',
                            quotechar='|',
                            quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(header)
    for user in f_app.user.get(f_app.user.get_active()):
        spamwriter.writerow([
            get_data(user, 'nickname'),
            get_data(user, 'email'),
            '',
            get_data(user.get('country'), 'code'),
            '',
            get_enum_data(user, 'user_type'),
            '',
            get_data(user, 'landlord_type'),
            get_data(user, 'register_time')
            ])
