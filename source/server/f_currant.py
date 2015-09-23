# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime, timedelta
import random
import re
import json
import csv
import logging
import time
from collections import defaultdict
from itertools import chain
import phonenumbers
import numpy as np
from bson.objectid import ObjectId
from bson.code import Code
from pymongo import ASCENDING, DESCENDING, GEO2D
import six
from six.moves import cStringIO as StringIO
from six.moves import urllib
from pyquery import PyQuery as q
from PIL import ImageOps
from scipy.misc import imread
from bson import SON
from libfelix.f_common import f_app
from libfelix.f_user import f_user
from libfelix.f_ticket import f_ticket
from libfelix.f_log import f_log
from libfelix.f_message import f_message
from libfelix.f_interface import abort, request, template
from libfelix.f_cache import f_cache
from libfelix.f_util import f_util
from libfelix.f_shop import f_shop
from libfelix.f_shop.f_recurring_bm import f_recurring_billing_model
from libfelix.f_order import f_order
from libfelix.f_mongo import f_mongo_upgrade

# Fix crash in environments that have no display.
import matplotlib
matplotlib.use('Agg')
import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
from matplotlib.dates import DateFormatter

fontprop = fm.FontProperties(fname="data/wqy-microhei.ttc")

logger = logging.getLogger(__name__)
f_app.dependency_register('pyquery', race="python")
f_app.dependency_register('matplotlib', race="python")
f_app.dependency_register('scipy', race="python")


class currant_mongo_upgrade(f_mongo_upgrade):
    def v1(self, m):
        self.logger.debug("Test for DB upgrade 1, nothing changed.")

    def v2(self, m):
        self.logger.debug("Test for DB upgrade 2, nothing changed.")

    def v3(self, m):
        self.logger.debug("Test for DB upgrade 3, nothing changed.")

    def v4(self, m):
        self.logger.debug("Test for DB upgrade 4, nothing changed.")

    def v5(self, m):
        self.logger.debug("Now this is a SLOW upgrade")
        time.sleep(10)
        self.logger.debug("Test for DB upgrade 5, nothing changed.")

    def v6(self, m):
        self.logger.debug("Migrating property.zipcode_index => report_id")
        property_db = f_app.property.get_database(m)
        report_db = f_app.report.get_database(m)
        report_zipcode_index_map = {}
        for property in property_db.find({"zipcode_index": {"$exists": True}}):
            if property["zipcode_index"] not in report_zipcode_index_map:
                report = report_db.find_one({"zipcode_index": property["zipcode_index"]})
                if report is None:
                    self.logger.warning("report not found for zipcode_index", property["zipcode_index"], "while processing property", str(property["_id"]), exc_info=False)
                    report_zipcode_index_map[property["zipcode_index"]] = None
                else:
                    report_zipcode_index_map[property["zipcode_index"]] = report["_id"]

            if report_zipcode_index_map[property["zipcode_index"]]:
                self.logger.debug("updating report_id", str(report_zipcode_index_map[property["zipcode_index"]]), "for property", str(property["_id"]))
                property_db.update({"_id": property["_id"]}, {"$set": {"report_id": report_zipcode_index_map[property["zipcode_index"]]}, "$unset": {"zipcode_index": ""}})

        self.logger.debug("Migrating item.zipcode_index => report_id")
        item_db = f_app.shop.item.get_database(m)
        for item in item_db.find({"zipcode_index": {"$exists": True}}):
            if item["zipcode_index"] not in report_zipcode_index_map:
                report = report_db.find_one({"zipcode_index": item["zipcode_index"]})
                if report is None:
                    self.logger.warning("report not found for zipcode_index", item["zipcode_index"], "while processing item", str(item["_id"]), exc_info=False)
                    report_zipcode_index_map[item["zipcode_index"]] = None
                else:
                    report_zipcode_index_map[item["zipcode_index"]] = report["_id"]

            if report_zipcode_index_map[item["zipcode_index"]]:
                self.logger.debug("updating report_id", str(report_zipcode_index_map[item["zipcode_index"]]), "for item", str(item["_id"]))
                item_db.update({"_id": item["_id"]}, {"$set": {"report_id": report_zipcode_index_map[property["zipcode_index"]]}, "$unset": {"zipcode_index": ""}})

    def v7(self, m):
        all_country = f_app.util.process_objectid(list(f_app.enum.get_database(m).find({
            "type": "country",
        })))
        country_dict = {country["id"]: country for country in all_country}

        def migrate_country(db):
            for item in db.find({"country": {"$ne": None}}, {"country": 1}):
                if item["country"] and "_country" not in item["country"] and "_id" in item["country"]:
                    if str(item["country"]["_id"]) in country_dict:
                        self.logger.debug("updating country", country_dict[str(item["country"]["_id"])]["slug"], "for item", str(item["_id"]))
                        db.update({"_id": item["_id"]}, {"$set": {"country": {"_country": True, "code": country_dict[str(item["country"]["_id"])]["slug"]}}})
                    else:
                        self.logger.warning("unknown country enum:", str(item["country"]["_id"]))

        self.logger.debug("Migrating property.country")
        migrate_country(f_app.property.get_database(m))
        self.logger.debug("Migrating enum.country")
        migrate_country(f_app.enum.get_database(m))
        self.logger.debug("Migrating blog.post.country")
        migrate_country(f_app.blog.post.get_database(m))
        self.logger.debug("Migrating report.country")
        migrate_country(f_app.report.get_database(m))
        self.logger.debug("Migrating shop.item.country")
        migrate_country(f_app.shop.item.get_database(m))
        self.logger.debug("Migrating ticket.country")
        migrate_country(f_app.ticket.get_database(m))
        self.logger.debug("Migrating user.country")
        migrate_country(f_app.user.get_database(m))

        all_city = f_app.util.process_objectid(list(f_app.enum.get_database(m).find({
            "type": "city",
        })))
        city_dict = {city["id"]: city for city in all_city}
        city_map = {
            "武汉": "1791247",
            "伦敦": "2643743",
            "伯明翰": "2655603",
            "布里斯托尔": "2654675",
            "利物浦": "2644210",
            "曼彻斯特": "2643123",
            "切斯特": "2653228",
            "泰恩河畔纽卡斯尔": "2641673",
            "利兹": "2644688",
            "谢菲尔德": "2638077",
            "北京": "1816670",
            "纽卡斯尔": "2641673",
            "好莱坞": "5368361",
            "迈阿密": "4164138",
            "佛罗里达": "4164138",
            "米德尔塞克斯": "2643743",
            "格拉斯哥": "2648579",
            "肯特": "2643179",
            "西萨塞克斯": "2653192",
            "旺角": "1819609",
            "九龙": "1819609",
        }

        for city in city_map:
            _city = f_app.geonames.gazetteer.get_database(m).find_one({"geoname_id": city_map[city]})
            if _city is None:
                self.logger.error("city", city, "was not imported into gazetteer db, aborting migration")
            self.logger.debug("gazetteer", _city["_id"], "found for city", city)
            city_map[city] = _city["_id"]

        def migrate_city(db):
            for item in db.find({"city": {"$ne": None}}, {"city": 1}):
                if item["city"] and "_geonames_gazetteer" not in item["city"] and "_id" in item["city"]:
                    if str(item["city"]["_id"]) in city_dict:
                        try:
                            city_id = city_map[city_dict[str(item["city"]["_id"])]["value"]["zh_Hans_CN"]]
                        except:
                            self.logger.warning("failed to fetch city_id for", str(item["_id"]), "maybe a corrupted enum?")
                        else:
                            self.logger.debug("updating city", city_id, "for item", str(item["_id"]))
                            db.update({"_id": item["_id"]}, {"$set": {"city": {"_geonames_gazetteer": "city", "_id": ObjectId(city_id)}}})
                    else:
                        self.logger.warning("unknown city enum:", str(item["city"]["_id"]), "for item", str(item["_id"]), exc_info=False)

        self.logger.debug("Migrating property.city")
        migrate_city(f_app.property.get_database(m))
        self.logger.debug("Migrating blog.post.city")
        migrate_city(f_app.blog.post.get_database(m))
        self.logger.debug("Migrating shop.item.city")
        migrate_city(f_app.shop.item.get_database(m))
        self.logger.debug("Migrating ticket.city")
        migrate_city(f_app.ticket.get_database(m))
        self.logger.debug("Migrating user.city")
        migrate_city(f_app.user.get_database(m))

    def v8(self, m):
        for user in f_app.user.get_database(m).find({"register_time": {"$ne": None}, "status": {"$ne": "deleted"}}):
            f_app.user.get_database(m).update({"_id": user["_id"]}, {"$push": {"role": "beta_renting"}})

    def v9(self, m):
        all_rent_period = f_app.util.process_objectid(list(f_app.enum.get_database(m).find({
            "type": "rent_period",
        })))
        rent_period_dict = {rent_period["id"]: rent_period for rent_period in all_rent_period}

        default_minimum_rent_period = dict(
            unit="week",
            value="1",
            value_float=1.0,
            type="time_period",
            _i18n_unit=True,
        )

        ticket_database = f_app.ticket.get_database(m)
        for ticket in ticket_database.find({"rent_available_time": {"$exists": True}}):
            if "rent_period" in ticket:
                if not isinstance(ticket["rent_period"], dict):
                    self.logger.warning("invalid rent_period:", ticket["rent_period"], "for ticket", str(ticket["_id"]), exc_info=False)
                elif str(ticket["rent_period"]["_id"]) in rent_period_dict:
                    rent_period = rent_period_dict[str(ticket["rent_period"]["_id"])]["slug"].split(":")[-1]
                    rent_deadline_time = f_app.shop.recurring.generate_next_billing_time(period=rent_period, start=ticket["rent_available_time"])
                    self.logger.debug("updating rent_deadline_time", rent_deadline_time, "for ticket", str(ticket["_id"]))
                    ticket_database.update({"_id": ticket["_id"]}, {"$set": {"rent_deadline_time": rent_deadline_time}, "$unset": {"rent_period": True}})

                else:
                    self.logger.warning("unknown rent_period enum:", str(ticket["city"]["_id"]), "for ticket", str(ticket["_id"]), exc_info=False)

            self.logger.debug("setting default minimum_rent_period for ticket", str(ticket["_id"]))
            ticket_database.update({"_id": ticket["_id"]}, {"$set": {"minimum_rent_period": default_minimum_rent_period}})

    def v10(self, m):
        for user in f_app.user.get_database(m).find({"register_time": {"$ne": None}, "status": {"$ne": "deleted"}}):
            if "email_message_type" not in user:
                f_app.user.get_database(m).update({"_id": user["_id"]}, {"$set": {"email_message_type": ["system", "favorited_property_news", "intention_property_news", "my_property_news", "rent_ticket_reminder"]}})
            elif "rent_ticket_reminder" not in user["email_message_type"]:
                self.logger.debug("Appending rent_ticket_reminder email message type for user", str(user["_id"]))
                f_app.user.get_database(m).update({"_id": user["_id"]}, {"$push": {"email_message_type": "rent_ticket_reminder"}})

            if "system_message_type" not in user:
                f_app.user.get_database(m).update({"_id": user["_id"]}, {"$set": {"system_message_type": ["system", "favorited_property_news", "intention_property_news", "my_property_news"]}})

        for ticket in f_app.ticket.get_database(m).find({"type": "rent", "status": {"$in": ["draft", "to rent"]}}):
            added = f_app.task.get_database(m).find_one({"type": "rent_ticket_reminder", "ticket_id": str(ticket["_id"]), "status": "new"})
            if not added:
                self.logger.debug("Adding reminder for rent ticket", str(ticket["_id"]))
                f_app.task.get_database(m).insert(dict(
                    type="rent_ticket_reminder",
                    start=datetime.utcnow() + timedelta(days=7),
                    ticket_id=str(ticket["_id"]),
                    status="new",
                ))

    def v11(self, m):
        for user in f_app.user.get_database(m).find({"register_time": {"$ne": None}, "status": {"$ne": "deleted"}}):
            self.logger.debug("Reinitializing email/system message type for user", str(user["_id"]))
            f_app.user.get_database(m).update({"_id": user["_id"]}, {"$set": {
                "email_message_type": ["rent_ticket_reminder"],
                "system_message_type": ["system"],
            }})

    def v12(self, m):
        credit = {
            "type": "view_rent_ticket_contact_info",
            "amount": 1,
            "expire_time": datetime.utcnow() + timedelta(days=30),
            "valid_since": datetime.utcnow(),
            "tag": "initial",
            "status": "new",
        }
        for user in f_app.user.get_database(m).find({"register_time": {"$ne": None}, "status": {"$ne": "deleted"}}):
            f_app.user.credit.get_database(m).update({"type": "view_rent_ticket_contact_info", "user_id": user["_id"]}, {"$set": dict(user_id=user["_id"], **credit)}, upsert=True)

    def v13(self, m):
        virtual_shop = {
            "admin_user": [],
            "_id": ObjectId(f_app.common.virtual_shop_id),
            "name": "virtual_shop",
            "status": "new",
            "time": datetime.utcnow()
        }
        f_app.shop.get_database(m).update({"_id": virtual_shop["_id"]}, {"$set": virtual_shop}, upsert=True)

        view_rent_ticket_contact_info_item = {
            "status": "new",
            "_id": ObjectId(f_app.common.view_rent_ticket_contact_info_id),
            "shop_id": ObjectId(f_app.common.virtual_shop_id),
            "type": "normal",
            "quantity": True,
            "price_credits": [{"type": "view_rent_ticket_contact_info", "amount": 1}],
            "price": 100,
            "status": "new",
            "time": datetime.utcnow()
        }
        f_app.shop.item.get_database(m).update({"_id": view_rent_ticket_contact_info_item["_id"]}, {"$set": view_rent_ticket_contact_info_item}, upsert=True)

    def v14(self, m):
        for user in f_app.user.get_database(m).find({"register_time": {"$ne": None}, "status": {"$ne": "deleted"}, "private_contact_methods": {"$exists": False}}):
            self.logger.debug("Setting default private_contact_methods for user", str(user["_id"]))
            f_app.user.get_database(m).update({"_id": user["_id"]}, {"$set": {"private_contact_methods": []}})

    def v15(self, m):
        all_deposit_type = f_app.util.process_objectid(list(f_app.enum.get_database(m).find({
            "type": "deposit_type",
        })))
        deposit_type_dict = {deposit_type["id"]: deposit_type for deposit_type in all_deposit_type}

        ticket_database = f_app.ticket.get_database(m)
        for ticket in ticket_database.find({"type": "rent", "deposit_type": {"$exists": True}}):
            if str(ticket["deposit_type"]["_id"]) in deposit_type_dict:
                deposit_type = deposit_type_dict[str(ticket["deposit_type"]["_id"])]
                if "price" not in ticket:
                    continue
                if deposit_type["value"]["zh_Hans_CN"] == "押一付三":
                    ticket["price"]["value_float"] *= 4
                    ticket["price"]["value"] = str(ticket["price"]["value_float"])
                    self.logger.debug("Migrating ticket", str(ticket["_id"]), "to new deposit param")
                    ticket_database.update({"_id": ticket["_id"]}, {"$set": {"deposit": ticket["price"]}})
                elif deposit_type["value"]["zh_Hans_CN"] in ("押三付三", "押三付一"):
                    ticket["price"]["value_float"] *= 4 * 3
                    ticket["price"]["value"] = str(ticket["price"]["value_float"])
                    self.logger.debug("Migrating ticket", str(ticket["_id"]), "to new deposit param")
                    ticket_database.update({"_id": ticket["_id"]}, {"$set": {"deposit": ticket["price"]}})

            else:
                self.logger.warning("Invalid deposit_type enum", str(ticket["deposit_type"]["_id"]), "found in ticket", str(ticket["_id"]))

            ticket_database.update({"_id": ticket["_id"]}, {"$unset": {"deposit_type": True}})

    def v16(self, m):
        feedback_database = f_app.feedback.get_database(m)
        for feedback in feedback_database.find({"tag": {"$exists": False}}):
            self.logger.debug("Setting default tag for feedback", str(feedback["_id"]))
            feedback_database.update({"_id": feedback["_id"]}, {"$set": {"tag": ["invitation"]}})

    def v17(self, m):
        ticket_database = f_app.ticket.get_database(m)
        for ticket in ticket_database.find({"type": "rent", "deposit": {"$exists": True}}):
            if "price" not in ticket:
                continue
            times = ticket["deposit"]["value"].count(".")
            if times > 1:
                # Affected deposit
                self.logger.debug("Fixing deposit for ticket", str(ticket["_id"]))
                ticket["price"]["value_float"] *= times
                ticket["price"]["value"] = str(ticket["price"]["value_float"])
                ticket_database.update({"_id": ticket["_id"]}, {"$set": {"deposit": ticket["price"]}})

    def v18(self, m):
        f_app.enum.get_database(m).ensure_index([("type", ASCENDING), ("sort_value", ASCENDING)])

    def v19(self, m):
        for user in f_app.user.get_database(m).find({"register_time": {"$ne": None}, "status": {"$ne": "deleted"}}):
            if "rent_intention_ticket_check_rent" not in user.get("email_message_type", []):
                self.logger.debug("Appending rent_intention_ticket_check_rent email message type for user", str(user["_id"]))
                f_app.user.get_database(m).update({"_id": user["_id"]}, {"$push": {"email_message_type": "rent_intention_ticket_check_rent"}})

    def v20(self, m):
        f_app.task.get_database(m).update({"type": "rent_ticket_reminder", "status": {"$ne": "completed"}}, {"$set": {"status": "canceled"}}, multi=True)
        f_app.task.get_database(m).insert({
            "type": "rent_ticket_reminder",
            "status": "new",
            "start": datetime.utcnow(),
        })

    def v21(self, m):
        virtual_shop = {
            "admin_user": [],
            "_id": ObjectId(f_app.common.virtual_shop_id),
            "name": "virtual_shop",
            "status": "new",
            "time": datetime.utcnow(),
            "type": "virtual",
        }
        f_app.shop.get_database(m).update({"_id": virtual_shop["_id"]}, {"$set": virtual_shop}, upsert=True)

    def v22(self, m):
        view_rent_ticket_contact_info_item = {
            "status": "new",
            "_id": ObjectId(f_app.common.view_rent_ticket_contact_info_id),
            "shop_id": ObjectId(f_app.common.virtual_shop_id),
            "type": "normal",
            "tag": "virtual",
            "quantity": True,
            "price_credits": [{"type": "view_rent_ticket_contact_info", "amount": 1}],
            "price": 100,
            "status": "new",
            "time": datetime.utcnow()
        }
        f_app.shop.item.get_database(m).update({"_id": view_rent_ticket_contact_info_item["_id"]}, {"$set": view_rent_ticket_contact_info_item}, upsert=True)

        f_app.shop.get_database(m).update({"type": {"$exists": False}}, {"$set": {"type": "coupon"}}, multi=True)
        f_app.shop.item.get_database(m).update({"tag": {"$exists": False}}, {"$set": {"tag": "coupon"}}, multi=True)

    def v23(self, m):
        for user in f_app.user.get_database(m).find({"status": {"$ne": "deleted"}}):
            self.logger.debug("Resetting message types for user", str(user["_id"]))
            f_app.user.get_database(m).update({"_id": user["_id"]}, {"$set": {
                "email_message_type": f_app.common.email_message_type,
                "system_message_type": f_app.common.message_type,
            }})

currant_mongo_upgrade()


class f_currant_message(f_message):
    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        message_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return message_id_list

f_currant_message()


class f_currant_log(f_log):
    """
        ==================================================================
        Log
        ==================================================================
    """
    @f_cache("log")
    def get(self, log_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(log):
            log.pop("cookie", None)
            return f_app.util.process_objectid(log)

        if isinstance(log_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(log_id) for log_id in log_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(log_id_or_list) and not ignore_nonexist:
                found_list = map(lambda log: str(log["_id"]), result_list)
                abort(40400, logger.warning("Non-exist log:", filter(lambda log_id: log_id not in found_list, log_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist log:", filter(lambda log_id: log_id not in found_list, log_id_or_list), exc_info=False)

            for log in result_list:
                result[log["id"]] = _format_each(log)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(log_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist log:", log_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist log:", log_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def output(self, log_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        logs = self.get(log_id_list, ignore_nonexist=ignore_nonexist, force_reload=force_reload)
        property_id_set = set()
        for log in logs:
            if log.get("property_id"):
                property_id_set.add(log["property_id"])

        property_dict = f_app.property.output(list(property_id_set), multi_return=dict, ignore_nonexist=True)

        for log in logs:
            if log.get("property_id"):
                log["property"] = property_dict.get(log.pop("property_id"))

        if multi_return == list:
            return logs

        else:
            return dict(zip(log_id_list, logs))

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        log_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return log_id_list

f_currant_log()


class f_currant_user(f_user):
    """
        ==================================================================
        User
        ==================================================================
    """
    nested_attr = ("_hash", "admin", "email", "sms", "vip", "credit", "referral", "tag", "career", "education", "login", "invitation", "favorite")

    favorite_database = "favorites"

    def custom_search(self, params, count=False, notime=False, per_page=10, sort=['register_time', 'desc']):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort, exc_info=False))
            result = f_app.mongo_index.search(
                f_app.user.get_database,
                params,
                count=count,
                notime=notime,
                per_page=per_page,
                sort=ASCENDING if sort_orientation.startswith("asc") else DESCENDING,
                sort_field=sort_field,
                time_field="register_time"
            )
        else:
            result = f_app.mongo_index.search(
                f_app.user.get_database,
                params,
                count=count,
                notime=notime,
                per_page=per_page,
                time_field="register_time",
                sort_field="register_time",
            )

        user_id_list = result["content"]

        return user_id_list

    def counter_update(self, user_id, counter_name="all"):
        if counter_name == "all":
            intention_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "intention"}, per_page=0)
            support_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "support"}, per_page=0)
            self.update_set(user_id, {"counter.intention": len(intention_tickets), "counter.support": len(support_tickets)})

        elif counter_name == "intention":
            intention_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "intention"}, per_page=0)
            self.update_set(user_id, {"counter.intention": len(intention_tickets)})
        elif counter_name == "support":
            support_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "support"}, per_page=0)
            self.update_set(user_id, {"counter.support": len(support_tickets)})

        return f_app.user.get(user_id)

    def check_set_role_permission(self, user_id, target_role):
        user_roles = f_app.user.get_role(user_id)
        if "admin" in user_roles:
            return True
        elif "jr_admin" in user_roles:
            if target_role == "admin":
                return False
            else:
                return True
        elif any((
            target_role in ("sales", "jr_sales") and "sales" in user_roles,
            target_role in ("operation", "jr_operation") and "operation" in user_roles,
            target_role in ("support", "jr_support") and "support" in user_roles,
        )):
            return True
        else:
            return False

    """
        ==================================================================
        Favorite
        ==================================================================
    """
    def favorite_get_database(self, m):
        return getattr(m, self.favorite_database)

    @f_cache("favorite")
    def favorite_get(self, favorite_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(favorite):
            return f_app.util.process_objectid(favorite)

        if isinstance(favorite_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.favorite_get_database(m).find({"_id": {"$in": [ObjectId(favorite_id) for favorite_id in favorite_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(favorite_id_or_list) and not ignore_nonexist:
                found_list = map(lambda favorite: str(favorite["_id"]), result_list)
                abort(40400, logger.warning("Non-exist favorite:", filter(lambda favorite_id: favorite_id not in found_list, favorite_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist favorite:", filter(lambda favorite_id: favorite_id not in found_list, favorite_id_or_list), exc_info=False)

            for favorite in result_list:
                result[favorite["id"]] = _format_each(favorite)

            return result

        else:
            with f_app.mongo() as m:
                result = self.favorite_get_database(m).find_one({"_id": ObjectId(favorite_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist favorite:", favorite_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist favorite:", favorite_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def favorite_add(self, params):
        if "user_id" not in params:
            user = f_app.user.login.get()
            if user:
                params["user_id"] = user['id']
            else:
                abort(40000, logger.warning("favorite must be added with user_id.", exc_info=False))

        params["user_id"] = ObjectId(params["user_id"])
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            favorite_id = self.favorite_get_database(m).insert(params)

        return str(favorite_id)

    def favorite_is_favorited(self, target_id, fav_type="property", user_id=None):
        if user_id is None:
            user = f_app.user.login.get()
            if user:
                user_id = user['id']
            else:
                return False

        return target_id in self.favorite_output(self.favorite_get_by_user(user_id, fav_type), ignore_nonexist=True, id_only=True)

    def favorite_output(self, favorite_id_list, ignore_nonexist=False, multi_return=list, force_reload=False, ignore_user=True, id_only=False):
        favorites = self.favorite_get(favorite_id_list, ignore_nonexist=ignore_nonexist, force_reload=force_reload)
        property_set = set()
        item_set = set()
        ticket_set = set()
        for fav in favorites:
            if ignore_user:
                del fav["user_id"]
            if "property_id" in fav:
                property_set.add(fav["property_id"])
            if "item_id" in fav:
                item_set.add(fav["item_id"])
            if "ticket_id" in fav:
                ticket_set.add(fav["ticket_id"])

        if id_only:
            return list(property_set | item_set | ticket_set)

        property_dict = f_app.property.output(list(property_set), multi_return=dict, ignore_nonexist=ignore_nonexist)
        item_dict = f_app.shop.item.output(list(item_set), multi_return=dict, ignore_nonexist=ignore_nonexist)
        ticket_dict = f_app.ticket.output(list(ticket_set), multi_return=dict, ignore_nonexist=ignore_nonexist)
        for fav in favorites:
            if "property_id" in fav:
                fav["property"] = property_dict.get(fav.pop("property_id"))
            if "item_id" in fav:
                fav["item"] = item_dict.get(fav.pop("item_id"))
            if "ticket_id" in fav:
                fav["ticket"] = ticket_dict.get(fav.pop("ticket_id"))

        if multi_return == list:
            return favorites

        else:
            return dict(zip(favorite_id_list, favorites))

    def favorite_get_by_user(self, user_id, fav_type="property"):
        return self.favorite_search({"user_id": ObjectId(user_id), "type": fav_type}, per_page=0)

    def favorite_search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", "new")
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        favorite_id_list = f_app.mongo_index.search(self.favorite_get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return favorite_id_list

    def favorite_remove(self, favorite_id):
        self.favorite_update_set(favorite_id, {"status": "deleted"})

    def favorite_update(self, favorite_id, params):
        with f_app.mongo() as m:
            self.favorite_get_database(m).update(
                {"_id": ObjectId(favorite_id)},
                params,
            )
        favorite = self.favorite_get(favorite_id, force_reload=True)
        return favorite

    def favorite_update_set(self, favorite_id, params):
        return self.favorite_update(favorite_id, {"$set": params})

f_currant_user()


class f_currant_ticket(f_ticket):
    """
        ==================================================================
        Ticket
        ==================================================================
    """
    def output(self, ticket_id_list, enable_custom_fields=True, ignore_nonexist=False, fuzzy_user_info=False, multi_return=list, location_only=False, permission_check=True):
        ticket_list = f_app.ticket.get(ticket_id_list, ignore_nonexist=ignore_nonexist)
        user_id_set = set()
        enum_id_set = set()
        property_id_set = set()
        for t in ticket_list:
            if t is not None:
                if t.get("property_id"):
                    property_id_set.add(t["property_id"])

                if not location_only:
                    if not enable_custom_fields:
                        t.pop("custom_fields", None)
                    user_id_set.add(t.get("creator_user_id"))
                    user_id_set |= set(t.get("assignee", []))
                    if t.get("budget"):
                        enum_id_set.add(t["budget"]["id"])

        property_dict = f_app.property.output(list(property_id_set), multi_return=dict, ignore_nonexist=ignore_nonexist, permission_check=permission_check)

        if not location_only:
            user_id_set = filter(None, user_id_set)
            user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields, permission_check=permission_check)
            user_dict = {}
            enum_dict = f_app.enum.get(enum_id_set, multi_return=dict)

            for u in user_list:
                user_dict[u["id"]] = u

            for t in ticket_list:
                if t is not None:
                    creator_user = user_dict.get(t.pop("creator_user_id"))
                    if creator_user:
                        t["creator_user"] = creator_user

                        if fuzzy_user_info:
                            if "nickname" in t["creator_user"] and t["creator_user"]["nickname"] is not None:
                                t["creator_user"]["nickname"] = t["creator_user"]["nickname"][:1] + "**"

                            if "email" in t["creator_user"] and t["creator_user"]["email"] is not None:
                                t["creator_user"]["email"] = t["creator_user"]["email"][:3] + "**@**"

                            if "phone" in t["creator_user"] and t["creator_user"]["phone"] is not None:
                                if len(t["creator_user"]["phone"]) > 6:
                                    t["creator_user"]["phone"] = t["creator_user"]["phone"][:3] + "*" * (len(t["creator_user"]["phone"]) - 6) + t["creator_user"]["phone"][-3:]
                                else:
                                    t["creator_user"]["phone"] = t["creator_user"]["phone"][:3] + "***"

                            if "wechat" in t["creator_user"] and t["creator_user"]["wechat"] is not None:
                                t["creator_user"]["wechat"] = t["creator_user"]["wechat"][:3] + "***"

                    if isinstance(t.get("assignee"), list):
                        t["assignee"] = map(lambda x: user_dict.get(x), t["assignee"])
                    if t.get("budget"):
                        t["budget"] = enum_dict.get(t["budget"]["id"])
                    if t.get("property_id"):
                        t["property"] = property_dict.get(t.pop("property_id"))

        else:
            new_ticket_list = []
            for t in ticket_list:
                if t is not None:
                    new_ticket = {"id": t["id"]}
                    if t.get("property_id"):
                        t["property"] = property_dict.get(t.pop("property_id"))
                        if "latitude" in t["property"]:
                            new_ticket.update(dict(
                                latitude=t["property"]["latitude"],
                                longitude=t["property"]["longitude"],
                            ))
                    new_ticket_list.append(new_ticket)
                else:
                    new_ticket_list.append(None)
            ticket_list = new_ticket_list

        if multi_return == list:
            return ticket_list

        else:
            return dict(zip(ticket_id_list, ticket_list))

    def history_single_output(self, ticket_id):
        user_id_set = set([])
        ticket_history_list = f_app.ticket.history_get(f_app.ticket.history_get_by_ticket(ticket_id))

        for history in ticket_history_list:
            if history.get("operator_user_id") is not None:
                user_id_set.add(history["operator_user_id"])
                if "_set" in history:
                    if "assignee" in history["_set"]:
                        user_id_set |= set(history["_set"].get("assignee", []))
                if "_push" in history:
                    if "assignee" in history["_push"]:
                        user_id_set.add(history["_push"].get("assignee"))

        user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields)
        user_dict = {i["id"]: i for i in user_list}

        for history in ticket_history_list:
            if history.get("operator_user_id") is not None:
                history["operator_user"] = user_dict.get(history.pop("operator_user_id"))
                if "_set" in history:
                    if "assignee" in history["_set"]:
                        history["_set"]["assignee"] = [user_dict.get(user) for user in history.pop("assignee", [])]
                if "_push" in history:
                    if "assignee" in history["_push"]:
                        history["_push"]["assignee"] = user_dict.get(history["_push"].pop("assignee"))

        return ticket_history_list

    def ensure_tag(self, ticket_id, tag):
        ticket = f_app.ticket.get(ticket_id)
        tags = ticket.get("tags", [])
        if tag in tags:
            return
        f_app.ticket.update_set(ticket_id, {"$push": {"tags": tag}})

f_currant_ticket()


class f_currant_plugins(f_app.plugin_base):
    """
        ==================================================================
        Plugins
        ==================================================================
    """

    task = ["assign_property_short_id", "render_pdf", "crawler_example", "crawler_london_home", "fortis_developments", "crawler_knightknox",
            "crawler_abacusinvestor", "crawler_knightknox_agents", "update_landregistry", "crawler_selectproperty", "rent_ticket_reminder",
            "rent_ticket_generate_digest_image", "rent_ticket_check_intention", "rent_intention_ticket_check_rent", "ping_sitemap"]

    def user_output_each(self, result_row, raw_row, user, admin, simple):
        if "phone" in raw_row:
            phonenumber = phonenumbers.parse(raw_row["phone"])
            result_row["phone"] = phonenumbers.format_number(phonenumber, phonenumbers.PhoneNumberFormat.NATIONAL).replace(" ", "")
            result_row["country_code"] = phonenumber.country_code
        if "custom_fields" in raw_row and user and set(f_app.user.get_role(user["id"])) & set(f_app.common.advanced_admin_roles):
            result_row["custom_fields"] = raw_row["custom_fields"]
        return result_row

    def ticket_get(self, ticket):
        if "assignee" in ticket:
            ticket["assignee"] = [str(i) for i in ticket.pop("assignee", [])]
        if "user_id" in ticket:
            ticket["user_id"] = str(ticket["user_id"])

        return ticket

    def ticket_update_after(self, ticket_id, params, ignore_error=True):
        ticket = f_app.ticket.get(ticket_id)
        if "$set" in params:
            params = params["$set"]
        if ticket["type"] == "rent" and "status" in params and params["status"] == "to rent":
            f_app.task.add(dict(
                type="rent_ticket_check_intention",
                ticket_id=ticket_id,
            ))
            f_app.task.put(dict(
                type="ping_sitemap",
            ))
            import currant_util
            ticket = f_app.i18n.process_i18n(f_app.ticket.output([ticket_id]), _i18n=["zh_Hans_CN"])[0]
            title = "恭喜，您的房源已经发布成功！"
            f_app.email.schedule(
                target=ticket["creator_user"]["email"],
                subject=title,
                # TODO
                text=template("static/emails/rent_ticket_publish_success", title=title, nickname=ticket["creator_user"]["nickname"], rent=ticket, date="", get_country_name_by_code=currant_util.get_country_name_by_code),
                display="html",
                ticket_match_user_id=ticket["creator_user"]["id"],
                sendgrid_args={"category": "rent_ticket_publish_success"},
            )

        elif ticket["type"] == "rent_intention" and "status" in params and params["status"] == "new":
            f_app.task.add(dict(
                type="rent_intention_ticket_check_rent",
                ticket_id=ticket_id,
            ))

    def task_on_rent_ticket_check_intention(self, task):
        ticket_id = task["ticket_id"]
        ticket = f_app.i18n.process_i18n(f_app.ticket.output([ticket_id], permission_check=False, ignore_nonexist=True)[0], _i18n=["zh_Hans_CN"])

        if "property" not in ticket or "country" not in ticket["property"] or "city" not in ticket["property"]:
            return

        # Scan existing rent intention ticket
        params = {
            "type": "rent_intention",
            "status": "new",
            "country.code": ticket["property"]["country"]["code"],
            "city._id": ObjectId(ticket["property"]["city"]["id"]),
        }
        rent_intention_tickets = f_app.ticket.output(f_app.ticket.search(params=params, per_page=-1), permission_check=False)

        for intention_ticket in rent_intention_tickets:
            if "email" not in intention_ticket["creator_user"]:
                continue

            if "rent_intention_ticket_check_rent" not in intention_ticket["creator_user"].get("email_message_type", []):
                continue

            if "rent_budget" not in intention_ticket or "bedroom_count" not in intention_ticket or "rent_type" not in intention_ticket:
                continue

            bedroom_count = f_app.util.parse_bedroom_count(intention_ticket["bedroom_count"])
            A = True
            if bedroom_count[0] is not None:
                A = A and bedroom_count[0] <= ticket["property"]["bedroom_count"]
            if bedroom_count[1] is not None:
                A = A and bedroom_count[1] >= ticket["property"]["bedroom_count"]

            rent_budget = f_app.util.parse_budget(intention_ticket["rent_budget"])
            B = True
            price = ticket["price"]["value_float"]
            if ticket["price"]["unit"] != rent_budget[2]:
                price = float(f_app.i18n.convert_currency({"unit": ticket["price"]["unit"], "value": ticket["price"]["value"]}, rent_budget[2]))
            if rent_budget[0]:
                B = B and float(rent_budget[0]) <= price
            if rent_budget[1]:
                B = B and float(rent_budget[1]) >= price

            C = ticket["rent_available_time"].year == intention_ticket["rent_available_time"].year and ticket["rent_available_time"].month == intention_ticket["rent_available_time"].month
            if "rent_deadline_time" in ticket and "rent_deadline_time" in intention_ticket:
                C = C and ticket["rent_deadline_time"].year == intention_ticket["rent_deadline_time"].year and ticket["rent_deadline_time"].month == intention_ticket["rent_deadline_time"].month

            if "minimum_rent_period" in ticket and "minimum_rent_period" in intention_ticket:
                D = ticket["minimum_rent_period"]["value_float"] >= intention_ticket["minimum_rent_period"]["value_float"]
            else:
                D = 1

            if "maponics_neighborhood" in ticket and "maponics_neighborhood" in intention_ticket:
                E = ticket["maponics_neighborhood"]["id"] == intention_ticket["maponics_neighborhood"]["id"]
            elif "zipcode_index" in ticket["property"] and "zipcode_index" in intention_ticket:
                E = ticket["property"]["zipcode_index"] == intention_ticket["zipcode_index"]
            else:
                E = 1

            F = ticket["rent_type"]["id"] == intention_ticket["rent_type"]["id"]

            score = A + B + C + D + E + F
            unsubscribe_url = 'http://yangfd.com/email-unsubscribe?email_message_type=rent_intention_ticket_check_rent'
            import currant_util

            if score == 6:
                title = "洋房东给您匹配到了合适的房源，快来看看吧！"
                f_app.email.schedule(
                    target=intention_ticket["creator_user"]["email"],
                    subject=title,
                    # TODO
                    text=template("static/emails/rent_intention_matched_1", title=title, nickname=intention_ticket["creator_user"]["nickname"], date="", rent_ticket=ticket, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                    display="html",
                    ticket_match_user_id=intention_ticket["creator_user"]["id"],
                    sendgrid_args={"category": "rent_intention_matched_1"},
                )
                f_app.ticket.ensure_tag(intention_ticket["id"], "perfect_match")
            elif score >= 4:
                title = "洋房东给您匹配到了一些房源，快来看看吧！"
                sent_in_a_day = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "ticket_match_user_id": intention_ticket["creator_user"]["id"], "start": {"$gte": datetime.utcnow() - timedelta(days=1)}})
                if len(sent_in_a_day):
                    pass
                else:
                    f_app.email.schedule(
                        target=intention_ticket["creator_user"]["email"],
                        subject=title,
                        # TODO
                        text=template("static/emails/rent_intention_matched_4", title=title, nickname=intention_ticket["creator_user"]["nickname"], date="", rent_ticket=ticket, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                        display="html",
                        ticket_match_user_id=intention_ticket["creator_user"]["id"],
                        sendgrid_args={"category": "rent_intention_matched_4"},
                    )
                f_app.ticket.ensure_tag(intention_ticket["id"], "partial_match")

    def task_on_rent_intention_ticket_check_rent(self, task):
        ticket_id = task["ticket_id"]
        intention_ticket = f_app.ticket.get(ticket_id)
        ticket_creator_user = f_app.user.get(intention_ticket["creator_user_id"])

        if "email" not in ticket_creator_user:
            self.logger.debug("Ignoring rent_intention_ticket_check_rent for ticket", ticket_id, "as the creator user doesn't have email filled.")
            return

        if "rent_intention_ticket_check_rent" not in ticket_creator_user.get("email_message_type", []):
            return

        # Scan existing rent intention ticket
        params = {
            "type": "rent",
            "status": "to rent",
        }
        rent_tickets = f_app.i18n.process_i18n(f_app.ticket.output(f_app.ticket.search(params=params, per_page=-1), permission_check=False), _i18n=["zh_Hans_CN"])

        bedroom_count = f_app.util.parse_bedroom_count(intention_ticket["bedroom_count"])
        rent_budget = f_app.util.parse_budget(intention_ticket["rent_budget"])

        best_matches = []
        good_matches = []

        for ticket in rent_tickets:
            try:
                if "price" not in ticket or "property" not in ticket or "bedroom_count" not in ticket["property"] or "rent_type" not in ticket or "country" not in ticket["property"]:
                    continue

                if ticket["property"]["country"]["code"] != intention_ticket["country"]["code"]:
                    continue

                if ticket["property"]["city"]["id"] != intention_ticket["city"]["id"]:
                    continue

                A = True
                if bedroom_count[0] is not None:
                    A = A and bedroom_count[0] <= ticket["property"]["bedroom_count"]
                if bedroom_count[1] is not None:
                    A = A and bedroom_count[1] >= ticket["property"]["bedroom_count"]

                B = True
                price = ticket["price"]["value_float"]
                if ticket["price"]["unit"] != rent_budget[2]:
                    price = float(f_app.i18n.convert_currency({"unit": ticket["price"]["unit"], "value": ticket["price"]["value"]}, rent_budget[2]))
                if rent_budget[0]:
                    B = B and float(rent_budget[0]) <= price
                if rent_budget[1]:
                    B = B and float(rent_budget[1]) >= price

                C = ticket["rent_available_time"].year == intention_ticket["rent_available_time"].year and ticket["rent_available_time"].month == intention_ticket["rent_available_time"].month
                if "rent_deadline_time" in ticket and "rent_deadline_time" in intention_ticket:
                    C = C and ticket["rent_deadline_time"].year == intention_ticket["rent_deadline_time"].year and ticket["rent_deadline_time"].month == intention_ticket["rent_deadline_time"].month

                if "minimum_rent_period" in ticket and "minimum_rent_period" in intention_ticket:
                    D = ticket["minimum_rent_period"]["value_float"] >= intention_ticket["minimum_rent_period"]["value_float"]
                else:
                    D = 1

                if "maponics_neighborhood" in ticket and "maponics_neighborhood" in intention_ticket:
                    E = ticket["maponics_neighborhood"]["id"] == intention_ticket["maponics_neighborhood"]["id"]
                elif "zipcode_index" in ticket["property"] and "zipcode_index" in intention_ticket:
                    E = ticket["property"]["zipcode_index"] == intention_ticket["zipcode_index"]
                else:
                    E = 1

                F = ticket["rent_type"]["id"] == intention_ticket["rent_type"]["id"]

                score = A + B + C + D + E + F

                if score == 6:
                    best_matches.append(ticket)

                elif score >= 4:
                    good_matches.append(ticket)
            except:
                self.logger.warning("Bad ticket detected:", ticket["id"])

        import currant_util
        unsubscribe_url = 'http://yangfd.com/email-unsubscribe?email_message_type=rent_intention_ticket_check_rent'
        if len(best_matches):
            title = "洋房东给您匹配到了合适的房源，快来看看吧！"
            f_app.email.schedule(
                target=ticket_creator_user["email"],
                subject=title,
                # TODO
                text=template("static/emails/rent_intention_digest", nickname=ticket_creator_user["nickname"], matched_rent_ticket_list=best_matches, date="", title=title, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                display="html",
                ticket_match_user_id=ticket_creator_user["id"],
                sendgrid_args={"category": "rent_intention_digest"},
            )
            f_app.ticket.ensure_tag(intention_ticket["id"], "perfect_match")
        elif len(good_matches):
            title = "洋房东给您匹配到了一些房源，快来看看吧！"
            f_app.email.schedule(
                target=ticket_creator_user["email"],
                subject=title,
                # TODO
                text=template("static/emails/rent_intention_digest", nickname=ticket_creator_user["nickname"], matched_rent_ticket_list=good_matches, date="", title=title, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                display="html",
                ticket_match_user_id=ticket_creator_user["id"],
                sendgrid_args={"category": "rent_intention_digest"},
            )
            f_app.ticket.ensure_tag(intention_ticket["id"], "partial_match")
        else:
            title = "恭喜，洋房东已经收到您的求租意向单！"
            f_app.email.schedule(
                target=ticket_creator_user["email"],
                subject=title,
                # TODO
                text=template("static/emails/receive_rent_intention", date="", nickname=ticket_creator_user["nickname"], title=title, unsubscribe_url=unsubscribe_url),
                display="html",
                sendgrid_args={"category": "receive_rent_intention"},
            )

    def user_add(self, params, noregister):
        params.setdefault("email_message_type", f_app.common.email_message_type)
        params.setdefault("system_message_type", f_app.common.message_type)
        params.setdefault("private_contact_methods", [])
        return params

    def user_add_after(self, user_id, params, noregister):
        index_params = f_app.util.try_get_value(params, ["nickname", "phone", "email"])
        if index_params:
            if "phone" in index_params:
                index_params["phone_national_number"] = str(phonenumbers.parse(index_params["phone"]).national_number)
            f_app.mongo_index.update(f_app.user.get_database, user_id, index_params.values())

        if not noregister:
            credit = {
                "type": "view_rent_ticket_contact_info",
                "amount": 1,
                "expire_time": datetime.utcnow() + timedelta(days=30),
                "tag": "initial",
                "user_id": user_id,
            }
            f_app.user.credit.add(credit)

            operations_list = f_app.user.get(f_app.user.search({"role": {"$in": ["operation", "jr_operation"]}}))
            for operation in operations_list:
                if "email" in operation and False:  # Disabled :/
                    f_app.email.schedule(
                        target=operation["email"],
                        subject=f_app.util.get_format_email_subject(template("static/emails/new_user_admin_title")),
                        text=template("static/emails/new_user_admin", params=params),
                        display="html",
                        sendgrid_args={"category": "new_user_admin"},
                    )

        return user_id

    def user_update_after(self, user_id, params):
        if "$set" in params:
            if len(set(["nickname", "phone", "email"]) & set(params["$set"])) > 0:
                index_params = f_app.util.try_get_value(f_app.user.get(user_id), ["nickname", "phone", "email"])
                if index_params:
                    if "phone" in index_params:
                        index_params["phone_national_number"] = str(phonenumbers.parse(index_params["phone"]).national_number)
                    f_app.mongo_index.update(f_app.user.get_database, user_id, index_params.values())

    def post_add(self, params, post_id):
        if {'_id': ObjectId(f_app.enum.get_by_slug('announcement')['id']), 'type': 'news_category', '_enum': 'news_category'} in params["category"]:
            # System
            message = {
                "type": "system",
                "title": params["title"],
                "text": params["content"]
            }
            user_list = f_app.user.search({"register_time": {"$ne": None}, "system_message_type": "system"})
            f_app.message.add(message, user_list)
        if False and "category" in params:
            # Favorite
            related_property_list = f_app.property.search({"news_category": {"$in": params["category"]}, "status": {"$in": ["selling", "sold out"]}})
            related_property_list = [ObjectId(property) for property in related_property_list]
            logger.debug(related_property_list)
            favorite_user_id_list = [fav["user_id"] for fav in f_app.user.favorite.get(f_app.user.favorite.search({"property_id": {"$in": related_property_list}}, per_page=0))]
            favorite_user_list = f_app.user.get(favorite_user_id_list, multi_return=dict)
            favorite_user_list = [_id for _id in favorite_user_list if "favorited_property_news" in favorite_user_list.get(_id).get("system_message_type", [])]
            logger.debug(favorite_user_list)
            message = {
                "type": "favorited_property_news",
                "title": params["title"],
                "text": params["content"]
            }
            f_app.message.add(message, favorite_user_list)
            # Intention
            intention_ticket_list = f_app.ticket.search({"property_id": {"$in": related_property_list}, "status": {"$in": ["new", "assigned", "in_progress", "deposit"]}}, per_page=0)
            intention_user_id_list = [t.get("user_id") for t in f_app.ticket.get(intention_ticket_list)]
            intention_user_list = f_app.user.get(intention_user_id_list, multi_return=dict)
            intention_user_list = [_id for _id in intention_user_list if "intention_property_news" in intention_user_list.get(_id).get("system_message_type", [])]
            message = {
                "type": "intention_property_news",
                "title": params["title"],
                "text": params["content"]
            }
            f_app.message.add(message, intention_user_list)
            # my_property_news
            bought_ticket_list = f_app.ticket.search({"property_id": {"$in": related_property_list}, "status": "bought"}, per_page=0)
            bought_user_id_list = [t.get("user_id") for t in f_app.ticket.get(bought_ticket_list)]
            bought_user_list = f_app.user.get(bought_user_id_list, multi_return=dict)
            bought_user_list = [_id for _id in intention_user_list if "my_property_news" in f_app.user.get(_id).get("system_message_type", [])]
            message = {
                "type": "my_property_news",
                "title": params["title"],
                "text": params["content"]
            }
            f_app.message.add(message, bought_user_list)

        return params

    def message_output_each(self, message):
        logger.debug(message)
        message["status"] = message.pop("state", "deleted")
        return message

    def task_on_ping_sitemap(self, task):
        f_app.request("http://www.google.com/webmasters/sitemaps/ping?sitemap=http://yangfd.com/sitemap_location.xml")
        f_app.request("http://www.bing.com/webmaster/ping.aspx?siteMap=http://yangfd.com/sitemap_location.xml")

    def task_on_rent_ticket_generate_digest_image(self, task):
        try:
            rent_ticket = f_app.ticket.output([task["ticket_id"]], permission_check=False)[0]
        except:
            self.logger.warning("Failed to load ticket", task["ticket_id"], ", skipping digest generation...")
            return

        if rent_ticket.get("digest_image_task_id") != str(task["_id"]):
            self.logger.warning("Ticket", task["ticket_id"], "seems to have another digest generation task scheduled, ignoring this one...")
            return

        from libfelix.f_html2png import html2png
        image = html2png(task["fetch_url"], width=1000, height="window.innerHeight", url=True)

        with f_app.storage.aws_s3() as b:
            filename = f_app.util.uuid()
            b.upload(filename, image.read(), policy="public-read")
            f_app.ticket.update_set(task["ticket_id"], {"digest_image": b.get_public_url(filename), "digest_image_generate_time": datetime.utcnow()})

    def task_on_rent_ticket_reminder(self, task):
        tickets = f_app.ticket.output(f_app.ticket.search({"type": "rent", "status": "to rent"}, per_page=0), permission_check=False)

        for rent_ticket in tickets:
            if "creator_user" not in rent_ticket or "email" not in rent_ticket["creator_user"]:
                self.logger.warning("Ticket doesn't have a valid creator user:", rent_ticket["id"], ", ignoring reminder...", exc_info=False)
                continue

            if "rent_ticket_reminder" not in rent_ticket["creator_user"].get("email_message_type", []):
                continue

            last_email = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "rent_ticket_reminder": "is_rent_success", "ticket_id": rent_ticket["id"], "start": {"$gte": datetime.utcnow() - timedelta(days=7)}})

            if last_email:
                # Sent within 7 days, skipping
                continue

            try:
                title = "您的“%(title)s”是否已经出租成功了？" % rent_ticket
                url = 'http://yangfd.com/property-to-rent/' + rent_ticket["id"]
                body = template(
                    "views/static/emails/rent_notice.html",
                    title=title,
                    nickname=rent_ticket["creator_user"]["nickname"],
                    formated_date='之前',  # TODO
                    rent_url=url,
                    rent_title=rent_ticket["title"],
                    has_rented_url="http://yangfd.com//user-properties?type=rent_ticket&id=%s&action=confirm_rent" % (rent_ticket["id"],),
                    refresh_url="http://yangfd.com//user-properties?type=rent_ticket&id=%s&action=refresh" % (rent_ticket["id"],),
                    edit_url=url + "/edit",
                    qrcode_image="http://yangfd.com/qrcode/generate?content=" + urllib.parse.quote(url),
                    unsubscribe_url='http://yangfd.com/email-unsubscribe?email_message_type=rent_ticket_reminder')
            except:
                self.logger.warning("Invalid ticket", rent_ticket["id"], ", ignoring reminder...")
                continue

            f_app.email.schedule(
                target=rent_ticket["creator_user"]["email"],
                subject=title,
                text=body,
                display="html",
                rent_ticket_reminder="is_rent_success",
                ticket_id=rent_ticket["id"],
                sendgrid_args={"category": "rent_notice"},
            )

        tickets = f_app.ticket.output(f_app.ticket.search({"type": "rent", "status": "draft", "time": {"$lte": datetime.utcnow() - timedelta(days=7)}}, per_page=0, notime=True), permission_check=False)

        for rent_ticket in tickets:
            if "creator_user" not in rent_ticket or "email" not in rent_ticket["creator_user"]:
                self.logger.warning("Ticket doesn't have a valid creator user:", rent_ticket["id"], ", ignoring reminder...", exc_info=False)
                continue

            if "rent_ticket_reminder" not in rent_ticket["creator_user"].get("email_message_type", []):
                continue

            last_email = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "ticket_id": rent_ticket["id"], "rent_ticket_reminder": "draft_7day"})

            if last_email:
                # Sent, skipping
                continue

            title = "您的出租房产已经在草稿箱中躺了7天了！"
            try:
                body = template(
                    "views/static/emails/draft_not_publish_day_7",
                    nickname=rent_ticket["creator_user"]["nickname"],
                    date="",
                    title=title,
                    rent_ticket_title=rent_ticket["title"],
                    rent_ticket_edit_url="http://yangfd.com/property-to-rent/%s/edit" % rent_ticket["id"],
                    unsubscribe_url='http://yangfd.com/email-unsubscribe?email_message_type=rent_ticket_reminder')
            except:
                self.logger.warning("Invalid ticket", rent_ticket["id"], ", ignoring reminder...")
                continue

            f_app.email.schedule(
                target=rent_ticket["creator_user"]["email"],
                subject=title,
                text=body,
                display="html",
                rent_ticket_reminder="draft_7day",
                ticket_id=rent_ticket["id"],
                sendgrid_args={"category": "draft_not_publish_day_7"},
            )

        tickets = f_app.ticket.output(f_app.ticket.search({"type": "rent", "status": "draft", "time": {"$lte": datetime.utcnow() - timedelta(days=3)}}, per_page=0, notime=True), permission_check=False)

        for rent_ticket in tickets:
            if "creator_user" not in rent_ticket or "email" not in rent_ticket["creator_user"]:
                self.logger.warning("Ticket doesn't have a valid creator user:", rent_ticket["id"], ", ignoring reminder...", exc_info=False)
                continue

            if "rent_ticket_reminder" not in rent_ticket["creator_user"].get("email_message_type", []):
                continue

            last_email = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "ticket_id": rent_ticket["id"], "rent_ticket_reminder": {"$in": ["draft_3day", "draft_7day"]}})

            if last_email:
                # Sent, skipping
                continue

            title = "您的出租房产已经在草稿箱中躺了3天了！"
            try:
                body = template(
                    "views/static/emails/draft_not_publish_day_3",
                    nickname=rent_ticket["creator_user"]["nickname"],
                    date="",
                    title=title,
                    rent_ticket_title=rent_ticket["title"],
                    rent_ticket_edit_url="http://yangfd.com/property-to-rent/%s/edit" % rent_ticket["id"],
                    unsubscribe_url='http://yangfd.com/email-unsubscribe?email_message_type=rent_ticket_reminder')
            except:
                self.logger.warning("Invalid ticket", rent_ticket["id"], ", ignoring reminder...")
                continue

            f_app.email.schedule(
                target=rent_ticket["creator_user"]["email"],
                subject=title,
                text=body,
                display="html",
                rent_ticket_reminder="draft_3day",
                ticket_id=rent_ticket["id"],
                sendgrid_args={"category": "draft_not_publish_day_3"},
            )

        f_app.task.put(dict(
            type="rent_ticket_reminder",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_assign_property_short_id(self, task):
        # Validate that the property is still available:
        try:
            property = f_app.property.get(task["property_id"])
        except:
            return

        if "short_id" in property:
            return

        self.logger.debug("Looking for a free short id for property", task["property_id"])
        # TODO: not infinity?
        while True:
            new_short_id = "".join([str(random.randint(0, 9)) for i in range(6)])
            found_property = f_app.property.search({"status": {"$in": ["selling", "hidden", "sold out"]}, "short_id": new_short_id})
            if not len(found_property):
                break

        self.logger.debug("Setting short id", new_short_id, "for property", task["property_id"])
        f_app.property.update_set(task["property_id"], {"short_id": new_short_id})

    def task_on_render_pdf(self, task):
        property_id = task["property_id"]
        try:
            property = f_app.property.get(property_id)
            assert property["status"] in ["draft", "not translated", "translating"]
            for n, item in enumerate(property[task["property_field"]]):
                if item["url"] == task["url"]:
                    def update(value):
                        property[task["property_field"]][n] = value
                    break

            else:
                raise ValueError

        except:
            self.logger.warning("render_pdf task no longer valid, ignoring task:", task, exc_info=False)
            return

        from wand.image import Image
        image_pdf = Image(blob=f_app.request(task["url"]).content)

        result = {"url": task["url"], "rendered": []}

        with f_app.storage.aws_s3() as b:
            for page in image_pdf.sequence:
                pdf_page = Image(image=page)
                img = pdf_page.convert('jpeg')
                filename = f_app.util.uuid() + ".jpg"
                b.upload(filename, img.make_blob(), policy="public-read")
                result["rendered"].append(b.get_public_url(filename))

        update(result)
        f_app.property.update_set(task["property_id"], {task["property_field"]: property[task["property_field"]]})

    def task_on_crawler_example(self, task):
        # Please use f_app.request for ANY HTTP(s) requests.
        # Fetch the list
        # Fetch the pages
        # Extract needed information
        # Match the information to our property format
        params = {}
        # Save an identifier property_crawler_id into the params. It's recommended to use the page URL whenever applicable.
        params["property_crawler_id"] = "url"
        # Call f_app.property.crawler_insert_update for each property
        f_app.property.crawler_insert_update(params)
        # Add a new task for next fetch. For example, if you want to craw every day:
        f_app.task.put(dict(
            type="crawler_example",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_crawler_london_home(self, task):
        start_page = task.get("start_page", 1)
        is_end = False
        search_url = 'http://www.mylondonhome.com/search.aspx?ListingType=5'
        list_page_counter = start_page
        list_post_data = {
            "__EVENTTARGET": "_ctl1:CenterRegion:_ctl1:cntrlPagingHeader",
            "__EVENTARGUMENT": list_page_counter
        }
        search_url_parsed = urllib.parse.urlparse(search_url)
        search_url_prefix = "%s://%s" % (search_url_parsed.scheme, search_url_parsed.netloc)
        property_image_url_prefix = "http://www.mylondonhome.com/ViewExtraPhotos.aspx?id="

        while not is_end:
            list_post_data["__EVENTARGUMENT"] = list_page_counter
            list_page = f_app.request.post(search_url, list_post_data)
            if list_page.status_code == 200:
                self.logger.debug("Start crawling page %d" % list_page_counter)
                f_app.task.update_set(task, {"start_page": list_page_counter})
                list_page_dom_root = q(list_page.content)
                list_page_nav_links = list_page_dom_root("td.PagerOtherPageCells a.PagerHyperlinkStyle")
                list_page_next_links = []
                for i in list_page_nav_links:
                    if i.text == ">":
                        list_page_next_links.append(i.text)
                is_end = False if len(list_page_next_links) else True

                list_page_property_links = list_page_dom_root("div#cntrlPropertySearch_map_pnlResults a.propAdd")
                for link in list_page_property_links:
                    params = {
                        "country": "GB",
                        "city": f_app.geonames.gazetteer.get_by_geoname_id("2643743")
                    }
                    property_url = "%s%s" % (search_url_prefix, link.attrib['href'])
                    property_site_id = urllib.parse.urlparse(link.attrib['href']).path.split('/')[-1]
                    logger.debug(property_url)
                    property_page = f_app.request.get(property_url)
                    if property_page.status_code == 200:
                        params["property_crawler_id"] = property_url
                        property_page_dom_root = q(property_page.content)
                        # Extract information
                        property_page_address = property_page_dom_root('div#propertyAddress h1.ViewPropNamePrice').text()
                        property_page_price = property_page_dom_root('div#propertyAddress h2.ViewPropNamePrice').text()
                        property_page_building_area = property_page_dom_root('div#cntrlPropertyDetails__ctl1_trBuildingArea').text()
                        property_image_page = f_app.request.get(property_image_url_prefix + property_site_id)
                        property_description = property_page_dom_root('div.ViewPropTextContainer')
                        property_description.children('div.VisitorsAlsoviewedMain').remove()
                        property_description.children('script').remove()
                        property_description = property_description.text()

                        params["description"] = {"en_GB": property_description}
                        params["address"] = {"en_GB": property_page_address.strip()}
                        params["name"] = {"en_GB": property_page_address.strip()}

                        if property_image_page.status_code == 200:
                            property_image_page_dom_root = q(property_image_page.content)
                            property_image_tags = property_image_page_dom_root('img.FullsmallImage')
                            property_images = []
                            for img in property_image_tags:
                                img_url = urllib.parse.urlparse(img.attrib['src'])
                                query = urllib.parse.parse_qs(img_url.query)
                                query.pop('h', None)
                                query.pop('w', None)
                                img_url = img_url._replace(query=urllib.parse.urlencode(query, True))
                                property_images.append(urllib.parse.urlunparse(img_url))
                            params["reality_images"] = {"en_GB": property_images, "zh_Hans_CN": property_images, "zh_Hant_HK": property_images}

                        total_price = re.findall(r'[0-9,]+', property_page_price)
                        if total_price:
                            params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
                        if "Share of freehold" in property_page_price:
                            params["equity_type"] = ObjectId(f_app.enum.get_by_slug('virtual_freehold')["id"])
                        elif "Freehold" in property_page_price:
                            params["equity_type"] = ObjectId(f_app.enum.get_by_slug('freehold')["id"])
                        elif "Leasehold" in property_page_price:
                            params["equity_type"] = ObjectId(f_app.enum.get_by_slug('leasehold')["id"])

                        building_area = re.findall(r'[0-9,]+', property_page_building_area)
                        if building_area:
                            params["space"] = {"type": "area", "unit": "foot ** 2", "value": building_area[0].replace(',', '')}

                        f_app.property.crawler_insert_update(params)

                    else:
                        self.logger.debug("Failed crawling property_page %s, status_code is %d" % (property_url, property_page.status_code))
                list_page_counter += 1
            else:
                self.logger.debug("Failed crawling page %d, status_code is %d" % (list_page_counter, list_page.status_code))

        f_app.task.put(dict(
            type="crawler_london_home",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_fortis_developments(self, task):
        list_url = 'http://www.fortisdevelopments.com/projects/'
        list_page = f_app.request.get(list_url)
        if list_page.status_code == 200:
            self.logger.debug("Start crawling page %s" % list_url)
            list_page_dom_root = q(list_page.content)
            list_links = list_page_dom_root('h2.projects-accordion__heading--current').siblings('div.projects-accordion__content').children().children()
            for link in list_links:
                params = {
                    "country": "GB"
                }
                property_page_link_url = link.attrib['href']
                property_page = f_app.request.get(property_page_link_url)
                if property_page.status_code == 200:
                    property_page_dom_root = q(property_page.content)
                    images = property_page_dom_root('ul.slides img')
                    videos = property_page_dom_root('div#panel3 a.property-video')
                    if images:
                        property_images = [x.attrib['src'] for x in images]
                        params["reality_images"] = {"en_GB": property_images, "zh_Hans_CN": property_images, "zh_Hant_HK": property_images}
                    if videos:
                        params["videos"] = [{"sources": {"url": x.attrib['href']}} for x in videos]
                    params["name"] = {"en_GB": property_page_dom_root('span.single-property__heading--highlight').text()}
                    params["description"] = {"en_GB": property_page_dom_root('div#panel1').text()}

                params["property_crawler_id"] = property_page_link_url
                f_app.property.crawler_insert_update(params)

        f_app.task.put(dict(
            type="fortis_developments",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_crawler_knightknox(self, task):
        start_page = task.get("start_page", 1)
        is_end = False
        search_url = 'http://www.knightknox.com/property/search?country=united+kingdom&region=any&type=any&minbeds=0&maxprice=any&fsbo=on&page=%s'
        list_page_counter = start_page
        search_url_parsed = urllib.parse.urlparse(search_url)
        search_url_prefix = "%s://%s" % (search_url_parsed.scheme, search_url_parsed.netloc)
        while not is_end:
            list_page = f_app.request.get(search_url % list_page_counter, retry=3)
            if list_page.status_code == 200:
                self.logger.debug("Start crawling knightknox page %d" % list_page_counter)
                f_app.task.update_set(task, {"start_page": list_page_counter})
                list_page_dom_root = q(list_page.content)
                list_page_nav_links = list_page_dom_root.find("p#searchpagination.text-center a.raquo")
                is_end = False if len(list_page_nav_links) else True

                list_page_property_links = list_page_dom_root.find("div.featured-prop").children()
                for link in list_page_property_links:
                    img_overlay = link.getchildren()[1].getchildren()[0].attrib
                    # skip sold out property
                    if img_overlay.get("src", None) == "http://static.kkicdn.com/img/overlay-soldout.png":
                        continue
                    params = {
                        "country": "GB"
                    }
                    property_url = "%s%s" % (search_url_prefix, link.attrib['href'])
                    logger.debug("property_url", property_url)
                    property_page = f_app.request.get(property_url, retry=3)
                    if property_page.status_code == 200:
                        params["property_crawler_id"] = property_url
                        property_page_dom_root = q(property_page.content)
                        # Extract information
                        property_totle_price = property_page_dom_root("div#listinghero p.price").text()
                        property_name = property_page_dom_root("div#listinghero p.title").text()
                        property_address = property_page_dom_root("div#listinghero p.location").text()
                        property_description = property_page_dom_root("div#description.content").text()
                        property_videos = property_page_dom_root("div#video.content").children().children().children()
                        property_images = property_page_dom_root("div#listinghero div.large-8.medium-8.pull-4.columns div.listing-slider").children().children()

                        property_highlights = property_page_dom_root("ul.features.hide-for-small").children()

                        property_features = property_page_dom_root("ul#features").children()

                        params["description"] = {"en_GB": property_description}
                        params["address"] = {"en_GB": property_address.strip()}
                        params["name"] = {"en_GB": property_name.strip()}

                        total_price = re.findall(r'[0-9,]+', property_totle_price)
                        if total_price:
                            params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}

                        if property_videos:
                            params["videos"] = [{"sources": {"url": video.attrib['src']}} for video in property_videos]

                        if property_images:
                            reality_images = [image.attrib['src'] for image in property_images]
                            params["reality_images"] = {"en_GB": reality_images, "zh_Hans_CN": reality_images, "zh_Hant_HK": reality_images}

                        if property_highlights:
                            params["highlight"] = {"en_GB": [property_highlight.text for property_highlight in property_highlights]}

                        if property_features:
                            for property_feature in property_features:
                                type_and_features = property_feature.text_content().split(":")
                                content_type = type_and_features[0].strip()
                                feature = type_and_features[1].strip()
                                if content_type == "Tenure":
                                    if feature.lower() == "leasehold":
                                        params["equity_type"] = ObjectId(f_app.enum.get_by_slug('leasehold')["id"])
                                elif content_type == "Size":
                                    building_size = re.findall(r'[0-9,]+', feature)
                                    if building_size and "sqm" in feature:
                                        params["space"] = {"type": "area", "unit": "meter ** 2", "value": ".".join(building_size)}
                                elif content_type == "Bathrooms":
                                    if feature.isdigit():
                                        params["bathroom_count"] = int(feature)
                                elif content_type == "Bedrooms":
                                    if feature.isdigit():
                                        params["bedroom_count"] = int(feature)
                                elif content_type == "Type":
                                    if "Apartment" in feature:
                                        params["property_type"] = ObjectId(f_app.enum.get_by_slug('apartment')["id"])
                                    elif "Student Accommodation" == feature:  # what is the property_type
                                        params["investment_type"] = [ObjectId(f_app.enum.get_by_slug('studenthousing')["id"])]

                        f_app.property.crawler_insert_update(params)

                    else:
                        self.logger.error("Failed crawling knightknox property_page %s, status_code is %d" % (property_url, property_page.status_code))
                list_page_counter += 1
            else:
                self.logger.error("Failed crawling knightknox page %d, status_code is %d" % (list_page_counter, list_page.status_code))

        f_app.task.put(dict(
            type="crawler_knightknox",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_crawler_knightknox_agents(self, task):
        headers = {
            "Host": "agents.knightknox.com"
        }
        login_url = "http://agents.knightknox.com/login"
        login_credentials = {
            "username": f_app.common.knightknox_agents_username,
            "password": f_app.common.knightknox_agents_password
        }
        login_result = f_app.request.post(login_url, login_credentials, headers=headers)
        cookies = login_result.cookies

        search_url = "http://agents.knightknox.com/projects/"
        if login_result.status_code == 200:
            project_dict = {}
            list_page_dom_root = q(login_result.content)
            options = list_page_dom_root('select[name=project]').children()
            for option in options:
                if option.attrib["value"].strip():
                    project_dict[option.attrib["value"]] = option.text.strip()

        project_properties = [
            (1, "Burgess House, Newcastle", "5451545c6a57070039e5eb4e"),
            (21, "Chronicle House, Chester", "5450da5e6a57070039e5eb49"),
            (26, "East Point, Leeds", "54519c8b6a5707003de5eb49"),
            (24, "Sovereign House, Sheffield", "5452336e6a57070040e5eb47"),
            (16, "The Queen's Brewery, Manchester", "5453c21ae7f2ca00310e291e"),
            (28, "X1 Eastbank, Manchester", "5452d68a6a570700e60fa456"),
            (25, "X1 Liverpool One Phase 1", "5452eb706a570700e60fa5de"),
            (18, "X1 The Edge, Liverpool", "54539b0d6a57070260ddbe33"),
            (13, "X1 The Exchange, Manchester", "545275a86a570700e00fa873"),
            (14, "X1 The Gallery, Liverpool", "545249246a570700df0fa4fe")
        ]

        for item in project_properties:
            key, value, property_id = item
            # property_params = {
            #     "country": ObjectId(f_app.enum.get_by_slug('GB')['id']),
            # }
            property_crawler_id = "%s%s" % (search_url, key)
            # property_id_list = f_app.property.search({"property_crawler_id": property_crawler_id})
            # if property_id_list:
            #     property_id = property_id_list[0]
            # else:
            #     property_params["property_crawler_id"] = property_crawler_id
            #     value = value.split(',')

            #     if len(value) == 2:
            #         name, city = value
            #         property_params["name"] = {"en_GB": name.strip(), "zh_Hans_CN": name.strip()}
            #         property_params["slug"] = name.strip().lower().replace(' ', '-')
            #         property_params["city"] = ObjectId(f_app.enum.get_by_slug("%s" % city.strip().lower())['id'])
            #     elif len(value) == 1:
            #         property_params["name"] = {"en_GB": value[0].strip(), "zh_Hans_CN": value[0].strip()}
            #         property_params["slug"] = value[0].strip().lower().replace(' ', '-')
            #         if "Liverpool" in property_params["name"]:
            #             property_params["city"] = ObjectId(f_app.enum.get_by_slug("liverpool")['id'])
            #     else:
            #         logger.warning("Invalid knightknox agents plot name, this may be a bug!")

            #     property_params["status"] = "draft"
            #     logger.debug(property_params)
            #     property_id = f_app.property.add(property_params)

            property_plot_page = f_app.request.get(property_crawler_id, headers=headers, cookies=cookies)
            if property_plot_page.status_code == 200:
                logger.debug("Start crawling page %s" % property_crawler_id)
                property_plot_page_dom_root = q(property_plot_page.content)
                data_rows = property_plot_page_dom_root('#myTable>tbody>tr')
                for row in data_rows:
                    plot_params = dict()
                    plot_params["property_id"] = ObjectId(property_id)
                    plot_params["name"] = {"en_GB": row[0].text, "zh_Hans_CN": row[0].text}
                    plot_params["plot_crawler_id"] = row[0].text
                    status = row[1].text.strip()
                    if status == "Available":
                        plot_params["status"] = "selling"
                    elif status == "Reservation Issued":
                        plot_params["status"] = "sold out"
                    investment_type = row[2].text.strip()
                    if "Studio" in investment_type:
                        plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:studio")["id"])
                    elif "Apartment" in investment_type:
                        plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:apartment")["id"])
                    elif "Double Room" in investment_type:
                        plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:double_room")["id"])
                    else:
                        logger.warning("Unknown investment_type %s, this may be a bug!" % investment_type)
                    plot_params["bedroom_count"] = int(row[3].text)
                    plot_params["bathroom_count"] = int(row[4].text)
                    plot_params["space"] = {"type": "area", "unit": "meter ** 2", "value": row[5].text}
                    total_price = re.findall(r'[0-9,]+', row[6].text)
                    if total_price:
                        plot_params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
                    unitinfo = q(row[7])
                    floor = unitinfo('table.unitinfo>tr')[1][1]
                    plot_params["floor"] = floor.text

                    f_app.plot.crawler_insert_update(plot_params)

        f_app.task.put(dict(
            type="crawler_knightknox_agents",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_crawler_abacusinvestor(self, task):
        search_url = "http://www.abacusinvestor.com"
        list_page = f_app.request.get(search_url, retry=3)
        if list_page.status_code == 200:
            self.logger.debug("Start crawling abacusinvestor")
            list_page_dom_root = q(list_page.content)
            list_page_model_script = list_page_dom_root("head script")[1].text
            list_page_model_str = re.findall(r"(?<=publicModel = ).+?(?=;)", list_page_model_script)
            if list_page_model_str:
                list_page_model_json = json.loads(list_page_model_str[0])
                masterPage = list_page_model_json.get("pageList", {}).get("masterPage", [])
                pages = list_page_model_json.get("pageList", {}).get("pages", [])
                if masterPage and pages:
                    masterPage_json = f_app.request.get(masterPage[2], retry=3)
                    page_ids = []
                    if masterPage_json.status_code == 200:
                        masterPage_document_data = json.loads(masterPage_json.content).get("data", {}).get("document_data", {})
                        for key in masterPage_document_data:
                            data_item = masterPage_document_data[key]
                            if data_item.get("type", None) == "Page" and data_item.get("pageUriSEO", None) and data_item.get("pageUriSEO", None) != "student-property-report" and data_item.get("hidePage", False) and data_item.get("indexable", False):
                                page_ids.append(key)
                    else:
                        self.logger.error("Failed crawling abacusinvestor  masterPage in script publicModel%s, status_code is %d" % (masterPage[2], masterPage_json.status_code))
                    if page_ids:
                        crawling_pages = [(page["pageId"], page["urls"][2]) for page in pages if page["pageId"] in page_ids]
                        for crawling_page in crawling_pages:
                            params = {
                                "country": "GB"
                            }
                            self.logger.debug("Start crawling abacusinvestor page id %s, page url %s" % crawling_page)
                            params["property_crawler_id"] = crawling_page[1]
                            property_page = f_app.request.get(crawling_page[1], retry=3)
                            if property_page.status_code == 200:
                                property_document_data = json.loads(property_page.content).get("data", {}).get("document_data", {})
                                property_images = [property_document_data[key]["items"] for key in property_document_data if property_document_data[key]["type"] == "ImageList"]
                                property_text = [property_document_data[key]["text"] for key in property_document_data if property_document_data[key]["type"] == "StyledText"]
                                property_images_urls = []
                                if property_images:
                                    property_images_ids = [property_image.replace("#", "")for property_image in property_images[0]]
                                    property_images_urls = ["http://static.wix.com/media/" + property_document_data[property_images_id]["uri"] for property_images_id in property_images_ids]

                                if property_text:
                                    property_text_dom_root = q(property_text[0])
                                    property_name_dom = property_text_dom_root("strong")
                                    if property_name_dom:
                                        property_name = q(property_name_dom[0]).text()
                                    else:
                                        property_name = ""
                                    property_description = property_text_dom_root.children().text()
                                    params["description"] = {"en_GB": property_description.strip()}
                                    if property_name:
                                        params["name"] = {"en_GB": property_name.strip()}
                                    total_price = re.findall(r'[0-9,]+', property_description)
                                    if total_price:
                                        params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
                                    if property_images_urls:
                                        reality_images = [property_images_url for property_images_url in property_images_urls]
                                        params["reality_images"] = {"en_GB": reality_images, "zh_Hans_CN": reality_images, "zh_Hant_HK": reality_images}
                                else:
                                    self.logger.error("Failed crawling abacusinvestor for reason: no html text in property_document_data")
                                f_app.property.crawler_insert_update(params)
                            else:
                                self.logger.error("Failed crawling abacusinvestor page id %s, page url %s, status_code is %d" % (crawling_page[0], crawling_page[1], property_page.status_code))
                    else:
                        self.logger.error("Failed crawling abacusinvestor for reason: no pageids")

                else:
                    self.logger.error("Failed crawling abacusinvestor for reason: no masterPage ,pages or pageList in script publicModel")
            else:
                self.logger.error("Failed crawling abacusinvestor for reason: no publicModel in script")
        else:
            self.logger.error("Failed crawling abacusinvestor home page %s ,status_code is %d" % (search_url, list_page.status_code))

        f_app.task.put(dict(
            type="crawler_abacusinvestor",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_crawler_selectproperty(self, task):
        import requests
        s = requests.Session()
        headers = {
            "Host": "ar-portal.selectproperty.com",
            "Origin": "http://ar-portal.selectproperty.com",
            "Referer": "http://ar-portal.selectproperty.com/login.aspx"
        }
        login_url = "http://ar-portal.selectproperty.com/Login.aspx?ReturnUrl=%2flisting.aspx"
        login_credentials = {
            "ctl00$Main$txtEmail": "mzhang@youngfunding.co.uk",
            "ctl00$Main$txtPassword": "Ma30Ch34",
            "ctl00$Main$btnLogin": "LOGIN  >",
            "__VIEWSTATE": "/wEPDwUJLTM1MDg0MzQxZGQHN4hPRnKD2d7hV805ujtXOOUG/UtSbXtMok8NtcC9fA==",
            "__EVENTVALIDATION": "/wEWBAKfsYDKAQK7h/n7BgKn47+hDgLkzv7OCHePjJX8HKP+nT6u2CzPpu2qwTvcw3g50v2G9ixkYidt"
        }
        login_result = s.post(login_url, login_credentials, headers=headers)
        cookies = login_result.cookies

        is_end = False
        page_count = 0
        search_url = "http://ar-portal.selectproperty.com/listing.aspx"
        list_page_dom_root = q(login_result.content).xhtml_to_html()
        while not is_end:
            page_count += 1
            if list_page_dom_root('#Main_btnNext'):
                pass
            else:
                is_end = True
            logger.debug("start crawling page %d" % page_count)
            table = list_page_dom_root('div#contenttabbox table tr:not([style])')
            for row in table:
                plot_params = {}
                property_name, plot_name = [x.strip() for x in q(row[0]).text().rsplit(' ', 1)]
                plot_params["name"] = {"en_GB": q(row[0]).text().strip()}
                plot_params["country"] = "GB"
                plot_params["plot_crawler_id"] = q(row[0]).text()

                if property_name == "Vita Student Westgate":
                    plot_params["property_id"] = ObjectId("5446e58cc078a20042679379")
                elif property_name == "Vita Student Telephone House":
                    plot_params["property_id"] = ObjectId("544fc68d6a57070031e5eb47")
                else:
                    logger.debug("Unknown property_name:", property_name, " (skipping)")
                    continue

                # property_crawler_id = "%s/%s" % (search_url, property_name)
                # property_id_list = f_app.property.search({"property_crawler_id": property_crawler_id})
                # if property_id_list:
                #     plot_params["property_id"] = ObjectId(property_id_list[0])
                # else:
                #     property_params = {}
                #     property_params["property_crawler_id"] = property_crawler_id
                #     property_params["country"] = ObjectId(f_app.enum.get_by_slug('GB')['id']),
                #     property_params["name"] = {"en_GB": property_name}
                #     property_params["status"] = "draft"
                #     plot_params["property_id"] = ObjectId(f_app.property.add(property_params))

                row_price = q(row[2]).text().replace(',', '').split(' ')
                if len(row_price) == 2:
                    plot_params["total_price"] = {"value": row_price[1], "type": "currency", "unit": row_price[0]}

                if q(row[3]).text().strip() == "Studio":
                    plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:studio")["id"])
                else:
                    bedroom_text = q(row[3]).text()
                    if bedroom_text:
                        plot_params["bedroom_count"] = int(bedroom_text)

                plot_params["floor"] = q(row[4]).text()

                plot_params["space"] = {"type": "area", "unit": "foot ** 2", "value": q(row[6]).text().split('Sqft')[0].split()[0]}
                plot_params["status"] = "selling"

                plot_id = f_app.plot.crawler_insert_update(plot_params)
                logger.debug("plot inserted:", plot_id)

            next_page_params = {
                "ctl00$Main$btnNext": "NEXT PAGE >>",
                "__EVENTVALIDATION": list_page_dom_root('#__EVENTVALIDATION').val(),
                "__VIEWSTATE": list_page_dom_root('#__VIEWSTATE').val()
            }
            if not is_end:
                list_page_next = s.post(search_url, next_page_params, cookies=cookies)
                if list_page_next.status_code == 200:
                    list_page_dom_root = q(list_page_next.content).xhtml_to_html()

        f_app.task.put(dict(
            type="crawler_selectproperty",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_update_landregistry(self, taks):
        f_app.landregistry.check_update()
        f_app.task.put(dict(
            type="update_landregistry",
            start=datetime.utcnow() + timedelta(days=30),
        ))

    def task_on_mapreduce_landregistry(self, taks):
        f_app.landregistry.aggregation_monthly()
        f_app.task.put(dict(
            type="mapreduce_landregistry",
            start=datetime.utcnow() + timedelta(days=30),
        ))

    def order_update_after(self, order_id, params, order, ignore_error=True):
        if "status" in params.get("$set", {}):
            if order.get("status") == "paid":
                if order.get("type") == "investment":
                    f_app.shop.update_funding_available(order["items"][0]["id"])
                    if order["user"].get("email"):
                        f_app.email.schedule(
                            target=order["user"]["email"],
                            subject=template("views/static/emails/crowdfunding_notification_title.html"),
                            text=template(
                                "views/static/emails/crowdfunding_notification",
                                nickname=order["user"]["nickname"],
                                order_price=order["price"],
                                order_item_name=order["items"][0]["name"],
                                order_link="http://%s/crowdfunding/%s" % (request.urlparts[1], order["items"][0]["id"]),
                            ),
                            display="html",
                            sendgrid_args={"category": "crowdfunding_notification"},
                        )
            elif order.get("status") == "canceled":
                if order.get("type") == "investment":
                    if order["user"].get("email"):
                        f_app.email.schedule(
                            target=order["user"]["email"],
                            subject=template("views/static/emails/crowdfunding_notification_title_canceled"),
                            text=template(
                                "views/static/emails/crowdfunding_notification_canceled",
                                nickname=order["user"]["nickname"],
                                order_item_name=order["items"][0]["name"],
                                order_canceled_reason=order.get("canceled_reason"),
                            ),
                            display="html",
                            sendgrid_args={"category": "crowdfunding_notification"},
                        )

    def route_log_kwargs(self, kwargs):
        if kwargs.get("route"):
            property_id = re.findall(r"^/property/([0-9a-fA-F]{24})", kwargs["route"])
            if property_id:
                kwargs["property_id"] = property_id[0]
            rent_ticket_id = re.findall(r"^/property-to-rent/([0-9a-fA-F]{24})", kwargs["route"])
            if rent_ticket_id:
                kwargs["rent_ticket_id"] = rent_ticket_id[0]

        return kwargs

    def shop_item_add_pre(self, params):
        params["mtime"] = datetime.utcnow()
        return params

    def shop_item_update_pre(self, params, shop_id, item_id):
        if "$set" in params:
            params["$set"]["mtime"] = datetime.utcnow()
        return params

f_currant_plugins()


class f_property(f_app.module_base):
    property_database = "propertys"

    def __init__(self):
        f_app.module_install("property", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.property_database)

    @f_cache("property")
    def get(self, property_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(property):
            if "loc" in property:
                property["longitude"], property["latitude"] = property.pop("loc")
            return f_app.util.process_objectid(property)

        if isinstance(property_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(property_id) for property_id in property_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(property_id_or_list) and not ignore_nonexist:
                found_list = map(lambda property: str(property["_id"]), result_list)
                abort(40400, logger.warning("Non-exist property:", filter(lambda property_id: property_id not in found_list, property_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist property:", filter(lambda property_id: property_id not in found_list, property_id_or_list), exc_info=False)

            for property in result_list:
                result[property["id"]] = _format_each(property)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(property_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist property:", property_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist property:", property_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params, _ignore_render_pdf=False):
        params.setdefault("status", "draft")
        params.setdefault("time", datetime.utcnow())
        params.setdefault("mtime", datetime.utcnow())

        if "latitude" in params and "longitude" in params:
            params["loc"] = [
                params.pop("longitude"),
                params.pop("latitude"),
            ]
        elif "latitude" in params or "longitude" in params:
            abort(40000, self.logger.warning("latitude and longitude must be present together"))

        if not _ignore_render_pdf and "brochure" in params:
            for item in params["brochure"]:
                item["rendering"] = True

        with f_app.mongo() as m:
            property_id = self.get_database(m).insert(params)
            self.get_database(m).ensure_index([("loc", GEO2D)])

        if params["status"] in ("selling", "hidden", "sold out"):
            f_app.task.put(dict(
                type="assign_property_short_id",
                property_id=str(property_id),
            ))

        elif not _ignore_render_pdf and "brochure" in params and params["brochure"]:
            for item in params["brochure"]:
                f_app.task.add(dict(
                    type="render_pdf",
                    url=item["url"],
                    property_id=str(property_id),
                    property_field="brochure",
                ))

        if params["status"] in ("selling", "sold out"):
            f_app.task.put(dict(
                type="ping_sitemap",
            ))

        return str(property_id)

    def output(self, property_id_list, ignore_nonexist=False, multi_return=list, force_reload=False, permission_check=True, location_only=False):
        ignore_sales_comment = True
        propertys = self.get(property_id_list, ignore_nonexist=ignore_nonexist, force_reload=force_reload)
        if permission_check:
            user = f_app.user.login.get()
            if user:
                user_roles = f_app.user.get_role(user["id"])
                if not location_only:
                    if set(["admin", "jr_admin", "sales", "jr_sales"]) & set(user_roles):
                        ignore_sales_comment = False

        for property in propertys:
            if isinstance(property, dict):
                if not location_only:
                    if permission_check and not user:
                        if "brochure" in property:
                            for item in property["brochure"]:
                                item.pop("url", None)
                                item["rendered"] = item.get("rendered", [])[:5]
                    if permission_check and (not user or not len(user_roles)):
                        property.pop("real_address", None)
                    if ignore_sales_comment:
                        property.pop("sales_comment", None)
                if property["status"] not in ["selling", "sold out", "restricted"] and permission_check:
                    assert property.get("user_generated") or user and set(user_roles) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_property_id")

        if location_only:
            new_property_list = []
            for property in propertys:
                new_property = {"id": property["id"]}
                if "latitude" in property:
                    new_property.update(dict(
                        latitude=property["latitude"],
                        longitude=property["longitude"],
                    ))
                new_property_list.append(new_property)
            propertys = new_property_list

        if multi_return == list:
            return propertys

        else:
            return dict(zip(property_id_list, propertys))

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10, count=False, time_field="time"):
        f_app.util.process_search_params(params)
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        if count:
            property_id_list = f_app.mongo_index.search(self.get_database, params, count=count, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)
        else:
            property_id_list = f_app.mongo_index.search(self.get_database, params, count=count, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)['content']

        return property_id_list

    def crawler_insert_update(self, params):
        from property_api_interface import property_params
        property_crawler_id = params.pop("property_crawler_id")

        params = f_app.param_parser(_source=params, **property_params)

        current_records = self.search({"property_crawler_id": property_crawler_id, "target_property_id": {"$exists": False}, "status": {"$exists": True}})
        assert len(current_records) <= 2, self.logger.error("Multiple property found for property_crawler_id:", property_crawler_id)

        if len(current_records):
            current_record = self.get(current_records[0], ignore_nonexist=True)

            if current_record is None:
                return

            else:
                if "target_property_id" in current_record and current_record["target_property_id"] == current_records[-1]:
                    current_record = self.get(current_records[-1], ignore_nonexist=True)

                    if current_record is None:
                        current_record = self.get(current_records[0], ignore_nonexist=True)

            for key in list(params.keys()):
                if params[key] == current_record.get(key):
                    params.pop(key)

            property_id = current_record["id"]
            existing_draft = f_app.property.search({"target_property_id": property_id, "status": {"$ne": "deleted"}})

            if existing_draft:
                action = lambda _params: f_app.property.update_set(existing_draft[0], _params)

            else:
                params.setdefault("status", "draft")
                params["target_property_id"] = property_id
                action = lambda params: f_app.property.add(params)

        else:
            params.setdefault("status", "draft")
            params.setdefault("property_crawler_id", property_crawler_id)
            action = lambda params: f_app.property.add(params)

        return action(params)

    def remove(self, property_id):
        for child_property_id in self.search({'target_property_id': str(property_id)}, per_page=0):
            self.remove(child_property_id)
        self.update_set(property_id, {"status": "deleted"})

    def get_nearby(self, params, output=True):
        latitude = params.pop("latitude")
        longitude = params.pop("longitude")
        search_range = params.pop("search_range")

        search_command = SON([
            ('geoNear', self.property_database),
            ('near', [float(longitude), float(latitude)]),
            ('maxDistance', search_range * 1.0 / f_app.common.earth_radius),
            ('spherical', True),
            ('query', params),
            ('num', 20),
        ])

        with f_app.mongo() as m:
            tmp_result = m.command(search_command)["results"]

        self.logger.debug(tmp_result)
        result = []
        property_id_list = map(lambda item: str(item["obj"]["_id"]), tmp_result)

        if not output:
            return property_id_list

        property_dict = self.output(property_id_list, multi_return=dict)

        for tmp_property in tmp_result:

            distance = tmp_property["dis"] * f_app.common.earth_radius
            property = property_dict.get(str(tmp_property["obj"].pop("_id")))
            property["distance"] = distance

            result.append(property)

        return result

    def update(self, property_id, params, _ignore_render_pdf=False):
        if "$set" in params:
            params["$set"].setdefault("mtime", datetime.utcnow())
            if "latitude" in params["$set"] and "longitude" in params["$set"]:
                params["$set"]["loc"] = [
                    params["$set"].pop("longitude"),
                    params["$set"].pop("latitude"),
                ]
            elif "latitude" in params["$set"] or "longitude" in params["$set"]:
                abort(40000, self.logger.warning("latitude and longitude must be present together", exc_info=False))

            if not _ignore_render_pdf and "brochure" in params["$set"] and params["$set"]["brochure"]:
                old_property = f_app.property.get(property_id)
                old_urls = map(lambda item: item["url"], old_property.get("brochure", []))
                for item in params["$set"]["brochure"]:
                    if item["url"] not in old_urls:
                        item["rendering"] = True

        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(property_id)},
                params,
            )
        property = self.get(property_id, force_reload=True)

        if property is not None:
            if property["status"] in ("selling", "hidden", "sold out"):
                if "short_id" not in property:
                    f_app.task.put(dict(
                        type="assign_property_short_id",
                        property_id=property_id,
                    ))

            elif not _ignore_render_pdf and "$set" in params and "brochure" in params["$set"] and params["$set"]["brochure"]:
                old_urls = map(lambda item: item["url"], old_property.get("brochure", []))
                for item in params["$set"]["brochure"]:
                    if item["url"] not in old_urls:
                        f_app.task.add(dict(
                            type="render_pdf",
                            url=item["url"],
                            property_id=str(property_id),
                            property_field="brochure",
                        ))

            if property["status"] in ("selling", "sold out") and "params" in params.get("$set", {}):
                f_app.task.put(dict(
                    type="ping_sitemap",
                ))

        return property

    def update_set(self, property_id, params, _ignore_render_pdf=False):
        return self.update(property_id, {"$set": params}, _ignore_render_pdf=_ignore_render_pdf)

    @f_cache("propertybyslug")
    def get_by_slug(self, slug, force_reload=False):
        if f_app.common.test:
            return f_app.mock_data["property_get_by_slug"]

        with f_app.mongo() as m:
            property = self.get_database(m).find_one({
                "slug": slug,
                "status": {
                    "$ne": "deleted",
                }
            })
            if not force_reload:
                assert property is not None, abort(40000)

        return f_app.util.process_objectid(property)

f_property()


class f_plot(f_app.module_base):
    plot_database = "plots"

    def __init__(self):
        f_app.module_install("plot", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.plot_database)

    @f_cache("plot", support_multi=True)
    def get(self, plot_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(plot):
            return f_app.util.process_objectid(plot)

        if isinstance(plot_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(plot_id) for plot_id in plot_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(plot_id_or_list) and not ignore_nonexist:
                found_list = map(lambda plot: str(plot["_id"]), result_list)
                abort(40400, logger.warning("Non-exist plot:", filter(lambda plot_id: plot_id not in found_list, plot_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist plot:", filter(lambda plot_id: plot_id not in found_list, plot_id_or_list), exc_info=False)

            for plot in result_list:
                result[plot["id"]] = _format_each(plot)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(plot_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist plot:", plot_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist plot:", plot_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        if "property_id" in params:
            f_app.property.get(params["property_id"])
        else:
            abort(40000, logger.warning("Invalid params: property_id not present"))
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            plot_id = self.get_database(m).insert(params)

        return str(plot_id)

    def output(self, plot_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        plots = self.get(plot_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return plots

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        plot_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return plot_id_list

    def remove(self, plot_id):
        self.update_set(plot_id, {"status": "deleted"})

    def update(self, plot_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(plot_id)},
                params,
            )
        plot = self.get(plot_id, force_reload=True)
        return plot

    def update_set(self, plot_id, params):
        return self.update(plot_id, {"$set": params})

    def crawler_insert_update(self, params):
        from plot_api_interface import plot_params
        plot_crawler_id = params.pop("plot_crawler_id")

        params = f_app.param_parser(_source=params, **plot_params)

        current_records = self.search({"plot_crawler_id": plot_crawler_id, "status": {"$exists": True}})
        assert len(current_records) <= 1, self.logger.error("Multiple plot found for plot_crawler_id:", plot_crawler_id)

        if len(current_records):
            current_record = self.get(current_records[0], ignore_nonexist=True)

            if current_record is None:
                return

            for key in list(params.keys()):
                if params[key] == current_record.get(key):
                    params.pop(key)

            plot_id = current_record["id"]

            action = lambda _params: f_app.plot.update_set(plot_id, _params)

        else:
            params.setdefault("plot_crawler_id", plot_crawler_id)
            action = lambda params: f_app.plot.add(params)

        return action(params)

f_plot()


class f_report(f_app.module_base):
    report_database = "reports"

    def __init__(self):
        f_app.module_install("report", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.report_database)

    @f_cache("report")
    def get(self, report_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(report):
            return f_app.util.process_objectid(report)

        if isinstance(report_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(report_id) for report_id in report_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(report_id_or_list) and not ignore_nonexist:
                found_list = map(lambda report: str(report["_id"]), result_list)
                abort(40400, logger.warning("Non-exist report:", filter(lambda report_id: report_id not in found_list, report_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist report:", filter(lambda report_id: report_id not in found_list, report_id_or_list), exc_info=False)

            for report in result_list:
                result[report["id"]] = _format_each(report)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(report_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist report:", report_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist report:", report_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            report_id = self.get_database(m).insert(params)

        return str(report_id)

    def output(self, report_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        reports = self.get(report_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return reports

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        report_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return report_id_list

    def remove(self, report_id):
        self.update_set(report_id, {"status": "deleted"})

    def update(self, report_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(report_id)},
                params,
            )
        report = self.get(report_id, force_reload=True)
        return report

    def update_set(self, report_id, params):
        return self.update(report_id, {"$set": params})

f_report()


class f_zipcode(f_app.module_base):
    zipcode_database = "zipcodes"

    def __init__(self):
        f_app.module_install("zipcode", self)
        f_app.dependency_register("pymongo", race="python")

    def get_database(self, m):
        return getattr(m, self.zipcode_database)

    @f_cache("zipcode")
    def get(self, zipcode_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(zipcode):
            return f_app.util.process_objectid(zipcode)

        if isinstance(zipcode_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(zipcode_id) for zipcode_id in zipcode_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(zipcode_id_or_list) and not ignore_nonexist:
                found_list = map(lambda zipcode: str(zipcode["_id"]), result_list)
                abort(40400, logger.warning("Non-exist zipcode:", filter(lambda zipcode_id: zipcode_id not in found_list, zipcode_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist zipcode:", filter(lambda zipcode_id: zipcode_id not in found_list, zipcode_id_or_list), exc_info=False)

            for zipcode in result_list:
                result[zipcode["id"]] = _format_each(zipcode)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(zipcode_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist zipcode:", zipcode_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist zipcode:", zipcode_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        assert all(("zipcode" in params,
                    "country" in params,
                    not self.search({"country": params["country"], "zipcode": params["zipcode"], "status": {"$ne": "deleted"}}))), abort(40000, params, exc_info=False)

        with f_app.mongo() as m:
            zipcode_id = self.get_database(m).insert(params)

        return str(zipcode_id)

    def output(self, zipcode_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        zipcodes = self.get(zipcode_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return zipcodes

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        zipcode_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return zipcode_id_list

    def get_by_zipcode(self, zipcode):
        id_list = self.search({"zipcode": zipcode, "status": {"$ne": "deleted"}})
        if id_list:
            return self.output(id_list)[0]
        else:
            return None

    def remove(self, zipcode_id):
        self.update_set(zipcode_id, {"status": "deleted"})

    def update(self, zipcode_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(zipcode_id)},
                params,
            )
        zipcode = self.get(zipcode_id, force_reload=True)
        return zipcode

    def update_set(self, zipcode_id, params):
        return self.update(zipcode_id, {"$set": params})

f_zipcode()


class f_currant_util(f_util):
    def parse_budget(self, budget):
        if isinstance(budget, six.string_types) or isinstance(budget, ObjectId):
            budget = f_app.enum.get(budget)
        elif isinstance(budget, dict):
            if "_id" in budget:
                budget = f_app.enum.get(budget["_id"])
            elif "id" in budget:
                budget = f_app.enum.get(budget["id"])
            else:
                raise TypeError
        else:
            abort(40000, self.logger.warning("wrong type, cannot parse budget", exc_info=False))

        assert budget["type"] in ["budget", "rent_budget"], abort(40000, self.logger.warning("wrong type, cannot parse budget", exc_info=False))
        assert budget.get("slug") is not None and budget["slug"].startswith(budget["type"] + ":"), abort(self.logger.warning("wrong type, cannot parse budget", exc_info=False))
        assert budget.get("currency") is not None and budget["currency"] in f_app.common.currency, abort(self.logger.warning("wrong type, cannot parse budget", exc_info=False))

        price_group = [x.strip() for x in budget["slug"].split(budget["type"] + ":")[-1].split(",")]

        assert len(price_group) == 3, abort(40000, self.logger.warning("Invalid budget slug", exc_info=False))
        assert price_group[2] in f_app.common.currency, abort(self.logger.warning("wrong type, cannot parse budget", exc_info=False))

        price_group[0] = float(price_group[0])if price_group[0] else None
        price_group[1] = float(price_group[1])if price_group[1] else None

        return price_group

    def parse_bedroom_count(self, bedroom_count):
        if isinstance(bedroom_count, six.string_types) or isinstance(bedroom_count, ObjectId):
            bedroom_count = f_app.enum.get(bedroom_count)
        elif isinstance(bedroom_count, dict):
            if "_id" in bedroom_count:
                bedroom_count = f_app.enum.get(bedroom_count["_id"])
            elif "id" in bedroom_count:
                bedroom_count = f_app.enum.get(bedroom_count["id"])
            else:
                raise TypeError
        else:
            abort(40000, self.logger.warning("wrong type, cannot parse bedroom_count", exc_info=False))

        assert bedroom_count["type"] == "bedroom_count", abort(40000, self.logger.warning("wrong type, cannot parse bedroom_count", exc_info=False))
        assert bedroom_count.get("slug") is not None and bedroom_count["slug"].startswith("bedroom_count:"), abort(self.logger.warning("wrong type, cannot parse bedroom_count", exc_info=False))

        bedroom_count_group = [x.strip() for x in bedroom_count["slug"].split("bedroom_count:")[-1].split(",")]

        assert len(bedroom_count_group) == 2, abort(40000, self.logger.warning("Invalid bedroom_count slug", exc_info=False))

        bedroom_count_group[0] = int(bedroom_count_group[0])if bedroom_count_group[0] else None
        bedroom_count_group[1] = int(bedroom_count_group[1])if bedroom_count_group[1] else None

        return bedroom_count_group

    def parse_building_area(self, building_area):
        if isinstance(building_area, six.string_types) or isinstance(building_area, ObjectId):
            building_area = f_app.enum.get(building_area)
        elif isinstance(building_area, dict):
            building_area = f_app.enum.get(building_area["_id"])
        else:
            abort(40000, self.logger.warning("wrong type, cannot parse building_area", exc_info=False))

        assert building_area["type"] == "building_area", abort(40000, self.logger.warning("wrong type, cannot parse building_area", exc_info=False))
        assert building_area.get("slug") is not None and building_area["slug"].startswith("building_area:"), abort(self.logger.warning("wrong type, cannot parse building_area", exc_info=False))

        building_area_group = [x.strip() for x in building_area["slug"].split("building_area:")[-1].split(",")]

        assert len(building_area_group) == 3, abort(40000, self.logger.warning("Invalid building_area slug", exc_info=False))
        assert building_area_group[2] in ("meter_**_2", "foot_**_2"), abort(self.logger.warning("wrong type, cannot parse building_area", exc_info=False))

        building_area_group[0] = float(building_area_group[0])if building_area_group[0] else None
        building_area_group[1] = float(building_area_group[1])if building_area_group[1] else None
        building_area_group[2] = building_area_group[2].replace('_', ' ')

        return building_area_group

    def get_format_email_subject(self, subject):
        host = request.urlparts[1]
        if "currant-dev" in host:
            return "<currant-dev>" + subject
        elif "currant-test" in host:
            return "<currant-test>" + subject
        elif "127.0.0.1" in host:
            return "<currant-localhost>" + subject
        return subject

    # TODO: now we only consider UK
    def find_region_report(self, zipcode, maponics_neighborhood_id=None):
        # Try to find neighborhood first
        if False and maponics_neighborhood_id:
            region_report = f_app.report.search({"maponics_neighborhood._id": ObjectId(maponics_neighborhood_id)})
            if len(region_report) == 1:
                return region_report[0]
            elif len(region_report) > 1:
                self.logger.warning("Multiple region report found for neighborhood", maponics_neighborhood_id, ", ignoring region report assignment.")
                return

        params = {"postcode_index": zipcode.replace(" ", ""), "country": "GB"}
        postcode = f_app.geonames.postcode.get(f_app.geonames.postcode.search(params, per_page=-1))
        if len(postcode) == 1:
            region_report = f_app.report.search({"zipcode_index": postcode[0]["postcode"].split()[0], "country.code": "GB", "maponics_neighborhood": {"$exists": False}})
            if len(region_report) == 1:
                return region_report[0]

            else:
                self.logger.warning("Multiple or no region report found for zipcode", zipcode, ", ignoring region report assignment.")

        else:
            self.logger.warning("Multiple or no zipcode record found for zipcode", zipcode, ", ignoring region report assignment.")

        return None

f_currant_util()


class f_policeuk(f_app.module_base):
    def __init__(self):
        f_app.module_install("policeuk", self)

    def api(self, params, method="GET"):
        """
        fields for params:
        lat: latitude
        lng: longitude
        date: YYYY-MM, from 2010-12
        """
        if params:
            params = urllib.parse.urlencode(params)
        url = "http://data.police.uk/api/crimes-street/all-crime?%s" % params
        self.logger.debug(url)
        result = f_app.request(url)
        if result.status_code == 200:
            return json.loads(result.content)
        else:
            abort(50000)

    def api_categories(self, params, method="GET"):
        if params:
            params = urllib.parse.urlencode(params)
        url = "http://data.police.uk/api/crime-categories?%s" % params
        result = f_app.request(url)
        if result.status_code == 200:
            return json.loads(result.content)
        else:
            abort(50000)

    def get_crime_by_zipcode(self, zipcode, date=None):
        zipcode_info = f_app.zipcode.get_by_zipcode(zipcode)
        if zipcode_info:
            if date:
                params = {"lat": zipcode_info["latitude"], "lng": zipcode_info["longitude"], "date": date}
            else:
                params = {"lat": zipcode_info["latitude"], "lng": zipcode_info["longitude"]}
            crime_info = self.api(params)
            return crime_info
        else:
            return None

f_policeuk()


class f_doogal(f_app.module_base):
    doogal_database = "doogal"

    def __init__(self):
        f_app.module_install("doogal", self)

    def get_database(self, m):
        return getattr(m, self.doogal_database)

    @f_cache("doogal_districts_wards", noid=True)
    def get_districts_wards(self):
        districts = defaultdict(set)
        with f_app.mongo() as m:
            for item in self.get_database(m).find({}, {"district": 1, "ward": 1}):
                districts[item["district"]].add(item["ward"])

        return districts

    def import_new(self, path):
        with f_app.mongo() as m:
            self.get_database(m).ensure_index([("currant_country", ASCENDING)])
            self.get_database(m).ensure_index([("zipcode", ASCENDING)])
            self.get_database(m).ensure_index([("currant_region", ASCENDING)])
            with open(path, 'rw+') as f:
                rows = csv.reader(f)

                first = True
                count = 0
                for r in rows:
                    # Ignore first line
                    if first:
                        first = False
                        continue

                    params = {
                        "currant_country": "GB",  # Hardcoded
                        "zipcode": r[0],
                        "latitude": float(r[1]),
                        "longitude": float(r[2]),
                        "easting": r[3],
                        "northing": r[4],
                        "gridref": r[5],
                        "county": r[6],
                        "district": r[7],
                        "ward": r[8],
                        "currant_region": r[8],  # We take ward as region
                        "district_code": r[9],
                        "ward_code": r[10],
                        "country": r[11],
                        "country_code": r[12],
                        "constituency": r[13],
                        "introduced": r[14],
                        "terminated": r[15],
                        "parish": r[16],
                        "national_park": r[17],
                        "population": int(r[18]) if r[18] else r[18],
                        "household": int(r[19]) if r[19] else r[19],
                        "built_up_area": r[20],
                        "built_up_sub_division": r[21],
                        "lower_layer_super_output_area": r[22],
                        "rural_urban": r[23],
                        "region": r[24],
                    }
                    self.get_database(m).update({
                        "currant_country": params["currant_country"],
                        "zipcode": params["zipcode"],
                    }, {"$set": params}, upsert=True)
                    count += 1
                    if count % 100 == 1:
                        logger.debug("doogal postcode imported", count, "records...")

f_doogal()


class f_landregistry(f_app.module_base):

    landregistry_database = "landregistry"

    def __init__(self):
        f_app.module_install("landregistry", self)

    def get_database(self, m):
        return getattr(m, self.landregistry_database)

    def import_new(self, path):
        with f_app.mongo() as m:
            with open(path, 'rw+') as f:
                rows = csv.reader(f)
                for r in rows:
                    params = {
                        "tid": r[0],
                        "price": float(r[1]),
                        "date": datetime.strptime(r[2], "%Y-%m-%d %H:%M"),
                        "zipcode": r[3],
                        "zipcode_index": r[3].split(' ')[0],
                        "type": r[4],
                        "is_new": r[5],
                        "duration": r[6],
                        "paon": r[7].decode('latin1'),
                        "saon": r[8].decode('latin1'),
                        "street": r[9].decode('latin1'),
                        "locality": r[10].decode('latin1'),
                        "city": r[11].decode('latin1'),
                        "district": r[12].decode('latin1'),
                        "country": r[13].decode('latin1'),
                        "status": r[14]
                    }
                    self.get_database(m).insert(params)

    def check_update(self):
        csv_url = "http://publicdata.landregistry.gov.uk/market-trend-data/price-paid-data/b/pp-monthly-update-new-version.csv"
        page_url = 'https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads'
        page = f_app.request.get(page_url, retry=5)

        if page.status_code == 200:
            dom_root = q(page.content)
            date = q(dom_root('.govspeak h2')[0]).text()
            with f_app.mongo() as m:
                result = m.misc.find_one({"landregistry_last_modified": {"$type": 2}})
                if result:
                    if result["landregistry_last_modified"] == date:
                        self.logger.debug("landregistry data is already up-to-date.")
                    else:
                        # Has new version
                        logger.debug("start downloading csv...")
                        csv_request = f_app.request.get(csv_url, retry=5)
                        if csv_request.status_code == 200:
                            csv_file = StringIO(csv_request.content)
                            rows = csv.reader(csv_file.readlines())
                            for r in rows:
                                params = {
                                    "tid": r[0],
                                    "price": float(r[1]),
                                    "date": datetime.strptime(r[2], "%Y-%m-%d %H:%M"),
                                    "zipcode": r[3],
                                    "zipcode_index": r[3].split(' ')[0],
                                    "type": r[4],
                                    "is_new": r[5],
                                    "duration": r[6],
                                    "paon": r[7].decode('latin1'),
                                    "saon": r[8].decode('latin1'),
                                    "street": r[9].decode('latin1'),
                                    "locality": r[10].decode('latin1'),
                                    "city": r[11].decode('latin1'),
                                    "district": r[12].decode('latin1'),
                                    "country": r[13].decode('latin1'),
                                    "status": r[14]
                                }

                                if self.get_database(m).find_one({"tid": r[0], "status": r[14]}):
                                    logger.warning("Already added %s" % r[0])
                                elif r[14] != "A":
                                    if r[14] == "D":
                                        self.get_database(m).remove({"tid": r[0]})
                                    else:
                                        params.pop("status")
                                        logger.debug(params)
                                        self.get_database(m).update({"tid": r[0]}, params)
                                else:
                                    self.get_database(m).insert(params)
                            m.misc.update({"_id": result["_id"]}, {"$set": {"landregistry_last_modified": date}})
                        else:
                            abort(40000, self.logger.warning("Failed to get latest csv file on landregistry", exc_info=False))
                else:
                    m.misc.insert({"landregistry_last_modified": date})
        else:
            abort(40000, self.logger.warning("Failded to open landregistry data page", exc_info=False))

    @f_cache('homevalues')
    def get_month_average_by_zipcode_index(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        with f_app.mongo() as m:
            result = m.landregistry_statistics.find({"_id.zipcode_index": zipcode_index, "_id.type": {"$exists": False}})
        merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)

        x = [i['date'] for i in merged_result]
        y = np.array([i['average_price'] for i in merged_result])

        fig, ax = plt.subplots()

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)

        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
            markersize = 2
        else:
            fontsize = 4
            markersize = 1
        fontprop.set_size(fontsize)

        ax.plot(x, y, "#e70012", marker="o", markeredgecolor="#e70012", markersize=markersize)
        ax.autoscale_view()

        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }
        ax.set_xlabel(u'年', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel(u'英镑', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.05)
        ax.yaxis.set_label_coords(-0.025, 1.05)

        plt.setp(ax.get_xticklabels(), fontsize=fontsize)
        plt.setp(ax.get_yticklabels(), fontsize=fontsize)
        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=30, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.yaxis.get_major_formatter().set_scientific(False)

        ax.fmt_xdata = DateFormatter('%Y-%m-%d')
        # fig.autofmt_xdate()
        # ax.set_xticks([i['date'] for i in merged_result], [i['average_price'] for i in merged_result])

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)

        return graph.getvalue()

    @f_cache('averagevalues')
    def get_average_values_by_zipcode_index(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        name_map = {
            "D": u"独立式别墅",
            "S": u"半独立式别墅",
            "T": u"联排别墅",
            "F": u"公寓"
        }

        with f_app.mongo() as m:
            result = list(m.landregistry_statistics.aggregate([{"$match": {"_id.zipcode_index": zipcode_index}}, {"$group": {"_id": "$_id.type", "sum_price": {"$sum": "$value.price"}, "sum_count": {"$sum": "$value.count"}}}]))
        merged_result = [i for i in result if i.get("_id")]

        ind = np.arange(len(merged_result))
        width = 0.25

        fig, ax = plt.subplots()
        ax.bar(ind, [float(x['sum_price']) / x['sum_count'] for x in merged_result], width, color=['#e70012', '#ff9c00', '#6fdb2d', '#00b8e6'], edgecolor="none", align="center")

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)
        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
        else:
            fontsize = 4
        fontprop.set_size(fontsize)

        ax.autoscale_view()

        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }

        ax.set_xlabel(u'类别', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel(u'英镑', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.05)
        ax.yaxis.set_label_coords(-0.025, 1.05)
        ax.set_xticks(ind)
        ax.set_xticklabels([name_map.get(x['_id']) for x in merged_result], fontsize=fontsize, fontproperties=fontprop)

        plt.setp(fig.gca().get_yticklabels(), fontsize=fontsize)
        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=30, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.yaxis.get_major_formatter().set_scientific(False)

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)
        graph.seek(0)

        return graph.getvalue()

    @f_cache('valuetrend')
    def get_month_average_by_zipcode_index_with_type(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        with f_app.mongo() as m:
            result = m.landregistry_statistics.find({"_id.zipcode_index": zipcode_index, "_id.type": {"$exists": True}})
        merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)

        dresult = []
        sresult = []
        tresult = []
        fresult = []
        for i in merged_result:
            if i.get("type") == "D":
                dresult.append(i)
            elif i.get("type") == "S":
                sresult.append(i)
            elif i.get("type") == "T":
                tresult.append(i)
            else:
                fresult.append(i)

        fig, ax = plt.subplots()

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)
        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
            markersize = 2
        else:
            fontsize = 4
            markersize = 1
        fontprop.set_size(fontsize)

        colors = ["#e70012", "#ff9c00", "#6fdb2d", "#00b8e6"]
        for result, color in zip([dresult, sresult, tresult, fresult], colors):
            ax.plot([i['date'] for i in result], [i['average_price'] for i in result], color, marker="o", markeredgecolor=color, markersize=markersize)

        legend = plt.legend([u"独立式", u"半独立式", u"联排", u"公寓"], loc='upper left', fontsize=fontsize, prop=fontprop)
        frame = legend.get_frame()
        frame.set_color('#f6f6f6')
        frame.set_edgecolor('#e6e6e6')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=30, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        for color, text in zip(colors, legend.get_texts()):
            text.set_color(color)

        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }

        ax.autoscale_view()
        ax.set_xlabel(u'年', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel(u'英镑', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.05)
        ax.yaxis.set_label_coords(-0.025, 1.05)

        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.fmt_xdata = DateFormatter('%Y-%m-%d')
        ax.yaxis.get_major_formatter().set_scientific(False)

        plt.setp(fig.gca().get_xticklabels(), fontsize=fontsize)
        plt.setp(fig.gca().get_yticklabels(), fontsize=fontsize)

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)

        return graph.getvalue()

    @f_cache('valueranges')
    def get_price_distribution_by_zipcode_index(self, zipcode_index_size, zipcode_index, size=[0, 0], force_reload=False):
        with f_app.mongo() as m:
            result_lt_100k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$lt": 100000}}).count()
            result_100k_200k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 100001, "$lt": 200000}}).count()
            result_200k_300k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 200001, "$lt": 300000}}).count()
            result_300k_400k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 300001, "$lt": 400000}}).count()
            result_400k_500k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 400001, "$lt": 500000}}).count()
            result_500k_600k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 500001, "$lt": 600000}}).count()
            result_600k_700k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 600001, "$lt": 700000}}).count()
            result_700k_800k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 700001, "$lt": 800000}}).count()
            result_800k_900k = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 800001, "$lt": 900000}}).count()
            result_900k_1m = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 900001, "$lt": 1000000}}).count()
            result_gte_1m = m.landregistry.find({"zipcode_index": zipcode_index, "price": {"$gte": 1000000}}).count()

        result_sum = result_lt_100k + result_100k_200k + result_200k_300k + result_300k_400k + result_400k_500k + result_500k_600k + result_600k_700k + result_700k_800k + result_800k_900k + result_900k_1m + result_gte_1m

        ind = np.arange(11)
        width = 0.5

        fig, ax = plt.subplots()

        fig_width, fig_height = size
        fig_width, fig_height = float(fig_width) / 100, float(fig_height) / 100
        if fig_width and fig_height:
            fig.set_size_inches(fig_width, fig_height)

        if fig_width >= 4 or fig_width == 0:
            fontsize = 10
        else:
            fontsize = 4
        fontprop.set_size(fontsize)

        if result_sum > 0:
            ax.bar(ind + width * 2, [result_lt_100k / float(result_sum) * 100, result_100k_200k / float(result_sum) * 100, result_200k_300k / float(result_sum) * 100, result_300k_400k / float(result_sum) * 100, result_400k_500k / float(result_sum) * 100, result_500k_600k / float(result_sum) * 100, result_600k_700k / float(result_sum) * 100, result_700k_800k / float(result_sum) * 100, result_800k_900k / float(result_sum) * 100, result_900k_1m / float(result_sum) * 100, result_gte_1m / float(result_sum) * 100], width, color='#e70012', edgecolor="none", align="center")
        else:
            ax.bar(ind + width * 2, [0 for i in range(0, 11)], width, color="#e70012", edgecolor="none")

        ax.autoscale_view()
        font = {
            'family': 'sans-serif',
            'color': '#999999',
            'weight': 'normal',
            'size': fontsize,
        }
        ax.set_xlabel(u'价格', fontdict=font, fontproperties=fontprop)
        ax.set_ylabel('%', fontdict=font, rotation=0, fontproperties=fontprop)
        ax.xaxis.set_label_coords(1.05, 0.025)
        ax.yaxis.set_label_coords(-0.025, 1.05)

        ax.set_xticks(ind + width * 2)
        ax.set_xticklabels(["under 100k", "100k~200k", "200k~300k", "300k~400k", "400k~500k", "500k~600k", "600k~700k", "700k~800k", "800k~900k", "900k~1m", "over 1m"])

        plt.setp(fig.gca().get_xticklabels(), horizontalalignment='right', fontsize=fontsize, rotation=30)
        plt.setp(fig.gca().get_yticklabels(), fontsize=fontsize)
        plt.gcf().subplots_adjust(bottom=0.2)

        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        for child in ax.get_children():
            if isinstance(child, matplotlib.spines.Spine):
                child.set_color('#cccccc')

        if fig_width >= 4:
            water_mark_buffer = StringIO()
            ImageOps.expand(f_app.storage.image_open("../web/src/static/images/logo/img_mark_no_alpha.png"), border=20, fill="#f6f6f6").save(water_mark_buffer, format="PNG")
            water_mark_buffer.seek(0)
            img = imread(water_mark_buffer)
            plt.imshow(img, extent=[ax.get_xlim()[0], ax.get_xlim()[1], 0, ax.get_ylim()[1]], aspect='auto')
            fig.text(0.5, 0.01, "来源：Land Registry - GOV.UK", fontproperties=fontprop, fontsize=fontsize, color="#cccccc", ha="center")

        ax.yaxis.grid(True, color="#e6e6e6", linewidth="1", linestyle="-")
        ax.tick_params(colors='#cccccc')
        ax.set_ylim(0)
        ax.set_axis_bgcolor("#f6f6f6")
        ax.set_axisbelow(True)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.xaxis.set_ticks_position('none')
        ax.yaxis.set_ticks_position('left')
        ax.yaxis.get_major_formatter().set_scientific(False)

        graph = StringIO()
        fig.savefig(graph, format="png", dpi=100)

        return graph.getvalue()

    def aggregation_monthly(self):
        func_map = Code("""
            function() {
                var key_with_type = {
                    "zipcode_index": this.zipcode_index,
                    "date": new Date(this.date.getFullYear(), 0, 1 ,0 ,0 ,0 ,0),
                    "type": this.type
                };
                var key = {
                    "zipcode_index": this.zipcode_index,
                    "date": new Date(this.date.getFullYear(), 0, 1 ,0 ,0 ,0 ,0),
                };
                var value = {
                    "price": this.price,
                    "count": 1
                };
                emit(key, value);
                emit(key_with_type, value);
            }
        """)
        func_reduce = Code("""
            function(key, values) {
                result = {"price": 0, "count": 0};
                values.forEach(function(value) {
                    result.count += value.count;
                    result.price += value.price;
                });
                return result;
            }
        """)
        func_finalize = Code("""
            function (key, value) {
                value.average_price = value.price / value.count;
                return value;
            }
        """)

        with f_app.mongo() as m:
            f_app.landregistry.get_database(m).map_reduce(func_map, func_reduce, "landregistry_statistics", finalize=func_finalize)
            result = m.landregistry_statistics.find({})

        merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)
        return merged_result

f_landregistry()


class f_currant_shop(f_shop):
    def item_custom_search(self, params, sort=["time", "desc"], notime=False, per_page=10, time_field="time"):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        item_id_list = f_app.mongo_index.search(self.item_get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)["content"]

        return item_id_list

    def custom_search(self, params, sort=["time", "desc"], item_filter_params=["capacity", "price"], notime=False, per_page=10, last_time_field=None):
        params.setdefault("status", "new")
        item_filter_params = dict(zip(item_filter_params, map(lambda key: params.pop(key, None), item_filter_params)))
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        shop_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, last_time_field=last_time_field)["content"]

        if item_filter_params:
            shop_id_list = self.item_filter(item_filter_params, shop_id_list)
        return shop_id_list

    def update_funding_available(self, item_id):
        funding_available = 0
        item = f_app.shop.item_get(item_id)
        if "funding_goal" in item:
            order_list = f_app.order.search({"items.id": item_id, "status": "paid"})
            order_amount = sum([order.get("price", 0) for order in f_app.order.get(order_list)])
            funding_available = item.get("funding_goal", 0) - order_amount

        f_app.shop.item_update_set(item.get('shop_id'), item_id, {"funding_available": funding_available})

f_currant_shop()
# Fix submodule
f_recurring_billing_model()


class f_comment(f_app.module_base):
    """
    ==================================================================
    Comment module
    ==================================================================
    """
    comment_database = "comments"

    def __init__(self):
        f_app.module_install("comment", self)
        f_app.dependency_register("pymongo", race="python")

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            comment_id = self.get_database(m).insert(params)
            self.get_database(m).ensure_index([("status", ASCENDING)])
            self.get_database(m).ensure_index([("time", ASCENDING)])

        return str(comment_id)

    @f_cache("comment")
    def get(self, comment_id_or_list, ignore_nonexist=False, force_reload=False):
        def _format_each(comment):
            return f_app.util.process_objectid(comment)

        if isinstance(comment_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(comment_id) for comment_id in comment_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(comment_id_or_list) and not ignore_nonexist:
                found_list = map(lambda comment: str(comment["_id"]), result_list)
                abort(40495, logger.warning("Non-exist comment:", filter(lambda comment_id: comment_id not in found_list, comment_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist comment:", filter(lambda comment_id: comment_id not in found_list, comment_id_or_list), exc_info=False)

            for comment in result_list:
                result[comment["id"]] = _format_each(comment)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(comment_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40495, logger.warning("Non-exist comment:", comment_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist comment:", comment_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def get_database(self, m):
        return getattr(m, self.comment_database)

    def output(self, comment_id_list, ignore_nonexist=False, force_reload=False):
        comment_list = self.get(comment_id_list, ignore_nonexist=ignore_nonexist, force_reload=force_reload)

        user_id_set = set()
        for comment in comment_list:
            user_id_set.add(comment["user_id"])

        user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields)
        user_dict = {}

        for u in user_list:
            user_dict[u["id"]] = u
        for comment in comment_list:
            comment["user"] = user_dict.get(comment.pop("user_id"))

        return comment_list

    def remove(self, comment_id):
        children_comments = f_app.comment.search(params={"parent_comment_id": ObjectId(comment_id)}, per_page=0)
        if len(children_comments) > 0:
            for c in children_comments:
                self.update_set(c, {"status": "deleted"})

        self.update_set(comment_id, {"status": "deleted"})

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10, time_field="time"):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        comment_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)["content"]

        return comment_id_list

    def update(self, comment_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(comment_id)},
                params,
            )
        self.get(comment_id, force_reload=True)

    def update_set(self, comment_id, params):
        self.update(comment_id, {"$set": params})


f_comment()


class f_currant_order(f_order):
    def custom_search(self, params, sort=["time", "desc"], notime=False, per_page=10, time_field="time"):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        order_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)["content"]

        return order_id_list

f_currant_order()


class f_maponics(f_app.plugin_base):
    nested_attr = ("neighborhood",)
    maponics_neighborhood_database = "maponics_neighborhood"

    def __init__(self, *args, **kwargs):
        f_app.module_install("maponics", self)

    def neighborhood_get_database(self, m):
        return getattr(m, self.maponics_neighborhood_database)

    @f_cache("maponicsneighborhood", support_multi=True)
    def neighborhood_get(self, neighborhood_id_or_list, force_reload=False):
        def _format_each(neighborhood):
            neighborhood.pop("wkt", None)
            return f_app.util.process_objectid(neighborhood)

        if f_app.util.batch_iterable(neighborhood_id_or_list):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.neighborhood.get_database(m).find({"_id": {"$in": [ObjectId(user_id) for user_id in neighborhood_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(neighborhood_id_or_list):
                found_list = map(lambda neighborhood: str(neighborhood["_id"]), result_list)
                abort(40400, self.logger.warning("Non-exist neighborhood:", filter(lambda neighborhood_id: neighborhood_id not in found_list, neighborhood_id_or_list), exc_info=False))

            for neighborhood in result_list:
                result[neighborhood["id"]] = _format_each(neighborhood)

            return result

        else:
            with f_app.mongo() as m:
                result = self.neighborhood.get_database(m).find_one({"_id": ObjectId(neighborhood_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload:
                        abort(40400, self.logger.warning("Non-exist neighborhood:", neighborhood_id_or_list, exc_info=False))

                    return None

            return _format_each(result)

    def neighborhood_get_by_nid(self, nid):
        return self.neighborhood.search({"nid": nid})

    def neighborhood_import(self, filename, geonames_city_id):
        with open(filename) as f:
            rows = csv.reader(f.readlines(), delimiter=b"|", quoting=csv.QUOTE_NONE)
            count = 0
            first = True

            with f_app.mongo() as m:
                self.neighborhood.get_database(m).ensure_index([("nid", ASCENDING)])
                self.neighborhood.get_database(m).ensure_index([("loc", GEO2D)])
                self.neighborhood.get_database(m).ensure_index([("country", ASCENDING)])

                for r in rows:
                    if first:
                        # First line is header
                        first = False
                        continue

                    params = {
                        "nid": r[0],
                        "name": r[1].decode("utf-8"),
                        "ntype": r[2],
                        "country": r[3],
                        "metro": r[4],
                        "latitude": r[5],
                        "longitude": r[6],
                        "loc": [float(r[6]), float(r[5])],
                        "ncs_code": r[7],
                        "parentnid": r[8],
                        "relver": r[9],
                        "wkt": r[10],
                        "status": "new",
                        "geonames_city_id": ObjectId(geonames_city_id),
                    }

                    self.neighborhood.get_database(m).update({
                        "nid": params["nid"],
                    }, {"$set": params}, upsert=True)

                    count += 1
                    if count % 100 == 1:
                        self.logger.debug("maponics neighborhood imported", count, "records...")

    def neighborhood_search(self, params, per_page=0):
        return f_app.mongo_index.search(self.neighborhood.get_database, params, notime=True, sort_field="population", count=False, per_page=per_page)["content"]

    # TODO: work with new get()
    def neighborhood_assign_to_geonames_postcode(self, country):
        import shapely.wkt
        import shapely.geometry

        all_neighborhoods = self.neighborhood.get(self.neighborhood.search({"country": country}))

        for neighborhood in all_neighborhoods:
            neighborhood["shapely"] = shapely.wkt.loads(neighborhood["wkt"])

        with f_app.mongo() as m:
            for postcode in f_app.geonames.postcode.get_database(m).find({"country": country}):
                if "loc" not in postcode:
                    continue

                postcode["neighborhoods"] = []
                point = shapely.geometry.Point(*postcode["loc"])
                for neighborhood in all_neighborhoods:
                    if point.within(neighborhood["shapely"]):
                        postcode["neighborhoods"].append(ObjectId(neighborhood["id"]))

                if len(postcode["neighborhoods"]):
                    self.logger.debug("Assigning neighborhoods", postcode["neighborhoods"], "to postcode", postcode["postcode"], "id:", postcode["_id"])
                    f_app.geonames.postcode.get_database(m).update({"_id": postcode["_id"]}, {"$set": {"neighborhoods": postcode["neighborhoods"]}})
                    f_app.geonames.postcode.get(postcode["_id"], force_reload=True)

                else:
                    self.logger.debug("Warning: no neighborhood found for postcode", postcode["postcode"], "id:", postcode["_id"])

    def neighborhood_assign_to_property(self, country):
        for property in f_app.property.get(f_app.property.search({"country.code": country, "zipcode": {"$exists": True}}, per_page=-1)):
            postcode_ids = f_app.geonames.postcode.search({"country": country, "postcode_index": property["zipcode"].replace(" ", "")})
            if len(postcode_ids) != 1:
                self.logger.warning("Multiple or no zipcode found for property", property["id"], "zipcode:", property["zipcode"], "ignoring assignment...")
                continue
            postcode = f_app.geonames.postcode.get(postcode_ids[0])
            if "neighborhoods" in postcode and postcode["neighborhoods"]:
                self.logger.debug("Assigning neighborhood", postcode["neighborhoods"][0], "to property", property["id"])
                f_app.property.update_set(property["id"], {"maponics_neighborhood": {"_maponics_neighborhood": True, "_id": ObjectId(postcode["neighborhoods"][0])}})
                if len(postcode["neighborhoods"]) > 1:
                    self.logger.debug("Assigning other neighborhoods", postcode["neighborhoods"][1:], "to property", property["id"])
                    f_app.property.update_set(property["id"], {"maponics_parent_neighborhood": [{"_maponics_neighborhood": True, "_id": ObjectId(x)} for x in postcode["neighborhoods"][1:]]})

f_maponics()


class f_hesa(f_app.plugin_base):
    nested_attr = ("university",)
    hesa_university_database = "hesa_university"

    def __init__(self, *args, **kwargs):
        f_app.module_install("hesa", self)

    def university_get_database(self, m):
        return getattr(m, self.hesa_university_database)

    @f_cache("hesauniversity", support_multi=True)
    def university_get(self, university_id_or_list, force_reload=False):
        def _format_each(university):
            return f_app.util.process_objectid(university)

        if f_app.util.batch_iterable(university_id_or_list):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.university.get_database(m).find({"_id": {"$in": [ObjectId(user_id) for user_id in university_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(university_id_or_list):
                found_list = map(lambda university: str(university["_id"]), result_list)
                abort(40400, self.logger.warning("Non-exist university:", filter(lambda university_id: university_id not in found_list, university_id_or_list), exc_info=False))

            for university in result_list:
                result[university["id"]] = _format_each(university)

            return result

        else:
            with f_app.mongo() as m:
                result = self.university.get_database(m).find_one({"_id": ObjectId(university_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload:
                        abort(40400, self.logger.warning("Non-exist university:", university_id_or_list, exc_info=False))

                    return None

            return _format_each(result)

    def university_get_by_hesa_id(self, hesa_id):
        return self.university.search({"hesa_id": hesa_id})

    def university_update(self, university_id, params):
        with f_app.mongo() as m:
            self.university.get_database(m).update(
                {"_id": ObjectId(university_id)},
                params,
            )
        university = self.university.get(university_id, force_reload=True)
        return university

    def university_update_set(self, university_id, params):
        return self.university.update(university_id, {"$set": params})

    def university_import(self, filename, country="GB"):
        with open(filename) as f:
            rows = csv.reader(f.readlines())
            count = 0
            with f_app.mongo() as m:
                self.university.get_database(m).ensure_index([("hesa_id", ASCENDING)])
                self.university.get_database(m).ensure_index([("postcode", ASCENDING)])
                self.university.get_database(m).ensure_index([("country", ASCENDING)])

                for r in rows:
                    params = {
                        "hesa_id": r[0],
                        "hep": r[1],
                        "ukprn": r[2],
                        "name": r[3],
                        "phone": r[4],
                        "postcode": r[5],
                        "postcode_index": r[5].replace(" ", ""),
                        "country": country,
                        "status": "new",
                    }

                    self.university.get_database(m).update({
                        "hesa_id": params["hesa_id"],
                    }, {"$set": params}, upsert=True)

                    count += 1
                    if count % 100 == 1:
                        self.logger.debug("hesa university imported", count, "records...")

    def university_search(self, params, per_page=0):
        return f_app.mongo_index.search(self.university.get_database, params, notime=True, sort_field="population", count=False, per_page=per_page)["content"]

f_hesa()
