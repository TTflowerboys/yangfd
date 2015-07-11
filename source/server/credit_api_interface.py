from __future__ import unicode_literals, absolute_import
from datetime import datetime, timedelta
from app import f_app
from libfelix.f_interface import f_api, abort


@f_api("/credit/<credit_type>/amount")
@f_app.user.login.check(force=True)
def credit_amount(credit_type, user):
    """
    ``credit_type`` should be ``view_rent_ticket_contact_info``.
    """
    assert credit_type in ["view_rent_ticket_contact_info", ], abort(40000)

    return f_app.user.credit.get(credit_type, user_id=user["id"])


@f_api("/credit/view_rent_ticket_contact_info/share_app_completed")
@f_app.user.login.check(force=True)
def credit_view_rent_ticket_contact_info_share_app_completed(user):
    credits = f_app.user.credit.get("view_rent_ticket_contact_info", tag="share_app")
    if not len(credits["credits"]):
        credit = {
            "type": "view_rent_ticket_contact_info",
            "amount": 1,
            "expire_time": datetime.utcnow() + timedelta(days=30),
            "tag": "share_app",
            "user_id": user["id"],
        }
        f_app.user.credit.add(credit)
