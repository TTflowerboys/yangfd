# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api
import logging
logger = logging.getLogger(__name__)


@f_api('/geo/country')
def geo_country():
    return f_app.geo.country.get_all()


@f_api('/geo/country/search', params=dict(
    per_page=int,
    time=datetime,
    country_code_alpha_3=str,
    country_code=str,
    country=str,
))
def geo_country_search(params):
    per_page = params.pop("per_page", 0)
    return f_app.geo.get(f_app.geo.country.search(params, per_page=per_page))


@f_api('/geo/country/<country_id>')
def geo_country_get(country_id):
    return f_app.geo.get(country_id)


@f_api('/geo/country/<country_id>/edit', params=dict(
    name=("i18n", None, str),
    country=(str, None),
    country_code_alpha_3=(str, None),
    country_code=(str, None),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def geo_country_edit(country_id, params):
    return f_app.geo.update_set(country_id)


@f_api('/geo/country/add', params=dict(
    name=("i18n", True, str),
    country=(str, True),
    country_code_alpha_3=str,
    country_code=str,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def geo_country_add(user, params):
    """
    ``country`` is alpha-2 country code, like CN or GB
    ``country_code`` is the numric country code, like 86 or 70
    ``country_code_alpha_3`` is alpha-3 country code, like CHN or ss
    """
    params.setdefault("type", "country")
    return f_app.geo.country.add(params)


@f_api('/geo/city/add', params=dict(
    name=("i18n", True, str),
    country=(str, True),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def geo_city_add(user, params):
    """
    ``country`` is alpha-2 country code, like CN or GB
    """
    return f_app.geo.city.add(params)


@f_api('/geo/city/<city_id>')
def geo_city_get(city_id):
    return f_app.geo.get(city_id)


@f_api('/geo/city/<city_id>/edit', params=dict(
    name=("i18n", None, str),
    country=(str, None),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def geo_city_edit(city_id, params):
    return f_app.geo.update_set(city_id)


@f_api('/geo/city/search', params=dict(
    per_page=int,
    time=datetime,
    name=str,
    country=str,
))
def geo_city_search(params):
    per_page = params.pop("per_page", 0)
    return f_app.geo.get(f_app.geo.city.search(params, per_page=per_page))
