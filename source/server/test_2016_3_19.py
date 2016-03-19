# coding: utf-8
from __future__ import unicode_literals
from app import f_app
from bson.objectid import ObjectId
# from bson.code import Code
# from collections import OrderedDict

# import re
import json
from datetime import datetime, date
# from six.moves import urllib
from pyquery import PyQuery as q
from openpyxl import Workbook
from openpyxl import load_workbook
from openpyxl.styles import Font, Alignment
import random
import requests

f_app.common.memcache_server = ["172.20.101.98:11211"]
f_app.common.mongo_server = "172.20.101.98"


def get_own_house_viewed_time(ticket):
    date_from = datetime(2016, 2, 3)
    with f_app.mongo() as m:
        total = m.log.find({
            "type": "route",
            "route": {"$in": ['/wechat-poster/' + unicode(ticket['id']), "/property-to-rent/" + unicode(ticket['id'])]},
            "time": {
                "$gte": date_from
            }
        }).count()
    return int(total)


def get_request_ticket_total(ticket):
    date_from = datetime(2016, 2, 3)
    with f_app.mongo() as m:
        total = m.tickets.find({
            "type": "rent_intention",
            "interested_rent_tickets": ObjectId(ticket['id']),
            "time": {
                "$gte": date_from
            },
            "status": {
                "$in": [
                    "requested", "assigned", "in_progress", "rejected", "confirmed_video", "booked", "holding_deposit_paid", "checked_in"
                ]
            }
        }).count()
    return int(total)


# with f_app.mongo() as m:
#     cursor = m.tickets.aggregate(
#         [
#             {
#                 '$match': {
#                     "type": "rent_intention",
#                     "status": {"$ne": "draft"}
#                 }
#             },
#             {
#                 '$group': {
#                     "_id": '$status'
#                 }
#             }
#         ]
#     )
# for single in cursor:
#     print f_app.util.json_dumps(single, indent=2)

tickets_id = []
with f_app.mongo() as m:
    cursor = m.tickets.aggregate(
        [
            {
                '$match': {
                    "type": "rent",
                    "status": {"$ne": "draft"}
                }
            },
            {
                '$group': {
                    "_id": '$_id'
                }
            }
        ]
    )
    for single in cursor:
        tickets_id.append(ObjectId(single['_id']))
# with f_app.mongo() as m:
#     tickets = m.tickets.find({
        # "type": "rent",
        # "status": {"$ne": "draft"}
#     })

# tickets_id = f_app.ticket.search({
#     "type": "rent",
#     "status": {"$ne": "draft"},
# }, per_page=-1)
doogal_station_list = {
    'view_times': {},
    'request_times': {},
    'rent_intention_times': {},
    'ticket_total': {}
}
hesa_university_list = {
    'view_times': {},
    'request_times': {},
    'rent_intention_times': {},
    'ticket_total': {}
}
maponics_neighborhood_list = {
    'view_times': {},
    'request_times': {},
    'rent_intention_times': {},
    'ticket_total': {}
}
city_list = {
    'view_times': {},
    'request_times': {},
    'rent_intention_times': {},
    'ticket_total': {}
}

# tickets_id = [ObjectId("569e757abd77320c14654121")]
print len(tickets_id)
for index, rent_ticket_id in enumerate(tickets_id):
    print index
    if rent_ticket_id is not None:
        try:
            with f_app.mongo() as m:
                rent_ticket = m.tickets.find_one({'_id': rent_ticket_id})
                rent_ticket['id'] = ObjectId(rent_ticket.pop('_id'))
        except:
            continue
    else:
        continue
    if rent_ticket is None:
        continue
    if 'property_id' in rent_ticket:
        try:
            with f_app.mongo() as m:
                this_property = m.propertys.find_one({'_id': rent_ticket['property_id']})
                this_property['id'] = ObjectId(this_property.pop('_id'))
            # this_property = f_app.property.get(rent_ticket['property_id'])
        except:
            print "property get fail"
            continue
        if this_property is None:
            continue
    else:
        continue

    doogal_station_id = None
    hesa_university_id = None
    maponics_neighborhood_id = None
    city_id = None

    if 'featured_facility' in this_property:
        doogal_station_id = []
        hesa_university_id = []
        for single_facility in this_property['featured_facility']:
            if "doogal_station" in single_facility:
                doogal_station_id.append(single_facility['doogal_station'])
            elif "hesa_university" in single_facility:
                hesa_university_id.append(single_facility['hesa_university'])

    if 'maponics_neighborhood' in this_property:
        if '_id' in this_property['maponics_neighborhood']:
            maponics_neighborhood_id = this_property['maponics_neighborhood']['_id']

    if 'city' in this_property:
        if '_id' in this_property['city']:
            city_id = this_property['city']['_id']

    view_times = get_own_house_viewed_time(rent_ticket)
    request_times = get_request_ticket_total(rent_ticket)
    # rent_intention_times = get_rent_intention_total(rent_ticket)

    if doogal_station_id is not None:
        for single_doogal_station in doogal_station_id:
            doogal_station_list['ticket_total'].update({single_doogal_station: doogal_station_list['ticket_total'].get(single_doogal_station, 0) + 1})
    if hesa_university_id is not None:
        for single_university in hesa_university_id:
            hesa_university_list['ticket_total'].update({single_university: hesa_university_list['ticket_total'].get(single_university, 0) + 1})
    maponics_neighborhood_list['ticket_total'].update({maponics_neighborhood_id: maponics_neighborhood_list['ticket_total'].get(maponics_neighborhood_id, 0) + 1})
    city_list['ticket_total'].update({city_id: city_list['ticket_total'].get(city_id, 0) + 1})

    if view_times:
        if doogal_station_id is not None:
            for single_doogal_station in doogal_station_id:
                doogal_station_list['view_times'].update({single_doogal_station: doogal_station_list['view_times'].get(single_doogal_station, 0) + 1 * view_times})
        if hesa_university_id is not None:
            for single_university in hesa_university_id:
                hesa_university_list['view_times'].update({single_university: hesa_university_list['view_times'].get(single_university, 0) + 1 * view_times})
        if maponics_neighborhood_id is not None:
            maponics_neighborhood_list['view_times'].update({maponics_neighborhood_id: maponics_neighborhood_list['view_times'].get(maponics_neighborhood_id, 0) + 1 * view_times})
        if city_id is not None:
            city_list['view_times'].update({city_id: city_list['view_times'].get(city_id, 0) + 1 * view_times})

    if request_times:
        if doogal_station_id is not None:
            for single_doogal_station in doogal_station_id:
                doogal_station_list['request_times'].update({single_doogal_station: doogal_station_list['request_times'].get(single_doogal_station, 0) + 1 * request_times})
        if hesa_university_id is not None:
            for single_university in hesa_university_id:
                hesa_university_list['request_times'].update({single_university: hesa_university_list['request_times'].get(single_university, 0) + 1 * request_times})
        if maponics_neighborhood_id is not None:
            maponics_neighborhood_list['request_times'].update({maponics_neighborhood_id: maponics_neighborhood_list['request_times'].get(maponics_neighborhood_id, 0) + 1 * request_times})
        if city_id is not None:
            city_list['request_times'].update({city_id: city_list['request_times'].get(city_id, 0) + 1 * request_times})

    # if index >= 5:
    #     break


# print json.dumps(doogal_station_list, indent=2)


print "doogal_station:"
print "=" * 95
print "%54s%8s%8s%8s" % ("名", "查看", "咨询", "房源")
sort_temp = [doogal_station_list['view_times'][single] for single in doogal_station_list['view_times']]
sort_temp.sort(reverse=True)
for value in sort_temp:
    for single in doogal_station_list['view_times']:
        if doogal_station_list['view_times'][single] == value:
            try:
                station = f_app.doogal.station.get(single)
            except:
                station = {}
            # print unicode(station.get('name', '')) + "\t" + unicode(value) + "\t" + unicode(doogal_station_list['ticket_total'][single])
            print "%55s%10s%10s%10s" % (unicode(station.get('name', '')), unicode(value), unicode(doogal_station_list['request_times'].get(single, 0)), unicode(doogal_station_list['ticket_total'].get(single, 0)))
            doogal_station_list['view_times'].pop(single)
            break

print "\nhesa_university:"
print "=" * 95
print "%54s%8s%8s%8s" % ("名", "查看", "咨询", "房源")
sort_temp = [hesa_university_list['view_times'][single] for single in hesa_university_list['view_times']]
sort_temp.sort(reverse=True)
for value in sort_temp:
    for single in hesa_university_list['view_times']:
        if hesa_university_list['view_times'][single] == value:
            try:
                university = f_app.hesa.university.get(single)
            except:
                university = {}
            # print unicode(university.get('name', '')) + "\t" + unicode(value) + "\t" + unicode(hesa_university_list['ticket_total'][single])
            print "%55s%10s%10s%10s" % (unicode(university.get('name', '')), unicode(value), unicode(hesa_university_list['request_times'].get(single, 0)), unicode(hesa_university_list['ticket_total'].get(single, 0)))
            hesa_university_list['view_times'].pop(single)
            break

print "\nmaponics_neighborhood:"
print "=" * 95
print "%54s%8s%8s%8s" % ("名", "查看", "咨询", "房源")
sort_temp = [maponics_neighborhood_list['view_times'][single] for single in maponics_neighborhood_list['view_times']]
sort_temp.sort(reverse=True)
for value in sort_temp:
    for single in maponics_neighborhood_list['view_times']:
        if maponics_neighborhood_list['view_times'][single] == value:
            try:
                neighborhood = f_app.maponics.neighborhood.get(single)
            except:
                neighborhood = {}
            # print unicode(neighborhood.get('name', '')) + "\t" + unicode(value) + "\t" + unicode(maponics_neighborhood_list['ticket_total'][single])
            print "%55s%10s%10s%10s%10s" % (unicode(neighborhood.get('name', '')), unicode(value), unicode(maponics_neighborhood_list['request_times'].get(single, 0)), unicode(maponics_neighborhood_list['ticket_total'].get(single, 0)))
            maponics_neighborhood_list['view_times'].pop(single)
            break

print "\ncity:"
print "=" * 95
print "%54s%8s%8s%8s" % ("名", "查看", "咨询", "房源")
sort_temp = [city_list['view_times'][single] for single in city_list['view_times']]
sort_temp.sort(reverse=True)
for value in sort_temp:
    for single in city_list['view_times']:
        if city_list['view_times'][single] == value:
            try:
                city = f_app.geonames.gazetteer.get(single)
            except:
                city = {}
            # print unicode(city.get('name', '')) + "\t" + unicode(value) + "\t" + unicode(city_list['ticket_total'][single])
            print "%55s%10s%10s%10s%10s" % (unicode(city.get('name', '')), unicode(value), unicode(city_list['request_times'].get(single, 0)), unicode(city_list['ticket_total'].get(single, 0)))
            city_list['view_times'].pop(single)
            break


def get_rent_intention_total_with_maponics_neighborhood_and_city():
    maponics_neighborhood_list = {
        'view_times': {},
        'request_times': {},
        'rent_intention_times': {},
        'ticket_total': {}
    }
    city_list = {
        'view_times': {},
        'request_times': {},
        'rent_intention_times': {},
        'ticket_total': {}
    }

    tickets_id = []

    date_from = datetime(2016, 2, 3)

    with f_app.mongo() as m:
        cursor = m.tickets.aggregate(
            [
                {
                    '$match': {
                        "type": "rent_intention",
                        "status": "new",
                        "time": {
                            "$gte": date_from
                        },
                    }
                },
                {
                    '$group': {
                        "_id": '$_id'
                    }
                }
            ]
        )
        for single in cursor:
            tickets_id.append(ObjectId(single['_id']))
    print len(tickets_id)
    for index, rent_intention_ticket_id in enumerate(tickets_id):
        print index
        if rent_intention_ticket_id is not None:
            try:
                with f_app.mongo() as m:
                    rent_intention_ticket = m.tickets.find_one({'_id': rent_intention_ticket_id})
                    rent_intention_ticket['id'] = ObjectId(rent_intention_ticket.pop('_id'))
            except:
                continue
        else:
            continue
        if rent_intention_ticket is None:
            continue
        if 'maponics_neighborhood' in rent_intention_ticket:
            maponics_neighborhood_id = rent_intention_ticket['maponics_neighborhood']['_id']
            maponics_neighborhood_list['rent_intention_times'].update({maponics_neighborhood_id: maponics_neighborhood_list['rent_intention_times'].get(maponics_neighborhood_id, 0) + 1})
        else:
            print "no neighborhood"
        if 'city' in rent_intention_ticket:
            city_id = rent_intention_ticket['city']['_id']
            city_list['rent_intention_times'].update({city_id: city_list['rent_intention_times'].get(city_id, 0) + 1})
        else:
            print "no city"
        # if index >= 30:
        #     break

    print "\nmaponics_neighborhood:"
    print "=" * 95
    print "%54s%8s" % ("名", "求租")
    sort_temp = [maponics_neighborhood_list['rent_intention_times'][single] for single in maponics_neighborhood_list['rent_intention_times']]
    sort_temp.sort(reverse=True)
    for value in sort_temp:
        for single in maponics_neighborhood_list['rent_intention_times']:
            if maponics_neighborhood_list['rent_intention_times'][single] == value:
                try:
                    neighborhood = f_app.maponics.neighborhood.get(single)
                except:
                    neighborhood = {}
                # print unicode(neighborhood.get('name', '')) + "\t" + unicode(value) + "\t" + unicode(maponics_neighborhood_list['ticket_total'][single])
                print "%55s%10s" % (unicode(neighborhood.get('name', '')), unicode(maponics_neighborhood_list['rent_intention_times'].get(single, 0)))
                maponics_neighborhood_list['rent_intention_times'].pop(single)
                break

    print "\ncity:"
    print "=" * 95
    print "%54s%8s" % ("名", "求租")
    sort_temp = [city_list['rent_intention_times'][single] for single in city_list['rent_intention_times']]
    sort_temp.sort(reverse=True)
    for value in sort_temp:
        for single in city_list['rent_intention_times']:
            if city_list['rent_intention_times'][single] == value:
                try:
                    city = f_app.geonames.gazetteer.get(single)
                except:
                    city = {}
                # print unicode(city.get('name', '')) + "\t" + unicode(value) + "\t" + unicode(city_list['ticket_total'][single])
                print "%54s%8s" % (unicode(city.get('name', '')), unicode(city_list['rent_intention_times'].get(single, 0)))
                city_list['rent_intention_times'].pop(single)
                break

# get_rent_intention_total_with_maponics_neighborhood_and_city()
