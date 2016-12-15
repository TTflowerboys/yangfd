import sys
import random
from faker import Faker
from app import f_app
from libfelix.f_interface import request, template
import currant_util

template_name = sys.argv[1]
fake = Faker()
request._requested_i18n_locales_list = ["en_GB"]


if template_name == "coupon_code_share":
    template_params = dict(
        referral_code="".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)]),
        discount="£25"
    )

elif template_name == "receive_rent_intention":
    template_params = dict()

elif template_name == "rent_intention_digest":
    template_params = dict(
        matched_rent_ticket_list=[],
        get_country_name_by_code=currant_util.get_country_name_by_code,
    )

elif template_name in ("rent_intention_matched_1", "rent_intention_matched_2_3", "rent_intention_matched_4"):
    template_params = dict(
        rent_ticket={},
        get_country_name_by_code=currant_util.get_country_name_by_code,
    )

elif template_name == "rent_notice":
    template_params = dict(
        formated_date='之前',  # TODO
        rent_url="",
        rent_title="",
        has_rented_url="",
        refresh_url="",
        edit_url="",
        qrcode_image="http://yangfd.com/qrcode/generate?content=foo"
    )

elif template_name == "rent_suspend_notice":
    template_params = dict(
        rent_title="",
        rent_url="",
        rent_edit_url="",
    )

elif template_name == "rent_ticket_publish_success":
    template_params = dict(
        rent={},
        get_country_name_by_code=currant_util.get_country_name_by_code,
    )

elif template_name == "reset_password_by_email":
    template_params = dict(
        reset_password_url="",
    )

elif template_name == "verify_email":
    template_params = dict(
        verification_url="",
    )

elif template_name == "new_user":
    template_params = dict(
        password="".join([str(random.choice(f_app.common.referral_code_charset)) for nonsense in range(f_app.common.referral_default_length)]),
        phone=fake.phone_number(),
    )

elif template_name in ("draft_not_publish", "draft_not_publish_day_3", "draft_not_publish_day_7"):
    template_params = dict(
        rent_ticket_title="",
        rent_ticket_edit_url="",
    )

else:
    raise NotImplementedError


template_params.update(dict(
    nickname=fake.name(),
    unsubscribe_url="",
    title="",
    date="",
))


f_app.email.schedule(
    target="felixonmars@gmail.com,fyin@bbtechgroup.com",
    subject="Test Email",
    text=template("static/emails/" + template_name, **template_params),
    display="html",
    tag="test_email",
)
