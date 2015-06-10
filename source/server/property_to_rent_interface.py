# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import six
from app import f_app
from libfelix.f_interface import f_get, abort, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)


@f_get('/property_to_rent_list', '/property-to-rent-list', params=dict(
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
@f_app.user.login.check(role=["jr_admin", "operation", "jr_operation", "beta_renting"])
def property_to_rent_list(params, user):
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    rent_budget_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_budget'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    country_list = currant_util.get_country_list()
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all("rent_period"))
    bedroom_count_list = f_app.i18n.process_i18n(f_app.enum.get_all("bedroom_count"))
    building_area_list = f_app.i18n.process_i18n(f_app.enum.get_all("building_area"))
    property_country_list = currant_util.get_country_list()

    property_city_list = []
    if "country" in params and len(params['country']):
        country = params['country']
    else:
        country = "GB"
    geonames_params = dict({
        "feature_code": {"$in": ["PPLC", "PPLA", "PPLA2"]},
        "country": country
    })
    property_city_list = f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(geonames_params, per_page=-1))

    title = ''

    if "country" in params and len(params['country']):
        for country in country_list:
            if country.get('code') == str(params['country']):
                title += currant_util.get_country_name_by_code(country.get('code')) + '-'

    if "city" in params and len(params['city']):
        for city in property_city_list:
            if city.get('id') == str(params['city']):
                title += city.get('name') + '-'

    if "rent_type" in params and len(params['rent_type']):
        for rent_type in rent_type_list:
            if rent_type.get('id') == str(params['rent_type']):
                title += rent_type.get('value') + '-'

    title += _('出租列表-洋房东')

    return currant_util.common_template("property_to_rent_list",
                                        city_list=city_list,
                                        property_country_list=property_country_list,
                                        property_city_list=property_city_list,
                                        rent_type_list=rent_type_list,
                                        rent_budget_list=rent_budget_list,
                                        property_type_list=property_type_list,
                                        rent_period_list=rent_period_list,
                                        bedroom_count_list=bedroom_count_list,
                                        building_area_list=building_area_list,
                                        title=title
                                        )


@f_get('/property-to-rent/<rent_ticket_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(check_role=True)
def rent_ticket_get(rent_ticket_id, user):
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])
    if rent_ticket["status"] not in ["draft", "to rent"]:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_rent_ticket_id")

    is_favorited = f_app.user.favorite.is_favorited(rent_ticket_id, 'rent_ticket', user["id"] if user else None)

    publish_time = f_app.util.format_time(rent_ticket.get('time'))
    report = None
    if rent_ticket["property"].get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(rent_ticket["property"].get('report_id')))

    title = rent_ticket.get('title', _('出租房详情'))
    if not isinstance(title, six.string_types):
        title = six.text_type(title)
    if rent_ticket["property"].get('city', {}) and rent_ticket["property"].get('city', {}).get('name', ''):
        title += '-' + _(rent_ticket["property"].get('city', {}).get('name', ''))
    if rent_ticket["property"].get('country', {}) and rent_ticket["property"].get('country', {}).get('code', ''):
        title += '-' + _(currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')))
    description = rent_ticket.get('description', _('详情'))

    keywords = title + ',' + currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')) + ',' + rent_ticket["property"].get('city', {}).get('name', '') + ','.join(currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    return currant_util.common_template("property_to_rent", rent=rent_ticket, report=report, is_favorited=is_favorited, publish_time=publish_time, title=title, description=description, keywords=keywords, weixin=weixin)


@f_get('/property-to-rent/create')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(role=["jr_admin", "operation", "jr_operation", "beta_renting"])
def property_to_rent_create(user):
    region_highlight_list = f_app.i18n.process_i18n(f_app.enum.get_all('region_highlight'))
    indoor_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('indoor_facility'))
    community_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('community_facility'))
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_period'))
    deposit_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('deposit_type'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    landlord_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('landlord_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    rent = {}
    title = _('出租房源发布')
    return currant_util.common_template("property_to_rent_create", landlord_type_list=landlord_type_list, region_highlight_list=region_highlight_list, rent_period_list=rent_period_list, indoor_facility_list=indoor_facility_list, community_facility_list=community_facility_list, deposit_type_list=deposit_type_list, rent_type_list=rent_type_list,
                                        property_type_list=property_type_list, title=title, rent=rent)


@f_get('/property-to-rent/<rent_ticket_id:re:[0-9a-fA-F]{24}>/edit')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(role=["jr_admin", "operation", "jr_operation", "beta_renting"])
def property_to_rent_edit(rent_ticket_id, user):
    title = _('出租房源编辑')
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])
    keywords = title + ',' + currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')) + ',' + rent_ticket["property"].get('city', {}).get('name', '') + ','.join(currant_util.BASE_KEYWORDS_ARRAY)
    region_highlight_list = f_app.i18n.process_i18n(f_app.enum.get_all('region_highlight'))
    indoor_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('indoor_facility'))
    community_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('community_facility'))
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_period'))
    deposit_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('deposit_type'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    landlord_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('landlord_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    return currant_util.common_template("property_to_rent_create", landlord_type_list=landlord_type_list, title=title, keywords=keywords, rent=rent_ticket, region_highlight_list=region_highlight_list, rent_period_list=rent_period_list,
                                        indoor_facility_list=indoor_facility_list, community_facility_list=community_facility_list, deposit_type_list=deposit_type_list, rent_type_list=rent_type_list, property_type_list=property_type_list)


@f_get('/property-to-rent/<rent_ticket_id:re:[0-9a-fA-F]{24}>/publish-success')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(role=["jr_admin", "operation", "jr_operation", "beta_renting"])
def property_to_rent_publish_success(rent_ticket_id, user):
    title = _('房源发布成功')
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])
    keywords = title + ',' + currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')) + ',' + rent_ticket["property"].get('city', {}).get('name', '') + ','.join(currant_util.BASE_KEYWORDS_ARRAY)
    return currant_util.common_template("property_to_rent_publish_success", title=title, keywords=keywords, rent=rent_ticket)
