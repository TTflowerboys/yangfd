# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
before = datetime.utcnow()

from libfelix.f_common import f_app, make_error_codes_docs
import common
import libfelix.f_user

# Import modules you need here
import libfelix.f_ad
import libfelix.f_blog
import libfelix.f_captcha.f_opencaptcha
import libfelix.f_captcha.f_recaptcha
import libfelix.f_captcha.f_captchasnet
# import libfelix.f_captcha.f_touclick
import libfelix.f_common
import libfelix.f_coupon
import libfelix.f_email
import libfelix.f_email.f_aws_ses
import libfelix.f_email.f_sendcloud
import libfelix.f_email.f_sendgrid
import libfelix.f_enum
import libfelix.f_feedback
import libfelix.f_geoip
import libfelix.f_geonames
import libfelix.f_log
import libfelix.f_match
import libfelix.f_message
import libfelix.f_mongo
import libfelix.f_order
import libfelix.f_re
import libfelix.f_sina
import libfelix.f_shop
import libfelix.f_shop.f_recurring_bm
import libfelix.f_sms.f_clickatell
import libfelix.f_sms.f_nexmo
import libfelix.f_storage
import libfelix.f_storage.f_aws_s3
import libfelix.f_storage.f_qiniu
import libfelix.f_ticket
import libfelix.f_version
import libfelix.f_wechat
import f_currant


libfelix.f_message.f_message_push_plugin()


def error_codes():
    # 2013110102 this timestamp is for ci to generate correct general resources docs
    pass

make_error_codes_docs(error_codes)

libfelix.f_log.info("Application successfully loaded in", str((datetime.utcnow() - before).total_seconds()), "seconds")
