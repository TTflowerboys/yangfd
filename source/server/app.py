# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
before = datetime.utcnow()

from libfelix.f_common import f_app, make_error_codes_docs  # noqa: E402, F401
import common                                               # noqa: E402, F401
import libfelix.f_user                                      # noqa: E402, F401

# Import modules you need here
import libfelix.f_ad                                        # noqa: E402, F401
import libfelix.f_blog                                      # noqa: E402, F401
import libfelix.f_captcha.f_opencaptcha                     # noqa: E402, F401
import libfelix.f_captcha.f_recaptcha                       # noqa: E402, F401
import libfelix.f_captcha.f_captchasnet                     # noqa: E402, F401
# import libfelix.f_captcha.f_touclick
import libfelix.f_common                                    # noqa: E402, F401
import libfelix.f_coupon                                    # noqa: E402, F401
import libfelix.f_email                                     # noqa: E402, F401
import libfelix.f_email.f_aws_ses                           # noqa: E402, F401
import libfelix.f_email.f_sendcloud                         # noqa: E402, F401
import libfelix.f_email.f_sendgrid                          # noqa: E402, F401
import libfelix.f_email.f_smtp                              # noqa: E402, F401
import libfelix.f_enum                                      # noqa: E402, F401
import libfelix.f_feedback                                  # noqa: E402, F401
import libfelix.f_geoip                                     # noqa: E402, F401
import libfelix.f_geonames                                  # noqa: E402, F401
import libfelix.f_log                                       # noqa: E402, F401
import libfelix.f_match                                     # noqa: E402, F401
import libfelix.f_message                                   # noqa: E402, F401
import libfelix.f_mongo                                     # noqa: E402, F401
import libfelix.f_order                                     # noqa: E402, F401
import libfelix.f_payment                                   # noqa: E402, F401
import libfelix.f_payment.f_adyen                           # noqa: E402, F401
import libfelix.f_re                                        # noqa: E402, F401
import libfelix.f_sina                                      # noqa: E402, F401
import libfelix.f_shop                                      # noqa: E402, F401
import libfelix.f_shop.f_recurring_bm                       # noqa: E402, F401
import libfelix.f_shorturl.f_tinyurl                        # noqa: E402, F401
import libfelix.f_sms.f_clickatell                          # noqa: E402, F401
import libfelix.f_sms.f_nexmo                               # noqa: E402, F401
import libfelix.f_sms.f_verification.f_sinch                # noqa: E402, F401
import libfelix.f_storage                                   # noqa: E402, F401
import libfelix.f_storage.f_aws_s3                          # noqa: E402, F401
import libfelix.f_storage.f_qiniu                           # noqa: E402, F401
import libfelix.f_ticket                                    # noqa: E402, F401
import libfelix.f_version                                   # noqa: E402, F401
import libfelix.f_wechat                                    # noqa: E402, F401

import f_currant                                            # noqa: E402, F401
import crawler                                              # noqa: E402, F401
import main_mixed_index                                     # noqa: E402, F401
import property                                             # noqa: E402, F401
import report                                               # noqa: E402, F401
import ticket                                               # noqa: E402, F401
import aggregation_module                                   # noqa: E402, F401
import nexmo_number_mapping                                 # noqa: E402, F401
import message                                              # noqa: E402, F401

libfelix.f_message.f_message_push_plugin()


def error_codes():
    # 2013110102 this timestamp is for ci to generate correct general resources docs
    pass


make_error_codes_docs(error_codes)

libfelix.f_log.info("Application successfully loaded in", str((datetime.utcnow() - before).total_seconds()), "seconds")
