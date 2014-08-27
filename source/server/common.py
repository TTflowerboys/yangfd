# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app, f_plugin, f_common


class common(f_common):

    name = "currant"
    debug = True

    blog_name = "currant"

    newrelic = False
    newrelic_config = "conf/currant_newrelic.ini"

    admin_console_url = ""

    static_file_debug_enabled = True
    static_file_debug = lambda self, filepath, root: (filepath, "views/static/")

    tpl_debug_enabled = True
    tpl_debug = lambda self, tplname: "" + tplname

    log_file = "currant.log"

    cookie_name = "currant_auth"

    mongo_dbname = "currant"
    mongo_server = "172.20.1.1"
    mongo_auth = False

    memcache_server = ["172.20.1.1:11211"]
    memcache_lib = "memcache"

    user_login_type = "phone"
    user_custom_fields = ["email", "register_time", "phone", "city", "country", "state", "zip", "gender", "date_of_birth", "intention"]
    user_intention = ["cash_flow_protection", "forex", "study_abroad", "immigration_investment", "excess_returns", "fixed_income", "asset_preservation", "immigration_only", "holiday_travel"]
    admin_roles = ["admin", "jr_admin", "sales", "jr_sales", "operation", "jr_operation", "support", "jr_support", "developer", "agency"]
    advanced_admin_roles = ["admin", "jr_admin", "sales", "operation", "support"]

    ticket_statuses = ["new", "assigned", "in_progess", "deposit", "suspended", "bought", "canceled"]

    version_more_dimension = ["channel", "platform"]

    message_self_hosted_push_port = 8286
    parse_delay = 5

    i18n_locales = ['zh_Hans_CN', 'zh_Hant_HK', 'en_GB']

    email_default_method = "aws_ses"
    email_default_sender = "developer+currant@bbtechgroup.com"

    aws_access_key_id = "AKIAIYCSNRQ46N6GPZQA"
    aws_secret_access_key = "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"

common()
