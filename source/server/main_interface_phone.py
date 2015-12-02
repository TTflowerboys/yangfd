# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from app import f_app
from libfelix.f_interface import f_get, template_gettext as _
import currant_util

logger = logging.getLogger(__name__)
f_app.dependency_register("qrcode", race="python")


# phone specific pages
@f_get('/requirement')
@currant_util.check_ip_and_redirect_domain
def requirement():
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    title = _('提交置业需求')
    return currant_util.common_template("requirement-phone", intention_list=intention_list, title=title)


@f_get('/requirement-rent')
@currant_util.check_ip_and_redirect_domain
def requirement_rent():
    title = _('提交租房需求')
    return currant_util.common_template("requirement_rent_phone", title=title)


@f_get('/rent-request')
@currant_util.check_ip_and_redirect_domain
def requirement_rent():
    title = _('提交求租咨询')
    return currant_util.common_template("rent_request_phone", title=title)


@f_get('/delegate-rent')
@currant_util.check_ip_and_redirect_domain
def delegate_rent():
    title = _('提交委托出租需求')
    return currant_util.common_template("delegate_rent_phone", title=title)


@f_get('/delegate-sale')
@currant_util.check_ip_and_redirect_domain
def delegate_sale():
    title = _('提交委托出售需求')
    return currant_util.common_template("delegate_sale_phone", title=title)


@f_get('/wechat_share')
@currant_util.check_ip_and_redirect_domain
def wechat_share():
    title = _('微信分享')
    return currant_util.common_template("wechat_share-phone", title=title)


@f_get('/how_it_works', params=dict(slug=str),)
@currant_util.check_ip_and_redirect_domain
def how_it_works(params):
    if params and "slug" in params:
        current_intention_title = params["slug"]
        for intention in f_app.enum.get_all('intention'):
            if intention.get('slug') == current_intention_title:
                current_intention = intention
                break
        else: current_intention = f_app.enum.get_all('intention')[0]
    else:
        current_intention = f_app.enum.get_all('intention')[0]
    current_intention = f_app.i18n.process_i18n(current_intention)
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    title = current_intention.get('value')
    description = current_intention.get('description', current_intention.get('value'))
    keywords = current_intention.get('value') + ',' + ','.join(currant_util.BASE_KEYWORDS_ARRAY)
    return currant_util.common_template("how_it_works-phone", intention_list=intention_list, current_intention=current_intention, title=title, description=description, keywords=keywords)


@f_get('/calculator')
@currant_util.check_ip_and_redirect_domain
def calculator():
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    title = _('房贷计算器')
    return currant_util.common_template("calculator-phone", intention_list=intention_list, title=title)
