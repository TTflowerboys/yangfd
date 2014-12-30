# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api


item_params = dict(
    name=(str, True),
    investment_type=("enum:investment_type", None),
    country=("enum:country", None),
    city=("enum:city", None),
    street=(str, None),
    zipcode=(str, None),
    address=(str, None),
    highlight=(list, None, "i18n"),
    description=("i18n", None),
    max_annual_return_estimated=(float, None),
    min_annual_return_estimated=(float, None),
    max_annual_cash_return_estimated=(float, None),
    min_annual_cash_return_estimated=(float, None),
    term=(float, None),
    funding_goal=(float, None),
    intention=("enum:intention", None),
    latitude=(float, None),
    longitude=(float, None),
    reality_images=(list, None, "i18n"),
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
    operators=("i18n", None),
    management_team=(list, None, dict(
        name=(str, None),
        description=(str, None),
        linkedin_home=(str, None),
    )),
    finacials=("i18n", None),
    capital_structure=("i18n", None),
    status=(str, None),
    comment=(str, None),
    attachment=(str, None),
)


@f_api("/shop/add", params=dict(
    name=(str, True),
))
@f_app.user.login.check(force=True, role=['admin'])
def shop_add(user, params):
    return f_app.shop.add(params)


@f_api("/shop/<shop_id>")
@f_app.user.login.check(force=True, role=['admin'])
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


@f_api("/shop/<shop_id>/item/<item_id>/edit", params=item_params)
@f_app.user.login.check(force=True, role=['admin'])
def shop_item_edit(user, shop_id, item_id, params):
    return f_app.shop.item.add(params)
