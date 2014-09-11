# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_get, static_file, template, request, redirect


def check_landing(func):
    def __check_landing_replace_func(*args, **kwargs):
        if f_app.common.landing_only:
            return template("coming_soon")
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


@f_get('/')
@check_landing
def default():
    property_list = f_app.property.output(f_app.property.search({}))
    featured_property_list = f_app.property.output(f_app.property.search({"featured": True}))
    announcement_list = f_app.blog.post_output(f_app.blog.post_search({"category": "announcement"}))
    news_list = f_app.blog.post_output(f_app.blog.post_search({"category": "news"}))

    for property in featured_property_list:
        if "zipcode_index" in property:
            property["related_news"] = f_app.blog.post_output(f_app.blog.post_search({"zipcode_index": property["zipcode_index"]}))

    return template(
        "index",
        user=get_current_user(),
        property_list=property_list,
        featured_property_list=featured_property_list,
        announcement_list=announcement_list,
        news_list=news_list
    )


@f_get('/signup')
@check_landing
def signup():
    return template("signup", user=get_current_user())


@f_get('/signin')
@check_landing
def signin():
    return template("signin", user=get_current_user())


@f_get('/reset_password')
@check_landing
def resetPassword():
    return template("reset_password", user=get_current_user())


@f_get('/terms')
@check_landing
def terms():
    return template("terms", user=get_current_user())


@f_get('/privacy')
@check_landing
def privacy():
    return template("privacy", user=get_current_user())


@f_get('/process')
@check_landing
def process():
    return template("process", user=get_current_user())


@f_get('/house_list')
@check_landing
def houseList():
    return template("house_list", user=get_current_user())


@f_get('/property/<property_id:re:[0-9a-fA-F]{24}>')
@check_landing
def property_get(property_id):
    return template("property", user=get_current_user(), property=f_app.property.output([property_id])[0])


@f_get('/coming_soon')
def coming_soon():
    return template("coming_soon")


@f_get('/admin')
def admin():
    return template("admin")


@f_get("/static/<filepath:path>")
def static_route(filepath):
    return static_file(filepath, root="views/static")


@f_get("/logout")
def logout():
    f_app.user.login.logout()
    baseurl = "://".join(request.urlparts[:2])
    redirect(baseurl + "/")
