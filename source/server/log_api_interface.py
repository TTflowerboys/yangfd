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
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def log_search(user, params):
    per_page = params.pop('per_page', 0)
    if "user_id" in params:
        params["id"] = ObjectId(params.pop("user_id"))
    log_list = f_app.log.output(f_app.log.search(params, per_page=per_page))
    return log_list


@f_api('/log/<log_id>')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def log_get(user, log_id):
    return f_app.log.output([log_id])[0]
