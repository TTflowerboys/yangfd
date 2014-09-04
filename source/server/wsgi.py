# -*- coding: utf-8 -*-

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import f_app

import main_interface
import news_api_interface
import property_api_interface
import report_api_interface
import subscription_api_interface
import ticket_api_interface
import analytics_api_interface
import user_api_interface


application = f_app(__name__)
