# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import timedelta
from libfelix.f_common import f_app, f_plugin, f_common


class common(f_common):
  
    name = "currant"
    debug = True

    newrelic = False
    newrelic_config = "conf/currant_newrelic.ini"

    static_file_debug_enabled = True
    static_file_debug = lambda self, filepath, root: (filepath, "views/src/.tmp/static/")

    tpl_debug_enabled = True
    tpl_debug = lambda self, tplname: "src/.tmp/" + tplname

    log_file = "currant.log"

    cookie_name = "currant_auth"

    mongo_dbname = "currant"
    mongo_server = "172.20.1.1"
    mongo_auth = False

    memcache_server = ["172.20.1.1:11211"]
    memcache_lib = "memcache"

    user_custom_fields = ["email", "register_time", "phone", "address1", "address2", "city", "country", "state", "company", "title", "zip", "gender", "date_of_birth", "face"]
    private_custom_fields = ["email", "register_time", "address0", "address2", "city", "country", "state", "company", "title", "zip", "gender", "face"]
   
    version_more_dimension = ["channel", "platform"]

    message_self_hosted_push_port = 8286
    parse_delay = 5

    i18n_locales = ['zh_Hans_CN', 'zh_Hant_HK', 'en_GB']

common()
