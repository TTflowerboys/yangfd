# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app, f_common


class common(f_common):

    name = "currant"
    debug = True

    blog_name = "currant"

    newrelic = False
    newrelic_config = "conf/currant_newrelic.ini"

    landing_only = False

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
    user_custom_fields = ["email", "register_time", "phone", "city", "country", "state", "zip", "gender", "date_of_birth", "intention", "wechat_id", "counter"]
    user_intention = ["cash_flow_protection", "forex", "study_abroad", "immigration_investment", "excess_returns", "fixed_income", "asset_preservation", "immigration_only", "holiday_travel"]
    admin_roles = ["admin", "jr_admin", "sales", "jr_sales", "operation", "jr_operation", "support", "jr_support", "developer", "agency"]
    advanced_admin_roles = ["admin", "jr_admin", "sales", "operation", "support"]
    message_type = ["system", "favorite", "intention", "mine"]

    intention_ticket_statuses = ["new", "assigned", "in_progess", "deposit", "suspended", "bought", "canceled"]
    support_ticket_statuses = ["new", "assigned", "in_progress", "solved", "unsolved"]

    user_action_types = ["click_page", "click_property", "mark_property_favorite", "submit_intention_ticket", "submit_intention_ticket_success", "click_registration", "submit_registration", "submit_registration_success", "submit_intention_tag",
                         "click_property_request", "submit_property_request", "submit_property_request_success"]

    version_more_dimension = ["channel", "platform"]

    message_self_hosted_push_port = 8286
    parse_delay = 5

    i18n_locales = ["zh_Hans_CN", "zh_Hant_HK", "en_GB"]
    i18n_default_locale = "en_GB"
    i18n_custom_convert_dict = {
        "en_US": "en_GB",
        "en": "en_GB",
    }

    email_default_method = "aws_ses"
    email_default_sender = "noreply@youngfunding.co.uk"

    aws_ses_location = "eu-west-1"
    aws_s3_location = "eu-west-1"
    aws_s3_bucket = "bbt-currant"
    aws_access_key_id = "AKIAIPHINPVIPJRSE2KQ"
    aws_secret_access_key = "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"

    openexchangerates_app_id = "c4918aa900a343da948ff31b122cba1e"

    sms_default_method = "clickatell"
    clickatell_api_id = 3425954
    clickatell_user = "marco388"
    clickatell_password = "EaSeURGSXGXNbM"

    recaptcha_public_key = "6LfNfvkSAAAAACXjRTaEqvN-aLyG6w5Swp2kh9yz"
    recaptcha_private_key = "6LfNfvkSAAAAAEPFsTe5y8g5zReShTthbHZtWrcj"

    sendcloud_api_user = "postmaster@yangfd.sendcloud.org"
    sendcloud_api_key = "p5WEtUrypcHiNWgL"
    sendcloud_sender_name = "YangFd"
    sendcloud_sender = "noreply@yangfd.com"
    email_send_provider_smart = {
        "cn": "sendcloud",
        "default": "aws_ses",
    }

    custom_error_codes = {
        40099: "Invalid params: No '@' in email address supplied:",
        40098: "Invalid params: current password not provided",
        40097: "Invalid params: old_password not needed",
        40096: "Invalid params: gender",
        40095: "Invalid params: intention",
        40094: "Invalid admin: email not provided.",
        40093: "Invalid params: status",
        40092: "Invalid params: property_type",
        40091: "Invalid params: role",

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
f_app.common.register_error_code(40491)
f_app.common.register_error_code(40399)
