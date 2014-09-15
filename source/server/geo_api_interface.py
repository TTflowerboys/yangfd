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


@f_api('/geo/country/<country_code>')
def geo_country_get(country_code):
    return f_app.geo.country.get(f_app.geo.search({"country_code": country_code})[0])

