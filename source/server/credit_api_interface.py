from __future__ import unicode_literals, absolute_import
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
