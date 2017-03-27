from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api


@f_api("/adyen/<card_id>")
@f_app.user.login.check(force=True)
def adyen_card_info(card_id, user):
    card = f_app.payment.adyen.card.get(card_id)
    assert card["user_id"] == user["id"], abort(40300)
    return card


@f_api("/adyen/list")
@f_app.user.login.check(force=True)
def adyen_list(user):
    return f_app.payment.adyen.card.list(user["id"])


@f_api("/adyen/add", params=dict(
    nolog=("card",),
    card=(str, True),
    default=bool,
))
@f_app.user.login.check(force=True)
def adyen_add(user, params):
    params["additionalData"] = {"card.encrypted.json": params.pop("card")}
    return f_app.payment.adyen.card.add(user["id"], params)


@f_api("/adyen/<card_id>/delete")
@f_app.user.login.check(force=True)
def adyen_delete(card_id, user):
    return f_app.payment.adyen.card.delete(user["id"], card_id)


@f_api("/adyen/<card_id>/make_default")
@f_app.user.login.check(force=True)
def adyen_make_default(card_id, user):
    return f_app.payment.adyen.card.set_default(user["id"], card_id)
