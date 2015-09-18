# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import random
from app import f_app
from bson.objectid import ObjectId

CURRANT_SHOP_ID = "54a3c92b6b809945b0d996bf"


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


def get_favorite_list(fav_type):
    user = f_app.user.login.get()
    if user:
        result = f_app.user.favorite_output(f_app.user.favorite_get_by_user(user["id"], fav_type), ignore_nonexist=True)
        return result
    else:
        return []


# Property

def get_featured_property_list():
    property_id_list = []
    for news_category in ("studenthouse_sheffield", "primier_apartment_london"):
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
    if property.get('country'):
        raw_related_property_list = f_app.property.output(f_app.property.search({
            "country.code": property.get('country').get('code'),
            "status": {"$in": ["selling", "sold out"]},
        }, per_page=20, time_field="mtime"))
        raw_related_property_list = filter(lambda ticket: ticket["id"] != property["id"], raw_related_property_list)
        random.shuffle(raw_related_property_list)
        related_property_list = raw_related_property_list[:3]
        return related_property_list
    else:
        return []

# Rent tiket


def get_related_rent_ticket_list(rent_ticket):
    params = {
        "type": "rent",
        "status": {"$in": ["to rent"]},
    }
    property_params = {"$and": []}
    if rent_ticket.get('property', {}).get('maponics_neighborhood'):
        property_params["$and"].append({"$or": [
            {"maponics_neighborhood": rent_ticket.get('property', {}).get('maponics_neighborhood', {}).get('id')},
            {"maponics_parent_neighborhood": rent_ticket.get('property', {}).get('maponics_neighborhood', {}).get('id')},
        ]})

    if rent_ticket.get('property', {}).get('city'):
        property_params["city"] = rent_ticket.get('property', {}).get('city', {}).get('id')

    if rent_ticket.get('property', {}).get('country'):
        property_params["country"] = rent_ticket.get('property', {}).get('country', {}).get('code')

    if not len(property_params["$and"]):
        property_params.pop("$and")

    if len(property_params):
        property_params.setdefault("status", {"$exists": True})
        property_params.setdefault("user_generated", True)

        property_id_list = map(ObjectId, f_app.property.search(property_params, per_page=0))
        params["property_id"] = {"$in": property_id_list}

    raw_related_rent_ticket_list = f_app.ticket.output(f_app.ticket.search(params, per_page=20))
    raw_related_rent_ticket_list = filter(lambda ticket: ticket["id"] != rent_ticket["id"], raw_related_rent_ticket_list)
    random.shuffle(raw_related_rent_ticket_list)
    related_rent_ticket_list = raw_related_rent_ticket_list[:3]
    return related_rent_ticket_list


# Crowdfunding


def get_crowdfunding_list():
    return f_app.shop.item.output(f_app.shop.item_custom_search({"shop_id": ObjectId(CURRANT_SHOP_ID)}, per_page=10))


def get_crowdfunding(crowdfunding_id):
    return f_app.shop.item.output([crowdfunding_id])[0]


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


def get_report(report_id):
    report = f_app.report.output([report_id])
    if len(report):
        report = report[0]
    return report

# Other


def get_message_list(user):
    message_list = f_app.message.get_by_user(
        user['id'],
        {"state": {"$in": ["read", "new"]}, "type": {"$in": ["system", "favorited_property_news", "intention_property_news", "my_property_news"]}},
    )
    message_list = sorted(message_list, key=lambda message: message.get('time'), reverse=True)
    return message_list


def get_intention_ticket_list(user):
    return f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": {"$nin": ["deleted", "bought"]}, "$or": [{"creator_user_id": ObjectId(user["id"])}, {"user_id": ObjectId(user["id"])}]}), ignore_nonexist=True)


def get_bought_intention_ticket_list(user):
    return f_app.ticket.output(f_app.ticket.search({"type": "intention", "status": "bought", "$or": [{"creator_user_id": ObjectId(user["id"])}, {"user_id": ObjectId(user["id"])}]}), ignore_nonexist=True)


def get_venues():
    params = dict()
    params.setdefault("type", "coupon")
    params.setdefault("status", "show")
    venues = f_app.i18n.process_i18n(f_app.shop.output(f_app.shop.search(params, sort=("sort_value", "asc"))))

    for venue in venues:
        venue.pop("minimal_price", None)
        venue.pop("quantity", None)
        venue["deals"] = f_app.i18n.process_i18n(f_app.shop.item_output(f_app.shop.item_get_all(venue.get('id'))))

    return venues
