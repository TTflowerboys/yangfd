# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_api, abort, template, request
import logging
logger = logging.getLogger(__name__)


@f_api('/ticket/add', params=dict(
    phone=(str, True),
    nickname=(str, True),
    budget=(float, True),
    description=str,
    noregister=(bool, True),
    country=str,
    custom_fields=(list, None, {})

))
def ticket_add(params):
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)
    user = f_app.user.login_get()
    user_id_by_phone = f_app.user.get_id_by_phone(params["phone"])
    if not user:
        if user_id_by_phone:
            abort(40324)
        else:
            # Add shadow account for noregister user
            user_params = {
                "nickname": params["nickname"],
                "phone": params["phone"]
            }
            if "country" in params:
                user_params["country"] = params["country"]

            if params["noregister"]:
                creator_user_id = ObjectId(f_app.user.add(user_params, noregister=True))
            else:
                creator_user_id = ObjectId(f_app.user.add(user_params))
    else:
        creator_user_id = ObjectId(user["id"])
    params["creator_user_id"] = creator_user_id

    ticket_id = f_app.ticket.add(params)
    ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior sales
    sales_list = f_app.user.get(f_app.user.search({"role": {"$nin": ["sales"]}}))
    for sales in sales_list:
        if "email" in sales:
            f_app.email.schedule(
                target=sales["email"],
                subject="New ticket has been submitted.",
                text=template("static/templates/new_ticket", ticket_admin_url=ticket_admin_url),
                display="html",
            )

    return ticket_id


@f_api('/ticket/<ticket_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def ticket_get(user, ticket_id):
    """
    View single ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.output([ticket_id])[0]
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40300, logger.warning("Permission denied.", exc_info=False))

    return ticket


@f_api('/ticket/<ticket_id>/history')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def ticket_get_history(user, ticket_id):
    """
    View ticket history.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.output([ticket_id])[0]
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40300, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.history_get(f_app.ticket.history_get_by_ticket(ticket_id))


@f_api('/ticket/<ticket_id>/assign/<user_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales'])
def ticket_assign(user, ticket_id, user_id):
    """
    Assign ticket to jr_sales. Only admin, jr_admin, sales can do this.
    """
    return f_app.ticket.assign(ticket_id, ObjectId(user_id))


@f_api('/ticket/<ticket_id>/edit', params=dict(
    budget=float,
    description=str,
    custom_fields=(list, None, {}),
    status=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def ticket_edit(user, ticket_id, params):
    """
    ``status`` must be one of these values: "new", "assigned", "in_progress", "deposit", "suspended", "bought", "canceled"
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.output([ticket_id])[0]
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        if user["id"] not in ticket.get("assignee", []):
            abort(40300, logger.warning("Permission denied.", exc_info=False))

    if "status" in params:
        if params["status"] not in f_app.common.ticket_statuses:
            abort(40000, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.update_set(ticket_id, params)


@f_api('/ticket/search', params=dict(
    assignee=ObjectId,
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, None, str),
))
@f_app.user.login.check(force=True)
def ticket_search(user, params):
    """
    ``status`` must be one of these values: "new", "assigned", "in_progress", "deposit", "suspended", "bought", "canceled"
    """
    user_roles = f_app.user.get_role(user["id"])
    if "jr_sales" in user_roles and len(set(["admin", "jr_admin", "sales"]) & user_roles) == 0:
        params["assignee"] = ObjectId(user["id"])
    elif len(user_roles) == 0:
        # General users
        params["creator_user_id"] = ObjectId(user["id"])

    params.setdefault("sort", ["time", "desc"])
    per_page = params.pop("per_page", 0)
    
    if "status" in params:
        if set(params["status"]) <= f_app.common.ticket_statuses:
            params["status"] = {"$in": params["status"]}
        else:
            abort(40000, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page))
