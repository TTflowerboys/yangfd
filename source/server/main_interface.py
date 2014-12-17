# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from bottle import response
from bson.objectid import ObjectId
from lxml import etree
from datetime import datetime
from hashlib import sha1
from libfelix.f_interface import f_get, f_post, static_file, template, request, redirect, error, abort
from six.moves import cStringIO as StringIO
from six.moves import urllib
import qrcode
import bottle
import logging
import calendar
import pygeoip
logger = logging.getLogger(__name__)
f_app.dependency_register("qrcode", race="python")


def check_landing(func):
    def __check_landing_replace_func(*args, **kwargs):
        if f_app.common.landing_only:
            return template("coming_soon", country_list=get_country_list(), budget_list=f_app.enum.get_all('budget'))
        else:
            return func(*args, **kwargs)

    return __check_landing_replace_func


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
                if "/coming_soon" in request_url:
                    request_url = request_url.replace("beta.", "")

                if country == "CN":
                    logger.debug("Visitor country detected:", country, "redirecting to yangfd.cn if not already. Host:", host)
                    assert host.endswith("yangfd.cn"), redirect(request_url.replace("yangfd.com", "yangfd.cn").replace("youngfunding.co.uk", "yangfd.cn"))

                elif country:
                    logger.debug("Visitor country detected:", country, "redirecting to youngfunding.co.uk if it's currently on yangfd.cn. Host:", host)
                    assert host.endswith(("yangfd.com", "youngfunding.co.uk")), redirect(request_url.replace("yangfd.cn", "youngfunding.co.uk"))

        except bottle.HTTPError:
            raise
        except IndexError:
            pass

        return func(*args, **kwargs)

    return __check_ip_and_redirect_domain_replace_func


def get_current_user(user=None):
    if user is None:
        user = f_app.user.login.get()
    if user:
        user = f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]
    else:
        user = None
    return user


def get_country_list():
    return f_app.enum.get_all("country")


def get_budget_list():
    return f_app.enum.get_all('budget')


def get_message_type_list():
    return f_app.enum.get_all('message_type')


def get_intention_ticket_status_list():
    return f_app.enum.get_all('intention_ticket_status')


def get_favorite_list():
    user = get_current_user()
    result = f_app.user.favorite_output(f_app.user.favorite_get_by_user(user["id"]), ignore_nonexist=True) if user is not None else []
    return [i for i in result if i.get("property")]


@f_get('/')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check()
def default(user):
    if user:
        property_list = []
    else:
        property_id_list = []
        for news_category in ("primier_apartment_london", "studenthouse_sheffield"):
            property_id_list.extend(f_app.property.search({
                "status": {"$in": ["selling", "sold out"]},
                "news_category._id": ObjectId(f_app.enum.get_by_slug(news_category)["id"]),
            }, per_page=1))

        property_list = f_app.property.output(property_id_list)
    homepage_ad_list = f_app.ad.get_all_by_channel("homepage")
    announcement_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "category": [{'_id': ObjectId(f_app.enum.get_by_slug('announcement')["id"]), 'type': 'news_category', '_enum': 'news_category'}]
            }, per_page=1
        )
    )
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "category": {"$in": [
                    {'_id': ObjectId(f_app.enum.get_by_slug('real_estate')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('primier_apartment_london')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('studenthouse_sheffield')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                ]}
            }, per_page=6
        )
    )
    for property in property_list:
        if "news_category" in property:
            property["related_news"] = f_app.blog.post_output(f_app.blog.post_search({
                "category": {"$in": [
                    {"_id": ObjectId(news["id"]), "type": "news_category", "_enum": "news_category"} for news in property["news_category"]
                ]},
            }, per_page=5))

    intention_list = f_app.enum.get_all('intention')
    return template(
        "index",
        user=get_current_user(),
        property_list=property_list,
        homepage_ad_list=homepage_ad_list,
        announcement_list=announcement_list,
        news_list=news_list,
        country_list=get_country_list(),
        budget_list=get_budget_list(),
        intention_list=intention_list
    )


@f_get('/signup')
@check_landing
@check_ip_and_redirect_domain
def signup():
    return template("signup", user=get_current_user(), country_list=get_country_list())


@f_get('/vip_sign_up')
@check_landing
@check_ip_and_redirect_domain
def vip_sign_up():
    return template("sign_up_vip", user=get_current_user(), country_list=get_country_list())


@f_get('/signin')
@check_landing
@check_ip_and_redirect_domain
def signin():
    return template("signin", user=get_current_user(), country_list=get_country_list())


@f_get('/intention')
@check_landing
@check_ip_and_redirect_domain
def intention():
    budget_list = f_app.enum.get_all('budget')
    intention_list = f_app.enum.get_all('intention')
    return template("intention", user=get_current_user(), budget_list=budget_list, intention_list=intention_list)


@f_get('/reset_password')
@check_landing
@check_ip_and_redirect_domain
def resetPassword():
    return template("reset_password", user=get_current_user(), country_list=get_country_list())


@f_get('/process')
@check_landing
@check_ip_and_redirect_domain
def process():
    return template("process", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/region_report/<zipcode_index:re:[A-Z0-9]{2,3}>')
@check_landing
@check_ip_and_redirect_domain
def region_report(zipcode_index):
    report = f_app.report.output(f_app.report.search({"zipcode_index": {"$in": [zipcode_index]}}, per_page=1))
    if (len(report)):
        report = report[0]

    return template("region_report", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), report=report)


@f_get('/property_list')
@check_landing
@check_ip_and_redirect_domain
def property_list():
    city_list = f_app.enum.get_all('city')
    property_type_list = f_app.enum.get_all('property_type')
    intention_list = f_app.enum.get_all('intention')
    property_list = f_app.property.output(f_app.property.search({"status": {"$in": ["selling", "sold out"]}}, per_page=f_app.common.property_list_per_page))
    return template("property_list",
                    user=get_current_user(),
                    country_list=get_country_list(),
                    city_list=city_list,
                    property_type_list=property_type_list,
                    intention_list=intention_list,
                    budget_list=get_budget_list(),
                    property_list=property_list
                    )


@f_get('/property/<property_id:re:[0-9a-fA-F]{24}>')
@check_landing
@check_ip_and_redirect_domain
def property_get(property_id):
    property = f_app.property.output([property_id])[0]
    if "target_property_id" in property:
        target_property_id = property.pop("target_property_id")
        target_property = f_app.property.output([target_property_id])[0]
        unset_fields = property.pop("unset_fields", [])
        target_property.update(property)
        for i in unset_fields:
            target_property.pop(i, None)
        property = target_property
    country_list = get_country_list()
    budget_list = get_budget_list()
    favorite_list = get_favorite_list()
    return template("property", user=get_current_user(), property=property, country_list=country_list, budget_list=budget_list, favorite_list=favorite_list, get_videos_by_ip=f_app.storage.get_videos_by_ip)


@f_get('/pdf_viewer/property/<property_id:re:[0-9a-fA-F]{24}>')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def pdfviewer(user, property_id):
    property = f_app.property.output([property_id])[0]
    if "target_property_id" in property:
        target_property_id = property.pop("target_property_id")
        target_property = f_app.property.output([target_property_id])[0]
        unset_fields = property.pop("unset_fields", [])
        target_property.update(property)
        for i in unset_fields:
            target_property.pop(i, None)
        property = target_property
    return template("pdf_viewer", user=get_current_user(), property=property)


@f_get('/news_list')
@check_landing
@check_ip_and_redirect_domain
def news_list():
    return template("news_list", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/news/<news_id:re:[0-9a-fA-F]{24}>')
@check_landing
@check_ip_and_redirect_domain
def news(news_id):
    return template("news", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), news=f_app.blog.post.output([news_id])[0])


@f_get('/notice_list')
@check_landing
@check_ip_and_redirect_domain
def notice_list():
    return template("notice_list", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/guides')
@check_landing
@check_ip_and_redirect_domain
def guides():
    return template("guides", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/laws')
@check_landing
@check_ip_and_redirect_domain
def laws():
    return template("laws", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/about')
@check_landing
@check_ip_and_redirect_domain
def about():
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "About Us"
            }, per_page=1
        )
    )
    return template("aboutus_content", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), news=news_list[0])


@f_get('/terms')
@check_landing
@check_ip_and_redirect_domain
def terms():
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "YoungFunding Terms Of Use"
            }, per_page=1
        )
    )
    return template("aboutus_content", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), news=news_list[0])


@f_get('/about/marketing')
@check_landing
@check_ip_and_redirect_domain
def marketing():
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "Marketing Cooperation"
            }, per_page=1
        )
    )
    return template("aboutus_content", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), news=news_list[0])


@f_get('/about/media')
@check_landing
@check_ip_and_redirect_domain
def media():
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "Media Cooperation"
            }, per_page=1
        )
    )
    return template("aboutus_content", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), news=news_list[0])


@f_get('/coming_soon')
@check_ip_and_redirect_domain
def coming_soon():
    return template("coming_soon", country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_settings')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_settings(user):
    return template("user_settings", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_verify_email')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_email(user):
    return template("user_verify_email", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_email')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_email(user):
    return template("user_change_email", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_password')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_password(user):
    return template("user_change_password", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_phone_1')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_phone_1(user):
    return template("user_change_phone_1", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_phone_2')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_phone_2(user):
    return template("user_change_phone_2", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_verify_phone_1')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_phone_1(user):
    return template("user_verify_phone_1", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_verify_phone_2')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_phone_2(user):
    return template("user_change_phone_2", user=get_current_user(user), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_favorites')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_favorites(user):
    return template("user_favorites", user=get_current_user(user), country_list=get_country_list(), favorite_list=get_favorite_list(), budget_list=get_budget_list())


@f_get('/user_intentions')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_intentions(user):
    intention_ticket_list = f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": {"$nin": ["deleted", "bought"]}, "$or": [{"creator_user_id": ObjectId(get_current_user(user)["id"])}, {"user_id": ObjectId(get_current_user(user)["id"])}]}), ignore_nonexist=True)
    intention_ticket_status_list = get_intention_ticket_status_list()
    for ticket in intention_ticket_list:
        for ticket_status in intention_ticket_status_list:
            if ('intention_ticket_status:' + ticket['status'] == ticket_status['slug']):
                ticket['status_presentation'] = ticket_status
                logger.warning(ticket)

    return template("user_intentions", user=get_current_user(user), country_list=get_country_list(), intention_ticket_list=intention_ticket_list, budget_list=get_budget_list())


@f_get('/user_properties')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_properties(user):
    intention_ticket_list = f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": "bought", "$or": [{"creator_user_id": ObjectId(get_current_user(user)["id"])}, {"user_id": ObjectId(get_current_user(user)["id"])}]}), ignore_nonexist=True)
    intention_ticket_list = [i for i in intention_ticket_list if i.get("property")]
    return template("user_properties", user=get_current_user(user), country_list=get_country_list(), intention_ticket_list=intention_ticket_list, budget_list=get_budget_list())


@f_get('/user_messages')
@check_landing
@check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_messages(user):
    message_list = f_app.message.get_by_user(
        get_current_user(user)['id'],
        {"state": {"$in": ["read", "new"]}},
    )
    message_type_list = get_message_type_list()

    for message in message_list:
        for message_type in message_type_list:
            if ('message_type:' + message['type'] == message_type['slug']):
                message['type_presentation'] = message_type

    return template("user_messages", user=get_current_user(user), country_list=get_country_list(), message_list=message_list, budget_list=get_budget_list())


@f_get('/verify_email_status')
@check_landing
@check_ip_and_redirect_domain
def verify_email_status():
    return template("verify_email_status", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


# phone specific pages


@f_get('/requirement')
@check_landing
@check_ip_and_redirect_domain
def requirement():
    return template("phone/requirement", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), intention_list=f_app.enum.get_all('intention'))


@f_get('/wechat_share')
@check_landing
@check_ip_and_redirect_domain
def wechat_share():
    return template("phone/wechat_share", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/how_it_works')
@check_landing
@check_ip_and_redirect_domain
def how_it_works():
    return template("phone/how_it_works", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), intention_list=f_app.enum.get_all('intention'))


@f_get('/calculator')
@check_landing
@check_ip_and_redirect_domain
def calculator():
    return template("phone/calculator", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), intention_list=f_app.enum.get_all('intention'))


@f_get('/admin')
@check_landing
@check_ip_and_redirect_domain
def admin():
    return template("admin")


@f_get('/401')
@error(401)
def error_401(error=None):
    return template("401")


@f_get('/404')
@error(404)
def error_404(error=None):
    return template("404")


@f_get('/500')
@error(500)
def error_500(error=None):
    return template("500")


@f_get("/static/<filepath:path>")
def static_route(filepath):
    return static_file(filepath, root="views/static")


@f_get("/qrcode/generate", params=dict(
    content=(str, True),
))
@check_landing
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
        import urllib
        decoded_link = urllib.unquote(params["link"]).decode('utf8')
        if ext == "js":
            response.set_header(b"Content-Type", b"application/javascript")

        if "http://maps.googleapis.com/maps/api/js?libraries=geometry,places" == decoded_link:
            content = content.replace("http://maps.gstatic.com/cat_js/maps-api-v3/api/js/19/3/%7Bmain,geometry,places%7D.js", "/reverse_proxy?link=" + urllib.quote("http://maps.gstatic.com/cat_js/maps-api-v3/api/js/19/3/%7Bmain,geometry,places%7D.js"))

        elif "{main,geometry,places}.js" in decoded_link:
            content = content.replace('a.src=b;', 'a.src="/reverse_proxy?link=" + decodeURIComponent(b);')

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
))
def landregistry_home_values(zipcode_index, params):
    size = [params["width"], params["height"]]
    result = f_app.landregistry.get_month_average_by_zipcode_index(zipcode_index, size=size)
    response.set_header(b"Content-Type", b"image/png")
    return result.getvalue()


@f_get("/landregistry/<zipcode_index>/value_trend", params=dict(
    width=(int, 400),
    height=(int, 212),
))
def landregistry_value_trend(zipcode_index, params):
    size = [params["width"], params["height"]]
    result = f_app.landregistry.get_month_average_by_zipcode_index_with_type(zipcode_index, size=size)
    response.set_header(b"Content-Type", b"image/png")
    return result.getvalue()


@f_get("/landregistry/<zipcode_index>/average_values", params=dict(
    width=(int, 400),
    height=(int, 212),
))
def landregistry_average_values(zipcode_index, params):
    size = [params["width"], params["height"]]
    result = f_app.landregistry.get_average_values_by_zipcode_index(zipcode_index, size=size)
    response.set_header(b"Content-Type", b"image/png")
    return result.getvalue()


@f_get("/landregistry/<zipcode_index>/value_ranges", params=dict(
    width=(int, 400),
    height=(int, 212),
))
def landregistry_value_ranges(zipcode_index, params):
    size = [params["width"], params["height"]]
    result = f_app.landregistry.get_price_distribution_by_zipcode_index(zipcode_index, size=size)
    response.set_header(b"Content-Type", b"image/png")
    return result.getvalue()


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
                    picurl = (picurl + "_thumbnail").replace("bbt-currant.s3.amazonaws.com", "s3.yangfd.cn").replace("https://", "http://")
                etree.SubElement(item, "PicUrl").text = picurl

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
