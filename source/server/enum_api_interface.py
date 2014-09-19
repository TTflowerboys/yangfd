# -*- coding: utf-8 -*-

from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_interface import f_api, abort
from datetime import datetime

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
    country="enum:country",
    slug=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_add(user, params):
    """
    ``slug`` is the unique key to get the enum data.

    ``enum:country`` data model::

        {
            "type": "country",
            "value": {
                "zh_Hans_CN": "中国",
                "en_GB": "China"
            },
            "slug": "CN"
        }

    ``city`` data model::

        {
            "type": "city",
            "value": {
                "zh_Hans_CN": "武汉",
                "en_GB": "Wuhan"
            },
            "country": ObjectId(<enum:country>)
        }
    """
    if "message_type" in params:
        if "message_type" not in f_app.common.message_type:
            abort(40000, logger.warning("Invalid params: message_type", params["message_type"], exc_info=False))

    return f_app.enum.add(params)


@f_api('/enum/<enum_id>/edit', params=dict(
    type=str,
    value=("i18n", None, str),
    country=("enum:country", None),
    slug=(str, None),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def enum_edit(user, enum_id, params):
    if "message_type" in params:
        if "message_type" not in f_app.common.message_type:
            abort(40000, logger.warning("Invalid params: message_type", params["message_type"], exc_info=False))

    return f_app.enum.update_set(enum_id, params)


@f_api('/enum/search', params=dict(
    country="enum:country",
    per_page=int,
    time=datetime,
))
def enum_search(params):
    per_page = params.pop("per_page", 0)
    return f_app.enum.get(f_app.enum.search(params, per_page=per_page))
