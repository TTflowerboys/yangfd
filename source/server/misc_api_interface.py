# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from app import f_app
from libfelix.f_interface import f_api
from bson.objectid import ObjectId
from bottle import request
import logging
logger = logging.getLogger(__name__)


@f_api('/misc/get_video_source', params=dict(
    property_id=ObjectId,
    item_id=ObjectId,
))
def get_video_source(params):
    video_sources = None
    result = []
    if "property_id" in params:
        property = f_app.property.output([params["property_id"]])[0]
        video_sources = property.get("videos")
    elif "item_id" in params:
        item = f_app.shop.item_output([params["item_id"]])[0]
        video_sources = item.get("videos")

    if video_sources:
        rec_videos = f_app.storage.get_videos_by_ip(video_sources)
        if rec_videos:
            if "iphone" in request.headers.get('User-Agent').lower():
                sources = [x for x in rec_videos[0].get('sources') if "mobile-ios" in x.get("tags", [])]
            else:
                sources = [x for x in rec_videos[0].get('sources') if "web-normal" in x.get("tags", [])]
                if not sources:
                    sources = [x for x in rec_videos[0].get('sources')]

            for source in sources:
                result.append({"url": source.get("url"), "type": source.get("type")})

    return result


@f_api('/shorturl', params=dict(
    url=(str, True),
))
def shorturl(params):
    return f_app.shorturl(params["url"])
