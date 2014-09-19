# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, template, abort


import logging
logger = logging.getLogger(__name__)


@f_api('/subscription/add', params=dict(
    email=(str, True),
    locales=(list, None, str),
))
def subscription_add(params):
    return f_app.feedback.add(params)


@f_api('/subscription/<subscription_id>')
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_get(user, subscription_id):
    return f_app.feedback.output([subscription_id])[0]


@f_api('/subscription/<subscription_id>/remove')
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_remove(user, subscription_id):
    f_app.feedback.remove(subscription_id)


@f_api('/subscription/search', params=dict(
    time=datetime,
    email=str,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_search(user, params):
    subscription_list = f_app.feedback.search(params)
    return f_app.feedback.output(subscription_list)


@f_api('/subscription/notification/ready', params=dict(
    target=(str, "all"),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_notification_ready(user, params):
    email_list = []
    if params["target"] == "all":
        subscription_list = f_app.feedback.get(f_app.feedback.search({}))
        for subscription in subscription_list:
            email_list.append(subscription["email"])
    else:
        if "@" not in params["target"]:
            abort(40099, logger.warning("No '@' in email address supplied:", params["target"], exc_info=False))
        email_list = [params["target"]]
    if email_list:
        f_app.email.schedule(
            target=",".join(email_list),
            subject="YoungFunding is ready now",
            text=template("static/emails/we_are_ready"),
            display="html",
        )
