# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import bottle
from app import f_app
from libfelix.f_interface import f_get, f_post, static_file, template, request, response, redirect, html_redirect, error, abort, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)

@f_get('/property_to_rent_list', params=dict(
    rent_type=str,
    country=str,
    city=str,
    property_type=str,
    rent_budget=str,
    rent_period=str,
    bedroom_count=str,
    building_area=str
))
@currant_util.check_ip_and_redirect_domain
def property_to_rent_list(params):
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    rent_budget_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_budget'))
    property_type_list= f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    country_list = f_app.i18n.process_i18n(f_app.enum.get_all("country"))
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all("rent_period"))
    bedroom_count_list = f_app.i18n.process_i18n(f_app.enum.get_all("bedroom_count"))
    building_area_list = f_app.i18n.process_i18n(f_app.enum.get_all("building_area"))
    property_country_list = []
    property_country_id_list = []
    for index, country in enumerate(country_list):
        if country.get('slug') == 'US' or country.get('slug') == 'GB':
            property_country_list.append(country)
            property_country_id_list.append(country.get('id'))

    property_city_list = []
    if ("country" in params and len(params['country'])):
        for index, city in enumerate(city_list):
            if city.get('country').get('id') in property_country_id_list:
                if str(params['country']) == city.get('country').get('id'):
                    property_city_list.append(city)

    title = ''

    if "country" in params and len(params['country']):
        for country in country_list:
            if country.get('id') == str(params['country']):
                title += country.get('value') + '_'

    if "city" in params and len(params['city']):
        for city in city_list:
            if city.get('id') == str(params['city']):
                title += city.get('value') + '_'

    if "rent_type" in params and len(params['rent_type']):
        for rent_type in rent_type_list:
            if rent_type.get('id') == str(params['rent_type']):
                title += rent_type.get('value') + '_'

    title += _('出租列表-洋房东')

    return currant_util.common_template("property_to_rent_list",
                           city_list=city_list,
                           property_country_list=property_country_list,
                           property_city_list=property_city_list,
                           rent_type_list=rent_type_list,
                           rent_budget_list = rent_budget_list,
                           property_type_list=property_type_list,
                           rent_period_list=rent_period_list,
                           bedroom_count_list=bedroom_count_list,
                           building_area_list=building_area_list,
                           title=title
                           )


@f_get('/property-to-rent/create')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def property_to_rent_create():
    region_highlight_list = f_app.i18n.process_i18n(f_app.enum.get_all('region_highlight'))
    indoor_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('indoor_facility'))
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_period'))
    deposit_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('deposit_type'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    title = _('房屋出租')
    return currant_util.common_template("property_to_rent_create", region_highlight_list=region_highlight_list, rent_period_list=rent_period_list,
    indoor_facility_list=indoor_facility_list, deposit_type_list=deposit_type_list, rent_type_list=rent_type_list,
    property_type_list=property_type_list, title=title)


@f_get('/property-to-rent/publish')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def property_to_rent_publish():
    title = _('出租预览')
    return currant_util.common_template("property_to_rent_publish", title=title)
