# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort
from bson.objectid import ObjectId
from datetime import datetime
import logging
logger = logging.getLogger(__name__)


item_params = dict(
    name=("i18n", None, str),
    property_type=("enum:property_type", None),
    investment_type=(list, None, 'enum:investment_type'),
    news_category=(list, None, 'enum:news_category'),
    country=("enum:country", None),
    city=("enum:city", None),
    street=("i18n", None, str),
    zipcode=(str, None),
    zipcode_index=(str, None),
    address=("i18n", None, str),
    highlight=("i18n", None, list, None, str),
    description=("i18n", None, str),
    max_annual_return_estimated=(float, None),
    min_annual_return_estimated=(float, None),
    max_annual_cash_return_estimated=(float, None),
    min_annual_cash_return_estimated=(float, None),
    term=(float, None),
    funding_goal=(float, None),
    intention=(list, None, 'enum:intention'),
    latitude=(float, None),
    longitude=(float, None),
    reality_images=("i18n", None, list, None, str),
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
    operators=("i18n", None, str),
    management_team=(list, None, dict(
        name=("i18n", None),
        title=("i18n", None),
        avatar=(str, None),
        description=("i18n", None),
        linkedin_home=(str, None),
    )),
    finacials=("i18n", None, str),
    capital_structure=("i18n", None, str),
    status=(str, None),
    comment=(str, None),
    attachment=(str, None),
    unset_fields=(list, None, str),
    quantity=(bool, None),
)


@f_api("/shop/add", params=dict(
    name=(str, True),
))
@f_app.user.login.check(force=True, role=['admin'])
def shop_add(user, params):
    return f_app.shop.add(params)


@f_api("/shop/search", params=dict(
    time=datetime,
    per_page=int,
))
@f_app.user.login.check(force=True)
def shop_search(user, params):
    per_page = params.pop("per_page", 0)
    return f_app.shop.output(f_app.shop.custom_search(params, per_page=per_page))


@f_api("/shop/<shop_id>")
@f_app.user.login.check(force=True)
def shop_get(user, shop_id):
    return f_app.shop.output([shop_id])[0]


@f_api("/shop/<shop_id>/edit", params=dict(
    name=(str, None),
))
@f_app.user.login.check(force=True, role=['admin'])
def shop_edit(user, shop_id, params):
    f_app.shop.update_set(shop_id, params)
    return f_app.shop.output([shop_id])[0]


@f_api("/shop/<shop_id>/remove")
@f_app.user.login.check(force=True, role=['admin'])
def shop_remove(user, shop_id):
    f_app.shop.update_set(shop_id, {"status": "deleted"})


@f_api("/shop/<shop_id>/item/search", params=dict(
    per_page=int,
    time=datetime,
    mtime=datetime,
    status=(list, ["new", "sold out"], str),
    target_item_id=(ObjectId, None, "str"),
))
@f_app.user.login.check(check_role=True)
def shop_item_search(user, shop_id, params):
    if params["status"] != ["new", "sold out"] or "target_item_id" in params:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation", "developer", "agency"]), abort(40300, "No access to specify status or target_item_id")
    params["shop_id"] = ObjectId(shop_id)
    params["status"] = {"$in": params.pop("status", [])}
    per_page = params.pop("per_page", 0)
    return f_app.shop.item.output(f_app.shop.item_custom_search(params, per_page=per_page))


@f_api("/shop/<shop_id>/item/<item_id>/edit", params=item_params)
@f_app.user.login.check(force=True, role=['admin'])
def shop_item_edit(user, shop_id, item_id, params):
    """
    ``status`` can be ``draft``, ``rejected``, ``not reviewed``, ``new``, ``sold out``, ``deleted``, ``translating``, ``not translated``.
    ``shop_id`` is constant ``54a3c92b6b809945b0d996bf``
    ``quantity`` should be ``True``
    """
    if "status" in params:
        assert params["status"] in ("draft", "not translated", "translating", "rejected", "not reviewed", "new", "hidden", "sold out", "deleted"), abort(40000, "Invalid status")

    if item_id == "none":
        params.setdefault("quantity", True)
        params.setdefault("price", 0)
        action = lambda params: f_app.shop.item.add(shop_id, params)

        params.setdefault("status", "draft")

        if params["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):
            assert set(user["role"]) & set(["admin", "jr_admin", "operation"]), abort(40300, "No access to skip the review process")

    else:
        item = f_app.shop.item.get(item_id)

        def _action(params):
            unset_fields = params.get("unset_fields", [])
            f_app.shop.item.update_set(shop_id, item_id, params)
            if unset_fields:
                f_app.shop.item.update(shop_id, item_id, {"$unset": {i: "" for i in unset_fields}})
            return f_app.shop.item.get(item_id)

        action = _action

        # Status-only updates
        if len(params) == 1 and "status" in params:
            # Approved properties
            if item["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):

                # Only allow updating to post-review statuses
                assert params["status"] in ("new", "hidden", "sold out", "deleted"), abort(40000, "Invalid status for a reviewed crowdfunding item")

                if params["status"] == "deleted":
                    assert set(user["role"]) & set(["admin", "jr_admin"]), abort(40300, "No access to update the status")

            # Not approved properties
            else:
                # Submit for approval
                if params["status"] not in ("draft", "not translated", "translating", "rejected", "not reviewed"):
                    assert set(user["role"]) & set(["admin", "jr_admin", "operation"]), abort(40300, "No access to review crowdfunding item")
                    if "target_item_id" in item:
                        def action(params):
                            with f_app.mongo() as m:
                                item = f_app.shop.item.get_database(m).find_one({"_id": ObjectId(item_id)})
                            item.pop("_id")
                            item["status"] = params["status"]
                            target_item_id = item.pop("target_item_id")
                            unset_fields = item.pop("unset_fields", [])
                            f_app.shop.item.update_set(shop_id, target_item_id, item)
                            if unset_fields:
                                unset_fields.append("unset_fields")
                                f_app.shop.item.update(shop_id, target_item_id, {"$unset": {i: "" for i in unset_fields}})
                            f_app.shop.item.update_set(shop_id, item_id, {"status": "deleted"})
                            return f_app.shop.item.get(target_item_id)
                    else:
                        def action(params):
                            with f_app.mongo() as m:
                                item = f_app.shop.item.get_database(m).find_one({"_id": ObjectId(item_id)})
                            f_app.shop.item.update_set(shop_id, item_id, params)
                            unset_fields = item.pop("unset_fields", [])
                            if unset_fields:
                                unset_fields.append("unset_fields")
                                f_app.shop.item.update(shop_id, item_id, {"$unset": {i: "" for i in unset_fields}})
                            return f_app.shop.item.get(item_id)

                if params["status"] == "not reviewed":
                    # TODO: make sure all needed fields are present
                    params["submitter_user_id"] = ObjectId(user["id"])

        else:
            if "status" in params:
                assert params["status"] in ("draft", "not translated", "translating", "rejected", "not reviewed", "deleted"), abort(40000, "Editing and reviewing cannot happen at the same time")

            if item["status"] in ("new", "hidden", "sold out"):
                existing_draft = f_app.shop.item.search({"target_item_id": item_id, "status": {"$ne": "deleted"}})
                if existing_draft:
                    abort(40300, "An existing draft already exists")

                else:
                    params.setdefault("status", "draft")
                    params["target_item_id"] = item_id
                    params.setdefault("price", 0)
                    action = lambda params: f_app.shop.item.add(shop_id, params)

            elif item["status"] == "rejected":
                params.setdefault("status", "draft")

            elif item["status"] == "not reviewed":
                abort(40000, "Not reviewed crowdfunding item could not be changed. Reverting the status is required before any modification")

    return action(params)


@f_api("/shop/<shop_id>/item/<item_id>")
def shop_item_get(shop_id, item_id):
    return f_app.shop.item.output([item_id])[0]


@f_api("/shop/<shop_id>/item/<item_id>/remove")
@f_app.user.login.check(force=True, role=['admin'])
def shop_item_remove(user, shop_id, item_id):
    f_app.shop.item_delete(shop_id, item_id)


@f_api('/shop/<shop_id>/item/<item_id>/comment/add', params=dict(
    parent_comment_id=ObjectId,
    content=(str, True),
))
@f_app.user.login.check(force=True)
def shop_comment_add(user, shop_id, item_id, params):
    # test if item_id exists
    f_app.shop.item.get(item_id)
    # test if parent comment exists
    if "parent_comment_id" in params:
        f_app.comment.get(params["parent_comment_id"])

    locales = f_app.i18n.get_requested_i18n_locales_list()
    if locales:
        params["locale"] = locales[0]
    params["item_id"] = ObjectId(item_id)
    params["user_id"] = ObjectId(user["id"])
    return f_app.comment.add(params)


@f_api('/shop/<shop_id>/item/<item_id>/comment/search', params=dict(
    per_page=int,
    time=datetime,
))
def shop_comment_list(shop_id, item_id, params):
    # test if shop_id exists
    f_app.shop.item.get(shop_id)

    per_page = params.pop("per_page", 0)
    return f_app.comment.output(f_app.comment.search({"item_id": ObjectId(shop_id)}, per_page=per_page))


@f_api('/shop/<shop_id>/item/<item_id>/comment/<comment_id>')
def shop_comment_get(shop_id, item_id, comment_id):
    # test if item_id exists
    f_app.shop.item.get(item_id)

    comment = f_app.comment.output([comment_id])[0]
    if str(comment.get("item_id")) == item_id:
        return comment
    else:
        abort(40495, logger.warning("Non-exist comment", exc_info=False))


@f_api('/shop/<shop_id>/item/<item_id>/comment/<comment_id>/remove')
@f_app.user.login.check(force=True, role=["shop_admin"])
def shop_comment_remove(user, shop_id, item_id, comment_id):
    comment = f_app.comment.get(comment_id)
    if str(comment["item_id"]) == item_id:
        return f_app.comment.remove(comment_id)
    else:
        abort(40000, logger.warning("The comment doesn't belong to the crowdfunding item.", exc_info=False))
