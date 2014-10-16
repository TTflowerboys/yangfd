# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api, abort, ObjectId


@f_api("/message", params=dict(
    status=(list, None, str),
    type=(list, None, str),
    mark=(str, None),
))
@f_app.user.login.check(force=True)
def message_receive(user, params):
    """
    ``status`` of a message can be "new" or "read".
    Current message types::

        Type: system
        {
            "title": (i18n),
            "text": (i18n),
            "status": "new",
            "time": 1348631514.0,
            "type": "system",
            "id": "50627bdacea1757f1213f8f3"
        }
    """
    if "status" in params:
        params["state"] = {"$in": params.pop("status", [])}
    messages = f_app.message.get_by_user(
        user['id'],
        params,
    )
    return messages


@f_api("/message/search", params=dict(
    status=(list, None, str),
    type=(list, None, str),
    user_id=ObjectId,
    time=datetime,
    per_page=int,
))
@f_app.user.login.check(force=True)
def message_search(user, params):
    per_page = params.pop("per_page", 0)
    if "status" in params:
        params["state"] = {"$in": params.pop("status", [])}
    if "type" in params:
        params["type"] = {"$in": params["type"]}
    messages = [f_app.message.output(i) for i in f_app.message.search(params, per_page=per_page)]
    return messages


@f_api('/message/<message_id>')
@f_app.user.login.check(force=True, check_admin=True)
def message(message_id, user):
    message = f_app.message.output(message_id)
    if user["id"] != message.pop("user_id") and not user['admin']:
        abort(40100)

    return message


@f_api("/message/<message_id>/delete")
@f_app.user.login.check(force=True, check_admin=True)
def message_delete(message_id, user):
    if user['admin']:
        user_id = True
    else:
        user_id = user['id']
    return f_app.message.delete(message_id, user_id)


@f_api("/message/<message_id>/mark/<status>")
@f_app.user.login.check(force=True)
def message_mark(message_id, status, user):
    return f_app.message.mark(message_id, status)


@f_api('/message/add', params=dict(
    text=("i18n", None, str),
    title=("i18n", None, str),
    type=(str, "system"),
    target=(str, "all"),
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "operation", "jr_operation"])
def admin_message_add(user, params):
    """
    Send a message to specific user(s).
    """
    if "text" not in params and params["type"] != "login_expired":
        abort(40000)
    target = params.pop("target")

    return f_app.message.add(params, target)
