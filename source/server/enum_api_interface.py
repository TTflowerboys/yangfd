from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort

import logging
logger = logging.getLogger(__name__)


@f_api('/enum/<enum_id>')
def enum(enum_id):
    return f_app.enum.get(enum_id)


@f_api('/enum', params=dict(
    type=(str, True),
))
def enum_list(params):
    return f_app.enum.get_all(params["type"])


@f_api('/enum/add', params=dict(
    type=(str, True),
    value=("i18n", True, str),
    # Field for message_api_interface
    message_type=str,
    country=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_add(user, params):
    if "message_type" not in f_app.common.message_type:
        abort(40000, logger.warning("Invalid params: message_type", params["message_type"], exc_info=False))
    return f_app.enum.add(params)


@f_api('/enum/<enum_id>/edit', params=dict(
    type=str,
    value=("i18n", None, str),
    message_type=(str, None),
    country=(str, None),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_edit(user, enum_id, params):
    if "message_type" not in f_app.common.message_type:
        abort(40000, logger.warning("Invalid params: message_type", params["message_type"], exc_info=False))
    return f_app.enum.update_set(enum_id, params)
