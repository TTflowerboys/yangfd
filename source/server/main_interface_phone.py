# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import calendar
from datetime import datetime
from hashlib import sha1
from bson.objectid import ObjectId
from lxml import etree
from six.moves import cStringIO as StringIO
from six.moves import urllib
import qrcode
import bottle
from app import f_app
from libfelix.f_interface import f_get, f_post, static_file, template, request, response, redirect, html_redirect, error, abort, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)
f_app.dependency_register("qrcode", race="python")

# phone specific pages
@f_get('/requirement')
@currant_util.check_ip_and_redirect_domain
def requirement():
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    title = _('提交置业需求')
    return currant_util.common_template("requirement-phone", intention_list=intention_list, title=title)


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


@f_get('/user')
@currant_util.check_ip_and_redirect_domain
def user():
    title = _('账户信息')
    return currant_util.common_template("user-phone", title=title)

