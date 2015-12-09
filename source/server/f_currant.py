# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime, timedelta, date
import re
import logging
import time
import phonenumbers
from bson.objectid import ObjectId
from bson.code import Code
from pymongo import ASCENDING, DESCENDING
import six
from libfelix.f_common import f_app
from libfelix.f_user import f_user
from libfelix.f_log import f_log
from libfelix.f_message import f_message
from libfelix.f_interface import abort, request, template
from libfelix.f_cache import f_cache
from libfelix.f_util import f_util
from libfelix.f_shop import f_shop
from libfelix.f_shop.f_recurring_bm import f_recurring_billing_model
from libfelix.f_order import f_order
from libfelix.f_mongo import f_mongo_upgrade

logger = logging.getLogger(__name__)
f_app.dependency_register('beautifulsoup4', race="python")


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
        f_app.enum.get_database(m).create_index([("type", ASCENDING), ("sort_value", ASCENDING)])

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

    def v24(self, m):
        for ticket in f_app.ticket.get_database(m).find({"creator_user_id": None, "user_id": {"$exists": True}}):
            f_app.ticket.get_database(m).update({"_id": ticket["_id"]}, {"$set": {"creator_user_id": ticket["user_id"]}})

    def v25(self, m):
        for user in f_app.user.get_database(m).find({"status": "suspended"}):
            f_app.user.get_database(m).update({"_id": user["_id"]}, {"$set": {
                "email_message_type": [],
            }})
            self.logger.debug("Cleared email message type for user", str(user["_id"]))

    def v26(self, m):
        ticket_database = f_app.ticket.get_database(m)
        for ticket in ticket_database.find({"type": {"$in": ["rent", "rent_intention"]}, "rent_budget": {"$exists": True}}):
            try:
                enum = f_app.enum.get_database(m).find_one({"_id": ticket["rent_budget"]["_id"]})
                assert enum is not None
                assert "slug" in enum
            except:
                self.logger.warning("Invalid enum", ticket["rent_budget"], "found, ignoring ticket", ticket["_id"])
                continue

            rent_budget = f_app.util.parse_budget(enum["slug"])
            new_params = {}

            if rent_budget[0]:
                new_params["rent_budget_min"] = dict(
                    unit=rent_budget[2],
                    value=str(rent_budget[0]),
                    type="currency",
                    _i18n_unit=True,
                    value_float=rent_budget[0]
                )
            if rent_budget[1]:
                new_params["rent_budget_max"] = dict(
                    unit=rent_budget[2],
                    value=str(rent_budget[1]),
                    type="currency",
                    _i18n_unit=True,
                    value_float=rent_budget[1]
                )
            ticket_database.update({"_id": ticket["_id"]}, {"$set": new_params, "$unset": {"rent_budget": ""}})
            self.logger.debug("Migrated ticket", ticket["_id"], "to new rent_budget format.")

    def v27(self, m):
        ticket_database = f_app.ticket.get_database(m)
        for ticket in ticket_database.find({"type": "rent", "sort_time": {"$exists": False}}):
            ticket_database.update({"_id": ticket["_id"]}, {"$set": {"sort_time": ticket["time"]}})
            self.logger.debug("Set sort_time for ticket", ticket["_id"])

currant_mongo_upgrade()


class f_currant_message(f_message):
    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

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
            log["user_id"] = log.get("id")
            return f_app.util.process_objectid(log)

        if isinstance(log_id_or_list, (tuple, list, set)):
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, log_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(log_id_or_list):
                found_list = map(lambda log: str(log["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist log:", filter(lambda log_id: log_id not in found_list, log_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist log:", filter(lambda log_id: log_id not in found_list, log_id_or_list), exc_info=False)

            result = {log["id"]: _format_each(log) for log in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(log_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist log:", log_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist log:", log_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def output(self, log_id_list, ignore_nonexist=True, multi_return=list, force_reload=False, permission_check=True):
        logs = self.get(log_id_list, ignore_nonexist=ignore_nonexist, force_reload=force_reload)
        property_id_set = set()
        for log in logs:
            if log.get("property_id"):
                property_id_set.add(log["property_id"])

        property_dict = f_app.property.output(list(property_id_set), multi_return=dict, ignore_nonexist=ignore_nonexist, permission_check=permission_check)

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
                abort(40000, self.logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        log_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return log_id_list

f_currant_log()


class currant_user(f_user):
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
                abort(40000, self.logger.warning("sort param not well in format:", sort, exc_info=False))
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
            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": map(ObjectId, favorite_id_or_list)}, "status": {"$ne": "deleted"}}))

            if len(result_list) < len(favorite_id_or_list):
                found_list = map(lambda favorite: str(favorite["_id"]), result_list)
                if not force_reload and not ignore_nonexist:
                    abort(40400, self.logger.warning("Non-exist favorite:", filter(lambda favorite_id: favorite_id not in found_list, favorite_id_or_list), exc_info=False))
                elif ignore_nonexist:
                    self.logger.warning("Non-exist favorite:", filter(lambda favorite_id: favorite_id not in found_list, favorite_id_or_list), exc_info=False)

            result = {favorite["id"]: _format_each(favorite) for favorite in result_list}
            return result

        else:
            with f_app.mongo() as m:
                result = self.favorite_get_database(m).find_one({"_id": ObjectId(favorite_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, self.logger.warning("Non-exist favorite:", favorite_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist favorite:", favorite_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def favorite_add(self, params):
        if "user_id" not in params:
            user = f_app.user.login.get()
            if user:
                params["user_id"] = user['id']
            else:
                abort(40000, self.logger.warning("favorite must be added with user_id.", exc_info=False))

        params["user_id"] = ObjectId(params["user_id"])
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            favorite_id = self.favorite_get_database(m).insert(params)
        f_app.plugin_invoke(
            "user.favorite.add.after",
            params,
            ignore_error=True
        )
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
                abort(40000, self.logger.warning("sort param not well in format:", sort))

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

    """
    ==================================================================
    User Data Analyze Module
    ==================================================================
    """
    def analyze_data_get_modif_time(self, user_id):
        mod_time = self.get(user_id).get('analyze_value_modifier_time', None)
        if mod_time is None or isinstance(mod_time, datetime):
            return {}
        return mod_time

    def analyze_data_set_modif_time(self, user_id, value):
        mod_time = self.analyze_data_get_modif_time(user_id)
        mod_time.update({value: datetime.utcnow()})
        self.update_set(user_id, {'analyze_value_modifier_time': mod_time})

    def analyze_data_update(self, user_id, params={
        "analyze_guest_country": True,
        "analyze_guest_user_type": True,
        "analyze_guest_active_days": True,
        "analyze_guest_downloaded": True,
        "analyze_rent_landlord_type": True,
        "analyze_rent_has_draft": True,
        "analyze_rent_commit_time": True,
        "analyze_rent_local": True,
        "analyze_rent_estate_views_times": True,
        "analyze_rent_estate_total": True,
        "analyze_rent_single_or_whole": True,
        "analyze_rent_period_range": True,
        "analyze_rent_price": True,
        "analyze_rent_time": True,
        "analyze_rent_intention_time": True,
        "analyze_rent_intention_budget": True,
        "analyze_rent_intention_local": True,
        "analyze_rent_intention_match_level": True,
        "analyze_rent_intention_views_times": True,
        "analyze_rent_intention_favorite_times": True,
        "analyze_rent_intention_view_contact_times": True,
        "analyze_intention_time": True,
        "analyze_intention_budget": True,
        "analyze_intention_views_times": True,
        "analyze_value_modifier_time": True
    }):
        self.update_set(user_id, self.analyze_data_generate(user_id, params))

    def analyze_data_generate(self, user_id, params):

        def get_all_enum_value(enum_singlt_type):
            enum_list_subdic = {}
            for enumitem in f_app.i18n.process_i18n(f_app.enum.get_all(enum_singlt_type)):
                enum_list_subdic.update({enumitem["id"]: enumitem["value"]})
            enum_type_list.update({enum_singlt_type: enum_list_subdic})

        def get_data_enum(user, enum_name):
            if user is None:
                return
            if enum_name not in enum_type_list:
                get_all_enum_value(enum_name)
            single = user.get(enum_name, None)
            value_list = []
            if f_app.util.batch_iterable(single):
                for true_single in single:
                    if true_single is None:
                        continue
                    enum_id = true_single.get("id", None)
                    value = enum_type_list[enum_name].get(enum_id, None)
                    value_list.append(value)
            elif single is not None:
                if single.get("id", None):
                    enum_id = unicode(single.get("id", None))
                    value = enum_type_list[enum_name].get(enum_id, None)
                    if value is not None:
                        value_list.append(value)
            if not f_app.util.batch_iterable(value_list):
                value_list = [value_list]
            value_set = set(value_list)
            value_list = list(value_set)
            return unicode('/'.join(value_list))

        def get_active_days(user):
            old_active_days = self.get(user_id).get('analyze_guest_active_days', 0)
            mod_time = self.analyze_data_get_modif_time(user_id).get('analyze_guest_active_days', None)
            func_map = Code(
                '''
                function() {
                    key = new Date(this.time.getFullYear(), this.time.getMonth(), this.time.getDate());
                    emit(key, 1);
                }
                '''
            )
            func_reduce = Code(
                '''
                function(key, value) {
                    return Array.sum(value);
                }
                '''
            )
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                if mod_time is None:
                    f_app.log.get_database(m).map_reduce(func_map, func_reduce, "log_result", query={
                        "id": ObjectId(user_id)
                    })
                else:
                    start_time = datetime(mod_time.year, mod_time.month, mod_time.day) + timedelta(days=1)
                    f_app.log.get_database(m).map_reduce(func_map, func_reduce, "log_result", query={
                        "id": ObjectId(user_id),
                        "time": {"$gt": start_time}
                    })
                # active_days = m.log_result.find().count()
                active_days = m.log_result.find().count() + old_active_days
            return active_days

        def check_download(user):
            downloaded = self.get(user_id).get('analyze_guest_downloaded', None)
            if downloaded == '已下载':
                return True
            elif downloaded is None:
                credit = f_app.user.credit.get("view_rent_ticket_contact_info", user_id).get("credits", [])
                for single in credit:
                    if single.get("tag", None) == "download_ios_app":
                        return True
            return False

        def get_data_complex(user, target, condition, element):

            '''this func make dict provide get_data_enum to use.
            with user's id and 'condition' to search in the database 'target'
            then gether element in search result, make a new dict return
            '''
            dic = {}
            element_list = []
            if '.' in target:
                t_target = target.split('.')
                target_database = getattr(getattr(f_app, t_target[0]), t_target[1])
            else:
                target_database = getattr(f_app, target)
            condition.update({"$or": [{"user_id": ObjectId(user_id)},
                                      {"creator_user_id": ObjectId(user_id)}]})
            select_item = target_database.get(target_database.search(condition, per_page=-1))
            for ticket in select_item:
                element_list.append(ticket.get(element, None))
            dic.update({element: element_list})
            return dic

        def get_has_flag(user, target, condition, comp_element, want_value):
            dic = {}
            dic = get_data_complex(user, target, condition, comp_element)
            # f_app.user.update_set(user_id, {"debug_message": dic.get(comp_element, [])})
            return (want_value in dic.get(comp_element, []))

        def get_ticket_newest(user, add_condition={}):
            if user_id is None:
                return {}
            condition = ({"type": "rent",
                          "$or": [{"user_id": ObjectId(user_id)},
                                  {"creator_user_id": ObjectId(user_id)}]})
            condition.update(add_condition)
            time_list = []
            select_item = f_app.ticket.get(f_app.ticket.search(condition, per_page=-1))
            if select_item is None:
                return {}
            for single in select_item:
                curtime = single.get("time", None)
                time_list.append(curtime)
            if len(time_list) < 1:
                return {}
            time_list.sort()
            for single in select_item:
                curtime = single.get("time", None)
                if curtime == time_list[-1]:
                    return single
            return {}

        def get_detail_address(ticket):
            ticket = f_app.i18n.process_i18n(ticket)
            if f_app.util.batch_iterable(ticket.get("maponics_neighborhood", {})):
                maponics_neighborhood = ticket.get("maponics_neighborhood", {})[0]
            else:
                maponics_neighborhood = ticket.get("maponics_neighborhood", {})
            return ' '.join([ticket.get("country", {}).get("code", ''),
                             ticket.get("city", {}).get("name", ''),
                             maponics_neighborhood.get("name", ''),
                             ticket.get("address", ''),
                             ticket.get("zipcode_index", '')])

        def get_address(user):
            property_id = get_data_complex(user, "ticket", {"type": "rent"}, "property_id").get("property_id", [])
            if len(property_id) < 1:
                return ''
            elif len(property_id) > 1:
                return 'M'
            else:
                return get_detail_address(f_app.property.get(property_id[0]))

        def logs_rent_ticket(user):
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                return f_app.log.get_database(m).find({"id": ObjectId(user_id),
                                                       "type": "route",
                                                       "rent_ticket_id": {"$exists": True}
                                                       }).count()

        def get_count(user, target, condition, element, comp):
            dic = get_data_complex(user, target, condition, element)
            if dic.get(element, []) is None:
                return '0'
            return dic.get(element, []).count(comp)

        def time_period_label(ticket):
            if ticket is None:
                return ''
            time = ""
            period_start = ticket.get("rent_available_time", None)
            period_end = ticket.get("rent_deadline_time", None)
            if period_end is None or period_start is None:
                time = "不明"
            else:
                period = period_end - period_start
                if period.days >= 365:
                    time = "longer than 12 months"
                elif 365 > period.days >= 180:
                    time = "6 - 12 months"
                elif 180 >= period.days > 90:
                    time = "3 - 6 months"
                elif period.days <= 30:
                    time = "less than 1 month"
            return time

        def get_budget(ticket):
            if ticket is None:
                return ''
            if ticket.get('type', None) == "intention":
                f_app.user.update_set(user_id, {"debug_message": f_app.enum.get(ticket['budget']['id'])})
                return f_app.enum.get(ticket['budget']['id'])['value']['zh_Hans_CN']
            budget_min = unicode(ticket.get("rent_budget_min", {}).get("value", '零'))
            budget_max = unicode(ticket.get("rent_budget_max", {}).get("value", '不限'))
            if budget_max is None or budget_min is None:
                return ''
            elif not (budget_max == '不限' and budget_min == '零'):
                if budget_min == '零':
                    budget_min = '0'
                return budget_min + '~~' + budget_max
            else:
                return ''

        def get_match(ticket):
            match = []
            if "partial_match" in ticket.get("tags", []):
                match.append("部分满足")
            if "perfect_match" in ticket.get("tags", []):
                match.append("完全满足")
            return '/'.join(match)

        def logs_content_view(user):
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                return f_app.log.get_database(m).find({
                    "id": ObjectId(user_id),
                    "type": "rent_ticket_view_contact_info"
                }).count()

        def logs_property(user):
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                return f_app.log.get_database(m).find({"id": ObjectId(user_id), "type": "route", "property_id": {"$exists": True}}).count()

        enum_type_list = {}
        user = self.get(user_id)
        if user is None:
            user = {}
        result = {}
        mod_time = user.get('analyze_value_modifier_time', {})
        if isinstance(mod_time, datetime):
            mod_time = {}
        # result.update({"analyze_guest_nickname": user.get("nickname", '')})
        # result.update({"analyze_guest_register_time": user.get("register_time")})
        if params.get("analyze_guest_country", None) is True:
            result.update({"analyze_guest_country": user.get("country", {}).get("code", '')})
            mod_time.update({'analyze_guest_country': datetime.utcnow()})

        if params.get("analyze_guest_user_type", None) is True:
            result.update({"analyze_guest_user_type": get_data_enum(user, "user_type")})
            mod_time.update({'analyze_guest_user_type': datetime.utcnow()})

        if params.get("analyze_guest_active_days", None) is True:
            result.update({"analyze_guest_active_days": get_active_days(user)})
            mod_time.update({'analyze_guest_active_days': datetime.utcnow()})

        if params.get("analyze_guest_downloaded", None) is True:
            result.update({"analyze_guest_downloaded": "已下载" if check_download(user) else "未下载"})
            mod_time.update({'analyze_guest_downloaded': datetime.utcnow()})

        if params.get("analyze_rent_landlord_type", None) is True:
            result.update({"analyze_rent_landlord_type": get_data_enum(get_data_complex(user, "ticket", {"type": "rent"}, "landlord_type"), "landlord_type")})
            mod_time.update({'analyze_rent_landlord_type': datetime.utcnow()})

        if params.get("analyze_rent_has_draft", None) is True:
            result.update({"analyze_rent_has_draft": "有" if get_has_flag(user, "ticket", {"type": "rent"}, "status", "draft") else "无"})
            mod_time.update({'analyze_rent_has_draft': datetime.utcnow()})

        if params.get("analyze_rent_commit_time", None) is True:
            result.update({"analyze_rent_commit_time": get_ticket_newest(user, {"type": "rent"}).get("time", '')})
            mod_time.update({'analyze_rent_commit_time': datetime.utcnow()})

        if params.get("analyze_rent_local", None) is True:
            result.update({"analyze_rent_local": get_address(user)})
            mod_time.update({'analyze_rent_local': datetime.utcnow()})

        if params.get("analyze_rent_estate_views_times", None) is True:
            result.update({"analyze_rent_estate_views_times": logs_rent_ticket(user)})
            mod_time.update({'analyze_rent_estate_views_times': datetime.utcnow()})

        if params.get("analyze_rent_estate_total", None) is True:
            result.update({"analyze_rent_estate_total": get_count(user, "ticket", {"type": "rent"}, "type", "rent")})
            mod_time.update({'analyze_rent_estate_total': datetime.utcnow()})

        if params.get("analyze_rent_single_or_whole", None) is True:
            result.update({"analyze_rent_single_or_whole": get_data_enum(get_data_complex(user, "ticket", {"type": "rent"}, "rent_type"), "rent_type")})
            mod_time.update({'analyze_rent_single_or_whole': datetime.utcnow()})

        if params.get("analyze_rent_period_range", None) is True:
            result.update({"analyze_rent_period_range": time_period_label(get_ticket_newest(user))})
            mod_time.update({'analyze_rent_period_range': datetime.utcnow()})

        if params.get("analyze_rent_price", None) is True:
            result.update({"analyze_rent_price": get_ticket_newest(user).get("price", {}).get("value", "")})
            mod_time.update({'analyze_rent_price': datetime.utcnow()})

        if params.get("analyze_rent_time", None) is True:
            result.update({"analyze_rent_time": get_ticket_newest(user, {"type": "rent", "status": "rent"}).get("time", '')})
            mod_time.update({'analyze_rent_time': datetime.utcnow()})

        if params.get("analyze_rent_intention_time", None) is True:
            result.update({"analyze_rent_intention_time": get_ticket_newest(user, {"type": "rent_intention", "status": "new"}).get("time", '')})
            mod_time.update({'analyze_rent_intention_time': datetime.utcnow()})

        if params.get("analyze_rent_intention_budget", None) is True:
            result.update({"analyze_rent_intention_budget": get_budget(get_ticket_newest(user, {"type": "rent_intention"}))})
            mod_time.update({'analyze_rent_intention_budget': datetime.utcnow()})

        if params.get("analyze_rent_intention_local", None) is True:
            result.update({"analyze_rent_intention_local": get_address(get_ticket_newest(user, {"type": "rent_intention", "status": "new"}))})
            mod_time.update({'analyze_rent_intention_local': datetime.utcnow()})

        if params.get("analyze_rent_intention_match_level", None) is True:
            result.update({"analyze_rent_intention_match_level": get_match(get_ticket_newest(user, {"type": "rent_intention", "status": "new"}))})
            mod_time.update({'analyze_rent_intention_match_level': datetime.utcnow()})

        if params.get("analyze_rent_intention_views_times", None) is True:
            result.update({"analyze_rent_intention_views_times": logs_rent_ticket(user)})
            mod_time.update({'analyze_rent_intention_views_times': datetime.utcnow()})

        if params.get("analyze_rent_intention_favorite_times", None) is True:
            result.update({"analyze_rent_intention_favorite_times": get_count(user, "user.favorite", {"type": "property"}, "type", "property")})
            mod_time.update({'analyze_rent_intention_favorite_times': datetime.utcnow()})

        if params.get("analyze_rent_intention_view_contact_times", None) is True:
            result.update({"analyze_rent_intention_view_contact_times": logs_content_view(user)})
            mod_time.update({'analyze_rent_intention_view_contact_times': datetime.utcnow()})

        if params.get("analyze_intention_time", None) is True:
            result.update({"analyze_intention_time": get_ticket_newest(user, {"type": "intention"}).get("time", '')})
            mod_time.update({'analyze_intention_time': datetime.utcnow()})

        if params.get("analyze_intention_budget", None) is True:
            result.update({"analyze_intention_budget": get_budget(get_ticket_newest(user, {"type": "intention"}))})
            mod_time.update({'analyze_intention_budget': datetime.utcnow()})

        if params.get("analyze_intention_views_times", None) is True:
            result.update({"analyze_intention_views_times": logs_property(user)})
            mod_time.update({'analyze_intention_views_times': datetime.utcnow()})

        result.update({"analyze_value_modifier_time": mod_time})

        return result


currant_user()


class currant_plugin(f_app.plugin_base):
    """
        ==================================================================
        Plugins
        ==================================================================
    """

    task = ["ping_sitemap"]

    def user_output_each(self, result_row, raw_row, user, admin, simple):
        if "phone" in raw_row:
            phonenumber = phonenumbers.parse(raw_row["phone"])
            result_row["phone"] = phonenumbers.format_number(phonenumber, phonenumbers.PhoneNumberFormat.NATIONAL).replace(" ", "")
            result_row["country_code"] = phonenumber.country_code
        if "custom_fields" in raw_row and user and set(f_app.user.get_role(user["id"])) & set(f_app.common.advanced_admin_roles):
            result_row["custom_fields"] = raw_row["custom_fields"]
        return result_row

    def user_add(self, params, noregister):
        params.setdefault("email_message_type", f_app.common.email_message_type)
        params.setdefault("system_message_type", f_app.common.message_type)
        params.setdefault("private_contact_methods", [])
        return params

    def user_add_after(self, user_id, params, noregister):
        index_params = f_app.util.try_get_value(params, ["nickname", "phone", "email"])
        if index_params:
            if "phone" in index_params:
                index_params["phone_national_number"] = phonenumbers.format_number(phonenumbers.parse(index_params["phone"]), phonenumbers.PhoneNumberFormat.NATIONAL).replace(" ", "")
            f_app.mongo_index.update(f_app.user.get_database, user_id, index_params.values())

        if not noregister:
            credit = {
                "type": "view_rent_ticket_contact_info",
                "amount": 1,
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
                        tag="new_user_admin",
                    )

        if user_id is not None:
            f_app.user.analyze_data_update(user_id, params={
                "analyze_guest_country": True,
                "analyze_guest_user_type": True,
                "analyze_guest_active_days": True
            })
        return user_id

    def user_update_after(self, user_id, params):
        if "$set" in params and user_id is not None:
            if len(set(["nickname", "phone", "email"]) & set(params["$set"])) > 0:
                index_params = f_app.util.try_get_value(f_app.user.get(user_id), ["nickname", "phone", "email"])
                if index_params:
                    if "phone" in index_params:
                        index_params["phone_national_number"] = phonenumbers.format_number(phonenumbers.parse(index_params["phone"]), phonenumbers.PhoneNumberFormat.NATIONAL).replace(" ", "")
                    f_app.mongo_index.update(f_app.user.get_database, user_id, index_params.values())
            if params['$set'] is not None:
                if "country" in params['$set']:
                    f_app.user.analyze_data_update(user_id, {"analyze_guest_country": True})
                if "user_type" in params['$set']:
                    f_app.user.analyze_data_update(user_id, {"analyze_guest_user_type": True})
        return user_id

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
            self.logger.debug(related_property_list)
            favorite_user_id_list = [fav["user_id"] for fav in f_app.user.favorite.get(f_app.user.favorite.search({"property_id": {"$in": related_property_list}}, per_page=0))]
            favorite_user_list = f_app.user.get(favorite_user_id_list, multi_return=dict)
            favorite_user_list = [_id for _id in favorite_user_list if "favorited_property_news" in favorite_user_list.get(_id).get("system_message_type", [])]
            self.logger.debug(favorite_user_list)
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
        message["status"] = message.pop("state", "deleted")
        return message

    def task_on_ping_sitemap(self, task):
        f_app.request("http://www.google.com/webmasters/sitemaps/ping?sitemap=http://yangfd.com/sitemap_location.xml")
        f_app.request("http://www.bing.com/webmaster/ping.aspx?siteMap=http://yangfd.com/sitemap_location.xml")
        if f_app.common.run_baidu_zhanzhang:
            baidu_zhanzhang_api = "http://data.zz.baidu.com/urls?site=www.yangfd.com&token=YYk0OqOnkEQvf1Eo&type=original"
            if 'url' in task:
                result = f_app.request(baidu_zhanzhang_api, task['url'], "POST", format="json")
                if 'success' not in result:
                    raise Exception("baidu_zhanzhang")

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
                            tag="crowdfunding_notification",
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
                            tag="crowdfunding_notification",
                        )

    def route_log_kwargs(self, kwargs, params):
        if kwargs.get("route"):
            property_id = re.findall(r"^/property/([0-9a-fA-F]{24})", kwargs["route"])
            if property_id:
                kwargs["property_id"] = property_id[0]
            rent_ticket_id = re.findall(r"^/property-to-rent/([0-9a-fA-F]{24})", kwargs["route"])
            if rent_ticket_id:
                kwargs["rent_ticket_id"] = rent_ticket_id[0]

        if params:
            if "status" in params:
                kwargs["param_status"] = params["status"]

        return kwargs

    def shop_item_add_pre(self, params):
        params["mtime"] = datetime.utcnow()
        return params

    def shop_item_update_pre(self, params, shop_id, item_id):
        if "$set" in params:
            params["$set"]["mtime"] = datetime.utcnow()
        return params

    def user_credit_add_after(self, params):
        # know user downloaded or not
        user_id = params.get('user_id', None)
        downloaded = f_app.user.get(user_id).get('analyze_guest_downloaded', None)
        if downloaded is None:  # when there's no record,then search all the histroy
            f_app.user.analyze_data_update(user_id, {"analyze_guest_downloaded": True})
        elif downloaded == '未下载':  # once know there was updated already, then do jugement base on this record only
            if params.get('type', None) == "view_rent_ticket_contact_info" and params.get('tag', None) == "download_ios_app":
                f_app.user.update_set(user_id, {'analyze_guest_downloaded': "已下载"})
                f_app.analyze_data_set_modif_time(user_id, 'analyze_guest_downloaded')  # only for update modif time
        return params

    def log_add_after(self, user_id, log_type, **kwargs):
        if not user_id:
            return user_id
        user = f_app.user.get(user_id)
        mod_time = f_app.user.analyze_data_get_modif_time(user_id)
        today = date.today()
        if 'analyze_guest_active_days' not in mod_time:
            f_app.user.analyze_data_update(user_id, {'analyze_guest_active_days': True})
        elif 'analyze_guest_active_days' in user:
            if mod_time['analyze_guest_active_days'].date() < today:
                f_app.user.update_set(user_id, {
                    'analyze_guest_active_days': int(user['analyze_guest_active_days']) + 1
                })
                f_app.user.analyze_data_set_modif_time(user_id, 'analyze_guest_active_days')
        else:
            if mod_time['analyze_guest_active_days'].date() < today:
                f_app.user.analyze_data_update(user_id, {'analyze_guest_active_days': True})

        if log_type == "route" and 'rent_ticket_id' in kwargs:

            if 'analyze_rent_estate_views_times' not in mod_time:
                f_app.user.analyze_data_update(user_id, {'analyze_rent_estate_views_times': True})
            elif 'analyze_rent_estate_views_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_rent_estate_views_times': int(user['analyze_rent_estate_views_times']) + 1
                })
                f_app.user.analyze_data_set_modif_time(user_id, 'analyze_rent_estate_views_times')
            else:
                f_app.user.analyze_data_update(user_id, {'analyze_rent_estate_views_times': True})

            if 'analyze_rent_intention_views_times' not in mod_time:
                f_app.user.analyze_data_update(user_id, {'analyze_rent_intention_views_times': True})
            elif 'analyze_rent_intention_views_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_rent_intention_views_times': int(user['analyze_rent_intention_views_times']) + 1
                })
                f_app.user.analyze_data_set_modif_time(user_id, 'analyze_rent_intention_views_times')
            else:
                f_app.user.analyze_data_update(user_id, {'analyze_rent_intention_views_times': True})

        if log_type == "route" and 'property_id' in kwargs:
            if 'analyze_intention_views_times' not in mod_time:
                f_app.user.analyze_data_update(user_id, {'analyze_intention_views_times': True})
            elif 'analyze_intention_views_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_intention_views_times': int(user['analyze_intention_views_times']) + 1
                })
                f_app.user.analyze_data_set_modif_time(user_id, 'analyze_intention_views_times')
            else:
                f_app.user.analyze_data_update(user_id, {'analyze_intention_views_times': True})

        if log_type == "rent_ticket_view_contact_info":
            if 'analyze_rent_intention_view_contact_times' not in mod_time:
                f_app.user.analyze_data_update(user_id, {'analyze_rent_intention_view_contact_times': True})
            elif 'analyze_rent_intention_view_contact_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_rent_intention_view_contact_times': int(user['analyze_rent_intention_view_contact_times']) + 1
                })
                f_app.user.analyze_data_set_modif_time(user_id, 'analyze_rent_intention_view_contact_times')
            else:
                f_app.user.analyze_data_update(user_id, {'analyze_rent_intention_view_contact_times': True})
        return user_id

    def user_favorite_add_after(self, params):
        user_id = params.get('user_id', None)
        mod_time = f_app.user.analyze_data_get_modif_time(user_id)
        if 'analyze_rent_intention_favorite_times' not in mod_time:
            f_app.user.analyze_data_update(user_id, {"analyze_rent_intention_favorite_times": True})
        elif params.get('type', None) == "property":
            old_value = f_app.user.get(user_id).get('analyze_rent_intention_favorite_times', 0)
            f_app.user.update(user_id, {'analyze_rent_intention_favorite_times': old_value + 1})
            f_app.analyze_data_set_modif_time(user_id, 'analyze_rent_intention_favorite_times')
        return params

currant_plugin()


class currant_util(f_util):
    def parse_budget(self, budget):
        if isinstance(budget, six.string_types) and "," not in budget or isinstance(budget, ObjectId):
            budget = f_app.enum.get(budget)
        elif isinstance(budget, six.string_types) and "," in budget:
            _type = budget.split(":")[0]
            _currency = budget.split(",")[-1]
            budget = {
                "slug": budget,
                "type": _type,
                "currency": _currency,
            }
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

    def reindex_user(self):
        for user_id in f_app.user.get_active():
            index_params = f_app.util.try_get_value(f_app.user.get(user_id), ["nickname", "phone", "email"])
            if index_params:
                if "phone" in index_params:
                    index_params["phone_national_number"] = phonenumbers.format_number(phonenumbers.parse(index_params["phone"]), phonenumbers.PhoneNumberFormat.NATIONAL).replace(" ", "")

                f_app.mongo_index.update(f_app.user.get_database, user_id, index_params.values())

    def ticket_determine_email_user(self, ticket):
        if not ticket:
            return None
        if "user" in ticket and ticket["user"] and "email" in ticket["user"] and ticket["user"]["email"]:
            return ticket["user"]
        # # Now we only send to "user"
        # elif "creator_user" in ticket and ticket["creator_user"] and "email" in ticket["creator_user"] and ticket["creator_user"]["email"]:
        #     return ticket["creator_user"]
        return None

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

    def check_and_override_minimum_rent_period(self, params):
        # TODO: made it a no-op for now
        return
        if "rent_available_time" in params and "rent_deadline_time" in params:
            rent_time_delta = params["rent_deadline_time"] - params["rent_available_time"]
            rent_time_delta_seconds = rent_time_delta.days * 86400 + rent_time_delta.seconds

            rent_period = dict(
                unit="seconds",
                value=str(rent_time_delta_seconds),
                value_float=rent_time_delta_seconds,
                type="time_period",
                _i18n_unit=True,
            )

            if "minimum_rent_period" in params:
                converted_minimum_rent_period = float(f_app.i18n.convert_i18n_unit({"unit": params["minimum_rent_period"]["unit"], "value": params["minimum_rent_period"]["value"]}, "seconds"))["value_float"]
                if converted_minimum_rent_period > rent_time_delta_seconds:
                    params["minimum_rent_period"] = rent_period

            else:
                params["minimum_rent_period"] = rent_period

    def get_featured_facilities(self, postcode):
        try:
            postcode = f_app.geonames.postcode.get(f_app.geonames.postcode.search({"postcode_index": postcode.replace(" ", "")}, per_page=-1))[0]
            assert "latitude" in postcode
        except:
            self.logger.warning("Invalid postcode", postcode)
            return
        all_modes = f_app.enum.get_all("featured_facility_traffic_type")

        places = f_app.main_mixed_index.get_nearby({"latitude": postcode["latitude"], "longitude": postcode["longitude"], "search_range": 1000})
        dest = "|".join([",".join((str(place["latitude"]), str(place["longitude"]))) for place in places if "type" in place])
        url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=%(origin)s&destinations=%(dest)s&mode=%(mode)s&language=en-GB&key=AIzaSyAWMlZ92pxXbkjxdbgbWRI7O1XAFYtLA1Q"

        featured_facilities = []

        for place in places:
            if "type" not in place:
                continue
            featured_facilities.append(dict(
                type=place["type"],
                traffic_time=[],
            ))
            if "hesa_university" in place:
                featured_facilities[-1]["hesa_university"] = ObjectId(place["hesa_university"])
            if "doogal_station" in place:
                featured_facilities[-1]["doogal_station"] = ObjectId(place["doogal_station"])

        for mode in all_modes:
            result = f_app.request.get(url % {"origin": postcode["postcode_index"], "dest": dest, "mode": mode["slug"]}, format="json")
            if result["status"] != "OK":
                if result["status"] == "INVALID_REQUEST":
                    continue
                self.logger.error(result["status"])
            for n, result in enumerate(result["rows"][0]["elements"]):
                if result["status"] != "OK":
                    self.logger.warning(result["status"])
                else:
                    featured_facilities[n]["traffic_time"].append({
                        "type": {"_id": ObjectId(mode["id"]), "type": "featured_facility_traffic_type", "_enum": "featured_facility_traffic_type"},
                        "time": {"value": str(result["duration"]["value"]), "value_float": result["duration"]["value"], "unit": "second", "_i18n_unit": True, "type": "time_period"},
                    })

        for featured_facility in featured_facilities[:]:
            if not len(featured_facility["traffic_time"]):
                featured_facilities.remove(featured_facility)

        return featured_facilities

    def test_parse_budget(self):
        assert f_app.util.parse_budget("budget:100,200,CNY") == [100, 200, "CNY"]
        assert f_app.util.parse_budget("budget:,200,CNY") == [None, 200, "CNY"]
        assert f_app.util.parse_budget("budget:200,,CNY") == [200, None, "CNY"]

currant_util()


class currant_shop(f_shop):
    def item_custom_search(self, params, sort=["time", "desc"], notime=False, per_page=10, time_field="time"):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

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
                abort(40000, self.logger.warning("sort param not well in format:", sort))

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

currant_shop()
# Fix submodule
f_recurring_billing_model()


class currant_comment(f_app.module_base):
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
            self.get_database(m).create_index([("status", ASCENDING)])
            self.get_database(m).create_index([("time", ASCENDING)])

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
                abort(40495, self.logger.warning("Non-exist comment:", filter(lambda comment_id: comment_id not in found_list, comment_id_or_list), exc_info=False))
            elif ignore_nonexist:
                self.logger.warning("Non-exist comment:", filter(lambda comment_id: comment_id not in found_list, comment_id_or_list), exc_info=False)

            for comment in result_list:
                result[comment["id"]] = _format_each(comment)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(comment_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40495, self.logger.warning("Non-exist comment:", comment_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        self.logger.warning("Non-exist comment:", comment_id_or_list, exc_info=False)
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
                abort(40000, self.logger.warning("sort param not well in format:", sort))

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


currant_comment()


class currant_order(f_order):
    def custom_search(self, params, sort=["time", "desc"], notime=False, per_page=10, time_field="time"):
        params.setdefault("status", {"$ne": "deleted"})
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, self.logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        order_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime, time_field=time_field)["content"]

        return order_id_list

currant_order()
