from datetime import datetime
from libfelix.f_common import f_app
from libfelix.f_interface import f_api


import logging
logger = logging.getLogger(__name__)


@f_api('/subscription/add', params=dict(
    email=(str, True),
))
def subscription_add(params):
    return f_app.feedback.add(params)


@f_api('/subscription/<subscription_id>')
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_get(subscription_id):
    return f_app.feedback.output([subscription_id])[0]


@f_api('/subscription/<subscription_id>/remove')
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_remove(subscription_id):
    f_app.feedback.remove(subscription_id)


@f_api('/subscription/search', params=dict(
    time=datetime,
    email=str,
))
@f_app.user.login.check(force=True, role=["admin", "jr_admin"])
def subscription_search(params):
    subscription_list = f_app.feedback.search(params)
    return f_app.feedback.output(subscription_list)
