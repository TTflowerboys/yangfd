# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from bson.objectid import ObjectId
from pymongo import ASCENDING, DESCENDING
from libfelix.f_common import f_app
from libfelix.f_user import f_user
from libfelix.f_ticket import f_ticket
from libfelix.f_interface import abort
from libfelix.f_cache import f_cache

import logging
logger = logging.getLogger(__name__)


class f_currant_user(f_user):
    """
        ==================================================================
        User
        ==================================================================
    """
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
        for t in ticket_list:
            user_id_set.add(t.get("creator_user_id"))
            user_id_set |= set(t.get("assignee", []))

        user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields)
        user_dict = {}

        for u in user_list:
            user_dict[u["id"]] = u

        for t in ticket_list:
            t["creator_user"] = user_dict.get(t.pop("creator_user_id"))
            if "shop_id" in t:
                t["lab_id"] = str(t.pop("shop_id", None))
            if isinstance(t.get("assignee"), list):
                t["assignee"] = map(lambda x: user_dict.get(x), t["assignee"])

        return ticket_list

f_currant_ticket()


class f_currant_plugins(f_app.plugin_base):
    """
        ==================================================================
        Plugins
        ==================================================================
    """
    def ticket_get(self, ticket):
        if "assignee" in ticket:
            ticket["assignee"] = map(str, ticket.pop("assignee", []))

        return ticket

f_currant_plugins()


class f_house(f_app.module_base):
    house_database = "houses"

    def get_database(self, m):
        return getattr(m, self.house_database)

    @f_cache("house")
    def get(self, house_id_or_list, force_reload=False, ignore_nonexist=False):
        def _format_each(house):
            house["id"] = str(house.pop("_id"))
            return house

        if isinstance(house_id_or_list, (tuple, list, set)):
            result = {}

            with f_app.mongo() as m:
                result_list = list(self.get_database(m).find({"_id": {"$in": [ObjectId(house_id) for house_id in house_id_or_list]}, "status": {"$ne": "deleted"}}))

            if not force_reload and len(result_list) < len(house_id_or_list) and not ignore_nonexist:
                found_list = map(lambda house: str(house["_id"]), result_list)
                abort(40400, logger.warning("Non-exist house:", filter(lambda house_id: house_id not in found_list, house_id_or_list), exc_info=False))
            elif ignore_nonexist:
                logger.warning("Non-exist house:", filter(lambda house_id: house_id not in found_list, house_id_or_list), exc_info=False)

            for house in result_list:
                result[house["id"]] = _format_each(house)

            return result

        else:
            with f_app.mongo() as m:
                result = self.get_database(m).find_one({"_id": ObjectId(house_id_or_list), "status": {"$ne": "deleted"}})

                if result is None:
                    if not force_reload and not ignore_nonexist:
                        abort(40400, logger.warning("Non-exist house:", house_id_or_list, exc_info=False))
                    elif ignore_nonexist:
                        logger.warning("Non-exist house:", house_id_or_list, exc_info=False)
                    return None

            return _format_each(result)

    def add(self, params):
        params.setdefault("status", "new")
        params.setdefault("time", datetime.utcnow())
        with f_app.mongo() as m:
            house_id = self.get_database(m).insert(params)

        return str(house_id)

    def output(self, house_id_list, ignore_nonexist=False, multi_return=list, force_reload=False):
        houses = self.get(house_id_list, ignore_nonexist=ignore_nonexist, multi_return=multi_return, force_reload=force_reload)
        return houses

    def search(self, params, sort=["time", "desc"], notime=False, per_page=10):
        params.setdefault("status", "new")
        if sort is not None:
            try:
                sort_field, sort_orientation = sort
            except:
                abort(40000, logger.warning("sort param not well in format:", sort))

        else:
            sort_field = sort_orientation = None

        house_id_list = f_app.mongo_index.search(self.get_database, params, count=False, sort=sort_orientation, sort_field=sort_field, per_page=per_page, notime=notime)["content"]

        return house_id_list

    def remove(self, house_id):
        self.update_set(house_id, {"status": "deleted"})

    def update(self, house_id, params):
        with f_app.mongo() as m:
            self.get_database(m).update(
                {"_id": ObjectId(house_id)},
                params,
            )
        house = self.get(house_id, force_reload=True)
        return house

    def update_set(self, house_id, params):
        return self.update(house_id, {"$set": params})

f_house()
