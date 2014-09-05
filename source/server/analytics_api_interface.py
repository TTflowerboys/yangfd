# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api, ObjectId, abort
import logging
logger = logging.getLogger(__name__)


@f_api("/analytics/user/action/record", params=dict(
    log_type=(str, True),
    property_id=ObjectId,
    page_url=str,
))
def analytics_user_action_record(params):
    """
   Record the user action

   ``log_type`` must be  in below categories

   ``click_page`` means the user click certain page

   ``click_property`` means the user click certain property

   ``mark_property_favorite`` means the user  mark certain property  favorite

   ``submit_intention_ticket`` means the user tries to submit the property intention ticket

   ``submit_intention_ticket_success`` means the user has submit the property intention successfully

   ``click_registration`` means the user click the  registration link

   ``submit_registration`` means the user tries to submit the registration

   ``submit_registration_success`` means the user has submit the registration successfully

   ``submit_intention_tag`` means the user has submit the intention tag

   ``click_property_request`` means the user click the  property request link

   ``submit_property_request`` means the user tries to submit the  property request

   ``submit_property_request_success`` means the user has submit the property request successfully

    in any action related with certain property, parse ``property_id``.

    To any page user click , parse ``page_url`` of the page and parse ``click_page``  to  ``log_type``
    """
    log_type = params.get("log_type")
    if log_type not in f_app.common.user_action_types:
        abort(40000, logger.warning("Invalid params: log_type", log_type, exc_info=False))

    if log_type == "click_page" and "page_url" not in params:
        abort(40000, logger.warning("Need params: page_url", exc_info=False))

    if "property_id" in params:
        property_id = str(params.get("property_id"))
        f_app.property.get(property_id)

    return f_app.log.add(params)
