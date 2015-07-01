# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from datetime import datetime
from functools import wraps
import bottle
from app import f_app
from libfelix.f_interface import template, request, redirect, template_gettext as _
import currant_data_helper
import lxml

logger = logging.getLogger(__name__)
BASE_KEYWORDS_ARRAY = ['洋房东', '海外置业', '楼盘', '公寓', '别墅', '学区房', '英国房产', '海外投资', '海外房产', '海外买房', '海外房地产', '海外房产投资', '英国房价', 'Youngfunding', 'investment', 'overseas investment', 'property', 'apartment', 'house', 'UK property']


icon_map = {
    'school_nearby_house': 'category_b',
    'off_plan_property': 'category_e',
    'existing_property': 'category_d',
    'rental_guarantee': 'category_a'
}


def format_unit(unit):
    if unit == 'foot ** 2':
        return 'foot<sup>2</sup>'
    elif unit == 'acre':
        return 'acre'
    elif unit == 'meter ** 2':
        return 'm<sup>2</sup>'
    elif unit == 'kilometer ** 2':
        return 'km<sup>2</sup>'
    else:
        return unit


# http://stackoverflow.com/questions/8777753/converting-datetime-date-to-utc-timestamp-in-python
def totimestamp(dt, epoch=datetime(1970, 1, 1)):
    td = dt - epoch
    # return td.total_seconds()
    return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10 ** 6) / 1e6


def fetch_image(image, **kwargs):
    if 'thumbnail' in kwargs and kwargs['thumbnail'] is True:
        image += '_thumbnail'
    # if request.ssl:
    #     image.replace("http://", "https://")

    if b"MicroMessenger" in request.get_header('User-Agent'):
        image = image.replace("bbt-currant.s3.amazonaws.com/", "yangfd.cn/s3_raw/")

    return image


def is_mobile_client():
    return b"currant" in request.headers.get('User-Agent').lower()


def check_ip_and_redirect_domain(func):
    @wraps(func)
    def __check_ip_and_redirect_domain_replace_func(*args, **kwargs):
        try:
            country = request.ip_country
            host = request.urlparts[1]

            # Don't redirect dev & test
            if "yangfd" in host or "youngfunding" in host:
                # Special hack to remove "beta."
                request_url = request.url

                if country == "CN" or b"MicroMessenger" in request.get_header('User-Agent'):
                    target_url = request_url.replace("youngfunding.co.uk", "yangfd.com")
                    logger.debug("Visitor country detected:", country, "redirecting to yangfd.com if not already. Host:", host, "target_url:", target_url)
                    assert host.endswith(("yangfd.com", "yangfd.cn")), redirect(target_url)

        except bottle.HTTPError:
            raise
        except IndexError:
            pass

        return func(*args, **kwargs)

    return __check_ip_and_redirect_domain_replace_func


def check_crowdfunding_ready(func):
    @wraps(func)
    def __check_crowdfunding_ready_replace_func(*args, **kwargs):
        if not f_app.common.crowdfunding_ready:
            redirect("/")
        else:
            return func(*args, **kwargs)

    return __check_crowdfunding_ready_replace_func


def get_country_list():
    return map(lambda country: {"_country": True, "code": country}, f_app.common.country_list)


def get_country_name_by_code(code):
    countryMap = {
        "CN": "中国",
        "GB": "英国",
        "US": "美国",
        "IN": "印度",
        "RU": "俄罗斯",
        "JP": "日本",
        "DE": "德国",
        "FR": "法国",
        "IT": "意大利",
        "ES": "西班牙",
        "HK": "香港"
    }
    if code:
        return countryMap[code]
    else:
        return ""


def get_phone_numbers(use="display"):
    if use == "display":
        CN = "400-0926-433"
        GB = "(0)2030402258"
    elif use == "link":
        CN = "4000926433"
        GB = "02030402258"
    elif use == "country":
        CN = "CN"
        GB = "GB"
    elif use == "country_name":
        CN = get_country_name_by_code("CN")
        GB = get_country_name_by_code("GB")
    else:
        raise NotImplementedError

    try:
        if request.ip_country == "CN":
            return [CN, GB]

    except IndexError:
        pass

    return [GB, CN]


def clear_html_tags(content):
    return lxml.html.fromstring(content).text_content()


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
        kwargs['country_list'] = get_country_list()
    if 'budget_list' not in kwargs:
        kwargs['budget_list'] = f_app.i18n.process_i18n(f_app.enum.get_all('budget'))
    if 'occupation_list' not in kwargs:
        kwargs['occupation_list'] = f_app.i18n.process_i18n(f_app.enum.get_all('occupation'))

    # setup page utils
    kwargs.setdefault("format_unit", format_unit)
    kwargs.setdefault("fetch_image", fetch_image)
    kwargs.setdefault("totimestamp", totimestamp)
    kwargs.setdefault("is_mobile_client", is_mobile_client)
    kwargs.setdefault("get_country_name_by_code", get_country_name_by_code)
    kwargs.setdefault("get_phone_numbers", get_phone_numbers)
    kwargs.setdefault("clear_html_tags", clear_html_tags)
    return template(path, **kwargs)
