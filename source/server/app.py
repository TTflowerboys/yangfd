# -*- coding: utf-8 -*-
from datetime import datetime
before = datetime.utcnow()

from libfelix.f_common import f_app, make_error_codes_docs
import common

# Import modules you need here

import libfelix.f_blog
import libfelix.f_common
import libfelix.f_email
import libfelix.f_email.f_aws_ses
import libfelix.f_enum
import libfelix.f_feedback
import libfelix.f_log
import libfelix.f_message
import libfelix.f_mongo
import libfelix.f_ticket
import libfelix.f_sms.f_clickatell
import libfelix.f_sms.f_nexmo
import libfelix.f_user
import libfelix.f_captcha.f_recaptcha

import f_currant


libfelix.f_message.f_message_push_plugin()


def error_codes():
    # 2013110102 this timestamp is for ci to generate correct general resources docs
    pass

make_error_codes_docs(error_codes)

libfelix.f_log.info("Application successfully loaded in", str((datetime.utcnow() - before).total_seconds()), "seconds")
