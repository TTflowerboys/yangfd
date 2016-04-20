# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from app import f_app
from libfelix.f_interface import f_get, template_gettext as _
import currant_util
import currant_data_helper
import copy

logger = logging.getLogger(__name__)


@f_get('/news_list', '/news-list')
@currant_util.check_ip_and_redirect_domain
def news_list():
    title = _('房产资讯')
    description = _('洋房东英国英国大不列颠英格兰苏格兰伦敦房源房产房地产不动产房屋购房购屋买房投资资讯咨询信息新闻省时省力贴心安全快捷便利')
    keywords = _('洋房东,买房,租金,楼盘,公寓,别墅,学区房,英国置业,伦敦买房,海外置业,海外投资,英国房价,投资信息,投资新闻,Youngfunding,investment,overseas investment,property,apartment,house,UK property,investment information')
    return currant_util.common_template("news_list", title=title, description=description, keywords=keywords)


@f_get('/news/<news_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
def news(news_id):
    news = f_app.blog.post.output([news_id])[0]
    news = f_app.i18n.process_i18n(news)
    news_clean = copy.deepcopy(news)
    news_clean.pop('user', None)
    related_news_list = f_app.i18n.process_i18n(currant_data_helper.get_related_news_list(news))
    title = news.get('title')
    keywords = title + ", news, UK news, " + ",".join(currant_util.BASE_KEYWORDS_ARRAY)
    weixin = f_app.wechat.get_jsapi_signature()

    if news.get('summary'):
        description = news.get('summary')
        return currant_util.common_template("news", news=news, news_clean=news_clean, related_news_list=related_news_list, title=title, description=description, keywords=keywords, weixin=weixin)
    else:
        return currant_util.common_template("news", news=news, news_clean=news_clean, related_news_list=related_news_list, title=title, keywords=keywords, weixin=weixin)


@f_get('/notice_list', '/notice-list')
@currant_util.check_ip_and_redirect_domain
def notice_list():
    title = _('网站公告')
    return currant_util.common_template("notice_list", title=title)


@f_get('/guides')
@currant_util.check_ip_and_redirect_domain
def guides():
    title = _('购房指南')
    description = _('洋房东英国英国大不列颠英格兰苏格兰伦敦期房房源房产房地产不动产房屋购房购屋买房投资常见问题疑惑产权类型买房购房付款交钱投资流程过程解惑解答疑问指南帮助选房找房服务助手省时省力贴心安全快捷便利')
    keywords = _('洋房东,买房,租金,楼盘,公寓,别墅,学区房,英国置业,伦敦买房,海外置业,海外投资,英国房价,常见问题解答,投资问答,Youngfunding,investment,overseas investment,property,apartment,house,UK property,Q&A,investment information')
    return currant_util.common_template("guides", title=title, description=description, keywords=keywords)


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
    title = ''
    news = {}
    if len(news_list):
        title = news_list[0].get('title')
        news = news_list[0]
    return currant_util.common_template("aboutus_content", news=news, title=title)


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
def qa_rent():
    title = _('海外租房帮助中心')
    return currant_util.common_template("qa_rent", title=title)


@f_get('/qa-app')
@currant_util.check_ip_and_redirect_domain
def qa_app():
    title = _('洋房东APP帮助中心')
    return currant_util.common_template("qa_app", title=title)


@f_get('/qa-crowdfunding')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
def qa_crowdfunding():
    title = _('众筹投资帮助中心')
    return currant_util.common_template("qa_crowdfunding", title=title)
