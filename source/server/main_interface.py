# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_get, static_file, template, request, redirect
import logging
logger = logging.getLogger(__name__)


def check_landing(func):
    def __check_landing_replace_func(*args, **kwargs):
        if f_app.common.landing_only:
            return template("coming_soon", country_list=get_country_list(), budget_list=f_app.enum.get_all('budget'))
        else:
            return func(*args, **kwargs)

    return __check_landing_replace_func


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


@f_get('/')
@check_landing
@f_app.user.login.check()
def default(user):
    if user:
        property_list = []
    else:
        property_id_list = []
        for news_category in ("property_london", "schoolhouse_manchester"):
            property_id_list.extend(f_app.property.search({
                "status": {"$in": ["selling", "sold out"]},
                "news_category._id": ObjectId(f_app.enum.get_by_slug(news_category)["id"]),
            }), per_page=1)

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
                    {'_id': ObjectId(f_app.enum.get_by_slug('announcement')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('purchase_process')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('legal_resource')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('real_estate')["id"]), 'type': 'news_category', '_enum': 'news_category'},
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
def signup():
    return template("signup", user=get_current_user(), country_list=get_country_list())


@f_get('/signin')
@check_landing
def signin():
    return template("signin", user=get_current_user(), country_list=get_country_list())


@f_get('/intention')
@check_landing
def intention():
    budget_list = f_app.enum.get_all('budget')
    intention_list = f_app.enum.get_all('intention')
    return template("intention", user=get_current_user(), budget_list=budget_list, intention_list=intention_list)


@f_get('/reset_password')
@check_landing
def resetPassword():
    return template("reset_password", user=get_current_user(), country_list=get_country_list())


@f_get('/terms')
@check_landing
def terms():
    return template("terms", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/privacy')
@check_landing
def privacy():
    return template("privacy", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/process')
@check_landing
def process():
    return template("process", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/property_list')
@check_landing
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
def property_get(property_id):
    return template("property", user=get_current_user(), property=f_app.property.output([property_id])[0], country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/news_list')
@check_landing
def news_list():
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "category": {"$in": [
                    {'_id': ObjectId(f_app.enum.get_by_slug('real_estate')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('property_london')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('schoolhouse_manchester')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('property_liverpool')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                ]}
            }, per_page=6
        )
    )
    return template("news_list", user=get_current_user(), country_list=get_country_list(), news_list=news_list, budget_list=get_budget_list())


@f_get('/news/<news_id:re:[0-9a-fA-F]{24}>')
@check_landing
def news(news_id):
    return template("news", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list(), news=f_app.blog.post.output([news_id])[0])


@f_get('/notice_list')
@check_landing
def notice_list():
    return template("notice_list", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/guides')
@check_landing
def guides():
    return template("guides", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/laws')
@check_landing
def laws():
    return template("laws", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/coming_soon')
def coming_soon():
    return template("coming_soon", country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_settings')
@check_landing
def user_settings():
    return template("user_settings", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_verify_email')
@check_landing
def user_verify_email():
    return template("user_verify_email", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_email')
@check_landing
def user_change_email():
    return template("user_change_email", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_password')
@check_landing
def user_change_password():
    return template("user_change_password", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_phone_1')
@check_landing
def user_change_phone_1():
    return template("user_change_phone_1", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_change_phone_2')
@check_landing
def user_change_phone_2():
    return template("user_change_phone_2", user=get_current_user(), country_list=get_country_list(), budget_list=get_budget_list())


@f_get('/user_favorites')
@check_landing
def user_favorites():
    if get_current_user() is not None:
        favorite_list = f_app.user.favorite_output(f_app.user.favorite_get_by_user(get_current_user()["id"]))
        return template("user_favorites", user=get_current_user(), country_list=get_country_list(), favorite_list=favorite_list, budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_intentions')
@check_landing
def user_intentions():
    if get_current_user() is not None:
        intention_ticket_list = f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": {"$nin": ["deleted", "bought"]}, "$or": [{"creator_user_id": ObjectId(get_current_user()["id"])}, {"user_id": ObjectId(get_current_user()["id"])}]}))
        return template("user_intentions", user=get_current_user(), country_list=get_country_list(), intention_ticket_list=intention_ticket_list, budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_properties')
@check_landing
def user_properties():
    if get_current_user() is not None:
        intention_ticket_list = f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": "bought", "$or": [{"creator_user_id": ObjectId(get_current_user()["id"])}, {"user_id": ObjectId(get_current_user()["id"])}]}))
        return template("user_properties", user=get_current_user(), country_list=get_country_list(), intention_ticket_list=intention_ticket_list, budget_list=get_budget_list())
    else:
        redirect("://".join(request.urlparts[:2]))


@f_get('/user_messages')
@check_landing
def user_messages():
    message_list = f_app.message.get_by_user(
        get_current_user()['id'],
        {"state": {"$in": ["read", "new"]}},
    )
    return template("user_messages", user=get_current_user(), country_list=get_country_list(), message_list=message_list, budget_list=get_budget_list())


@f_get('/admin')
@check_landing
def admin():
    return template("admin")


@f_get("/static/<filepath:path>")
def static_route(filepath):
    return static_file(filepath, root="views/static")


@f_get("/logout", params=dict(
    return_url=str,
))
def logout(params):
    return_url = params.pop("return_url", "/")
    f_app.user.login.logout()
    baseurl = "://".join(request.urlparts[:2])
    redirect(baseurl + return_url)
