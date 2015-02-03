# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort
from bson.objectid import ObjectId

import logging
logger = logging.getLogger(__name__)


plot_params = dict(
    name=("i18n", None, str),
    property_id=ObjectId,
    investment_type=(list, None, 'enum:investment_type'),
    status=str,
    floor=str,
    bedroom_count=int,
    living_room_count=int,
    bathroom_count=int,
    kitchen_count=int,
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    total_price="i18n:currency",
    description=str,
    unset_fields=(list, None, str),
)


@f_api('/plot/add', params=plot_params)
@f_app.user.login.check(role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def plot_add(user, params):
    params.pop("unset_fields", [])
    return f_app.plot.add(params)


@f_api('/plot/<plot_id>')
def plot_get(plot_id):
    return f_app.plot.output([plot_id])[0]


@f_api('/plot/search', params=dict(
    property_id=ObjectId,
    status=(list, None, str),
    per_page=int,
    time=datetime,
    investment_type="enum:investment_type",
    bedroom_count=int,
    floor=str,
    price=str,
    space=str,
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def plot_search(user, params):
    per_page = params.pop("per_page", 0)
    if "status" in params:
        params["status"] = {"$in": params["status"]}

    if "space" in params:
        space_filter = []
        space_params = [x.strip() for x in params.pop("space").split(",")]

        if len(space_params) == 3:
            assert space_params[2] in ("meter ** 2", "foot ** 2"), abort(40000, logger.warning("Invalid params: space unit not correct", exc_info=False))
        elif len(space_params) == 2:
            space_params.append("meter ** 2")
        else:
            abort(40000)

        space_params[0] = float(space_params[0]) if space_params[0] else None
        space_params[1] = float(space_params[1]) if space_params[1] else None

        space_field = "space"
        for space_unit in ("meter ** 2", "foot ** 2"):
            condition = {"%s.unit" % space_field: space_unit}
            if space_unit == space_params[2]:
                condition["%s.value_float" % space_field] = {}
                if space_params[0]:
                    condition["%s.value_float" % space_field]["$gte"] = space_params[0]
                if space_params[1]:
                    condition["%s.value_float" % space_field]["$lte"] = space_params[1]
            else:
                condition["%s.value_float" % space_field] = {}
                if space_params[0]:
                    condition["%s.value_float" % space_field]["$gte"] = float(f_app.i18n.convert_i18n_unit({"value": space_params[0], "unit": space_params[2]}, space_unit))
                if space_params[1]:
                    condition["%s.value_float" % space_field]["$lte"] = float(f_app.i18n.convert_i18n_unit({"value": space_params[1], "unit": space_params[2]}, space_unit))
            space_filter.append(condition)

        params["$or"] = space_filter

    if "price" in params:
        price = [x.strip() for x in params.pop("price").split(",")]
        price_filter = []
        assert len(price) == 3 and price[2] in f_app.common.currency, abort(40000, logger.warning("Invalid price", exc_info=False))
        for currency in f_app.common.currency:
            condition = {"total_price.unit": currency}
            if currency == price[2]:
                condition["total_price.value_float"] = {}
                if price[0]:
                    condition["total_price.value_float"]["$gte"] = price[0]
                if price[1]:
                    condition["total_price.value_float"]["$lte"] = price[1]
            else:
                condition["total_price.value_float"] = {}
                if price[0]:
                    condition["total_price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": price[2], "value": price[0]}, currency))
                if price[1]:
                    condition["total_price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": price[2], "value": price[1]}, currency))
            price_filter.append(condition)

            if "$or" not in params:
                params["$or"] = price_filter
            else:
                or_filter = params.pop("$or")
                params["$and"] = [{"$or": or_filter}, {"$or": price_filter}]

    logger.debug(params)

    return f_app.plot.output(f_app.plot.search(params, per_page=per_page))


@f_api('/plot/<plot_id>/edit', params=plot_params)
@f_app.user.login.check(role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def plot_edit(user, plot_id, params):
    unset_fields = params.pop("unset_fields", [])
    f_app.plot.update_set(plot_id, params)
    if unset_fields:
        f_app.plot.update(plot_id, {"$unset": {i: "" for i in unset_fields}})

    return f_app.plot.output([plot_id])[0]


@f_api('/plot/<plot_id>/remove')
@f_app.user.login.check(role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def plot_remove(user, plot_id):
    return f_app.plot.remove(plot_id)
