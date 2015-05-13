# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from app import f_app
from libfelix.f_interface import f_get, redirect, abort, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)


@f_get('/property_list', '/property-list', params=dict(
    property_type=str,
    country=str,
    city=str,
    budget=str,
    intention=str,
    bedroom_count=str,
    building_area=str
))
@currant_util.check_ip_and_redirect_domain
def property_list(params):
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    country_list = f_app.i18n.process_i18n(f_app.enum.get_all("country"))
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
                title += country.get('value') + '-'

    if "city" in params and len(params['city']):
        for city in city_list:
            if city.get('id') == str(params['city']):
                title += city.get('value') + '-'

    if "property_type" in params and len(params['property_type']):
        for property_type in property_type_list:
            if property_type.get('id') == str(params['property_type']):
                title += property_type.get('value') + '-'

    title += _('房产列表-洋房东')

    return currant_util.common_template("property_list",
                                        city_list=city_list,
                                        property_country_list=property_country_list,
                                        property_city_list=property_city_list,
                                        property_type_list=property_type_list,
                                        intention_list=intention_list,
                                        bedroom_count_list=bedroom_count_list,
                                        building_area_list=building_area_list,
                                        title=title
                                        )


@f_get('/property/<property_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(check_role=True)
def property_get(property_id, user):
    property = f_app.i18n.process_i18n(currant_data_helper.get_property_or_target_property(property_id))
    if property["status"] not in ["selling", "sold out", "restricted"]:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_property_id")
    favorite_list = currant_data_helper.get_favorite_list('property')
    favorite_list = f_app.i18n.process_i18n(favorite_list)
    related_property_list = f_app.i18n.process_i18n(currant_data_helper.get_related_property_list(property))

    report = None

    if property.get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(property.get('report_id')))

    title = _(property.get('name', '房产详情'))
    if property.get('city') and property.get('city').get('value'):
        title += '-' + _(property.get('city').get('value'))
    if property.get('country') and property.get('country').get('value'):
        title += '-' + _(property.get('country').get('value'))
    description = property.get('name', _('房产详情'))

    tags = []
    if 'intention' in property and property.get('intention'):
        tags = [item['value'] for item in property['intention'] if 'value' in item]

    keywords = property.get('name', _('房产详情')) + ',' + property.get('country', {}).get('value', '') + ',' + property.get('city', {}).get('value', '') + ',' + ','.join(tags + currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    return currant_util.common_template("property", property=property, favorite_list=favorite_list, related_property_list=related_property_list, report=report, title=title, description=description, keywords=keywords, weixin=weixin)


@f_get('/pdf_viewer/property/<property_id:re:[0-9a-fA-F]{24}>', params=dict(
    link=(str, True),
))
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def pdfviewer(user, property_id, params):
    property = f_app.i18n.process_i18n(currant_data_helper.get_property_or_target_property(property_id))
    if property["status"] not in ["selling", "sold out", "restricted"]:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_property_id")
    for brochure in property.get('brochure'):
        if brochure.get('url') == params["link"]:
            title = property.get('name', _('房产详情')) + ' PDF'
            link = params["link"].encode('utf-8')
            return currant_util.common_template("pdf_viewer", link=link, title=title)

    return redirect('/404')
