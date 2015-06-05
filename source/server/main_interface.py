# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
import calendar
from datetime import datetime
from hashlib import sha1
from lxml import etree
from six.moves import cStringIO as StringIO
from six.moves import urllib
import qrcode
import bottle
from app import f_app
from libfelix.f_interface import f_get, f_post, static_file, template, request, response, redirect, html_redirect, error, abort, template_gettext as _
import currant_util
import currant_data_helper
from urllib import quote

logger = logging.getLogger(__name__)
f_app.dependency_register("qrcode", race="python")


@f_get('/')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check()
def default(user):
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

    announcement_list = currant_data_helper.get_announcement_list()
    announcement_list = f_app.i18n.process_i18n(announcement_list)

    news_list = currant_data_helper.get_featured_new_list()
    news_list = f_app.i18n.process_i18n(news_list)

    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))

    title = _('洋房东')
    return currant_util.common_template(
        "index",
        title=title,
        property_list=property_list,
        homepage_ad_list=homepage_ad_list,
        announcement_list=announcement_list,
        news_list=news_list,
        intention_list=intention_list
    )


@f_get('/signup')
@currant_util.check_ip_and_redirect_domain
def signup():
    title = _('注册')
    return currant_util.common_template("signup", title=title)


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
def intention():
    title = _('投资意向')
    intention_list = f_app.i18n.process_i18n(f_app.enum.get_all('intention'))
    return currant_util.common_template("intention", intention_list=intention_list, title=title)


@f_get('/reset_password', '/reset-password')
@currant_util.check_ip_and_redirect_domain
def reset_password():
    title = _('重置密码')
    return currant_util.common_template("reset_password", title=title)


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

    return currant_util.common_template("host_contact_request-phone", rent=rent_ticket, title=title)


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
    return html_redirect("/signin?error_code=40100&from=" + quote(request.url))


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
                etree.SubElement(item, "PicUrl").text = picurl.replace("bbt-currant.s3.amazonaws.com/", "yangfd.cn/s3_raw/")
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
    title = _('洋房东APP下载页')

    return currant_util.common_template("app_download", title=title)


@f_get("/beta-app-download")
@currant_util.check_ip_and_redirect_domain
def beta_app_download():
    redirect('http://fir.im/currant')
