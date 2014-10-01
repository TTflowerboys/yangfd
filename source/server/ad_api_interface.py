# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import

from app import f_app

from libfelix.f_interface import f_api

import logging
logger = logging.getLogger(__name__)


@f_api('/ad/add', params=dict(
    channel=(str, True),
    description=('i18n', None, str),
    text=('i18n', None, list, None, str),
    link=str,
    image=str,
    image_alt=('i18n', None, str),
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation'])
def ad_add(params, user):
    """
    A channel has some ads, while an ad can have multiple text area.

    ``text`` is a list. Separate multiple section with comma.
    """
    return f_app.ad.add(params)


@f_api('/ad/<ad_id>/edit', params=dict(
    channel=(str, None),
    description=('i18n', None, str),
    text=('i18n', None, list, None, str),
    link=(str, None),
    image=(str, None),
    image_alt=('i18n', None, str),
))
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation'])
def ad_edit(user, ad_id, params):
    f_app.ad.update_set(ad_id, params)


@f_api('/ad/<ad_id>')
def ad_get(ad_id):
    return f_app.ad.get(ad_id)


@f_api('/ad/<ad_id>/remove')
@f_app.user.login.check(role=['admin', 'jr_admin', 'operation', 'jr_operation'])
def ad_remove(user, ad_id):
    f_app.ad.delete(ad_id)


@f_api('/ad/channels')
def ad_get_all_channels():
    """
    Get all the names of channels, result is like ["channel1", "channel2", ...]
    """
    return f_app.ad.get_channels()


@f_api('/ad/channel/<channel_name>', params=dict(
    fallback=str,
))
def ad_get_by_channel(channel_name, params):
    """
    Get an ad by channel randomly. If there's only one ad in the channel, it will return that one.
    ``fallback`` is the fallback channel to be used. If ``channel_name`` cannot be fetched, it will try to fetch ``fallback`` channel instead.
    """
    fallback = params.pop("fallback", None)
    return f_app.ad.get_by_channel(channel=channel_name, fallback=fallback)


@f_api('/ad/channel/<channel_name>/all', params=dict(
    fallback=(str, None),
))
def ad_get_all_by_channel(channel_name, params):
    """
    Get all ads by channel.
    ``fallback`` is the fallback channel to be used. If ``channel_name`` cannot be fetched, it will try to fetch ``fallback`` channel instead.
    """
    return f_app.ad.get_all_by_channel(channel_name)
