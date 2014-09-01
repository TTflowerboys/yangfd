# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_get, static_file, template


@f_get('/')
def default():
    return template("index")
    
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

