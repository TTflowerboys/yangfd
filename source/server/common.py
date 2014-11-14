# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app, f_common
from datetime import timedelta


class common(f_common):

    name = "currant"
    debug = True

    blog_name = "currant"
    blog_slug = "currant"

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

    route_log = True

    user_login_type = "phone"
    user_custom_fields = ["email", "register_time", "phone", "city", "country", "state", "zip", "gender", "date_of_birth", "intention", "wechat_id", "counter", "system_message_type", "email_message_type", "locales", "currency", "budget"]
    user_intention = ["cash_flow_protection", "forex", "study_abroad", "immigration_investment", "excess_returns", "fixed_income", "asset_preservation", "immigration_only", "holiday_travel"]
    admin_roles = ["admin", "jr_admin", "sales", "jr_sales", "operation", "jr_operation", "support", "jr_support", "developer", "agency"]
    advanced_admin_roles = ["admin", "jr_admin", "sales", "operation", "support"]
    message_type = ["system", "favorited_property_news", "intention_property_news", "my_property_news"]
    currency = ["CNY", "USD", "GBP", "EUR", "HKD"]

    intention_ticket_statuses = ["new", "assigned", "in_progress", "deposit", "suspended", "bought", "canceled"]
    support_ticket_statuses = ["new", "assigned", "in_progress", "solved", "unsolved"]

    user_action_types = ["click_page", "click_property", "submit_intention_ticket", "submit_intention_ticket_success", "click_registration", "submit_registration", "submit_registration_success", "submit_intention_tag", "submit_property_request", "submit_property_request_success"]

    property_list_per_page = 10

    version_more_dimension = ["channel", "platform"]

    message_self_hosted_push_port = 8286
    parse_delay = 5

    # i18n_locales = ["zh_Hans_CN", "zh_Hant_HK", "en_GB"]
    i18n_locales = ["zh_Hans_CN"]
    i18n_additional_param_locales = ["en_GB", "zh_Hant_HK"]
    i18n_default_locale = "zh_Hans_CN"
    i18n_custom_convert_dict = {
        "en_US": "en_GB",
        "en": "en_GB",
    }
    i18n_sitemap_enable_locales = False

    sitemap_domain = "www.yangfd.com"

    email_default_method = "aws_ses"
    email_default_sender = "noreply@youngfunding.co.uk"

    aws_ses_location = "eu-west-1"
    aws_s3_location = "eu-west-1"
    aws_s3_bucket = "bbt-currant"
    aws_access_key_id = "AKIAIPHINPVIPJRSE2KQ"
    aws_secret_access_key = "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"

    qiniu_access_key = "wVRJocfeRVWT5i9fwlYlMSp45a_BiicklAysYPeb"
    qiniu_secret_key = "Byktg1aTZxoTOwjW1MaMebFL-vFMGz6OJZB4CR8b"
    qiniu_bucket = "bbt-currant"

    openexchangerates_app_id = "c4918aa900a343da948ff31b122cba1e"

    sms_default_method = "clickatell"
    clickatell_api_id = 3425954
    clickatell_user = "marco388"
    clickatell_password = "EaSeURGSXGXNbM"

    recaptcha_public_key = "6LdOPfwSAAAAALlc4POi3YiUJmKe_rUw6-xO6NsN"
    recaptcha_private_key = "6LdOPfwSAAAAACd2X9w4fbI8L4afGWXC-gV3QuDr"

    opencaptcha_width = 100
    opencaptcha_height = 48
    opencaptcha_html = "<input type='hidden' name='challenge' value='%(challenge)s'><a href='#' onclick='refreshCaptcha()'><img src='http://www.opencaptcha.com/img/%(challenge)s'  height='%(height)s' alt='captcha' width='%(width)s' border='0'/></a><input name='code' size=10 type=text data-validator='required, trim'>"

    touclick_public_key = "7ba2ba84-1ebe-4bf5-9fb4-c888612d5204"
    touclick_private_key = "0160ee89-06bb-4535-bb24-3fa517feea9d"
    touclick_api_version = "v2-2"

    sendcloud_api_user = "postmaster@yangfd.sendcloud.org"
    sendcloud_api_key = "p5WEtUrypcHiNWgL"
    sendcloud_sender_name = "YangFd"

    sendgrid_api_user = "arnold wang"
    sendgrid_api_key = "AH0ecwSNWsaz"
    sendgrid_sender_name = "YangFd"

    email_provider_sender_smart = {
        "CN":
        {
            "method": "sendcloud",
            "sender": "noreply@yangfd.com"
        },
        "default":
        {
            "method": "sendgrid",
            "sender": "noreply@youngfunding.co.uk"
        }
    }

    email_template_logo_url = "http://yangfd.com/static/images/logo/logo-header.png"

    captcha_provider_smart = {
        "CN":
        {
            "method": "opencaptcha",
        },
        "INTRANET":
        {
            "method": "opencaptcha",
        },
        "default":
        {
            "method": "opencaptcha",
        }
    }

    storage_provider_smart = {
        "CN":
        {
            "method": "qiniu",
        },
        "INTRANET":
        {
            "method": "qiniu",
        },
        "default":
        {
            "method": "aws_s3",
        }
    }

    knightknox_agents_username = "digitalenterprise"
    knightknox_agents_password = "digital4853"

    walkscore_api_key = "0f25727a26eb30f4871c6b2e6c2e0318"

    user_email_verification_code_expire_in = timedelta(hours=24)

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
        40090: "Invalid operation: This property has already been added to your favorites.",
        40089: "Invalid image source: not from existing property or news",
        40088: "Failed to get walkscore",

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
f_app.common.register_error_code(40490)
f_app.common.register_error_code(40489)
f_app.common.register_error_code(40488)
f_app.common.register_error_code(40399)
