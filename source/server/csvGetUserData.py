#coding:utf-8
from pymongo import MongoClient
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from collections import OrderedDict
from bson.objectid import ObjectId
import json

import csv

header = ['用户','邮箱','性别','国家','城市','用户类型','职业','房东类型','注册时间','有没有发房产','发布房产量','单间整套','已租出','确认已租出了','有没有草稿','有没有提交求租单','提交投资意向单','有没有收藏房产','备注']

def getAllEnumList(s):
	return f_app.i18n.process_i18n(f_app.enum.get_all(s))

def getData(u,s):
	if u == None :
		return ''
	v = u.get(s)
	if v == None :
		v = ''
	if s is 'register_time' :
		v = str(v)
	return v.encode("utf-8")

def getEnumData(u,s):
	if s is 'landlord_type' :
		return ''
	ttt = ''
	if u == None :
		return ''
	v = u.get(s)
	if isinstance(v,list) :
		for singleType in v :
			for compType in getAllEnumList(s) :
				if compType.get('id') == singleType.get('id') :
					ttt += compType.get('value')+' '
	return ttt.encode('utf-8')



with open('userData.csv', 'wb') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', 
                            quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(header)
    for user in f_app.user.get(f_app.user.get_active()):
        spamwriter.writerow([
        	getData(user,'nickname'),
        	getData(user,'email'),
        	'',
        	getData(user.get('country'),'code'),
        	'',
        	getEnumData(user,'user_type'),
        	'',
        	getData(user,'landlord_type'),
        	getData(user,'register_time')
        	])
