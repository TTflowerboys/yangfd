# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

import sys
# TODO: A saner way?
if len(sys.argv) > 1 and sys.argv[1] == "-u":
    from gevent import monkey
    monkey.patch_all()

import qiniu.config

try:
    # Old configuration
    qiniu.config.set_default(
        default_up_host="qiniu-proxy.bbtechgroup.com",
        connection_timeout=1800)
except TypeError:
    zone_custom = qiniu.config.Zone("qiniu-proxy.bbtechgroup.com", "upload.qiniu.com")
    qiniu.config.set_default(
        default_zone=zone_custom,
        connection_timeout=1800)

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import f_app

# Pages
import main_interface
import crowdfunding_interface
import main_interface_phone
import news_interface
import property_interface
import property_to_rent_interface
import user_setting_interface
import region_report_interface


# API
import misc_api_interface
import news_api_interface
import enum_api_interface
import property_api_interface
import report_api_interface
import subscription_api_interface
import ticket_api_interface
import analytics_api_interface
import upload_api_interface
import user_api_interface
import content_api_interface
import message_api_interface
import plot_api_interface
import shop_api_interface
import order_api_interface
import log_api_interface
import credit_api_interface
import app_version_api_interface
import venue_api_interface
import deal_api_interface
import index_rule_api_interface
import coupon_api_interface
import nexmo_number_api_interface


application = f_app(__name__)
