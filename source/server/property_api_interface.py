# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import json
import six
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort, request
from bson.objectid import ObjectId

import logging
logger = logging.getLogger(__name__)


@f_api('/property/search', params=dict(
    per_page=int,
    mtime=datetime,
    sort=(list, None, str),

    status=(list, ["selling", "sold out"], str),
    property_type=(list, None, "enum:property_type"),
    intention=(list, None, "enum:intention"),
    country='country',
    city='geonames_gazetteer:city',
    street=('i18n', None, str),
    report_id=ObjectId,
    maponics_neighborhood=(list, None, "maponics_neighborhood"),
    equity_type='enum:equity_type',
    property_price_type="enum:property_price_type",
    target_property_id=(ObjectId, None, "str"),
    annual_return_estimated=str,  # How?
    budget="enum:budget",
    random=bool,
    name=str,
    developer=str,
    slug=str,
    bedroom_count="enum:bedroom_count",
    building_area="enum:building_area",
    user_generated=bool,
    location_only=bool,
    latitude=float,
    longitude=float,
    search_range=(int, 5000),
))
@f_app.user.login.check(check_role=True)
def property_search(user, params):
    """
    Only ``admin``, ``jr_admin``, ``operation``, ``jr_operation``, ``developer`` and ``agency`` could use the ``target_property_id`` param.

    Non-administrator users who specify the ``status`` param to anything else than ``selling`` or ``sold out`` will be restricted to search user-generated properties only (those with ``user_generated`` set to ``True``).

    Syntax examples for ``sort``:

    * name.en_GB,asc
    * mtime,desc

    ``time`` should be a unix timestamp in utc.
    ``building_area`` format: ``,40,meter ** 2``, ``40,100,foot ** 2``, ``100,,meter ** 2``

    When searching nearby properties (using ``latitude``, ``longitude`` and optionally ``search_range``), ``per_page`` and ``sort`` are not supported and must not be present.
    """
    params.setdefault("user_generated", {"$ne": True})
    random = params.pop("random", False)
    location_only = params.pop("location_only", False)
    sort = params.pop("sort", ["mtime", "desc"])
    if "target_property_id" in params:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]), abort(40300, "No access to specify status or target_property_id")
    if params["status"] != ["selling", "sold out"]:
        if not set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]):
            params["user_generated"] = True
    if "property_type" in params:
        params["property_type"] = {"$in": params["property_type"]}

    if "intention" in params:
        params["intention"] = {"$in": params.pop("intention", [])}

    if "maponics_neighborhood" in params:
        params["maponics_neighborhood"] = {"$in": params["maponics_neighborhood"]}

    params["$and"] = []
    non_project_params = {"$and": []}
    main_house_types_elem_params = {"$and": []}

    if "latitude" in params:
        assert "longitude" in params, abort(40000)
        assert "per_page" not in params, abort(40000)
        assert "sort" not in params, abort(40000)
    elif "longitude" in params:
        abort(40000)
    else:
        params.pop("search_range")

    if "budget" in params or "price" in params:
        if "budget" in params:
            budget = f_app.util.parse_budget(params.pop("budget"))
        elif "price" in params:
            budget = [x.strip() for x in params.pop("price").split(",")]
            assert len(budget) == 3 and budget[2] in f_app.common.currency, abort(40000, logger.warning("Invalid price", exc_info=False))
        non_project_price_filter = []
        main_house_types_elem_price_filter = []
        for currency in f_app.common.currency:
            condition = {"total_price.unit": currency}
            house_condition = {"total_price_max.unit": currency}
            if currency == budget[2]:
                condition["total_price.value_float"] = {}
                if budget[0]:
                    condition["total_price.value_float"]["$gte"] = float(budget[0])
                    house_condition["total_price_max.value_float"] = {"$gte": float(budget[0])}
                if budget[1]:
                    condition["total_price.value_float"]["$lte"] = float(budget[1])
                    house_condition["total_price_min.value_float"] = {"$lte": float(budget[1])}
            else:
                condition["total_price.value_float"] = {}
                if budget[0]:
                    condition["total_price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))
                    house_condition["total_price_max.value_float"] = {"$gte": float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))}
                if budget[1]:
                    condition["total_price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))
                    house_condition["total_price_min.value_float"] = {"$lte": float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))}
            non_project_price_filter.append(condition)
            main_house_types_elem_price_filter.append(house_condition)
        non_project_params["$and"].append({"$or": non_project_price_filter})
        main_house_types_elem_params["$and"].append({"$or": main_house_types_elem_price_filter})

    if "name" in params:
        name = params.pop("name")
        name_filter = []
        for locale in f_app.common.i18n_locales:
            name_filter.append({"name.%s" % locale: name})

        params["$and"].append({"$or": name_filter})

    if "developer" in params:
        developer = params.pop("developer")
        developer_filter = []
        for locale in f_app.common.i18n_locales:
            developer_filter.append({"developer.%s" % locale: developer})

        params["$and"].append({"$or": developer_filter})

    if "bedroom_count" in params:
        bedroom_count = f_app.util.parse_bedroom_count(params.pop("bedroom_count"))
        if bedroom_count[0] and bedroom_count[1]:
            if bedroom_count[0] == bedroom_count[1]:
                bedroom_filter = bedroom_count[0]
            elif bedroom_count[0] > bedroom_count[1]:
                abort(40000, logger.warning("Invalid bedroom_count: start value cannot be greater than end value"))
            else:
                bedroom_filter = {"$gte": bedroom_count[0], "$lte": bedroom_count[1]}
        elif bedroom_count[0]:
            bedroom_filter = {"$gte": bedroom_count[0]}
        elif bedroom_count[1]:
            bedroom_filter = {"$lte": bedroom_count[1]}

        non_project_params["bedroom_count"] = bedroom_filter
        main_house_types_elem_params["bedroom_count"] = bedroom_filter

    if "building_area" in params:
        building_area_filter = []
        space_filter = []
        building_area = f_app.util.parse_building_area(params.pop("building_area"))

        for building_area_unit in ("meter ** 2", "foot ** 2"):
            condition = {"space.unit": building_area_unit}
            house_condition = {"building_area.unit": building_area_unit}
            if building_area_unit == building_area[2]:
                condition["space.value_float"] = {}
                if building_area[0]:
                    condition["space.value_float"]["$gte"] = float(building_area[0])
                    house_condition["building_area_max.value_float"] = {"$gte": float(building_area[0])}
                if building_area[1]:
                    condition["space.value_float"]["$lte"] = float(building_area[1])
                    house_condition["building_area_min.value_float"] = {"$lte": float(building_area[1])}
            else:
                condition["space.value_float"] = {}
                if building_area[0]:
                    condition["space.value_float"]["$gte"] = float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[0]}, building_area_unit))
                    house_condition["building_area_max.value_float"] = {"$gte": float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[0]}, building_area_unit))}
                if building_area[1]:
                    condition["space.value_float"]["$lte"] = float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[1]}, building_area_unit))
                    house_condition["building_area_min.value_float"] = {"$lte": float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[1]}, building_area_unit))}
            space_filter.append(condition)
            building_area_filter.append(house_condition)
        non_project_params["$and"].append({"$or": space_filter})
        main_house_types_elem_params["$and"].append({"$or": building_area_filter})

    if len(non_project_params["$and"]) < 1:
        non_project_params.pop("$and")

    if len(main_house_types_elem_params["$and"]) < 1:
        main_house_types_elem_params.pop("$and")

    if len(non_project_params):
        params["$and"].append({"$or": [non_project_params, {"main_house_types": {"$elemMatch": main_house_types_elem_params}}]})

    if len(params["$and"]) < 1:
        params.pop("$and")

    params["status"] = {"$in": params["status"]}
    per_page = params.pop("per_page", 0)

    if "latitude" in params:
        property_list = {"content": f_app.property.get_nearby(params)}
        property_list["count"] = len(property_list["content"])
    else:
        # Default to mtime,desc
        property_list = f_app.property.search(params, per_page=per_page, count=True, sort=sort, time_field="mtime")
        property_list['content'] = f_app.property.output(property_list['content'], location_only=location_only)

    if random and property_list["content"]:
        import random
        random.shuffle(property_list["content"])

    return property_list


@f_api('/property/search_with_plot', params=dict(
    per_page=int,
    mtime=datetime,
    sort=(list, None, str),

    status=(list, ["selling", "sold out"], str),
    property_type=(list, None, "enum:property_type"),
    intention=(list, None, "enum:intention"),
    country='country',
    city='geonames_gazetteer:city',
    maponics_neighborhood=(list, None, "maponics_neighborhood"),
    street=('i18n', None, str),
    report_id=ObjectId,
    bedroom_count=int,
    bathroom_count=int,
    living_room_count=int,
    kitchen_count=int,
    space=str,
    price=str,
    investment_type="enum:investment_type",
    floor=str,
    name=str,
    developer=str,
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation', 'developer', 'agency'])
def property_search_with_plot(user, params):
    """
    Only ``admin``, ``jr_admin``, ``operation``, ``jr_operation``, ``developer`` and ``agency`` could use the ``target_property_id`` and ``status`` param.

    Syntax examples for ``sort``:

    * name.en_GB,asc
    * mtime,desc

    ``time`` should be a unix timestamp in utc.
    ``building_area`` format: ``,40,m ** 2``, ``40,100,foot ** 2``, ``100,,m ** 2``
    """
    random = params.pop("random", False)
    sort = params.pop("sort", ["mtime", "desc"])
    if "property_type" in params:
        params["property_type"] = {"$in": params["property_type"]}

    if "intention" in params:
        params["intention"] = {"$in": params.pop("intention", [])}

    params["$and"] = []

    if "name" in params:
        name = params.pop("name")
        name_filter = []
        for locale in f_app.common.i18n_locales:
            name_filter.append({"name.%s" % locale: name})

        params["$and"].append({"$or": name_filter})

    if "developer" in params:
        developer = params.pop("developer")
        developer_filter = []
        for locale in f_app.common.i18n_locales:
            developer_filter.append({"developer.%s" % locale: developer})

        params["$and"].append({"$or": developer_filter})

    plot_params = {"$and": []}
    if "price" in params:
        price = [x.strip() for x in params.pop("price").split(",")]
        assert len(price) == 3 and price[2] in f_app.common.currency, abort(40000, logger.warning("Invalid price", exc_info=False))
        price_filter = []
        for currency in f_app.common.currency:
            condition = {"total_price.unit": currency}
            if currency == price[2]:
                condition["total_price.value_float"] = {}
                if price[0]:
                    condition["total_price.value_float"]["$gte"] = float(price[0])
                if price[1]:
                    condition["total_price.value_float"]["$lte"] = float(price[1])
            else:
                condition["total_price.value_float"] = {}
                if price[0]:
                    condition["total_price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": price[2], "value": price[0]}, currency))
                if price[1]:
                    condition["total_price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": price[2], "value": price[1]}, currency))
            price_filter.append(condition)

        plot_params["$and"].append({"$or": price_filter})

    if "space" in params:
        space_filter = []
        space_params = [x.strip() for x in params.pop("space").split(",")]
        space_field = "space"
        if len(space_params) == 3:
            assert space_params[2] in ("meter ** 2", "foot ** 2"), abort(40000, logger.warning("Invalid params: space unit not correct", exc_info=False))
        elif len(space_params) == 2:
            space_params.append("meter ** 2")
        else:
            abort(40000)

        space_params[0] = float(space_params[0]) if space_params[0] else None
        space_params[1] = float(space_params[1]) if space_params[1] else None

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

        plot_params["$and"].append({"$or": space_filter})

    for field in ("bedroom_count", "bathroom_count", "kitchen_count", "living_room_count", "floor", "investment_type", "country", "city"):
        if field in params:
            plot_params[field] = params.pop(field)

    params["status"] = {"$in": params["status"]}
    per_page = params.pop("per_page", 0)

    if len(plot_params["$and"]) < 1:
        plot_params.pop("$and")

    if plot_params:
        plot_property_set = set([str(plot.get("property_id")) for plot in f_app.plot.get(f_app.plot.search(plot_params, per_page=0))])
        params["_id"] = {"$in": [ObjectId(i) for i in plot_property_set]}
        logger.debug(params["_id"])

    if len(params["$and"]) < 1:
        params.pop("$and")

    # Default to mtime,desc
    property_list = f_app.property.search(params, per_page=per_page, count=True, sort=sort, time_field="mtime")

    if random and property_list["content"]:
        import random
        random.shuffle(property_list["content"])
    property_list['content'] = f_app.property.output(property_list['content'])
    logger.debug(params)
    return property_list


property_params = dict(
    # General params
    name=("i18n", None, str),
    property_type="enum:property_type",
    country='country',
    city='geonames_gazetteer:city',
    maponics_neighborhood=(list, None, "maponics_neighborhood"),
    street=("i18n", None, str),
    zipcode=str,
    report_id=ObjectId,
    address=("i18n", None, str),
    real_address=("i18n", None, str),
    highlight=("i18n", None, list, None, str),
    annual_return_estimated=str,
    annual_cash_return_estimated=str,
    intention=(list, None, 'enum:intention'),
    equity_type='enum:equity_type',
    investment_type=(list, None, 'enum:investment_type'),
    indoor_facility=(list, None, 'enum:indoor_facility'),
    community_facility=(list, None, 'enum:community_facility'),
    slug=str,
    user_generated=bool,

    # Listing options
    status=str,
    news_category=(list, None, 'enum:news_category'),

    # Descriptive params
    decorative_style='enum:decorative_style',
    latitude=float,
    longitude=float,
    reality_images=("i18n", None, list, None, str, None, "replaces"),
    cover=("fallback", None, ("i18n", None, str), str),
    videos=(list, None, dict(
        sources=(list, True, dict(
            url=str,
            type=str,
            tags=(list, None, str),
            host=str,
        )),
        sub=("i18n", None, str),
        poster=str,
    )),
    surroundings_images=("i18n", None, list, None, str, None, "replaces"),
    property_price_type="enum:property_price_type",
    equal_property_description=("i18n", None, str),
    historical_price=(list, None, dict(
        price="i18n:currency",
        time=datetime,
    )),
    estimated_monthly_rent="i18n:currency",
    estimated_monthly_cost=(list, None, dict(
        price="i18n:currency",
        item=("i18n", None, str),
    )),
    description=("i18n", None, str),

    # Non-project params
    total_price="i18n:currency",
    bedroom_count=int,
    living_room_count=int,
    bathroom_count=int,
    kitchen_count=int,
    facing_direction="enum:facing_direction",
    house_name=("i18n", None, str),
    floor=("i18n", None, str),
    community=("i18n", None, str),
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    floor_plan=("i18n", None, list, None, str, None, "replaces"),

    # Project params
    unit_price=dict(
        unit=("i18n:area", None, "meter ** 2, foot ** 2"),
        price="i18n:currency",
    ),
    main_house_types=(list, None, dict(
        name=("i18n", None, str),
        bedroom_count=int,
        living_room_count=int,
        bathroom_count=int,
        kitchen_count=int,
        total_price="i18n:currency",
        total_price_min="i18n:currency",
        total_price_max="i18n:currency",
        floor_plan=("i18n", None, list, None, str, None, "replaces"),
        building_area=("i18n:area", None, "meter ** 2, foot ** 2"),
        building_area_min=("i18n:area", None, "meter ** 2, foot ** 2"),
        building_area_max=("i18n:area", None, "meter ** 2, foot ** 2"),
        description=("i18n", None, str),
    )),
    opening_time=("i18n", None, str),
    completion_time=("i18n", None, str),
    building_type=("i18n", None, str),
    property_management_type=("i18n", None, str),
    building_area=("i18n:area", None, "meter ** 2, foot ** 2"),
    plot_ratio=float,
    planning_area=("i18n:area", None, "meter ** 2, foot ** 2"),
    greening_rate=float,
    parking_space_count=int,
    planning_household_count=int,
    developer=("i18n", None, str),
    property_management_company=("i18n", None, str),
    effect_pictures=("i18n", None, list, None, str, None, "replaces"),
    indoor_sample_room_picture=("i18n", None, list, None, str, None, "replaces"),
    planning_map=("i18n", None, list, None, str, None, "replaces"),

    # Params for audit
    comment=str,
    attachment=(list, None, dict(
        url=str,
        description=str,
    )),
    # rental guarantee fields
    rental_guarantee_term=str,
    rental_guarantee_rate=float,
    unset_fields=(list, None, str),
    brochure=(list, None, dict(
        url=str,
    )),
    estimated_income_description=("i18n", None, str),
    minimum_down_payment_rate=float,
)


@f_api('/property/<property_id>/edit', params=property_params)
@f_app.user.login.check(check_role=True)
def property_edit(property_id, user, params):
    """
    This API will act based on the ``property_id``. To add a new property, use "none" for ``property_id``.

    videos.sources.host must be in ``qiniu`` or ``aws_s3``

    video.tags should use the following values: ``mobile-ios``, ``web-normal``

    For editing, if any field other than "status" is edited:

    1. If the property has ``status`` in (``draft``, ``not translated``, ``translating``, ``rejected``), the changes will be saved immediately.

     a. If the ``status`` is ``rejected``, it will be automatically changed to ``draft`` upon any edit.

    2. If ``status`` is ``not reviewed``, the edit will be rejected. Cancel the review process before you can do any more edit.

    3. Otherwise this API will actually create a partial property with only the changes. After approval:

     a. If ``target_property_id`` present, the changes and the ``status`` will be applied together to that property if the ``status`` was submitted within (``selling``, ``hidden``, ``sold out``, ``deleted``, ``restricted``) and the partial property will be removed.

     b. Otherwise, the status of *this* partial property will be updated to whatever the reviewer submitted, so it reforms a "real" new property.

    Edit ``status`` to advance the process. For ``status``-only submits, the following rules are followed:

    4. If ``status`` in (``draft``, ``not translated``, ``translating``, ``rejected``, ``not reviewed``)

     a. Anyone could submit ``status``-only edits and they will be saved immediately. But only ``admin``, ``jr_admin`` and ``operation`` could advance the status beyond "not reviewed".

    5. Otherwise, only ``admin``, ``jr_admin`` and ``operation`` could send ``status``-only edits, and the ``status`` is limited to (``selling``, ``hidden``, ``sold out``, ``deleted``, ``restricted``). If you need to edit it in any way, go with the previous process.

    When submitting a (partial or full) property for reviewing:

    6. A property without all needed fields *and* ``target_property_id`` will raise an error here.

    After discussion, we've decided that only one "draft" was allowed for the same "target_property_id" at the same time. This means:

    7. The first edit to an existing property could pass the property's id directly.

    8. The second and so forth edits should only pass the current ``partial`` property's id.

    9. Submit another edit while an existing one still in its life cycle will cause an error.

    All statuses, for reference: ``draft``, ``not translated``, ``translating``, ``rejected``, ``not reviewed``, ``selling``, ``hidden``, ``sold out``, ``deleted``, ``restricted``.
    """

    if "cover" in params and isinstance(params["cover"], six.string_types):
        params["cover"] = {"zh_Hans_CN": params["cover"], "_i18n": True}

    if "status" in params:
        assert params["status"] in ("draft", "not translated", "translating", "rejected", "not reviewed", "selling", "hidden", "sold out", "deleted", "restricted"), abort(40000, "Invalid status")

    if "zipcode" in params and "report_id" not in params:
        report_id = None

        if property_id != "none":
            property = f_app.property.get(property_id)
            if "report_id" not in property:
                report_id = f_app.util.find_region_report(params["zipcode"])

        else:
            report_id = f_app.util.find_region_report(params["zipcode"])

        if report_id:
            params["report_id"] = ObjectId(report_id)

    if property_id == "none":
        action = lambda params: f_app.property.add(params)

        if not user or not set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]):
            params["user_generated"] = True
            if user:
                params["user_id"] = ObjectId(user["id"])

        params.setdefault("status", "draft")

        if params["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):
            assert set(user["role"]) & set(["admin", "jr_admin", "operation"]), abort(40300, "No access to skip the review process")

    else:
        property = f_app.property.get(property_id)

        user_generated = property.get("user_generated", False)
        if not user or not set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]):
            assert property.get("user_generated") == True, abort(40300, "Non-admin could only edit user generated properties")
            if "user_id" in property:
                assert user and property["user_id"] == user["id"], abort(40300, "Non-admin could only edit his own generated properties")
            elif user:
                params["user_id"] = ObjectId(user["id"])

        def _action(params):
            unset_fields = params.get("unset_fields", [])
            result = f_app.property.update_set(property_id, params)
            if unset_fields:
                result = f_app.property.update(property_id, {"$unset": {i: "" for i in unset_fields}})
            return result

        action = _action

        if not user_generated:
            # Status-only updates
            if len(params) == 1 and "status" in params:
                # Approved properties
                if property["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):

                    # Only allow updating to post-review statuses
                    assert params["status"] in ("selling", "hidden", "sold out", "deleted", "restricted"), abort(40000, "Invalid status for a reviewed property")

                    if params["status"] == "deleted":
                        assert set(user["role"]) & set(["admin", "jr_admin"]), abort(40300, "No access to update the status")

                # Not approved properties
                else:
                    # Submit for approval
                    if params["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed", "deleted"):
                        if len(f_app.task.search({"status": {"$nin": ["completed", "canceled"]}, "property_id": property_id, "type": "render_pdf"})):
                            abort(40087, "pdf is still rendering")

                        assert set(user["role"]) & set(["admin", "jr_admin", "operation"]), abort(40300, "No access to review property")
                        if "target_property_id" in property:
                            def action(params):
                                with f_app.mongo() as m:
                                    property = f_app.property.get_database(m).find_one({"_id": ObjectId(property_id)})
                                property.pop("_id")
                                property["status"] = params["status"]
                                target_property_id = property.pop("target_property_id")
                                unset_fields = property.pop("unset_fields", [])
                                f_app.property.update_set(target_property_id, property, _ignore_render_pdf=True)
                                if unset_fields:
                                    unset_fields.append("unset_fields")
                                    f_app.property.update(target_property_id, {"$unset": {i: "" for i in unset_fields}})
                                f_app.property.update_set(property_id, {"status": "deleted"})
                                return f_app.property.get(target_property_id)
                        else:
                            def action(params):
                                with f_app.mongo() as m:
                                    property = f_app.property.get_database(m).find_one({"_id": ObjectId(property_id)})
                                f_app.property.update_set(property_id, params, _ignore_render_pdf=True)
                                unset_fields = property.pop("unset_fields", [])
                                if unset_fields:
                                    unset_fields.append("unset_fields")
                                    f_app.property.update(property_id, {"$unset": {i: "" for i in unset_fields}})
                                return f_app.property.get(property_id)

                    if params["status"] == "not reviewed":
                        # TODO: make sure all needed fields are present
                        params["submitter_user_id"] = user["id"]

            else:
                if "status" in params:
                    assert params["status"] in ("draft", "not translated", "translating", "rejected", "not reviewed"), abort(40000, "Editing and reviewing cannot happen at the same time")

                    if params["status"] == "not reviewed" and "brochure" in params and len(params["brochure"]):
                        abort(40087, "pdf may need rendering")

                if property["status"] in ("selling", "hidden", "sold out", "restricted"):
                    existing_draft = f_app.property.search({"target_property_id": property_id, "status": {"$ne": "deleted"}})
                    if existing_draft:
                        # action = lambda params: f_app.property.update_set(existing_draft[0], params)
                        abort(40300, "An existing draft already exists")

                    else:
                        params.setdefault("status", "draft")
                        params["target_property_id"] = property_id
                        action = lambda params: f_app.property.add(params)

                elif property["status"] == "rejected":
                    params.setdefault("status", "draft")

                elif property["status"] == "not reviewed":
                    abort(40000, "Not reviewed property could not be changed. Reverting the status is required before any modification")

    return action(params)


@f_api('/property/<property_id>')
@f_app.user.login.check(check_role=True)
def property_get(property_id, user):
    property = f_app.property.output([property_id])[0]
    if property["status"] not in ["selling", "sold out", "restricted"]:
        if not user or not set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]):
            assert property.get("user_generated") == True, abort(40300, "No access to specify status or target_property_id")

    return property


@f_api('/wechat/menu/get')
@f_app.user.login.check(role=['admin', 'operation', 'jr_operation'])
def wechat_menu_get(user):
    return f_app.wechat.api("menu/get", method="GET")["menu"]


@f_api('/wechat/menu/create', params=dict(
    json=(str, True),
))
@f_app.user.login.check(role=['admin', 'operation', 'jr_operation'])
def wechat_menu_create(user, params):
    return f_app.wechat.api("menu/create", params=json.loads(params["json"]))


@f_api('/wechat/menu/delete')
@f_app.user.login.check(role=['admin', 'operation', 'jr_operation'])
def wechat_menu_delete(user):
    return f_app.wechat.api("menu/delete", method="GET")


@f_api('/wechat/news/send', params=dict(
    news_ids=(list, True, ObjectId, True, "str"),
))
@f_app.user.login.check(role=['admin', 'operation'])
def wechat_news_send(user, params):
    request._requested_i18n_locales_list = ["zh_Hans_CN"]
    articles = []

    news_list = f_app.i18n.process_i18n(f_app.blog.post.output(params["news_ids"]))
    for n, news in enumerate(news_list):
        if "images" not in news or not len(news["images"]):
            # Image is required
            continue

        logger.debug("uploading image:", news["images"][0])
        uploaded_image = f_app.wechat.media_upload(("fake.jpg", f_app.request(news["images"][0]).content))
        assert "media_id" in uploaded_image, abort(50300, "media_id not present in news:", uploaded_image)
        logger.debug("uploaded image:", uploaded_image["media_id"])

        articles.append({
            "thumb_media_id": uploaded_image["media_id"],
            "author": "洋房东",
            "title": news["title"],
            "content_source_url": "http://yangfd.cn/news/" + news["id"],
            "content": news["content"],
            "digest": news["summary"],
            "show_cover_pic": "1" if n == 0 else "0",
        })

    uploaded_news = f_app.wechat.api("media/uploadnews", params={"articles": articles})
    assert "media_id" in uploaded_news, abort(50300, "media_id not present in news:", uploaded_news)
    logger.debug("uploaded news:", uploaded_news["media_id"])

    sendall_params = {
        "filter": {
            "is_to_all": False,
            "group_id": "101",
        },
        "mpnews": {
            "media_id": uploaded_news["media_id"],
        },
        "msgtype": "mpnews"
    }

    return f_app.wechat.api("message/mass/sendall", params=sendall_params)


@f_api('/property/<property_id>/edit/sales_comment', params=dict(
    content=str,
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'sales', 'junior_sales'])
def property_edit_sales_comment(user, property_id, params):
    params = {"sales_comment": params.pop("content", None)}
    f_app.property.update_set(property_id, params)
    return f_app.property.output([property_id])[0]


@f_api('/mortgage_calculate', params=dict(
    loan=(float, True),
    rate=(float, True),
    term=(int, True),
))
def mortgage_calculate(params):
    params["rate"] /= 100
    interestonly = params["loan"] * params["rate"] / 12
    repayment = params["loan"] * params["rate"] / 12 / (1 - ((1 + params["rate"] / 12) ** (params["term"] * -12)))

    return dict(
        interestonly=dict(
            monthly=interestonly,
            total_interest=interestonly * params["term"] * 12,
            total=interestonly * params["term"] * 12 + params["loan"],
        ),
        repayment=dict(
            monthly=repayment,
            total_interest=repayment * params["term"] * 12 - params["loan"],
            total=repayment * params["term"] * 12,
        ),
    )
