# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort, request


import logging
logger = logging.getLogger(__name__)


@f_api('/report/add', params=dict(
    name=("i18n", None, str),
    country='enum:country',
    zipcode_index=(str, True),
    ward=str,
    district=str,
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
    image=(str, None, "replaces"),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "operation", "jr_operation"])
def report_add(user, params):
    if f_app.report.search({"zipcode_index": params["zipcode_index"]}):
        abort(40000, logger.warning("Invalid params: zipcode_index is already in use!"))
    return f_app.report.add(params)


@f_api('/report/<report_id>')
def report_get(report_id):
    return f_app.report.output([report_id])[0]


@f_api('/report/<report_id>/edit', params=dict(
    name=("i18n", None, str),
    zipcode_index=(str, None),
    ward=str,
    district=str,
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


@f_api('/lupdate')
@f_app.user.login.check(role=["admin", "jr_admin"])
def lupdate(user):
    f_app.landregistry.check_update()


@f_api('/geonames/search', params=dict(
    country=(str, True),
    admin1=str,
    admin2=str,
    admin3=str,
    feature_code=(str, True),
    name=str,
    name_index=str,
    geoip=bool,
))
def geonames_search(params):
    """
    Valid ``feature_code`` are: "ADM1", "ADM2", "ADM3", "city", "PPLX".

    ``name`` is for *exact* name match, while ``name_index`` is for searching.

    Example usage:

    1. Get all city for GB: country=GB&feature_code=city
    """
    if "geoip" in params and params["geoip"]:
        # TODO: City?
        try:
            remote_ip = request.remote_route[-1]
        except:
            remote_ip = None

        try:
            country = f_app.geoip.get_country(remote_ip)
            params["country"] = country
        except:
            logger.warning("Failed to determine country of ip:", remote_ip)

    assert params["feature_code"] in ("ADM1", "ADM2", "ADM3", "city", "PPLX"), abort(40000, "invalid feature_code")

    if params["feature_code"] == "city":
        params["feature_code"] = {"$in": ["PPLC", "PPLA", "PPLA2"]}

    return f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(params, per_page=-1))


@f_api('/postcode/search', params=dict(
    country=str,
    postcode=str,
    postcode_index=str,
    postcode_area=bool,
))
def postcode_search(params):
    """
    ``postcode`` is the well-formatted postcode, e.g. "E14 9AQ".

    ``postcode_index`` is the stripped ``postcode`` that spaces were removed, e.g. "E149AQ".

    To get all postcode area in GB: country=GB&postcode_area=1

    For other uses, either ``postcode`` or ``postcode_index`` must present.
    """
    if "postcode_area" in params and params["postcode_area"]:
        params["accuracy"] = {"$in": [3, 4]}
        params.pop("postcode_area")

        postcode_areas = set()
        for result in f_app.geonames.postcode.get(f_app.geonames.postcode.search(params, per_page=-1)):
            postcode_areas.add(result["postcode"])

        return list(postcode_areas)

    else:
        assert "postcode" in params or "postcode_index" in params, abort(40000, "either postcode or postcode_index must present")
        return f_app.geonames.postcode.get(f_app.geonames.postcode.search(params, per_page=-1))


@f_api('/doogal/districts_and_wards')
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation', 'developer', 'agency'])
def doogal_districts_and_wards(user):
    return f_app.doogal.get_districts_wards()


@f_api('/ping')
def ping():
    return "pong"
