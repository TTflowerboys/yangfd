# -*- coding: utf-8 -*-

from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort
from datetime import datetime
from bson.objectid import ObjectId

import logging
logger = logging.getLogger(__name__)


@f_api('/enum/<enum_id>')
def enum(enum_id):
    return f_app.enum.get(enum_id)


@f_api('/enum', params=dict(
    type=(str, True),
))
def enum_list(params):
    return f_app.enum.get_all(params["type"])


@f_api('/enum/<enum_id>/deprecate')
def enum_deprecate(enum_id):
    return f_app.enum.update_set(enum_id, {"status": "deprecated"})


@f_api('/enum/add', params=dict(
    type=(str, True),
    value=("i18n", True, str),
    sort_value=int,
    # Field for message_api_interface
    country="country",
    state="enum:state",
    currency=str,
    slug=str,
    # Field for intention
    image=(str, None, "replaces"),
    iconfont=str,
    description=("i18n", None, str),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_add(user, params):
    """
    ``slug`` is the unique key to get the enum data.

    Old Data:

    ``country`` data model::

        {
            "slug": "CN"
        }

    ``city`` data model::

        {
            "type": "city",
            "value": {
                "zh_Hans_CN": "武汉",
                "en_GB": "Wuhan"
            },
            "country": ObjectId(<enum:country>)
            "state": ObjectId(<enum:state>)
        }
    """

    return f_app.enum.add(params)


@f_api('/enum/<enum_id>/edit', params=dict(
    type=str,
    value=("i18n", None, str),
    sort_value=int,
    country="country",
    state="enum:state",
    currency=str,
    slug=str,
    description=('i18n', None, str),
    image=(str, None, "replaces"),
    iconfont=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_edit(user, enum_id, params):
    return f_app.enum.update_set(enum_id, params)


@f_api('/enum/search', params=dict(
    country="country",
    state="enum:state",
    per_page=int,
    time=datetime,
    currency=str,
    type=str,
    sort=bool,
    status=(list, ["new"], str)
))
def enum_search(params):
    if "status" in params:
        assert set(params["status"]) <= set(["new", "deprecated"]), abort(40000, "invalid enum status")
        params["status"] = {"$in": params["status"]}

    per_page = params.pop("per_page", 0)
    sort = params.pop("sort", False)
    return f_app.enum.get(f_app.enum.search(params, per_page=per_page, sort=("sort_value", "desc") if sort else ("time", "desc")))


@f_api('/enum/<enum_id>/check')
def enum_check(enum_id):
    enum_id = ObjectId(enum_id)
    blog_post_list = f_app.blog.post_search({"category._id": enum_id}, per_page=0)
    property_list = f_app.property.search({"$or": [
        {"property_type._id": enum_id},
        {"property_price_type._id": enum_id},
        {"investment_type._id": enum_id},
        {"intention._id": enum_id},
        {"equity_type._id": enum_id},
        {"news_category._id": enum_id},
        {"decorative_style._id": enum_id},
        {"facing_direction._id": enum_id},
    ]}, per_page=0)
    item_list = f_app.shop.item_custom_search({"$or": [
        {"investment_type._id": enum_id},
    ]}, per_page=0)
    ticket_list = f_app.ticket.search({"$or": [
        {"budget._id": enum_id},
        {"equity_type._id": enum_id},
        {"intention._id": enum_id},
    ]}, per_page=0)
    user_list = f_app.user.custom_search({"$or": [
        {"budget._id": enum_id},
    ]}, per_page=0)
    return {
        "news": blog_post_list,
        "property": property_list,
        "item": item_list,
        "ticket": ticket_list,
        "user": user_list
    }


@f_api('/enum/<enum_id>/remove', params=dict(
    mode=(str, "safe")
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_remove(user, enum_id, params):
    """
    ``mode`` can be ``safe``, ``clean`` or ``force``.
    ``safe`` will check all quotes before deletion.
    ``clean`` will remove enum and all relative quotes.
    ``force`` will only remove the enum.
    """
    def generate_enum(x):
        x["_id"] = ObjectId(x.pop("id"))
        return x

    enum_id = ObjectId(enum_id)
    if params["mode"] == "force":
        f_app.enum.remove(enum_id)
    elif params["mode"] == "clean" or params["mode"] == "safe":
        blog_post_list = f_app.blog.post_search({"category._id": enum_id}, per_page=0)
        property_list = f_app.property.search({"$or": [
            {"property_type._id": enum_id},
            {"property_price_type._id": enum_id},
            {"investment_type._id": enum_id},
            {"intention._id": enum_id},
            {"equity_type._id": enum_id},
            {"news_category._id": enum_id},
            {"decorative_style._id": enum_id},
            {"facing_direction._id": enum_id},
        ]}, per_page=0)
        item_list = f_app.shop.item_custom_search({"$or": [
            {"investment_type._id": enum_id},
        ]}, per_page=0)
        user_list = f_app.user.custom_search({"$or": [
            {"budget._id": enum_id},
            {"intention._id": enum_id}
        ]}, per_page=0)
        ticket_list = f_app.ticket.search({"$or": [
            {"budget._id": enum_id},
            {"equity_type._id": enum_id},
            {"intention._id": enum_id},
        ]}, per_page=0)
        enum_id = str(enum_id)
        if params["mode"] == "safe":
            if any((blog_post_list, property_list, item_list, user_list, ticket_list)):
                abort(40000, logger.warning("Invalid operation: the enum is currently being used."))
            else:
                return f_app.enum.remove(enum_id)

        for post in f_app.blog.post_get(blog_post_list):
            categories = post.get("category", [])
            if isinstance(categories, list):
                categories_modified = [generate_enum(x) for x in categories if x["id"] != enum_id]
                if len(categories) != len(categories_modified):
                    f_app.blog.post_update_set(post["id"], {"category": categories_modified})

        for property in f_app.property.get(property_list):
            update_fields = {}
            unset_fields = []
            categories = property.get("news_category", [])
            intentions = property.get("intention", [])
            investment_types = property.get("investment_type", [])
            categories_modified = [generate_enum(x) for x in categories if x["id"] != enum_id]
            intentions_modified = [generate_enum(x) for x in intentions if x["id"] != enum_id]
            investment_types_modified = [generate_enum(x) for x in investment_types if x["id"] != enum_id]
            if len(categories) != len(categories_modified):
                update_fields["news_category"] = categories_modified
            if len(intentions) != len(intentions_modified):
                update_fields["intention"] = intentions_modified
            if len(investment_types) != len(investment_types_modified):
                update_fields["investment_type"] = investment_types_modified

            for i in ["property_type, property_price_type", "equity_type", "decorative_style", "facing_direction"]:
                if isinstance(property.get(i), dict) and property[i].get("id") == enum_id:
                    unset_fields.append(i)
            if update_fields:
                f_app.property.update_set(property["id"], update_fields)
            if unset_fields:
                f_app.property.update(property["id"], {"$unset": {i: "" for i in unset_fields}})

        for item in f_app.shop.item_get(item_list):
            unset_fields = []
            for i in ["investment_type"]:
                if isinstance(item.get(i), dict) and item[i].get("id") == enum_id:
                    unset_fields.append(i)
            if unset_fields:
                f_app.shop.item_update(item["id"], {"$unset": {i: "" for i in unset_fields}})

        for user in f_app.user.get(user_list):
            update_fields = {}
            unset_fields = []
            intentions = user.get("intention", [])
            if isinstance(intentions, list):
                intentions_modified = [generate_enum(x) for x in intentions if x["id"] != enum_id]
            if len(intentions) != len(intentions_modified):
                update_fields["intention"] = intentions_modified

            for i in ["budget"]:
                if isinstance(user.get(i), dict) and user[i].get("id") == enum_id:
                    unset_fields.append(i)
            if update_fields:
                f_app.user.update_set(user["id"], update_fields)
            if unset_fields:
                f_app.user.update(user["id"], {"$unset": {i: "" for i in unset_fields}})

        for ticket in f_app.ticket.get(ticket_list):
            update_fields = {}
            unset_fields = []
            intentions = ticket.get("intention", [])
            if isinstance(intentions, list):
                intentions_modified = [generate_enum(x) for x in intentions if x["id"] != enum_id]
            if len(intentions) != len(intentions_modified):
                update_fields["intention"] = intentions_modified

            for i in ["budget", "equity_type"]:
                if isinstance(ticket.get(i), dict) and ticket[i].get("id") == enum_id:
                    unset_fields.append(i)

            if update_fields:
                f_app.ticket.update_set(ticket["id"], update_fields)
            if unset_fields:
                f_app.ticket.update(ticket["id"], {"$unset": {i: "" for i in unset_fields}})

        f_app.enum.remove(enum_id)

    else:
        abort(40000, logger.warning("Invalid params: unrecognized mode"))
