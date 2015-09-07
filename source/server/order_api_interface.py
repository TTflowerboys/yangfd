# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort
from bson.objectid import ObjectId
from datetime import datetime
import logging
logger = logging.getLogger(__name__)


@f_api('/order/invest', params=dict(
    price=(float, True),
    payment_method_id=(str, "virtual"),
    async=(bool, 1),
    item_id=(ObjectId, True),
))
@f_app.user.login.check(force=True)
def order_invest(user, params):
    """
    Invest a crowdfunding project
    ``item_id`` represents the crowdfunding project id
    """
    force_price = params.pop("price")
    order_params = {"type": "investment"}
    item = f_app.shop.item.get(params["item_id"])
    if force_price < item.get("funding_min"):
        abort(40000, logger.warning("Invalid params: price cannot be less than funding_start of the crowdfunding item"))
    if "funding_start_date" in item and "funding_end_date" in item:
        if datetime.utcnow() > item["funding_end_date"]:
            abort(40000, logger.warning("Invalid item: this funding item is outdated."))
        if datetime.utcnow() < item["funding_start_date"]:
            abort(40000, logger.warning("Invalid item: this funding item does not start yet."))

    return f_app.order.output([f_app.shop.item_buy(params["item_id"], params, order_params=order_params, force_price=force_price)])[0]


@f_api('/order/recharge', params=dict(
    price=(float, True),
    payment_method_id=(str, "virtual"),
    async=(bool, 1),
))
@f_app.user.login.check(force=True)
def order_recharge(user, params):
    """
    Account recharge.
    Recharge item id is ``54bcb8146b8099406600b5f1``.
    Every time user recharges, user buys this item and get the credits.
    """
    params["item_id"] = ObjectId("54bcb8146b8099406600b5f1")
    order_params = {"type": "recharge"}
    params["quantity"] = params.pop("price")
    return f_app.order.output([f_app.shop.item_buy(params["item_id"], params, order_params=order_params)])[0]


@f_api('/order/withdraw', params=dict(
    price=(float, True),
    payment_method_id=(str, "virtual"),
    async=(bool, 1),
))
@f_app.user.login.check(force=True)
def order_withdraw(user, params):
    """
    """
    params["item_id"] = ObjectId("54bcba676b809941bf1c7846")
    force_price = params.pop("price")
    order_params = {"type": "withdrawal"}
    return f_app.order.output([f_app.shop.item_buy(params["item_id"], params, order_params=order_params, force_price=force_price)])[0]


@f_api('/order/earn', params=dict(
    price=(float, True),
    payment_method_id=(str, "virtual"),
    async=(bool, 1),
))
@f_app.user.login.check(force=True)
def order_earn(user, params):
    """
    """
    params["item_id"] = ObjectId("54bcba8d6b80994288a939b7")
    force_price = params.pop("price")
    order_params = {"type": "earnings"}
    return f_app.order.output([f_app.shop.item_buy(params["item_id"], params, order_params=order_params, force_price=force_price)])[0]


@f_api('/order/recover', params=dict(
    price=(float, True),
    payment_method_id=(str, "virtual"),
    async=(bool, 1),
))
@f_app.user.login.check(force=True)
def order_recovery(user, params):
    """
    """
    params["item_id"] = ObjectId("54bcbaaa6b809942b7bd1de8")
    force_price = params.pop("price")
    order_params = {"type": "recovery"}
    return f_app.order.output([f_app.shop.item_buy(params["item_id"], params, order_params=order_params, force_price=force_price)])[0]


@f_api('/order/search_anonymous', params=dict(
    item_id=(ObjectId, True),
    per_page=int,
    time=datetime,
    starttime=datetime,
    status=(list, None, str),
))
@f_app.user.login.check(force=True)
def order_search_anonymous(user, params):
    per_page = params.pop("per_page", 0)
    if "item_id" in params:
        params["items.id"] = str(params.pop("item_id"))
    params["status"] = "paid"

    time_start = params.pop("starttime", None)
    time_end = params.get("time", None)

    if time_start or time_end:
        params["time_additional"] = {}
        if time_start and time_end:
            if time_end < time_start:
                abort(40000, logger.warning("Invalid params: End time is earlier than start time.", exc_info=False))
        if time_start:
            params["time_additional"]["$gte"] = time_start
        if time_end:
            params["time_additional"]["$lt"] = time_end

    order_list = f_app.order.output(f_app.order.custom_search(params, per_page=per_page), permission_check=False)

    for order in order_list:
        if order["user"].get("nickname"):
            order["user_nickname"] = order["user"]["nickname"][0] + (len(order["user"]["nickname"]) - 1) * "*"
            order.pop("user")
        order.pop("order_secret")
        order.pop("payment_method", None)

    return order_list


@f_api('/order/search_view_rent_ticket_contact_info', params=dict(
    per_page=int,
    user_id=ObjectId,
))
@f_app.user.login.check(force=True)
def order_search_view_rent_ticket_contact_info(user, params):
    user_id = user["id"]
    if "user_id" in params:
        assert set(user["role"]) & set(["admin", "jr_admin", "sales"]), abort(40300, "no permission to touch other user")
        user_id = params.pop("user_id")

    per_page = params.pop("per_page", 0)
    orders = f_app.order.output(f_app.order.custom_search({
        "user.id": user_id,
        "items.id": f_app.common.view_rent_ticket_contact_info_id
    }, per_page=per_page))

    for order in orders:
        order["ticket"] = f_app.ticket.output([order.pop("ticket_id")], fuzzy_user_info=True)[0]

    return orders


@f_api('/order/search', params=dict(
    item_id=ObjectId,
    per_page=int,
    time=datetime,
    starttime=datetime,
    user_id=ObjectId,
    shop_id=ObjectId,
    type=(list, None, str),
    status=(list, None, str),
))
@f_app.user.login.check(force=True)
def order_search(user, params):
    """
    ``type`` can be list of "investment", "withdrawal", "recharge", "earnings", "recovery"
    ``status`` can be list of "paid", "pending", "canceled", "unpaid"
    ``shop_id`` is a preserved field, it may be used in future.
    sort by ``mtime`` by default.
    """
    per_page = params.pop("per_page", 0)
    if "user_id" in params:
        params["user.id"] = str(params.pop("user_id"))
    if "shop_id" in params:
        params["shop.id"] = str(params.pop("shop_id"))
    if "item_id" in params:
        params["items.id"] = str(params.pop("item_id"))
    if "type" in params:
        if not set(params["type"]) <= set(["recharge", "withdrawal", "recovery", "earnings", "investment"]):
            abort(40000, logger.warning("Invalid params: type", exc_info=False))
        params["type"] = {"$in": params.pop("type")}
    if "status" in params:
        params["status"] = {"$in": params.pop("status")}

    time_start = params.pop("starttime", None)
    time_end = params.get("time")

    if time_start or time_end:
        params["time_additional"] = {}
        if time_start and time_end:
            if time_end < time_start:
                abort(40000, logger.warning("Invalid params: End time is earlier than start time.", exc_info=False))
        if time_start:
            params["time_additional"]["$gte"] = time_start
        if time_end:
            params["time_additional"]["$lt"] = time_end

    user_role = f_app.user.get_role(user["id"])
    if set(user_role) & set(["admin", "jr_admin"]):
        pass
    else:
        params["user.id"] = user["id"]
    order_list = f_app.order.output(f_app.order.custom_search(params, per_page=per_page), permission_check=False)
    logger.debug(params)

    return order_list


@f_api('/order/<order_id>')
@f_app.user.login.check(force=True)
def order_get(user, order_id):
    user = f_app.user.get(user["id"])
    if "admin" in user["role"]:
        return f_app.order.output([order_id], permission_check=False)[0]
    else:
        return f_app.order.output([order_id])[0]


@f_api('/order/item_snapshot')
@f_app.user.login.check(force=True)
def order_item_snapshot(user):
    params = {"user.id": user["id"], "type": "investment"}
    order_list = f_app.order.output(f_app.order.custom_search(params, per_page=0), permission_check=False)
    item_list = []
    item_id_set = set()
    logger.debug(order_list)
    for order in order_list:
        if "items" in order and len(order["items"]) == 1:
            if order["items"][0]["id"] not in item_id_set:
                item_list.append(order["items"][0])
                item_id_set.add(order["items"][0]["id"])
        else:
            logger.warning("Invalid order found, this should be a BUG!", exc_info=False)

    return item_list
