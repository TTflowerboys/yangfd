from libfelix.f_common import f_app
from libfelix.f_interface import f_api

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
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_add(user, params):
    return f_app.enum.add(params)


@f_api('/enum/<enum_id>/edit', params=dict(
    type=str,
    value=("i18n", None, str),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_edit(user, enum_id, params):
    return f_app.enum.update_set(enum_id, params)
