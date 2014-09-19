# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api


import logging
logger = logging.getLogger(__name__)


@f_api('/report/add', params=dict(
    name=("i18n", None, str),
    zipcode=(str, True),
    description=("i18n", None, str),
    villa_price="i18n:currency",
    villa_rental="i18n:currency",
    flat_price="i18n:currency",
    flat_rental="i18n:currency",
    schools=(list, None, dict(
        name=("i18n", None, str),
        type="enum:school_type",
        grade="enum:school_grade",
        ranking=int,
    )),
    walk_score=float,
    facilities=(list, None, "enum:facilities"),
    transit_score=float,
    railway_lines=dict(
        name=str,
        distance=float,
    ),
    bus_lines=dict(
        name=str,
        distance=float,
    ),
    car_rental_location=dict(
        place=str,
        distance=float,
    ),
    bicycle_rental_location=dict(
        place=str,
        distance=float,
    ),
    population=int,
    population_description=str,
    age_distribution=dict(
    ),
    cosumption_ability_distribution=dict(
    ),
    crime_statistics=(list, None, str),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "operation", "jr_operation"])
def report_add(user, params):
    return f_app.report.add(params)


@f_api('/report/<report_id>')
def report_get(report_id):
    return f_app.report.output([report_id])[0]


@f_api('/report/<report_id>/edit', params=dict(
    name=("i18n", None, str),
    zipcode=(str, None),
    description=("i18n", None, str),
    villa_price=("i18n:currency", None),
    villa_rental=("i18n:currency", None),
    flat_price=("i18n:currency", None),
    flat_rental=("i18n:currency", None),
    schools=(list, None, dict(
        name=("i18n", None, str),
        type="enum:school_type",
        grade="enum:school_grade",
        ranking=(int, None),
    )),
    walk_score=(float, None),
    facilities=(list, None, str),
    transit_score=(float, None),
    railway_lines=dict(
        name=(str, None),
        distance=(float, None),
    ),
    bus_lines=(dict(
        name=(str, None),
        distance=(float, None),
    ), None),
    car_rental_location=(dict(
        place=(str, None),
        distance=(float, None),
    ), None),
    bicycle_rental_location=(dict(
        place=(str, None),
        distance=(float, None),
    ), None),
    population=(int, None),
    population_description=(str, None),
    age_distribution=(dict(
    ), None),
    cosumption_ability_distribution=(dict(
    ), None),
    crime_statistics=(list, None, str),
))
def report_edit(report_id, params):
    return f_app.report.update_set(report_id, params)


@f_api('/report/<report_id>/remove')
def report_remove(report_id):
    f_app.report.remove(report_id)


@f_api('/report/search', params=dict(
    per_page=int,
    time=datetime,
    status=str,
))
def report_search(params):
    per_page = params.pop("per_page", 0)
    report_list = f_app.report.search(params, per_page=per_page)
    return f_app.report.output(report_list)
