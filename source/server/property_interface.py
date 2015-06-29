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
    # todo city_list更改数据结构
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    country_list = currant_util.get_country_list()
    bedroom_count_list = f_app.i18n.process_i18n(f_app.enum.get_all("bedroom_count"))
    building_area_list = f_app.i18n.process_i18n(f_app.enum.get_all("building_area"))
    property_country_list = currant_util.get_country_list()

    property_city_list = []
    if ("country" in params and len(params['country'])):
        geonames_params = dict({
            "feature_code": {"$in": ["PPLC", "PPLA", "PPLA2"]},
            "country": params['country']
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

    is_favorited = f_app.user.favorite.is_favorited(property_id, 'property', user["id"] if user else None)

    related_property_list = f_app.i18n.process_i18n(currant_data_helper.get_related_property_list(property))

    report = None

    if property.get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(property.get('report_id')))

    title = _(property.get('name', '房产详情'))
    if property.get('city') and property.get('city').get('name'):
        title += '-' + _(property.get('city').get('name'))
    if property.get('country') and currant_util.get_country_name_by_code(property.get('country').get('code')):
        title += '-' + _(currant_util.get_country_name_by_code(property.get('country').get('code')))
    description = property.get('name', _('房产详情'))

    tags = []
    if 'intention' in property and property.get('intention'):
        tags = [item['value'] for item in property['intention'] if 'value' in item]

    keywords = property.get('name', _('房产详情')) + ',' + currant_util.get_country_name_by_code(property.get('country', {}).get('code', '')) + ',' + property.get('city', {}).get('name', '') + ',' + ','.join(tags + currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    return currant_util.common_template("property", property=property, is_favorited=is_favorited, related_property_list=related_property_list, report=report, title=title, description=description, keywords=keywords, weixin=weixin)


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


@f_get('/property-wechat-poster/<property_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
def property_wechat_poster(property_id):
    property = f_app.i18n.process_i18n(currant_data_helper.get_property_or_target_property(property_id))
    #if property["status"] not in ["selling", "sold out", "restricted"]:
    #    assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_property_id")

    related_property_list = f_app.i18n.process_i18n(currant_data_helper.get_related_property_list(property))

    report = None
    if property.get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(property.get('report_id')))

    title = property.get('name', _('房产详情'))
    if property.get('city') and property.get('city').get('name'):
        title += '-' + _(property.get('city').get('name'))
    if property.get('country') and currant_util.get_country_name_by_code(property.get('country').get('code')):
        title += '-' + _(currant_util.get_country_name_by_code(property.get('country').get('code')))
    description = property.get('name', _('房产详情'))

    tags = []
    if 'intention' in property and property.get('intention'):
        tags = [item['value'] for item in property['intention'] if 'value' in item]

    keywords = property.get('name', _('房产详情')) + ',' + currant_util.get_country_name_by_code(property.get('country', {}).get('code', '')) + ',' + property.get('city', {}).get('name', '') + ',' + ','.join(tags + currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    def format_property(property):
        res = u'<div><i class="icon-rooms"></i><span>' + unicode(str(property.get('bedroom_count',0))) + unicode(_(u'室')) + unicode(str(property.get('living_room_count',0))) + unicode(_(u'厅'))
        if property.get('space',{}):
            res += unicode("{0:.0f}".format(float(property.get('space',{}).get('value',0))))
            res += unicode(currant_util.format_unit(property.get('space',{}).get('unit','')))
        elif property.get('building_area',{}):
            res += unicode("{0:.0f}".format(float(property.get('building_area',{}).get('value',0))))
            res += unicode(currant_util.format_unit(property.get('building_area',{}).get('unit','')))
        res += u'</span></div>'
        return res

    return currant_util.common_template("property_wechat_poster", property=property, related_property_list=related_property_list, report=report, title=title, description=description, keywords=keywords, weixin=weixin, format_property=format_property)
