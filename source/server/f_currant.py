# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from bson.objectid import ObjectId
from pymongo import ASCENDING, DESCENDING
from libfelix.f_common import f_app
from libfelix.f_user import f_user
from libfelix.f_ticket import f_ticket
from libfelix.f_log import f_log
from libfelix.f_interface import abort
from libfelix.f_cache import f_cache

import phonenumbers
import logging
logger = logging.getLogger(__name__)


class f_currant_log(f_log):
    """
        ==================================================================
        Log
        ==================================================================
    """
    @f_cache("log")
    def get(self, log_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(log):
            log["id"] = str(log.pop("_id"))
            log.pop("cookie", None)
            return log

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
        logs = self.get(log_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return logs

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
    nested_attr = ("_hash", "admin", "email", "sms", "vip", "credit", "referral", "tag", "career", "education", "login", "favorite")

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
            intention_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "intention"})
            support_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "support"})
            self.update_set(user_id, {"counter.intention": len(intention_tickets), "counter.support": len(support_tickets)})

        elif counter_name == "intention":
            intention_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "intention"})
            self.update_set(user_id, {"counter.intention": len(intention_tickets)})
        elif counter_name == "support":
            support_tickets = f_app.ticket.search({"user_id": ObjectId(user_id), "type": "support"})
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
            favorite["id"] = str(favorite.pop("_id"))
            return favorite

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

    def favorite_output(self, favorite_id_list, ignore_nonexist=False, multi_return=list, force_reload=False, ignore_user=True):
        favorites = self.favorite_get(favorite_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        property_set = set()
        for fav in favorites:
            if ignore_user:
                del fav["user_id"]
            property_set.add(fav["property_id"])

        property_dict = f_app.property.output(list(property_set), multi_return=dict)
        for fav in favorites:
            fav["property"] = property_dict.get(str(fav.pop("property_id")))

        return favorites

    def favorite_get_by_user(self, user_id):
        return self.favorite_search({"user_id": ObjectId(user_id)}, per_page=0)

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
    def output(self, ticket_id_list):
        ticket_list = f_app.ticket.get(ticket_id_list)
        user_id_set = set()
        enum_id_set = set()
        property_id_set = set()
        for t in ticket_list:
            user_id_set.add(t.get("creator_user_id"))
            user_id_set |= set(t.get("assignee", []))
            if "budget" in t:
                enum_id_set.add(t["budget"]["_id"])
            if "property_id" in t:
                property_id_set.add(t["property_id"])

        user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields)
        user_dict = {}
        enum_dict = f_app.enum.get(enum_id_set, multi_return=dict)
        property_dict = f_app.property.output(list(property_id_set), multi_return=dict)

        for u in user_list:
            user_dict[u["id"]] = u

        for t in ticket_list:
            t["creator_user"] = user_dict.get(t.pop("creator_user_id"))
            if isinstance(t.get("assignee"), list):
                t["assignee"] = map(lambda x: user_dict.get(x), t["assignee"])
            if "budget" in t:
                t["budget"] = enum_dict.get(str(t["budget"]["_id"]))
            if "property_id" in t:
                t["property"] = property_dict.get(str(t.pop("property_id")))

        return ticket_list

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

f_currant_ticket()


class f_currant_plugins(f_app.plugin_base):
    """
        ==================================================================
        Plugins
        ==================================================================
    """
    def user_output_each(self, result_row, raw_row, user, admin, simple):
        if "phone" in raw_row:
            phonenumber = phonenumbers.parse(raw_row["phone"])
            result_row["phone"] = phonenumber.national_number
            result_row["country_code"] = phonenumber.country_code
        return result_row

    def ticket_get(self, ticket):
        if "assignee" in ticket:
            ticket["assignee"] = map(str, ticket.pop("assignee", []))

        return ticket

    def user_add_after(self, user_id, params, noregister):
        index_params = f_app.util.try_get_value(params, ["nickname", "phone", "email"])
        if index_params:
            if "phone" in index_params:
                index_params["phone_national_number"] = str(phonenumbers.parse(index_params["phone"]).national_number)
            f_app.mongo_index.update(f_app.user.get_database, user_id, index_params.values())

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
        if {'_id': ObjectId('5417eca66b80992d07638186'), 'type': 'news_category', '_enum': 'news_category'} in params["category"]:
            # System
            message = {
                "type": "system",
                "title": params["title"],
                "text": params["content"]
            }
            user_list = f_app.user.search({"register_time": {"$ne": None}, "system_message_type": "system"})
            f_app.message.add(message, user_list)
        if "zipcode_index" in params:
            # Favorite
            related_property_list = f_app.property.search({"zipcode_index": params["zipcode_index"], "status": {"$in": ["selling", "sold out"]}})
            related_property_list = [ObjectId(property) for property in related_property_list]
            favorite_user_list = f_app.user.favorite.search({"property_id": related_property_list}, per_page=0)
            favorite_user_list = [_id for _id in favorite_user_list if "favorite" in f_app.user.get(_id).get("system_message_type", [])]
            message = {
                "type": "favorite",
                "title": params["title"],
                "text": params["content"]
            }
            f_app.message.add(message, favorite_user_list)
            # Intention
            intention_ticket_list = f_app.ticket.search({"property_id": {"$in": related_property_list}, "status": {"$in": ["new", "assigned", "in_progress", "deposit"]}}, per_page=0)
            intention_user_list = [t.get("user_id") for t in f_app.ticket.get(intention_ticket_list)]
            intention_user_list = [_id for _id in intention_user_list if "intention" in f_app.user.get(_id).get("system_message_type", [])]
            message = {
                "type": "intention",
                "title": params["title"],
                "text": params["content"]
            }
            f_app.message.add(message, intention_user_list)
            # Mine
            bought_ticket_list = f_app.ticket.search({"property_id": {"$in": related_property_list}, "status": "bought"}, per_page=0)
            bought_user_list = [t.get("user_id") for t in f_app.ticket.get(bought_ticket_list)]
            bought_user_list = [_id for _id in intention_user_list if "mine" in f_app.user.get(_id).get("system_message_type", [])]
            message = {
                "type": "mine",
                "title": params["title"],
                "text": params["content"]
            }
            f_app.message.add(message, bought_user_list)

        return params

    def message_output_each(self, message):
        message["status"] = message.pop("state", "deleted")
        return message


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

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            property_id = self.get_database(m).insert(params)

        return str(property_id)

    def output(self, property_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        propertys = self.get(property_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return propertys

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10, count=False):
        params.setdefault("status", "new")
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        if count:
            property_id_list = f_app.mongo_index.search(self.get_database, params, count=count, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)
        else:
            property_id_list = f_app.mongo_index.search(self.get_database, params, count=count, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)['content']

        return property_id_list

    def remove(self, property_id):
        self.update_set(property_id, {"status": "deleted"})

    def update(self, property_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(property_id)},
                params,
            )
        property = self.get(property_id, force_reload=True)
        return property

    def update_set(self, property_id, params):
        return self.update(property_id, {"$set": params})

f_property()


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
            report["id"] = str(report.pop("_id"))
            return report

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
        params.setdefault("status", "new")
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
