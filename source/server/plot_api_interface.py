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
    living_room_count=int,
    floor=str,
    space=str,
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def plot_search(user, params):
    per_page = params.pop("per_page", 0)
    if "status" in params:
        params["status"] = {"$in": params["status"]}

    if "space" in params:
        space_field = "space"
        space = [float(x.strip()) if x else "" for x in params.pop("space").split(",")]
        space_imperial = [float(f_app.i18n.convert_i18n_unit({"value": x, "unit": "meter ** 2"}, "foot ** 2")) if x else "" for x in space]
        space_filter = []
        if space[0] and space[1]:
            space_filter.append({"%s.unit" % space_field: "meter ** 2", "%s.value_float" % space_field: {"$gte": space[0], "$lt": space[1]}})
            space_filter.append({"%s.unit" % space_field: "foot ** 2", "%s.value_float" % space_field: {"$gte": space_imperial[0], "$lt": space_imperial[1]}})
        elif space[0] and not space[1]:
            space_filter.append({"%s.unit" % space_field: "meter ** 2", "%s.value_float" % space_field: {"$gte": space[0]}})
            space_filter.append({"%s.unit" % space_field: "foot ** 2", "%s.value_float" % space_field: {"$gte": space_imperial[0]}})
        elif not space[0] and space[1]:
            space_filter.append({"%s.unit" % space_field: "meter ** 2", "%s.value_float" % space_field: {"$lt": space[1]}})
            space_filter.append({"%s.unit" % space_field: "foot ** 2", "%s.value_float" % space_field: {"$lt": space_imperial[1]}})
        else:
            abort(40000, logger.warning("Invalid params: space cannot be empty"))
        params["$or"] = space_filter

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
