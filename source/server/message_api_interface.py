# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api, abort, ObjectId
from bson.code import Code
from itertools import chain


@f_api("/message", params=dict(
    status=(list, None, str),
    type=(list, None, str),
    mark=(str, None),
))
@f_app.user.login.check(force=True)
def message_receive(user, params):
    """
    ``status`` of a message can be "new" or "sent", "read".
    ``type`` of a message can be "system", "favorited_property_news", "intention_property_news", "my_property_news".
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

        Type: new_sms
        {
            "sender": {
                "id": "50627bdacea1757f1213f8f3",
                "nickname": "Arnold Wang",
            },
            "text": "this is a message",
            "status": "new",
            "time": 1348631514.0,
            "type": "new_sms",
            "role": "tenant",
            "ticket_id": "50627bdacea1757f1213f8f3",
            "id": "50627bdacea1757f1213f8f3",
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
@f_app.user.login.check(check_role=True)
def message_search(user, params):
    per_page = params.pop("per_page", 0)
    if "status" in params:
        params["state"] = {"$in": params.pop("status", [])}
    if "type" in params:
        params["type"] = {"$in": params["type"]}
    if set(user["role"]) & set(["admin", "jr_admin"]):
        pass
    else:
        params["user_id"] = ObjectId(user["id"])
    messages = [f_app.message.output(i) for i in f_app.message.search(params, per_page=per_page, sort=["time", "desc"])]
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


@f_api("/message/statistics", params=dict(
    type=(str, True)
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "operation", "jr_operation"])
def message_statistics(user, params):
    if params["type"] not in f_app.common.message_type:
        abort(40000)

    func_map = Code("""
        function(){
            var key = {"batch_id": this.batch_id, "title": this.title, "text": this.text, "type": this.type};
            if (this.batch_id) {
                if (this.state == 'new') {
                    emit(key, {"counter_new": 1});
                } else if (this.state == 'sent') {
                    emit(key, {"counter_sent": 1});
                } else if (this.state == 'read') {
                    emit(key, {"counter_read": 1});
                }
            }
        }
    """)
    func_reduce = Code("""
        function(key, values){
            var sum_new = 0;
            var sum_sent = 0;
            var sum_read = 0;
            values.forEach(function(value){
                sum_new += value['counter_new'] ? value['counter_new'] : 0;
                sum_sent += value['counter_sent'] ? value['counter_sent'] : 0;
                sum_read += value['counter_read'] ? value['counter_read'] : 0;
            })
            sum_all = sum_new + sum_read + sum_sent
            return {"counter_all": sum_all, "counter_new": sum_new, "counter_sent": sum_sent, "counter_read": sum_read, "rate_sent": sum_sent / sum_all, "rate_read": sum_read / sum_all};
        }
    """)
    with f_app.mongo() as m:
        f_app.message.get_database(m).map_reduce(func_map, func_reduce, "messages_statistics")
        result = m.messages_statistics.find({"_id.type": params["type"]})

    merged_result = map(lambda x: dict(chain(x["_id"].items(), x["value"].items())), result)
    return merged_result
