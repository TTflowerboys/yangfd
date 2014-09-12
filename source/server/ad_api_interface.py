# -*- coding: utf-8 -*-

from app import f_app

from libfelix.f_interface import f_api

import logging
logger = logging.getLogger(__name__)


@f_api('/ad/add', params=dict(
    channel=(str, True),
    description=(str, True),
    text=(list, None, str),
    link=str,
    image=str,
    image_alt=str,
))
@f_app.user.login.check(force=30)
def ad_add(params, user):
    """
    A channel has somme ads, while an ad can have multiple text area.

    ``text`` is a list. Separate multiple section with comma.
    """
    return f_app.ad.add(params)


@f_api('/ad/<ad_id>/edit', params=dict(
    channel=(str, None),
    description=(str, None),
    text=(list, None, str),
    link=(str, None),
    image=(str, None),
    image_alt=(str, None),
))
@f_app.user.login.check(force=30)
def ad_edit(user, ad_id, params):
    f_app.ad.update_set(ad_id, params)


@f_api('/ad/<ad_id>')
def ad_get(ad_id):
    return f_app.ad.get(ad_id)


@f_api('/ad/<ad_id>/remove')
@f_app.user.login.check(force=30)
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
    """
    fallback = params.pop("fallback", None)
    return f_app.ad.get_by_channel(channel=channel_name, fallback=fallback)


@f_api('/ad/channel/<channel_name>/all', params=dict(
    fallback=(str, None),
))
def ad_get_all_by_channel(channel_name, params):
    """
    Get all ads by channel. If there's only one ad in the channel, it will return that one.
    """
    a = f_app.ad.get_all_by_channel(channel_name)
    return a
