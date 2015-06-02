# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from bson.objectid import ObjectId
from libfelix.f_interface import f_api, abort, rate_limit, template, request
from copy import copy
import random
import logging
logger = logging.getLogger(__name__)


@f_api('/user')
@f_app.user.login.check(force=True)
def current_user(user):
    """
    Get current user information
    """
    custom_fields = copy(f_app.common.user_custom_fields)
    custom_fields.append("idcard")
    result = f_app.user.output([user["id"]], custom_fields=custom_fields)[0]
    return result


@f_api('/user/authenticate')
@f_app.user.login.check(force=True)
def user_authenticate(user):
    """
    Authenticate current user's nickname and idcard
    """
    f_app.user.update_set(user["id"], {"is_authenticated": True})
    custom_fields = copy(f_app.common.user_custom_fields)
    custom_fields.append("idcard")
    result = f_app.user.output([user["id"]], custom_fields=custom_fields)[0]
    return result


@f_api('/user/favorite', params=dict(
    per_page=int,
    time=datetime,
    type=(str, True),
))
@f_app.user.login.check(force=True)
def current_user_favorites(user, params):
    """
    Get current user favorites
    use ``type`` to get item for property favorite. Possible values: ``property``, ``item``, ``rent_ticket``, ``sale_ticket``.
    """
    assert params["type"] in ("property", "item", "rent_ticket", "sale_ticket"), abort(40000, logger.warning("Invalid params: invalid favorite type", exc_info=False))
    per_page = params.pop("per_page", 0)
    params["user_id"] = ObjectId(user["id"])
    result = f_app.user.favorite.output(f_app.user.favorite_search(params, per_page=per_page), ignore_nonexist=True)
    return result


@f_api('/user/favorite/add', params=dict(
    property_id=ObjectId,
    item_id=ObjectId,
    ticket_id=ObjectId,
    type=(str, True),
))
@f_app.user.login.check(force=True)
def current_user_favorites_add(user, params):
    """
    Get current user favorites
    Please specify ``type`` when calling this API. Possible values: ``property``, ``item``, ``rent_ticket``, ``sale_ticket``.
    """
    assert params["type"] in ("property", "item", "rent_ticket", "sale_ticket"), abort(40000, logger.warning("Invalid params: invalid favorite type", exc_info=False))
    if params["type"] == "property" and "property_id" in params:
        property = f_app.property.get(params["property_id"])
        assert property["status"] in ["selling", "sold out"], abort(40398, logger.warning("Permission denied: not a valid property_id", exc_info=False))
        params["user_id"] = ObjectId(user["id"])
        result = f_app.user.favorite_search(params)
        if result:
            abort(40090, logger.warning("Invalid operation: This property has already been added to your favorites.", exc_info=False))
    elif params["type"] == "item" and "item_id" in params:
        item = f_app.shop.item.get(params["item_id"])
        assert item["status"] in ["new", "sold out"], abort(40398, logger.warning("Permission denied: not a valid item_id", exc_info=False))
        params["user_id"] = ObjectId(user["id"])
        result = f_app.user.favorite_search(params)
        if result:
            abort(40090, logger.warning("Invalid operation: This item has already been added to your favorites.", exc_info=False))
    elif params["type"] in ("rent_ticket", "sale_ticket") and "ticket_id" in params:
        ticket = f_app.ticket.get(params["ticket_id"])
        assert ticket["type"] == params["type"][:-7] and ticket["status"] in ("for sale", "to rent", "sold", "rent"), abort(40398, logger.warning("Permission denied: not a valid ticket_id", exc_info=False))
        params["user_id"] = ObjectId(user["id"])
        result = f_app.user.favorite_search(params)
        if result:
            abort(40090, logger.warning("Invalid operation: This ticket has already been added to your favorites.", exc_info=False))
    else:
        abort(40000, logger.warning("Invalid operation: params not correct", exc_info=False))

    return f_app.user.favorite_add(params)


@f_api('/user/favorite/remove', params=dict(
    property_id=ObjectId,
    item_id=ObjectId,
    ticket_id=ObjectId,
    type=(str, True),
))
@f_app.user.login.check(force=True)
def current_user_favorite_remove(user, params):
    """
    Remove a favorited item by their own id

    Please specify ``type`` when calling this API. Possible values: ``property``, ``item``, ``rent_ticket``, ``sale_ticket``.
    """
    assert params["type"] in ("property", "item", "rent_ticket", "sale_ticket"), abort(40000, logger.warning("Invalid params: invalid favorite type", exc_info=False))
    if params["type"] == "property" and "property_id" in params:
        property = f_app.property.get(params["property_id"])
        assert property["status"] in ["selling", "sold out"], abort(40398, logger.warning("Permission denied: not a valid property_id", exc_info=False))
    elif params["type"] == "item" and "item_id" in params:
        item = f_app.shop.item.get(params["item_id"])
        assert item["status"] in ["new", "sold out"], abort(40398, logger.warning("Permission denied: not a valid item_id", exc_info=False))
    elif params["type"] in ("rent_ticket", "sale_ticket") and "ticket_id" in params:
        ticket = f_app.ticket.get(params["ticket_id"])
        assert ticket["type"] == params["type"][:-7] and ticket["status"] in ("for sale", "to rent", "sold", "rent"), abort(40398, logger.warning("Permission denied: not a valid ticket_id", exc_info=False))
    else:
        abort(40000, logger.warning("Invalid operation: params not correct", exc_info=False))

    params["user_id"] = ObjectId(user["id"])
    result = f_app.user.favorite_search(params)
    if not result:
        abort(40400)
    elif len(result) > 1:
        logger.error("WTF?")

    return f_app.user.favorite_remove(result[0])


@f_api('/user/favorite/<favorite_id>/remove')
@f_app.user.login.check(force=True)
def current_user_favorite_remove_by_favorite_id(user, favorite_id):
    """
    Remove a favorited item by favorite id
    """
    assert str(f_app.user.favorite_get(favorite_id)["user_id"]) == user["id"], abort(40399)
    return f_app.user.favorite.remove(favorite_id)


@f_api('/user/favorite/<favorite_id>')
@f_app.user.login.check(force=True)
def current_user_favorite_get(user, favorite_id):
    """
    Get a favorited item
    """
    result = f_app.user.favorite.output([favorite_id], ignore_user=False)[0]
    if str(result["user_id"]) == user["id"]:
        return result
    else:
        abort(40399)


@f_api('/user/login', force_ssl=True, params=dict(
    nolog="password",
    phone=(str, True),
    country="country",
    password=(str, True, "notrim", "base64"),
))
@rate_limit("login", ip=20)
def user_login(params):
    """
    Password must be base64 encoded.
    """
    params["phone"] = f_app.util.parse_phone(params)
    user_id = f_app.user.login.auth(params["phone"], params["password"])
    user = f_app.user.login.success(user_id)

    result = f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields, user=user)[0]
    return result


@f_api('/user/register', params=dict(
    nolog="password",
    nickname=(str, True),
    password=(str, True, "notrim", "base64"),
    phone=(str, True),
    country=("country", True),
    occupation="enum:occupation",
    email=str,
    solution=(str, True),
    challenge=(str, True),
    locales=(list, None, str),
    currency=(list, None, str),
    budget="enum:budget",
    is_vip=bool,
    invitation_code=str,
))
@rate_limit("register", ip=10)
def user_register(params):
    """
    Basic user register

    ``password`` must be base64 encoded.

    ``solution``  the solution user enters  in ``recaptcha_response_field``

    ``challenge`` describes the CAPTCHA which the user is solving, it's value is in ``recaptcha_challenge_field``

    ``occupation`` must be ``student`` or ``professional``.

    """
    params["email_message_type"] = params["system_message_type"] = ["system", "favorited_property_news", "intention_property_news", "my_property_news"]
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)
    if f_app.user.get_id_by_phone(params["phone"]):
        abort(40351)

    f_app.captcha.validate(params["solution"], params["challenge"])

    user_id = f_app.user.add(params, retain_country=True)

    f_app.user.login.success(user_id)
    f_app.log.add("login", user_id=user_id)
    f_app.user.counter_update(user_id)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api('/user/fast-register', params=dict(
    nolog="password",
    email=(str, True),
    nickname=(str, True),
    phone=(str, True),
    country=("country", True),
    locales=(list, None, str),
    occupation="enum:occupation",
    invitation_code=str,
))
@rate_limit("register", ip=5)
def user_fast_register(params):
    """
    Basic user register, the faster way.

    Password will be generated and sent to the provided mailbox, and SMS verification code will be sent immediately after registration.
    """

    if "@" not in params["email"]:
        abort(40099, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))

    params["phone"] = f_app.util.parse_phone(params, retain_country=True)

    if f_app.user.get_id_by_email(params["email"]):
        abort(40325)
    if f_app.user.get_id_by_phone(params["phone"]):
        abort(40351)

    password = "".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)]).lower()
    params["password"] = password

    user_id = f_app.user.add(params, retain_country=True)
    f_app.log.add("add", user_id=user_id)

    locale = params["locales"][0] if "locales" in params and params["locales"] else f_app.common.i18n_default_locale
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
            "%nickname%": [params["nickname"]],
            "%phone%": [params["phone"]],
            "%password%": [params["password"]],
            "%logo_url%": [f_app.common.email_template_logo_url]
        }
    }
    xsmtpapi = substitution_vars
    xsmtpapi["category"] = ["new_user"]
    xsmtpapi["template_id"] = sendgrid_template_id
    f_app.email.schedule(
        target=params["email"],
        subject=f_app.util.get_format_email_subject(template("static/emails/new_user_title")),
        text=template("static/emails/new_user", password=params["password"], nickname=params["nickname"], phone=params["phone"]),
        display="html",
        substitution_vars=substitution_vars,
        template_invoke_name=template_invoke_name,
        xsmtpapi=xsmtpapi,
    )
    f_app.user.login.success(user_id)
    f_app.user.sms.request(user_id)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api('/user/edit', force_ssl=True, params=dict(
    nolog=("password", "old_password"),
    nickname=str,
    first_name=str,
    last_name=str,
    phone=str,
    city="geonames_gazetteer:city",
    state=("enum:state", None),
    country=("country", None),
    address1=str,
    address2=str,
    zipcode=str,
    email=str,
    password=(str, None, "notrim", "base64"),
    old_password=(str, None, "notrim", "base64"),
    gender=str,
    date_of_birth=datetime,
    intention=(list, None, "enum:intention"),
    locales=(list, None, str),
    currency=(list, None, str),
    wechat_id=None,
    budget=("enum:budget", None),
    system_message_type=(list, None, str),
    email_message_type=(list, None, str),
    unset_fields=(list, None, str),
    idcard=(list, None, str),
))
@f_app.user.login.check(force=True)
def current_user_edit(user, params):
    """
    Edit current user basic information.

    ``gender`` should be in ``male``, ``female``, ``other``.

    ``system_message_type`` and ``email_message_type`` are the message types that user accepts. It should be the subset of ``system``, ``favorited_property_news``, ``intention_property_news``, ``my_property_news``.
    """
    unset_fields = params.pop("unset_fields", [])

    if "email" in params:
        if "@" not in params["email"]:
            abort(40099, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))
        if f_app.user.get_id_by_email(params["email"]):
            abort(40325)

    if "password" in params:
        user = f_app.user.get(user["id"])

        if "old_password" not in params:
            abort(40098, logger.warning("Invalid params: current password not provided", exc_info=False))

        if "password" in user and "phone" in user:
            f_app.user.login.auth(user["phone"], params.pop("old_password"), auth_only=True)

    elif "old_password" in params:
        abort(40097, "Invalid params: old_password not needed")

    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params, retain_country=True)
        user_id = f_app.user.get_id_by_phone(params["phone"])
        if user_id and user_id != user["id"]:
            abort(40351)

    if "gender" in params:
        if params["gender"] not in ("male", "female", "other"):
            abort(40096, logger.warning("Invalid params: gender", params["gender"], exc_info=False))

    if "system_message_type" in params:
        if not set(params["system_message_type"]) <= set(f_app.common.message_type):
            abort(40000, logger.warning("Invalid params: system_message_type", params["system_message_type"], exc_info=False))

    if "email_message_type" in params:
        if not set(params["email_message_type"]) <= set(f_app.common.message_type):
            abort(40000, logger.warning("Invalid params: email_message_type", params["email_message_type"], exc_info=False))

    f_app.user.update_set(user["id"], params)

    if unset_fields:
        f_app.user.update(user["id"], {"$unset": {i: "" for i in unset_fields}})

    custom_fields = copy(f_app.common.user_custom_fields)
    custom_fields.append("idcard")

    return f_app.user.output([user["id"]], custom_fields=custom_fields)[0]


@f_api("/user/admin/search", params=dict(
    per_page=int,
    register_time=datetime,
    role=str,
    phone=str,
    country="country",
    has_role=bool,
    has_intention_ticket=bool,
    has_register_time=bool,
    query=str,
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def admin_user_search(user, params):
    """
    Use this to search for users with roles.

    ``admin`` can search for everyone.

    ``jr_admin`` can search for every role except ``admin``.

    All senior roles can search for themselves and their junior roles.

    Only users with roles will be returned if ``has_role`` is true.

    If ``has_role`` is false, only users without roles will be returned.

    All users can be fetched if ``has_role`` is not given.

    ``has_intention_ticket`` and ``has_register_time`` work like above.

    """
    user_roles = f_app.user.get_role(user["id"])
    if "has_role" in params:
        has_role = params.pop("has_role")
        if has_role:
            params["role"] = {"$not": {"$size": 0}}
        else:
            params["role"] = {"$nin": f_app.common.admin_roles}
    if "role" in params:
        if not f_app.user.check_set_role_permission(user["id"], params["role"]):
            abort(40399, logger.warning("Permission denied", exc_info=False))
    else:
        if "admin" in user_roles:
            pass
        elif "jr_admin" in user_roles:
            params["role"]["$nin"] = ["admin"]
        elif "sales" in user_roles:
            params["role"]["$nin"] = ["admin", "jr_admin", "operation", "jr_operation", "support", "jr_support", "developer", "agency"]
        elif "operation" in user_roles:
            params["role"]["$nin"] = ["admin", "jr_admin", "sales", "jr_sales", "support", "jr_support", "developer", "agency"]
        else:
            # support
            params["role"]["$nin"] = ["admin", "jr_admin", "sales", "jr_sales", "operation", "jr_operation", "developer", "agency"]

    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)
    per_page = params.pop("per_page", 0)
    if "has_intention_ticket" in params:
        if params.pop("has_intention_ticket", False):
            params["counter.intention"] = {"$gt": 0}
        else:
            params["counter.intention"] = 0
    if "has_register_time" in params:
        if params.pop("has_register_time", True):
            params["register_time"] = {"$exists": True}
        else:
            params["register_time"] = {"$exists": False}

    logger.debug(params)
    return f_app.user.output(f_app.user.custom_search(params=params, per_page=per_page), custom_fields=f_app.common.user_custom_fields)


@f_api('/user/admin/add', params=dict(
    nolog="password",
    email=(str, True),
    nickname=(str, True),
    phone=(str, True),
    role=(list, True, str),
    country=("country", True),
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def admin_user_add(user, params):
    """
    Add a new admin.

    Password is generated randomly.
    """
    for r in params["role"]:
        if r not in f_app.common.admin_roles:
            abort(40091, logger.warning("Invalid params: role", r, exc_info=False))
        if not f_app.user.check_set_role_permission(user["id"], r):
            abort(40399, logger.warning('Permission denied.', exc_info=False))

    if "@" not in params["email"]:
        abort(40099, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))

    params["phone"] = f_app.util.parse_phone(params, retain_country=True)

    if f_app.user.get_id_by_email(params["email"]):
        abort(40325)
    if f_app.user.get_id_by_phone(params["phone"]):
        abort(40351)

    password = "".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)])
    params["password"] = password

    user_id = f_app.user.add(params, retain_country=True)
    f_app.log.add("add", user_id=user_id)

    if f_app.common.use_ssl:
        schema = "https://"
    else:
        schema = "http://"
    admin_console_url = "%s%s/admin#" % (schema, request.urlparts[1])

    if f_app.common.i18n_default_locale in ["zh_Hans_CN", "zh_Hant_HK"]:
        template_invoke_name = "new_admin_cn"
        sendgrid_template_id = "d224c59f-76ee-49be-be7d-35695bc4d090"
    else:
        template_invoke_name = "new_admin_en"
        sendgrid_template_id = "0ada154f-0b38-473a-8e01-87dcdb827f6f"
    roles = template("static/emails/new_admin_role", role=params["role"])
    substitution_vars = {
        "to": [params["email"]],
        "sub": {
            "%nickname%": [params["nickname"]],
            "%password%": [params["password"]],
            "%role%": [roles],
            "%admin_console_url%": [admin_console_url],
            "%phone%": ["*" * (len(params["phone"]) - 4) + params["phone"][-4:]],
            "%logo_url%": [f_app.common.email_template_logo_url]
        }
    }
    xsmtpapi = substitution_vars
    xsmtpapi["category"] = ["new_admin"]
    xsmtpapi["template_id"] = sendgrid_template_id

    f_app.email.schedule(
        target=params["email"],
        subject=f_app.util.get_format_email_subject(template("static/emails/new_admin_title")),
        text=template("static/emails/new_admin", password=params["password"], nickname=params["nickname"], role=params[
            "role"], admin_console_url=admin_console_url, phone="*" * (len(params["phone"]) - 4) + params["phone"][-4:]),
        display="html",
        template_invoke_name=template_invoke_name,
        substitution_vars=substitution_vars,
        xsmtpapi=xsmtpapi
    )

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/<user_id>/add_role", params=dict(
    role=(str, True),
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def admin_user_add_role(user, user_id, params):
    """
    Add single role to specific user.
    """
    role = params["role"]
    user_info = f_app.user.get(user_id)
    if role not in f_app.common.admin_roles:
        abort(40091, logger.warning("Invalid params: role", role, exc_info=False))
    if not f_app.user.check_set_role_permission(user["id"], role):
        abort(40399, logger.warning('Permission denied.', exc_info=False))
    user_roles = user_info.get('role', [])
    if role not in user_roles:
        f_app.user.add_role(user_id, role)
        if user_info.get("email") is not None:
            if f_app.common.use_ssl:
                schema = "https://"
            else:
                schema = "http://"
            admin_console_url = "%s%s/admin#" % (schema, request.urlparts[1])
            locale = user_info.get("locales", [f_app.common.i18n_default_locale])[0]
            request._requested_i18n_locales_list = [locale]
            if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
                template_invoke_name = "set_as_admin_cn"
                sendgrid_template_id = "b3a978ac-5096-4633-a505-d76041b314f2"
            else:
                template_invoke_name = "set_as_admin_en"
                sendgrid_template_id = "26a4015b-65c3-4097-b9b6-998cbcc124b5"
            roles = template("static/emails/new_admin_role", role=f_app.user.get_role(user_id))
            substitution_vars = {
                "to": [user_info.get("email")],
                "sub": {
                    "%nickname%": [user_info.get("nickname")],
                    "%role%": [roles],
                    "%admin_console_url%": [admin_console_url],
                    "%phone%": ["*" * (len(user_info["phone"]) - 4) + user_info["phone"][-4:]],
                    "%logo_url%": [f_app.common.email_template_logo_url]
                }
            }
            xsmtpapi = substitution_vars
            xsmtpapi["category"] = ["set_as_admin"]
            xsmtpapi["template_id"] = sendgrid_template_id
            f_app.email.schedule(
                target=user_info.get("email"),
                subject=f_app.util.get_format_email_subject(template("static/emails/set_as_admin_title")),
                text=template("static/emails/set_as_admin", nickname=user_info.get("nickname"), role=f_app.user.get_role(user_id), admin_console_url=admin_console_url, phone="*" * (len(user_info["phone"]) - 4) + user_info["phone"][-4:]),
                display="html",
                template_invoke_name=template_invoke_name,
                substitution_vars=substitution_vars,
                xsmtpapi=xsmtpapi
            )
        else:
            abort(40094, logger.warning('Invalid admin: email not provided.', exc_info=False))

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/<user_id>")
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "sales", "jr_sales"])
def admin_user_get(user, user_id):
    current_user_roles = f_app.user.get_role(user["id"])
    if set(["admin", "jr_admin", "sales"]) & set(current_user_roles):
        pass
    elif not f_app.ticket.search({"assignee": ObjectId(user["id"]), "$or": [{"creator_user_id": ObjectId(user_id)}, {"user_id": ObjectId(user_id)}]}):
        abort(40399)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/<user_id>/favorite", params=dict(
    per_page=int,
    time=datetime,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "sales", "jr_sales"])
def admin_user_get_favorites(user, user_id, params):
    user_info = f_app.user.get(user_id)
    current_user_roles = f_app.user.get_role(user["id"])
    if set(["admin", "jr_admin", "sales"]) & set(current_user_roles):
        pass
    elif not f_app.ticket.search({"assignee": ObjectId(user["id"]), "phone": user_info.get("phone")}):
        abort(40399)

    per_page = params.pop("per_page", 0)
    params["user_id"] = ObjectId(user_id)

    return f_app.user.favorite.output(f_app.user.favorite.search(params, per_page=per_page))


@f_api("/user/admin/<user_id>/statistics", params=dict(
    per_page=int,
    time=datetime,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin", "sales", "jr_sales"])
def admin_user_get_logs(user, user_id, params):
    per_page = params.pop("per_page", 0)
    user_info = f_app.user.get(user_id)
    current_user_roles = f_app.user.get_role(user["id"])
    if set(["admin", "jr_admin", "sales"]) & set(current_user_roles):
        pass
    elif not f_app.ticket.search({"assignee": ObjectId(user["id"]), "phone": user_info.get("phone")}):
        abort(40399)

    params["user_id"] = ObjectId(user_id)
    params["log_type"] = {"$in": f_app.common.user_action_types}

    return f_app.log.output(f_app.log.search(params, per_page=per_page))


@f_api("/user/admin/invite", params=dict(
    email=(str, True),
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def user_admin_invite(user, params):
    code = f_app.user.invitation.add({"role": "beta_renting"})  # , "email": params["email"]})
    logger.debug("Generated invitation code:", code)
    f_app.email.schedule(
        target=params["email"],
        subject="Invitation to YoungFunding",
        text=template(
            "views/static/emails/invitation.html",
            code=code
        ),
        display="html",
    )


@f_api("/user/admin/<user_id>/set_role", params=dict(
    role=(list, True, str)
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def admin_user_set_role(user, user_id, params):
    """
    Use this API to set a list of roles to specific user.

    ``admin`` can set any role.

    ``jr_admin``, ``agency`` and ``developer`` can only be set by ``admin``.

    ``sales`` can set ``sales`` and ``jr_sales``.

    ``operation`` can set ``operation`` and ``jr_operation``.

    ``support`` can set ``support`` and ``jr_support``.
    """
    for r in params["role"]:
        if r not in f_app.common.admin_roles:
            abort(40091, logger.warning("Invalid params: role", r, exc_info=False))
        if not f_app.user.check_set_role_permission(user["id"], r):
            abort(40399, logger.warning('Permission denied.', exc_info=False))

    f_app.user.update_set(user_id, {"role": params["role"]})

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/<user_id>/unset_role", params=dict(
    role=(list, True, str)
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def admin_user_unset_role(user, user_id, params):
    """
    Use this API to remove (a role of an) admin
    """
    user_roles = f_app.user.get_role(user_id)

    for r in params["role"]:
        if r not in f_app.common.admin_roles:
            abort(40091, logger.warning("Invalid params: role", r, exc_info=False))
        elif r in user_roles:
            if not f_app.user.check_set_role_permission(user["id"], r):
                abort(40399, logger.warning('Permission denied.', exc_info=False))
            f_app.user.remove_role(user_id, r)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/check_exist", force_ssl=True, params=dict(
    phone=(str, True),
    country="country",
))
def user_check_exist(params):
    params["phone"] = f_app.util.parse_phone(params)
    return True if f_app.user.get_id_by_phone(params["phone"], force_registered=True) else False


@f_api('/user/phone_test', force_ssl=True, params=dict(
    phone=(str, True),
    country="country",
))
def user_phone_test(params):
    return f_app.util.parse_phone(params)


@f_api('/user/sms_verification/send', force_ssl=True, params=dict(
    phone=(str, True),
    country="country",
))
@rate_limit("sms_verification", ip=10)
def user_sms_verification_send(params):
    """
    Verify for phone only.

    Return value will always be the corresponding user id, save it for calling Verify API later!
    """
    params["phone"] = f_app.util.parse_phone(params)
    user_id = f_app.user.get_id_by_phone(params['phone'])

    if user_id is None:
        abort(40324)

    f_app.user.sms.request(user_id, allow_verified=True)
    return user_id


@f_api('/user/<user_id>/sms_verification/verify', force_ssl=True, params=dict(
    code=(str, True),
))
@rate_limit("sms_verification", ip=10)
def user_sms_verification_verify(user_id, params):
    f_app.user.sms.verify(user_id, params["code"])
    user = f_app.user.login.success(user_id)
    f_app.log.add("login", user_id=user_id)

    result = f_app.user.output([str(user_id)], user=user, custom_fields=f_app.common.user_custom_fields)[0]
    return result


@f_api("/user/<user_id>/sms_reset_password", force_ssl=True, params=dict(
    nolog=("new_password"),
    code=(str, True),
    new_password=(str, True, "notrim", "base64"),
))
@rate_limit("sms_reset", ip=5)
def user_sms_reset_password(user_id, params):
    f_app.user.sms.verify(user_id, params["code"])
    f_app.user.update_set_key(user_id, "password", params["new_password"])

    user = f_app.user.login.success(user_id)
    f_app.log.add("login", user_id=user_id)

    result = f_app.user.output([str(user_id)], user=user, custom_fields=f_app.common.user_custom_fields)[0]
    return result


@f_api('/user/<user_id>/email_verification/send')
@rate_limit("email_verification_send", ip=20)
def email_send(user_id):
    """
    rate_limit is 20 ip per hour.
    """
    user = f_app.user.get(user_id)
    if "email" not in user:
        abort(40000, logger.warning("Invalid user: email not provided.", exc_info=False))
    if f_app.common.use_ssl:
        schema = "https://"
    else:
        schema = "http://"
    verification_url = schema + request.urlparts[1] + "/verify_email_status?code=" + f_app.user.email.request(user_id) + "&user_id=" + user_id
    locale = user.get("locales", [f_app.common.i18n_default_locale])[0]
    request._requested_i18n_locales_list = [locale]
    if locale in ["zh_Hans_CN", "zh_Hant_HK"]:
        template_invoke_name = "verify_email_cn"
        sendgrid_template_id = "099f8043-7390-4e59-b171-1d0071c7e12a"
    else:
        template_invoke_name = "verify_email_en"
        sendgrid_template_id = "35408672-ce97-49bd-9544-e25767e2bbf3"
    substitution_vars = {
        "to": [user.get("email")],
        "sub": {
            "%nickname%": [user.get("nickname")],
            "%verification_url%": [verification_url],
            "%logo_url%": [f_app.common.email_template_logo_url]
        }
    }
    xsmtpapi = substitution_vars
    xsmtpapi["category"] = ["email_verification_send"]
    xsmtpapi["template_id"] = sendgrid_template_id

    f_app.email.schedule(
        target=user["email"],
        subject=f_app.util.get_format_email_subject(template("static/emails/verify_email_title")),
        text=template("static/emails/verify_email", verification_url=verification_url, nickname=user.get("nickname")),
        display="html",
        template_invoke_name=template_invoke_name,
        substitution_vars=substitution_vars,
        xsmtpapi=xsmtpapi

    )


@f_api('/user/<user_id>/email_verification/verify', params=dict(
    code=(str, True),
))
@rate_limit("email_verification", ip=20)
def email_verify(user_id, params):
    """
    rate_limit is 20 ip per hour
    """
    f_app.user.email_verify(user_id, params["code"])
    user = f_app.user.login.success(user_id)
    f_app.log.add("login", user_id=user_id)

    result = f_app.user.output([user_id], user=user, custom_fields=f_app.common.user_custom_fields)[0]
    return result


@f_api('/user/get_by_phone', force_ssl=True, params=dict(
    phone=(str, True),
    country="country",
))
@f_app.user.login.check(force=True)
def user_get_id_by_phone(user, params):
    params["phone"] = f_app.util.parse_phone(params)
    user_id = f_app.user.get_id_by_phone(params["phone"])
    if not user_id:
        abort(40324)

    return f_app.user.output([user_id])[0]


@f_api("/captcha/generate", params=dict(
    style=(str, "html"),
))
def captcha_generate(params):
    """
    Generate captcha.

    ``style`` must be in ``html`` or ``ajax``
    """
    if params["style"] not in ["html", "ajax"]:
        abort(40000, logger.warning("Invalid params: style", params["style"], exc_info=False))
    return f_app.captcha.generate(style=params["style"])
