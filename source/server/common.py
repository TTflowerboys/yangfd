# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app, f_common


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
    news_category = ["news", "announcement", "process", "law"]

    intention_ticket_statuses = ["new", "assigned", "in_progess", "deposit", "suspended", "bought", "canceled"]
    support_ticket_statuses = ["new", "assigned", "in_progress", "solved", "unsolved"]

    version_more_dimension = ["channel", "platform"]

    message_self_hosted_push_port = 8286
    parse_delay = 5

    i18n_locales = ["zh_Hans_CN", "zh_Hant_HK", "en_GB"]

    email_default_method = "aws_ses"
    email_default_sender = "developer+currant@bbtechgroup.com"

    aws_access_key_id = "AKIAIYCSNRQ46N6GPZQA"
    aws_secret_access_key = "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"

    sms_default_method = "clickatell"
    clickatell_api_id = 3425954
    clickatell_user = "marco388"
    clickatell_password = "EaSeURGSXGXNbM"

    custom_error_codes = {
        40099: "Invalid params: No '@' in email address supplied:",
        40098: "Invalid params: current password not provided",
        40097: "Invalid params: old_password not needed",
        40096: "Invalid params: gender",
        40095: "Invalid params: intention",
        40094: "Invalid admin: email not provided.",
        40093: "Invalid params: status",
        40092: "Invalid params: property_type",

        40399: "Permission denied",
    }

common()

f_app.common.register_error_code(40499)
f_app.common.register_error_code(40498)
f_app.common.register_error_code(40497)
f_app.common.register_error_code(40496)
f_app.common.register_error_code(40495)
f_app.common.register_error_code(40494)
f_app.common.register_error_code(40493)
f_app.common.register_error_code(40492)
f_app.common.register_error_code(40399)
