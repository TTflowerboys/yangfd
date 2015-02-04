#!/usr/bin/env python2
# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from bson.objectid import ObjectId
from pyquery import PyQuery as q
from app import f_app
import re
import logging
logger = logging.getLogger(__name__)


def task_on_crawler_selectproperty():
    headers = {
        "Host": "agent-portal.selectproperty.com",
        "Origin": "http://agent-portal.selectproperty.com",
        "Referer": "http://agent-portal.selectproperty.com/login.aspx"
    }
    login_url = "http://agent-portal.selectproperty.com/Login.aspx?ReturnUrl=%2flisting.aspx"
    login_credentials = {
        "ctl00$Main$txtEmail": "mzhang@youngfunding.co.uk",
        "ctl00$Main$txtPassword": "Ma30Ch34",
        "ctl00$Main$btnLogin": "LOGIN  >",
        "__VIEWSTATE": "/wEPDwUJLTM1MDg0MzQxZGQHN4hPRnKD2d7hV805ujtXOOUG/UtSbXtMok8NtcC9fA==",
        "__EVENTVALIDATION": "/wEWBAKfsYDKAQK7h/n7BgKn47+hDgLkzv7OCHePjJX8HKP+nT6u2CzPpu2qwTvcw3g50v2G9ixkYidt"
    }
    login_result = f_app.request.post(login_url, login_credentials, headers=headers)
    cookies = login_result.cookies

    if login_result.status_code == 200:
        project_dict = {}
        is_end = False
        page_count = 1
        search_url = "http://agent-portal.selectproperty.com/listing.aspx"
        list_page_dom_root = q(login_result.content).xhtml_to_html()
        while not is_end:
            logger.debug("start crawling page %d" % page_count)
            table = list_page_dom_root('div#contenttabbox table tr:not([style])')
            __VIEWSTATE = list_page_dom_root('#__VIEWSTATE').value()
            __EVENTVALIDATION = list_page_dom_root('#__EVENTVALIDATION').value()
            print(table.text())
            next_page_params = {
                "ctl00$Main$btnNext": "NEXT PAGE >>",
                "__EVENTVALIDATION": __EVENTVALIDATION,
                "__VIEWSTATE": __VIEWSTATE
            }
            list_page = f_app.request.post(search_url, next_page_params, cookies=cookies)
            if list_page.status_code == 200:
                list_page_dom_root = q(list_page.content).xhtml_to_html()
                if list_page_dom_root('#Main_btnNext'):
                    page_count += 1
                else:
                    is_end = True

    # for key, value in project_dict.iteritems():
    #     property_params = {
    #         "country": ObjectId(f_app.enum.get_by_slug('GB')['id']),
    #     }
    #     property_crawler_id = "%s%s" % (search_url, key)
    #     property_id_list = f_app.property.search({"property_crawler_id": property_crawler_id})
    #     if property_id_list:
    #         property_id = property_id_list[0]
    #     else:
    #         property_params["property_crawler_id"] = property_crawler_id
    #         value = value.split(',')

    #         if len(value) == 2:
    #             name, city = value
    #             property_params["name"] = {"en_GB": name.strip(), "zh_Hans_CN": name.strip()}
    #             property_params["slug"] = name.strip().lower().replace(' ', '-')
    #             property_params["city"] = ObjectId(f_app.enum.get_by_slug("%s" % city.strip().lower())['id'])
    #         elif len(value) == 1:
    #             property_params["name"] = {"en_GB": value[0].strip(), "zh_Hans_CN": value[0].strip()}
    #             property_params["slug"] = value[0].strip().lower().replace(' ', '-')
    #             if "Liverpool" in property_params["name"]:
    #                 property_params["city"] = ObjectId(f_app.enum.get_by_slug("liverpool")['id'])
    #         else:
    #             logger.warning("Invalid knightknox agents plot name, this may be a bug!")

    #         property_params["status"] = "draft"
    #         logger.debug(property_params)
    #         property_id = f_app.property.add(property_params)

    #     property_plot_page = f_app.request.get(property_crawler_id, headers=headers, cookies=cookies)
    #     if property_plot_page.status_code == 200:
    #         logger.debug("Start crawling page %s" % property_crawler_id)
    #         property_plot_page_dom_root = q(property_plot_page.content)
    #         data_rows = property_plot_page_dom_root('#myTable tbody tr')
    #         for row in data_rows:
    #             plot_params = dict()
    #             plot_params["property_id"] = ObjectId(property_id)
    #             plot_params["name"] = {"en_GB": row[0].text, "zh_Hans_CN": row[0].text}
    #             plot_params["plot_crawler_id"] = row[0].text
    #             status = row[1].text.strip()
    #             if status == "Available":
    #                 plot_params["status"] = "selling"
    #             elif status == "Reservation Issued":
    #                 plot_params["status"] = "sold out"
    #             investment_type = row[2].text.strip()
    #             if "Studio" in investment_type:
    #                 plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:studio")["id"])
    #             elif "Apartment" in investment_type:
    #                 plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:apartment")["id"])
    #             elif "Double Room" in investment_type:
    #                 plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:double_room")["id"])
    #             else:
    #                 logger.warning("Unknown investment_type %s, this may be a bug!" % investment_type)
    #             plot_params["bedroom_count"] = int(row[3].text)
    #             plot_params["bathroom_count"] = int(row[4].text)
    #             plot_params["space"] = {"type": "area", "unit": "meter ** 2", "value": row[5].text}
    #             total_price = re.findall(r'[0-9,]+', row[6].text)
    #             if total_price:
    #                 plot_params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
    #             plot_params["floor"] = row[7].text
    #             plot_params["description"] = row[8].text

    #             f_app.plot.crawler_insert_update(plot_params)

if __name__ == '__main__':
    task_on_crawler_selectproperty()
