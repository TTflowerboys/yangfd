# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_api, abort, template
import random
import logging
logger = logging.getLogger(__name__)


@f_api('/intention_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    email=(str, True),
    budget="enum:budget",
    country=("enum:country", True),
    description=str,
    city="enum:city",
    block=str,
    equity_type='enum:equity_type',
    intention=(list, None, 'enum:intention'),
    noregister=bool,
    custom_fields=(list, None, dict(
        key=(str, True),
        value=(str, True),
    )),
    locales=(list, None, str),
    property_id=ObjectId,
))
def intention_ticket_add(params):
    """
    ``noregister`` is default to **True**, which means if ``noregister`` is not given, the visitor will *not be registered*.
    ``creator_user_id`` is the ticket creator, while ``user_id`` stands for the customer of this ticket.
    """
    params.setdefault("type", "intention")
    noregister = params.pop("noregister", True)
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)

    user = f_app.user.login_get()
    user_id = None
    user_id_by_phone = f_app.user.get_id_by_phone(params["phone"], force_registered=True)
    shadow_user_id = f_app.user.get_id_by_phone(params["phone"])
    if not user:
        # For guest, trying to use existing phone number
        if user_id_by_phone:
            abort(40351)
        else:
            # Non-register user can use his / her phone number again
            if shadow_user_id:
                user_id = ObjectId(shadow_user_id)
            else:
                # Add shadow account for noregister user
                user_params = {
                    "nickname": params["nickname"],
                    "phone": params["phone"],
                    "email": params["email"],
                    "intention": params.get("intention", []),
                    "locales": params.get("locales", [])
                }
                if "country" in params:
                    user_params["country"] = params["country"]

                user_id = f_app.user.add(user_params, noregister=noregister)
                f_app.log.add("add", user_id=user_id)
                # Log in and send password for newly registered user
                if not noregister:
                    password = "".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)])
                    f_app.user.update_set(user_id, {"password": password})
                    user_params["password"] = password
                    f_app.email.schedule(
                        target=params["email"],
                        subject=template("static/emails/new_user_title"),
                        text=template("static/emails/new_user", password=user_params["password"], nickname=user_params["nickname"]),
                        display="html",
                    )

                    f_app.user.login.success(user_id)
            creator_user_id = user_id
    else:
        creator_user_id = ObjectId(user["id"])
        if user["id"] == user_id_by_phone:
            # This ticket is created by user on his own
            user_id = user["id"]
        else:
            # This ticket is created by sales
            if shadow_user_id:
                # The target user exists
                user_id = shadow_user_id
            else:
                # Add shadow account for noregister user
                user_params = {
                    "nickname": params["nickname"],
                    "phone": params["phone"],
                    "email": params["email"],
                    "intention": params.get("intention", []),
                    "locales": params.get("locales", [])
                }
                if "country" in params:
                    user_params["country"] = params["country"]

                user_id = f_app.user.add(user_params, noregister=noregister)
                f_app.log.add("add", user_id=user_id)
                # Log in and send password for newly registered user
                if not noregister:
                    password = "".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)])
                    f_app.user.update_set(user_id, {"password": password})
                    user_params["password"] = password
                    f_app.email.schedule(
                        target=params["email"],
                        subject=template("static/emails/new_user_title"),
                        text=template("static/emails/new_user", password=user_params["password"], nickname=user_params["nickname"]),
                        display="html",
                    )

    params["creator_user_id"] = ObjectId(creator_user_id)
    params["user_id"] = ObjectId(user_id)

    # ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior sales
    ticket_id = f_app.ticket.add(params)

    if shadow_user_id is not None:
        f_app.user.counter_update(shadow_user_id)

    sales_list = f_app.user.get(f_app.user.search({"role": {"$in": ["sales"]}}))
    for sales in sales_list:
        if "email" in sales:
            f_app.email.schedule(
                target=sales["email"],
                subject=template("static/emails/new_ticket_title"),
                text=template("static/emails/new_ticket", params=params),
                display="html",
            )

    return ticket_id


@f_api('/intention_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def intention_ticket_get(user, ticket_id):
    """
    View single ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    enable_custom_fields = True
    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif len(user_roles) == 0:
        if ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied.", exc_info=False))
        enable_custom_fields = False
    elif "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & set(user_roles)) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.output([ticket_id], enable_custom_fields=enable_custom_fields)[0]


@f_api('/intention_ticket/<ticket_id>/remove')
@f_app.user.login.check(force=True)
def intention_ticket_remove(user, ticket_id):
    """
    Remove single intention ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if len(set(user_roles) & set(['admin', 'jr_admin', 'sales'])) > 0 or user["id"] == ticket.get("creator_user_id"):
        f_app.ticket.update_set_status(ticket_id, "deleted")
    else:
        abort(40399)


@f_api('/intention_ticket/<ticket_id>/history')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def intention_ticket_get_history(user, ticket_id):
    """
    View intention ticket history.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & set(user_roles)) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.history_get(f_app.ticket.history_get_by_ticket(ticket_id))


@f_api('/intention_ticket/<ticket_id>/assign/<user_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales'])
def intention_ticket_assign(user, ticket_id, user_id):
    """
    Assign intention ticket to ``jr_sales``. Only ``admin``, ``jr_admin``, ``sales`` can do this.
    """
    f_app.ticket.get(ticket_id)
    f_app.user.get(user_id)
    return f_app.ticket.update_set(ticket_id, {"assignee": [ObjectId(user_id)], "status": "assigned", "assigned_time": datetime.utcnow()})


@f_api('/intention_ticket/<ticket_id>/edit', params=dict(
    country=("enum:country", None),
    description=(str, None),
    city=("enum:city", None),
    block=(str, None),
    equity_type=("enum:equity_type", None),
    intention=(list, None, 'enum:intention'),
    budget=("enum:budget", None),
    custom_fields=(list, None, dict(
        key=str,
        value=str,
        index=int,
    )),
    status=(str, None),
    property_id=(ObjectId, None),
    updated_comment=(str, None),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def intention_ticket_edit(user, ticket_id, params):
    """
    ``status`` must be one of these values: "new", "assigned", "in_progress", "deposit", "suspended", "bought", "canceled"
    """
    history_params = {"updated_time": datetime.utcnow()}
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & set(user_roles)) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    if "status" in params:
        if params["status"] not in f_app.common.intention_ticket_statuses:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    if "updated_comment" in params:
        history_params["updated_comment"] = params.pop("updated_comment")

    f_app.ticket.update_set(ticket_id, params, history_params=history_params)

    return f_app.ticket.output([ticket_id])[0]


@f_api('/intention_ticket/search', params=dict(
    assignee=ObjectId,
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, None, str),
    budget="enum:budget",
    phone=str,
    country="enum:country",
    user_id=ObjectId,
))
@f_app.user.login.check(force=True)
def intention_ticket_search(user, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``deposit``, ``suspended``, ``bought``, ``canceled``
    """
    params.setdefault("type", "intention")
    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)

    user_roles = f_app.user.get_role(user["id"])
    enable_custom_fields = True
    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & set(user_roles)) == 0:
        params["assignee"] = ObjectId(user["id"])
    elif len(user_roles) == 0:
        # General users
        params["user_id"] = ObjectId(user["id"])
        enable_custom_fields = False

    sort = params.pop("sort", ["time", 'desc'])
    per_page = params.pop("per_page", 0)

    if "status" in params:
        if set(params["status"]) <= set(f_app.common.intention_ticket_statuses):
            params["status"] = {"$in": params["status"]}
        else:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))
    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort), enable_custom_fields=enable_custom_fields)


@f_api('/support_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    email=(str, True),
    country="enum:country",
    description=str,
    custom_fields=(list, None, dict(
        key=(str, True),
        value=(str, True),
    )),
    locales=(list, None, str),
))
def support_ticket_add(params):
    """
    Add a support ticket. ``creator_user_id`` is the result of ``get_id_by_phone``.

    If no id is found, **40324 non-exist user** error will occur.
    """
    params.setdefault("type", "support")
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)

    user_id = f_app.user.get_id_by_phone(params["phone"])
    if user_id is not None:
        params["creator_user_id"] = ObjectId(user_id)
        params["user_id"] = ObjectId(user_id)
    else:
        abort(40324)

    ticket_id = f_app.ticket.add(params)
    # ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior support
    support_list = f_app.user.get(f_app.user.search({"role": {"$in": ["support"]}}))
    for support in support_list:
        if "email" in support:
            f_app.email.schedule(
                target=support["email"],
                subject=template("static/emails/new_ticket_title"),
                text=template("static/emails/new_ticket", params=params),
                display="html",
            )

    f_app.user.counter_update(user_id, "support")

    return ticket_id


@f_api('/support_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def support_ticket_get(user, ticket_id):
    """
    View single ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    enable_custom_fields = True
    if len(user_roles) == 0:
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied.", exc_info=False))
        enable_custom_fields = False
    elif "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & set(user_roles)) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.output([ticket_id], enable_custom_fields=enable_custom_fields)[0]


@f_api('/support_ticket/<ticket_id>/remove')
@f_app.user.login.check(force=True)
def support_ticket_remove(user, ticket_id):
    """
    Remove single support ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if len(set(user_roles) & set(['admin', 'jr_admin', 'support'])) > 0 or user["id"] == ticket.get("creator_user_id"):
        f_app.ticket.update_set_status(ticket_id, "deleted")
    else:
        abort(40399)


@f_api('/support_ticket/<ticket_id>/history')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'support', 'jr_support'])
def support_ticket_get_history(user, ticket_id):
    """
    View support ticket history.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & set(user_roles)) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.history_get(f_app.ticket.history_get_by_ticket(ticket_id))


@f_api('/support_ticket/<ticket_id>/assign/<user_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'support'])
def support_ticket_assign(user, ticket_id, user_id):
    """
    Assign support ticket to ``jr_support``. Only ``admin``, ``jr_admin``, ``support`` can do this.
    """
    f_app.ticket.get(ticket_id)
    f_app.user.get(user_id)
    return f_app.ticket.update_set(ticket_id, {"assignee": [ObjectId(user_id)], "status": "assigned", "assigned_time": datetime.utcnow()})


@f_api('/support_ticket/<ticket_id>/edit', params=dict(
    country=("enum:country", None),
    description=(str, None),
    custom_fields=(list, None, dict(
        key=str,
        value=str,
        index=int,
    )),
    status=(str, None),
    updated_comment=(str, None)
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'support', 'jr_support'])
def support_ticket_edit(user, ticket_id, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``solved``, ``unsolved``
    """
    history_params = {"updated_time": datetime.utcnow()}
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & set(user_roles)) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    if "status" in params:
        if params["status"] not in f_app.common.support_ticket_statuses:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    if "updated_comment" in params:
        history_params["updated_comment"] = params.pop("updated_comment")

    f_app.ticket.update_set(ticket_id, params, history_params=history_params)
    return f_app.ticket.output([ticket_id])[0]


@f_api('/support_ticket/search', params=dict(
    assignee=ObjectId,
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, None, str),
    phone=str,
    country="enum:country",
    user_id=ObjectId,
))
@f_app.user.login.check(force=True)
def support_ticket_search(user, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``solved``, ``unsolved``
    """
    params.setdefault("type", "support")
    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)

    enable_custom_fields = True
    user_roles = f_app.user.get_role(user["id"])
    if set(user_roles) & set(["admin", "jr_admin", "support"]):
        pass
    if "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & set(user_roles)) == 0:
        params["assignee"] = ObjectId(user["id"])
    elif len(user_roles) == 0:
        # General users
        params["user_id"] = ObjectId(user["id"])
        enable_custom_fields = False
    sort = params.pop("sort", ["time", 'desc'])
    per_page = params.pop("per_page", 0)

    if "status" in params:
        if set(params["status"]) <= set(f_app.common.support_ticket_statuses):
            params["status"] = {"$in": params["status"]}
        else:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort), enable_custom_fields=enable_custom_fields)
