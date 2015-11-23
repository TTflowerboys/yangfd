# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import calendar
from datetime import datetime
from datetime import timedelta
from hashlib import sha1
from lxml import etree
from six.moves import cStringIO as StringIO
from six.moves import urllib
try:
    import qrcode
except ImportError:
    pass
import bottle
from bson.objectid import ObjectId
from app import f_app
from libfelix.f_interface import f_api, f_get, f_post, static_file, template, request, response, redirect, html_redirect, error, abort, template_gettext as _
import currant_util
import currant_data_helper
from libfelix.f_interface import f_experiment
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.writer.excel import save_virtual_workbook
from pytz import timezone
import pytz
from bson.code import Code
f_experiment()

logger = logging.getLogger(__name__)
f_app.dependency_register("qrcode", race="python")


@f_get('/', params=dict(
    _i18n=str
))
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check()
def default(user, params):
    property_list = []
    homepage_ad_list = []

    if user:
        homepage_ad_list = f_app.ad.get_all_by_channel("homepage_signedin")
        homepage_ad_list = f_app.i18n.process_i18n(homepage_ad_list)
    else:
        homepage_ad_list = f_app.ad.get_all_by_channel("homepage")
        homepage_ad_list = f_app.i18n.process_i18n(homepage_ad_list)
        property_list = currant_data_helper.get_featured_property_list()
        for property in property_list:
            if "news_category" in property:
                property["related_news"] = currant_data_helper.get_property_related_news_list(property)
        property_list = f_app.i18n.process_i18n(property_list)

    news_list = currant_data_helper.get_featured_new_list()
    news_list = f_app.i18n.process_i18n(news_list)

    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))

    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    property_country_list = currant_util.get_country_list()

    property_city_list = []
    geonames_params = dict({
        "feature_code": {"$in": ["PPLC", "PPLA", "PPLA2"]},
        "country": "GB"
    })
    property_city_list = f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(geonames_params, per_page=-1))

    title = _('洋房东')
    lang = getattr(f_app.i18n, "get_gettext")("web").lang
    if lang == "en_GB":
        homepage_ad_list = f_app.ad.get_all_by_channel("homepage_uk")
        homepage_ad_list = f_app.i18n.process_i18n(homepage_ad_list)
        return currant_util.common_template(
            "index_en",
            title=title,
            property_list=property_list,
            homepage_ad_list=homepage_ad_list,
            news_list=news_list,
            intention_list=intention_list,
            property_country_list=property_country_list,
            property_city_list=property_city_list,
            rent_type_list=rent_type_list,
            property_type_list=property_type_list,
            icon_map=currant_util.icon_map
        )
    else:
        return currant_util.common_template(
            "index",
            title=title,
            property_list=property_list,
            homepage_ad_list=homepage_ad_list,
            news_list=news_list,
            intention_list=intention_list,
            property_country_list=property_country_list,
            property_city_list=property_city_list,
            rent_type_list=rent_type_list,
            property_type_list=property_type_list,
            icon_map=currant_util.icon_map
        )


@f_get('/signup')
@currant_util.check_ip_and_redirect_domain
def signup():
    title = _('注册')
    return currant_util.common_template("signup", title=title)


@f_get('/verify-phone')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def verify_phone(user):
    title = _('手机验证')
    return currant_util.common_template("verify_phone", title=title)


@f_get('/vip_sign_up')
@currant_util.check_ip_and_redirect_domain
def vip_sign_up():
    title = _('注册')
    return currant_util.common_template("sign_up_vip", title=title)


@f_get('/signin')
@currant_util.check_ip_and_redirect_domain
def signin():
    title = _('登录')
    return currant_util.common_template("signin", title=title)


@f_get('/intention')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
# @currant_util.check_phone_verified_and_redirect_domain
def intention(user):
    title = _('选择服务需求')
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    rent_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('rent_type'))
    property_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('property_type'))
    user_type_list = f_app.i18n.process_i18n(f_app.enum.get_all('user_type'))
    property_country_list = currant_util.get_country_list()
    country = "GB"
    geonames_params = dict({
        "feature_code": {"$in": ["PPLC", "PPLA", "PPLA2"]},
        "country": country
    })
    property_city_list = f_app.geonames.gazetteer.get(f_app.geonames.gazetteer.search(geonames_params, per_page=-1))
    return currant_util.common_template("intention", intention_list=intention_list, title=title, icon_map=currant_util.icon_map, rent_type_list=rent_type_list, property_type_list=property_type_list, property_country_list=property_country_list, property_city_list=property_city_list, user_type_list=user_type_list)


@f_get('/reset_password', '/reset-password')
@currant_util.check_ip_and_redirect_domain
def reset_password():
    title = _('重置密码')
    return currant_util.common_template("reset_password", title=title)


@f_get('/reset_password_phone', '/reset-password-phone')
@currant_util.check_ip_and_redirect_domain
def reset_password_phone():
    title = _('使用短信验证码重置密码')
    return currant_util.common_template("reset_password_phone", title=title)


@f_get('/reset_password_email_1', '/reset-password-email-1')
@currant_util.check_ip_and_redirect_domain
def reset_password_email_1():
    title = _('使用绑定邮箱重置密码')
    return currant_util.common_template("reset_password_email_1", title=title)


@f_get('/reset_password_email_2', '/reset-password-email-2', params=dict(
    user_id=str,
    code=str
))
@currant_util.check_ip_and_redirect_domain
def reset_password_email_2(params):
    title = _('使用绑定邮箱重置密码')
    return currant_util.common_template("reset_password_email_2", title=title, user_id=params['user_id'], code=params['code'])


@f_get('/property-for-sale/create')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def property_for_sale_create():
    title = _('二手房出售')
    return currant_util.common_template("property_for_sale_create", title=title)


@f_get('/property-for-sale/publish')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def property_for_sale_publish():
    title = _('出售预览')
    return currant_util.common_template("property_for_sale_publish", title=title)


@f_get('/host-contact-request/<rent_ticket_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(check_role=True)
def rent_ticket_get(rent_ticket_id, user):
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])
    if rent_ticket["status"] not in ["draft", "to rent"]:
        assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_rent_ticket_id")

    # report = None
    # if rent_ticket.get('zipcode_index') and rent_ticket.get('country').get('code') == 'GB':
    #     report = f_app.i18n.process_i18n(currant_data_helper.get_report(rent_ticket.get('zipcode_index')))

    title = _('房东联系方式')
    contact_info_already_fetched = len(f_app.order.search({
        "items.id": f_app.common.view_rent_ticket_contact_info_id,
        "ticket_id": rent_ticket_id,
        "user.id": user["id"],
    })) > 0 if user else False

    private_contact_methods = rent_ticket.get('creator_user', {}).get('private_contact_methods', [])
    private_contact_methods = [] if private_contact_methods is None else private_contact_methods
    return currant_util.common_template("host_contact_request-phone", rent=rent_ticket, title=title, contact_info_already_fetched=contact_info_already_fetched, private_contact_methods=private_contact_methods)


@f_get('/wechat-poster/<rent_ticket_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
def wechat_poster(rent_ticket_id):
    title = _('快来围观')
    rent_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_ticket_id], fuzzy_user_info=True)[0])

    report = None
    if rent_ticket["property"].get('report_id'):
        report = f_app.i18n.process_i18n(currant_data_helper.get_report(rent_ticket["property"].get('report_id')))

    # if rent_ticket["status"] not in ["draft", "to rent"]:
    # assert user and set(user["role"]) & set(["admin", "jr_admin", "operation", "jr_operation"]), abort(40300, "No access to specify status or target_rent_ticket_id")

    if rent_ticket.get('title'):
        title = _(rent_ticket.get('title', '')) + ', ' + title
    description = rent_ticket.get('description', '')

    keywords = currant_util.get_country_name_by_code(rent_ticket.get('country', {}).get('code', '')) + ',' + rent_ticket.get('city', {}).get('name', '') + ','.join(currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields())

    if rent_ticket['status'] not in ['to rent', 'rent'] and rent_ticket.get('creator_user'):
        if not user:
            redirect('/401')
        elif user['id'] not in (rent_ticket.get('user', {}).get('id'), rent_ticket.get('creator_user', {}).get('id')) and not (set(user['role']) & set(['admin', 'jr_admin', 'support'])):
            redirect('/403')

    return currant_util.common_template("wechat_poster", rent=rent_ticket, title=title, description=description, keywords=keywords, weixin=weixin, report=report)


@f_get('/wechat-poster/<rent_ticket_id:re:[0-9a-fA-F]{24}>/image')
def wechat_poster_image(rent_ticket_id):
    from libfelix.f_html2png import html2png
    response.set_header(b"Content-Type", b"image/png")
    return html2png("://".join(request.urlparts[:2]) + "/wechat-poster/" + rent_ticket_id, width=480, height=800, url=True)


@f_get('/admin')
@currant_util.check_ip_and_redirect_domain
def admin():
    return template("admin")


@error(401)
@f_app.user.login.check()
def error401_redirect(error, user):
    return html_redirect("/signin?error_code=40100&from=" + urllib.parse.quote(request.url))


@f_get('/401')
@error(401)
def error_401(error=None):
    title = _('没有访问该页面的权限')
    return currant_util.common_template("401", title=title)


@f_get('/403')
@error(403)
def error_403(error=None):
    title = _('无法访问该页面')
    return currant_util.common_template("403", title=title)


@f_get('/404')
@error(404)
def error_404(error=None):
    title = _('找不到页面')
    return currant_util.common_template("404", title=title)


@f_get('/500')
@error(500)
def error_500(error=None):
    title = _('服务器开小差了')
    return currant_util.common_template("500", title=title)


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
@currant_util.check_ip_and_redirect_domain
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
    # todo country需要改为code
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541bf6616b809946e81c2bd3" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541c09286b8099496db84f56" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541d32eb6b80992a1f209045" % domain
    etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property_list?country=541d334d6b80992a1f209046" % domain
    for property in f_app.property.search({"status": {"$in": ["selling", "sold out"]}}, per_page=0):
        etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property/%s" % (domain, property)
    for ticket in f_app.ticket.search({"status": {"$in": ["to rent"]}, "type": "rent"}, per_page=0):
        etree.SubElement(etree.SubElement(root, "url"), "loc").text = "http://%s/property-to-rent/%s" % (domain, ticket)

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


@f_get("/robots.txt")
def robots_txt():
    if "currant-test" in request.urlparts[1]:
        return("User-agent: *\n"
               "Disallow: /\n")

    return("User-agent: *\n"
           "Disallow: /static/\n"
           "Disallow: /admin/\n")


@f_get("/s3_raw/<filename>")
def s3_raw_reverse_proxy(filename):
    if filename.endswith(".jpg"):
        filename = filename[:-4]
    result = f_app.request("http://bbt-currant.s3.amazonaws.com/" + filename)
    return result.content


@f_post("/sendgrid_get_event_endpoint")
def sendgrid_get_event():
    email_event = request.json
    for single_event in email_event:
        # logger.debug(json.dumps(single_event))
        f_app.email.status.email_status_append(single_event)


@f_post("/sendcloud_get_event_endpoint")
def sendcloud_get_event():
    email_event = request.json
    for single_event in email_event:
        f_app.email.status.email_status_append(single_event)


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

    def common_root(func):
        def __common_root_replace_func(*args, **kwargs):
            root = etree.Element("xml")
            etree.SubElement(root, "ToUserName").text = message["FromUserName"]
            etree.SubElement(root, "FromUserName").text = message["ToUserName"]
            etree.SubElement(root, "CreateTime").text = str(calendar.timegm(datetime.utcnow().timetuple()))
            func(*args, root=root, **kwargs)
            return etree.tostring(root, encoding="UTF-8")

        return __common_root_replace_func

    @common_root
    def text_reply(text, root):
        etree.SubElement(root, "MsgType").text = etree.CDATA("text")
        etree.SubElement(root, "Content").text = etree.CDATA(text)

    @common_root
    def transfer_customer_service(root):
        etree.SubElement(root, "MsgType").text = etree.CDATA("transfer_customer_service")

    @common_root
    def build_property_list_by_country(country, root):
        if len(country) == 24:
            country = f_app.enum.get(country).get("slug")

        properties = f_app.i18n.process_i18n(f_app.property.output(f_app.property.search({
            "country.code": country,
            "status": {"$in": ["selling", "sold out"]},
            "user_generated": {"$ne": True},
        }, per_page=9, time_field="mtime")))

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
                etree.SubElement(item, "PicUrl").text = picurl.replace("bbt-currant.s3.amazonaws.com/", "yangfd.com/s3_raw/")
                # etree.SubElement(item, "PicUrl").text = schema + request.urlparts[1] + "/reverse_proxy?link=" + quote(picurl)

            etree.SubElement(item, "Url").text = schema + request.urlparts[1] + "/property/" + property["id"]

        if len(properties):
            more = etree.SubElement(articles, "item")

            etree.SubElement(more, "Title").text = etree.CDATA("更多%s房产..." % (currant_util.get_country_name_by_code(property["country"]["code"]), ))
            etree.SubElement(more, "Url").text = schema + request.urlparts[1] + "/property_list?country=" + country

    if "MsgType" in message:
        if message["MsgType"] == "event":
            if message["Event"] == "CLICK":
                if message["EventKey"].startswith("property_by_country/"):
                    return_str = build_property_list_by_country(message["EventKey"][len("property_by_country/"):])

            elif message["Event"] == "subscribe":
                return_str = text_reply(
                    "感谢您关注洋房东微信号\n"
                    "我们将为你带来：\n"
                    "最实时的英国房产资讯\n"
                    "最有趣的房产新闻\n"
                    "最专业的房产解读\n"
                    "记得每天点开洋房东的消息看一看哦！"
                )

        elif message["MsgType"] == "text":
            return_str = transfer_customer_service()

            # Disabled
            if False and message["Content"] == "英国":
                # TODO: don't hardcode
                return_str = build_property_list_by_country("541c09286b8099496db84f56")

    response.set_header(b"Content-Type", b"application/xml")
    logger.debug("Responding to wechat:", return_str)
    return return_str


@f_get('/app-download')
@currant_util.check_ip_and_redirect_domain
def app_download():
    if any(pattern in request.get_header('User-Agent') for pattern in (b'iPhone', b'iPod', b'iPad')) and b"MicroMessenger" not in request.get_header('User-Agent'):
        redirect('https://itunes.apple.com/cn/app/yang-fang-dong-ying-guo-zu/id980469674')
    weixin = f_app.wechat.get_jsapi_signature()
    title = _('洋房东APP下载页')
    return currant_util.common_template("app_download", title=title, weixin=weixin)


@f_get("/beta-app-download")
@currant_util.check_ip_and_redirect_domain
def beta_app_download():
    redirect('https://itunes.apple.com/cn/app/yang-fang-dong-ying-guo-zu/id980469674')


@f_get("/track", "/track.png", "/track/<ticket_id>/<property_id>/<image_type>.png", params=dict(
    ticket_id=ObjectId,
    property_id=ObjectId,
    image_type=(str, "1px"),
))
def track(params, ticket_id=None, property_id=None, image_type=None):
    """
    ``image_type`` should be ``1px`` or ``logo``.
    """

    if ticket_id is not None and ticket_id != "none":
        params["ticket_id"] = ObjectId(ticket_id)

    if property_id is not None and property_id != "none":
        params["property_id"] = ObjectId(property_id)

    if image_type is not None:
        params["image_type"] = image_type

    params["log_type"] = "share_visit"

    assert {"property_id", "ticket_id"} & set(params), abort(40000, "No track target specified")

    f_app.log.add(params)

    if params["image_type"] == "1px":
        return static_file("images/1px.png", root="views/static")
    elif params["image_type"] == "logo":
        return static_file("images/logo/logo.png", root="views/static")
    else:
        raise NotImplementedError


@f_get('/rental-available')
@currant_util.check_ip_and_redirect_domain
def rental_available():
    # issue #6990
    title = _('洋房东租房服务')
    return currant_util.common_template("rental_available", title=title)


@f_get('/rent-intention/<rent_intention_ticket_id:re:[0-9a-fA-F]{24}>/edit')
@currant_util.check_ip_and_redirect_domain
def rent_intention_edit(rent_intention_ticket_id):

    title = _('求租意向单编辑')
    rent_intention_ticket = f_app.i18n.process_i18n(f_app.ticket.output([rent_intention_ticket_id], fuzzy_user_info=True)[0])
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields())
    if user.get('id') != rent_intention_ticket.get('creator_user', {}).get('id'):
        redirect('/')

    return currant_util.common_template("rent_intention_edit", title=title, rent_intention_ticket=rent_intention_ticket)


@f_get('/test-wx-share')
@currant_util.check_ip_and_redirect_domain
def test_wx_share():
    title = _('测试微信分享功能')
    return currant_util.common_template("test_wx_share", title=title)


@f_get('/test-wx-share-remote')
@currant_util.check_ip_and_redirect_domain
def test_wx_share_remote():
    title = _('测试微信分享功能(js-sdk在远程)')
    return currant_util.common_template("test_wx_share_remote", title=title)


@f_api('/aggregation-general')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def aggregation_general(user):
    value = {}
    with f_app.mongo() as m:
        value.update({"aggregation_user_total": m.users.count()})
        cursor = m.users.aggregate(
            [
                {'$match': {'register_time': {'$exists': 'true'}}},
                {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}}}
            ]
        )
        if cursor.alive:
            value.update({"aggregation_register_user_total": cursor.next()['totalUsersCount']})
        else:
            value.update({"aggregation_register_user_total": 0})
        cursor.close()
        cursor = m.users.aggregate(
            [
                {"$unwind": "$user_type"},
                {"$group": {"_id": "$user_type", "count": {"$sum": 1}}}
            ]
        )
        user_type = []
        for document in cursor:
            user_type.append({"type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                              "total": document['count']})
        cursor.close()
        value.update({"aggregation_user_type": user_type})
    return value


@f_api('/aggregation-rent-ticket')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def aggregation_rent_ticket(user):
    value = {}
    with f_app.mongo() as m:
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent"}},
                {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
            ]
        )
        value.update({"aggregation_rent_ticket_total": cursor.next()['count']})
        cursor.close()
        cursor = m.log.aggregate(
            [
                {'$match': {'route': '/api/1/rent_ticket/add'}},
                {'$group': {'_id': None, 'count': {'$sum': 1}}}
            ]
        )
        value.update({"aggregation_rent_ticket_create_total": cursor.next()['count']})
        cursor.close()
        cursor = m.log.aggregate(
            [
                {'$match': {'route': '/api/1/rent_ticket/add', 'useragent': {'$regex': '.*currant.*'}}},
                {'$group': {'_id': None, 'count': {'$sum': 1}}}
            ]
        )
        value.update({"aggregation_rent_ticket_create_total_from_mobile": cursor.next()['count']})
        value.update({"aggregation_rent_ticket_create_total_from_mobile_ratio": value['aggregation_rent_ticket_create_total_from_mobile']*1.0/value['aggregation_rent_ticket_create_total']})
        cursor.close()
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent"}},
                {'$group': {'_id': "$status", 'count': {'$sum': 1}}}
            ]
        )
        status_dic = {
            'rent': '已出租',
            'to rent': '发布中',
            'draft': '草稿',
            'deleted': '已删除'
        }
        aggregation_rent_ticket_status = []
        for document in cursor:
            aggregation_rent_ticket_status.append({"status": status_dic[document['_id']],
                                                   "total": document['count']})
        cursor.close()
        value.update({"aggregation_rent_ticket_status": aggregation_rent_ticket_status})

        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent"}},
                {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
            ]
        )
        aggregation_rent_ticket_type = []
        for document in cursor:
            if(document['_id']):
                aggregation_rent_ticket_type.append({"type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                                                     "total": document['count']})
        value.update({"aggregation_rent_ticket_type": aggregation_rent_ticket_type})
        cursor.close()
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent", 'status': "to rent"}},
                {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
            ]
        )
        aggregation_rent_ticket_type_available = []
        for document in cursor:
            if(document['_id']):
                aggregation_rent_ticket_type_available.append({"type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                                                               "total": document['count']})
        value.update({"aggregation_rent_ticket_type_available": aggregation_rent_ticket_type_available})
        cursor.close()
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent", 'status': "rent"}},
                {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
            ]
        )
        aggregation_rent_ticket_type_rent = []
        for document in cursor:
            if(document['_id']):
                aggregation_rent_ticket_type_rent.append({"type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                                                          "total": document['count']})
        cursor.close()
        value.update({"aggregation_rent_ticket_type_rent": aggregation_rent_ticket_type_rent})
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent", 'status': "to rent"}},
                {'$group': {'_id': "$landlord_type", 'count': {'$sum': 1}}}
            ]
        )
        aggregation_landlord_type_has_available_rent_ticket = []
        for document in cursor:
            if(document['_id']):
                aggregation_landlord_type_has_available_rent_ticket.append({"type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                                                                            "total": document['count']})
        cursor.close()
        value.update({"aggregation_landlord_type_has_available_rent_ticket": aggregation_landlord_type_has_available_rent_ticket})
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent", 'status': "to rent", 'rent_type._id': ObjectId('55645cf5666e3d0f57d6e284')}},
                {'$group': {'_id': "$landlord_type", 'count': {'$sum': 1}}}
            ]
        )
        aggregation_landlord_type_has_available_whole = []

        for document in cursor:
            if(document['_id']):
                aggregation_landlord_type_has_available_whole.append({"type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                                                                      "total": document['count']})
        cursor.close()
        value.update({"aggregation_landlord_type_has_available_whole": aggregation_landlord_type_has_available_whole})

        # aggregation_rent_ticket_shortest_rent_period TODO

        cursor = m.tickets.aggregate(
            [
                {'$match': {
                    'type': "rent",
                    'status': "to rent"
                    }},
                {'$group': {'_id': "$minimum_rent_period", 'count': {'$sum': 1}}}
            ]
        )

        period_count = {
            'short': 0,
            'short_middle': 0,
            'middle_long': 0,
            'long': 0,
            'extra_long': 0
        }

        def covert_to_month(period):
            if(period['unit'] == 'week'):
                period['value'] = float(period['value'])/4
            if(period['unit'] == 'day'):
                period['value'] = float(period['value'])/31
            if(period['unit'] == 'year'):
                period['value'] = float(period['value'])*12
            else:
                period['value'] = float(period['value'])
            return period

        for document in cursor:
            if(document['_id']):
                period = covert_to_month(document['_id'])
                if(period['value'] < 1.0):
                    period_count['short'] += document['count']
                if(period['value'] >= 1.0 and period['value'] < 3.0):
                    period_count['short_middle'] += document['count']
                if(period['value'] >= 3.0 and period['value'] < 6.0):
                    period_count['middle_long'] += document['count']
                if(period['value'] >= 6.0 and period['value'] < 12.0):
                    period_count['long'] += document['count']
                if(period['value'] >= 12.0):
                    period_count['extra_long'] += document['count']
        sample_text = {
            'short': 'less than 1 month',
            'short_middle': '1 month ~ 3 month',
            'middle_long': '3 month ~ 6 month',
            'long': '6 month ~ 12 month',
            'extra_long': 'longer than 12 month'
        }
        aggregation_rent_ticket_shortest_rent_period = []
        for rang in period_count:
            aggregation_rent_ticket_shortest_rent_period.append({"period": sample_text[rang],
                                                                 "total": period_count[rang]})
        value.update({"aggregation_rent_ticket_shortest_rent_period": aggregation_rent_ticket_shortest_rent_period})
        cursor.close()

    return value


@f_api('/aggregation-rent-intention-ticket')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def aggregation_rent_intention_ticket(user):
    value = {}
    with f_app.mongo() as m:
        value.update({"aggregation_rent_intention_total": m.tickets.find({'type': "rent_intention"}).count()})
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent_intention"}},
                {'$group': {'_id': '$city', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
        )
        aggregation_rent_intention_total_city = []
        for document in cursor:
            aggregation_rent_intention_total_city.append({
                "city": f_app.geonames.gazetteer.get(document['_id']['_id'])['name'],
                "total": document['count']
            })
        cursor.close()
        value.update({"aggregation_rent_intention_total_city": aggregation_rent_intention_total_city})
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent_intention", 'city._id': ObjectId('555966cd666e3d0f578ad2cf')}},
                {'$group': {'_id': "$rent_type", 'count': {'$sum': 1}}}
            ]
        )
        aggregation_rent_intention_type_london = []
        for document in cursor:
            if(document['_id']):
                aggregation_rent_intention_type_london.append({
                    "type": f_app.enum.get(document['_id']['_id'])['value']['zh_Hans_CN'],
                    "total": document['count']
                })
        cursor.close()
        value.update({"aggregation_rent_intention_type_london": aggregation_rent_intention_type_london})

        target_budget_currency = 'GBP'
        target_budget = {'min': 200.0}
        budget_filter = []

        for currency in f_app.common.currency:
            condition = {}
            conditions = {}
            if currency == target_budget_currency:
                if 'min' in target_budget:
                    condition['rent_budget_min.unit'] = currency
                    condition['rent_budget_min.value_float'] = {}
                    condition['rent_budget_min.value_float']['$gte'] = target_budget['min']
                if 'max' in target_budget:
                    condition['rent_budget_max.unit'] = currency
                    condition['rent_budget_max.value_float'] = {}
                    condition['rent_budget_max.value_float']['$lte'] = target_budget['max']
            else:
                if 'min' in target_budget:
                    condition['rent_budget_min.unit'] = currency
                    condition['rent_budget_min.value_float'] = {}
                    condition['rent_budget_min.value_float']['$gte'] = float(f_app.i18n.convert_currency({"unit": target_budget_currency, "value_float": target_budget['min']}, currency))
                if 'max' in target_budget:
                    condition['rent_budget_max.unit'] = currency
                    condition['rent_budget_max.value_float'] = {}
                    condition['rent_budget_max.value_float']['$lte'] = float(f_app.i18n.convert_currency({"unit": target_budget_currency, "value_float": target_budget['max']}, currency))
            conditions['$and'] = []
            conditions['$and'].append(condition)
            budget_filter.append(conditions)

        value.update({"aggregation_rent_intention_total_above_200": m.tickets.find({
            'type': "rent_intention",
            'city._id': ObjectId('555966cd666e3d0f578ad2cf'),
            '$or': budget_filter}).count()
        })

        value.update({"aggregation_rent_intentionl_has_neighborhood_total": m.tickets.find({'type': "rent_intention", 'city._id': ObjectId('555966cd666e3d0f578ad2cf'), 'maponics_neighborhood': {'$exists': 'true'}}).count()})
        cursor = m.tickets.aggregate(
            [
                {'$match': {'type': "rent_intention", 'city._id': ObjectId('555966cd666e3d0f578ad2cf'), 'maponics_neighborhood': {'$exists': 'true'}}},
                {'$group': {'_id': '$maponics_neighborhood._id', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
        )
        aggregation_rent_intentionl_has_neighborhood = []
        for document in cursor:
            target_regions = f_app.maponics.neighborhood.get(document['_id'])
            aggregation_rent_intentionl_has_neighborhood.append({
                "neighborhood": target_regions.get("name", "") + "," + target_regions.get("parent_name", ""),
                "total": document['count']
            })
        value.update({"aggregation_rent_intentionl_has_neighborhood": aggregation_rent_intentionl_has_neighborhood})
        cursor = m.favorites.aggregate(
            [
                {'$group': {'_id': "$type", 'count': {'$sum': 1}}}
            ]
        )
        fav_type_dic = {
            'rent_ticket': '出租房源',
            'property': '海外房产',
            'item': '众筹'
        }
        aggregation_ticket_favorite_times_by_type = []
        for document in cursor:
            if(document['_id']):
                aggregation_ticket_favorite_times_by_type.append({
                    "type": fav_type_dic[document['_id']],
                    "total": document['count']
                })
        cursor.close()
        value.update({"aggregation_ticket_favorite_times_by_type": aggregation_ticket_favorite_times_by_type})
        cursor = m.favorites.aggregate(
            [
                {'$match': {'type': "rent_ticket"}},
                {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
        )
        aggregation_rent_ticket_favorite_times_by_user = []
        for document in cursor:
            aggregation_rent_ticket_favorite_times_by_user.append({
                "user": f_app.user.output([document['_id']], custom_fields=f_app.common.user_custom_fields)[0]['nickname'],
                "total": document['count']
            })
        cursor.close()
        value.update({"aggregation_rent_ticket_favorite_times_by_user": aggregation_rent_ticket_favorite_times_by_user})

        cursor = m.favorites.aggregate(
            [
                {'$match': {'type': "property"}},
                {'$group': {'_id': "$user_id", 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
        )
        aggregation_property_favorite_times_by_user = []
        for document in cursor:
            aggregation_property_favorite_times_by_user.append({
                "user": f_app.user.output([document['_id']], custom_fields=f_app.common.user_custom_fields)[0]['nickname'],
                "total": document['count']
            })
        value.update({"aggregation_property_favorite_times_by_user": aggregation_property_favorite_times_by_user})
        cursor = m.orders.aggregate(
            [
                {'$unwind': "$items"},
                {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
                {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
            ]
        )
        document = cursor.next()
        value.update({"aggregation_view_contact_user_total": document['totalUsersCount']})
        value.update({"aggregation_view_contact_times": document['totalRequestCount']})
        aggregation_view_contact_detail = []
        for i in range(5):
            cursor = m.orders.aggregate(
                [
                    {'$unwind': "$items"},
                    {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
                    {'$match': {'count': i}},
                    {'$group': {'_id': 'null', 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
                ]
            )
            if cursor.alive:
                document = cursor.next()
                aggregation_view_contact_detail.append({
                    "times": i,
                    "user_total": document['totalUsersCount'],
                    "view_times": document['totalRequestCount'],
                    "ratio": document['totalUsersCount']*1.0/value['aggregation_view_contact_user_total']
                })
        value.update({"aggregation_view_contact_detail": aggregation_view_contact_detail})
        cursor.close()
        cursor = m.orders.aggregate(
            [
                {'$unwind': "$items"},
                {'$group': {'_id': "$user.nickname", 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
        )
        aggregation_view_contact_by_user = []
        for document in cursor:
            aggregation_view_contact_by_user.append({
                "user": document['_id'],
                "total": document['count']
            })
        value.update({"aggregation_view_contact_by_user": aggregation_view_contact_by_user})
        cursor.close()
        cursor = m.orders.aggregate(
            [
                {'$unwind': "$items"},
                {'$group': {'_id': "$ticket_id", 'count': {'$sum': 1}}},
                {'$group': {'_id': None, 'totalUsersCount': {'$sum': 1}, 'totalRequestCount': {'$sum': "$count"}}}
            ]
        )
        document = cursor.next()
        value.update({
            "aggregation_view_contact_ticket_total": document['totalUsersCount'],
            "aggregation_view_contact_total": document['totalRequestCount']
        })
        cursor.close()
        cursor = m.orders.aggregate(
            [
                {'$unwind': "$items"},
                {'$group': {'_id': "$ticket_id", 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
        )
        aggregation_view_contact_times_sort = []
        for document in cursor:
            try:
                ticket = f_app.ticket.get(document['_id'])
            except:
                ticket = None
            if ticket is None:
                continue
            aggregation_view_contact_times_sort.append({
                "name": ticket.get("title", ''),
                "url_id": document['_id'],
                "total": document['count']
            })
        value.update({"aggregation_view_contact_times_sort": aggregation_view_contact_times_sort})
    return value


@f_api('/aggregation-property-view')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def aggregation_property_view(user):
    value = {}
    with f_app.mongo() as m:
        value.update({"aggregation_property_view_total": m.log.find({'property_id': {'$exists': True}}).count()})
        value.update({"aggregation_property_view_register_user": m.log.find({'property_id': {'$exists': True}, 'id': {'$ne': None}}).count()})

        func_map = Code('''
            function() {
                emit(this.id, 1);
            }
        ''')
        func_reduce = Code('''
            function(key, value) {
                return Array.sum(value)
            }
        ''')
        result = m.log.map_reduce(func_map, func_reduce, "aggregation_property_view_by_user", query={'property_id': {'$exists': True}, 'id': {'$ne': None}})
        aggregation_property_view_times_by_user_sort = []
        for single in result.find().sort('value', -1):
            aggregation_property_view_times_by_user_sort.append({"user": f_app.user.get(single['_id'])['nickname'], "total": single['value']})
        value.update({"aggregation_property_view_times_by_user_sort": aggregation_property_view_times_by_user_sort})
        func_map = Code('''
            function() {
                emit(this.property_id, 1);
            }
        ''')
        result = m.log.map_reduce(func_map, func_reduce, "aggregation_property_view_by_user", query={'property_id': {'$exists': True}})
        aggregation_property_view_times_by_property_sort = []
        for single in result.find().sort('value', -1):
            property_id = single["_id"]
            property_domain = f_app.property.output([property_id], permission_check=False, ignore_nonexist=True)
            name = ''
            if property_domain is None:
                continue
            if property_domain[0]:
                name = f_app.i18n.process_i18n(property_domain[0].get("name"))
            if property_id:
                aggregation_property_view_times_by_property_sort.append({
                    "title": name,
                    "url_id": property_id,
                    "total": single['value']
                })
        value.update({"aggregation_property_view_times_by_property_sort": aggregation_property_view_times_by_property_sort})
    return value


@f_api('/aggregation-email-detail', params=dict(
    time=(datetime, None)
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def aggregation_email_detail(user, params):
    value = {}
    with f_app.mongo() as m:
        func_map = Code('''
            function() {
            var list = []
                if (this.tag && this.email_id) {
                    if (Array.isArray(this.target)) {
                        for (var index = 0; index < this.target.length; index ++) {
                            list = []
                            list.push({target: this.target[index],
                                       email_id: this.email_id});
                            emit(this.tag, {a:list});
                        }
                    }
                    else {
                        list.push({target: this.target,
                                   email_id: this.email_id});
                        emit(this.tag, {a:list});
                    }
                }
            }
        ''')
        func_reduce = Code('''
            function(key, values) {
                var list = []
                values.forEach(function(e) {
                    if (e.a) {
                        list = list.concat(e.a)
                    }
                    else {
                        list = list.concat(e)
                    }
                });
                return {a:list}
            }
        ''')
        # specify_date = datetime(2015, 11, 18)
        if 'time' in params:
            result = f_app.task.get_database(m).map_reduce(func_map, func_reduce, "aggregation_tag", query={"type": "email_send", "start": {"$gte": params['time']}})
        else:
            result = f_app.task.get_database(m).map_reduce(func_map, func_reduce, "aggregation_tag", query={"type": "email_send"})
        value.update({"aggregation_email_tag_total": result.find().count()})
        total_email_drop = 0
        total_email_contain_new_only = 0
        aggregation_email_tag_detail = []
        for tag in result.find():
            func_status_map = Code('''
                function() {
                    var event = this.email_status_set;
                    var event_detail = this.email_status_detail;
                    if (event_detail && event) {
                        if (event.indexOf("processed") != -1 || event.indexOf("dropped") != -1) {
                            emit("total_email", 1);
                        }
                        if (event.indexOf("dropped") != -1) {
                            emit("total_email_drop", 1);
                            emit("total_email_drop_id", {email_id:[this.email_id]});
                        }
                        if (event.length == 1 && event.indexOf("new") != -1) {
                            emit("total_email_contain_new_only", 1);
                            emit("total_email_contain_new_only_id", {email_id:[this.email_id]});
                        }
                        event.forEach(function(e) {
                            emit(e, 1);
                            if (event_detail) {
                                event_detail.forEach(function(c) {
                                    if (c.event == e) {
                                        emit(e+" (repeat)", 1);
                                    }
                                });
                            }
                        });
                    }
                }
            ''')
            func_status_reduce = Code('''
                function(key, value) {
                    if (key == 'total_email_drop_id' || key == 'total_email_contain_new_only_id') {
                        value_list = [];
                        value.forEach(function(e) {
                            value_list = value_list.concat(e.email_id);
                        });
                        return {email_id:value_list}
                    }
                    else {
                        return Array.sum(value)
                    }
                }
            ''')
            query_param = {}
            or_param = []
            for single_param in tag["value"]["a"]:
                or_param.append(single_param)
            query_param.update({"$or": or_param})
            tag_result = f_app.email.status.get_database(m).map_reduce(func_status_map, func_status_reduce, "aggregation_tag_event", query=query_param)
            final_result = {}
            for thing in tag_result.find():
                final_result.update({thing["_id"]: thing["value"]})
            open_unique = final_result.get("open", 0)
            open_times = final_result.get("open (repeat)", 0)
            click_unique = final_result.get("click", 0)
            click_times = final_result.get("click (repeat)", 0)
            delivered_times = final_result.get("delivered", 0)
            total_email = final_result.get("total_email", -1)
            total_email_drop += final_result.get("total_email_drop", 0)
            total_email_contain_new_only += final_result.get("total_email_contain_new_only", 0)
            total_email_drop_id = final_result.get("total_email_drop_id", {}).get("email_id", [])
            total_email_contain_new_only_id = final_result.get("total_email_contain_new_only_id", {}).get("email_id", [])
            single_value = {"tag": tag['_id'],
                            "total": total_email,
                            "delivered": delivered_times,
                            "delivered_ratio": delivered_times/total_email,
                            "open": open_unique,
                            "open_ratio": open_unique/total_email,
                            "open_repeat": open_times,
                            "click": click_unique,
                            "click_ratio": click_unique/total_email,
                            "click_repeat": click_times}
            if 'time' in params:
                single_value.update({"total_email_drop_id": total_email_drop_id,
                                     "total_email_contain_new_only_id": total_email_contain_new_only_id})
            aggregation_email_tag_detail.append(single_value)
        value.update({"aggregation_email_tag_detail": aggregation_email_tag_detail})
        if 'time' in params:
            value.update({"aggregation_email_contain_new_only": total_email_contain_new_only})
            value.update({"aggregation_email_drop": total_email_drop})

    return value


@f_api('/update-user-analyze')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def user_analyze_update(user):
    for user_id in f_app.user.get_active():
        f_app.user.analyze_data_update(user_id)


@f_get('/export-excel/user-analyze.xlsx')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def user_analyze(user):
    def prepare_data(value):
        if f_app.util.batch_iterable(value):
            value_list = []
            for single_value in value:
                value_list.append(prepare_data(single_value))
            return value_list
        elif isinstance(value, datetime):
            loc_t = timezone('Europe/London')
            loc_dt = loc_t.localize(value)
            return unicode(loc_dt.strftime('%Y-%m-%d %H:%M:%S %Z%z'))
        elif value is not None:
            return unicode(value)
        else:
            return ''

    def get_correct_col_index(num):
        if num > 26*26:
            return "ZZ"
        if num >= 26:
            return get_correct_col_index(num/26-1)+chr(num-26+65)
        else:
            return chr(num+65)

    def format_fit(sheet):
        simsun_font = Font(name="SimSun")
        alignment_fit = Alignment(shrink_to_fit=True)
        for row in sheet.rows:
            for cell in row:
                cell.font = simsun_font
                cell.alignment = alignment_fit
        for num, col in enumerate(sheet.columns):
            lenmax = 0
            for cell in col:
                lencur = 0
                if cell.value is None:
                    cell.value = ''
                if isinstance(cell.value, int) or isinstance(cell.value, datetime):
                    lencur = len(unicode(cell.value).encode("GBK"))
                elif cell.value is not None:
                    lencur = len(cell.value.encode("GBK", "replace"))
                if lencur > lenmax:
                    lenmax = lencur
            sheet.column_dimensions[get_correct_col_index(num)].width = lenmax*0.86
            print "col "+get_correct_col_index(num)+" fit."

    def get_diff_color(total):
        fill = []
        base_color = 0x999999
        color = 0x0
        if 4 <= total <= 6:
            s = 0x111111
        elif total == 3:
            s = 0x222222
        elif total == 2:
            s = 0x333333
        else:
            return
        for index in range(total):
            color = base_color + s*index
            color_t = '00'+"%x" % color
            fill.append(PatternFill(fill_type='solid', start_color=color_t, end_color=color_t))
        return fill

    def be_colorful(sheet, max_segment):
        header_fill = PatternFill(fill_type='solid', start_color='00dddddd', end_color='00dddddd')
        for cell in sheet.rows[0]:
            cell.fill = header_fill
        for col in sheet.columns:
            col_set = set()
            cell_fill = []
            col_list = []
            for num, cell in enumerate(col):
                if num and len(cell.value):
                    col_set.add(cell.value)
                if len(col_set) > max_segment:
                    break
            if max_segment >= len(col_set) > 1:
                cell_fill = get_diff_color(len(col_set))
                col_list = list(col_set)
                for number, cell in enumerate(col):
                    if not number:
                        continue
                    for index, value in enumerate(col_list):
                        if cell.value == value:
                            cell.fill = cell_fill[index]

    header = ['用户名', '注册时间', '国家', '用户类型', '单独访问次数', '活跃天数',
              'app下载', '房东类型', '有没有草稿', '发布时间', '地区', '房产查看数',
              '房产量', '单间还是整套', '短租长租', '租金', '分享房产', '已出租时间',
              '求租时间', '预算', '地区', '匹配级别', '查看房产次数', '收藏房产次数',
              '查看房东联系方式的次数', '分享房产', '停留时间最多的页面或rental房产',
              '投资意向时间', '投资预算', '期房还是现房', '几居室', '浏览数量',
              '停留时间最多的页面或sales房产', '跳出的页面', '数据更新时间']

    wb = Workbook()
    ws = wb.active

    ws.append(header)

    for index, user in enumerate(f_app.user.get(f_app.user.get_active())):
        ws.append(prepare_data([user.get("nickname", ''),
                                user.get("register_time", ''),
                                user.get("analyze_guest_county", ''),
                                user.get("analyze_guest_user_type", ''),
                                '',
                                user.get("analyze_guest_active_days", ''),
                                user.get("analyze_guest_downloaded", ''),
                                user.get("analyze_rent_landlord_type", ''),
                                user.get("analyze_rent_has_draft", ''),
                                user.get("analyze_rent_commit_time", ''),
                                user.get("analyze_rent_local", ''),
                                user.get("analyze_rent_estate_views_times", ''),
                                user.get("analyze_rent_estate_total", ''),
                                user.get("analyze_rent_single_or_whole", ''),
                                user.get("analyze_rent_period_range", ''),
                                user.get("analyze_rent_price", ''),
                                '',
                                user.get("analyze_rent_time", ''),
                                user.get("analyze_rent_intention_time", ''),
                                user.get("analyze_rent_intention_budget", ''),
                                user.get("analyze_rent_intention_local", ''),
                                user.get("analyze_rent_intention_match_level", ''),
                                user.get("analyze_rent_intention_views_times", ''),
                                user.get("analyze_rent_intention_favorite_times", ''),
                                user.get("analyze_rent_intention_view_contact_times", ''),
                                '',
                                '',
                                user.get("analyze_intention_time", ''),
                                user.get("analyze_intention_budget", ''),
                                '',
                                '',
                                user.get("analyze_intention_views_times", ''),
                                '',
                                '',
                                user.get("analyze_value_modifier_time", '')
                                ]))
    format_fit(ws)
    be_colorful(ws, 6)
    out = StringIO(save_virtual_workbook(wb))
    response.set_header(b"Content-Type", b"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    return out


@f_get('/export-excel/user-rent-intention.xlsx', params=dict(
    days=(int, -1)
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'operation'])
def user_rent_intention(user, params):

    def get_data_directly_as_str(user, part, deep=None):
        if user is None:
            return ''
        user_part = user.get(part, None)
        if (user_part is not None) and (deep is not None):
            return user.get(part).get(deep, None)
        if f_app.util.batch_iterable(user_part):
            user_part = '/'.join(user_part)
        if user_part is None:
            return ''
        if isinstance(user_part, datetime):
            loc_t = timezone('Europe/London')
            loc_dt = loc_t.localize(user_part)
            return unicode(loc_dt.strftime('%Y-%m-%d %H:%M:%S %Z%z'))
        return unicode(user_part)

    def get_data_enum(user, enum_name):
        if user is None:
            return
        if enum_name not in enum_type_list:
            get_all_enum_value(enum_name)
        single = user.get(enum_name, None)
        value_list = []
        if f_app.util.batch_iterable(single):
            for true_single in single:
                if true_single is None:
                    continue
                enum_id = true_single.get("id", None)
                value = enum_type_list[enum_name].get(enum_id, None)
                value_list.append(value)
        elif single is not None:
            if single.get("id", None):
                enum_id = str(single.get("id", None))
                value = enum_type_list[enum_name].get(enum_id, None)
                if value is not None:
                    value_list.append(value)
        if not f_app.util.batch_iterable(value_list):
            value_list = [value_list]
        value_set = set(value_list)
        value_list = list(value_set)
        return '/'.join(value_list)

    def get_correct_col_index(num):
        if num > 26*26:
            return "ZZ"
        if num >= 26:
            return get_correct_col_index(num/26-1)+chr(num-26+65)
        else:
            return chr(num+65)

    def add_link(sheet, target, link=None):
        if target is None:
            return
        if f_app.util.batch_iterable(target):
            pass
        else:
            for index in range(2, len(sheet.rows)+1):
                cell = sheet[target + unicode(index)]
                if len(cell.value):
                    if link is None:
                        cell.hyperlink = cell.value
                    else:
                        cell.hyperlink = unicode(link)

    def get_diff_color(total):
        fill = []
        base_color = 0x999999
        color = 0x0
        if 4 <= total <= 6:
            s = 0x111111
        elif total == 3:
            s = 0x222222
        elif total == 2:
            s = 0x333333
        else:
            return
        for index in range(total):
            color = base_color + s*index
            color_t = '00'+"%x" % color
            fill.append(PatternFill(fill_type='solid', start_color=color_t, end_color=color_t))
        return fill

    def be_colorful(sheet, max_segment):
        header_fill = PatternFill(fill_type='solid', start_color='00dddddd', end_color='00dddddd')
        for cell in sheet.rows[0]:
            cell.fill = header_fill
        for col in sheet.columns:
            col_set = set()
            cell_fill = []
            col_list = []
            for num, cell in enumerate(col):
                if num and len(cell.value):
                    col_set.add(cell.value)
                if len(col_set) > max_segment:
                    break
            if max_segment >= len(col_set) > 1:
                cell_fill = get_diff_color(len(col_set))
                col_list = list(col_set)
                for number, cell in enumerate(col):
                    if not number:
                        continue
                    for index, value in enumerate(col_list):
                        if cell.value == value:
                            cell.fill = cell_fill[index]

    def format_fit(sheet):
        simsun_font = Font(name="SimSun")
        alignment_fit = Alignment(shrink_to_fit=True)
        for row in sheet.rows:
            for cell in row:
                cell.font = simsun_font
                cell.alignment = alignment_fit
        for num, col in enumerate(sheet.columns):
            lenmax = 0
            for cell in col:
                lencur = 0
                if cell.value is None:
                    cell.value = ''
                if isinstance(cell.value, int) or isinstance(cell.value, datetime):
                    lencur = len(str(cell.value).encode("GBK"))
                elif cell.value is not None:
                    lencur = len(cell.value.encode("GBK", "replace"))
                if lencur > lenmax:
                    lenmax = lencur
            sheet.column_dimensions[get_correct_col_index(num)].width = lenmax*0.86

    def get_referer_id(ticket):
        time = ticket.get("time", None)
        diff_time = timedelta(milliseconds=500)
        flag = 0
        if time is None:
            return ''
        for num, single in enumerate(referer_result):
            rst_time = single.get("time", None)
            if rst_time is None:
                continue
            if rst_time - diff_time < time < rst_time + diff_time:
                flag = 1
                record = single
        if flag:
            return get_id_in_url(record.get("referer", ''))
        return ''

    def get_email(ticket):
        user = ticket.get("user", None)
        if user is None:
            return ''
        return user.get("email", '')

    def get_wechat(ticket):
        user = ticket.get("user", None)
        if user is None:
            return ''
        return user.get("wechat", '')

    def time_period_label(ticket):
        time = ""
        period_start = ticket.get("rent_available_time", None)
        period_end = ticket.get("rent_deadline_time", None)
        if period_end is None or period_start is None:
            time = "不明"
        else:
            period = period_end - period_start
            if period.days >= 365:
                time = "longer than 12 months"
            elif 365 > period.days >= 180:
                time = "6 - 12 months"
            elif 180 >= period.days > 90:
                time = "3 - 6 months"
            elif period.days <= 30:
                time = "less than 1 month"
        return time

    def get_landlord_boss_with_ticket_id(landlord_ticket_id):
        if landlord_ticket_id is None:
            return None, None
        try:
            landlord_house = f_app.ticket.get(landlord_ticket_id)
        except:
            return None, None
        else:
            landlord_boss_id = landlord_house.get("user_id", None)
            if landlord_boss_id is None:
                return landlord_house, None
            return landlord_house, f_app.user.get(landlord_boss_id)

    def get_id_in_url(url):
        if "property-to-rent/" in url:
            segment = url.split("property-to-rent/")[1]
            if "?" in segment:
                return segment.split("?")[0]
            return segment
        elif "ticketId=" in url:
            return url.split("ticketId=")[1]
        else:
            return None

    def get_match(ticket):
        match = []
        if "partial_match" in ticket.get("tags", []):
            match.append("部分满足")
        if "perfect_match" in ticket.get("tags", []):
            match.append("完全满足")
        return '/'.join(match)

    def get_detail_address(ticket):
        return ' '.join([ticket.get("country", {}).get("code", ''),
                         ticket.get("city", {}).get("name", ''),
                         ticket.get("maponics_neighborhood", {}).get("name", ''),
                         ticket.get("address", ''),
                         ticket.get("zipcode_index", '')])

    def get_all_rent_intention(days):
        params = {"type": "rent_intention"}
        if days > 0:
            time_now = datetime.utcnow()
            time_diff = timedelta(days=days)
            condition = {"time": {"$gt": time_now - time_diff}}
            params.update(condition)
        return f_app.ticket.output(f_app.ticket.search(params, per_page=-1, notime=True))

    def get_all_enum_value(enum_singlt_type):
        enum_list_subdic = {}
        for enumitem in f_app.i18n.process_i18n(f_app.enum.get_all(enum_singlt_type)):
            enum_list_subdic.update({enumitem["id"]: enumitem["value"]})
        enum_type_list.update({enum_singlt_type: enum_list_subdic})

    def get_referer_url(referer_id):
        if referer_id is None:
            return ''
        return "http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/rent/"+unicode(referer_id)

    # enum_type = ["rent_type", "landlord_type"]

    referer_result = f_app.log.output(f_app.log.search({"route": "/api/1/rent_intention_ticket/add"}, per_page=-1))
    enum_type_list = {}

    wb = Workbook()
    ws = wb.active
    header = ["状态", "标题", "客户", "联系方式", "邮箱", "微信", "提交时间", "起始日期",
              "终止日期", "出租需求", "预算上限", "预算下限", "period", "出租位置", "备注",
              "样房东有无匹配搭配", "目标房源", "房东类型", "房东姓名", "房东电话", "房东邮箱", "打电话了？", "有接到？", "房子租到了么？", "通过样房东",
              "如果不是通过样房东，那么是通过哪里什么样的房源？有没有交中介费", "对平台体验的想法及反馈",
              "在找房子中用户最疼的点有哪些？", "备注"]
    ws.append(header)

    for number, ticket in enumerate(get_all_rent_intention(params.get("days", -1))):
        ticket = f_app.i18n.process_i18n(ticket)
        referer_id = get_referer_id(ticket)
        landlord_result, landlord_boss = get_landlord_boss_with_ticket_id(referer_id)
        ws.append(["已提交" if (get_data_directly_as_str(ticket, "status") == "new") else "已出租",
                   get_data_directly_as_str(ticket, "title"),
                   get_data_directly_as_str(ticket, "nickname"),
                   get_data_directly_as_str(ticket, "phone"),
                   get_email(ticket),
                   get_wechat(ticket),
                   get_data_directly_as_str(ticket, "time"),
                   get_data_directly_as_str(ticket, "rent_available_time"),
                   get_data_directly_as_str(ticket, "rent_deadline_time"),
                   get_data_enum(ticket, "rent_type"),
                   get_data_directly_as_str(ticket, "rent_budget_max", "value"),
                   get_data_directly_as_str(ticket, "rent_budget_min", "value"),
                   time_period_label(ticket),
                   get_detail_address(ticket),
                   get_data_directly_as_str(ticket, "description"),
                   get_match(ticket),
                   get_referer_url(referer_id),
                   get_data_enum(landlord_result, "landlord_type"),  # 房东类型
                   get_data_directly_as_str(landlord_boss, "nickname"),
                   get_data_directly_as_str(landlord_boss, "phone"),
                   get_data_directly_as_str(landlord_boss, "email"),
                   ])

    format_fit(ws)
    add_link(ws, 'Q')
    be_colorful(ws, 6)
    out = StringIO(save_virtual_workbook(wb))
    #wb.save(out)
    response.set_header(b"Content-Type", b"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    return out
