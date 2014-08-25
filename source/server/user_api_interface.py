# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from app import f_app
from libfelix.f_interface import f_api, abort, rate_limit
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
    first_name=(str, True),
    last_name=(str, True),
    password=(str, True, "notrim", "base64"),
    phone=(str, True),
    country=str,
    email=str,
))
@rate_limit("register", ip=10)
def register(params):
    """
    Basic user register

    ``password`` must be base64 encoded.
    """
    params["phone"] = f_app.util.parse_phone(params, retain_country=True)
    if f_app.user.get_id_by_phone(params["phone"]):
        abort(40325)

    if "email" in params:
        if "@" not in params["email"]:
            abort(40095, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))
        if f_app.user.get_id_by_email(params["email"]):
            abort(40325)

    user_id = f_app.user.add(params)

    f_app.user.login.success(user_id)
    f_app.log.add("login", user_id=user_id)

    return f_app.user.output([user_id], custom_fields=f_app.common.user_custom_fields)[0]


@f_api("/user/<user_id>")
@f_app.user.login.check(force=True)
def user_get(user, user_id):
    """
    Get specific user information.
    """
    custom_fields = f_app.common.user_custom_fields
    result = f_app.user.output([user_id], custom_fields=custom_fields)[0]
    return result


@f_api('/user/edit', force_ssl=True, params=dict(
    nolog=("password", "old_password"),
    first_name=(str, None),
    last_name=(str, None),
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
    ``gender`` should be in "male", "female", "other".
    ``intention`` should be combination of "cash_flow_protection", "forex", "study_abroad", "immigration_investment", "excess_returns", "fixed_income", "asset_preservation", "immigration_only", "holiday_travel"
    """

    if "email" in params:
        if "@" not in params["email"]:
            abort(40095, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))
        if f_app.user.get_id_by_email(params["email"]):
            abort(40325)

    if "password" in params:
        user = f_app.user.get(user["id"])

        if "old_password" not in params:
            abort(40080, logger.warning("Invalid params: current password not provided", exc_info=False))

        if "password" in user and "email" in user:
            f_app.user.login.auth(user["email"], params.pop("old_password"), auth_only=True)

    elif "old_password" in params:
        abort(40079, "Invalid params: old_password not needed")

    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params, retain_country=True)

    if "gender" in params:
        if params["gender"] not in ("male", "female", "other"):
            abort(40000, logger.warning("Invalid params: gender", params["gender"], exc_info=False))

    if "intention" in params:
        if not set(params["intention"]) <= set(f_app.common.user_intention):
            abort(40000, logger.warning("Invalid params: intention", params["intention"], exc_info=False))

    f_app.user.update_set(user["id"], params)
    return f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]


@f_api(
    "/user/admin",
    "/user/admin/list",
    "/user/admin/search", params=dict(
        per_page=int,
        time=datetime,
        register_time=datetime,
    )
)
@f_app.user.login.check(force=30)
def admin_user_list(user, params):
    per_page = params.pop("per_page", 0)
    return f_app.user.output(f_app.user.custom_search(params={"role": {"$not": {"$size": 0}}}, per_page=per_page))


@f_api('/user/admin/add', params=dict(
    nolog="password",
    email=(str, True),
    first_name=(str, True),
    last_name=(str, True),
    password=(str, True, "notrim", "base64"),
    phone=str,
    country=str,
    city=str,
    address1=str,
    address2=str,
    state=str,
    zip=str,
    description=str,
))
@f_app.user.login.check(force=30)
def admin_user_add(user, params):
    """
    Basic user add

    ``password`` must be base64 encoded.
    """

    if "nickname" not in params:
        params["nickname"] = params["first_name"] + " " + params["last_name"]

    if "@" not in params["email"]:
        abort(40093, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))

    if "phone" in params:
        params["phone"] = f_app.util.parse_phone(params)

    with f_app.mongo() as m:
        user_id = f_app.user.get_database(m).find_one({"email": params["email"]})
        if user_id:
            abort(40325)

    user_id = f_app.user.add(params)

    f_app.log.add("add", user_id=user_id)

    result = f_app.user.output([str(user_id)])[0]
    return result


@f_api("/user/admin/<user_id>/set_admin/<admin_level>")
@f_app.user.login.check(force=30)
def admin_user_set_admin(user_id, admin_level, user):
    admin_level = int(admin_level)
    if admin_level > user["admin"]:
        logger.debug("Current user admin_level:", user["admin"], "Target admin_level:", admin_level)
        abort(40105)

    target_user = f_app.user.get(user_id, simple=True)
    target_user_admin_level = f_app.user.login.get_admin_level(target_user)

    if target_user_admin_level > user["admin"]:
        logger.debug("Current user admin_level:", user["admin"], "Target user admin_level:", target_user_admin_level)
        abort(40105)

    return f_app.user.admin.set(user_id, admin_level)


@f_api("/user/admin/<user_id>/remove_admin")
@f_app.user.login.check(force=30)
def admin_user_admin_remove(user, user_id):
    target_user = f_app.user.get(user_id)
    if target_user["admin_level"] > user["admin"]:
        logger.debug("Current user admin_level:", user["admin"], "Target admin_level:", target_user["admin_level"])
        abort(40105)
    return f_app.user.admin.remove(user_id)


@f_api("/user/admin/<user_id>/set_role", params=dict(
    role=(str, True)
))
@f_app.user.login.check(force=30)
def admin_user_set_role(user, user_id, params):
    """
        If you want to set user to global admin, use /user/admin/<user_id>/set_admin/<admin_level> .
    """
    roles = f_app.user.get_role(user_id)

    if params["role"] not in roles:
        f_app.user.add_role(user_id, params["role"])


@f_api("/user/admin/<user_id>/unset_role", params=dict(
    role=(str, True)
))
@f_app.user.login.check(force=30)
def admin_user_unset_role(user, user_id, params):
    f_app.user.remove_role(user_id, params["role"])


@f_api('/user/admin/<user_id>/edit', force_ssl=True, params=dict(
    nolog=("password"),
    first_name=(str, None),
    last_name=(str, None),
    nickname=(str, None),
    phone=(str, None),
    city=(str, None),
    address1=(str, None),
    address2=(str, None),
    state=(str, None),
    country=(str, None),
    zip=(str, None),
    email=(str, None),
    password=(str, None, "notrim", "base64"),
    company=(str, None),
))
@f_app.user.login.check(force=30)
def admin_user_edit(user, user_id, params):
    """
    Edit specific user basic information.
    """
    if "email" in params:
        if "@" not in params["email"]:
            abort(40095, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))

    f_app.user.update_set(user_id, params)


@f_api("/user/get_id_by_email", force_ssl=True, params=dict(
    email=(str, True),
))
@f_app.user.login.check(force=30)
def user_get_id_by_email(user, params):
    """
    Only for *global admin*. Do not use it to test if email is already in use. Use /user/check_exist instead.
    """
    user_id = f_app.user.get_id_by_email(params["email"])
    if not user_id:
        abort(40324)

    return user_id


@f_api("/user/search", params=dict(
    email=str,
    first_name=str,
    last_name=str,
    role=(list, None, str),
    per_page=int,
    register_time=datetime,
))
@f_app.user.login.check(force=30)
def user_search(user, params):
    """
    """
    if "email" in params:
        if "@" not in params["email"]:
            abort(40095, logger.warning("No '@' in email address supplied:", params["email"], exc_info=False))

    per_page = params.pop("per_page", 0)
    notime = False if "sort" not in params else True
    result = f_app.user.custom_search(params, per_page=per_page, notime=notime)
    if len(result) > 0:
        return f_app.user.output(result, custom_fields=f_app.common.user_custom_fields)[0]
    else:
        return None


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

    result = f_app.user.output([str(user_id)], user=user)[0]
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

    result = f_app.user.output([str(user_id)], user=user)[0]
    return result


