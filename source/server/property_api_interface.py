# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort

import logging
logger = logging.getLogger(__name__)


@f_api('/property/search', params=dict(
    per_page=int,
    time=datetime,
    status=(list, ["selling", "sold out"], str),

    country='enum:country',
    city='enum:city',
    street=('i18n', None, str),
    zipcode_index=str,
    equity_type='enum:equity_type',
    property_price_type="enum:property_price_type",
    annual_return_estimated=str,  # How?
))
@f_app.user.login.check(check_role=True)
def property_search(user, params):
    """
    Only ``admin``, ``jr_admin``, ``operation``, ``jr_operation``, ``developer`` and ``agency`` could update the ``status`` param.
    """

    if params["status"] != ["selling", "sold out"]:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]), abort(40300, "No access to specify status")

    params["status"] = {"$in": params["status"]}
    per_page = params.pop("per_page", 0)
    property_list = f_app.property.search(params, per_page=per_page)
    return f_app.property.output(property_list)


@f_api('/property/<property_id>/edit', params=dict(
    # General params
    name=("i18n", None, str),
    property_type="enum:property_type",
    country='enum:country',
    city='enum:city',
    street=("i18n", None, str),
    zipcode=("i18n", None, str),
    zipcode_index=str,
    address=("i18n", None, str),
    highlight=("i18n", None, list, None, str),
    annual_return_estimated=str,
    intention='enum:intention',
    equity_type='enum:equity_type',

    # Listing options
    status=str,
    news_category=(list, None, 'enum:news_category'),

    # Descriptive params
    decorative_style='enum:decorative_style',
    latitude=float,
    longitude=float,
    reality_images=("i18n", None, list, None, str),
    surroundings_images=("i18n", None, list, None, str),
    property_price_type="enum:property_price_type",
    equal_property_description=("i18n", None, list, None, str),
    historical_price=(list, None, dict(
        price="i18n:currency",
        time=datetime,
    )),
    estimated_monthly_rent="i18n:currency",
    estimated_monthly_cost=(list, None, dict(
        price="i18n:currency",
        item=("i18n", None, str),
    )),

    # Non-project params
    total_price="i18n:currency",
    bedroom_count=int,
    living_room_count=int,
    bathroom_count=int,
    kitchen_count=int,
    facing_direction="enum:facing_direction",
    space="i18n:area",
    floor_plan=("i18n", None, list, None, str),

    # Project params
    unit_price=dict(
        unit="i18n:area",
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
    )),
    opening_time=datetime,
    building_type=("i18n", None, str),
    property_management_type=("i18n", None, str),
    building_area="i18n:area",
    plot_ratio=float,
    planning_area="i18n:area",
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
    attachment=(list, None, str),
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation', 'developer', 'agency'])
def property_edit(property_id, user, params):
    """
    This API will act based on the ``property_id``. To add a new property, use "none" for ``property_id``.

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
        action = lambda params: f_app.property.update_set(property_id, params)

        # Status-only updates
        if len(params) == 1 and "status" in params:
            # Approved properties
            if property["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):

                # Only allow updating to post-review statuses
                assert params["status"] in ("selling", "hidden", "sold out", "deleted"), abort(40000, "Invalid status for a reviewed property")

            # Not approved properties
            else:
                assert set(user["role"]) & set(["admin", "jr_admin", "operation"]), abort(40300, "No access to review property")

                # Submit for approval
                if params["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):
                    if "target_property_id" in property:
                        def action(params):
                            property.pop("id")
                            property["status"] = params["status"]
                            result = f_app.property.update_set(property.pop("target_property_id"), property)
                            f_app.property.update_set(property_id, {"status": "deleted"})
                            return result

            if params["status"] == "deleted":
                assert set(user["role"]) & set(["admin", "jr_admin"]), abort(40300, "No access to update the status")

            elif params["status"] == "not reviewed":
                # TODO: make sure all needed fields are present
                params["submitter_user_id"] = user["id"]

        else:
            if property["status"] not in ("draft", "not translated", "translating", "rejected"):
                existing_draft = f_app.property.search({"target_property_id": property_id, "status": {"$ne": "deleted"}})
                if existing_draft:
                    params["target_property_id"] = existing_draft[0]

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
            total_interest=repayment * params["term"] * 12,
            total=repayment * params["term"] * 12 + params["loan"],
        ),
    )
