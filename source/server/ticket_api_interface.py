# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_api, abort, template, request
import logging
logger = logging.getLogger(__name__)


"""
==================================================================
Intention Ticket
==================================================================
"""


@f_api('/intention_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    email=(str, True),
    budget=(float, True),
    country=(str, True),
    description=(str, True),
    state=str,
    city=str,
    block=str,
    equity_type=str,
    intention=str,
    noregister=bool,
    custom_fields=(list, None, dict(
        key=str,
        value=str,
    ))
))
def intention_ticket_add(params):
    """
    ``noregister`` is default to **False**, which means if ``noregister`` is not given, the visitor will *be registered*.
    """
    params.setdefault("type", "intention")
    noregister = params.pop("noregister", False)
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)
    if "intention" in params:
        if not set(params["intention"]) <= set(f_app.common.user_intention):
            abort(40095, logger.warning("Invalid params: intention", params["intention"], exc_info=False))

    user = f_app.user.login_get()
    user_id_by_phone = f_app.user.get_id_by_phone(params["phone"], force_registered=True)
    shadow_user_id = f_app.user.get_id_by_phone(params["phone"])
    if not user:
        if user_id_by_phone:
            abort(40351)
        else:
            if shadow_user_id:
                creator_user_id = ObjectId(shadow_user_id)
            else:
                # Add shadow account for noregister user
                user_params = {
                    "nickname": params["nickname"],
                    "phone": params["phone"],
                    "email": params["email"],
                    "intention": params.get("intention", [])
                }
                if "country" in params:
                    user_params["country"] = params["country"]

                creator_user_id = ObjectId(f_app.user.add(user_params, noregister=noregister))
                # Log in for newly registered user
                if not noregister:
                    f_app.user.login.success(creator_user_id)
    else:
        if not shadow_user_id:
            abort(40324)
        user_info = f_app.user.get(shadow_user_id)
        creator_user_id = ObjectId(user["id"])
        params["country"], params["email"] = user_info.get("country"), user_info.get("email")

    params["creator_user_id"] = creator_user_id

    ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior sales
    sales_list = f_app.user.get(f_app.user.search({"role": {"$in": ["sales"]}}))
    for sales in sales_list:
        if "email" in sales:
            f_app.email.schedule(
                target=sales["email"],
                subject="New ticket has been submitted.",
                text=template("static/templates/new_ticket", ticket_admin_url=ticket_admin_url),
                display="html",
            )

    return f_app.ticket.add(params)


@f_api('/intention_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def intention_ticket_get(user, ticket_id):
    """
    View single ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if len(user_roles) == 0:
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied.", exc_info=False))
    elif "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    return ticket


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
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
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
    return f_app.ticket.update_set(ticket_id, {"assignee": [ObjectId(user_id)]})


@f_api('/intention_ticket/<ticket_id>/edit', params=dict(
    country=(str, None),
    description=(str, None),
    state=(str, None),
    city=(str, None),
    block=(str, None),
    equity_type=(str, None),
    intention=(str, None),
    custom_fields=(list, None, dict(
        key=str,
        value=str,
        index=int,
    )),
    status=(str, None),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def intention_ticket_edit(user, ticket_id, params):
    """
    ``status`` must be one of these values: "new", "assigned", "in_progress", "deposit", "suspended", "bought", "canceled"
    """
    if "intention" in params:
        if not set(params["intention"]) <= set(f_app.common.user_intention):
            abort(40095, logger.warning("Invalid params: intention", params["intention"], exc_info=False))

    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    if "status" in params:
        if params["status"] not in f_app.common.intention_ticket_statuses:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.update_set(ticket_id, params)


@f_api('/intention_ticket/search', params=dict(
    assignee=ObjectId,
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, None, str),
))
@f_app.user.login.check(force=True)
def intention_ticket_search(user, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``deposit``, ``suspended``, ``bought``, ``canceled``
    """
    params.setdefault("type", "intention")
    user_roles = f_app.user.get_role(user["id"])
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        params["assignee"] = ObjectId(user["id"])
    elif len(user_roles) == 0:
        # General users
        params["creator_user_id"] = ObjectId(user["id"])
    sort = params.pop("sort", ["time", 'desc'])
    per_page = params.pop("per_page", 0)

    if "status" in params:
        if set(params["status"]) <= f_app.common.intention_ticket_statuses:
            params["status"] = {"$in": params["status"]}
        else:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort))


"""
==================================================================
Support Ticket
==================================================================
"""


@f_api('/support_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    email=(str, True),
    country=(str, True),
    description=(str, True),
    custom_fields=(list, None, dict(
        key=str,
        value=str,
    ))
))
def support_ticket_add(params):
    """
    Add a support ticket. ``creator_user_id`` is the result of ``get_id_by_phone``. 
    
    If no id is found, **40324 non-exist user** error will occur.
    """
    params.setdefault("type", "support")
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)
    if "support" in params:
        if not set(params["support"]) <= set(f_app.common.user_support):
            abort(40095, logger.warning("Invalid params: support", params["support"], exc_info=False))

    user_id = f_app.user.get_id_by_phone(params["phone"])
    if user_id is not None:
        params["creator_user_id"] = user_id
    else:
        abort(40324)

    ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior support
    support_list = f_app.user.get(f_app.user.search({"role": {"$in": ["support"]}}))
    for support in support_list:
        if "email" in support:
            f_app.email.schedule(
                target=support["email"],
                subject="New support ticket has been submitted.",
                text=template("static/templates/new_ticket", ticket_admin_url=ticket_admin_url),
                display="html",
            )

    return f_app.ticket.add(params)


@f_api('/support_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def support_ticket_get(user, ticket_id):
    """
    View single ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if len(user_roles) == 0:
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied.", exc_info=False))
    elif "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    return ticket


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
    if "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & user_roles) == 0:
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
    return f_app.ticket.update_set(ticket_id, {"assignee": [ObjectId(user_id)]})


@f_api('/support_ticket/<ticket_id>/edit', params=dict(
    country=(str, None),
    description=(str, None),
    custom_fields=(list, None, dict(
        key=str,
        value=str,
        index=int,
    )),
    status=(str, None),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'support', 'jr_support'])
def support_ticket_edit(user, ticket_id, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``solved``, ``unsolved``
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    if "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40399, logger.warning("Permission denied.", exc_info=False))

    if "status" in params:
        if params["status"] not in f_app.common.support_ticket_statuses:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.update_set(ticket_id, params)


@f_api('/support_ticket/search', params=dict(
    assignee=ObjectId,
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, None, str),
))
@f_app.user.login.check(force=True)
def support_ticket_search(user, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``solved``, ``unsolved``
    """
    params.setdefault("type", "support")
    user_roles = f_app.user.get_role(user["id"])
    if "jr_support" in user_roles and len(set(["admin", "jr_admin", "support"]) & user_roles) == 0:
        params["assignee"] = ObjectId(user["id"])
    elif len(user_roles) == 0:
        # General users
        params["creator_user_id"] = ObjectId(user["id"])
    sort = params.pop("sort", ["time", 'desc'])
    per_page = params.pop("per_page", 0)

    if "status" in params:
        if set(params["status"]) <= f_app.common.support_ticket_statuses:
            params["status"] = {"$in": params["status"]}
        else:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort))
