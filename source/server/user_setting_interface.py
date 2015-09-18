# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
import logging
from app import f_app
from libfelix.f_interface import f_get, redirect, template_gettext as _
import currant_util
import currant_data_helper

logger = logging.getLogger(__name__)


@f_get('/user_settings', '/user-settings')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_settings(user):
    title = _('账户信息')
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    return currant_util.common_template("user_settings", user=user, title=title)


@f_get('/user_verify_email', '/user-verify-email')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_email(user):
    title = _('验证邮箱')
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    return currant_util.common_template("user_verify_email", user=user, title=title)


@f_get('/user_change_email', '/user-change-email')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_email(user):
    title = _('更改邮箱')

    return currant_util.common_template("user_change_email", user=currant_data_helper.get_user_with_custom_fields(user), title=title)


@f_get('/user_change_password', '/user-change-password')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_password(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('更改密码')
    return currant_util.common_template("user_change_password", user=user, title=title)


@f_get('/user_change_phone_1', '/user-change-phone-1')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_phone_1(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('更改手机号')
    return currant_util.common_template("user_change_phone_1", user=user, title=title)


@f_get('/user_change_phone_2', '/user-change-phone-2')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_change_phone_2(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('更改手机号')
    return currant_util.common_template("user_change_phone_2", user=user, title=title)


@f_get('/user_verify_phone_1', '/user-verify-phone-1')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_phone_1(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('验证手机号')
    return currant_util.common_template("user_verify_phone_1", user=user, title=title)


@f_get('/user_verify_phone_2', '/user-verify-phone-2')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_verify_phone_2(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('验证手机号')
    return currant_util.common_template("user_change_phone_2", user=user, title=title)


@f_get('/user_favorites', '/user-favorites')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_favorites(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('我的收藏')
    raw_list = currant_data_helper.get_favorite_list('property')
    favorite_list = []
    for item in raw_list:
        if item.get('property'):
            favorite_list.append(item)

    favorite_list = f_app.i18n.process_i18n(favorite_list)
    return currant_util.common_template("user_favorites", user=user, favorite_list=favorite_list, title=title)


@f_get('/user_crowdfunding', '/user-crowdfunding')
@currant_util.check_ip_and_redirect_domain
@currant_util.check_crowdfunding_ready
@f_app.user.login.check(force=True)
def user_crowdfunding(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    title = _('海外众筹')
    transaction_list = f_app.order.output(f_app.order.custom_search({'user.id': user['id'], 'type': {'$in': ['investment', 'withdrawal', 'recharge', 'earnings', 'recovery']}}, per_page=0), permission_check=False)
    investment_list = f_app.order.output(f_app.order.custom_search({'user.id': user['id'], 'type': 'investment'}, per_page=0), permission_check=False)
    earning_list = f_app.order.output(f_app.order.custom_search({'user.id': user['id'], 'type': 'earnings'}, per_page=0), permission_check=False)
    account_order_list = f_app.order.output(f_app.order.custom_search({'user.id': user['id'], 'type': {'$in': ['withdrawal', 'recharge']}}, per_page=0), permission_check=False)
    logger.debug(transaction_list)
    logger.debug(investment_list)
    logger.debug(earning_list)
    logger.debug(account_order_list)
    transaction_list = f_app.i18n.process_i18n(transaction_list)
    investment_list = f_app.i18n.process_i18n(investment_list)
    earning_list = f_app.i18n.process_i18n(earning_list)
    account_order_list = f_app.i18n.process_i18n(account_order_list)
    return currant_util.common_template("user_crowdfunding", user=user, transaction_list=transaction_list, investment_list=investment_list, earning_list=earning_list, account_order_list=account_order_list, title=title)


@f_get('/user_intentions', '/user-intentions')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_intentions(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))

    title = _('意向单')
    return currant_util.common_template("user_intentions", user=user, title=title)


@f_get('/user_properties', '/user-properties')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_properties(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))

    title = _('我的房产')
    return currant_util.common_template("user_properties", user=user, title=title)


@f_get('/user_messages', '/user-messages')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_messages(user):
    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    message_list = currant_data_helper.get_message_list(user)
    message_type_list = f_app.enum.get_all('message_type')
    for message in message_list:
        for message_type in message_type_list:
            if 'message_type:' + message['type'] == message_type['slug']:
                message['type_presentation'] = message_type
    message_list = f_app.i18n.process_i18n(message_list)
    title = _('消息')
    return currant_util.common_template("user_messages", user=user, message_list=message_list, title=title)


@f_get('/verify_email_status', '/verify-email-status')
@currant_util.check_ip_and_redirect_domain
def verify_email_status():
    title = _('验证邮箱')
    return currant_util.common_template("verify_email_status", title=title)


@f_get('/user')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user(user):
    title = _('账户信息')
    return currant_util.common_template("user-phone", title=title)


@f_get('/email-unsubscribe')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def email_unsubscribe(user):
    title = _('取消订阅')
    return currant_util.common_template("email_unsubscribe", title=title)


@f_get('/user-coupons')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_messages(user):
    #if not currant_util.is_mobile_client():
        #redirect('/user')

    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))

    venue_list = currant_data_helper.get_venues()

    title = _('会员专享')
    return currant_util.common_template("user_coupons", user=user, venue_list=venue_list, title=title)


@f_get('/user-coupons-detail/<venue_id:re:[0-9a-fA-F]{24}>/<deal_id:re:[0-9a-fA-F]{24}>')
@currant_util.check_ip_and_redirect_domain
@f_app.user.login.check(force=True)
def user_messages(venue_id, deal_id, user):
    #if not currant_util.is_mobile_client():
        #redirect('/user')

    user = f_app.i18n.process_i18n(currant_data_helper.get_user_with_custom_fields(user))
    venue = f_app.i18n.process_i18n(f_app.shop.output([venue_id])[0])
    deal = f_app.i18n.process_i18n(f_app.shop.item_output([deal_id])[0])
    deal["venue"] = venue
    title = deal.get('name') + '-' + venue.get('name')

    return currant_util.common_template("user_coupons_detail", user=user, deal=deal, title=title, venue_id=venue_id, deal_id=deal_id)
