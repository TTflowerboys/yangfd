    # -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime, timedelta
import random
import logging
from bson.objectid import ObjectId
from app import f_app
from libfelix.f_interface import f_api, abort, template, request
logger = logging.getLogger(__name__)


def _find_or_register(params, allow_draft=False):
    noregister = params.pop("noregister", True)
    user = f_app.user.login_get()

    if "phone" not in params:
        if user:
            user_details = f_app.user.get(user["id"])
            params["phone"] = user_details.get("phone")
            if params["phone"] is None:
                if allow_draft:
                    return
                else:
                    abort(40000)
        else:
            if allow_draft:
                return
            else:
                abort(40000)

    params["phone"] = f_app.util.parse_phone(params, retain_country=True)

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
                if "nickname" in params:
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
                if "email" in params:
                    user_id_by_email = f_app.user.get_id_by_email(params["email"], force_registered=True)
                    if user_id_by_email:
                        abort(40325)

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
                    xsmtpapi["template_id"] = sendgrid_template_id
                    f_app.email.schedule(
                        target=params["email"],
                        subject=f_app.util.get_format_email_subject(template("static/emails/new_user_title")),
                        text=template("static/emails/new_user", password=user_params["password"], nickname=user_params["nickname"], phone=user_params["phone"]),
                        display="html",
                        # substitution_vars=substitution_vars,
                        # template_invoke_name=template_invoke_name,
                        # xsmtpapi=xsmtpapi,
                        tag="new_user",
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
                if "nickname" in params:
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
                if "email" in params:
                    user_id_by_email = f_app.user.get_id_by_email(params["email"], force_registered=True)
                    if user_id_by_email:
                        abort(40325)

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
                    xsmtpapi["template_id"] = sendgrid_template_id
                    f_app.email.schedule(
                        target=params["email"],
                        subject=f_app.util.get_format_email_subject(template("static/emails/new_user_title")),
                        text=template("static/emails/new_user", password=user_params["password"], nickname=user_params["nickname"], phone=user_params["phone"]),
                        display="html",
                        # substitution_vars=substitution_vars,
                        # template_invoke_name=template_invoke_name,
                        # xsmtpapi=xsmtpapi,
                        tag="new_user",
                    )

    params["creator_user_id"] = ObjectId(creator_user_id)
    params["user_id"] = ObjectId(user_id)
    return shadow_user_id


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
    referrer=str,
    property_id=ObjectId,
))
def intention_ticket_add(params):
    """
    ``noregister`` is default to **True**, which means if ``noregister`` is not given, the visitor will *not be registered*.
    ``creator_user_id`` is the ticket creator, while ``user_id`` stands for the customer of this ticket.
    """
    params.setdefault("type", "intention")

    shadow_user_id = _find_or_register(params)

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
            xsmtpapi["template_id"] = sendgrid_template_id
            f_app.email.schedule(
                target=sales["email"],
                subject=f_app.util.get_format_email_subject(template("static/emails/new_intention_ticket_title")),
                text=template("static/emails/new_intention_ticket", params=params),
                display="html",
                template_invoke_name=template_invoke_name,
                substitution_vars=substitution_vars,
                xsmtpapi=xsmtpapi,
                tag="new_intention_ticket",
            )

    title = "恭喜，洋房东已经收到您的投资意向单！"
    f_app.email.schedule(
        target=params["email"],
        subject=title,
        # TODO
        text=template("static/emails/receive_intention", date="", nickname=params["nickname"], title=title),
        display="html",
        tag="receive_intention",
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
    referrer=str,
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
    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort), enable_custom_fields=enable_custom_fields, ignore_nonexist=True)


@f_api('/rent_intention_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    email=(str, True),
    tenant_count=int,
    gender=str,
    date_of_birth=datetime,
    occupation="enum:occupation",
    smoke=bool,
    baby=bool,
    pet=bool,
    visa=(str, None, "replaces"),
    disable_matching=(bool, False),
    interested_rent_tickets=(list, None, ObjectId),
    rent_type="enum:rent_type",
    rent_budget_min="i18n:currency",
    rent_budget_max="i18n:currency",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    bedroom_count="enum:bedroom_count",
    country="country",
    description=str,
    title=str,
    city="geonames_gazetteer:city",
    maponics_neighborhood="maponics_neighborhood",
    hesa_university=ObjectId,
    address=str,
    zipcode_index=str,
    noregister=bool,
    custom_fields=(list, None, dict(
        key=(str, True),
        value=(str, True),
    )),
    locales=(list, None, str),
    status=str,
))
@f_app.user.login.check(check_role=True)
def rent_intention_ticket_add(params, user):
    """
    ``noregister`` is default to **True**, which means if ``noregister`` is not given, the visitor will *not be registered*.
    ``creator_user_id`` is the ticket creator, while ``user_id`` stands for the customer of this ticket.
    """
    params.setdefault("type", "rent_intention")
    shadow_user_id = _find_or_register(params)

    if "user_id" in params and "creator_user_id" in params and params["user_id"] is not None and params["user_id"] == params["creator_user_id"]:
        credits = f_app.user.credit.get("view_rent_ticket_contact_info", tag="rent_intention_ticket", user_id=params["user_id"])
        if not len(credits["credits"]):
            credit = {
                "type": "view_rent_ticket_contact_info",
                "amount": 1,
                "expire_time": datetime.utcnow() + timedelta(days=30),
                "tag": "rent_intention_ticket",
                "user_id": params["user_id"],
            }
            f_app.user.credit.add(credit)

    # ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior sales
    ticket_id = f_app.ticket.add(params)

    if shadow_user_id is not None:
        f_app.user.counter_update(shadow_user_id)

    if f_app.common.use_ssl:
        schema = "https://"
    else:
        schema = "http://"
    admin_console_url = "%s%s/admin#" % (schema, request.urlparts[1])

    if "status" in params:
        if params["status"] not in f_app.common.rent_intention_ticket_statuses:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    sales_list = f_app.user.get(f_app.user.search({"role": {"$in": ["operation", "jr_operation"]}}))
    # budget_enum = f_app.enum.get(params["rent_budget"]["_id"]) if "budget" in params else None
    for sales in sales_list:
        if "email" in sales:
            f_app.email.schedule(
                target=sales["email"],
                subject=f_app.util.get_format_email_subject(template("static/emails/new_rent_intention_ticket_title")),
                text=template("static/emails/new_rent_intention_ticket", params=params, admin_console_url=admin_console_url),
                display="html",
                tag="new_rent_intention_ticket",
            )
            if False:
                # Old routine
                locale = sales.get("locales", [f_app.common.i18n_default_locale])[0]
                request._requested_i18n_locales_list = [locale]
                if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
                    template_invoke_name = "new_ticket_cn"
                    sendgrid_template_id = "35489862-87a8-491b-be84-e20069c8495e"
                else:
                    template_invoke_name = "new_ticket_en"
                    sendgrid_template_id = "b59446de-5d8b-45b6-8fe1-f8bf64c8a99c"
                # budget = f_app.i18n.match_i18n(budget_enum["value"], _i18n=[locale]) if budget_enum else ""
                substitution_vars = {
                    "to": [sales["email"]],
                    "sub": {
                        "%nickname%": [params["nickname"]],
                        "%phone%": [params["phone"]],
                        "%email%": [params["email"]],
                        "%description%": [params.get("description", "")],
                        # "%budget%": [budget],
                        "%logo_url%": [f_app.common.email_template_logo_url]
                    }
                }
                xsmtpapi = substitution_vars
                xsmtpapi["template_id"] = sendgrid_template_id
                f_app.email.schedule(
                    target=sales["email"],
                    subject=f_app.util.get_format_email_subject(template("static/emails/new_rent_ticket_title")),
                    text=template("static/emails/new_rent_ticket", params=params),
                    display="html",
                    template_invoke_name=template_invoke_name,
                    substitution_vars=substitution_vars,
                    xsmtpapi=xsmtpapi,
                    tag="new_rent_ticket",
                )

    return ticket_id


@f_api('/rent_intention_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def rent_intention_ticket_get(user, ticket_id):
    """
    View single ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent_intention", abort(40000, "Invalid rent_intention ticket")
    enable_custom_fields = True
    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    else:
        if ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
            abort(40399, logger.warning("Permission denied.", exc_info=False))
        enable_custom_fields = False

    return f_app.ticket.output([ticket_id], enable_custom_fields=enable_custom_fields)[0]


@f_api('/rent_intention_ticket/<ticket_id>/remove')
@f_app.user.login.check(force=True)
def rent_intention_ticket_remove(user, ticket_id):
    """
    Remove single rent_intention ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent_intention", abort(40000, "Invalid rent_intention ticket")
    if len(set(user_roles) & set(['admin', 'jr_admin', 'sales'])) > 0 or user["id"] == ticket.get("creator_user_id"):
        f_app.ticket.update_set_status(ticket_id, "deleted")
    else:
        abort(40399)


@f_api('/rent_intention_ticket/<ticket_id>/edit', params=dict(
    tenant_count=int,
    gender=str,
    date_of_birth=datetime,
    occupation="enum:occupation",
    smoke=bool,
    baby=bool,
    pet=bool,
    visa=(str, None, "replaces"),
    country="country",
    disable_matching=bool,
    interested_rent_tickets=(list, None, ObjectId),
    maponics_neighborhood="maponics_neighborhood",
    hesa_university=ObjectId,
    title=str,
    description=str,
    city="geonames_gazetteer:city",
    bedroom_count="enum:bedroom_count",
    rent_type="enum:rent_type",
    rent_budget_min="i18n:currency",
    rent_budget_max="i18n:currency",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    address=str,
    zipcode_index=str,
    minimum_rent_period="i18n:time_period",
    custom_fields=(list, None, dict(
        key=str,
        value=str,
        index=int,
    )),
    status=str,
    updated_comment=str,
))
@f_app.user.login.check(force=True, check_role=True)
def rent_intention_ticket_edit(user, ticket_id, params):
    """
    ``status`` must be one of these values: "new", "requested", "agreed", "rejected", "assigned", "examined", "rent", "canceled"
    """
    history_params = {"updated_time": datetime.utcnow()}
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent_intention", abort(40000, "Invalid rent_intention ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    if "status" in params:
        if params["status"] not in f_app.common.rent_intention_ticket_statuses:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))

    if "updated_comment" in params:
        history_params["updated_comment"] = params.pop("updated_comment")

    f_app.ticket.update_set(ticket_id, params, history_params=history_params)

    return f_app.ticket.output([ticket_id])[0]


@f_api('/rent_intention_ticket/search', params=dict(
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, ["time", 'desc'], str),
    smoke=bool,
    baby=bool,
    pet=bool,
    disable_matching=bool,
    interested_rent_tickets=(list, None, ObjectId),
    phone=str,
    country="country",
    maponics_neighborhood="maponics_neighborhood",
    hesa_university=ObjectId,
    zipcode=str,
    city="geonames_gazetteer:city",
    rent_type="enum:rent_type",
    rent_budget_min="i18n:currency",
    rent_budget_max="i18n:currency",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    user_id=ObjectId,
))
@f_app.user.login.check(force=True)
def rent_intention_ticket_search(user, params):
    """
    ``status`` must be one of these values: "new", "requested", "agreed", "rejected", "assigned", "examined", "rent", "canceled".
    """
    params.setdefault("type", "rent_intention")

    params["$and"] = []

    if "interested_rent_tickets" in params:
        params["interested_rent_tickets"] = {"$in": params["interested_rent_tickets"]}

    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)

    f_app.util.check_and_override_minimum_rent_period(params)

    if "rent_available_time" in params:
        params["rent_available_time"] = {"$gte": params["rent_available_time"] - timedelta(days=7), "$lte": params["rent_available_time"] + timedelta(days=1)}

    if "rent_deadline_time" in params:
        params["$and"].append({"$or": [{"rent_deadline_time": {"$gte": params["rent_deadline_time"] - timedelta(days=1)}}, {"rent_deadline_time": {"$exists": False}}]})

    params.pop("rent_deadline_time", None)

    if "minimum_rent_period" in params:
        rent_period_filter = []
        for time_period_unit in f_app.common.i18n_unit_time_period:
            condition = {"minimum_rent_period.unit": time_period_unit}
            if time_period_unit == params["minimum_rent_period"]["unit"]:
                condition["minimum_rent_period.value_float"] = {"$gte": params["minimum_rent_period"]["value_float"]}
            else:
                condition["minimum_rent_period.value_float"] = {"$gte": float(f_app.i18n.convert_i18n_unit({"unit": params["minimum_rent_period"]["unit"], "value_float": params["minimum_rent_period"]["value_float"]}, time_period_unit))}
            rent_period_filter.append(condition)
        params["$and"].append({"$or": rent_period_filter})

    if "rent_budget_min" in params or "rent_budget_max" in params:
        # TODO: Currently assuming to be same currency
        price_filter = []
        if "rent_budget_min" in params:
            rent_budget_currency = params["rent_budget_min"]["unit"]
        else:
            rent_budget_currency = params["rent_budget_max"]["unit"]
        for currency in f_app.common.currency:
            condition = {"price.unit": currency}
            if currency == rent_budget_currency:
                condition["price.value_float"] = {}
                if "rent_budget_min" in params:
                    condition["price.value_float"]["$gte"] = params["rent_budget_min"]["value_float"]
                if "rent_budget_max" in params:
                    condition["price.value_float"]["$lte"] = params["rent_budget_max"]["value_float"]
            else:
                condition["price.value_float"] = {}
                if "rent_budget_min" in params:
                    condition["price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": rent_budget_currency, "value_float": params["rent_budget_min"]["value_float"]}, currency))
                if "rent_budget_max" in params:
                    condition["price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": rent_budget_currency, "value_float": params["rent_budget_max"]["value_float"]}, currency))
            price_filter.append(condition)
        params.pop("rent_budget_min", None)
        params.pop("rent_budget_max", None)
        params["$and"].append({"$or": price_filter})

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

    if len(params["$and"]) < 1:
        params.pop("$and")

    sort = params.pop("sort")
    per_page = params.pop("per_page", 0)

    if "status" in params:
        if set(params["status"]) <= set(f_app.common.rent_intention_ticket_statuses):
            params["status"] = {"$in": params["status"]}
        else:
            abort(40093, logger.warning("Invalid params: status", params["status"], exc_info=False))
    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort), enable_custom_fields=enable_custom_fields)


@f_api('/rent_request_ticket/search', params=dict(
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, ["time", 'desc'], str),
    phone=str,
    country="country",
    posttown=str,
    premise=str,
    street=str,
    county=str,
    user_id=ObjectId,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'support', 'jr_support'])
def rent_request_ticket_search(user, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``solved``, ``unsolved``
    """
    params.setdefault("type", "rent_request")
    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)

    per_page = params.pop("per_page", 0)
    sort = params.pop("sort")
    if "status" in params:
        params["status"] = {"$in": params["status"]}

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort))


@f_api('/rent_request_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    postcode=(str, True),
    country=("country", True),
    posttown=str,
    premise=str,
    street=str,
    county=str,
))
def rent_request_ticket_add(params):
    """
    Add a rent_request ticket. ``creator_user_id`` is the result of ``get_id_by_phone``.

    If no id is found, **40324 non-exist user** error will occur.
    """
    params.setdefault("type", "rent_request")

    _find_or_register(params)

    ticket_id = f_app.ticket.add(params)
    return ticket_id


@f_api('/rent_request_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def rent_request_ticket_get(user, ticket_id):
    """
    View single rent_request ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent_request", abort(40000, "Invalid rent_request ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.output([ticket_id])[0]


@f_api('/rent_request_ticket/<ticket_id>/remove')
@f_app.user.login.check(force=True)
def rent_request_ticket_remove(user, ticket_id):
    """
    Remove single rent_request ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent_request", abort(40000, "Invalid rent_request ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    f_app.ticket.update_set_status(ticket_id, "deleted")


@f_api('/rent_request_ticket/<ticket_id>/edit', params=dict(
    country="country",
    posttown=str,
    premise=str,
    street=str,
    county=str,
    status=str,
))
@f_app.user.login.check(force=True)
def rent_request_ticket_edit(user, ticket_id, params):
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent_request", abort(40000, "Invalid rent_request ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    f_app.ticket.update_set(ticket_id, params)
    return f_app.ticket.output([ticket_id])[0]


@f_api('/sell_request_ticket/search', params=dict(
    status=(list, None, str),
    per_page=int,
    time=datetime,
    sort=(list, ["time", 'desc'], str),
    phone=str,
    country="country",
    posttown=str,
    premise=str,
    street=str,
    county=str,
    user_id=ObjectId,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'support', 'jr_support'])
def sell_request_ticket_search(user, params):
    """
    ``status`` must be one of these values: ``new``, ``assigned``, ``in_progress``, ``solved``, ``unsolved``
    """
    params.setdefault("type", "sell_request")
    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)

    per_page = params.pop("per_page", 0)
    sort = params.pop("sort")
    if "status" in params:
        params["status"] = {"$in": params["status"]}

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort))


@f_api('/sell_request_ticket/add', params=dict(
    nickname=(str, True),
    phone=(str, True),
    postcode=(str, True),
    country=("country", True),
    posttown=str,
    premise=str,
    street=str,
    county=str,
))
def sell_request_ticket_add(params):
    """
    Add a sell_request ticket. ``creator_user_id`` is the result of ``get_id_by_phone``.

    If no id is found, **40324 non-exist user** error will occur.
    """
    params.setdefault("type", "sell_request")
    _find_or_register(params)

    ticket_id = f_app.ticket.add(params)
    return ticket_id


@f_api('/sell_request_ticket/<ticket_id>')
@f_app.user.login.check(force=True)
def sell_request_ticket_get(user, ticket_id):
    """
    View single sell_request ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "sell_request", abort(40000, "Invalid sell_request ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    return f_app.ticket.output([ticket_id])[0]


@f_api('/sell_request_ticket/<ticket_id>/remove')
@f_app.user.login.check(force=True)
def sell_request_ticket_remove(user, ticket_id):
    """
    Remove single sell_request ticket.
    """
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "sell_request", abort(40000, "Invalid sell_request ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    f_app.ticket.update_set_status(ticket_id, "deleted")


@f_api('/sell_request_ticket/<ticket_id>/edit', params=dict(
    country="country",
    posttown=str,
    premise=str,
    street=str,
    county=str,
    status=str,
))
@f_app.user.login.check(force=True)
def sell_request_ticket_edit(user, ticket_id, params):
    user_roles = f_app.user.get_role(user["id"])
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "sell_request", abort(40000, "Invalid sell_request ticket")

    if set(user_roles) & set(["admin", "jr_admin", "sales"]):
        pass
    elif ticket.get("creator_user_id") != user["id"] and ticket.get("user_id") != user["id"]:
        abort(40399, logger.warning("Permission denied.", exc_info=False))

    f_app.ticket.update_set(ticket_id, params)
    return f_app.ticket.output([ticket_id])[0]


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
    shadow_user_id = _find_or_register(params)

    ticket_id = f_app.ticket.add(params)
    # ticket_admin_url = "http://" + request.urlparts[1] + "/admin#/ticket/"
    # Send mail to every senior support
    support_list = f_app.user.get(f_app.user.search({"role": {"$in": ["support"]}}))
    for support in support_list:
        if "email" in support:
            f_app.email.schedule(
                target=support["email"],
                subject=template("static/emails/new_intention_ticket_title"),
                text=template("static/emails/new_intention_ticket", params=params),
                display="html",
                tag="new_intention_ticket",
            )

    if shadow_user_id:
        f_app.user.counter_update(shadow_user_id, "support")

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
    deposit="i18n:currency",
    landlord_type="enum:landlord_type",
    bill_covered=bool,
    custom_fields=(list, None, dict(
        key=(str, True),
        value=(str, True),
    )),
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
    params.setdefault("sort_time", datetime.utcnow())

    _find_or_register(params, allow_draft=True)

    ticket_id = f_app.ticket.add(params)
    return ticket_id


@f_api('/rent_ticket/<ticket_id>/refresh')
@f_app.user.login.check(check_role=True)
def rent_ticket_refresh(ticket_id, user):
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")
    if ticket.get("creator_user_id") or ticket.get("user_id"):
        if not user or user["id"] not in (ticket.get("user_id"), ticket.get("creator_user_id")) and not (set(user["role"]) & set(["admin", "jr_admin", "support"])):
            abort(40399, logger.warning("Permission denied", exc_info=False))

    refreshed_today = f_app.log.search({"type": "ticket_refresh", "id": ObjectId(user["id"]), "time": {"$gte": datetime.utcnow() - timedelta(days=1)}}, per_page=1)
    if refreshed_today:
        abort(40397)

    result = f_app.ticket.update_set(ticket_id, {"sort_time": datetime.utcnow()})
    log_params = f_app.plugin_invoke("ticket.add.log_params", {}, ticket_id, ticket, user)
    f_app.log.add("ticket_refresh", ticket_id=ticket_id, **log_params)
    return result


@f_api('/rent_ticket/<ticket_id>/edit', params=dict(
    status=str,
    phone=str,
    email=str,
    nickname=str,
    title=str,
    description=str,
    rent_type="enum:rent_type",
    space=("i18n:area", None, "meter ** 2, foot ** 2"),
    property_id=ObjectId,
    price="i18n:currency",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    deposit="i18n:currency",
    landlord_type="enum:landlord_type",
    bill_covered=bool,
    unset_fields=(list, None, str),
    custom_fields=(list, None, dict(
        key=(str, True),
        value=(str, True),
    )),
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

    if ticket.get("creator_user_id") or ticket.get("user_id"):
        if not user or user["id"] not in (ticket.get("user_id"), ticket.get("creator_user_id")) and not (set(user["role"]) & set(["admin", "jr_admin", "support"])):
            abort(40399, logger.warning("Permission denied", exc_info=False))
    if user:
        if "phone" in params:
            _find_or_register(params)
        else:
            if not ticket.get("creator_user_id"):
                params["creator_user_id"] = ObjectId(user["id"])
            if not ticket.get("user_id"):
                params["user_id"] = ObjectId(user["id"])

    params.pop("phone", None)
    params.pop("email", None)
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

    def mask(user_details):
        user_details["email"] = "services@youngfunding.co.uk"
        user_details["wechat"] = "yangfd1"
        user_details.pop("phone", None)
        user_details["private_contact_methods"] = ["phone"]

    user_details = f_app.user.output([ticket["creator_user_id"]], custom_fields=f_app.common.user_custom_fields)[0]

    order_id_list = f_app.order.search({
        "items.id": f_app.common.view_rent_ticket_contact_info_id,
        "ticket_id": ticket_id,
        "user.id": user["id"],
        "status": "paid",
    })
    if not len(order_id_list):
        # BUY BUY BUY
        passes = f_app.user.credit.get("view_rent_ticket_contact_info", amount_only=True)
        if passes:
            order_id = f_app.shop.item.buy(f_app.common.view_rent_ticket_contact_info_id, order_params={"ticket_id": ticket_id}, params={"payment_method": "deadbeef"})
            order = f_app.order.get(order_id)
            if order["status"] != "paid":
                mask(user_details)
        else:
            mask(user_details)

    f_app.log.add("rent_ticket_view_contact_info", ticket_id=ticket_id)
    return user_details


@f_api('/rent_ticket/search', params=dict(
    status=(list, ["to rent"], str),
    per_page=int,
    last_modified_time=datetime,
    sort_time=datetime,
    time=datetime,
    sort=(list, ["sort_time", 'desc'], str),
    rent_type="enum:rent_type",
    user_id=ObjectId,
    rent_budget_min="i18n:currency",
    rent_budget_max="i18n:currency",
    bedroom_count="enum:bedroom_count",
    building_area="enum:building_area",
    rent_available_time=datetime,
    rent_deadline_time=datetime,
    minimum_rent_period="i18n:time_period",
    space=("enum:building_area"),
    property_type=(list, None, "enum:property_type"),
    intention=(list, None, "enum:intention"),
    landlord_type=(list, None, "enum:landlord_type"),
    country='country',
    city='geonames_gazetteer:city',
    maponics_neighborhood="maponics_neighborhood",
    hesa_university=ObjectId,
    location_only=bool,
    latitude=float,
    longitude=float,
    search_range=(int, 5000),
    partner=bool,
    short_id=str,
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

    params["$and"] = []
    property_params = {"$and": []}
    non_project_params = {"$and": []}
    main_house_types_elem_params = {"$and": []}

    if "user_id" in params:
        params["$and"].append({"$or": [{"user_id": params["user_id"]}, {"creator_user_id": params["user_id"]}]})
        params.pop("user_id")

    if "hesa_university" in params:
        assert "latitude" not in params, abort(40000)
        hesa_university = f_app.hesa.university.get(str(params.pop("hesa_university")))
        postcode = f_app.geonames.postcode.get(f_app.geonames.postcode.search({"postcode": hesa_university["postcode"]}, per_page=-1))[0]
        params["latitude"] = postcode["latitude"]
        params["longitude"] = postcode["longitude"]

    location_only = params.pop("location_only", False)
    if location_only and "latitude" not in params:
        property_params["loc"] = {"$exists": True}

    if "latitude" in params:
        assert "longitude" in params, abort(40000)
        assert "per_page" not in params, abort(40000)
        property_params["latitude"] = params.pop("latitude")
        property_params["longitude"] = params.pop("longitude")
        property_params["search_range"] = params.pop("search_range")
    elif "longitude" in params:
        abort(40000)
    else:
        params.pop("search_range")

    if "landlord_type" in params:
        params["landlord_type"] = {"$in": params["landlord_type"]}

    if "property_type" in params:
        property_params["property_type"] = {"$in": params.pop("property_type")}

    if "intention" in params:
        property_params["intention"] = {"$in": params.pop("intention")}

    if "city" in params:
        property_params["city"] = params.pop("city")

    if "country" in params:
        property_params["country"] = params.pop("country")

    if "partner" in params:
        property_params["partner"] = params.pop("partner")

    if "short_id" in params:
        property_params["short_id"] = params.pop("short_id")

    f_app.util.check_and_override_minimum_rent_period(params)

    if "rent_available_time" in params:
        params["rent_available_time"] = {"$gte": params["rent_available_time"] - timedelta(days=7), "$lte": params["rent_available_time"] + timedelta(days=1)}

    if "rent_deadline_time" in params:
        params["$and"].append({"$or": [{"rent_deadline_time": {"$gte": params["rent_deadline_time"] - timedelta(days=1)}}, {"rent_deadline_time": {"$exists": False}}]})

    params.pop("rent_deadline_time", None)

    if "minimum_rent_period" in params:
        rent_period_filter = []
        for time_period_unit in f_app.common.i18n_unit_time_period:
            condition = {"minimum_rent_period.unit": time_period_unit}
            if time_period_unit == params["minimum_rent_period"]["unit"]:
                condition["minimum_rent_period.value_float"] = {"$gte": params["minimum_rent_period"]["value_float"]}
            else:
                condition["minimum_rent_period.value_float"] = {"$gte": float(f_app.i18n.convert_i18n_unit({"unit": params["minimum_rent_period"]["unit"], "value_float": params["minimum_rent_period"]["value_float"]}, time_period_unit))}
            rent_period_filter.append(condition)
        params["$and"].append({"$or": rent_period_filter})

    if "rent_budget_min" in params or "rent_budget_max" in params:
        # TODO: Currently assuming to be same currency
        price_filter = []
        if "rent_budget_min" in params:
            rent_budget_currency = params["rent_budget_min"]["unit"]
        else:
            rent_budget_currency = params["rent_budget_max"]["unit"]
        for currency in f_app.common.currency:
            condition = {"price.unit": currency}
            if currency == rent_budget_currency:
                condition["price.value_float"] = {}
                if "rent_budget_min" in params:
                    condition["price.value_float"]["$gte"] = params["rent_budget_min"]["value_float"]
                if "rent_budget_max" in params:
                    condition["price.value_float"]["$lte"] = params["rent_budget_max"]["value_float"]
            else:
                condition["price.value_float"] = {}
                if "rent_budget_min" in params:
                    condition["price.value_float"]["$gte"] = float(f_app.i18n.convert_currency({"unit": rent_budget_currency, "value_float": params["rent_budget_min"]["value_float"]}, currency))
                if "rent_budget_max" in params:
                    condition["price.value_float"]["$lte"] = float(f_app.i18n.convert_currency({"unit": rent_budget_currency, "value_float": params["rent_budget_max"]["value_float"]}, currency))
            price_filter.append(condition)
        params.pop("rent_budget_min", None)
        params.pop("rent_budget_max", None)
        params["$and"].append({"$or": price_filter})

    if "bedroom_count" in params:
        bedroom_count = f_app.util.parse_bedroom_count(params.pop("bedroom_count"))
        if bedroom_count[0] is not None and bedroom_count[1] is not None:
            if bedroom_count[0] == bedroom_count[1]:
                bedroom_filter = bedroom_count[0]
            elif bedroom_count[0] > bedroom_count[1]:
                abort(40000, logger.warning("Invalid bedroom_count: start value cannot be greater than end value"))
            else:
                bedroom_filter = {"$gte": bedroom_count[0], "$lte": bedroom_count[1]}
        elif bedroom_count[0] is not None:
            bedroom_filter = {"$gte": bedroom_count[0]}
        elif bedroom_count[1] is not None:
            bedroom_filter = {"$lte": bedroom_count[1]}
        else:
            bedroom_filter = None

        if bedroom_filter is not None:
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

    if "maponics_neighborhood" in params:
        property_params["$and"].append({"$or": [
            {"maponics_neighborhood": params["maponics_neighborhood"]},
            {"maponics_parent_neighborhood": params["maponics_neighborhood"]},
        ]})
        params.pop("maponics_neighborhood")

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

    return f_app.ticket.output(f_app.ticket.search(params=params, per_page=per_page, sort=sort, time_field=sort[0]), fuzzy_user_info=fuzzy_user_info, location_only=location_only)


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


@f_api('/rent_ticket/<ticket_id>/suspend')
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def rent_ticket_suspend(ticket_id, user):
    """
    Force a ticket back to "draft" and notice the user.
    """
    ticket = f_app.ticket.get(ticket_id)
    assert ticket["type"] == "rent", abort(40000, "Invalid rent ticket")
    ticket = f_app.ticket.update_set(ticket_id, {"status": "draft"})

    ticket = f_app.ticket.output([ticket_id])[0]
    ticket_email_user = f_app.util.ticket_determine_email_user(ticket)
    if ticket_email_user:
        title = "您发布的房源已被认定为违规发布，请修改后重新发布"
        f_app.email.schedule(
            target=ticket_email_user["email"],
            subject=title,
            text=template(
                "static/emails/rent_suspend_notice",
                nickname=ticket_email_user.get("nickname"),
                date='',  # TODO
                rent_title=ticket["title"],
                rent_url="http://yangfd.com/property-to-rent/" + ticket_id,
                rent_edit_url="http://yangfd.com/property-to-rent/" + ticket_id + "/edit",
                title=title,
                tag="rent_suspend_notice",
            ),
            display="html",
        )

    return ticket


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

    _find_or_register(params)

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

    if ticket.get("creator_user_id") or ticket.get("user_id"):
        if not user or user["id"] not in (ticket.get("user_id"), ticket.get("creator_user_id")) and not (set(user["role"]) & set(["admin", "jr_admin", "support"])):
            abort(40399, logger.warning("Permission denied", exc_info=False))
    if user:
        if "creator_user_id" not in params:
            params["creator_user_id"] = ObjectId(user["id"])
        if "user_id" not in params:
            params["user_id"] = ObjectId(user["id"])

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
        if bedroom_count[0] is not None and bedroom_count[1] is not None:
            if bedroom_count[0] == bedroom_count[1]:
                bedroom_filter = bedroom_count[0]
            elif bedroom_count[0] > bedroom_count[1]:
                abort(40000, logger.warning("Invalid bedroom_count: start value cannot be greater than end value"))
            else:
                bedroom_filter = {"$gte": bedroom_count[0], "$lte": bedroom_count[1]}
        elif bedroom_count[0] is not None:
            bedroom_filter = {"$gte": bedroom_count[0]}
        elif bedroom_count[1] is not None:
            bedroom_filter = {"$lte": bedroom_count[1]}
        else:
            bedroom_filter = None

        if bedroom_filter is not None:
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
