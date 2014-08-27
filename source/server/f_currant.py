# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_user import f_user
from libfelix.f_ticket import f_ticket
from libfelix.f_interface import abort
from pymongo import ASCENDING, DESCENDING

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
        if "creator_user_id" in ticket:
            ticket["creator_user_id"] = str(ticket.pop("creator_user_id", None))
        if "assignee" in ticket:
            ticket["assignee"] = map(str, ticket.pop("assignee", []))

        return ticket

f_currant_plugins()
