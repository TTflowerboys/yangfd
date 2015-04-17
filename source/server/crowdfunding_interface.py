# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import bottle
from app import f_app
from libfelix.f_interface import f_get, f_post, static_file, template, request, response, redirect, html_redirect, error, abort, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)


@f_get('/crowdfunding/<property_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def crowdfunding_get(property_id):
    property = f_app.i18n.process_i18n(f_app.shop.item.output([property_id])[0])
    favorite_list = f_app.i18n.process_i18n(currant_data_helper.get_favorite_list('item'))
    related_property_list = f_app.i18n.process_i18n(currant_data_helper.get_related_property_list(property))

    report = None

    if property.get('zipcode_index') and property.get('country').get('slug') == 'GB':
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(property.get('zipcode_index')))

    title = _(property.get('name', '房产详情'))
    if property.get('city') and property.get('city').get('value'):
        title += ' ' + _(property.get('city').get('value'))
    if property.get('country') and property.get('country').get('value'):
        title += ' ' + _(property.get('country').get('value'))
    description = property.get('name', _('房产详情'))

    tags = []
    if 'intention' in property and property.get('intention'):
        tags = [item['value'] for item in property['intention'] if 'value' in item]

    # keywords = property.get('name', _('房产详情')) + ',' + property.get('country', {}).get('value', '') + ',' + property.get('city', {}).get('value', '') + ',' + ','.join(tags + currant_util.BASE_KEYWORDS_ARRAY)
    keywords = ""
    return currant_util.common_template("crowdfunding", property=property, favorite_list=favorite_list, related_property_list=related_property_list, report=report, title=title, description=description, keywords=keywords)


@f_get('/pdf_viewer/crowdfunding/<crowdfunding_id:re:[0-9a-fA-F]{24}>', params=dict(
    link=(str, True),
    filename=(str, True)
))
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
@f_app.user.login.check(force=True)
def crowdfunding_pdfviewer(user, crowdfunding_id, params):
    crowdfunding = f_app.i18n.process_i18n(f_app.shop.item.output([crowdfunding_id])[0])
    for material in crowdfunding.get('materials'):
        if material.get('link') == params["link"] and material.get('filename') == params['filename']:
            title = params["filename"].encode('utf-8')
            link = params["link"].encode('utf-8')
            return currant_util.common_template("pdf_viewer", link=link, title=title)

    return redirect('/404')


@f_get('/crowdfunding_list', params=dict(
    property_type=str,
    country=str,
    city=str,
))
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def crowdfunding_list(params):
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    investment_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('investment_type'))

    title = _('众筹列表-洋房东')
    return currant_util.common_template("crowdfunding_list",
                                        intention_list=intention_list,
                                        investment_type_list=investment_type_list,
                                        title=title
                                        )


@f_get('/user_finish_declare')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def user_finish_declare():
    title = _('用户声明')
    return currant_util.common_template("user_finish_declare", title=title)


@f_get('/user_finish_info')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def user_finish_info():
    title = _('补充个人信息')
    state_list = f_app.i18n.process_i18n(f_app.enum.get_all('state'))
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    return currant_util.common_template("user_finish_info", title=title, state_list=state_list, city_list=city_list)


@f_get('/user_finish_auth')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def user_finish_auth():
    title = _('确认真实身份')
    return currant_util.common_template("user_finish_auth", title=title)


@f_get('/user_finish_investment')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def user_finish_investment():
    title = _('确认投资信息')
    return currant_util.common_template("user_finish_investment", title=title)
