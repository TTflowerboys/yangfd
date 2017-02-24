# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import six
from funcy.py3 import lfilter
from app import f_app
from libfelix.f_interface import f_get, redirect, abort, template_gettext as _
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
def property_to_rent_list(params):
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    rent_budget_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_budget'))
    rent_budget_item_list = f_app.i18n.process_i18n(currant_util.get_sorted_enums('rent_budget_item'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    property_type_list_without_new_property = lfilter(lambda item: item.get('slug') != 'new_property', property_type_list)
    country_list = currant_util.get_country_list()
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all("rent_period"))
    bedroom_count_list = f_app.i18n.process_i18n(currant_util.get_sorted_enums("bedroom_count"))
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
    property_city_list = f_app.i18n.process_i18n(f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(geonames_params, per_page=-1)))

    hot_city_list = []
    hot_city_geonames_params = dict({
        "name_ascii": {"$in": ["London", "Liverpool", "Sheffield", "Manchester", "Birmingham"]},
        "feature_code": {"$in": ["PPLC", "PPLA", "PPLA2"]},
        "country": "GB"
    })
    hot_city_list = f_app.i18n.process_i18n(f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(hot_city_geonames_params, per_page=-1)))

    hot_school_list = []
    hot_school_geonames_params = dict({
        "name": {"$in": ["University College London", "University of the Arts, London", "King\'s College London", "University of London (Institutes and activities)"]},
        "country": "GB"
    })
    hot_school_list = f_app.hesa.university.get(f_app.hesa.university.search(hot_school_geonames_params, per_page=-1))[::-1]

    title = ''
    keywords = ''

    if "country" in params and len(params['country']):
        for country in country_list:
            if country.get('code') == str(params['country']):
                title += currant_util.get_country_name_by_code(country.get('code')) + '-'
                keywords += currant_util.get_country_name_by_code(country.get('code')) + ','

    if "city" in params and len(params['city']):
        for city in property_city_list:
            if city.get('id') == str(params['city']):
                title += city.get('name') + '-'
                keywords += city.get('name') + ','

    if "rent_type" in params and len(params['rent_type']):
        for rent_type in rent_type_list:
            if rent_type.get('id') == str(params['rent_type']):
                title += rent_type.get('value') + '-'
                keywords += rent_type.get('value') + ','

    title += _('出租列表-洋房东')
    description = _('英国华人的线上租赁神器，最全面的房源信息，最宽广的招租平台，最先进的交流系统，更快更直接地找到理想的房源或房客')
    keywords += _('洋房东,租房,出租,租房中介,找房子,短租,长租,租金,公寓,别墅,学区房,留学生租房,海外租房,英国出租,英国租房,伦敦租房,租房列表,房源列表,Youngfunding,for rent,to let,room to rent,property to rent,property,apartment,house,UK property,list of property')

    return currant_util.common_template("property_to_rent_list",
                                        description=description,
                                        keywords=keywords,
                                        city_list=city_list,
                                        hot_city_list=hot_city_list,
                                        hot_school_list=hot_school_list,
                                        property_country_list=property_country_list,
                                        property_city_list=property_city_list,
                                        rent_type_list=rent_type_list,
                                        rent_budget_list=rent_budget_list,
                                        rent_budget_item_list=rent_budget_item_list,
                                        property_type_list=property_type_list,
                                        property_type_list_without_new_property=property_type_list_without_new_property,
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
    if rent_ticket['status'] not in ['to rent', 'rent'] and rent_ticket.get('creator_user'):
        if not user:
            abort(401)
        elif user['id'] not in (rent_ticket.get('user', {}).get('id'), rent_ticket.get('creator_user', {}).get('id')) and not (set(user['role']) & set(['admin', 'jr_admin', 'support'])):
            abort(403)

    if rent_ticket["status"] not in ["draft", "to rent", "rent"]:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_rent_ticket_id")

    related_rent_ticket_list = f_app.i18n.process_i18n(currant_data_helper.get_related_rent_ticket_list(rent_ticket))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    rent_budget_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_budget'))

    is_favorited = f_app.user.favorite.is_favorited(rent_ticket_id, 'rent_ticket', user["id"] if user else None)

    publish_time = f_app.util.format_time(rent_ticket.get('time'))
    # TODO: Need to check if last modify time exists
    last_modified_time = f_app.util.format_time(rent_ticket.get('last_modified_time'))

    report = None
    if rent_ticket["property"].get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(rent_ticket["property"].get('report_id')))

    title = rent_ticket.get('title', _('出租房详情'))

    keywords = title + ',' + currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')) + ',' + rent_ticket["property"].get('city', {}).get('name', '') + ',' + ','.join(currant_util.BASE_RENT_KEYWORDS_ARRAY)

    # Title for display
    if not isinstance(title, six.string_types):
        title = six.text_type(title)
    if rent_ticket["property"].get('city', {}) and rent_ticket["property"].get('city', {}).get('name', ''):
        title += '-' + _(rent_ticket["property"].get('city', {}).get('name', ''))
    if rent_ticket["property"].get('country', {}) and rent_ticket["property"].get('country', {}).get('code', ''):
        title += '-' + _(currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')))
    description = rent_ticket.get('description', _('详情'))

    weixin = f_app.wechat.get_jsapi_signature()

    contact_info_already_fetched = len(list(f_app.order.search({
        "items.id": f_app.common.view_rent_ticket_contact_info_id,
        "ticket_id": rent_ticket_id,
        "user.id": user["id"],
    }))) > 0 if user else False

    display_location_mobile = currant_util.get_rent_property_address(rent_ticket, True)
    display_location_pc = currant_util.get_rent_property_address(rent_ticket)

    return currant_util.common_template("property_to_rent", rent=rent_ticket, rent_type_list=rent_type_list, rent_budget_list=rent_budget_list, report=report, is_favorited=is_favorited, publish_time=publish_time, last_modified_time=last_modified_time, title=title, description=description, keywords=keywords, weixin=weixin, contact_info_already_fetched=contact_info_already_fetched, related_rent_ticket_list=related_rent_ticket_list, display_location_mobile=display_location_mobile, display_location_pc=display_location_pc)


@f_get('/property-to-rent-digest/<rent_ticket_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
def property_to_rent_digest(rent_ticket_id):
    title = _('快来围观')
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])

    report = None
    if rent_ticket["property"].get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(rent_ticket["property"].get('report_id')))

    if rent_ticket.get('title'):
        title = _(rent_ticket.get('title', '')) + ', ' + title
    description = rent_ticket.get('description', '')

    keywords = currant_util.get_country_name_by_code(rent_ticket.get('country', {}).get('code', '')) + ',' + rent_ticket.get('city', {}).get('name', '') + ',' + ','.join(currant_util.BASE_RENT_KEYWORDS_ARRAY)

    return currant_util.common_template("property_to_rent_digest.html", rent=rent_ticket, title=title, description=description, keywords=keywords, report=report)


@f_get('/property-to-rent/create')
@currant_util.check_ip_and_redirect_domain
def property_to_rent_create():
    region_highlight_list = f_app.i18n.process_i18n(f_app.enum.get_all('region_highlight'))
    indoor_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('indoor_facility'))
    community_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('community_facility'))
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_period'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    landlord_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('landlord_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    property_type_list_without_new_property = lfilter(lambda item: item.get('slug') != 'new_property', property_type_list)
    rent = {}
    title = _('出租房源发布')
    description = _('洋房东英国大不列颠英格兰苏格兰伦敦快速便捷方便迅速上传发布登记房源房产广告出租找租客提交数据信息填写详情描述周边上传图片照片省时省力贴心安全快捷便利')
    keywords = _('洋房东,租房,出租,租房中介,找房子,短租,长租,租金,公寓,别墅,学区房,留学生租房,海外租房,英国出租,英国租房,伦敦租房,提交房源,上传房产,Youngfunding,for rent,to let,room to rent,property to rent,property,apartment,house,UK property,listing submission')
    return currant_util.common_template("property_to_rent_create", landlord_type_list=landlord_type_list, region_highlight_list=region_highlight_list, rent_period_list=rent_period_list, indoor_facility_list=indoor_facility_list, community_facility_list=community_facility_list, rent_type_list=rent_type_list,
                                        property_type_list=property_type_list, property_type_list_without_new_property=property_type_list_without_new_property, title=title, rent=rent, description=description, keywords=keywords)


@f_get('/property-to-rent/<rent_ticket_id:re:[0-9a-fA-F]{24}>/edit')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(check_role=True)
def property_to_rent_edit(rent_ticket_id, user):
    title = _('出租房源编辑')
    fuzzy_user_info = True
    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        fuzzy_user_info = False
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=fuzzy_user_info)[0])

    # 如果没有登录或者登录用户既不是房产的user也不是creator_user则跳转到首页
    if not (user and (user.get('id') == rent_ticket.get('user', {}).get('id') or user.get('id') == rent_ticket.get('creator_user', {}).get('id') or (set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"])))):
        redirect('/')

    keywords = title + ',' + currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')) + ',' + rent_ticket["property"].get('city', {}).get('name', '') + ',' + ','.join(currant_util.BASE_RENT_KEYWORDS_ARRAY)
    region_highlight_list = f_app.i18n.process_i18n(f_app.enum.get_all('region_highlight'))
    indoor_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('indoor_facility'))
    community_facility_list = f_app.i18n.process_i18n(f_app.enum.get_all('community_facility'))
    rent_period_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_period'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    landlord_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('landlord_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    property_type_list_without_new_property = lfilter(lambda item: item.get('slug') != 'new_property', property_type_list)
    return currant_util.common_template("property_to_rent_create", landlord_type_list=landlord_type_list, title=title, keywords=keywords, rent=rent_ticket, region_highlight_list=region_highlight_list, rent_period_list=rent_period_list,
                                        indoor_facility_list=indoor_facility_list, community_facility_list=community_facility_list, rent_type_list=rent_type_list, property_type_list=property_type_list, property_type_list_without_new_property=property_type_list_without_new_property)


@f_get('/property-to-rent/<rent_ticket_id:re:[0-9a-fA-F]{24}>/publish-success')
@currant_util.check_ip_and_redirect_domain
def property_to_rent_publish_success(rent_ticket_id):
    title = _('房源发布成功')
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])
    keywords = title + ',' + currant_util.get_country_name_by_code(rent_ticket["property"].get('country', {}).get('code', '')) + ',' + rent_ticket["property"].get('city', {}).get('name', '') + ',' + ','.join(currant_util.BASE_RENT_KEYWORDS_ARRAY)
    return currant_util.common_template("property_to_rent_publish_success", title=title, keywords=keywords, rent=rent_ticket)


@f_get('/payment-checkout/<rent_intention_ticket_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def payment_checkout(rent_intention_ticket_id):
    rent_intention_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_intention_ticket_id], fuzzy_user_info=True)[0])
    title = _('确认支付')
    if rent_intention_ticket.get('interested_rent_tickets')[0].get('title'):
        title = _(rent_intention_ticket.get('interested_rent_tickets')[0].get('title')) + '-' + title
        if rent_intention_ticket.get('interested_rent_tickets')[0].get('status') == 'rent':
            title = _('[已出租]') + title
        elif rent_intention_ticket.get('interested_rent_tickets')[0].get('status') == 'draft':
            title = _('[已下架]') + title
    return currant_util.common_template("payment_checkout", title=title, rent_intention_ticket=rent_intention_ticket)
