#!/usr/bin/env python2
# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from bson.objectid import ObjectId
from pyquery import PyQuery as q
from app import f_app
import logging
logger = logging.getLogger(__name__)


def task_on_crawler_selectproperty():
    import requests
    s = requests.Session()
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
    login_result = s.post(login_url, login_credentials, headers=headers)
    cookies = login_result.cookies

    if login_result.status_code == 200:
        is_end = False
        page_count = 0
        search_url = "http://agent-portal.selectproperty.com/listing.aspx"
        list_page_dom_root = q(login_result.content).xhtml_to_html()
        while not is_end:
            page_count += 1
            if list_page_dom_root('#Main_btnNext'):
                pass
            else:
                is_end = True
            logger.debug("start crawling page %d" % page_count)
            table = list_page_dom_root('div#contenttabbox table tr:not([style])')
            for row in table:
                plot_params = {}
                property_name, plot_name = [x.strip() for x in q(row[0]).text().rsplit(' ', 1)]
                plot_params["name"] = {"en_GB": q(row[0]).text().strip()}
                plot_params["country"] = ObjectId(f_app.enum.get_by_slug('GB')['id']),
                plot_params["plot_crawler_id"] = q(row[0]).text()

                property_crawler_id = "%s/%s" % (search_url, property_name)
                property_id_list = f_app.property.search({"property_crawler_id": property_crawler_id})
                if property_id_list:
                    plot_params["property_id"] = ObjectId(property_id_list[0])
                else:
                    property_params = {}
                    property_params["property_crawler_id"] = property_crawler_id
                    property_params["country"] = ObjectId(f_app.enum.get_by_slug('GB')['id']),
                    property_params["name"] = {"en_GB": property_name}
                    property_params["status"] = "draft"
                    plot_params["property_id"] = ObjectId(f_app.property.add(property_params))

                row_price = q(row[2]).text().replace(',', '').split(' ')
                if len(row_price) == 2:
                    plot_params["total_price"] = {"value": row_price[1], "type": "currency", "unit": row_price[0]}

                if q(row[3]).text().strip() == "Studio":
                    plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:studio")["id"])
                else:
                    plot_params["bedroom_count"] = int(q(row[3]).text())

                plot_params["floor"] = q(row[4]).text()

                plot_params["space"] = {"type": "area", "unit": "foot ** 2", "value": q(row[6]).text().split('Sqft')[0].split()[0]}
                plot_params["status"] = "selling"

                plot_id = f_app.plot.crawler_insert_update(plot_params)
                logger.debug(plot_id)

            next_page_params = {
                "ctl00$Main$btnNext": "NEXT PAGE >>",
                "__EVENTVALIDATION": list_page_dom_root('#__EVENTVALIDATION').val(),
                "__VIEWSTATE": list_page_dom_root('#__VIEWSTATE').val()
            }
            if not is_end:
                list_page_next = s.post(search_url, next_page_params, cookies=cookies)
                if list_page_next.status_code == 200:
                    list_page_dom_root = q(list_page_next.content).xhtml_to_html()

if __name__ == '__main__':
    task_on_crawler_selectproperty()
