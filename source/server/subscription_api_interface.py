# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, template, abort
from bottle import request

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
    target=(str, True),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_notification_ready(user, params):
    """
    parse ``all`` to ``target`` will send emails to all the subscriptions

    parse certain email to  ``target`` will send email to the target email
    """
    emails = []
    noti_subscription_list = []
    if params["target"] == "all":
        subscription_list = f_app.feedback.get(f_app.feedback.search({}))
    else:
        if "@" not in params["target"]:
            abort(40099, logger.warning("No '@' in email address supplied:", params["target"], exc_info=False))
        subscription_list = f_app.feedback.get(f_app.feedback.search({"email": params["target"]}))

    #fitter the reduplicate subscriptions
    for subscription in subscription_list:
        if subscription["email"] not in emails:
            noti_subscription_list.append(subscription)
            emails.append(subscription["email"])

    for subscription in noti_subscription_list:
        locale = subscription.get("locales", [f_app.common.i18n_default_locale])[0]
        request._requested_i18n_locales_list = [locale]
        #TODO  how to match locales with template name in sendcloud
        if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
            template_invoke_name = "we_are_ready_cn"
        else:
            template_invoke_name = "we_are_ready_en"
        substitution_vars = {"to": [subscription["email"]], "sub": {}}
        f_app.email.schedule(
            target=subscription["email"],
            subject=template("static/emails/we_are_ready_title"),
            text=template("static/emails/we_are_ready"),
            display="html",
            substitution_vars=substitution_vars,
            template_invoke_name=template_invoke_name
        )
