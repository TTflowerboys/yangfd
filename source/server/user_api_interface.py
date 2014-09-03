# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api, abort, rate_limit, template, request
import random
import logging
logger = logging.getLogger(__name__)


@f_api('/user')
@f_app.user.login.check(force=True)
def current_user(user):
    """
    Get current user information
    """
    result = f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]
    return result


@f_api('/user/login', force_ssl=True, params=dict(
    nolog="password",
    phone=(str, True),
    country=str,
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
    country=(str, True),
    email=str,
    solution=(str, True),
    challenge=(str, True)
))
@rate_limit("register", ip=10)
def register(params):
    """
    Basic user register

    ``password`` must be base64 encoded.

    ``country`` should be 2-letter country code, see http://www.worldatlas.com/aatlas/ctycodes.htm

    ``solution``  the solution user enters.

    ``challenge`` describes the CAPTCHA which the user is solving.

    """

    params["phone"] = f_app.util.parse_phone(params, retain_country=True)
    if f_app.user.get_id_by_phone(params["phone"]):
        abort(40351)

    if not f_app.captcha.validate(params["solution"], params["challenge"], request.remote_route[-1], "recaptcha"):
        abort(50314)

    user_id = f_app.user.add(params)

    f_app.user.login.success(user_id)
    f_app.log.add("login", user_id=user_id)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/<user_id>")
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'sales'])
def user_get(user, user_id):
    """
    Get specific user information.
    """
    custom_fields = f_app.common.user_custom_fields
    result = f_app.user.output([user_id], custom_fields=custom_fields)[0]
    return result


@f_api('/user/edit', force_ssl=True, params=dict(
    nolog=("password", "old_password"),
    nickname=(str, None),
    phone=(str, None),
    city=(str, None),
    state=(str, None),
    country=(str, None),
    zip=(str, None),
    email=(str, None),
    password=(str, None, "notrim", "base64"),
    old_password=(str, None, "notrim", "base64"),
    gender=(str, None),
    date_of_birth=datetime,
    intention=(list, None, str),
))
@f_app.user.login.check(force=True)
def current_user_edit(user, params):
    """
    Edit current user basic information.

    ``gender`` should be in ``male``, ``female``, ``other``.

    ``intention`` should be combination of ``cash_flow_protection``, ``forex``, ``study_abroad``, ``immigration_investment``, ``excess_returns``, ``fixed_income``, ``asset_preservation``, ``immigration_only``, ``holiday_travel``
    """
    if "email" in params:
        if "@" not in params["email"]:
            abort(40099, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))
        if f_app.user.get_id_by_email(params["email"]):
            abort(40325)

    if "password" in params:
        user = f_app.user.get(user["id"])

        if "old_password" not in params:
            abort(40098, logger.warning("Invalid params: current password not provided", exc_info=False))

        if "password" in user and "email" in user:
            f_app.user.login.auth(user["email"], params.pop("old_password"), auth_only=True)

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

    if "intention" in params:
        if not set(params["intention"]) <= set(f_app.common.user_intention):
            abort(40095, logger.warning("Invalid params: intention", params["intention"], exc_info=False))

    f_app.user.update_set(user["id"], params)
    return f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/search", params=dict(
    per_page=int,
    time=datetime,
    register_time=datetime,
    role=str,
    phone=str,
    country=str,
    role_only=bool,
))
@f_app.user.login.check(force=True, role=f_app.common.advanced_admin_roles)
def admin_user_list(user, params):
    """
    Use this to search for users with roles.

    ``admin`` can search for everyone.

    ``jr_admin`` can search for every role except ``admin``.

    All senior roles can search for themselves and their junior roles.

    Only users with roles will be returned if ``role_only`` is true.

    If ``role_only`` is false, only users without roles will be returned.

    All users can be fetched if ``role_only`` is not given.

    """
    user_roles = f_app.user.get_role(user["id"])
    if "role_only" in params:
        role_only = params.pop("role_only")
        if role_only:
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
    logger.debug(params)
    return f_app.user.output(f_app.user.custom_search(params=params, per_page=per_page), custom_fields=f_app.common.user_custom_fields)


@f_api('/user/admin/add', params=dict(
    nolog="password",
    email=(str, True),
    nickname=(str, True),
    phone=(str, True),
    role=(list, True, str),
    country=(str, True),
))
@f_app.user.login.check(force=True, role=f_app.common.admin_roles)
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

    user_id = f_app.user.add(params)
    f_app.log.add("add", user_id=user_id)

    f_app.email.schedule(
        target=params["email"],
        subject="Your admin console access password",
        text=template("static/templates/new_admin", password=params["password"], nickname=params["nickname"], role=params["role"], admin_console_url="http://" + request.urlparts[1] + "/admin#", phone="*" * (len(params["phone"]) - 4) + params["phone"][-4:]),
        display="html",
    )

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/<user_id>/add_role", params=dict(
    role=(str, True),
))
@f_app.user.login.check(force=True, role=f_app.common.admin_roles)
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
        if user_info.get("email") is not None:
            f_app.email.schedule(
                target=user_info.get("email"),
                subject="You are now set as admin",
                text=template("static/templates/set_as_admin", nickname=user_info.get("nickname"), role=params["role"], admin_console_url="http://" + request.urlparts[1] + "/admin#", phone="*" * (len(user_info["phone"]) - 4) + user_info["phone"][-4:]),
                display="html",
            )
        else:
            abort(40094, logger.warning('Invalid admin: email not provided.', exc_info=False))
        f_app.user.add_role(user_id, role)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/admin/<user_id>/set_role", params=dict(
    role=(list, True, str)
))
@f_app.user.login.check(force=True, role=f_app.common.admin_roles)
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
@f_app.user.login.check(force=True, role=f_app.common.admin_roles)
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
    country=str,
))
def user_check_exist(params):
    params["phone"] = f_app.util.parse_phone(params)
    return True if f_app.user.get_id_by_phone(params["phone"], force_registered=True) else False


@f_api('/user/phone_test', force_ssl=True, params=dict(
    phone=(str, True),
    country=str,
))
def user_phone_test(params):
    """
    Parse "user" to ``country`` to try to append current user's country code to the phone (only applicable to valid login)
    """
    return f_app.util.parse_phone(params)


@f_api('/user/sms_verification/send', force_ssl=True, params=dict(
    phone=(str, True),
    country=str,
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


@f_api('/user/get_by_phone', force_ssl=True, params=dict(
    phone=(str, True),
    country=str,
))
@f_app.user.login.check(force=True)
def user_get_id_by_phone(user, params):
    params["phone"] = f_app.util.parse_phone(params)
    user_id = f_app.user.get_id_by_phone(params["phone"])
    if not user_id:
        abort(40324)

    return f_app.user.output([user_id])[0]


@f_api("/captcha/generate")
def captcha_generate():
    """
    Generate captcha.
    """
    return f_app.captcha.generate("recaptcha")
