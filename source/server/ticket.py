# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import random
from datetime import datetime, timedelta
from six.moves import urllib
from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_ticket import f_ticket
from libfelix.f_interface import request, template


# TODO: remove the module and use plugins to achieve the same functionality
class currant_ticket(f_ticket):
    """
        ==================================================================
        Ticket
        ==================================================================
    """
    def output(self, ticket_id_list, enable_custom_fields=True, ignore_nonexist=False, fuzzy_user_info=False, multi_return=list, location_only=False, permission_check=True):
        ticket_list = f_app.util.extract_obj(ticket_id_list, self, ignore_nonexist=ignore_nonexist)
        user_id_set = set()
        enum_id_set = set()
        property_id_set = set()
        for t in ticket_list:
            if t is not None:
                if t.get("property_id"):
                    property_id_set.add(t["property_id"])

                if not location_only:
                    if not enable_custom_fields:
                        t.pop("custom_fields", None)
                    user_id_set.add(t.get("creator_user_id"))
                    user_id_set.add(t.get("user_id"))
                    user_id_set |= set(t.get("assignee", []))
                    if t.get("budget"):
                        enum_id_set.add(t["budget"]["id"])

        property_dict = f_app.property.output(list(property_id_set), multi_return=dict, ignore_nonexist=ignore_nonexist, permission_check=permission_check)

        if not location_only:
            user_id_set = filter(None, user_id_set)
            user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields, permission_check=permission_check)
            user_dict = {None: None}
            enum_dict = f_app.enum.get(enum_id_set, multi_return=dict)

            for u in user_list:
                user_dict[u["id"]] = u

            for t in ticket_list:
                if t is not None:
                    creator_user = user_dict.get(t.pop("creator_user_id", None))
                    if creator_user:
                        t["creator_user"] = creator_user

                        if fuzzy_user_info:
                            if "nickname" in t["creator_user"] and t["creator_user"]["nickname"] is not None:
                                t["creator_user"]["nickname"] = t["creator_user"]["nickname"][:1] + "**"

                            if "email" in t["creator_user"] and t["creator_user"]["email"] is not None:
                                t["creator_user"]["email"] = t["creator_user"]["email"][:3] + "**@**"

                            if "phone" in t["creator_user"] and t["creator_user"]["phone"] is not None:
                                if len(t["creator_user"]["phone"]) > 6:
                                    t["creator_user"]["phone"] = t["creator_user"]["phone"][:3] + "*" * (len(t["creator_user"]["phone"]) - 6) + t["creator_user"]["phone"][-3:]
                                else:
                                    t["creator_user"]["phone"] = t["creator_user"]["phone"][:3] + "***"

                            if "wechat" in t["creator_user"] and t["creator_user"]["wechat"] is not None:
                                t["creator_user"]["wechat"] = t["creator_user"]["wechat"][:3] + "***"

                    actual_user = user_dict.get(t.pop("user_id", None))
                    if actual_user:
                        t["user"] = actual_user

                        if fuzzy_user_info:
                            if "nickname" in t["user"] and t["user"]["nickname"] is not None:
                                t["user"]["nickname"] = t["user"]["nickname"][:1] + "**"

                            if "email" in t["user"] and t["user"]["email"] is not None:
                                t["user"]["email"] = t["user"]["email"][:3] + "**@**"

                            if "phone" in t["user"] and t["user"]["phone"] is not None:
                                if len(t["user"]["phone"]) > 6:
                                    t["user"]["phone"] = t["user"]["phone"][:3] + "*" * (len(t["user"]["phone"]) - 6) + t["user"]["phone"][-3:]
                                else:
                                    t["user"]["phone"] = t["user"]["phone"][:3] + "***"

                            if "wechat" in t["user"] and t["user"]["wechat"] is not None:
                                t["user"]["wechat"] = t["user"]["wechat"][:3] + "***"

                    if isinstance(t.get("assignee"), list):
                        t["assignee"] = map(lambda x: user_dict.get(x), t["assignee"])
                    if t.get("budget"):
                        t["budget"] = enum_dict.get(t["budget"]["id"])
                    if t.get("property_id"):
                        t["property"] = property_dict.get(t.pop("property_id"))
                    if "interested_rent_tickets" in t:
                        t["interested_rent_tickets"] = f_app.ticket.output(
                            t["interested_rent_tickets"],
                            enable_custom_fields=enable_custom_fields,
                            ignore_nonexist=True,
                            fuzzy_user_info=fuzzy_user_info,
                            multi_return=multi_return,
                            location_only=location_only,
                            permission_check=permission_check,
                        )

        else:
            new_ticket_list = []
            for t in ticket_list:
                if t is not None:
                    new_ticket = {"id": t["id"]}
                    if t.get("property_id"):
                        t["property"] = property_dict.get(t.pop("property_id"))
                        if "latitude" in t["property"]:
                            new_ticket.update(dict(
                                latitude=t["property"]["latitude"],
                                longitude=t["property"]["longitude"],
                            ))
                    new_ticket_list.append(new_ticket)
                else:
                    new_ticket_list.append(None)
            ticket_list = new_ticket_list

        if multi_return == list:
            return ticket_list

        else:
            return dict(zip(ticket_id_list, ticket_list))

    def history_single_output(self, ticket_id):
        user_id_set = set([])
        ticket_history_list = f_app.ticket.history_get(f_app.ticket.history_get_by_ticket(ticket_id))

        for history in ticket_history_list:
            if history.get("operator_user_id") is not None:
                user_id_set.add(history["operator_user_id"])
                if "_set" in history:
                    if "assignee" in history["_set"]:
                        user_id_set |= set(history["_set"].get("assignee", []))
                if "_push" in history:
                    if "assignee" in history["_push"]:
                        user_id_set.add(history["_push"].get("assignee"))

        user_list = f_app.user.output(user_id_set, custom_fields=f_app.common.user_custom_fields)
        user_dict = {i["id"]: i for i in user_list}

        for history in ticket_history_list:
            if history.get("operator_user_id") is not None:
                history["operator_user"] = user_dict.get(history.pop("operator_user_id"))
                if "_set" in history:
                    if "assignee" in history["_set"]:
                        history["_set"]["assignee"] = [user_dict.get(user) for user in history.pop("assignee", [])]
                if "_push" in history:
                    if "assignee" in history["_push"]:
                        history["_push"]["assignee"] = user_dict.get(history["_push"].pop("assignee"))

        return ticket_history_list

    def ensure_tag(self, ticket_id, tag):
        ticket = f_app.ticket.get(ticket_id)
        tags = ticket.get("tags", [])
        if tag in tags:
            return
        f_app.ticket.update(ticket_id, {"$push": {"tags": tag}}, keep_modified_time=True)

    def update_ticket_crawler_info(self, ticket_id, crawler_site, crawler_url, crawler_enable=True):
        self.update_set(
            ticket_id,
            {
                "crawler_url": crawler_url,
                "crawler_site": crawler_site,
                "crawler_enable": crawler_enable
            }
        )

currant_ticket()


class currant_ticket_plugin(f_app.plugin_base):
    task = ["rent_ticket_reminder", "rent_ticket_generate_digest_image", "rent_ticket_check_intention",
            "rent_intention_ticket_check_rent", "fill_featured_facilities", "assign_ticket_short_id"]

    def ticket_update_after(self, ticket_id, params, ticket, ignore_error=True):
        if "$set" in params:
            params = params["$set"]
        if ticket is None:
            return ticket_id
        if ticket["type"] == "rent" and "status" in params and params["status"] == "to rent":
            f_app.task.add(dict(
                type="rent_ticket_check_intention",
                ticket_id=ticket_id,
            ))
            new_url = "http://yangfd.com/property-to-rent/" + str(ticket_id)
            f_app.task.put(dict(
                type="ping_sitemap",
                url=new_url
            ))
            import currant_util
            this_ticket = f_app.i18n.process_i18n(f_app.ticket.output([ticket_id]), _i18n=["zh_Hans_CN"])[0]
            ticket_email_user = f_app.util.ticket_determine_email_user(this_ticket)
            if 'property' in this_ticket and ticket_email_user:
                title = "恭喜，您的房源已经发布成功！"
                f_app.email.schedule(
                    target=ticket_email_user["email"],
                    subject=title,
                    # TODO
                    text=template("static/emails/rent_ticket_publish_success", title=title, nickname=ticket_email_user["nickname"], rent=this_ticket, date="", get_country_name_by_code=currant_util.get_country_name_by_code),
                    display="html",
                    ticket_match_user_id=ticket_email_user["id"],
                    tag="rent_ticket_publish_success",
                )

            if 'property' in this_ticket and this_ticket["property"].get("user_generated") is True:
                f_app.property.update_set(this_ticket["property"]["id"], {"status": "selling"})

        elif ticket["type"] == "rent_intention" and "status" in params and params["status"] == "new":
            f_app.task.add(dict(
                type="rent_intention_ticket_check_rent",
                ticket_id=ticket_id,
            ))
            sales_list = f_app.user.get(f_app.user.search({"role": {"$in": ["operation", "jr_operation"]}}))
            for sales in sales_list:
                if "email" in sales:
                    admin_url = "http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/rent_intention"
                    f_app.email.schedule(
                        target=sales["email"],
                        subject=f_app.util.get_format_email_subject(template("static/emails/new_rent_intention_ticket_title")),
                        text=template("static/emails/new_rent_intention_ticket", params=params, admin_console_url=admin_url),
                        display="html",
                        tag="new_rent_intention_ticket",
                    )
        elif ticket["type"] == "rent_intention" and "status" in params and params["status"] == "requested" and "interested_rent_tickets" in params and len(params["interested_rent_tickets"]):
            import currant_util
            this_ticket = f_app.i18n.process_i18n(f_app.ticket.output([ticket_id]), _i18n=["zh_Hans_CN"])[0]
            sales_list = f_app.user.get(f_app.user.search({"role": {"$in": ["operation", "jr_operation"]}}))
            for sales in sales_list:
                if "email" in sales:
                    locale = sales.get("locales", [f_app.common.i18n_default_locale])[0]
                    request._requested_i18n_locales_list = [locale]
                    title = f_app.util.get_format_email_subject(template("static/emails/new_rent_request_intention_ticket_title"))
                    url = "http://yangfd.com/property-to-rent/" + this_ticket["interested_rent_tickets"][0]["id"]
                    admin_url = "http://yangfd.com/admin?_i18n=zh_Hans_CN#/dashboard/rent_request_intention"
                    f_app.email.schedule(
                        target=sales["email"],
                        subject=title,
                        text=template("static/emails/new_rent_request_intention_ticket", title=title, params=this_ticket, target_property_to_rent_url=url, admin_console_url=admin_url),
                        display="html",
                        tag="new_rent_request_intention_ticket",
                    )

            f_app.task.put(dict(
                type="assign_ticket_short_id",
                ticket_id=str(ticket_id),
            ))

        elif ticket["type"] == "rent_intention" and "status" in params and params["status"] in ["checked_in", "canceled"]:
            f_app.sms.nexmo.number.mapping.clean({"ticket_id": ObjectId(ticket["id"])})

        return ticket_id

    def task_on_rent_ticket_check_intention(self, task):
        ticket_id = task["ticket_id"]
        ticket = f_app.i18n.process_i18n(f_app.ticket.output([ticket_id], permission_check=False, ignore_nonexist=True)[0], _i18n=["zh_Hans_CN"])

        if ticket is None or "property" not in ticket or ticket["property"] is None or "country" not in ticket["property"] or "city" not in ticket["property"] or "rent_available_time" not in ticket:
            return

        f_app.util.check_and_override_minimum_rent_period(ticket)

        # Scan existing rent intention ticket
        params = {
            "type": "rent_intention",
            "status": "new",
            "country.code": ticket["property"]["country"]["code"],
            "city._id": ObjectId(ticket["property"]["city"]["id"]),
        }
        rent_intention_tickets = f_app.ticket.output(f_app.ticket.search(params=params, per_page=-1), permission_check=False)

        for intention_ticket in rent_intention_tickets:
            ticket_email_user = f_app.util.ticket_determine_email_user(intention_ticket)
            if ticket_email_user is None:
                continue

            if intention_ticket.get("disable_matching") is True:
                continue

            if "rent_intention_ticket_check_rent" not in ticket_email_user.get("email_message_type", []):
                continue

            if "rent_budget_min" not in intention_ticket and "rent_budget_max" not in intention_ticket or "bedroom_count" not in intention_ticket or "rent_type" not in intention_ticket or "rent_available_time" not in intention_ticket:
                continue

            bedroom_count = f_app.util.parse_bedroom_count(intention_ticket["bedroom_count"])
            A = True
            if bedroom_count[0] is not None:
                A = A and bedroom_count[0] <= ticket["property"]["bedroom_count"]
            if bedroom_count[1] is not None:
                A = A and bedroom_count[1] >= ticket["property"]["bedroom_count"]

            B = True
            price = ticket["price"]["value_float"]
            if "rent_budget_min" in intention_ticket:
                rent_budget_currency = intention_ticket["rent_budget_min"]["unit"]
            else:
                rent_budget_currency = intention_ticket["rent_budget_max"]["unit"]
            if ticket["price"]["unit"] != rent_budget_currency:
                price = float(f_app.i18n.convert_currency({"unit": ticket["price"]["unit"], "value_float": ticket["price"]["value_float"]}, rent_budget_currency))
            if "rent_budget_min" in intention_ticket:
                B = B and intention_ticket["rent_budget_min"]["value_float"] <= price
            if "rent_budget_max" in intention_ticket:
                B = B and intention_ticket["rent_budget_max"]["value_float"] >= price

            C = ticket["rent_available_time"].year == intention_ticket["rent_available_time"].year and ticket["rent_available_time"].month == intention_ticket["rent_available_time"].month
            if "rent_deadline_time" in ticket and "rent_deadline_time" in intention_ticket:
                C = C and ticket["rent_deadline_time"].year == intention_ticket["rent_deadline_time"].year and ticket["rent_deadline_time"].month == intention_ticket["rent_deadline_time"].month

            f_app.util.check_and_override_minimum_rent_period(intention_ticket)
            if "minimum_rent_period" in ticket and "minimum_rent_period" in intention_ticket:
                D = ticket["minimum_rent_period"]["value_float"] >= intention_ticket["minimum_rent_period"]["value_float"]
            else:
                D = 1

            if "maponics_neighborhood" in ticket and "maponics_neighborhood" in intention_ticket:
                E = ticket["maponics_neighborhood"]["id"] == intention_ticket["maponics_neighborhood"]["id"]
            # TODO: Not matchable
            # elif "hesa_university" in ticket and "hesa_university" in intention_ticket:
            #     E = ticket["hesa_university"]["id"] == intention_ticket["hesa_university"]["id"]
            elif "zipcode_index" in ticket["property"] and "zipcode_index" in intention_ticket:
                E = ticket["property"]["zipcode_index"] == intention_ticket["zipcode_index"]
            else:
                E = 1

            F = ticket["rent_type"]["id"] == intention_ticket["rent_type"]["id"]

            score = A + B + C + D + E + F
            unsubscribe_url = 'http://yangfd.com/email-unsubscribe?email_message_type=rent_intention_ticket_check_rent'
            import currant_util

            if score == 6:
                title = "洋房东给您匹配到了合适的房源，快来看看吧！"
                f_app.email.schedule(
                    target=ticket_email_user["email"],
                    subject=title,
                    # TODO
                    text=template("static/emails/rent_intention_matched_1", title=title, nickname=ticket_email_user["nickname"], date="", rent_ticket=ticket, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                    display="html",
                    ticket_match_user_id=ticket_email_user["id"],
                    tag="rent_intention_matched_1",
                )
                f_app.ticket.ensure_tag(intention_ticket["id"], "perfect_match")
            elif score >= 4:
                title = "洋房东给您匹配到了一些房源，快来看看吧！"
                sent_in_a_day = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "ticket_match_user_id": ticket_email_user["id"], "start": {"$gte": datetime.utcnow() - timedelta(days=1)}})
                if len(sent_in_a_day):
                    pass
                else:
                    f_app.email.schedule(
                        target=ticket_email_user["email"],
                        subject=title,
                        # TODO
                        text=template("static/emails/rent_intention_matched_4", title=title, nickname=ticket_email_user["nickname"], date="", rent_ticket=ticket, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                        display="html",
                        ticket_match_user_id=ticket_email_user["id"],
                        tag="rent_intention_matched_4",
                    )
                f_app.ticket.ensure_tag(intention_ticket["id"], "partial_match")

    def task_on_rent_intention_ticket_check_rent(self, task):
        ticket_id = task["ticket_id"]
        intention_ticket = f_app.ticket.output([ticket_id], permission_check=False)[0]
        ticket_email_user = f_app.util.ticket_determine_email_user(intention_ticket)

        if ticket_email_user is None:
            self.logger.debug("Ignoring rent_intention_ticket_check_rent for ticket", ticket_id, "as the creator user doesn't have email filled.")
            return

        if intention_ticket.get("disable_matching") is True:
            return

        if "rent_intention_ticket_check_rent" not in ticket_email_user.get("email_message_type", []):
            return

        if "rent_budget_min" in intention_ticket:
            rent_budget_currency = intention_ticket["rent_budget_min"]["unit"]
        elif "rent_budget_max" in intention_ticket:
            rent_budget_currency = intention_ticket["rent_budget_max"]["unit"]
        else:
            return

        f_app.util.check_and_override_minimum_rent_period(intention_ticket)

        # Scan existing rent intention ticket
        params = {
            "type": "rent",
            "status": "to rent",
        }
        rent_tickets = f_app.i18n.process_i18n(f_app.ticket.output(f_app.ticket.search(params=params, per_page=-1), permission_check=False), _i18n=["zh_Hans_CN"])

        bedroom_count = f_app.util.parse_bedroom_count(intention_ticket["bedroom_count"])

        best_matches = []
        good_matches = []

        for ticket in rent_tickets:
            try:
                if "price" not in ticket or "property" not in ticket or "bedroom_count" not in ticket["property"] or "rent_type" not in ticket or "country" not in ticket["property"]:
                    continue

                if ticket["property"]["country"]["code"] != intention_ticket["country"]["code"]:
                    continue

                if ticket["property"]["city"]["id"] != intention_ticket["city"]["id"]:
                    continue

                A = True
                if bedroom_count[0] is not None:
                    A = A and bedroom_count[0] <= ticket["property"]["bedroom_count"]
                if bedroom_count[1] is not None:
                    A = A and bedroom_count[1] >= ticket["property"]["bedroom_count"]

                B = True
                price = ticket["price"]["value_float"]
                if ticket["price"]["unit"] != rent_budget_currency:
                    price = float(f_app.i18n.convert_currency({"unit": ticket["price"]["unit"], "value_float": ticket["price"]["value_float"]}, rent_budget_currency))
                if "rent_budget_min" in intention_ticket:
                    B = B and intention_ticket["rent_budget_min"]["value_float"] <= price
                if "rent_budget_max" in intention_ticket:
                    B = B and intention_ticket["rent_budget_max"]["value_float"] >= price

                C = ticket["rent_available_time"].year == intention_ticket["rent_available_time"].year and ticket["rent_available_time"].month == intention_ticket["rent_available_time"].month
                if "rent_deadline_time" in ticket and "rent_deadline_time" in intention_ticket:
                    C = C and ticket["rent_deadline_time"].year == intention_ticket["rent_deadline_time"].year and ticket["rent_deadline_time"].month == intention_ticket["rent_deadline_time"].month

                f_app.util.check_and_override_minimum_rent_period(ticket)
                if "minimum_rent_period" in ticket and "minimum_rent_period" in intention_ticket:
                    D = ticket["minimum_rent_period"]["value_float"] >= intention_ticket["minimum_rent_period"]["value_float"]
                else:
                    D = 1

                if "maponics_neighborhood" in ticket and "maponics_neighborhood" in intention_ticket:
                    E = ticket["maponics_neighborhood"]["id"] == intention_ticket["maponics_neighborhood"]["id"]
                elif "zipcode_index" in ticket["property"] and "zipcode_index" in intention_ticket:
                    E = ticket["property"]["zipcode_index"] == intention_ticket["zipcode_index"]
                else:
                    E = 1

                F = ticket["rent_type"]["id"] == intention_ticket["rent_type"]["id"]

                score = A + B + C + D + E + F

                if score == 6:
                    best_matches.append(ticket)

                elif score >= 4:
                    good_matches.append(ticket)
            except:
                self.logger.warning("Bad ticket detected:", ticket["id"])

        import currant_util
        unsubscribe_url = 'http://yangfd.com/email-unsubscribe?email_message_type=rent_intention_ticket_check_rent'
        if len(best_matches):
            title = "洋房东给您匹配到了合适的房源，快来看看吧！"
            f_app.email.schedule(
                target=ticket_email_user["email"],
                subject=title,
                # TODO
                text=template("static/emails/rent_intention_digest", nickname=ticket_email_user["nickname"], matched_rent_ticket_list=best_matches, date="", title=title, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                display="html",
                ticket_match_user_id=ticket_email_user["id"],
                tag="rent_intention_digest",
            )
            f_app.ticket.ensure_tag(intention_ticket["id"], "perfect_match")
        elif len(good_matches):
            title = "洋房东给您匹配到了一些房源，快来看看吧！"
            f_app.email.schedule(
                target=ticket_email_user["email"],
                subject=title,
                # TODO
                text=template("static/emails/rent_intention_digest", nickname=ticket_email_user["nickname"], matched_rent_ticket_list=good_matches, date="", title=title, get_country_name_by_code=currant_util.get_country_name_by_code, unsubscribe_url=unsubscribe_url),
                display="html",
                ticket_match_user_id=ticket_email_user["id"],
                tag="rent_intention_digest",
            )
            f_app.ticket.ensure_tag(intention_ticket["id"], "partial_match")
        else:
            title = "恭喜，洋房东已经收到您的求租意向单！"
            f_app.email.schedule(
                target=ticket_email_user["email"],
                subject=title,
                # TODO
                text=template("static/emails/receive_rent_intention", date="", nickname=ticket_email_user["nickname"], title=title, unsubscribe_url=unsubscribe_url),
                display="html",
                tag="receive_rent_intention",
            )

    def task_on_rent_ticket_generate_digest_image(self, task):
        try:
            rent_ticket = f_app.ticket.output([task["ticket_id"]], permission_check=False)[0]
        except:
            self.logger.warning("Failed to load ticket", task["ticket_id"], ", skipping digest generation...")
            return

        if rent_ticket.get("digest_image_task_id") != str(task["_id"]):
            self.logger.warning("Ticket", task["ticket_id"], "seems to have another digest generation task scheduled, ignoring this one...")
            return

        from libfelix.f_html2png import html2png
        image = html2png(task["fetch_url"], width=1000, height="window.innerHeight", url=True)

        with f_app.storage.aws_s3() as b:
            filename = f_app.util.uuid()
            b.upload(filename, image.read(), policy="public-read")
            f_app.ticket.update_set(task["ticket_id"], {"digest_image": b.get_public_url(filename), "digest_image_generate_time": datetime.utcnow()})

    def task_on_rent_ticket_reminder(self, task):
        tickets = f_app.ticket.output(f_app.ticket.search({"type": "rent", "status": "to rent"}, per_page=0), permission_check=False, ignore_nonexist=True)

        for rent_ticket in tickets:
            ticket_email_user = f_app.util.ticket_determine_email_user(rent_ticket)
            if ticket_email_user is None:
                continue

            if "rent_ticket_reminder" not in ticket_email_user.get("email_message_type", []):
                continue

            last_email = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "rent_ticket_reminder": "is_rent_success", "ticket_id": rent_ticket["id"], "start": {"$gte": datetime.utcnow() - timedelta(days=7)}})

            if last_email:
                # Sent within 7 days, skipping
                continue

            try:
                title = "您的“%(title)s”是否已经出租成功了？" % rent_ticket
                url = 'http://yangfd.com/property-to-rent/' + rent_ticket["id"]
                body = template(
                    "views/static/emails/rent_notice.html",
                    title=title,
                    nickname=ticket_email_user["nickname"],
                    formated_date='之前',  # TODO
                    rent_url=url,
                    rent_title=rent_ticket["title"],
                    has_rented_url="http://yangfd.com//user-properties?type=rent_ticket&id=%s&action=confirm_rent" % (rent_ticket["id"],),
                    refresh_url="http://yangfd.com//user-properties?type=rent_ticket&id=%s&action=refresh" % (rent_ticket["id"],),
                    edit_url=url + "/edit",
                    qrcode_image="http://yangfd.com/qrcode/generate?content=" + urllib.parse.quote(url),
                    unsubscribe_url='http://yangfd.com/email-unsubscribe?email_message_type=rent_ticket_reminder')
            except:
                self.logger.warning("Invalid ticket", rent_ticket["id"], ", ignoring reminder...")
                continue

            f_app.email.schedule(
                target=ticket_email_user["email"],
                subject=title,
                text=body,
                display="html",
                rent_ticket_reminder="is_rent_success",
                ticket_id=rent_ticket["id"],
                tag="rent_notice",
            )

        tickets = f_app.ticket.output(f_app.ticket.search({"type": "rent", "status": "draft", "time": {"$lte": datetime.utcnow() - timedelta(days=7)}}, per_page=0, notime=True), permission_check=False, ignore_nonexist=True)

        for rent_ticket in tickets:
            ticket_email_user = f_app.util.ticket_determine_email_user(rent_ticket)
            if ticket_email_user is None:
                continue

            if "rent_ticket_reminder" not in ticket_email_user.get("email_message_type", []):
                continue

            last_email = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "ticket_id": rent_ticket["id"], "rent_ticket_reminder": "draft_7day"})

            if last_email:
                # Sent, skipping
                continue

            title = "您的出租房产已经在草稿箱中躺了7天了！"
            try:
                body = template(
                    "views/static/emails/draft_not_publish_day_7",
                    nickname=ticket_email_user["nickname"],
                    date="",
                    title=title,
                    rent_ticket_title=rent_ticket["title"],
                    rent_ticket_edit_url="http://yangfd.com/property-to-rent/%s/edit" % rent_ticket["id"],
                    unsubscribe_url='http://yangfd.com/email-unsubscribe?email_message_type=rent_ticket_reminder')
            except:
                self.logger.warning("Invalid ticket", rent_ticket["id"], ", ignoring reminder...")
                continue

            f_app.email.schedule(
                target=ticket_email_user["email"],
                subject=title,
                text=body,
                display="html",
                rent_ticket_reminder="draft_7day",
                ticket_id=rent_ticket["id"],
                tag="draft_not_publish_day_7",
            )

        tickets = f_app.ticket.output(f_app.ticket.search({"type": "rent", "status": "draft", "time": {"$lte": datetime.utcnow() - timedelta(days=3)}}, per_page=0, notime=True), permission_check=False, ignore_nonexist=True)

        for rent_ticket in tickets:
            ticket_email_user = f_app.util.ticket_determine_email_user(rent_ticket)
            if ticket_email_user is None:
                continue

            if "rent_ticket_reminder" not in ticket_email_user.get("email_message_type", []):
                continue

            last_email = f_app.task.search({"status": {"$exists": True}, "type": "email_send", "ticket_id": rent_ticket["id"], "rent_ticket_reminder": {"$in": ["draft_3day", "draft_7day"]}})

            if last_email:
                # Sent, skipping
                continue

            title = "您的出租房产已经在草稿箱中躺了3天了！"
            try:
                body = template(
                    "views/static/emails/draft_not_publish_day_3",
                    nickname=ticket_email_user["nickname"],
                    date="",
                    title=title,
                    rent_ticket_title=rent_ticket["title"],
                    rent_ticket_edit_url="http://yangfd.com/property-to-rent/%s/edit" % rent_ticket["id"],
                    unsubscribe_url='http://yangfd.com/email-unsubscribe?email_message_type=rent_ticket_reminder')
            except:
                self.logger.warning("Invalid ticket", rent_ticket["id"], ", ignoring reminder...")
                continue

            f_app.email.schedule(
                target=ticket_email_user["email"],
                subject=title,
                text=body,
                display="html",
                rent_ticket_reminder="draft_3day",
                ticket_id=rent_ticket["id"],
                tag="draft_not_publish_day_3",
            )

        f_app.task.put(dict(
            type="rent_ticket_reminder",
            start=datetime.utcnow() + timedelta(days=1),
        ))

    def task_on_fill_featured_facilities(self, task):
        ticket = f_app.ticket.output([task["ticket_id"]], permission_check=False)[0]
        if ticket["status"] != "to rent":
            return

        featured_facility = f_app.util.get_featured_facilities(ticket["property"]["zipcode"])
        if featured_facility is not None:
            f_app.property.update_set(ticket["property"]["id"], {"featured_facility": featured_facility})

    def ticket_add_log_params(self, params, ticket_id, ticket, user):
        if "type" in ticket:
            params["ticket_type"] = ticket["type"]
        return params

    def task_on_assign_ticket_short_id(self, task):
        # Validate that the ticket is still available:
        try:
            ticket = f_app.ticket.get(task["ticket_id"])
        except:
            self.logger.warning("Invalid ticket to assign short id:", task["ticket_id"])
            return

        if "short_id" in ticket:
            self.logger.debug("Short id already exist for ticket", task["ticket_id"], ", ignoring assignment.")
            return

        self.logger.debug("Looking for a free short id for ticket", task["ticket_id"])
        # TODO: not infinity?
        while True:
            new_short_id = "Q" + "".join([str(random.randint(0, 9)) for i in range(6)])
            found_ticket = f_app.ticket.search({"short_id": new_short_id})
            if not len(found_ticket):
                break

        self.logger.debug("Setting short id", new_short_id, "for ticket", task["ticket_id"])
        f_app.ticket.update_set(task["ticket_id"], {"short_id": new_short_id})

currant_ticket_plugin()
