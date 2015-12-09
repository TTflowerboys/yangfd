# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import re
import json
from datetime import datetime, timedelta
from six.moves import urllib
from pyquery import PyQuery as q
from bson.objectid import ObjectId
from libfelix.f_common import f_app

f_app.dependency_register('pyquery', race="python")


class currant_crawler(f_app.plugin_base):
    task = ["crawler_example", "crawler_london_home", "fortis_developments", "crawler_knightknox", "crawler_selectproperty",
            "crawler_abacusinvestor", "crawler_knightknox_agents"]

    def task_on_crawler_example(self, task):
        # Please use f_app.request for ANY HTTP(s) requests.
        # Fetch the list
        # Fetch the pages
        # Extract needed information
        # Match the information to our property format
        params = {}
        # Save an identifier property_crawler_id into the params. It's recommended to use the page URL whenever applicable.
        params["property_crawler_id"] = "url"
        # Call f_app.property.crawler_insert_update for each property
        f_app.property.crawler_insert_update(params)
        # Add a new task for next fetch. For example, if you want to craw every day:
        f_app.task.put(dict(
            type="crawler_example",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_crawler_london_home(self, task):
        start_page = task.get("start_page", 1)
        is_end = False
        search_url = 'http://www.mylondonhome.com/search.aspx?ListingType=5'
        list_page_counter = start_page
        list_post_data = {
            "__EVENTTARGET": "_ctl1:CenterRegion:_ctl1:cntrlPagingHeader",
            "__EVENTARGUMENT": list_page_counter
        }
        search_url_parsed = urllib.parse.urlparse(search_url)
        search_url_prefix = "%s://%s" % (search_url_parsed.scheme, search_url_parsed.netloc)
        property_image_url_prefix = "http://www.mylondonhome.com/ViewExtraPhotos.aspx?id="

        while not is_end:
            list_post_data["__EVENTARGUMENT"] = list_page_counter
            list_page = f_app.request.post(search_url, list_post_data)
            if list_page.status_code == 200:
                self.logger.debug("Start crawling page %d" % list_page_counter)
                f_app.task.update_set(task, {"start_page": list_page_counter})
                list_page_dom_root = q(list_page.content)
                list_page_nav_links = list_page_dom_root("td.PagerOtherPageCells a.PagerHyperlinkStyle")
                list_page_next_links = []
                for i in list_page_nav_links:
                    if i.text == ">":
                        list_page_next_links.append(i.text)
                is_end = False if len(list_page_next_links) else True

                list_page_property_links = list_page_dom_root("div#cntrlPropertySearch_map_pnlResults a.propAdd")
                for link in list_page_property_links:
                    params = {
                        "country": "GB",
                        "city": f_app.geonames.gazetteer.get_by_geoname_id("2643743")
                    }
                    property_url = "%s%s" % (search_url_prefix, link.attrib['href'])
                    property_site_id = urllib.parse.urlparse(link.attrib['href']).path.split('/')[-1]
                    self.logger.debug(property_url)
                    property_page = f_app.request.get(property_url)
                    if property_page.status_code == 200:
                        params["property_crawler_id"] = property_url
                        property_page_dom_root = q(property_page.content)
                        # Extract information
                        property_page_address = property_page_dom_root('div#propertyAddress h1.ViewPropNamePrice').text()
                        property_page_price = property_page_dom_root('div#propertyAddress h2.ViewPropNamePrice').text()
                        property_page_building_area = property_page_dom_root('div#cntrlPropertyDetails__ctl1_trBuildingArea').text()
                        property_image_page = f_app.request.get(property_image_url_prefix + property_site_id)
                        property_description = property_page_dom_root('div.ViewPropTextContainer')
                        property_description.children('div.VisitorsAlsoviewedMain').remove()
                        property_description.children('script').remove()
                        property_description = property_description.text()

                        params["description"] = {"en_GB": property_description}
                        params["address"] = {"en_GB": property_page_address.strip()}
                        params["name"] = {"en_GB": property_page_address.strip()}

                        if property_image_page.status_code == 200:
                            property_image_page_dom_root = q(property_image_page.content)
                            property_image_tags = property_image_page_dom_root('img.FullsmallImage')
                            property_images = []
                            for img in property_image_tags:
                                img_url = urllib.parse.urlparse(img.attrib['src'])
                                query = urllib.parse.parse_qs(img_url.query)
                                query.pop('h', None)
                                query.pop('w', None)
                                img_url = img_url._replace(query=urllib.parse.urlencode(query, True))
                                property_images.append(urllib.parse.urlunparse(img_url))
                            params["reality_images"] = {"en_GB": property_images, "zh_Hans_CN": property_images, "zh_Hant_HK": property_images}

                        total_price = re.findall(r'[0-9,]+', property_page_price)
                        if total_price:
                            params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
                        if "Share of freehold" in property_page_price:
                            params["equity_type"] = ObjectId(f_app.enum.get_by_slug('virtual_freehold')["id"])
                        elif "Freehold" in property_page_price:
                            params["equity_type"] = ObjectId(f_app.enum.get_by_slug('freehold')["id"])
                        elif "Leasehold" in property_page_price:
                            params["equity_type"] = ObjectId(f_app.enum.get_by_slug('leasehold')["id"])

                        building_area = re.findall(r'[0-9,]+', property_page_building_area)
                        if building_area:
                            params["space"] = {"type": "area", "unit": "foot ** 2", "value": building_area[0].replace(',', '')}

                        f_app.property.crawler_insert_update(params)

                    else:
                        self.logger.debug("Failed crawling property_page %s, status_code is %d" % (property_url, property_page.status_code))
                list_page_counter += 1
            else:
                self.logger.debug("Failed crawling page %d, status_code is %d" % (list_page_counter, list_page.status_code))

        f_app.task.put(dict(
            type="crawler_london_home",
            start=datetime.utcnow() + timedelta(days=1),
            timeout=1800,
        ))

    def task_on_fortis_developments(self, task):
        list_url = 'http://www.fortisdevelopments.com/projects/'
        list_page = f_app.request.get(list_url)
        if list_page.status_code == 200:
            self.logger.debug("Start crawling page %s" % list_url)
            list_page_dom_root = q(list_page.content)
            list_links = list_page_dom_root('h2.projects-accordion__heading--current').siblings('div.projects-accordion__content').children().children()
            for link in list_links:
                params = {
                    "country": "GB"
                }
                property_page_link_url = link.attrib['href']
                property_page = f_app.request.get(property_page_link_url)
                if property_page.status_code == 200:
                    property_page_dom_root = q(property_page.content)
                    images = property_page_dom_root('ul.slides img')
                    videos = property_page_dom_root('div#panel3 a.property-video')
                    if images:
                        property_images = [x.attrib['src'] for x in images]
                        params["reality_images"] = {"en_GB": property_images, "zh_Hans_CN": property_images, "zh_Hant_HK": property_images}
                    if videos:
                        params["videos"] = [{"sources": {"url": x.attrib['href']}} for x in videos]
                    params["name"] = {"en_GB": property_page_dom_root('span.single-property__heading--highlight').text()}
                    params["description"] = {"en_GB": property_page_dom_root('div#panel1').text()}

                params["property_crawler_id"] = property_page_link_url
                f_app.property.crawler_insert_update(params)

        f_app.task.put(dict(
            type="fortis_developments",
            start=datetime.utcnow() + timedelta(days=1),
            timeout=1800,
        ))

    def task_on_crawler_knightknox(self, task):
        start_page = task.get("start_page", 1)
        is_end = False
        search_url = 'http://www.knightknox.com/property/search?country=united+kingdom&region=any&type=any&minbeds=0&maxprice=any&fsbo=on&page=%s'
        list_page_counter = start_page
        search_url_parsed = urllib.parse.urlparse(search_url)
        search_url_prefix = "%s://%s" % (search_url_parsed.scheme, search_url_parsed.netloc)
        while not is_end:
            list_page = f_app.request.get(search_url % list_page_counter, retry=3)
            if list_page.status_code == 200:
                self.logger.debug("Start crawling knightknox page %d" % list_page_counter)
                f_app.task.update_set(task, {"start_page": list_page_counter})
                list_page_dom_root = q(list_page.content)
                list_page_nav_links = list_page_dom_root.find("p#searchpagination.text-center a.raquo")
                is_end = False if len(list_page_nav_links) else True

                list_page_property_links = list_page_dom_root.find("div.featured-prop").children()
                for link in list_page_property_links:
                    img_overlay = link.getchildren()[1].getchildren()[0].attrib
                    # skip sold out property
                    if img_overlay.get("src", None) == "http://static.kkicdn.com/img/overlay-soldout.png":
                        continue
                    params = {
                        "country": "GB"
                    }
                    property_url = "%s%s" % (search_url_prefix, link.attrib['href'])
                    self.logger.debug("property_url", property_url)
                    property_page = f_app.request.get(property_url, retry=3)
                    if property_page.status_code == 200:
                        params["property_crawler_id"] = property_url
                        property_page_dom_root = q(property_page.content)
                        # Extract information
                        property_totle_price = property_page_dom_root("div#listinghero p.price").text()
                        property_name = property_page_dom_root("div#listinghero p.title").text()
                        property_address = property_page_dom_root("div#listinghero p.location").text()
                        property_description = property_page_dom_root("div#description.content").text()
                        property_videos = property_page_dom_root("div#video.content").children().children().children()
                        property_images = property_page_dom_root("div#listinghero div.large-8.medium-8.pull-4.columns div.listing-slider").children().children()

                        property_highlights = property_page_dom_root("ul.features.hide-for-small").children()

                        property_features = property_page_dom_root("ul#features").children()

                        params["description"] = {"en_GB": property_description}
                        params["address"] = {"en_GB": property_address.strip()}
                        params["name"] = {"en_GB": property_name.strip()}

                        total_price = re.findall(r'[0-9,]+', property_totle_price)
                        if total_price:
                            params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}

                        if property_videos:
                            params["videos"] = [{"sources": {"url": video.attrib['src']}} for video in property_videos]

                        if property_images:
                            reality_images = [image.attrib['src'] for image in property_images]
                            params["reality_images"] = {"en_GB": reality_images, "zh_Hans_CN": reality_images, "zh_Hant_HK": reality_images}

                        if property_highlights:
                            params["highlight"] = {"en_GB": [property_highlight.text for property_highlight in property_highlights]}

                        if property_features:
                            for property_feature in property_features:
                                type_and_features = property_feature.text_content().split(":")
                                content_type = type_and_features[0].strip()
                                feature = type_and_features[1].strip()
                                if content_type == "Tenure":
                                    if feature.lower() == "leasehold":
                                        params["equity_type"] = ObjectId(f_app.enum.get_by_slug('leasehold')["id"])
                                elif content_type == "Size":
                                    building_size = re.findall(r'[0-9,]+', feature)
                                    if building_size and "sqm" in feature:
                                        params["space"] = {"type": "area", "unit": "meter ** 2", "value": ".".join(building_size)}
                                elif content_type == "Bathrooms":
                                    if feature.isdigit():
                                        params["bathroom_count"] = int(feature)
                                elif content_type == "Bedrooms":
                                    if feature.isdigit():
                                        params["bedroom_count"] = int(feature)
                                elif content_type == "Type":
                                    if "Apartment" in feature:
                                        params["property_type"] = ObjectId(f_app.enum.get_by_slug('apartment')["id"])
                                    elif "Student Accommodation" == feature:  # what is the property_type
                                        params["investment_type"] = [ObjectId(f_app.enum.get_by_slug('studenthousing')["id"])]

                        f_app.property.crawler_insert_update(params)

                    else:
                        self.logger.error("Failed crawling knightknox property_page %s, status_code is %d" % (property_url, property_page.status_code))
                list_page_counter += 1
            else:
                self.logger.error("Failed crawling knightknox page %d, status_code is %d" % (list_page_counter, list_page.status_code))

        f_app.task.put(dict(
            type="crawler_knightknox",
            start=datetime.utcnow() + timedelta(days=1),
            timeout=1800,
        ))

    def task_on_crawler_knightknox_agents(self, task):
        headers = {
            "Host": "agents.knightknox.com"
        }
        login_url = "http://agents.knightknox.com/login"
        login_credentials = {
            "username": f_app.common.knightknox_agents_username,
            "password": f_app.common.knightknox_agents_password
        }
        login_result = f_app.request.post(login_url, login_credentials, headers=headers)
        cookies = login_result.cookies

        search_url = "http://agents.knightknox.com/projects/"
        if login_result.status_code == 200:
            project_dict = {}
            list_page_dom_root = q(login_result.content)
            options = list_page_dom_root('select[name=project]').children()
            for option in options:
                if option.attrib["value"].strip():
                    project_dict[option.attrib["value"]] = option.text.strip()

        project_properties = [
            (1, "Burgess House, Newcastle", "5451545c6a57070039e5eb4e"),
            (21, "Chronicle House, Chester", "5450da5e6a57070039e5eb49"),
            (26, "East Point, Leeds", "54519c8b6a5707003de5eb49"),
            (24, "Sovereign House, Sheffield", "5452336e6a57070040e5eb47"),
            (16, "The Queen's Brewery, Manchester", "5453c21ae7f2ca00310e291e"),
            (28, "X1 Eastbank, Manchester", "5452d68a6a570700e60fa456"),
            (25, "X1 Liverpool One Phase 1", "5452eb706a570700e60fa5de"),
            (18, "X1 The Edge, Liverpool", "54539b0d6a57070260ddbe33"),
            (13, "X1 The Exchange, Manchester", "545275a86a570700e00fa873"),
            (14, "X1 The Gallery, Liverpool", "545249246a570700df0fa4fe")
        ]

        for item in project_properties:
            key, value, property_id = item
            # property_params = {
            #     "country": ObjectId(f_app.enum.get_by_slug('GB')['id']),
            # }
            property_crawler_id = "%s%s" % (search_url, key)
            # property_id_list = f_app.property.search({"property_crawler_id": property_crawler_id})
            # if property_id_list:
            #     property_id = property_id_list[0]
            # else:
            #     property_params["property_crawler_id"] = property_crawler_id
            #     value = value.split(',')

            #     if len(value) == 2:
            #         name, city = value
            #         property_params["name"] = {"en_GB": name.strip(), "zh_Hans_CN": name.strip()}
            #         property_params["slug"] = name.strip().lower().replace(' ', '-')
            #         property_params["city"] = ObjectId(f_app.enum.get_by_slug("%s" % city.strip().lower())['id'])
            #     elif len(value) == 1:
            #         property_params["name"] = {"en_GB": value[0].strip(), "zh_Hans_CN": value[0].strip()}
            #         property_params["slug"] = value[0].strip().lower().replace(' ', '-')
            #         if "Liverpool" in property_params["name"]:
            #             property_params["city"] = ObjectId(f_app.enum.get_by_slug("liverpool")['id'])
            #     else:
            #         self.logger.warning("Invalid knightknox agents plot name, this may be a bug!")

            #     property_params["status"] = "draft"
            #     self.logger.debug(property_params)
            #     property_id = f_app.property.add(property_params)

            property_plot_page = f_app.request.get(property_crawler_id, headers=headers, cookies=cookies)
            if property_plot_page.status_code == 200:
                self.logger.debug("Start crawling page %s" % property_crawler_id)
                property_plot_page_dom_root = q(property_plot_page.content)
                data_rows = property_plot_page_dom_root('#myTable>tbody>tr')
                for row in data_rows:
                    plot_params = dict()
                    plot_params["property_id"] = ObjectId(property_id)
                    plot_params["name"] = {"en_GB": row[0].text, "zh_Hans_CN": row[0].text}
                    plot_params["plot_crawler_id"] = row[0].text
                    status = row[1].text.strip()
                    if status == "Available":
                        plot_params["status"] = "selling"
                    elif status == "Reservation Issued":
                        plot_params["status"] = "sold out"
                    investment_type = row[2].text.strip()
                    if "Studio" in investment_type:
                        plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:studio")["id"])
                    elif "Apartment" in investment_type:
                        plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:apartment")["id"])
                    elif "Double Room" in investment_type:
                        plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:double_room")["id"])
                    else:
                        self.logger.warning("Unknown investment_type %s, this may be a bug!" % investment_type)
                    plot_params["bedroom_count"] = int(row[3].text)
                    plot_params["bathroom_count"] = int(row[4].text)
                    plot_params["space"] = {"type": "area", "unit": "meter ** 2", "value": row[5].text}
                    total_price = re.findall(r'[0-9,]+', row[6].text)
                    if total_price:
                        plot_params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
                    unitinfo = q(row[7])
                    floor = unitinfo('table.unitinfo>tr')[1][1]
                    plot_params["floor"] = floor.text

                    f_app.plot.crawler_insert_update(plot_params)

        f_app.task.put(dict(
            type="crawler_knightknox_agents",
            start=datetime.utcnow() + timedelta(days=1),
            timeout=1800,
        ))

    def task_on_crawler_abacusinvestor(self, task):
        search_url = "http://www.abacusinvestor.com"
        list_page = f_app.request.get(search_url, retry=3)
        if list_page.status_code == 200:
            self.logger.debug("Start crawling abacusinvestor")
            list_page_dom_root = q(list_page.content)
            list_page_model_script = list_page_dom_root("head script")[1].text
            list_page_model_str = re.findall(r"(?<=publicModel = ).+?(?=;)", list_page_model_script)
            if list_page_model_str:
                list_page_model_json = json.loads(list_page_model_str[0])
                masterPage = list_page_model_json.get("pageList", {}).get("masterPage", [])
                pages = list_page_model_json.get("pageList", {}).get("pages", [])
                if masterPage and pages:
                    masterPage_json = f_app.request.get(masterPage[2], retry=3)
                    page_ids = []
                    if masterPage_json.status_code == 200:
                        masterPage_document_data = json.loads(masterPage_json.content).get("data", {}).get("document_data", {})
                        for key in masterPage_document_data:
                            data_item = masterPage_document_data[key]
                            if data_item.get("type", None) == "Page" and data_item.get("pageUriSEO", None) and data_item.get("pageUriSEO", None) != "student-property-report" and data_item.get("hidePage", False) and data_item.get("indexable", False):
                                page_ids.append(key)
                    else:
                        self.logger.error("Failed crawling abacusinvestor  masterPage in script publicModel%s, status_code is %d" % (masterPage[2], masterPage_json.status_code))
                    if page_ids:
                        crawling_pages = [(page["pageId"], page["urls"][2]) for page in pages if page["pageId"] in page_ids]
                        for crawling_page in crawling_pages:
                            params = {
                                "country": "GB"
                            }
                            self.logger.debug("Start crawling abacusinvestor page id %s, page url %s" % crawling_page)
                            params["property_crawler_id"] = crawling_page[1]
                            property_page = f_app.request.get(crawling_page[1], retry=3)
                            if property_page.status_code == 200:
                                property_document_data = json.loads(property_page.content).get("data", {}).get("document_data", {})
                                property_images = [property_document_data[key]["items"] for key in property_document_data if property_document_data[key]["type"] == "ImageList"]
                                property_text = [property_document_data[key]["text"] for key in property_document_data if property_document_data[key]["type"] == "StyledText"]
                                property_images_urls = []
                                if property_images:
                                    property_images_ids = [property_image.replace("#", "")for property_image in property_images[0]]
                                    property_images_urls = ["http://static.wix.com/media/" + property_document_data[property_images_id]["uri"] for property_images_id in property_images_ids]

                                if property_text:
                                    property_text_dom_root = q(property_text[0])
                                    property_name_dom = property_text_dom_root("strong")
                                    if property_name_dom:
                                        property_name = q(property_name_dom[0]).text()
                                    else:
                                        property_name = ""
                                    property_description = property_text_dom_root.children().text()
                                    params["description"] = {"en_GB": property_description.strip()}
                                    if property_name:
                                        params["name"] = {"en_GB": property_name.strip()}
                                    total_price = re.findall(r'[0-9,]+', property_description)
                                    if total_price:
                                        params["total_price"] = {"value": total_price[0].replace(',', ''), "type": "currency", "unit": "GBP"}
                                    if property_images_urls:
                                        reality_images = [property_images_url for property_images_url in property_images_urls]
                                        params["reality_images"] = {"en_GB": reality_images, "zh_Hans_CN": reality_images, "zh_Hant_HK": reality_images}
                                else:
                                    self.logger.error("Failed crawling abacusinvestor for reason: no html text in property_document_data")
                                f_app.property.crawler_insert_update(params)
                            else:
                                self.logger.error("Failed crawling abacusinvestor page id %s, page url %s, status_code is %d" % (crawling_page[0], crawling_page[1], property_page.status_code))
                    else:
                        self.logger.error("Failed crawling abacusinvestor for reason: no pageids")

                else:
                    self.logger.error("Failed crawling abacusinvestor for reason: no masterPage ,pages or pageList in script publicModel")
            else:
                self.logger.error("Failed crawling abacusinvestor for reason: no publicModel in script")
        else:
            self.logger.error("Failed crawling abacusinvestor home page %s ,status_code is %d" % (search_url, list_page.status_code))

        f_app.task.put(dict(
            type="crawler_abacusinvestor",
            start=datetime.utcnow() + timedelta(days=1),
            timeout=1800,
        ))

    def task_on_crawler_selectproperty(self, task):
        import requests
        s = requests.Session()
        headers = {
            "Host": "ar-portal.selectproperty.com",
            "Origin": "http://ar-portal.selectproperty.com",
            "Referer": "http://ar-portal.selectproperty.com/login.aspx"
        }
        login_url = "http://ar-portal.selectproperty.com/Login.aspx?ReturnUrl=%2flisting.aspx"
        login_credentials = {
            "ctl00$Main$txtEmail": "mzhang@youngfunding.co.uk",
            "ctl00$Main$txtPassword": "Ma30Ch34",
            "ctl00$Main$btnLogin": "LOGIN  >",
            "__VIEWSTATE": "/wEPDwUJLTM1MDg0MzQxZGQHN4hPRnKD2d7hV805ujtXOOUG/UtSbXtMok8NtcC9fA==",
            "__EVENTVALIDATION": "/wEWBAKfsYDKAQK7h/n7BgKn47+hDgLkzv7OCHePjJX8HKP+nT6u2CzPpu2qwTvcw3g50v2G9ixkYidt"
        }
        login_result = s.post(login_url, login_credentials, headers=headers)
        cookies = login_result.cookies

        is_end = False
        page_count = 0
        search_url = "http://ar-portal.selectproperty.com/listing.aspx"
        list_page_dom_root = q(login_result.content).xhtml_to_html()
        while not is_end:
            page_count += 1
            if list_page_dom_root('#Main_btnNext'):
                pass
            else:
                is_end = True
            self.logger.debug("start crawling page %d" % page_count)
            table = list_page_dom_root('div#contenttabbox table tr:not([style])')
            for row in table:
                plot_params = {}
                property_name, plot_name = [x.strip() for x in q(row[0]).text().rsplit(' ', 1)]
                plot_params["name"] = {"en_GB": q(row[0]).text().strip()}
                plot_params["country"] = "GB"
                plot_params["plot_crawler_id"] = q(row[0]).text()

                if property_name == "Vita Student Westgate":
                    plot_params["property_id"] = ObjectId("5446e58cc078a20042679379")
                elif property_name == "Vita Student Telephone House":
                    plot_params["property_id"] = ObjectId("544fc68d6a57070031e5eb47")
                else:
                    self.logger.debug("Unknown property_name:", property_name, " (skipping)")
                    continue

                # property_crawler_id = "%s/%s" % (search_url, property_name)
                # property_id_list = f_app.property.search({"property_crawler_id": property_crawler_id})
                # if property_id_list:
                #     plot_params["property_id"] = ObjectId(property_id_list[0])
                # else:
                #     property_params = {}
                #     property_params["property_crawler_id"] = property_crawler_id
                #     property_params["country"] = ObjectId(f_app.enum.get_by_slug('GB')['id']),
                #     property_params["name"] = {"en_GB": property_name}
                #     property_params["status"] = "draft"
                #     plot_params["property_id"] = ObjectId(f_app.property.add(property_params))

                row_price = q(row[2]).text().replace(',', '').split(' ')
                if len(row_price) == 2:
                    plot_params["total_price"] = {"value": row_price[1], "type": "currency", "unit": row_price[0]}

                if q(row[3]).text().strip() == "Studio":
                    plot_params["investment_type"] = ObjectId(f_app.enum.get_by_slug("investment_type:studio")["id"])
                else:
                    bedroom_text = q(row[3]).text()
                    if bedroom_text:
                        plot_params["bedroom_count"] = int(bedroom_text)

                plot_params["floor"] = q(row[4]).text()

                plot_params["space"] = {"type": "area", "unit": "foot ** 2", "value": q(row[6]).text().split('Sqft')[0].split()[0]}
                plot_params["status"] = "selling"

                plot_id = f_app.plot.crawler_insert_update(plot_params)
                self.logger.debug("plot inserted:", plot_id)

            next_page_params = {
                "ctl00$Main$btnNext": "NEXT PAGE >>",
                "__EVENTVALIDATION": list_page_dom_root('#__EVENTVALIDATION').val(),
                "__VIEWSTATE": list_page_dom_root('#__VIEWSTATE').val()
            }
            if not is_end:
                list_page_next = s.post(search_url, next_page_params, cookies=cookies)
                if list_page_next.status_code == 200:
                    list_page_dom_root = q(list_page_next.content).xhtml_to_html()

        f_app.task.put(dict(
            type="crawler_selectproperty",
            start=datetime.utcnow() + timedelta(days=1),
            timeout=1800,
        ))

currant_crawler()
