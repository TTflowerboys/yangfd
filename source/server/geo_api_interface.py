# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_api, abort, rate_limit, template, request
import random
import logging
logger = logging.getLogger(__name__)


@f_api('/geo/country')
def geo_country():
    return f_app.geo.country.get_all()


@f_api('/geo/country/<country>')
def geo_country_get(country):
    return f_app.geo.country.get(f_app.geo.search({"country": country})[0])


@f_api('/geo/country/add', params=dict(
    name=("i18n", True, str),
    country=(str, True),
    country_code_alpha_3=str,
    country_code=str,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def geo_country_add(user, params):
    return f_app.geo.country.add(params)
