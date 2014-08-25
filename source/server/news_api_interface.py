#!/usr/bin/env python2

from datetime import datetime
from bson.objectid import ObjectId
from libfelix.f_common import f_app
from libfelix.f_interface import f_api
from libfelix.f_interface import abort

import logging
logger = logging.getLogger(__name__)


_blog_id = "53f839246b80992f831b2269"


@f_api('/blog/add')
@f_app.user.login.check(force=30)
def blog_add(user):
    blogs = f_app.blog.get_all()
    if len(blogs) > 0:
        abort(40000, logger.warning("Blog already exists"))
    return f_app.blog.add({"name": "currant"})


@f_api('/news', params=dict(
    per_page=int,
    time=datetime,
))
def news_list(params):
    per_page = params.pop("per_page", 0)
    params["blog_id"] = ObjectId(_blog_id)
    post_list = f_app.blog.post.search(params, per_page=per_page)
    return f_app.blog.post_output(post_list)


@f_api('/news/add', params=dict(
    title=('i18n', ['zh_Hans_CN', 'zh_Hant_HK'], True),
    link=(str, True),
    content=('i18n', ['zh_Hans_CN', 'zh_Hant_HK'], True),
    category=(str, "news"),
))
@f_app.user.login.check(force=30)
def news_add(user, params):
    """
    ``blog_id`` is a constant "53f839246b80992f831b2269".
    ``category`` must be in "announcement", "news".
    """
    if params["category"] not in ("announcement", "news"):
        abort(40000, logger.warning("Invalid params: category not okay"))
    params["blog_id"] = ObjectId(_blog_id)
    return f_app.blog.post_add(params)


@f_api('/news/<news_id>')
def news_get(news_id):
    return f_app.blog.post.output([news_id])[0]


@f_api('/news/<news_id>/edit', params=dict(
    title=('i18n', None, str),
    link=(str, None),
    content=('i18n', None, str),
    category=(str, None),
))
@f_app.user.login.check(force=30)
def news_edit(user, news_id, params):
    if "category" in params:
        if params.get["category"] not in ("announcement", "news"):
            abort(40000, logger.warning("Invalid params: category not okay"))
    return f_app.blog.post.update_set(news_id, params)


@f_api('/news/<news_id>/remove')
@f_app.user.login.check(force=30)
def news_remove(user, news_id):
    return f_app.blog.post.remove(news_id)


@f_api('/news/<news_id>/related', params=dict(
    per_page=(int, 3),
))
def news_related(news_id, params):
    per_page = params.pop("per_page")
    params["_id"] = {"$ne": ObjectId(news_id)}
    return f_app.blog.post.output(f_app.blog.post.search(params, per_page=per_page))
