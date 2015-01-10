# -*- coding: utf-8 -*-
from __future__ import unicode_literals, absolute_import
from six.moves.urllib.parse import quote_plus


def format_unit(unit):
    if unit == 'foot ** 2':
        return 'foot<sup>2</sup>'
    elif unit == 'acre':
        return 'acre'
    elif unit == 'meter ** 2':
        return 'm<sup>2</sup>'
    elif unit == 'kilometer ** 2':
        return 'km<sup>2</sup>'
    else:
        return unit


def fetch_image(image, **kwargs):
    link = quote_plus(image.encode('utf-8'))
    paramStr = "?link=" + link
    if 'thumbnail' in kwargs and kwargs['thumbnail'] is True:
        paramStr += '_thumbnail'
    for (k, v) in kwargs.items():
        if k.endswith('_id'):
            paramStr += "&" + k + "=" + v
    return "/image/fetch" + paramStr
