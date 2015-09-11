# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api, ObjectId, abort
import re


@f_api('/venue/<venue_id>')
def venue(venue_id):
    """
    Get venue information by id

    deals field is the list of deal and rating field is the rating of venue
    """
    venue = f_app.shop.output([venue_id])[0]
    user_admin_level = f_app.user.login.get_admin_level()
    if venue["status"] != "show":
        if not user_admin_level:
            abort(40390)
    venue["deals"] = f_app.shop.item_output(f_app.shop.item_get_all(venue_id))
    venue.pop("minimal_price", None)
    venue.pop("quantity", None)
    return venue


@f_api('/venue/add', params=dict(
    name=("i18n", None, str),
    description=("i18n", None, str),
    city='geonames_gazetteer:city',
    maponics_neighborhood="maponics_neighborhood",
    address=("i18n", None, str),
    zipcode=str,
    phone=str,
    logo=("i18n", None, str, None, "replaces"),
    pictures=("i18n", None, list, None, str, None, "replaces"),
    longitude=float,
    latitude=float,
    country="country",
    status=(str, "hide"),
))
@f_app.user.login.check(role=["admin", "jr_admin"])
def venue_add(user, params):
    """
    Add venue
    """
    if params["status"] not in ["show", "hide"]:
        abort(40000, "status must be show or hide in venue creating")
    f_app.util.parse_phone(params, retain_country=True)
    return f_app.shop.add(params)


@f_api('/venue/<venue_id>/edit', params=dict(
    name=("i18n", None, str),
    description=("i18n", None, str),
    city='geonames_gazetteer:city',
    maponics_neighborhood="maponics_neighborhood",
    address=("i18n", None, str),
    zipcode=str,
    phone=str,
    logo=("i18n", None, str, None, "replaces"),
    pictures=("i18n", None, list, None, str, None, "replaces"),
    longitude=float,
    latitude=float,
    country="country",
    status=str,
))
@f_app.user.login.check(role=["admin", "jr_admin"])
def venue_edit(venue_id, user, params):
    """
    Edit venue information
    Parse ``deleted`` to ``status`` will delete the given venue.
    Parse ``show`` to ``status`` will show the given venue on theindicard platform.
    Parse ``hide`` to ``status`` will hide the given venue on theindicard platform.
    """
    if "status" in params and params["status"] not in ["deleted", "show", "hide"]:
        abort(40000)
    venue = f_app.shop.get(venue_id)

    if "phone" in params and "country" not in params:
        f_app.util.parse_phone({"phone": params["phone"], "country": venue["country"]}, retain_country=True)
    elif "phone" in params and "country" in params:
        f_app.util.parse_phone(params, retain_country=True)
    return f_app.shop.update_set(venue_id, params)


def _check_email(email):
    '''
    check email format
    '''
    try:
        if len(email) > 7:
            if re.match("^\\S+\\@(\\[?)[a-zA-Z0-9\\-\\_\\~\\.]+\\.([a-zA-Z]{2,3}|[0-9]{1,3})(\\]?)$", email) is not None:
                return True
        return False
    except:
        return True


@f_api('/venue/search', params=dict(
    country='country',
    city='geonames_gazetteer:city',
    maponics_neighborhood="maponics_neighborhood",
    longitude=float,
    latitude=float,
    sort=(list, None, str),
    status=(list, None, str),
))
@f_app.user.login.check(check_role=True, check_admin=True)
def venue_search(user, params):
    params.setdefault("type", {"$ne": "vip"})
    if "status" in params:
        if not (user and set(user["role"]) & set(["admin", "jr_admin"])):
            abort(40105)

        params["status"] = {"$in": params["status"]}

    else:
        if not user:
            params.setdefault("status", "show")
        else:
            if set(user["role"]) & set(["admin", "jr_admin"]):
                params.setdefault("status", {"$ne": "deleted"})
            else:
                params.setdefault("status", "show")

    sort = params.pop("sort", None)
    if "latitude" in params and "longitude" in params:
        venues = f_app.shop.get_nearby(params)
    else:
        venues = f_app.shop.output(f_app.shop.search(params, sort=sort))

    for venue in venues:
        venue.pop("minimal_price", None)
        venue.pop("quantity", None)
        venue["deal"] = None
        item_ids = f_app.shop.item_search({'shop_id': ObjectId(venue['id']), 'display': True})
        if item_ids:
            venue['deal'] = f_app.shop.item.output(item_ids)[0]

    return venues
