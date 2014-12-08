# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api


import logging
logger = logging.getLogger(__name__)


@f_api('/report/add', params=dict(
    name=("i18n", None, str),
    zipcode_index=(str, True),
    description=("i18n", None, str),
    villa_price=(list, None, dict(
        price=("i18n:currency", None),
        date=(datetime, None),
    )),
    villa_rental="i18n:currency",
    flat_price=(list, None, dict(
        price=("i18n:currency", None),
        date=(datetime, None),
    )),
    flat_rental="i18n:currency",
    schools=(list, None, dict(
        name=("i18n", None, str),
        type="enum:school_type",
        grade="enum:school_grade",
        ranking=int,
    )),
    walk_score=float,
    facilities=(list, None, dict(
        name=("i18n", None, str),
        type="enum:facilities",
        address=("i18n", None, str),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    transit_score=float,
    railway_lines=(list, None, dict(
        name=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    bus_lines=(list, None, dict(
        name=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    car_rental_location=(list, None, dict(
        place=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    bicycle_rental_location=(list, None, dict(
        place=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    population=int,
    population_description=str,
    age_distribution=dict(
    ),
    consumption_ability_distribution=dict(
    ),
    crime_statistics=(list, None, str),
    planning_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
    )),
    supplement_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
    )),
    job_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
    )),
    image=str,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "operation", "jr_operation"])
def report_add(user, params):
    return f_app.report.add(params)


@f_api('/report/<report_id>')
def report_get(report_id):
    return f_app.report.output([report_id])[0]


@f_api('/report/<report_id>/edit', params=dict(
    name=("i18n", None, str),
    zipcode_index=(str, None),
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
    facilities=(list, None, dict(
        name=("i18n", None, str),
        type="enum:facilities",
        address=("i18n", None, str),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    transit_score=(float, None),
    railway_lines=(list, None, dict(
        name=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    bus_lines=(list, None, dict(
        name=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    car_rental_location=(list, None, dict(
        place=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    bicycle_rental_location=(list, None, dict(
        place=(str, None),
        distance=("i18n:distance", None, "meter, foot"),
    )),
    population=(int, None),
    population_description=(str, None),
    age_distribution=(dict(
    ), None),
    consumption_ability_distribution=(dict(
    ), None),
    crime_statistics=(list, None, str),
    planning_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
    )),
    supplement_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
    )),
    job_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
    )),
    image=(str, None),
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
    zipcode_index=str,
))
def report_search(params):
    per_page = params.pop("per_page", 0)
    report_list = f_app.report.search(params, per_page=per_page)
    return f_app.report.output(report_list)
