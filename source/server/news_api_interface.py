# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from datetime import datetime
from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_interface import f_api

import logging
logger = logging.getLogger(__name__)


_blog_id = "53f839246b80992f831b2269"


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
    zipcode_index=str,
))
def news_list(params):
    per_page = params.pop("per_page", 0)
    if "category" in params:
        params["category"] = {"$in": params["category"]}
    params["blog_id"] = ObjectId(_blog_id)

    post_list = f_app.blog.post.search(params, per_page=per_page)
    return f_app.blog.post_output(post_list)


@f_api('/news/add', params=dict(
    title=('i18n', None, str),
    content=('i18n', None, str),
    zipcode_index=str,
    category=(list, True, "enum:news_category"),
    country="enum:country",
    city="enum:city",
    street=('i18n', None, str),
    images=(list, None, str),
    link=str,
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def news_add(user, params):
    """
    ``blog_id`` is a constant "53f839246b80992f831b2269".
    ``zipcode_index`` is the key related to properties, internal use only.
    """
    params["blog_id"] = ObjectId(_blog_id)
    return f_app.blog.post_add(params)


@f_api('/news/<news_id>')
def news_get(news_id):
    return f_app.blog.post.output([news_id])[0]


@f_api('/news/<news_id>/edit', params=dict(
    title=('i18n', None, str),
    content=('i18n', None, str),
    category=(list, None, "enum:news_category"),
    country=("enum:country", None),
    city=("enum:city", None),
    street=('i18n', None, str),
    images=(list, None, str),
    link=(str, None),
    zipcode_index=(str, None),
))
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def news_edit(user, news_id, params):
    f_app.blog.post.update_set(news_id, params)
    return f_app.blog.post_output([news_id])[0]


@f_api('/news/<news_id>/remove')
@f_app.user.login.check(force=True, role=['admin', 'jr_admin'])
def news_remove(user, news_id):
    return f_app.blog.post.remove(news_id)
