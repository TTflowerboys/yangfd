# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

import sys
# TODO: A saner way?
if len(sys.argv) > 1 and sys.argv[1] == "-u":
    from gevent import monkey
    monkey.patch_all()

import qiniu.config  # noqa: E402

try:
    # Older configuration
    qiniu.config.set_default(
        default_up_host="qiniu-proxy.bbtechgroup.com",
        connection_timeout=1800)
except TypeError:
    try:
        # Old configuration
        zone_custom = qiniu.config.Zone("qiniu-proxy.bbtechgroup.com", "upload.qiniu.com")
        qiniu.config.set_default(
            default_zone=zone_custom,
            connection_timeout=1800)
    except AttributeError:
        zone_custom = qiniu.zone.Zone("qiniu-proxy.bbtechgroup.com", "upload.qiniu.com")
        qiniu.config.set_default(
            default_zone=zone_custom,
            connection_timeout=1800)

import os  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import f_app  # noqa: E402

# Pages
import main_interface              # noqa: E402, F401
import crowdfunding_interface      # noqa: E402, F401
import main_interface_phone        # noqa: E402, F401
import news_interface              # noqa: E402, F401
import property_interface          # noqa: E402, F401
import property_to_rent_interface  # noqa: E402, F401
import user_setting_interface      # noqa: E402, F401
import region_report_interface     # noqa: E402, F401


# API
import misc_api_interface          # noqa: E402, F401
import news_api_interface          # noqa: E402, F401
import enum_api_interface          # noqa: E402, F401
import property_api_interface      # noqa: E402, F401
import report_api_interface        # noqa: E402, F401
import subscription_api_interface  # noqa: E402, F401
import ticket_api_interface        # noqa: E402, F401
import analytics_api_interface     # noqa: E402, F401
import upload_api_interface        # noqa: E402, F401
import user_api_interface          # noqa: E402, F401
import content_api_interface       # noqa: E402, F401
import message_api_interface       # noqa: E402, F401
import plot_api_interface          # noqa: E402, F401
import shop_api_interface          # noqa: E402, F401
import order_api_interface         # noqa: E402, F401
import log_api_interface           # noqa: E402, F401
import credit_api_interface        # noqa: E402, F401
import app_version_api_interface   # noqa: E402, F401
import venue_api_interface         # noqa: E402, F401
import deal_api_interface          # noqa: E402, F401
import index_rule_api_interface    # noqa: E402, F401
import coupon_api_interface        # noqa: E402, F401
import nexmo_number_api_interface  # noqa: E402, F401
import payment_api_interface       # noqa: E402, F401


application = f_app(__name__)
