# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort, request


import logging
logger = logging.getLogger(__name__)


@f_api('/report/add', params=dict(
    name=("i18n", None, str),
    country='country',
    city='geonames_gazetteer:city',
    maponics_neighborhood="maponics_neighborhood",
    zipcode_index=str,
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
    if "maponics_neighborhood" in params:
        if f_app.report.search({"maponics_neighborhood": params["maponics_neighborhood"]}):
            abort(40000, logger.warning("Invalid params: maponics_neighborhood is already in use!"))

    return f_app.report.add(params)


@f_api('/report/<report_id>')
def report_get(report_id):
    return f_app.report.output([report_id])[0]


@f_api('/report/<report_id>/edit', params=dict(
    name=("i18n", None, str),
    zipcode_index=str,
    maponics_neighborhood="maponics_neighborhood",
    ward=str,
    district=str,
    country='country',
    city='geonames_gazetteer:city',
    description=("i18n", None, str),
    villa_price=("i18n:currency", None),
    villa_rental=("i18n:currency", None),
    flat_price=("i18n:currency", None),
    flat_rental=("i18n:currency", None),
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
        name=str,
        distance=("i18n:distance", None, "meter, foot"),
    )),
    car_rental_location=(list, None, dict(
        place=str,
        distance=("i18n:distance", None, "meter, foot"),
    )),
    bicycle_rental_location=(list, None, dict(
        place=str,
        distance=("i18n:distance", None, "meter, foot"),
    )),
    population=int,
    population_description=str,
    age_distribution=(dict(
    ), None),
    consumption_ability_distribution=(dict(
    ), None),
    crime_statistics=(list, None, str),
    planning_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=str,
    )),
    supplement_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=str,
    )),
    job_news=(list, None, dict(
        title=("i18n", None, str),
        summary=("i18n", None, str),
        link=str,
    )),
    image=str,
))
def report_edit(report_id, params):
    if "maponics_neighborhood" in params:
        if f_app.report.search({"maponics_neighborhood": params["maponics_neighborhood"]}):
            abort(40000, logger.warning("Invalid params: maponics_neighborhood is already in use!"))

    return f_app.report.update_set(report_id, params)


@f_api('/report/<report_id>/remove')
def report_remove(report_id):
    f_app.report.remove(report_id)


@f_api('/report/search', params=dict(
    per_page=int,
    time=datetime,
    status=str,
    zipcode_index=str,
    country='country',
    city='geonames_gazetteer:city',
    maponics_neighborhood="maponics_neighborhood"
))
def report_search(params):
    if "zipcode_index" in params:
        params["maponics_neighborhood"] = {"$exists": False}
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


@f_api('/ip_country', params=dict(
    ip=str,
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def ip_country(params, user):
    if "ip" in params:
        return f_app.geoip.get_country(params["ip"])
    else:
        return request.ip_country


@f_api('/maponics_neighborhood/search', params=dict(
    country="country",
    city='geonames_gazetteer:city',
    name=str,
))
def maponics_neighborhood_search(params):
    if "city" in params:
        params["geonames_city_id"] = ObjectId(params.pop("city")["_id"])
    if "country" in params:
        params["country"] = params["country"]["code"]
    neighborhoods = f_app.maponics.neighborhood.get(f_app.maponics.neighborhood.search(params, per_page=-1))
    neighborhood_dict = {neighborhood["nid"]: neighborhood for neighborhood in neighborhoods}
    for neighborhood in neighborhoods:
        neighborhood.pop("wkt", None)
        if "parentnid" in neighborhood and neighborhood["parentnid"]:
            if neighborhood["parentnid"] in neighborhood_dict:
                neighborhood["parent"] = neighborhood_dict[neighborhood["parentnid"]]
            else:
                neighborhood["parent"] = f_app.maponics.neighborhood.get(f_app.maponics.neighborhood.get_by_nid(neighborhood["parentnid"]))[0]
                neighborhood_dict[neighborhood["parentnid"]] = neighborhood["parent"]
            neighborhood["parent"].pop("wkt", None)
    return neighborhoods


@f_api('/hesa_university/search', params=dict(
    country="country",
    postcode=str,
    postcode_index=str,
    name=str,
))
def hesa_university_search(params):
    if "country" in params:
        params["country"] = params["country"]["code"]
    universities = f_app.hesa.university.get(f_app.hesa.university.search(params, per_page=-1))
    return universities


@f_api('/geonames/<_id>')
def geonames_get(_id):
    return f_app.geonames.gazetteer.get(_id)


@f_api('/geonames/search', params=dict(
    country="country",
    admin1=str,
    admin2=str,
    admin3=str,
    feature_code=(str, True),
    name=str,
    name_index=str,
    geoip=bool,
    latitude=float,
    longitude=float,
    search_range=(int, 5000),
))
def geonames_search(params):
    """
    Valid ``feature_code`` are: "ADM1", "ADM2", "ADM3", "city", "PPLX".

    ``name`` is for *exact* name match, while ``name_index`` is for searching.

    Example usage:

    1. Get all city for GB: country=GB&feature_code=city
    """
    if "latitude" in params:
        assert "longitude" in params, abort(40000)
    elif "longitude" in params:
        abort(40000)
    else:
        params.pop("search_range")

    if "geoip" in params and params["geoip"]:
        # TODO: City?
        try:
            remote_ip = request.remote_route[-1]
        except:
            remote_ip = None

        try:
            params["country"] = request.ip_country
        except:
            logger.warning("Failed to determine country of ip:", remote_ip)

    assert params["feature_code"] in ("ADM1", "ADM2", "ADM3", "city", "PPLX"), abort(40000, "invalid feature_code")

    if params["feature_code"] == "city":
        params["feature_code"] = {"$in": ["PPLC", "PPLA", "PPLA2"]}

    if "country" in params:
        params["country"] = params["country"]["code"]

    if "latitude" in params:
        return f_app.geonames.gazetteer.get_nearby(params)
    else:
        return f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(params, per_page=-1))


@f_api('/postcode/search', params=dict(
    country="country",
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

    if "country" in params:
        params["country"] = params["country"]["code"]

    if "postcode_area" in params and params["postcode_area"]:
        assert "country" in params, abort(40000, "country must present to query postcode area")
        postcodes = f_app.geonames.postcode.get_postcode_areas(params["country"])

    else:
        assert "postcode" in params or "postcode_index" in params, abort(40000, "either postcode or postcode_index must present")
        postcodes = f_app.geonames.postcode.get(f_app.geonames.postcode.search(params, per_page=-1))

    for postcode in postcodes:
        if "neighborhoods" in postcode and postcode["neighborhoods"]:
            def expand_neighborhood(neighborhood_id):
                neighborhood = f_app.maponics.neighborhood.get(neighborhood_id)
                neighborhood.pop('wkt', None)
                return neighborhood

            postcode["neighborhoods"] = map(expand_neighborhood, postcode["neighborhoods"])

    return postcodes


@f_api('/doogal/districts_and_wards')
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation', 'developer', 'agency'])
def doogal_districts_and_wards(user):
    return f_app.doogal.get_districts_wards()


@f_api('/ping')
def ping():
    return "pong"
