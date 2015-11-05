# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app
from libfelix.f_interface import f_api
from bson.objectid import ObjectId
from datetime import datetime
import logging
logger = logging.getLogger(__name__)


@f_api('/log/search', params=dict(
    user_id=ObjectId,
    per_page=int,
    time=datetime,
    has_property=bool,
    has_rent_ticket=bool,
    type=(str, "route"),
    ticket_id=(ObjectId, None, "str"),
    ticket_type=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def log_search(user, params):
    per_page = params.pop('per_page', 100)
    if "user_id" in params:
        params["id"] = ObjectId(params.pop("user_id"))
    if "has_property" in params:
        has_property = params.pop("has_property")
        params["property_id"] = {"$exists": has_property}
    if "has_rent_ticket" in params:
        has_rent_ticket = params.pop("has_rent_ticket")
        params["rent_ticket_id"] = {"$exists": has_rent_ticket}
    log_list = f_app.log.output(f_app.log.search(params, per_page=per_page))
    return log_list


@f_api('/log/<log_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def log_get(user, log_id):
    return f_app.log.output([log_id])[0]
