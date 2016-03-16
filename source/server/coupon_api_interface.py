# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from bson.objectid import ObjectId
from app import f_app
from libfelix.f_interface import f_api, abort
from libfelix.f_log import warning


@f_api('/coupon/add', params=dict(
    discount=("i18n:currency", True),
    discount_shared=float,
    effective_time=datetime,
    expire_time=datetime,
    description=str,
    code=str,
    category="enum:coupon_category",
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def coupon_add(user, params):
    f_app.util.validate_coupon(params)
    return f_app.coupon.add(params, permission_check=False)


@f_api('/coupon/<coupon_id>/edit', params=dict(
    discount="i18n:currency",
    discount_shared=float,
    effective_time=datetime,
    expire_time=datetime,
    status=str,
    description=str,
    code=str,
    category="enum:coupon_category",
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def coupon_edit(coupon_id, user, params):
    """
     Parse ``deleted`` to ``status`` will delete the given coupon.
    """
    f_app.util.validate_coupon(params, coupon_id)
    if "code" in params:
        code = params["code"]
        params["code"] = code.upper()
    return f_app.coupon.update_set(coupon_id, params, permission_check=False)


@f_api('/coupon/<coupon_id>')
def get_coupon(coupon_id):
    """
    Get coupon information
    """
    return f_app.coupon.output([coupon_id])[0]


@f_api("/coupon/list", params=dict(
    time=datetime,
    no_paging=(bool, False),
    per_page=int,
    sort=(list, None, str),
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def get_coupon_list(user, params):
    """
    Get coupon list

     Syntax examples for ``sort``:

    * time,desc
    * time,asc
    """
    sort = params.pop("sort", None)
    if sort is not None:
        try:
            sort_field, sort_orientation = sort
        except:
            abort(40000, warning("sort param not well in format:", sort))
    else:
        sort_field = "time"
        sort_orientation = "desc"
    per_page = -1 if params.pop("no_paging", False) else params.pop("per_page", 10)
    coupon_ids = f_app.mongo_index.search(f_app.coupon.get_database, params, per_page=per_page, sort=sort_orientation, sort_field=sort_field, time_field="time").get("content", [])
    return f_app.coupon.output(coupon_ids)


@f_api('/coupon/search', params=dict(
    code=str,
    user_id=ObjectId,
))
@f_app.user.login.check(force=True, check_role=True)
def search_coupon(user, params):
    if "code" in params or "user_id" in params:
        assert set(user["role"]) & set(f_app.common.advanced_admin_roles), abort(40300, "no permission to touch this")
        if "code" in params:
            params["code"] = params["code"].upper()
    else:
        params["user_id"] = ObjectId(user["id"])
    return f_app.coupon.output(f_app.coupon.search(params, permission_check=False))
