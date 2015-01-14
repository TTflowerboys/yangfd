# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from bson.objectid import ObjectId


def reverse_sort_time(x, y):
    x_time = 0
    y_time = 0
    if x.get('time'):
        x_time = int(x.get('time').strftime("%s"))
    if y.get('time'):
        y_time = int(y.get('time').strftime("%s"))
    return y_time - x_time


# User


def get_user_with_custom_fields(user=None):
    if user is None:
        user = f_app.user.login.get()  # only get id and login status {'login': True, 'id': '53fed0656b809935851cce35'}
    if user:
        return f_app.user.output([user["id"]], custom_fields=f_app.common.user_custom_fields)[0]
    else:
        return None


def get_favorite_list():
    user = f_app.user.login.get()
    if user:
        result = f_app.user.favorite_output(f_app.user.favorite_get_by_user(user["id"]), ignore_nonexist=True) if user is not None else []
        return [i for i in result if i.get("property")]
    else:
        return []


# Property

def get_featured_property_list():
    property_id_list = []
    for news_category in ("primier_apartment_london", "studenthouse_sheffield"):
        property_id_list.extend(f_app.property.search({
            "status": {"$in": ["selling", "sold out"]},
            "news_category._id": ObjectId(f_app.enum.get_by_slug(news_category)["id"]),
        }, per_page=1))

    return f_app.property.output(property_id_list)


def get_property_or_target_property(property_id):
    property = f_app.property.output([property_id])[0]
    if "target_property_id" in property:
        target_property_id = property.pop("target_property_id")
        target_property = f_app.property.output([target_property_id])[0]
        unset_fields = property.pop("unset_fields", [])
        target_property.update(property)
        for i in unset_fields:
            target_property.pop(i, None)
        property = target_property
    return property


def get_related_property_list(property):
    raw_related_property_list = f_app.property.output(f_app.property.search({
        "country._id": ObjectId(property.get('country').get('id')),
        "status": {"$in": ["selling", "sold out"]},
    }, per_page=20, time_field="mtime"))

    related_property_list = []
    if len(raw_related_property_list) > 3:
        import random
        i = 6
        while i > 0 and len(related_property_list) < 3:
            item = random.choice(raw_related_property_list)
            if item.get('id') != property.get('id'):
                raw_related_property_list.remove(item)
                related_property_list.insert(-1, item)
                i = i - 1

    else:
        for item in raw_related_property_list:
            if item.get('id') != property.get('id'):
                related_property_list.insert(-1, item)
    return related_property_list

# News


def get_announcement_list():
    return f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "category": [{'_id': ObjectId(f_app.enum.get_by_slug('announcement')["id"]), 'type': 'news_category', '_enum': 'news_category'}]
            }, per_page=1
        )
    )


def get_featured_new_list():
    news_list = f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "category": {"$in": [
                    {'_id': ObjectId(f_app.enum.get_by_slug('real_estate')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('primier_apartment_london')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    {'_id': ObjectId(f_app.enum.get_by_slug('studenthouse_sheffield')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                ]}
            }, per_page=6
        )
    )
    news_list = sorted(news_list, key=lambda news: news.get('time'), reverse=True)
    return news_list


def get_related_news_list(news):
    if news.get('category')[0].get('slug') in ['real_estate', 'primier_apartment_london', 'studenthouse_sheffield']:
        raw_related_news_list = f_app.blog.post_output(
            f_app.blog.post_search(
                {
                    "category": {"$in": [
                        {'_id': ObjectId(f_app.enum.get_by_slug('real_estate')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                        {'_id': ObjectId(f_app.enum.get_by_slug('primier_apartment_london')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                        {'_id': ObjectId(f_app.enum.get_by_slug('studenthouse_sheffield')["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    ]}
                }, per_page=20
            )
        )
    else:
        raw_related_news_list = f_app.blog.post_output(
            f_app.blog.post_search(
                {
                    "category": {"$in": [
                        {'_id': ObjectId(f_app.enum.get_by_slug(news.get('category')[0].get('slug'))["id"]), 'type': 'news_category', '_enum': 'news_category'},
                    ]}
                }, per_page=20
            )
        )

    related_news_list = []
    if len(raw_related_news_list) > 3:
        import random
        i = 6
        while i > 0 and len(related_news_list) < 3:
            item = random.choice(raw_related_news_list)
            if item.get('id') != news.get('id'):
                raw_related_news_list.remove(item)
                related_news_list.insert(-1, item)
                i = i - 1
    else:
        for item in raw_related_news_list:
            if item.get('id') != news.get('id'):
                related_news_list.insert(-1, item)
    related_news_list = sorted(related_news_list, key=lambda news: news.get('time'), reverse=True)
    return related_news_list


def get_property_related_news_list(property):
    related_news_list = f_app.blog.post_output(f_app.blog.post_search({
        "category": {"$in": [
                    {"_id": ObjectId(news["id"]), "type": "news_category", "_enum": "news_category"} for news in property["news_category"]
        ]},
    }, per_page=5))
    related_news_list = sorted(related_news_list, key=lambda news: news.get('time'), reverse=True)
    return related_news_list

# Report


def get_report(zipcode_index):
    report = f_app.report.output(f_app.report.search({"zipcode_index": {"$in": [zipcode_index]}}, per_page=1))
    if len(report):
        report = report[0]
    # sort the related news
    if report.get('supplement_news'):
        report['supplement_news'] = sorted(report.get('supplement_news'), cmp=reverse_sort_time)
    if report.get('planning_news'):
        report['planning_news'] = sorted(report.get('planning_news'), cmp=reverse_sort_time)
    if report.get('job_news'):
        report['job_news'] = sorted(report.get('job_news'), cmp=reverse_sort_time)

    return report

# Other


def get_message_list(user):
    return f_app.message.get_by_user(
        user['id'],
        {"state": {"$in": ["read", "new"]}},
    )


def get_intention_ticket_list(user):
    return f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": {"$nin": ["deleted", "bought"]}, "$or": [{"creator_user_id": ObjectId(user["id"])}, {"user_id": ObjectId(user["id"])}]}), ignore_nonexist=True)


def get_bought_intention_ticket_list(user):
    return f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": "bought", "$or": [{"creator_user_id": ObjectId(user["id"])}, {"user_id": ObjectId(user["id"])}]}), ignore_nonexist=True)
