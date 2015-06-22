# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime, timedelta
import random
import logging
import phonenumbers
from bson.objectid import ObjectId
from app import f_app
from libfelix.f_interface import f_api, abort, template, request
logger = logging.getLogger(__name__)


@f_api('/intention_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    email=(str, True),
    budget="enum:budget",
    country=("country", True),
    description=str,
    city="geonames_gazetteer:city",
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

                user_id = f_app.user.add(user_params, noregister=noregister, retain_country=True)
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

                user_id = f_app.user.add(user_params, noregister=noregister, retain_country=True)
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
    country="country",
    description=str,
    city="geonames_gazetteer:city",
    block=str,
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
    country="country",
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
    country="country",
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
    country=("country", None),
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
    country="country",
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
    title=str,
    description=str,
    rent_type="enum:rent_type",
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    property_id=ObjectId,
    price="i18n:currency",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    deposit_type="enum:deposit_type",
    landlord_type="enum:landlord_type",
    bill_covered=bool,
))
@f_app.user.login.check(check_role=True)
def rent_ticket_add(user, params):
    """
    Valid status: ``draft``, ``to rent``, ``hidden``, ``rent``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "to rent", "hidden", "rent", "deleted"), abort(40000, "Invalid status")

        if params["status"] == "rent":
            params.setdefault("rent_time", datetime.utcnow())

    params.setdefault("type", "rent")
    params.setdefault("rent_available_time", datetime.utcnow())

    if user:
        params.setdefault("user_id", ObjectId(user["id"]))
        params.setdefault("creator_user_id", ObjectId(user["id"]))

    ticket_id = f_app.ticket.add(params)

    f_app.task.put(dict(
        type="rent_ticket_reminder",
        start=datetime.utcnow() + timedelta(days=7),
        ticket_id=ticket_id,
    ))

    return ticket_id


@f_api('/rent_ticket/<ticket_id>/edit', params=dict(
    status=str,
    title=str,
    description=str,
    rent_type="enum:rent_type",
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    property_id=ObjectId,
    price="i18n:currency",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    deposit_type="enum:deposit_type",
    landlord_type="enum:landlord_type",
    bill_covered=bool,
    unset_fields=(list, None, str),
))
@f_app.user.login.check(check_role=True)
def rent_ticket_edit(ticket_id, user, params):
    """
    Valid status: ``draft``, ``to rent``, ``hidden``, ``rent``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "to rent", "hidden", "rent", "deleted"), abort(40000, "Invalid status")

        if params["status"] == "rent":
            params.setdefault("rent_time", datetime.utcnow())

    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")

    if ticket.get("creator_user_id"):
        if not user or ticket.get("creator_user_id") != user["id"] and not (set(user["role"]) & set(["admin", "jr_admin", "support"])):
            abort(40399, logger.warning("Permission denied", exc_info=False))
    elif user:
        params["user_id"] = ObjectId(user["id"])
        params["creator_user_id"] = ObjectId(user["id"])

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

    fuzzy_user_info = True
    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        fuzzy_user_info = False
    elif ticket.get("creator_user_id"):
        if ticket["status"] not in {"to rent", "rent"}:
            if not user or ticket.get("creator_user_id") != user["id"]:
                abort(40399, logger.warning("Permission denied", exc_info=False))

    return f_app.ticket.output([ticket_id], fuzzy_user_info=fuzzy_user_info)[0]


@f_api('/rent_ticket/<ticket_id>/contact_info')
@f_app.user.login.check(force=True)
def rent_ticket_contact_info(user, ticket_id):
    """
    View contact info for single rent ticket.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")

    if ticket["status"] not in {"to rent", "rent"}:
        abort(40399, logger.warning("specified rent ticket is currently not available", exc_info=False))

    f_app.log.add("rent_ticket_view_contact_info", ticket_id=ticket_id)
    return f_app.user.output([ticket["creator_user_id"]], custom_fields=f_app.common.user_custom_fields)[0]


@f_api('/rent_ticket/search', params=dict(
    status=(list, ["to rent"], str),
    per_page=int,
    last_modified_time=datetime,
    sort=(list, ["last_modified_time", 'desc'], str),
    rent_type="enum:rent_type",
    user_id=ObjectId,
    rent_budget="enum:rent_budget",
    bedroom_count="enum:bedroom_count",
    building_area="enum:building_area",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    space=("enum:building_area"),
    property_type=(list, None, "enum:property_type"),
    intention=(list, None, "enum:intention"),
    country='country',
    city='geonames_gazetteer:city',
    location_only=bool,
    latitude=float,
    longitude=float,
    search_range=(int, 5000),
))
@f_app.user.login.check(check_role=True)
def rent_ticket_search(user, params):
    """
    When searching nearby properties (using ``latitude``, ``longitude`` and optionally ``search_range``), ``per_page`` and ``sort`` are not supported and must not be present.
    """
    params.setdefault("type", "rent")
    sort = params.pop("sort")
    per_page = params.pop("per_page", 0)

    fuzzy_user_info = True
    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        fuzzy_user_info = False
    elif not set(params["status"]) <= {"to rent", "rent"}:
        if user:
            # Force to search his own rent ticket
            params["user_id"] = ObjectId(user["id"])
        else:
            abort(40100)

    params["status"] = {"$in": params["status"]}

    if "user_id" in params:
        params["creator_user_id"] = params.pop("user_id")

    if "rent_available_time" in params:
        params["rent_available_time"] = {"$gte": params["rent_available_time"] - timedelta(days=7), "$lte": params["rent_available_time"] + timedelta(days=1)}

    params["$and"] = []
    property_params = {"$and": []}
    non_project_params = {"$and": []}
    main_house_types_elem_params = {"$and": []}

    location_only = params.pop("location_only", False)

    if "latitude" in params:
        assert "longitude" in params, abort(40000)
        assert "per_page" not in params, abort(40000)
        assert "sort" not in params, abort(40000)
        property_params["latitude"] = params.pop("latitude")
        property_params["longitude"] = params.pop("longitude")
        property_params["search_range"] = params.pop("search_range")
    elif "longitude" in params:
        abort(40000)
    else:
        params.pop("search_range")

    if "property_type" in params:
        property_params["property_type"] = {"$in": params.pop("property_type")}

    if "intention" in params:
        property_params["intention"] = {"$in": params.pop("intention")}

    if "city" in params:
        property_params["city"] = params.pop("city")

    if "country" in params:
        property_params["country"] = params.pop("country")

    if "rent_budget" in params:
        budget = f_app.util.parse_budget(params.pop("rent_budget"))
        assert len(budget) == 3 and budget[2] in f_app.common.currency, abort(40000, logger.warning("Invalid rent_budget", exc_info=False))
        price_filter = []
        for currency in f_app.common.currency:
            condition = {"price.unit": currency}
            if currency == budget[2]:
                condition["price.value_float"] = {}
                if budget[0]:
                    condition["price.value_float"]["$gte"] = float(budget[0])
                if budget[1]:
                    condition["price.value_float"]["$lte"] = float(budget[1])
            else:
                condition["price.value_float"] = {}
                if budget[0]:
                    condition["price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))
                if budget[1]:
                    condition["price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))
            price_filter.append(condition)
        params["$and"].append({"$or": price_filter})

    if "bedroom_count" in params:
        bedroom_count = f_app.util.parse_bedroom_count(params.pop("bedroom_count"))
        if bedroom_count[0] and bedroom_count[1]:
            if bedroom_count[0] == bedroom_count[1]:
                bedroom_filter = bedroom_count[0]
            elif bedroom_count[0] > bedroom_count[1]:
                abort(40000, logger.warning("Invalid bedroom_count: start value cannot be greater than end value"))
            else:
                bedroom_filter = {"$gte": bedroom_count[0], "$lte": bedroom_count[1]}
        elif bedroom_count[0]:
            bedroom_filter = {"$gte": bedroom_count[0]}
        elif bedroom_count[1]:
            bedroom_filter = {"$lte": bedroom_count[1]}

        non_project_params["bedroom_count"] = bedroom_filter
        main_house_types_elem_params["bedroom_count"] = bedroom_filter

    if "building_area" in params:
        building_area_filter = []
        space_filter = []
        building_area = f_app.util.parse_building_area(params.pop("building_area"))

        for building_area_unit in ("meter ** 2", "foot ** 2"):
            condition = {"space.unit": building_area_unit}
            house_condition = {"building_area.unit": building_area_unit}
            if building_area_unit == building_area[2]:
                condition["space.value_float"] = {}
                if building_area[0]:
                    condition["space.value_float"]["$gte"] = float(building_area[0])
                    house_condition["building_area_max.value_float"] = {"$gte": float(building_area[0])}
                if building_area[1]:
                    condition["space.value_float"]["$lte"] = float(building_area[1])
                    house_condition["building_area_min.value_float"] = {"$lte": float(building_area[1])}
            else:
                condition["space.value_float"] = {}
                if building_area[0]:
                    condition["space.value_float"]["$gte"] = float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[0]}, building_area_unit))
                    house_condition["building_area_max.value_float"] = {"$gte": float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[0]}, building_area_unit))}
                if building_area[1]:
                    condition["space.value_float"]["$lte"] = float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[1]}, building_area_unit))
                    house_condition["building_area_min.value_float"] = {"$lte": float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[1]}, building_area_unit))}
            space_filter.append(condition)
            building_area_filter.append(house_condition)
        non_project_params["$and"].append({"$or": space_filter})
        main_house_types_elem_params["$and"].append({"$or": building_area_filter})

    if "space" in params:
        space_filter = []
        space = f_app.util.parse_building_area(params.pop("space"))

        for space_unit in ("meter ** 2", "foot ** 2"):
            condition = {"space.unit": space_unit}
            if space_unit == space[2]:
                condition["space.value_float"] = {}
                if space[0]:
                    condition["space.value_float"]["$gte"] = float(space[0])
                if space[1]:
                    condition["space.value_float"]["$lte"] = float(space[1])
            else:
                condition["space.value_float"] = {}
                if space[0]:
                    condition["space.value_float"]["$gte"] = float(f_app.i18n.convert_i18n_unit({"unit": space[2], "value": space[0]}, space_unit))
                if space[1]:
                    condition["space.value_float"]["$lte"] = float(f_app.i18n.convert_i18n_unit({"unit": space[2], "value": space[1]}, space_unit))
            space_filter.append(condition)
        params["$and"].append({"$or": space_filter})

    if len(non_project_params["$and"]) < 1:
        non_project_params.pop("$and")

    if len(main_house_types_elem_params["$and"]) < 1:
        main_house_types_elem_params.pop("$and")

    if len(non_project_params):
        property_params["$and"].append({"$or": [non_project_params, {"main_house_types": {"$elemMatch": main_house_types_elem_params}}]})

    if len(property_params["$and"]) < 1:
        property_params.pop("$and")

    if len(params["$and"]) < 1:
        params.pop("$and")

    if len(property_params):
        property_params.setdefault("status", {"$exists": True})
        property_params.setdefault("user_generated", True)
        if "latitude" in property_params:
            # TODO: make distance available in ticket output
            property_id_list = map(ObjectId, f_app.property.get_nearby(property_params, output=False))
        else:
            property_id_list = map(ObjectId, f_app.property.search(property_params, per_page=0))
        params["property_id"] = {"$in": property_id_list}

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort, time_field="last_modified_time"), fuzzy_user_info=fuzzy_user_info, location_only=location_only)


@f_api('/rent_ticket/<ticket_id>/generate_digest_image')
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def rent_ticket_generate_digest_image(ticket_id, user):
    """
    (Re-)generate digest image.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")
    fetch_url = "://".join(request.urlparts[:2]) + "/property-to-rent-digest/" + ticket_id
    task_id = f_app.task.put(dict(
        type="rent_ticket_generate_digest_image",
        ticket_id=ticket_id,
        fetch_url=fetch_url,
        retry=3,
    ))
    f_app.ticket.update_set(ticket_id, {"digest_image_task_id": task_id})
    return task_id


@f_api('/rent_ticket/<ticket_id>/digest_image_task_status')
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def rent_ticket_digest_image_task_status(ticket_id, user):
    """
    Inspect with the status of the associated rent_ticket_generate_digest_image task.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")
    assert "digest_image_task_id" in ticket, abort(40400, "No rent_ticket_generate_digest_image task found for the provided rent ticket")
    with f_app.mongo() as m:
        return f_app.util.process_objectid(f_app.task.get_database(m).find_one({"_id": ObjectId(ticket["digest_image_task_id"])}))


@f_api('/sale_ticket/add', params=dict(
    status=(str, "draft"),
    property_id=ObjectId,
    has_commission=bool,
    locales=(list, None, str),
))
@f_app.user.login.check(check_role=True)
def sale_ticket_add(user, params):
    """
    Valid status: ``draft``, ``for sale``, ``hidden``, ``sold``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "for sale", "hidden", "sold", "deleted"), abort(40000, "Invalid status")

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
    Valid status: ``draft``, ``for sale``, ``hidden``, ``sold``, ``deleted``.
    """
    if "status" in params:
        assert params["status"] in ("draft", "for sale", "hidden", "sold", "deleted"), abort(40000, "Invalid status")

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

    fuzzy_user_info = True
    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        fuzzy_user_info = False
    elif ticket.get("creator_user_id"):
        if ticket.get("creator_user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied", exc_info=False))

    return f_app.ticket.output([ticket_id], fuzzy_user_info=fuzzy_user_info)[0]


@f_api('/sale_ticket/search', params=dict(
    status=(list, ["for sale"], str),
    per_page=int,
    time=datetime,
    sort=(list, ["time", 'desc'], str),
    sale_type="enum:sale_type",
    user_id=ObjectId,
    price=str,
    bedroom_count="enum:bedroom_count",
    building_area="enum:building_area",
    property_type=(list, None, "enum:property_type"),
    intention=(list, None, "enum:intention"),
    country='country',
    city='geonames_gazetteer:city',
))
@f_app.user.login.check(check_role=True)
def sale_ticket_search(user, params):
    params.setdefault("type", "sale")
    sort = params.pop("sort")
    per_page = params.pop("per_page", 0)

    fuzzy_user_info = True
    if user and set(user["role"]) & set(["admin", "jr_admin", "support"]):
        fuzzy_user_info = False
    elif not set(params["status"]) <= {"for sale", "sold"}:
        if user:
            # Force to search his own sale ticket
            params["user_id"] = ObjectId(user["id"])
        else:
            abort(40100)

    params["status"] = {"$in": params["status"]}

    if "user_id" in params:
        params["creator_user_id"] = params.pop("user_id")

    property_params = {"$and": []}
    non_project_params = {"$and": []}
    main_house_types_elem_params = {"$and": []}

    if "property_type" in params:
        property_params["property_type"] = {"$in": params.pop("property_type")}

    if "intention" in params:
        property_params["intention"] = {"$in": params.pop("intention")}

    if "city" in params:
        property_params["city"] = params.pop("city")

    if "country" in params:
        property_params["country"] = params.pop("country")

    if "price" in params:
        budget = [x.strip() for x in params.pop("price").split(",")]
        assert len(budget) == 3 and budget[2] in f_app.common.currency, abort(40000, logger.warning("Invalid price", exc_info=False))
        non_project_price_filter = []
        main_house_types_elem_price_filter = []
        for currency in f_app.common.currency:
            condition = {"total_price.unit": currency}
            house_condition = {"total_price_max.unit": currency}
            if currency == budget[2]:
                condition["total_price.value_float"] = {}
                if budget[0]:
                    condition["total_price.value_float"]["$gte"] = float(budget[0])
                    house_condition["total_price_max.value_float"] = {"$gte": float(budget[0])}
                if budget[1]:
                    condition["total_price.value_float"]["$lte"] = float(budget[1])
                    house_condition["total_price_min.value_float"] = {"$lte": float(budget[1])}
            else:
                condition["total_price.value_float"] = {}
                if budget[0]:
                    condition["total_price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))
                    house_condition["total_price_max.value_float"] = {"$gte": float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[0]}, currency))}
                if budget[1]:
                    condition["total_price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))
                    house_condition["total_price_min.value_float"] = {"$lte": float(f_app.i18n.convert_currency({"unit": budget[2], "value": budget[1]}, currency))}
            non_project_price_filter.append(condition)
            main_house_types_elem_price_filter.append(house_condition)
        non_project_params["$and"].append({"$or": non_project_price_filter})
        main_house_types_elem_params["$and"].append({"$or": main_house_types_elem_price_filter})

    if "bedroom_count" in params:
        bedroom_count = f_app.util.parse_bedroom_count(params.pop("bedroom_count"))
        if bedroom_count[0] and bedroom_count[1]:
            if bedroom_count[0] == bedroom_count[1]:
                bedroom_filter = bedroom_count[0]
            elif bedroom_count[0] > bedroom_count[1]:
                abort(40000, logger.warning("Invalid bedroom_count: start value cannot be greater than end value"))
            else:
                bedroom_filter = {"$gte": bedroom_count[0], "$lte": bedroom_count[1]}
        elif bedroom_count[0]:
            bedroom_filter = {"$gte": bedroom_count[0]}
        elif bedroom_count[1]:
            bedroom_filter = {"$lte": bedroom_count[1]}

        non_project_params["bedroom_count"] = bedroom_filter
        main_house_types_elem_params["bedroom_count"] = bedroom_filter

    if "building_area" in params:
        building_area_filter = []
        space_filter = []
        building_area = f_app.util.parse_building_area(params.pop("building_area"))

        for building_area_unit in ("meter ** 2", "foot ** 2"):
            condition = {"space.unit": building_area_unit}
            house_condition = {"building_area.unit": building_area_unit}
            if building_area_unit == building_area[2]:
                condition["space.value_float"] = {}
                if building_area[0]:
                    condition["space.value_float"]["$gte"] = float(building_area[0])
                    house_condition["building_area_max.value_float"] = {"$gte": float(building_area[0])}
                if building_area[1]:
                    condition["space.value_float"]["$lte"] = float(building_area[1])
                    house_condition["building_area_min.value_float"] = {"$lte": float(building_area[1])}
            else:
                condition["space.value_float"] = {}
                if building_area[0]:
                    condition["space.value_float"]["$gte"] = float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[0]}, building_area_unit))
                    house_condition["building_area_max.value_float"] = {"$gte": float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[0]}, building_area_unit))}
                if building_area[1]:
                    condition["space.value_float"]["$lte"] = float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[1]}, building_area_unit))
                    house_condition["building_area_min.value_float"] = {"$lte": float(f_app.i18n.convert_i18n_unit({"unit": building_area[2], "value": building_area[1]}, building_area_unit))}
            space_filter.append(condition)
            building_area_filter.append(house_condition)
        non_project_params["$and"].append({"$or": space_filter})
        main_house_types_elem_params["$and"].append({"$or": building_area_filter})

    if len(main_house_types_elem_params["$and"]):
        property_params["$and"].append({"$or": [non_project_params, {"main_house_types": {"$elemMatch": main_house_types_elem_params}}]})

    if len(property_params["$and"]) < 1:
        property_params.pop("$and")

    if len(property_params):
        # property_params.setdefault("status", ["for sale", "sold out"])
        property_params.setdefault("user_generated", True)
        property_id_list = map(ObjectId, f_app.property.search(property_params, per_page=0))
        params["property_id"] = {"$in": property_id_list}

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort), fuzzy_user_info=fuzzy_user_info)


@f_api('/crowdfunding_reservation_ticket/add', params=dict(
    email=(str, True),
    country=("country", True),
    estimated_investment_amount="i18n:currency",
))
def crowdfunding_reservation_ticket_add(params):
    params.setdefault("type", "crowdfunding_reservation")
    ticket_id = f_app.ticket.add(params)
    return ticket_id


@f_api('/crowdfunding_reservation_ticket/<ticket_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def crowdfunding_reservation_ticket_get(user, ticket_id):
    """
    View single crowdfunding_reservation ticket.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "crowdfunding_reservation", abort(40000, "Invalid intention ticket")
    return f_app.ticket.output([ticket_id])[0]


@f_api('/crowdfunding_reservation_ticket/search', params=dict(
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, ["time", 'desc'], str),
    email=str,
    country="country",
    creator_user_id=ObjectId,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales', 'jr_sales'])
def crowdfunding_reservation_ticket_search(user, params):
    params.setdefault("type", "crowdfunding_reservation")

    sort = params.pop("sort")
    per_page = params.pop("per_page", 0)

    if "status" in params:
        params["status"] = {"$in": params["status"]}

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort))
