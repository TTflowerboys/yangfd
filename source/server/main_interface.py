# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_get, static_file, template, request, redirect


def get_current_user():
    user = f_app.user.login.get()
    if user:
        user = f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]
    else:
        user = None
    return user


@f_get('/')
def default():
    return template("index", user=get_current_user())
    
@f_get('/signup')
def signup():
    return template("signup")

@f_get('/signin')
def signin():
    return template("signin")

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
