# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from bottle import response
from bson.objectid import ObjectId
from lxml import etree
from libfelix.f_interface import f_get, static_file, template, request, redirect, error, abort
from six.moves import cStringIO as StringIO
import qrcode
import bottle
import logging
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
                    logger.debug("Visitor country detected:", country, "redirecting to youngfunding.co.uk if not already. Host:", host)
                    assert host.endswith(("yangfd.com", "youngfunding.co.uk")), redirect(request_url.replace("yangfd.cn", "youngfunding.co.uk"))

        except bottle.HTTPError:
            raise
        except IndexError:
            pass

        return func(*args, **kwargs)

    return __check_ip_and_redirect_domain_replace_func


def get_current_user():
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
    return template("property", user=get_current_user(), property=property, country_list=country_list, budget_list=budget_list, favorite_list=favorite_list)


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


@f_get('/coming_soon')
@check_ip_and_redirect_domain
def coming_soon():
    return template("coming_soon", country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_settings')
@check_landing
@check_ip_and_redirect_domain
def user_settings():
    if get_current_user() is not None:
        return template("user_settings", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_verify_email')
@check_landing
@check_ip_and_redirect_domain
def user_verify_email():
    if get_current_user():
        return template("user_verify_email", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_change_email')
@check_landing
@check_ip_and_redirect_domain
def user_change_email():
    if get_current_user():
        return template("user_change_email", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_change_password')
@check_landing
@check_ip_and_redirect_domain
def user_change_password():
    if get_current_user():
        return template("user_change_password", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_change_phone_1')
@check_landing
@check_ip_and_redirect_domain
def user_change_phone_1():
    if get_current_user():
        return template("user_change_phone_1", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_change_phone_2')
@check_landing
@check_ip_and_redirect_domain
def user_change_phone_2():
    if get_current_user():
        return template("user_change_phone_2", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_verify_phone_1')
@check_landing
@check_ip_and_redirect_domain
def user_verify_phone_1():
    if get_current_user():
        return template("user_verify_phone_1", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_verify_phone_2')
@check_landing
@check_ip_and_redirect_domain
def user_verify_phone_2():
    if get_current_user():
        return template("user_change_phone_2", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_favorites')
@check_landing
@check_ip_and_redirect_domain
def user_favorites():
    if get_current_user() is not None:
        return template("user_favorites", user=get_current_user(), country_list=get_country_list(), favorite_list=get_favorite_list(), budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_intentions')
@check_landing
@check_ip_and_redirect_domain
def user_intentions():
    if get_current_user() is not None:
        intention_ticket_list = f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": {"$nin": ["deleted", "bought"]}, "$or": [
                                                    {"creator_user_id": ObjectId(get_current_user()["id"])}, {"user_id": ObjectId(get_current_user()["id"])}]}))
        intention_ticket_status_list = get_intention_ticket_status_list()
        logger.warning('hehe')
        logger.warning(len(intention_ticket_status_list))
        for ticket in intention_ticket_list:
            for ticket_status in intention_ticket_status_list:
                if ('intention_ticket_status:' + ticket['status'] == ticket_status['slug']):
                    ticket['status_presentation'] = ticket_status
                    logger.warning(ticket)

        return template("user_intentions", user=get_current_user(), country_list=get_country_list(), intention_ticket_list=intention_ticket_list, budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_properties')
@check_landing
@check_ip_and_redirect_domain
def user_properties():
    if get_current_user() is not None:
        intention_ticket_list = f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": "bought", "$or": [{"creator_user_id": ObjectId(get_current_user()["id"])}, {"user_id": ObjectId(get_current_user()["id"])}]}), ignore_nonexist=True)
        intention_ticket_list = [i for i in intention_ticket_list if i.get("property")]
        return template("user_properties", user=get_current_user(), country_list=get_country_list(), intention_ticket_list=intention_ticket_list, budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_messages')
@check_landing
@check_ip_and_redirect_domain
def user_messages():
    if get_current_user() is not None:
        message_list = f_app.message.get_by_user(
            get_current_user()['id'],
            {"state": {"$in": ["read", "new"]}},
        )
        message_type_list = get_message_type_list()

        for message in message_list:
            for message_type in message_type_list:
                if ('message_type:' + message['type'] == message_type['slug']):
                    message['type_presentation'] = message_type

        return template("user_messages", user=get_current_user(), country_list=get_country_list(), message_list=message_list, budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


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
    return template("phone/requirement", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/wechat_share')
@check_landing
@check_ip_and_redirect_domain
def wechat_share():
    return template("phone/wechat_share", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/admin')
@check_landing
@check_ip_and_redirect_domain
def admin():
    return template("admin")


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
    if "property_id" in params:
        property = f_app.property.get(params["property_id"])
        allowed = is_in_property(params["link"], property)
        if "target_property_id" in property:
            target_property = f_app.property.get(property["target_property_id"])
            allowed = is_in_property(params["link"], target_property)

    if "news_id" in params:
        news = f_app.blog.post_get(params["news_id"])
        if params["link"] in news.get("images", []):
            allowed = True

    if "content_id" in params:
        if params["link"] == f_app.ad.get(params["content_id"]).get("image"):
            allowed = True

    if "bbt-currant.s3.amazonaws.com" in params["link"] or "zoopla.co.uk" in params["link"]:
        allowed = True

    if not allowed:
        abort(40089, logger.warning("Invalid image source: not from existing property or news", exc_info=False))

    result = f_app.request(params["link"])
    if result.status_code == 200:
        response.set_header(b"Content-Type", b"image/png")
        return result.content


@f_get('/reverse_proxy', params=dict(
    link=(str, True),
))
def reverse_proxy(params):
    result = f_app.request(params["link"])
    if result.status_code == 200:
        ext = params["link"].split('.')[-1]
        if ext == "js":
            response.set_header(b"Content-Type", b"application/javascript")
        return result.content


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
    root = etree.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    url = etree.SubElement(root, "url")
    etree.SubElement(url, "loc")

    response.set_header(b"Content-Type", b"application/xml")
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8")
