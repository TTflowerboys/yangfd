# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_api, abort, template, request
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
                f_app.user.update_set(user_id, {"nickname": params["nickname"], "intention": params.get("intention", []), "locales": params.get("locales", [])})
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
                if noregister:
                    user_params.pop("email")

                user_id = f_app.user.add(user_params, noregister=noregister)
                f_app.log.add("add", user_id=user_id)
                # Log in and send password for newly registered user
                if not noregister:
                    password = "".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)])
                    f_app.user.update_set(user_id, {"password": password})
                    user_params["password"] = password
                    locale = user_params["locales"][0] if user_params["locales"] else f_app.common.i18n_default_locale
                    request._requested_i18n_locales_list = [locale]
                    if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
                        template_invoke_name = "new_user_cn"
                        sendgrid_template_id = "1c4c392c-2c8d-4b8f-a6ca-556d757ac482"
                    else:
                        template_invoke_name = "new_user_en"
                        sendgrid_template_id = "f69da86f-ba73-4196-840d-7696aa36f3ec"
                    substitution_vars = {
                        "to": [params["email"]],
                        "sub": {
                            "%nickname%": [user_params["nickname"]],
                            "%phone%": [user_params["phone"]],
                            "%password%": [user_params["password"]],
                            "%logo_url%": [f_app.common.email_template_logo_url]
                        }
                    }
                    xsmtpapi = substitution_vars
                    xsmtpapi["category"] = ["new_user"]
                    xsmtpapi["template_id"] = sendgrid_template_id
                    f_app.email.schedule(
                        target=params["email"],
                        subject=f_app.util.get_format_email_subject(template("static/emails/new_user_title")),
                        text=template("static/emails/new_user", password=user_params["password"], nickname=user_params["nickname"], phone=user_params["phone"]),
                        display="html",
                        substitution_vars=substitution_vars,
                        template_invoke_name=template_invoke_name,
                        xsmtpapi=xsmtpapi,
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
                f_app.user.update_set(user_id, {"nickname": params["nickname"], "intention": params.get("intention", []), "locales": params.get("locales", [])})
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
                if noregister:
                    user_params.pop("email")

                user_id = f_app.user.add(user_params, noregister=noregister)
                f_app.log.add("add", user_id=user_id)
                # Log in and send password for newly registered user
                if not noregister:
                    password = "".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)])
                    f_app.user.update_set(user_id, {"password": password})
                    user_params["password"] = password

                    locale = user_params["locales"][0] if user_params["locales"] else f_app.common.i18n_default_locale
                    request._requested_i18n_locales_list = [locale]
                    if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
                        template_invoke_name = "new_user_cn"
                        sendgrid_template_id = "1c4c392c-2c8d-4b8f-a6ca-556d757ac482"
                    else:
                        template_invoke_name = "new_user_en"
                        sendgrid_template_id = "f69da86f-ba73-4196-840d-7696aa36f3ec"
                    substitution_vars = {
                        "to": [params["email"]],
                        "sub": {
                            "%nickname%": [user_params["nickname"]],
                            "%phone%": [user_params["phone"]],
                            "%password%": [user_params["password"]],
                            "%logo_url%": [f_app.common.email_template_logo_url]
                        }
                    }
                    xsmtpapi = substitution_vars
                    xsmtpapi["category"] = ["new_user"]
                    xsmtpapi["template_id"] = sendgrid_template_id
                    f_app.email.schedule(
                        target=params["email"],
                        subject=f_app.util.get_format_email_subject(template("static/emails/new_user_title")),
                        text=template("static/emails/new_user", password=user_params["password"], nickname=user_params["nickname"], phone=user_params["phone"]),
                        display="html",
                        substitution_vars=substitution_vars,
                        template_invoke_name=template_invoke_name,
                        xsmtpapi=xsmtpapi,
                    )

    params["creator_user_id"] = ObjectId(creator_user_id)
    params["user_id"] = ObjectId(user_id)

    # ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior sales
    ticket_id = f_app.ticket.add(params)

    if shadow_user_id is not None:
        f_app.user.counter_update(shadow_user_id)

    sales_list = f_app.user.get(f_app.user.search({"role": {"$in": ["sales"]}}))
    budget_enum = f_app.enum.get(params["budget"]["_id"]) if "budget" in params else None
    for sales in sales_list:
        if "email" in sales:
            locale = sales.get("locales", [f_app.common.i18n_default_locale])[0]
            request._requested_i18n_locales_list = [locale]
            if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
                template_invoke_name = "new_ticket_cn"
                sendgrid_template_id = "35489862-87a8-491b-be84-e20069c8495e"
            else:
                template_invoke_name = "new_ticket_en"
                sendgrid_template_id = "b59446de-5d8b-45b6-8fe1-f8bf64c8a99c"
            budget = f_app.i18n.match_i18n(budget_enum["value"], _i18n=[locale]) if budget_enum else ""
            substitution_vars = {
                "to": [sales["email"]],
                "sub": {
                    "%nickname%": [params["nickname"]],
                    "%phone%": [params["phone"]],
                    "%email%": [params["email"]],
                    "%description%": [params.get("description", "")],
                    "%budget%": [budget],
                    "%logo_url%": [f_app.common.email_template_logo_url]
                }
            }
            xsmtpapi = substitution_vars
            xsmtpapi["category"] = ["new_ticket"]
            xsmtpapi["template_id"] = sendgrid_template_id
            f_app.email.schedule(
                target=sales["email"],
                subject=f_app.util.get_format_email_subject(template("static/emails/new_ticket_title")),
                text=template("static/emails/new_ticket", params=params),
                display="html",
                template_invoke_name=template_invoke_name,
                substitution_vars=substitution_vars,
                xsmtpapi=xsmtpapi,
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
    assert ticket["type"] == "intention", abort(40000, "Invalid intention ticket")
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
    assert ticket["type"] == "intention", abort(40000, "Invalid intention ticket")
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
    assert ticket["type"] == "intention", abort(40000, "Invalid intention ticket")
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
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "intention", abort(40000, "Invalid intention ticket")
    user_role = f_app.user.get_role(user_id)
    if "jr_sales" not in user_role and "sales" not in user_role:
        abort(40399)
    return f_app.ticket.update_set(ticket_id, {"assignee": [ObjectId(user_id)], "status": "assigned", "assigned_time": datetime.utcnow()})


@f_api('/intention_ticket/<ticket_id>/edit', params=dict(
    country=("enum:country", None),
    description=(str, None),
    city=("enum:city", None),
    block=(str, None),
    equity_type=("enum:equity_type", None),
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
    assert ticket["type"] == "intention", abort(40000, "Invalid intention ticket")
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
    sort=(list, ["time", 'desc'], str),
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

    sort = params.pop("sort")
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
    assert ticket["type"] == "support", abort(40000, "Invalid support ticket")
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
    assert ticket["type"] == "support", abort(40000, "Invalid support ticket")
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
    assert ticket["type"] == "support", abort(40000, "Invalid support ticket")
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
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "support", abort(40000, "Invalid support ticket")
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
    assert ticket["type"] == "support", abort(40000, "Invalid support ticket")
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
    sort=(list, ["time", 'desc'], str),
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
    per_page = params.pop("per_page", 0)
    sort = params.pop("sort")
    if "status" in params:
        if set(params["status"]) <= set(f_app.common.support_ticket_statuses):
            params["status"] = {"$in": params["status"]}
        else:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort), enable_custom_fields=enable_custom_fields)


@f_api('/rent_ticket/add', params=dict(
    status=(str, "draft"),
    rent_type="enum:rent_type",
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    property_id=ObjectId,
    price="i18n:currency",
    rent_period=(int, 0),
    rent_available_time=datetime,
    deposit_type="enum:deposit_type",
    bill_covered=bool,
))
@f_app.user.login.check(check_role=True)
def rent_ticket_add(user, params):
    """
    Use ``none`` on ``ticket_id`` to create a new rent ticket.

    Valid status: ``draft``, ``for rent``, ``hidden``, ``rent``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "for rent", "hidden", "rent", "deleted"), abort(40000, "Invalid status")

        if params["status"] == "rent":
            params.setdefault("rent_time", datetime.utcnow())

    params.setdefault("type", "rent")
    params.setdefault("rent_available_time", datetime.utcnow())

    if user:
        params.setdefault("user_id", ObjectId(user["id"]))
        params.setdefault("creator_user_id", ObjectId(user["id"]))

    return f_app.ticket.add(params)


@f_api('/rent_ticket/<ticket_id>/edit', params=dict(
    status=str,
    rent_type="enum:rent_type",
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    property_id=ObjectId,
    price="i18n:currency",
    rent_period=int,
    rent_available_time=datetime,
    deposit_type="enum:deposit_type",
    bill_covered=bool,
    unset_fields=(list, None, str),
))
@f_app.user.login.check(check_role=True)
def rent_ticket_edit(ticket_id, user, params):
    """
    Use ``none`` on ``ticket_id`` to create a new rent ticket.

    Valid status: ``draft``, ``for rent``, ``hidden``, ``rent``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "for rent", "hidden", "rent", "deleted"), abort(40000, "Invalid status")

        if params["status"] == "rent":
            params.setdefault("rent_time", datetime.utcnow())

    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")

    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        pass
    elif ticket.get("creator_user_id"):
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied", exc_info=False))
    elif user:
        params["user_id"] = user["id"]

    unset_fields = params.get("unset_fields", [])
    result = f_app.ticket.update_set(ticket_id, params)
    if unset_fields:
        result = f_app.ticket.update(ticket_id, {"$unset": {i: "" for i in unset_fields}})
    return result


@f_api('/rent_ticket/<ticket_id>')
@f_app.user.login.check(check_role=True)
def rent_ticket_get(user, ticket_id):
    """
    View single rent ticket.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")

    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        pass
    elif ticket.get("creator_user_id"):
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied", exc_info=False))

    return f_app.ticket.output([ticket_id])[0]


@f_api('/sale_ticket/add', params=dict(
    status=(str, "draft"),
    property_id=ObjectId,
    has_commission=bool,
    locales=(list, None, str),
))
@f_app.user.login.check(check_role=True)
def sale_ticket_add(user, params):
    """
    Use ``none`` on ``ticket_id`` to create a new sale ticket.

    Valid status: ``draft``, ``selling``, ``hidden``, ``sold``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "selling", "hidden", "sold", "deleted"), abort(40000, "Invalid status")

        if params["status"] == "sold":
            params.setdefault("sold_time", datetime.utcnow())

    params.setdefault("type", "sale")

    if user:
        params.setdefault("user_id", ObjectId(user["id"]))
        params.setdefault("creator_user_id", ObjectId(user["id"]))

    return f_app.ticket.add(params)


@f_api('/sale_ticket/<ticket_id>/edit', params=dict(
    status=str,
    property_id=ObjectId,
    has_commission=bool,
    locales=(list, None, str),
    unset_fields=(list, None, str),
))
@f_app.user.login.check(check_role=True)
def sale_ticket_edit(ticket_id, user, params):
    """
    Use ``none`` on ``ticket_id`` to create a new sale ticket.

    Valid status: ``draft``, ``selling``, ``hidden``, ``sold``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "selling", "hidden", "sold", "deleted"), abort(40000, "Invalid status")

        if params["status"] == "sold":
            params.setdefault("sold_time", datetime.utcnow())

    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "sale", abort(40000, "Invalid sale ticket")

    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        pass
    elif ticket.get("creator_user_id"):
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied", exc_info=False))
    elif user:
        params["user_id"] = user["id"]

    unset_fields = params.get("unset_fields", [])
    result = f_app.ticket.update_set(ticket_id, params)
    if unset_fields:
        result = f_app.ticket.update(ticket_id, {"$unset": {i: "" for i in unset_fields}})
    return result


@f_api('/sale_ticket/<ticket_id>')
@f_app.user.login.check(check_role=True)
def sale_ticket_get(user, ticket_id):
    """
    View single sale ticket.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "sale", abort(40000, "Invalid sale ticket")

    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        pass
    elif ticket.get("creator_user_id"):
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied", exc_info=False))

    return f_app.ticket.output([ticket_id])[0]
