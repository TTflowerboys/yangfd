from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api, abort, ObjectId


@f_api("/message", params=dict(
    state=(list, [], str),
    type=(list, [], str),
    mark=(str, None),
))
@f_app.user.login.check(force=True)
def message_search(user, params):
    """
    Current message types::

        Type: system
        {
            "text": "\u6d4b\u8bd5\u6d88\u606f",
            "state": "new",
            "time": 1348631514.0,
            "type": "system",
            "id": "50627bdacea1757f1213f8f3"
        }
    """
    messages = f_app.message.get_by_user(
        user['id'],
        params,
    )
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


@f_api("/message/<message_id>/mark/<state>")
@f_app.user.login.check(force=True)
def message_mark(message_id, state, user):
    return f_app.message.mark(message_id, state)


@f_api('/message/add', params=dict(
    nonone=False,
    text=(str, ""),
    type=(str, "system"),
    target=(str, "all"),
))
@f_app.user.login.check(force=90)
def admin_message_add(user, params):
    """
    Send a message to specific user(s).
    """
    if "text" not in params and params["type"] != "login_expired":
        abort(40000)

    return f_app.message.add({"type": params["type"], "text": params["text"]}, params["target"])
