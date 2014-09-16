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

        Type: order_status_change
        {
            "type": "order_status_change",
            "order_id": "50627bdacea1757f1213f8f3",
            "order_status": "paid",
            "reason": "Office currently unavailable", (Optional)
            "state": "new",
            "time": 1348631514.0,
            "id": "50627bdacea1757f1213f8f3"
        }

        Type: membership_terminated
        {
            "type": "order_status_change",
            "vip_type": "member",
            "reason": "payment failed",
            "state": "new",
            "time": 1348631514.0,
            "id": "50627bdacea1757f1213f8f3"
        }

        Type: gift_desk
        {
            "type": "gift_desk",
            "order_id": "50627bdacea1757f1213f8f3",
            "state": "new",
            "time": 1348631514.0,
            "id": "50627bdacea1757f1213f8f3",
            "from_user": {
                "id": "51f9c43c25254140e33e206c",
                "nickname": "MThirty Seven"
            }
        }

        Type: gift_guest_pass
        {
            "type": "gift_guest_pass",
            "order_id": "50627bdacea1757f1213f8f3",
            "state": "new",
            "time": 1348631514.0,
            "id": "50627bdacea1757f1213f8f3",
            "from_user": {
                "id": "51f9c43c25254140e33e206c",
                "nickname": "MThirty Seven"
            }
        }

        Type: chat
        {
            "display": "text",
            "from_user": {
                "id": "51f9c43c25254140e33e206c",
                "nickname": "MThirty Seven"
            },
            "id": "520da8784f4f8e231c398828",
            "message": "TEST222",
            "state": "new",
            "time": 1376626808,
            "type": "chat",
            "user_id": "520b5901a9657b4b16c676ba"
        }

        Type: invitation_for_member_reserve
        {
            "type": "invitation_for_member_reserve",
            "office_id": "520da8784f4f8e231c398828",
            "desk_id": "50627bdacea1757f1213f8f3",
            "reserve_time": [1348631514.0, 1349631514.0],
            "from_user": {
                "id": "520da8784f4f8e231c398828",
                "nickname": "Michael",
            },
            "state": "new",
            "time": 1348631514.0,
            "id": "50627bdacea1757f1213f8f3"
        }

        Type: invitation_for_member_guest (``deadline`` field is optional, and only present for conference_room invitations)
        {
            "type": "invitation_for_member_guest",
            "office_id": "520da8784f4f8e231c398828",
            "item_id": "50627bdacea1757f1213f8f3",
            "reserve_time": 1348631514.0,
            "deadline": 1348632514.0,
            "from_user": {
                "id": "520da8784f4f8e231c398828",
                "nickname": "Michael",
            },
            "state": "new",
            "time": 1348631514.0,
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


@f_api('/chat/send', params=dict(
    text=(str, True),
    target_user_id=(ObjectId, True, "str"),
))
@f_app.user.login.check(force=True)
def chat_send(user, params):
    """
    Send a chat message to specific user.
    """
    return f_app.message.output(f_app.message.chat.send(params["target_user_id"], params["text"], user_id=user["id"]))


@f_api('/chat/history', params=dict(
    time=datetime,
    target_user_id=(ObjectId, True, "str"),
))
@f_app.user.login.check(force=True)
def chat_history(user, params):
    """
    Fetch chat history with specific user.
    """
    return f_app.message.chat.history(params.pop("target_user_id"), params, user_id=user["id"])
