# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from libfelix.f_common import f_app, f_common
from datetime import timedelta


class common(f_common):

    name = "currant"
    debug = True
    # profiling = True

    blog_name = "currant"
    blog_slug = "currant"

    newrelic = False
    newrelic_config = "conf/currant_newrelic.ini"

    landing_only = False
    crowdfunding_ready = True

    static_file_debug_enabled = True
    static_file_debug = lambda self, filepath, root: (filepath, "views/static/")

    tpl_debug_enabled = True
    tpl_debug = lambda self, tplname: "" + tplname

    log_file = "currant.log"

    sentry = True
    sentry_dsn = "http://dcc7b828827043af9752543a78c905c7:8e889b61c1b04a0c80938df2bf660732@sentry.bbtechgroup.com/2"

    cookie_name = "currant_auth"

    mongo_dbname = "currant"
    mongo_server = "172.20.1.1"
    mongo_auth = False
    mongo_dbversion = 28

    memcache_server = ["172.20.1.1:11211"]
    memcache_lib = "memcache"

    mongo_index_term_extractor = "jieba"

    route_log = True
    use_ssl = False

    user_login_type = "phone"
    user_check_suspended = True
    user_custom_fields = ["email", "register_time", "phone", "city", "country", "state", "zipcode", "gender", "date_of_birth", "intention", "counter", "system_message_type", "email_message_type", "locales", "currencies", "budget", "is_vip", "state", "address1", "address2", "occupation", "status", "wechat", "private_contact_methods", "user_type", "referral", "coupon"]
    user_intention = ["cash_flow_protection", "forex", "study_abroad", "immigration_investment", "excess_returns", "fixed_income", "asset_preservation", "immigration_only", "holiday_travel"]
    admin_roles = ["admin", "jr_admin", "sales", "jr_sales", "operation", "jr_operation", "support", "jr_support", "developer", "agency"]
    special_roles = ["affiliate"]
    advanced_admin_roles = ["admin", "jr_admin", "sales", "operation", "support"]
    message_type = ["system"]
    email_message_type = ["system", "rent_ticket_reminder", "rent_intention_ticket_check_rent"]
    currency = ["CNY", "USD", "GBP", "EUR", "HKD"]

    intention_ticket_statuses = ["new", "assigned", "in_progress", "deposit", "suspended", "bought", "canceled"]
    rent_intention_ticket_statuses = ["new", "requested", "assigned", "in_progress", "rejected", "confirmed_video", "booked", "holding_deposit_paid", "checked_in", "canceled"]
    support_ticket_statuses = ["new", "assigned", "in_progress", "solved", "unsolved"]

    user_action_types = ["click_page", "click_property", "submit_intention_ticket", "submit_intention_ticket_success", "click_registration", "submit_registration", "submit_registration_success", "submit_intention_tag", "submit_property_request", "submit_property_request_success"]

    virtual_shop_id = "54bca9b46b8099382cf7a515"
    view_rent_ticket_contact_info_id = "523ac0ef5c8988c84d6022cb"

    property_list_per_page = 10

    password_default_length = 8

    referral_default_length = 6

    version_more_dimension = ["channel", "platform"]

    message_self_hosted_push_listen = "0.0.0.0"
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
    country_list = ["GB", "CN", "US", "HK", "TW", "IE", "DE", "FR", "IT", "ES", "NL", "IN", "RU", "JP", "SG", "MY"]
    country_list_for_intention = ["GB", "CN", "US", "HK", "TW", "IE", "DE", "FR", "IT", "ES", "NL", "IN", "RU", "JP", "SG", "MY"]

    i18n_user_priority = None
    i18n_request_header_priority = None

    sitemap_domain = "www.yangfd.com"

    params_replaces_list = {
        "upload.yangfd.com": "bbt-currant.s3.amazonaws.com",
        "s3.yangfd.cn": "bbt-currant.s3.amazonaws.com",
        "7vih1w.com2.z0.glb.qiniucdn.com": "bbt-currant.s3.amazonaws.com",
    }
    params_replaces_default = True

    email_default_method = "aws_ses"
    email_default_sender = "noreply@youngfunding.co.uk"

    apns_use_sandbox = True

    apns_sandbox_cert_file = "../ios/Provision/apns/apns-dev-cert.pem"
    apns_sandbox_key_file = apns_sandbox_cert_file

    apns_cert_file = "../ios/Provision/apns/apns-pro-cert.pem"
    apns_key_file = apns_cert_file

    aws_ses_location = "eu-west-1"
    aws_s3_location = "eu-west-1"
    aws_s3_bucket = "bbt-currant"
    aws_access_key_id = "AKIAIPHINPVIPJRSE2KQ"
    aws_secret_access_key = "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"

    qiniu_access_key = "wVRJocfeRVWT5i9fwlYlMSp45a_BiicklAysYPeb"
    qiniu_secret_key = "Byktg1aTZxoTOwjW1MaMebFL-vFMGz6OJZB4CR8b"
    qiniu_bucket = "bbt-currant"

    openexchangerates_app_id = "c4918aa900a343da948ff31b122cba1e"

    wechat_token = "chaichouzeec6ievashoSei8bahxathi"
    wechat_appid = "wx123992a4d173037b"
    wechat_appsecret = "ddee09f4132e2d04c7cbdd6b3d684ae8"

    # sms_default_method = "clickatell"
    sms_default_method = "nexmo"
    clickatell_api_id = 3425954
    clickatell_user = "marco388"
    clickatell_password = "EaSeURGSXGXNbM"
    nexmo_api_key = "069872f2"
    nexmo_api_secret = "9c4d83a4"
    nexmo_default_sender = "13605895103"
    nexmo_number_mapping_dimensions = ["ticket_id"]

    user_sms_verification_msg = "%s 为您的洋房东手机验证码，1小时内有效。感谢您使用洋房东的服务。"

    recaptcha_public_key = "6LdOPfwSAAAAALlc4POi3YiUJmKe_rUw6-xO6NsN"
    recaptcha_private_key = "6LdOPfwSAAAAACd2X9w4fbI8L4afGWXC-gV3QuDr"

    opencaptcha_width = 100
    opencaptcha_height = 48
    opencaptcha_html = "<input type='hidden' name='challenge' value='%(challenge)s'><a onclick='refreshCaptcha()'><img src='http://www.opencaptcha.com/img/%(challenge)s' height='%(height)s' alt='captcha' width='%(width)s' border='0'/></a><input name='solution' size=10 type=text data-validator='required, trim'>"

    touclick_public_key = "031024af-e0a6-4f38-a189-8f51378be624"
    touclick_private_key = "89fbafb1-083c-41f1-a580-86396121bb16"
    touclick_api_version = "v2-2"

    captchasnet_username = 'felixonmars'
    captchasnet_secret = 'uFoPPa8gd36dnZGskPd0zcjEbYS7llh1GhrQu8IO'
    captchasnet_width = 140
    captchasnet_height = 100
    captchasnet_html = "<input type='hidden' name='challenge' value='%(challenge)s'><a onclick='refreshCaptcha()'><img src='http://image.captchas.net?client=%(username)s&random=%(challenge)s&width=%(width)d&height=%(height)d%(customization)s' height='%(height)s' alt='captcha' width='%(width)s' border='0' /></a><input name='solution' size=10 type=text data-validator='required, trim'>"
    captchasnet_letters = 4

    sendcloud_api_user = "postmaster@yangfd.sendcloud.org"
    sendcloud_api_key = "p5WEtUrypcHiNWgL"
    sendcloud_sender_name = "YangFd"

    sendgrid_api_user = "arnold wang"
    sendgrid_api_key = "AH0ecwSNWsaz"
    sendgrid_sender_name = "YangFd"

    email_provider_sender_smart = {
        "CN-disabled":
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
            "method": "captchasnet",
        },
        "INTRANET":
        {
            "method": "captchasnet",
        },
        "default":
        {
            "method": "captchasnet",
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
        40087: "background process are still processing the property, try again later",

        40399: "Permission denied",
        40398: "Permission denied: not a valid property_id",
        40397: "User already refreshed today",
    }

    run_baidu_zhanzhang = False

common()

f_app.common.register_error_code(40099)
f_app.common.register_error_code(40098)
f_app.common.register_error_code(40097)
f_app.common.register_error_code(40096)
f_app.common.register_error_code(40095)
f_app.common.register_error_code(40094)
f_app.common.register_error_code(40093)
f_app.common.register_error_code(40092)
f_app.common.register_error_code(40091)
f_app.common.register_error_code(40090)
f_app.common.register_error_code(40089)
f_app.common.register_error_code(40088)
f_app.common.register_error_code(40087)
f_app.common.register_error_code(40399)
f_app.common.register_error_code(40398)
f_app.common.register_error_code(40397)
