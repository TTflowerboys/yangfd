# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import json
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
    country='enum:country',
    city='enum:city',
    street=('i18n', None, str),
    zipcode_index=str,
    equity_type='enum:equity_type',
    property_price_type="enum:property_price_type",
    target_property_id=(ObjectId, None, "str"),
    annual_return_estimated=str,  # How?
    budget="enum:budget",
    random=bool,
    name=str,
    slug=str,
    living_room_count=int,
    building_area=str,
    investment_type="enum:investment_type",
))
@f_app.user.login.check(check_role=True)
def property_search(user, params):
    """
    Only ``admin``, ``jr_admin``, ``operation``, ``jr_operation``, ``developer`` and ``agency`` could use the ``target_property_id`` and ``status`` param.

    Syntax examples for ``sort``:

    * name.en_GB,asc
    * mtime,desc

    ``time`` should be a unix timestamp in utc.
    ``building_area`` format: ``,40``, ``40,100``, ``100,``
    """
    random = params.pop("random", False)
    sort = params.pop("sort", ["mtime", "desc"])
    if params["status"] != ["selling", "sold out"] or "target_property_id" in params:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]), abort(40300, "No access to specify status or target_property_id")
    if "property_type" in params:
        params["property_type"] = {"$in": params["property_type"]}

    if "intention" in params:
        params["intention"] = {"$in": params.pop("intention", [])}

    if "budget" in params:
        budget = f_app.util.parse_budget(params.pop("budget"))
        params["$or"] = []
        for currency in f_app.common.currency:
            condition = {"total_price.unit": currency}
            house_condition = {"main_house_types.total_price.unit": currency}
            if currency == budget[2]:
                condition["total_price.value_float"] = {}
                house_condition["main_house_types.total_price.value_float"] = {}
                if budget[0]:
                    condition["total_price.value_float"]["$gte"] = budget[0]
                    house_condition["main_house_types.total_price.value_float"]["$gte"] = budget[0]
                if budget[1]:
                    condition["total_price.value_float"]["$lte"] = budget[1]
                    house_condition["main_house_types.total_price.value_float"]["$lte"] = budget[1]
            else:
                condition["total_price.value_float"] = {}
                house_condition["main_house_types.total_price.value_float"] = {}
                if budget[0]:
                    condition["total_price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))
                    house_condition["main_house_types.total_price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))
                if budget[1]:
                    condition["total_price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))
                    house_condition["main_house_types.total_price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))
            params["$or"].append(condition)
            params["$or"].append(house_condition)

    if "name" in params:
        name = params.pop("name")
        name_filter = []
        for locale in f_app.common.i18n_locales:
            name_filter.append({"name.%s" % locale: name})

        if "$or" not in params:
            params["$or"] = name_filter
        else:
            or_filter = params.pop("$or")
            params["$and"] = [{"$or": or_filter}, {"$or": name_filter}]

    plot_params = {}
    if "living_room_count" in params:
        if user and set(user["role"]) & set(("admin", "jr_admin", "operation", "jr_operation", "developer", "agency")):
            plot_params["living_room_count"] = params.pop("living_room_count")
        else:
            params["main_house_types.living_room_count"] = params.pop("living_room_count")

    if "building_area" in params:
        if user and set(user["role"]) & set(("admin", "jr_admin", "operation", "jr_operation", "developer", "agency")):
            building_area_field = "space"
        else:
            building_area_field = "main_house_types.building_area"

        building_area = [float(x.strip()) if x else "" for x in params.pop("building_area").split(",")]
        building_area_imperial = [float(f_app.i18n.convert_i18n_unit({"value": x, "unit": "meter ** 2"}, "foot ** 2")) if x else "" for x in building_area]
        building_area_filter = []
        if building_area[0] and building_area[1]:
            building_area_filter.append({"%s.unit" % building_area_field: "meter ** 2", "%s.value_float" % building_area_field: {"$gte": building_area[0], "$lt": building_area[1]}})
            building_area_filter.append({"%s.unit" % building_area_field: "foot ** 2", "%s.value_float" % building_area_field: {"$gte": building_area_imperial[0], "$lt": building_area_imperial[1]}})
        elif building_area[0] and not building_area[1]:
            building_area_filter.append({"%s.unit" % building_area_field: "meter ** 2", "%s.value_float" % building_area_field: {"$gte": building_area[0]}})
            building_area_filter.append({"%s.unit" % building_area_field: "foot ** 2", "%s.value_float" % building_area_field: {"$gte": building_area_imperial[0]}})
        elif not building_area[0] and building_area[1]:
            building_area_filter.append({"%s.unit" % building_area_field: "meter ** 2", "%s.value_float" % building_area_field: {"$lt": building_area[1]}})
            building_area_filter.append({"%s.unit" % building_area_field: "foot ** 2", "%s.value_float" % building_area_field: {"$lt": building_area_imperial[1]}})
        else:
            abort(40000, logger.warning("Invalid params: building_area cannot be empty"))

        if user and set(user["role"]) & set(("admin", "jr_admin", "operation", "jr_operation", "developer", "agency")):
            plot_params["$or"] = building_area_filter
        else:
            if "$or" not in params and "$and" not in params:
                params["$or"] = building_area_filter
            elif "$or" in params and "$and" not in params:
                or_filter = params.pop("$or")
                params["$and"] = [{"$or": building_area_filter}, {"$or": or_filter}]
            elif "$or" not in params and "$and" in params:
                params["$and"].append({"$or": building_area_filter})
            else:
                abort(50000, logger.warning("Oops! Something wrong with params parser!", exc_info=False))

    if "floor" in params:
        plot_params["floor"] = params.pop("floor")

    if "investment_type" in params and set(user["role"]) & set(("admin", "jr_admin", "operation", "jr_operation", "developer", "agency")):
        plot_params["investment_type"] = params.pop("investment_type")

    params["status"] = {"$in": params["status"]}
    per_page = params.pop("per_page", 0)

    # Default to mtime,desc
    property_list = f_app.property.search(params, per_page=per_page, count=True, sort=sort, time_field="mtime")
    if plot_params:
        plot_property_list = set([str(plot.get("property_id")) for plot in f_app.plot.get(f_app.plot.search(plot_params, per_page=0))])
        property_list["content"] = plot_property_list & set(property_list["content"])

    if random and property_list["content"]:
        import random
        random.shuffle(property_list["content"])
    property_list['content'] = f_app.property.output(property_list['content'])
    return property_list


property_params = dict(
    # General params
    name=("i18n", None, str),
    property_type="enum:property_type",
    country='enum:country',
    city='enum:city',
    street=("i18n", None, str),
    zipcode=str,
    zipcode_index=str,
    address=("i18n", None, str),
    real_address=("i18n", None, str),
    highlight=("i18n", None, list, None, str),
    annual_return_estimated=str,
    annual_cash_return_estimated=str,
    intention=(list, None, 'enum:intention'),
    equity_type='enum:equity_type',
    investment_type=(list, None, 'enum:investment_type'),
    slug=str,

    # Listing options
    status=str,
    news_category=(list, None, 'enum:news_category'),

    # Descriptive params
    decorative_style='enum:decorative_style',
    latitude=float,
    longitude=float,
    reality_images=("i18n", None, list, None, str),
    cover=("i18n", None, str),
    videos=(list, None, dict(
        sources=(list, None, dict(
            url=str,
            type=str,
            tags=(list, None, str),
            host=str,
        )),
        sub=("i18n", None, str),
        poster=str,
    )),
    surroundings_images=("i18n", None, list, None, str),
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
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    floor_plan=("i18n", None, list, None, str),

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
        floor_plan=("i18n", None, str),
        building_area=("i18n:area", None, "meter ** 2, foot ** 2"),
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
    effect_pictures=("i18n", None, list, None, str),
    indoor_sample_room_picture=("i18n", None, list, None, str),
    planning_map=("i18n", None, list, None, str),

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
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation', 'developer', 'agency'])
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

     a. If ``target_property_id`` present, the changes and the ``status`` will be applied together to that property if the ``status`` was submitted within (``selling``, ``hidden``, ``sold out``, ``deleted``) and the partial property will be removed.

     b. Otherwise, the status of *this* partial property will be updated to whatever the reviewer submitted, so it reforms a "real" new property.

    Edit ``status`` to advance the process. For ``status``-only submits, the following rules are followed:

    4. If ``status`` in (``draft``, ``not translated``, ``translating``, ``rejected``, ``not reviewed``)

     a. Anyone could submit ``status``-only edits and they will be saved immediately. But only ``admin``, ``jr_admin`` and ``operation`` could advance the status beyond "not reviewed".

    5. Otherwise, only ``admin``, ``jr_admin`` and ``operation`` could send ``status``-only edits, and the ``status`` is limited to (``selling``, ``hidden``, ``sold out``, ``deleted``). If you need to edit it in any way, go with the previous process.

    When submitting a (partial or full) property for reviewing:

    6. A property without all needed fields *and* ``target_property_id`` will raise an error here.

    After discussion, we've decided that only one "draft" was allowed for the same "target_property_id" at the same time. This means:

    7. The first edit to an existing property could pass the property's id directly.

    8. The second and so forth edits should only pass the current ``partial`` property's id.

    9. Submit another edit while an existing one still in its life cycle will cause an error.

    All statuses, for reference: ``draft``, ``not translated``, ``translating``, ``rejected``, ``not reviewed``, ``selling``, ``hidden``, ``sold out``, ``deleted``.
    """

    if "status" in params:
        assert params["status"] in ("draft", "not translated", "translating", "rejected", "not reviewed", "selling", "hidden", "sold out", "deleted"), abort(40000, "Invalid status")

    if property_id == "none":
        action = lambda params: f_app.property.add(params)

        params.setdefault("status", "draft")

        if params["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):
            assert set(user["role"]) & set(["admin", "jr_admin", "operation"]), abort(40300, "No access to skip the review process")

    else:
        property = f_app.property.get(property_id)

        def _action(params):
            unset_fields = params.get("unset_fields", [])
            result = f_app.property.update_set(property_id, params)
            if unset_fields:
                result = f_app.property.update(property_id, {"$unset": {i: "" for i in unset_fields}})
            return result

        action = _action

        # Status-only updates
        if len(params) == 1 and "status" in params:
            # Approved properties
            if property["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):

                # Only allow updating to post-review statuses
                assert params["status"] in ("selling", "hidden", "sold out", "deleted"), abort(40000, "Invalid status for a reviewed property")

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

            if property["status"] in ("selling", "hidden", "sold out"):
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
def property_get(property_id):
    property = f_app.property.output([property_id])[0]
    if property["status"] not in ["selling", "sold out"]:
        user = f_app.user.login.get()
        if user:
            user = f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_property_id")

    return property


@f_api('/wechat/menu/get')
@f_app.user.login.check(role=['admin', 'operation'])
def wechat_menu_get(user):
    return f_app.wechat.api("menu/get", method="GET")["menu"]


@f_api('/wechat/menu/create', params=dict(
    json=(str, True),
))
@f_app.user.login.check(role=['admin', 'operation'])
def wechat_menu_create(user, params):
    return f_app.wechat.api("menu/create", params=json.loads(params["json"]))


@f_api('/wechat/menu/delete')
@f_app.user.login.check(role=['admin', 'operation'])
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
