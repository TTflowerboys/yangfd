# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from bottle import response
from bson.objectid import ObjectId
from lxml import etree
from datetime import datetime
from hashlib import sha1
from libfelix.f_interface import f_get, f_post, static_file, template, request, redirect, error, abort, template_gettext as _
from six.moves import cStringIO as StringIO
from six.moves import urllib
import qrcode
import bottle
import logging
import calendar
import pygeoip
logger = logging.getLogger(__name__)
f_app.dependency_register("qrcode", race="python")
import currant_util
import currant_data_helper

BASE_KEYWORDS_ARRAY = ['洋房东', '海外置业', '楼盘', '公寓', '别墅', '学区房', '英国房产', '洋房东', '海外投资', '海外房产', '海外买房', '海外房地产', '海外房产投资', '英国房价', 'Youngfunding', 'investment', 'overseas investment', 'property', 'apartment', 'house', 'UK property']


def check_ip_and_redirect_domain(func):
    def __check_ip_and_redirect_domain_replace_func(*args, **kwargs):
        try:
            gi = pygeoip.GeoIP(f_app.common.geoip_data_file)
            country = gi.country_code_by_name(request.remote_route[0])
            host = request.urlparts[1]

            # Don't redirect dev & test
            if "bbtechgroup.com" not in host:
                # Special hack to remove "beta."
                request_url = request.url

                if country == "CN":
                    target_url = request_url.replace("youngfunding.co.uk", "yangfd.cn")
                    logger.debug("Visitor country detected:", country, "redirecting to yangfd.cn if not already. Host:", host, "target_url:", target_url)
                    assert host.endswith(("yangfd.com", "yangfd.cn")), redirect(target_url)

                elif country:
                    target_url = request_url.replace("yangfd.cn", "youngfunding.co.uk")
                    logger.debug("Visitor country detected:", country, "redirecting to youngfunding.co.uk if it's currently on yangfd.cn. Host:", host, "target_url:", target_url)
                    assert host.endswith(("yangfd.com", "youngfunding.co.uk")), redirect(target_url)

        except bottle.HTTPError:
            raise
        except IndexError:
            pass

        return func(*args, **kwargs)

    return __check_ip_and_redirect_domain_replace_func


def check_crowdfunding_ready(func):
    def __check_crowdfunding_ready_replace_func(*args, **kwargs):
        if not f_app.common.crowdfunding_ready:
            redirect("/")
        else:
            return func(*args, **kwargs)

    return __check_crowdfunding_ready_replace_func


def common_template(path, **kwargs):
    if 'title' not in kwargs:
        kwargs['title'] = _('洋房东')
    if 'description' not in kwargs:
        kwargs['description'] = _("我们专注于为投资人提供多样化的海外投资置业机会，以丰富的投资分析报告和专业的置业顾问助推您的海外投资之路。")
    if 'keywords' not in kwargs:
        kwargs['keywords'] = ",".join(BASE_KEYWORDS_ARRAY)
    if 'user' not in kwargs:
        kwargs['user'] = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields())
    if 'country_list' not in kwargs:
        kwargs['country_list'] = f_app.i18n.process_i18n(f_app.enum.get_all("country"))
    if 'budget_list' not in kwargs:
        kwargs['budget_list'] = f_app.i18n.process_i18n(f_app.enum.get_all('budget'))

    # setup page utils
    kwargs.setdefault("format_unit", currant_util.format_unit)
    kwargs.setdefault("fetch_image", currant_util.fetch_image)
    kwargs.setdefault("totimestamp", currant_util.totimestamp)
    return template(path, **kwargs)


@f_get('/')
@check_ip_and_redirect_domain
@f_app.user.login.check()
def default(user):
    property_list = []
    if not user:
        property_list = currant_data_helper.get_featured_property_list()
        for property in property_list:
            if "news_category" in property:
                property["related_news"] = currant_data_helper.get_property_related_news_list(property)
        property_list = f_app.i18n.process_i18n(property_list)

    homepage_ad_list = f_app.ad.get_all_by_channel("homepage")
    homepage_ad_list = f_app.i18n.process_i18n(homepage_ad_list)
    homepage_signedin_ad_list = f_app.ad.get_all_by_channel("homepage_signedin")
    homepage_signedin_ad_list = f_app.i18n.process_i18n(homepage_signedin_ad_list)
    announcement_list = currant_data_helper.get_announcement_list()
    announcement_list = f_app.i18n.process_i18n(announcement_list)
    news_list = currant_data_helper.get_featured_new_list()
    news_list = f_app.i18n.process_i18n(news_list)

    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))

    title = _('洋房东')
    return common_template(
        "index",
        title=title,
        property_list=property_list,
        homepage_ad_list=homepage_ad_list,
        homepage_signedin_ad_list=homepage_signedin_ad_list,
        announcement_list=announcement_list,
        news_list=news_list,
        intention_list=intention_list
    )


@f_get('/signup')
@check_ip_and_redirect_domain
def signup():
    return common_template("signup")


@f_get('/vip_sign_up')
@check_ip_and_redirect_domain
def vip_sign_up():
    return common_template("sign_up_vip")


@f_get('/signin')
@check_ip_and_redirect_domain
def signin():
    return common_template("signin")


@f_get('/intention')
@check_ip_and_redirect_domain
def intention():
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    return common_template("intention", intention_list=intention_list)


@f_get('/reset_password')
@check_ip_and_redirect_domain
def resetPassword():
    return common_template("reset_password")


@f_get('/region_report/<zipcode_index:re:[A-Z0-9]{2,3}>')
@check_ip_and_redirect_domain
def region_report(zipcode_index):
    report = currant_data_helper.get_report(zipcode_index)
    report = f_app.i18n.process_i18n(report)
    title = report.get('name') + _('街区分析报告')
    description = report.get('description', _('洋房东街区投资分析报告'))
    keywords = report.get('name') + ',' + u'街区投资分析报告' + ',' + ','.join(BASE_KEYWORDS_ARRAY)
    return common_template("region_report", report=report, title=title, description=description, keywords=keywords)


@f_get('/property_list', params=dict(
    property_type=str,
    country=str,
    city=str,
    budget=str,
    intention=str,
    bedroom_count=str,
    building_area=str
))
@check_ip_and_redirect_domain
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
                title += country.get('value') + ' '

    if "city" in params and len(params['city']):
        for city in city_list:
            if city.get('id') == str(params['city']):
                title += city.get('value') + ' '

    if "property_type" in params and len(params['property_type']):
        for property_type in property_type_list:
            if property_type.get('id') == str(params['property_type']):
                title += property_type.get('value') + ' '

    title += _('房产列表 洋房东')

    return common_template("property_list",
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
@check_ip_and_redirect_domain
def property_get(property_id):
    property = f_app.i18n.process_i18n(currant_data_helper.get_property_or_target_property(property_id))
    favorite_list = currant_data_helper.get_favorite_list('property')
    favorite_list = f_app.i18n.process_i18n(favorite_list)
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

    keywords = property.get('name', _('房产详情')) + ',' + property.get('country', {}).get('value', '') + ',' + property.get('city', {}).get('value', '') + ',' + ','.join(tags + BASE_KEYWORDS_ARRAY)
    return common_template("property", property=property, favorite_list=favorite_list, related_property_list=related_property_list, report=report, title=title, description=description, keywords=keywords)


@f_get('/pdf_viewer/property/<property_id:re:[0-9a-fA-F]{24}>', params=dict(
    link=(str, True),
))
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def pdfviewer(user, property_id, params):
    property = f_app.i18n.process_i18n(currant_data_helper.get_property_or_target_property(property_id))
    for brochure in property.get('brochure'):
        if brochure.get('url') == params["link"]:
            title = property.get('name', _('房产详情')) + ' PDF'
            link = params["link"].encode('utf-8')
            return common_template("pdf_viewer", link=link, title=title)

    return redirect('/404')


@f_get('/crowdfunding/<property_id:re:[0-9a-fA-F]{24}>')
@check_ip_and_redirect_domain
@check_crowdfunding_ready
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

    # keywords = property.get('name', _('房产详情')) + ',' + property.get('country', {}).get('value', '') + ',' + property.get('city', {}).get('value', '') + ',' + ','.join(tags + BASE_KEYWORDS_ARRAY)
    keywords = ""
    return common_template("crowdfunding", property=property, favorite_list=favorite_list, related_property_list=related_property_list, report=report, title=title, description=description, keywords=keywords)


@f_get('/pdf_viewer/crowdfunding/<crowdfunding_id:re:[0-9a-fA-F]{24}>', params=dict(
    link=(str, True),
    filename=(str, True)
))
@check_ip_and_redirect_domain
@check_crowdfunding_ready
@f_app.user.login.check(force=True)
def crowdfunding_pdfviewer(user, crowdfunding_id, params):
    crowdfunding = f_app.i18n.process_i18n(f_app.shop.item.output([crowdfunding_id])[0])
    for material in crowdfunding.get('materials'):
        if material.get('link') == params["link"] and material.get('filename') == params['filename']:
            title = params["filename"].encode('utf-8')
            link = params["link"].encode('utf-8')
            return common_template("pdf_viewer", link=link, title=title)

    return redirect('/404')


@f_get('/crowdfunding_list', params=dict(
    property_type=str,
    country=str,
    city=str,
))
@check_ip_and_redirect_domain
@check_crowdfunding_ready
def crowdfunding_list(params):
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    investment_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('investment_type'))

    title = _('众筹列表 洋房东')
    return common_template("crowdfunding_list",
                           intention_list=intention_list,
                           investment_type_list=investment_type_list,
                           title=title
                           )


@f_get('/user_finish_info')
@check_ip_and_redirect_domain
@check_crowdfunding_ready
def user_finish_info():
    title = _('补充个人信息')
    state_list = f_app.i18n.process_i18n(f_app.enum.get_all('state'))
    city_list = f_app.i18n.process_i18n(f_app.enum.get_all('city'))
    return common_template("user_finish_info", title=title, state_list=state_list, city_list=city_list)


@f_get('/user_finish_auth')
@check_ip_and_redirect_domain
@check_crowdfunding_ready
def user_finish_auth():
    title = _('确认真实身份')
    return common_template("user_finish_auth", title=title)


@f_get('/user_finish_investment')
@check_ip_and_redirect_domain
@check_crowdfunding_ready
def user_finish_investment():
    title = _('确认投资信息')
    return common_template("user_finish_investment", title=title)


@f_get('/news_list')
@check_ip_and_redirect_domain
def news_list():
    title = _('房产资讯')
    return common_template("news_list", title=title)


@f_get('/news/<news_id:re:[0-9a-fA-F]{24}>')
@check_ip_and_redirect_domain
def news(news_id):
    news = f_app.blog.post.output([news_id])[0]
    news = f_app.i18n.process_i18n(news)
    related_news_list = f_app.i18n.process_i18n(currant_data_helper.get_related_news_list(news))
    title = news.get('title')
    keywords = "new,UK news" + ",".join(BASE_KEYWORDS_ARRAY)

    if news.get('summary'):
        description = news.get('summary')
        return common_template("news", news=news, related_news_list=related_news_list, title=title, description=description, keywords=keywords)
    else:
        return common_template("news", news=news, related_news_list=related_news_list, title=title, keywords=keywords)


@f_get('/notice_list')
@check_ip_and_redirect_domain
def notice_list():
    title = _('网站公告')
    return common_template("notice_list", title=title)


@f_get('/guides')
@check_ip_and_redirect_domain
def guides():
    title = _('购房指南')
    return common_template("guides", title=title)


@f_get('/laws')
@check_ip_and_redirect_domain
def laws():
    title = _('法律法规')
    return common_template("laws", title=title)


@f_get('/about')
@check_ip_and_redirect_domain
def about():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "About Us"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/terms')
@check_ip_and_redirect_domain
def terms():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "YoungFunding Terms Of Use"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/about/marketing')
@check_ip_and_redirect_domain
def marketing():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "Marketing Cooperation"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/about/media')
@check_ip_and_redirect_domain
def media():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "Media Cooperation"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/partner')
@check_ip_and_redirect_domain
def partner():
    title = _('合作伙伴')
    return common_template("partner", title=title)


@f_get('/qa')
@check_ip_and_redirect_domain
@check_crowdfunding_ready
def qa():
    title = _('众筹投资问答')
    return common_template("qa", title=title)


@f_get('/user_settings')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_settings(user):
    title = _('账户信息')
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    return common_template("user_settings", user=user, title=title)


@f_get('/user_verify_email')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_email(user):
    title = _('验证邮箱')
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    return common_template("user_verify_email", user=user, title=title)


@f_get('/user_change_email')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_email(user):
    title = _('更改邮箱')

    return common_template("user_change_email", user=currant_data_helper.get_user_with_custom_fields(user), title=title)


@f_get('/user_change_password')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_password(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('更改密码')
    return common_template("user_change_password", user=user, title=title)


@f_get('/user_change_phone_1')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_phone_1(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('更改手机号')
    return common_template("user_change_phone_1", user=user, title=title)


@f_get('/user_change_phone_2')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_phone_2(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('更改手机号')
    return common_template("user_change_phone_2", user=user, title=title)


@f_get('/user_verify_phone_1')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_phone_1(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('验证手机号')
    return common_template("user_verify_phone_1", user=user, title=title)


@f_get('/user_verify_phone_2')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_phone_2(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('验证手机号')
    return common_template("user_change_phone_2", user=user, title=title)


@f_get('/user_favorites')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_favorites(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('我的收藏')
    favorite_list = currant_data_helper.get_favorite_list('property')
    favorite_list = f_app.i18n.process_i18n(favorite_list)
    return common_template("user_favorites", user=user, favorite_list=favorite_list, title=title)


@f_get('/user_crowdfunding')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_crowdfunding(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('海外众筹')
    favorite_list = currant_data_helper.get_favorite_list('item')
    favorite_list = f_app.i18n.process_i18n(favorite_list)
    return common_template("user_crowdfunding", user=user, favorite_list=favorite_list, title=title)


@f_get('/user_intentions')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_intentions(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    intention_ticket_list = currant_data_helper.get_intention_ticket_list(user)
    intention_ticket_status_list = f_app.enum.get_all('intention_ticket_status')
    for ticket in intention_ticket_list:
        for ticket_status in intention_ticket_status_list:
            if 'intention_ticket_status:' + ticket['status'] == ticket_status['slug']:
                ticket['status_presentation'] = ticket_status

    intention_ticket_list = f_app.i18n.process_i18n(intention_ticket_list)
    title = _('投资意向单')
    return common_template("user_intentions", user=user, intention_ticket_list=intention_ticket_list, title=title)


@f_get('/user_properties')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_properties(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    intention_ticket_list = currant_data_helper.get_bought_intention_ticket_list(user)
    intention_ticket_list = [i for i in intention_ticket_list if i.get("property")]
    intention_ticket_list = f_app.i18n.process_i18n(intention_ticket_list)

    title = _('我的房产')
    return common_template("user_properties", user=user, intention_ticket_list=intention_ticket_list, title=title)


@f_get('/user_messages')
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_messages(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    message_list = currant_data_helper.get_message_list(user)
    message_type_list = f_app.enum.get_all('message_type')

    for message in message_list:
        for message_type in message_type_list:
            if 'message_type:' + message['type'] == message_type['slug']:
                message['type_presentation'] = message_type
    message_list = f_app.i18n.process_i18n(message_list)
    title = _('消息')
    return common_template("user_messages", user=user, message_list=message_list, title=title)


@f_get('/verify_email_status')
@check_ip_and_redirect_domain
def verify_email_status():
    title = _('验证邮箱')
    return common_template("verify_email_status", title=title)


# phone specific pages


@f_get('/requirement')
@check_ip_and_redirect_domain
def requirement():
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    title = _('提交置业需求')
    return common_template("phone/requirement", intention_list=intention_list, title=title)


@f_get('/wechat_share')
@check_ip_and_redirect_domain
def wechat_share():
    title = _('微信分享')
    return common_template("phone/wechat_share", title=title)


@f_get('/how_it_works', params=dict(slug=str),)
@check_ip_and_redirect_domain
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
    keywords = current_intention.get('value') + ',' + ','.join(BASE_KEYWORDS_ARRAY)
    return common_template("phone/how_it_works", intention_list=intention_list, current_intention=current_intention, title=title, description=description, keywords=keywords)


@f_get('/calculator')
@check_ip_and_redirect_domain
def calculator():
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    title = _('房贷计算器')
    return common_template("phone/calculator", intention_list=intention_list, title=title)


@f_get('/user')
@check_ip_and_redirect_domain
def user():
    title = _('账户信息')
    return common_template("phone/user", title=title)


@f_get('/admin')
@check_ip_and_redirect_domain
def admin():
    return template("admin")


@f_get('/401')
@error(401)
def error_401(error=None):
    title = _('没有权限')
    return common_template("401", title=title)


@f_get('/404')
@error(404)
def error_404(error=None):
    title = _('找不到页面')
    return common_template("404", title=title)


@f_get('/500')
@error(500)
def error_500(error=None):
    title = _('服务器开小差了')
    return common_template("500", title=title)


@f_get("/static/<filepath:path>")
def static_route(filepath):
    return static_file(filepath, root="views/static")


@f_get("/qrcode/generate", params=dict(
    content=(str, True),
))
def qrcode_generate(params):
    img = qrcode.make(params["content"])
    output = StringIO()
    img.save(output)

    response.set_header(b"Content-Type", b"image/png")

    return output.getvalue()


@f_get("/image/fetch", params=dict(
    link=(str, True),
    news_id=str,
    property_id=str,
    content_id=str,
))
def images_proxy(params):
    def is_in_property(link, property):
        for k, v in property.get("reality_images", {}).iteritems():
            if isinstance(v, list):
                if link in v:
                    return True
        for k, v in property.get("surroundings_images", {}).iteritems():
            if isinstance(v, list):
                if link in v:
                    return True
        for k, v in property.get("effect_pictures", {}).iteritems():
            if isinstance(v, list):
                if link in v:
                    return True
        for k, v in property.get("indoor_sample_room_picture", {}).iteritems():
            if isinstance(v, list):
                if link in v:
                    return True
        for k, v in property.get("planning_map", {}).iteritems():
            if isinstance(v, list):
                if link in v:
                    return True
        for k, v in property.get("floor_plan", {}).iteritems():
            if isinstance(v, list):
                if link in v:
                    return True
        for main_house_type in property.get("main_house_types", []):
            for k, v in main_house_type.get("floor_plan", {}).iteritems():
                if link == v:
                    return True
        return False

    allowed = False
    ssl_bypass = False

    if "bbt-currant.s3.amazonaws.com" in params["link"] or "zoopla.co.uk" in params["link"] or "zoocdn.com" in params["link"]:
        params["link"] = params["link"]
        allowed = True
        ssl_bypass = True
        url_parsed = urllib.parse.urlparse(params["link"])
        url_parsed = url_parsed._replace(scheme="https")
        params["link"] = urllib.parse.urlunparse(url_parsed)

        # TODO: make this saner
        if "yangfd.com" not in request.urlparts[1] and "youngfunding.co.uk" not in request.urlparts[1] and "currant-test" not in request.urlparts[1]:
            params["link"] = params["link"].replace("bbt-currant.s3.amazonaws.com", "s3.yangfd.cn").replace("https://", "http://")

    elif "property_id" in params:
        property = f_app.property.get(params["property_id"])
        allowed = is_in_property(params["link"], property)
        if "target_property_id" in property:
            target_property = f_app.property.get(property["target_property_id"])
            allowed = is_in_property(params["link"], target_property)

    elif "news_id" in params:
        news = f_app.blog.post_get(params["news_id"])
        if params["link"] in news.get("images", []):
            allowed = True

    elif "content_id" in params:
        if params["link"] == f_app.ad.get(params["content_id"]).get("image"):
            allowed = True

    if not allowed:
        abort(40089, logger.warning("Invalid image source: not from existing property or news", exc_info=False))

    if f_app.common.use_ssl and not ssl_bypass:
        result = f_app.request(params["link"])
        if result.status_code == 200:
            response.set_header(b"Content-Type", b"image/png")
            return result.content
        else:
            abort(40000, logger.warning("Failed to fetch image source: timeout or non-exists."))
    else:
        bottle.redirect(params["link"])


@f_get('/reverse_proxy', params=dict(
    link=(str, True),
    content_type=str,
))
def reverse_proxy(params):
    result = f_app.request(params["link"])
    if result.status_code == 200:
        content = result.content
        ext = params["link"].split('.')[-1]
        if ext == "js":
            response.set_header(b"Content-Type", b"application/javascript")
        return content

    else:
        logger.debug("error in proxy %s", result)


@f_get("/logout", params=dict(
    return_url=str,
))
@check_ip_and_redirect_domain
def logout(params):
    return_url = params.pop("return_url", "/")
    f_app.user.login.logout()
    baseurl = "://".join(request.urlparts[:2])
    redirect(baseurl + return_url)


@f_get('/upload_image')
def upload_image():
    return template("upload_image")


@f_get('/sitemap_location.xml')
def sitemap():
    xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    domain = request.urlparts[1]
    xhtml = "http://www.w3.org/1999/xhtml"
    root = etree.Element("{%s}urlset" % xmlns, encoding="UTF-8", nsmap={'xhtml': xhtml, None: xmlns})
    logger.debug(etree.tostring(root))
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/signup" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/vip_sign_up" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/signin" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/about" % domain

    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541bf6616b809946e81c2bd3" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541c09286b8099496db84f56" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541d32eb6b80992a1f209045" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541d334d6b80992a1f209046" % domain
    for property in f_app.property.search({"status": {"$in": ["selling", "sold out"]}}, per_page=0):
        etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property/%s" % (domain, property)

    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/news_list" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/news_list?category=5417ecd46b80992d07638187" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/news_list?category=5417ecf86b80992d07638188" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/news_list?category=54180eeb6b80994dcea5600d" % domain
    for news in f_app.blog.post.search({"status": {"$ne": "deleted"}}, per_page=0):
        etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/news/%s" % (domain, news)

    for child in root:
        if f_app.common.i18n_sitemap_enable_locales:
            if "?" in child[0].text:
                etree.SubElement(child, "{http://www.w3.org/1999/xhtml}link", rel="alternate", hreflang="en", href="%s&_i18n=en_GB" % child[0].text)
                etree.SubElement(child, "{http://www.w3.org/1999/xhtml}link", rel="alternate", hreflang="en", href="%s&_i18n=zh_Hant_HK" % child[0].text)
            else:
                etree.SubElement(child, "{http://www.w3.org/1999/xhtml}link", rel="alternate", hreflang="en", href="%s?_i18n=en_GB" % child[0].text)
                etree.SubElement(child, "{http://www.w3.org/1999/xhtml}link", rel="alternate", hreflang="en", href="%s?_i18n=zh_Hant_HK" % child[0].text)
        if "?" in child[0].text:
            child[0].text = "%s&_i18n=zh_Hans_CN" % child[0].text
        else:
            child[0].text = "%s?_i18n=zh_Hans_CN" % child[0].text

    response.set_header(b"Content-Type", b"application/xml")
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8")


@f_get("/landregistry/<zipcode_index>/home_values", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_home_values(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_month_average_by_zipcode_index(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/landregistry/<zipcode_index>/value_trend", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_value_trend(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_month_average_by_zipcode_index_with_type(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/landregistry/<zipcode_index>/average_values", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_average_values(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_average_values_by_zipcode_index(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/landregistry/<zipcode_index>/value_ranges", params=dict(
    width=(int, 400),
    height=(int, 212),
    force_reload=(bool, False),
))
def landregistry_value_ranges(zipcode_index, params):
    size = [params["width"], params["height"]]
    zipcode_index_size = "%s|%d|%d" % (zipcode_index, size[0], size[1])
    result = f_app.landregistry.get_price_distribution_by_zipcode_index(zipcode_index_size, zipcode_index, size=size, force_reload=params["force_reload"])
    response.set_header(b"Content-Type", b"image/png")
    return result


@f_get("/robots.txt")
def robots_txt():
    return("User-agent: *\n"
           "Disallow: /static/\n"
           "Disallow: /admin/\n")


@f_get("/s3_raw/<filename>")
def s3_raw_reverse_proxy(filename):
    if filename.endswith(".jpg"):
        filename = filename[:-4]
    result = f_app.request("http://bbt-currant.s3.amazonaws.com/" + filename)
    return result.content


@f_get("/wechat_endpoint", params=dict(
    signature=str,
    timestamp=str,
    nonce=str,
    echostr=str,
))
def wechat_endpoint_verifier(params):
    if params["signature"] == sha1(params["nonce"] + params["timestamp"] + f_app.common.wechat_token).hexdigest():
        return params["echostr"]
    else:
        abort(400)


@f_post("/wechat_endpoint")
def wechat_endpoint():
    orig_xml = etree.fromstring(request.body.getvalue())
    message = {}
    for element in orig_xml.iter():
        message[element.tag] = element.text

    logger.debug("Parsed wechat message:", message)

    if f_app.common.use_ssl:
        schema = "https://"
    else:
        schema = "http://"

    return_str = ""

    def build_property_list_by_country(country_id):
        properties = f_app.i18n.process_i18n(f_app.property.output(f_app.property.search({
            "country._id": ObjectId(country_id),
            "status": {"$in": ["selling", "sold out"]},
        }, per_page=9, time_field="mtime")))

        root = etree.Element("xml")
        etree.SubElement(root, "ToUserName").text = message["FromUserName"]
        etree.SubElement(root, "FromUserName").text = message["ToUserName"]
        etree.SubElement(root, "CreateTime").text = str(calendar.timegm(datetime.utcnow().timetuple()))
        etree.SubElement(root, "MsgType").text = "news"
        etree.SubElement(root, "ArticleCount").text = str(len(properties) + 1)

        articles = etree.SubElement(root, "Articles")
        for n, property in enumerate(properties):
            item = etree.SubElement(articles, "item")

            title = ""
            if "city" in property and "value" in property["city"]:
                title += property["city"]["value"] + " "
            if "name" in property:
                title += property["name"]
            if "main_house_types" in property:
                lowest_price = None
                for house_type in property["main_house_types"]:
                    if "total_price" not in house_type:
                        continue
                    if lowest_price is None or float(house_type["total_price"]["value"]) < lowest_price:
                        lowest_price = float(house_type["total_price"]["value"])
                if lowest_price is not None:
                    title += "(起投%.2f万 预期年收益%s)" % (lowest_price / 10000, property.get("annual_return_estimated", ""))
            elif "total_price" in property:
                title += "(起投%.2f万 预期年收益%s)" % (float(property["total_price"]["value"]) / 10000, property.get("annual_return_estimated", ""))

            etree.SubElement(item, "Title").text = etree.CDATA(title)

            if "description" in property:
                etree.SubElement(item, "Description").text = etree.CDATA(property["description"])

            if "reality_images" in property and len(property["reality_images"]):
                picurl = property["reality_images"][0]
                if "bbt-currant.s3.amazonaws.com" in picurl:
                    picurl += "_thumbnail.jpg"
                # from urllib import quote
                etree.SubElement(item, "PicUrl").text = picurl.replace("bbt-currant.s3.amazonaws.com/", "yangfd.cn/s3_raw/")
                # etree.SubElement(item, "PicUrl").text = schema + request.urlparts[1] + "/reverse_proxy?link=" + quote(picurl)

            etree.SubElement(item, "Url").text = schema + request.urlparts[1] + "/property/" + property["id"]

        if len(properties):
            more = etree.SubElement(articles, "item")

            etree.SubElement(more, "Title").text = etree.CDATA("更多%s房产..." % (property["country"]["value"], ))
            etree.SubElement(more, "Url").text = schema + request.urlparts[1] + "/property_list?country=" + country_id

        return etree.tostring(root, encoding="UTF-8")

    if "MsgType" in message:
        if message["MsgType"] == "event":
            if message["Event"] == "CLICK":
                if message["EventKey"].startswith("property_by_country/"):
                    return_str = build_property_list_by_country(message["EventKey"][len("property_by_country/"):])

        elif message["MsgType"] == "text":
            if message["Content"] == "英国":
                # TODO: don't hardcode
                return_str = build_property_list_by_country("541c09286b8099496db84f56")

    response.set_header(b"Content-Type", b"application/xml")
    logger.debug("Responding to wechat:", return_str)
    return return_str
