# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort
from bson.objectid import ObjectId
from datetime import datetime
import logging
logger = logging.getLogger(__name__)


@f_api('/order/add', params=dict(
    price=(float, True),
    payment_method_id=(str, "virtual"),
    async=(bool, 1),
    type=(str, "normal"),
    item_id=(ObjectId, True),
))
@f_app.user.login.check(force=True)
def order_add(user, params):
    return f_app.order.output([f_app.shop.item_buy(params["item_id"], params)])[0]


@f_api('/order/search', params=dict(
    item_id=ObjectId,
    per_page=int,
    time=datetime,
    starttime=datetime,
    endtime=datetime,
))
@f_app.user.login.check(force=True)
def order_search(user, params):
    per_page = params.pop("per_page", 0)
    user_role = f_app.user.get_role(user["id"])
    if set(user_role) & set(["admin", "jr_admin"]):
        order_id_list = f_app.order.custom_search(params, per_page=per_page)
    else:
        params["user.id"] = user["id"]
        order_id_list = f_app.order.custom_search(params, per_page=per_page)
    return f_app.order.output(order_id_list)[0]


@f_api('/order/<order_id>')
@f_app.user.login.check(force=True)
def order_get(user, order_id):
    user = f_app.user.get(user["id"])
    if "admin" in user["role"]:
        return f_app.order.output([order_id], permission_check=False)[0]
    else:
        return f_app.order.output([order_id])[0]
