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
    target=(str, True),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_notification_ready(user, params):
    email_locales = []
    if params["target"] == "all":
        subscription_list = f_app.feedback.get(f_app.feedback.search({}))
    else:
        if "@" not in params["target"]:
            abort(40099, logger.warning(
                "No '@' in email address supplied:", params["target"], exc_info=False))
        subscription_list = f_app.feedback.get(
            f_app.feedback.search({"email": params["target"]}))

    for subscription in subscription_list:
        locales = subscription.get(
            "locales", [f_app.common.i18n_default_locale])
        if "zh_Hans_CN" in locales or "zh_Hant_HK" in locales:
            email_locale = "cn"
        else:
            email_locale = "en"
        if ("cn", subscription["email"]) not in email_locales and ("en", subscription["email"]) not in email_locales:
            email_locales.append((email_locale, subscription["email"]))

    for email_locale in email_locales:
        if email_locale[0] == "cn":
            template_invoke_name = "we_are_ready_cn"
        else:
            template_invoke_name = "we_are_ready_en"
        substitution_vars = {"to": [email_locale[1]], "sub": {}}
        f_app.email.schedule(
            target=email_locale[1],
            subject=template("static/emails/we_are_ready_title"),
            text=template("static/emails/we_are_ready"),
            display="html",
            substitution_vars=substitution_vars,
            template_invoke_name=template_invoke_name
        )
