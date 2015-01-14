# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort


import logging
logger = logging.getLogger(__name__)


@f_api('/report/add', params=dict(
    name=("i18n", None, str),
    country='enum:country',
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
    if "planning_news" in params and isinstance(params["planning_news"], list):
        for n in params["planning_news"]:
            if isinstance(n, dict):
                n["time"] = datetime.utcnow()
    if "supplement_news" in params and isinstance(params["supplement_news"], list):
        for n in params["supplement_news"]:
            if isinstance(n, dict):
                n["time"] = datetime.utcnow()
    if "job_news" in params and isinstance(params["supplement_news"], list):
        for n in params["supplement_news"]:
            if isinstance(n, dict):
                n["time"] = datetime.utcnow()

    if f_app.report.search({"zipcode_index": params["zipcode_index"]}):
        abort(40000, logger.warning("Invalid params: zipcode_index is already in use!"))
    return f_app.report.add(params)


@f_api('/report/<report_id>')
def report_get(report_id):
    return f_app.report.output([report_id])[0]


@f_api('/report/<report_id>/edit', params=dict(
    name=("i18n", None, str),
    zipcode_index=(str, None),
    country=('enum:country', None),
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
        time=(datetime, None),
    )),
    supplement_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
        time=(datetime, None),
    )),
    job_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=(str, None),
        time=(datetime, None),
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
    country='enum:country',
))
def report_search(params):
    per_page = params.pop("per_page", 0)
    report_list = f_app.report.search(params, per_page=per_page)
    return f_app.report.output(report_list)


@f_api("/report/walkscore", params=dict(
    latitude=float,
    longitude=float,
    zipcode=str,
))
def report_walkscore(params):
    """
    parse ``zipcode`` or ``latitude`` and ``longitude`` to get the location walkscore
    """
    if "zipcode" in params:
        zipcode = f_app.zipcode.get_by_zipcode(params["zipcode"])
        if not zipcode:
            abort(40088, "failed to get walkscore because zipcode doesnot exist")
        latitude = zipcode["latitude"]
        longitude = zipcode["longitude"]
    else:
        if "latitude" not in params or "longitude" not in params:
            abort(40000, "No latitude and longitude")
        latitude = params["latitude"]
        longitude = params["longitude"]
    url = "http://api.walkscore.com/score?format=json&lat=%s&lon=%s&wsapikey=%s" % (latitude, longitude, f_app.common.walkscore_api_key)
    result = f_app.request.get(url, format="json", retry=3)
    if result["status"] in [1, 2]:
        return {"walkscore": result.get("walkscore", "N/A"), "ws_link": result.get("ws_link", "")}
    else:
        abort(40088, "failed to get walkscore and walkscore api status is " + str(result["status"]))


@f_api("/report/policeuk", params=dict(
    date=str,
    lat=float,
    lng=float,
    zipcode=str,
))
def report_police_uk(params):
    result = []
    if "zipcode" in params:
        result = f_app.policeuk.get_crime_by_zipcode(params)
    elif "lat" in params and "lng" in params:
        result = f_app.policeuk.api(params)

    return result if result else []


@f_api("/report/policeuk/categories", params=dict(
    date=str,
))
def report_police_uk_categories(params):
    return f_app.policeuk.api_categories(params)
