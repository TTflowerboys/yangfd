from app import f_app
from libfelix.f_interface import f_api


@f_api('/nexmo_number/<nexmo_number_id>')
@f_app.user.login.check(role=['admin'])
def nexmo_number(nexmo_number_id, user):
    return f_app.sms.nexmo.number.get(nexmo_number_id)


@f_api('/nexmo_number/list')
@f_app.user.login.check(role=['admin'])
def nexmo_number_list(user):
    return f_app.sms.nexmo.number.get(f_app.sms.nexmo.number.get_all())


@f_api('/nexmo_number/add', params=dict(
    phone=(str, True),
    country=("country", True),
))
@f_app.user.login.check(role=['admin'])
def nexmo_number_add(user, params):
    return f_app.sms.nexmo.number.add(params)


@f_api('/nexmo_number/<nexmo_number_id>/edit', params=dict(
    phone=str,
    country="country",
    status=str,
))
@f_app.user.login.check(role=['admin'])
def nexmo_number_edit(nexmo_number_id, user, params):
    return f_app.sms.nexmo.number.update_set(nexmo_number_id, params)
