from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api


@f_api("/app/<app>/check_update", params=dict(
    version=(str, True),
    channel=(str, "dev"),
    platform=(str, True),
))
def app_version_check_update(app, params):
    params["app"] = app
    return f_app.version.check_update(params)


@f_api("/app/<app>/version/add", params=dict(
    version=(str, True),
    changelog=(list, None, str),
    channel=(str, "dev"),
    url=str,
    platform=(str, True),
))
@f_app.user.login.check(role=['admin'])
def app_version_add(app, user, params):
    """
    Use ``dev`` channel for development purpose (such as CI and TestFlight).

    ``changelog`` is a list of strings, example: ``Improve UI performance,Fix several bugs,Update terms of use``
    """
    params["app"] = app
    return f_app.version.add(params)


@f_api("/app/<app>/version/<version_id>")
@f_app.user.login.check(role=['admin'])
def app_version_get(app, user, version_id):
    return f_app.version.get(version_id)


@f_api("/app/<app>/version/<version_id>/update", params=dict(
    changelog=(list, None, str),
    channel=str,
    status=str,
    url=str,
    platform=str,
))
@f_app.user.login.check(role=['admin'])
def app_version_update(app, version_id, user, params):
    """
    Pass ``deleted`` to ``status`` to remove a certain version.
    """
    return f_app.version.update_set(version_id, params)


@f_api("/app/<app>/version", params=dict(
    platform=str,
    channel=str,
))
@f_app.user.login.check(role=['admin'])
def app_version_search(app, params, user):
    params["app"] = app
    return f_app.version.search(params)


@f_api("/app/<app>/crash_report")
def app_crash_report(app):
    """
    Acra Report
    """
    f_app.acra.log(app)


@f_api("/app/<app>/crash_report/search", params=dict(
    query=str,
    time=datetime,
    count=bool,
))
@f_app.user.login.check(role=['admin'])
def app_crash_report_search(app, params, user):
    """
    Acra Report Search API
    """
    params["app"] = app
    return f_app.acra.search(params, count=params.pop("count", False))
