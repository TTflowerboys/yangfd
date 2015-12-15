# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from bson.objectid import ObjectId
from bson.code import Code
from datetime import datetime, timedelta, date
from libfelix.f_common import f_app


class aggregation_module(f_app.module_base):

    def __init__(self):
        f_app.user.module_install("analyze", self)

    def data_get_modif_time(self, user_id):
        mod_time = f_app.user.get(user_id).get('analyze_value_modifier_time', None)
        if mod_time is None or isinstance(mod_time, datetime):
            return {}
        return mod_time

    def data_set_modif_time(self, user_id, value):
        mod_time = self.data_get_modif_time(user_id)
        mod_time.update({value: datetime.utcnow()})
        f_app.user.update_set(user_id, {'analyze_value_modifier_time': mod_time})

    def data_update(self, user_id, params={
        "analyze_guest_country": True,
        "analyze_guest_user_type": True,
        "analyze_guest_active_days": True,
        "analyze_guest_downloaded": True,
        "analyze_rent_landlord_type": True,
        "analyze_rent_has_draft": True,
        "analyze_rent_commit_time": True,
        "analyze_rent_local": True,
        "analyze_rent_estate_views_times": True,
        "analyze_rent_estate_total": True,
        "analyze_rent_single_or_whole": True,
        "analyze_rent_period_range": True,
        "analyze_rent_price": True,
        "analyze_rent_time": True,
        "analyze_rent_intention_time": True,
        "analyze_rent_intention_budget": True,
        "analyze_rent_intention_local": True,
        "analyze_rent_intention_match_level": True,
        "analyze_rent_intention_views_times": True,
        "analyze_rent_intention_favorite_times": True,
        "analyze_rent_intention_view_contact_times": True,
        "analyze_intention_time": True,
        "analyze_intention_budget": True,
        "analyze_intention_views_times": True,
        "analyze_value_modifier_time": True
    }):
        f_app.user.update_set(user_id, self.data_generate(user_id, params))

    def data_generate(self, user_id, params):

        def get_all_enum_value(enum_singlt_type):
            enum_list_subdic = {}
            for enumitem in f_app.i18n.process_i18n(f_app.enum.get_all(enum_singlt_type)):
                enum_list_subdic.update({enumitem["id"]: enumitem["value"]})
            enum_type_list.update({enum_singlt_type: enum_list_subdic})

        def get_data_enum(user, enum_name):
            if user is None:
                return
            if enum_name not in enum_type_list:
                get_all_enum_value(enum_name)
            single = user.get(enum_name, None)
            value_list = []
            if f_app.util.batch_iterable(single):
                for true_single in single:
                    if true_single is None:
                        continue
                    enum_id = true_single.get("id", None)
                    value = enum_type_list[enum_name].get(enum_id, None)
                    value_list.append(value)
            elif single is not None:
                if single.get("id", None):
                    enum_id = unicode(single.get("id", None))
                    value = enum_type_list[enum_name].get(enum_id, None)
                    if value is not None:
                        value_list.append(value)
            if not f_app.util.batch_iterable(value_list):
                value_list = [value_list]
            value_set = set(value_list)
            value_list = list(value_set)
            return unicode('/'.join(value_list))

        def get_active_days(user):
            old_active_days = f_app.user.get(user_id).get('analyze_guest_active_days', 0)
            mod_time = self.data_get_modif_time(user_id).get('analyze_guest_active_days', None)
            func_map = Code(
                '''
                function() {
                    key = new Date(this.time.getFullYear(), this.time.getMonth(), this.time.getDate());
                    emit(key, 1);
                }
                '''
            )
            func_reduce = Code(
                '''
                function(key, value) {
                    return Array.sum(value);
                }
                '''
            )
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                if mod_time is None:
                    f_app.log.get_database(m).map_reduce(func_map, func_reduce, "log_result", query={
                        "id": ObjectId(user_id)
                    })
                else:
                    start_time = datetime(mod_time.year, mod_time.month, mod_time.day) + timedelta(days=1)
                    f_app.log.get_database(m).map_reduce(func_map, func_reduce, "log_result", query={
                        "id": ObjectId(user_id),
                        "time": {"$gt": start_time}
                    })
                # active_days = m.log_result.find().count()
                active_days = m.log_result.find().count() + old_active_days
            return active_days

        def check_download(user):
            downloaded = f_app.user.get(user_id).get('analyze_guest_downloaded', None)
            if downloaded == '已下载':
                return True
            elif downloaded is None:
                credit = f_app.user.credit.get("view_rent_ticket_contact_info", user_id).get("credits", [])
                for single in credit:
                    if single.get("tag", None) == "download_ios_app":
                        return True
            return False

        def get_data_complex(user, target, condition, element):

            '''this func make dict provide get_data_enum to use.
            with user's id and 'condition' to search in the database 'target'
            then gether element in search result, make a new dict return
            '''
            dic = {}
            element_list = []
            if '.' in target:
                t_target = target.split('.')
                target_database = getattr(getattr(f_app, t_target[0]), t_target[1])
            else:
                target_database = getattr(f_app, target)
            condition.update({"$or": [{"user_id": ObjectId(user_id)},
                                      {"creator_user_id": ObjectId(user_id)}]})
            select_item = target_database.get(target_database.search(condition, per_page=-1))
            for ticket in select_item:
                element_list.append(ticket.get(element, None))
            dic.update({element: element_list})
            return dic

        def get_has_flag(user, target, condition, comp_element, want_value):
            dic = {}
            dic = get_data_complex(user, target, condition, comp_element)
            # f_app.user.update_set(user_id, {"debug_message": dic.get(comp_element, [])})
            return (want_value in dic.get(comp_element, []))

        def get_ticket_newest(user, add_condition={}):
            if user_id is None:
                return {}
            condition = ({"type": "rent",
                          "$or": [{"user_id": ObjectId(user_id)},
                                  {"creator_user_id": ObjectId(user_id)}]})
            condition.update(add_condition)
            time_list = []
            select_item = f_app.ticket.get(f_app.ticket.search(condition, per_page=-1))
            if select_item is None:
                return {}
            for single in select_item:
                curtime = single.get("time", None)
                time_list.append(curtime)
            if len(time_list) < 1:
                return {}
            time_list.sort()
            for single in select_item:
                curtime = single.get("time", None)
                if curtime == time_list[-1]:
                    return single
            return {}

        def get_detail_address(ticket):
            ticket = f_app.i18n.process_i18n(ticket)
            if f_app.util.batch_iterable(ticket.get("maponics_neighborhood", {})):
                maponics_neighborhood = ticket.get("maponics_neighborhood", {})[0]
            else:
                maponics_neighborhood = ticket.get("maponics_neighborhood", {})
            return ' '.join([ticket.get("country", {}).get("code", ''),
                             ticket.get("city", {}).get("name", ''),
                             maponics_neighborhood.get("name", ''),
                             ticket.get("address", ''),
                             ticket.get("zipcode_index", '')])

        def get_address(user):
            property_id = get_data_complex(user, "ticket", {"type": "rent"}, "property_id").get("property_id", [])
            if len(property_id) < 1:
                return ''
            elif len(property_id) > 1:
                return 'M'
            else:
                return get_detail_address(f_app.property.get(property_id[0]))

        def logs_rent_ticket(user):
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                return f_app.log.get_database(m).find({"id": ObjectId(user_id),
                                                       "type": "route",
                                                       "rent_ticket_id": {"$exists": True}
                                                       }).count()

        def get_count(user, target, condition, element, comp):
            dic = get_data_complex(user, target, condition, element)
            if dic.get(element, []) is None:
                return '0'
            return dic.get(element, []).count(comp)

        def time_period_label(ticket):
            if ticket is None:
                return ''
            time = ""
            period_start = ticket.get("rent_available_time", None)
            period_end = ticket.get("rent_deadline_time", None)
            if period_end is None or period_start is None:
                time = "不明"
            else:
                period = period_end - period_start
                if period.days >= 365:
                    time = "longer than 12 months"
                elif 365 > period.days >= 180:
                    time = "6 - 12 months"
                elif 180 >= period.days > 90:
                    time = "3 - 6 months"
                elif period.days <= 30:
                    time = "less than 1 month"
            return time

        def get_budget(ticket):
            if ticket is None:
                return ''
            if ticket.get('type', None) == "intention":
                f_app.user.update_set(user_id, {"debug_message": f_app.enum.get(ticket['budget']['id'])})
                return f_app.enum.get(ticket['budget']['id'])['value']['zh_Hans_CN']
            budget_min = unicode(ticket.get("rent_budget_min", {}).get("value", '零'))
            budget_max = unicode(ticket.get("rent_budget_max", {}).get("value", '不限'))
            if budget_max is None or budget_min is None:
                return ''
            elif not (budget_max == '不限' and budget_min == '零'):
                if budget_min == '零':
                    budget_min = '0'
                return budget_min + '~~' + budget_max
            else:
                return ''

        def get_match(ticket):
            match = []
            if "partial_match" in ticket.get("tags", []):
                match.append("部分满足")
            if "perfect_match" in ticket.get("tags", []):
                match.append("完全满足")
            return '/'.join(match)

        def logs_content_view(user):
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                return f_app.log.get_database(m).find({
                    "id": ObjectId(user_id),
                    "type": "rent_ticket_view_contact_info"
                }).count()

        def logs_property(user):
            if user_id is None:
                return ''
            with f_app.mongo() as m:
                return f_app.log.get_database(m).find({"id": ObjectId(user_id), "type": "route", "property_id": {"$exists": True}}).count()

        enum_type_list = {}
        user = f_app.user.get(user_id)
        if user is None:
            user = {}
        result = {}
        mod_time = user.get('analyze_value_modifier_time', {})
        if isinstance(mod_time, datetime):
            mod_time = {}
        # result.update({"analyze_guest_nickname": user.get("nickname", '')})
        # result.update({"analyze_guest_register_time": user.get("register_time")})
        if params.get("analyze_guest_country", None) is True:
            result.update({"analyze_guest_country": user.get("country", {}).get("code", '')})
            mod_time.update({'analyze_guest_country': datetime.utcnow()})

        if params.get("analyze_guest_user_type", None) is True:
            result.update({"analyze_guest_user_type": get_data_enum(user, "user_type")})
            mod_time.update({'analyze_guest_user_type': datetime.utcnow()})

        if params.get("analyze_guest_active_days", None) is True:
            result.update({"analyze_guest_active_days": get_active_days(user)})
            mod_time.update({'analyze_guest_active_days': datetime.utcnow()})

        if params.get("analyze_guest_downloaded", None) is True:
            result.update({"analyze_guest_downloaded": "已下载" if check_download(user) else "未下载"})
            mod_time.update({'analyze_guest_downloaded': datetime.utcnow()})

        if params.get("analyze_rent_landlord_type", None) is True:
            result.update({"analyze_rent_landlord_type": get_data_enum(get_data_complex(user, "ticket", {"type": "rent"}, "landlord_type"), "landlord_type")})
            mod_time.update({'analyze_rent_landlord_type': datetime.utcnow()})

        if params.get("analyze_rent_has_draft", None) is True:
            result.update({"analyze_rent_has_draft": "有" if get_has_flag(user, "ticket", {"type": "rent"}, "status", "draft") else "无"})
            mod_time.update({'analyze_rent_has_draft': datetime.utcnow()})

        if params.get("analyze_rent_commit_time", None) is True:
            result.update({"analyze_rent_commit_time": get_ticket_newest(user, {"type": "rent"}).get("time", '')})
            mod_time.update({'analyze_rent_commit_time': datetime.utcnow()})

        if params.get("analyze_rent_local", None) is True:
            result.update({"analyze_rent_local": get_address(user)})
            mod_time.update({'analyze_rent_local': datetime.utcnow()})

        if params.get("analyze_rent_estate_views_times", None) is True:
            result.update({"analyze_rent_estate_views_times": logs_rent_ticket(user)})
            mod_time.update({'analyze_rent_estate_views_times': datetime.utcnow()})

        if params.get("analyze_rent_estate_total", None) is True:
            result.update({"analyze_rent_estate_total": get_count(user, "ticket", {"type": "rent"}, "type", "rent")})
            mod_time.update({'analyze_rent_estate_total': datetime.utcnow()})

        if params.get("analyze_rent_single_or_whole", None) is True:
            result.update({"analyze_rent_single_or_whole": get_data_enum(get_data_complex(user, "ticket", {"type": "rent"}, "rent_type"), "rent_type")})
            mod_time.update({'analyze_rent_single_or_whole': datetime.utcnow()})

        if params.get("analyze_rent_period_range", None) is True:
            result.update({"analyze_rent_period_range": time_period_label(get_ticket_newest(user))})
            mod_time.update({'analyze_rent_period_range': datetime.utcnow()})

        if params.get("analyze_rent_price", None) is True:
            result.update({"analyze_rent_price": get_ticket_newest(user).get("price", {}).get("value", "")})
            mod_time.update({'analyze_rent_price': datetime.utcnow()})

        if params.get("analyze_rent_time", None) is True:
            result.update({"analyze_rent_time": get_ticket_newest(user, {"type": "rent", "status": "rent"}).get("time", '')})
            mod_time.update({'analyze_rent_time': datetime.utcnow()})

        if params.get("analyze_rent_intention_time", None) is True:
            result.update({"analyze_rent_intention_time": get_ticket_newest(user, {"type": "rent_intention", "status": "new"}).get("time", '')})
            mod_time.update({'analyze_rent_intention_time': datetime.utcnow()})

        if params.get("analyze_rent_intention_budget", None) is True:
            result.update({"analyze_rent_intention_budget": get_budget(get_ticket_newest(user, {"type": "rent_intention"}))})
            mod_time.update({'analyze_rent_intention_budget': datetime.utcnow()})

        if params.get("analyze_rent_intention_local", None) is True:
            result.update({"analyze_rent_intention_local": get_address(get_ticket_newest(user, {"type": "rent_intention", "status": "new"}))})
            mod_time.update({'analyze_rent_intention_local': datetime.utcnow()})

        if params.get("analyze_rent_intention_match_level", None) is True:
            result.update({"analyze_rent_intention_match_level": get_match(get_ticket_newest(user, {"type": "rent_intention", "status": "new"}))})
            mod_time.update({'analyze_rent_intention_match_level': datetime.utcnow()})

        if params.get("analyze_rent_intention_views_times", None) is True:
            result.update({"analyze_rent_intention_views_times": logs_rent_ticket(user)})
            mod_time.update({'analyze_rent_intention_views_times': datetime.utcnow()})

        if params.get("analyze_rent_intention_favorite_times", None) is True:
            result.update({"analyze_rent_intention_favorite_times": get_count(user, "user.favorite", {"type": "property"}, "type", "property")})
            mod_time.update({'analyze_rent_intention_favorite_times': datetime.utcnow()})

        if params.get("analyze_rent_intention_view_contact_times", None) is True:
            result.update({"analyze_rent_intention_view_contact_times": logs_content_view(user)})
            mod_time.update({'analyze_rent_intention_view_contact_times': datetime.utcnow()})

        if params.get("analyze_intention_time", None) is True:
            result.update({"analyze_intention_time": get_ticket_newest(user, {"type": "intention"}).get("time", '')})
            mod_time.update({'analyze_intention_time': datetime.utcnow()})

        if params.get("analyze_intention_budget", None) is True:
            result.update({"analyze_intention_budget": get_budget(get_ticket_newest(user, {"type": "intention"}))})
            mod_time.update({'analyze_intention_budget': datetime.utcnow()})

        if params.get("analyze_intention_views_times", None) is True:
            result.update({"analyze_intention_views_times": logs_property(user)})
            mod_time.update({'analyze_intention_views_times': datetime.utcnow()})

        result.update({"analyze_value_modifier_time": mod_time})

        return result


aggregation_module()


class aggregation_plugin(f_app.plugin_base):

    def user_credit_add_after(self, params):
        # know user downloaded or not
        user_id = params.get('user_id', None)
        downloaded = f_app.user.get(user_id).get('analyze_guest_downloaded', None)
        if downloaded is None:  # when there's no record,then search all the histroy
            f_app.user.analyze.data_update(user_id, {"analyze_guest_downloaded": True})
        elif downloaded == '未下载':  # once know there was updated already, then do jugement base on this record only
            if params.get('type', None) == "view_rent_ticket_contact_info" and params.get('tag', None) == "download_ios_app":
                f_app.user.update_set(user_id, {'analyze_guest_downloaded': "已下载"})
                f_app.analyze.data_set_modif_time(user_id, 'analyze_guest_downloaded')  # only for update modif time
        return params

    def user_favorite_add_after(self, params):
        user_id = params.get('user_id', None)
        mod_time = f_app.user.analyze.data_get_modif_time(user_id)
        if 'analyze_rent_intention_favorite_times' not in mod_time:
            f_app.user.analyze.data_update(user_id, {"analyze_rent_intention_favorite_times": True})
        elif params.get('type', None) == "property":
            old_value = f_app.user.get(user_id).get('analyze_rent_intention_favorite_times', 0)
            f_app.user.update_set(user_id, {'analyze_rent_intention_favorite_times': old_value + 1})
            f_app.analyze.data_set_modif_time(user_id, 'analyze_rent_intention_favorite_times')
        return params

    def log_add_after(self, user_id, log_type, **kwargs):
        if not user_id:
            return user_id
        user = f_app.user.get(user_id)
        mod_time = f_app.user.analyze.data_get_modif_time(user_id)
        today = date.today()
        if 'analyze_guest_active_days' not in mod_time:
            f_app.user.analyze.data_update(user_id, {'analyze_guest_active_days': True})
        elif 'analyze_guest_active_days' in user:
            if mod_time['analyze_guest_active_days'].date() < today:
                f_app.user.update_set(user_id, {
                    'analyze_guest_active_days': int(user['analyze_guest_active_days']) + 1
                })
                f_app.user.analyze.data_set_modif_time(user_id, 'analyze_guest_active_days')
        else:
            if mod_time['analyze_guest_active_days'].date() < today:
                f_app.user.analyze.data_update(user_id, {'analyze_guest_active_days': True})

        if log_type == "route" and 'rent_ticket_id' in kwargs:

            if 'analyze_rent_estate_views_times' not in mod_time:
                f_app.user.analyze.data_update(user_id, {'analyze_rent_estate_views_times': True})
            elif 'analyze_rent_estate_views_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_rent_estate_views_times': int(user['analyze_rent_estate_views_times']) + 1
                })
                f_app.user.analyze.data_set_modif_time(user_id, 'analyze_rent_estate_views_times')
            else:
                f_app.user.analyze.data_update(user_id, {'analyze_rent_estate_views_times': True})

            if 'analyze_rent_intention_views_times' not in mod_time:
                f_app.user.analyze.data_update(user_id, {'analyze_rent_intention_views_times': True})
            elif 'analyze_rent_intention_views_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_rent_intention_views_times': int(user['analyze_rent_intention_views_times']) + 1
                })
                f_app.user.analyze.data_set_modif_time(user_id, 'analyze_rent_intention_views_times')
            else:
                f_app.user.analyze.data_update(user_id, {'analyze_rent_intention_views_times': True})

        if log_type == "route" and 'property_id' in kwargs:
            if 'analyze_intention_views_times' not in mod_time:
                f_app.user.analyze.data_update(user_id, {'analyze_intention_views_times': True})
            elif 'analyze_intention_views_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_intention_views_times': int(user['analyze_intention_views_times']) + 1
                })
                f_app.user.analyze.data_set_modif_time(user_id, 'analyze_intention_views_times')
            else:
                f_app.user.analyze.data_update(user_id, {'analyze_intention_views_times': True})

        if log_type == "rent_ticket_view_contact_info":
            if 'analyze_rent_intention_view_contact_times' not in mod_time:
                f_app.user.analyze.data_update(user_id, {'analyze_rent_intention_view_contact_times': True})
            elif 'analyze_rent_intention_view_contact_times' in user:
                f_app.user.update_set(user_id, {
                    'analyze_rent_intention_view_contact_times': int(user['analyze_rent_intention_view_contact_times']) + 1
                })
                f_app.user.analyze.data_set_modif_time(user_id, 'analyze_rent_intention_view_contact_times')
            else:
                f_app.user.analyze.data_update(user_id, {'analyze_rent_intention_view_contact_times': True})
        return user_id

    def user_update_after(self, user_id, params):
        if "$set" in params and user_id is not None and params['$set'] is not None:
            if "country" in params['$set']:
                f_app.user.analyze.data_update(user_id, {"analyze_guest_country": True})
            if "user_type" in params['$set']:
                f_app.user.analyze.data_update(user_id, {"analyze_guest_user_type": True})
        return user_id

    def user_add_after(self, user_id, params, noregister):
        if user_id is not None:
            f_app.user.analyze.data_update(user_id, params={
                "analyze_guest_country": True,
                "analyze_guest_user_type": True,
                "analyze_guest_active_days": True
            })
        return user_id

    def ticket_update_after(self, ticket_id, params, ticket, ignore_error=True):

        if ticket.get('type', None) == "rent":
            f_app.user.analyze.data_update(ticket.get('user_id', None), {'analyze_rent_has_draft': True})

            if params.get('landlord_type', None) is not None:
                f_app.user.analyze.data_update(ticket.get('user_id', None), {'analyze_rent_landlord_type': True})

            if params.get('status', None) == "rent":
                f_app.user.analyze.data_update(ticket.get('user_id', None), {'analyze_rent_time': True})

            f_app.user.analyze.data_update(ticket.get('user_id', None), {
                'analyze_rent_commit_time': True,
                'analyze_rent_local': True,
                'analyze_rent_estate_total': True,
                'analyze_rent_single_or_whole': True,
                'analyze_rent_period_range': True,
                'analyze_rent_price': True
            })

        if ticket.get('type', None) == "rent_intention":
            if params.get('status', None) == "new":
                f_app.user.analyze.data_update(ticket.get('user_id', None), {
                    'analyze_rent_intention_time': True,
                    'analyze_rent_intention_local': True,
                    'analyze_rent_intention_match_level': True
                })
            f_app.user.analyze.data_update(ticket.get('user_id', None), {'analyze_rent_intention_budget': True})

        if ticket.get('type', None) == "intention":
            f_app.user.analyze.data_update(ticket.get('user_id', None), {
                'analyze_intention_time': True,
                'analyze_intention_budget': True,
            })

        return ticket_id

aggregation_plugin()
