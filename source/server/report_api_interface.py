from libfelix.f_common import f_app
from libfelix.f_interface import f_api


import logging
logger = logging.getLogger(__name__)


@f_api('/report/add', params=dict(
    name=("i18n", f_app.common.i18n_locales, str),
    zip=(str, True),
    description=("i18n", f_app.common.i18n_locales, str),
    villa_price=float,
    villa_rental=float,
    flat_price=float,
    flat_rental=float,
    schools=("i18n", None, dict(
    )),
    living_facilities_score=float,
    living_facilities=("i18n", None, dict(
    )),
    traffic_facilities_score=float,
    train_trips=dict(
        name=str,
        distance=float,
    ),
    bus_lines=dict(
        name=str,
        distance=float,
    ),
    car_rental_location=dict(
        latitude=(float, True),
        longitude=(float, True),
        distance=float,
    ),
    bicycle_rental_location=dict(
        latitude=(float, True),
        longitude=(float, True),
        distance=float,
    ),
    population=int,
    population_description=str,
    age_distribution=dict(
    ),
    cosumption_ability_distribution=dict(
    ),
    crime_statistics=str,

    planning_news=dict(
        title=str,
        digest=str,
        link=str,
    ),
    supplyment_news=dict(
        title=str,
        digest=str,
        link=str,
    ),
    job_news=dict(
        title=str,
        digest=str,
        link=str,
    ),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "operation", "jr_operation"])
def report_add(user, params):
    pass
