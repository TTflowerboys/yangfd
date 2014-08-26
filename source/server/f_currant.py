# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_user import f_user
from libfelix.f_interface import abort
from pymongo import ASCENDING, DESCENDING

import logging
logger = logging.getLogger(__name__)


class f_currant_user(f_user):
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
