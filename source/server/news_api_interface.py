# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_interface import f_api

import logging
logger = logging.getLogger(__name__)


# @f_api('/blog/add')
# @f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
# def blog_add(user):
#     blogs = f_app.blog.get_all()
#     if len(blogs) > 0:
#         abort(40000, logger.warning("Blog already exists"))
#     return f_app.blog.add({"name": f_app.common.blog_name})
#
#
@f_api('/news/search', params=dict(
    per_page=int,
    time=datetime,
    category=(list, None, "enum:news_category"),
    category_slugs=(list, None, str),
    country='country',
))
def news_list(params):
    per_page = params.pop("per_page", 0)
    if "category" in params:
        params["category"] = {"$in": params["category"]}
    if "category_slugs" in params:
        category_slugs = params.pop("category_slugs")
        params["category._id"] = {"$in": [ObjectId(f_app.enum.get_by_slug(x)["id"]) for x in category_slugs]}
    params["blog_id"] = ObjectId(f_app.blog.get_by_slug(f_app.common.blog_slug)['id'])

    post_list = f_app.blog.post.search(params, per_page=per_page)
    return f_app.blog.post_output(post_list)


@f_api('/news/add', params=dict(
    title=('i18n', None, str),
    content=('i18n', None, str),
    category=(list, True, "enum:news_category"),
    country="country",
    city="geonames_gazetteer:city",
    street=('i18n', None, str),
    summary=('i18n', None, str),
    images=(list, None, str, None, "replaces"),
    link=str,
    slug=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'operation', 'jr_operation'])
def news_add(user, params):
    """
    ``link`` is the source link, not the link to itself.
    """
    params["blog_id"] = ObjectId(f_app.blog.get_by_slug(f_app.common.blog_slug)['id'])
    return f_app.blog.post_add(params)


@f_api('/news/<news_id>')
def news_get(news_id):
    return f_app.blog.post.output([news_id])[0]


@f_api('/news/<news_id>/edit', params=dict(
    title=('i18n', None, str),
    content=('i18n', None, str),
    category=(list, None, "enum:news_category"),
    country=("country", None),
    city=("geonames_gazetteer:city", None),
    street=('i18n', None, str),
    images=(list, None, str, None, "replaces"),
    link=(str, None),
    slug=(str, None),
    summary=('i18n', None, str),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'operation', 'jr_operation'])
def news_edit(user, news_id, params):
    f_app.blog.post.update_set(news_id, params)
    return f_app.blog.post_output([news_id])[0]


@f_api('/news/<news_id>/remove')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin', 'operation', 'jr_operation'])
def news_remove(user, news_id):
    return f_app.blog.post.remove(news_id)
