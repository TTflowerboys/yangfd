#!/usr/bin/env python2
# -*- coding: utf-8 -*-

from __future__ import unicode_literals, absolute_import
from app import f_app
import re
from pymongo import MongoClient


client = MongoClient(f_app.common.mongo_server, 27017)
db = client.currant
collection = db["log"]

cursors = collection.find({"route": {"$exists": True}})
for cursor in cursors:
    property_id = re.findall(r"^/property/([0-9a-fA-F]{24})", cursor["route"])
    if property_id:
        collection.update({"_id": cursor["_id"]}, {"property_id": property_id[0]})
