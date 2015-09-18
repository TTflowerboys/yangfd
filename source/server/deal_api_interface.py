# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api


@f_api('/deal/search')
def deal_search():
    return f_app.shop.item_output([f_app.shop.item.search({"tag": "coupon", "display": True}, sort=("sort_value", "desc"))])[0]


@f_api('/deal/<deal_id>')
def get_deal(deal_id):
    """
    Get deal information
    """
    return f_app.shop.item_output([deal_id])[0]


@f_api('/venue/<venue_id>/deals')
def get_venue_deals(venue_id):
    """
    Get deals list of certain venue
    """
    item_ids = f_app.shop.item_get_all(venue_id)
    return f_app.shop.item_output(item_ids)


@f_api('/venue/<venue_id>/deal/add', params=dict(
    name=("i18n", None, str),
    description=("i18n", None, str),
    deal_type=(str, True),
    deal_off=(float, 0.0),
    deal_off_shared=(float, 0.0),
    free_text=("i18n", None, str),
    free_text_shared=("i18n", None, str),
    pictures=("i18n", None, list, None, str, None, "replaces"),
    share_text=("i18n", None, str),
    share_text_v2=("i18n", None, str),
    share_button_text=("i18n", None, str),
    sort_value=int,
    display=(bool, True),
))
@f_app.user.login.check(role=["admin", "jr_admin", "operation", "jr_operation"])
def venue_deal_add(venue_id, user, params):
    """
    Add deal of certain venue
    if ``display`` is True, the deal will be shown in the venue list
    deal_type must be ``percentage``,``amount`` or ``free``
    """
    params.setdefault("tag", "coupon")
    params['price'] = 0
    params['quantity'] = 1
    item_ids = f_app.shop.item_get_all(venue_id)
    if params['display']:
        for item_id in item_ids:
            f_app.shop.item_update_set(venue_id, item_id, {"display": False})
    else:
        if len(item_ids) == 0:
            params['display'] = True

    return f_app.shop.item_add(venue_id, params)


@f_api('/venue/<venue_id>/deal/<deal_id>/edit', params=dict(
    name=("i18n", None, str),
    description=("i18n", None, str),
    deal_type=str,
    deal_off=float,
    deal_off_shared=float,
    free_text=("i18n", None, str),
    free_text_shared=("i18n", None, str),
    pictures=("i18n", None, list, None, str, None, "replaces"),
    share_text=("i18n", None, str),
    share_text_v2=("i18n", None, str),
    share_button_text=("i18n", None, str),
    sort_value=int,
    display=bool,
))
@f_app.user.login.check(role=["admin", "jr_admin", "operation", "jr_operation"])
def venue_deal_edit(venue_id, deal_id, user, params):
    """
    Edit deal of certain venue
    if ``display`` is True, the deal will be shown in the venue list
    deal_type must be ``percentage``,``amount`` or ``free``
    """
    if "display" in params:
        item_ids = f_app.shop.item_get_all(venue_id)
        if params['display']:
            for item_id in item_ids:
                f_app.shop.item_update_set(venue_id, item_id, {"display": False})
        else:
            if len(item_ids) == 1:
                params['display'] = True
            else:
                deal = f_app.shop.item_get(deal_id)
                if deal['display']:
                    item_ids.remove(deal_id)
                    f_app.shop.item_update_set(venue_id, item_ids[0], {"display": True})
    return f_app.shop.item_update_set(venue_id, deal_id, params)


@f_api('/venue/<venue_id>/deal/<deal_id>/remove')
@f_app.user.login.check(role=["admin", "jr_admin", "operation", "jr_operation"])
def venue_deal_remove(venue_id, deal_id, user):
    """
    Delete deal of certain venue
    """
    deal = f_app.shop.item_get(deal_id)
    display = deal['display']
    result = f_app.shop.item_delete(venue_id, deal_id)
    if display:
        item_ids = f_app.shop.item_get_all(venue_id)
        if item_ids:
            f_app.shop.item_update_set(venue_id, item_ids[0], {"display": True})
    return result
