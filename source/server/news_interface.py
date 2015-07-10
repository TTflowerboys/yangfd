# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from app import f_app
from libfelix.f_interface import f_get, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)


@f_get('/news_list', '/news-list')
@currant_util.check_ip_and_redirect_domain
def news_list():
    title = _('房产资讯')
    return currant_util.common_template("news_list", title=title)


@f_get('/news/<news_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
def news(news_id):
    news = f_app.blog.post.output([news_id])[0]
    news = f_app.i18n.process_i18n(news)
    related_news_list = f_app.i18n.process_i18n(currant_data_helper.get_related_news_list(news))
    title = news.get('title')
    keywords = "new,UK news" + ",".join(currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    if news.get('summary'):
        description = news.get('summary')
        return currant_util.common_template("news", news=news, related_news_list=related_news_list, title=title, description=description, keywords=keywords, weixin=weixin)
    else:
        return currant_util.common_template("news", news=news, related_news_list=related_news_list, title=title, keywords=keywords, weixin=weixin)


@f_get('/notice_list', '/notice-list')
@currant_util.check_ip_and_redirect_domain
def notice_list():
    title = _('网站公告')
    return currant_util.common_template("notice_list", title=title)


@f_get('/guides')
@currant_util.check_ip_and_redirect_domain
def guides():
    title = _('购房指南')
    return currant_util.common_template("guides", title=title)


@f_get('/laws')
@currant_util.check_ip_and_redirect_domain
def laws():
    title = _('法律法规')
    return currant_util.common_template("laws", title=title)


@f_get('/about')
@currant_util.check_ip_and_redirect_domain
def about():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "About Us"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return currant_util.common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/terms')
@currant_util.check_ip_and_redirect_domain
def terms():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "YoungFunding Terms Of Use"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return currant_util.common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/about/marketing')
@currant_util.check_ip_and_redirect_domain
def marketing():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "Marketing Cooperation"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return currant_util.common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/about/media')
@currant_util.check_ip_and_redirect_domain
def media():
    news_list = f_app.i18n.process_i18n(f_app.blog.post_output(
        f_app.blog.post_search(
            {
                "title.en_GB": "Media Cooperation"
            }, per_page=1
        )
    ))

    title = news_list[0].get('title')
    return currant_util.common_template("aboutus_content", news=news_list[0], title=title)


@f_get('/partner')
@currant_util.check_ip_and_redirect_domain
def partner():
    title = _('合作伙伴')
    return currant_util.common_template("partner", title=title)

@f_get('/qa-rent')
@currant_util.check_ip_and_redirect_domain
def qa():
    title = _('海外租房帮助中心')
    return currant_util.common_template("qa_rent", title=title)

@f_get('/qa-crowdfunding')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def qa():
    title = _('众筹投资帮助中心')
    return currant_util.common_template("qa_crowdfunding", title=title)
